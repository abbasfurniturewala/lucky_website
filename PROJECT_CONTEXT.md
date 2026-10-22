# Lucky Interiors Furniture Project Context

Updated: 22 October 2026. Read `AGENTS.md`, this document, then `HANDOFF.md` when continuing the project.

## Shared Development Workflow (22 October 2026)

Development checkpoints synchronize through `dev`. `main` is production; pushing it triggers the recorded Cloudflare deployment workflow. This first checkpoint is authorized for source/documentation on `dev` only. Do not push/merge into `main` or run deployment commands without a separate explicit owner request. Read and update `HANDOFF.md` before changing devices.

At checkpoint preparation, local `main` and fetched `origin/main` both pointed to `5c75da381085d496c2f2e0e379a0cb40fc193521`; no `dev` existed, so `dev` was created from that unchanged base retaining all working files. The separate `cloudflare/workers-autoconfig` branch was not merged. The other device confirmed the same JSX fix, no substantive roadmap change, and an equivalent 670-decision seed after LF/CRLF normalization.

Generated catalog libraries are **local-only** for this checkpoint: 74 files / 64 PDFs / two ZIP packs plus library metadata. `CATALOG_OUTPUT_INVENTORY.tsv` records every repository-relative path, byte size and SHA-256. These output files are deliberately excluded from the commit. On another device, transfer them separately or regenerate into a new directory; a checkout alone will not contain these editions. Review state and the private source archive also require separate preservation.

This device currently has 948 private source products and 1,251 images under the active Documents path. The missing 50,160-byte image is present in the old OneDrive source path and the preserved transfer ZIP; its hash matches the ZIP entry. No archive files were restored or moved for the checkpoint. The other device reports a complete 948-product / 1,252-image archive. Always set `BETTERHOME_SOURCE` to that device's actual private source root; never commit scraper images/archives.

Checkpoint validation on 22 October 2026 passed: full production build (549 routes plus 404 / 22 sitemap URLs), Vite main-module smoke check, public-only export, both complete PDF generators and verification of 64 PDFs / 1,445 pages, and overwrite-refusal checks. All 702 protected project files remained byte-identical. Full commands/results and the next-device checklist are in `HANDOFF.md`. Earlier recovery/redesign no-push statements below describe those historical sessions; the current owner request authorizes this development checkpoint on `dev`, not production publication.

## Current Catalog Edition: Editorial Redesign (19 October 2026)

The owner requested a substantial improvement in style and explicitly rejected the repeated WhatsApp/View Product controls. The new default catalog design is in `output/pdf/catalogs-2026-10-editorial/index.html`; full ZIP: `lucky-interiors-editorial-catalog-pack.zip` in that folder. The earlier grid edition and both original PDFs are preserved.

- 32 PDFs: general highlights plus 15 categories, each in print and WhatsApp formats. Category coverage remains 517 public products; the general selection remains 56, with sofa highlights curated from clear staged public photographs. No product data or stable references changed.
- Print is now A4 landscape: an asymmetric photo-led cover, a large opening feature in each category edition, then two products per page. WhatsApp is portrait, one product per page. Larger photography trades increased page counts/file sizes for presentation: general print 32 pages; general WhatsApp 59 pages; sofa print 33 pages; sofa WhatsApp 62 pages.
- Bodoni headings, Baskerville product names, Corbel navigation, warm ivory/charcoal/bronze palette. No product cards, CTA buttons, visible link borders or repeated product disclaimers. Product photos/names link invisibly to product pages; discreet references link to prefilled WhatsApp enquiries. Contact information/QR are prominent only on the closing page.
- All 32 PDFs passed full name/reference/link/pagination/geometry checks, zero-button/border checks and raster rendering of all 937 pages. Complete covers, directory, feature/paired pages, long names, small categories and contact pages were visually inspected. Verification is included in the library/ZIP. Existing source photography still limits print quality; the manifest records resolution warnings.
- New tools: `scripts/create-editorial-catalogs.py` and `scripts/verify-editorial-catalogs.py`; instructions in `CATALOGS_EDITORIAL.md`. Both reuse the existing public-only export and bundled PDF dependencies; Windows Bodoni/Baskerville/Corbel fonts are embedded when available, with base-font fallbacks.
- New generation: `node scripts/export-share-catalog.mjs`, then `python scripts/create-editorial-catalogs.py --output output/pdf/catalogs-editorial-next`. Verification: `python scripts/verify-editorial-catalogs.py --output output/pdf/catalogs-editorial-next`. Existing output directories are refused. Print A4 landscape at 100% / Actual size.
- The redesign did not change website code, public assets, product/category data, review state, approvals, dependency manifests/lock, private archives or Git history. No push/deployment was performed. The older catalog section below describes the preserved 18 October edition, not the current design.


