// ============================================================
//  LinkVault - App Logic
// ============================================================

let allLinks = [];

// ---- DOM Refs ----
const form          = document.getElementById("linkForm");
const titleInput    = document.getElementById("titleInput");
const linkInput     = document.getElementById("linkInput");
const categoryInput = document.getElementById("categoryInput");
const submitBtn     = document.getElementById("submitBtn");
const btnText       = document.getElementById("btnText");
const btnIcon       = document.getElementById("btnIcon");
const linkGrid      = document.getElementById("linkGrid");
const loadingState  = document.getElementById("loadingState");
const emptyState    = document.getElementById("emptyState");
const countBadge    = document.getElementById("countBadge");
const searchInput   = document.getElementById("searchInput");
const categoryFilter= document.getElementById("categoryFilter");
const categoryList  = document.getElementById("categoryList");
const toast         = document.getElementById("toast");
const toastMsg      = document.getElementById("toastMsg");
const toastIcon     = document.getElementById("toastIcon");
const userEmailEl   = document.getElementById("userEmail");

// Edit Modal
const editModal         = document.getElementById("editModal");
const editForm          = document.getElementById("editForm");
const editId            = document.getElementById("editId");
const editTitleInput    = document.getElementById("editTitleInput");
const editLinkInput     = document.getElementById("editLinkInput");
const editCategoryInput = document.getElementById("editCategoryInput");
const editSubmitBtn     = document.getElementById("editSubmitBtn");
const editBtnText       = document.getElementById("editBtnText");

// ============================================================
//  Toast Notification
// ============================================================
function showToast(message, type = "success") {
  const icons = {
    success: "✅",
    error:   "❌",
    info:    "ℹ️",
  };
  const textColors = {
    success: "#111111",
    error:   "#F25C54",
    info:    "#3ECFBF",
  };
  toastIcon.textContent = icons[type] || "✅";
  toastMsg.textContent  = message;
  toastMsg.style.color  = textColors[type] || "#111111";

  toast.classList.remove("hidden");
  toast.classList.remove("toast-enter");
  void toast.offsetWidth;
  toast.classList.add("toast-enter");

  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.add("hidden"), 3000);
}

// ============================================================
//  Utility: Escape HTML
// ============================================================
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ============================================================
//  Utility: Get domain from URL
// ============================================================
function getDomain(url) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

