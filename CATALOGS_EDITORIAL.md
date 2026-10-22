# Editorial catalog edition

Updated: 19 October 2026.

This edition responds to the owner's request for a substantial visual redesign and removal of repeated WhatsApp/View Product buttons. It is the current catalog design; all earlier PDFs remain preserved.

## Open the library

`output/pdf/catalogs-2026-10-editorial/index.html`

The complete ZIP is `lucky-interiors-editorial-catalog-pack.zip` in the same folder. There are 32 PDFs: general highlights plus 15 category catalogs, each in print and WhatsApp formats. General selection: 56 designs. Full category coverage: 517 existing public products. The eight remote-stock-image exclusions and empty Shoe Racks category remain unchanged.

## Design

- A4 landscape print pages: an asymmetric photographic cover, a large opening feature in category editions, then two products per page. The general catalog has an internally linked directory. The print highlights catalog is 32 pages; the sofa print catalog is 33 pages.
- WhatsApp: 420 x 700 pt portrait, one product per page; 59 pages for the compact 56-product highlights edition, 62 for the 60-product sofa category.
- Bodoni display type, Baskerville product names, Corbel navigation, warm ivory paper, charcoal and muted bronze accents. Windows font files are embedded in the PDFs when available; PDF base fonts are the fallback.
- No product cards, enquiry buttons, visible link borders or repeated product disclaimers. Full photographs retain their proportions without cropping furniture.
- Tap a photograph or product name to open its existing product page. Tap the small reference to open its prefilled WhatsApp enquiry. Prominent contact details and QR appear only on the closing page.
- The general sofa highlights are deliberately selected from existing staged/clear photographs for a more coherent presentation. Full category catalogs retain all eligible records; public data and product codes are unchanged.

Larger photography means more pages and larger WhatsApp files than the earlier grid edition. The original image resolution remains a print limitation; `manifest.json` lists photos with effective resolution below 150 dpi. No AI-generated products, private scraper photographs, guessed specifications or reference prices are introduced.

## Generate a fresh edition

From the repository root:

```powershell
node scripts/export-share-catalog.mjs
python scripts/create-editorial-catalogs.py --output output/pdf/catalogs-editorial-next
```

Choose a Python interpreter with Pillow and ReportLab. The verified bundled interpreter is:

```powershell
& 'C:\Users\furni\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' scripts/create-editorial-catalogs.py --output output/pdf/catalogs-editorial-next
```

The generator refuses to overwrite an existing directory. `--data` selects the public export, `--cache` selects a temporary image cache, and `--category sofas` generates only that category for design review. Default image cache: `tmp/pdfs/editorial-image-cache`. The public-only exporter retains all SEO/image-evidence restrictions; `BETTERHOME_SOURCE` is not needed.

## Verification

```powershell
python scripts/verify-editorial-catalogs.py --output output/pdf/catalogs-editorial-next
```

Requires pypdf, pdfplumber, Pillow, ReportLab and Poppler `pdftoppm`. It checks full product names, stable references, every product/WhatsApp URL, zero visible link borders/buttons, pagination, page geometry and text/link bounds, then renders every page and creates contact sheets under `tmp/pdfs/editorial-qa`.

The current 32 PDFs passed those checks and all 937 pages were raster-rendered. Covers, the directory, opening features, paired products, long names, small categories and closing pages were visually inspected. Verification results are included in `verification.json` in the library and ZIP. Print at A4 landscape, 100% / Actual size.

Earlier generation tools and `CATALOGS.md` describe the preserved 18 October grid edition. They remain available for history. The private legacy metal-bed workflow is unchanged and must not be used to publish scraper images or unverified facts. Website code, product data, reviews, public images and dependency lock are unchanged by the redesign. Source/documentation checkpoints may synchronize through `dev` when requested. Production pushes/merges/deployment require separate explicit authorization.
