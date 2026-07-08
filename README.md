# Tendo - Anti Delay

Modul root Android (KernelSU & Magisk) untuk mengatasi **delay notifikasi & download** akibat Doze Mode dan Cached Apps Freezer, lengkap dengan WebUI untuk mengelola pengecualian per aplikasi.

![Platform](https://img.shields.io/badge/platform-KernelSU%20%7C%20Magisk-blue)
![Version](https://img.shields.io/badge/version-v1.0-green)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

## ✨ Fitur

- **Cached Apps Freezer Toggle** — nonaktifkan pembekuan proses background lewat `device_config` (`activity_manager_native_boot/use_freezer`), sehingga notifikasi & sinkronisasi app tetap lancar meski HP idle lama.
- **Whitelist Doze per Aplikasi** — tambah/hapus aplikasi dari Doze whitelist langsung dari WebUI, tanpa perlu ADB.
- **Rekomendasi Aplikasi Otomatis** — daftar app umum (Gmail, WhatsApp, WhatsApp Business, Telegram, Messages, Instagram, Play Store) yang sering kena delay, tinggal toggle satu tap.
- **Pemilih Aplikasi Terinstal** — cari & tambahkan aplikasi apa pun langsung dari daftar app yang terpasang di HP.
- **Log Aktivitas** — riwayat perubahan whitelist & freezer tersimpan dan bisa dilihat langsung di WebUI.
- **Dwibahasa** — antarmuka tersedia dalam Bahasa Indonesia dan English.
- **Kompatibel KernelSU & Magisk** — service berjalan otomatis di kedua platform tanpa konfigurasi tambahan.

## 📋 Requirement

- Android 11 (API 30) ke atas — versi minimal yang mendukung Cached Apps Freezer.
- Root akses via [KernelSU](https://kernelsu.org) **atau** [Magisk](https://github.com/topjohnwu/Magisk).
- Untuk membuka WebUI di **Magisk**, install salah satu WebUI host pihak ketiga:
  - [WebUI X](https://github.com/MMRLApp/WebUI-X-Portable) (direkomendasikan), atau
  - KsuWebUIStandalone

  > KernelSU Manager sudah punya WebView bawaan, jadi user KernelSU tidak perlu app tambahan.

## 📥 Instalasi

1. Download rilis terbaru (`.zip`) dari halaman [Releases](https://github.com/tendostore/tendo-antidelay/releases).
2. Buka **KernelSU Manager** atau **Magisk Manager** → tab **Modules** → **Install from storage**.
3. Pilih file `.zip` yang sudah diunduh, tunggu proses instalasi selesai.
4. **Reboot** perangkat.
5. Buka WebUI modul:
   - **KernelSU**: buka lewat KernelSU Manager → Modules → tap modul ini.
   - **Magisk**: buka app WebUI X / KsuWebUIStandalone → pilih modul ini.

## ⚙️ Cara Pakai

1. **Nonaktifkan Freezer** — toggle di bagian "Cached Apps Freezer" kalau notifikasi/download sering delay saat HP idle. Catatan: baterai bisa sedikit lebih boros.
2. **Tambah App ke Whitelist Doze** — pilih dari daftar rekomendasi, atau gunakan "Pilih dari Aplikasi Terinstal" / masukkan package name manual.
3. **Cek Log** — scroll ke bagian "Log Terakhir" untuk melihat riwayat perubahan.

Perubahan diterapkan langsung (real-time) tanpa perlu reboot, dan otomatis diterapkan ulang setiap boot lewat `service.sh`.

## 🔍 Verifikasi Manual (opsional, via terminal root)

```bash
su
# Cek status freezer
cmd device_config get activity_manager_native_boot use_freezer
# false = freezer nonaktif, true = freezer aktif (default)

# Cek daftar whitelist Doze
dumpsys deviceidle whitelist

# Cek proses yang sedang dibekukan
dumpsys activity processes | grep -c "isFrozen=true"
```

## 🗂️ Struktur Modul

```
tendo-antidelay/
├── module.prop        # Metadata modul
├── service.sh          # Auto-apply konfigurasi saat boot
└── webroot/
    ├── index.html       # Halaman WebUI
    ├── app.js           # Logic utama (freezer, whitelist, picker)
    ├── i18n.js          # Terjemahan ID/EN
    └── ksu-bridge.js     # Wrapper API window.ksu.exec
```

## ❓ FAQ

**Q: Kenapa toggle freezer tidak berubah setelah saya tap?**
A: Perubahan diterapkan langsung, tapi proses yang sudah terlanjur dibekukan sebelumnya tidak otomatis unfreeze. Tunggu app tersebut dibuka ulang atau reboot untuk hasil yang bersih.

**Q: Apakah modul ini aman untuk baterai?**
A: Menonaktifkan freezer dapat sedikit meningkatkan konsumsi baterai karena app di background tidak dibekukan. Gunakan hanya untuk app yang benar-benar butuh notifikasi real-time.

**Q: WebUI tidak bisa dibuka di Magisk, kenapa?**
A: Magisk tidak memiliki WebView bawaan seperti KernelSU Manager. Install WebUI X atau KsuWebUIStandalone terlebih dahulu.

## 🤝 Kontribusi & Dukungan

Ditemukan bug atau punya saran fitur? Silakan buka [Issue](https://github.com/tendostore/tendo-antidelay/issues) di repository ini.

## 📄 Lisensi

Proyek ini dirilis di bawah [Lisensi MIT](LICENSE) — lihat file `LICENSE` untuk detail lengkap.

---

Dibuat dengan ❤️ oleh **Tendo Store**
