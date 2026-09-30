/**
 * Capa de datos de Notes (ADR-008, ADR-011). Único punto que sabe de dónde vienen las notas:
 * Cloudflare D1 (binding `DB`). Las vistas reciben objetos normalizados y no conocen D1 ni R2.
 * Solo se usa en rutas renderizadas bajo demanda (`prerender = false`).
 */
import { env } from 'cloudflare:workers';
import { renderMarkdown } from './markdown';
import { noteCategories, notesConfig, type NoteCategoryId } from '../config/notes';
import { memberPath, notePath, notesListPath, withBase, type Lang } from '../i18n/utils';
import { getMembers } from './content';

export interface NoteAttachment {
  title: string;
  description?: string;
  url: string;
  filename: string;
  sizeBytes: number;
  type: 'pdf';
}

export interface NoteLink {
  title: string;
  url: string;
  kind: 'doi' | 'publisher' | 'open-access' | 'book' | 'other';
  description?: string;
}

export interface Note {
  id: number;
  slug: string;
  title: string;
  summary: string;
  lang: Lang;
  category: NoteCategoryId;
  tags: string[];
  featured: boolean;
  isTest: boolean;
  publishedAt: Date;
  updatedAt?: Date;
  cover?: { url: string; alt: string };
  author: { id: string; name: string; fullName: string };
  researchAreas: string[];
  links: NoteLink[];
  attachments: NoteAttachment[];
  /** id de la nota original si esta es una traducción. */
  translationOf?: number;
}

/** Nota con el cuerpo ya convertido a HTML seguro (solo en el detalle). */
export interface NoteWithBody extends Note {
  html: string;
}

interface NoteRow {
  id: number;
  slug: string;
  lang: Lang;
  translation_of: number | null;
  title: string;
  summary: string;
  content?: string;
  author_id: string;
  category: NoteCategoryId;
  is_test: number;
  featured: number;
  cover_key: string | null;
  cover_alt: string | null;
  research_areas: string;
  published_at: string;
  revised_at: string | null;
  has_pdf?: number;
  link_count?: number;
}

const LIST_COLUMNS = `n.id, n.slug, n.lang, n.translation_of, n.title, n.summary, n.author_id, n.category,
  n.is_test, n.featured, n.cover_key, n.cover_alt, n.research_areas, n.published_at, n.revised_at,
  EXISTS (SELECT 1 FROM attachments a WHERE a.note_id = n.id) AS has_pdf,
  (SELECT COUNT(*) FROM external_links l WHERE l.note_id = n.id) AS link_count`;

/** Notas de prueba visibles solo si la variable SHOW_TEST_NOTES = "true" (vista previa). */
export const showTestNotes = () => env.SHOW_TEST_NOTES === 'true';

/** Condición de visibilidad pública: publicada y, si no es vista previa, no de prueba. */
function visible(alias = 'n') {
  return `${alias}.status = 'published'${showTestNotes() ? '' : ` AND ${alias}.is_test = 0`}`;
}

/**
 * URL pública de un archivo. "r2:<clave>" → /files/<clave> (lo sirve el Worker desde R2, ADR-012).
 * "static:<ruta>" (anterior a NOTES-F4) → public/files/notes/<ruta>.
 */
export function fileUrl(storageKey: string): string {
  if (storageKey.startsWith('r2:')) return withBase(`/files/${storageKey.slice(3)}`);
  if (storageKey.startsWith('static:')) return withBase(`${notesConfig.filesDir}${storageKey.slice(7)}`);
  throw new Error(`[notes] almacenamiento no soportado: ${storageKey}`);
}

/**
 * Adjunto público por clave de R2: solo si pertenece a una nota visible (así los PDF de
 * borradores o notas archivadas no se pueden descargar aunque alguien conozca la URL).
 */
export async function visibleAttachment(key: string) {
  return env.DB.prepare(
    `SELECT a.original_filename, a.size_bytes FROM attachments a JOIN notes n ON n.id = a.note_id
     WHERE a.storage_key = ? AND ${visible()} LIMIT 1`,
  )
    .bind(`r2:${key}`)
    .first<{ original_filename: string; size_bytes: number }>();
}

const asDate = (d: string) => new Date(`${d.slice(0, 10)}T00:00:00Z`);

