/**
 * Entrada del Worker (ADR-016). Envuelve el manejador del adaptador de Astro para mudar la
 * dirección gratuita *.workers.dev al dominio propio con una redirección permanente (301).
 *
 * Va aquí y no en src/middleware.ts porque las páginas estáticas no pasan por el middleware;
 * con `assets.run_worker_first` (wrangler.jsonc) toda petición entra primero a este archivo.
 * Las reglas de redirección de Cloudflare no sirven: workers.dev no es una zona de la cuenta.
 *
 * Solo se redirige el nombre exacto: las URL de vista previa de Workers Builds
 * (<versión>-cabellos-research-group.cabellos.workers.dev) y localhost siguen igual.
 */
import { handle } from '@astrojs/cloudflare/handler';

/** Dirección *.workers.dev que se muda al dominio propio. */
const OLD_HOST = 'cabellos-research-group.cabellos.workers.dev';
/** Dominio propio (el mismo que `site` en astro.config.mjs). */
const CANONICAL_ORIGIN = 'https://cabellosresearchgroup.org';

type Env = Parameters<typeof handle>[1];
type Context = Parameters<typeof handle>[2];

export default {
  async fetch(request: Request, env: Env, context: Context) {
    const url = new URL(request.url);
    if (url.hostname === OLD_HOST) {
      // Misma ruta y mismos parámetros: /es/publicaciones/?a=1 → dominio propio /es/publicaciones/?a=1.
      return new Response(null, {
        status: 301,
        headers: {
          Location: `${CANONICAL_ORIGIN}${url.pathname}${url.search}`,
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }
    return handle(request, env, context);
  },
};
