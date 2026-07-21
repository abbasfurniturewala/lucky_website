const state = {
  categories: [],
  products: [],
  selectedId: "",
  product: null,
  imageIndex: 0,
  filters: {
    search: "",
    status: "imported",
    category: "all",
    seoStatus: "review",
    priorityOnly: true,
    batchSize: "10",
  },
};

const elements = {
  approvedCount: document.querySelector("#approvedCount"),
  batchSizeFilter: document.querySelector("#batchSizeFilter"),
  categoryDialog: document.querySelector("#categoryDialog"),
  categoryFilter: document.querySelector("#categoryFilter"),
  categoryForm: document.querySelector("#categoryForm"),
  closeCategoryButton: document.querySelector("#closeCategoryButton"),
  cancelCategoryButton: document.querySelector("#cancelCategoryButton"),
  exportButton: document.querySelector("#exportButton"),
  importedCount: document.querySelector("#importedCount"),
  laterCount: document.querySelector("#laterCount"),
  newCategoryName: document.querySelector("#newCategoryName"),
  newCategorySlug: document.querySelector("#newCategorySlug"),
  productQueue: document.querySelector("#productQueue"),
  priorityFilter: document.querySelector("#priorityFilter"),
  queueCount: document.querySelector("#queueCount"),
  rejectedCount: document.querySelector("#rejectedCount"),
  reviewPanel: document.querySelector("#reviewPanel"),
  saveState: document.querySelector("#saveState"),
  searchInput: document.querySelector("#searchInput"),
  seoApprovedCount: document.querySelector("#seoApprovedCount"),
  seoNoindexCount: document.querySelector("#seoNoindexCount"),
  seoReviewCount: document.querySelector("#seoReviewCount"),
  seoStatusFilter: document.querySelector("#seoStatusFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  toast: document.querySelector("#toast"),
  totalCount: document.querySelector("#totalCount"),
  unreviewedCount: document.querySelector("#unreviewedCount"),
};

const statusLabels = {
  approved: "Approved",
  imported: "Already imported",
  later: "Review later",
  rejected: "Rejected",
  unreviewed: "Unreviewed",
};

const seoStatusLabels = {
  approved: "SEO approved",
  noindex: "SEO noindex",
  review: "SEO review",
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function currency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function categoryName(slug) {
  return state.categories.find((category) => category.slug === slug)?.name || slug || "Unassigned";
}

function matchingProducts() {
  const search = state.filters.search.toLowerCase().trim();
  return state.products
    .filter((product) => {
      const matchesStatus =
        state.filters.status === "all" || product.status === state.filters.status;
      const matchesCategory =
        state.filters.category === "all" || product.category === state.filters.category;
      const matchesSeoStatus =
        state.filters.seoStatus === "all" || product.seoStatus === state.filters.seoStatus;
      const matchesPriority = !state.filters.priorityOnly || product.prioritySeo;
      const matchesSearch =
        !search ||
        [product.name, product.sourceCategory, product.category]
          .join(" ")
          .toLowerCase()
          .includes(search);
      return matchesStatus && matchesCategory && matchesSeoStatus && matchesPriority && matchesSearch;
    })
    .sort(
      (first, second) =>
        Number(second.prioritySeo) - Number(first.prioritySeo) ||
        first.seoRequiredMissing.length - second.seoRequiredMissing.length ||
        first.seoRecommendedMissing.length - second.seoRecommendedMissing.length ||
        first.name.localeCompare(second.name),
    );
}

function filteredProducts() {
  const products = matchingProducts();
  return state.filters.batchSize === "all"
    ? products
    : products.slice(0, Number(state.filters.batchSize));
}

function renderCounts() {
  const counts = Object.fromEntries(
    ["unreviewed", "approved", "later", "rejected", "imported"].map((status) => [
      status,
      state.products.filter((product) => product.status === status).length,
    ]),
  );
  elements.totalCount.textContent = state.products.length;
  elements.unreviewedCount.textContent = counts.unreviewed;
  elements.approvedCount.textContent = counts.approved;
  elements.laterCount.textContent = counts.later;
  elements.rejectedCount.textContent = counts.rejected;
  elements.importedCount.textContent = counts.imported;
  const importedProducts = state.products.filter((product) => product.status === "imported");
  elements.seoReviewCount.textContent = importedProducts.filter(
    (product) => product.seoStatus === "review",
  ).length;
  elements.seoApprovedCount.textContent = importedProducts.filter(
    (product) => product.seoStatus === "approved",
  ).length;
  elements.seoNoindexCount.textContent = importedProducts.filter(
    (product) => product.seoStatus === "noindex",
  ).length;
}

function renderCategoryOptions() {
  const options = state.categories
    .map(
      (category) =>
        `<option value="${escapeHtml(category.slug)}">${escapeHtml(category.name)}</option>`,
    )
    .join("");
  elements.categoryFilter.innerHTML = `<option value="all">All categories</option>${options}`;
  elements.categoryFilter.value = state.filters.category;
}

function renderQueue() {
  const matchingCount = matchingProducts().length;
  const products = filteredProducts();
  elements.queueCount.textContent = `Showing ${products.length} of ${matchingCount} product${matchingCount === 1 ? "" : "s"}`;
  elements.productQueue.innerHTML = products.length
    ? products
        .map(
          (product) => `
            <button class="queue-item ${product.id === state.selectedId ? "selected" : ""}" data-id="${escapeHtml(product.id)}" type="button">
              <span class="queue-image">
                ${
                  product.thumbnail
                    ? `<img src="${escapeHtml(product.thumbnail)}" alt="" loading="lazy" />`
                    : `<span class="image-placeholder">No image</span>`
                }
              </span>
              <span class="queue-copy">
                <strong>${escapeHtml(product.name)}</strong>
                <small>${escapeHtml(categoryName(product.category))} &middot; ${escapeHtml(currency(product.price))}</small>
                <span class="queue-statuses">
                  <em class="status ${escapeHtml(product.status)}">${escapeHtml(statusLabels[product.status])}</em>
                  <em class="seo-status ${escapeHtml(product.seoStatus)}">${escapeHtml(seoStatusLabels[product.seoStatus])}</em>
                </span>
                <small class="seo-missing-count">${
                  product.seoRequiredMissing.length
                    ? `${product.seoRequiredMissing.length} approval blocker${product.seoRequiredMissing.length === 1 ? "" : "s"}`
                    : "SEO approval requirements complete"
                }</small>
                <small class="seo-recommended-count">${product.seoRecommendedMissing.length} recommended improvement${product.seoRecommendedMissing.length === 1 ? "" : "s"}</small>
              </span>
            </button>
          `,
        )
        .join("")
    : `<div class="queue-empty">No products match these filters.</div>`;

  elements.productQueue.querySelectorAll(".queue-item").forEach((button) => {
    button.addEventListener("click", () => selectProduct(button.dataset.id));
  });
}

function categoryOptions(selected) {
  return state.categories
    .map(
      (category) =>
        `<option value="${escapeHtml(category.slug)}" ${category.slug === selected ? "selected" : ""}>${escapeHtml(category.name)}</option>`,
    )
    .join("");
}

function renderReview() {
  const product = state.product;
  if (!product) return;

  const currentImage = product.images[state.imageIndex] || "";
  const detailItems = product.details
    .map((detail) => `<li>${escapeHtml(detail)}</li>`)
    .join("");

  elements.reviewPanel.innerHTML = `
    <div class="review-heading">
      <div>
        <p class="eyebrow">Source: ${escapeHtml(product.sourceCategory)}</p>
        <h2>${escapeHtml(product.name)}</h2>
        <div class="review-meta">
          <span class="status ${escapeHtml(product.status)}">${escapeHtml(statusLabels[product.status])}</span>
          <span class="seo-status ${escapeHtml(product.seoStatus)}">${escapeHtml(seoStatusLabels[product.seoStatus])}</span>
          <span class="product-policy ${product.isLegacyImageProduct ? "legacy" : "new"}">${product.isLegacyImageProduct ? "Legacy product" : "New product - image evidence required"}</span>
          <span>Suggested: ${escapeHtml(product.suggestedAction || "manual review")} &rarr; ${escapeHtml(categoryName(product.suggestedCategory))}</span>
        </div>
      </div>
      <a class="source-link" href="${escapeHtml(product.sourceUrl)}" target="_blank" rel="noreferrer">Open source page</a>
    </div>

    <div class="review-grid">
      <section class="gallery-panel">
        <div class="main-image">
          ${
            currentImage
              ? `<img src="${escapeHtml(currentImage)}" alt="${escapeHtml(product.name)}" />`
              : `<span class="image-placeholder">No local image found</span>`
          }
          ${
            product.images.length > 1
              ? `
                <button class="gallery-arrow previous" id="previousImage" aria-label="Previous image" type="button">&lsaquo;</button>
                <button class="gallery-arrow next" id="nextImage" aria-label="Next image" type="button">&rsaquo;</button>
              `
              : ""
          }
        </div>
        <div class="gallery-footer">
          <strong>Image ${Math.min(state.imageIndex + 1, product.images.length || 1)} of ${product.images.length || 0}</strong>
          <div class="thumbnail-row">
            ${product.images
              .map(
                (image, index) => `
                  <button class="thumbnail ${index === state.imageIndex ? "active" : ""}" data-image-index="${index}" type="button">
                    <img src="${escapeHtml(image)}" alt="Preview ${index + 1}" loading="lazy" />
                  </button>
                `,
              )
              .join("")}
          </div>
        </div>
      </section>

      <form class="editor-panel" id="productForm">
        <div class="field-grid">
          <label class="full-width">
            <span>Product name</span>
            <input name="name" value="${escapeHtml(product.name)}" required />
          </label>
          <label>
            <span>Website category</span>
            <select name="category">${categoryOptions(product.category)}</select>
          </label>
          <button class="inline-action" id="addCategoryButton" type="button">+ Add category</button>
          <label>
            <span>Price <small>Recommended</small></span>
            <input name="price" min="0" step="1" type="number" value="${escapeHtml(product.price)}" />
          </label>
          <label>
            <span>Availability <small>Recommended</small></span>
            <input name="availability" value="${escapeHtml(product.availability)}" />
          </label>
          <label>
            <span>Color <small>Recommended</small></span>
            <input name="color" value="${escapeHtml(product.color)}" />
          </label>
          <label>
            <span>Material <small>Recommended</small></span>
            <input name="material" value="${escapeHtml(product.material)}" />
          </label>
          <label class="full-width">
            <span>Dimensions <small>Recommended; use exact overall dimensions and units</small></span>
            <input name="dimensions" value="${escapeHtml(product.dimensions)}" />
          </label>
          <label class="full-width">
            <span>Search tags <small>Separate with commas</small></span>
            <input name="tags" value="${escapeHtml(product.tags)}" />
          </label>
          <label class="full-width">
            <span>Customer-facing description</span>
            <textarea name="description" rows="4">${escapeHtml(product.description)}</textarea>
          </label>
          <label class="full-width">
            <span>Primary image description <small>Describe what is visibly shown</small></span>
            <input name="imageAlt" value="${escapeHtml(product.imageAlt)}" placeholder="Example: Brown two-seater sofa photographed from the front" />
          </label>
          <label class="full-width">
            <span>Image rights source <small>${product.isLegacyImageProduct ? "Recommended for this legacy product" : "Required for this new product"}; internal only</small></span>
            <input name="imageRightsSource" value="${escapeHtml(product.imageRightsSource)}" placeholder="Example: Original showroom photo taken by owner" />
          </label>
          <label class="full-width">
            <span>Internal review notes</span>
            <textarea name="notes" rows="3">${escapeHtml(product.notes)}</textarea>
          </label>
          <fieldset class="seo-review full-width">
            <legend>SEO publishing review</legend>
            <p>Catalog import and Google indexing are separate decisions. Only the required checks block approval.</p>
            <div class="policy-note ${product.isLegacyImageProduct ? "legacy" : "new"}">
              <strong>${product.isLegacyImageProduct ? "Legacy image policy" : "New-product image policy"}</strong>
              <span>${
                product.isLegacyImageProduct
                  ? "Legacy product image - rights have not been reviewed. Replace or verify it when practical. This warning does not block SEO approval, and the status remains legacy-unverified until evidence is recorded."
                  : "Confirmed image rights and an internal source note are required before this product can be approved for SEO."
              }</span>
            </div>
            <label>
              <span>SEO status</span>
              <select name="seoStatus">
                <option value="review" ${product.seoStatus === "review" ? "selected" : ""}>Review - keep out of Google</option>
                <option value="approved" ${product.seoStatus === "approved" ? "selected" : ""}>Approved - allow indexing</option>
                <option value="noindex" ${product.seoStatus === "noindex" ? "selected" : ""}>Noindex - do not index</option>
              </select>
            </label>
            <div class="verification-checks required-checks">
              <label><input name="detailsVerified" type="checkbox" ${product.detailsVerified ? "checked" : ""} /> Product details checked</label>
              <label><input name="imageRightsConfirmed" type="checkbox" ${product.imageRightsConfirmed ? "checked" : ""} /> Image rights confirmed${product.isLegacyImageProduct ? " (recommended)" : " (required)"}</label>
            </div>
            <div class="seo-requirements ${product.seoRequiredMissing.length ? "incomplete" : "complete"}">
              <strong>Required for SEO approval</strong>
              ${
                product.seoRequiredMissing.length
                  ? `<ul>${product.seoRequiredMissing.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
                  : "<p>All required checks are complete. This product can be approved even when recommended fields below are unavailable.</p>"
              }
            </div>
            <div class="verification-checks recommended-checks">
              <label><input name="offerVerified" type="checkbox" ${product.offerVerified ? "checked" : ""} /> Current price verified</label>
              <label><input name="availabilityVerified" type="checkbox" ${product.availabilityVerified ? "checked" : ""} /> Current availability verified</label>
            </div>
            <div class="seo-recommendations ${product.seoRecommendedMissing.length ? "open" : "complete"}">
              <strong>${product.seoRecommendedMissing.length ? "Recommended product information" : "Recommended information complete"}</strong>
              ${
                product.seoRecommendedMissing.length
                  ? `<ul>${product.seoRecommendedMissing.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
                  : ""
              }
            </div>
          </fieldset>
        </div>
        <div class="save-row">
          <button class="button secondary" id="saveButton" type="submit">Save edits</button>
          <span id="productSaveStatus">${product.updatedAt ? "Saved locally" : "No local edits yet"}</span>
        </div>
      </form>
    </div>

    <section class="source-details">
      <div>
        <p class="eyebrow">Scraped source details</p>
        <h3>Reference information</h3>
      </div>
      <dl>
        <div><dt>Source category</dt><dd>${escapeHtml(product.sourceCategory)}</dd></div>
        <div><dt>Dimensions</dt><dd>${escapeHtml(product.dimensions || "Not provided")}</dd></div>
        <div><dt>Website path</dt><dd>${escapeHtml(product.websitePath || "Not imported yet")}</dd></div>
      </dl>
      <details>
        <summary>Show all scraped details (${product.details.length})</summary>
        <ul>${detailItems || "<li>No additional details supplied.</li>"}</ul>
      </details>
    </section>

    <div class="decision-bar">
      <button class="button reject" data-decision="rejected" type="button">Reject</button>
      <button class="button tertiary" data-decision="later" type="button">Review later</button>
      <button class="button tertiary" data-decision="unreviewed" type="button">Reset decision</button>
      <button class="button approve" data-decision="approved" type="button">Approve for import</button>
    </div>
  `;

  document.querySelector("#productForm").addEventListener("submit", (event) => {
    event.preventDefault();
    saveProduct(product.status, false).catch((error) => showToast(error.message));
  });
  document.querySelector("#addCategoryButton").addEventListener("click", openCategoryDialog);
  document.querySelectorAll("[data-decision]").forEach((button) => {
    button.addEventListener("click", () => {
      saveProduct(button.dataset.decision, true).catch((error) => showToast(error.message));
    });
  });
  document.querySelectorAll("[data-image-index]").forEach((button) => {
    button.addEventListener("click", () => {
      state.imageIndex = Number(button.dataset.imageIndex);
      renderReview();
    });
  });
  document.querySelector("#previousImage")?.addEventListener("click", () => moveImage(-1));
  document.querySelector("#nextImage")?.addEventListener("click", () => moveImage(1));
}

function moveImage(offset) {
  if (!state.product?.images.length) return;
  state.imageIndex =
    (state.imageIndex + offset + state.product.images.length) % state.product.images.length;
  renderReview();
}

async function selectProduct(id) {
  state.selectedId = id;
  state.imageIndex = 0;
  renderQueue();
  elements.reviewPanel.innerHTML = `<div class="empty-review"><h2>Loading product...</h2></div>`;
  const response = await fetch(`/api/products/${encodeURIComponent(id)}`);
  state.product = await response.json();
  renderReview();
}

function editorPayload(status) {
  const form = new FormData(document.querySelector("#productForm"));
  return {
    name: form.get("name"),
    category: form.get("category"),
    price: Number(form.get("price") || 0),
    availability: form.get("availability"),
    color: form.get("color"),
    material: form.get("material"),
    dimensions: form.get("dimensions"),
    tags: form.get("tags"),
    description: form.get("description"),
    imageAlt: form.get("imageAlt"),
    imageRightsSource: form.get("imageRightsSource"),
    imageRightsStatus:
      form.get("imageRightsConfirmed") === "on"
        ? "confirmed"
        : state.product.isLegacyImageProduct
          ? "legacy-unverified"
          : "pending",
    notes: form.get("notes"),
    seoStatus: form.get("seoStatus"),
    detailsVerified: form.get("detailsVerified") === "on",
    imageRightsConfirmed: form.get("imageRightsConfirmed") === "on",
    offerVerified: form.get("offerVerified") === "on",
    availabilityVerified: form.get("availabilityVerified") === "on",
    status,
  };
}

async function saveProduct(status, moveToNext) {
  const response = await fetch(`/api/reviews/${encodeURIComponent(state.product.id)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(editorPayload(status)),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Unable to save this product");

  state.product = result.product;
  state.products = state.products.map((product) =>
    product.id === result.summary.id ? result.summary : product,
  );
  renderCounts();
  renderQueue();
  showToast(status === "approved" ? "Approved for import" : "Review saved locally");

  if (moveToNext) {
    const next = filteredProducts().find((product) => product.id !== state.selectedId);
    if (next) {
      await selectProduct(next.id);
      return;
    }
  }
  renderReview();
}

function openCategoryDialog() {
  elements.newCategoryName.value = "";
  elements.newCategorySlug.value = "";
  elements.categoryDialog.showModal();
  elements.newCategoryName.focus();
}

async function createCategory() {
  const name = elements.newCategoryName.value.trim();
  if (!name) return;
  const response = await fetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, slug: elements.newCategorySlug.value.trim() }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Unable to create category");
  state.categories = result.categories;
  renderCategoryOptions();
  renderReview();
  document.querySelector('[name="category"]').value = result.selected;
  showToast(`${name} added`);
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => elements.toast.classList.remove("visible"), 2600);
}

async function exportApproved() {
  const response = await fetch("/api/export-approved", { method: "POST" });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Export failed");
  showToast(`${result.count} approved products exported`);
}

function bindEvents() {
  elements.searchInput.addEventListener("input", () => {
    state.filters.search = elements.searchInput.value;
    renderQueue();
  });
  elements.statusFilter.addEventListener("change", () => {
    state.filters.status = elements.statusFilter.value;
    renderQueue();
  });
  elements.categoryFilter.addEventListener("change", () => {
    state.filters.category = elements.categoryFilter.value;
    renderQueue();
  });
  elements.seoStatusFilter.addEventListener("change", () => {
    state.filters.seoStatus = elements.seoStatusFilter.value;
    renderQueue();
  });
  elements.priorityFilter.addEventListener("change", () => {
    state.filters.priorityOnly = elements.priorityFilter.checked;
    renderQueue();
  });
  elements.batchSizeFilter.addEventListener("change", () => {
    state.filters.batchSize = elements.batchSizeFilter.value;
    renderQueue();
  });
  elements.categoryForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await createCategory();
      elements.categoryDialog.close();
    } catch (error) {
      showToast(error.message);
    }
  });
  elements.cancelCategoryButton.addEventListener("click", () => elements.categoryDialog.close());
  elements.closeCategoryButton.addEventListener("click", () => elements.categoryDialog.close());
  elements.exportButton.addEventListener("click", () => {
    exportApproved().catch((error) => showToast(error.message));
  });
}

async function bootstrap() {
  const response = await fetch("/api/bootstrap");
  const data = await response.json();
  state.categories = data.categories;
  state.products = data.products;
  elements.saveState.textContent = data.stateUpdatedAt
    ? "Local edits saved"
    : "Ready for first review";
  bindEvents();
  elements.statusFilter.value = state.filters.status;
  elements.seoStatusFilter.value = state.filters.seoStatus;
  elements.priorityFilter.checked = state.filters.priorityOnly;
  elements.batchSizeFilter.value = state.filters.batchSize;
  renderCategoryOptions();
  renderCounts();
  renderQueue();

  const firstProduct = filteredProducts()[0];
  if (firstProduct) await selectProduct(firstProduct.id);
}

bootstrap().catch((error) => {
  elements.reviewPanel.innerHTML = `<div class="empty-review"><h2>Unable to load the review dashboard</h2><p>${escapeHtml(error.message)}</p></div>`;
});
