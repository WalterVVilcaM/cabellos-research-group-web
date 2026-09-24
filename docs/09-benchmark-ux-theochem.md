# 09 — Benchmark UX: TheoChemMerida → Cabellos Research Group

| Campo | Valor |
|---|---|
| Versión | 1.0 |
| Fecha | 2026-09-23 |
| Estado | `APPROVED` (aplicado en v1.2 del sistema de diseño) |
| Referencia | theochemmerida.org (solo como referencia de patrones; no se copian layouts, textos ni recursos) |

## 1. Qué hace bien la referencia

| # | Patrón observado | Por qué funciona |
|---|---|---|
| P1 | Portada con imagen científica grande y rotativa | Comunica "qué hacemos" en 2 s, sin leer |
| P2 | Líneas de investigación como primer contenido, con imagen propia | La investigación es protagonista |
| P3 | Paleta blanca con verde en bandas y títulos | Sobria, institucional, legible |
| P4 | Barra/título de color en páginas internas | Orienta al usuario ("dónde estoy") |
| P5 | Publicaciones numeradas y agrupadas por año | Escaneable, crece bien |
| P6 | Perfiles con enlaces académicos (Scholar, ORCID) | Credibilidad verificable |
| P7 | Contacto completo en el pie (correo, teléfono, dirección) | Siempre a un scroll |
| P8 | Sección de colaboradores/red | Muestra alcance del grupo |

## 2. Debilidades de la referencia (y nuestra mejora)

| Debilidad | Mejora aplicada |
|---|---|
| Carrusel sin controles accesibles ni pausa | `Carousel.astro`: botones, puntos, pausa, teclado, `aria-roledescription`, sin autoplay con `prefers-reduced-motion`, degrada a scroll con snap sin JS |
| Imágenes sin crédito ni fuente | Cada figura muestra pie, figura, autores, revista, DOI y licencia generados desde los datos |
| Publicaciones en lista larga sin búsqueda | Buscador instantáneo, filtro por línea con contadores, años con contadores, "copiar cita" |
| Métricas estáticas o ausentes | Cifras calculadas de los datos (publicaciones, años, revistas, coautores) con contador animado |
| Colaboradores escritos a mano | Coautores frecuentes **derivados** de las publicaciones (no se inventan personas) |
| Sin versión EN equivalente | ES/EN completos con `hreflang` |
| Páginas internas sin ruta de navegación | Breadcrumb en todas las páginas internas |

## 3. Patrones aplicados (v1.2)

| Patrón | Dónde | Componente |
|---|---|---|
| Hero con carrusel de figuras reales + accesos a las 4 líneas | Home | `HomeView`, `Carousel`, `ResearchFigure` |
| Tarjetas de línea con figura, número (01–04) y micro-interacción | Home, detalle | `ResearchCard` |
| Banda verde profunda de cifras con contadores | Home | `HomeView` + `enhance.ts` |
| Barra de acento sobre títulos de sección (`.accent-title`) | Global | `SectionHeader`, `global.css` |
| Encabezado interno con barra verde superior, breadcrumb e ilustración | Internas | `PageHeader` |
| Carrusel de trabajos destacados | Publicaciones | `FeaturedPub` |
| Buscador + filtros + copiar cita | Publicaciones | `PublicationsView`, `PublicationItem` |
| Resumen, contacto y coautores frecuentes en el perfil | Perfil | `MemberDetailView`, `coauthorsOf()` |
| Tarjetas de acción (correo, teléfono, mapa) y temas de conversación | Contacto | `ContactView` |
| Aparición al desplazarse y "volver arriba" | Global | `enhance.ts`, `BaseLayout` |

## 4. Contenido provisional (reemplazable)

| Contenido | Origen | Cómo reemplazar |
|---|---|---|
| Portadas de líneas | Figuras CC BY de artículos del PI (ADR-006) | `src/assets/research/` + bloque `cover` en `research.yaml` |
| Trabajos destacados | `featured: true` en 6 publicaciones | Editar `publications.yaml` |
| Temas de contacto | Redacción de desarrollo | `contact.topic.*` en `ui.ts` |
| Cifras | Calculadas | Se actualizan solas al agregar publicaciones |
