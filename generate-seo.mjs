import { mkdir, writeFile } from "node:fs/promises";

import { shopCategories } from "./src/data/catalog.js";
import { products } from "./src/data/products.js";
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

const today = new Date().toISOString().slice(0, 10);

const urls = [
  {
    loc: absoluteUrl("/"),
    changefreq: "weekly",
    priority: "1.0",
  },
  {
    loc: absoluteUrl("/contact"),
    changefreq: "monthly",
    priority: "0.7",
  },
  ...shopCategories.map((category) => ({
    loc: absoluteUrl(`/collections/${category.slug}`),
    changefreq: "weekly",
    priority: "0.8",
  })),
  ...products
    .filter((product) => product.active !== false)
    .map((product) => ({
      loc: absoluteUrl(productPath(product)),
      changefreq: "monthly",
      priority: "0.7",
    })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join("\n")}
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
