# 03 — Inventario de contenido

| Campo | Valor |
|---|---|
| Fase | 1 — Descubrimiento, requerimientos y contenido |
| Versión | 1.0 |
| Fecha | 2026-09-23 |
| Estado | `APPROVED` (estructura); contenido en carga progresiva hasta la Fase 8 |

Leyenda de estado: **OK** disponible y verificado · **BORRADOR** redactado por desarrollo, pendiente de validación académica · **FALTA** debe proporcionarlo el grupo · **N/A** no aplica en v1.

---

## 1. Identidad y datos globales

| Elemento | Estado | Ubicación en el repo | Notas |
|---|---|---|---|
| Marca "Cabellos Research Group" | OK | `src/config/site.ts` | |
| Nombre descriptivo ES/EN | BORRADOR | `src/config/site.ts` | Provisional (charter D-01) |
| Institución y adscripción | OK | `src/config/site.ts` | Fuente: afiliación publicada |
| Dirección postal | OK (campus) / FALTA edificio | `src/config/site.ts` | Carretera Tapachula–Puerto Madero km 24 + 300 |
| Correo público | OK | `src/config/site.ts` | jose.luis@uptapachula.edu.mx (confirmado) |
| Teléfono público | OK | `src/config/site.ts` | 962 465 9908 (confirmado) |
| Logotipo | OK (propio) | `public/favicon.svg`, componente `Brand` | Monograma "CRG" |
| Descripción del grupo (About) | BORRADOR | `src/i18n/es.ts`, `src/i18n/en.ts` | Redactada a partir de la producción publicada |
| Historia / trayectoria del grupo | FALTA | — | No se inventa; bloque oculto hasta tenerla |
| Colaboraciones institucionales | FALTA | — | Bloque opcional (D-15) |

## 2. Líneas de investigación

| Clave | Título ES/EN | Resumen | Descripción larga | Imagen | Integrantes | Publicaciones |
|---|---|---|---|---|---|---|
| `structure-prediction` | BORRADOR | BORRADOR | BORRADOR | Figura CC BY del PI (provisional) | OK (PI) | OK (vinculadas) |
| `finite-temperature` | BORRADOR | BORRADOR | BORRADOR | Figura CC BY del PI (provisional) | OK (PI) | OK |
| `chemical-bonding` | BORRADOR | BORRADOR | BORRADOR | Figura CC BY del PI (provisional) | OK (PI) | OK |
| `optical-properties` | BORRADOR | BORRADOR | BORRADOR | Figura CC BY del PI (provisional) | OK (PI) | OK |

Ubicación: `src/content/data/research.yaml` (datos) y `src/content/texts/{es,en}/research/<clave>.md` (descripción larga).

Las ilustraciones son diagramas abstractos generados por código (átomos y enlaces), no figuras científicas: se marcan como decorativas (`alt=""`). Si el grupo aporta figuras reales, sustituyen a estas con su `alt` descriptivo.

## 3. Integrantes

| Clave | Nombre | Grado | Rol | Foto | Bio ES/EN | ORCID | Scholar | Correo |
|---|---|---|---|---|---|---|---|---|
| `jose-luis-cabellos` | José Luis Cabellos Quiroz | Dr. | Investigador principal | FALTA (avatar de iniciales) | BORRADOR | OK | OK | OK |

**Faltan (D-10):** estudiantes, colaboradores y egresados. La vista Integrantes solo muestra grupos con al menos una persona.

Ubicación: `src/content/data/members.yaml` y `src/content/texts/{es,en}/members/<clave>.md`.

## 4. Publicaciones

| Elemento | Estado |
|---|---|
| Publicaciones con DOI verificado vía Crossref/ORCID | 25 cargadas (2009–2026) |
| Vinculación con líneas de investigación | BORRADOR (asignada por desarrollo según tema) |
| Publicaciones sin ORCID enlazado (p. ej. *Nat. Rev. Chem.* 2018, *Chem. Commun.* 2024) | FALTA: requieren lista del PI |
| Publicaciones destacadas | BORRADOR (4 marcadas) |

Ubicación: `src/content/data/publications.yaml`.

Excluidos a propósito: fe de erratas, preprints con versión publicada, reimpresiones (ChemInform, *Angew. Chem.* edición alemana, *Prime Archives*).

## 5. Contacto

| Elemento | Estado |
|---|---|
| Institución y ciudad | OK |
| Correo y teléfono | OK |
| Edificio/cubículo | FALTA (se muestra la dirección del campus) |
| Perfiles académicos (ORCID, Scholar) | OK |
| Mapa | N/A (no aporta valor suficiente en v1) |

## 6. Matriz de faltantes

| # | Dato | Responsable | Prioridad | Impacto si falta al release |
|---|---|---|---|---|
| 2 | Fotografía del PI (≥ 800×1000 px, fondo neutro) | PI | Alta | Avatar tipográfico |
| 3 | Integrantes actuales y egresados (nombre, grado, rol, foto opcional, 1 párrafo) | PI | Alta | Team muestra solo al PI |
| 4 | Validación de biografía y trayectoria del PI | PI | Alta | Bio en borrador |
| 5 | Lista completa de publicaciones | PI | Media | Faltan trabajos sin ORCID |
| 6 | Ratificar nombre descriptivo del grupo | PI | Media | Queda el provisional |
| 7 | Dirección completa | PI | Media | Solo ciudad/CP |
| 8 | ResearchGate / Scopus del PI | PI | Baja | No se muestran |
| 9 | Colaboraciones institucionales | PI | Baja | Bloque omitido |
| 10 | Figuras científicas propias para líneas de investigación | PI | Baja | Se usan figuras CC BY de sus artículos (ADR-006) |
