# VIEW-004 — Integrantes / Team

## Estado
`APPROVED` (estructura) — implementación en Fase 7

## Objetivo
Presentar la estructura humana del grupo.

## Usuarios principales
Estudiantes potenciales y colaboradores.

## Ruta ES
`/integrantes/`

## Ruta EN
`/en/team/`

## Secciones (jerarquía)
1. **Page header**.
2. **Grupos por rol**, en este orden: Investigador principal → Investigadores → Posdoctorales → Estudiantes de doctorado → Estudiantes de maestría → Estudiantes de licenciatura → Colaboradores → Egresados.
3. Cada grupo: `h2` + grid de MemberCard.

## Componentes
PageHeader, MemberCard, Avatar

## Responsive
Grid auto-fill con mínimo de 240 px por tarjeta. El PI usa la tarjeta horizontal a ancho completo.

## Accesibilidad
Un solo `h1`; jerarquía h2/h3 sin saltos; landmarks `header/nav/main/footer`; foco visible; contraste AA; enlaces externos con texto accesible "(abre sitio externo)".

## SEO
`title` = `<Título de página> · Cabellos Research Group`; `description` propia por idioma; canonical, `hreflang` es/en/x-default; Open Graph.

## Estados vacíos
Grupos vacíos no se renderizan (orquestador §14).

## Casos extremos
Nombres largos con doble apellido: 2 líneas, sin truncar.

## Criterios de aceptación
- Cumple la Definition of Done de vista (orquestador §7.3).
- Sin overflow horizontal entre 320 y 1920 px.
- Navegable completo por teclado.
- Build sin errores.

## Decisiones abiertas
Ninguna estructural. El contenido depende de la matriz de faltantes (`03-content-inventory.md`).
