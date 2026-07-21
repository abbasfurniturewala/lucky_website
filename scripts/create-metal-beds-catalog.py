from __future__ import annotations

import json
import os
import re
from pathlib import Path
from urllib.parse import quote

from PIL import Image, ImageOps
from reportlab.graphics import renderPDF
from reportlab.graphics.barcode import qr
from reportlab.graphics.shapes import Drawing
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen.canvas import Canvas


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = Path(
    os.environ.get("BETTERHOME_SOURCE")
    or PROJECT_ROOT.parent / "web scraper" / "data" / "betterhomeindia"
)
SOURCE_DATA = SOURCE_ROOT / "products.json"
BUSINESS_DATA = PROJECT_ROOT / "tmp" / "pdfs" / "catalog-data.json"
TEMP_DIRECTORY = PROJECT_ROOT / "tmp" / "pdfs" / "metal-bed-images"
OUTPUT_DIRECTORY = PROJECT_ROOT / "output" / "pdf"
OUTPUT_PATH = OUTPUT_DIRECTORY / "lucky-interiors-metal-beds-catalog.pdf"

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


def ascii_text(value: object) -> str:
    text = str(value or "")
    replacements = {
        "\u2013": "-",
        "\u2014": "-",
        "\u2018": "'",
        "\u2019": "'",
        "\u201c": '"',
        "\u201d": '"',
        "\u2033": " in",
        "\u20b9": "Rs ",
    }
    for source, replacement in replacements.items():
        text = text.replace(source, replacement)
    return re.sub(r"\s+", " ", text).strip().encode("ascii", "ignore").decode("ascii")


def wrap_text(text: str, font: str, size: float, max_width: float, max_lines: int) -> list[str]:
    words = ascii_text(text).split()
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
    if len(lines) == max_lines and len(" ".join(lines)) < len(" ".join(words)):
        final = lines[-1]
        while final and stringWidth(f"{final}...", font, size) > max_width:
            final = final[:-1].rstrip()
        lines[-1] = f"{final}..."
    return lines


def draw_lines(canvas: Canvas, lines: list[str], x: float, y: float, font: str, size: float, color, leading: float) -> float:
    canvas.setFont(font, size)
    canvas.setFillColor(color)
    for line in lines:
        canvas.drawString(x, y, line)
        y -= leading
    return y


def prepare_image(source_path: Path, cache_key: str, width: int = 900, height: int = 600) -> Path:
    destination = TEMP_DIRECTORY / f"{cache_key}.jpg"
    if destination.exists():
        return destination
    with Image.open(source_path) as image:
        image = ImageOps.exif_transpose(image).convert("RGB")
        background = Image.new("RGB", (width, height), "white")
        image.thumbnail((width, height), Image.Resampling.LANCZOS)
        x = (width - image.width) // 2
        y = (height - image.height) // 2
        background.paste(image, (x, y))
        background.save(destination, "JPEG", quality=78, optimize=True, progressive=True)
    return destination


def footer(canvas: Canvas, page_number: int, total_pages: int, website: str) -> None:
    canvas.setStrokeColor(LINE)
    canvas.line(MARGIN, 25, PAGE_WIDTH - MARGIN, 25)
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(MARGIN, 13, website.replace("https://", ""))
    canvas.drawRightString(PAGE_WIDTH - MARGIN, 13, f"{page_number} / {total_pages}")


def product_specs(product: dict) -> list[str]:
    preferred = (
        "Material:",
        "Color:",
        "Size:",
        "Dimensions (Open):",
        "Dimensions:",
        "Height:",
        "Folded Thickness:",
        "Coating:",
        "Max Load Capacity:",
    )
    details = [ascii_text(detail) for detail in product.get("details", [])]
    selected: list[str] = []
    for prefix in preferred:
        match = next((detail for detail in details if detail.lower().startswith(prefix.lower())), None)
        if match and match not in selected:
            selected.append(match)
        if len(selected) == 5:
            break
    if not selected:
        selected = ["Metal foldable bed", "Confirm dimensions and load capacity"]
    return selected


