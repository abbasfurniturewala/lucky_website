import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { importedProducts } from "../src/data/importedProducts.js";
import {
  IMAGE_RIGHTS_STATUS,
  isImageRightsConfirmed,
  normalizeImageRightsStatus,
} from "../src/data/image-rights-policy.js";
import {
  hasPublishedOptionalValue,
  hasSpecificAvailability,
} from "../src/data/product-seo-policy.js";

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
  const material = cleanText(product.material);
  return hasPublishedOptionalValue(material) ? material : "";
}

function detailsFor(product, collectionLabel, material) {
  return [
    collectionLabel,
    material ? `Material: ${material}` : "",
    hasPublishedOptionalValue(product.dimensions)
      ? `Dimensions: ${cleanText(product.dimensions)}`
      : "",
    product.availabilityVerified === true && hasSpecificAvailability(product.availability)
      ? `Availability: ${cleanText(product.availability)}`
      : "",
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
  const price = Number(product.price) > 0 ? Number(product.price) : null;
  const dimensions = cleanText(product.dimensions || sourceProduct.dimensions);
  const availability =
    product.availabilityVerified === true && hasSpecificAvailability(product.availability)
      ? cleanText(product.availability)
      : "";
  const imageRightsStatus = product.imageRightsConfirmed === true
    ? IMAGE_RIGHTS_STATUS.confirmed
    : normalizeImageRightsStatus(product.imageRightsStatus, IMAGE_RIGHTS_STATUS.pending);

  return {
    id: publicId,
    slug: publicId,
    name: cleanText(product.name),
    category: metadata.category,
    collectionSlug: product.category,
    badge: "New arrival",
    price,
    priceLabel: price ? `Rs. ${price.toLocaleString("en-IN")}` : "Price on request",
    availability,
    colors,
    description: cleanText(product.description),
    details: detailsFor(product, metadata.label, material),
    dimensions: hasPublishedOptionalValue(dimensions) ? dimensions : "",
    material,
    tags: tagsFor(product, metadata.label, colors, material),
    image: publicImages[0],
    images: publicImages,
    imageAlts: publicImages.map((_, index) =>
      index === 0 && product.imageAlt
        ? cleanText(product.imageAlt)
        : `${cleanText(product.name)}, product view ${index + 1}`,
    ),
    imageRightsSource: cleanText(product.imageRightsSource),
    imageRightsStatus,
    active: true,
    seoStatus: product.seoStatus || "review",
    offerVerified: product.offerVerified === true,
    availabilityVerified: product.availabilityVerified === true,
    detailsVerified: product.detailsVerified === true,
    imageRightsConfirmed: isImageRightsConfirmed(imageRightsStatus),
    updatedAt: product.updatedAt || "",
  };
}

const approvedExport = loadJson(approvedPath);
const reviewState = loadJson(reviewStatePath);
const sourceProducts = loadJson(sourceProductsPath);
const sourceById = new Map(sourceProducts.map((product) => [product.id, product]));
const existingById = new Map(importedProducts.map((product) => [product.id, product]));
const approvedProducts = approvedExport.products.filter(
  (product) =>
    product.status === "approved" ||
    (product.status === "imported" && product.seoStatus === "approved"),
);
const duplicateIds = exactDuplicateKeys(approvedProducts, sourceById);
const records = [];
const updatedRecords = [];
const processedReviews = [];
const skipped = [];
let nextSequence = maxImportedSequence() + 1;

for (const product of approvedProducts) {
  if (retiredCategories.has(product.category)) {
    skipped.push({ id: product.id, reason: "retired category" });
    continue;
  }

  if (duplicateIds.has(product.id)) {
    skipped.push({ id: product.id, reason: "exact duplicate within approved batch" });
    continue;
  }

  const sourceProduct = sourceById.get(product.id);
  if (!sourceProduct) throw new Error(`Source product not found: ${product.id}`);

  const existingProduct = existingById.get(publicProductId(product));
  if (existingProduct) {
    const publicImages = existingProduct.images?.length
      ? existingProduct.images
      : [existingProduct.image].filter(Boolean);
    const record = importedRecord(product, sourceProduct, publicImages);
    updatedRecords.push(record);
    processedReviews.push({ sourceId: product.id, record });
    continue;
  }

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

  const record = importedRecord(product, sourceProduct, publicImages);
  records.push(record);
  processedReviews.push({ sourceId: product.id, record });
  nextSequence += 1;
}

const replacementsById = new Map(updatedRecords.map((product) => [product.id, product]));
const updatedProducts = [
  ...importedProducts
    .filter((product) => !retiredCategories.has(product.collectionSlug))
    .map((product) => replacementsById.get(product.id) || product),
  ...records,
];
const generatedFile = `// Generated from reviewed import batches.\n// Use npm run import:approved after reviewing and exporting a batch.\n\nexport const importedProducts = ${JSON.stringify(updatedProducts, null, 2)};\n`;
await writeFile(importedProductsPath, generatedFile, "utf8");

const importedAt = new Date().toISOString();
for (const { sourceId, record } of processedReviews) {
  const review = reviewState.reviews[sourceId];
  if (!review) continue;
  review.status = "imported";
  review.updatedAt = importedAt;
}
for (const item of skipped) {
  const review = reviewState.reviews[item.id];
  if (!review) continue;

  if (item.reason === "exact duplicate within approved batch") {
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

console.log(`Imported ${records.length} new approved products.`);
console.log(`Updated ${updatedRecords.length} existing approved products.`);
if (skipped.length) {
  console.log(`Skipped ${skipped.length} products:`);
  for (const item of skipped) console.log(`- ${item.id}: ${item.reason}`);
}
