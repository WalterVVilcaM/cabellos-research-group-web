-- Notas de PRUEBA para NOTES-F3 (is_test = 1). Idempotente: borra y vuelve a crear solo las notas de prueba.
-- Solo se muestran con SHOW_TEST_NOTES="true" (vars de wrangler.jsonc). Antes del lanzamiento: ver Gate 8.
-- Local:  npm run db:seed:local    Remoto: npx wrangler d1 execute DB --remote --file seeds/test-notes.sql
DELETE FROM note_tags WHERE note_id IN (SELECT id FROM notes WHERE is_test = 1);
DELETE FROM external_links WHERE note_id IN (SELECT id FROM notes WHERE is_test = 1);
DELETE FROM attachments WHERE note_id IN (SELECT id FROM notes WHERE is_test = 1);
DELETE FROM notes WHERE is_test = 1;

INSERT OR IGNORE INTO tags (name, normalized_name) VALUES ('Books', 'books');
INSERT OR IGNORE INTO tags (name, normalized_name) VALUES ('DFT', 'dft');
INSERT OR IGNORE INTO tags (name, normalized_name) VALUES ('Layout', 'layout');
INSERT OR IGNORE INTO tags (name, normalized_name) VALUES ('Markdown', 'markdown');
INSERT OR IGNORE INTO tags (name, normalized_name) VALUES ('Prueba', 'prueba');
INSERT OR IGNORE INTO tags (name, normalized_name) VALUES ('Test', 'test');