// ============================================================
//  Utility: Format relative time (Indonesian)
// ============================================================
function timeAgo(dateString) {
  const diff = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (diff < 60)      return "baru saja";
  if (diff < 3600)    return Math.floor(diff / 60) + " menit lalu";
  if (diff < 86400)   return Math.floor(diff / 3600) + " jam lalu";
  if (diff < 604800)  return Math.floor(diff / 86400) + " hari lalu";
  return new Date(dateString).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

// ============================================================
//  Category tag color cycle (Saweria palette)
// ============================================================
const TAG_COLORS = [
  { bg: "#F5C842", border: "#111" },
  { bg: "#3ECFBF", border: "#111" },
  { bg: "#F25C54", border: "#111" },
  { bg: "#D4F5A2", border: "#111" },
  { bg: "#C4B5FD", border: "#111" },
  { bg: "#FDB97D", border: "#111" },
];
const categoryColorMap = {};
let colorIndex = 0;

function getCategoryColor(cat) {
  if (!cat) return null;
  if (!categoryColorMap[cat]) {
    categoryColorMap[cat] = TAG_COLORS[colorIndex % TAG_COLORS.length];
    colorIndex++;
  }
  return categoryColorMap[cat];
}

// ============================================================
//  Update categories datalist & filter dropdown
// ============================================================
function updateCategories(links) {
  const cats = [...new Set(links.map(l => l.category).filter(Boolean))].sort();

  // Datalist for autocomplete
  categoryList.innerHTML = cats.map(c => `<option value="${escapeHtml(c)}">`).join("");

  // Filter dropdown — preserve current selection
  const current = categoryFilter.value;
  categoryFilter.innerHTML = `<option value="">Semua Kategori</option>` +
    cats.map(c => `<option value="${escapeHtml(c)}" ${c === current ? "selected" : ""}>${escapeHtml(c)}</option>`).join("");
}

// ============================================================
//  Render Links
// ============================================================
function renderLinks(links) {
  loadingState.classList.add("hidden");

  if (links.length === 0) {
    linkGrid.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }
  emptyState.classList.add("hidden");

  linkGrid.innerHTML = links.map((item) => {
    const tagColor = item.category ? getCategoryColor(item.category) : null;
    const tagHtml = tagColor
      ? `<span class="tag-pill" style="background:${tagColor.bg};border-color:${tagColor.border};">${escapeHtml(item.category)}</span>`
      : "";

    return `
    <article class="group bg-white border-2 border-saweria-border rounded-2xl p-5 flex flex-col gap-3 shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150">
      <!-- Top row: icon + title + actions -->
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <!-- Favicon -->
          <div class="w-10 h-10 shrink-0 rounded-xl border-2 border-saweria-border bg-saweria-bg flex items-center justify-center overflow-hidden shadow-brutal-sm">
            <img
              src="https://www.google.com/s2/favicons?domain=${escapeHtml(getDomain(item.url))}&sz=32"
              alt=""
              class="w-5 h-5"
              onerror="this.style.display='none';this.nextSibling.style.display='flex'"
            />
            <span class="hidden w-full h-full items-center justify-center text-base">🔗</span>
          </div>
          <div class="min-w-0">
            <h3 class="font-display font-bold text-sm leading-tight truncate" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</h3>
            <p class="text-xs text-gray-400 font-mono truncate mt-0.5">${escapeHtml(getDomain(item.url))}</p>
          </div>
        </div>
        <!-- Action buttons (show on hover) -->
        <div class="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onclick="openEditModal(${item.id})"
            class="btn-brutal w-8 h-8 rounded-lg border-2 border-saweria-border bg-saweria-yellow flex items-center justify-center shadow-brutal-sm"
            title="Edit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onclick="deleteLink(${item.id})"
            class="btn-brutal w-8 h-8 rounded-lg border-2 border-saweria-border bg-saweria-red text-white flex items-center justify-center shadow-brutal-sm"
            title="Hapus"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <!-- URL snippet -->
      <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer"
         class="text-xs font-mono text-saweria-teal hover:underline truncate block">
        ${escapeHtml(item.url)}
      </a>

      <!-- Bottom row: tag + time + open button -->
      <div class="flex items-center justify-between pt-2 border-t-2 border-dashed border-gray-200">
        <div class="flex items-center gap-2">
          ${tagHtml}
          <span class="text-xs font-mono text-gray-400">${timeAgo(item.created_at)}</span>
        </div>
        <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer"
           class="btn-brutal inline-flex items-center gap-1 px-3 py-1.5 bg-saweria-teal border-2 border-saweria-border rounded-lg text-xs font-bold shadow-brutal-sm">
          Buka
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>
    </article>
  `}).join("");
}

// ============================================================
//  Update count badge
// ============================================================
function updateCount(count) {
  countBadge.textContent = count;
}

// ============================================================
//  Filter helper
// ============================================================
function filterLinks(links, query, category) {
  let result = links;
  if (category) result = result.filter(l => l.category === category);
  if (query)    result = result.filter(l =>
    l.title.toLowerCase().includes(query.toLowerCase()) ||
    l.url.toLowerCase().includes(query.toLowerCase())
  );
  return result;
}

function applyFilters() {
  renderLinks(filterLinks(allLinks, searchInput.value, categoryFilter.value));
}

// ============================================================
//  Fetch Links from Supabase
// ============================================================
async function fetchLinks() {
  if (!supabaseClient) {
    loadingState.classList.add("hidden");
    emptyState.classList.remove("hidden");
    showToast("Supabase belum dikonfigurasi. Buka config.js.", "error");
    return;
  }
  try {
    loadingState.classList.remove("hidden");
    const { data, error } = await supabaseClient
      .from("links")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;

    allLinks = data || [];
    updateCount(allLinks.length);
    updateCategories(allLinks);
    renderLinks(allLinks);
  } catch (err) {
    console.error("Fetch error:", err);
    showToast("Gagal memuat data: " + err.message, "error");
    loadingState.classList.add("hidden");
    emptyState.classList.remove("hidden");
  }
}

// ============================================================
//  Add Link
// ============================================================
function setBtnLoading(loading) {
  submitBtn.disabled = loading;
  if (loading) {
    btnText.textContent = "Menyimpan...";
    btnIcon.innerHTML = `<div class="spinner" style="width:18px;height:18px;border-width:2px;"></div>`;
  } else {
    btnText.textContent = "Simpan Link";
    btnIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`;
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title    = titleInput.value.trim();
  const url      = linkInput.value.trim();
  const category = categoryInput.value.trim();

  if (!title || !url) return;
  if (!supabaseClient) {
    showToast("Supabase belum dikonfigurasi.", "error");
    return;
  }

  setBtnLoading(true);
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    const { data, error } = await supabaseClient
      .from("links")
      .insert([{ title, url, category, user_id: session.user.id }])
      .select()
      .single();
    if (error) throw error;

    allLinks.unshift(data);
    updateCount(allLinks.length);
    updateCategories(allLinks);
    applyFilters();
    form.reset();
    showToast("Link berhasil disimpan! 🎉", "success");
  } catch (err) {
    console.error("Insert error:", err);
    showToast("Gagal menyimpan: " + err.message, "error");
  } finally {
    setBtnLoading(false);
  }
});

// ============================================================
//  Delete Link
// ============================================================
async function deleteLink(id) {
  if (!confirm("Yakin mau hapus link ini?")) return;
  try {
    const { error } = await supabaseClient.from("links").delete().eq("id", id);
    if (error) throw error;

    allLinks = allLinks.filter(l => l.id !== id);
    updateCount(allLinks.length);
    updateCategories(allLinks);
    applyFilters();
    showToast("Link dihapus.", "info");
  } catch (err) {
    showToast("Gagal hapus: " + err.message, "error");
  }
}

// ============================================================
//  Edit Modal
// ============================================================
function openEditModal(id) {
  const item = allLinks.find(l => l.id === id);
  if (!item) return;

  editId.value            = id;
  editTitleInput.value    = item.title;
  editLinkInput.value     = item.url;
  editCategoryInput.value = item.category || "";

  editModal.classList.remove("hidden");
  editTitleInput.focus();
}

function closeEditModal() {
  editModal.classList.add("hidden");
  editForm.reset();
}

editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id       = Number(editId.value);
  const title    = editTitleInput.value.trim();
  const url      = editLinkInput.value.trim();
  const category = editCategoryInput.value.trim();

  if (!title || !url) return;

  editSubmitBtn.disabled = true;
  editBtnText.textContent = "Menyimpan...";

  try {
    const { data, error } = await supabaseClient
      .from("links")
      .update({ title, url, category })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    const idx = allLinks.findIndex(l => l.id === id);
    if (idx !== -1) allLinks[idx] = data;

    updateCategories(allLinks);
    applyFilters();
    closeEditModal();
    showToast("Link berhasil diupdate! ✏️", "success");
  } catch (err) {
    showToast("Gagal update: " + err.message, "error");
  } finally {
    editSubmitBtn.disabled  = false;
    editBtnText.textContent = "Simpan Perubahan";
  }
});

// Close modal on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeEditModal();
});

// ============================================================
//  Search & Category Filter
// ============================================================
searchInput.addEventListener("input", applyFilters);
categoryFilter.addEventListener("change", applyFilters);

// ============================================================
//  Expose globals for inline onclick
// ============================================================
window.deleteLink    = deleteLink;
window.openEditModal = openEditModal;
window.closeEditModal= closeEditModal;

// ============================================================
//  Init — cek auth dulu, baru load data
// ============================================================
(async () => {
  const session = await requireAuth();
  if (!session) return; // requireAuth sudah redirect ke login.html

  // Tampilkan email user di header
  if (userEmailEl) {
    userEmailEl.textContent = session.user.email;
    userEmailEl.classList.remove("hidden");
  }

  // Mulai load data
  fetchLinks();
})();