let authorsCache: Map<string, { name: string; fullName: string }> | undefined;
async function authors() {
  if (!authorsCache) {
    const members = await getMembers();
    authorsCache = new Map(
      members.map((m) => [
        m.id,
        { name: m.data.name, fullName: [m.data.academicTitle, m.data.name].filter(Boolean).join(' ') },
      ]),
    );
  }
  return authorsCache;
}

async function toNote(row: NoteRow, extra?: Partial<Pick<Note, 'links' | 'attachments' | 'tags'>>): Promise<Note> {
  const a = (await authors()).get(row.author_id) ?? { name: row.author_id, fullName: row.author_id };
  let researchAreas: string[] = [];
  try {
    researchAreas = JSON.parse(row.research_areas);
  } catch {
    researchAreas = [];
  }
  // En listados solo interesa si hay PDF y cuántos enlaces: se representan con marcadores.
  const attachments =
    extra?.attachments ?? (row.has_pdf ? [{ title: '', url: '', filename: '', sizeBytes: 0, type: 'pdf' as const }] : []);
  const links =
    extra?.links ?? Array.from({ length: row.link_count ?? 0 }, () => ({ title: '', url: '', kind: 'other' as const }));
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    lang: row.lang,
    category: row.category,
    tags: extra?.tags ?? [],
    featured: row.featured === 1,
    isTest: row.is_test === 1,
    publishedAt: asDate(row.published_at),
    updatedAt: row.revised_at ? asDate(row.revised_at) : undefined,
    cover: row.cover_key ? { url: fileUrl(row.cover_key), alt: row.cover_alt ?? '' } : undefined,
    author: { id: row.author_id, ...a },
    researchAreas,
    links,
    attachments,
    translationOf: row.translation_of ?? undefined,
  };
}

/** Nota destacada: la más reciente con `featured = 1`. */
export async function getFeaturedNote(): Promise<Note | undefined> {
  const row = await env.DB.prepare(
    `SELECT ${LIST_COLUMNS} FROM notes n WHERE ${visible()} AND n.featured = 1
     ORDER BY n.published_at DESC, n.id DESC LIMIT 1`,
  ).first<NoteRow>();
  return row ? toNote(row) : undefined;
}

/**
 * Una página de un listado (general o de categoría), de la más reciente a la más antigua.
 * En el listado general la destacada se muestra aparte y no se repite en la lista.
 */
