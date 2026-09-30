/**
 * Operaciones del panel de Notes sobre D1 y R2 (NOTES-F5). Solo se usa detrás de /admin
 * (middleware + Cloudflare Access). Toda validación ocurre aquí, en el servidor (§44).
 */
import { env } from 'cloudflare:workers';
import { noteCategoryIds, notesConfig, type NoteCategoryId } from '../config/notes';
import type { Lang } from '../i18n/ui';
import { deleteNoteFile, putNoteFile, UploadError, validateNoteFile } from './storage';

export type NoteStatus = 'draft' | 'published' | 'archived';
export const STATUSES: NoteStatus[] = ['draft', 'published', 'archived'];
export const LINK_KINDS = ['doi', 'publisher', 'open-access', 'book', 'other'] as const;

export interface AdminLink {
  title: string;
  url: string;
  kind: (typeof LINK_KINDS)[number];
  description: string;
}

export interface AdminAttachment {
  id: number;
  title: string;
  originalFilename: string;
  storageKey: string;
  sizeBytes: number;
  rights: string;
}

/** Datos del formulario del editor (también lo que se muestra al editar). */
export interface NoteDraft {
  id?: number;
  slug: string;
  lang: Lang;
  title: string;
  summary: string;
  content: string;
  authorId: string;
  category: NoteCategoryId;
  status: NoteStatus;
  isTest: boolean;
  featured: boolean;
  publishedAt: string;
  revisedAt: string;
  researchAreas: string[];
  translationOf: number | null;
  tags: string[];
  links: AdminLink[];
  attachments: AdminAttachment[];
  updatedAt?: string;
}

export type FieldErrors = Partial<Record<string, string>>;

/** Hoy en Tapachula (YYYY-MM-DD). */
export function today(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City' }).format(new Date());
}

export function emptyDraft(authorId: string): NoteDraft {
  return {
    slug: '',
    lang: 'es',
    title: '',
    summary: '',
    content: '',
    authorId,
    category: 'opinion',
    status: 'draft',
    isTest: false,
    featured: false,
    publishedAt: today(),
    revisedAt: '',
    researchAreas: [],
    translationOf: null,
    tags: [],
    links: [],
    attachments: [],
  };
}

/** "Título de la Nota: ORCA 6" → "titulo-de-la-nota-orca-6". */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}

const normalizeTag = (t: string) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

const isDate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(`${d}T00:00:00Z`));

// ——— Lectura ———

export async function authors() {
  const { results } = await env.DB.prepare('SELECT id, email FROM authors WHERE active = 1 ORDER BY id').all<{
    id: string;
    email: string | null;
  }>();
  return results;
}

export async function statusCounts() {
  const { results } = await env.DB.prepare('SELECT status, COUNT(*) AS n FROM notes GROUP BY status').all<{
    status: NoteStatus;
    n: number;
  }>();
  const counts: Record<NoteStatus, number> = { draft: 0, published: 0, archived: 0 };
  for (const r of results) counts[r.status] = r.n;
  return counts;
}

export interface AdminListItem {
  id: number;
  slug: string;
  title: string;
  lang: Lang;
  category: NoteCategoryId;
  status: NoteStatus;
  isTest: boolean;
  featured: boolean;
  publishedAt: string;
  updatedAt: string;
  files: number;
}

export async function listAdminNotes(status?: NoteStatus, limit = 200): Promise<AdminListItem[]> {
  const where = status ? 'WHERE n.status = ?' : '';
  const stmt = env.DB.prepare(
    `SELECT n.id, n.slug, n.title, n.lang, n.category, n.status, n.is_test, n.featured, n.published_at,
       n.updated_at, (SELECT COUNT(*) FROM attachments a WHERE a.note_id = n.id) AS files
     FROM notes n ${where} ORDER BY n.updated_at DESC, n.id DESC LIMIT ?`,
  );
  const { results } = await (status ? stmt.bind(status, limit) : stmt.bind(limit)).all<{
    id: number;
    slug: string;
    title: string;
    lang: Lang;
    category: NoteCategoryId;
    status: NoteStatus;
    is_test: number;
    featured: number;
    published_at: string;
    updated_at: string;
    files: number;
  }>();
  return results.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    lang: r.lang,
    category: r.category,
    status: r.status,
    isTest: r.is_test === 1,
    featured: r.featured === 1,
    publishedAt: r.published_at,
    updatedAt: r.updated_at,
    files: r.files,
  }));
}

