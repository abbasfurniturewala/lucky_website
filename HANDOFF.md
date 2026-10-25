# Lucky Interiors Furniture: Shared Handoff

Updated: 25 October 2026. Read `AGENTS.md`, `PROJECT_CONTEXT.md`, then this file before continuing.

## Approved website release and dev source checkpoint — 25 October 2026

The owner explicitly approved both the GitHub `dev` source push and live Cloudflare publication. The website redesign (including category-name-only H1s) is now published to existing Worker `luckywebsite`, version **7f83db5b-a905-4078-bd07-464a31203d86**, replacing **77a273c6-2483-45e2-a63b-261be3ca2a1f**. Official Wrangler 4.152.0 uploaded 553 changed assets; no configuration, domain, redirect or Google account changes were made. Live URL: `https://luckyinteriorsfurniture.com/collections/sofas`.

This source checkpoint contains the category/card redesign plus the previously published analytics/consent integration and favicon repair, their tests, locked reporting dependency, disabled-by-default `.env.example`, analytics setup documentation and this shared context. These must travel together so another device can build the same website. It targets **dev only**; `main` remains at `5c75da3`. The fetched dev baseline was `90b9719`, with no divergence. Use `git log -1` and compare with `origin/dev` for the resulting source commit; do not treat the old uncommitted-source statements below as the current checkpoint status.

Fresh validation: full production build passed (549 routes plus 404, 550-page claim/crawl/SEO audits, 22 sitemap URLs), all 11 analytics/dashboard tests passed, and the credential-provisioning helper passed syntax parsing without being executed. A credential-pattern scan of the 24 explicit checkpoint files and 1,160 generated public files found no private key/token or private-reporting markers in the public build. Product-data and review-seed hashes still match. Live checks confirm all **16 category HTML files exactly match the checked local build**, clean H1s and unchanged configured local SEO titles/descriptions, matching client/CSS/favicon hashes, home/product/category 200, www root and path/query one-hop 301, trailing-slash 301, missing-page 404, robots/sitemap 200 and 22 sitemap entries. A first check assumed an absolute trailing-slash Location; resolving the valid relative `/collections/sofas` target confirmed the correct one-hop redirect. No redirect code was changed.

Excluded and preserved locally: `.env.local`, reporting keys, CLI credentials, private scraper/transfer archives, runtime review/approval files, generated PDFs/ZIPs, build/dependency/QA outputs, the separate progress reports/checklist, and the pending print-catalog generator/verifier/documentation edits. Those catalog/report changes are not part of this website push. No products were imported and no product facts, public images, rights/SEO approvals, or saved review decisions changed. A receiving device should preserve local work, fetch and fast-forward dev only when safe, run locked dependency installation if needed, and configure its own private analytics credential/environment separately. Git source sync is not automatic conversation sync or a complete device backup.

The older main branch still lacks this analytics/favicon/redesign source. Do not publish a fresh main build without deliberately reconciling the current dev source and obtaining the appropriate production approval. The live private analytics dashboard remains a separate local-only process on port 4175; it was not exposed by this publication.

## Website category/card refresh — 25 October 2026 (local preview only)

Follow-up: the owner asked to remove the SEO-looking "in Mumbai" suffix from the large category headings before any publication. The visible H1 now uses `collection.name` on all 16 category pages (for example, "Sofas", "Beds", "Dining Sets"). Local-search titles/descriptions, canonical URLs, robots directives, structured data, lower-page guides and the confirmed Mumbai business context remain unchanged. No hidden duplicate H1 or search-engine-only text was added. All 16 generated category heads match the preceding preview byte-for-byte after normalizing the changed client-script fingerprint. Extended `scripts/verify-seo-build.mjs` to check a single clean category-name H1 for every collection and preserve configured SEO titles/descriptions. Full build/550-page audits passed again; desktop/mobile browser checks confirm the clean visible heading, retained Mumbai search title and no overflow or console warnings/errors. Proof: `tmp/ui-redesign-2026-10-25/clean-category-heading-desktop.png` and `clean-category-heading-mobile.png`. Preview remains port 4176. **Still not deployed, committed or pushed.** SEO rankings are not guaranteed by metadata or automated checks.

