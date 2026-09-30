# Cabellos Research Group — sitio web

Sitio académico bilingüe (ES/EN) del Cabellos Research Group, Universidad Politécnica de Tapachula.

- **Stack:** Astro 7 (estático; Notes bajo demanda) + TypeScript + Content Collections + Cloudflare Workers y D1
- **Dominio previsto:** cabellosresearchgroup.org (Cloudflare Workers)
- **Vista previa:** https://cabellos-research-group.cabellos.workers.dev/ (Cloudflare Workers, ADR-010). La copia de GitHub Pages quedó congelada.
- **Documento rector:** [`docs/00-orquestador-maestro.md`](docs/00-orquestador-maestro.md) · índice en [`docs/README.md`](docs/README.md)

## Requisitos

Node.js ≥ 22.12

## Comandos

| Comando | Acción |
|---|---|
| `npm install` | Instala dependencias |
| `npm run dev` | Servidor de desarrollo en `localhost:4321` |
| `npm run check` | Verifica tipos y componentes |
| `npm run build` | Genera el sitio en `dist/` |
| `npm run preview` | Sirve `dist/` localmente |
| `npm run sync:pubs -- --dry-run` | Muestra qué publicaciones nuevas agregaría (sin escribir) |

El dominio y la subruta salen de las variables `SITE` y `BASE_PATH` (por defecto, `https://cabellosresearchgroup.org` en la raíz). Todo enlace interno debe pasar por `sectionPath`/`researchPath`/`memberPath` o `withBase` (`src/i18n/utils.ts`) para funcionar también bajo `/cabellos-research-group-web/`.

## Dónde se edita el contenido

| Qué | Archivo |
|---|---|
| Identidad, institución, contacto | `src/config/site.ts` |
| Textos de la interfaz y páginas (ES/EN) | `src/i18n/ui.ts` |
| Líneas de investigación | `src/content/data/research.yaml` + `src/content/texts/{es,en}/research/*.md` |
| Integrantes | `src/content/data/members.yaml` + `src/content/texts/{es,en}/members/*.md` |
| Publicaciones | `src/content/data/publications.yaml` |
| Notas (Notes / Notas) | Cloudflare D1 (panel en NOTES-F5); esquema en `migrations/` |

## Notas (Notes / Notas)

Las notas viven en **Cloudflare D1** (base `cabellos-notes`, ADR-011), sus PDF en **R2** (bucket privado `cabellos-research-files`, servido por el Worker en `/files/…`, ADR-012) y las páginas de Notes se generan en cada visita; el resto del sitio es estático. 

| Comando | Qué hace |
|---|---|
| `npm run db:migrate:local` | Crea las tablas en la base local (`.wrangler/state`) |
| `npm run db:seed:local` | Carga las notas de prueba en la base local |
| `npm run dev` | Sitio en `localhost:4321` con la base local |
| `git push` a `main` | Publica en Cloudflare (Workers Builds). A mano: `npm run build` + `npm run cf:deploy` |
| `npm run db:migrate:remote` / `npm run db:seed:remote` | Lo mismo en la base de Cloudflare |
| `npm run files:seed:local` / `npm run files:seed:remote` | Sube el PDF de prueba a R2 (local o Cloudflare) |

**Panel del Dr.:** `/admin/` (solo español). Protegido con Cloudflare Access + verificación del JWT (ADR-013); sin `ACCESS_TEAM_DOMAIN` y `ACCESS_AUD` en `wrangler.jsonc` responde 503. En tu equipo: copia `.dev.vars.example` como `.dev.vars` y abre `http://localhost:4321/admin/` con `npm run dev`.

Las notas de prueba (`is_test = 1`, `seeds/test-notes.sql`) solo se ven si la variable `SHOW_TEST_NOTES` de `wrangler.jsonc` es `"true"`. Antes del lanzamiento se quita esa variable y se borran (Gate 8). Detalle: `docs/13-notes-editorial-module.md`, ADR-008, ADR-009 y ADR-011.

## Publicaciones automáticas

Cada lunes, `.github/workflows/publications.yml` ejecuta `scripts/sync-publications.mjs`, que busca en OpenAlex (por el ORCID del Dr. Cabellos) y completa los datos con Crossref. Solo **agrega** entradas nuevas al final de `publications.yaml` (nunca modifica ni borra las existentes) y solo guarda el cambio si pasan `astro check` y `astro build`; Cloudflare lo publica automáticamente.

- Se ignoran preprints, erratas, portadas, material suplementario, repositorios (Zenodo/Figshare) y duplicados por DOI o por título.
- Si aparecen más de 12 de golpe o las APIs no responden, no se cambia nada.
- Para quitar una publicación: bórrala de `publications.yaml` y agrega su DOI a `scripts/publications-ignore.txt`.
- Las entradas automáticas llevan el comentario "Agregada automáticamente…": conviene revisar sus `researchAreas`.
- También se puede lanzar a mano: pestaña **Actions → Buscar publicaciones → Run workflow**.

El modelo completo está en [`docs/07-content-model.md`](docs/07-content-model.md). Si una referencia es inválida, el build falla y lo indica.

## Estructura

```text
docs/        documentación del proyecto (fases, ADR, QA)
public/      favicon, og-image, robots.txt
src/
  components/  global · ui · content
  content/     datos (YAML) y textos (Markdown ES/EN)
  i18n/        diccionario y rutas por idioma
  layouts/     BaseLayout
  pages/       rutas EN (raíz) y /es/ (delgadas)
  styles/      tokens y estilos globales
  utils/       consultas de contenido
  views/       una vista por página, compartida entre idiomas
```
