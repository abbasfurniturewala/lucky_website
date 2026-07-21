import {
  IMAGE_RIGHTS_STATUS,
  normalizeImageRightsStatus,
} from "./image-rights-policy.js";

export const MISSING_DIMENSIONS_MESSAGE =
  "Exact dimensions are not currently published for this product. Please contact us to confirm them before ordering.";

const placeholderPattern =
  /ask for|confirm(?: the| exact| current)?|not provided|model-dependent|refer to image|customi[sz]|custom siz|available on request|sizes vary|standard .* sizing|fits standard|unknown|\bimported\b/i;

const unsupportedClaimPattern =
  /pepperfry|woodsworth|better home india|product rating|\brating\b|\bwarranty\b|free delivery|\bimported\b|made in india|local manufacturing|hydraulic lift|synchropush|customi[sz]|custom size|made to order|delivery support|installation/i;

export function hasPublishedOptionalValue(value) {
  const normalized = String(value || "").trim();
  return Boolean(normalized) && !placeholderPattern.test(normalized);
}

export function hasSpecificAvailability(value) {
  return hasPublishedOptionalValue(value);
}

export function productImageRightsStatus(product) {
  const fallback = product.isLegacyImageProduct
    ? IMAGE_RIGHTS_STATUS.legacyUnverified
    : IMAGE_RIGHTS_STATUS.pending;

  if (product.imageRightsConfirmed === true) return IMAGE_RIGHTS_STATUS.confirmed;
  return normalizeImageRightsStatus(product.imageRightsStatus, fallback);
}

export function hasUnsupportedProductClaims(product) {
  return unsupportedClaimPattern.test(
    [
      product.name,
      product.description,
      product.material,
      product.dimensions,
      ...(product.details || []),
      ...(product.materialDetails || []),
    ].join(" "),
  );
}

function hasProductImage(product) {
  return Boolean(product.image) || Boolean(product.images?.length);
}

function primaryImageAlt(product) {
  return String(product.imageAlt || product.imageAlts?.[0] || "").trim();
}

export function requiredSeoChecks(product, validCategorySlugs = new Set()) {
  const requirements = [];
  const name = String(product.name || "").trim();
  const description = String(product.description || "").trim();
  const category = String(product.category || product.collectionSlug || "").trim();
  const imageRightsStatus = productImageRightsStatus(product);

  if (name.length < 5) requirements.push("Clear product name");
  if (!category || (validCategorySlugs.size > 0 && !validCategorySlugs.has(category))) {
    requirements.push("Valid storefront category");
  }
  if (description.length < 80) requirements.push("Unique description (80+ characters)");
  if (!hasProductImage(product)) requirements.push("At least one product image");
  if (primaryImageAlt(product).length < 20) {
    requirements.push("Descriptive primary-image alt text");
  }
  if (!product.detailsVerified) requirements.push("Product details checked");
  if (hasUnsupportedProductClaims(product)) requirements.push("Remove unsupported product claims");

  if (!product.isLegacyImageProduct) {
    if (imageRightsStatus !== IMAGE_RIGHTS_STATUS.confirmed) {
      requirements.push("Image rights confirmed for this new product");
    }
    if (String(product.imageRightsSource || "").trim().length < 8) {
      requirements.push("Image-rights source note for this new product");
    }
  }

  if (product.offerVerified === true && !(Number(product.price) > 0)) {
    requirements.push("Remove price verification or enter a valid price");
  }
  if (
    product.availabilityVerified === true &&
    !hasSpecificAvailability(product.availability)
  ) {
    requirements.push("Remove availability verification or enter a specific status");
  }

  return requirements;
}

export function recommendedProductChecks(product) {
  const recommendations = [];
  const imageRightsStatus = productImageRightsStatus(product);

  if (!hasPublishedOptionalValue(product.dimensions)) recommendations.push("Add exact dimensions");
  if (!hasPublishedOptionalValue(product.material)) recommendations.push("Add material or finish");
  if (!(Number(product.price) > 0) || product.offerVerified !== true) {
    recommendations.push("Add and verify the current price");
  }
  if (!hasSpecificAvailability(product.availability) || product.availabilityVerified !== true) {
    recommendations.push("Add and verify current availability");
  }
  const colors = Array.isArray(product.colors) ? product.colors.filter(Boolean) : [];
  if (!String(product.color || "").trim() && colors.length === 0) recommendations.push("Add color");

  if (product.isLegacyImageProduct && imageRightsStatus !== IMAGE_RIGHTS_STATUS.confirmed) {
    recommendations.push("Record image-rights evidence for this legacy product (non-blocking)");
  } else if (
    imageRightsStatus === IMAGE_RIGHTS_STATUS.confirmed &&
    String(product.imageRightsSource || "").trim().length < 8
  ) {
    recommendations.push("Add an image-rights source note");
  }

  return recommendations;
}
