import { shopCategories } from "../src/data/catalog.js";
import { products } from "../src/data/products.js";
import { IMAGE_RIGHTS_STATUS } from "../src/data/image-rights-policy.js";
import {
  hasPublishedOptionalValue,
  hasSpecificAvailability,
  hasUnsupportedProductClaims,
  requiredSeoChecks,
} from "../src/data/product-seo-policy.js";

const activeProducts = products.filter((product) => product.active !== false);
const categorySlugs = new Set(shopCategories.map((category) => category.slug));
const routeCounts = new Map();

function routeKey(product) {
  return product.slug || product.id;
}

function words(value) {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

for (const product of activeProducts) {
  const key = routeKey(product);
  routeCounts.set(key, (routeCounts.get(key) || 0) + 1);
}

const checks = {
  duplicateRoutes: activeProducts.filter((product) => routeCounts.get(routeKey(product)) > 1),
  invalidCollections: activeProducts.filter((product) => !categorySlugs.has(product.collectionSlug)),
  missingCoreData: activeProducts.filter(
    (product) => !product.id || !product.name || !product.collectionSlug || !product.image,
  ),
  shortDescriptions: activeProducts.filter((product) => words(product.description) < 12),
  missingRecommendedDimensions: activeProducts.filter(
    (product) => !hasPublishedOptionalValue(product.dimensions),
  ),
  missingRecommendedMaterials: activeProducts.filter(
    (product) => !hasPublishedOptionalValue(product.material),
  ),
  missingRecommendedPrice: activeProducts.filter(
    (product) => !(Number(product.price) > 0) || product.offerVerified !== true,
  ),
  missingRecommendedAvailability: activeProducts.filter(
    (product) =>
      !hasSpecificAvailability(product.availability) || product.availabilityVerified !== true,
  ),
  missingRecommendedColor: activeProducts.filter(
    (product) => !product.colors?.filter(Boolean).length,
  ),
  legacyImageRightsUnreviewed: activeProducts.filter(
    (product) =>
      product.isLegacyImageProduct &&
      product.imageRightsStatus === IMAGE_RIGHTS_STATUS.legacyUnverified,
  ),
  futureImageRightsPending: activeProducts.filter(
    (product) =>
      !product.isLegacyImageProduct && product.imageRightsStatus !== IMAGE_RIGHTS_STATUS.confirmed,
  ),
  supplierOrReviewClaims: activeProducts.filter(hasUnsupportedProductClaims),
  customizationOrDeliveryClaims: activeProducts.filter((product) =>
    /customi[sz]|custom size|made to order|delivery support|free delivery|installation/i.test(
      [product.description, ...(product.details || []), ...(product.materialDetails || [])].join(" "),
    ),
  ),
  approvedForSeo: activeProducts.filter((product) => product.seoStatus === "approved"),
  awaitingSeoReview: activeProducts.filter((product) => product.seoStatus === "review"),
  noindex: activeProducts.filter((product) => product.seoStatus === "noindex"),
  offersVerified: activeProducts.filter((product) => product.offerVerified === true),
  availabilityVerified: activeProducts.filter((product) => product.availabilityVerified === true),
  invalidSeoApprovals: activeProducts.filter(
    (product) =>
      product.seoStatus === "approved" &&
      requiredSeoChecks(product, categorySlugs).length > 0,
  ),
  invalidVerifiedOffers: activeProducts.filter(
    (product) => product.offerVerified === true && !(Number(product.price) > 0),
  ),
  invalidVerifiedAvailability: activeProducts.filter(
    (product) =>
      product.availabilityVerified === true &&
      !hasSpecificAvailability(product.availability),
  ),
};

function summarize(name, productsForCheck) {
  const examples = [...new Set(productsForCheck.map(routeKey))].slice(0, 5);
  console.log(`${name}: ${productsForCheck.length}${examples.length ? ` (${examples.join(", ")})` : ""}`);
}

console.log(`Active products: ${activeProducts.length}`);
Object.entries(checks).forEach(([name, productsForCheck]) => summarize(name, productsForCheck));

const fatalCount =
  checks.duplicateRoutes.length +
  checks.invalidCollections.length +
  checks.missingCoreData.length +
  checks.invalidSeoApprovals.length +
  checks.invalidVerifiedOffers.length +
  checks.invalidVerifiedAvailability.length;

if (fatalCount > 0) {
  throw new Error(`Product quality audit found ${fatalCount} fatal catalog issues.`);
}

console.log("Product catalog has no fatal route, collection, verification, or SEO-approval errors.");
console.log("Missing optional specifications are reported above as recommendations and do not fail the audit.");
