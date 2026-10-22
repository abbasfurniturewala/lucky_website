"""Generate compact highlights + complete public-image category catalogs.

Uses the storefront-only export. Does not read scraper files or review state.
Existing PDFs and previous output directories are never replaced.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import zipfile
from html import escape
from datetime import datetime
from pathlib import Path
from urllib.parse import quote

from PIL import Image, ImageOps
from reportlab.graphics import renderPDF
from reportlab.graphics.barcode import qr
from reportlab.graphics.shapes import Drawing
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas

ROOT = Path(__file__).resolve().parents[1]
INK = HexColor('#193B31')
MUTED = HexColor('#59665E')
CREAM = HexColor('#F5F3ED')
LINE = HexColor('#D9DFD8')
ACCENT = HexColor('#8B5B34')
FONT, BOLD, DISPLAY = 'Helvetica', 'Helvetica-Bold', 'Times-Roman'
FONT_FILES = [('Body', 'segoeui.ttf'), ('Bold', 'seguisb.ttf'), ('Display', 'georgia.ttf')]
if all((Path('C:/Windows/Fonts')/p).exists() for _,p in FONT_FILES):
    for name, filename in FONT_FILES:
        pdfmetrics.registerFont(TTFont(name, str(Path('C:/Windows/Fonts')/filename)))
    FONT, BOLD, DISPLAY = 'Body', 'Bold', 'Display'


def clean(text):
    for a,b in {'\u2013':'-', '\u2014':'-', '\u2011':'-', '\u2018':"'", '\u2019':"'", '\u201c':'"', '\u201d':'"', '\u20b9':'Rs. '}.items():
        text = str(text).replace(a,b)
    return re.sub(r'\s+', ' ', str(text)).strip()


def wrapped(text, font, size, width):
    lines, current = [], ''
    for word in clean(text).split():
        candidate = (current+' '+word).strip()
        if pdfmetrics.stringWidth(candidate, font, size) > width:
            if current:
                lines.append(current)
            while pdfmetrics.stringWidth(word, font, size) > width:
                split = len(word)-1
                while pdfmetrics.stringWidth(word[:split], font, size) > width:
                    split -= 1
                lines.append(word[:split])
                word = word[split:]
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines


def text(c, value, x, y, size=10, font=None, color=INK):
    c.setFont(font or FONT, size)
    c.setFillColor(color)
    c.drawString(x,y,clean(value))


def paragraph(c, value, x, y, width, size=10, font=None, color=MUTED, leading=None):
    for line in wrapped(value, font or FONT, size, width):
        text(c,line,x,y,size,font,color)
        y -= leading or size*1.4
    return y


def draw_qr(c, url, x, y, size):
    widget = qr.QrCodeWidget(url)
    x0,y0,x1,y1 = widget.getBounds()
    drawing = Drawing(size,size,transform=[size/(x1-x0),0,0,size/(y1-y0),0,0])
    drawing.add(widget)
    renderPDF.draw(drawing,c,x,y)
    c.linkURL(url,(x,y,x+size,y+size),relative=0)


def select_highlights(products):
    """Spread selections across the range; avoid duplicate source photographs."""
    count=min(4,len(products))
    indexes=[round(i*(len(products)-1)/max(1,count-1)) for i in range(count)]
    selected=[]
    images=set()
    for index in indexes+list(range(len(products))):
        product=products[index]
        digest=hashlib.sha256(Path(product['imagePath']).read_bytes()).hexdigest()
        if product not in selected and digest not in images:
            selected.append(product)
            images.add(digest)
        if len(selected)==count:
            break
    return selected


def image_reader(path, mode, cache, box):
    source = Path(path)
    # Cache identity includes source contents, format and actual target geometry.
    source_hash = hashlib.sha256(source.read_bytes()).hexdigest()
    key = hashlib.sha256(f'{source_hash}:{mode}:{box}'.encode()).hexdigest()
    destination = cache/f'{key}.jpg'
    if not destination.exists():
        dpi, quality = (130,76) if mode == 'whatsapp' else (300,94)
        target = (math.ceil(box[0]*dpi/72), math.ceil(box[1]*dpi/72))
        with Image.open(source) as original:
            im = ImageOps.exif_transpose(original).convert('RGBA')
            # Contain instead of cropping; do not upscale low resolution originals.
            im.thumbnail(target, Image.Resampling.LANCZOS)
            background = Image.new('RGB',im.size,'white')
            background.paste(im,mask=im.getchannel('A'))
            background.save(destination,'JPEG',quality=quality,optimize=True)
    return ImageReader(str(destination))


class Catalog:
    def __init__(self,data,path,mode,title,groups,cache,general=False):
        self.data,self.mode,self.title,self.groups,self.cache,self.general = data,mode,title,groups,cache,general
        self.business=data['business']
        self.w,self.h = (420,700) if mode=='whatsapp' else A4
        self.margin = 25 if mode=='whatsapp' else 32
        self.per_page = 2 if mode=='whatsapp' else 4
        self.index_pages = 1 if general else 0
        self.total = 2+self.index_pages+sum(math.ceil(len(g['products'])/self.per_page) for g in groups)
        self.c=Canvas(str(path),pagesize=(self.w,self.h),pageCompression=1)
        self.c.setTitle(f'Lucky Interiors Furniture - {title} - {mode.title()}')
        self.c.setAuthor(self.business['name'])
        self.c.setSubject('Furniture shortlisting and enquiry catalog. Confirm current specifications before ordering.')
        self.c.setCreator('Lucky Interiors Furniture catalog tools')
        self.page=0
        self.resolution_warnings=[]

    def photo(self,product,x,y,w,h):
        c=self.c
        c.setFillColor(white)
        c.rect(x,y,w,h,fill=1,stroke=0)
        reader=image_reader(product['imagePath'],self.mode,self.cache,(w,h))
        c.drawImage(reader,x,y,w,h,preserveAspectRatio=True,anchor='c',mask='auto')
        if self.mode=='print':
            with Image.open(product['imagePath']) as im:
                effective=max(im.width/w,im.height/h)*72
                if effective<150:
                    self.resolution_warnings.append({'id':product['id'],'effectiveDpi':round(effective)})

    def new(self,label):
        self.page+=1
        c=self.c
        c.setFillColor(white)
        c.rect(0,0,self.w,self.h,stroke=0,fill=1)
        text(c,'LUCKY INTERIORS',self.margin,self.h-27,9,BOLD)
        c.setFont(FONT,8)
        c.setFillColor(MUTED)
        c.drawRightString(self.w-self.margin,self.h-27,clean(label))

    def footer(self):
        c,m=self.c,self.margin
        c.setStrokeColor(LINE)
        c.line(m,30,self.w-m,30)
        text(c,self.business['website'].replace('https://',''),m,16,7.5,color=MUTED)
        c.linkURL(self.business['website'],(m,10,self.w-70,25),relative=0)
        c.setFont(FONT,7.5)
        c.drawRightString(self.w-m,16,f'{self.page} / {self.total}')
        c.showPage()

    def cover(self):
        self.new('MUMBAI | FURNITURE CATALOG')
        c,m=self.c,self.margin
        text(c,'A considered home',m,self.h-86,29 if self.mode=='whatsapp' else 36,DISPLAY)
        y=paragraph(c,self.title,m,self.h-125,self.w-2*m,20,DISPLAY,color=ACCENT,leading=25)
        count=sum(len(g['products']) for g in self.groups)
        text(c,f'{count} designs | {len(self.groups)} collections' if self.general else f'{count} {"design" if count==1 else "designs"} to explore',m,y-2,10)
        heroes=[g['products'][0] for g in self.groups][:4] if self.general else select_highlights(self.groups[0]['products'])
        top=y-28
        gap=10
        bw=(self.w-2*m-gap)/2 if len(heroes)>1 else self.w-2*m
        bh=(top-200-gap)/2 if len(heroes)>2 else top-200
        for i,p in enumerate(heroes):
            row,col=divmod(i,2)
            self.photo(p,m+col*(bw+gap),top-(row+1)*bh-row*gap,bw,bh)
        c.setStrokeColor(LINE)
        c.line(m,180,self.w-m,180)
        paragraph(c,'Browse. Shortlist. Enquire.',m,158,self.w-2*m-90,16,DISPLAY,color=INK)
        paragraph(c,'Share the product code or tap a WhatsApp link. Confirm current price, dimensions, material, finish and availability before ordering.',m,129,self.w-2*m-90,9)
        text(c,self.business['phoneDisplay'],m,64,12,BOLD)
        draw_qr(c,self.whatsapp(),self.w-m-79,70,79)
        self.footer()

    def whatsapp(self):
        return f"https://wa.me/{self.business['whatsappNumber']}?text="+quote(f'Hello Lucky Interiors, I am viewing your {self.title} catalog.')

    def index(self):
        self.new('COLLECTION DIRECTORY')
        text(self.c,'Find your collection',self.margin,self.h-74,25,DISPLAY)
        paragraph(self.c,'Selected highlights from the public catalog. Explore the wider range through our separate collection catalogs or website.',self.margin,self.h-103,self.w-2*self.margin,9)
        row_height = 30 if self.mode=='whatsapp' else 36
        y=self.h-165
        page=3
        for group in self.groups:
            c,m=self.c,self.margin
            text(c,group['name'],m,y,10,BOLD)
            c.setFont(FONT,9)
            c.drawRightString(self.w-m,y,f'{len(group["products"])} designs / {page:02}')
            c.setStrokeColor(LINE)
            c.line(m,y-10,self.w-m,y-10)
            c.linkRect('',f'category-{group["slug"]}',(m,y-10,self.w-m,y+12),relative=0,thickness=0)
            page+=math.ceil(len(group['products'])/self.per_page)
            y-=row_height
        self.footer()

    def button(self,label,url,x,y,w,h,filled=False):
        c=self.c
        c.setStrokeColor(INK)
        c.setFillColor(INK if filled else white)
        c.roundRect(x,y,w,h,3,fill=1,stroke=1)
        c.setFont(BOLD,8)
        c.setFillColor(white if filled else INK)
        c.drawCentredString(x+w/2,y+(h-8)/2+1,clean(label))
        c.linkURL(url,(x,y,x+w,y+h),relative=0)

    def card(self,p,x,y,w,h):
        c=self.c
        image_height=h-112
        self.photo(p,x,y+h-image_height,w,image_height)
        top=y+h-image_height-17
        font_size=11 if self.mode=='whatsapp' else 10
        # Fit full names, with no ellipses or lost model identifiers.
        while len(wrapped(p['name'],BOLD,font_size,w))>3 and font_size>8:
            font_size-=0.25
        lines=wrapped(p['name'],BOLD,font_size,w)
        if len(lines)>3:
            raise ValueError(f'Product name does not fit: {p["id"]}')
        for line in lines:
            text(c,line,x,top,font_size,BOLD)
            top-=font_size*1.25
        text(c,p['code'],x,y+48,8,BOLD,ACCENT)
        # Verified optional specs only. Nothing is inferred from the photo.
        specs=[]
        if p.get('price'):
            specs.append(f'Rs. {p["price"]:,.0f}')
        for key in ('dimensions','material'):
            if p.get(key):
                specs.append(p[key])
        if specs:
            if len(wrapped(' | '.join(specs),FONT,7.5,w))>1:
                raise ValueError(f'Verified specifications need more space: {p["id"]}. Adjust the card layout before export.')
            paragraph(c,' | '.join(specs),x,y+37,w,7.5)
        gap=8
        self.button('WHATSAPP',p['whatsappUrl'],x,y+2,(w-gap)/2,26,True)
        self.button('VIEW PRODUCT',p['websiteUrl'],x+(w+gap)/2,y+2,(w-gap)/2,26)

    def products(self):
        c,m=self.c,self.margin
        for group in self.groups:
            for start in range(0,len(group['products']),self.per_page):
                self.new('THE COLLECTION')
                if start==0:
                    c.bookmarkPage('category-'+group['slug'])
                    c.addOutlineEntry(group['name'],'category-'+group['slug'])
                text(c,group['name'],m,self.h-66,23,DISPLAY)
                text(c,f'{start+1:03}-{min(start+self.per_page,len(group["products"])):03} / {len(group["products"]):03}',m,self.h-85,8,color=MUTED)
                columns=1 if self.mode=='whatsapp' else 2
                gap=16
                w=(self.w-2*m-(columns-1)*gap)/columns
                h=(self.h-158-gap)/2
                top=self.h-102
                for i,p in enumerate(group['products'][start:start+self.per_page]):
                    row,col=divmod(i,columns)
                    self.card(p,m+col*(w+gap),top-(row+1)*h-row*gap,w,h)
                text(c,'Please confirm current specifications and ordering details.',m,43,7.5,color=MUTED)
                self.footer()

    def contact(self):
        self.new('YOUR NEXT STEP')
        c,m=self.c,self.margin
        text(c,'Let us help you choose.',m,self.h-95,24,DISPLAY)
        paragraph(c,'Send the code, a screenshot or the product page link for the designs you like.',m,self.h-132,self.w-2*m,11)
        text(c,self.business['name'],m,self.h-205,15,BOLD)
        text(c,self.business['phoneDisplay'],m,self.h-236,17,BOLD)
        text(c,self.business['email'],m,self.h-262,10)
        c.linkURL('mailto:'+self.business['email'],(m,self.h-270,self.w-m,self.h-250),relative=0)
        phone=re.sub(r'[^+0-9]','',self.business['phoneDisplay'])
        c.linkURL('tel:'+phone,(m,self.h-242,self.w-m,self.h-220),relative=0)
        text(c,self.business['website'].replace('https://',''),m,self.h-285,10)
        url=self.whatsapp()
        draw_qr(c,url,m,self.h-430,116)
        self.button('OPEN WHATSAPP',url,m+136,self.h-385,self.w-2*m-136,36,True)
        paragraph(c,'Before you order',m,176,self.w-2*m,15,DISPLAY,color=INK)
        paragraph(c,'Confirm the exact dimensions, material, finish, price, availability, included items, delivery and assembly details for your chosen design. Images are for identification and shortlisting.',m,151,self.w-2*m,9)
        date=datetime.fromisoformat(self.data['generatedAt'].replace('Z','+00:00')).strftime('%d %B %Y')
        text(c,f'Catalog prepared {date}.',m,62,8,color=MUTED)
        self.footer()

    def save(self):
        self.cover()
        if self.general:
            self.index()
        self.products()
        self.contact()
        if self.page!=self.total:
            raise ValueError('Incorrect page count')
        self.c.save()


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--data',type=Path,default=ROOT/'tmp/pdfs/share-catalog-data.json')
    parser.add_argument('--output',type=Path,default=ROOT/'output/pdf/catalogs-2026-10')
    parser.add_argument('--cache',type=Path,default=ROOT/'tmp/pdfs/share-catalog-images')
    args=parser.parse_args()
    if args.output.exists():
        raise FileExistsError(f'Preserving existing output: choose a new --output directory: {args.output}')
    data=json.loads(args.data.read_text(encoding='utf-8'))
    args.output.mkdir(parents=True)
    args.cache.mkdir(parents=True,exist_ok=True)
    groups=data['categories']
    highlights=[{**g,'products':select_highlights(g['products'])} for g in groups]
    results=[]
    for mode in ('whatsapp','print'):
        folder=args.output/mode
        folder.mkdir()
        selections=[('general-highlights','Selected furniture',highlights,True)]
        selections += [(g['slug'],g['name'],[g],False) for g in groups]
        for slug,title,selected,general in selections:
            path=folder/f'lucky-interiors-{slug}-{mode}.pdf'
            catalog=Catalog(data,path,mode,title,selected,args.cache,general)
            catalog.save()
            result={'file':str(path.relative_to(args.output)).replace('\\','/'),'pages':catalog.total,
                    'products':sum(len(g['products']) for g in selected),'bytes':path.stat().st_size,
                    'lowResolutionImages':list({v['id']:v for v in catalog.resolution_warnings}.values())}
            results.append(result)
            print(f'{result["file"]}: {result["pages"]} pages, {result["products"]} products, {result["bytes"]:,} bytes')
    manifest={'generatedAt':data['generatedAt'],'storefrontProducts':data['activeStorefrontCount'],
              'categoryProducts':sum(len(g['products']) for g in groups),
              'generalHighlights':sum(len(g['products']) for g in highlights),
              'excluded':data['excluded'],'files':results,
              'codes':{p['code']:{'id':p['id'],'name':p['name'],'url':p['websiteUrl']} for g in groups for p in g['products']}}
    (args.output/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    (args.output/'README.txt').write_text(
        'LUCKY INTERIORS FURNITURE\n\n'
        'whatsapp/: compact page layouts with compressed images and clickable enquiry links.\n'
        'print/: A4 layouts, embedded fonts, white backgrounds and images kept at their available resolution up to 300 dpi. Print at Actual size / 100%.\n\n'
        f'General catalog: {manifest["generalHighlights"]} highlights across {len(groups)} categories.\n'
        f'Category catalogs: all {manifest["categoryProducts"]} products with local public images; {len(data["excluded"])} remote-image records omitted.\n'
        'Product codes are stable across both formats and derived from storefront IDs.\n'
        'Tap WhatsApp or View Product. General directory entries link to category pages.\n'
        'Confirm current specifications and ordering details before ordering. No unverified prices or specifications are added.\n'
        'Print image sharpness is limited by the existing source images. See lowResolutionImages in manifest.json.\n'
        'No private scraper images, review decisions or image-rights source notes are included.\n',encoding='utf-8')
    rows=[]
    for slug,label in [('general-highlights','General highlights')]+[(g['slug'],g['name']) for g in groups]:
        cells=[]
        for mode in ('whatsapp','print'):
            item=next(r for r in results if r['file']==f'{mode}/lucky-interiors-{slug}-{mode}.pdf')
            cells.append(f'<td><a href="{escape(item["file"])}">Open PDF</a><small>{item["pages"]} pages &middot; {item["bytes"]/1_000_000:.2f} MB</small></td>')
        rows.append(f'<tr><th>{escape(label)}</th>{"".join(cells)}</tr>')
    (args.output/'index.html').write_text(
        '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        '<title>Lucky Interiors - Catalog library</title><style>'
        'body{font:16px/1.5 system-ui;color:#193b31;background:#f5f3ed;margin:0;padding:32px}main{max-width:900px;margin:auto}'
        'h1{font:40px Georgia;margin:12px 0}table{width:100%;border-collapse:collapse;background:white}th,td{text-align:left;padding:16px;border-bottom:1px solid #d9dfd8}'
        'small{display:block;color:#59665e;font-size:12px}a{color:#215943}p{max-width:760px}footer{font-size:13px;color:#59665e;margin-top:24px}'
        '@media(max-width:600px){body{padding:16px}th,td{padding:10px;font-size:13px}h1{font-size:30px}}</style><main>'
        '<small>LUCKY INTERIORS FURNITURE / MUMBAI</small><h1>Your catalog library</h1>'
        f'<p>A compact general selection of {manifest["generalHighlights"]} designs, plus 15 category catalogs covering {manifest["categoryProducts"]} products with existing public images.</p>'
        '<p><a href="lucky-interiors-catalog-pack.zip">Download the full catalog pack</a></p>'
        '<table><thead><tr><th>Collection</th><th>WhatsApp</th><th>A4 print</th></tr></thead><tbody>'
        +''.join(rows)+'</tbody></table>'
        '<footer>For A4, print at Actual size / 100%. Image sharpness depends on the original product photograph. '
        'Eight products with remote stock photos are excluded. No private scraper images are included. '
        'Confirm current product specifications and ordering details before ordering.</footer></main></html>',encoding='utf-8')
    zip_path=args.output/'lucky-interiors-catalog-pack.zip'
    with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(args.output.rglob('*')):
            if path.is_file() and path!=zip_path:
                archive.write(path,path.relative_to(args.output))
    print(f'Catalog pack: {zip_path} ({zip_path.stat().st_size:,} bytes)')


if __name__=='__main__':
    main()
