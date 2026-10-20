"""Offline importer for the established source-bounded format (Batches 02+).

The historical filename describes the input format, not the provenance batch.
Only explicitly registered archive hashes are accepted. No crawl or extraction.
"""
import copy
import hashlib
import json
from pathlib import Path
import sys
import zipfile

TARGET = Path(__file__).resolve().parents[1] / 'data/meeting-intelligence'

def read(path):
    return json.loads(path.read_text(encoding='utf-8'))

def write(path, value):
    text = json.dumps(value, ensure_ascii=False, indent=2) + '\n'
    if not path.exists() or path.read_text(encoding='utf-8') != text:
        path.write_text(text, encoding='utf-8')

def alias(item, old, new):
    if old in item and new in item and item[old] != item[new]:
        raise ValueError('Contradictory source-index aliases: ' + old + '/' + new)
    return item[new] if new in item else item[old]

def native_maps(original, sources, config):
    """Validate retained maps against original bytes/DOM; never execute markup."""
    from bs4 import BeautifulSoup
    assert hashlib.sha256(Path(sources).read_bytes()).hexdigest() == config['source_package_sha256']
    maps = []
    with zipfile.ZipFile(sources) as z:
        for r in original:
            if r['meeting'].get('source_media_type') != 'text/html':
                continue
            p, m = r['provenance'], r['meeting']
            raw = z.read(p['original_source_filename'])
            assert hashlib.sha256(raw).hexdigest() == p['sha256']
            calendar = config.get('native_map_profile') == 'calendar-literal-json'
            map_path = p['native_review']['map_path'] if calendar else p['native_locations']
            map_bytes = z.read(map_path)
            loc = json.loads(map_bytes)
            if calendar:
                assert loc['source_document_id'] == 'sha256:' + p['sha256']
                assert hashlib.sha256(map_bytes).hexdigest() == p['native_review']['map_sha256']
                loc = loc | {'source_sha256':p['sha256'], 'source_path':p['original_source_filename'],
                             'blocks':[b | {'text':b['supporting_text']} for b in loc['blocks']]}
            assert loc['source_sha256'] == p['sha256'] and loc['source_url'] == m['source_url']
            assert loc['source_path'] == p['original_source_filename']
            soup = BeautifulSoup(raw, 'html.parser')
            if calendar:
                # Inspect literal JSON as data only; never execute scripts or load dependencies.
                for b in loc['blocks']:
                    if b['kind'] == 'embedded_application_json':
                        nodes = soup.find_all('script', attrs={'type':'application/json'})
                        assert any(b['text'] == ' '.join(n.get_text().split()) for n in nodes), b['block_id']
                        json.loads(b['text'])
                    else:
                        assert any(b['text'] in ' '.join(n.get_text(' ', strip=True).split())
                                   for n in soup.find_all(b['source_element'])), b['block_id']
            for element in soup(['script', 'style']):
                element.decompose()
            blocks = {b['block_id']: b for b in loc['blocks']}
            assert len(blocks) == len(loc['blocks'])
            for b in blocks.values():
                if calendar: continue
                nodes = soup.select(b['css_path'])
                assert len(nodes) == 1 and b['text'] in ' '.join(nodes[0].get_text(' ', strip=True).split()), b['block_id']
            def check(v):
                if isinstance(v, list):
                    for x in v: check(x)
                elif isinstance(v, dict):
                    if 'native_locator' in v:
                        l = v['native_locator']
                        assert 'page' not in v and 'page_basis' not in v
                        assert v['source_document_id'] == m['source_document_id'] and v['source_url'] == m['source_url']
                        assert l['map_path'] == map_path
                        assert l['supporting_text'] and l['supporting_text'] in blocks[l['block_id']]['text']
                    for x in v.values(): check(x)
            check(r)
            coverage = p['native_review']['coverage'] if calendar else p['native_review']
            assert {x['block_id'] for x in coverage} == set(blocks)
            maps.append({k:v for k,v in loc.items() if k != 'source_path'} | {
                'record_id':r['id'], 'map_path':map_path,
                'original_map_sha256':hashlib.sha256(map_bytes).hexdigest(),
                'coverage_context':p['native_review'],
                'location_note':'Retained-source derivative: whitespace-normalized text, not byte-exact HTML. Blocks may not locate the same text on a later changed live page. Navigation/contact/footer blocks are contextual, not meeting assertions.'})
    return maps

def merge_records(previous, incoming, other_records=()):
    """An identical re-import is a no-op; changed IDs/evidence never overwrite."""
    key = lambda r: (r['meeting']['district_id'], r['meeting']['source_document_id'])
    by_source = {key(r): r for r in previous}
    by_id = {r['id']: r for r in previous}
    others = {key(r): r for r in other_records}
    other_ids = {r.get('id', r['meeting']['meeting_id'].lower()) for r in other_records}
    if len(by_source) != len(previous) or len(by_id) != len(previous):
        raise ValueError('Duplicate existing record/source identity')
    for r in incoming:
        if key(r) in others or r['id'] in other_ids:
            raise ValueError('Source already exists in another batch: ' + key(r)[1])
        if (key(r) in by_source and by_source[key(r)] != r) or (r['id'] in by_id and by_id[r['id']] != r):
            raise ValueError('Existing immutable ID/source differs; explicit revision required: ' + r['id'])
        by_source[key(r)] = r
        by_id[r['id']] = r
    return list(by_source.values())

