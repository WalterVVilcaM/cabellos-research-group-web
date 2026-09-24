# VIEW-001 — Home

## Estado
`APPROVED` (estructura) — implementación en Fase 7

## Objetivo
Responder en segundos quién es el grupo, qué investiga, quién lo dirige y qué produce, y llevar al contenido profundo.

## Usuarios principales
Visitantes académicos, estudiantes potenciales, evaluadores institucionales.

## Ruta ES
`/`

## Ruta EN
`/en/`

## Secciones (jerarquía) — v1.4
1. **Hero** (fondo blanco puro): institución, `h1`, nombre descriptivo + propósito, botones "Nuestra investigación" / "Publicaciones". A la derecha, carrusel fotográfico (`PhotoCarousel`) con esquinas redondeadas, sombra y un bloque verde desplazado detrás; pie superpuesto sobre la foto (01/05, texto, año, crédito y marcas de progreso). Sin botón reproducir/pausar. Tarjeta flotante del investigador principal (foto, cargo, SNII) que enlaza a su perfil.
2. **Líneas de investigación**: 4 tarjetas con sombra (2 × 2) con la figura publicada de cada línea, número, título, resumen y crédito de la figura (CC BY 4.0).
3. **Publicaciones recientes**: las 3 más recientes (revista, año, título con DOI, autores) y enlace a todas.

*v1.4 (2026-09-24): se quitan ilustraciones generadas por código (`MolecularArt`) en todo el sitio, se usa blanco puro (sin bandas tintadas) y sombras para separar bloques. v1.3 retiró la repetición de las líneas y las figuras del carrusel. Fotos provisionales de uptapachula.edu.mx (crédito UPTap) en `src/config/gallery.ts`.*

## Componentes
SectionHeader, PhotoCarousel, Button, Icon, RichText

## Responsive
Hero: 2 columnas 5/7 (≥ 900 px), o apilado (texto → foto → tarjeta del PI). Tarjetas de líneas: 2 columnas (≥ 900 px) o 1 (figura arriba ≤ 560 px). Publicaciones recientes: 3 columnas (≥ 900 px) o 1.

## Accesibilidad
Un solo `h1`; jerarquía h2/h3 sin saltos; landmarks `header/nav/main/footer`; foco visible; contraste AA; enlaces externos con texto accesible "(abre sitio externo)".

## SEO
`title` = `<Título de página> · Cabellos Research Group`; `description` propia por idioma; canonical, `hreflang` es/en/x-default; Open Graph.

## Estados vacíos
Si `heroGallery` está vacío se omite el carrusel; con una sola foto se ocultan las marcas.

## Casos extremos
Los títulos largos de líneas pasan a 3 líneas sin romper el grid (alineación superior).

## Criterios de aceptación
- Cumple la Definition of Done de vista (orquestador §7.3).
- Sin overflow horizontal entre 320 y 1920 px.
- Navegable completo por teclado.
- Build sin errores.

## Decisiones abiertas
Ninguna estructural. El contenido depende de la matriz de faltantes (`03-content-inventory.md`).
