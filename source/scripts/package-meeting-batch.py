"""Copy the existing queue priorities 1–20 unchanged; no crawl, OCR or extraction."""
import csv, hashlib, io, json, pathlib, zipfile, logging
from pypdf import PdfReader

review = pathlib.Path('local-review')
rows = list(csv.DictReader((review/'NEXT_BATCH.csv').open(encoding='utf-8-sig', newline='')))
rows = sorted((r for r in rows if 1 <= int(r['priority']) <= 20), key=lambda r:int(r['priority']))
assert [int(r['priority']) for r in rows] == list(range(1,21))
output = review/'TEXAS_GCD_MEETING_INTELLIGENCE_BATCH_02_20_DISTRICTS.zip'
manifest = {'batch':'Texas GCD meeting intelligence batch 02', 'selection':'Unchanged priorities 1–20 from existing NEXT_BATCH.csv', 'documents':[]}
with zipfile.ZipFile(output,'w',compression=zipfile.ZIP_DEFLATED) as archive:
    for row in rows:
        filename = f"pdfs/{int(row['priority']):02d}_{row['district']}_{row['source_sha256'][:12]}.pdf"
        item = {'priority':int(row['priority']), 'district_id':row['district'], 'district_name':row['district_name'], 'record_type':row['record_type'], 'official_url':row['source_url'], 'source_sha256':row['source_sha256'], 'pdf_filename':filename, 'source_date':row['meeting_date'] or None, 'date_basis':row['date_basis'], 'page_count':int(row['page_count']) if row['page_count'] else None, 'page_count_basis':'inherited queue metadata', 'prior_read_state':row['already_read_state'], 'limitations':row['missing_input_note'], 'revision_note':row['revision_note'], 'predecessor_sha256':row['predecessor_sha256'] or None, 'successor_sha256':row['successor_sha256'] or None}
        try:
            data = pathlib.Path(row['retained_path']).read_bytes()
            if hashlib.sha256(data).hexdigest() != row['source_sha256']:
                raise ValueError('source hash mismatch')
            warnings = io.StringIO()
            handler = logging.StreamHandler(warnings)
            logging.getLogger('pypdf').addHandler(handler)
            try:
                pages = len(PdfReader(io.BytesIO(data)).pages)
            finally:
                logging.getLogger('pypdf').removeHandler(handler)
            item['pdf_reader_warnings'] = warnings.getvalue().strip() or None
            item.update(page_count=pages,page_count_basis='checked locally with pypdf; no text extraction',status='copied_hash_verified')
            archive.writestr(filename,data)
        except Exception as error:
            item['status']='unavailable: '+type(error).__name__+': '+str(error).replace(row['retained_path'],'[local file]')
        manifest['documents'].append(item)
    copied=[r for r in manifest['documents'] if r['status']=='copied_hash_verified']
    manifest.update(copied_documents=len(copied),copied_pages=sum(r['page_count'] for r in copied),district_count=len({r['district_id'] for r in copied}))
    archive.writestr('MANIFEST.json',json.dumps(manifest,indent=2)+'\n')
with zipfile.ZipFile(output) as archive:
    for item in copied:
        assert hashlib.sha256(archive.read(item['pdf_filename'])).hexdigest()==item['source_sha256']
print(f"{output}: {manifest['copied_documents']} PDFs, {manifest['copied_pages']} pages, {manifest['district_count']} districts; ZIP contents hash-checked.")
