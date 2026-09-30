-- Notes / Notas — esquema editorial en Cloudflare D1 (NOTES-F3, ADR-011).
-- Especificación: docs/13-notes-editorial-module.md §26–§34.
-- Toda modificación del esquema va en una migración nueva (§131); nunca se edita esta.

-- Autores: vinculados a un integrante de src/content/data/members.yaml (member_slug).
-- El correo sirve para relacionar la sesión de Cloudflare Access con el autor (NOTES-F5/F6).
CREATE TABLE authors (
  id          TEXT PRIMARY KEY,                      -- = member_slug
  email       TEXT UNIQUE,
  active      INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE notes (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  slug             TEXT NOT NULL UNIQUE
                   CHECK (slug GLOB '[a-z0-9]*' AND slug NOT GLOB '*[^a-z0-9-]*'
                          AND slug NOT IN ('page', 'pagina', 'category', 'categoria')),
  lang             TEXT NOT NULL CHECK (lang IN ('en', 'es')),
  translation_of   INTEGER REFERENCES notes(id) ON DELETE SET NULL,
  title            TEXT NOT NULL CHECK (length(title) > 0),
  summary          TEXT NOT NULL CHECK (length(summary) BETWEEN 1 AND 320),
  content          TEXT NOT NULL DEFAULT '',          -- Markdown
  author_id        TEXT NOT NULL REFERENCES authors(id),
  category         TEXT NOT NULL CHECK (category IN ('opinion', 'readings', 'books')),
  status           TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_test          INTEGER NOT NULL DEFAULT 0 CHECK (is_test IN (0, 1)),
  featured         INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  cover_key        TEXT,                              -- ruta del archivo (estático hoy, R2 en NOTES-F4)
  cover_alt        TEXT,
  research_areas   TEXT NOT NULL DEFAULT '[]',        -- JSON: ids de src/content/data/research.yaml
  published_at     TEXT NOT NULL,                     -- YYYY-MM-DD (UTC)
  revised_at       TEXT,                              -- fecha de actualización visible (opcional)
  seo_title        TEXT,
  seo_description  TEXT,
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  created_by       TEXT
);

CREATE INDEX idx_notes_listing  ON notes (status, is_test, published_at DESC);
CREATE INDEX idx_notes_category ON notes (category, status, published_at DESC);

CREATE TABLE tags (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  name             TEXT NOT NULL,
  normalized_name  TEXT NOT NULL UNIQUE                -- minúsculas y sin acentos (evita DFT/dft/Dft)
);

CREATE TABLE note_tags (
  note_id  INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag_id   INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (note_id, tag_id)
);

CREATE TABLE external_links (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  note_id      INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  url          TEXT NOT NULL CHECK (url LIKE 'https://%' OR url LIKE 'http://%'),
  kind         TEXT NOT NULL DEFAULT 'other' CHECK (kind IN ('doi', 'publisher', 'open-access', 'book', 'other')),
  description  TEXT,
  position     INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_links_note ON external_links (note_id, position);

CREATE TABLE attachments (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  note_id            INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  title              TEXT NOT NULL,
  description        TEXT,
  original_filename  TEXT NOT NULL,
  storage_key        TEXT NOT NULL,                    -- "static:<ruta>" hoy; clave de R2 en NOTES-F4
  mime_type          TEXT NOT NULL DEFAULT 'application/pdf' CHECK (mime_type = 'application/pdf'),
  size_bytes         INTEGER NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 20971520),
  rights             TEXT NOT NULL CHECK (rights IN ('open-access', 'public-domain', 'author', 'permission')),
  position           INTEGER NOT NULL DEFAULT 0,
  created_at         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  created_by         TEXT
);

CREATE INDEX idx_attachments_note ON attachments (note_id, position);

-- Autor principal.
INSERT INTO authors (id, email) VALUES ('jose-luis-cabellos', 'jose.luis@uptapachula.edu.mx');
