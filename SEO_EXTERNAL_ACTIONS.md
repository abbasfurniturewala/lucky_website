# Lucky Interiors SEO External Actions

Updated: 12 July 2026

These actions require a signed-in account, a verified business fact, or an external relationship. They should not be replaced with guessed data in the website code.

## 1. Deploy and Normalize the Domain

1. Deploy this build to the existing Cloudflare Worker.
2. Add the `www` to apex `301` redirect from `CLOUDFLARE_SEO_SETUP.md`.
3. Test HTTP, HTTPS, `www`, apex, trailing-slash and unknown-URL behavior.
4. Evidence required: one-hop redirect to `https://luckyinteriorsfurniture.com`, canonical pages return `200`, and an unknown path returns `404`.

## 2. Update Google Search Console

1. Open the verified domain property.
2. Resubmit `https://luckyinteriorsfurniture.com/sitemap.xml` after deployment.
3. Confirm that Google reads 22 URLs in the current quality-gated sitemap.
4. Inspect and request indexing for the homepage, Contact, About, the five priority categories, and both guides.
5. Do not request indexing for product pages until they pass the dashboard's SEO approval checks.
6. Evidence required: sitemap status `Success`, correct discovered-page count, and no canonical or crawl errors for sampled URLs.

## 3. Confirm Business and Local Facts

1. Complete `SEO_BUSINESS_CONFIRMATION.md`.
2. Decide whether the location is an eligible staffed storefront, a service-area business, or neither under Google Business Profile rules.
3. Add LocalBusiness/FurnitureStore schema only after the public name, address visibility, hours, phone, storefront eligibility, and map/profile URL are verified and shown consistently on the site.
4. Evidence required: matching name, address, phone and hours across the website, Google profile, signage and authoritative business records.

## 4. Configure Measurement Responsibly

1. Choose GA4 directly or Google Tag Manager; do not load both independently for the same events.
2. Supply the selected ID and approve the consent/privacy behavior before enabling the vendor.
3. Test one event per action for `page_view`, `whatsapp_click`, `phone_click`, `email_click`, `map_click`, and `product_enquiry`.
4. Do not send names, phone numbers, emails, message text, addresses or other personal information in analytics parameters.
5. Evidence required: Tag Assistant or GA4 DebugView shows one event per action and no personally identifiable information.

## 5. Approve Products in Small Batches

1. Start with ten products in the five priority categories. The dashboard opens in this queue by default at `http://127.0.0.1:4174/`.
2. Confirm the product name, unique description, dimensions, material/finish/color, image rights and rights source, current price process and current availability process.
3. Use the review dashboard's separate SEO status and verification controls.
4. Mark an Offer as verified only when the visible price is current and maintained.
5. Rebuild and confirm that each approved URL enters the sitemap and changes from `noindex,follow` to `index,follow` with accurate Product schema.
6. Evidence required: source/rights record, completed dashboard checks, passing product audit and matching rendered page/schema.

## 6. Earn Local and Industry Authority

1. Create useful, original project or room-planning content from real work only after image/customer permission is documented.
2. Seek accurate profiles or mentions from relevant Mumbai business associations, design partners, building/interior publications and authorized supplier relationships.
3. Keep business details consistent wherever the company is listed.
4. Avoid paid-link packages, mass directory submissions, copied articles, fake reviews and location pages without genuine distinct value.
5. Evidence required: a real referring page, relevant context, accurate business information and referral/organic-enquiry tracking.

## 7. Monthly Review

Record Search Console impressions, clicks, average position and indexed URLs by page group; organic WhatsApp/call enquiries; qualified leads; image-search performance; crawl errors; and approved-product count. Compare trends by category and landing page rather than judging SEO only by total sessions.
