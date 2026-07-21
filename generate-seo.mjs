import { mkdir, writeFile } from "node:fs/promises";

import { shopCategories } from "./src/data/catalog.js";
import { products } from "./src/data/products.js";
import { guides, guidePath } from "./src/data/guides.js";
import { site } from "./src/data/site.js";

function absoluteUrl(path = "/") {
  return new URL(path, site.origin).toString();
}

function productPath(product) {
  return `/products/${product.slug || product.id}`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function productsForCollection(collection) {
  return products.filter(
    (product) =>
      product.active !== false &&
      (product.collectionSlug === collection.slug ||
        (!product.collectionSlug && product.category === collection.filterCategory)),
  );
}

const urls = [
  absoluteUrl("/"),
  absoluteUrl("/about"),
  absoluteUrl("/contact"),
  absoluteUrl("/privacy"),
  absoluteUrl("/terms"),
  ...guides.map((guide) => absoluteUrl(guidePath(guide))),
  ...shopCategories
    .filter((category) => productsForCollection(category).length > 0)
    .map((category) => absoluteUrl(`/collections/${category.slug}`)),
  ...products
    .filter((product) => product.active !== false && product.seoStatus === "approved")
    .map((product) => absoluteUrl(productPath(product))),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`).join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${absoluteUrl("/sitemap.xml")}
`;

await mkdir("public", { recursive: true });
await writeFile("public/sitemap.xml", sitemap);
await writeFile("public/robots.txt", robots);

console.log(`Generated ${urls.length} sitemap URLs.`);
