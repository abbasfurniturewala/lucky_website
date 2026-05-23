# Lucky Interiors Furniture Website

This is a React + Vite website for a home goods / furniture store in India. It includes:

- Product catalog
- Category filters
- Product search
- WhatsApp enquiry buttons
- Call-to-order buttons
- Product detail modal
- Store contact section

## Files

- `src/data/catalog.js` controls business details, categories, and products.
- `src/App.jsx` controls the website layout and catalog behavior.
- `src/styles.css` controls the design.
- `index.html` is the Vite entry file.

## What to Replace First

1. In `src/data/catalog.js`, update the `business` object with your real name, phone number, WhatsApp number, address, and hours.
2. In `src/data/catalog.js`, replace the sample products with your real products.
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

Install dependencies once:

```powershell
npm install
```

Start the local development server:

```powershell
npm run dev
```

Then open the local URL shown in the terminal, usually:

```text
http://127.0.0.1:5173
```

## How to Put It Online With Cloudflare

Use Cloudflare Pages:

1. Push changes to GitHub.
2. In Cloudflare, go to `Workers & Pages`.
3. Select your Pages project.
4. Build settings:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Deploy.
6. In the Cloudflare Pages project, add your custom domain.

## Next Features Later

- Real product photos from your shop
- Google Maps embed
- Customer reviews
- Separate product pages
- Admin-friendly catalog using Google Sheets or a small CMS
- Online payment and checkout
