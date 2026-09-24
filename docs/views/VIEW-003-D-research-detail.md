# VIEW-003-D — Detalle de investigación

## Estado
`APPROVED` (estructura) — implementación en Fase 7

## Objetivo
Profundizar en una línea: qué problema aborda, cómo, quién la trabaja y qué ha producido.

## Usuarios principales
Académicos.

## Ruta ES
`/investigacion/[slug]/`

## Ruta EN
`/en/research/[slug]/`

## Secciones (jerarquía)
1. **Breadcrumb**.
2. **Header**: número de línea, `h1`, resumen, palabras clave.
3. **Ilustración** decorativa.
4. **Descripción** (Markdown por idioma).
5. **Integrantes relacionados** (MemberCard compacto).
6. **Publicaciones relacionadas**: lista completa de la línea.
7. **Otras líneas**: navegación a las 3 restantes.

## Componentes
Breadcrumb, PageHeader, Prose, MemberCard (compact), PublicationItem, ResearchCard

## Responsive
Desktop: prosa 8/12 + `aside` 4/12 con integrantes y palabras clave (sticky ≥ 1100 px). Móvil: una columna; aside después de la prosa.

## Accesibilidad
Un solo `h1`; jerarquía h2/h3 sin saltos; landmarks `header/nav/main/footer`; foco visible; contraste AA; enlaces externos con texto accesible "(abre sitio externo)".

## SEO
`title` = `<Título de página> · Cabellos Research Group`; `description` propia por idioma; canonical, `hreflang` es/en/x-default; Open Graph.

## Estados vacíos
Sin integrantes o sin publicaciones: se omite el bloque correspondiente.

## Casos extremos
Títulos largos de publicaciones y DOI largos cortan línea (`overflow-wrap: anywhere`).

## Criterios de aceptación
- Cumple la Definition of Done de vista (orquestador §7.3).
- Sin overflow horizontal entre 320 y 1920 px.
- Navegable completo por teclado.
- Build sin errores.

## Decisiones abiertas
Ninguna estructural. El contenido depende de la matriz de faltantes (`03-content-inventory.md`).
