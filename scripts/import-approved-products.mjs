import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { importedProducts } from "../src/data/importedProducts.js";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const reviewRoot = join(projectRoot, "import-review");
const publicProductsRoot = join(projectRoot, "public", "products", "betterhomeindia");
const approvedPath = join(reviewRoot, "approved-products.json");
const reviewStatePath = join(reviewRoot, "review-state.json");
const importedProductsPath = join(projectRoot, "src", "data", "importedProducts.js");
const sourceRoot = resolve(
  process.env.BETTERHOME_SOURCE ||
    "C:/Users/furni/OneDrive/Documents/web scraper/data/betterhomeindia",
);
const sourceProductsPath = join(sourceRoot, "products.json");

const categoryMetadata = {
  "bedroom-sets": { category: "Bedroom", label: "Bedroom Sets" },
  beds: { category: "Bedroom", label: "Beds" },
  bookshelves: { category: "Storage Furniture", label: "Bookshelves" },
  "cabinets-sideboards": { category: "Storage Furniture", label: "TV Unit & Cabinets" },
  "centre-tables": { category: "Living Room", label: "Centre Tables" },
  chairs: { category: "Living Room", label: "Chairs" },
  "dining-sets": { category: "Dining", label: "Dining Sets" },
  "dressing-table": { category: "Bedroom", label: "Dressing Tables" },
  "office-furniture": { category: "Office", label: "Office Furniture" },
  "outdoor-furniture": { category: "Outdoor Furniture", label: "Outdoor Furniture" },
  recliners: { category: "Living Room", label: "Recliners" },
  sofas: { category: "Living Room", label: "Sofas" },
  "study-tables": { category: "Office", label: "Study Tables" },
  swings: { category: "Outdoor Furniture", label: "Swings" },
};
const retiredCategories = new Set(["outdoor-chair"]);

function loadJson(path) {
  if (!existsSync(path)) throw new Error(`Missing required file: ${path}`);
  return JSON.parse(readFileSync(path, "utf8"));
}

