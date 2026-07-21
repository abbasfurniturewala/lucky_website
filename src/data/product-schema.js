function schemaAvailability(value = "") {
  const normalized = String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

  if (normalized.includes("in stock")) return "https://schema.org/InStock";
  if (normalized.includes("out of stock")) return "https://schema.org/OutOfStock";
  if (normalized.includes("pre order") || normalized.includes("preorder")) {
    return "https://schema.org/PreOrder";
  }
  if (normalized.includes("limited availability")) {
    return "https://schema.org/LimitedAvailability";
  }

  return undefined;
}

export function buildProductSchema({
  product,
  url,
  imageUrls,
  categoryName,
  organizationId,
}) {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    url,
    description: product.description,
    image: imageUrls,
    category: categoryName || product.category,
    sku: product.id,
  };
  const numericPrice = typeof product.price === "number" && product.price > 0
    ? product.price
    : undefined;

  if (numericPrice !== undefined && product.offerVerified === true) {
    const offer = {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      price: numericPrice,
      seller: { "@id": organizationId },
    };
    const availability = product.availabilityVerified === true
      ? schemaAvailability(product.availability)
      : undefined;

    if (availability) offer.availability = availability;
    productSchema.offers = offer;
  }

  return productSchema;
}
