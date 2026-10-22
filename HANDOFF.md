# Lucky Interiors Furniture: Shared Handoff

Updated: 22 October 2026. Read `AGENTS.md`, `PROJECT_CONTEXT.md`, then this file before continuing.

## Branch and device workflow

**Synchronize development through `dev`. `main` is production; pushing it triggers the recorded Cloudflare deployment workflow.** This is the first source/documentation checkpoint on `dev`, based on `5c75da381085d496c2f2e0e379a0cb40fc193521`. Use `git log -1 --oneline` / `git rev-parse HEAD` to identify the checkpoint containing this handoff; do not infer the current version from a dated chat.

At preparation, fetched `origin/main` had not advanced and `dev` did not exist. `dev` was created from the existing main checkout without discarding its local changes. The separate `cloudflare/workers-autoconfig` branch was inspected but not merged. No main push/merge or deployment command belongs to this checkpoint.

Before changing devices:

1. Update this handoff with completed work, unresolved decisions, current validation and any changed source/archive/review paths or counts.
2. Inspect Git status and the exact source changes. Stage explicit reviewed files only; never use `git add .` or `git add -A` for a checkpoint with local outputs/review data present.
3. Build/check the relevant work, commit on `dev`, then push `dev`. Do not force-push or move `main` as part of synchronization.
4. Preserve ignored review files, private source archives and local-only catalogs separately. A source commit is not a complete device backup.

On the receiving device, inspect and preserve its local work first, then `git fetch origin` and compare local branches with `origin/dev`. Create a tracking dev branch if absent, or fast-forward an existing dev only after checking local changes/divergence. Do not blindly pull/reset over local edits. Read this handoff again after synchronization and set that device's actual external source path. Use the locked dependencies; `npm ci` is for restoring missing/broken packages, not upgrading them.

## Completed source changes

- Removed the invalid comma after the parenthesized `<StrictMode>` expression in `src/main.jsx`. It caused a Vite/Babel development 500 even though the production bundler had accepted it. The other device confirmed its identical fix.
- Changed the importer fallback from the obsolete hardcoded OneDrive location to `../web scraper/data/betterhomeindia` relative to the repository. `BETTERHOME_SOURCE` still overrides it. The importer was syntax-checked, not executed.
- Updated recovery/context/readme and catalog documentation, preserving the approval, image-evidence and unverified-fact policies.
- Added the public-only catalog exporter, grid/editorial generators and their verification tools. The grid verifier now uses `importlib.util` instead of the deprecated `SourceFileLoader.load_module` API.
- Added `CATALOG_OUTPUT_INVENTORY.tsv`: paths, byte sizes and SHA-256 hashes for the 74 generated output files retained only on this device.
- The other device confirmed no substantive `SEO_SIMPLE_ROADMAP.md` change from main. It is not part of this checkpoint; its dated workflow statements remain historical.

## Validation for this checkpoint

Verified on 22 October 2026:

- `npm run build`: passed product policy/quality/analytics checks, client/SSR builds, 549 prerendered routes plus `404.html`, rendered-claim/crawl audits of 550 HTML files, and SEO verification for 22 sitemap URLs. Catalog remains 525 products / zero SEO approvals. Missing optional facts were reported rather than fabricated.
- JavaScript syntax: exporter and importer passed `node --check`. The importer was never executed. All four Python catalog tools compiled successfully.
- Fresh public-only export: 517 included products / 15 categories / eight exclusions; local public image containment, unique stable references and omission of unverified optional facts checked.
- Both complete generators ran into fresh ignored `tmp` directories: 32 grid PDFs (508 pages) and 32 editorial PDFs (937 pages). Full verification/raster rendering passed for all 64 PDFs / 1,445 pages. Both overwrite-refusal tests passed by rejecting a second generation into the same directory; those nonzero exits were intentional negative checks.
- Vite development smoke check: `src/main.jsx` transformed successfully and returned HTTP 200 on a temporary loopback server at port 5189. That server was stopped afterward.
- SHA-256 checks confirmed 702 protected project files unchanged, including public/source/product data, review state, dependency manifests/lock and all existing catalog outputs. Source/documentation credential-pattern scan found no matches; machine-specific examples and font fallbacks were reviewed.
- Runtime used: Node v22.19.0, Python 3.12.14, Pillow 12.3.0, ReportLab 4.4.9, pypdf 6.10.0, pdfplumber 0.11.9; bundled Poppler rendered the QA pages. No JavaScript dependencies were upgraded or reinstalled.


