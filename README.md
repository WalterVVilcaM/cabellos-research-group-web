# Cabellos Research Group — sitio web

Sitio académico bilingüe (ES/EN) del Cabellos Research Group, Universidad Politécnica de Tapachula.

- **Stack:** Astro 7 (estático) + TypeScript + Content Collections
- **Dominio previsto:** cabellosresearchgroup.org (Cloudflare Pages)
- **Vista previa:** https://waltervvilcam.github.io/cabellos-research-group-web/ (GitHub Pages; se publica sola en cada push a `main` vía `.github/workflows/deploy.yml`)
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
| Notas (Notes / Notas) | `src/content/notes/<slug>.md` + PDF en `public/files/notes/<año>/` |

## Notas (Notes / Notas)

1. Copia `src/content/notes/_PLANTILLA.md` como `src/content/notes/<slug>.md` (el slug es la URL: `/notes/<slug>/` y `/es/notas/<slug>/`).
2. Llena el frontmatter: `lang` es el idioma en que está escrita la nota; `category` es `opinion`, `readings` o `books`.
3. Si lleva PDF, cópialo a `public/files/notes/<año>/` y declara `rights` (solo con derecho de distribución; si no, usa un enlace).
4. Cambia `status: draft` a `status: published` y publica.

Las notas con `isTest: true` solo aparecen en `npm run dev` y en la vista previa de GitHub Pages (`SHOW_TEST_NOTES=true`). El build del dominio final las omite. Detalle: `docs/13-notes-editorial-module.md`, ADR-008 y ADR-009.

## Publicaciones automáticas

Cada lunes, `.github/workflows/deploy.yml` ejecuta `scripts/sync-publications.mjs`, que busca en OpenAlex (por el ORCID del Dr. Cabellos) y completa los datos con Crossref. Solo **agrega** entradas nuevas al final de `publications.yaml` (nunca modifica ni borra las existentes) y el sitio solo se publica si pasan `astro build` y `astro check`.

- Se ignoran preprints, erratas, portadas, material suplementario, repositorios (Zenodo/Figshare) y duplicados por DOI o por título.
- Si aparecen más de 12 de golpe o las APIs no responden, no se cambia nada.
- Para quitar una publicación: bórrala de `publications.yaml` y agrega su DOI a `scripts/publications-ignore.txt`.
- Las entradas automáticas llevan el comentario "Agregada automáticamente…": conviene revisar sus `researchAreas`.
- También se puede lanzar a mano: pestaña **Actions → Deploy to GitHub Pages → Run workflow**.

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
