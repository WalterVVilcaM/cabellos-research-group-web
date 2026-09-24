# VIEW-003 — Investigación / Research

## Estado
`APPROVED` (estructura) — implementación en Fase 7

## Objetivo
Dar una visión estructurada de las líneas de investigación.

## Usuarios principales
Académicos y estudiantes.

## Ruta ES
`/investigacion/`

## Ruta EN
`/en/research/`

## Secciones (jerarquía)
1. **Page header** con entradilla.
2. **Lista de líneas**: artículos grandes alternados (ilustración + número + título + resumen + palabras clave + nº de publicaciones + enlace).
3. **Vínculo a publicaciones**: banda hacia `/publicaciones/`.

## Componentes
PageHeader, ResearchFeature, Tag, CtaBand

## Responsive
Desktop: cada línea en 2 columnas (ilustración 5/12, texto 7/12). Móvil: ilustración arriba (ratio 16:9), texto debajo.

## Accesibilidad
Un solo `h1`; jerarquía h2/h3 sin saltos; landmarks `header/nav/main/footer`; foco visible; contraste AA; enlaces externos con texto accesible "(abre sitio externo)".

## SEO
`title` = `<Título de página> · Cabellos Research Group`; `description` propia por idioma; canonical, `hreflang` es/en/x-default; Open Graph.

## Estados vacíos
Sin líneas: mensaje neutro (no debería ocurrir; el schema exige al menos una).

## Casos extremos
Muchas palabras clave: se muestran máximo 5.

## Criterios de aceptación
- Cumple la Definition of Done de vista (orquestador §7.3).
- Sin overflow horizontal entre 320 y 1920 px.
- Navegable completo por teclado.
- Build sin errores.

## Decisiones abiertas
Ninguna estructural. El contenido depende de la matriz de faltantes (`03-content-inventory.md`).
