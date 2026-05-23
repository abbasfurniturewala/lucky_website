# Lucky Home Furniture Website

This is a beginner-friendly static website for a home goods / furniture store in India. It includes:

- Product catalog
- Category filters
- Product search
- WhatsApp enquiry buttons
- Call-to-order buttons
- Store contact section

## Files

- `index.html` controls the page content.
- `styles.css` controls the design.
- `script.js` controls products, search, filters, and WhatsApp links.

## What to Replace First

1. In `script.js`, update the `business` object with your real name, phone number, WhatsApp number, address, and hours.
2. In `script.js`, replace the sample products with your real products.
3. Replace the Unsplash image URLs with your own product photos when ready.

Example:

```js
const business = {
  name: "Your Store Name",
  phoneDisplay: "+91 98765 43210",
  whatsappNumber: "919876543210",
  callNumber: "+919876543210",
  address: "Your shop address",
  hours: "Open daily: 10:00 AM - 8:30 PM",
};
```

`phoneDisplay` is what customers see on the page.

`whatsappNumber` is used for WhatsApp links. It should have country code `91`, with no `+`, spaces, or dashes.

`callNumber` is used for call buttons. It should include `+91`, with no spaces.

## How to Preview Locally

Because this is a simple static website, you can double-click `index.html` to open it in a browser.

If you prefer using the terminal:

```powershell
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## How to Put It Online With Cloudflare

The easiest path is Cloudflare Pages:

1. Create a GitHub repository.
2. Upload/push these files to GitHub.
3. In Cloudflare, go to `Workers & Pages`.
4. Choose `Create application`.
5. Choose `Pages`.
6. Connect your GitHub repository.
7. Build settings:
   - Framework preset: `None`
   - Build command: leave empty
   - Build output directory: `/`
8. Deploy.
9. In the Cloudflare Pages project, add your custom domain.

## Next Features Later

- Real product photos from your shop
- Google Maps embed
- Customer reviews
- Separate product pages
- Admin-friendly catalog using Google Sheets or a small CMS
- Online payment and checkout
