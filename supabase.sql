-- ============================================================
--  LinkVault - Supabase SQL Setup
--  Project : jmldcskcyotoicrlmgui.supabase.co
--
--  CARA PAKAI:
--  1. Buka https://supabase.com → masuk ke project kamu
--  2. Klik "SQL Editor" di sidebar kiri → "New query"
--  3. Copy semua isi file ini → paste → klik "Run"
-- ============================================================


-- ------------------------------------------------------------
--  STEP 1 — Buat tabel links
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS links (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  url         TEXT        NOT NULL,
  category    TEXT        NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ------------------------------------------------------------
--  STEP 2 — Aktifkan Row Level Security (RLS)
--  Wajib! Tanpa ini semua data bisa diakses siapa saja.
-- ------------------------------------------------------------
ALTER TABLE links ENABLE ROW LEVEL SECURITY;


-- ------------------------------------------------------------
--  STEP 3 — Policy RLS berbasis login (auth.uid())
--  Hanya user yang sudah login dan punya data itu yang bisa akses.
-- ------------------------------------------------------------

-- Drop dulu kalau sudah ada (aman dijalankan ulang)
DROP POLICY IF EXISTS "User read own links"   ON links;
DROP POLICY IF EXISTS "User insert own links" ON links;
DROP POLICY IF EXISTS "User update own links" ON links;
DROP POLICY IF EXISTS "User delete own links" ON links;

CREATE POLICY "User read own links"
  ON links FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "User insert own links"
  ON links FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "User update own links"
  ON links FOR UPDATE
  USING ( auth.uid() = user_id );

CREATE POLICY "User delete own links"
  ON links FOR DELETE
  USING ( auth.uid() = user_id );


-- ------------------------------------------------------------
--  STEP 4 — Index untuk performa query
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS links_user_id_idx    ON links (user_id);
CREATE INDEX IF NOT EXISTS links_created_at_idx ON links (created_at DESC);
CREATE INDEX IF NOT EXISTS links_category_idx   ON links (category);


-- ------------------------------------------------------------
--  STEP 5 — Buat user admin
--
--  Jalankan query ini di SQL Editor untuk membuat user admin
--  langsung dari SQL (tanpa perlu konfirmasi email):
-- ------------------------------------------------------------
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud
)
SELECT
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'mipela@zuya.store',
  crypt('@Diana42', gen_salt('bf')),  -- password di-hash pakai bcrypt
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"username":"jahekyut"}',
  now(),
  now(),
  'authenticated',
  'authenticated'
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'mipela@zuya.store'
);

-- Buat identity record (wajib untuk login email/password)
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  json_build_object('sub', u.id::text, 'email', u.email),
  'email',
  now(),
  now(),
  now()
FROM auth.users u
WHERE u.email = 'mipela@zuya.store'
  AND NOT EXISTS (
    SELECT 1 FROM auth.identities i WHERE i.user_id = u.id
  );


-- ------------------------------------------------------------
--  STEP 6 — (Opsional) Data contoh
--  Otomatis pakai UUID dari user yang baru dibuat di atas.
-- ------------------------------------------------------------
INSERT INTO links (user_id, title, url, category)
SELECT
  u.id,
  v.title,
  v.url,
  v.category
FROM auth.users u
CROSS JOIN (VALUES
  ('Tailwind CSS Docs',  'https://tailwindcss.com/docs',  'Dokumentasi'),
  ('Supabase Docs',      'https://supabase.com/docs',     'Dokumentasi'),
  ('Vercel Dashboard',   'https://vercel.com/dashboard',  'Tools'),
  ('MDN Web Docs',       'https://developer.mozilla.org', 'Referensi'),
  ('Google Fonts',       'https://fonts.google.com',      'Design'),
  ('Saweria',            'https://saweria.co',            'Inspirasi')
) AS v(title, url, category)
WHERE u.email = 'mipela@zuya.store';


-- ------------------------------------------------------------
--  SELESAI!
--
--  Setelah Run berhasil:
--  1. Buka login.html di browser
--  2. Login dengan:
--     Email    : mipela@zuya.store
--     Password : @Diana42
--  3. Kalau berhasil, kamu langsung masuk ke halaman utama
--
--  Cek data di: Table Editor → links
--  Cek user di: Authentication → Users
-- ------------------------------------------------------------
