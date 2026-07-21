import { strict as assert } from "node:assert";

import { legacyReviewProductIds } from "../review-dashboard/legacy-review-product-ids.js";
import { legacyCatalogProductIds } from "../src/data/legacy-catalog-product-ids.js";
import { IMAGE_RIGHTS_STATUS } from "../src/data/image-rights-policy.js";
import {
  MISSING_DIMENSIONS_MESSAGE,
  recommendedProductChecks,
  requiredSeoChecks,
} from "../src/data/product-seo-policy.js";
import { buildProductSchema } from "../src/data/product-schema.js";
import { newProducts, products } from "../src/data/products.js";

const categorySlugs = new Set(["sofas"]);
const validDescription =
  "A compact brown two-seater sofa with a simple profile, visible padded arms, and a clean front-facing catalog photograph.";
const baseProduct = {
  id: "policy-test-sofa",
  name: "Policy Test Sofa",
  category: "sofas",
  description: validDescription,
  images: ["/products/test-sofa.jpg"],
  imageAlt: "Brown two-seater sofa photographed from the front",
  detailsVerified: true,
  imageRightsStatus: IMAGE_RIGHTS_STATUS.legacyUnverified,
  imageRightsSource: "",
  isLegacyImageProduct: true,
  dimensions: "",
  material: "",
  price: null,
  offerVerified: false,
  availability: "",
  availabilityVerified: false,
  color: "",
};

assert.deepEqual(
  requiredSeoChecks(baseProduct, categorySlugs),
  [],
  "Legacy products must not be blocked by missing optional specifications or image-rights evidence.",
);
assert.deepEqual(recommendedProductChecks(baseProduct), [
  "Add exact dimensions",
  "Add material or finish",
  "Add and verify the current price",
  "Add and verify current availability",
  "Add color",
  "Record image-rights evidence for this legacy product (non-blocking)",
]);

const newPendingProduct = {
  ...baseProduct,
  isLegacyImageProduct: false,
  imageRightsStatus: IMAGE_RIGHTS_STATUS.pending,
};
assert.deepEqual(requiredSeoChecks(newPendingProduct, categorySlugs).slice(-2), [
  "Image rights confirmed for this new product",
  "Image-rights source note for this new product",
]);

const newConfirmedProduct = {
  ...newPendingProduct,
  imageRightsStatus: IMAGE_RIGHTS_STATUS.confirmed,
  imageRightsConfirmed: true,
  imageRightsSource: "Original showroom photograph",
};
assert.deepEqual(
  requiredSeoChecks(newConfirmedProduct, categorySlugs),
  [],
  "A valid new product with confirmed image evidence should be approvable.",
);

const universalFailures = requiredSeoChecks(
  {
    ...newConfirmedProduct,
    name: "Bad",
    category: "not-a-storefront-category",
    description: "Too short and includes a warranty claim.",
    images: [],
    imageAlt: "sofa",
    detailsVerified: false,
  },
  categorySlugs,
);
assert(universalFailures.includes("Clear product name"));
assert(universalFailures.includes("Valid storefront category"));
assert(universalFailures.includes("Unique description (80+ characters)"));
assert(universalFailures.includes("At least one product image"));
assert(universalFailures.includes("Descriptive primary-image alt text"));
assert(universalFailures.includes("Product details checked"));
assert(universalFailures.includes("Remove unsupported product claims"));

assert(
  requiredSeoChecks({ ...baseProduct, offerVerified: true }, categorySlugs).includes(
    "Remove price verification or enter a valid price",
  ),
);
assert(
  requiredSeoChecks({ ...baseProduct, availabilityVerified: true }, categorySlugs).includes(
    "Remove availability verification or enter a specific status",
  ),
);

const schemaInput = {
  product: baseProduct,
  url: "https://luckyinteriorsfurniture.com/products/policy-test-sofa",
  imageUrls: ["https://luckyinteriorsfurniture.com/products/test-sofa.jpg"],
  categoryName: "Sofas",
  organizationId: "https://luckyinteriorsfurniture.com/#organization",
};
const schemaWithoutPrice = buildProductSchema(schemaInput);
assert(!schemaWithoutPrice.offers, "Missing or unverified prices must not create Offer schema.");

const schemaWithoutAvailability = buildProductSchema({
  ...schemaInput,
  product: { ...baseProduct, price: 40000, offerVerified: true },
});
assert(schemaWithoutAvailability.offers);
assert(!schemaWithoutAvailability.offers.availability);

const schemaWithAvailability = buildProductSchema({
  ...schemaInput,
  product: {
    ...baseProduct,
    price: 40000,
    offerVerified: true,
    availability: "In stock",
    availabilityVerified: true,
  },
});
assert.equal(schemaWithAvailability.offers.availability, "https://schema.org/InStock");
assert(!JSON.stringify(schemaWithAvailability).includes("imageRights"));

const schemaWithUnknownAvailability = buildProductSchema({
  ...schemaInput,
  product: {
    ...baseProduct,
    price: 40000,
    offerVerified: true,
    availability: "Please ask",
    availabilityVerified: true,
  },
});
assert(!schemaWithUnknownAvailability.offers.availability);

assert.equal(
  MISSING_DIMENSIONS_MESSAGE,
  "Exact dimensions are not currently published for this product. Please contact us to confirm them before ordering.",
);
assert.equal(legacyCatalogProductIds.size, 525, "The catalog legacy migration snapshot changed.");
assert.equal(legacyReviewProductIds.size, 514, "The dashboard legacy migration snapshot changed.");
assert.equal(newProducts.length, 0, "Future products should be added only to the explicit new-products list.");
assert.equal(products.length, 525, "The policy migration must not add or remove catalog products.");
assert(products.every((product) => product.isLegacyImageProduct));
assert.equal(products.filter((product) => product.seoStatus === "approved").length, 0);

console.log("Product approval policy verification passed for legacy, future, optional-data, and schema cases.");
