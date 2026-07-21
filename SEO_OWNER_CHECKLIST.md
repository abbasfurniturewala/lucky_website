# Lucky Interiors SEO Owner Checklist

Updated: 19 July 2026

This is the practical version of the technical SEO audit. It explains what is finished, what still needs your information, and what must be completed in external services such as Cloudflare and Google.

## What To Do Next

Complete these tasks in this order.

- [ ] **1. Review the current website preview**
  - Open `http://127.0.0.1:4176/` and check the homepage, Contact page, five main categories, and both guides.
  - What this does: gives you a final chance to catch wording or design changes before the SEO work becomes public.
  - Impact: prevents an avoidable live-site correction and gives Google a consistent first version to crawl.

- [ ] **2. Approve the current code for GitHub and deployment**
  - Tell Codex to push only after you are satisfied with the preview.
  - What this does: sends the completed SEO code to GitHub. Cloudflare should then build and publish it automatically.
  - Impact: none of the new SEO improvements can help the live website until this version is deployed.

- [ ] **3. Check the Cloudflare deployment**
  - Confirm the latest deployment is successful and the live homepage, category pages, guides, sitemap, and a deliberately wrong URL work correctly.
  - What this does: confirms that Cloudflare is serving the same optimized version that passed locally.
  - Impact: catches deployment failures, redirect problems, or a false `200` response for missing pages before Google crawls them.

- [ ] **4. Add the `www` redirect in Cloudflare**
  - Follow `CLOUDFLARE_SEO_SETUP.md` so `www.luckyinteriorsfurniture.com` redirects once to `https://luckyinteriorsfurniture.com`.
  - What this does: makes the `www` and non-`www` addresses behave as one website.
  - Impact: prevents duplicate versions of pages from splitting links, indexing signals, and ranking strength.

- [ ] **5. Resubmit the sitemap in Google Search Console**
  - Submit `https://luckyinteriorsfurniture.com/sitemap.xml` after the new version is live.
  - Request indexing for the homepage, About, Contact, the five main categories, and the two guides.
  - What this does: tells Google which pages are ready to crawl and index.
  - Impact: speeds up discovery. It does not guarantee ranking, but it removes a major discovery obstacle.

- [ ] **6. Review the first 10 products for SEO**
  - Open `http://127.0.0.1:4174/`. It already shows the next 10 imported products in the five priority categories.
  - Complete the separate `Required for SEO approval` panel: valid name/category, unique 80+ character description, usable image, descriptive alt text, manually checked details, and no unsupported claims.
  - Dimensions, material, price, availability and color appear under `Recommended product information`. Add them when known, but do not guess them.
  - Existing products are labelled `Legacy product`. Their image-rights evidence is recommended and non-blocking, but `legacy-unverified` does not mean the image is authorized.
  - Every future product is labelled `New product - image evidence required`; confirmed rights and an internal source/licence/permission note are mandatory.
  - Check `Current price verified` and `Current availability verified` only when those values are genuinely current.
  - What this does: changes selected product pages from browsable-but-hidden pages into pages that are safe to submit to Google.
  - Impact: creates useful product landing pages without exposing copied, incomplete, inaccurate, or legally risky data.

- [ ] **7. Rebuild and deploy after product approval**
  - Ask Codex to import the approved review batch, run the SEO tests, and push it.
  - What this does: adds approved product URLs to the sitemap, changes them to `index,follow`, and emits accurate Product schema.
  - Impact: gives Google specific product pages that can rank for detailed searches, while low-quality products remain excluded.

## Completed In The Website Code

- [x] **Search-engine-readable pages**
  - What it does: every important URL now has its own complete HTML instead of sending Google an almost-empty JavaScript shell.
  - Impact: Google can immediately read the page title, description, heading, copy, links, and schema. This improves crawl reliability and reduces rendering delays.

- [x] **Unique titles, descriptions, headings, and canonical URLs**
  - What it does: the homepage, categories, guides, contact pages, and products describe themselves correctly in their initial HTML.
  - Impact: helps Google understand each page, avoids duplicate-page confusion, and can improve the wording shown in search results.

- [x] **Real not-found page**
  - What it does: Cloudflare is configured to return a genuine `404` for an unknown URL instead of pretending it is a valid page.
  - Impact: stops invalid URLs from wasting Google's crawl time or appearing as soft-404 problems in Search Console.

- [x] **Trailing-slash redirects**
  - What it does: `/contact/` redirects to `/contact`, with the same rule for categories, products, guides, and other main routes.
  - Impact: keeps each page on one preferred URL and prevents duplicate indexing signals.

- [x] **Quality-controlled sitemap**
  - What it does: the sitemap currently contains only the 22 pages that are safe and useful for Google. Empty Shoe Racks, search results, and all unapproved products are excluded.
  - Impact: focuses Google's attention on the strongest pages instead of asking it to index hundreds of weak product records.

