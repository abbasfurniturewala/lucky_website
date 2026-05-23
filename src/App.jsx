import { useMemo, useState } from "react";
import {
  ArrowRight,
  BedDouble,
  CheckCircle2,
  Eye,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  Sofa,
  Truck,
  X,
} from "lucide-react";
import { business, categories, products } from "./data/catalog.js";

const allCategory = "All";

function createWhatsappLink(productName) {
  const text = productName
    ? `Hi ${business.name}, I am interested in ${productName}. Please share price, availability, and delivery details.`
    : `Hi ${business.name}, I would like to know more about your furniture catalog.`;

  return `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#home" aria-label={`${business.name} home`}>
        <span className="brand-mark">L</span>
        <span>
          <strong>{business.name}</strong>
          <small>{business.tagline}</small>
        </span>
      </a>

      <nav className="main-nav" aria-label="Primary navigation">
        <a href="#categories">Categories</a>
        <a href="#catalog">Catalog</a>
        <a href="#visit">Visit</a>
      </nav>

      <div className="header-actions">
        <a className="text-action" href={`tel:${business.callNumber}`}>
          <Phone size={18} aria-hidden="true" />
          <span>{business.phoneDisplay}</span>
        </a>
        <a className="button button-small" href={createWhatsappLink()} target="_blank" rel="noreferrer">
          <MessageCircle size={18} aria-hidden="true" />
          WhatsApp
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <p className="eyebrow">Furniture store in Malad West, Mumbai</p>
        <h1>Furniture for real Indian homes, selected with practical buying help.</h1>
        <p>
          Explore sofas, beds, wardrobes, dining sets, office chairs, and home essentials. Ask for
          price, availability, size, fabric, and delivery details directly on WhatsApp.
        </p>
        <div className="hero-actions">
          <a className="button" href="#catalog">
            View catalog
            <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a className="button button-light" href={createWhatsappLink()} target="_blank" rel="noreferrer">
            <MessageCircle size={18} aria-hidden="true" />
            Enquire now
          </a>
        </div>
      </div>
      <div className="hero-strip" aria-label="Store highlights">
        <span>Local delivery support</span>
        <span>Custom sizing guidance</span>
        <span>WhatsApp assisted ordering</span>
      </div>
    </section>
  );
}

function CategoryShowcase({ onCategorySelect }) {
  const iconMap = {
    "Living Room": Sofa,
    Bedroom: BedDouble,
    Dining: CheckCircle2,
    Office: ShieldCheck,
  };

  return (
    <section className="section category-section" id="categories">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Shop by room</p>
          <h2>Start with the space you are furnishing.</h2>
        </div>
        <p>
          A store-style catalog helps customers browse quickly, then message you for final price,
          size, material, and delivery details.
        </p>
      </div>

      <div className="category-grid">
        {categories.map((category) => {
          const Icon = iconMap[category.name] || CheckCircle2;

          return (
            <button
              className="category-card"
              key={category.name}
              type="button"
              onClick={() => onCategorySelect(category.name)}
            >
              <img src={category.image} alt="" loading="lazy" />
              <span className="category-overlay">
                <span className="category-icon">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <strong>{category.name}</strong>
                <small>{category.description}</small>
              </span>
            </button>
          );
        })}
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
      <Header />
      <main>
        <Hero />
        <CategoryShowcase onCategorySelect={handleCategorySelect} />
        <Catalog activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
        <ServiceBand />
        <VisitSection />
      </main>
      <a className="floating-whatsapp" href={createWhatsappLink()} target="_blank" rel="noreferrer">
        <MessageCircle size={20} aria-hidden="true" />
        Chat
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
