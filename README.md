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

El dominio y la subruta salen de las variables `SITE` y `BASE_PATH` (por defecto, `https://cabellosresearchgroup.org` en la raíz). Todo enlace interno debe pasar por `sectionPath`/`researchPath`/`memberPath` o `withBase` (`src/i18n/utils.ts`) para funcionar también bajo `/cabellos-research-group-web/`.

## Dónde se edita el contenido

| Qué | Archivo |
|---|---|
| Identidad, institución, contacto | `src/config/site.ts` |
| Textos de la interfaz y páginas (ES/EN) | `src/i18n/ui.ts` |
| Líneas de investigación | `src/content/data/research.yaml` + `src/content/texts/{es,en}/research/*.md` |
| Integrantes | `src/content/data/members.yaml` + `src/content/texts/{es,en}/members/*.md` |
| Publicaciones | `src/content/data/publications.yaml` |

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