def load_data() -> tuple[dict, list[dict]]:
    business = json.loads(BUSINESS_DATA.read_text(encoding="utf-8"))["business"]
    products = json.loads(SOURCE_DATA.read_text(encoding="utf-8"))
    metal_beds = [product for product in products if product.get("category") == "Foldable Bed & Chair"]
    metal_beds.sort(key=lambda item: (-float(item.get("priceCurrentValue") or 0), ascii_text(item.get("name"))))
    for index, product in enumerate(metal_beds, start=1):
        product["catalogCode"] = f"LI-MBD-{index:03d}"
        product["catalogName"] = ascii_text(product.get("name"))
        product["catalogDescription"] = ascii_text(product.get("description"))
        product["catalogSpecs"] = product_specs(product)
        product["catalogImages"] = [SOURCE_ROOT / path for path in product.get("localImages", [])]
        product["catalogPrice"] = f"Rs {float(product.get('priceCurrentValue') or 0):,.0f}"
    return business, metal_beds


def whatsapp_url(business: dict, product: dict | None = None) -> str:
    if product:
        message = f"Hello Lucky Interiors, I am interested in {product['catalogCode']} - {product['catalogName']}. Please confirm the current price and details."
    else:
        message = "Hello Lucky Interiors, I am viewing your metal beds catalog and would like more information."
    return f"https://wa.me/{business['whatsappNumber']}?text={quote(message)}"


