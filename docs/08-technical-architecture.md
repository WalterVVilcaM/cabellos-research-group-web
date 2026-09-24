# 08 — Arquitectura técnica

| Campo | Valor |
|---|---|
| Fase | 5 — Arquitectura técnica y modelo de datos |
| Versión | 1.0 |
| Fecha | 2026-09-23 |
| Estado | `APPROVED` |

---

## 1. Stack

| Pieza | Versión | Rol |
|---|---|---|
| Node.js | ≥ 22.12 | Runtime de build |
| Astro | 7.3.x | SSG, routing, i18n, Content Collections, Fonts API, `astro:assets` |
| TypeScript | 6.x (preset `astro/tsconfigs/strict`) | Tipado; `npm run check` |
| `@astrojs/sitemap` | 3.7.x | `sitemap-index.xml` con alternates ES/EN |
| `@astrojs/check` | 0.9.x (dev) | Diagnóstico de tipos en `.astro` |

**Sin React** (ADR-001): ninguna interacción de v1 lo justifica. El JS en cliente es TypeScript de mejora progresiva, empaquetado por Astro (≤ 10 KB por página, ADR-006).

## 2. Árbol de `src/`

```text
src/
├── assets/fonts/          fuentes woff2 autoalojadas (OFL) + licencias
├── assets/research/       figuras CC BY de portada (ADR-006)
├── scripts/enhance.ts     mejoras progresivas globales
├── components/
│   ├── global/            Header, Footer, Seo, LanguageSwitcher, BrandMark
│   ├── ui/                Button, Tag, Icon, Breadcrumb, PageHeader, SectionHeader,
│   │                      CtaBand, ExternalLink, RichText, Carousel
│   └── content/           ResearchCard, ResearchFeature, MemberCard, Avatar,
│                          PublicationItem, StatList, MethodSteps, MolecularArt,
│                          ResearchFigure, FeaturedPub
├── config/site.ts         identidad, institución, contacto (fuente única)
├── content/               datos y textos (ver 07-content-model.md)
├── content.config.ts      schemas y loaders
├── i18n/
│   ├── ui.ts              diccionario ES/EN tipado
│   └── utils.ts           t(), rutas por idioma, alternates
├── layouts/BaseLayout.astro
├── pages/                 rutas finas (solo eligen vista + idioma)
├── styles/                tokens.css, global.css
├── utils/content.ts       consultas, relaciones inversas, métricas
└── views/                 una vista por VIEW-ID, parametrizada por idioma
```

**`src/views/`** no estaba en el árbol del orquestador (§19). Se agrega (ADR-003) para que cada vista exista una sola vez y las rutas ES/EN sean envoltorios de 5 líneas. Así se evita duplicar las páginas por idioma.

## 3. Routing

- `i18n: { locales: ['en','es'], defaultLocale: 'en', routing: { prefixDefaultLocale: false } }` (ADR-007: EN en la raíz, ES en `/es/`).
- `trailingSlash: 'always'` y `build.format: 'directory'`: URLs canónicas con `/` final y compatibles con Cloudflare Pages.
- Rutas dinámicas con `getStaticPaths`: `research/[slug]` y `es/investigacion/[slug]` usan `slug.en` y `slug.es`; `team/[slug]` y `es/integrantes/[slug]` usan la clave del integrante.
- Rutas de sección centralizadas en `i18n/utils.ts → sectionPaths` (congeladas).

## 4. i18n

- `ui.ts` define `es` como fuente y `en` con el tipo `Record<UiKey, string>`: **una clave faltante en EN es un error de compilación**.
- Cada página pasa `alternates` ({es, en}) al layout, y de ahí salen los `hreflang`, el selector de idioma y el sitemap.
- `lang` del documento: `en` / `es-MX`. `hreflang="x-default"` → EN.
- 404 única y bilingüe, primero en inglés (Cloudflare Pages sirve `404.html` para cualquier ruta).

