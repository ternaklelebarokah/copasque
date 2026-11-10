# LinkVault

Web app simpel untuk menyimpan judul & link. Dibuat dengan HTML + Tailwind CSS + Supabase, siap deploy ke Vercel.

## Fitur

- Login autentikasi dengan Supabase Auth
- Simpan, edit, hapus judul + link ke Supabase
- Filter berdasarkan kategori
- Search berdasarkan judul
- Mode malam (dark mode) dengan toggle
- Responsive (mobile + desktop)
- PWA (installable, offline cache)
- Toast notification
- Styling brutalist (yellow/teal accent)

## Setup

### 1. Buat Project Supabase

- Daftar / login di [supabase.com](https://supabase.com)
- Buat project baru
- Buka **SQL Editor** di dashboard dan jalankan semua query dari file `supabase.sql`

File `supabase.sql` sudah berisi:
- Pembuatan tabel `links` dengan kolom `user_id`, `title`, `url`, `category`
- Row Level Security (RLS) berbasis login
- Policy untuk read, insert, update, delete (hanya user yang login bisa akses data sendiri)
- Index untuk performa query
- Pembuatan user admin
- Data contoh

### 2. Konfigurasi config.js

- Buka **Settings > API** di dashboard Supabase
- Salin **Project URL** dan **anon public key**
- Buka file `config.js`, ganti bagian ini:

```js
const SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_PUBLIC_KEY";
```

### 3. Jalankan Secara Lokal

Karena web ini pakai Supabase JS SDK (CDN), jalankan dengan server lokal sederhana:

```bash
npx serve .
```

Atau pakai ekstensi **Live Server** di VS Code.

### 4. Deploy ke Vercel

**Via CLI:**
```bash
npm i -g vercel
vercel
```

**Via Dashboard:**
1. Push project ke GitHub/GitLab
2. Buka [vercel.com](https://vercel.com) dan klik **New Project**
3. Import repository-nya
4. Klik **Deploy** — tidak perlu build step, ini static site

## Struktur File

```
/
├── index.html       # Halaman utama (daftar link)
├── login.html       # Halaman login
├── config.js        # Konfigurasi Supabase
├── auth.js          # Logic autentikasi
├── app.js           # Logic aplikasi (CRUD link)
├── manifest.json    # PWA manifest
├── sw.js            # Service Worker (offline cache)
├── vercel.json       # Konfigurasi Vercel
├── supabase.sql     # SQL setup database
├── logo-copas.png   # Logo / icon PWA
└── README.md
```

## Login

Setelah menjalankan `supabase.sql`, login dengan:
- Email: `mipela@zuya.store`
- Password: `@Diana42`
