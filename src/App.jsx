import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Eye,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  Truck,
  X,
} from "lucide-react";
import { business, categories, products, promoBanner, shopCategories } from "./data/catalog.js";

const allCategory = "All";
const menuItems = [
  { label: "Home", href: "#home" },
  { label: "Sofas & Seating", category: "Living Room" },
  { label: "Bedroom", category: "Bedroom" },
  { label: "Dining & Kitchen", category: "Dining" },
  { label: "Office", category: "Office" },
  { label: "Storage Furniture", category: "Bedroom" },
  { label: "Lighting & Decor", href: "#why-us" },
  { label: "Furnishing", href: "#catalog" },
];

function createWhatsappLink(productName) {
  const text = productName
    ? `Hi ${business.name}, I am interested in ${productName}. Please share price, availability, and delivery details.`
    : `Hi ${business.name}, I would like to know more about your furniture catalog.`;

  return `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" className="whatsapp-mark" viewBox="0 0 32 32" focusable="false">
      <path d="M16.04 4.5c-6.28 0-11.38 5.1-11.38 11.38 0 2.01.53 3.97 1.54 5.7L4.56 27.5l6.07-1.6a11.34 11.34 0 0 0 5.41 1.38h.01c6.27 0 11.37-5.1 11.37-11.38S22.32 4.5 16.04 4.5Zm0 20.86h-.01c-1.71 0-3.39-.46-4.85-1.33l-.35-.21-3.6.95.96-3.51-.23-.36a9.46 9.46 0 0 1-1.45-5.02c0-5.25 4.27-9.51 9.53-9.51 2.54 0 4.93.99 6.73 2.79a9.44 9.44 0 0 1 2.8 6.74c0 5.24-4.28 9.46-9.53 9.46Zm5.23-7.1c-.29-.14-1.69-.83-1.95-.93-.26-.1-.45-.14-.64.14-.19.29-.74.93-.91 1.12-.17.19-.33.21-.62.07-.29-.14-1.2-.44-2.29-1.41-.85-.76-1.42-1.69-1.59-1.98-.17-.29-.02-.44.13-.59.13-.13.29-.33.43-.5.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.64-1.55-.88-2.12-.23-.56-.47-.48-.64-.49h-.55c-.19 0-.5.07-.76.36-.26.29-1 1-1 2.38s1.02 2.73 1.16 2.92c.14.19 2 3.05 4.84 4.28.68.29 1.21.47 1.62.6.68.22 1.3.19 1.79.12.55-.08 1.69-.69 1.93-1.36.24-.67.24-1.24.17-1.36-.07-.12-.26-.19-.55-.33Z" />
    </svg>
  );
}

function Header({ onCategorySelect }) {
  function handleMenuClick(category) {
    onCategorySelect(category);
  }

  return (
    <>
      <header className="site-header">
        <div className="utility-bar">
          <a className="contact-link" href="#visit">
            Contact us
          </a>
        </div>

        <div className="logo-row">
          <a className="logo-link" href="#home" aria-label={`${business.name} home`}>
            <img className="logo-image" src={business.logo} alt={business.name} />
          </a>
        </div>
      </header>

      <nav className="menu-row" aria-label="Product navigation">
        <div className="menu-nav">
          {menuItems.map((item) =>
            item.category ? (
              <button
                className="menu-link"
                key={item.label}
                type="button"
                onClick={() => handleMenuClick(item.category)}
              >
                {item.label}
              </button>
            ) : (
              <a className="menu-link" href={item.href} key={item.label}>
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

function CategoryShowcase({ onCategorySelect }) {
  return (
    <section className="section category-section" id="categories">
      <div className="compact-heading">
        <h2>Shop By Categories</h2>
      </div>

      <div className="category-grid">
        {shopCategories.map((category) => (
          <button
            className="category-card"
            key={category.name}
            type="button"
            onClick={() => onCategorySelect(category.filterCategory)}
          >
            <span className="category-image-frame">
              <img src={category.image} alt="" loading="lazy" />
            </span>
            <strong>{category.name}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}

function ProductCard({ product, onDetails }) {
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img src={product.image} alt={product.name} loading="lazy" />
        <span className="product-badge">{product.badge}</span>
      </div>
      <div className="product-body">
        <div className="product-meta">
          <span>{product.category}</span>
          <strong>{product.price}</strong>
        </div>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="product-actions">
          <a className="button" href={createWhatsappLink(product.name)} target="_blank" rel="noreferrer">
            <MessageCircle size={17} aria-hidden="true" />
            Enquire
          </a>
          <button className="button button-secondary" type="button" onClick={() => onDetails(product)}>
            <Eye size={17} aria-hidden="true" />
            Details
          </button>
        </div>
      </div>
    </article>
  );
}

function Catalog({ activeCategory, setActiveCategory }) {
  const [query, setQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = activeCategory === allCategory || product.category === activeCategory;
      const searchable = [
        product.name,
        product.category,
        product.description,
        product.badge,
        product.material,
        product.dimensions,
      ]
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
            <ProductCard key={product.id} product={product} onDetails={setSelectedProduct} />
          ))}
        </div>
      ) : (
        <p className="empty-state">No products found. Try another search or category.</p>
      )}

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </section>
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
        <img src={product.image} alt={product.name} />
        <div className="modal-content">
          <p className="eyebrow">{product.category}</p>
          <h2 id="product-modal-title">{product.name}</h2>
          <p>{product.description}</p>
          <dl className="detail-list">
            <div>
              <dt>Price</dt>
              <dd>{product.price}</dd>
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

export default function App() {
  const [activeCategory, setActiveCategory] = useState(allCategory);

  function handleCategorySelect(category) {
    setActiveCategory(category);
    document.querySelector("#catalog")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <Header onCategorySelect={handleCategorySelect} />
      <main>
        <PromoBanner />
        <CategoryShowcase onCategorySelect={handleCategorySelect} />
        <Catalog activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
        <ServiceBand />
        <VisitSection />
      </main>
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