The owner requested a cleaner, more professional website using their Urban Ladder/Pepperfry reference. `src/App.jsx` and `src/styles.css` now use a compact collection heading/count instead of the large image banner, a flat filter/sort strip, and image-led borderless product cards. Repeated card badges/descriptions and the large Enquire/Details button pair are removed from the presentation only. Product photos/names still open details; a discreet, product-specific WhatsApp enquiry link retains the existing analytics event fields. Descriptions remain on product pages. No product facts, prices, catalog records, image rights, SEO approvals, consent settings or external files were changed.

All collections share the new layout; the shared cards also apply to home/search/related products. Four desktop columns, three tablet columns and two phone columns were checked, including 320px width. Phone filters expand/collapse with accessible state; result counts announce filter updates. Price/seating/color filtering, empty results/reset, ascending price sort, product navigation and search were tested. Beds and Dining Sets also passed browser checks. Production-preview console had no warnings/errors, no horizontal page overflow was found, and localhost loaded no Google tag. Existing favicon declarations remain present.

Full `npm run build` passed: 549 public routes plus 404, all 550 rendered-page audits, 22 indexable/sitemap URLs and SEO verification. All 11 analytics/dashboard tests passed; `git diff --check` passed. Added collection/card presentation regression assertions to `scripts/verify-seo-build.mjs`, without relaxing product/SEO checks. Public product-data files, review seed and earlier PDFs retain their prior hashes; no tracked public/data/review changes appeared.

Preview: `http://127.0.0.1:4176/collections/sofas` (local production preview, `vite preview --host 127.0.0.1 --port 4176 --strictPort`). Development server also started on port 5173. These require a running local process and are not public hosting. Desktop/mobile proof: ignored `tmp/ui-redesign-2026-10-25/`. This refresh is **not deployed, committed or pushed**; the production version below is unchanged. Preserve earlier analytics/favicon/catalog work when preparing any separately approved source checkpoint. Suggested next design work: consistent original product photography, a more refined mobile category menu and a matching homepage hero/navigation refresh; do not invent discounts, reviews, stock claims or unavailable product variants.

## Remaining print-style categories completed — 25 October 2026

At the owner's request, generated all **14 remaining nonempty furniture category PDFs**, matching the approved general/sofa editorial print design. New folder: `output/pdf/catalogs-2026-10-25-other-categories-print/`, with PDFs in `print/`, a local `index.html`, manifest/readme and a **39,104,933-byte ZIP**. Coverage: **457 products / 266 pages**. Categories: Beds, Bedroom Sets, Dining Sets, Study Tables, Centre Tables, Recliners, Wardrobes, TV Unit & Cabinets, Bookshelves, Office Furniture, Chairs, Dressing Tables, Outdoor Furniture, Swings. Shoe Racks is empty in public data and was not generated. No unpublished/private scraper products were added. The earlier general/sofa edition is preserved; the full category series now covers all 517 eligible public products across 15 categories, plus the separate 56-design general selection.

Reused the same public export snapshot at `tmp/pdfs/catalog-print-2026-10-25/share-catalog-data.json` and selected all category slugs except sofas with `--mode print`. Adjusted only the generator's local HTML directory text to describe the catalogs and formats actually present in a subset. The PDF layout remains the same A4 landscape style. Full verification passed for all 14 PDFs / 266 rendered pages; all 21 contact sheets and seven higher-resolution feature samples were visually inspected. The ZIP passes integrity checks and contains exact hash-matching copies of all 14 verified PDFs. Thirty-four product source-resolution warnings remain; proof-print before bulk printing.

Hashes confirm the existing general/sofa/legacy PDFs, public product-data files and review seed are unchanged. No website edits/build/deploy, product import, rights/SEO approval changes, commit or push occurred. QA: ignored `tmp/pdfs/catalog-other-print-2026-10-25/`. Output files and current generator/documentation work remain local/uncommitted and need deliberate separate preservation/synchronization for another device. See `CATALOGS_EDITORIAL.md` for the per-category counts and locations.

## Print-style general and sofa catalogs rebuilt — 25 October 2026

