import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Eye,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  Truck,
  X,
} from "lucide-react";
import { business, categories, promoBanner, shopCategories } from "./data/catalog.js";
import { products } from "./data/products.js";
import { site } from "./data/site.js";

const allCategory = "All";
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
  return `${window.location.pathname}${window.location.search}` || "/";
}

function parseRoute(locationPath) {
  const url = new URL(locationPath, window.location.origin);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const collectionMatch = path.match(/^\/collections\/([^/]+)$/);
  const productMatch = path.match(/^\/products\/([^/]+)$/);

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

function productImages(product) {
  const images = product.images?.length ? product.images : [product.image];
  return images.filter(Boolean);
}

function primaryProductImage(product) {
  return productImages(product)[0];
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

function schemaAvailability(availability = "") {
  const normalized = normalizeSearchText(availability);

  if (normalized.includes("in stock")) {
    return "https://schema.org/InStock";
  }

  if (normalized.includes("made to order")) {
    return "https://schema.org/PreOrder";
  }

  return "https://schema.org/LimitedAvailability";
}

function buildLocalBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FurnitureStore",
    "@id": `${site.origin}/#store`,
    name: business.name,
    description: business.tagline,
    image: absoluteUrl(business.logo || site.defaultImage),
    url: site.origin,
    telephone: business.callNumber,
    email: business.email,
    priceRange: "Rs. 10,000 - Rs. 100,000",
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address,
      addressLocality: "Mumbai",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
    openingHours: "Mo-Su 10:00-21:00",
  };
}

function buildContactJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contact ${business.name}`,
    description: `Contact ${business.name} for furniture product queries, sales quotes, availability, and store visits.`,
    url: absoluteUrl("/contact"),
    mainEntity: {
      "@type": "FurnitureStore",
      name: business.name,
      telephone: business.callNumber,
      email: business.email,
      address: business.address,
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
  const numericPrice = typeof product.price === "number" ? product.price : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: productImages(product).map(absoluteUrl),
    brand: {
      "@type": "Brand",
      name: business.name,
    },
    category: collectionForProduct(product)?.name || product.category,
    material: product.material,
    color: product.colors?.join(", "),
    sku: product.id,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(productPath(product)),
      priceCurrency: "INR",
      price: numericPrice,
      availability: schemaAvailability(product.availability),
      seller: {
        "@type": "FurnitureStore",
        name: business.name,
      },
    },
  };
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

function buildSeoData(route, collection, product) {
  if (route.type === "product" && product) {
    const productCollection = collectionForProduct(product);
    const description = productSeoDescription(product);
    const canonical = absoluteUrl(productPath(product));

    return {
      title: `${product.name} | ${business.name}`,
      description,
      canonical,
      image: absoluteUrl(primaryProductImage(product) || site.defaultImage),
      robots: "index,follow",
      type: "product",
      pageJsonLd: [
        buildBreadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: productCollection?.name || product.category, href: productCollection ? collectionPath(productCollection.slug) : "/#catalog" },
          { name: product.name, href: productPath(product) },
        ]),
        buildProductJsonLd(product),
      ],
    };
  }

  if (route.type === "collection" && collection) {
    const description = truncateText(
      `${collection.description} Browse ${collection.name.toLowerCase()} and enquire with ${business.name} in Mumbai.`,
    );
    const canonical = absoluteUrl(collectionPath(collection.slug));

    return {
      title: `${collection.name} | ${business.name}`,
      description,
      canonical,
      image: absoluteUrl(collection.image || site.defaultImage),
      robots: "index,follow",
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
      description: `Contact ${business.name} for furniture sales, product queries, quotes, availability, delivery details, and store visit support.`,
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

  if (route.type === "not-found" || (route.type === "collection" && !collection) || (route.type === "product" && !product)) {
    return {
      title: `Page not found | ${business.name}`,
      description: "This page could not be found. Browse Lucky Interiors Furniture collections and products.",
      canonical: absoluteUrl(window.location.pathname),
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
  setJsonLd("local-business-jsonld", buildLocalBusinessJsonLd());

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

function createWhatsappLink(productName) {
  const text = productName
    ? `Hi ${business.name}, I am interested in ${productName}. Please share price, availability, and delivery details.`
    : `Hi ${business.name}, I would like to know more about your furniture catalog.`;

  return `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

