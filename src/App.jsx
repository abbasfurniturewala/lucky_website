import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Eye,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  Truck,
  X,
} from "lucide-react";
import {
  business,
  categories,
  homepageSeoContent,
  promoBanner,
  shopCategories,
} from "./data/catalog.js";
import { products } from "./data/products.js";
import { site } from "./data/site.js";
import { trackEvent } from "./analytics.js";
import { findGuide, guidePath, guides } from "./data/guides.js";
import { MISSING_DIMENSIONS_MESSAGE } from "./data/product-seo-policy.js";
import { buildProductSchema } from "./data/product-schema.js";

const menuItems = [
  { label: "Home", href: "/" },
  { label: "Sofas & Seating", collectionSlug: "sofas" },
  { label: "Bedroom", collectionSlug: "beds" },
  { label: "Dining & Kitchen", collectionSlug: "dining-sets" },
  { label: "Office", collectionSlug: "office-furniture" },
  { label: "Storage Furniture", collectionSlug: "wardrobes" },
  { label: "Lighting & Decor", href: "/#why-us" },
  { label: "Furnishing", href: "/#catalog" },
];

const featuredProductIds = [
  "brown-2-seater-sofa",
  "darkbrown-2-seater-sofa",
  "brown-4-seater-dining-table-set",
  "wooden-queen-bed",
  "sliding-wardrobe",
  "accent-lounge-chair",
  "tv-unit-with-storage",
  "compact-study-desk",
];

const popularSearchTerms = ["sofas", "2 seater sofa", "wardrobes", "dining set", "centre table", "storage"];

const informationPages = {
  about: {
    eyebrow: "About the catalog",
    title: "About Lucky Interiors Furniture",
    description:
      "Learn how to use the Lucky Interiors Furniture catalog to explore furniture options and make an informed enquiry in Mumbai.",
    intro:
      "Lucky Interiors Furniture is an enquiry-based furniture catalog for customers exploring options for homes and workspaces in Mumbai.",
    sections: [
      {
        heading: "Explore before you enquire",
        paragraphs: [
          "The website brings product photos, categories, available specifications, and enquiry options into one place. Category filters and search help narrow the catalog by details such as seating, price, color, material, and availability where those fields are present.",
          "Product information can change. Current price, dimensions, finish, availability, delivery details, and access requirements should be confirmed directly before making a decision.",
        ],
      },
      {
        heading: "Furniture planning for Mumbai homes",
        paragraphs: [
          "Room size and building access matter as much as the product style. Measure the intended space, entrance, doors, corridors, stairs, and lift before enquiring about a large item.",
        ],
      },
    ],
  },
  privacy: {
    eyebrow: "Website information",
    title: "Privacy policy",
    description:
      "Read how Lucky Interiors Furniture handles enquiry information, technical data, external services, and privacy requests.",
    intro:
      "This policy explains the information that may be handled when you browse this website or contact Lucky Interiors Furniture. It was last updated on 11 July 2026.",
    sections: [
      {
        heading: "Information you choose to share",
        paragraphs: [
          "If you contact us by phone, email, WhatsApp, or another linked service, you may share your name, contact details, delivery locality, product preferences, measurements, photographs, and enquiry messages. That information is used to respond to the enquiry and discuss the requested product or service.",
        ],
      },
      {
        heading: "Technical and third-party services",
        paragraphs: [
          "Hosting and security providers may process technical information such as IP address, browser details, request time, and requested pages to deliver and protect the website. Links or embedded services from Google Maps, WhatsApp, email, and telephone providers are governed by their own privacy terms when used.",
          "If measurement tools are added in the future, this policy should be updated before they are activated. The current site does not provide customer accounts or an online checkout.",
        ],
      },
      {
        heading: "Your choices",
        paragraphs: [
          "You can avoid sending personal information through the website and contact us only with the details needed for your enquiry. For a privacy question or request relating to information shared directly with us, use the email address on the Contact page.",
        ],
      },
    ],
  },
  terms: {
    eyebrow: "Website information",
    title: "Website terms",
    description:
      "Read the terms for using the Lucky Interiors Furniture product catalog, enquiry links, images, and external services.",
    intro:
      "These terms apply to use of the Lucky Interiors Furniture website and were last updated on 11 July 2026.",
    sections: [
      {
        heading: "Catalog information",
        paragraphs: [
          "The website is an enquiry catalog, not an online checkout. Product photos, descriptions, prices, dimensions, materials, colors, and availability are provided for initial comparison and may be incomplete or change over time.",
          "Confirm the current product specification, total price, availability, delivery scope, access requirements, and any other purchase terms directly before placing an order or making a payment.",
        ],
      },
      {
        heading: "Website use and external links",
        paragraphs: [
          "Do not misuse the website, attempt unauthorized access, or reproduce catalog content for commercial use without permission. External links such as WhatsApp and Google Maps are provided for convenience and are operated under the third party's own terms.",
        ],
      },
      {
        heading: "Updates and questions",
        paragraphs: [
          "Website content and these terms may be updated as the catalog and services change. Questions about a product or these terms can be sent through the Contact page.",
        ],
      },
    ],
  },
};

const defaultCollectionFilters = {
  availability: "all",
  color: "all",
  material: "all",
  price: "all",
  seating: "all",
};

const priceFilterOptions = [
  { label: "Any price", value: "all" },
  { label: "Under Rs. 10,000", value: "under-10000" },
  { label: "Rs. 10,000 - Rs. 25,000", value: "10000-25000" },
  { label: "Rs. 25,000 - Rs. 50,000", value: "25000-50000" },
  { label: "Above Rs. 50,000", value: "above-50000" },
  { label: "Price on request", value: "request" },
];

const collectionSortOptions = [
  { label: "Popular", value: "popular" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
];

function collectionPath(slug) {
  return `/collections/${slug}`;
}

function productPath(product) {
  return `/products/${product.slug || product.id}`;
}

function searchPath(query) {
  return `/search?q=${encodeURIComponent(query.trim())}`;
}

function currentPath() {
  if (typeof window === "undefined") {
    return "/";
  }

  return `${window.location.pathname}${window.location.search}` || "/";
}

function parseRoute(locationPath) {
  const url = new URL(locationPath, site.origin);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const collectionMatch = path.match(/^\/collections\/([^/]+)$/);
  const productMatch = path.match(/^\/products\/([^/]+)$/);
  const guideMatch = path.match(/^\/guides\/([^/]+)$/);

  if (collectionMatch) {
    return {
      slug: decodeURIComponent(collectionMatch[1]),
      type: "collection",
    };
  }

  if (productMatch) {
    return {
      slug: decodeURIComponent(productMatch[1]),
      type: "product",
    };
  }

  if (guideMatch) {
    return {
      slug: decodeURIComponent(guideMatch[1]),
      type: "guide",
    };
  }

  if (path === "/") {
    return { type: "home" };
  }

  if (path === "/search") {
    return {
      query: url.searchParams.get("q") || "",
      type: "search",
    };
  }

  if (path === "/contact") {
    return { type: "contact" };
  }

  if (["/about", "/privacy", "/terms"].includes(path)) {
    return { slug: path.slice(1), type: "information" };
  }

  return { type: "not-found" };
}

function findCollection(slug) {
  return shopCategories.find((category) => category.slug === slug);
}

function findProduct(slug) {
  return products.find((product) => (product.slug || product.id) === slug);
}

function productsForCollection(collection) {
  return products.filter(
    (product) =>
      product.active !== false &&
      (product.collectionSlug === collection.slug ||
        (!product.collectionSlug && product.category === collection.filterCategory)),
  );
}

function displayPrice(product) {
  return product.priceLabel || product.price || "Price on request";
}

function numericProductPrice(product) {
  if (typeof product.price === "number") {
    return product.price;
  }

  const priceText = [product.price, product.priceLabel].filter(Boolean).join(" ");
  const parsedPrice = Number(priceText.replace(/[^0-9]/g, ""));

  return Number.isFinite(parsedPrice) && parsedPrice > 0 ? parsedPrice : null;
}

function productImages(product) {
  const images = product.images?.length ? product.images : [product.image];
  return images.filter(Boolean);
}

function uniqueFilterOptions(productsList, getValues) {
  const options = new Map();

  productsList.forEach((product) => {
    const values = getValues(product);
    const valueList = Array.isArray(values) ? values : [values];

    valueList
      .filter(Boolean)
      .map((value) => String(value).trim())
      .filter(Boolean)
      .forEach((value) => {
        const key = normalizeSearchText(value);
        if (key && !options.has(key)) {
          options.set(key, value);
        }
      });
  });

  return Array.from(options.values()).sort((first, second) =>
    first.localeCompare(second, undefined, { numeric: true, sensitivity: "base" }),
  );
}

function getCollectionFilterOptions(collectionProducts) {
  return {
    availabilities: uniqueFilterOptions(collectionProducts, (product) => product.availability),
    colors: uniqueFilterOptions(collectionProducts, (product) => product.colors || []),
    materials: uniqueFilterOptions(collectionProducts, (product) => product.material),
    seating: uniqueFilterOptions(collectionProducts, (product) => product.seating)
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value))
      .sort((first, second) => first - second),
  };
}

function productMatchesPriceFilter(product, priceFilter) {
  const price = numericProductPrice(product);

  if (priceFilter === "all") {
    return true;
  }

  if (priceFilter === "request") {
    return price === null;
  }

  if (price === null) {
    return false;
  }

  if (priceFilter === "under-10000") {
    return price < 10000;
  }

  if (priceFilter === "10000-25000") {
    return price >= 10000 && price <= 25000;
  }

  if (priceFilter === "25000-50000") {
    return price >= 25000 && price <= 50000;
  }

  if (priceFilter === "above-50000") {
    return price > 50000;
  }

  return true;
}

