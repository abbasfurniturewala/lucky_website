# Lucky Interiors Furniture

Existing React/Vite furniture catalog and enquiry website for Mumbai, with WhatsApp/phone/email enquiries, product search/filtering, prerendered SEO pages and a private local product-review dashboard.

Read `AGENTS.md`, `PROJECT_CONTEXT.md` and `HANDOFF.md` before editing. Synchronize development through `dev`; `main` is production. Update the handoff before switching devices. The latter records the verified local paths, exact installed dependency versions, current build results, policies and outstanding work.

## Local development

```powershell
Set-Location -LiteralPath 'C:\Users\furni\Documents\lucky website'
npm run dev
```

Usually `http://127.0.0.1:5173/`. Node must satisfy Vite's `^20.19.0 || >=22.12.0` requirement; Node 22.19.0 was verified. Existing installed packages match `package-lock.json`. Use `npm ci` only when restoring missing/broken dependencies; preserve the lockfile and avoid incidental upgrades.

```powershell
npm run build
npm run preview -- --port 4176
```

Build runs product/policy/analytics checks, SEO generation, client and server builds, prerendering, rendered-claims/crawl audits and SEO verification. `dist/` and `dist-server/` are generated and ignored. Vite preview is a local visual check, not verification of Cloudflare redirects/status handling.

## Product review and import

```powershell
$env:BETTERHOME_SOURCE = 'C:\Users\furni\Documents\web scraper\data\betterhomeindia'
npm run review
```

Open `http://127.0.0.1:4174/`. The dashboard/importer default source is `../web scraper/data/betterhomeindia` relative to the project; the explicit override is preferred. There is no automatic `.env` loading.

Preserve `import-review/review-state.json`, `review-state.seed.json` and `approved-products.json`. Runtime state and exports are ignored by Git; a clone does not preserve them. Keep the external source and transfer ZIP separately and privately.

Review products individually. Export an intentionally reviewed batch, then run `npm run import:approved` and `npm run build`. The importer can add new approved products or update existing imported records; it mutates public images/data and runtime review state. Do not run it as a startup test. Import approval and SEO approval are separate.

## Catalogs

The 74 generated catalog files are local-only for the first checkpoint; `CATALOG_OUTPUT_INVENTORY.tsv` records their paths, sizes and hashes. They are not included in a new checkout. Transfer them separately or regenerate a fresh edition using the commands in the catalog documentation.

Open `output/pdf/catalogs-2026-10-editorial/index.html` for the current editorial general highlights and 15 category catalogs: A4 landscape spreads and individual WhatsApp product pages, without repeated buttons. See `CATALOGS_EDITORIAL.md` for generation and QA commands. The earlier grid edition remains in `output/pdf/catalogs-2026-10/`. The original PDFs and tools are preserved; the old metal-bed generator uses private scraper images and reference prices and is unsuitable for distributable output under the current policy.

## Data and SEO policies

- `src/data/catalog.js`: business/category data; `src/data/site.js`: canonical domain.
- `src/data/products.js` and `src/data/importedProducts.js`: public products.
- `src/App.jsx` and `src/styles.css`: interface and styling.
- `review-dashboard/` and `scripts/import-approved-products.mjs`: review/import workflows.
- Product pages stay `noindex,follow` until explicitly SEO-approved. Product schema is gated by approval; Offer and availability require separate verified facts.
- Never guess price, availability, dimensions, materials, supplier/warranty/delivery/customization facts, address or hours. Never mass-approve products or mark image rights confirmed without evidence. Future products require image-rights confirmation and an internal source note before SEO approval; legacy rights remain unverified.

See `PROJECT_CONTEXT.md` and the SEO policy/evidence documents for complete requirements. July implementation/deployment statements are historical; verify the current files and build.

## Hosting

`wrangler.jsonc` configures Cloudflare Worker/static assets from `dist`, trailing-slash normalization and real 404-page handling. The recorded workflow builds with `npm run build` and deploys with `npx wrangler deploy`. Do not push or deploy without the owner's request; pushing `main` is documented as a deployment trigger. Current live hosting settings/status were not checked during local recovery.
