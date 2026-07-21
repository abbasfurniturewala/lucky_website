import { importedProducts } from "./importedProducts.js";
import {
  IMAGE_RIGHTS_STATUS,
  isImageRightsConfirmed,
  normalizeImageRightsStatus,
} from "./image-rights-policy.js";
import { legacyCatalogProductIds } from "./legacy-catalog-product-ids.js";

/*
  How to add a product:

  1. Put the product photo inside the public folder, for example:
     public/products/sofas/new-sofa.jpg

  2. Copy PRODUCT_TEMPLATE below, paste it inside the newProducts array,
     and replace the example values.

  3. Keep id and slug unique. Use lowercase letters, numbers, and hyphens.
     Example: "brown-2-seater-sofa"

  4. Use collectionSlug to decide which collection page shows the product.
     Examples: "sofas", "beds", "dining-sets", "wardrobes", "study-tables".

  5. Add useful tags. Search uses name, category, price, availability,
     seating, colors, material, dimensions, details, materialDetails, and tags.

  6. To hide a product without deleting it, set active: false.

  7. For multiple photos, add images: ["photo-1.jpg", "photo-2.jpg"].
     Keep image as the first/main photo for product cards.
*/

export const PRODUCT_TEMPLATE = {
  id: "example-product-slug",
  slug: "example-product-slug",
  name: "Example Product Name",
  category: "Living Room",
  collectionSlug: "sofas",
  badge: "New arrival",
  price: null,
  priceLabel: "Price on request",
  availability: "",
  seating: 2,
  colors: ["Brown"],
  style: "Modern",
  description:
    "Write a unique customer-friendly description of at least 80 characters that explains the visible product without unsupported claims.",
  details: ["Highlight one", "Highlight two", "Highlight three"],
  dimensions: "",
  material: "",
  materialDetails: [],
  tags: ["sofa", "2 seater", "brown", "living room"],
  image: "/products/sofas/example-product-slug.jpg",
  images: ["/products/sofas/example-product-slug.jpg"],
  imageAlts: ["Describe the visible product, color, form, and camera view"],
  imageRightsStatus: IMAGE_RIGHTS_STATUS.pending,
  imageRightsSource: "",
  active: true,
  seoStatus: "review",
  offerVerified: false,
  availabilityVerified: false,
  detailsVerified: false,
  imageRightsConfirmed: false,
  updatedAt: "",
};

const unverifiedClaimPattern =
  /pepperfry|woodsworth|better home india|product rating|\brating\b|\bwarranty\b|customi[sz]|custom size|made to order|delivery support|free delivery|installation|\bimported\b|made in india|local manufacturing|hydraulic lift|synchropush/i;

const unpublishedOptionalValuePattern =
  /ask for|confirm(?: the| exact| current)?|not provided|model-dependent|refer to image|customi[sz]|custom siz|available on request|sizes vary|standard .* sizing|fits standard|\bimported\b/i;

function publishedOptionalValue(value) {
  const normalized = String(value || "").trim();
  return normalized && !unpublishedOptionalValuePattern.test(normalized) ? normalized : "";
}

function applyImageRightsPolicy(product) {
  const isLegacyImageProduct = legacyCatalogProductIds.has(product.id);
  const fallback = isLegacyImageProduct
    ? IMAGE_RIGHTS_STATUS.legacyUnverified
    : IMAGE_RIGHTS_STATUS.pending;
  const imageRightsStatus = product.imageRightsConfirmed === true
    ? IMAGE_RIGHTS_STATUS.confirmed
    : normalizeImageRightsStatus(product.imageRightsStatus, fallback);

  return {
    ...product,
    isLegacyImageProduct,
    imageRightsStatus,
    imageRightsConfirmed: isImageRightsConfirmed(imageRightsStatus),
  };
}

function safeProductName(product) {
  return String(product.name || "")
    .replace(/\b(?:customizable|customized|imported)\b/gi, "")
    .replace(/\s*\(made in india\)/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+-\s+-\s+/g, " - ")
    .trim();
}

function safeProductDescription(product, name) {
  if (!unverifiedClaimPattern.test(String(product.description || ""))) {
    return product.description;
  }

  const seating = product.seating ? `${product.seating}-seat ` : "";
  const productType = String(product.category || "furniture").toLowerCase();

  return `${name} is shown as a ${seating}${productType} option in the catalog. Confirm current dimensions, material, finish, price, availability, and delivery details before ordering.`;
}

