/**
 * Sitemap de Notes (bajo demanda, desde D1). @astrojs/sitemap solo ve las páginas estáticas;
 * este archivo añade el listado, las categorías con notas y la URL canónica de cada nota (ADR-009).
 * Las notas de prueba nunca se incluyen. Referenciado en public/robots.txt.
 */
import type { APIRoute } from 'astro';
import { site } from '../config/site';
import { notePath, notesListPath } from '../i18n/utils';
import { noteCategories, type NoteCategoryId } from '../config/notes';
import { categoryPath, sitemapNotes } from '../utils/notes';

export const prerender = false;

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export const GET: APIRoute = async ({ site: astroSite }) => {
  const base = astroSite ?? new URL(site.url);
  const abs = (path: string) => escape(new URL(path, base).href);
  const notes = await sitemapNotes();
  // Solo categorías con notas reales (nunca por notas de prueba).
  const categories = (Object.keys(noteCategories) as NoteCategoryId[]).filter((c) => notes.some((n) => n.category === c));
  const urls: { loc: string; lastmod?: string }[] = [];
  if (notes.length > 0) {
    urls.push({ loc: abs(notesListPath('en')) }, { loc: abs(notesListPath('es')) });
    for (const c of categories) urls.push({ loc: abs(categoryPath(c, 'en')) }, { loc: abs(categoryPath(c, 'es')) });
    for (const n of notes) urls.push({ loc: abs(notePath(n.slug, n.lang)), lastmod: n.lastmod.slice(0, 10) });
  }
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n') +
    '\n</urlset>\n';
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
