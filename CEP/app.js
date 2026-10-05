(() => {
  const STORAGE_KEY = "campus-circle-listings-v1";
  const categoryIcons = { Electronics: "headphones", Keys: "key-round", IDs: "contact-round", Bags: "backpack", Others: "package" };
  const initialListings = [
    { id: "seed-airpods", title: "Apple AirPods case", category: "Electronics", status: "Found", location: "Gym", date: "2026-10-04", description: "White case found by the water fountain near the courts. No name on it.", contact: "maya.r@campus.edu", image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=1000&q=90" },
    { id: "seed-keys", title: "Keys with red lanyard", category: "Keys", status: "Lost", location: "Library", date: "2026-10-03", description: "Three keys on a red lanyard, possibly left on the second floor by the study tables.", contact: "jordan.k@campus.edu", image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=1000&q=90" },
    { id: "seed-id", title: "Student ID — Alex Chen", category: "IDs", status: "Found", location: "Cafeteria", date: "2026-10-02", description: "Picked up near the east entrance around lunchtime. Left with the front desk.", contact: "sam.p@campus.edu", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1000&q=90" },
    { id: "seed-tote", title: "Green canvas tote bag", category: "Bags", status: "Lost", location: "Science Block", date: "2026-10-01", description: "Has a small planet patch and a notebook inside. Last seen outside Lab 204.", contact: "riley.m@campus.edu", image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=90" },
    { id: "seed-bottle", title: "Blue water bottle", category: "Others", status: "Found", location: "Dorms", date: "2026-09-29", description: "Insulated bottle left in the common room of Maple Hall. Stickers on one side.", contact: "taylor.s@campus.edu", image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1000&q=90" }
  ];
  const grid = document.getElementById("listing-grid");
  const searchInput = document.getElementById("search-input");
  const modal = document.getElementById("report-modal");
  const form = document.getElementById("report-form");
  const imageInput = document.getElementById("item-image");
  const ownedStorageKey = "campus-circle-owned-listings-v1";
  let uploadedImage = "";
  let ownedListingIds = loadOwnedListingIds();
  let listings = loadListings();
  let lastFocused = null;
  let toastTimer;

  function loadListings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === null) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialListings));
        return [...initialListings];
      }
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [...initialListings];
    } catch {
      return [...initialListings];
    }
  }

  function loadOwnedListingIds() {
    try {
      const saved = JSON.parse(localStorage.getItem(ownedStorageKey) || "[]");
      return new Set(Array.isArray(saved) ? saved : []);
    } catch {
      return new Set();
    }
  }

  function persistListings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
    localStorage.setItem(ownedStorageKey, JSON.stringify([...ownedListingIds]));
  }

  function canManageListing(item) {
    return ownedListingIds.has(item.id) || (item.id.startsWith("seed-") && item.status === "Lost");
  }

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) return reject(new Error("Choose an image file."));
      if (file.size > 8 * 1024 * 1024) return reject(new Error("Choose an image smaller than 8 MB."));
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Could not read that image."));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error("That image could not be opened."));
        image.onload = () => {
          const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(image.naturalWidth * scale);
          canvas.height = Math.round(image.naturalHeight * scale);
          canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  }

  function prettyDate(value) {
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? "Date unknown" : new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
  }

  function render() {
    const query = searchInput.value.trim().toLowerCase();
    const status = document.querySelector(".status-button[aria-pressed='true']")?.dataset.status || "all";
    const category = document.getElementById("category-filter").value;
    const location = document.getElementById("location-filter").value;
    const order = document.getElementById("sort-select").value;
    const filtered = listings.filter((item) => {
      const matchesQuery = `${item.title} ${item.description} ${item.location} ${item.category}`.toLowerCase().includes(query);
      return matchesQuery && (status === "all" || item.status === status) && (category === "all" || item.category === category) && (location === "all" || item.location === location);
    }).sort((left, right) => {
      const delta = new Date(`${right.date}T00:00:00`) - new Date(`${left.date}T00:00:00`);
      return order === "newest" ? delta : -delta;
    });

    document.getElementById("result-count").textContent = `${filtered.length} ${filtered.length === 1 ? "item" : "items"}`;
    document.getElementById("empty-state").classList.toggle("hidden", filtered.length > 0);
    grid.classList.toggle("hidden", filtered.length === 0);
    grid.innerHTML = filtered.map((item) => {
      const isFound = item.status === "Found";
      const isOwner = canManageListing(item);
      const icon = categoryIcons[item.category] || "package";
      const contact = escapeHtml(item.contact);
      const image = item.image ? `style="background-image:linear-gradient(0deg,rgba(23,37,29,.09),rgba(23,37,29,.02)),url('${escapeHtml(item.image)}')"` : "";
      return `<article data-item-id="${escapeHtml(item.id)}" class="listing overflow-hidden rounded-2xl border border-[#e4e9e2] bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(32,41,33,.08)]">
        <div class="photo relative h-44 bg-[#e9eee8] sm:h-40" ${image} role="img" aria-label="${escapeHtml(item.title)}"><span class="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold ${isFound ? "bg-[#e5f2e9] text-[#286347]" : "bg-[#fbe9e5] text-[#a3473f]"}">${escapeHtml(item.status)}</span><span class="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#46564a]"><i data-lucide="${icon}" class="icon h-4 w-4"></i></span>${item.image ? "<span class=\"absolute bottom-2 left-3 rounded-md bg-black/45 px-2 py-1 text-[10px] font-medium text-white\">Item photo</span>" : ""}</div>
        <div class="p-4"><div class="mb-1 flex items-start justify-between gap-2"><h3 class="display text-[16px] font-semibold leading-snug">${escapeHtml(item.title)}</h3></div><p class="line-clamp-2 min-h-[40px] text-[13px] leading-5 text-[#778078]">${escapeHtml(item.description || "No additional details provided.")}</p>
          <div class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[#edf0eb] pt-3 text-[11px] font-medium text-[#69746b]"><span class="inline-flex items-center gap-1.5"><i data-lucide="map-pin" class="icon h-3.5 w-3.5 text-[#3d805b]"></i>${escapeHtml(item.location)}</span><span class="inline-flex items-center gap-1.5"><i data-lucide="calendar-days" class="icon h-3.5 w-3.5 text-[#3d805b]"></i>${escapeHtml(prettyDate(item.date))}</span></div>
          <div class="mt-3 flex items-center justify-between gap-2"><span class="inline-flex items-center gap-1.5 text-[11px] text-[#778078]"><i data-lucide="${icon}" class="icon h-3.5 w-3.5"></i>${escapeHtml(item.category)}</span><div class="flex items-center gap-1"><button type="button" class="contact-button focus-ring rounded-md px-2 py-1 text-xs font-semibold text-[#286347] transition hover:bg-[#f2f7f2]" data-contact="${contact}" data-label="Contact ${isFound ? "finder" : "owner"}" aria-expanded="false">Contact ${isFound ? "finder" : "owner"}</button>${isOwner ? `<button type="button" class="resolve-button focus-ring rounded-md px-2 py-1 text-xs font-semibold text-[#a3473f] transition hover:bg-[#fbe9e5]">${isFound ? "Remove found item" : "Mark found &amp; remove"}</button>` : ""}</div></div>
          <p class="contact-detail hidden mt-2 rounded-lg bg-[#f5f7f3] px-3 py-2 text-xs text-[#46564a]">${contact}</p>
        </div></article>`;
    }).join("");
    if (window.lucide) window.lucide.createIcons();
  }

  function clearFilters() {
    searchInput.value = "";
    document.getElementById("category-filter").value = "all";
    document.getElementById("location-filter").value = "all";
    document.querySelectorAll(".status-button").forEach((button) => {
      const selected = button.dataset.status === "all";
      button.setAttribute("aria-pressed", String(selected));
      button.classList.toggle("bg-white", selected);
      button.classList.toggle("shadow-sm", selected);
      button.classList.toggle("text-[#202921]", selected);
      button.classList.toggle("text-[#778078]", !selected);
    });
    render();
  }

  function openModal() {
    lastFocused = document.activeElement;
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    modal.querySelector("input[name='title']").focus();
  }

  function closeModal() {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (lastFocused) lastFocused.focus();
  }

  document.getElementById("open-report").addEventListener("click", openModal);
  document.getElementById("close-report").addEventListener("click", closeModal);
  document.getElementById("cancel-report").addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
    if (event.key === "Tab" && !modal.classList.contains("hidden")) {
      const focusable = [...modal.querySelectorAll("button, input, select, textarea")].filter((element) => !element.disabled);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const item = {
      id: window.crypto?.randomUUID?.() || `item-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: values.get("title").trim(), category: values.get("category"), status: values.get("status"),
      location: values.get("location"), date: values.get("date"), description: values.get("description").trim(),
      contact: values.get("contact").trim(), image: uploadedImage
    };
    listings.unshift(item);
    ownedListingIds.add(item.id);
    try { persistListings(); }
    catch { showToast("Posted for this session; browser storage is unavailable"); }
    clearFilters();
    closeModal();
    form.reset();
    uploadedImage = "";
    document.getElementById("image-preview-wrap").classList.add("hidden");
    showToast("Item posted to the board");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  function showToast(message) {
    const toast = document.getElementById("toast");
    toast.querySelector("span").textContent = message;
    toast.classList.remove("hidden");
    toast.classList.add("flex");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => { toast.classList.add("hidden"); toast.classList.remove("flex"); }, 3000);
  }

  searchInput.addEventListener("input", render);
  document.getElementById("category-filter").addEventListener("change", render);
  document.getElementById("location-filter").addEventListener("change", render);
  document.getElementById("sort-select").addEventListener("change", render);
  document.getElementById("clear-filters").addEventListener("click", clearFilters);
  document.getElementById("empty-clear").addEventListener("click", clearFilters);
  imageInput.addEventListener("change", async () => {
    const file = imageInput.files?.[0];
    if (!file) return;
    try {
      uploadedImage = await compressImage(file);
      document.getElementById("image-preview").src = uploadedImage;
      document.getElementById("image-preview-wrap").classList.remove("hidden");
    } catch (error) {
      imageInput.value = "";
      uploadedImage = "";
      showToast(error.message);
    }
  });
  document.getElementById("remove-image").addEventListener("click", () => {
    imageInput.value = "";
    uploadedImage = "";
    document.getElementById("image-preview-wrap").classList.add("hidden");
  });
  document.getElementById("status-filters").addEventListener("click", (event) => {
    const button = event.target.closest(".status-button");
    if (!button) return;
    document.querySelectorAll(".status-button").forEach((candidate) => {
      const selected = candidate === button;
      candidate.setAttribute("aria-pressed", String(selected));
      candidate.classList.toggle("bg-white", selected);
      candidate.classList.toggle("shadow-sm", selected);
      candidate.classList.toggle("text-[#202921]", selected);
      candidate.classList.toggle("text-[#778078]", !selected);
    });
    render();
  });
  grid.addEventListener("click", (event) => {
    const resolveButton = event.target.closest(".resolve-button");
    if (resolveButton) {
      const itemId = resolveButton.closest("article")?.dataset.itemId;
      const item = listings.find((listing) => listing.id === itemId && canManageListing(listing));
      if (!item) return;
      const message = item.status === "Found" ? `Remove found item “${item.title}” from the board?` : `Mark “${item.title}” as found and remove it from the board?`;
      if (!window.confirm(message)) return;
      listings = listings.filter((listing) => listing.id !== item.id);
      ownedListingIds.delete(item.id);
      try { persistListings(); }
      catch { showToast("Removed for this session; browser storage could not be updated"); }
      render();
      showToast("Item removed from the board");
      return;
    }
    const button = event.target.closest(".contact-button");
    if (!button) return;
    const detail = button.closest("article").querySelector(".contact-detail");
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    button.textContent = expanded ? button.dataset.label : "Hide contact";
    detail.classList.toggle("hidden", expanded);
  });

  render();
})();