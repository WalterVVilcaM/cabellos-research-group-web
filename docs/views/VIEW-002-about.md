# VIEW-002 — Nosotros / About

## Estado
`APPROVED` (estructura) — implementación en Fase 7

## Objetivo
Explicar la identidad académica: quiénes son, qué enfoque tienen, dónde están adscritos.

## Usuarios principales
Institucionales, evaluadores, colaboradores potenciales.

## Ruta ES
`/nosotros/`

## Ruta EN
`/en/about/`

## Secciones (jerarquía)
1. **Page header**: `h1` "Nosotros", entradilla.
2. **Quiénes somos**: 2–3 párrafos (máx. 70 caracteres por línea).
3. **Enfoque**: lista de principios metodológicos (reutiliza MethodSteps).
4. **Institución**: bloque con UPTap, adscripción y ubicación; enlace externo al sitio institucional.
5. **Producción en cifras**: métricas derivadas (StatList).
6. **Trayectoria**: solo se muestra cuando exista texto validado (hoy oculto).

## Componentes
PageHeader, Prose, MethodSteps, InfoBlock, StatList

## Responsive
Desktop: texto a 2 columnas (prosa 8/12, cifras 4/12 en `aside`). Móvil: una columna, las cifras después de la prosa.

## Accesibilidad
Un solo `h1`; jerarquía h2/h3 sin saltos; landmarks `header/nav/main/footer`; foco visible; contraste AA; enlaces externos con texto accesible "(abre sitio externo)".

## SEO
`title` = `<Título de página> · Cabellos Research Group`; `description` propia por idioma; canonical, `hreflang` es/en/x-default; Open Graph.

## Estados vacíos
Trayectoria ausente: el bloque no se renderiza.

## Casos extremos
No inventar narrativa institucional (orquestador §14).

## Criterios de aceptación
- Cumple la Definition of Done de vista (orquestador §7.3).
- Sin overflow horizontal entre 320 y 1920 px.
- Navegable completo por teclado.
- Build sin errores.

## Decisiones abiertas
Ninguna estructural. El contenido depende de la matriz de faltantes (`03-content-inventory.md`).