The owner opened the older tracked general PDF and requested a less website-like, more physical-catalog design. Using the saved editorial generator and existing public-only exporter, created fresh A4 landscape PDFs in `output/pdf/catalogs-2026-10-25-print/print/`: **general highlights: 56 designs / 32 pages**, **sofas: 60 designs / 33 pages**. Earlier PDFs were not overwritten. The new edition uses large photographs, Bodoni/Baskerville typography, ivory paper, no product cards/buttons, no repeated unknown-specification placeholders, quiet model references and a single closing contact/QR page. Invisible product/reference links remain. Print footers show the brand, with the website address on the contact page only.

Updated `scripts/create-editorial-catalogs.py` with repeatable `--category` and `--mode` selection (default all/both preserved), accurate subset manifests/library counts, print footer/contact refinements and a data-derived edition label. Updated `scripts/verify-editorial-catalogs.py` to validate the exact selected catalog/format combinations, including legacy full manifests, rather than always requiring all 32 outputs. `CATALOGS_EDITORIAL.md` records portable regeneration commands. The source was reused, not replaced with an unrelated catalog system.

Validation passed for both PDFs / all 65 rendered pages: product names, unique stable codes, product and WhatsApp links, no visible link borders/buttons, page numbering/geometry, text/link bounds and missing glyphs. All four all-page contact sheets plus high-resolution cover/product/closing samples were visually inspected. Overwrite-refusal test rejected regeneration into the same directory and kept both PDF hashes unchanged. Hashes confirm the older general/metal-bed PDFs, public product-data files and tracked review seed are unchanged. The source export remains 517 included products / 15 categories / eight exclusions. No private scraper or review-export input was used, no optional facts/prices guessed, no product/rights/SEO decisions changed, and no website build/deploy/commit/push was run for this catalog task.

Some source photos still limit print sharpness: three general-catalog and twelve sofa-catalog product warnings (overlap possible). See the local manifest; proof-print before bulk printing. QA is ignored under `tmp/pdfs/catalog-print-2026-10-25/`. This two-PDF edition is now present locally; the old 74-file full libraries remain a separate transfer/regeneration concern. The PDFs and tool/documentation changes remain local/uncommitted and need intentional preservation/synchronization when switching devices.

## Favicon repair published — 25 October 2026

The owner reported Google's globe icon instead of the company logo and explicitly approved publishing the favicon-only fix. Root cause verified in both generated and live HTML: the icon links in `index.html` were inside `<!--seo-head-start-->` / `<!--seo-head-end-->`, and `scripts/prerender.mjs` replaced that entire block without restoring the icon links. The existing public PNG icons were already accessible and valid (512x512 favicon, 180x180 Apple icon); they were not redrawn, renamed or replaced. `/favicon.ico` was 404, but an ICO is not required when the supported PNG is explicitly declared.

Moved the three static brand-icon links outside the route-specific SEO block, with explicit dimensions. Added regression checks in `scripts/verify-seo-build.mjs` for PNG signature/dimensions and one correct favicon plus Apple icon in every generated HTML head. The new check deliberately failed against the old build before the fix. Full `npm run build` then passed, including all 550 HTML pages, 549 routes, 22 sitemap URLs and unchanged product/approval checks.

Published to existing Cloudflare Worker `luckywebsite` using Wrangler 4.152.0: current production version **77a273c6-2483-45e2-a63b-261be3ca2a1f**, replacing analytics version `cc551871-54bc-4ddb-bcbf-c5b8aed60efc`. Only 550 HTML assets changed; existing JS/CSS/image assets were reused. Analytics client remains `index-a6otuKNi.js`; settings, consent behavior, product/catalog/review data and redirects are unchanged. Live homepage/category/product checks return 200 and the correct icons in initial HTML. Googlebot-Image request returns 200 image/png, exact SHA-256 match to the existing source icon, no X-Robots-Tag block; robots allows crawling. The www redirect still preserves category path/query. Browser inspection confirms the three icon links, no Google tag without consent and no console warnings/errors. Proof: ignored `tmp/favicon-qa/live-company-icon.png`.