function createEmailLink(subject = "Furniture enquiry") {
  return `mailto:${business.email}?subject=${encodeURIComponent(subject)}`;
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
                      <img src={collection.image} alt="" />
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
                      <img src={primaryProductImage(product)} alt="" />
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
          <a className="contact-link" href="/contact" onClick={(event) => onNavigate("/contact", event)}>
            Contact us
          </a>
        </div>

        <div className="logo-row">
          <HeaderSearch onNavigate={onNavigate} />
          <a
            className="logo-link"
            href="/"
            aria-label={`${business.name} home`}
            onClick={(event) => onNavigate("/", event)}
          >
            <img className="logo-image" src={business.logo} alt={business.name} />
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
        <img src={promoBanner.image} alt="Living room furniture set" />
        <div className="promo-copy">
          <p>{promoBanner.eyebrow}</p>
          <h1>{promoBanner.title}</h1>
          <span>{promoBanner.text}</span>
        </div>
      </div>
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
              <img src={category.image} alt="" loading="lazy" />
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
          <img src={primaryProductImage(product)} alt={product.name} loading="lazy" />
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
          <a className="button" href={createWhatsappLink(product.name)} target="_blank" rel="noreferrer">
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

function Catalog({ activeCategory, setActiveCategory, onNavigate }) {
  const [query, setQuery] = useState("");

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      if (product.active === false) {
        return false;
      }

      const matchesCategory = activeCategory === allCategory || product.category === activeCategory;
      const searchable = [
        product.name,
        product.category,
        product.description,
        product.badge,
        displayPrice(product),
        product.availability,
        product.seating ? `${product.seating} seater` : "",
        product.material,
        product.dimensions,
        ...(product.colors || []),
        ...(product.tags || []),
        ...(product.details || []),
        ...(product.materialDetails || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesCategory && searchable.includes(normalizedQuery);
    });
  }, [activeCategory, query]);

  const categoryOptions = [allCategory, ...categories.map((category) => category.name)];

  return (
    <section className="section catalog-section" id="catalog">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Product catalog</p>
          <h2>Browse popular furniture options.</h2>
        </div>
        <p>
          This is still simple for customers: they browse, open details, and enquire. Behind the
          scenes, React keeps products and categories easy to expand.
        </p>
      </div>

      <div className="catalog-toolbar">
        <div className="search-field">
          <Search size={18} aria-hidden="true" />
          <input
            aria-label="Search products"
            type="search"
            placeholder="Search sofa, bed, wardrobe..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <button
              className="search-clear"
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="category-tabs" aria-label="Filter products by category">
          {categoryOptions.map((category) => (
            <button
              className={category === activeCategory ? "tab active" : "tab"}
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {visibleProducts.length > 0 ? (
        <div className="product-grid">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      ) : (
        <p className="empty-state">No products found. Try another search or category.</p>
      )}
    </section>
  );
}

function CollectionPage({ collection, onNavigate }) {
  const collectionProducts = productsForCollection(collection);

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
          <img src={collection.image} alt="" />
          <div>
            <p className="eyebrow">Collection</p>
            <h1>{collection.name}</h1>
            <p>{collection.description}</p>
            <a className="button" href={createWhatsappLink(collection.name)} target="_blank" rel="noreferrer">
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
            <h2>{collection.name} products</h2>
          </div>
          <p>
            These are starter products mapped to the closest furniture group. As you add real
            products, each collection can become more specific.
          </p>
        </div>

        {collectionProducts.length > 0 ? (
          <div className="product-grid">
            {collectionProducts.map((product) => (
              <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>
        ) : (
          <p className="empty-state">Products for this collection will be added soon.</p>
        )}
      </section>

      <section className="section related-collections">
        <div className="compact-heading">
          <h2>More Categories</h2>
        </div>
        <div className="related-grid">
          {shopCategories
            .filter((category) => category.slug !== collection.slug)
            .slice(0, 6)
            .map((category) => (
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
          <div className="empty-state">Use the search box above to find products and categories.</div>
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
                      <img src={collection.image} alt="" />
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
              <img src={activeImage} alt={product.name} />

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
                    <img src={image} alt="" />
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
              <a className="button" href={createWhatsappLink(product.name)} target="_blank" rel="noreferrer">
                <MessageCircle size={18} aria-hidden="true" />
                Ask on WhatsApp
              </a>
              <a className="button button-secondary" href={`tel:${business.callNumber}`}>
                <Phone size={18} aria-hidden="true" />
                Call store
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
            Confirm exact finish, size, and availability with the store before ordering. Product
            information can vary by stock and customization.
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
              <p>{product.material}</p>
            )}
          </article>
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
        <img src={primaryProductImage(product)} alt={product.name} />
        <div className="modal-content">
          <p className="eyebrow">{product.category}</p>
          <h2 id="product-modal-title">{product.name}</h2>
          <p>{product.description}</p>
          <dl className="detail-list">
            <div>
              <dt>Price</dt>
              <dd>{displayPrice(product)}</dd>
            </div>
            <div>
              <dt>Dimensions</dt>
              <dd>{product.dimensions}</dd>
            </div>
            <div>
              <dt>Material</dt>
              <dd>{product.material}</dd>
            </div>
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
            <a className="button" href={createWhatsappLink(product.name)} target="_blank" rel="noreferrer">
              <MessageCircle size={18} aria-hidden="true" />
              Ask on WhatsApp
            </a>
            <a className="button button-secondary" href={`tel:${business.callNumber}`}>
              <Phone size={18} aria-hidden="true" />
              Call store
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
      title: "Delivery support",
      text: "Ask about delivery and installation options for your area in Mumbai.",
    },
    {
      icon: ShieldCheck,
      title: "Practical selection",
      text: "Get guidance on size, fabric, storage, and finish before you visit.",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp ordering",
      text: "Every product enquiry opens with the product name already filled in.",
    },
  ];

  return (
    <section className="service-band" id="why-us">
      <div className="service-heading">
        <p className="eyebrow">Store experience</p>
        <h2>Designed for customers who want to browse first and confirm personally.</h2>
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
        <p className="eyebrow">Visit the store</p>
        <h2>See materials, sizes, and finishes in person.</h2>
        <p>
          Send a product enquiry first, or visit the shop to compare furniture options and discuss
          delivery details.
        </p>
      </div>

      <div className="contact-panel">
        <h3>{business.name}</h3>
        <p>
          <MapPin size={18} aria-hidden="true" />
          <span>{business.address}</span>
        </p>
        <p>
          <Phone size={18} aria-hidden="true" />
          <a href={`tel:${business.callNumber}`}>{business.phoneDisplay}</a>
        </p>
        <p>{business.hours}</p>
        <div className="contact-actions">
          <a className="button" href={createWhatsappLink()} target="_blank" rel="noreferrer">
            <MessageCircle size={18} aria-hidden="true" />
            WhatsApp now
          </a>
          <a className="button button-secondary" href={business.mapsUrl} target="_blank" rel="noreferrer">
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
              For product availability, custom sizes, sales quotes, delivery details, or store
              visits, reach us by email, WhatsApp, or phone. Share a product link or photo so we can
              respond with the most useful details.
            </p>
            <div className="contact-hero-actions">
              <a className="button" href={createWhatsappLink()} target="_blank" rel="noreferrer">
                <MessageCircle size={18} aria-hidden="true" />
                WhatsApp for quote
              </a>
              <a className="button button-secondary" href={`tel:${business.callNumber}`}>
                <Phone size={18} aria-hidden="true" />
                Call store
              </a>
            </div>
          </div>

          <aside className="contact-summary" aria-label="Contact summary">
            <h2>Store contact</h2>
            <div className="contact-summary-list">
              <a href={createEmailLink("Furniture enquiry")}>
                <Mail size={18} aria-hidden="true" />
                <span>
                  <strong>Email</strong>
                  {business.email}
                </span>
              </a>
              <a href={`tel:${business.callNumber}`}>
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
          <a href={createEmailLink("Furniture enquiry")}>{business.email}</a>
        </article>

        <article className="contact-method-card">
          <MessageCircle size={24} aria-hidden="true" />
          <h2>Sales and quotes</h2>
          <p>
            For faster pricing and availability, send the product name, photo, size requirement, and
            delivery location on WhatsApp.
          </p>
          <a href={createWhatsappLink()} target="_blank" rel="noreferrer">
            Message on WhatsApp
          </a>
        </article>

        <article className="contact-method-card">
          <Phone size={24} aria-hidden="true" />
          <h2>Call the store</h2>
          <p>
            Call during store hours for urgent questions, visit planning, order discussion, and
            delivery coordination.
          </p>
          <a href={`tel:${business.callNumber}`}>{business.phoneDisplay}</a>
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
          <h2>Visit the store</h2>
          <p>
            <MapPin size={18} aria-hidden="true" />
            <span>{business.address}</span>
          </p>
          <p>
            <Clock size={18} aria-hidden="true" />
            <span>{business.hours}</span>
          </p>
          <a className="button button-secondary" href={business.mapsUrl} target="_blank" rel="noreferrer">
            <MapPin size={18} aria-hidden="true" />
            Open map
          </a>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const [pathname, setPathname] = useState(currentPath);
  const [activeCategory, setActiveCategory] = useState(allCategory);
  const route = parseRoute(pathname);
  const collection = route.type === "collection" ? findCollection(route.slug) : null;
  const product = route.type === "product" ? findProduct(route.slug) : null;

  useEffect(() => {
    function handlePopState() {
      setPathname(currentPath());
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    applySeo(buildSeoData(route, collection, product));
  }, [collection, product, route.type, route.query, route.slug]);

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
  } else if (
    route.type === "not-found" ||
    (route.type === "collection" && !collection) ||
    (route.type === "product" && !product)
  ) {
    pageContent = <NotFoundPage onNavigate={handleNavigate} />;
  } else {
    pageContent = (
      <main>
        <PromoBanner />
        <CategoryShowcase onNavigate={handleNavigate} />
        <Catalog
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          onNavigate={handleNavigate}
        />
        <ServiceBand />
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
      >
        <WhatsAppIcon />
      </a>
      <footer className="site-footer">
        <p>
          &copy; {new Date().getFullYear()} {business.name}. All rights reserved.
        </p>
        <a href="#home">Back to top</a>
      </footer>
    </>
  );
}
