/** Panel: vista previa del Markdown del editor (mismo conversor seguro que el sitio). */
import type { APIRoute } from 'astro';
import { renderMarkdown } from '../../../utils/notes';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const text = (await request.text()).slice(0, 100_000);
  return new Response(renderMarkdown(text), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
};
