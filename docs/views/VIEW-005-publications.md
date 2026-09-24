# VIEW-005 — Publicaciones

## Estado
`APPROVED` (estructura) — implementación en Fase 7

## Objetivo
Concentrar la producción científica y facilitar el acceso al DOI.

## Usuarios principales
Académicos y buscadores.

## Ruta ES
`/publicaciones/`

## Ruta EN
`/en/publications/`

## Secciones (jerarquía)
1. **Page header** con total derivado.
2. **Índice**: saltos por año (chips con ancla) y resumen por línea (enlaces a los detalles, con conteo).
3. **Lista por año**: `h2` con el año; ítems numerados globalmente en orden descendente (el más reciente tiene el número mayor).

## Componentes
PageHeader, YearIndex, PublicationItem

## Responsive
Lista de una columna con ancho de lectura (≤ 72ch). Los chips de años se ajustan en varias líneas.

## Accesibilidad
Un solo `h1`; jerarquía h2/h3 sin saltos; landmarks `header/nav/main/footer`; foco visible; contraste AA; enlaces externos con texto accesible "(abre sitio externo)".

## SEO
`title` = `<Título de página> · Cabellos Research Group`; `description` propia por idioma; canonical, `hreflang` es/en/x-default; Open Graph.

## Estados vacíos
Sin publicaciones: mensaje. Publicación sin DOI: enlaza a `url` si existe; si no, no hay enlace.

## Casos extremos
Listas de autores largas (> 15): se muestran completas con `overflow-wrap`; el PI se resalta en negrita.

## Criterios de aceptación
- Cumple la Definition of Done de vista (orquestador §7.3).
- Sin overflow horizontal entre 320 y 1920 px.
- Navegable completo por teclado.
- Build sin errores.

## Decisiones abiertas
Ninguna estructural. El contenido depende de la matriz de faltantes (`03-content-inventory.md`).
