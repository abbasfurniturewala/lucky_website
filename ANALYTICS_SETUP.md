# Website analytics and private dashboard

Status: connected and published with the owner's explicit approval on 24 October 2026. Live GA4 reporting and a consented Mumbai test visit / call click / WhatsApp click were verified. The owner-approved 25 October website source checkpoint includes this integration on `dev`, together with the favicon repair and visual refresh; main remains older. Never substitute demo data for missing reports.

## Verified connection on this device

- Private dashboard: `http://127.0.0.1:4175/` (`npm run analytics` to restart).
- Google Cloud project: **Lucky Interiors Analytics** / `nth-agent-512615-d5`; Analytics Data API enabled, no billing attached by this work.
- Reporting account: `lucky-dashboard-viewer@nth-agent-512615-d5.iam.gserviceaccount.com`. GA4 property **560651353** grants Viewer only, with cost/revenue data blocked. No Cloud project roles were granted.
- The failed downloaded key starting `488c30fe129f` was permanently revoked with owner confirmation. Its replacement RSA private key was generated locally; only its public X.509 certificate was uploaded to Google. The registered replacement expires **24 October 2027**; renew before expiry.
- Private files stay outside the repository in `C:/Users/Hasan/Documents/Lucky online business/.private-analytics/`. `ga4-viewer.json` is referenced by ignored `.env.local`. NTFS access is restricted to Hasan and SYSTEM. Do not transfer these credentials through Git, chat, public hosting, or ordinary shared archives. A second device needs its own approved reporting credential.
- Cloudflare Worker `luckywebsite` first published analytics as **cc551871-54bc-4ddb-bcbf-c5b8aed60efc**. Current version **7f83db5b-a905-4078-bd07-464a31203d86** (25 October website refresh) retains this integration and the favicon repair. Publication uses official Wrangler 4.152.0. CLI login is encrypted with its key in Windows Credential Manager; permissions are User Read, Account Read, Workers Scripts Write and Background Access. No paid services were enabled by this work.
- Live consent checks: zero Google tags before consent, zero after refusal, one correct tag after allowance, zero after withdrawal and reload. No browser console warnings/errors were observed. Google Realtime returned one active test user, one `phone_click`, and one `whatsapp_click`, including under Mumbai/India. These are test actions, not customer enquiries; no call or message was sent. Standard totals and minute-level history were still processing when checked.
- Live URL checks passed: apex home/category 200; www-to-apex 301 preserving path/query; category trailing slash 301; nonexistent path 404; robots and sitemap 200. Products, public images, catalog and review data were not changed.

The 25 October owner-approved `dev` checkpoint includes the analytics source and locked dependency. A future build of the older `main` source can still remove this integration. Before switching devices, inspect/preserve local work and safely synchronize `dev`; configure that device's private environment/credential separately. See `HANDOFF.md`. This checkpoint does not move or push `main`.

## What the dashboard answers

- Estimated website users, sessions and page views for Today / 7 / 30 / 90 days.
- Mumbai city users in India, plus an all-cities / Mumbai-only scope for visits and clicks.
- Call, WhatsApp and email **click counts** and distinct clicking users per channel.
- Realtime active users and recent contact-click activity in the last 30 minutes.
- Latest contact clicks grouped by minute, with the GA4 property's actual reporting time zone shown.

`product_enquiry` is deliberately not added to channel click totals: product buttons already emit a channel click and a product enquiry, so adding both would double-count. Users are not additive across days, channels or cities. IP-based city estimates are approximate; Mumbai, Thane and Navi Mumbai are separate labels. Clicks do not prove a phone call connected or a message was sent. Nothing can reconstruct clicks before collection was enabled.

Realtime is fetched at most every 30 seconds per selected city. Standard reports are cached for five minutes and may take 24–48 hours to settle. Realtime covers the whole property because GA4's Realtime API does not support `hostName`; use a property dedicated to this website. Standard reports filter to `luckyinteriorsfurniture.com` and `www.luckyinteriorsfurniture.com`. The timeline shows up to 100 latest minute/action groups, not raw personal visitor logs. Thresholding, sampling and reporting-time-zone warnings are displayed when supplied by Google.

## Start locally