## 5. SEO

| Elemento | Implementación |
|---|---|
| `<title>` | `<Página> · Cabellos Research Group` (en el Home, solo la marca con el lema) |
| description | Por vista (i18n) o `summary` de la entidad |
| canonical | `Astro.site` + ruta |
| hreflang | `es`, `en`, `x-default` (→ ES) |
| Open Graph / Twitter | `og:*`, `summary_large_image`, imagen `public/og-image.png` 1200×630 |
| sitemap | `@astrojs/sitemap` (excluye 404) |
| robots | `public/robots.txt` |
| 404 | `noindex` |
| JSON-LD | Pospuesto: se evaluará con los datos validados (orquestador §24.1) |

## 6. Imágenes

- Fotos de personas: `src/assets/members/<id>.jpg` y `astro:assets <Image>` (AVIF/WebP, `width` y `height` explícitos, `srcset` 1×/2×). Sin foto: avatar tipográfico.
- Portadas de líneas: figuras CC BY del PI en `src/assets/research/*.webp`, servidas con `astro:assets` (srcset 340/680 px, WebP) y crédito generado desde la publicación fuente (ADR-006).
- Ilustraciones: SVG en línea generado por `MolecularArt` (0 bytes de imagen y sin peticiones) para encabezados internos y como reserva si una línea no tiene `cover`.
- `public/` solo contiene favicon, OG image y robots.

## 7. Fuentes

Fonts API de Astro con el proveedor `local` y archivos en `src/assets/fonts/` (ADR-005): son 4 woff2 de IBM Plex Sans del subset latin (~95 KB) y solo se precarga el peso 400. Además, Astro genera fallbacks de métricas ajustadas para reducir el CLS. No hay dependencia de red en el build ni en el cliente.

## 8. JavaScript

| Script | Tamaño | Propósito |
|---|---|---|
| `<script is:inline>` en `<head>` | ~50 B | Marca `html.js` antes del primer render (evita CLS del menú) |
| Menú móvil (Header) | ~0.5 KB | `aria-expanded`, Escape devuelve el foco y se cierra al pasar a desktop |
| `Carousel.astro` | ~2.5 KB | Controles, puntos, autoplay pausable, teclado, sincronía con el swipe |
| `scripts/enhance.ts` | ~1.5 KB | `[data-reveal]`, `[data-count]`, botón volver arriba |
| `PublicationsView` | ~1.2 KB | Buscador y filtro por línea |
| `PublicationItem` | ~0.5 KB | Copiar cita al portapapeles |

Medición (2026-09-23): Home 4.9 KB (1.9 KB gzip), Publicaciones 6.1 KB (2.3 KB gzip). Sin JS: el menú se muestra expandido, el carrusel es un scroll horizontal con snap, buscador y botón de copiar se ocultan y todo el contenido es legible.

## 9. Estrategia de errores

- Datos inválidos o referencias rotas → el build falla (Zod + `reference()`).
- Falta el texto largo de una línea → `ResearchDetailView` lanza un error explícito.
- Campos opcionales vacíos → el bloque se omite (nunca se muestra un placeholder).

## 10. Comandos

| Comando | Uso |
|---|---|
| `npm run dev` | Desarrollo (`localhost:4321`) |
| `npm run check` | Tipos y diagnóstico de Astro |
| `npm run build` | Genera `dist/` |
| `npm run preview` | Sirve `dist/` |

## 11. Despliegue (Fase 11)

Cloudflare Pages: build `npm run build`, salida `dist`, `NODE_VERSION=22`. Las redirecciones futuras irán en `public/_redirects`.

## 12. Gate 5

- [x] routing congelado
- [x] i18n congelado
- [x] data model definido
- [x] responsabilidades de componentes definidas
- [x] React evaluado y descartado para v1
- [x] estrategia de imágenes definida
- [x] sin dependencias innecesarias (2 de runtime/build, 2 de desarrollo)
