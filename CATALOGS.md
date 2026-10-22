# Furniture catalog tools

**Current design:** See `CATALOGS_EDITORIAL.md` and `output/pdf/catalogs-2026-10-editorial/index.html`. The document below preserves the 18 October grid edition and its commands.

The owner selected compact general highlights plus full category catalogs, each in WhatsApp and printing formats. The new tools export existing public storefront products only, without changing reviews, SEO approval, images or product data.

## Current edition

Open `output/pdf/catalogs-2026-10/index.html`, or unzip `lucky-interiors-catalog-pack.zip` in that directory and open the included index.

- 32 PDFs: general highlights + 15 categories, in two formats.
- General: 56 selected designs, up to four per category, distributed across the named range while avoiding repeated source photographs.
- Categories: 517 public products with existing local public images. Eight remote-stock-image products are omitted and listed in `manifest.json`; no private source images are fetched or copied. Empty Shoe Racks and unpublished metal beds have no new catalog.
- WhatsApp: 420 x 700 pt portrait, two products per page, compressed images, direct WhatsApp/product links.
- Printing: A4, four products per page, white backgrounds; print at Actual size / 100%. Embedded Windows fonts when available; existing originals are kept up to 300 dpi without upscaling. Review `lowResolutionImages` in the manifest for source limitations.
- Images preserve full proportions with no crop. The general directory has internal navigation, and contact pages have WhatsApp QR, telephone and email links.
- Codes are `LI-` plus the first eight hexadecimal characters of the SHA-256 of the public product ID; generation rejects collisions. They stay stable across format, ordering and general/category selection. They intentionally differ from the old PDF's sequence codes. WhatsApp messages include the name and canonical product URL.
- Only checked, policy-compliant optional specifications and separately verified prices are exported. Current records contain no verified details/offers, so those facts remain omitted. Do not infer specifications from images or use reference scraper prices.

## Generate a new edition

From the repository root, first export:

```powershell
node scripts/export-share-catalog.mjs
```

This writes `tmp/pdfs/share-catalog-data.json`. It imports the normalized storefront product data, checks that image paths resolve inside `public/`, and records exclusions. It never reads the scraper archive or review export. It requires Node but no additional npm packages.

Future public products that lack confirmed image rights and an internal source note are also excluded. Legacy reuse never changes the recorded rights status.

Then generate using Python with Pillow and ReportLab:

```powershell
python scripts/create-share-catalogs.py --output output/pdf/catalogs-next-edition
```

The generator **refuses an existing output directory** to preserve previous catalogs. Choose a new directory for each edition. Defaults are `tmp/pdfs/share-catalog-data.json` for input, `tmp/pdfs/share-catalog-images` for its content/format/geometry-aware image cache, and `output/pdf/catalogs-2026-10` for output. Optional `--data`, `--output`, and `--cache` arguments accept other paths. The default output now exists; explicitly select a new edition.

Bundled Python used during recovery:

```powershell
& 'C:\Users\furni\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' scripts/create-share-catalogs.py --output output/pdf/catalogs-next-edition
```

Verified Pillow 12.3.0 and ReportLab 4.4.9. No npm dependency or lockfile changes are needed. `BETTERHOME_SOURCE` is unnecessary for these tools. For relocation/staging, the exporter supports `CATALOG_PROJECT_ROOT` and `CATALOG_DATA_PATH` environment overrides; normal use needs neither.

## Review before distributing

Every generated PDF must be reopened and checked for correct product names/codes, product and WhatsApp links, page counts/footer numbers, text/link bounds, readable fonts and complete photographs. Render it with Poppler and visually inspect cover, directory, product pages, odd final pages and contact page. Current edition: every page of all 32 PDFs was raster-rendered, with automated content/link/bounds checks and visual contact-sheet/layout review.

Example rendering:

```powershell
pdftoppm -scale-to 1400 -png output/pdf/catalogs-next-edition/print/lucky-interiors-general-highlights-print.pdf tmp/pdfs/general-print
```

Automated content/link/bounds verification plus all-page rendering and contact sheets (requires pypdf, pdfplumber, Pillow, ReportLab and Poppler):

```powershell
python scripts/verify-share-catalogs.py --output output/pdf/catalogs-next-edition
```

Inspect the resulting PNGs/contact sheets under `tmp/pdfs/catalog-qa`. This verification command writes only QA files, not the PDFs or review state. Generation stops for names/specification text that cannot fit safely; adjust the layout instead of silently clipping facts.

The local recovery QA results are saved in `output/pdf/catalogs-2026-10/verification.json`. The pack also includes the manifest and library index. Check image sharpness with a physical print; compression/embedding cannot improve a low-resolution original.

## Preserved older tools and artifacts

The original `output/pdf/lucky-interiors-whatsapp-catalog.pdf` and `lucky-interiors-metal-beds-catalog.pdf` remain untouched.

`scripts/export-catalog-data.mjs` defaults to four products per category; the paired `scripts/create-product-catalog.py` assumes one four-card page per category. Raising the export limit does not safely paginate the old generator. Its crop/cache behavior is also superseded by the new tools.

`scripts/create-metal-beds-catalog.py` reads private scraper images, descriptions and reference prices directly. Its existing 10-model PDF is retained as local reference. Do not use that script to produce a distributable category catalog under the current image-rights and product-fact policies. Add metal-bed products only through a separately authorized evidence-based review/import workflow.
