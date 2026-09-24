# VIEW-404 — No encontrado

## Estado
`APPROVED` (estructura) — implementación en Fase 7

## Objetivo
Explicar el error y dar salida, en ambos idiomas.

## Usuarios principales
Cualquier visitante.

## Ruta ES
`/404`

## Ruta EN
`— (misma página)`

## Secciones (jerarquía)
1. Código "404" decorativo.
2. `h1` ES + párrafo; bloque EN con `lang="en"`.
3. Enlaces a `/` y `/en/`.
4. Header y footer en ES.

## Componentes
BaseLayout, Button

## Responsive
Centrado, una columna.

## Accesibilidad
Un solo `h1`; jerarquía h2/h3 sin saltos; landmarks `header/nav/main/footer`; foco visible; contraste AA; enlaces externos con texto accesible "(abre sitio externo)".

## SEO
`<meta name="robots" content="noindex">`; sin canonical ni hreflang; excluida del sitemap.

## Estados vacíos
—

## Casos extremos
—

## Criterios de aceptación
- Cumple la Definition of Done de vista (orquestador §7.3).
- Sin overflow horizontal entre 320 y 1920 px.
- Navegable completo por teclado.
- Build sin errores.

## Decisiones abiertas
Ninguna estructural. El contenido depende de la matriz de faltantes (`03-content-inventory.md`).
