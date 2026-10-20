"""Read retained collector metadata only; no fetching, PDF parsing or AI extraction."""
import argparse
import csv
import json
from collections import defaultdict
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--collector", type=Path, required=True)
parser.add_argument("--r3", type=Path, required=True)
parser.add_argument("--output", type=Path, required=True)
args = parser.parse_args()
root = args.collector.resolve()

def read(p):
    return json.loads(p.read_text(encoding="utf-8-sig"))

index = read(args.r3 / "SOURCE_INDEX.json")
represented = {r["district_id"] for r in index}
read_hashes = {r["source_sha256"] for r in index}
# Conservatively exclude documents with existing semantic result records or reviewed ledgers.
# Native text extraction alone is not a meeting-intelligence read.
def source_hashes(v):
    found = set()
    if isinstance(v, dict):
        for k, x in v.items():
            if k in {"source_sha256", "source_content_sha256", "content_sha256"} and isinstance(x, str) and len(x) == 64:
                found.add(x)
            if k in {"document_id", "source_document_id"} and isinstance(x, str) and x.startswith("sha256:"):
                found.add(x[7:])
            found.update(source_hashes(x))
    elif isinstance(v, list):
        for x in v:
            found.update(source_hashes(x))
    return found

for folder in ["intelligence_results", "reviewed_meeting_action_fact_ledger_v1", "reviewed_motion_event_authority_v1", "reviewed_motion_event_authority_v1_1"]:
    for p in (root / "data/derived_review" / folder).rglob("*.json"):
        read_hashes.update(source_hashes(read(p)))

district_names = {}
directory = Path(__file__).resolve().parents[1] / "public/data/gcd-statewide-directory/v2/gcd_statewide_directory_v2.json"
if directory.exists():
    district_names = {d["district_id"]: d["district_name"] for d in read(directory)["districts"]}

candidates = {}
missing_counts = defaultdict(int)
types = {"approved_minutes", "draft_minutes", "minutes", "agenda", "notice", "public_hearing_notice", "meeting_notice", "attachment", "meeting_packet"}
for current in sorted((root / "data/normalized").glob("*/_metadata/current_versions.json")):
    district = current.parent.parent.name
    raw_root = root / "data/raw" / district / "documents"
    versions_file = raw_root / "_metadata/url_versions.json"
    versions = read(versions_file).get("urls", {}) if versions_file.exists() else {}
    extraction_root = root / "data/extracted" / district
    extraction_index_file = extraction_root / "_metadata/current_versions.json"
    extraction_index = read(extraction_index_file).get("entries", {}) if extraction_index_file.exists() else {}
    for entry in read(current).get("entries", {}).values():
        normalized_path = current.parent.parent / entry["relative_path"]
        if not normalized_path.exists():
            missing_counts["missing normalized metadata"] += 1
            continue
        n = read(normalized_path)
        sha = n.get("content_sha256")
        if not sha or sha in read_hashes or n.get("document_type") not in types or n.get("superseded_by"):
            continue
        meta_file = raw_root / "_metadata/documents" / sha[:2] / sha[2:4] / (sha + ".json")
        if not meta_file.exists():
            missing_counts["missing retained metadata"] += 1
            continue
        meta = read(meta_file)
        retained = (raw_root / meta["storage_path"]).resolve()
        if not retained.is_relative_to(raw_root.resolve()) or not retained.is_file():
            missing_counts["missing retained binary"] += 1
            continue
        urls = n.get("source_document_urls") or meta.get("source_urls", [])
        current_urls = [url for url in urls if versions.get(url, {}).get("current_sha256", sha) == sha]
        if not current_urls:
            missing_counts["superseded bytes"] += 1
            continue
        extraction_entry = extraction_index.get(sha)
        if not extraction_entry:
            missing_counts["no readability metadata"] += 1
            continue
        extracted_path = extraction_root / extraction_entry["relative_path"]
        if not extracted_path.exists():
            missing_counts["missing extraction metadata"] += 1
            continue
        extracted = read(extracted_path)
        # Existing text is a practical readability signal, not independent visual certification.
        if len(extracted.get("full_text", "").strip()) < 100:
            missing_counts["no usable existing text"] += 1
            continue
        url = current_urls[0]
        url_version = versions.get(url, {})
        version = next((v for v in url_version.get("versions", []) if v["sha256"] == sha), {})
        missing = []
        if not n.get("meeting_date"):
            missing.append("Meeting date unavailable; cannot establish recency from retained normalized metadata")
        if extracted.get("warnings"):
            missing.append("Existing extraction warnings: " + "; ".join(str(w) for w in extracted["warnings"]))
        if n.get("meeting_date_review_required") or n.get("meeting_identity_ambiguous"):
            missing.append("Metadata meeting date/identity requires confirmation")
        if n.get("document_classification_review_required") or n.get("document_classification", {}).get("review_required"):
            missing.append("Record type is machine-classified; confirm against source")
        missing.append("Prior model reads outside R3 and checked local result/ledger indexes are unknown")
        candidate = {
            "district": district, "district_name": district_names.get(district, district.replace("_", " ")),
            "record_type": n["document_type"], "source_url": url, "source_sha256": sha,
            "retained_path": str(retained), "meeting_date": n.get("meeting_date") or "",
            "date_basis": "existing normalizer metadata; not re-read from PDF" if n.get("meeting_date") else "unknown",
            "page_count": n.get("page_count") or extracted.get("page_count") or "",
            "already_read_state": "not in R3 or existing local semantic-result/reviewed-ledger source hashes",
            "readability_basis": "retained binary exists; existing extracted text >=100 characters; no new PDF inspection",
            "r3_district_represented": district in represented,
            "meeting_group_id": n.get("meeting_id") or "",
            "predecessor_sha256": version.get("predecessor_sha256") or "",
            "successor_sha256": version.get("successor_sha256") or "",
            "revision_note": " | ".join(meta.get("original_filenames", [])),
            "priority_reason": "", "missing_input_note": "; ".join(missing),
        }
        if sha not in candidates or candidate["meeting_date"] > candidates[sha]["meeting_date"]:
            candidates[sha] = candidate

