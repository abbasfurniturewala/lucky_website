from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageOps
from reportlab.graphics.barcode import qr
from reportlab.graphics.shapes import Drawing
from reportlab.lib.colors import Color, HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen.canvas import Canvas
from reportlab.graphics import renderPDF


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = PROJECT_ROOT / "tmp" / "pdfs" / "catalog-data.json"
TEMP_DIRECTORY = PROJECT_ROOT / "tmp" / "pdfs" / "catalog-images"
OUTPUT_DIRECTORY = PROJECT_ROOT / "output" / "pdf"
OUTPUT_PATH = OUTPUT_DIRECTORY / "lucky-interiors-whatsapp-catalog.pdf"

PAGE_WIDTH, PAGE_HEIGHT = A4
MARGIN = 32
INK = HexColor("#17201C")
FOREST = HexColor("#215943")
FOREST_DARK = HexColor("#173F31")
CLAY = HexColor("#93613F")
MUTED = HexColor("#66706C")
LINE = HexColor("#D9DEDB")
PAPER = HexColor("#F7F7F4")
SOFT_GREEN = HexColor("#EAF2ED")
WHITE = white


def wrap_text(text: str, font: str, size: float, max_width: float, max_lines: int) -> list[str]:
    words = re.sub(r"\s+", " ", str(text or "")).strip().split(" ")
    lines: list[str] = []
    current = ""

    for word in words:
        candidate = f"{current} {word}".strip()
        if stringWidth(candidate, font, size) <= max_width:
            current = candidate
            continue

        if current:
            lines.append(current)
        current = word
        if len(lines) == max_lines:
            break

    if current and len(lines) < max_lines:
        lines.append(current)

    if len(lines) == max_lines and words:
        original = " ".join(words)
        visible = " ".join(lines)
        if len(visible) < len(original):
            final = lines[-1]
            while final and stringWidth(f"{final}...", font, size) > max_width:
                final = final[:-1].rstrip()
            lines[-1] = f"{final}..."

    return lines


def draw_lines(
    canvas: Canvas,
    lines: Iterable[str],
    x: float,
    y: float,
    font: str,
    size: float,
    color: Color,
    leading: float,
) -> float:
    canvas.setFont(font, size)
    canvas.setFillColor(color)
    current_y = y
    for line in lines:
        canvas.drawString(x, current_y, line)
        current_y -= leading
    return current_y


def prepare_image(source_path: str, cache_key: str, width: int = 900, height: int = 650) -> Path:
    destination = TEMP_DIRECTORY / f"{cache_key}.jpg"
    if destination.exists():
        return destination

    with Image.open(source_path) as image:
        image = ImageOps.exif_transpose(image).convert("RGB")
        fitted = ImageOps.fit(image, (width, height), method=Image.Resampling.LANCZOS)
        fitted.save(destination, "JPEG", quality=76, optimize=True, progressive=True)
    return destination


def draw_page_footer(canvas: Canvas, page_number: int, total_pages: int, website: str) -> None:
    canvas.setStrokeColor(LINE)
    canvas.line(MARGIN, 25, PAGE_WIDTH - MARGIN, 25)
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(MARGIN, 13, website.replace("https://", ""))
    canvas.drawRightString(PAGE_WIDTH - MARGIN, 13, f"{page_number} / {total_pages}")


