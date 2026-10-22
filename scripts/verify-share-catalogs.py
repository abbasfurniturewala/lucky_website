import json
import argparse
import re
import subprocess
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.parse import urlparse, parse_qs

import pdfplumber
from pypdf import PdfReader
from PIL import Image, ImageDraw

import importlib.util

spec = importlib.util.spec_from_file_location('generator', Path(__file__).with_name('create-share-catalogs.py'))
generator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generator)
ROOT = Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description='Verify catalog content, links, geometry and rendered pages. Requires pypdf, pdfplumber, Pillow, ReportLab and Poppler.')
parser.add_argument('--output',type=Path,default=ROOT/'output/pdf/catalogs-2026-10')
parser.add_argument('--data',type=Path,default=ROOT/'tmp/pdfs/share-catalog-data.json')
parser.add_argument('--qa',type=Path,default=ROOT/'tmp/pdfs/catalog-qa')
args=parser.parse_args()
OUT=args.output
QA=args.qa
QA.mkdir(parents=True,exist_ok=True)
manifest=json.loads((OUT/'manifest.json').read_text(encoding='utf-8'))
data=json.loads(args.data.read_text(encoding='utf-8'))
groups={g['slug']:g for g in data['categories']}
records=[]

def normal(s):
    return re.sub(r'\s+', ' ', generator.clean(s))

def verify(item):
    path=OUT/item['file']
    mode=path.parent.name
    general='general-highlights' in path.name
    selected=[p for g in data['categories'] for p in generator.select_highlights(g['products'])] if general else next(g['products'] for slug,g in groups.items() if path.name==f'lucky-interiors-{slug}-{mode}.pdf')
    pdf=PdfReader(path)
    assert len(pdf.pages)==item['pages'],path
    texts=[page.extract_text() or '' for page in pdf.pages]
    text=normal(' '.join(texts))
    assert 'REFERENCE PRICE' not in text
    assert 'legacy-unverified' not in text and 'betterhomeindia' not in text.lower()
    for p in selected:
        assert text.count(p['code'])==1,(path,p['code'])
        assert normal(p['name']) in text,(path,p['name'])
    links=[]
    image_count=0
    for i,page in enumerate(pdf.pages):
        width,height=float(page.mediabox.width),float(page.mediabox.height)
        expected=(420,700) if mode=='whatsapp' else generator.A4
        assert abs(width-expected[0])<0.1 and abs(height-expected[1])<0.1
        assert f'{i+1} / {len(pdf.pages)}' in texts[i]
        image_count+=len(list(page.images))
        for annot in page.get('/Annots',[]):
            a=annot.get_object()
            if a.get('/Subtype')!='/Link': continue
            rect=[float(v) for v in a['/Rect']]
            assert 0<=rect[0]<rect[2]<=width+0.1 and 0<=rect[1]<rect[3]<=height+0.1,(path,i,rect)
            action=a.get('/A',{})
            if action.get('/URI'): links.append(str(action['/URI']))
    for p in selected:
        assert p['websiteUrl'] in links and p['whatsappUrl'] in links,(path,p['code'])
        assert parse_qs(urlparse(p['whatsappUrl']).query)['text'][0].find(p['code'])>=0
    with pdfplumber.open(path) as parsed:
        for i,page in enumerate(parsed.pages):
            outside=[c for c in page.chars if c['x0']<0 or c['x1']>page.width+0.5 or c['top']<0 or c['bottom']>page.height+0.5]
            assert not outside,(path,i,'Text outside page')
            assert not any(c['text']=='\u25a0' for c in page.chars),(path,i,'Bad glyph')
    # Render every page; contact sheets make all outputs inspectable.
    prefix=QA/(path.stem+'-page')
    proc=subprocess.run(['pdftoppm','-scale-to','400','-png',str(path),str(prefix)],capture_output=True,text=True)
    assert proc.returncode==0,(path,proc.stderr)
    pages=sorted(QA.glob(path.stem+'-page-*.png'))
    assert len(pages)==len(pdf.pages)
    # One sheet per document; long catalogs spill onto a second labeled sheet.
    for chunk in range(0,len(pages),24):
        subset=pages[chunk:chunk+24]
        thumb_w,thumb_h=200,350
        cols=4
        sheet=Image.new('RGB',(cols*thumb_w,42+((len(subset)+cols-1)//cols)*thumb_h),'#d7d9d5')
        draw=ImageDraw.Draw(sheet)
        draw.text((10,10),path.stem,fill='black')
        for j,pagepath in enumerate(subset):
            with Image.open(pagepath) as im:
                im.thumbnail((192,320))
                x=(j%cols)*thumb_w+(thumb_w-im.width)//2
                y=42+(j//cols)*thumb_h
                sheet.paste(im,(x,y))
                draw.text(((j%cols)*thumb_w+8,y+322),f'Page {chunk+j+1}',fill='black')
        sheet.save(QA/f'{path.stem}-sheet-{chunk//24+1:02}.jpg',quality=85)
    return {'file':item['file'],'pages':len(pdf.pages),'products':len(selected),'links':len(links),'images':image_count,'rendered':len(pages)}

with ThreadPoolExecutor(max_workers=3) as pool:
    for result in pool.map(verify,manifest['files']):
        records.append(result)
        print(json.dumps(result),flush=True)
assert len(records)==2*(len(groups)+1)
(QA/'verification.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
print(f'All {len(records)} PDFs passed content, pagination, link, bounds and rendering checks.')
