import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { shopCategories } from "../src/data/catalog.js";
import { products } from "../src/data/products.js";
import { guides, guidePath } from "../src/data/guides.js";

const distDirectory = resolve("dist");
const template = await readFile(join(distDirectory, "index.html"), "utf8");
const serverEntryUrl = pathToFileURL(resolve("dist-server/entry-server.js")).href;
const { render } = await import(serverEntryUrl);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function jsonForHtml(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function renderSeoHead(seo, jsonLd) {
  const tags = [
    `<title>${escapeHtml(seo.title)}</title>`,
    `<meta name="description" content="${escapeHtml(seo.description)}" />`,
    `<meta name="robots" content="${escapeHtml(seo.robots)}" />`,
    `<link rel="canonical" href="${escapeHtml(seo.canonical)}" />`,
    `<meta property="og:site_name" content="Lucky Interiors Furniture" />`,
    `<meta property="og:type" content="${escapeHtml(seo.type)}" />`,
    `<meta property="og:title" content="${escapeHtml(seo.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(seo.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(seo.canonical)}" />`,
    `<meta property="og:image" content="${escapeHtml(seo.image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(seo.image)}" />`,
  ];

  jsonLd.forEach((data, index) => {
    const id = index === 0 ? "organization-jsonld" : index === 1 ? "website-jsonld" : `page-jsonld-${index - 2}`;
    tags.push(`<script id="${id}" type="application/ld+json">${jsonForHtml(data)}</script>`);
  });

  return `<!--seo-head-start-->\n    ${tags.join("\n    ")}\n    <!--seo-head-end-->`;
}

function routeOutputPath(route) {
  if (route === "/") {
    return join(distDirectory, "index.html");
  }

  return join(distDirectory, ...route.slice(1).split("/"), "index.html");
}

async function writeRoute(route, outputPath = routeOutputPath(route)) {
  const { html: appHtml, jsonLd, seo } = render(route);
  const page = template
    .replace(/<!--seo-head-start-->[\s\S]*?<!--seo-head-end-->/, renderSeoHead(seo, jsonLd))
    .replace('data-prerender-path="/"', `data-prerender-path="${escapeHtml(route)}"`)
    .replace("<!--app-html-->", appHtml);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, page, "utf8");
}

const routes = new Set(["/", "/about", "/contact", "/privacy", "/search", "/terms"]);

shopCategories.forEach((category) => routes.add(`/collections/${category.slug}`));
guides.forEach((guide) => routes.add(guidePath(guide)));
products
  .filter((product) => product.active !== false)
  .forEach((product) => routes.add(`/products/${product.slug || product.id}`));

for (const route of routes) {
  await writeRoute(route);
}

await writeRoute("/404", join(distDirectory, "404.html"));

console.log(`Prerendered ${routes.size} public routes plus 404.html.`);
