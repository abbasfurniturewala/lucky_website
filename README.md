# Lucky Interiors Furniture Website

This is a React + Vite website for a home goods / furniture store in India. It includes:

- Product catalog
- Global header search
- Category filters
- Product search
- WhatsApp enquiry buttons
- Call-to-order buttons
- Product detail pages
- Store contact section

## Files

- `src/data/catalog.js` controls business details, homepage categories, and collection pages.
- `src/data/products.js` controls product data and includes a `PRODUCT_TEMPLATE` copy/paste example.
- `src/App.jsx` controls the website layout and catalog behavior.
- `src/styles.css` controls the design.
- `index.html` is the Vite entry file.

## What to Replace First

1. In `src/data/catalog.js`, update the `business` object with your real name, phone number, WhatsApp number, address, and hours.
2. In `src/data/products.js`, add, remove, or edit products inside the `products` array.
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

## How to Add Products

1. Add the product image inside `public/products/<category-folder>/`.
   Example: `public/products/sofas/grey-3-seater-sofa.jpg`
2. Open `src/data/products.js`.
3. Copy the `PRODUCT_TEMPLATE` object.
4. Paste the copy inside the `products` array.
5. Change the fields such as `id`, `slug`, `name`, `priceLabel`, `colors`, `seating`, `tags`, and `image`.

Important fields:

- `id` and `slug`: unique product URL name, such as `grey-3-seater-sofa`.
- `collectionSlug`: decides which page shows it, such as `sofas` or `beds`.
- `priceLabel`: text shown to customers, such as `Rs. 40,000` or `Price on request`.
- `tags`: search/filter labels, such as `sofa`, `2 seater`, `brown`, `leatherette`.
- `images`: optional list of multiple product photos for the product detail gallery.
- `active`: set to `false` to hide a product without deleting it.

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