def draw_cover(canvas: Canvas, data: dict, page_number: int, total_pages: int) -> None:
    business = data["business"]
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, stroke=0, fill=1)

    canvas.setFillColor(FOREST_DARK)
    canvas.rect(0, PAGE_HEIGHT - 250, PAGE_WIDTH, 250, stroke=0, fill=1)

    logo_path = business.get("logoPath")
    if logo_path and Path(logo_path).exists():
        canvas.drawImage(ImageReader(logo_path), MARGIN, PAGE_HEIGHT - 103, width=180, height=101, preserveAspectRatio=True, mask="auto")

    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica-Bold", 30)
    canvas.drawString(MARGIN, PAGE_HEIGHT - 155, "Furniture for Mumbai homes")
    canvas.setFont("Helvetica", 13)
    canvas.setFillColor(HexColor("#DDE8E2"))
    canvas.drawString(MARGIN, PAGE_HEIGHT - 181, "Selected product catalog - browse, shortlist, and enquire")

    cover_products = []
    for category in data["categories"]:
        if category["products"]:
            cover_products.append(category["products"][0])
        if len(cover_products) == 4:
            break

    image_y = 308
    gap = 10
    image_width = (PAGE_WIDTH - (2 * MARGIN) - gap) / 2
    image_height = 145
    for index, product in enumerate(cover_products):
        row, column = divmod(index, 2)
        x = MARGIN + column * (image_width + gap)
        y = image_y - row * (image_height + gap)
        image_path = prepare_image(product["imagePath"], f"cover-{index}")
        canvas.drawImage(ImageReader(image_path), x, y, width=image_width, height=image_height, mask="auto")

    canvas.setFillColor(WHITE)
    canvas.roundRect(MARGIN, 74, PAGE_WIDTH - (2 * MARGIN), 76, 5, stroke=0, fill=1)
    canvas.setFillColor(INK)
    canvas.setFont("Helvetica-Bold", 11)
    canvas.drawString(MARGIN + 16, 123, "How to order")
    canvas.setFont("Helvetica", 9.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(MARGIN + 16, 105, "Share the product code or page link by WhatsApp, email, or phone.")
    canvas.drawString(MARGIN + 16, 89, "Confirm current price, dimensions, material, finish, availability, and delivery details.")

    draw_page_footer(canvas, page_number, total_pages, business["website"])


def draw_index(canvas: Canvas, data: dict, page_number: int, total_pages: int) -> None:
    business = data["business"]
    canvas.setFillColor(WHITE)
    canvas.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, stroke=0, fill=1)
    canvas.setFillColor(FOREST)
    canvas.rect(0, PAGE_HEIGHT - 98, PAGE_WIDTH, 98, stroke=0, fill=1)
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica-Bold", 24)
    canvas.drawString(MARGIN, PAGE_HEIGHT - 58, "Catalog index")
    canvas.setFont("Helvetica", 10)
    canvas.drawString(MARGIN, PAGE_HEIGHT - 77, "Tap a product page link in the catalog for its latest online information.")

    y = PAGE_HEIGHT - 130
    start_category_page = 3
    for index, category in enumerate(data["categories"]):
        page = start_category_page + index
        canvas.setFillColor(SOFT_GREEN if index % 2 == 0 else PAPER)
        canvas.roundRect(MARGIN, y - 30, PAGE_WIDTH - 2 * MARGIN, 38, 4, stroke=0, fill=1)
        canvas.setFillColor(INK)
        canvas.setFont("Helvetica-Bold", 10.5)
        canvas.drawString(MARGIN + 12, y - 9, category["name"])
        canvas.setFont("Helvetica", 8.5)
        canvas.setFillColor(MUTED)
        canvas.drawString(MARGIN + 12, y - 23, f"{len(category['products'])} selected products")
        canvas.setFont("Helvetica-Bold", 10)
        canvas.setFillColor(FOREST)
        canvas.drawRightString(PAGE_WIDTH - MARGIN - 12, y - 15, str(page))
        y -= 44

    draw_page_footer(canvas, page_number, total_pages, business["website"])


def draw_product_card(canvas: Canvas, product: dict, x: float, y: float, width: float, height: float, image_key: str) -> None:
    canvas.setFillColor(WHITE)
    canvas.setStrokeColor(LINE)
    canvas.roundRect(x, y, width, height, 5, stroke=1, fill=1)

    inner = 10
    image_height = 142
    image_path = prepare_image(product["imagePath"], image_key)
    canvas.drawImage(
        ImageReader(image_path),
        x + inner,
        y + height - image_height - inner,
        width=width - 2 * inner,
        height=image_height,
        mask="auto",
    )

    text_x = x + inner
    text_width = width - 2 * inner
    current_y = y + height - image_height - 25
    name_lines = wrap_text(product["name"], "Helvetica-Bold", 10.2, text_width, 2)
    current_y = draw_lines(canvas, name_lines, text_x, current_y, "Helvetica-Bold", 10.2, INK, 12) - 2

    canvas.setFont("Helvetica-Bold", 7.5)
    canvas.setFillColor(CLAY)
    canvas.drawString(text_x, current_y, f"CODE: {product['code']}")
    current_y -= 14

    description_lines = wrap_text(product["description"], "Helvetica", 8.1, text_width, 3)
    current_y = draw_lines(canvas, description_lines, text_x, current_y, "Helvetica", 8.1, MUTED, 10) - 3

    material_lines = wrap_text(f"Material: {product['material']}", "Helvetica", 7.7, text_width, 2)
    current_y = draw_lines(canvas, material_lines, text_x, current_y, "Helvetica", 7.7, INK, 9) - 2

    dimension_lines = wrap_text(f"Size: {product['dimensions']}", "Helvetica", 7.7, text_width, 2)
    draw_lines(canvas, dimension_lines, text_x, current_y, "Helvetica", 7.7, INK, 9)

    button_y = y + 10
    canvas.setFillColor(FOREST)
    canvas.roundRect(text_x, button_y, text_width, 24, 4, stroke=0, fill=1)
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica-Bold", 8)
    canvas.drawCentredString(x + width / 2, button_y + 8.5, "VIEW PRODUCT / ENQUIRE")
    canvas.linkURL(product["websiteUrl"], (text_x, button_y, text_x + text_width, button_y + 24), relative=0)