The exporter/catalog checks ran with `BETTERHOME_SOURCE` pointing to an intentionally absent private-source directory. They still succeeded using only existing public storefront data/images: 525 active records, 15 nonempty eligible categories, 517 included products and eight remote-stock-image exclusions. No optional specifications/prices were invented. No importer, review mutation/export endpoint or deployment was executed.

Validation command examples, from the repository root:

```powershell
npm run build
node --check scripts/import-approved-products.mjs
node --check scripts/export-share-catalog.mjs
node scripts/export-share-catalog.mjs
python -B scripts/create-share-catalogs.py --output tmp/catalog-check-grid
python -B scripts/verify-share-catalogs.py --output tmp/catalog-check-grid --qa tmp/catalog-check-grid-qa
python -B scripts/create-editorial-catalogs.py --output tmp/catalog-check-editorial
python -B scripts/verify-editorial-catalogs.py --output tmp/catalog-check-editorial --qa tmp/catalog-check-editorial-qa
```

Choose new output/QA directories on each validation run; the generators refuse to overwrite an existing edition. Current checkpoint logs and generated test artifacts are ignored under `tmp/checkpoint-2026-10-22/`. They are not included in Git. The checked-in PDF verification tools require pypdf, pdfplumber, Pillow, ReportLab and Poppler `pdftoppm`; generation needs Pillow/ReportLab. Use an interpreter with those dependencies. `python` on PATH may differ from the bundled interpreter used here.

The Python tools derive repository paths from their location and accept input/output/cache options; the exporter also supports `CATALOG_PROJECT_ROOT` and `CATALOG_DATA_PATH`. Optional Windows fonts under `C:/Windows/Fonts` have PDF base-font fallbacks. Exact typography can differ when fonts are absent on another device; inspect regenerated PDFs rather than assuming pixel-identical output.

## External private archive and device paths

Set the source explicitly in each process that needs it; no automatic `.env` loading is implemented:

```powershell
$env:BETTERHOME_SOURCE = '<actual private betterhomeindia root on this device>'
npm run review
```

This device (path examples are not portable configuration):

- Repository: `C:\Users\furni\Documents\lucky website`.
- Active private source: `C:\Users\furni\Documents\web scraper\data\betterhomeindia`: 948 products, 1,251 image files / 1,255 total files.
- Old source root: `C:\Users\furni\OneDrive\Documents\web scraper\data\betterhomeindia` is not a complete archive. It holds the missing 50,160-byte baby-chair image; its hash matches the preserved ZIP entry. Do not configure the dashboard to this partial folder.
- Preserve the private transfer ZIP: `C:\Users\furni\Documents\Lucky Interiors transfer\betterhomeindia-transfer-20260721-1541.zip` (70,556,225 bytes). Earlier verified SHA-256: `4816A7F7B3EA7AB231B9BB4FC5864E0E9A451F9DDD37C8E116FB87A473350B15`.
- Bundled Python used for validation: `C:\Users\furni\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`. Generic `python` commands above are preferred once that device's interpreter is selected.

The other device reports a complete archive of 948 products and 1,252 images. Its absolute root was not supplied; confirm it there and set `BETTERHOME_SOURCE` accordingly. This device's one-image restoration remains pending; no archive files were moved/restored during the checkpoint. Keep scraper files and the ZIP outside Git. They contain private reference material with unconfirmed rights; do not publish or automatically copy images from them.

## Review-state checkpoint behavior