function productMatchesCollectionFilters(product, filters) {
  const colorMatch =
    filters.color === "all" ||
    (product.colors || []).some((color) => normalizeSearchText(color) === normalizeSearchText(filters.color));
  const materialMatch =
    filters.material === "all" ||
    normalizeSearchText(product.material) === normalizeSearchText(filters.material);
  const availabilityMatch =
    filters.availability === "all" ||
    normalizeSearchText(product.availability) === normalizeSearchText(filters.availability);
  const seatingMatch = filters.seating === "all" || String(product.seating || "") === filters.seating;

  return (
    productMatchesPriceFilter(product, filters.price) &&
    colorMatch &&
    materialMatch &&
    availabilityMatch &&
    seatingMatch
  );
}

function productPopularityScore(product) {
  const text = normalizeSearchText([
    product.badge,
    product.name,
    ...(product.tags || []),
    ...(product.details || []),
  ].join(" "));
  const ratingMatch = text.match(/product rating ([0-9]+(?: [0-9]+)?)/);
  const ratingScore = ratingMatch ? Number(ratingMatch[1].replace(" ", ".")) * 10 : 0;
  let score = Number.isFinite(ratingScore) ? ratingScore : 0;

  if (text.includes("popular") || text.includes("best seller") || text.includes("bestseller")) {
    score += 90;
  }

  if (text.includes("premium")) {
    score += 35;
  }

  if (text.includes("new arrival") || text.includes("new")) {
    score += 25;
  }

  if (text.includes("imported shortlist")) {
    score += 10;
  }

  return score;
}

function sortCollectionProducts(productsToSort, sortBy, sourceProducts) {
  const sourceOrder = new Map(sourceProducts.map((product, index) => [product.id, index]));

  return [...productsToSort].sort((first, second) => {
    const firstPrice = numericProductPrice(first);
    const secondPrice = numericProductPrice(second);
    const firstOrder = sourceOrder.get(first.id) ?? 0;
    const secondOrder = sourceOrder.get(second.id) ?? 0;

    if (sortBy === "price-asc") {
      if (firstPrice === null && secondPrice === null) {
        return firstOrder - secondOrder;
      }

      if (firstPrice === null) {
        return 1;
      }

      if (secondPrice === null) {
        return -1;
      }

      return firstPrice - secondPrice || firstOrder - secondOrder;
    }

    if (sortBy === "newest") {
      return secondOrder - firstOrder;
    }

    const popularityDifference = productPopularityScore(second) - productPopularityScore(first);
    return popularityDifference || firstOrder - secondOrder;
  });
}

function collectionResultLabel(count, collection) {
  return count === 1 ? "1 product found" : `${count} ${collection.name.toLowerCase()} found`;
}

function hasActiveCollectionFilters(filters) {
  return Object.values(filters).some((value) => value !== "all");
}

function primaryProductImage(product) {
  return productImages(product)[0];
}

function productImageAlt(product, index = 0) {
  return product.imageAlts?.[index] || `${product.name}, product view ${index + 1}`;
}

function absoluteUrl(path = "/") {
  return new URL(path || "/", site.origin).toString();
}

function truncateText(text, maxLength = 155) {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const clipped = normalized.slice(0, maxLength - 1).trim();
  const lastSpace = clipped.lastIndexOf(" ");
  const safeClip = lastSpace > maxLength * 0.6 ? clipped.slice(0, lastSpace) : clipped;

  return `${safeClip.replace(/[.,;:]+$/, "")}.`;
}

function cleanJsonLd(value) {
  if (Array.isArray(value)) {
    const cleanedArray = value.map(cleanJsonLd).filter((item) => item !== undefined);
    return cleanedArray.length ? cleanedArray : undefined;
  }

  if (value && typeof value === "object") {
    const cleanedObject = Object.entries(value).reduce((current, [key, item]) => {
      const cleanedValue = cleanJsonLd(item);

      if (cleanedValue !== undefined) {
        current[key] = cleanedValue;
      }

      return current;
    }, {});

    return Object.keys(cleanedObject).length ? cleanedObject : undefined;
  }

  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return value;
}

function upsertMeta(attribute, value, content) {
  let element = document.head.querySelector(`meta[${attribute}="${value}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, value);
    document.head.append(element);
  }

  element.setAttribute("content", content);
}

function upsertCanonical(href) {
  let element = document.head.querySelector('link[rel="canonical"]');

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.append(element);
  }

  element.setAttribute("href", href);
}

function setJsonLd(id, data) {
  const cleanedData = cleanJsonLd(data);
  let element = document.getElementById(id);

  if (!cleanedData) {
    element?.remove();
    return;
  }

  if (!element) {
    element = document.createElement("script");
    element.id = id;
    element.type = "application/ld+json";
    document.head.append(element);
  }

  element.textContent = JSON.stringify(cleanedData);
}

function removeJsonLd(id) {
  document.getElementById(id)?.remove();
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${site.origin}/#organization`,
    name: business.name,
    url: site.origin,
    logo: absoluteUrl(business.logo || site.defaultImage),
    email: business.email,
    telephone: business.callNumber,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: business.email,
      telephone: business.callNumber,
    },
  };
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.origin}/#website`,
    name: business.name,
    url: site.origin,
    publisher: {
      "@id": `${site.origin}/#organization`,
    },
  };
}

function buildContactJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contact ${business.name}`,
    description: `Contact ${business.name} for furniture product queries, sales quotes, availability, and location information.`,
    url: absoluteUrl("/contact"),
    mainEntity: {
      "@id": `${site.origin}/#organization`,
    },
  };
}

function buildWebPageJsonLd({ description, name, path, type = "WebPage" }) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    name,
    description,
    url: absoluteUrl(path),
    isPartOf: {
      "@id": `${site.origin}/#website`,
    },
    about: {
      "@id": `${site.origin}/#organization`,
    },
  };
}

function buildArticleJsonLd(guide) {
  const path = guidePath(guide);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    name: guide.title,
    description: guide.description,
    url: absoluteUrl(path),
    mainEntityOfPage: absoluteUrl(path),
    inLanguage: "en-IN",
    isPartOf: {
      "@id": `${site.origin}/#website`,
    },
    author: {
      "@id": `${site.origin}/#organization`,
    },
    publisher: {
      "@id": `${site.origin}/#organization`,
    },
  };
}

function buildBreadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.href),
    })),
  };
}

function buildProductJsonLd(product) {
  return buildProductSchema({
    product,
    url: absoluteUrl(productPath(product)),
    imageUrls: productImages(product).map(absoluteUrl),
    categoryName: collectionForProduct(product)?.name || product.category,
    organizationId: `${site.origin}/#organization`,
  });
}

