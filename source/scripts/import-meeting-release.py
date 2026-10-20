"""Explicit, offline R3 import. Run only when preparing a new reviewed projection.
Normal site builds use the committed release input, never this private directory.
"""
import copy
import json
import pathlib
import sys

root = pathlib.Path(sys.argv[1])
target = pathlib.Path('data/meeting-intelligence')
target.mkdir(parents=True, exist_ok=True)
records = [json.loads(line) for line in (root / 'MEETINGS.jsonl').read_text(encoding='utf8').splitlines()]
index = {x['request_id']: x for x in json.loads((root / 'SOURCE_INDEX.json').read_text(encoding='utf8'))}
limits = {x['request_id']: x['pages'] for x in json.loads((root / 'RUN_SUMMARY.json').read_text(encoding='utf8'))['small_raster_span_limitations']}
schema = json.loads((target / 'input.schema.json').read_text(encoding='utf8'))
from jsonschema import Draft202012Validator
validator = Draft202012Validator(schema)
report = []
corrections = []

# Exact, reviewed address spans only. Keep the rest of each approval/evidence description.
addresses = ['3680 Greenwood Road, Weatherford, TX 76088', '2720 San Gabriel Drive, Granbury, TX 76048', '4852 Quanah Hill Road, Weatherford, TX 76087', '3680 Greenwood Road', '2720 San Gabriel Drive', '4852 Quanah Hill Road', 'Fulton Ranch Road, Wimberley, TX 78676']
def redact(value, pointer, key):
    if isinstance(value, dict):
        result = {k: redact(v, pointer + '/' + k, key) for k, v in value.items()}
        if 'quote' in value and result['quote'] != value['quote']:
            result['quote_excerpt'] = result.pop('quote')
            result['redaction_note'] = 'Address omitted; remaining text is an excerpt, not a complete quotation.'
        elif 'visible_source_description' in value and result['visible_source_description'] != value['visible_source_description']:
            result['redaction_note'] = 'Address omitted from visual-source description; substantive statement retained.'
        return result
    if isinstance(value, list):
        return [redact(v, pointer + '/' + str(i), key) for i, v in enumerate(value)]
    if isinstance(value, str):
        result = value
        for address in addresses:
            result = result.replace(address, '[address omitted]')
        # Only the signature attribution is removed, not the adjournment or date limitation.
        result = result.replace('; Clayton Neal and Amanda Wheeler signed.', '.')
        if result != value:
            report.append({'record_id': key, 'pointer': pointer, 'reason': 'Address or signature attribution omitted; other content retained.'})
        return result
    return value

release = []
for raw in records:
    key = raw['meeting']['meeting_id']
    r = redact(copy.deepcopy(raw), '', key)
    if key.endswith('005'):
        # Targeted retained-PDF check: physical page 4 directs readers to the
        # external historic-use packet and district-office hard copies. Page 1
        # remains in the separate meeting/group-approval evidence.
        r['meeting']['source_completeness']['evidence'] = [{
            'source_document_id': r['meeting']['source_document_id'],
            'page': 4, 'evidence_method': 'VISUAL_PAGE',
            'page_image_sha256': 'e82db235dfc67e1d9837655dc574e4603b16a9480511c0f098e7f167a6b82ede',
            'visible_source_description': 'Physical page 4 directs readers to an external historic-use application packet and states that hard copies are maintained at the district office and available for review upon request.'
        }]
        corrections.append({'record_id': key, 'field': '/meeting/source_completeness/evidence', 'source_pages': [4], 'reason': 'Retained PDF and existing page-4 image checked; external packet not fetched. Replaces the unrelated page-1 heading citation only.'})
        # Completed source QA: physical pp.1–2 identify the applicant and permit
        # for each request/recommendation/approval. R3 left these entity arrays
        # empty even though their evidence describes the association explicitly.
        associations = {
            'M005-O004': ['M005-E010', 'M005-E019'],
            'M005-O005': ['M005-E010', 'M005-E019'],
            'M005-O006': ['M005-E010', 'M005-E019'],
            'M005-O011': ['M005-E010', 'M005-E020'],
            'M005-O012': ['M005-E010', 'M005-E020'],
            'M005-O013': ['M005-E010', 'M005-E020'],
            'M005-O015': ['M005-E011', 'M005-E021'],
            'M005-O016': ['M005-E011', 'M005-E021'],
            'M005-O017': ['M005-E011', 'M005-E021'],
        }
        for observation in r['observations']:
            if observation['observation_id'] in associations:
                assert observation['entity_ids'] == []
                observation['entity_ids'] = associations[observation['observation_id']]
                corrections.append({'record_id': key, 'object_id': observation['observation_id'], 'field': 'entity_ids', 'source_pages': sorted({e['page'] for e in observation['evidence']}), 'reason': 'Explicit applicant/permit association in existing source evidence and completed page QA; quantities unchanged.'})
    if key.endswith('019'):
        observation = next(o for o in r['observations'] if o['observation_id'] == 'M019-O035')
        for field in ['main_operating_balance_usd', 'excluded_noninterest_accounts', 'petty_cash_usd']:
            del observation['value'][field]
            report.append({'record_id': key, 'pointer': '/observations/M019-O035/value/' + field, 'reason': 'Account-level detail excluded; aggregate investment total and maturity retained.'})
    del r['meeting']['source_filename']
    report.append({'record_id': key, 'pointer': '/meeting/source_filename', 'reason': 'Private retained filename; source identity and official URL retained.'})
    # No inferred company/person merges and no blanket property-entity exclusions.
    validator.validate(r)  # Unknown semantic keys fail visibly, rather than silently disappearing.
    i = index[key]
    release.append({'record': r, 'routing_date': i['frozen_routing_date'], 'date_basis': i['meeting_date_state'], 'partial_pages': limits.get(key, [])})
(target / 'release-input.json').write_text(json.dumps(release, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
(target / 'projection-notes.json').write_text(json.dumps({'substantive_fields_dropped': [x for x in report if 'Account-level' in x['reason']], 'exclusions': report, 'notes': ['Original R3 files unchanged. No semantic extraction performed.', 'Named properties and places retained; three address-only entity names are explicitly masked, with their stable references retained.', 'Needmore adopted motion and inconsistent attached calculations retained separately. No quantities summed or converted.', 'Source QA described in local-review/RESULTS.md is automated inspection, not human certification.']}, indent=2) + '\n', encoding='utf8')
notes = json.loads((target / 'projection-notes.json').read_text(encoding='utf8'))
notes['source_backed_corrections'] = corrections
(target / 'projection-notes.json').write_text(json.dumps(notes, indent=2) + '\n', encoding='utf8')
print(f'Imported {len(release)} records; {len(report)} explicit omissions; {len(corrections)} source-backed associations; details in projection-notes.json.')
