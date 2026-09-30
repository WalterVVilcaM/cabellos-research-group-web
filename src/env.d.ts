/**
 * Tipos del Worker de Cloudflare (wrangler.jsonc). Se importan solo los tipos necesarios desde
 * @cloudflare/workers-types (versión de módulo) para no mezclar sus globales con los del navegador.
 */
declare module 'cloudflare:workers' {
  export const env: {
    /** Base de datos editorial de Notes (Cloudflare D1, ADR-011). */
    DB: import('@cloudflare/workers-types/index.ts').D1Database;
    /** Archivos de Notes (Cloudflare R2, ADR-012). */
    NOTES_FILES: import('@cloudflare/workers-types/index.ts').R2Bucket;
    /** Archivos estáticos del sitio (lo añade el adaptador). */
    ASSETS: import('@cloudflare/workers-types/index.ts').Fetcher;
    /** "true" en la vista previa: muestra las notas de prueba. */
    SHOW_TEST_NOTES?: string;
  };
}