/** Notas que pueden ser "original" de una traducción (del otro idioma). */
export async function translationCandidates(lang: Lang, excludeId?: number) {
  const other = lang === 'es' ? 'en' : 'es';
  const { results } = await env.DB.prepare(
    `SELECT id, title FROM notes WHERE lang = ? AND id <> ? AND status <> 'archived' ORDER BY published_at DESC LIMIT 200`,
  )
    .bind(other, excludeId ?? 0)
    .all<{ id: number; title: string }>();
  return results;
}

export async function getAdminNote(id: number): Promise<NoteDraft | undefined> {
  const row = await env.DB.prepare('SELECT * FROM notes WHERE id = ?').bind(id).first<Record<string, unknown>>();
  if (!row) return undefined;
  const [links, files, tags] = await env.DB.batch([
    env.DB.prepare(
      'SELECT title, url, kind, description FROM external_links WHERE note_id = ? ORDER BY position, id',
    ).bind(id),
    env.DB.prepare(
      `SELECT id, title, original_filename, storage_key, size_bytes, rights FROM attachments
       WHERE note_id = ? ORDER BY position, id`,
    ).bind(id),
    env.DB.prepare(
      'SELECT t.name FROM note_tags nt JOIN tags t ON t.id = nt.tag_id WHERE nt.note_id = ? ORDER BY nt.position',
    ).bind(id),
  ]);
  let researchAreas: string[] = [];
  try {
    researchAreas = JSON.parse(String(row.research_areas ?? '[]'));
  } catch {
    researchAreas = [];
  }
  return {
    id,
    slug: String(row.slug),
    lang: row.lang as Lang,
    title: String(row.title),
    summary: String(row.summary),
    content: String(row.content ?? ''),
    authorId: String(row.author_id),
    category: row.category as NoteCategoryId,
    status: row.status as NoteStatus,
    isTest: row.is_test === 1,
    featured: row.featured === 1,
    publishedAt: String(row.published_at),
    revisedAt: row.revised_at ? String(row.revised_at) : '',
    researchAreas,
    translationOf: row.translation_of ? Number(row.translation_of) : null,
    updatedAt: String(row.updated_at),
    links: (links!.results as { title: string; url: string; kind: AdminLink['kind']; description: string | null }[]).map(
      (l) => ({ ...l, description: l.description ?? '' }),
    ),
    attachments: (
      files!.results as {
        id: number;
        title: string;
        original_filename: string;
        storage_key: string;
        size_bytes: number;
        rights: string;
      }[]
    ).map((f) => ({
      id: f.id,
      title: f.title,
      originalFilename: f.original_filename,
      storageKey: f.storage_key,
      sizeBytes: f.size_bytes,
      rights: f.rights,
    })),
    tags: (tags!.results as { name: string }[]).map((t) => t.name),
  };
}

// ——— Formulario ———

export interface ParsedForm {
  draft: NoteDraft;
  newFile: { file: File; title: string; rights: string; description: string } | null;
  removeAttachmentIds: number[];
  slugTouched: boolean;
}

const str = (form: FormData, key: string) => String(form.get(key) ?? '').trim();