def draw_cover(canvas: Canvas, business: dict, products: list[dict], total_pages: int) -> None:
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, stroke=0, fill=1)
    canvas.setFillColor(FOREST_DARK)
    canvas.rect(0, PAGE_HEIGHT - 265, PAGE_WIDTH, 265, stroke=0, fill=1)

    logo_path = business.get("logoPath")
    if logo_path and Path(logo_path).exists():
        canvas.drawImage(ImageReader(logo_path), MARGIN, PAGE_HEIGHT - 102, width=165, height=92, preserveAspectRatio=True, mask="auto")

    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica-Bold", 31)
    canvas.drawString(MARGIN, PAGE_HEIGHT - 158, "Foldable Metal Beds")
    canvas.setFont("Helvetica", 13)
    canvas.setFillColor(HexColor("#DDE8E2"))
    canvas.drawString(MARGIN, PAGE_HEIGHT - 185, "Space-saving sleeping solutions for homes and guest rooms")
    canvas.setFont("Helvetica-Bold", 10)
    canvas.drawString(MARGIN, PAGE_HEIGHT - 215, f"{len(products)} selected models | Mumbai enquiries")

    gap = 10
    image_width = (PAGE_WIDTH - 2 * MARGIN - gap) / 2
    image_height = 152
    for index, product in enumerate(products[:4]):
        row, column = divmod(index, 2)
        x = MARGIN + column * (image_width + gap)
        y = 326 - row * (image_height + gap)
        source = product["catalogImages"][0]
        image_path = prepare_image(source, f"cover-metal-{index}")
        canvas.drawImage(ImageReader(image_path), x, y, width=image_width, height=image_height)

    canvas.setFillColor(WHITE)
    canvas.roundRect(MARGIN, 75, PAGE_WIDTH - 2 * MARGIN, 82, 5, stroke=0, fill=1)
    canvas.setFillColor(INK)
    canvas.setFont("Helvetica-Bold", 11)
    canvas.drawString(MARGIN + 16, 129, "How to enquire")
    canvas.setFont("Helvetica", 9.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(MARGIN + 16, 108, "Share the product code on WhatsApp or call Lucky Interiors.")
    canvas.drawString(MARGIN + 16, 91, "Please confirm current price, dimensions, availability, delivery, and assembly.")
    footer(canvas, 1, total_pages, business["website"])


def draw_product_card(canvas: Canvas, business: dict, product: dict, y: float, card_index: int) -> None:
    x = MARGIN
    width = PAGE_WIDTH - 2 * MARGIN
    height = 327
    canvas.setFillColor(WHITE)
    canvas.setStrokeColor(LINE)
    canvas.roundRect(x, y, width, height, 6, stroke=1, fill=1)

    inner = 10
    gap = 8
    image_width = (width - 2 * inner - gap) / 2
    image_height = 132
    for image_index, source in enumerate(product["catalogImages"][:2]):
        prepared = prepare_image(source, f"metal-{product['id']}-{image_index}")
        image_x = x + inner + image_index * (image_width + gap)
        canvas.drawImage(ImageReader(prepared), image_x, y + height - image_height - inner, width=image_width, height=image_height)

    text_x = x + inner
    text_width = width - 2 * inner
    current_y = y + height - image_height - 27
    current_y = draw_lines(canvas, wrap_text(product["catalogName"], "Helvetica-Bold", 11.2, text_width, 2), text_x, current_y, "Helvetica-Bold", 11.2, INK, 13) - 1

    canvas.setFont("Helvetica-Bold", 8)
    canvas.setFillColor(CLAY)
    canvas.drawString(text_x, current_y, f"CODE: {product['catalogCode']}")
    canvas.setFillColor(FOREST)
    canvas.drawRightString(x + width - inner, current_y, f"REFERENCE PRICE: {product['catalogPrice']}")
    current_y -= 15

    description = wrap_text(product["catalogDescription"], "Helvetica", 8.2, text_width, 2)
    current_y = draw_lines(canvas, description, text_x, current_y, "Helvetica", 8.2, MUTED, 10) - 2

    specs = product["catalogSpecs"][:5]
    columns = 2
    spec_width = (text_width - 10) / columns
    for spec_index, spec in enumerate(specs):
        row, column = divmod(spec_index, columns)
        spec_x = text_x + column * (spec_width + 10)
        spec_y = current_y - row * 12
        lines = wrap_text(f"- {spec}", "Helvetica", 7.7, spec_width, 1)
        draw_lines(canvas, lines, spec_x, spec_y, "Helvetica", 7.7, INK, 9)

    button_y = y + 10
    button_width = 225
    canvas.setFillColor(FOREST)
    canvas.roundRect(text_x, button_y, button_width, 25, 4, stroke=0, fill=1)
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica-Bold", 8.3)
    canvas.drawCentredString(text_x + button_width / 2, button_y + 8.8, "ENQUIRE ON WHATSAPP")
    canvas.linkURL(whatsapp_url(business, product), (text_x, button_y, text_x + button_width, button_y + 25), relative=0)

    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(x + width - inner, button_y + 9, "Price and specifications require confirmation")


def draw_products_page(canvas: Canvas, business: dict, products: list[dict], page_number: int, total_pages: int) -> None:
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, stroke=0, fill=1)
    canvas.setFillColor(FOREST_DARK)
    canvas.rect(0, PAGE_HEIGHT - 92, PAGE_WIDTH, 92, stroke=0, fill=1)
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica-Bold", 22)
    canvas.drawString(MARGIN, PAGE_HEIGHT - 52, "Metal bed collection")
    canvas.setFont("Helvetica", 9.5)
    canvas.setFillColor(HexColor("#DDE8E2"))
    canvas.drawString(MARGIN, PAGE_HEIGHT - 72, "Foldable designs for compact storage and flexible everyday use")

    draw_product_card(canvas, business, products[0], 397, 0)
    if len(products) > 1:
        draw_product_card(canvas, business, products[1], 56, 1)
    footer(canvas, page_number, total_pages, business["website"])


