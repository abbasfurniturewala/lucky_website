# Lucky Interiors Furniture Project Context

Updated: 21 July 2026

Read this document first when opening the repository on a new device or in a new Codex task.

## Project Summary

Lucky Interiors Furniture is a Mumbai-focused furniture catalog and enquiry website. Customers browse products and contact the business by WhatsApp, phone, or email. It is not an online checkout system yet.

- Live domain: https://luckyinteriorsfurniture.com
- GitHub repository: https://github.com/abbasfurniturewala/lucky_website
- Production branch: `main`
- Hosting: Cloudflare Workers/static assets
- Customer-facing name in code: `Lucky Interiors Furniture`
- Email: `hello@luckyinteriorsfurniture.com`
- Phone/WhatsApp: `+91 96195 78893`
- Primary target market: Mumbai

The exact legal name, public postal address, visit model, opening hours, delivery policies, warranty policies, and some other business facts still require owner confirmation. Do not invent or strengthen these claims.

## Technology and Architecture

- React 19 and Vite 7
- Client-side routing implemented in `src/App.jsx`
- Build-time server rendering/prerendering through `src/entry-server.jsx` and `scripts/prerender.mjs`
- Product data in `src/data/products.js` and `src/data/importedProducts.js`
- Category/business data in `src/data/catalog.js`
- SEO sitemap generation in `generate-seo.mjs`
- Cloudflare configuration in `wrangler.jsonc`, `public/_headers`, and `public/_redirects`
- Product review dashboard in `review-dashboard/`
- Product import workflow in `scripts/import-approved-products.mjs`

The production build creates `dist/` and `dist-server/`. Both are generated and intentionally ignored by Git.

## New Device Setup

```powershell
git clone https://github.com/abbasfurniturewala/lucky_website.git
Set-Location lucky_website
npm clean-install
```

Run the development website:

```powershell
npm run dev
```

Run the full production build and all SEO checks:

```powershell
npm run build
```

Preview the production build:

```powershell
npm run preview -- --port 4176
```

Run the product review dashboard:

```powershell
npm run review
```

The dashboard normally opens at `http://127.0.0.1:4174/`.

## Product Review Data and External Source Dependency

The Git repository contains:

- The full public catalog and its imported public images.
- `import-review/betterhomeindia-product-review.csv`.
- `import-review/betterhomeindia-category-summary.md`.
- `import-review/review-state.seed.json`, a portable snapshot of the saved dashboard decisions.

At runtime, dashboard edits are saved to `import-review/review-state.json`. That file is intentionally ignored so ordinary reviews do not constantly alter Git history. If it is missing on a new device, the dashboard automatically loads `review-state.seed.json` as its starting state and creates the runtime file when the first edit is saved.

The dashboard also uses a separate OneDrive-synced scraper archive for all 948 source products, including products not imported into the public catalog:

```text
C:\Users\furni\OneDrive\Documents\web scraper\data\betterhomeindia
```

That archive contains approximately 76 MB across 1,256 files. It was not uploaded to GitHub because it contains scraped reference images whose rights are not confirmed. Sync or transfer that OneDrive folder separately on the new device.

If its path changes, set the source path before starting the dashboard:

```powershell
$env:BETTERHOME_SOURCE="D:\path\to\betterhomeindia"
npm run review
```

Do not replace the tracked review seed with a new snapshot unless the owner explicitly wants to preserve a newer review checkpoint.

The portable review snapshot currently contains 670 decisions: 245 imported, 423 rejected, and 2 approved but not yet imported. The pending approved records are `alpha-2-door-wardrobe` and `aura-2-door-wardrobe`; both still have `seoStatus: review`, so importing them must not be treated as SEO approval.

## Current Product and SEO State

At the last verified production build:

- 525 active public catalog products.
- 549 prerendered public route files plus `404.html`.
- 550 generated HTML files passed the claims and crawl audits.
- 22 indexable URLs in the sitemap.
- 0 products automatically SEO-approved.
- 525 existing catalog products classified as legacy for image-rights review.
- 514 existing dashboard/import records captured in the legacy migration snapshot.
- 350 products currently missing recommended dimensions.
- 192 products currently missing recommended material information.
- No verified Product Offer or availability data yet.

All product pages remain browsable. Product indexability is controlled by `seoStatus`; do not mass-approve products.

## Product SEO Approval Policy

Required for every product before SEO approval:

- Clear product name.
- Valid storefront category.
- Unique customer-facing description of at least 80 characters.
- At least one usable product image.
- Descriptive primary-image alt text.
- Product details manually checked.
- No unsupported supplier, rating, warranty, delivery, customization, stock, or origin claims.

Recommended but non-blocking:

- Exact dimensions.
- Material or finish.
- Current price.
- Current availability.
- Color and other detailed specifications.
- Image-rights review for legacy products.

