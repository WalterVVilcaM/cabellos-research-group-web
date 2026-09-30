# VIEW-007 — Notes / Notas (listado) y VIEW-007-C — Notas por categoría

## Estado
`APPROVED` (estructura, NOTES-F0, 2026-09-29) — implementación en NOTES-F1

## Objetivo
Mostrar las notas del Dr. Cabellos (opiniones, lecturas recomendadas y libros) de forma ordenada, con la misma identidad visual del sitio.

## Usuarios principales
Estudiantes, colegas y visitantes que siguen al grupo.

## Rutas

| Vista | EN | ES |
|---|---|---|
| Listado | `/notes/` | `/es/notas/` |
| Página n (n ≥ 2) | `/notes/page/n/` | `/es/notas/pagina/n/` |
| Categoría | `/notes/category/<opinion\|readings\|books>/` | `/es/notas/categoria/<opinion\|lecturas\|libros>/` |
| Categoría, página n | `/notes/category/<cat>/page/n/` | `/es/notas/categoria/<cat>/pagina/n/` |

## Secciones (jerarquía)
1. **PageHeader**: breadcrumb (Inicio › Notas; en categoría: Inicio › Notas › Categoría), `h1` "Notes"/"Notas" (o el nombre de la categoría) y entradilla.
2. **Filtros por categoría**: enlaces tipo píldora "Todas · Opinión · Lecturas · Libros". El activo lleva `aria-current="page"`. Solo aparecen categorías con notas publicadas. Sin JavaScript.
3. **Nota destacada** (solo en la página 1 del listado general y si existe una nota `featured`): tarjeta ancha.
4. **Lista de notas**: tarjetas en una columna (móvil) o dos columnas (≥ 900 px), de la más reciente a la más antigua.
5. **Paginación** (10 por página): anterior · "Página 1 de 3" · siguiente. Solo si hay más de una página.
6. **Estado vacío**: mensaje como el de Galería.

## Tarjeta de nota (NoteCard)
Categoría (etiqueta) · etiqueta de idioma si difiere de la interfaz · etiqueta "Test" en notas de prueba · título (`h2`/`h3`, enlace a la nota; toda la tarjeta es clicable) · extracto (máx. 3 líneas) · fecha · autor · indicadores "PDF" y "n enlaces" cuando existan.

## Wireframe (≥ 900 px)

```text
┌────────────────────────────────────────────────────────────────────┐
│ Header global (Notes activo)                                        │
├────────────────────────────────────────────────────────────────────┤
│ Home › Notes                                                        │
│ NOTES (h1)                                                          │
│ Opinions, recommended readings and books by Dr. Cabellos.           │
├────────────────────────────────────────────────────────────────────┤
│ (All) (Opinion) (Readings) (Books)                                  │
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │ [Readings] [ES]                                  FEATURED        │ │
│ │ Título de la nota destacada (h2)                                 │ │
│ │ Extracto de dos o tres líneas…                                   │ │
│ │ 15 Oct 2026 · Dr. José Luis Cabellos · PDF · 2 links             │ │
│ └────────────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────┐ ┌──────────────────────────────┐ │
│ │ [Opinion]                     │ │ [Books] [ES]                  │ │
│ │ Título (h2)                   │ │ Título (h2)                   │ │
│ │ Extracto…                     │ │ Extracto…                     │ │
│ │ fecha · autor                 │ │ fecha · autor · PDF           │ │
│ └──────────────────────────────┘ └──────────────────────────────┘ │
│           ‹ Previous    Page 1 of 2    Next ›                       │
├────────────────────────────────────────────────────────────────────┤
│ Footer                                                              │
└────────────────────────────────────────────────────────────────────┘
```

Móvil (< 700 px): una columna; filtros con salto de línea; la destacada ocupa el ancho completo.

## Componentes
PageHeader, Breadcrumb, CategoryFilter, NoteCard (variante `featured`), Pagination, Tag.

## Responsive
Una columna < 900 px; dos columnas ≥ 900 px. Sin overflow horizontal entre 320 y 1920 px.

## Accesibilidad
Un solo `h1`; títulos de tarjeta como `h2`; filtros dentro de `<nav aria-label>`; paginación dentro de `<nav aria-label>` con `rel="prev"/"next"`; la etiqueta de idioma tiene texto accesible ("Nota en español").

## SEO
`title` = "Notes · Cabellos Research Group" (o categoría); `description` por idioma; canonical propia; `hreflang` EN/ES/x-default; las páginas n ≥ 2 son indexables con su propia canónica.

## Estados vacíos
Sin notas: mensaje. Categoría sin notas: no se genera su página ni su filtro.

## Criterios de aceptación
- Definition of Done de vista (orquestador §7.3).
- Enlaces correctos también con la subruta de GitHub Pages.
- Navegable por teclado; Lighthouse A11y 100.

## Decisiones abiertas
Ninguna.
