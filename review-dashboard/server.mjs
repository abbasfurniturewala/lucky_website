import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { shopCategories } from "../src/data/catalog.js";
import {
  IMAGE_RIGHTS_STATUS,
  isImageRightsConfirmed,
  normalizeImageRightsStatus,
} from "../src/data/image-rights-policy.js";
import {
  recommendedProductChecks,
  requiredSeoChecks,
} from "../src/data/product-seo-policy.js";
import { legacyReviewProductIds } from "./legacy-review-product-ids.js";

const dashboardRoot = resolve(fileURLToPath(new URL(".", import.meta.url)));
const projectRoot = resolve(dashboardRoot, "..");
const reviewRoot = join(projectRoot, "import-review");
const sourceRoot = resolve(
  process.env.BETTERHOME_SOURCE ||
    "C:/Users/furni/OneDrive/Documents/web scraper/data/betterhomeindia",
);
const sourceImagesRoot = join(sourceRoot, "images");
const sourceProductsPath = join(sourceRoot, "products.json");
const reviewCsvPath = join(reviewRoot, "betterhomeindia-product-review.csv");
const statePath = resolve(process.env.REVIEW_STATE_PATH || join(reviewRoot, "review-state.json"));
const exportPath = resolve(
  process.env.REVIEW_EXPORT_PATH || join(reviewRoot, "approved-products.json"),
);
const host = "127.0.0.1";
const port = Number(process.env.REVIEW_PORT || 4174);

const defaultCategories = [
  ["sofas", "Sofas"],
  ["recliners", "Recliners"],
  ["beds", "Beds"],
  ["bedroom-sets", "Bedroom Sets"],
  ["dining-sets", "Dining Sets"],
  ["centre-tables", "Centre Tables"],
  ["study-tables", "Study Tables"],
  ["wardrobes", "Wardrobes"],
  ["cabinets-sideboards", "TV Unit & Cabinets"],
  ["bookshelves", "Bookshelves"],
  ["shoe-racks", "Shoe Racks"],
  ["office-furniture", "Office Furniture"],
  ["chairs", "Chairs"],
  ["outdoor-furniture", "Outdoor Furniture"],
  ["swings", "Swings & Jhula"],
  ["mixed-decor", "Mixed Decor"],
  ["manual-review", "Manual Review"],
].map(([slug, name]) => ({ slug, name, custom: false }));