## Project and Verified Local Paths

Lucky Interiors Furniture is a Mumbai furniture catalog and WhatsApp/phone/email enquiry website, without checkout.

- Working repository: `C:\Users\furni\Documents\lucky website`
- Private scraper source: `C:\Users\furni\Documents\web scraper\data\betterhomeindia`
- Separate private transfer archive: `C:\Users\furni\Documents\Lucky Interiors transfer\betterhomeindia-transfer-20260721-1541.zip`
- Domain configured in code: `https://luckyinteriorsfurniture.com`
- Origin configured in Git: `https://github.com/abbasfurniturewala/lucky_website.git`
- Development branch: `dev`; production branch: `main`. This checkpoint starts from `5c75da3` (21 July 2026, portable handoff/supporting files).
- Customer-facing name in code: `Lucky Interiors Furniture`.
- Enquiry email/phone recorded in code: `hello@luckyinteriorsfurniture.com`, `+91 96195 78893`.

The former `C:\Users\furni\OneDrive\Documents\lucky website` checkout path is obsolete. The old OneDrive scraper path is not the active archive, but retains the single missing image noted in the handoff. Continue in the existing checkout; a fresh clone does not preserve ignored review state or external dependencies.

The old chat's Bad Request/systemError is historical context, not evidence of source corruption. Recovery reused the current code. The local Git tree was clean before recovery; neither current remote deployment nor remote branch state was queried. Do not push or deploy unless the owner requests it. Pushing `main` is documented as a deployment trigger. Use `dev` for shared development checkpoints.

## Architecture and Dependencies

| Part | Files |
| --- | --- |
| Frontend/routing | `src/App.jsx`, `src/main.jsx`, `src/styles.css` |
| Prerender/SSR | `src/entry-server.jsx`, `scripts/prerender.mjs` |
| Public product data | `src/data/products.js`, `src/data/importedProducts.js` |
| Business/categories/domain | `src/data/catalog.js`, `src/data/site.js` |
| Product/rights/schema policy | `src/data/product-seo-policy.js`, `src/data/image-rights-policy.js`, `src/data/product-schema.js` |
| Private review UI/API | `review-dashboard/` |
| Import workflow | `scripts/import-approved-products.mjs`, `import-review/` |
| SEO generation/audits | `generate-seo.mjs`, `scripts/verify-*.mjs`, `scripts/audit-*.mjs` |
| Cloudflare static assets | `wrangler.jsonc`, `public/_headers`, `public/_redirects` |
| Current PDF tools | `scripts/export-share-catalog.mjs`, `scripts/create-share-catalogs.py`, `CATALOGS.md` |

Installed packages match the lockfile: React and React DOM **19.2.6**, Vite **7.3.3**, `@vitejs/plugin-react` **5.2.0**, `lucide-react` **0.555.0**. Verified runtime: Node **22.19.0**, npm **11.5.2**. Vite/plugin require Node `^20.19.0 || >=22.12.0`. No dependencies were upgraded or reinstalled during recovery; preserve `package-lock.json`. If packages are actually missing/broken, use `npm ci` to restore the lockfile, rather than regenerating it with an upgrade.

PDF generation uses Python, Pillow and ReportLab, separate from npm dependencies. Verified bundled Python environment: Pillow **12.3.0**, ReportLab **4.4.9**, pypdf **6.10.0**; pdfplumber and Poppler `pdftoppm` were also available for QA. The bundled interpreter used here is:

```text
C:\Users\furni\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe
```

`python` on PATH may refer to a different interpreter. Use one with Pillow/ReportLab installed. The PDF generator embeds Segoe UI/Georgia from Windows when available and falls back to PDF base fonts elsewhere. Source images limit print sharpness; the generator never invents higher resolution.

## Commands From the Existing Repository

```powershell
Set-Location -LiteralPath 'C:\Users\furni\Documents\lucky website'
$env:BETTERHOME_SOURCE = 'C:\Users\furni\Documents\web scraper\data\betterhomeindia'
npm run dev
```

Development: `http://127.0.0.1:5173/` (Vite may choose another port if occupied).

```powershell
npm run build
npm run preview -- --port 4176
```

Production preview: `http://127.0.0.1:4176/`. The build runs product-policy, quality and analytics checks, regenerates SEO files, builds client/SSR output, prerenders routes, then checks rendered claims, links, metadata, schema, sitemap and 404 output. `dist/` and `dist-server/` are generated/ignored.

In a separate terminal, set the source variable again before the dashboard:

```powershell
$env:BETTERHOME_SOURCE = 'C:\Users\furni\Documents\web scraper\data\betterhomeindia'
npm run review
```