function buildCollectionJsonLd(collection) {
  const collectionProducts = productsForCollection(collection).slice(0, 12);

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${collection.name} | ${business.name}`,
    description: collection.description,
    url: absoluteUrl(collectionPath(collection.slug)),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: collectionProducts.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(productPath(product)),
        name: product.name,
      })),
    },
  };
}

function productSeoDescription(product) {
  return truncateText(
    [
      product.description,
      product.material ? `Material: ${product.material}.` : "",
      product.dimensions ? `Dimensions: ${product.dimensions}.` : "",
      `${business.name}, Mumbai.`,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function buildSeoData(route, collection, product, routePath = "/") {
  if (route.type === "product" && product) {
    const productCollection = collectionForProduct(product);
    const description = productSeoDescription(product);
    const canonical = absoluteUrl(productPath(product));

    const pageJsonLd = [
      buildBreadcrumbJsonLd([
        { name: "Home", href: "/" },
        { name: productCollection?.name || product.category, href: productCollection ? collectionPath(productCollection.slug) : "/#catalog" },
        { name: product.name, href: productPath(product) },
      ]),
    ];

    if (product.seoStatus === "approved") {
      pageJsonLd.push(buildProductJsonLd(product));
    }

    return {
      title: `${product.name} | ${business.name}`,
      description,
      canonical,
      image: absoluteUrl(primaryProductImage(product) || site.defaultImage),
      robots: product.seoStatus === "approved" ? "index,follow" : "noindex,follow",
      type: "product",
      pageJsonLd,
    };
  }

  if (route.type === "collection" && collection) {
    const collectionHasProducts = productsForCollection(collection).length > 0;
    const description = truncateText(
      `${collection.description} Browse ${collection.name.toLowerCase()} and enquire with ${business.name} in Mumbai.`,
    );
    const canonical = absoluteUrl(collectionPath(collection.slug));

    return {
      title: collection.seoTitle || `${collection.name} | ${business.name}`,
      description: collection.seoDescription || description,
      canonical,
      image: absoluteUrl(collection.image || site.defaultImage),
      robots: collectionHasProducts ? "index,follow" : "noindex,follow",
      type: "website",
      pageJsonLd: [
        buildBreadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: collection.name, href: collectionPath(collection.slug) },
        ]),
        buildCollectionJsonLd(collection),
      ],
    };
  }

  if (route.type === "search") {
    const query = route.query.trim();

    return {
      title: query ? `Search: ${query} | ${business.name}` : `Search | ${business.name}`,
      description: query
        ? `Search results for ${query} in the ${business.name} furniture catalog.`
        : `Search the ${business.name} furniture catalog.`,
      canonical: query ? absoluteUrl(searchPath(query)) : absoluteUrl("/search"),
      image: absoluteUrl(site.defaultImage),
      robots: "noindex,follow",
      type: "website",
      pageJsonLd: [],
    };
  }

  if (route.type === "contact") {
    return {
      title: `Contact Us | ${business.name}`,
      description: `Contact ${business.name} for furniture product queries, quotes, availability, delivery questions, and location information.`,
      canonical: absoluteUrl("/contact"),
      image: absoluteUrl(business.logo || site.defaultImage),
      robots: "index,follow",
      type: "website",
      pageJsonLd: [
        buildBreadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: "Contact us", href: "/contact" },
        ]),
        buildContactJsonLd(),
      ],
    };
  }

  if (route.type === "guide") {
    const guide = findGuide(route.slug);

    if (guide) {
      const path = guidePath(guide);

      return {
        title: `${guide.title} | ${business.name}`,
        description: guide.description,
        canonical: absoluteUrl(path),
        image: absoluteUrl(site.defaultImage),
        robots: "index,follow",
        type: "article",
        pageJsonLd: [
          buildBreadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: guide.title, href: path },
          ]),
          buildArticleJsonLd(guide),
        ],
      };
    }
  }

  if (route.type === "information") {
    const informationPage = informationPages[route.slug];

    if (informationPage) {
      const path = `/${route.slug}`;
      const schemaType = route.slug === "about" ? "AboutPage" : "WebPage";

      return {
        title: `${informationPage.title} | ${business.name}`,
        description: informationPage.description,
        canonical: absoluteUrl(path),
        image: absoluteUrl(business.logo || site.defaultImage),
        robots: "index,follow",
        type: "website",
        pageJsonLd: [
          buildBreadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: informationPage.title, href: path },
          ]),
          buildWebPageJsonLd({
            description: informationPage.description,
            name: informationPage.title,
            path,
            type: schemaType,
          }),
        ],
      };
    }
  }

  if (
    route.type === "not-found" ||
    (route.type === "collection" && !collection) ||
    (route.type === "product" && !product) ||
    (route.type === "guide" && !findGuide(route.slug)) ||
    (route.type === "information" && !informationPages[route.slug])
  ) {
    return {
      title: `Page not found | ${business.name}`,
      description: "This page could not be found. Browse Lucky Interiors Furniture collections and products.",
      canonical: absoluteUrl(new URL(routePath, site.origin).pathname),
      image: absoluteUrl(site.defaultImage),
      robots: "noindex,follow",
      type: "website",
      pageJsonLd: [],
    };
  }

  return {
    title: site.defaultTitle,
    description: site.defaultDescription,
    canonical: absoluteUrl("/"),
    image: absoluteUrl(site.defaultImage),
    robots: "index,follow",
    type: "website",
    pageJsonLd: [],
  };
}

export function getSeoData(locationPath = "/") {
  const route = parseRoute(locationPath);
  const collection = route.type === "collection" ? findCollection(route.slug) : null;
  const product = route.type === "product" ? findProduct(route.slug) : null;

  return buildSeoData(route, collection, product, locationPath);
}

function applySeo(seo) {
  document.title = seo.title;
  upsertMeta("name", "description", seo.description);
  upsertMeta("name", "robots", seo.robots);
  upsertMeta("property", "og:site_name", business.name);
  upsertMeta("property", "og:type", seo.type);
  upsertMeta("property", "og:title", seo.title);
  upsertMeta("property", "og:description", seo.description);
  upsertMeta("property", "og:url", seo.canonical);
  upsertMeta("property", "og:image", seo.image);
  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", seo.title);
  upsertMeta("name", "twitter:description", seo.description);
  upsertMeta("name", "twitter:image", seo.image);
  upsertCanonical(seo.canonical);
  setJsonLd("organization-jsonld", buildOrganizationJsonLd());
  setJsonLd("website-jsonld", buildWebsiteJsonLd());
  removeJsonLd("local-business-jsonld");

  ["page-jsonld-0", "page-jsonld-1", "page-jsonld-2"].forEach((id, index) => {
    const data = seo.pageJsonLd[index];

    if (data) {
      setJsonLd(id, data);
      return;
    }

    removeJsonLd(id);
  });
}

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function searchTokens(query) {
  return normalizeSearchText(query).split(" ").filter(Boolean);
}

function scoreSearchMatch(query, title, searchableText) {
  const normalizedQuery = normalizeSearchText(query);
  const tokens = searchTokens(query);
  const normalizedTitle = normalizeSearchText(title);
  const normalizedSearchable = normalizeSearchText(searchableText);
  const searchableWords = normalizedSearchable.split(" ").filter(Boolean);
  const titleWords = normalizedTitle.split(" ").filter(Boolean);

  if (!normalizedQuery || tokens.length === 0) {
    return 0;
  }

  let score = 0;

  if (normalizedTitle === normalizedQuery) {
    score += 100;
  } else if (normalizedTitle.startsWith(normalizedQuery)) {
    score += 70;
  } else if (normalizedTitle.includes(normalizedQuery)) {
    score += 48;
  }

  if (normalizedSearchable.includes(normalizedQuery)) {
    score += 28;
  }

  const hasNumericToken = tokens.some((token) => /^\d+$/.test(token));
  const hasSeatingToken = tokens.some((token) =>
    ["seater", "seat", "seating", "chair", "chairs"].includes(token),
  );

  if (hasNumericToken && hasSeatingToken && !normalizedSearchable.includes(normalizedQuery)) {
    return 0;
  }

  const tokenMatches = (token, words) =>
    /^\d+$/.test(token)
      ? words.includes(token)
      : words.some((word) => word === token || word.startsWith(token) || word.includes(token));

  const matchedTokens = tokens.filter((token) => tokenMatches(token, searchableWords));
  score += matchedTokens.length * 12;

  const titleTokenMatches = tokens.filter((token) => tokenMatches(token, titleWords));
  score += titleTokenMatches.length * 10;

  return matchedTokens.length === tokens.length ? score : 0;
}

function collectionForProduct(product) {
  return product.collectionSlug ? findCollection(product.collectionSlug) : null;
}

function productSearchText(product) {
  const collection = collectionForProduct(product);

  return [
    product.name,
    product.category,
    collection?.name,
    collection?.description,
    product.description,
    product.badge,
    displayPrice(product),
    product.price,
    product.availability,
    product.seating ? `${product.seating} seater` : "",
    product.style,
    product.material,
    product.dimensions,
    ...(product.colors || []),
    ...(product.tags || []),
    ...(product.details || []),
    ...(product.materialDetails || []),
  ]
    .filter(Boolean)
    .join(" ");
}

function buildSearchResults(query) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return {
      categories: [],
      collections: [],
      products: [],
      total: 0,
    };
  }

  const matchedCollections = shopCategories
    .map((collection) => ({
      collection,
      score: scoreSearchMatch(
        trimmedQuery,
        collection.name,
        [collection.name, collection.slug, collection.filterCategory, collection.description].join(" "),
      ),
    }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score);

  const matchedCategories = categories
    .map((category) => ({
      category,
      score: scoreSearchMatch(
        trimmedQuery,
        category.name,
        [category.name, category.description].join(" "),
      ),
    }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score);

  const matchedProducts = products
    .filter((product) => product.active !== false)
    .map((product) => ({
      product,
      score: scoreSearchMatch(trimmedQuery, product.name, productSearchText(product)),
    }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score);

  return {
    categories: matchedCategories,
    collections: matchedCollections,
    products: matchedProducts,
    total: matchedCategories.length + matchedCollections.length + matchedProducts.length,
  };
}

function createWhatsappLink(productOrName) {
  const product = productOrName && typeof productOrName === "object" ? productOrName : null;
  const productName = product?.name || productOrName;
  const productUrl = product ? absoluteUrl(productPath(product)) : "";
  const text = productName
    ? `Hi ${business.name}, I am interested in ${productName}. Please share the current price, availability, dimensions, and delivery details.${productUrl ? ` Product page: ${productUrl}` : ""}`
    : `Hi ${business.name}, I would like to know more about your furniture catalog.`;

  return `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

function createEmailLink(subject = "Furniture enquiry") {
  return `mailto:${business.email}?subject=${encodeURIComponent(subject)}`;
}

function trackWhatsappClick(parameters = {}) {
  trackEvent("whatsapp_click", parameters);

  if (parameters.product_id) {
    trackEvent("product_enquiry", {
      ...parameters,
      channel: "whatsapp",
    });
  }
}

function trackPhoneClick(parameters = {}) {
  trackEvent("phone_click", parameters);

  if (parameters.product_id) {
    trackEvent("product_enquiry", {
      ...parameters,
      channel: "phone",
    });
  }
}

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" className="whatsapp-mark" viewBox="0 0 32 32" focusable="false">
      <path d="M16.04 4.5c-6.28 0-11.38 5.1-11.38 11.38 0 2.01.53 3.97 1.54 5.7L4.56 27.5l6.07-1.6a11.34 11.34 0 0 0 5.41 1.38h.01c6.27 0 11.37-5.1 11.37-11.38S22.32 4.5 16.04 4.5Zm0 20.86h-.01c-1.71 0-3.39-.46-4.85-1.33l-.35-.21-3.6.95.96-3.51-.23-.36a9.46 9.46 0 0 1-1.45-5.02c0-5.25 4.27-9.51 9.53-9.51 2.54 0 4.93.99 6.73 2.79a9.44 9.44 0 0 1 2.8 6.74c0 5.24-4.28 9.46-9.53 9.46Zm5.23-7.1c-.29-.14-1.69-.83-1.95-.93-.26-.1-.45-.14-.64.14-.19.29-.74.93-.91 1.12-.17.19-.33.21-.62.07-.29-.14-1.2-.44-2.29-1.41-.85-.76-1.42-1.69-1.59-1.98-.17-.29-.02-.44.13-.59.13-.13.29-.33.43-.5.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.64-1.55-.88-2.12-.23-.56-.47-.48-.64-.49h-.55c-.19 0-.5.07-.76.36-.26.29-1 1-1 2.38s1.02 2.73 1.16 2.92c.14.19 2 3.05 4.84 4.28.68.29 1.21.47 1.62.6.68.22 1.3.19 1.79.12.55-.08 1.69-.69 1.93-1.36.24-.67.24-1.24.17-1.36-.07-.12-.26-.19-.55-.33Z" />
    </svg>
  );
}

