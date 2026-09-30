# ADR-008 — Modelo de contenido de Notes (Content Collection `notes`)

## Estado
Aprobado. Parte de NOTES-F0 (`docs/13-notes-editorial-module.md`). **Reemplazado en parte por ADR-011** (2026-09-29): las notas viven en Cloudflare D1, no en `src/content/notes/`. Siguen vigentes los campos, las categorías en configuración, la regla de `rights` y las notas de prueba.

## Contexto
El responsable técnico aprobó el 2026-09-29 una sección editorial pública, **Notes / Notas**, para la V1 (registro de cambio Tipo C en la especificación, §0.2). En la V1 el sitio sigue siendo estático en GitHub Pages; más adelante (Etapa B) las notas se administrarán con un CRUD sobre Cloudflare D1 + R2. El modelo de la V1 debe poder migrarse a D1 sin rediseñar las vistas.

## Decisión
1. Cada nota es un archivo `src/content/notes/<slug>.md` con frontmatter validado por Zod en `src/content.config.ts` (colección `notes`, loader `glob`). El nombre del archivo es el slug.
2. Campos: `title`, `lang` (`en | es`), `summary`, `author` (referencia a `members`), `category` (`opinion | readings | books`), `tags`, `status` (`draft | published | archived`), `isTest`, `featured`, `publishedAt`, `updatedAt?`, `cover?` (`image()` + `alt`), `researchAreas` (referencias a `research`), `translationOf?` (referencia a `notes`), `links[]` (`title`, `url` http/https, `kind`, `description?`), `attachments[]` (`title`, `file`, `rights`, `description?`).
3. Las categorías viven en `src/config/notes.ts` con nombre y slug por idioma; la nota solo guarda el identificador.
4. Los adjuntos están en `public/files/notes/<año>/`. La nota guarda la ruta relativa; `getNotes()` construye la URL con `withBase()` y calcula el tamaño leyendo el archivo en el build. El build falla si el archivo no existe, no es `.pdf`, supera 20 MB o tiene un nombre fuera de la regla (minúsculas, números, guiones).
5. `rights` es obligatorio en cada adjunto (`open-access | public-domain | author | permission`). Sin derecho de distribución no se sube el PDF: se usa un enlace.
6. **Notas de prueba:** `isTest: true`. Solo se incluyen si `import.meta.env.DEV` o `SHOW_TEST_NOTES=true` (se define en el despliegue de vista previa de GitHub Pages). Llevan la etiqueta visible "Test" y `noindex`. Sus PDF viven en `public/files/notes/test/`.
7. Solo `status: published` genera páginas y entra en listados; `draft` y `archived` no.
8. Toda la lectura pasa por `getNotes()` / `getNoteBySlug()` en `src/utils/content.ts`, que entregan objetos ya normalizados (autor, categoría y URLs resueltos). Las vistas no leen la colección directamente.

## Alternativas consideradas
- Textos por idioma en `texts/<lang>/notes/` como los integrantes: obligaría a duplicar o traducir cada nota; contradice ADR-009.
- YAML único con todas las notas: incómodo para textos largos en Markdown.
- CMS externo (Decap, Tina, etc.): añade dependencia y login; el CRUD ya está previsto en la Etapa B con Cloudflare.

## Consecuencias positivas
- Sin dependencias nuevas; validación en build (referencias, URLs, archivos, derechos).
- Los campos coinciden con las tablas previstas en D1 (especificación §26–§31), así que la migración es un script.

## Consecuencias negativas
- En la V1 cada nota la publica el responsable técnico con un commit.
- Los PDF aumentan el tamaño del repositorio; se limita a 20 MB por archivo.

## Impacto
Nueva colección `notes`, `src/config/notes.ts`, funciones en `src/utils/content.ts`, carpeta `public/files/notes/`, variable `SHOW_TEST_NOTES` en `.github/workflows/deploy.yml`.

## Fecha
2026-09-29
