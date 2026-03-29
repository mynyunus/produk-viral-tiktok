const NICHE_SHEETS = {
  skincare_beauty: {
    // Sheet ini untuk niche skincare & beauty.
    spreadsheetId: "1vTDmOFMrasqpd8H8uuiNfUNAqHyiOZ3kMadu3Fdg9tU",
    // Satu tab = satu niche. Untuk skincare & beauty guna tab gid di bawah.
    productSheetGid: "470679329"
  }
};

// Tukar value ini bila nak guna niche lain.
const ACTIVE_NICHE = "skincare_beauty";
const SHEET_DB_CONFIG = NICHE_SHEETS[ACTIVE_NICHE];

// Kategori dikunci (hardcode) untuk kekalkan struktur landing page.
const HARD_CODED_CATEGORIES = [
  { title: "Jerawat & Kulit Berminyak", slug: "jerawat-kulit-berminyak" },
  { title: "Brightening & Glow", slug: "brightening-glow" },
  { title: "Jeragat & Dark Spot", slug: "jeragat-dark-spot" },
  { title: "Anti-Aging & Kedutan", slug: "anti-aging-kedutan" },
  { title: "Skin Barrier & Sensitive", slug: "skin-barrier-sensitive" },
  { title: "Hydration & Moisturizer", slug: "hydration-moisturizer" },
  { title: "Sunscreen & UV Protection", slug: "sunscreen-uv-protection" },
  { title: "Pori, Blackhead & Sebum", slug: "pori-blackhead-sebum" },
  { title: "Eye Care & Dark Circle", slug: "eye-care-dark-circle" },
  { title: "Body Care", slug: "body-care" },
  { title: "Hair Care", slug: "hair-care" },
  { title: "Cleanser & Makeup Remover", slug: "cleanser-makeup-remover" }
];

const categoryNavList = document.getElementById("categoryNavList");
const catalogContainer = document.getElementById("catalogContainer");
const catalogStatus = document.getElementById("catalogStatus");

function initDynamicYear() {
  const currentYear = String(new Date().getFullYear());
  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = currentYear;
  });
}

function setStatus(message, isError = false) {
  if (!catalogStatus) {
    return;
  }

  catalogStatus.textContent = message;
  catalogStatus.classList.toggle("is-error", isError);
}

function normalizeHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parseGvizJson(text) {
  const match = text.match(/google\.visualization\.Query\.setResponse\((.*)\);?\s*$/s);
  if (!match) {
    throw new Error("Format response Google Sheets tidak sah.");
  }

  return JSON.parse(match[1]);
}

function tableToRows(table) {
  const headers = (table.cols || []).map((col, index) => {
    return normalizeHeader(col.label || col.id || `col_${index + 1}`);
  });

  return (table.rows || []).map((row) => {
    const out = {};

    headers.forEach((header, index) => {
      const cell = row.c?.[index];
      out[header] = cell?.f ?? cell?.v ?? "";
    });

    return out;
  });
}

async function fetchSheetRows({ spreadsheetId, sheetName, gid }) {
  const params = new URLSearchParams({ tqx: "out:json" });

  if (sheetName) {
    params.set("sheet", sheetName);
  }

  if (gid !== undefined && gid !== null && gid !== "") {
    params.set("gid", String(gid));
  }

  const url = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/gviz/tq?${params.toString()}`;
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Gagal fetch sheet (${response.status})`);
  }

  const rawText = await response.text();
  const parsed = parseGvizJson(rawText);

  if (!parsed.table) {
    throw new Error("Data sheet kosong atau tidak dapat dibaca.");
  }

  return tableToRows(parsed.table);
}

function getFirstValue(row, keys, fallback = "") {
  for (const key of keys) {
    const normalized = normalizeHeader(key);
    if (row[normalized] !== undefined && String(row[normalized]).trim() !== "") {
      return String(row[normalized]).trim();
    }
  }

  return fallback;
}

function isEnabledFlag(rawValue) {
  const value = String(rawValue || "").trim().toLowerCase();

  if (!value) {
    return true;
  }

  return !["0", "false", "off", "no", "x", "disable", "disabled"].includes(value);
}

function parseNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function extractGoogleDriveFileId(url) {
  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.toLowerCase();

    if (!host.includes("drive.google.com") && !host.includes("docs.google.com")) {
      return "";
    }

    const pathMatch = parsedUrl.pathname.match(/\/file\/d\/([^/]+)/);
    if (pathMatch?.[1]) {
      return pathMatch[1];
    }

    const queryId = parsedUrl.searchParams.get("id");
    if (queryId) {
      return queryId;
    }
  } catch {
    return "";
  }

  return "";
}

function normalizeImageUrl(rawUrl) {
  const url = String(rawUrl || "").trim();
  if (!url) {
    return "";
  }

  const driveFileId = extractGoogleDriveFileId(url);
  if (driveFileId) {
    return `https://drive.google.com/thumbnail?id=${encodeURIComponent(driveFileId)}&sz=w1600`;
  }

  return url;
}

function parseImages(row) {
  const imageKeys = Object.keys(row).filter((key) => {
    return key === "images" || key === "image" || key === "gambar" || /^image_\d+$/i.test(key) || /^gambar_\d+$/i.test(key);
  });

  const bucket = [];

  imageKeys.forEach((key) => {
    const raw = String(row[key] || "").trim();
    if (!raw) {
      return;
    }

    raw
      .split(/[|,\n]/)
      .map((part) => part.trim())
      .filter(Boolean)
      .map((url) => normalizeImageUrl(url))
      .filter(Boolean)
      .forEach((url) => bucket.push(url));
  });

  return Array.from(new Set(bucket));
}

function resolveCategorySlug(rawCategory) {
  const normalized = slugify(rawCategory);
  if (!normalized) {
    return "";
  }

  const matched = HARD_CODED_CATEGORIES.find((category) => {
    return category.slug === normalized || slugify(category.title) === normalized;
  });

  return matched ? matched.slug : "";
}

