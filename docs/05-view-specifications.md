# 05 — Especificaciones de vista y wireframes

| Campo | Valor |
|---|---|
| Fase | 3 — UX y wireframes |
| Versión | 1.0 |
| Fecha | 2026-09-23 |
| Estado | `APPROVED` |

Cada vista tiene su especificación en [`docs/views/`](./views/README.md). Este documento reúne los wireframes de baja fidelidad y el mapa de componentes.

---

## 1. Wireframes

> **v1.2:** Home con hero + carrusel de figuras reales, tarjetas con figura, banda de cifras y publicaciones recientes; Publicaciones con destacadas en carrusel, buscador y filtros; perfil con resumen, contacto y coautores; contacto con tarjetas de acción. Ver `09-benchmark-ux-theochem.md`.
>
> **v1.1:** el Home se simplificó (intro compacta → líneas → publicaciones). La especificación vigente está en `views/VIEW-001-home.md`; los wireframes siguientes muestran la v1.0 como registro.

### VIEW-001 Home — desktop (≥ 1024 px)

```text
┌──────────────────────────────────────────────────────────────────┐
│ [CRG] Cabellos Research Group   Nosotros Investigación … │ ES/EN │
├──────────────────────────────────────────────────────────────────┤
│ UNIVERSIDAD POLITÉCNICA DE TAPACHULA                             │
│ Cabellos Research Group (h1)               ○──○                  │
│ Grupo de Química Computacional…           /  \ ○   ilustración   │
│ Propósito en ≤ 2 líneas                   ○────○   molecular     │
│ [Ver investigación] [Publicaciones]                              │
├──────────────────────────────────────────────────────────────────┤
│  25 publicaciones · 2009–2026 · 4 líneas                         │
├──────────────────────────────────────────────────────────────────┤
│ Líneas de investigación (h2)                                     │
│ ┌──01───────────────┐ ┌──02───────────────┐                      │
│ │ Título / resumen → │ │ Título / resumen → │                      │
│ └───────────────────┘ └───────────────────┘   (grid 2×2)         │
├──────────────────────────────────────────────────────────────────┤
│ Enfoque: [1 Búsqueda]→[2 DFT]→[3 Termodinámica]→[4 Experimento]  │
├──────────────────────────────────────────────────────────────────┤
│ Investigador principal  [avatar] Dr. … / rol / bio corta  →      │
├──────────────────────────────────────────────────────────────────┤
│ Publicaciones recientes  (5 ítems)          Todas →              │
├──────────────────────────────────────────────────────────────────┤
│ Banda CTA → Contacto                                             │
├──────────────────────────────────────────────────────────────────┤
│ Footer                                                           │
└──────────────────────────────────────────────────────────────────┘
```

### VIEW-001 Home — móvil (360 px)

```text
┌────────────────────────┐
│ [CRG] Cabellos RG  Menú│
├────────────────────────┤
│ UPTAP                  │
│ Cabellos Research      │
│ Group                  │
│ Nombre descriptivo     │
│ Propósito              │
│ [Ver investigación]    │
│ [Publicaciones]        │
│   (ilustración)        │
├────────────────────────┤
│ 25 │ 2009–26 │ 4        │
├────────────────────────┤
│ 01 Línea →             │
│ 02 Línea →             │
│ 03 …                   │
├────────────────────────┤
│ Enfoque 1 / 2 / 3 / 4  │
├────────────────────────┤
│ PI (tarjeta)           │
├────────────────────────┤
│ Publicaciones (5)      │
├────────────────────────┤
│ Footer                 │
└────────────────────────┘
```

### VIEW-003-D Detalle de línea — desktop

```text
Inicio › Investigación › Línea
LÍNEA 01
Título (h1)
Resumen
[tag][tag][tag]
┌─────────── ilustración 21:9 ───────────┐
├───────────────────────────┬────────────┤
│ Descripción (prosa, 8/12) │ Integrantes│
│                           │ (aside)    │
├───────────────────────────┴────────────┤
│ Publicaciones de esta línea (lista)    │
│ Otras líneas (3 tarjetas)              │
```

### VIEW-004-D Perfil — desktop / móvil

```text
Desktop                                     Móvil
┌────────┬─────────────────────────┐       ┌──────────────┐
│ foto / │ Dr. Nombre (h1)         │       │  (avatar)    │
│ avatar │ Rol · Afiliación        │       │ Dr. Nombre   │
│        │ [ORCID] [Scholar] …     │       │ Rol          │
└────────┴─────────────────────────┘       │ [ORCID]…     │
Biografía                                   │ Biografía    │
Líneas: [tag] [tag]                         │ Líneas       │
Publicaciones (lista)                       │ Publicaciones│
                                            └──────────────┘
```

### VIEW-005 Publicaciones

```text
Publicaciones (h1) · 25 artículos
Años: [2026][2025][2024]…      Por línea: Predicción (10) · Temperatura (6) …
2026 (h2)
 25. Autores (PI en negrita). "Título". Revista Vol(Nº), pp. (Año). doi:… ↗
2025 (h2)
 24. …
```

Las demás vistas (About, Research, Team, Contact, 404) siguen la estructura de sus especificaciones con el patrón `PageHeader` + contenido en una columna o en 2 columnas.

## 2. Mapa de componentes

| Componente | Vistas | Tipo |
|---|---|---|
| `BaseLayout` | todas | layout |
| `Header` / `Nav` / `LanguageSwitcher` / `MobileMenu` | todas | global |
| `Footer` | todas | global |
| `Seo` (head) | todas | global |
| `Container`, `Section`, `SectionHeader`, `PageHeader` | todas | ui |
| `Button` | 001, 404, CTA | ui |
| `Tag` | 003, 003-D, 004-D | ui |
| `Breadcrumb` | 003-D, 004-D | navegación |
| `ResearchCard` | 001, 003-D | contenido |
| `ResearchFeature` | 003 | contenido |
| `MolecularArt` | 001, 003, 003-D | ilustración SVG |
| `MemberCard` (variantes `featured`, `default`, `compact`) | 001, 003-D, 004 | contenido |
| `Avatar` | 004, 004-D | contenido |
| `PublicationItem` | 001, 003-D, 004-D, 005 | contenido |
| `StatList` | 001, 002 | contenido |
| `MethodSteps` | 001, 002 | contenido |
| `IconLink` / indicador externo | 004-D, 006, footer | ui |
| `CtaBand` | 001, 003 | ui |

## 3. Notas UX

- El Home no duplica páginas: cada bloque muestra un extracto y enlaza.
- Numeración de líneas (01–04) como recurso de identidad y orientación.
- Las listas de publicaciones usan formato de cita académica, no tarjetas: son más densas, escaneables y crecen bien.
- Enlaces externos siempre con indicador visual ↗ y texto accesible.
- Tamaño táctil mínimo de 44×44 px en navegación y botones.

## 4. Gate 3

- [x] Home, About, Research, Research Detail, Team, Member Detail, Publications, Contact y 404 especificados
- [x] móvil contemplado en cada vista
- [x] contenido largo contemplado (títulos, autores, DOI, nombres)