- [x] **Safe structured data**
  - What it does: the site publishes Organization, WebSite, breadcrumb, collection, contact, and Article schema using confirmed information. Product and Offer schema are locked behind verification.
  - Impact: gives search engines machine-readable context without risking misleading rich results or structured-data penalties.

- [x] **Unverified claims removed or blocked**
  - What it does: automated checks block supplier names, ratings, warranty claims, stock claims, customisation, origin, delivery promises, installation promises, opening hours, and the unconfirmed postal address.
  - Impact: protects customer trust and prevents Google from indexing claims that the business has not verified.

- [x] **Homepage targeting for Mumbai**
  - What it does: the title, main heading, and supporting copy clearly present a furniture catalog for Mumbai homes.
  - Impact: gives the homepage a clearer chance to become relevant for searches such as `furniture store in Mumbai`, while avoiding unsupported claims about delivery areas or a walk-in showroom.

- [x] **Five priority category pages improved**
  - Pages: Sofas, Beds, Dining Sets, Wardrobes, and Centre Tables.
  - What it does: each page has unique Mumbai-focused metadata, useful buying guidance, FAQs, related links, filters, sorting, product counts, and empty-filter states.
  - Impact: these pages can target valuable category searches and help customers compare products more effectively.

- [x] **Internal links and footer navigation**
  - What it does: categories, guides, products, About, Contact, Privacy, and Terms are connected with relevant normal links.
  - Impact: helps Google discover pages, passes ranking signals through the site, and makes useful pages easier for customers to reach.

- [x] **Helpful guides added**
  - Pages: measuring furniture access and choosing sofa size for compact living rooms.
  - What it does: answers planning questions and links readers to relevant categories and enquiries.
  - Impact: can attract informational searches, demonstrate usefulness, and assist category/product conversions.

- [x] **Article schema for guides**
  - What it does: identifies the guides as articles with a headline, language, canonical page, and Lucky Interiors as the organization author/publisher. No invented publication dates are included.
  - Impact: helps Google understand the content type and its relationship to the business.

- [x] **Product quality gate and review dashboard**
  - What it does: every product stays `noindex,follow` until the universal approval checks pass. The dashboard separates blocking requirements from useful optional information.
  - Impact: prevents 525 unfinished pages from weakening the site while allowing a useful legacy page to be approved even when optional specifications are unavailable.

- [x] **Legacy versus new image policy**
  - What it does: all 525 current catalog products are honestly marked `legacy-unverified`; no rights were auto-confirmed. Every future product starts as `pending` and cannot receive SEO approval without image evidence.
  - Impact: keeps the existing review workload practical without pretending copyright permission exists, while applying a stronger standard to every future addition.

- [x] **Search and empty-page controls**
  - What it does: internal search pages and the empty Shoe Racks category use `noindex,follow`.
  - Impact: prevents low-value or endlessly variable pages from entering Google while still allowing their links to be followed.

- [x] **Image basics improved**
  - What it does: meaningful images have descriptive alt text, product galleries use appropriate loading behaviour, and the header logo uses 2.4 KB/5.1 KB responsive WebP files instead of downloading the 648 KB original in modern browsers.
  - Impact: improves accessibility, image understanding, page speed, and layout stability.

- [x] **Performance and browser caching improved**
  - What it does: JavaScript is split into reusable chunks and hashed assets are configured for long browser caching.
  - Impact: makes repeat visits faster and reduces unnecessary downloads, which supports user experience and Core Web Vitals.

- [x] **Analytics event hooks prepared**
  - What it does: the code can record page views, WhatsApp clicks, phone calls, email clicks, map clicks, and product enquiries without sending personal information.
  - Impact: once GA4 or GTM is connected, you can measure which SEO pages create real enquiries instead of judging SEO only by traffic.

- [x] **Automated SEO safety tests**
  - What it does: every production build checks product quality, analytics event names, sitemap rules, metadata, links, indexability, schema, forbidden claims, route count, and logo size budgets.
  - Impact: prevents many SEO mistakes from being deployed accidentally as the catalog grows.

## Waiting For Information From You

- [ ] **Confirm the customer-facing business name**
  - Choose between `Lucky Interiors`, `Lucky Interiors Furniture`, or another exact trading name.
  - Impact: consistent names help Google connect the website, Business Profile, citations, and branded searches to the same business.

- [ ] **Confirm the legal company name**
  - Confirm the exact registered spelling of `Lucky Interiors Private Limited` before it is added as `legalName`.
  - Impact: supports trust and entity consistency, but the legal name should not replace the shorter customer-facing brand unless that is how customers know the business.

