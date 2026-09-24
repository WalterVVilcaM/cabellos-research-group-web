# 07 — Modelo de contenido

| Campo | Valor |
|---|---|
| Fase | 5 — Arquitectura técnica y modelo de datos |
| Versión | 1.0 |
| Fecha | 2026-09-23 |
| Estado | `APPROVED` — congelado para la carga de contenido |
| Implementación | `src/content.config.ts` |

---

## 1. Principio

**Un dato, un lugar.** Los datos neutrales al idioma (orden, relaciones, enlaces, DOI) se escriben una sola vez. Los textos cortos se guardan como pares `{ es, en }` junto al dato y los textos largos en Markdown por idioma. Así ES y EN no pueden desincronizar sus relaciones.

```text
src/content/
├── data/
│   ├── research.yaml       ← líneas (neutral + textos cortos es/en)
│   ├── members.yaml        ← integrantes (neutral + cargo es/en)
│   └── publications.yaml   ← publicaciones (neutrales)
└── texts/
    ├── es/research/<id>.md   es/members/<id>.md
    └── en/research/<id>.md   en/members/<id>.md
```

El `id` de cada entidad es su clave en el YAML (p. ej. `structure-prediction`) y el mismo nombre de archivo de sus textos.

## 2. `research` (ResearchArea)

| Campo | Tipo | Req. | Notas |
|---|---|---|---|
| *(clave)* | string | ✔ | id estable, en inglés, kebab-case |
| `order` | int > 0 | ✔ | Numeración visible (01–04) |
| `slug.es` / `slug.en` | slug | ✔ | Segmento de URL por idioma |
| `title` | `{es,en}` | ✔ | Título completo |
| `shortTitle` | `{es,en}` | ✔ | Breadcrumb, tags, tarjetas compactas |
| `summary` | `{es,en}` | ✔ | 1–2 frases; también meta description |
| `keywords` | `{es: [], en: []}` | ✔ | Se muestran máx. 5 en la lista |
| `motif` | `cluster \| thermal \| planar \| lattice` | ✔ | Ilustración decorativa |
| `featured` | bool | — | default `true` |
| Texto largo | `texts/<lang>/research/<id>.md` | ✔ | El build falla si falta |

Relaciones **inversas** (no se declaran aquí): integrantes (`members.researchAreas`) y publicaciones (`publications.researchAreas`).

## 3. `members` (Member)

| Campo | Tipo | Req. | Notas |
|---|---|---|---|
| *(clave)* | slug | ✔ | También es el slug de URL (`/integrantes/<clave>/`) |
| `name` | string | ✔ | Nombre completo sin grado |
| `citationNames` | string[] | — | Variantes con que aparece en listas de autores (se resaltan) |
| `academicTitle` | string | — | "Dr.", "Dra.", "M. en C."… |
| `role` | enum | ✔ | `pi, researcher, postdoc, phd, masters, undergrad, collaborator, alumni` (define agrupación y orden) |
| `position` | `{es,en}` | ✔ | Cargo visible |
| `affiliation` | string | ✔ | Institución |
| `photo` | imagen local | — | Ruta relativa a `src/assets/`; sin foto → avatar de iniciales |
| `researchAreas` | ref(research)[] | — | Validado en build |
| `links.email` | email | — | Solo si está autorizado |
| `links.orcid` | `0000-0000-0000-000X` | — | |
| `links.googleScholar` | id de usuario | — | |
| `links.researchGate` / `links.website` | URL | — | |
| `links.scopus` | Author ID | — | |
| `order` | int | — | Orden dentro del rol |
| `featured` | bool | — | Aparece en el Home |
| `active` | bool | — | Reservado para egresados |
| Biografía | `texts/<lang>/members/<id>.md` | — | Si falta, se omite la sección |

## 4. `publications` (Publication)

| Campo | Tipo | Req. | Notas |
|---|---|---|---|
| *(clave)* | string | ✔ | Convención `<año>-<primer-autor>-<tema>` |
| `title` | string | ✔ | Notación química: `Au_{10}`, `Be_{6}B_{11}^{−}` |
| `authors` | string[] | ✔ | Tal como aparecen en la publicación |
| `journal` | string | ✔ | Nombre completo |
| `year` | int | ✔ | |
| `volume`, `issue`, `pages` | string | — | `pages` admite nº de artículo |
| `doi` | string | — | Sin `https://doi.org/`; se valida el formato |
| `url` | URL | — | Solo si no hay DOI |
| `type` | `article \| review \| chapter \| conference \| other` | — | default `article` |
| `featured` | bool | — | |
| `researchAreas` | ref(research)[] | — | Validado en build |
| `members` | ref(members)[] | — | Validado en build |

El número visible se calcula (la más reciente = N); no se escribe a mano.

## 5. `texts`

Markdown con frontmatter `status: draft | approved`. Gate 8 exige `approved` en todos.

## 6. Entidad `Project`

No se crea en v1 (ADR-004): no hay contenido de proyectos. Si aparece, se agrega como colección nueva con referencias a `research` y `members`, sin tocar las existentes.

## 7. Cómo se agrega contenido

| Tarea | Pasos |
|---|---|
| Publicación | Agregar un bloque en `publications.yaml` |
| Integrante | Bloque en `members.yaml` + `texts/es/members/<id>.md` + `texts/en/members/<id>.md` (+ foto opcional en `src/assets/members/`) |
| Línea | Bloque en `research.yaml` + 2 textos |

Si una referencia apunta a una clave inexistente, `astro build` falla con un mensaje claro (RNF-09).
