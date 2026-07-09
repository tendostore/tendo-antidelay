const CONF_DIR = "/data/adb/tendo_antidelay";
const WHITELIST_FILE = CONF_DIR + "/whitelist.list";
const FREEZER_FILE = CONF_DIR + "/freezer.state";
const LOG_FILE = "/data/local/tmp/tendo_antidelay.log";

// Friendly names for commonly known packages
const KNOWN_NAMES = {
  "com.anthropic.claude": "Claude",
  "com.google.android.gms": "Google Play Services",
  "com.google.android.gm": "Gmail",
  "com.whatsapp": "WhatsApp",
  "com.whatsapp.w4b": "WhatsApp Business",
  "org.telegram.messenger": "Telegram",
  "com.google.android.apps.messaging": "Messages",
  "com.discord": "Discord",
  "com.instagram.android": "Instagram",
  "com.android.vending": "Play Store",
};

// Curated recommendations, with notes in both languages
const RECOMMENDED_APPS = [
  { pkg: "com.google.android.gm", name: "Gmail", note: { en: "Often delayed when the phone is idle for a while", id: "Sering delay kalau HP idle lama" } },
  { pkg: "com.whatsapp", name: "WhatsApp", note: { en: "Chat & OTP notifications", id: "Notifikasi chat & OTP" } },
  { pkg: "com.whatsapp.w4b", name: "WhatsApp Business", note: { en: "Relevant for transaction/bot notifications", id: "Relevan untuk notifikasi transaksi/bot" } },
  { pkg: "org.telegram.messenger", name: "Telegram", note: { en: "Bot & channel notifications", id: "Notifikasi bot & channel" } },
  { pkg: "com.google.android.apps.messaging", name: "Messages (SMS/RCS)", note: { en: "OTP via SMS", id: "OTP via SMS" } },
  { pkg: "com.instagram.android", name: "Instagram", note: { en: "DMs & notifications", id: "DM & notifikasi" } },
  { pkg: "com.android.vending", name: "Play Store", note: { en: "Automatic background app updates", id: "Update aplikasi otomatis di background" } },
];

let appPackages = []; // array of package strings currently in config

function showToast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2200);
}

function friendlyName(pkg) {
  return KNOWN_NAMES[pkg] || pkg;
}

async function ensureConfDir() {
  await ksuExec(`mkdir -p ${CONF_DIR}`);
}