const prioritySeoCategories = new Set([
  "sofas",
  "beds",
  "dining-sets",
  "wardrobes",
  "centre-tables",
]);
const seoEligibleCategorySlugs = new Set(shopCategories.map((category) => category.slug));

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".avif", "image/avif"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
]);

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];

    if (character === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(value);
      value = "";
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
    } else {
      value += character;
    }
  }

  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }

  const [headers = [], ...entries] = rows;
  return entries.map((entry) =>
    Object.fromEntries(headers.map((header, index) => [header, entry[index] || ""])),
  );
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleCaseSlug(slug) {
  return String(slug || "")
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function cleanMaterial(material) {
  return cleanCustomerText(
    String(material || "")
    .replace(/^material\s*:\s*/i, "")
    .trim(),
  );
}

function cleanCustomerText(value) {
  return String(value || "")
    .replace(/\s+in Ahmedabad\b/gi, "")
    .replace(/\bAhmedabad\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function guessColor(product) {
  const searchText = [product.name, product.description, ...(product.details || [])].join(" ");
  const colors = [
    "Black",
    "White",
    "Brown",
    "Walnut",
    "Beige",
    "Grey",
    "Gray",
    "Blue",
    "Green",
    "Red",
    "Gold",
    "Silver",
    "Teak",
  ];
  return colors.find((color) => new RegExp(`\\b${color}\\b`, "i").test(searchText)) || "";
}

function reviewStatus(csvRow) {
  if (csvRow.importStatus === "imported") return "imported";
  if (csvRow.reviewDecision === "exclude") return "rejected";
  return "unreviewed";
}

function encodeImagePath(localPath) {
  const relativePath = String(localPath || "")
    .replaceAll("\\", "/")
    .replace(/^images\//i, "");
  return `/source-images/${relativePath
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

function loadJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, "utf8"));
}

const sourceProducts = loadJson(sourceProductsPath, []);
const sourceById = new Map(sourceProducts.map((product) => [product.id, product]));
const csvRows = parseCsv(readFileSync(reviewCsvPath, "utf8"));
const csvById = new Map(csvRows.map((row) => [row.id, row]));
let reviewState = loadJson(statePath, {
  version: 1,
  updatedAt: "",
  categories: [],
  reviews: {},
});

function categories() {
  const mappedCategories = [
    ...csvRows.map((row) => row.recommendedCollection),
    ...sourceProducts.map((product) => product.collectionSlug),
  ]
    .filter(Boolean)
    .map((slug) => ({ slug, name: titleCaseSlug(slug), custom: false }));
  const combined = [...mappedCategories, ...defaultCategories, ...(reviewState.categories || [])];
  return [...new Map(combined.map((category) => [category.slug, category])).values()].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

function productFor(id) {
  const source = sourceById.get(id);
  if (!source) return null;

  const csv = csvById.get(id) || {};
  const edits = reviewState.reviews[id] || {};
  const localImages = source.localImages?.length
    ? source.localImages
    : String(csv.localImages || "")
        .split("|")
        .map((image) => image.trim())
        .filter(Boolean);

  const isLegacyImageProduct = legacyReviewProductIds.has(id);
  const imageRightsStatus = edits.imageRightsConfirmed === true
    ? IMAGE_RIGHTS_STATUS.confirmed
    : normalizeImageRightsStatus(
        edits.imageRightsStatus,
        isLegacyImageProduct
          ? IMAGE_RIGHTS_STATUS.legacyUnverified
          : IMAGE_RIGHTS_STATUS.pending,
      );
  const product = {
    id: source.id,
    name: edits.name ?? source.name ?? "",
    category: edits.category ?? csv.recommendedCollection ?? source.collectionSlug ?? "",
    price: edits.price ?? source.priceCurrentValue ?? Number(csv.price || 0),
    availability: edits.availability ?? source.availability ?? csv.availability ?? "",
    color: edits.color ?? guessColor(source),
    material: edits.material ?? cleanMaterial(source.material),
    tags: edits.tags ?? (source.tags || []).join(", "),
    description: edits.description ?? cleanCustomerText(source.description),
    notes: edits.notes ?? csv.reason ?? "",
    imageAlt: edits.imageAlt ?? "",
    imageRightsSource: edits.imageRightsSource ?? "",
    status: edits.status ?? reviewStatus(csv),
    seoStatus: edits.seoStatus ?? "review",
    offerVerified: edits.offerVerified === true,
    availabilityVerified: edits.availabilityVerified === true,
    detailsVerified: edits.detailsVerified === true,
    imageRightsStatus,
    imageRightsConfirmed: isImageRightsConfirmed(imageRightsStatus),
    isLegacyImageProduct,
    updatedAt: edits.updatedAt ?? "",
    images: localImages.map(encodeImagePath),
    details: source.details || [],
    dimensions: edits.dimensions ?? source.dimensions ?? "",
    sourceCategory: source.category || csv.sourceCategory || "(none)",
    suggestedCategory: csv.recommendedCollection || "",
    suggestedAction: csv.action || "",
    sourceUrl: source.url || csv.sourceUrl || "",
    websitePath: csv.websitePath || "",
  };

  const policyProduct = { ...product, details: [], materialDetails: [] };
  const seoRequiredMissing = requiredSeoChecks(policyProduct, seoEligibleCategorySlugs);
  const seoRecommendedMissing = recommendedProductChecks(policyProduct);

  return {
    ...product,
    seoRequiredMissing,
    seoRecommendedMissing,
    seoMissing: seoRequiredMissing,
    prioritySeo: prioritySeoCategories.has(product.category),
  };
}

function productSummary(id) {
  const product = productFor(id);
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    status: product.status,
    seoStatus: product.seoStatus,
    seoRequiredMissing: product.seoRequiredMissing,
    seoRecommendedMissing: product.seoRecommendedMissing,
    seoMissing: product.seoRequiredMissing,
    isLegacyImageProduct: product.isLegacyImageProduct,
    prioritySeo: prioritySeoCategories.has(product.category),
    sourceCategory: product.sourceCategory,
    suggestedAction: product.suggestedAction,
    thumbnail: product.images[0] || "",
  };
}

function allSummaries() {
  return sourceProducts.map((product) => productSummary(product.id));
}

async function saveState() {
  reviewState.updatedAt = new Date().toISOString();
  await mkdir(reviewRoot, { recursive: true });
  const temporaryPath = `${statePath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(reviewState, null, 2)}\n`, "utf8");
  await rename(temporaryPath, statePath);
}

function sendJson(response, status, value) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(value));
}

function sendFile(response, path) {
  if (!existsSync(path)) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": mimeTypes.get(extname(path).toLowerCase()) || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  response.end(readFileSync(path));
}

function safePath(root, requestPath) {
  const decodedPath = decodeURIComponent(requestPath).replace(/^[/\\]+/, "");
  const resolvedPath = resolve(root, normalize(decodedPath));
  return resolvedPath === root || resolvedPath.startsWith(`${root}${sep}`) ? resolvedPath : null;
}

async function readBody(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 1_000_000) throw new Error("Request is too large");
  }
  return body ? JSON.parse(body) : {};
}

function cleanReview(payload, existingProduct) {
  const imageRightsStatus = payload.imageRightsConfirmed === true
    ? IMAGE_RIGHTS_STATUS.confirmed
    : normalizeImageRightsStatus(
        payload.imageRightsStatus,
        existingProduct.isLegacyImageProduct
          ? IMAGE_RIGHTS_STATUS.legacyUnverified
          : IMAGE_RIGHTS_STATUS.pending,
      );

  return {
    name: String(payload.name || "").trim(),
    category: slugify(payload.category),
    price: Number(payload.price || 0),
    availability: String(payload.availability || "").trim(),
    color: String(payload.color || "").trim(),
    material: String(payload.material || "").trim(),
    tags: String(payload.tags || "").trim(),
    description: String(payload.description || "").trim(),
    dimensions: String(payload.dimensions || "").trim(),
    notes: String(payload.notes || "").trim(),
    imageAlt: String(payload.imageAlt || "").trim(),
    imageRightsSource: String(payload.imageRightsSource || "").trim(),
    status: ["approved", "rejected", "later", "unreviewed", "imported"].includes(payload.status)
      ? payload.status
      : "unreviewed",
    seoStatus: ["review", "approved", "noindex"].includes(payload.seoStatus)
      ? payload.seoStatus
      : "review",
    offerVerified: payload.offerVerified === true,
    availabilityVerified: payload.availabilityVerified === true,
    detailsVerified: payload.detailsVerified === true,
    imageRightsStatus,
    imageRightsConfirmed: isImageRightsConfirmed(imageRightsStatus),
    updatedAt: new Date().toISOString(),
  };
}

function validateSeoReview(product, review) {
  if (review.seoStatus !== "approved") return;

  const problems = requiredSeoChecks(
    { ...product, ...review, details: [], materialDetails: [] },
    seoEligibleCategorySlugs,
  );

  if (problems.length) {
    throw new Error(`SEO approval still needs: ${problems.join(", ")}.`);
  }
}

async function exportApproved() {
  const approvedProducts = sourceProducts
    .map((source) => productFor(source.id))
    .filter(
      (product) =>
        product.status === "approved" ||
        (product.status === "imported" && product.seoStatus === "approved"),
    );

  await writeFile(
    exportPath,
    `${JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        count: approvedProducts.length,
        products: approvedProducts,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  return approvedProducts.length;
}

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url, `http://${host}:${port}`);
    const path = requestUrl.pathname;

    if (request.method === "GET" && path === "/api/bootstrap") {
      sendJson(response, 200, {
        categories: categories(),
        products: allSummaries(),
        sourceCount: sourceProducts.length,
        stateUpdatedAt: reviewState.updatedAt,
      });
      return;
    }

    if (request.method === "GET" && path.startsWith("/api/products/")) {
      const id = decodeURIComponent(path.slice("/api/products/".length));
      const product = productFor(id);
      sendJson(response, product ? 200 : 404, product || { error: "Product not found" });
      return;
    }

    if (request.method === "POST" && path.startsWith("/api/reviews/")) {
      const id = decodeURIComponent(path.slice("/api/reviews/".length));
      if (!sourceById.has(id)) {
        sendJson(response, 404, { error: "Product not found" });
        return;
      }

      const existingProduct = productFor(id);
      const review = cleanReview(await readBody(request), existingProduct);
      try {
        validateSeoReview(productFor(id), review);
      } catch (error) {
        sendJson(response, 400, { error: error.message });
        return;
      }
      reviewState.reviews[id] = review;
      await saveState();
      sendJson(response, 200, { product: productFor(id), summary: productSummary(id) });
      return;
    }

    if (request.method === "POST" && path === "/api/categories") {
      const payload = await readBody(request);
      const name = String(payload.name || "").trim();
      const slug = slugify(payload.slug || name);

      if (!name || !slug) {
        sendJson(response, 400, { error: "Enter a category name" });
        return;
      }

      if (!categories().some((category) => category.slug === slug)) {
        reviewState.categories.push({ name, slug, custom: true });
        await saveState();
      }

      sendJson(response, 200, { categories: categories(), selected: slug });
      return;
    }

    if (request.method === "POST" && path === "/api/export-approved") {
      const count = await exportApproved();
      sendJson(response, 200, {
        count,
        file: exportPath,
        message: `${count} approved products exported`,
      });
      return;
    }

    if (request.method === "GET" && path.startsWith("/source-images/")) {
      const imagePath = safePath(sourceImagesRoot, path.slice("/source-images/".length));
      if (!imagePath) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }
      sendFile(response, imagePath);
      return;
    }

    const staticPath = path === "/" ? "index.html" : path.slice(1);
    const assetPath = safePath(dashboardRoot, staticPath);
    if (!assetPath) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }
    sendFile(response, assetPath);
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: error.message || "Unexpected server error" });
  }
});

server.listen(port, host, () => {
  console.log(`Lucky Interiors product review dashboard: http://${host}:${port}`);
  console.log(`Source products: ${sourceProducts.length}`);
  console.log(`Review edits: ${Object.keys(reviewState.reviews).length}`);
});