function sanitizeProduct(product) {
  const detailsVerified = product.detailsVerified === true;
  const name = safeProductName(product);
  const safeDetails = (product.details || []).filter(
    (detail) =>
      !unverifiedClaimPattern.test(String(detail)) &&
      !unpublishedOptionalValuePattern.test(String(detail)),
  );
  const safeMaterialDetails = (product.materialDetails || []).filter(
    (detail) =>
      !unverifiedClaimPattern.test(String(detail)) &&
      !unpublishedOptionalValuePattern.test(String(detail)),
  );

  return {
    ...product,
    name,
    badge:
      detailsVerified || !unverifiedClaimPattern.test(String(product.badge || ""))
        ? product.badge
        : "Catalog option",
    description: safeProductDescription(product, name),
    details: safeDetails.filter((detail) => !/^Availability\s*:/i.test(detail)),
    materialDetails: safeMaterialDetails,
    dimensions: publishedOptionalValue(product.dimensions),
    material: publishedOptionalValue(product.material),
    seoStatus: product.seoStatus || "review",
    offerVerified: product.offerVerified === true,
    availabilityVerified: product.availabilityVerified === true,
    detailsVerified,
    imageRightsStatus: product.imageRightsStatus,
    imageRightsConfirmed: isImageRightsConfirmed(product.imageRightsStatus),
    imageRightsSource: product.imageRightsSource || "",
    imageAlts: Array.isArray(product.imageAlts) ? product.imageAlts : [],
    updatedAt: product.updatedAt || "",
    availability:
      product.availabilityVerified === true
        ? publishedOptionalValue(product.availability)
        : "",
  };
}

