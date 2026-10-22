"""Check complete editorial catalogs, invisible links and every rendered page."""
import argparse
import importlib.util
import json
import re
import subprocess
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import pdfplumber
from pypdf import PdfReader
from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--data',type=Path,default=ROOT/'tmp/pdfs/share-catalog-data.json')
parser.add_argument('--output',type=Path,default=ROOT/'output/pdf/catalogs-2026-10-editorial')
parser.add_argument('--qa',type=Path,default=ROOT/'tmp/pdfs/editorial-qa')
args=parser.parse_args()
spec=importlib.util.spec_from_file_location('editorial',Path(__file__).with_name('create-editorial-catalogs.py'))
generator=importlib.util.module_from_spec(spec)
spec.loader.exec_module(generator)
data=json.loads(args.data.read_text(encoding='utf-8'))
manifest=json.loads((args.output/'manifest.json').read_text(encoding='utf-8'))
args.qa.mkdir(parents=True,exist_ok=True)
groups={g['slug']:g for g in data['categories']}

def normalized(text):
    return re.sub(r'\s+',' ',generator.clean(text))

def check(item):
    path=args.output/item['file']
    reader=PdfReader(path)
    texts=[p.extract_text() or '' for p in reader.pages]
    alltext=normalized(' '.join(texts))
    selected=[p for g in data['categories'] for p in generator.select_highlights(g['products'])] if item['slug']=='general-highlights' else groups[item['slug']]['products']
    assert len(reader.pages)==item['pages']
    assert len(selected)==item['products']
    assert 'VIEW PRODUCT' not in alltext and 'OPEN WHATSAPP' not in alltext
    assert 'REFERENCE PRICE' not in alltext and 'legacy-unverified' not in alltext
    for p in selected:
        assert alltext.count(p['code'])==1,(path,p['code'],'reference count')
        assert normalized(p['name']) in alltext,(path,p['name'])
    links=[]
    visible_borders=0
    for i,page in enumerate(reader.pages):
        w,h=float(page.mediabox.width),float(page.mediabox.height)
        expected=generator.landscape(generator.A4) if item['mode']=='print' else (420,700)
        assert abs(w-expected[0])<0.1 and abs(h-expected[1])<0.1
        assert f'{i+1:02} / {len(reader.pages):02}' in texts[i]
        if 0<i<len(reader.pages)-1:
            assert 'WHATSAPP' not in texts[i].upper(),(path,i,'Repeated enquiry text')
        for entry in page.get('/Annots',[]):
            annotation=entry.get_object()
            if annotation.get('/Subtype')!='/Link':
                continue
            x0,y0,x1,y1=map(float,annotation['/Rect'])
            assert 0<=x0<x1<=w+0.2 and 0<=y0<y1<=h+0.2,(path,i,'link bounds')
            border=annotation.get('/Border',[0,0,0])
            if len(border)>2 and float(border[2])>0:
                visible_borders+=1
            action=annotation.get('/A',{})
            if action.get('/URI'):
                links.append(str(action['/URI']))
    assert visible_borders==0,(path,'visible link borders')
    for p in selected:
        assert p['websiteUrl'] in links and p['whatsappUrl'] in links,(path,p['code'],'missing invisible link')
    with pdfplumber.open(path) as pdf:
        for i,page in enumerate(pdf.pages):
            outside=[c for c in page.chars if c['x0']<0 or c['x1']>page.width+.5 or c['top']<0 or c['bottom']>page.height+.5]
            assert not outside,(path,i,'text outside page',outside[:1])
            assert not any(c['text']=='\u25a0' for c in page.chars),(path,i,'missing glyph')
            # Product names and photo captions must not occupy the footer.
            assert not any(c['top']>page.height-48 and c['size']>10 for c in page.chars),(path,i,'large text in footer')
    prefix=args.qa/(path.stem+'-page')
    proc=subprocess.run(['pdftoppm','-scale-to','450','-png',str(path),str(prefix)],capture_output=True,text=True)
    assert proc.returncode==0,(path,proc.stderr)
    pages=sorted(args.qa.glob(path.stem+'-page-*.png'))
    assert len(pages)==len(reader.pages)
    for start in range(0,len(pages),20):
        subset=pages[start:start+20]
        tw,th=(310,245) if item['mode']=='print' else (210,375)
        cols=4
        sheet=Image.new('RGB',(tw*cols,40+math_ceil(len(subset),cols)*th),'#d8d5ce')
        draw=ImageDraw.Draw(sheet)
        draw.text((10,10),path.stem,fill='black')
        for j,png in enumerate(subset):
            with Image.open(png) as image:
                image.thumbnail((tw-12,th-35))
                x=(j%cols)*tw+(tw-image.width)//2
                y=40+(j//cols)*th
                sheet.paste(image,(x,y))
                draw.text(((j%cols)*tw+8,y+th-25),f'Page {start+j+1}',fill='black')
        sheet.save(args.qa/f'{path.stem}-sheet-{start//20+1:02}.jpg',quality=85)
    return {'file':item['file'],'pages':len(reader.pages),'products':len(selected),'links':len(links),'visibleLinkBorders':visible_borders,'rendered':len(pages)}

def math_ceil(a,b):
    return (a+b-1)//b

results=[]
with ThreadPoolExecutor(max_workers=3) as pool:
    for result in pool.map(check,manifest['files']):
        results.append(result)
        print(json.dumps(result),flush=True)
assert len(results)==2*(len(groups)+1)
(args.qa/'verification.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
print(f'Passed: {len(results)} PDFs / {sum(r["pages"] for r in results)} pages; no product buttons or visible link borders.')