function mapProducts(rows) {
  const products = rows
    .map((row, index) => {
      const name = getFirstValue(row, ["name", "nama_produk", "produk", "title"]);
      if (!name) {
        return null;
      }

      const enabled = isEnabledFlag(getFirstValue(row, ["enabled", "aktif", "status"], "1"));
      if (!enabled) {
        return null;
      }

      const rawCategory = getFirstValue(row, ["category", "kategori", "category_slug", "slug"], "");
      const categorySlug = resolveCategorySlug(rawCategory);
      if (!categorySlug) {
        return null;
      }

      const sortOrder = parseNumber(getFirstValue(row, ["sort", "order", "susunan"], index + 1), index + 1);
      const images = parseImages(row);

      return {
        id: getFirstValue(row, ["id", "product_id"], `${categorySlug}-${index + 1}`),
        categorySlug,
        name,
        benefit: getFirstValue(row, ["benefit", "desc", "description", "keterangan"], "Sokongan harian untuk rutin kesihatan yang lebih konsisten."),
        rating: getFirstValue(row, ["rating"], "4.7"),
        sold: getFirstValue(row, ["sold", "jumlah_sold", "jual"], "1k+"),
        price: getFirstValue(row, ["est_price", "price", "harga", "anggaran_harga"], "RM 59"),
        link: getFirstValue(row, ["link", "url", "affiliate_link"], "#"),
        images,
        sortOrder
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return products;
}

function buildCategoriesWithProducts(allProducts) {
  return HARD_CODED_CATEGORIES.map((category) => {
    const products = allProducts.filter((product) => product.categorySlug === category.slug);
    return { ...category, products };
  });
}

function renderImageMedia(product, sliderId, productLink) {
  const safeImageLink = productLink && productLink !== "#" ? productLink : null;
  const imageOpenTag = safeImageLink
    ? `<a class="product-image-slide" href="${escapeHtml(safeImageLink)}" target="_blank" rel="nofollow sponsored noopener noreferrer"`
    : `<button class="product-image-slide" type="button"`;
  const imageCloseTag = safeImageLink ? "</a>" : "</button>";

  if (!product.images.length) {
    return `
      <div class="product-media">
        <div class="product-image-track" id="${sliderId}">
          ${imageOpenTag} aria-label="Lihat produk ${escapeHtml(product.name)}">
            <div class="product-image-placeholder">Product Image</div>
          ${imageCloseTag}
        </div>
      </div>
    `;
  }

  const imageSlides = product.images
    .map((imageUrl, imageIndex) => {
      return `
        ${imageOpenTag} aria-label="Lihat imej ${imageIndex + 1} untuk ${escapeHtml(product.name)}">
          <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(product.name)} imej ${imageIndex + 1}" loading="lazy" />
        ${imageCloseTag}
      `;
    })
    .join("");

  const imageDots = product.images.length > 1
    ? `
      <div class="product-image-dots" role="tablist" aria-label="Pilihan imej ${escapeHtml(product.name)}">
        ${product.images
          .map((_, dotIndex) => {
            return `
              <button
                class="image-dot${dotIndex === 0 ? " is-active" : ""}"
                type="button"
                role="tab"
                aria-label="Imej ${dotIndex + 1}"
                data-slider-id="${sliderId}"
                data-image-index="${dotIndex}"
              ></button>
            `;
          })
          .join("")}
      </div>
    `
    : "";

  return `
    <div class="product-media">
      <div class="product-image-track" id="${sliderId}" data-image-track>
        ${imageSlides}
      </div>
      ${imageDots}
    </div>
  `;
}

function renderProductCard(product, categorySlug, productIndex) {
  const descId = `desc-${categorySlug}-${productIndex + 1}`;
  const sliderId = `slider-${categorySlug}-${productIndex + 1}`;
  const safeLink = product.link || "#";

  return `
    <article class="product-card">
      ${renderImageMedia(product, sliderId, safeLink)}
      <h4>${escapeHtml(product.name)}</h4>
      <div class="product-meta" aria-label="Maklumat ringkas produk">
        <span class="meta-pill">Rating: <strong>${escapeHtml(product.rating)}</strong></span>
        <span class="meta-pill">Sold: <strong>${escapeHtml(product.sold)}</strong></span>
        <span class="meta-pill meta-pill-price">Est. Price: <strong>${escapeHtml(product.price)}</strong></span>
      </div>
      <p class="product-desc" id="${descId}">${escapeHtml(product.benefit)}</p>
      <button class="desc-toggle" type="button" aria-expanded="false" aria-controls="${descId}">
        See more
      </button>
      <a class="btn-product" href="${escapeHtml(safeLink)}" rel="nofollow sponsored" target="_blank">View Product</a>
    </article>
  `;
}

function renderCategoryBlock(category, index) {
  const productCards = category.products.length
    ? category.products.map((product, productIndex) => renderProductCard(product, category.slug, productIndex)).join("")
    : `<div class="empty-card">Belum ada produk dalam kategori ini.</div>`;

  return `
    <section class="category-block" id="category-${index + 1}">
      <h3 class="category-head">${escapeHtml(category.title)}</h3>
      <div class="category-grid" aria-label="Senarai produk kategori ${escapeHtml(category.title)}">
        ${productCards}
      </div>
    </section>
  `;
}

function renderCategoryNav(categories) {
  if (!categoryNavList) {
    return;
  }

  categoryNavList.innerHTML = categories
    .map((category, index) => `<a class="category-link" href="#category-${index + 1}">${escapeHtml(category.title)}</a>`)
    .join("");
}

function renderCatalog(categories) {
  if (!catalogContainer) {
    return;
  }

  catalogContainer.innerHTML = categories
    .map((category, index) => renderCategoryBlock(category, index))
    .join("");
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const targetId = anchor.getAttribute("href");

      if (!targetId || targetId === "#") {
        return;
      }

      const targetElement = document.querySelector(targetId);
      if (!targetElement) {
        return;
      }

      event.preventDefault();
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function initDescriptionToggle() {
  if (!catalogContainer) {
    return;
  }

  catalogContainer.addEventListener("click", (event) => {
    const toggle = event.target.closest(".desc-toggle");
    if (!toggle) {
      return;
    }

    const targetId = toggle.getAttribute("aria-controls");
    if (!targetId) {
      return;
    }

    const description = document.getElementById(targetId);
    if (!description) {
      return;
    }

    const isExpanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", isExpanded ? "false" : "true");
    toggle.textContent = isExpanded ? "See more" : "See less";
    description.classList.toggle("is-expanded", !isExpanded);
  });
}

function updateDotsForTrack(track) {
  const sliderId = track.id;
  if (!sliderId) {
    return;
  }

  const dots = catalogContainer.querySelectorAll(`.image-dot[data-slider-id="${CSS.escape(sliderId)}"]`);
  if (!dots.length) {
    return;
  }

  const activeIndex = Math.round(track.scrollLeft / Math.max(track.clientWidth, 1));

  dots.forEach((dot, index) => {
    dot.classList.toggle("is-active", index === activeIndex);
  });
}

function initImageSlider() {
  if (!catalogContainer) {
    return;
  }

  catalogContainer.querySelectorAll("[data-image-track]").forEach((track) => {
    track.addEventListener(
      "scroll",
      () => {
        updateDotsForTrack(track);
      },
      { passive: true }
    );
  });

  catalogContainer.addEventListener("click", (event) => {
    const dot = event.target.closest(".image-dot");
    if (!dot) {
      return;
    }

    const sliderId = dot.getAttribute("data-slider-id");
    const imageIndex = Number(dot.getAttribute("data-image-index"));

    if (!sliderId || Number.isNaN(imageIndex)) {
      return;
    }

    const track = document.getElementById(sliderId);
    if (!track) {
      return;
    }

    track.scrollTo({
      left: track.clientWidth * imageIndex,
      behavior: "smooth"
    });
  });
}

function initCategoryNavTracking() {
  if (!categoryNavList) {
    return;
  }

  const navLinks = Array.from(document.querySelectorAll(".category-link"));
  const sections = Array.from(document.querySelectorAll(".category-block"));

  if (!navLinks.length || !sections.length) {
    return;
  }

  let activeIndex = -1;

  function centerActiveLink(index) {
    const link = navLinks[index];
    if (!link) {
      return;
    }

    const targetLeft = link.offsetLeft - (categoryNavList.clientWidth - link.offsetWidth) / 2;
    categoryNavList.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: "smooth"
    });
  }

  function setActive(index) {
    if (index < 0 || index >= navLinks.length || index === activeIndex) {
      return;
    }

    navLinks.forEach((link, idx) => {
      link.classList.toggle("is-active", idx === index);
    });

    activeIndex = index;
    centerActiveLink(index);
  }

  function getCurrentCategoryIndex() {
    const offset = 92;
    let current = 0;

    sections.forEach((section, index) => {
      if (section.getBoundingClientRect().top - offset <= 0) {
        current = index;
      }
    });

    return current;
  }

  let ticking = false;
  function onScrollOrResize() {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(() => {
      setActive(getCurrentCategoryIndex());
      ticking = false;
    });
  }

  navLinks.forEach((link, index) => {
    link.addEventListener("click", () => {
      setActive(index);
    });
  });

  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize);
  onScrollOrResize();
}

async function loadCatalogFromSheet() {
  if (!SHEET_DB_CONFIG) {
    throw new Error("ACTIVE_NICHE tidak wujud dalam NICHE_SHEETS.");
  }

  const spreadsheetId = SHEET_DB_CONFIG.spreadsheetId;
  const productSheetName = SHEET_DB_CONFIG.productSheetName;
  const productSheetGid = SHEET_DB_CONFIG.productSheetGid;

  if (!spreadsheetId) {
    throw new Error("spreadsheetId untuk niche aktif belum diisi.");
  }

  if (!productSheetName && (productSheetGid === undefined || productSheetGid === null || productSheetGid === "")) {
    throw new Error("Isi productSheetName atau productSheetGid untuk niche aktif.");
  }

  const productRows = await fetchSheetRows({
    spreadsheetId,
    sheetName: productSheetName,
    gid: productSheetGid
  });

  const allProducts = mapProducts(productRows);
  const categories = buildCategoriesWithProducts(allProducts);

  if (!categories.some((category) => category.products.length > 0)) {
    throw new Error("Tiada produk aktif dijumpai. Semak kolum category/kategori dan enabled.");
  }

  return categories;
}

async function initPage() {
  try {
    initDynamicYear();
    setStatus("Sedang memuatkan senarai produk...");

    const categories = await loadCatalogFromSheet();

    renderCategoryNav(categories);
    renderCatalog(categories);

    setStatus("");

    initSmoothScroll();
    initDescriptionToggle();
    initImageSlider();
    initCategoryNavTracking();
  } catch (error) {
    setStatus(error.message || "Senarai produk belum dapat dimuatkan. Sila cuba lagi sebentar.", true);

    if (categoryNavList) {
      categoryNavList.innerHTML = "";
    }

    if (catalogContainer) {
      catalogContainer.innerHTML = `
        <div class="empty-card">
          Data belum dapat dimuatkan. Semak spreadsheetId, tab niche, kolum category/kategori, dan pastikan Google Sheet dikongsi sebagai public.
        </div>
      `;
    }
  }
}

initPage();