Google Search appearance is **pending recrawl/processing**, not guaranteed or immediately verified by deployment. Google's favicon documentation says several days to several weeks may be needed; homepage URL Inspection / Request indexing can be used by the Search Console owner, but no indexing request was submitted here. Keep the favicon URL stable. No Git commit/push was made; this repair and the earlier analytics source still need an intentional reviewed `dev` checkpoint before switching devices or rebuilding older `main`.

## Analytics connected and published on the Hasan device — 24 October 2026

Owner request: live dashboard for Mumbai users, phone/WhatsApp clicks and times. Implemented `analytics-dashboard/` (private Node server, buildless responsive UI, read-only GA4 adapter, caching, sanitized errors, unavailable-data states, Host/Origin protections), `src/AnalyticsConsent.jsx`, consent CSS and a consent-gated bridge in `src/analytics.js`. Existing page/click hooks are preserved, same-route StrictMode views are deduplicated, URL queries/fragments and arbitrary contact/message fields are excluded from Google payloads. Privacy wording is updated for the optional, disabled-by-default feature. Added `npm run analytics`, `npm run verify:analytics-dashboard`, `.env.example` and `ANALYTICS_SETUP.md`. Added official server-only `google-auth-library` 11.3.1 to the lockfile; no existing package versions were upgraded.

The owner created the Google account/property setup in the signed-in in-app browser during this work: account **413364663**, property **560651353**, Web stream **16195448439**, Measurement ID **G-6K61LHQGYE**. Property detail UI confirms India/GMT+05:30 and INR. Enhanced measurement is off following explicit confirmation. The owner subsequently approved connection and publication of the tracking update, Analytics Data API enablement, Viewer-only reporting access, key provisioning/rotation, and the limited Cloudflare CLI authorization.

Google Cloud project **Lucky Interiors Analytics** / `nth-agent-512615-d5` was created with no billing attached by this work, and Analytics Data API enabled. Reporting account `lucky-dashboard-viewer@nth-agent-512615-d5.iam.gserviceaccount.com` has GA4 Viewer + No Cost Metrics + No Revenue Metrics; no Cloud project IAM roles were granted. The unused Google-generated key starting `488c30fe129f` was permanently revoked after its automatic download failed. With explicit approval, a replacement RSA key was generated locally and only its public X.509 certificate uploaded. Registered key starts `66c1b44d3f5c`, expires **24 October 2027**. Private PEM/JSON stay outside Git in `C:/Users/Hasan/Documents/Lucky online business/.private-analytics/`, with NTFS access for Hasan and SYSTEM only. Never publish or paste these files. A second device needs a separately approved credential; credentials are not part of source synchronization.

Ignored `.env.local` now stores the public IDs, `VITE_GA4_ENABLED=true`, `VITE_GA4_ALLOW_LOCAL=false`, `GA4_USE_ADC=false`, and the absolute path to private `ga4-viewer.json`. The same three public VITE settings were saved/verified in the existing Cloudflare Worker's build variables; no reporting key was sent to Cloudflare. `npm run analytics` loads this local file, as does Vite for builds. Templates remain disabled by default. Tracking cannot recover earlier visits/clicks or measure visitors who refuse consent.

Direct publication through official Wrangler **4.152.0** to existing Worker **luckywebsite** succeeded: production version **cc551871-54bc-4ddb-bcbf-c5b8aed60efc**. All storefront assets were retained; the browser uploader's 1000-file limit was handled by using the official CLI, not trimming the site. CLI OAuth is stored encrypted with the key in Windows Credential Manager. Approved scopes: User Read, Account Read, Workers Scripts Write, Background Access; no extra broad scopes were granted. Existing account: `0e3721743fe237d0de4ea366b9b927a2`. No paid service/billing was enabled by this work. The previous production version was `c4e82b68` (historical rollback reference).