Image policy:

- The 525 products that existed at migration time are `legacy-unverified`. This does not mean their images are owned, licensed, or authorized. Replace or verify them when practical.
- Future products start as `pending` and require confirmed image rights plus an internal source/licence/permission note before SEO approval.
- Never set image rights to confirmed without actual evidence.

Structured data policy:

- Product schema is allowed only after SEO approval.
- Offer schema requires `offerVerified: true` and a valid positive current price.
- Offer availability is included only when `availabilityVerified: true` and the value is recognized.
- Unknown availability must never be converted to `InStock` or another assumed value.
- Internal image-rights status must not appear in public schema.

## Product Workflow

1. Open the review dashboard.
2. Review a manageable batch, preferably priority categories first: Sofas, Beds, Dining Sets, Wardrobes, and Centre Tables.
3. Complete all required SEO checks. Optional information may remain blank when unknown.
4. Export approved records from the dashboard.
5. Run:

```powershell
npm run import:approved
npm run build
```

The importer can add new approved products and update existing imported products in place. Existing public images are reused when an already-imported product is updated.

6. Review the local production preview.
7. Commit and push only after owner approval.

## SEO Work Already Implemented

- Route-specific prerendered HTML, metadata, canonical URLs, headings, and JSON-LD.
- Genuine 404 output and trailing-slash redirects.
- Approval-gated sitemap and `noindex,follow` controls.
- Conservative Organization, WebSite, ContactPage, Breadcrumb, CollectionPage, ItemList, Article, Product, and Offer schema rules.
- Improved homepage and five priority Mumbai category pages.
- Category filters, sorting, counts, and empty states.
- Internal links, About, Contact, Privacy, Terms, and two planning guides.
- Product planning guidance and canonical product links in WhatsApp enquiries.
- Legacy-versus-new image policy and dashboard panels for required versus recommended checks.
- Automated product policy, rendered-claim, crawl, metadata, sitemap, analytics-event, schema, and route-count checks.
- Responsive optimized header logo files and long-lived hashed-asset caching.
- Analytics event hooks, with no GA4/GTM vendor connected yet.

Detailed records are in:

- `SEO_OWNER_CHECKLIST.md`
- `SEO_SIMPLE_ROADMAP.md`
- `SEO_IMPLEMENTATION_STATUS.md`
- `SEO_BUSINESS_CONFIRMATION.md`
- `SEO_EXTERNAL_ACTIONS.md`
- `SEO_AUDIT_2026-07-11.md`
- `CLOUDFLARE_SEO_SETUP.md`

## Cloudflare Deployment

Pushing `main` triggers the connected Cloudflare deployment.

Expected project settings:

- Build command: `npm run build`
- Build output: `dist`
- Deploy command in the current Cloudflare flow: `npx wrangler deploy`
- SPA fallback is handled through `wrangler.jsonc`.

After each deployment, verify:

- Homepage and important routes return `200`.
- Trailing-slash duplicates redirect once with `301`.
- A deliberately invalid route returns `404`.
- `https://luckyinteriorsfurniture.com/sitemap.xml` loads correctly.
- Cloudflare reports a successful latest deployment.

## Supporting Catalog Files

The repository also contains optional WhatsApp/PDF catalog tools:

- `scripts/export-catalog-data.mjs`
- `scripts/create-product-catalog.py`
- `scripts/create-metal-beds-catalog.py`
- `output/pdf/lucky-interiors-whatsapp-catalog.pdf`
- `output/pdf/lucky-interiors-metal-beds-catalog.pdf`

The Python scripts require Pillow and ReportLab. Their temporary images and rendered QA pages are generated under `tmp/` and are not committed.

## Immediate Next Actions

1. Confirm the latest Cloudflare deployment succeeds after each push.
2. Verify or add the `www` to apex redirect in Cloudflare.
3. Resubmit the sitemap and request indexing for key pages in Google Search Console after deployment.
4. Review products in small batches using the dashboard; do not guess missing facts.
5. Confirm customer-facing business name, legal name, exact address/postcode, visit model, and maintained hours.
6. Decide Google Business Profile eligibility only after location facts are confirmed.
7. Choose GA4 or GTM and approve privacy/consent behavior before connecting analytics.
8. Gradually replace or verify legacy images and add original business photography.

## Verification Baseline

The last full build completed successfully with:

- Product policy verification passed.
- Product quality audit passed.
- Analytics event verification passed.
- 22 sitemap URLs generated.
- Client and SSR builds passed.
- 549 routes plus `404.html` prerendered.
- Rendered claim audit passed for 550 HTML files.
- Prerendered crawl passed for 550 HTML pages, 22 indexable pages, and 22 sitemap URLs.
- SEO build verification passed.

Always run `npm run build` again after changes; this baseline is context, not a substitute for current verification.