def import_batch(path, sources=None):
    archive = Path(path)
    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    batches = read(TARGET / 'batches.json')
    config = next((b for b in batches if b['archive_sha256'] == digest), None)
    if config is None:
        raise ValueError('Unregistered extraction archive; review source revision explicitly.')
    if 'archive_bytes' in config:
        assert archive.stat().st_size == config['archive_bytes']
    with zipfile.ZipFile(archive) as z:
        original = [json.loads(line) for line in z.read('MEETINGS.jsonl').decode('utf-8').splitlines() if line.strip()]
        source_index = json.loads(z.read('SOURCE_INDEX.json'))
        indexed = source_index.get('documents', source_index.get('records', source_index.get('sources')))
        if not isinstance(indexed, list):
            raise ValueError('SOURCE_INDEX must provide documents or records')
        index = {x.get('record_id', x.get('id')): x for x in indexed}
        leads = json.loads(z.read('CROSS_MEETING_LEADS.json'))
        assert {r['id'] for r in original} == set(index)
        for raw in original:
            assert json.loads(z.read('meetings/' + raw['id'] + '.json')) == raw
    assert len(original) == config['records']
    assert sum(r['meeting']['page_count'] or 0 for r in original) == config['pages']
    identity = 'pilot_id' if 'pilot_id' in config else 'batch'
    assert leads.get(identity, leads.get('provenance', {}).get(identity)) == config[identity]
    assert leads.get('schema_version') == config['format'] or (
        'schema_version' not in leads and config.get('lead_format_from_registration') is True)
    public, exclusions = [], []
    for raw in original:
        assert raw['schema_version'] == config['format'] and raw['provenance'][identity] == config[identity]
        if identity == 'pilot_id':
            assert 'batch' not in raw['provenance'] and 'priority' not in raw['provenance']
        i = index[raw['id']]
        sha = alias(i, 'sha256', 'source_sha256')
        assert raw['meeting']['source_document_id'] == 'sha256:' + sha
        assert raw['provenance']['sha256'] == sha
        assert raw['meeting']['page_count'] == alias(i, 'physical_page_count', 'page_count')
        media = raw['meeting'].get('source_media_type', 'application/pdf')
        pages = raw['meeting']['page_count']
        assert (media == 'text/html' and pages is None) or (media == 'application/pdf' and type(pages) is int and pages > 0)
        if 'source_media_type' in i: assert media == i['source_media_type']
        if 'official_url' in i: assert raw['meeting']['source_url'] == i['official_url']
        if 'source_url' in i: assert raw['meeting']['source_url'] == i['source_url']
        r = copy.deepcopy(raw)
        filename = 'original_source_filename' if 'original_source_filename' in r['provenance'] else 'original_pdf_filename'
        if filename in r['provenance']:
            del r['provenance'][filename]
            exclusions.append({'record_id': r['id'], 'pointer': '/provenance/' + filename,
                               'reason': 'Private archive-relative filename omitted; full source identity and official URL retained.'})
        public.append(r)
    output = TARGET / config['input']
    previous = read(output) if output.exists() else []
    others = [entry['record'] for entry in read(TARGET / 'release-input.json')]
    for batch in batches:
        if batch != config and (TARGET / batch['input']).exists():
            others.extend(read(TARGET / batch['input']))
    merged = merge_records(previous, public, others)
    discovery = leads.get('prior_corpus_discovery')
    if discovery:
        discovery.pop('local_directory', None)
    lead_path = TARGET / config['leads']
    if lead_path.exists() and read(lead_path) != leads:
        raise ValueError('Existing immutable lead input differs')
    if config.get('native_maps'):
        if not sources: raise ValueError('Retained source ZIP required for offline native validation')
        maps = native_maps(original, sources, config)
        maps_path = TARGET / config['native_maps']
        if maps_path.exists() and read(maps_path) != maps: raise ValueError('Existing immutable native maps differ')
        write(maps_path, maps)
    write(output, merged)
    write(lead_path, leads)
    notes_path = TARGET / config['projection_notes']
    if not notes_path.exists():
        write(notes_path, {
            'source_archive_sha256': digest, 'source_format': config['format'], identity: config[identity],
            'exclusions': exclusions, 'substantive_fields_dropped': [],
            'notes': ['Original extraction and source PDFs remain unchanged outside public assets.',
                      'Public-role names, water-domain locations and financial context retained.',
                      'No semantic re-extraction, unit conversion, identity merge, source check or publication date invented.',
                      'Archive-relative filenames and any prior-corpus workstation directory are excluded.'] +
                     (['Original lead envelope omitted schema_version. Compatibility format comes from this registered archive and its meeting records; the original envelope is retained without adding the missing label.'] if 'schema_version' not in leads else [])})
    print(f"{identity} {config[identity]}: {len(merged)} unique documents; other inputs unchanged.")

if __name__ == '__main__':
    import_batch(sys.argv[1], sys.argv[2] if len(sys.argv)>2 else None)