- [ ] **Confirm the public address and postcode**
  - The exact postal wording is currently withheld. The map remains visible because its link and coordinates were supplied by you.
  - Impact: a verified and consistent address is important for local search and Google Business Profile eligibility. A wrong or private address can cause verification or trust problems.

- [ ] **Confirm the customer visit model**
  - State whether customers may visit without appointment, by appointment only, or whether the location is not customer-facing.
  - Impact: determines whether the business qualifies as a storefront, service-area business, or neither in Google Business Profile.

- [ ] **Confirm maintained opening hours**
  - Provide normal weekly hours and how holidays are handled. Until then, the website asks customers to contact you before visiting.
  - Impact: accurate hours reduce missed visits and are required before adding opening-hours schema or a complete local profile.

- [ ] **Confirm real service and delivery policies**
  - Supply verified delivery areas, charges, assembly/installation scope, measurement services, custom sizing, lead times, warranty, returns, cancellations, and damage procedures.
  - Impact: these details can improve rankings and conversion, but publishing unsupported policies creates legal and customer-service risk.

- [ ] **Review or replace legacy product images over time**
  - For current legacy products, record whether images are original, supplier-authorized, licensed, or otherwise permitted when practical. Replace images whose origin cannot be established.
  - Impact: this is non-blocking for legacy SEO approval, but it reduces copyright risk and supports safer image marketing. `Legacy-unverified` is not legal authorization.

- [ ] **Keep image evidence for every new product**
  - Before approving any future product, record the original photographer, supplier permission, licence, or other valid source note in the dashboard.
  - Impact: prevents new unverified image debt and blocks accidental SEO publication when evidence is missing.

- [ ] **Choose GA4 or Google Tag Manager**
  - Supply one `G-...` GA4 ID or one `GTM-...` container ID and approve the required privacy/consent behaviour.
  - Impact: enables reliable measurement of organic enquiries and page performance. Installing both carelessly can duplicate data.

## External Accounts Or Outside Work Required

- [ ] **Cloudflare `www` redirect**
  - Where: Cloudflare Redirect Rules.
  - Why external: it changes domain-level behaviour outside the GitHub code.
  - Impact: consolidates all ranking signals on the preferred domain.

- [ ] **Google Search Console deployment checks**
  - Where: Search Console sitemap, URL Inspection, Page Indexing, and Core Web Vitals reports.
  - Why external: Google controls crawling and indexing; the website cannot mark itself as indexed.
  - Impact: confirms whether Google sees the correct pages and reveals crawl, canonical, or performance problems.

- [ ] **Google Business Profile decision and verification**
  - Where: Google Business Profile.
  - Why external: eligibility and verification may require signage, a real customer-facing location, video, mail, phone, or business documentation.
  - Impact: this is one of the strongest opportunities for appearing in Google Maps and local furniture searches in Mumbai.

- [ ] **GA4 or GTM account setup**
  - Where: Google Analytics or Google Tag Manager.
  - Why external: the tracking ID and account permissions must come from an account you own.
  - Impact: connects the already-prepared website events to reports and conversion measurement.

- [ ] **Real reviews and reputation management**
  - Where: Google Business Profile and genuine customer platforms.
  - Why external: reviews must come voluntarily from real customers and should never be created or incentivized dishonestly.
  - Impact: strong recent reviews and helpful responses improve trust, local conversion, and potentially local visibility.

- [ ] **Backlinks and local authority**
  - Work: obtain genuine mentions from designers, architects, housing or relocation resources, Mumbai publications, business associations, suppliers, and permissioned customer projects.
  - Why external: another real website must choose to mention or link to Lucky Interiors.
  - Impact: relevant links and mentions are important signals of reputation and can help the site compete beyond branded searches.

- [ ] **Original project content**
  - Work: photograph real rooms, installations, before/after projects, measurement challenges, and completed furniture with customer permission.
  - Why external: the website cannot manufacture first-hand experience or ownership permission.
  - Impact: original evidence is far more persuasive and defensible than copied catalog content and can support guides, product pages, social media, and backlinks.

- [ ] **Monthly SEO review**
  - Track: Search Console impressions/clicks, indexed URLs, category queries, organic WhatsApp/call enquiries, approved-product count, Core Web Vitals, and crawl errors.
  - Why external: ranking and traffic data only appear after Google crawls the live site over time.
  - Impact: shows what produces enquiries, which pages need improvement, and whether SEO work is moving in the right direction.

## Important Expectations

- SEO changes do not produce instant rankings. Google may take days or weeks to recrawl pages, and competitive non-brand searches can take months of consistent product, content, local-profile, and reputation work.
- Submitting a sitemap helps discovery but does not force Google to index or rank every URL.
- The safest strategy is to deploy the strong category and guide pages now, then approve products in small evidence-backed batches.
- Never mark a product price, availability, image right, business hour, delivery promise, or service as verified unless it is genuinely current and documented.
