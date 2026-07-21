# Cloudflare SEO Setup

The repository now handles route-specific HTML, slash redirects and 404 responses. One hostname-level redirect must be configured in the Cloudflare dashboard because Workers `_redirects` files cannot perform domain-level redirects.

## Redirect `www` to the Apex Domain

1. Open Cloudflare and select `luckyinteriorsfurniture.com`.
2. Open **DNS > Records**.
3. Confirm `www` has a proxied DNS record. If it does not, add a proxied `A` record for `www` pointing to `192.0.2.1`.
4. Open **Rules > Redirect Rules**.
5. Choose **Create rule > Single Redirect**.
6. Name it `Redirect www to apex`.
7. Use the custom filter expression:

   ```text
   (http.host eq "www.luckyinteriorsfurniture.com")
   ```

8. Choose a **Dynamic** target URL and enter:

   ```text
   concat("https://luckyinteriorsfurniture.com", http.request.uri.path)
   ```

9. Select status code **301**.
10. Enable **Preserve query string**.
11. Save and deploy the rule.

## Verification

After the next website deployment, all of these should complete in one hop:

```powershell
curl.exe -I https://www.luckyinteriorsfurniture.com/
curl.exe -I https://www.luckyinteriorsfurniture.com/collections/sofas?source=test
curl.exe -I https://luckyinteriorsfurniture.com/collections/sofas/
curl.exe -I https://luckyinteriorsfurniture.com/does-not-exist
```

Expected:

- `www` URLs: 301 to the same apex path/query.
- trailing-slash content URLs: 301 to the no-slash URL.
- canonical URLs: 200.
- unknown URLs: 404.

Official reference: https://developers.cloudflare.com/rules/url-forwarding/examples/redirect-all-different-hostname/