INSERT INTO notes (slug, lang, title, summary, content, author_id, category, status, is_test, featured, research_areas, published_at, revised_at, created_by) VALUES ('test-note-book-with-pdf', 'en', 'Test note — book recommendation with a PDF file', 'Test note to review a book recommendation with a downloadable PDF and a link to the publisher.', 'This is a **test note**. It checks how a book recommendation looks with a file attached. It does not express any opinion by Dr. Cabellos.

A PDF is only uploaded when the group has the right to share it (open access, public domain, the author''s own work or explicit permission). Otherwise the note links to the publisher.
', 'jose-luis-cabellos', 'books', 'published', 1, 0, '[]', '2026-09-20', '2026-09-27', 'seed');
INSERT INTO note_tags (note_id, tag_id, position) SELECT n.id, t.id, 0 FROM notes n, tags t WHERE n.slug = 'test-note-book-with-pdf' AND t.normalized_name = 'test';
INSERT INTO note_tags (note_id, tag_id, position) SELECT n.id, t.id, 1 FROM notes n, tags t WHERE n.slug = 'test-note-book-with-pdf' AND t.normalized_name = 'books';
INSERT INTO external_links (note_id, title, url, kind, description, position) SELECT id, 'Publisher page (example link)', 'https://example.org/book', 'book', 'Placeholder link; a real note would point to the publisher or catalogue.', 0 FROM notes WHERE slug = 'test-note-book-with-pdf';
INSERT INTO attachments (note_id, title, description, original_filename, storage_key, size_bytes, rights, position, created_by) SELECT id, 'Sample PDF', 'A one-page file created only to test the Open and Download buttons.', 'test-note-sample.pdf', 'static:test/test-note-sample.pdf', 1753, 'author', 0, 'seed' FROM notes WHERE slug = 'test-note-book-with-pdf';

INSERT INTO notes (slug, lang, title, summary, content, author_id, category, status, is_test, featured, research_areas, published_at, revised_at, created_by) VALUES ('test-note-draft', 'en', 'Test note — draft (must never appear)', 'Draft test note: it must not appear in any list or page.', 'If you can read this on the site, draft filtering is broken.
', 'jose-luis-cabellos', 'opinion', 'draft', 1, 0, '[]', '2026-09-29', NULL, 'seed');

INSERT INTO notes (slug, lang, title, summary, content, author_id, category, status, is_test, featured, research_areas, published_at, revised_at, created_by) VALUES ('test-note-long-title', 'en', 'Test note — a deliberately long title to check how the layout wraps across several lines on small screens', 'Test note with a long title and several Markdown elements: subheadings, lists, a quote, a table and a very long link, to check the reading column.', 'This is a **test note** with placeholder text. It does not express any opinion by Dr. Cabellos.

## A second-level heading

Paragraphs keep a comfortable reading width. *Italics*, **bold** and [an internal-style link](https://example.org/) should all be readable.

### A third-level heading

1. First numbered item.
2. Second numbered item, a little longer so that it wraps onto a second line on narrow screens.
3. Third item.

> A block quote to check its style. Placeholder text only.

| Column A | Column B |
|---|---|
| Value 1 | Value 2 |
| Value 3 | Value 4 |

A very long link that must not overflow the page: https://example.org/a/very/long/path/that/keeps/going/and/going/to/test/overflow-wrap/in/the/reading/column

---

End of the test note.
', 'jose-luis-cabellos', 'opinion', 'published', 1, 0, '[]', '2026-09-12', NULL, 'seed');
INSERT INTO note_tags (note_id, tag_id, position) SELECT n.id, t.id, 0 FROM notes n, tags t WHERE n.slug = 'test-note-long-title' AND t.normalized_name = 'test';
INSERT INTO note_tags (note_id, tag_id, position) SELECT n.id, t.id, 1 FROM notes n, tags t WHERE n.slug = 'test-note-long-title' AND t.normalized_name = 'layout';
INSERT INTO note_tags (note_id, tag_id, position) SELECT n.id, t.id, 2 FROM notes n, tags t WHERE n.slug = 'test-note-long-title' AND t.normalized_name = 'markdown';

INSERT INTO notes (slug, lang, title, summary, content, author_id, category, status, is_test, featured, research_areas, published_at, revised_at, created_by) VALUES ('test-note-reading-links', 'es', 'Nota de prueba — lectura recomendada con enlaces', 'Nota de prueba para revisar una recomendación de lectura con enlace al DOI y a la versión de acceso abierto.', 'Esta es una **nota de prueba**. Sirve para revisar cómo se ve una recomendación de lectura en español, con enlaces al final. No expresa ninguna opinión del Dr. Cabellos.

## Qué se revisa

- La etiqueta de categoría y la etiqueta de idioma cuando la interfaz está en inglés.
- La lista de enlaces con su tipo (DOI, acceso abierto).
- La relación con una línea de investigación.

El texto real lo escribirá el Dr. Cabellos.
', 'jose-luis-cabellos', 'readings', 'published', 1, 1, '["optical-properties"]', '2026-09-28', NULL, 'seed');
INSERT INTO note_tags (note_id, tag_id, position) SELECT n.id, t.id, 0 FROM notes n, tags t WHERE n.slug = 'test-note-reading-links' AND t.normalized_name = 'prueba';
INSERT INTO note_tags (note_id, tag_id, position) SELECT n.id, t.id, 1 FROM notes n, tags t WHERE n.slug = 'test-note-reading-links' AND t.normalized_name = 'dft';
INSERT INTO external_links (note_id, title, url, kind, description, position) SELECT id, 'Artículo del grupo en The Journal of Physical Chemistry C (2012)', 'https://doi.org/10.1021/jp3004213', 'doi', 'Enlace de ejemplo a una publicación real del grupo.', 0 FROM notes WHERE slug = 'test-note-reading-links';
INSERT INTO external_links (note_id, title, url, kind, description, position) SELECT id, 'Versión de acceso abierto en arXiv', 'https://arxiv.org/abs/1308.5277', 'open-access', NULL, 1 FROM notes WHERE slug = 'test-note-reading-links';

INSERT INTO notes (slug, lang, title, summary, content, author_id, category, status, is_test, featured, research_areas, published_at, revised_at, created_by) VALUES ('test-note-short', 'es', 'Nota de prueba — opinión breve', 'Nota de prueba muy corta, sin enlaces ni archivos.', 'Nota de prueba breve para revisar una nota sin enlaces, archivos ni etiquetas.
', 'jose-luis-cabellos', 'opinion', 'published', 1, 0, '[]', '2026-09-05', NULL, 'seed');