Review dashboard: `http://127.0.0.1:4174/`. It binds to loopback. The dashboard and importer now share a project-relative fallback of `../web scraper/data/betterhomeindia`; the environment override remains preferred. No automatic `.env` loading is implemented.

Do not run `npm run import:approved` as a recovery/startup check: it changes public data, images and review state. Run it only for an intentionally reviewed import batch, then build and preview.

## Recovery Verification on 18 October 2026

- Fixed the actual development startup error: an invalid trailing comma after the parenthesized `<StrictMode>` expression in `src/main.jsx`. Babel rejected the original with `Unexpected token (12:0)` and returned a 500 for the main module; the production bundler had accepted it. A successful build alone did not establish development health.
- Browser checks after the fix passed for development homepage/category/product navigation and WhatsApp links, production-preview homepage/category, and the review dashboard. No JavaScript page exceptions or horizontal overflow at 390 px width were observed. The checks used temporary ports 5187 (dev), 4178 (review), and 4176 (preview) and stopped their own servers afterward.
- Review bootstrap read 948 source records. Only GET endpoints were used; no review/export/import actions were performed.
- Full production build passed: **525** active products, **549** prerendered public routes plus `404.html`, **550** HTML files passing claims/crawl checks, **22** indexable pages/sitemap URLs, **0** SEO-approved products.
- Quality backlog verified: **350** missing recommended dimensions, **192** missing recommended material values, **9** short descriptions, **525** without verified offers/availability. These did not fail the build.
- All 525 current products remain `legacy-unverified` for image rights; none was marked confirmed by recovery.
- SHA-256 preservation checks cover the original public assets, product/category data, package lock, three review files, original PDFs, extracted source archive and transfer ZIP.

Historical statements in `SEO_SIMPLE_ROADMAP.md` (such as the older `bfde3d3` commit and uncommitted July SEO batch) and the other July SEO reports are snapshots, not current Git/deployment evidence. This context takes precedence for the verified local state. Hosting account configuration, Cloudflare redirects and live deployment remain unverified in this recovery.

## Review State and Private Archives: Preserve Separately

- Tracked review seed: `import-review/review-state.seed.json`.
- Ignored runtime decisions: `import-review/review-state.json`.
- Ignored exported approvals: `import-review/approved-products.json`.
- Runtime and seed were byte-identical at recovery start: **670 stored decisions** = 245 imported, 423 rejected, 2 approved. The pending approved records are `alpha-2-door-wardrobe` and `aura-2-door-wardrobe`, both `seoStatus: review`.
- The dashboard derives additional statuses by matching current public products; its displayed totals are not the raw stored-decision counts. Do not rewrite state merely to reconcile these totals.
- If runtime state is absent, the dashboard loads the seed and writes runtime state on the first edit. Do not replace the seed without an explicit owner request to save a newer checkpoint.
- Extracted private archive verified: **948 records**, **1,255 files**, **79,770,602 bytes**.
- Transfer ZIP verified: **70,556,225 bytes**, **1,256 file entries**, SHA-256 `4816A7F7B3EA7AB231B9BB4FC5864E0E9A451F9DDD37C8E116FB87A473350B15`.
- The ZIP retains one 50,160-byte image missing from the extracted folder (a 321-character Eeezy-Go baby-chair path). Preserve both; no restoration or source-archive changes were made. Long-path handling remains a possible explanation, not an established cause.
- Private scraper files are reference material with unconfirmed image rights. Never publish them automatically or include them in public/catalog exports. Public legacy images remain unverified; reusing an existing public asset does not establish rights.

When transferring this project, preserve the whole folder including `.git`, public assets, product data, scripts, ignored review decisions/approval exports, context and `output/pdf`. Keep the external extracted archive and transfer ZIP separately and privately. A Git clone alone is incomplete. Generated `node_modules`, `dist`, `dist-server`, `.wrangler`, logs and `tmp/` can be recreated.

## Product, SEO and Business Policies

- Catalog import approval is separate from SEO approval. Do not mass-approve, import pending records for recovery, or treat an import as SEO evidence.
- SEO approval requires a clear name, valid category, unique customer-facing description of at least 80 characters, usable image, descriptive primary-image alt text, manually checked details, and no unsupported claims.
- Exact dimensions, material/finish, current price, availability and color are recommended. Unknown values stay omitted; do not invent them.
- Existing legacy image-rights review is recommended and non-blocking for SEO, but `legacy-unverified` is not permission. Future products default to `pending` and require confirmed image rights and an internal source/licence/permission note before SEO approval.
- Product schema is gated by SEO approval. Offer requires `offerVerified: true` and a positive maintained price; availability requires its own verified recognized value. Unknown availability is never `InStock` by default. Internal image-rights notes/status must not appear in public schema or catalog output.
- Do not strengthen supplier, rating, warranty, stock, delivery, installation, customization, origin, address, hours or legal-name claims without evidence. Exact legal name, public postal address/postcode, visit model, maintained hours and detailed operational policies remain owner-confirmation work.
- No GA4/GTM vendor is connected. Owner must choose one and approve privacy/consent before activation.