/** Lee el formulario del editor sin validar todavía. */
export function parseForm(form: FormData, base: NoteDraft): ParsedForm {
  const titles = form.getAll('link_title').map(String);
  const urls = form.getAll('link_url').map(String);
  const kinds = form.getAll('link_kind').map(String);
  const descs = form.getAll('link_description').map(String);
  const links: AdminLink[] = [];
  for (let i = 0; i < Math.max(titles.length, urls.length); i++) {
    const url = (urls[i] ?? '').trim();
    const title = (titles[i] ?? '').trim();
    if (!url && !title) continue;
    const kind = (LINK_KINDS as readonly string[]).includes(kinds[i] ?? '') ? (kinds[i] as AdminLink['kind']) : 'other';
    links.push({ title, url, kind, description: (descs[i] ?? '').trim() });
  }
  const translation = str(form, 'translationOf');
  const file = form.get('new_file');
  const hasFile = file instanceof File && file.size > 0;
  const slugInput = str(form, 'slug');
  return {
    draft: {
      ...base,
      title: str(form, 'title'),
      slug: base.status === 'published' ? base.slug : slugInput,
      lang: str(form, 'lang') === 'en' ? 'en' : 'es',
      summary: str(form, 'summary'),
      content: String(form.get('content') ?? '').replace(/\r\n/g, '\n'),
      authorId: str(form, 'authorId') || base.authorId,
      category: str(form, 'category') as NoteCategoryId,
      featured: form.get('featured') === 'on',
      publishedAt: str(form, 'publishedAt') || today(),
      revisedAt: str(form, 'revisedAt'),
      researchAreas: form.getAll('researchAreas').map(String),
      translationOf: translation ? Number(translation) : null,
      tags: [
        ...new Map(
          str(form, 'tags')
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
            .map((t) => [normalizeTag(t), t] as const),
        ).values(),
      ],
      links,
    },
    newFile: hasFile
      ? {
          file,
          title: str(form, 'new_file_title') || file.name.replace(/\.pdf$/i, ''),
          rights: str(form, 'new_file_rights'),
          description: str(form, 'new_file_description'),
        }
      : null,
    removeAttachmentIds: form
      .getAll('remove_attachment')
      .map(Number)
      .filter((n) => Number.isInteger(n)),
    slugTouched: slugInput !== '',
  };
}

/** Valida el borrador. Devuelve errores por campo (vacío = válido). */
export async function validate(parsed: ParsedForm, validResearch: string[], authorIds: string[]): Promise<FieldErrors> {
  const d = parsed.draft;
  const e: FieldErrors = {};
  if (!d.title) e.title = 'El título es obligatorio.';
  else if (d.title.length > 200) e.title = 'El título es demasiado largo (máx. 200 caracteres).';

  if (!d.slug && d.status !== 'published') d.slug = slugify(d.title);
  if (!d.slug && !d.title) {
    // Sin título ni URL: basta con el error del título.
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(d.slug)) e.slug = 'La URL solo admite minúsculas, números y guiones.';
  else if (d.slug.length > 80) e.slug = 'La URL es demasiado larga (máx. 80 caracteres).';
  else if ((notesConfig.reservedSlugs as readonly string[]).includes(d.slug)) e.slug = 'Esa URL está reservada.';
  else {
    const clash = await env.DB.prepare('SELECT id FROM notes WHERE slug = ? AND id <> ?')
      .bind(d.slug, d.id ?? 0)
      .first();
    if (clash) e.slug = 'Ya existe una nota con esta URL.';
  }

  if (!d.summary) e.summary = 'El resumen es obligatorio.';
  else if (d.summary.length > 320) e.summary = 'El resumen admite hasta 320 caracteres.';
  if (!(noteCategoryIds as readonly string[]).includes(d.category)) e.category = 'Elige una categoría.';
  if (!authorIds.includes(d.authorId)) e.authorId = 'Elige un autor.';
  if (d.content.length > 100_000) e.content = 'El texto es demasiado largo.';
  if (!isDate(d.publishedAt)) e.publishedAt = 'Fecha no válida.';
  if (d.revisedAt && !isDate(d.revisedAt)) e.revisedAt = 'Fecha no válida.';
  else if (d.revisedAt && d.revisedAt < d.publishedAt) e.revisedAt = 'No puede ser anterior a la publicación.';
  if (d.tags.length > 10) e.tags = 'Máximo 10 etiquetas.';
  else if (d.tags.some((t) => t.length > 40)) e.tags = 'Cada etiqueta admite hasta 40 caracteres.';
  d.researchAreas = d.researchAreas.filter((r) => validResearch.includes(r));

  if (d.links.length > 20) e.links = 'Máximo 20 enlaces.';
  for (const l of d.links) {
    if (!l.title || !l.url) {
      e.links = 'Cada enlace necesita título y dirección.';
      break;
    }
    try {
      const u = new URL(l.url);
      if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new Error();
    } catch {
      e.links = `La dirección "${l.url}" no es válida (debe empezar con https://).`;
      break;
    }
  }

  if (d.translationOf) {
    const t = await env.DB.prepare('SELECT lang FROM notes WHERE id = ?').bind(d.translationOf).first<{ lang: Lang }>();
    if (!t || t.lang === d.lang || d.translationOf === d.id) e.translationOf = 'La nota original debe estar en el otro idioma.';
  }

  if (parsed.newFile) {
    try {
      await validateNoteFile(parsed.newFile.file, parsed.newFile.rights);
    } catch (err) {
      if (err instanceof UploadError) e.new_file = err.message;
      else throw err;
    }
  }
  return e;
}

