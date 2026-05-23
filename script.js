const business = {
  name: "Lucky Interiors Furniture",
  phoneDisplay: "+91 96195 78893",
  whatsappNumber: "919619578893",
  callNumber: "+919619578893",
  address: "Shop No.4/5, Nilgiri Apartments, Swami Vivekanand Rd, Malad West, Mumbai, Maharashtra, India",
  hours: "Open daily: 10:00 AM - 9:00 PM",
};

const products = [
  {
    name: "Comfort 3-Seater Sofa",
    category: "Living Room",
    price: "Ask for price",
    description: "Fabric sofa for family living rooms, available in multiple colors.",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Wooden Queen Bed",
    category: "Bedroom",
    price: "Ask for price",
    description: "Sturdy queen bed design with optional side tables and storage.",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Six-Seater Dining Set",
    category: "Dining",
    price: "Ask for price",
    description: "Dining table set for daily family meals and festive gatherings.",
    image:
      "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Ergonomic Office Chair",
    category: "Office",
    price: "Ask for price",
    description: "Comfortable office chair for study rooms, shops, and work desks.",
    image:
      "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "TV Unit With Storage",
    category: "Living Room",
    price: "Ask for price",
    description: "Modern TV unit with shelves and cabinets for clean storage.",
    image:
      "https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Sliding Wardrobe",
    category: "Bedroom",
    price: "Ask for price",
    description: "Wardrobe options for bedrooms with mirror and storage choices.",
    image:
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=900&q=80",
  },
];

const grid = document.querySelector("#productGrid");
const emptyState = document.querySelector("#emptyState");
const searchInput = document.querySelector("#searchInput");
const tabs = document.querySelectorAll(".tab");
const year = document.querySelector("#year");

let activeCategory = "All";

function applyBusinessDetails() {
  document.title = `${business.name} | Home Goods & Furniture Store`;

  document.querySelectorAll("[data-business-name]").forEach((element) => {
    element.textContent = business.name;
  });

  document.querySelectorAll("[data-phone-display]").forEach((element) => {
    element.textContent = business.phoneDisplay;
  });

  document.querySelectorAll("[data-call-link]").forEach((element) => {
    element.href = `tel:${business.callNumber}`;
  });

  document.querySelectorAll("[data-whatsapp-link]").forEach((element) => {
    element.href = `https://wa.me/${business.whatsappNumber}`;
  });

  const address = document.querySelector("[data-business-address]");
  const hours = document.querySelector("[data-business-hours]");

  if (address) {
    address.textContent = business.address;
  }

  if (hours) {
    hours.textContent = business.hours;
  }
}

function whatsappLink(productName) {
  const message = `Hi ${business.name}, I am interested in ${productName}. Please share price, availability, and delivery details.`;
  return `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function productCard(product) {
  return `
    <article class="product-card">
      <img src="${product.image}" alt="${product.name}" loading="lazy">
      <div class="product-body">
        <div class="product-meta">
          <span>${product.category}</span>
          <span class="price">${product.price}</span>
        </div>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-actions">
          <a class="button" href="${whatsappLink(product.name)}" target="_blank" rel="noreferrer">
            Enquire
          </a>
          <a class="button button-ghost" href="tel:${business.callNumber}">
            Call
          </a>
        </div>
      </div>
    </article>
  `;
}

function renderProducts() {
  const query = searchInput.value.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    const searchableText = `${product.name} ${product.category} ${product.description}`.toLowerCase();
    return matchesCategory && searchableText.includes(query);
  });

  grid.innerHTML = filteredProducts.map(productCard).join("");
  emptyState.hidden = filteredProducts.length > 0;
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activeCategory = tab.dataset.category;
    tabs.forEach((item) => item.classList.toggle("active", item === tab));
    renderProducts();
  });
});

searchInput.addEventListener("input", renderProducts);
year.textContent = new Date().getFullYear();
applyBusinessDetails();
renderProducts();
