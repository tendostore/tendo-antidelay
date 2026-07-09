// Simple i18n dictionary. Default language: English.
const I18N = {
  en: {
    headerSub: "Notifications & Downloads — manage apps excluded from Doze and freezer settings",
    titleFreezer: "Cached Apps Freezer",
    freezerTitle: "Disable Freezer",
    freezerOn: "Disabled — background apps are not frozen (smoother notifications/downloads, slightly higher battery use)",
    freezerOff: "Enabled (system default) — saves battery, but may cause delays",
    loadingStatus: "Loading status...",
    titleRecommended: "Recommended Apps",
    loadingRecommended: "Loading recommendations...",
    allRecommendedAdded: "All recommendations have already been added.",
    titleWhitelist: "Doze Whitelist per App",
    loadingApps: "Loading app list...",
    noApps: "No apps yet. Add one below.",
    removeBtn: "Remove",
    titleAdd: "Add Application",
    pickBtnLabel: "Select from Installed Apps",
    pkgInputPlaceholder: "or type package name manually",
    addBtn: "Add",
    pickerSearchPlaceholder: "Search apps...",
    pickerSystemLabel: "Show system apps too",
    loadingPicker: "Loading app list...",
    noAppsFound: "No apps found.",
    added: "Added",
    add: "Add",
    titleLog: "Latest Log",
    noLogYet: "No log yet.",
    toastAlreadyInList: "App is already in the list",
    toastAddedWhitelist: (name) => `${name} added to whitelist`,
    toastRemovedWhitelist: (name) => `${name} removed from whitelist`,
    toastRemovedList: (name) => `${name} removed from list`,
    toastAdded: (name) => `${name} added`,
    toastFreezerDisabled: "Freezer disabled",
    toastFreezerDefault: "Freezer restored to default",
    ksuBridgeMissing: "Root bridge unavailable. Open this from KernelSU Manager, or on Magisk install the \"WebUI X\" (or KsuWebUIStandalone) app and open this module page through it.",
    logHeaderMissing: "No log yet.",
  },
  id: {
    headerSub: "Notifikasi & Download — kelola app yang dikecualikan dari Doze & pengaturan freezer",
    titleFreezer: "Cached Apps Freezer",
    freezerTitle: "Nonaktifkan Freezer",
    freezerOn: "Nonaktif — app background tidak dibekukan (notifikasi/download lebih lancar, baterai sedikit lebih boros)",
    freezerOff: "Aktif (default sistem) — hemat baterai, tapi berpotensi delay",
    loadingStatus: "Memuat status...",
    titleRecommended: "Aplikasi Direkomendasikan",
    loadingRecommended: "Memuat rekomendasi...",
    allRecommendedAdded: "Semua rekomendasi sudah ditambahkan.",
    titleWhitelist: "Whitelist Doze per Aplikasi",
    loadingApps: "Memuat daftar aplikasi...",
    noApps: "Belum ada aplikasi. Tambahkan di bawah.",
    removeBtn: "Hapus",
    titleAdd: "Tambah Aplikasi",
    pickBtnLabel: "Pilih dari Aplikasi Terinstal",
    pkgInputPlaceholder: "atau ketik package name manual",
    addBtn: "Tambah",
    pickerSearchPlaceholder: "Cari aplikasi...",
    pickerSystemLabel: "Tampilkan aplikasi sistem juga",
    loadingPicker: "Memuat daftar aplikasi...",
    noAppsFound: "Tidak ada aplikasi ditemukan.",
    added: "Ditambahkan",
    add: "Tambah",
    titleLog: "Log Terakhir",
    noLogYet: "Belum ada log.",
    toastAlreadyInList: "Aplikasi sudah ada di daftar",
    toastAddedWhitelist: (name) => `${name} ditambahkan ke whitelist`,
    toastRemovedWhitelist: (name) => `${name} dihapus dari whitelist`,
    toastRemovedList: (name) => `${name} dihapus dari daftar`,
    toastAdded: (name) => `${name} ditambahkan`,
    toastFreezerDisabled: "Freezer dinonaktifkan",
    toastFreezerDefault: "Freezer dikembalikan ke default",
    ksuBridgeMissing: "Bridge root tidak tersedia. Buka ini lewat KernelSU Manager, atau kalau pakai Magisk install app \"WebUI X\" (atau KsuWebUIStandalone) lalu buka halaman modul ini lewat app tersebut.",
    logHeaderMissing: "Belum ada log.",
  },
};

let currentLang = "en";

function t(key, ...args) {
  const entry = I18N[currentLang][key];
  if (typeof entry === "function") return entry(...args);
  return entry;
}

function applyStaticTranslations() {
  document.getElementById("header-sub").textContent = t("headerSub");
  document.getElementById("title-freezer").textContent = t("titleFreezer");
  document.getElementById("freezer-title").textContent = t("freezerTitle");
  document.getElementById("title-recommended").textContent = t("titleRecommended");
  document.getElementById("title-whitelist").textContent = t("titleWhitelist");
  document.getElementById("title-add").textContent = t("titleAdd");
  document.getElementById("pick-btn-label").textContent = t("pickBtnLabel");
  document.getElementById("pkg-input").placeholder = t("pkgInputPlaceholder");
  document.getElementById("add-btn").textContent = t("addBtn");
  document.getElementById("picker-search").placeholder = t("pickerSearchPlaceholder");
  document.getElementById("picker-system-label").textContent = t("pickerSystemLabel");
  document.getElementById("title-log").textContent = t("titleLog");

  document.getElementById("lang-en").classList.toggle("active", currentLang === "en");
  document.getElementById("lang-id").classList.toggle("active", currentLang === "id");
}

async function setLanguage(lang) {
  currentLang = lang;
  applyStaticTranslations();
  await ksuExec(`mkdir -p ${"/data/adb/tendo_antidelay"} && echo "${lang}" > /data/adb/tendo_antidelay/lang.state`);
  // Re-render dynamic sections so their text updates too
  if (typeof renderApps === "function") renderApps();
  if (typeof refreshFreezerStatus === "function") refreshFreezerStatus();
  if (typeof refreshLog === "function") refreshLog();
}

async function loadSavedLanguage() {
  const res = await ksuExec(`cat /data/adb/tendo_antidelay/lang.state 2>/dev/null`);
  const saved = (res.stdout || "").trim();
  currentLang = saved === "id" || saved === "en" ? saved : "en";
  applyStaticTranslations();
}