export async function listNotes(opts: { page: number; category?: NoteCategoryId; excludeId?: number }) {
  const where = [visible()];
  const binds: (string | number)[] = [];
  if (opts.category) {
    where.push('n.category = ?');
    binds.push(opts.category);
  }
  if (opts.excludeId) {
    where.push('n.id <> ?');
    binds.push(opts.excludeId);
  }
  const clause = where.join(' AND ');
  const perPage = notesConfig.perPage;
  const offset = (Math.max(1, opts.page) - 1) * perPage;
  const [count, rows] = await env.DB.batch<{ total: number } | NoteRow>([
    env.DB.prepare(`SELECT COUNT(*) AS total FROM notes n WHERE ${clause}`).bind(...binds),
    env.DB.prepare(
      `SELECT ${LIST_COLUMNS} FROM notes n WHERE ${clause}
       ORDER BY n.published_at DESC, n.id DESC LIMIT ? OFFSET ?`,
    ).bind(...binds, perPage, offset),
  ]);
  const total = (count!.results[0] as { total: number }).total;
  return {
    items: await Promise.all((rows!.results as NoteRow[]).map((r) => toNote(r))),
    total,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

/** Categorías con al menos una nota visible (las vacías no se muestran). */
export async function usedCategories(): Promise<NoteCategoryId[]> {
  const { results } = await env.DB.prepare(`SELECT DISTINCT n.category FROM notes n WHERE ${visible()}`).all<{
    category: NoteCategoryId;
  }>();
  const used = new Set(results.map((r) => r.category));
  return (Object.keys(noteCategories) as NoteCategoryId[]).filter((c) => used.has(c));
}

/** ¿Hay alguna nota visible? (para el estado vacío). */
export async function hasNotes(): Promise<boolean> {
  const row = await env.DB.prepare(`SELECT 1 AS x FROM notes n WHERE ${visible()} LIMIT 1`).first();
  return row !== null;
}

/** Markdown → HTML seguro: micromark no deja pasar HTML crudo ni protocolos peligrosos. */
export { renderMarkdown };

/** Detalle de una nota por slug, con cuerpo, enlaces, archivos y etiquetas. */
export async function getNoteBySlug(
  slug: string,
  opts: { anyStatus?: boolean } = {},
): Promise<NoteWithBody | undefined> {
  // anyStatus: vista previa del panel (borradores y archivadas); nunca en rutas públicas.
  const row = await env.DB.prepare(
    `SELECT ${LIST_COLUMNS}, n.content FROM notes n WHERE ${opts.anyStatus ? '1 = 1' : visible()} AND n.slug = ?`,
  )
    .bind(slug)
    .first<NoteRow>();
  if (!row) return undefined;
  const [links, files, tags] = await env.DB.batch([
    env.DB.prepare(
      'SELECT title, url, kind, description FROM external_links WHERE note_id = ? ORDER BY position, id',
    ).bind(row.id),
    env.DB.prepare(
      `SELECT title, description, original_filename, storage_key, size_bytes
       FROM attachments WHERE note_id = ? ORDER BY position, id`,
    ).bind(row.id),
    env.DB.prepare(
      'SELECT t.name FROM note_tags nt JOIN tags t ON t.id = nt.tag_id WHERE nt.note_id = ? ORDER BY nt.position',
    ).bind(row.id),
  ]);
  const note = await toNote(row, {
    links: (links!.results as { title: string; url: string; kind: NoteLink['kind']; description: string | null }[]).map(
      (l) => ({ title: l.title, url: l.url, kind: l.kind, description: l.description ?? undefined }),
    ),
    attachments: (
      files!.results as {
        title: string;
        description: string | null;
        original_filename: string;
        storage_key: string;
        size_bytes: number;
      }[]
    ).map((f) => ({
      title: f.title,
      description: f.description ?? undefined,
      url: fileUrl(f.storage_key),
      filename: f.original_filename,
      sizeBytes: f.size_bytes,
      type: 'pdf' as const,
    })),
    tags: (tags!.results as { name: string }[]).map((t) => t.name),
  });
  return { ...note, html: renderMarkdown(row.content ?? '') };
}

/** Nota anterior (más antigua) y siguiente (más reciente) en el orden cronológico. */
export async function adjacentNotes(note: Note) {
  const date = note.publishedAt.toISOString().slice(0, 10);
  const cols = 'n.id, n.slug, n.title, n.lang';
  const [older, newer] = await env.DB.batch<{ id: number; slug: string; title: string; lang: Lang }>([
    env.DB.prepare(
      `SELECT ${cols} FROM notes n WHERE ${visible()}
       AND (n.published_at < ? OR (n.published_at = ? AND n.id < ?))
       ORDER BY n.published_at DESC, n.id DESC LIMIT 1`,
    ).bind(date, date, note.id),
    env.DB.prepare(
      `SELECT ${cols} FROM notes n WHERE ${visible()}
       AND (n.published_at > ? OR (n.published_at = ? AND n.id > ?))
       ORDER BY n.published_at ASC, n.id ASC LIMIT 1`,
    ).bind(date, date, note.id),
  ]);
  return { older: older!.results[0], newer: newer!.results[0] };
}

/** Traducción de una nota, en cualquiera de los dos sentidos. */
export async function translationFor(note: Note): Promise<{ slug: string; lang: Lang } | undefined> {
  const row = note.translationOf
    ? await env.DB.prepare(`SELECT n.slug, n.lang FROM notes n WHERE ${visible()} AND n.id = ?`)
        .bind(note.translationOf)
        .first<{ slug: string; lang: Lang }>()
    : await env.DB.prepare(`SELECT n.slug, n.lang FROM notes n WHERE ${visible()} AND n.translation_of = ? LIMIT 1`)
        .bind(note.id)
        .first<{ slug: string; lang: Lang }>();
  return row ?? undefined;
}

/** Todas las notas visibles (slug, idioma, fecha) para el sitemap de notas. */
export async function sitemapNotes() {
  const { results } = await env.DB.prepare(
    `SELECT n.slug, n.lang, n.category, COALESCE(n.revised_at, n.published_at) AS lastmod FROM notes n
     WHERE n.status = 'published' AND n.is_test = 0 ORDER BY n.published_at DESC`,
  ).all<{ slug: string; lang: Lang; category: NoteCategoryId; lastmod: string }>();
  return results;
}

export function categoryBySlug(slug: string, lang: Lang): NoteCategoryId | undefined {
  return (Object.keys(noteCategories) as NoteCategoryId[]).find((c) => noteCategories[c].slug[lang] === slug);
}

export function categoryPath(category: NoteCategoryId, lang: Lang, page = 1): string {
  return notesListPath(lang, page, noteCategories[category].slug[lang]);
}

/** Rutas de una nota: canónica, hreflang (solo con traducción real) y alternos del selector (ADR-009). */
export function noteUrls(note: Note, translation?: { slug: string; lang: Lang }) {
  const other: Lang = note.lang === 'en' ? 'es' : 'en';
  const hasTranslation = translation && translation.lang === other;
  const switcher = {
    [note.lang]: notePath(note.slug, note.lang),
    [other]: hasTranslation ? notePath(translation.slug, other) : notePath(note.slug, other),
  } as Record<Lang, string>;
  return {
    canonical: notePath(note.slug, note.lang),
    hreflang: hasTranslation ? switcher : null,
    alternatesFrom(lang: Lang): Record<Lang, string> {
      return lang === note.lang
        ? switcher
        : ({ [lang]: notePath(note.slug, lang), [note.lang]: switcher[note.lang] } as Record<Lang, string>);
    },
  };
}

export const authorPath = (note: Note, lang: Lang) => memberPath(note.author.id, lang);

/** "2.3 MB" / "840 KB". */
export function formatBytes(bytes: number, lang: Lang): string {
  const nf = new Intl.NumberFormat(lang === 'es' ? 'es-MX' : 'en-US', { maximumFractionDigits: 1 });
  if (bytes >= 1024 * 1024) return `${nf.format(bytes / 1024 / 1024)} MB`;
  return `${nf.format(Math.max(1, Math.round(bytes / 1024)))} KB`;
}

/** Fecha en el idioma de la interfaz. Las fechas de publicación son días (UTC). */
export function formatNoteDate(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-MX' : 'en-US', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(date);
}

export const isoDate = (date: Date) => date.toISOString().slice(0, 10);

/** Datos de un listado de notas, o `null` si la página o la categoría no existen (→ 404). */
export async function loadNotesListing(page: number, category?: NoteCategoryId) {
  if (!Number.isInteger(page) || page < 1) return null;
  const [featured, categories, any] = await Promise.all([
    category ? Promise.resolve(undefined) : getFeaturedNote(),
    usedCategories(),
    hasNotes(),
  ]);
  if (category && !categories.includes(category)) return null;
  const list = await listNotes({ page, category, excludeId: featured?.id });
  if (page > list.totalPages) return null;
  return { page, featured: page === 1 ? featured : undefined, categories, isEmpty: !any, ...list };
}

export type NotesListing = NonNullable<Awaited<ReturnType<typeof loadNotesListing>>>;

/** Datos del detalle de una nota, o `null` si no existe o no es visible (→ 404). */
export async function loadNoteDetail(slug: string, opts: { anyStatus?: boolean } = {}) {
  const note = await getNoteBySlug(slug, opts);
  if (!note) return null;
  const [translation, adjacent] = await Promise.all([translationFor(note), adjacentNotes(note)]);
  return { note, translation, ...adjacent };
}

export type NoteDetail = NonNullable<Awaited<ReturnType<typeof loadNoteDetail>>>;

/**
 * Respuesta 404 con la página de error estática del sitio (dist/client/404.html).
 * La 404 está prerenderizada, así que se sirve desde los assets en lugar de `Astro.rewrite`.
 */
export async function notFound(url: URL): Promise<Response> {
  const page = await env.ASSETS.fetch(new URL(withBase('/404'), url));
  return new Response(page.ok ? await page.text() : 'Not found', {
    status: 404,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

/** Número de página desde la URL ("2" → 2); cualquier otra cosa → NaN. */
export const parsePage = (value: string | undefined) => (value && /^[1-9]\d*$/.test(value) ? Number(value) : NaN);
