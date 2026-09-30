// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** Rutas anteriores a v1.8 (ES sin prefijo, EN en /en/). Ahora solo redirigen a las nuevas. */
const OLD_ROUTES = /^\/(en|nosotros|contacto|publicaciones|investigacion|integrantes)(\/|$)/;

// Dominio y subruta configurables por entorno. Por defecto: dominio final en la raíz.
// La vista previa en GitHub Pages usa SITE=https://waltervvilcam.github.io y
// BASE_PATH=/cabellos-research-group-web (ver .github/workflows/deploy.yml).
const SITE = process.env.SITE ?? 'https://cabellosresearchgroup.org';
const BASE_PATH = process.env.BASE_PATH ?? '/';

// Notes (ADR-008/009). Las notas de prueba solo se publican con SHOW_TEST_NOTES=true (vista previa).
const SHOW_TEST_NOTES = process.env.SHOW_TEST_NOTES === 'true';

/**
 * URLs de notas que no van al sitemap: la versión con la otra interfaz (su canónica es la del
 * idioma de la nota) y todas las notas de prueba. Lee solo el frontmatter de src/content/notes.
 */
function notesOutsideSitemap() {
  const dir = new URL('./src/content/notes/', import.meta.url);
  const excluded = new Set();
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.md') || name.startsWith('_')) continue;
    const slug = name.slice(0, -3);
    const fm = readFileSync(new URL(name, dir), 'utf8').split(/^---\s*$/m)[1] ?? '';
    const lang = /^lang:\s*["']?(en|es)/m.exec(fm)?.[1];
    const isTest = /^isTest:\s*true/m.test(fm);
    const en = `/notes/${slug}/`;
    const es = `/es/notas/${slug}/`;
    if (isTest || lang !== 'en') excluded.add(en);
    if (isTest || lang !== 'es') excluded.add(es);
  }
  return excluded;
}
const NOTES_OUTSIDE_SITEMAP = notesOutsideSitemap();

/**
 * Sin notas de prueba, sus PDF (public/files/notes/test/) tampoco se publican.
 * @type {import('astro').AstroIntegration}
 */
const dropTestFiles = {
  name: 'notes-drop-test-files',
  hooks: {
    'astro:build:done': ({ dir }) => {
      if (!SHOW_TEST_NOTES) rmSync(fileURLToPath(new URL('files/notes/test/', dir)), { recursive: true, force: true });
    },
  },
};

// https://astro.build/config
export default defineConfig({
  site: SITE,
  base: BASE_PATH,
  trailingSlash: 'always',
  build: { format: 'directory' },
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      // Fuera del sitemap: la 404, las rutas anteriores a v1.8, que solo redirigen (ADR-007),
      // y las URLs no canónicas o de prueba de Notes (ADR-009).
      filter: (page) => {
        const path = new URL(page).pathname.slice(BASE_PATH.replace(/\/$/, '').length);
        return !path.startsWith('/404') && !OLD_ROUTES.test(path) && !NOTES_OUTSIDE_SITEMAP.has(path);
      },
      i18n: { defaultLocale: 'en', locales: { en: 'en', es: 'es' } },
    }),
    dropTestFiles,
  ],
  // Fuentes autoalojadas (OFL). Archivos en src/assets/fonts — ver ADR-005.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'IBM Plex Sans',
      cssVariable: '--font-sans',
      fallbacks: ['system-ui', 'sans-serif'],
      options: {
        variants: [
          { src: ['./src/assets/fonts/ibm-plex-sans-latin-400-normal.woff2'], weight: 400, style: 'normal' },
          { src: ['./src/assets/fonts/ibm-plex-sans-latin-400-italic.woff2'], weight: 400, style: 'italic' },
          { src: ['./src/assets/fonts/ibm-plex-sans-latin-500-normal.woff2'], weight: 500, style: 'normal' },
          { src: ['./src/assets/fonts/ibm-plex-sans-latin-600-normal.woff2'], weight: 600, style: 'normal' },
        ],
      },
    },
  ],
});