const existingCatalogProducts = [
  {
    id: "brown-2-seater-sofa",
    slug: "brown-2-seater-sofa",
    name: "Brown 2-Seater Sofa",
    category: "Living Room",
    collectionSlug: "sofas",
    badge: "New arrival",
    price: 40000,
    priceLabel: "Rs. 40,000",
    availability: "In stock",
    seating: 2,
    colors: ["Brown"],
    style: "Modern",
    description: "A compact brown 2-seater sofa for everyday living room seating.",
    details: ["2-seater sofa", "Brown finish", "Compact layout for apartments"],
    dimensions: "Ask for dimensions",
    material: "Leatherette upholstery",
    tags: ["sofa", "2 seater", "brown", "living room", "leatherette"],
    image: "/products/sofas/brown-2-seater-sofa.jpg",
    active: true,
  },
  {
    id: "darkbrown-2-seater-sofa",
    slug: "darkbrown-2-seater-sofa",
    name: "Dark Brown 2-Seater Sofa",
    category: "Living Room",
    collectionSlug: "sofas",
    badge: "Premium",
    price: 30000,
    priceLabel: "Rs. 30,000",
    availability: "In stock",
    seating: 2,
    colors: ["Dark Brown", "Brown"],
    style: "Classic",
    description: "A dark brown leatherette 2-seater sofa with cushioned seating and a compact footprint.",
    details: [
      "2-seater sofa",
      "Dark brown leatherette upholstery",
      "Confirm current assembly requirements before ordering",
    ],
    dimensions: "H 37 x W 60 x D 37 inches",
    material: "Premium leatherette upholstery",
    materialDetails: [
      "Frame material: Red Meranti solid wood and heavy grade ply wood",
      "Upholstery: Premium leatherette",
      "Legs: Solid wood in dark brown finish with nylon bush",
      "Foam: 32 density medium soft foam and polyester fiber back cushion",
      "Seat suspension: Pocket spring with zigzag spring",
    ],
    tags: ["sofa", "2 seater", "dark brown", "brown", "living room", "premium", "leatherette"],
    image: "/products/sofas/darkbrown-2-seater-sofa.jpg",
    active: true,
  },
  {
    id: "comfort-3-seater-sofa",
    name: "Comfort 3-Seater Sofa",
    category: "Living Room",
    collectionSlug: "sofas",
    badge: "Popular",
    price: "Price on request",
    availability: "In stock",
    seating: 3,
    colors: ["Custom"],
    description: "A family-friendly fabric sofa with comfortable depth and everyday durability.",
    details: ["Multiple fabric colors", "Custom size options", "Delivery support available"],
    dimensions: "Approx. 78 in x 34 in",
    material: "Fabric upholstery, engineered wood frame",
    tags: ["sofa", "3 seater", "fabric", "living room", "custom"],
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=82",
  },
  {
    id: "wooden-queen-bed",
    name: "Wooden Queen Bed",
    category: "Bedroom",
    collectionSlug: "beds",
    badge: "Storage option",
    price: "Price on request",
    availability: "In stock",
    description: "A sturdy queen bed design for modern bedrooms, available with storage options.",
    details: ["Queen size", "Optional hydraulic storage", "Matching side tables available"],
    dimensions: "Fits standard queen mattress",
    material: "Engineered wood and laminate finish",
    tags: ["bed", "queen bed", "storage", "bedroom", "wooden"],
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=82",
  },
  {
    id: "brown-4-seater-dining-table-set",
    slug: "brown-4-seater-dining-table-set",
    name: "Brown 4-Seater Dining Table Set",
    category: "Dining",
    collectionSlug: "dining-sets",
    badge: "Solid wood",
    price: 34000,
    priceLabel: "Rs. 34,000",
    availability: "In stock",
    seating: 4,
    colors: ["Provincial Teak", "Brown"],
    style: "Classic",
    description:
      "A solid sheesham wood dining table set with one table and four matching chairs.",
    details: [
      "Set contents: 1 table and 4 chairs",
      "Room type: Dining room",
      "Confirm current assembly requirements before ordering",
    ],
    dimensions: "Table: H 30 x W 45 x D 35 inches; Chair: H 34 x W 17 x D 17 inches",
    material: "Sheesham wood",
    materialDetails: [
      "Primary material: Sheesham wood",
      "Top material: Solid wood",
      "Colour: Provincial Teak",
      "Dimensions in centimeters: Table H 76 x W 114 x D 89; Chair H 86 x W 43 x D 43",
      "Seating height: 18 inches",
    ],
    tags: [
      "dining",
      "dining table",
      "4 seater",
      "four seater",
      "brown",
      "provincial teak",
      "sheesham wood",
      "solid wood",
      "table",
      "chairs",
    ],
    image: "/products/dining/brown-4-seater-dining-table-1.jpg",
    images: [
      "/products/dining/brown-4-seater-dining-table-1.jpg",
      "/products/dining/brown-4-seater-dining-table-2.jpg",
    ],
    active: true,
  },
  {
    id: "six-seater-dining-set",
    name: "Six-Seater Dining Set",
    category: "Dining",
    collectionSlug: "dining-sets",
    badge: "Family pick",
    price: "Price on request",
    availability: "In stock",
    seating: 6,
    description: "A practical dining table set for daily meals, guests, and festive gatherings.",
    details: ["Four and six-seater options", "Chair cushion choices", "Compact layouts available"],
    dimensions: "Sizes vary by model",
    material: "Wood finish table with cushioned chairs",
    tags: ["dining", "6 seater", "table", "chairs", "family"],
    image:
      "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?auto=format&fit=crop&w=1000&q=82",
  },
  {
    id: "ergonomic-office-chair",
    name: "Ergonomic Office Chair",
    category: "Office",
    collectionSlug: "office-furniture",
    badge: "Work setup",
    price: "Price on request",
    availability: "In stock",
    description: "A comfortable office chair for study rooms, shops, and work-from-home desks.",
    details: ["Height adjustment", "Lumbar support", "Mesh and cushion options"],
    dimensions: "Standard office chair sizing",
    material: "Mesh back, cushioned seat, metal base",
    tags: ["office chair", "chair", "work from home", "mesh", "office"],
    image:
      "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=1000&q=82",
  },
  {
    id: "tv-unit-with-storage",
    name: "TV Unit With Storage",
    category: "Living Room",
    collectionSlug: "cabinets-sideboards",
    badge: "Customizable",
    price: "Price on request",
    availability: "Made to order",
    description: "A clean TV unit with shelves and cabinets to keep living rooms organized.",
    details: ["Wall-mounted and floor units", "Cabinet storage", "Custom length options"],
    dimensions: "Custom sizing available",
    material: "Laminate and engineered wood",
    tags: ["tv unit", "storage", "cabinet", "living room", "custom"],
    image:
      "https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=1000&q=82",
  },
  {
    id: "sliding-wardrobe",
    name: "Sliding Wardrobe",
    category: "Bedroom",
    collectionSlug: "wardrobes",
    badge: "Space saver",
    price: "Price on request",
    availability: "Made to order",
    description: "A bedroom wardrobe option with sliding doors, shelves, mirror, and drawer choices.",
    details: ["Two and three-door options", "Mirror panel available", "Internal layout choices"],
    dimensions: "Custom sizing available",
    material: "Laminate shutters and storage modules",
    tags: ["wardrobe", "sliding wardrobe", "storage", "bedroom", "mirror"],
    image:
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1000&q=82",
  },
  {
    id: "accent-lounge-chair",
    name: "Accent Lounge Chair",
    category: "Living Room",
    collectionSlug: "recliners",
    badge: "New arrival",
    price: "Price on request",
    availability: "In stock",
    seating: 1,
    description: "A statement lounge chair for corners, reading spaces, and premium seating zones.",
    details: ["Fabric choices", "Wooden leg options", "Pairs well with side tables"],
    dimensions: "Model-dependent sizing",
    material: "Upholstered seat with wooden or metal legs",
    tags: ["chair", "lounge chair", "recliner", "single seater", "living room"],
    image:
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1000&q=82",
  },
  {
    id: "compact-study-desk",
    name: "Compact Study Desk",
    category: "Office",
    collectionSlug: "study-tables",
    badge: "Compact",
    price: "Price on request",
    availability: "In stock",
    description: "A practical study desk for students, small rooms, and home office setups.",
    details: ["Drawer options", "Wall-side placement", "Custom width available"],
    dimensions: "Compact and custom sizes",
    material: "Laminate top with storage modules",
    tags: ["study table", "desk", "office", "student", "compact"],
    image:
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1000&q=82",
  },
  ...importedProducts,
];

// Add every future manually created product here using PRODUCT_TEMPLATE.
// New products default to pending image-rights review and are not legacy-exempt.
export const newProducts = [];

export const products = [...existingCatalogProducts, ...newProducts]
  .map(applyImageRightsPolicy)
  .map(sanitizeProduct);