async function appendLog(message) {
  const safe = message.replace(/"/g, "'");
  await ksuExec(`echo "$(date '+%Y-%m-%d %H:%M:%S') - ${safe}" >> ${LOG_FILE}`);
  refreshLog();
}

async function readListFile() {
  const res = await ksuExec(`cat ${WHITELIST_FILE} 2>/dev/null`);
  if (!res.stdout) return [];
  return res.stdout
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

async function writeListFile(list) {
  const content = list.join("\n") + (list.length ? "\n" : "");
  const b64 = btoa(unescape(encodeURIComponent(content)));
  await ksuExec(`echo ${b64} | base64 -d > ${WHITELIST_FILE}`);
}

async function readFreezerState() {
  const live = await ksuExec(`cmd device_config get activity_manager_native_boot use_freezer`);
  const val = (live.stdout || "").trim();
  if (val === "false") return "disabled";
  if (val === "true") return "default";
  const saved = await ksuExec(`cat ${FREEZER_FILE} 2>/dev/null`);
  return (saved.stdout || "").trim() || "default";
}

async function setFreezerState(disabled) {
  const value = disabled ? "disabled" : "default";
  const flag = disabled ? "false" : "true";
  await ksuExec(`cmd device_config put activity_manager_native_boot use_freezer ${flag}`);
  await ksuExec(`echo "${value}" > ${FREEZER_FILE}`);
}

async function whitelistAdd(pkg) {
  await ksuExec(`dumpsys deviceidle whitelist +${pkg}`);
}
async function whitelistRemove(pkg) {
  await ksuExec(`dumpsys deviceidle whitelist -${pkg}`);
}

// ---- Recommended apps section ----
function renderRecommended() {
  const container = document.getElementById("recommended-list");
  const remaining = RECOMMENDED_APPS.filter((a) => !appPackages.includes(a.pkg));

  if (remaining.length === 0) {
    container.innerHTML = `<div class="empty">${t("allRecommendedAdded")}</div>`;
    return;
  }

  container.innerHTML = "";
  remaining.forEach((app) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
      <div class="row-info">
        <div class="row-title">${app.name}</div>
        <div class="row-sub">${app.note[currentLang] || app.note.en}</div>
      </div>
      <label class="switch">
        <input type="checkbox" data-pkg="${app.pkg}">
        <span class="slider"></span>
      </label>
    `;
    container.appendChild(row);
  });

  container.querySelectorAll('input[type="checkbox"]').forEach((el) => {
    el.addEventListener("change", async (e) => {
      if (!e.target.checked) return;
      const pkg = e.target.getAttribute("data-pkg");
      await addPackageByName(pkg);
      renderRecommended();
    });
  });
}

// ---- Active whitelist section ----
async function addPackageByName(pkg) {
  if (!pkg) return false;
  if (appPackages.includes(pkg)) {
    showToast(t("toastAlreadyInList"));
    return false;
  }
  appPackages.push(pkg);
  await writeListFile(appPackages);
  await whitelistAdd(pkg);
  renderApps();
  showToast(t("toastAddedWhitelist", friendlyName(pkg)));
  appendLog(`Added ${pkg} to Doze whitelist`);
  return true;
}

async function addPackage() {
  const input = document.getElementById("pkg-input");
  const pkg = input.value.trim();
  if (!pkg) return;
  const ok = await addPackageByName(pkg);
  if (ok) input.value = "";
}

function renderApps() {
  const container = document.getElementById("app-list");
  if (appPackages.length === 0) {
    container.innerHTML = `<div class="empty">${t("noApps")}</div>`;
    renderRecommended();
    return;
  }
  container.innerHTML = "";
  appPackages.forEach((pkg) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
      <div class="row-info">
        <div class="row-title">${friendlyName(pkg)}</div>
        <div class="row-sub">${pkg}</div>
      </div>
      <button class="remove-btn" data-pkg="${pkg}">${t("removeBtn")}</button>
      <label class="switch">
        <input type="checkbox" data-pkg="${pkg}" checked>
        <span class="slider"></span>
      </label>
    `;
    container.appendChild(row);
  });

  container.querySelectorAll('input[type="checkbox"]').forEach((el) => {
    el.addEventListener("change", async (e) => {
      const pkg = e.target.getAttribute("data-pkg");
      if (e.target.checked) {
        await whitelistAdd(pkg);
        showToast(t("toastAddedWhitelist", friendlyName(pkg)));
        appendLog(`Added ${pkg} to Doze whitelist`);
      } else {
        await whitelistRemove(pkg);
        showToast(t("toastRemovedWhitelist", friendlyName(pkg)));
        appendLog(`Removed ${pkg} from Doze whitelist`);
      }
    });
  });

  container.querySelectorAll(".remove-btn").forEach((el) => {
    el.addEventListener("click", async (e) => {
      const pkg = e.target.getAttribute("data-pkg");
      await whitelistRemove(pkg);
      appPackages = appPackages.filter((p) => p !== pkg);
      await writeListFile(appPackages);
      renderApps();
      showToast(t("toastRemovedList", friendlyName(pkg)));
      appendLog(`Removed ${pkg} from list and Doze whitelist`);
    });
  });

  renderRecommended();
}

// ---- Installed app picker ----
let installedAppsCache = [];

async function fetchInstalledApps(includeSystem) {
  const cmd = includeSystem ? "pm list packages" : "pm list packages -3";
  const res = await ksuExec(cmd);
  const lines = (res.stdout || "")
    .split("\n")
    .map((l) => l.replace("package:", "").trim())
    .filter(Boolean);
  lines.sort();
  return lines;
}

function renderPickerList(filterText) {
  const list = document.getElementById("picker-list");
  const filtered = installedAppsCache.filter((pkg) => {
    if (!filterText) return true;
    const f = filterText.toLowerCase();
    return pkg.toLowerCase().includes(f) || friendlyName(pkg).toLowerCase().includes(f);
  });

  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty">${t("noAppsFound")}</div>`;
    return;
  }

  list.innerHTML = "";
  filtered.forEach((pkg) => {
    const already = appPackages.includes(pkg);
    const row = document.createElement("div");
    row.className = "picker-row";
    const nameDiffersFromPkg = friendlyName(pkg) !== pkg;
    row.innerHTML = `
      <div class="picker-row-info">
        <div class="picker-row-title">${friendlyName(pkg)}</div>
        ${nameDiffersFromPkg ? `<div class="picker-row-sub">${pkg}</div>` : ""}
      </div>
      <button class="picker-add-btn ${already ? "added" : ""}" data-pkg="${pkg}">
        ${already ? t("added") : t("add")}
      </button>
    `;
    list.appendChild(row);
  });

  list.querySelectorAll(".picker-add-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const pkg = e.target.getAttribute("data-pkg");
      if (e.target.classList.contains("added")) return;
      e.target.textContent = "...";
      const ok = await addPackageByName(pkg);
      if (ok) {
        e.target.textContent = t("added");
        e.target.classList.add("added");
      } else {
        e.target.textContent = t("add");
      }
    });
  });
}