groups = defaultdict(list)
for c in candidates.values():
    groups[c["district"]].append(c)
for group in groups.values():
    group.sort(key=lambda c: (c["meeting_date"], c["source_sha256"]), reverse=True)
    # Prefer distinct existing meeting identities before companions/revisions. Never
    # deduplicate by date alone: two meetings can occur on the same day.
    seen_groups = set()
    first_documents, companion_documents = [], []
    for c in group:
        identity = c["meeting_group_id"] or c["source_sha256"]
        if identity in seen_groups:
            companion_documents.append(c)
        else:
            first_documents.append(c)
            seen_groups.add(identity)
    group[:] = first_documents + companion_documents
districts = sorted(groups, key=lambda d: (d in represented, -int((groups[d][0]["meeting_date"] or "0000-00-00").replace("-", "")), d))
queue = []
for round_number in range(3):
    for district in districts:
        if len(groups[district]) > round_number:
            c = groups[district][round_number]
            c["priority_reason"] = ("District absent from R3; " if district not in represented else "R3 district; ") + (("newest dated retained eligible document" if round_number == 0 else f"coverage document {round_number + 1} of approximately three; prefer distinct metadata meeting identities") if c["meeting_date"] else "undated retained document; recency unknown")
            queue.append(c)
selected = {c["source_sha256"] for c in queue}
remaining = sorted((c for c in candidates.values() if c["source_sha256"] not in selected), key=lambda c: c["meeting_date"], reverse=True)
for c in remaining:
    c["priority_reason"] = "Next newest retained document after approximately three per available district"
queue = (queue + remaining)[:50]
args.output.parent.mkdir(parents=True, exist_ok=True)
if queue:
    with args.output.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["priority"] + list(queue[0]))
        writer.writeheader()
        writer.writerows({"priority": i + 1, **c} for i, c in enumerate(queue))
print(json.dumps({"queued": len(queue), "districts": len({c['district'] for c in queue}), "districts_absent_from_R3": len({c['district'] for c in queue if not c['r3_district_represented']}), "eligible_unique_documents": len(candidates), "exclusions": dict(missing_counts), "output": str(args.output)}, indent=2))
