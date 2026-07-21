import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { business, shopCategories } from "../src/data/catalog.js";
import { products } from "../src/data/products.js";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const outputDirectory = resolve(projectRoot, "tmp/pdfs");
const outputPath = resolve(outputDirectory, "catalog-data.json");
const productsPerCategory = Number(process.env.CATALOG_PRODUCTS_PER_CATEGORY || 4);

const categoryCodes = {
  sofas: "SOF",
  beds: "BED",
  "bedroom-sets": "BDS",
  "dining-sets": "DIN",
  "study-tables": "STD",
  "centre-tables": "CTR",
  recliners: "REC",
  wardrobes: "WAR",
  "cabinets-sideboards": "TVC",
  bookshelves: "BKS",
  "office-furniture": "OFF",
  chairs: "CHR",
  "dressing-table": "DRS",
  "outdoor-furniture": "OUT",
  swings: "SWG",
};

const placeholderPattern =
  /ask for|confirm|not provided|model-dependent|standard .* sizing|fits standard|custom siz|available on request/i;

function numericPrice(product) {
  return typeof product.price === "number" && product.price > 0 ? product.price : null;
}

function localImage(product) {
  const image = (product.images?.length ? product.images[0] : product.image) || "";
  return image.startsWith("/") ? resolve(projectRoot, "public", image.slice(1)) : "";
}

function qualityScore(product) {
  let score = 0;
  if (localImage(product)) score += 12;
  if (String(product.description || "").length >= 80) score += 4;
  if (product.material && !placeholderPattern.test(product.material)) score += 3;
  if (product.dimensions && !placeholderPattern.test(product.dimensions)) score += 3;
  if ((product.details || []).length >= 2) score += 2;
  if ((product.images || []).length > 1) score += 1;
  if (numericPrice(product)) score += 1;
  return score;
}

function safeHighlights(product) {
  return (product.details || [])
    .filter(Boolean)
    .filter((detail) => !/availability\s*:|warranty|rating|delivery|installation|custom/i.test(detail))
    .slice(0, 2);
}

function catalogDescription(product, categoryName) {
  if (product.detailsVerified === true && String(product.description || "").trim().length >= 60) {
    return product.description;
  }

  return `${product.name} is included in our ${categoryName.toLowerCase()} selection. Share the product code to confirm the current specifications and ordering details.`;
}

function uniqueByProductName(categoryProducts) {
  const seenNames = new Set();

  return categoryProducts.filter((product) => {
    const normalizedName = String(product.name || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

    if (!normalizedName || seenNames.has(normalizedName)) return false;
    seenNames.add(normalizedName);
    return true;
  });
}

const activeProducts = products.filter((product) => product.active !== false);
const categories = shopCategories
  .map((category) => {
    const categoryProducts = uniqueByProductName(
      activeProducts
        .filter((product) => product.collectionSlug === category.slug)
        .filter((product) => localImage(product))
        .sort(
          (first, second) =>
            qualityScore(second) - qualityScore(first) || first.name.localeCompare(second.name),
        ),
    )
      .slice(0, productsPerCategory)
      .map((product, index) => ({
        id: product.id,
        code: `LI-${categoryCodes[category.slug] || "PRD"}-${String(index + 1).padStart(3, "0")}`,
        slug: product.slug || product.id,
        name: product.name,
        description: catalogDescription(product, category.name),
        dimensions:
          product.detailsVerified === true &&
          product.dimensions &&
          !placeholderPattern.test(product.dimensions)
            ? product.dimensions
            : "Confirm dimensions",
        material:
          product.detailsVerified === true &&
          product.material &&
          !placeholderPattern.test(product.material)
            ? product.material
            : "Confirm material and finish",
        highlights: safeHighlights(product),
        imagePath: localImage(product),
        websiteUrl: `https://luckyinteriorsfurniture.com/products/${product.slug || product.id}`,
        price: product.offerVerified === true ? numericPrice(product) : null,
      }));

    return {
      name: category.name,
      slug: category.slug,
      description: category.description,
      products: categoryProducts,
    };
  })
  .filter((category) => category.products.length);

const catalog = {
  generatedAt: new Date().toISOString(),
  title: "Lucky Interiors Furniture - Product Catalog",
  subtitle: "Selected furniture range for Mumbai homes",
  business: {
    name: business.name,
    email: business.email,
    phoneDisplay: business.phoneDisplay,
    whatsappNumber: business.whatsappNumber,
    website: "https://luckyinteriorsfurniture.com",
    logoPath: resolve(projectRoot, "public/lucky-interiors-logo-640.webp"),
  },
  categories,
};

await mkdir(outputDirectory, { recursive: true });
await writeFile(outputPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

console.log(`Catalog data: ${outputPath}`);
console.log(`Categories: ${categories.length}`);
console.log(`Products: ${categories.reduce((total, category) => total + category.products.length, 0)}`);
