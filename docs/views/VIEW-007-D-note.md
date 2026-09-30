# VIEW-007-D — Detalle de nota

## Estado
`APPROVED` (estructura, NOTES-F0, 2026-09-29) — implementación en NOTES-F1

## Objetivo
Leer una nota completa y acceder a sus enlaces y archivos.

## Rutas
`/notes/<slug>/` (EN) y `/es/notas/<slug>/` (ES). Mismo slug en ambas interfaces; el contenido no cambia (ADR-009).

## Secciones (jerarquía)
1. **Encabezado**: breadcrumb (Inicio › Notas › título), categoría (enlace a su página), etiqueta de idioma si difiere, etiqueta "Test" en notas de prueba, `h1`, resumen, autor (enlace a su perfil) · fecha · "Actualizada: fecha".
2. **Imagen principal** opcional con `alt`.
3. **Cuerpo** (Markdown) en columna de lectura (`--measure`), con `lang` de la nota.
4. **Enlaces** ("Links" / "Enlaces"): lista con título, tipo (DOI, editorial, acceso abierto, libro) y descripción; indicador de sitio externo.
5. **Archivos** ("Files" / "Archivos"): por cada PDF, título, "PDF · 2.3 MB", botones **Abrir** (otra pestaña) y **Descargar**.
6. **Etiquetas** (sin enlace en la V1) y **líneas de investigación** relacionadas (enlazadas).
7. **Navegación**: nota anterior / siguiente y "Todas las notas".

## Wireframe (≥ 900 px)

```text
┌────────────────────────────────────────────────────────────────────┐
│ Header global (Notes activo)                                        │
├────────────────────────────────────────────────────────────────────┤
│ Home › Notes › Título de la nota                                    │
│ [Readings] [ES]                                                     │
│ Título de la nota (h1)                                              │
│ Resumen en una o dos líneas.                                        │
│ Dr. José Luis Cabellos · 15 Oct 2026 · Updated 20 Oct 2026          │
├────────────────────────────────────────────────────────────────────┤
│ ┌───────────── columna de lectura (68ch) ─────────────┐             │
│ │ Párrafos, subtítulos, listas, citas…                │             │
│ └─────────────────────────────────────────────────────┘             │
│ LINKS                                                               │
│  • Título del artículo ↗   DOI — descripción                        │
│ FILES                                                               │
│  ┌───────────────────────────────────────────────────────┐          │
│  │ [PDF] Notas complementarias   PDF · 2.3 MB            │          │
│  │                              [Open ↗] [Download]      │          │
│  └───────────────────────────────────────────────────────┘          │
│ Tags: DFT · Clusters     Research: (Structure prediction)           │
├────────────────────────────────────────────────────────────────────┤
│ ‹ Nota anterior                All notes               Siguiente ›  │
├────────────────────────────────────────────────────────────────────┤
│ Footer                                                              │
└────────────────────────────────────────────────────────────────────┘
```

Móvil: todo en una columna; los botones del archivo pasan debajo del título.

## Componentes
Breadcrumb, Tag, NoteMeta, NoteLinks, AttachmentList, ExternalLink, Button, Icon.

## Accesibilidad
Único `h1` (título); los encabezados del cuerpo empiezan en `h2`; "Abrir" avisa que se abre en otra pestaña; el tipo y tamaño del archivo están en texto; la etiqueta de idioma tiene texto accesible.

## SEO
`title` = título de la nota; `description` = resumen; canónica según el idioma de la nota (ADR-009); `og:type=article`, `og:locale` del idioma de la nota; JSON-LD `BlogPosting` (headline, datePublished, dateModified, author, inLanguage). Notas de prueba: `noindex`.

## Estados vacíos
Sin enlaces, archivos, etiquetas o imagen: el bloque no se muestra.

## Casos extremos
Títulos largos se ajustan; URLs largas en el cuerpo se cortan (`overflow-wrap: anywhere`); varios PDF se listan uno debajo de otro.

## Criterios de aceptación
- Definition of Done de vista (orquestador §7.3).
- Selector de idioma lleva a la misma nota con la otra interfaz (o a su traducción).
- PDF abre y descarga con la subruta de GitHub Pages.

## Decisiones abiertas
Ninguna.
