# VIEW-004-D — Perfil de integrante

## Estado
`APPROVED` (estructura) — implementación en Fase 7

## Objetivo
Identidad académica profunda y creíble de cada integrante.

## Usuarios principales
Académicos, evaluadores, estudiantes.

## Ruta ES
`/integrantes/[slug]/`

## Ruta EN
`/en/team/[slug]/`

## Secciones (jerarquía)
1. **Breadcrumb**.
2. **Header de perfil**: foto o avatar, grado + nombre (`h1`), rol, afiliación, enlaces (ORCID, Scholar, ResearchGate, Scopus, web, correo) con indicador externo.
3. **Biografía** (Markdown por idioma).
4. **Líneas de investigación** (tags enlazados).
5. **Publicaciones**: las del integrante (todas; las destacadas primero) + enlace a la lista completa.

## Componentes
Breadcrumb, Avatar, IconLink, Prose, Tag, PublicationItem

## Responsive
Desktop: header a 2 columnas (foto 4/12 · datos 8/12). Móvil: foto arriba centrada (160 px).

## Accesibilidad
Un solo `h1`; jerarquía h2/h3 sin saltos; landmarks `header/nav/main/footer`; foco visible; contraste AA; enlaces externos con texto accesible "(abre sitio externo)".

## SEO
`title` = `<Título de página> · Cabellos Research Group`; `description` propia por idioma; canonical, `hreflang` es/en/x-default; Open Graph.

## Estados vacíos
Solo se muestran los enlaces con dato. Sin foto: avatar de iniciales.

## Casos extremos
Afiliaciones largas: se ajustan en varias líneas.

## Criterios de aceptación
- Cumple la Definition of Done de vista (orquestador §7.3).
- Sin overflow horizontal entre 320 y 1920 px.
- Navegable completo por teclado.
- Build sin errores.

## Decisiones abiertas
Ninguna estructural. El contenido depende de la matriz de faltantes (`03-content-inventory.md`).