Both this device's runtime state and tracked seed were rechecked before staging: **670 decisions = 245 imported + 423 rejected + two approved**. JSON `updatedAt`: `2026-07-19T18:43:16.552Z`. They remain byte-identical here; raw SHA-256 `dc61afb6283b8967b70db8624d360269ec1e3481a60b917602dc7d704380f129`, LF-normalized SHA-256 `dc61afb6283b8967b70db8624d360269ec1e3481a60b917602dc7d704380f129`. The two pending catalog approvals are `alpha-2-door-wardrobe` and `aura-2-door-wardrobe` (SEO still under review). Neither review file is changed or staged by this checkpoint.

`import-review/review-state.seed.json` is tracked. Runtime `import-review/review-state.json` and `import-review/approved-products.json` are ignored and must be preserved separately. If runtime state is absent, the dashboard starts from the seed and creates runtime state on the first saved edit. Never overwrite a device's newer runtime decisions with the seed merely to synchronize source. Compare record contents/timestamps, not just decision counts. Normalize LF/CRLF only for comparison; this checkpoint did not replace or normalize either review file.

The owner confirmed that the other device's seed matches after LF/CRLF normalization, with the same counts. This source checkpoint does not refresh the tracked seed. Save a newer shared review checkpoint only after intentional review and explicit owner instruction. Catalog import approval remains separate from SEO approval; the two approved wardrobes are still `seoStatus: review` and were not imported for synchronization.

## Catalog outputs retained only on this device

`CATALOG_OUTPUT_INVENTORY.tsv` lists all **74 files, 308,718,079 bytes**: 64 PDFs, two ZIP packs and eight library/manifest/verification text files across:

- `output/pdf/catalogs-2026-10/`: 18 October grid edition, 37 files.
- `output/pdf/catalogs-2026-10-editorial/`: 19 October editorial edition, 37 files; current preferred design.

The inventory itself is committed; **none of those 74 outputs is committed** in this checkpoint. The new device will not find these indexes/PDFs simply by checking out dev. Transfer them separately and check their sizes/hashes, or regenerate a new edition with `CATALOGS.md` / `CATALOGS_EDITORIAL.md`. Generated manifest data may carry timestamps, so a fresh edition need not be byte-identical to the original.

The editorial design uses A4 landscape spreads and one product per WhatsApp page, large photography, Bodoni/Baskerville/Corbel where available, and no repeated product buttons. Photos/names link to public product pages; small references link to WhatsApp. General selection: 56 designs; full category coverage: 517 public products. Stable ID-derived references are shared across editions. Source resolution still limits print sharpness; inspect the resolution warnings and a physical print.

Both older tracked PDFs at `output/pdf/lucky-interiors-whatsapp-catalog.pdf` and `output/pdf/lucky-interiors-metal-beds-catalog.pdf` remain preserved. The legacy metal-bed generator reads private scraper images/reference prices and is unsuitable for distributable output under current policy. New metal-bed work requires an intentional review/import/image-rights decision.

## Remaining work and decisions

1. Receiving device: synchronize the reviewed source checkpoint through dev, read/update this handoff, preserve local ignored state and configure its complete private archive path.
2. Decide whether to transfer the 74 local catalog outputs or regenerate separately. Owner review of the editorial design and representative prints remains useful; replace poor-resolution/legacy photographs with verified masters as available.
3. Restore this device's single missing archive image only through a separate careful action, retaining the original archive and ZIP.
4. Continue evidence-based product/SEO review in small batches. Existing 525 products remain legacy-unverified for image rights and unapproved for SEO; never mass-approve or guess specifications, prices, availability, warranty, delivery, origin or other facts. Future products require confirmed image evidence before SEO approval.
5. Confirm outstanding business identity/address/hours/service policies and analytics/consent before adding stronger public claims or vendors.
6. Production publication is separate. The owner reported a successful earlier www-to-apex redirect check; that is historical, not a live recheck for this checkpoint. Do not merge/push main or deploy without a new explicit request.

Before the next device switch, update this file and record fresh validation; do not leave a dated chat as the only account of the current work.