Validation: all 11 automated tests passed again (consent, privacy payloads, withdrawal/cross-tab, route duplicates, SSR/localhost, report queries/parsing/caching/error states, HTTP/security/read-only behavior). Full enabled `npm run build` passed: 549 routes plus 404, 550 HTML claim/crawl checks, 22 indexable/sitemap URLs, 525 products and zero new SEO approvals. New bundle `index-a6otuKNi.js` is served live. No private credential/reporting markers appeared in public JS. Live Google Data API responses returned `connected`, no errors, India time zone, and valid all-cities/Mumbai reports. Realtime received one intentional test user, one `phone_click` and one `whatsapp_click` around 21:24 IST, including under Mumbai/India; these are test actions, not customer leads. Browser policy blocked opening the phone handler, but the click event reached Google; no call/message was sent. Standard totals/minute-grouped history were still processing; review again after 24–48 hours. Test fixtures remain confined to tests.

Live browser checks: zero Google tags before consent and after refusal, one correct tag after allowance, zero after withdrawal/reload; console warnings/errors empty. Earlier responsive checks passed at 390 px. Live HTTP checks passed: www root and category/path/query redirect 301 to apex; apex home/category 200; category trailing slash 301; nonexistent path 404; robots/sitemap 200. Proof screenshots are local/ignored under `tmp/analytics-qa/`, including `dashboard-connected.jpg`.

The dashboard is running at `http://127.0.0.1:4175/` and visibly shows **Connected to GA4**, including realtime test clicks. Restart with `npm run analytics` after a device/app restart or configuration change. It is local, not an always-on shared/public URL. Renew its reporting key before 24 October 2027. No product import, catalog/review-state changes, SEO approvals, commits or pushes were made. Current branch `dev` and fetched `origin/dev` remain **90b97196d3e7d22421b0a59121794cd53cb6e06c**; `main`/`origin/main` remain **5c75da3**. Production is the direct Worker version above, NOT an assertion that current GitHub source contains this integration.

All analytics source is still uncommitted on dev, alongside the preserved checklist/report work and private transfer ZIP. Before switching devices or publishing an older branch, obtain an intentional reviewed source checkpoint: **a rebuild of older main can remove the live analytics integration**. Never `git add .`; exclude private archives, credentials, local env and build/QA outputs. The earlier reports/checklist retain their dated historical status and should not be mistaken for the current analytics verification.

## Simplified checklist added on 24 October 2026

The owner requested an easier checklist instead of the detailed reports. `PROGRESS_CHECKLIST.md` and `output/pdf/lucky-interiors-progress-checklist.pdf` provide separate overall and SEO sections, with 12 completed items and 17 unfinished or recurring items. The PDF has interactive checkboxes for unfinished tasks and was rendered and visually checked on both pages. It preserves the status evidence through 23 October; no new live checks were run on 24 October. These files remain local and uncommitted along with the earlier reports. No Word file was delivered because the Word rendering prerequisite is unavailable on this Windows runtime.

## Progress reports added on the Hasan device — 23 October 2026

`PROJECT_PROGRESS_REPORT.md` and `SEO_PROGRESS_REPORT.md` summarize overall and SEO progress. They distinguish fresh checks from earlier build/PDF evidence and pending owner/account work. This reporting task does not commit or push them; transfer requires a later intentional `dev` checkpoint.

On the Hasan device, local `dev` and live GitHub `dev` were confirmed at `90b97196d3e7d22421b0a59121794cd53cb6e06c`; live GitHub `main` remains `5c75da3`. Source and shared context synchronized on 22 October. The complete archive is at `C:\Users\Hasan\Documents\Lucky online business\web scraper\data\betterhomeindia` (948 products, 1,252 images / 1,256 files). The 74 October catalog outputs are still absent here. The seed has the same 670 decisions and no runtime review-state file exists here. The earlier local JSX fix is backed up in a stash and is already included in `dev`.

Fresh 23 October checks passed: product/policy/analytics verification, claims/crawl/SEO audits of the existing 22 October build, public redirect/status samples, 22 live sitemap URLs, robots, and initial metadata on homepage/category/product samples. The www-to-apex redirect is now directly reverified, not only historical. The exact deployed commit and Google account outcomes remain unverified. Local ports 5173 and 4174 were stopped when checked; start the website/dashboard for a new session. See the two reports for evidence boundaries and next actions. The sections below retain the furni device's original 22 October checkpoint record; their references to "this device" describe that source device.

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