Detailed policy/evidence documents: `SEO_OWNER_CHECKLIST.md`, `SEO_IMPLEMENTATION_STATUS.md`, `SEO_BUSINESS_CONFIRMATION.md`, `SEO_EXTERNAL_ACTIONS.md`, `SEO_SIMPLE_ROADMAP.md`, `SEO_AUDIT_2026-07-11.md`, `CLOUDFLARE_SEO_SETUP.md`. Preserve their policies while treating dated completion claims as historical.

## Earlier Grid Catalog Edition (18 October 2026)

Owner preference confirmed in this chat: **compact general highlights plus full category catalogs**, with separate WhatsApp and printing layouts.

- New library: `output/pdf/catalogs-2026-10/index.html`.
- Full downloadable pack: `output/pdf/catalogs-2026-10/lucky-interiors-catalog-pack.zip`.
- **32 PDFs**: general highlights plus 15 nonempty categories, each in `whatsapp/` and `print/`.
- General: **56 selected highlights**. Categories: **517** public products with local images. **8** products with remote stock photos are explicitly excluded and listed in `manifest.json`; Shoe Racks has no products. No deduplication removes catalog records from the category exports.
- Phone format: 420 x 700 pt, two products per page, compressed images. Print: A4, four products per page, white backgrounds, embedded fonts where available, image resolution up to 300 dpi without upscaling.
- Both use uncropped photos, full names, stable ID-derived codes, product/WhatsApp links, contact QR codes and an internally linked general directory. Only verified optional specs/prices may be exported; none are currently verified.
- `manifest.json` records exclusions, code-to-product mappings, counts, sizes and low-resolution print warnings. Do not claim print masters are available for low-resolution originals.
- All 32 PDFs were checked for product names/codes, link targets, page counts, page/text/link bounds and raster rendering. Representative complete pages and contact sheets were visually inspected.
- Existing `output/pdf/lucky-interiors-whatsapp-catalog.pdf` (**18 pages**, 3,153,633 bytes) and `lucky-interiors-metal-beds-catalog.pdf` (**7 pages**, 1,279,800 bytes) were inspected and preserved without replacement.
- Legacy tools remain: `scripts/export-catalog-data.mjs`, `scripts/create-product-catalog.py`, `scripts/create-metal-beds-catalog.py`. The old general generator is a four-products-per-category layout and does not safely paginate larger exports. The old metal-bed script reads private scraper images/reference prices; do not use it to create distributable catalogs. No metal-bed products currently exist in the public bed category, so no new metal-bed catalog was generated.

Reproduction commands and format/dependency notes are in `CATALOGS.md`. The new generator refuses to overwrite an existing output directory; choose a new edition path when regenerating. Catalog creation does not change SEO/review decisions or add files to the public website.

## Hosting and Outstanding Work

`wrangler.jsonc` configures Worker/static assets named `luckywebsite`, `./dist`, `html_handling: drop-trailing-slash`, and `not_found_handling: 404-page`. It does **not** configure an SPA fallback. The recorded Cloudflare flow uses `npm run build`, output `dist`, and `npx wrangler deploy`; actual hosting account/deployment settings were not checked. Vite preview does not prove Cloudflare's HTTP status/redirect behavior.

Next work:

1. Owner review of the new catalog library and representative physical print; replace/verify legacy photos and obtain better masters where needed. Add the eight omitted products only after suitable existing public product photography is available. Metal-bed expansion needs an intentional review/import/rights decision, not automatic scraper export.
2. Review products in manageable batches, initially Sofas, Beds, Dining Sets, Wardrobes and Centre Tables. Fill verified optional facts over time and approve only records that pass policy.
3. Confirm business identity, exact public address/postcode, visit model, hours and maintained service/offer policies.
4. Investigate the one missing long-path archive image only if needed; retain the ZIP.
5. When the owner explicitly requests publication, review changes, build, then handle Git/Cloudflare separately. Verify live 200/301/404 responses, deployment version, www-to-apex redirect and sitemap; then Search Console actions. No push or deployment is authorized by recovery/catalog creation.
6. Choose analytics/consent, verify Google Business Profile eligibility, add original photography and pursue the existing external SEO actions after the relevant facts/accounts are available.

Do not commit `tmp/`, generated build folders, logs, `.env`, or private scraper/transfer archives. No commits, pushes or deployments were made during this recovery.