async function openPicker() {
  const overlay = document.getElementById("picker-overlay");
  const list = document.getElementById("picker-list");
  overlay.classList.add("show");
  list.innerHTML = `<div class="empty"><span class="spinner"></span> ${t("loadingPicker")}</div>`;

  const includeSystem = document.getElementById("picker-show-system").checked;
  installedAppsCache = await fetchInstalledApps(includeSystem);
  renderPickerList(document.getElementById("picker-search").value.trim());
}

function closePicker() {
  document.getElementById("picker-overlay").classList.remove("show");
}

// ---- Freezer section ----
async function refreshFreezerStatus() {
  const state = await readFreezerState();
  const toggle = document.getElementById("freezer-toggle");
  const status = document.getElementById("freezer-status");
  toggle.checked = state === "disabled";
  status.textContent = state === "disabled" ? t("freezerOn") : t("freezerOff");
}

// ---- Log ----
async function refreshLog() {
  const res = await ksuExec(`tail -n 20 ${LOG_FILE} 2>/dev/null`);
  const box = document.getElementById("log-box");
  box.textContent = res.stdout && res.stdout.trim() ? res.stdout : t("noLogYet");
}

async function init() {
  await ensureConfDir();
  await loadSavedLanguage();

  // Freezer state
  document.getElementById("freezer-status").textContent = t("loadingStatus");
  await refreshFreezerStatus();

  document.getElementById("freezer-toggle").addEventListener("change", async (e) => {
    await setFreezerState(e.target.checked);
    await refreshFreezerStatus();
    showToast(e.target.checked ? t("toastFreezerDisabled") : t("toastFreezerDefault"));
    appendLog(e.target.checked ? "Cached apps freezer disabled" : "Cached apps freezer restored to default");
  });

  // App whitelist
  appPackages = await readListFile();
  if (appPackages.length === 0) {
    // seed default on very first run
    appPackages = ["com.google.android.gms"];
    await writeListFile(appPackages);
    for (const p of appPackages) await whitelistAdd(p);
    appendLog("First run: seeded default whitelist with com.google.android.gms");
  }
  renderApps();

  document.getElementById("add-btn").addEventListener("click", addPackage);
  document.getElementById("pkg-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") addPackage();
  });

  // Picker modal wiring
  document.getElementById("pick-btn").addEventListener("click", openPicker);
  document.getElementById("picker-close").addEventListener("click", closePicker);
  document.getElementById("picker-overlay").addEventListener("click", (e) => {
    if (e.target.id === "picker-overlay") closePicker();
  });
  document.getElementById("picker-search").addEventListener("input", (e) => {
    renderPickerList(e.target.value.trim());
  });
  document.getElementById("picker-show-system").addEventListener("change", async (e) => {
    const list = document.getElementById("picker-list");
    list.innerHTML = `<div class="empty"><span class="spinner"></span> ${t("loadingPicker")}</div>`;
    installedAppsCache = await fetchInstalledApps(e.target.checked);
    renderPickerList(document.getElementById("picker-search").value.trim());
  });

  // Language switcher wiring
  document.getElementById("lang-en").addEventListener("click", () => setLanguage("en"));
  document.getElementById("lang-id").addEventListener("click", () => setLanguage("id"));

  refreshLog();
}

init();