def draw_category(canvas: Canvas, data: dict, category: dict, page_number: int, total_pages: int) -> None:
    business = data["business"]
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, stroke=0, fill=1)
    canvas.setFillColor(FOREST_DARK)
    canvas.rect(0, PAGE_HEIGHT - 104, PAGE_WIDTH, 104, stroke=0, fill=1)
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica-Bold", 22)
    canvas.drawString(MARGIN, PAGE_HEIGHT - 55, category["name"])
    description = wrap_text(category["description"], "Helvetica", 9.5, PAGE_WIDTH - 2 * MARGIN, 2)
    draw_lines(canvas, description, MARGIN, PAGE_HEIGHT - 77, "Helvetica", 9.5, HexColor("#DDE8E2"), 11)

    gap = 12
    card_width = (PAGE_WIDTH - 2 * MARGIN - gap) / 2
    card_height = 326
    top_y = PAGE_HEIGHT - 120 - card_height
    for index, product in enumerate(category["products"]):
        row, column = divmod(index, 2)
        x = MARGIN + column * (card_width + gap)
        y = top_y - row * (card_height + gap)
        draw_product_card(canvas, product, x, y, card_width, card_height, f"{category['slug']}-{index}")

    draw_page_footer(canvas, page_number, total_pages, business["website"])


def draw_contact(canvas: Canvas, data: dict, page_number: int, total_pages: int) -> None:
    business = data["business"]
    whatsapp_url = f"https://wa.me/{business['whatsappNumber']}?text=Hello%20Lucky%20Interiors%2C%20I%20am%20viewing%20your%20product%20catalog."

    canvas.setFillColor(FOREST_DARK)
    canvas.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, stroke=0, fill=1)
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica-Bold", 28)
    canvas.drawString(MARGIN, PAGE_HEIGHT - 92, "Ready to shortlist?")
    canvas.setFont("Helvetica", 12)
    canvas.setFillColor(HexColor("#DDE8E2"))
    canvas.drawString(MARGIN, PAGE_HEIGHT - 120, "Send us the product code, screenshot, or page link.")

    panel_y = 260
    canvas.setFillColor(WHITE)
    canvas.roundRect(MARGIN, panel_y, PAGE_WIDTH - 2 * MARGIN, 360, 8, stroke=0, fill=1)

    canvas.setFillColor(INK)
    canvas.setFont("Helvetica-Bold", 17)
    canvas.drawString(MARGIN + 24, panel_y + 315, business["name"])
    canvas.setFont("Helvetica", 10.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(MARGIN + 24, panel_y + 285, f"WhatsApp / Call: {business['phoneDisplay']}")
    canvas.drawString(MARGIN + 24, panel_y + 263, f"Email: {business['email']}")
    canvas.drawString(MARGIN + 24, panel_y + 241, business["website"])

    qr_widget = qr.QrCodeWidget(whatsapp_url)
    bounds = qr_widget.getBounds()
    qr_size = 150
    drawing = Drawing(qr_size, qr_size, transform=[qr_size / (bounds[2] - bounds[0]), 0, 0, qr_size / (bounds[3] - bounds[1]), 0, 0])
    drawing.add(qr_widget)
    renderPDF.draw(drawing, canvas, PAGE_WIDTH - MARGIN - qr_size - 24, panel_y + 150)

    canvas.setFillColor(FOREST)
    canvas.roundRect(MARGIN + 24, panel_y + 155, 240, 42, 5, stroke=0, fill=1)
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica-Bold", 11)
    canvas.drawCentredString(MARGIN + 144, panel_y + 170, "OPEN WHATSAPP")
    canvas.linkURL(whatsapp_url, (MARGIN + 24, panel_y + 155, MARGIN + 264, panel_y + 197), relative=0)

    disclaimer = (
        "Catalog images and details are provided for product identification and shortlisting. "
        "Please confirm the current price, dimensions, material, finish, availability, included items, "
        "delivery, and assembly information before placing an order."
    )
    disclaimer_lines = wrap_text(disclaimer, "Helvetica", 8.5, PAGE_WIDTH - 2 * MARGIN - 48, 5)
    draw_lines(canvas, disclaimer_lines, MARGIN + 24, panel_y + 105, "Helvetica", 8.5, MUTED, 11)

    canvas.setFillColor(HexColor("#DDE8E2"))
    canvas.setFont("Helvetica", 9)
    canvas.drawString(MARGIN, 100, "Thank you for browsing Lucky Interiors Furniture.")
    draw_page_footer(canvas, page_number, total_pages, business["website"])


def main() -> None:
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    TEMP_DIRECTORY.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIRECTORY.mkdir(parents=True, exist_ok=True)

    total_pages = len(data["categories"]) + 3
    canvas = Canvas(str(OUTPUT_PATH), pagesize=A4, pageCompression=1)
    canvas.setTitle(data["title"])
    canvas.setAuthor(data["business"]["name"])
    canvas.setSubject("Selected furniture product catalog for customer enquiries")
    canvas.setCreator("Lucky Interiors Furniture")

    page_number = 1
    draw_cover(canvas, data, page_number, total_pages)
    canvas.showPage()
    page_number += 1

    draw_index(canvas, data, page_number, total_pages)
    canvas.showPage()
    page_number += 1

    for category in data["categories"]:
        draw_category(canvas, data, category, page_number, total_pages)
        canvas.showPage()
        page_number += 1

    draw_contact(canvas, data, page_number, total_pages)
    canvas.save()
    print(f"Catalog PDF: {OUTPUT_PATH}")
    print(f"Pages: {total_pages}")
    print(f"Size: {OUTPUT_PATH.stat().st_size} bytes")


if __name__ == "__main__":
    main()
