import { existsSync, readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { importedProducts } from "../src/data/importedProducts.js";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const productsPath = join(projectRoot, "src", "data", "products.js");
const reviewCsvPath = join(projectRoot, "import-review", "betterhomeindia-product-review.csv");
const reviewStatePath = join(projectRoot, "import-review", "review-state.json");
const catalogOutputPath = join(projectRoot, "src", "data", "legacy-catalog-product-ids.js");
const reviewOutputPath = join(projectRoot, "review-dashboard", "legacy-review-product-ids.js");
const migrationDate = "2026-07-19";

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

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((first, second) => first.localeCompare(second));
}

function moduleSource({ exportName, ids, purpose }) {
  return `// One-time image-policy migration snapshot created ${migrationDate}.
// ${purpose}
// Do not add future products to this list.

export const ${exportName} = new Set(${JSON.stringify(ids, null, 2)});
`;
}

const productsSource = readFileSync(productsPath, "utf8");
const productsStart = productsSource.indexOf("export const products = [");
const importedSpread = productsSource.indexOf("...importedProducts", productsStart);

if (productsStart < 0 || importedSpread < 0) {
  throw new Error("Could not locate the current manual product block for migration.");
}

const manualProductIds = [...productsSource.slice(productsStart, importedSpread).matchAll(/\bid:\s*"([^"]+)"/g)]
  .map((match) => match[1]);
const catalogProductIds = uniqueSorted([
  ...manualProductIds,
  ...importedProducts.filter((product) => product.active !== false).map((product) => product.id),
]);

const csvRows = parseCsv(readFileSync(reviewCsvPath, "utf8"));
const reviewState = existsSync(reviewStatePath)
  ? JSON.parse(readFileSync(reviewStatePath, "utf8"))
  : { reviews: {} };
const legacyReviewIds = uniqueSorted(
  csvRows
    .filter((row) => {
      const savedStatus = reviewState.reviews?.[row.id]?.status;
      return savedStatus ? savedStatus === "imported" : row.importStatus === "imported";
    })
    .map((row) => row.id),
);

await writeFile(
  catalogOutputPath,
  moduleSource({
    exportName: "legacyCatalogProductIds",
    ids: catalogProductIds,
    purpose: "These product IDs existed in the public catalog when the legacy image policy was adopted.",
  }),
  "utf8",
);
await writeFile(
  reviewOutputPath,
  moduleSource({
    exportName: "legacyReviewProductIds",
    ids: legacyReviewIds,
    purpose: "These source IDs were already imported when the legacy image policy was adopted.",
  }),
  "utf8",
);

console.log(`Legacy catalog products: ${catalogProductIds.length}`);
console.log(`Legacy dashboard products: ${legacyReviewIds.length}`);
