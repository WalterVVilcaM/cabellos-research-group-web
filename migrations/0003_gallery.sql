-- Galería administrable desde el panel (ADR-015). Fotos en R2 (bucket de Notes, prefijo gallery/).
-- El Worker también ejecuta este archivo (src/utils/gallery.ts → ensureGallery) porque en producción
-- no siempre hay Wrangler a mano: por eso todo es IF NOT EXISTS y se puede correr varias veces.
-- Reglas para que el Worker lo pueda ejecutar: sin punto y coma dentro de los comentarios.

CREATE TABLE IF NOT EXISTS gallery_photos (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  seed_id            TEXT UNIQUE,                       -- fotos importadas de public/gallery-seed (si no, NULL)
  lang               TEXT NOT NULL CHECK (lang IN ('es', 'en')),   -- idioma en que se escribió
  caption_es         TEXT,
  caption_en         TEXT,
  alt_es             TEXT,
  alt_en             TEXT,
  place_es           TEXT,
  place_en           TEXT,
  year               INTEGER NOT NULL CHECK (year BETWEEN 1900 AND 2100),
  taken_on           TEXT,                              -- YYYY-MM-DD opcional (ordena dentro del año)
  credit             TEXT NOT NULL CHECK (length(credit) > 0),
  source_url         TEXT CHECK (source_url IS NULL OR source_url LIKE 'https://%' OR source_url LIKE 'http://%'),
  license            TEXT NOT NULL DEFAULT 'none' CHECK (license IN ('none', 'cc-by-4.0', 'cc-by-sa-4.0', 'cc0')),
  rights             TEXT NOT NULL CHECK (rights IN ('own', 'permission', 'open-license')),
  focus              TEXT NOT NULL DEFAULT 'center' CHECK (focus IN ('center', 'top', 'bottom')),
  status             TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  image_key          TEXT NOT NULL,                     -- clave en R2 de la foto grande
  thumb_key          TEXT NOT NULL,                     -- clave en R2 de la miniatura (puede ser la misma)
  width              INTEGER NOT NULL CHECK (width > 0),
  height             INTEGER NOT NULL CHECK (height > 0),
  thumb_width        INTEGER NOT NULL CHECK (thumb_width > 0),
  mime_type          TEXT NOT NULL CHECK (mime_type IN ('image/webp', 'image/jpeg', 'image/png')),
  size_bytes         INTEGER NOT NULL CHECK (size_bytes > 0),  -- foto grande + miniatura
  original_filename  TEXT,
  created_at         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  created_by         TEXT,
  CHECK ((lang = 'es' AND caption_es IS NOT NULL AND alt_es IS NOT NULL)
      OR (lang = 'en' AND caption_en IS NOT NULL AND alt_en IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS idx_gallery_listing ON gallery_photos (status, year DESC, taken_on DESC, id DESC);

-- Banderas sencillas del sitio (p. ej. gallery_seeded = las fotos iniciales ya se importaron).
CREATE TABLE IF NOT EXISTS site_flags (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
