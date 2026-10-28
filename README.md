# LinkVault

Web app simpel untuk menyimpan judul & link. Dibuat dengan HTML + Tailwind CSS + Supabase, siap deploy ke Vercel.

## Setup

### 1. Buat Project Supabase

- Daftar / login di [supabase.com](https://supabase.com)
- Buat project baru
- Buka **SQL Editor** di dashboard dan jalankan query ini:

```sql
CREATE TABLE links (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title       TEXT NOT NULL,
  url         TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Policy untuk akses publik (tanpa login)
CREATE POLICY "Public read"   ON links FOR SELECT USING (true);
CREATE POLICY "Public insert" ON links FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete" ON links FOR DELETE USING (true);
CREATE POLICY "Public update" ON links FOR UPDATE USING (true);
```

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

## Fitur

- Simpan judul + link ke Supabase
- Hapus link
- Search / filter berdasarkan judul
- Responsive (mobile + desktop)
- Toast notification
- Styling ala saweria.co (dark theme, violet accent)
