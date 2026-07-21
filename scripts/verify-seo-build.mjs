import { readdir, readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

const distDirectory = resolve("dist");

async function countIndexFiles(directory) {
  let count = 0;

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      count += await countIndexFiles(entryPath);
    } else if (entry.name === "index.html") {
      count += 1;
    }
  }

  return count;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function occurrences(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

async function page(relativePath) {
  return readFile(join(distDirectory, relativePath), "utf8");
}

const home = await page("index.html");
const contact = await page("contact/index.html");
const about = await page("about/index.html");
const privacy = await page("privacy/index.html");
const terms = await page("terms/index.html");
const measurementGuide = await page("guides/measure-for-furniture-delivery/index.html");
const sofaGuide = await page("guides/sofa-size-guide-small-living-rooms/index.html");
const sofas = await page("collections/sofas/index.html");
const shoeRacks = await page("collections/shoe-racks/index.html");
const product = await page("products/brown-2-seater-sofa/index.html");
const search = await page("search/index.html");
const notFound = await page("404.html");
const sitemap = await page("sitemap.xml");
const logo320 = await stat(join(distDirectory, "lucky-interiors-logo-320.webp"));
const logo640 = await stat(join(distDirectory, "lucky-interiors-logo-640.webp"));

assert((await countIndexFiles(distDirectory)) === 549, "Expected 549 prerendered index.html route files.");
assert(home.includes("Furniture Store in Mumbai"), "Homepage SEO title is missing.");
assert(home.includes("<h1>Furniture for Mumbai homes</h1>"), "Homepage SEO H1 is missing.");
assert(home.includes('type="image/webp"'), "Responsive WebP logo source is missing.");
assert(home.includes("lucky-interiors-logo-320.webp 320w"), "Responsive 320px logo source is missing.");
assert(home.includes("lucky-interiors-logo-640.webp 640w"), "Responsive 640px logo source is missing.");
assert(logo320.size <= 5_000, "The 320px header logo exceeds its 5 KB budget.");
assert(logo640.size <= 10_000, "The 640px header logo exceeds its 10 KB budget.");
assert(contact.includes('rel="canonical" href="https://luckyinteriorsfurniture.com/contact"'), "Contact canonical is wrong.");
assert(about.includes("<h1>About Lucky Interiors Furniture</h1>"), "About page H1 is missing.");
assert(privacy.includes("<h1>Privacy policy</h1>"), "Privacy page H1 is missing.");
assert(terms.includes("<h1>Website terms</h1>"), "Terms page H1 is missing.");
assert(measurementGuide.includes("<h1>How to measure for furniture delivery</h1>"), "Measurement guide H1 is missing.");
assert(sofaGuide.includes("<h1>Sofa size guide for compact living rooms</h1>"), "Sofa guide H1 is missing.");
assert(measurementGuide.includes('"@type":"Article"'), "Measurement guide Article schema is missing.");
assert(measurementGuide.includes('"headline":"How to measure for furniture delivery"'), "Measurement guide headline schema is missing.");
assert(measurementGuide.includes('"inLanguage":"en-IN"'), "Guide language schema is missing.");
assert(measurementGuide.includes('"author":{"@id":"https://luckyinteriorsfurniture.com/#organization"}'), "Guide organization author is missing.");
assert(!measurementGuide.includes('"datePublished"'), "Guide schema must not invent a publication date.");
assert(measurementGuide.includes('href="/collections/wardrobes"'), "Measurement guide lacks collection links.");
assert(sofas.includes('rel="canonical" href="https://luckyinteriorsfurniture.com/collections/sofas"'), "Sofas canonical is wrong.");
assert(sofas.includes("<title>Sofas in Mumbai | Sofa Sets | Lucky Interiors</title>"), "Sofas SEO title is missing.");
assert(sofas.includes("<h1>Sofas in Mumbai</h1>"), "Sofas H1 is missing from initial HTML.");
assert(sofas.includes("Choosing a sofa for your living room"), "Sofas buying guide is missing from initial HTML.");
assert(!sofas.includes("starter products mapped"), "Internal starter-product copy must not be public.");
assert(product.includes("<h1>Brown 2-Seater Sofa</h1>"), "Product H1 is missing from initial HTML.");
assert(product.includes("Room fit, finish, and delivery access"), "Product planning guidance is missing.");
assert(product.includes('href="/guides/measure-for-furniture-delivery"'), "Product page lacks the delivery measurement guide link.");
assert(product.includes('href="/guides/sofa-size-guide-small-living-rooms"'), "Sofa page lacks the compact sofa guide link.");
assert(product.includes("Product%20page%3A%20https%3A%2F%2Fluckyinteriorsfurniture.com%2Fproducts%2Fbrown-2-seater-sofa"), "Product WhatsApp link must include the canonical product URL.");
assert(product.includes('alt="Brown 2-Seater Sofa, product view 1"'), "Product image fallback alt text is missing.");
assert(product.includes('name="robots" content="noindex,follow"'), "Unreviewed products must be noindex.");
assert(
  product.includes("Exact dimensions are not currently published for this product. Please contact us to confirm them before ordering."),
  "Missing dimensions must use the approved honest guidance.",
);
assert(!product.includes("<dd>Confirm availability</dd>"), "Unknown availability placeholders must be omitted.");
assert(!product.includes("Availability: In stock"), "Unverified in-stock claims must not be rendered.");
assert(product.includes('id="organization-jsonld"'), "Organization schema is missing.");
assert(product.includes('id="website-jsonld"'), "WebSite schema is missing.");
assert(!product.includes('"@type":"Product"'), "Unreviewed products must not emit Product schema.");
assert(!product.includes('"offers"'), "Unverified Product Offer schema must not be emitted.");
assert(!home.includes('"@type":"FurnitureStore"'), "Unverified FurnitureStore schema must not be emitted.");
assert(home.includes('"email":"hello@luckyinteriorsfurniture.com"'), "Confirmed organization email is missing from schema.");
assert(home.includes('"telephone":"+919619578893"'), "Confirmed organization phone is missing from schema.");
assert(!home.includes('"address":'), "Unconfirmed postal address must not be emitted in schema.");
assert(!home.includes("Shop No.4/5"), "Unconfirmed postal-address copy must not be rendered.");
assert(home.includes("Mumbai location"), "Confirmed Mumbai location label is missing.");
assert(!home.includes('"geo":'), "Unconfirmed public-location geo must not be emitted in schema.");
assert(!home.includes('"openingHours"'), "Unverified opening-hours schema must not be emitted.");
assert(!home.includes("Open daily: 10:00 AM - 9:00 PM"), "Unverified opening-hours copy must not be rendered.");
assert(!home.includes('"priceRange"'), "Unverified price-range schema must not be emitted.");
assert(shoeRacks.includes('name="robots" content="noindex,follow"'), "Empty Shoe Racks category must be noindex.");
assert(search.includes('name="robots" content="noindex,follow"'), "Search page must be noindex.");
assert(notFound.includes('name="robots" content="noindex,follow"'), "404 page must be noindex.");
assert(notFound.includes("We could not find that page."), "Custom 404 content is missing.");
assert(occurrences(product, /rel="canonical"/g) === 1, "Product page must contain exactly one canonical.");
assert(!sitemap.includes("/collections/shoe-racks"), "Empty Shoe Racks category must not be in the sitemap.");
assert(occurrences(sitemap, /<url>/g) === 22, "Expected 22 approved canonical URLs in the sitemap.");
assert(sitemap.includes("/guides/measure-for-furniture-delivery"), "Measurement guide must be in the sitemap.");
assert(!sitemap.includes("/products/"), "Unreviewed products must not be included in the sitemap.");
assert(!sitemap.includes("<lastmod>"), "Sitemap must not use an inaccurate build-date lastmod.");

console.log("SEO build verification passed for 549 prerendered routes, approval-gated sitemap, schema, guides, and 404 output.");
