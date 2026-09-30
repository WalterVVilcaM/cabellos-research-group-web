# ADR-011 — Notes en Cloudflare D1 y renderizado bajo demanda

## Estado
Aprobado (D-N8). Implementación: NOTES-F3. Reemplaza en parte a ADR-008 (la fuente de las notas deja de ser la colección Markdown).

## Contexto
El Dr. Cabellos publicará notas desde un panel (NOTES-F5) sin tocar el repositorio. Las notas deben verse al instante, sin recompilar el sitio, y los borradores no deben quedar en el repositorio público. El sitio ya se sirve desde Cloudflare Workers (ADR-010).

## Decisión
1. **Base de datos:** Cloudflare D1 `cabellos-notes` (binding `DB`), ubicación `wnam`. La crea `scripts/cf-setup-d1.mjs`, que escribe su id en `wrangler.jsonc`.
2. **Esquema versionado** en `migrations/` (`0001_notes_schema.sql`): `authors`, `notes`, `tags`, `note_tags`, `external_links`, `attachments`, con restricciones (`CHECK`, `UNIQUE`, claves foráneas con borrado en cascada) e índices para los listados. Todo cambio va en una migración nueva.
3. **Categorías** siguen en `src/config/notes.ts` (no en una tabla): son fijas y traducidas; la columna `notes.category` las restringe con `CHECK`.
4. **Autores** enlazados a los integrantes de `members.yaml` por id; la tabla guarda el correo para relacionarlo con Cloudflare Access (NOTES-F6).
5. **Rutas de Notes bajo demanda** (`export const prerender = false`) con el adaptador `@astrojs/cloudflare` (sin sesiones ni Cloudflare Images). El resto del sitio sigue prerenderizado. Las consultas están paginadas (`LIMIT/OFFSET`, 10 por página) y agrupadas con `batch`.
6. **Cuerpo en Markdown**, convertido a HTML con `micromark` + GFM, que no deja pasar HTML crudo ni protocolos peligrosos (`javascript:`). Los `#` se degradan a `h2` (el título es el único `h1`).
7. **Notas de prueba** en D1 (`is_test = 1`), cargadas con `seeds/test-notes.sql` (idempotente). Se muestran solo si la variable del Worker `SHOW_TEST_NOTES` es `"true"`.
8. **404** de rutas inexistentes: se sirve la página estática `404.html` desde los assets con estado 404.
9. **Sitemap:** `/sitemap-notes.xml` (bajo demanda) con el listado, las categorías con notas reales y la URL canónica de cada nota; nunca notas de prueba. Referenciado en `robots.txt`.
10. **Archivos:** hasta NOTES-F4 los adjuntos usan `storage_key = "static:<ruta>"` (en `public/files/notes/`); en NOTES-F4 pasan a R2.
11. **GitHub Pages** deja de actualizarse (no puede ejecutar rutas bajo demanda). `deploy.yml` se reemplaza por `publications.yml`, que solo busca publicaciones y las guarda en `main`.

## Alternativas consideradas
- Seguir con Markdown en el repositorio: requiere commit por nota, deja borradores públicos y hace crecer el repo con PDF.
- Prerenderizar las notas leyendo D1 durante el build: cada nota exigiría recompilar y desplegar.
- Mantener GitHub Pages en paralelo con un modo estático: duplica la lógica y la vista previa quedaría sin notas.

## Consecuencias positivas
- Publicar, editar o despublicar se ve al instante; el panel solo escribe en D1.
- Validación en dos niveles: restricciones en la base y validación en el servidor (NOTES-F5).
- Uso muy inferior a la cuota gratuita (5 M filas leídas/día; ~200 visitas/mes).

## Consecuencias negativas
- Las páginas de Notes dependen del Worker y de D1 (si D1 falla, Notes muestra error; el resto del sitio sigue estático).
- GitHub Pages queda congelado; la vista previa oficial pasa a `*.workers.dev`.
- Nuevas dependencias: `@astrojs/cloudflare`, `micromark`, `micromark-extension-gfm`, `@cloudflare/workers-types` (tipos).

## Impacto
`astro.config.mjs`, `wrangler.jsonc` (D1, `vars`), `migrations/`, `seeds/`, `scripts/cf-setup-d1.mjs`, `src/utils/notes.ts`, `src/env.d.ts`, rutas de `src/pages/notes/` y `src/pages/es/notas/`, `src/pages/sitemap-notes.xml.ts`, `public/robots.txt`, `.github/workflows/`. Se elimina la colección `notes` y `src/content/notes/`.

## Fecha
2026-09-29
