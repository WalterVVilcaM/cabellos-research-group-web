/**
 * Archivos de Notes desde R2 (NOTES-F4, ADR-012): /files/notes/<año>/<nota>/<archivo>.pdf
 * - Solo se sirven adjuntos de notas visibles (nunca de borradores ni archivadas).
 * - Soporta peticiones por rangos (visores de PDF) y validación por ETag.
 * - `?download=1` fuerza la descarga; sin él, el PDF se abre en el navegador.
 */
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { visibleAttachment } from '../../utils/notes';

export const prerender = false;

const notFound = () => new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain' } });

/** Content-Disposition con nombre ASCII de respaldo y nombre UTF-8 (RFC 6266). */
function disposition(type: 'inline' | 'attachment', name: string) {
  const ascii = name.normalize('NFD').replace(/[^\x20-\x7e]/g, '').replace(/["\\]/g, '') || 'archivo.pdf';
  return `${type}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}

export const GET: APIRoute = async ({ params, request, url }) => {
  const key = `${params.key ?? ''}.pdf`;
  if (!/^notes\/[a-z0-9/_-]+\.pdf$/.test(key) || key.includes('..')) return notFound();

  const meta = await visibleAttachment(key);
  if (!meta) return notFound();

  // Tipos del runtime de Workers (distintos de los del navegador): se usan sin conversión.
  const object = await env.NOTES_FILES.get(key, {
    range: request.headers as never,
    onlyIf: request.headers as never,
  });
  if (!object) return notFound();

  const headers = new Headers();
  headers.set('Content-Type', 'application/pdf');
  headers.set('ETag', object.httpEtag);
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Cache-Control', 'public, max-age=3600');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set(
    'Content-Disposition',
    disposition(url.searchParams.has('download') ? 'attachment' : 'inline', meta.original_filename),
  );

  // Precondición cumplida (If-None-Match): el navegador ya tiene esta versión.
  if (!('body' in object) || !object.body) return new Response(null, { status: 304, headers });

  const range = object.range as { offset?: number; length?: number; suffix?: number } | undefined;
  if (range && request.headers.has('Range')) {
    const start = range.suffix !== undefined ? object.size - range.suffix : (range.offset ?? 0);
    const length = range.suffix !== undefined ? range.suffix : (range.length ?? object.size - start);
    headers.set('Content-Range', `bytes ${start}-${start + length - 1}/${object.size}`);
    headers.set('Content-Length', String(length));
    return new Response(object.body as unknown as ReadableStream, { status: 206, headers });
  }
  headers.set('Content-Length', String(object.size));
  return new Response(object.body as unknown as ReadableStream, { status: 200, headers });
};