function cleanText(value) {
  return String(value || "")
    .replace(/\s+in Ahmedabad\b/gi, "")
    .replace(/\bAhmedabad\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function publicProductId(product) {
  return slugify(cleanText(String(product.id || "").replaceAll("-", " ")));
}

function publicFolderName(sequence, slug) {
  return `bh-${String(sequence).padStart(3, "0")}-${slug.slice(0, 36).replace(/-+$/g, "")}`;
}

function imageHash(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function normalizedName(product) {
  return cleanText(product.name).toLowerCase();
}

function sourceImagePaths(sourceProduct) {
  return (sourceProduct.localImages || [])
    .map((image) => resolve(sourceRoot, image.replaceAll("\\", "/")))
    .filter(Boolean);
}

function colorsFor(product) {
  const explicitColors = String(product.color || "")
    .split(",")
    .map((color) => cleanText(color))
    .filter(Boolean);
  if (explicitColors.length) return explicitColors;

  const searchText = [product.name, product.description, product.material].join(" ");
  return [
    "Black",
    "White",
    "Brown",
    "Walnut",
    "Beige",
    "Grey",
    "Blue",
    "Green",
    "Gold",
    "Silver",
    "Teal",
  ].filter((color) => new RegExp(`\\b${color}\\b`, "i").test(searchText));
}

function materialFor(product) {
  const searchText = [product.material, product.description, product.name].join(" ").toLowerCase();
  if (searchText.includes("plastic")) return "Durable plastic";
  if (searchText.includes("engineered wood") && searchText.includes("upholster")) {
    return "Engineered wood with upholstery";
  }
  if (searchText.includes("engineered wood")) return "Engineered wood";
  if (searchText.includes("wood") && searchText.includes("fabric")) return "Wood with fabric upholstery";
  if (searchText.includes("leatherette")) return "Leatherette upholstery";
  if (searchText.includes("fabric")) return "Fabric upholstery";
  if (searchText.includes("metal")) return "Metal";
  if (searchText.includes("wood")) return "Wood finish";
  return "Ask for material details";
}

function detailsFor(product, collectionLabel, material) {
  return [
    collectionLabel,
    `Material: ${material}`,
    product.dimensions ? `Dimensions: ${cleanText(product.dimensions)}` : "",
    `Availability: ${cleanText(product.availability || "Ask store")}`,
  ].filter(Boolean);
}

function tagsFor(product, collectionLabel, colors, material) {
  return [
    slugify(collectionLabel).replaceAll("-", " "),
    ...slugify(cleanText(product.name)).split("-"),
    ...colors.map((color) => color.toLowerCase()),
    material.toLowerCase(),
  ].filter(Boolean);
}

function maxImportedSequence() {
  return Math.max(
    0,
    ...importedProducts
      .map((product) => product.image?.match(/\/bh-(\d+)-/i)?.[1])
      .filter(Boolean)
      .map(Number),
  );
}

function exactDuplicateKeys(products, sourceById) {
  const productsByKey = new Map();
  const duplicates = new Set();

  for (const product of products) {
    const sourceProduct = sourceById.get(product.id);
    const firstImage = sourceImagePaths(sourceProduct)[0];
    if (!firstImage || !existsSync(firstImage)) continue;
    const key = `${normalizedName(product)}::${imageHash(firstImage)}`;
    const matches = productsByKey.get(key) || [];
    matches.push(product);
    productsByKey.set(key, matches);
  }

  for (const matches of productsByKey.values()) {
    if (matches.length < 2) continue;
    matches
      .sort((first, second) => Number(first.id.endsWith("-copy")) - Number(second.id.endsWith("-copy")))
      .slice(1)
      .forEach((product) => duplicates.add(product.id));
  }

  return duplicates;
}

function importedRecord(product, sourceProduct, publicImages) {
  const metadata = categoryMetadata[product.category];
  if (!metadata) throw new Error(`Add storefront metadata for category: ${product.category}`);

  const material = materialFor(product);
  const colors = colorsFor(product);
  const publicId = publicProductId(product);

  return {
    id: publicId,
    slug: publicId,
    name: cleanText(product.name),
    category: metadata.category,
    collectionSlug: product.category,
    badge: "New arrival",
    price: Number(product.price || 0),
    priceLabel: `Rs. ${Number(product.price || 0).toLocaleString("en-IN")}`,
    availability: cleanText(product.availability || "Ask store"),
    colors,
    description: cleanText(product.description),
    details: detailsFor(product, metadata.label, material),
    dimensions: cleanText(sourceProduct.dimensions),
    material,
    tags: tagsFor(product, metadata.label, colors, material),
    image: publicImages[0],
    images: publicImages,
    active: true,
  };
}

const approvedExport = loadJson(approvedPath);
const reviewState = loadJson(reviewStatePath);
const sourceProducts = loadJson(sourceProductsPath);
const sourceById = new Map(sourceProducts.map((product) => [product.id, product]));
const existingIds = new Set(importedProducts.map((product) => product.id));
const approvedProducts = approvedExport.products.filter((product) => product.status === "approved");
const duplicateIds = exactDuplicateKeys(approvedProducts, sourceById);
const records = [];
const skipped = [];
let nextSequence = maxImportedSequence() + 1;

for (const product of approvedProducts) {
  if (retiredCategories.has(product.category)) {
    skipped.push({ id: product.id, reason: "retired category" });
    continue;
  }

  if (existingIds.has(publicProductId(product))) {
    skipped.push({ id: product.id, reason: "already imported" });
    continue;
  }

  if (duplicateIds.has(product.id)) {
    skipped.push({ id: product.id, reason: "exact duplicate within approved batch" });
    continue;
  }

  const sourceProduct = sourceById.get(product.id);
  if (!sourceProduct) throw new Error(`Source product not found: ${product.id}`);

  const sourceImages = sourceImagePaths(sourceProduct);
  if (!sourceImages.length) throw new Error(`No source images found: ${product.id}`);

  for (const sourceImage of sourceImages) {
    if (!existsSync(sourceImage)) throw new Error(`Missing source image: ${sourceImage}`);
  }

  const folderName = publicFolderName(nextSequence, product.id);
  const destinationFolder = join(publicProductsRoot, folderName);
  await mkdir(destinationFolder, { recursive: true });

  const publicImages = [];
  for (const [index, sourceImage] of sourceImages.entries()) {
    const extension = extname(sourceImage).toLowerCase() || ".jpg";
    const publicImage = `/products/betterhomeindia/${folderName}/${index + 1}${extension}`;
    await copyFile(sourceImage, join(destinationFolder, `${index + 1}${extension}`));
    publicImages.push(publicImage);
  }

  records.push(importedRecord(product, sourceProduct, publicImages));
  nextSequence += 1;
}

const updatedProducts = [
  ...importedProducts.filter((product) => !retiredCategories.has(product.collectionSlug)),
  ...records,
];
const generatedFile = `// Generated from reviewed import batches.\n// Use npm run import:approved after reviewing and exporting a batch.\n\nexport const importedProducts = ${JSON.stringify(updatedProducts, null, 2)};\n`;
await writeFile(importedProductsPath, generatedFile, "utf8");

const importedAt = new Date().toISOString();
for (const record of records) {
  const review = reviewState.reviews[record.id];
  if (!review) continue;
  review.status = "imported";
  review.updatedAt = importedAt;
}
for (const item of skipped) {
  const review = reviewState.reviews[item.id];
  if (!review) continue;

  if (item.reason === "already imported") {
    review.status = "imported";
  } else if (item.reason === "exact duplicate within approved batch") {
    review.status = "rejected";
    review.notes = [review.notes, "Skipped during import: exact duplicate product."]
      .filter(Boolean)
      .join(" ");
  } else if (item.reason === "retired category") {
    review.status = "rejected";
    review.notes = [review.notes, "Skipped during import: retired storefront category."]
      .filter(Boolean)
      .join(" ");
  }
  review.updatedAt = importedAt;
}
reviewState.updatedAt = importedAt;
await writeFile(reviewStatePath, `${JSON.stringify(reviewState, null, 2)}\n`, "utf8");

console.log(`Imported ${records.length} approved products.`);
if (skipped.length) {
  console.log(`Skipped ${skipped.length} products:`);
  for (const item of skipped) console.log(`- ${item.id}: ${item.reason}`);
}
