# VIEW-006 — Contacto

## Estado
`APPROVED` (estructura) — implementación en Fase 7

## Objetivo
Proporcionar los canales académicos autorizados.

## Usuarios principales
Estudiantes, colaboradores, institucionales.

## Ruta ES
`/contacto/`

## Ruta EN
`/en/contact/`

## Secciones (jerarquía)
1. **Page header**.
2. **Tarjeta de contacto**: correo (si existe), institución, dirección, teléfono (si existe).
3. **Perfiles académicos**: ORCID, Scholar.
4. **Estudiantes interesados**: párrafo breve.

## Componentes
PageHeader, InfoBlock, IconLink

## Responsive
Desktop: 2 columnas. Móvil: 1.

## Accesibilidad
Un solo `h1`; jerarquía h2/h3 sin saltos; landmarks `header/nav/main/footer`; foco visible; contraste AA; enlaces externos con texto accesible "(abre sitio externo)".

## SEO
`title` = `<Título de página> · Cabellos Research Group`; `description` propia por idioma; canonical, `hreflang` es/en/x-default; Open Graph.

## Estados vacíos
Sin correo: se enlaza al sitio de la UPTap como canal institucional.

## Casos extremos
—

## Criterios de aceptación
- Cumple la Definition of Done de vista (orquestador §7.3).
- Sin overflow horizontal entre 320 y 1920 px.
- Navegable completo por teclado.
- Build sin errores.

## Decisiones abiertas
Ninguna estructural. El contenido depende de la matriz de faltantes (`03-content-inventory.md`).
