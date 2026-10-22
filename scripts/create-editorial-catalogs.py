"""Editorial furniture catalogs from the existing storefront-only export.

Preserves earlier editions and full product identities. No visible product CTAs.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import zipfile
from datetime import datetime
from html import escape
from pathlib import Path
from urllib.parse import quote

from PIL import Image, ImageOps
from reportlab.graphics import renderPDF
from reportlab.graphics.barcode import qr
from reportlab.graphics.shapes import Drawing
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas

ROOT=Path(__file__).resolve().parents[1]
PAPER=HexColor('#F3F0E8')
INK=HexColor('#292C26')
MUTED=HexColor('#706F64')
ACCENT=HexColor('#947252')
RULE=HexColor('#D6D0C3')
LIGHT=HexColor('#DCD6C8')
BODY,BOLD,DISPLAY,MODEL='Helvetica','Helvetica-Bold','Times-Roman','Times-Roman'
fonts=[('EditorialSans','corbel.ttf'),('EditorialBold','corbelb.ttf'),
       ('EditorialDisplay','BOD_R.TTF'),('EditorialModel','BASKVILL.TTF')]
if all((Path('C:/Windows/Fonts')/file).exists() for _,file in fonts):
    for name,file in fonts:
        pdfmetrics.registerFont(TTFont(name,str(Path('C:/Windows/Fonts')/file)))
    BODY,BOLD,DISPLAY,MODEL=[name for name,_ in fonts]


def clean(value):
    value=str(value or '')
    for a,b in {'\u2013':'-','\u2014':'-','\u2011':'-','\u2018':"'",'\u2019':"'",'\u201c':'"','\u201d':'"','\u20b9':'Rs. '}.items():
        value=value.replace(a,b)
    return re.sub(r'\s+',' ',value).strip()


def lines(value,font,size,width):
    result=[]
    current=''
    for word in clean(value).split():
        candidate=(current+' '+word).strip()
        if pdfmetrics.stringWidth(candidate,font,size)>width:
            if current:
                result.append(current)
            if pdfmetrics.stringWidth(word,font,size)>width:
                raise ValueError(f'Unbreakable text exceeds layout: {word}')
            current=word
        else:
            current=candidate
    if current:
        result.append(current)
    return result


def text(c,value,x,y,size=10,font=None,color=INK):
    c.setFillColor(color)
    c.setFont(font or BODY,size)
    c.drawString(x,y,clean(value))


def tracked(c,value,x,y,size=8,tracking=1.5,color=INK,right=False):
    value=clean(value)
    if right:
        x-=pdfmetrics.stringWidth(value,BOLD,size)+max(0,len(value)-1)*tracking
    c.saveState()
    t=c.beginText(x,y)
    t.setFont(BOLD,size)
    t.setFillColor(color)
    t.setCharSpace(tracking)
    t.textOut(value)
    c.drawText(t)
    c.restoreState()


def paragraph(c,value,x,y,width,size=10,font=None,color=MUTED,leading=None):
    for line in lines(value,font or BODY,size,width):
        text(c,line,x,y,size,font,color)
        y-=leading or size*1.3
    return y


def qr_code(c,url,x,y,size):
    widget=qr.QrCodeWidget(url)
    a,b,d,e=widget.getBounds()
    drawing=Drawing(size,size,transform=[size/(d-a),0,0,size/(e-b),0,0])
    drawing.add(widget)
    renderPDF.draw(drawing,c,x,y)
    c.linkURL(url,(x,y,x+size,y+size),relative=0)


def select_highlights(products):
    # Art-directed sofa highlights: staged, clear photographs with varied forms.
    # Full category catalogs still include every existing eligible public product.
    sofa_ids=[
        '3-seater-modern-sofa-grey-fabric-leatherette-designer-sofa',
        'chinstown-customizable-32-sofa-set',
        'deisy-sofa-cum-bed',
        'wooden-3-seater-sofa-premium-fabric-sofa-set',
    ]
    by_id={p['id']:p for p in products}
    if all(identity in by_id for identity in sofa_ids):
        return [by_id[identity] for identity in sofa_ids]
    count=min(4,len(products))
    indices=[round(i*(len(products)-1)/max(1,count-1)) for i in range(count)]
    selected=[]
    seen=set()
    for index in indices+list(range(len(products))):
        product=products[index]
        digest=hashlib.sha256(Path(product['imagePath']).read_bytes()).hexdigest()
        if product not in selected and digest not in seen:
            selected.append(product)
            seen.add(digest)
        if len(selected)==count:
            break
    return selected


def hero_for(group,general=False):
    products=group['products']
    # Use an existing room photograph, rather than a generic invented room.
    if group['slug']=='sofas':
        phrase='chinstown' if general else '3 seater fabric sofa - modern button'
        match=next((p for p in products if phrase in p['name'].lower()),None)
        if match:
            return match
    candidates=select_highlights(products)
    def score(p):
        with Image.open(p['imagePath']) as image:
            w,h=image.size
        return min(w,h),min(w,h)/max(w,h)
    return max(candidates,key=score)


class EditorialCatalog:
    def __init__(self,data,path,mode,title,groups,cache,general=False):
        self.data,self.path,self.mode,self.title,self.groups,self.cache,self.general=data,path,mode,title,groups,cache,general
        self.biz=data['business']
        self.edition_label=datetime.fromisoformat(data['generatedAt'].replace('Z','+00:00')).strftime('%B %Y').upper()
        self.w,self.h=landscape(A4) if mode=='print' else (420,700)
        self.m=44 if mode=='print' else 27
        self.per_page=2 if mode=='print' else 1
        self.product_pages=sum(math.ceil(len(g['products'])/self.per_page) for g in groups)
        # Category editions begin with one full editorial feature, then pairs.
        if mode=='print' and not general:
            self.product_pages=1+math.ceil((len(groups[0]['products'])-1)/2)
        self.total=2+int(general)+self.product_pages
        self.page=0
        self.warnings=[]
        self.c=Canvas(str(path),pagesize=(self.w,self.h),pageCompression=1)
        self.c.setTitle(f'Lucky Interiors - {title} - {mode.title()} - Editorial edition')
        self.c.setAuthor(self.biz['name'])
        self.c.setCreator('Lucky Interiors Furniture')
        self.c.setSubject('Furniture collection for product shortlisting and enquiries')

    def new(self,label='',dark=False,cover=False):
        self.page+=1
        c=self.c
        c.setFillColor(INK if dark else PAPER)
        c.rect(0,0,self.w,self.h,fill=1,stroke=0)
        tracked(c,'LUCKY INTERIORS',self.m,self.h-32,8 if self.mode=='print' else 7.5,1.7,LIGHT if dark else INK)
        if label:
            tracked(c,label.upper(),self.w-self.m,self.h-32,7,1.1,LIGHT if dark else MUTED,True)
        if not cover:
            c.setStrokeColor(ACCENT if dark else RULE)
            c.setLineWidth(0.5)
            c.line(self.m,self.h-47,self.w-self.m,self.h-47)

    def footer(self,dark=False):
        c=self.c
        color=LIGHT if dark else MUTED
        text(c,self.biz['website'].replace('https://',''),self.m,23,7,color=color)
        c.linkURL(self.biz['website'],(self.m,16,self.m+205,32),relative=0)
        c.setFont(BODY,8)
        c.setFillColor(color)
        c.drawRightString(self.w-self.m,23,f'{self.page:02} / {self.total:02}')
        c.showPage()

    def photo(self,product,x,y,w,h,linked=True):
        source=Path(product['imagePath'])
        digest=hashlib.sha256(source.read_bytes()).hexdigest()
        dpi,quality=(150,84) if self.mode=='whatsapp' else (300,94)
        key=hashlib.sha256(f'editorial:{digest}:{w:.2f}:{h:.2f}:{dpi}:{quality}'.encode()).hexdigest()
        cached=self.cache/f'{key}.jpg'
        if not cached.exists():
            with Image.open(source) as original:
                image=ImageOps.exif_transpose(original).convert('RGBA')
                image.thumbnail((math.ceil(w*dpi/72),math.ceil(h*dpi/72)),Image.Resampling.LANCZOS)
                flattened=Image.new('RGB',image.size,'white')
                flattened.paste(image,mask=image.getchannel('A'))
                flattened.save(cached,'JPEG',quality=quality,optimize=True)
        reader=ImageReader(str(cached))
        iw,ih=reader.getSize()
        scale=min(w/iw,h/ih)
        dw,dh=iw*scale,ih*scale
        px,py=x+(w-dw)/2,y+(h-dh)/2
        self.c.drawImage(reader,px,py,dw,dh,mask='auto')
        if linked:
            self.c.linkURL(product['websiteUrl'],(px,py,px+dw,py+dh),relative=0)
        if self.mode=='print':
            with Image.open(source) as image:
                effective=max(image.width/w,image.height/h)*72
            if effective<150:
                self.warnings.append({'id':product['id'],'effectiveDpi':round(effective)})

    def whatsapp(self):
        return f'https://wa.me/{self.biz["whatsappNumber"]}?text='+quote(f'Hello Lucky Interiors, I am browsing the {self.title} catalog.')

    def cover(self):
        self.new('THE FURNITURE COLLECTION',cover=True)
        c,m=self.c,self.m
        group=self.groups[0]
        if self.general:
            # The general selection may not include the cover's room photograph.
            group=next(g for g in self.data['categories'] if g['slug']=='sofas')
        hero=hero_for(group,self.general)
        title='Furniture\ncollection' if self.general else self.title
        count=sum(len(g['products']) for g in self.groups)
        if self.mode=='print':
            title_width=260
            size=70
            while any(pdfmetrics.stringWidth(word,DISPLAY,size)>title_width for word in title.replace('\n',' ').split()):
                size-=1
            title_lines=[]
            for part in title.split('\n'):
                title_lines+=lines(part,DISPLAY,size,title_width)
            while len(title_lines)>3:
                size-=2
                title_lines=lines(title.replace('\n',' '),DISPLAY,size,title_width)
            top=self.h-140
            for line in title_lines:
                text(c,line,m,top,size,DISPLAY)
                top-=size*0.99
            c.setStrokeColor(ACCENT)
            c.setLineWidth(1.5)
            c.line(m,top-17,m+42,top-17)
            tracked(c,f'{count} DESIGNS',m,top-44,8,1.8,MUTED)
            self.photo(hero,329,81,self.w-329-m,self.h-160,False)
            text(c,'For the rooms',m,126,24,MODEL)
            text(c,'you live in.',m,99,24,MODEL)
            tracked(c,f'MUMBAI  /  {self.edition_label}',m,60,7,1.3,MUTED)
        else:
            title='Furniture\ncollection' if self.general else self.title
            size=54 if self.general else 56
            title_lines=[]
            for part in title.split('\n'):
                title_lines+=lines(part,DISPLAY,size,self.w-2*m)
            while len(title_lines)>2:
                size-=2
                title_lines=lines(title.replace('\n',' '),DISPLAY,size,self.w-2*m)
            y=self.h-116
            for line in title_lines:
                text(c,line,m,y,size,DISPLAY)
                y-=size*0.93
            image_top=y+size*0.93-32
            self.photo(hero,m,161,self.w-2*m,image_top-161,False)
            tracked(c,f'{count} DESIGNS  /  MUMBAI',m,116,8,1.6,MUTED)
            text(c,'For the rooms you live in.',m,80,21,MODEL)
        self.footer()

    def index(self):
        self.new('THE DIRECTORY')
        c,m=self.c,self.m
        text(c,'Explore the collection',m,self.h-101,38 if self.mode=='print' else 29,DISPLAY)
        if self.mode=='print':
            count=sum(len(g['products']) for g in self.groups)
            paragraph(c,f'A selection of {count} designs across our furniture collections.',m,self.h-129,650,11)
            width=(self.w-2*m-48)/3
            y0=self.h-189
            row_height=67
            page=3
            for i,g in enumerate(self.groups):
                col,row=divmod(i,5)
                x=m+col*(width+24)
                y=y0-row*row_height
                tracked(c,f'{i+1:02}',x,y+6,7,1.2,ACCENT)
                end=paragraph(c,g['name'],x+29,y,width-31,17,MODEL,INK,18)
                text(c,f'p. {page:02}',x+29,end-6,8,color=MUTED)
                c.linkRect('',f'collection-{g["slug"]}',(x,y-42,x+width,y+19),relative=0,thickness=0)
                page+=math.ceil(len(g['products'])/2)
            paragraph(c,'Digital edition: tap a photograph for product details, or its reference to enquire.',m,64,self.w-2*m,9)
        else:
            paragraph(c,'A selection for every room.',m,self.h-126,self.w-2*m,11)
            y=self.h-168
            page=3
            for i,g in enumerate(self.groups):
                tracked(c,f'{i+1:02}',m,y,7,1,ACCENT)
                text(c,g['name'],m+31,y-1,15,MODEL)
                c.setFont(BODY,9)
                c.setFillColor(MUTED)
                c.drawRightString(self.w-m,y,f'{page:02}')
                c.setStrokeColor(RULE)
                c.setLineWidth(0.4)
                c.line(m,y-11,self.w-m,y-11)
                c.linkRect('',f'collection-{g["slug"]}',(m,y-11,self.w-m,y+14),relative=0,thickness=0)
                y-=28
                page+=len(g['products'])
            paragraph(c,'Tap a photograph for details, or its reference to enquire.',m,76,self.w-2*m,9)
        self.footer()

    def caption(self,p,x,y,width,size=18,max_lines=3,code_y=None):
        c=self.c
        while len(lines(p['name'],MODEL,size,width))>max_lines and size>13:
            size-=0.25
        name_lines=lines(p['name'],MODEL,size,width)
        if len(name_lines)>max_lines:
            raise ValueError(f'Name does not fit: {p["id"]}')
        baseline=y
        for line in name_lines:
            text(c,line,x,baseline,size,MODEL)
            baseline-=size*1.14
        c.linkURL(p['websiteUrl'],(x,baseline+size*0.5,x+width,y+size),relative=0)
        specs=[]
        if p.get('price'):
            specs.append(f'Rs. {p["price"]:,.0f}')
        specs += [p[k] for k in ('dimensions','material') if p.get(k)]
        if specs:
            baseline-=7
            baseline=paragraph(c,' / '.join(specs),x,baseline,width,9)
        reference_y=code_y if code_y is not None else baseline-16
        if baseline<reference_y+9:
            raise ValueError(f'Caption overlaps its reference: {p["id"]}')
        tracked(c,p['code'],x,reference_y,7.5,1.2,ACCENT)
        reference_width=pdfmetrics.stringWidth(p['code'],BOLD,7.5)+(len(p['code'])-1)*1.2
        c.linkURL(p['whatsappUrl'],(x,reference_y-5,x+reference_width+5,reference_y+12),relative=0)

    def feature(self,g,p):
        self.new(g['name'])
        c,m=self.c,self.m
        c.bookmarkPage('collection-'+g['slug'])
        c.addOutlineEntry(g['name'],'collection-'+g['slug'])
        tracked(c,'01 / THE COLLECTION',m,self.h-91,7.5,1.6,ACCENT)
        # An asymmetric opening spread provides a larger lead photograph.
        width=239
        self.caption(p,m,self.h-156,width,27,5,107)
        self.photo(p,328,80,self.w-328-m,self.h-157)
        self.footer()

    def print_pair(self,g,items,start):
        self.new(g['name'])
        c,m=self.c,self.m
        if start==0:
            c.bookmarkPage('collection-'+g['slug'])
            c.addOutlineEntry(g['name'],'collection-'+g['slug'])
        width=(self.w-2*m-28)/2
        for i,p in enumerate(items):
            x=m+i*(width+28)
            tracked(c,f'{start+i+1:02}',x,self.h-77,7.5,1.4,ACCENT)
            self.photo(p,x,198,width,self.h-291)
            self.caption(p,x,166,width,18.5,3,67)
        self.footer()

    def phone_product(self,g,p,index):
        self.new('THE COLLECTION')
        c,m=self.c,self.m
        if index==0:
            c.bookmarkPage('collection-'+g['slug'])
            c.addOutlineEntry(g['name'],'collection-'+g['slug'])
        category_size=32
        while pdfmetrics.stringWidth(g['name'],DISPLAY,category_size)>self.w-2*m-55:
            category_size-=1
        text(c,g['name'],m,self.h-94,category_size,DISPLAY)
        c.setFont(MODEL,21)
        c.setFillColor(ACCENT)
        c.drawRightString(self.w-m,self.h-92,f'{index+1:02}')
        self.photo(p,m,224,self.w-2*m,self.h-350)
        self.caption(p,m,192,self.w-2*m,21,4,75)
        self.footer()

    def products(self):
        for g in self.groups:
            if self.mode=='whatsapp':
                for i,p in enumerate(g['products']):
                    self.phone_product(g,p,i)
            else:
                start=0
                if not self.general:
                    self.feature(g,g['products'][0])
                    start=1
                for i in range(start,len(g['products']),2):
                    self.print_pair(g,g['products'][i:i+2],i)

    def contact(self):
        self.new('ENQUIRIES',dark=True)
        c,m=self.c,self.m
        if self.mode=='print':
            text(c,'Bring your',m,self.h-143,56,DISPLAY,PAPER)
            text(c,'space together.',m,self.h-201,56,DISPLAY,PAPER)
            paragraph(c,'For enquiries, quote the reference beneath your chosen design.',m,self.h-246,310,12,color=LIGHT)
            x=475
            tracked(c,'WHATSAPP / TELEPHONE',x,self.h-128,8,1.6,LIGHT)
            text(c,self.biz['phoneDisplay'],x,self.h-165,26,MODEL,PAPER)
            text(c,self.biz['email'],x,self.h-195,12,color=LIGHT)
            c.linkURL('mailto:'+self.biz['email'],(x,self.h-205,self.w-m,self.h-180),relative=0)
            c.linkURL('tel:'+re.sub(r'[^+0-9]','',self.biz['phoneDisplay']),(x,self.h-175,self.w-m,self.h-140),relative=0)
            c.setFillColor(white)
            c.rect(x,self.h-342,114,114,fill=1,stroke=0)
            qr_code(c,self.whatsapp(),x+7,self.h-335,100)
            text(c,'Scan to start a conversation',x+131,self.h-285,10,color=LIGHT)
            paragraph(c,'Please confirm current price, dimensions, material, finish, availability, included items and delivery or assembly details before ordering. Images are for identification and shortlisting.',m,120,self.w-2*m,9,color=LIGHT)
            tracked(c,f'MUMBAI  /  {self.edition_label}',m,64,7,1.3,LIGHT)
        else:
            text(c,'Bring your',m,self.h-117,45,DISPLAY,PAPER)
            text(c,'space together.',m,self.h-164,45,DISPLAY,PAPER)
            paragraph(c,'For enquiries, quote the reference beneath your chosen design.',m,self.h-207,self.w-2*m,12,color=LIGHT)
            tracked(c,'WHATSAPP / TELEPHONE',m,382,8,1.6,LIGHT)
            text(c,self.biz['phoneDisplay'],m,350,25,MODEL,PAPER)
            text(c,self.biz['email'],m,324,12,color=LIGHT)
            c.linkURL('mailto:'+self.biz['email'],(m,317,self.w-m,341),relative=0)
            c.linkURL('tel:'+re.sub(r'[^+0-9]','',self.biz['phoneDisplay']),(m,342,self.w-m,376),relative=0)
            c.setFillColor(white)
            c.rect(m,170,113,113,fill=1,stroke=0)
            qr_code(c,self.whatsapp(),m+7,177,99)
            paragraph(c,'Scan to start a conversation',m+132,225,self.w-2*m-132,11,color=LIGHT)
            paragraph(c,'Please confirm current price, specifications, availability and ordering details before ordering. Images are for identification and shortlisting.',m,111,self.w-2*m,9,color=LIGHT)
        self.footer(True)

    def save(self):
        self.cover()
        if self.general:
            self.index()
        self.products()
        self.contact()
        assert self.page==self.total,(self.title,self.page,self.total)
        self.c.save()


def library(output,manifest):
    names={row['slug']:row['title'] for row in manifest['files']}
    rows=[]
    for slug,title in names.items():
        cells=[]
        for mode in ('whatsapp','print'):
            item=next((f for f in manifest['files'] if f['slug']==slug and f['mode']==mode),None)
            cells.append('<td>-</td>' if not item else f'<td><a href="{escape(item["file"])}">Open catalog</a><small>{item["pages"]} pages / {item["bytes"]/1e6:.2f} MB</small></td>')
        rows.append(f'<tr><th>{escape(title)}</th>{"".join(cells)}</tr>')
    (output/'index.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lucky Interiors / Editorial catalogs</title><style>'
        'body{margin:0;background:#f3f0e8;color:#292c26;font:16px/1.5 system-ui}main{max-width:1000px;margin:auto;padding:64px 28px}h1{font:clamp(36px,6vw,68px)/1.1 Georgia;margin:32px 0 20px}small{display:block;font-size:12px;color:#706f64}header{font-size:12px;letter-spacing:.22em}p{max-width:680px;color:#706f64}a{color:#6c533a;text-underline-offset:4px}table{margin-top:40px;width:100%;border-collapse:collapse}th,td{text-align:left;padding:20px 12px;border-bottom:1px solid #d6d0c3}td{font-size:14px}footer{padding-top:32px;font-size:13px;color:#706f64}@media(max-width:580px){main{padding:32px 16px}td,th{padding:16px 6px;font-size:12px}}</style>'
        '<main><header>LUCKY INTERIORS / FURNITURE COLLECTION</header><h1>A new perspective<br>on your space.</h1>'
        f'<p>The editorial edition. A general selection of {manifest["generalHighlights"]} designs and full category catalogs covering {manifest["categoryProducts"]} products.</p>'
        '<p>A4 landscape spreads for print. Individual product pages for WhatsApp. Tap a photograph for details, or its reference to enquire.</p>'
        '<a href="lucky-interiors-editorial-catalog-pack.zip">Download the complete edition</a>'
        '<table><thead><tr><th>Collection</th><th>WhatsApp</th><th>A4 landscape</th></tr></thead><tbody>'+''.join(rows)+'</tbody></table>'
        '<footer>Print on A4 landscape at 100%. Existing photographs retain their original proportions and source resolution. Confirm current product specifications and ordering details.</footer></main></html>',encoding='utf-8')


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--data',type=Path,default=ROOT/'tmp/pdfs/share-catalog-data.json')
    parser.add_argument('--output',type=Path,default=ROOT/'output/pdf/catalogs-2026-10-editorial')
    parser.add_argument('--cache',type=Path,default=ROOT/'tmp/pdfs/editorial-image-cache')
    parser.add_argument('--category',help='Generate just one category for layout review')
    args=parser.parse_args()
    if args.output.exists():
        raise FileExistsError(f'Preserving existing edition: {args.output}')
    data=json.loads(args.data.read_text(encoding='utf-8'))
    args.output.mkdir(parents=True)
    args.cache.mkdir(parents=True,exist_ok=True)
    groups=data['categories']
    highlights=[{**g,'products':select_highlights(g['products'])} for g in groups]
    selections=[('general-highlights','Furniture collection',highlights,True)]
    selections += [(g['slug'],g['name'],[g],False) for g in groups]
    if args.category:
        selections=[v for v in selections if v[0]==args.category]
        if not selections:
            raise ValueError(f'Unknown category: {args.category}')
    results=[]
    for mode in ('whatsapp','print'):
        (args.output/mode).mkdir()
        for slug,title,selected,general in selections:
            path=args.output/mode/f'lucky-interiors-{slug}-{mode}.pdf'
            catalog=EditorialCatalog(data,path,mode,title,selected,args.cache,general)
            catalog.save()
            record={'file':str(path.relative_to(args.output)).replace('\\','/'),'slug':slug,'title':title,'mode':mode,
                    'pages':catalog.total,'products':sum(len(g['products']) for g in selected),'bytes':path.stat().st_size,
                    'lowResolutionImages':list({v['id']:v for v in catalog.warnings}.values())}
            results.append(record)
            print(json.dumps(record|{'lowResolutionImages':len(record['lowResolutionImages'])}),flush=True)
    manifest={'edition':'Editorial / October 2026','generatedAt':data['generatedAt'],'storefrontProducts':data['activeStorefrontCount'],
              'categoryProducts':sum(len(g['products']) for g in groups),'generalHighlights':sum(len(g['products']) for g in highlights),
              'excluded':data['excluded'],'files':results,
              'codes':{p['code']:{'id':p['id'],'name':p['name'],'url':p['websiteUrl']} for g in groups for p in g['products']},
              'design':{'print':'A4 landscape, feature opening + two products per spread','whatsapp':'420 x 700 pt, one product per page',
                        'links':'Photograph/name -> product page; reference -> WhatsApp. No visible product buttons.'}}
    (args.output/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    library(args.output,manifest)
    (args.output/'README.txt').write_text('LUCKY INTERIORS / EDITORIAL COLLECTION\n\n'
        'Print: A4 landscape at 100% / Actual size. WhatsApp: one design per portrait page.\n'
        'Tap a product photograph or name for details. Tap its reference for a prefilled WhatsApp enquiry.\n'
        'No repeated enquiry buttons. Contact information and QR appear on the closing page.\n'
        'All earlier catalog editions remain preserved. No product facts or images were invented.\n'
        'Only existing public storefront images are included. Eight remote-image products remain excluded.\n'
        'Photograph sharpness is limited by original source resolution. See manifest.json.\n',encoding='utf-8')
    archive=args.output/'lucky-interiors-editorial-catalog-pack.zip'
    with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as output:
        for path in sorted(args.output.rglob('*')):
            if path.is_file() and path!=archive:
                output.write(path,path.relative_to(args.output))
    print('Editorial pack:',archive,archive.stat().st_size,flush=True)


if __name__=='__main__':
    main()
