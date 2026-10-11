/**
 * Fotos de la Galería desde R2 (ADR-015): /files/gallery/<año>/<archivo>.<webp|jpg|png>
 * Solo se sirven fotos publicadas; las sin publicar se ven en el panel (/admin/galeria/<id>/imagen/).
 */
import type { APIRoute } from 'astro';
import { isPublishedGalleryKey, serveGalleryObject } from '../../../utils/gallery';

const notFound = () => new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain' } });

export function galleryRoute(ext: 'webp' | 'jpg' | 'png'): APIRoute {
  return async ({ params, request }) => {
    const key = `gallery/${params.key ?? ''}.${ext}`;
    if (!/^gallery\/[a-z0-9/_-]+\.(webp|jpg|png)$/.test(key) || key.includes('..')) return notFound();
    if (!(await isPublishedGalleryKey(key))) return notFound();
    // Las claves llevan un identificador único: un cambio de foto siempre usa una clave nueva.
    return serveGalleryObject(key, request, 'public, max-age=86400');
  };
}
