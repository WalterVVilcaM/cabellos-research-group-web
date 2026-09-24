// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/** Rutas anteriores a v1.8 (ES sin prefijo, EN en /en/). Ahora solo redirigen a las nuevas. */
const OLD_ROUTES = /^\/(en|nosotros|contacto|publicaciones|investigacion|integrantes)(\/|$)/;

// Dominio y subruta configurables por entorno. Por defecto: dominio final en la raíz.
// La vista previa en GitHub Pages usa SITE=https://waltervvilcam.github.io y
// BASE_PATH=/cabellos-research-group-web (ver .github/workflows/deploy.yml).
const SITE = process.env.SITE ?? 'https://cabellosresearchgroup.org';
const BASE_PATH = process.env.BASE_PATH ?? '/';

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
      // Fuera del sitemap: la 404 y las rutas anteriores a v1.8, que solo redirigen (ADR-007).
      filter: (page) => {
        const path = new URL(page).pathname.slice(BASE_PATH.replace(/\/$/, '').length);
        return !path.startsWith('/404') && !OLD_ROUTES.test(path);
      },
      i18n: { defaultLocale: 'en', locales: { en: 'en', es: 'es' } },
    }),
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
