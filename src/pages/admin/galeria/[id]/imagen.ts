/** Panel: muestra la foto o su miniatura aunque no esté publicada (protegido por src/middleware.ts). */
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { serveGalleryObject } from '../../../../utils/gallery';

export const prerender = false;

export const GET: APIRoute = async ({ params, url, request }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return new Response('Not found', { status: 404 });
  const row = await env.DB.prepare('SELECT image_key, thumb_key FROM gallery_photos WHERE id = ?')
    .bind(id)
    .first<{ image_key: string; thumb_key: string }>();
  if (!row) return new Response('Not found', { status: 404 });
  const key = url.searchParams.get('t') === 'full' ? row.image_key : row.thumb_key;
  return serveGalleryObject(key, request, 'private, max-age=3600');
};