function HeaderSearch({ onNavigate }) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);
  const results = useMemo(() => buildSearchResults(query), [query]);
  const trimmedQuery = query.trim();
  const showPanel = isFocused && trimmedQuery.length > 0;
  const productSuggestions = results.products.slice(0, 4);
  const collectionSuggestions = results.collections.slice(0, 3);
  const categorySuggestions = results.categories.slice(0, 2);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!searchRef.current?.contains(event.target)) {
        setIsFocused(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function runSearch() {
    if (!trimmedQuery) {
      return;
    }

    setIsFocused(false);
    onNavigate(searchPath(trimmedQuery));
  }

  function handleSubmit(event) {
    event.preventDefault();
    runSearch();
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      runSearch();
    }
  }

  function handleResultClick(href, event) {
    setIsFocused(false);
    onNavigate(href, event);
  }

  return (
    <div className="header-search" ref={searchRef}>
      <form className="header-search-form" role="search" onSubmit={handleSubmit}>
        <input
          aria-label="Search products and categories"
          type="text"
          placeholder="Search for sofas, dining tables..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <button
            className="global-search-clear"
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
          >
            <X size={15} aria-hidden="true" />
          </button>
        )}
        <button className="global-search-submit" type="submit" aria-label="Search">
          <Search size={18} aria-hidden="true" />
        </button>
      </form>

      {showPanel && (
        <div className="header-search-panel">
          {results.total > 0 ? (
            <>
              {collectionSuggestions.length > 0 && (
                <div className="search-suggestion-group">
                  <p>Collections</p>
                  {collectionSuggestions.map(({ collection }) => (
                    <a
                      className="search-result-row"
                      href={collectionPath(collection.slug)}
                      key={collection.slug}
                      onClick={(event) => handleResultClick(collectionPath(collection.slug), event)}
                    >
                      <img src={collection.image} alt={`${collection.name} furniture collection`} />
                      <span>
                        <strong>{collection.name}</strong>
                        <small>{collection.description}</small>
                      </span>
                    </a>
                  ))}
                </div>
              )}

              {productSuggestions.length > 0 && (
                <div className="search-suggestion-group">
                  <p>Products</p>
                  {productSuggestions.map(({ product }) => (
                    <a
                      className="search-result-row"
                      href={productPath(product)}
                      key={product.id}
                      onClick={(event) => handleResultClick(productPath(product), event)}
                    >
                      <img src={primaryProductImage(product)} alt={productImageAlt(product)} />
                      <span>
                        <strong>{product.name}</strong>
                        <small>
                          {collectionForProduct(product)?.name || product.category} - {displayPrice(product)}
                        </small>
                      </span>
                    </a>
                  ))}
                </div>
              )}

              {categorySuggestions.length > 0 && (
                <div className="search-suggestion-group">
                  <p>Room categories</p>
                  <div className="search-pill-row">
                    {categorySuggestions.map(({ category }) => (
                      <a
                        className="search-pill"
                        href={searchPath(category.name)}
                        key={category.name}
                        onClick={(event) => handleResultClick(searchPath(category.name), event)}
                      >
                        {category.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <a
                className="search-view-all"
                href={searchPath(trimmedQuery)}
                onClick={(event) => handleResultClick(searchPath(trimmedQuery), event)}
              >
                View all results for "{trimmedQuery}"
              </a>
            </>
          ) : (
            <div className="search-empty">
              <strong>No matches found</strong>
              <span>Try sofa, dining, brown, 2 seater, bed, wardrobe, or sheesham.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Header({ onNavigate }) {
  return (
    <>
      <header className="site-header">
        <div className="utility-bar">
          <div className="utility-actions">
            <a className="contact-link" href="/contact" onClick={(event) => onNavigate("/contact", event)}>
              Contact us
            </a>
            {business.instagramEnabled && (
              <a
                className="social-link"
                href={business.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Lucky Interiors on Instagram"
                title="Instagram"
              >
                <Instagram aria-hidden="true" size={16} strokeWidth={2.2} />
              </a>
            )}
          </div>
        </div>

        <div className="logo-row">
          <HeaderSearch onNavigate={onNavigate} />
          <a
            className="logo-link"
            href="/"
            aria-label={`${business.name} home`}
            onClick={(event) => onNavigate("/", event)}
          >
            <picture>
              <source
                type="image/webp"
                srcSet={business.logoSrcSet}
                sizes="(max-width: 760px) 70vw, 320px"
              />
              <img
                className="logo-image"
                src={business.logo}
                alt={business.name}
                width="1672"
                height="941"
                decoding="async"
              />
            </picture>
          </a>
          <div className="logo-row-spacer" aria-hidden="true" />
        </div>
      </header>

      <nav className="menu-row" aria-label="Product navigation">
        <div className="menu-nav">
          {menuItems.map((item) =>
            item.collectionSlug ? (
              <a
                className="menu-link"
                href={collectionPath(item.collectionSlug)}
                key={item.label}
                onClick={(event) => onNavigate(collectionPath(item.collectionSlug), event)}
              >
                {item.label}
              </a>
            ) : (
              <a
                className="menu-link"
                href={item.href}
                key={item.label}
                onClick={(event) => onNavigate(item.href, event)}
              >
                {item.label}
              </a>
            ),
          )}
        </div>
      </nav>
    </>
  );
}

function PromoBanner() {
  return (
    <section className="promo-section" id="home">
      <div className="promo-banner">
        <img
          src={promoBanner.image}
          alt="Living room furniture set"
          decoding="async"
          fetchPriority="high"
        />
        <div className="promo-copy">
          <p>{promoBanner.eyebrow}</p>
          <h1>{promoBanner.title}</h1>
          <span>{promoBanner.text}</span>
        </div>
      </div>
    </section>
  );
}

function HomeSeoIntro() {
  return (
    <section className="home-seo-intro" aria-labelledby="home-seo-title">
      <h2 id="home-seo-title">{homepageSeoContent.title}</h2>
      <p>{homepageSeoContent.text}</p>
    </section>
  );
}

function CategoryShowcase({ onNavigate }) {
  return (
    <section className="section category-section" id="categories">
      <div className="compact-heading">
        <h2>Shop By Categories</h2>
      </div>

      <div className="category-grid">
        {shopCategories.map((category) => (
          <a
            className="category-card"
            href={collectionPath(category.slug)}
            key={category.name}
            onClick={(event) => onNavigate(collectionPath(category.slug), event)}
          >
            <span className="category-image-frame">
              <img
                src={category.image}
                alt={`${category.name} furniture`}
                loading="lazy"
                decoding="async"
              />
            </span>
            <strong>{category.name}</strong>
          </a>
        ))}
      </div>
    </section>
  );
}

function ProductCard({ product, onNavigate }) {
  const detailsPath = productPath(product);

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <a
          className="product-image-link"
          href={detailsPath}
          onClick={(event) => onNavigate(detailsPath, event)}
          aria-label={`View ${product.name}`}
        >
          <img
            src={primaryProductImage(product)}
            alt={productImageAlt(product)}
            loading="lazy"
            decoding="async"
          />
        </a>
        <span className="product-badge">{product.badge}</span>
      </div>
      <div className="product-body">
        <div className="product-meta">
          <span>{product.category}</span>
          <strong>{displayPrice(product)}</strong>
        </div>
        <a
          className="product-title-link"
          href={detailsPath}
          onClick={(event) => onNavigate(detailsPath, event)}
        >
          <h3>{product.name}</h3>
        </a>
        <p>{product.description}</p>
        <div className="product-actions">
          <a
            className="button"
            href={createWhatsappLink(product)}
            target="_blank"
            rel="noreferrer"
            onClick={() =>
              trackWhatsappClick({
                category: collectionForProduct(product)?.slug || product.collectionSlug,
                cta_location: "product_card",
                page_type: "product_card",
                product_id: product.id,
                product_path: productPath(product),
              })
            }
          >
            <MessageCircle size={17} aria-hidden="true" />
            Enquire
          </a>
          <a
            className="button button-secondary"
            href={detailsPath}
            onClick={(event) => onNavigate(detailsPath, event)}
          >
            <Eye size={17} aria-hidden="true" />
            Details
          </a>
        </div>
      </div>
    </article>
  );
}

function FeaturedProducts({ onNavigate }) {
  const [featuredSearchQuery, setFeaturedSearchQuery] = useState("");
  const featuredProducts = featuredProductIds
    .map((id) => products.find((product) => product.id === id || product.slug === id))
    .filter((product) => product && product.active !== false);

  function handleFeaturedSearch(event) {
    event.preventDefault();
    const trimmedQuery = featuredSearchQuery.trim();

    if (!trimmedQuery) {
      return;
    }

    onNavigate(searchPath(trimmedQuery));
  }

  return (
    <section className="section featured-section" id="catalog">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Featured picks</p>
          <h2>A small shortlist to start with.</h2>
        </div>
        <div className="featured-heading-actions">
          <p>
            We keep the home page focused on a few representative products. Use categories or search
            to browse the full catalog.
          </p>
          <div className="featured-search-block">
            <form className="featured-search-form" role="search" onSubmit={handleFeaturedSearch}>
              <Search size={18} aria-hidden="true" />
              <input
                aria-label="Search the furniture catalog"
                type="text"
                placeholder="Search sofas, wardrobes, dining sets..."
                value={featuredSearchQuery}
                onChange={(event) => setFeaturedSearchQuery(event.target.value)}
              />
              <button className="button" type="submit">
                Search
              </button>
            </form>
            <a
              className="featured-browse-link"
              href="/#categories"
              onClick={(event) => onNavigate("/#categories", event)}
            >
              Browse categories
              <ChevronRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      {featuredProducts.length > 0 ? (
        <div className="product-grid featured-grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      ) : (
        <p className="empty-state">Featured products are being updated.</p>
      )}
    </section>
  );
}

function HomeHelpStrip({ onNavigate }) {
  return (
    <section className="home-help-strip" aria-label="Furniture buying help">
      <div>
        <p className="eyebrow">Need help choosing?</p>
        <h2>Include a photo, space measurements, or budget in your enquiry.</h2>
      </div>
      <div className="home-help-actions">
        <a
          className="button"
          href={createWhatsappLink()}
          target="_blank"
          rel="noreferrer"
          onClick={() =>
            trackWhatsappClick({ cta_location: "home_help", page_type: "homepage" })
          }
        >
          <MessageCircle size={18} aria-hidden="true" />
          WhatsApp us
        </a>
        <a
          className="button button-secondary"
          href="/contact"
          onClick={(event) => onNavigate("/contact", event)}
        >
          <Mail size={18} aria-hidden="true" />
          Contact page
        </a>
      </div>
    </section>
  );
}

function relatedCollectionsFor(collection) {
  const preferred = (collection.relatedSlugs || [])
    .map((slug) => shopCategories.find((category) => category.slug === slug))
    .filter(Boolean);
  const remaining = shopCategories.filter(
    (category) => category.slug !== collection.slug && !preferred.some((item) => item.slug === category.slug),
  );

  return [...preferred, ...remaining].slice(0, 6);
}

function CollectionSeoGuide({ collection }) {
  if (!collection.seoContent) {
    return null;
  }

  return (
    <section className="collection-guide" aria-labelledby={`${collection.slug}-buying-guide`}>
      <div className="collection-guide-intro">
        <p className="eyebrow">Buying guide</p>
        <h2 id={`${collection.slug}-buying-guide`}>{collection.seoContent.buyingTitle}</h2>
        <p>{collection.seoContent.intro}</p>
      </div>

      <ul className="collection-guide-points">
        {collection.seoContent.buyingPoints.map((point) => (
          <li key={point}>
            <CheckCircle2 size={18} aria-hidden="true" />
            <span>{point}</span>
          </li>
        ))}
      </ul>

      <div className="collection-faqs">
        <h2>Frequently asked questions</h2>
        {collection.seoContent.faqs.map((faq) => (
          <details key={faq.question}>
            <summary>{faq.question}</summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function CollectionPage({ collection, onNavigate }) {
  const collectionProducts = productsForCollection(collection);
  const [filters, setFilters] = useState(defaultCollectionFilters);
  const [sortBy, setSortBy] = useState("popular");
  const filterOptions = useMemo(() => getCollectionFilterOptions(collectionProducts), [collectionProducts]);
  const filteredProducts = useMemo(
    () => collectionProducts.filter((product) => productMatchesCollectionFilters(product, filters)),
    [collectionProducts, filters],
  );
  const sortedProducts = useMemo(
    () => sortCollectionProducts(filteredProducts, sortBy, collectionProducts),
    [collectionProducts, filteredProducts, sortBy],
  );
  const activeFilters = hasActiveCollectionFilters(filters);

  useEffect(() => {
    setFilters(defaultCollectionFilters);
    setSortBy("popular");
  }, [collection.slug]);

  function updateFilter(filterName, value) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [filterName]: value,
    }));
  }

  function resetFilters() {
    setFilters(defaultCollectionFilters);
  }

  return (
    <main>
      <section className="collection-hero">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href="/" onClick={(event) => onNavigate("/", event)}>
            Home
          </a>
          <span aria-hidden="true">/</span>
          <span>{collection.name}</span>
        </nav>

        <div className="collection-hero-panel">
          <img
            src={collection.image}
            alt={`${collection.name} furniture collection`}
            decoding="async"
            fetchPriority="high"
          />
          <div>
            <p className="eyebrow">Collection</p>
            <h1>{collection.heading || collection.name}</h1>
            <p>{collection.description}</p>
            <a
              className="button"
              href={createWhatsappLink(collection.name)}
              target="_blank"
              rel="noreferrer"
              onClick={() =>
                trackWhatsappClick({
                  category: collection.slug,
                  cta_location: "collection_hero",
                  page_type: "category",
                })
              }
            >
              <MessageCircle size={18} aria-hidden="true" />
              Ask about {collection.name}
            </a>
          </div>
        </div>
      </section>

      <section className="section collection-products">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Available options</p>
            <h2>{collectionResultLabel(sortedProducts.length, collection)}</h2>
          </div>
          <p>Use the available filters to compare products, then open a product page for its current details.</p>
        </div>

        {collectionProducts.length > 0 ? (
          <>
            <div className="collection-controls" aria-label={`${collection.name} filters and sorting`}>
              <div className="collection-count">
                <strong>{collectionResultLabel(sortedProducts.length, collection)}</strong>
                {activeFilters && <span>Filtered from {collectionProducts.length} total</span>}
              </div>

              <div className="collection-control-grid">
                <label className="filter-field">
                  <span>Price</span>
                  <select
                    value={filters.price}
                    onChange={(event) => updateFilter("price", event.target.value)}
                  >
                    {priceFilterOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                {filterOptions.seating.length > 0 && (
                  <label className="filter-field">
                    <span>Seating</span>
                    <select
                      value={filters.seating}
                      onChange={(event) => updateFilter("seating", event.target.value)}
                    >
                      <option value="all">Any seating</option>
                      {filterOptions.seating.map((seating) => (
                        <option key={seating} value={String(seating)}>
                          {seating} seater
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {filterOptions.colors.length > 0 && (
                  <label className="filter-field">
                    <span>Color</span>
                    <select
                      value={filters.color}
                      onChange={(event) => updateFilter("color", event.target.value)}
                    >
                      <option value="all">Any color</option>
                      {filterOptions.colors.map((color) => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {filterOptions.materials.length > 0 && (
                  <label className="filter-field">
                    <span>Material</span>
                    <select
                      value={filters.material}
                      onChange={(event) => updateFilter("material", event.target.value)}
                    >
                      <option value="all">Any material</option>
                      {filterOptions.materials.map((material) => (
                        <option key={material} value={material}>
                          {material}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {filterOptions.availabilities.length > 0 && (
                  <label className="filter-field">
                    <span>Availability</span>
                    <select
                      value={filters.availability}
                      onChange={(event) => updateFilter("availability", event.target.value)}
                    >
                      <option value="all">Any availability</option>
                      {filterOptions.availabilities.map((availability) => (
                        <option key={availability} value={availability}>
                          {availability}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <label className="filter-field">
                  <span>Sort</span>
                  <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                    {collectionSortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {activeFilters && (
                <button className="filter-reset" type="button" onClick={resetFilters}>
                  <X size={16} aria-hidden="true" />
                  Clear filters
                </button>
              )}
            </div>

            {sortedProducts.length > 0 ? (
              <div className="product-grid">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
                ))}
              </div>
            ) : (
              <div className="empty-filter-state">
                <h3>No matching products found.</h3>
                <p>Try removing a filter or choosing a broader price, color, or material.</p>
                <button className="button button-secondary" type="button" onClick={resetFilters}>
                  <X size={17} aria-hidden="true" />
                  Clear filters
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="empty-state">Products for this collection will be added soon.</p>
        )}
      </section>

      <CollectionSeoGuide collection={collection} />

      <section className="section related-collections">
        <div className="compact-heading">
          <h2>More Categories</h2>
        </div>
        <div className="related-grid">
          {relatedCollectionsFor(collection).map((category) => (
              <a
                className="related-link"
                href={collectionPath(category.slug)}
                key={category.slug}
                onClick={(event) => onNavigate(collectionPath(category.slug), event)}
              >
                {category.name}
              </a>
            ))}
        </div>
      </section>

      <ServiceBand />
      <VisitSection />
    </main>
  );
}

function SearchPage({ query, onNavigate }) {
  const decodedQuery = query.trim();
  const results = useMemo(() => buildSearchResults(decodedQuery), [decodedQuery]);
  const starterCollections = shopCategories.slice(0, 6);
  const starterProducts = featuredProductIds
    .map((id) => products.find((product) => product.id === id || product.slug === id))
    .filter((product) => product && product.active !== false)
    .slice(0, 4);

  return (
    <main>
      <section className="search-page">
        <div className="search-page-heading">
          <p className="eyebrow">Search</p>
          <h1>{decodedQuery ? `Results for "${decodedQuery}"` : "Search the catalog"}</h1>
          <p>
            Search covers product names, collections, room categories, colors, materials, seating,
            prices, dimensions, and tags.
          </p>
        </div>

        {!decodedQuery ? (
          <div className="search-start-layout">
            <section className="search-start-card">
              <div>
                <p className="eyebrow">Popular searches</p>
                <h2>Start with a product type, room, color, or use case.</h2>
              </div>
              <div className="search-chip-grid" aria-label="Popular search terms">
                {popularSearchTerms.map((term) => (
                  <a
                    className="search-start-chip"
                    href={searchPath(term)}
                    key={term}
                    onClick={(event) => onNavigate(searchPath(term), event)}
                  >
                    <Search size={15} aria-hidden="true" />
                    {term}
                  </a>
                ))}
              </div>
            </section>

            <section className="search-section">
              <div className="compact-heading search-section-heading">
                <h2>Browse Collections</h2>
              </div>
              <div className="search-collection-grid">
                {starterCollections.map((collection) => (
                  <a
                    className="search-collection-card"
                    href={collectionPath(collection.slug)}
                    key={collection.slug}
                    onClick={(event) => onNavigate(collectionPath(collection.slug), event)}
                  >
                    <img src={collection.image} alt={`${collection.name} furniture collection`} />
                    <span>
                      <strong>{collection.name}</strong>
                      <small>{collection.description}</small>
                    </span>
                  </a>
                ))}
              </div>
            </section>

            {starterProducts.length > 0 && (
              <section className="search-section">
                <div className="compact-heading search-section-heading">
                  <h2>Featured Products</h2>
                </div>
                <div className="product-grid featured-grid">
                  {starterProducts.map((product) => (
                    <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : results.total > 0 ? (
          <div className="search-results-layout">
            {results.collections.length > 0 && (
              <section className="search-section">
                <div className="compact-heading search-section-heading">
                  <h2>Matching Collections</h2>
                </div>
                <div className="search-collection-grid">
                  {results.collections.map(({ collection }) => (
                    <a
                      className="search-collection-card"
                      href={collectionPath(collection.slug)}
                      key={collection.slug}
                      onClick={(event) => onNavigate(collectionPath(collection.slug), event)}
                    >
                      <img src={collection.image} alt={`${collection.name} furniture collection`} />
                      <span>
                        <strong>{collection.name}</strong>
                        <small>{collection.description}</small>
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {results.categories.length > 0 && (
              <section className="search-section">
                <div className="compact-heading search-section-heading">
                  <h2>Room Categories</h2>
                </div>
                <div className="search-room-grid">
                  {results.categories.map(({ category }) => (
                    <a
                      className="search-room-card"
                      href={searchPath(category.name)}
                      key={category.name}
                      onClick={(event) => onNavigate(searchPath(category.name), event)}
                    >
                      <strong>{category.name}</strong>
                      <span>{category.description}</span>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {results.products.length > 0 && (
              <section className="search-section">
                <div className="compact-heading search-section-heading">
                  <h2>Matching Products</h2>
                </div>
                <div className="product-grid">
                  {results.products.map(({ product }) => (
                    <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="empty-state">
            No results found. Try a broader search like sofa, dining, brown, bed, or storage.
          </div>
        )}
      </section>
    </main>
  );
}

function planningGuidesForProduct(product) {
  const measurementGuide = findGuide("measure-for-furniture-delivery");
  const categoryGuides = guides.filter((guide) =>
    guide.relatedCollections.includes(product.collectionSlug),
  );

  return [measurementGuide, ...categoryGuides]
    .filter(Boolean)
    .filter((guide, index, allGuides) => allGuides.findIndex((item) => item.slug === guide.slug) === index);
}

function planningCollectionsForProduct(collection) {
  if (!collection) return [];

  return [collection, ...(collection.relatedSlugs || []).map(findCollection)]
    .filter(Boolean)
    .filter((item, index, allItems) => allItems.findIndex((candidate) => candidate.slug === item.slug) === index)
    .slice(0, 4);
}

function ProductDetailPage({ product, onNavigate }) {
  const images = productImages(product);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImage = images[activeImageIndex] || primaryProductImage(product);
  const hasMultipleImages = images.length > 1;
  const collection = product.collectionSlug ? findCollection(product.collectionSlug) : null;
  const collectionHref = collection ? collectionPath(collection.slug) : "/#catalog";
  const specItems = [
    ["Price", displayPrice(product)],
    ["Availability", product.availability],
    ["Seating", product.seating ? `${product.seating} seater` : ""],
    ["Colour", product.colors?.join(", ")],
    ["Dimensions", product.dimensions],
    ["Material", product.material],
    ["Style", product.style],
  ].filter(([, value]) => value);
  const relatedProducts = products
    .filter(
      (item) =>
        item.active !== false &&
        item.id !== product.id &&
        (item.collectionSlug === product.collectionSlug || item.category === product.category),
    )
    .slice(0, 4);
  const planningGuides = planningGuidesForProduct(product);
  const planningCollections = planningCollectionsForProduct(collection);
  const dimensionsGuidance = product.detailsVerified
    ? product.dimensions
      ? `Compare the listed dimensions (${product.dimensions}) with the room and access route.`
      : MISSING_DIMENSIONS_MESSAGE
    : product.dimensions
      ? `Confirm the listed dimensions (${product.dimensions}) for the exact item, then compare them with the room and access route.`
      : MISSING_DIMENSIONS_MESSAGE;
  const materialGuidance = product.material
    ? product.detailsVerified
      ? `Review the listed material and finish (${product.material}) for the intended use and care routine.`
      : `Confirm the listed material and finish (${product.material}) for the exact item before making a decision.`
    : "Material and finish details are not currently published for this product. Please contact us to confirm them before ordering.";

  useEffect(() => {
    setActiveImageIndex(0);
  }, [product.id]);

  function showPreviousImage() {
    setActiveImageIndex((currentIndex) =>
      currentIndex === 0 ? images.length - 1 : currentIndex - 1,
    );
  }

  function showNextImage() {
    setActiveImageIndex((currentIndex) =>
      currentIndex === images.length - 1 ? 0 : currentIndex + 1,
    );
  }

  return (
    <main className="product-detail-page">
      <section className="product-detail-shell">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href="/" onClick={(event) => onNavigate("/", event)}>
            Home
          </a>
          <span aria-hidden="true">/</span>
          <a href={collectionHref} onClick={(event) => onNavigate(collectionHref, event)}>
            {collection?.name || product.category}
          </a>
          <span aria-hidden="true">/</span>
          <span>{product.name}</span>
        </nav>

        <div className="product-detail-layout">
          <div className="product-detail-media">
            <div className="product-gallery-main">
              <img
                src={activeImage}
                alt={productImageAlt(product, activeImageIndex)}
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />

              {hasMultipleImages && (
                <>
                  <button
                    className="gallery-arrow gallery-arrow-left"
                    type="button"
                    onClick={showPreviousImage}
                    aria-label="Show previous product image"
                  >
                    <ChevronLeft size={24} aria-hidden="true" />
                  </button>
                  <button
                    className="gallery-arrow gallery-arrow-right"
                    type="button"
                    onClick={showNextImage}
                    aria-label="Show next product image"
                  >
                    <ChevronRight size={24} aria-hidden="true" />
                  </button>
                  <span className="gallery-count">
                    {activeImageIndex + 1} / {images.length}
                  </span>
                </>
              )}
            </div>

            {hasMultipleImages && (
              <div className="product-gallery-thumbs" aria-label="Product images">
                {images.map((image, index) => (
                  <button
                    className={index === activeImageIndex ? "gallery-thumb active" : "gallery-thumb"}
                    type="button"
                    key={image}
                    onClick={() => setActiveImageIndex(index)}
                    aria-label={`Show product image ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt={productImageAlt(product, index)}
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-detail-info">
            <p className="eyebrow">{collection?.name || product.category}</p>
            <h1>{product.name}</h1>
            <p className="product-detail-description">{product.description}</p>

            <div className="product-detail-price">{displayPrice(product)}</div>

            <div className="product-detail-actions">
              <a
                className="button"
                href={createWhatsappLink(product)}
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  trackWhatsappClick({
                    category: collection?.slug || product.collectionSlug,
                    cta_location: "product_detail",
                    page_type: "product",
                    product_id: product.id,
                    product_path: productPath(product),
                  })
                }
              >
                <MessageCircle size={18} aria-hidden="true" />
                Ask on WhatsApp
              </a>
              <a
                className="button button-secondary"
                href={`tel:${business.callNumber}`}
                onClick={() =>
                  trackPhoneClick({
                    category: collection?.slug || product.collectionSlug,
                    cta_location: "product_detail",
                    page_type: "product",
                    product_id: product.id,
                    product_path: productPath(product),
                  })
                }
              >
                <Phone size={18} aria-hidden="true" />
                Call us
              </a>
            </div>

            <dl className="spec-grid">
              {specItems.map(([label, value]) => (
                <div className="spec-card" key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="section product-detail-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Product information</p>
            <h2>Details and specifications</h2>
          </div>
          <p>
            Confirm exact finish, size, and availability with us before ordering. Product
            information can vary by the exact variant and latest catalog details.
          </p>
        </div>

        <div className="product-detail-notes">
          <article className="detail-panel">
            <h3>Highlights</h3>
            <ul className="feature-points">
              {(product.details || []).map((detail) => (
                <li key={detail}>
                  <CheckCircle2 size={17} aria-hidden="true" />
                  {detail}
                </li>
              ))}
            </ul>
          </article>

          <article className="detail-panel">
            <h3>Construction</h3>
            {product.materialDetails?.length ? (
              <ul className="feature-points">
                {product.materialDetails.map((detail) => (
                  <li key={detail}>
                    <CheckCircle2 size={17} aria-hidden="true" />
                    {detail}
                  </li>
                ))}
              </ul>
            ) : (
              <p>{product.material || "Material and finish details are not currently published for this product. Please contact us to confirm them before ordering."}</p>
            )}
          </article>
        </div>
      </section>

      <section className="section product-planning-section" aria-labelledby="product-planning-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Plan before ordering</p>
            <h2 id="product-planning-title">Room fit, finish, and delivery access</h2>
          </div>
          <p>Use these checks when enquiring so the exact product and access requirements can be reviewed.</p>
        </div>

        <div className="product-planning-grid">
          <article className="detail-panel">
            <h3>Dimensions and room fit</h3>
            <p>{dimensionsGuidance}</p>
          </article>
          <article className="detail-panel">
            <h3>Material and finish</h3>
            <p>{materialGuidance}</p>
          </article>
          <article className="detail-panel">
            <h3>Delivery access</h3>
            <p>
              Measure the building entrance, home entrance, doors, corridors, stairs, and lift.
              Share the narrowest measurements and photos of tight turns with the enquiry.
            </p>
          </article>
        </div>

        <div className="product-resource-links">
          <div>
            <strong>Planning guides</strong>
            {planningGuides.map((guide) => (
              <a href={guidePath(guide)} key={guide.slug} onClick={(event) => onNavigate(guidePath(guide), event)}>
                {guide.shortTitle}
              </a>
            ))}
          </div>
          <div>
            <strong>Related collections</strong>
            {planningCollections.map((item) => (
              <a href={collectionPath(item.slug)} key={item.slug} onClick={(event) => onNavigate(collectionPath(item.slug), event)}>
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="section product-detail-related">
          <div className="compact-heading">
            <h2>Related Products</h2>
          </div>
          <div className="product-grid">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      <VisitSection />
    </main>
  );
}

function ContentSections({ sections }) {
  return sections.map((section) => (
    <section className="content-section" key={section.heading}>
      <h2>{section.heading}</h2>
      {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      {section.bullets?.length ? (
        <ul>
          {section.bullets.map((bullet) => (
            <li key={bullet}>
              <CheckCircle2 aria-hidden="true" size={18} />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  ));
}

function GuidePage({ guide, onNavigate }) {
  const relatedCollections = guide.relatedCollections
    .map((slug) => findCollection(slug))
    .filter(Boolean);

  return (
    <main className="content-page">
      <article className="content-shell">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href="/" onClick={(event) => onNavigate("/", event)}>Home</a>
          <span aria-hidden="true">/</span>
          <span>Guide</span>
        </nav>
        <header className="content-header">
          <p className="eyebrow">Furniture planning guide</p>
          <h1>{guide.title}</h1>
          <p>{guide.intro}</p>
        </header>

        <div className="content-body">
          <ContentSections sections={guide.sections} />
        </div>

        <aside className="content-related" aria-labelledby="related-collections-title">
          <div>
            <p className="eyebrow">Continue planning</p>
            <h2 id="related-collections-title">Browse related furniture</h2>
          </div>
          <div className="content-link-row">
            {relatedCollections.map((collection) => (
              <a
                href={collectionPath(collection.slug)}
                key={collection.slug}
                onClick={(event) => onNavigate(collectionPath(collection.slug), event)}
              >
                {collection.name}
              </a>
            ))}
            <a href="/contact" onClick={(event) => onNavigate("/contact", event)}>Contact us</a>
          </div>
        </aside>
      </article>
    </main>
  );
}

function InformationPage({ page, pageKey, onNavigate }) {
  return (
    <main className="content-page">
      <article className="content-shell">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href="/" onClick={(event) => onNavigate("/", event)}>Home</a>
          <span aria-hidden="true">/</span>
          <span>{page.title}</span>
        </nav>
        <header className="content-header">
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p>{page.intro}</p>
        </header>

        <div className="content-body">
          <ContentSections sections={page.sections} />
        </div>

        <aside className="content-related" aria-labelledby={`${pageKey}-next-title`}>
          <div>
            <p className="eyebrow">Useful links</p>
            <h2 id={`${pageKey}-next-title`}>Continue on the website</h2>
          </div>
          <div className="content-link-row">
            <a href="/contact" onClick={(event) => onNavigate("/contact", event)}>Contact us</a>
            {guides.map((guide) => (
              <a href={guidePath(guide)} key={guide.slug} onClick={(event) => onNavigate(guidePath(guide), event)}>
                {guide.shortTitle}
              </a>
            ))}
          </div>
        </aside>
      </article>
    </main>
  );
}

function NotFoundPage({ onNavigate }) {
  return (
    <main>
      <section className="section not-found">
        <p className="eyebrow">Page not found</p>
        <h1>We could not find that page.</h1>
        <p>Return to the homepage or browse the current furniture collections.</p>
        <a className="button" href="/" onClick={(event) => onNavigate("/", event)}>
          Back to home
        </a>
      </section>
    </main>
  );
}

function ProductModal({ product, onClose }) {
  const modalDetails = [
    ["Price", displayPrice(product)],
    ["Dimensions", product.dimensions],
    ["Material", product.material],
  ].filter(([, value]) => value);

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close details">
          <X size={20} aria-hidden="true" />
        </button>
        <img
          src={primaryProductImage(product)}
          alt={productImageAlt(product)}
          loading="lazy"
          decoding="async"
        />
        <div className="modal-content">
          <p className="eyebrow">{product.category}</p>
          <h2 id="product-modal-title">{product.name}</h2>
          <p>{product.description}</p>
          <dl className="detail-list">
            {modalDetails.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <ul className="feature-points">
            {product.details.map((detail) => (
              <li key={detail}>
                <CheckCircle2 size={17} aria-hidden="true" />
                {detail}
              </li>
            ))}
          </ul>
          <div className="modal-actions">
            <a
              className="button"
              href={createWhatsappLink(product)}
              target="_blank"
              rel="noreferrer"
              onClick={() =>
                trackWhatsappClick({
                  category: product.collectionSlug,
                  cta_location: "product_modal",
                  page_type: "product_modal",
                  product_id: product.id,
                  product_path: productPath(product),
                })
              }
            >
              <MessageCircle size={18} aria-hidden="true" />
              Ask on WhatsApp
            </a>
            <a
              className="button button-secondary"
              href={`tel:${business.callNumber}`}
              onClick={() =>
                trackPhoneClick({
                  category: product.collectionSlug,
                  cta_location: "product_modal",
                  page_type: "product_modal",
                  product_id: product.id,
                  product_path: productPath(product),
                })
              }
            >
              <Phone size={18} aria-hidden="true" />
              Call us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function ServiceBand() {
  const items = [
    {
      icon: Truck,
      title: "Delivery questions",
      text: "Share your Mumbai locality and building access details, then confirm what is available for the product.",
    },
    {
      icon: ShieldCheck,
      title: "Product checks",
      text: "Confirm exact dimensions, material, finish, and available options for the item shown.",
    },
    {
      icon: MessageCircle,
      title: "Linked enquiries",
      text: "Product enquiries include the product name and page link for clear reference.",
    },
  ];

  return (
    <section className="service-band" id="why-us">
      <div className="service-heading">
        <p className="eyebrow">Before you enquire</p>
        <h2>Browse first, then confirm the details that affect your decision.</h2>
      </div>
      <div className="service-grid">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <article className="service-item" key={item.title}>
              <Icon size={24} aria-hidden="true" />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function VisitSection() {
  return (
    <section className="section visit-section" id="visit">
      <div className="visit-copy">
        <p className="eyebrow">Location and directions</p>
        <h2>Contact us before planning a visit.</h2>
        <p>
          Share the product you are considering and confirm current opening hours, visit
          arrangements, and available product details before travelling.
        </p>
      </div>

      <div className="contact-panel">
        <h3>{business.name}</h3>
        <p>
          <MapPin size={18} aria-hidden="true" />
          <span>{business.locationLabel}</span>
        </p>
        <p>
          <Phone size={18} aria-hidden="true" />
          <a
            href={`tel:${business.callNumber}`}
            onClick={() => trackPhoneClick({ cta_location: "visit_section", page_type: "shared" })}
          >
            {business.phoneDisplay}
          </a>
        </p>
        <p>{business.hours}</p>
        <div className="contact-actions">
          <a
            className="button"
            href={createWhatsappLink()}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackWhatsappClick({ cta_location: "visit_section", page_type: "shared" })}
          >
            <MessageCircle size={18} aria-hidden="true" />
            WhatsApp now
          </a>
          <a
            className="button button-secondary"
            href={business.mapsUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent("map_click", { cta_location: "visit_section", page_type: "shared" })}
          >
            <MapPin size={18} aria-hidden="true" />
            Open map
          </a>
        </div>
      </div>
    </section>
  );
}

function ContactPage({ onNavigate }) {
  const enquiryGuides = [
    "Product name or photo",
    "Preferred size, color, and material",
    "Delivery location and expected timeline",
  ];

  return (
    <main className="contact-page">
      <section className="contact-hero">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href="/" onClick={(event) => onNavigate("/", event)}>
            Home
          </a>
          <span aria-hidden="true">/</span>
          <span>Contact us</span>
        </nav>

        <div className="contact-hero-grid">
          <div className="contact-hero-copy">
            <p className="eyebrow">Contact Lucky Interiors</p>
            <h1>Tell us what you are looking for.</h1>
            <p>
              For product details, current prices, size options, availability, or location
              questions, reach us by email, WhatsApp, or phone. Share a product link or photo so we can
              respond with the most useful details.
            </p>
            <div className="contact-hero-actions">
              <a
                className="button"
                href={createWhatsappLink()}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackWhatsappClick({ cta_location: "contact_hero", page_type: "contact" })}
              >
                <MessageCircle size={18} aria-hidden="true" />
                WhatsApp for quote
              </a>
              <a
                className="button button-secondary"
                href={`tel:${business.callNumber}`}
                onClick={() => trackPhoneClick({ cta_location: "contact_hero", page_type: "contact" })}
              >
                <Phone size={18} aria-hidden="true" />
                Call us
              </a>
            </div>
          </div>

          <aside className="contact-summary" aria-label="Contact summary">
            <h2>Contact details</h2>
            <div className="contact-summary-list">
              <a
                href={createEmailLink("Furniture enquiry")}
                onClick={() => trackEvent("email_click", { cta_location: "contact_summary", page_type: "contact" })}
              >
                <Mail size={18} aria-hidden="true" />
                <span>
                  <strong>Email</strong>
                  {business.email}
                </span>
              </a>
              <a
                href={`tel:${business.callNumber}`}
                onClick={() => trackPhoneClick({ cta_location: "contact_summary", page_type: "contact" })}
              >
                <Phone size={18} aria-hidden="true" />
                <span>
                  <strong>Phone</strong>
                  {business.phoneDisplay}
                </span>
              </a>
              <p>
                <Clock size={18} aria-hidden="true" />
                <span>
                  <strong>Hours</strong>
                  {business.hours}
                </span>
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="contact-detail-section">
        <article className="contact-method-card">
          <Mail size={24} aria-hidden="true" />
          <h2>Email queries</h2>
          <p>
            Use email for general questions, product shortlists, quote requests, and follow-up
            details.
          </p>
          <a
            href={createEmailLink("Furniture enquiry")}
            onClick={() => trackEvent("email_click", { cta_location: "contact_email", page_type: "contact" })}
          >
            {business.email}
          </a>
        </article>

        <article className="contact-method-card">
          <MessageCircle size={24} aria-hidden="true" />
          <h2>Sales and quotes</h2>
          <p>
            For faster pricing and availability, send the product name, photo, size requirement, and
            delivery location on WhatsApp.
          </p>
          <a
            href={createWhatsappLink()}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackWhatsappClick({ cta_location: "contact_sales", page_type: "contact" })}
          >
            Message on WhatsApp
          </a>
        </article>

        <article className="contact-method-card">
          <Phone size={24} aria-hidden="true" />
          <h2>Call us</h2>
          <p>
            Call to confirm opening hours or discuss a product, a planned visit, an order, or
            available delivery information.
          </p>
          <a
            href={`tel:${business.callNumber}`}
            onClick={() => trackPhoneClick({ cta_location: "contact_call", page_type: "contact" })}
          >
            {business.phoneDisplay}
          </a>
        </article>
      </section>

      <section className="contact-visit-section">
        <div>
          <p className="eyebrow">Before you contact us</p>
          <h2>Helpful details to share</h2>
          <ul className="feature-points">
            {enquiryGuides.map((item) => (
              <li key={item}>
                <CheckCircle2 size={17} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="contact-location-panel">
          <h2>Location map</h2>
          <div className="contact-map-frame">
            <iframe
              title={`${business.name} location map`}
              src={business.mapsEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <p>
            <MapPin size={18} aria-hidden="true" />
            <span>{business.locationLabel}</span>
          </p>
          <p>
            <Clock size={18} aria-hidden="true" />
            <span>{business.hours}</span>
          </p>
          <a
            className="button button-secondary"
            href={business.mapsUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent("map_click", { cta_location: "contact_map", page_type: "contact" })}
          >
            <MapPin size={18} aria-hidden="true" />
            Open map
          </a>
        </div>
      </section>
    </main>
  );
}

function Footer({ onNavigate }) {
  const footerCategories = ["sofas", "beds", "dining-sets", "wardrobes", "centre-tables", "cabinets-sideboards"]
    .map((slug) => shopCategories.find((category) => category.slug === slug))
    .filter(Boolean);

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <strong>{business.name}</strong>
          <p>Browse furniture online and contact us to confirm the latest product details.</p>
        </div>

        <nav className="footer-links" aria-label="Footer product categories">
          <strong>Browse</strong>
          {footerCategories.map((category) => (
            <a
              href={collectionPath(category.slug)}
              key={category.slug}
              onClick={(event) => onNavigate(collectionPath(category.slug), event)}
            >
              {category.name}
            </a>
          ))}
        </nav>

        <nav className="footer-links" aria-label="Furniture guides and website information">
          <strong>Resources</strong>
          <a href="/about" onClick={(event) => onNavigate("/about", event)}>About</a>
          {guides.map((guide) => (
            <a href={guidePath(guide)} key={guide.slug} onClick={(event) => onNavigate(guidePath(guide), event)}>
              {guide.shortTitle}
            </a>
          ))}
          <a href="/privacy" onClick={(event) => onNavigate("/privacy", event)}>Privacy</a>
          <a href="/terms" onClick={(event) => onNavigate("/terms", event)}>Terms</a>
        </nav>

        <div className="footer-links">
          <strong>Contact</strong>
          <a href="/contact" onClick={(event) => onNavigate("/contact", event)}>
            Contact us
          </a>
          <a
            href={`mailto:${business.email}`}
            onClick={() => trackEvent("email_click", { cta_location: "footer", page_type: "shared" })}
          >
            {business.email}
          </a>
          <a
            href={`tel:${business.callNumber}`}
            onClick={() => trackPhoneClick({ cta_location: "footer", page_type: "shared" })}
          >
            {business.phoneDisplay}
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} {business.name}. All rights reserved.
        </p>
        <a href="#home">Back to top</a>
      </div>
    </footer>
  );
}

export default function App({ initialPath = "" }) {
  const [pathname, setPathname] = useState(() => initialPath || currentPath());
  const route = parseRoute(pathname);
  const collection = route.type === "collection" ? findCollection(route.slug) : null;
  const product = route.type === "product" ? findProduct(route.slug) : null;
  const guide = route.type === "guide" ? findGuide(route.slug) : null;
  const informationPage = route.type === "information" ? informationPages[route.slug] : null;

  useEffect(() => {
    const browserPath = currentPath();

    if (browserPath !== pathname) {
      setPathname(browserPath);
    }
  }, []);

  useEffect(() => {
    function handlePopState() {
      setPathname(currentPath());
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    applySeo(buildSeoData(route, collection, product, pathname));
  }, [collection, pathname, product, route.type, route.query, route.slug]);

  useEffect(() => {
    trackEvent("page_view", {
      page_path: new URL(pathname, site.origin).pathname,
      page_type: route.type,
    });
  }, [pathname, route.type]);

  function handleNavigate(href, event) {
    if (
      event?.type === "click" &&
      (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey)
    ) {
      return;
    }

    event?.preventDefault();

    const nextUrl = new URL(href, window.location.origin);
    const nextPath = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
    const nextLocationPath = `${nextUrl.pathname}${nextUrl.search}`;
    const currentFullPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (nextPath !== currentFullPath) {
      window.history.pushState({}, "", nextPath);
    }

    setPathname(nextLocationPath);

    window.setTimeout(() => {
      if (nextUrl.hash) {
        document.querySelector(nextUrl.hash)?.scrollIntoView({ behavior: "smooth" });
        return;
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 0);
  }

  let pageContent;

  if (route.type === "collection" && collection) {
    pageContent = <CollectionPage collection={collection} onNavigate={handleNavigate} />;
  } else if (route.type === "product" && product) {
    pageContent = <ProductDetailPage product={product} onNavigate={handleNavigate} />;
  } else if (route.type === "search") {
    pageContent = <SearchPage query={route.query} onNavigate={handleNavigate} />;
  } else if (route.type === "contact") {
    pageContent = <ContactPage onNavigate={handleNavigate} />;
  } else if (route.type === "guide" && guide) {
    pageContent = <GuidePage guide={guide} onNavigate={handleNavigate} />;
  } else if (route.type === "information" && informationPage) {
    pageContent = <InformationPage page={informationPage} pageKey={route.slug} onNavigate={handleNavigate} />;
  } else if (
    route.type === "not-found" ||
    (route.type === "collection" && !collection) ||
    (route.type === "product" && !product) ||
    (route.type === "guide" && !guide) ||
    (route.type === "information" && !informationPage)
  ) {
    pageContent = <NotFoundPage onNavigate={handleNavigate} />;
  } else {
    pageContent = (
      <main>
        <PromoBanner />
        <HomeSeoIntro />
        <CategoryShowcase onNavigate={handleNavigate} />
        <FeaturedProducts onNavigate={handleNavigate} />
        <ServiceBand />
        <HomeHelpStrip onNavigate={handleNavigate} />
        <VisitSection />
      </main>
    );
  }

  return (
    <>
      <Header onNavigate={handleNavigate} />
      {pageContent}
      <a
        className="floating-whatsapp"
        href={createWhatsappLink()}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        onClick={() => trackWhatsappClick({ cta_location: "floating_button", page_type: route.type })}
      >
        <WhatsAppIcon />
      </a>
      <Footer onNavigate={handleNavigate} />
    </>
  );
}