def draw_contact(canvas: Canvas, business: dict, total_pages: int) -> None:
    url = whatsapp_url(business)
    canvas.setFillColor(FOREST_DARK)
    canvas.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, stroke=0, fill=1)
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica-Bold", 28)
    canvas.drawString(MARGIN, PAGE_HEIGHT - 92, "Need help choosing?")
    canvas.setFont("Helvetica", 12)
    canvas.setFillColor(HexColor("#DDE8E2"))
    canvas.drawString(MARGIN, PAGE_HEIGHT - 120, "Send the product code or a screenshot for current details.")

    panel_y = 250
    canvas.setFillColor(WHITE)
    canvas.roundRect(MARGIN, panel_y, PAGE_WIDTH - 2 * MARGIN, 365, 8, stroke=0, fill=1)
    canvas.setFillColor(INK)
    canvas.setFont("Helvetica-Bold", 17)
    canvas.drawString(MARGIN + 24, panel_y + 315, business["name"])
    canvas.setFont("Helvetica", 10.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(MARGIN + 24, panel_y + 285, f"WhatsApp / Call: {business['phoneDisplay']}")
    canvas.drawString(MARGIN + 24, panel_y + 263, f"Email: {business['email']}")
    canvas.drawString(MARGIN + 24, panel_y + 241, business["website"])

    widget = qr.QrCodeWidget(url)
    bounds = widget.getBounds()
    size = 150
    drawing = Drawing(size, size, transform=[size / (bounds[2] - bounds[0]), 0, 0, size / (bounds[3] - bounds[1]), 0, 0])
    drawing.add(widget)
    renderPDF.draw(drawing, canvas, PAGE_WIDTH - MARGIN - size - 24, panel_y + 150)

    canvas.setFillColor(FOREST)
    canvas.roundRect(MARGIN + 24, panel_y + 155, 240, 42, 5, stroke=0, fill=1)
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica-Bold", 11)
    canvas.drawCentredString(MARGIN + 144, panel_y + 170, "OPEN WHATSAPP")
    canvas.linkURL(url, (MARGIN + 24, panel_y + 155, MARGIN + 264, panel_y + 197), relative=0)

    disclaimer = (
        "This is a shortlisting catalog prepared from products awaiting final website review. "
        "Images, reference prices, dimensions, load capacity, finish, availability, delivery, warranty, and assembly details must be confirmed before ordering."
    )
    draw_lines(canvas, wrap_text(disclaimer, "Helvetica", 8.5, PAGE_WIDTH - 2 * MARGIN - 48, 5), MARGIN + 24, panel_y + 105, "Helvetica", 8.5, MUTED, 11)
    footer(canvas, total_pages, total_pages, business["website"])


def main() -> None:
    business, products = load_data()
    if not products:
        raise RuntimeError("No foldable metal beds were found in the source data.")
    missing_images = [str(path) for product in products for path in product["catalogImages"][:2] if not path.exists()]
    if missing_images:
        raise FileNotFoundError(f"Missing product images: {missing_images[:3]}")

    TEMP_DIRECTORY.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIRECTORY.mkdir(parents=True, exist_ok=True)
    product_pages = (len(products) + 1) // 2
    total_pages = product_pages + 2

    canvas = Canvas(str(OUTPUT_PATH), pagesize=A4, pageCompression=1)
    canvas.setTitle("Lucky Interiors - Foldable Metal Beds Catalog")
    canvas.setAuthor(business["name"])
    canvas.setSubject("Foldable metal beds product catalog for customer enquiries")
    canvas.setCreator("Lucky Interiors Furniture")

    draw_cover(canvas, business, products, total_pages)
    canvas.showPage()
    for page_index in range(product_pages):
        start = page_index * 2
        draw_products_page(canvas, business, products[start:start + 2], page_index + 2, total_pages)
        canvas.showPage()
    draw_contact(canvas, business, total_pages)
    canvas.save()
    print(f"Metal beds catalog: {OUTPUT_PATH}")
    print(f"Products: {len(products)}")
    print(f"Pages: {total_pages}")
    print(f"Size: {OUTPUT_PATH.stat().st_size} bytes")


if __name__ == "__main__":
    main()