Requires Node 22.12+ (or the project's compatible newer runtime) and the locked npm dependencies. The new official `google-auth-library` dependency is server-side only.

```powershell
npm clean-install
npm run analytics
```

Default: `http://127.0.0.1:4175/`. If occupied, the server tries the next nine ports and prints the actual URL. It binds only to `127.0.0.1`, rejects unexpected Host/Origin headers and cross-site API reads, and has no write endpoints. It does **not** publish a dashboard or business reports on the public website. Stop with Ctrl+C. This device must stay on with the server running to use that local address; another device needs its own checkout/configuration. Do not expose it through a public tunnel.

The dashboard reads `.env.local` through Node's `--env-file-if-exists` flag. The storefront's Vite environment also reads that file. The existing product review server is separate and retains its prior configuration behavior.

## Connection checklist

- [x] Dashboard UI, reporting adapter and no-data/error states implemented.
- [x] Controlled website events and optional-consent controls implemented.
- [x] Privacy/consent behavior updated; owner approved connecting and publishing the tracking update.
- [x] Owner created GA4 property `560651353`, Web stream `16195448439`, Measurement ID `G-6K61LHQGYE` in the signed-in browser.
- [x] Verified reporting time zone is India (GMT+05:30) and currency is INR in the property detail UI.
- [x] Verified **Enhanced measurement is OFF** on the Web stream after owner confirmation. Keep it off before collection is enabled. The site manually sends page views and enquiry events. Automatic history views duplicate counts; automatic outbound-link/form/search measurement can collect link query text that this integration intentionally excludes.
- [x] Enable the Google Analytics Data API in an owner-controlled Google Cloud project.
- [x] Authorize dedicated Viewer-only reporting access.
- [x] Check the dashboard against GA4 using real reports, including Mumbai filtering.
- [x] Owner approves privacy/consent behavior and explicitly approves production publication.
- [x] Set public production build variables, build, publish to the existing Worker, and verify real visit/click receipt. No duplicate GA/GTM snippet.
- [ ] Review standard totals and minute-grouped click times after Google's processing delay (24–48 hours).
- [x] Include the analytics source in the owner-approved 25 October dev checkpoint for the other device; private credentials remain separate.
- [ ] Renew the local reporting certificate before 24 October 2027.

IDs above are public/configuration identifiers, not credentials. `.env.local` is ignored and is not synchronized by Git. Never put credentials in `VITE_` variables, the public folder, Git, screenshots or chat.

### Option A: user credentials (avoids a downloaded service-account key)

Use Google's official gcloud CLI on each device and an account with Viewer access to this GA4 property. Enable the Data API for the selected Google Cloud project. Follow Google's [user-credential quickstart](https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart).

```powershell
gcloud auth application-default login --scopes="https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/analytics.readonly"
```

Then set `GA4_USE_ADC=true` and leave `GOOGLE_APPLICATION_CREDENTIALS` blank in `.env.local`. If Google requests an explicit Cloud project/quota project, select the owner-controlled project used to enable the API. The dashboard calls only the read-only Analytics reporting endpoints; it does not change the property.

### Option B: dedicated Viewer service account

1. In the owner-controlled Cloud project, enable **Google Analytics Data API**.
2. Create a dedicated service account for dashboard reporting. It needs no broad Cloud IAM project role merely to read GA4.
3. In GA4, **Admin → Property access management**, add that service account's email with **Viewer** only. Do not grant Editor or Administrator for reporting.
4. Only with owner approval, create a service-account JSON key. Store it outside the repository and outside public/synced output folders. Treat it as a password; do not upload/paste it into chat or Git. Prefer Option A when practical.
5. Set `GOOGLE_APPLICATION_CREDENTIALS` to its absolute file path in `.env.local` (forward slashes work on Windows), keep `GA4_USE_ADC=false`, and restart `npm run analytics`.

Creating credentials or granting access requires the owner's explicit confirmation at the relevant step. The dashboard uses Google's official authentication library to renew access tokens. API error details are sanitized before reaching the browser, which never receives a token or key file.

## Website activation (separate from dashboard startup)

The integration is **off by default** in the template. The owner approved activation on 24 October 2026; this device and the existing Cloudflare Worker's build variables now use:

```text
VITE_GA4_ENABLED=true
VITE_GA4_MEASUREMENT_ID=G-6K61LHQGYE
VITE_GA4_ALLOW_LOCAL=false
```

Only these public build settings belong in Cloudflare's build environment. Do not upload the private GA4 reporting credentials to the storefront hosting. Vite bakes these values into the build; changing an environment variable later does not alter an already-deployed bundle.

Visitors can allow or refuse analytics and change their choice in **Analytics settings** at the bottom of the site. With no consent, the Google tag is not loaded and no historical clicks are replayed after consent. Choice expiry is 180 days when local storage is available. Withdrawal disables the property's future events and removes the integration's GA cookies; it does not retroactively delete Google's stored data. Ad storage, ad personalization and Google signals are not enabled. Event payloads use a strict field list and remove query strings/fragments from page/referrer/product URLs. No user IDs, enquiry message bodies or contact fields are intentionally sent.

Localhost is excluded unless `VITE_GA4_ALLOW_LOCAL=true` is deliberately set for a test. Prefer a separate test property; real production data should not include development visits. This switch is not enabled in this checkout. Consent controls do not constitute a legal-compliance certification; owner review of the policy and chosen Google account settings remains necessary.

After publication, use GA4 Realtime/DebugView to verify one permitted page view and one click per action. Check refused and withdrawn consent, SPA navigation/back navigation, and absence of a duplicate tag. Mark the channel events as key events in GA4 if desired; no custom event definitions are needed to receive the already-named events. Dates/times are property-local, so set India before collecting the production data.

## Verification

```powershell
npm run verify:analytics
npm run verify:analytics-dashboard
npm run build
```

Automated tests cover consent, query/contact exclusion, StrictMode duplicate suppression, cross-tab withdrawal, SSR/localhost exclusion, report parsing and caching, privacy warnings, unavailable/error states, local HTTP serving, Host/Origin protections and read-only endpoints. Test fixtures are confined to tests; the dashboard has no sample-data mode. A successful build or mocked reporting test does not prove live Google authorization or deployed collection.

Reference: [Google page-view controls](https://developers.google.com/analytics/devguides/collection/ga4/views), [reporting API](https://developers.google.com/analytics/devguides/reporting/data/v1), [Realtime schema](https://developers.google.com/analytics/devguides/reporting/data/v1/realtime-api-schema), [consent implementation](https://developers.google.com/tag-platform/security/guides/consent).