// ——— Escritura ———

/**
 * Crea o actualiza la nota con sus etiquetas, enlaces y archivos. Devuelve el id y, si el PDF nuevo
 * no se pudo subir (caso raro: la validación previa ya pasó), el motivo; la nota queda guardada.
 */
export async function saveNote(
  parsed: ParsedForm,
  editorEmail: string,
  status?: NoteStatus,
): Promise<{ id: number; uploadError?: string }> {
  const d = parsed.draft;
  const nextStatus = status ?? d.status;
  const now = new Date().toISOString();
  let id = d.id;

  const values = [
    d.slug,
    d.lang,
    d.translationOf,
    d.title,
    d.summary,
    d.content,
    d.authorId,
    d.category,
    nextStatus,
    d.featured ? 1 : 0,
    JSON.stringify(d.researchAreas),
    d.publishedAt,
    d.revisedAt || null,
  ];
  if (id) {
    await env.DB.prepare(
      `UPDATE notes SET slug = ?, lang = ?, translation_of = ?, title = ?, summary = ?, content = ?, author_id = ?,
         category = ?, status = ?, featured = ?, research_areas = ?, published_at = ?, revised_at = ?, updated_at = ?
       WHERE id = ?`,
    )
      .bind(...values, now, id)
      .run();
  } else {
    const row = await env.DB.prepare(
      `INSERT INTO notes (slug, lang, translation_of, title, summary, content, author_id, category, status, featured,
         research_areas, published_at, revised_at, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
    )
      .bind(...values, editorEmail)
      .first<{ id: number }>();
    id = row!.id;
  }

  // Etiquetas, enlaces y destacada única en un solo lote (sin estados parciales, §89).
  const stmts = [
    env.DB.prepare('DELETE FROM note_tags WHERE note_id = ?').bind(id),
    env.DB.prepare('DELETE FROM external_links WHERE note_id = ?').bind(id),
    ...d.tags.flatMap((name, i) => [
      env.DB.prepare('INSERT OR IGNORE INTO tags (name, normalized_name) VALUES (?, ?)').bind(name, normalizeTag(name)),
      env.DB.prepare(
        'INSERT OR IGNORE INTO note_tags (note_id, tag_id, position) SELECT ?, id, ? FROM tags WHERE normalized_name = ?',
      ).bind(id, i, normalizeTag(name)),
    ]),
    ...d.links.map((l, i) =>
      env.DB.prepare(
        'INSERT INTO external_links (note_id, title, url, kind, description, position) VALUES (?, ?, ?, ?, ?, ?)',
      ).bind(id, l.title, l.url, l.kind, l.description || null, i),
    ),
  ];
  if (d.featured) stmts.push(env.DB.prepare('UPDATE notes SET featured = 0 WHERE id <> ?').bind(id));
  await env.DB.batch(stmts);

  // Archivos que se quitan: primero la fila, después el objeto si nadie más lo usa (§70).
  for (const attId of parsed.removeAttachmentIds) {
    const att = await env.DB.prepare('SELECT storage_key FROM attachments WHERE id = ? AND note_id = ?')
      .bind(attId, id)
      .first<{ storage_key: string }>();
    if (!att) continue;
    await env.DB.prepare('DELETE FROM attachments WHERE id = ?').bind(attId).run();
    const still = await env.DB.prepare('SELECT 1 FROM attachments WHERE storage_key = ?').bind(att.storage_key).first();
    if (!still) await deleteNoteFile(att.storage_key);
  }

  // Archivo nuevo: primero R2; si la fila falla, se borra el objeto (§88).
  if (parsed.newFile) {
    let up: Awaited<ReturnType<typeof putNoteFile>>;
    try {
      up = await putNoteFile(parsed.newFile.file, id, parsed.newFile.rights);
    } catch (err) {
      if (err instanceof UploadError) return { id, uploadError: err.message };
      throw err;
    }
    try {
      await env.DB.prepare(
        `INSERT INTO attachments (note_id, title, description, original_filename, storage_key, mime_type, size_bytes,
           rights, position, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, (SELECT COALESCE(MAX(position), -1) + 1 FROM attachments WHERE note_id = ?), ?)`,
      )
        .bind(
          id,
          parsed.newFile.title,
          parsed.newFile.description || null,
          up.originalFilename,
          up.storageKey,
          up.mimeType,
          up.sizeBytes,
          up.rights,
          id,
          editorEmail,
        )
        .run();
    } catch (err) {
      await deleteNoteFile(up.storageKey);
      throw err;
    }
  }
  return { id };
}

/** Cambia solo el estado (publicar, despublicar, archivar, restaurar). */
export async function setStatus(id: number, status: NoteStatus) {
  const extra = status === 'published' ? ", published_at = COALESCE(NULLIF(published_at, ''), ?)" : '';
  const stmt = env.DB.prepare(`UPDATE notes SET status = ?, updated_at = ?${extra} WHERE id = ?`);
  const now = new Date().toISOString();
  await (status === 'published' ? stmt.bind(status, now, today(), id) : stmt.bind(status, now, id)).run();
}

/** Borra la nota para siempre, con sus archivos en R2 (solo desde "archivada", con confirmación). */
export async function deleteNotePermanently(id: number) {
  const { results } = await env.DB.prepare('SELECT storage_key FROM attachments WHERE note_id = ?')
    .bind(id)
    .all<{ storage_key: string }>();
  await env.DB.batch([
    env.DB.prepare('UPDATE notes SET translation_of = NULL WHERE translation_of = ?').bind(id),
    env.DB.prepare('DELETE FROM note_tags WHERE note_id = ?').bind(id),
    env.DB.prepare('DELETE FROM external_links WHERE note_id = ?').bind(id),
    env.DB.prepare('DELETE FROM attachments WHERE note_id = ?').bind(id),
    env.DB.prepare('DELETE FROM notes WHERE id = ?').bind(id),
  ]);
  for (const r of results) {
    const still = await env.DB.prepare('SELECT 1 FROM attachments WHERE storage_key = ?').bind(r.storage_key).first();
    if (!still) await deleteNoteFile(r.storage_key);
  }
}

export { UploadError };
