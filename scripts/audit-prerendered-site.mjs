import { access, readFile, readdir } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";

import { site } from "../src/data/site.js";

const distDirectory = resolve("dist");
const siteOrigin = new URL(site.origin).origin;

async function htmlFiles(directory) {
  const files = [];

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await htmlFiles(entryPath)));
    if (entry.isFile() && (entry.name === "index.html" || entry.name === "404.html")) {
      files.push(entryPath);
    }
  }

  return files;
}

function routeForFile(file) {
  const relativePath = relative(distDirectory, file).split(sep).join("/");
  if (relativePath === "index.html") return "/";
  if (relativePath === "404.html") return "/404";
  return `/${relativePath.replace(/\/index\.html$/, "")}`;
}

function attributes(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)].map((match) => [match[1], match[2]]),
  );
}

function metaContent(html, name) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const values = attributes(tag);
    if (values.name === name) return values.content || "";
  }
  return "";
}

function canonicalHref(html) {
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    const values = attributes(tag);
    if (values.rel === "canonical") return values.href || "";
  }
  return "";
}

function titleText(html) {
  return html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || "";
}

function internalRoutes(html, currentRoute) {
  const routes = [];

  for (const tag of html.match(/<a\b[^>]*>/gi) || []) {
    const href = attributes(tag).href?.replaceAll("&amp;", "&");
    if (!href || /^(?:mailto:|tel:|javascript:)/i.test(href)) continue;

    let url;
    try {
      url = new URL(href, new URL(currentRoute, site.origin));
    } catch {
      routes.push({ error: `Invalid href: ${href}`, href });
      continue;
    }

    if (url.origin !== siteOrigin) continue;
    const path = url.pathname.replace(/\/+$/, "") || "/";
    routes.push({ href, path });
  }

  return routes;
}

async function staticPathExists(path) {
  const candidate = join(distDirectory, ...path.replace(/^\//, "").split("/"));
  try {
    await access(candidate);
    return true;
  } catch {
    return false;
  }
}

function fail(errors) {
  if (!errors.length) return;
  errors.slice(0, 50).forEach((error) => console.error(`- ${error}`));
  if (errors.length > 50) console.error(`- ...and ${errors.length - 50} more`);
  throw new Error(`Prerendered-site crawl found ${errors.length} issue(s).`);
}

const pages = new Map();
for (const file of await htmlFiles(distDirectory)) {
  const route = routeForFile(file);
  const html = await readFile(file, "utf8");
  pages.set(route, {
    canonical: canonicalHref(html),
    description: metaContent(html, "description"),
    file,
    h1Count: (html.match(/<h1(?:\s[^>]*)?>/gi) || []).length,
    html,
    links: internalRoutes(html, route),
    robots: metaContent(html, "robots"),
    title: titleText(html),
  });
}

const errors = [];
const canonicalOwners = new Map();
const indexableTitleOwners = new Map();
const inbound = new Map([...pages.keys()].map((route) => [route, 0]));

for (const [route, page] of pages) {
  if (!page.title) errors.push(`${route}: missing title`);
  if (!page.description) errors.push(`${route}: missing meta description`);
  if (!page.robots) errors.push(`${route}: missing robots directive`);
  if (!page.canonical) errors.push(`${route}: missing canonical`);
  if (page.h1Count !== 1) errors.push(`${route}: expected one H1, found ${page.h1Count}`);

  if (page.canonical) {
    const canonicalUrl = new URL(page.canonical, site.origin);
    const canonicalPath = canonicalUrl.pathname.replace(/\/+$/, "") || "/";
    if (canonicalUrl.origin !== siteOrigin) errors.push(`${route}: canonical uses another origin`);
    if (canonicalPath !== route) errors.push(`${route}: canonical points to ${canonicalPath}`);
    const owner = canonicalOwners.get(page.canonical);
    if (owner && owner !== route) errors.push(`${route}: duplicate canonical also used by ${owner}`);
    canonicalOwners.set(page.canonical, route);
  }

  const isIndexable = page.robots.toLowerCase().startsWith("index,");
  if (isIndexable) {
    const normalizedTitle = page.title.toLowerCase();
    const owner = indexableTitleOwners.get(normalizedTitle);
    if (owner && owner !== route) errors.push(`${route}: duplicate indexable title also used by ${owner}`);
    indexableTitleOwners.set(normalizedTitle, route);
  }

  for (const link of page.links) {
    if (link.error) {
      errors.push(`${route}: ${link.error}`);
      continue;
    }

    if (pages.has(link.path)) {
      inbound.set(link.path, (inbound.get(link.path) || 0) + 1);
      continue;
    }

    if (!(await staticPathExists(link.path))) {
      errors.push(`${route}: broken internal link ${link.href}`);
    }
  }
}

const sitemap = await readFile(join(distDirectory, "sitemap.xml"), "utf8");
const sitemapPaths = new Set(
  [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => {
    const url = new URL(match[1]);
    return url.pathname.replace(/\/+$/, "") || "/";
  }),
);

for (const [route, page] of pages) {
  const isIndexable = page.robots.toLowerCase().startsWith("index,");
  const inSitemap = sitemapPaths.has(route);

  if (isIndexable && !inSitemap) errors.push(`${route}: indexable page missing from sitemap`);
  if (!isIndexable && inSitemap) errors.push(`${route}: noindex page present in sitemap`);
  if (isIndexable && route !== "/" && (inbound.get(route) || 0) === 0) {
    errors.push(`${route}: indexable page has no internal links pointing to it`);
  }
}

for (const path of sitemapPaths) {
  if (!pages.has(path)) errors.push(`${path}: sitemap URL has no prerendered page`);
}

fail(errors);

const indexableCount = [...pages.values()].filter((page) =>
  page.robots.toLowerCase().startsWith("index,"),
).length;
console.log(
  `Prerendered crawl passed for ${pages.size} HTML pages, ${indexableCount} indexable pages, and ${sitemapPaths.size} sitemap URLs.`,
);
