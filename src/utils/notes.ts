/**
 * Capa de datos de Notes (ADR-008). Único punto que sabe de dónde vienen las notas:
 * hoy de la colección `notes`; en la Etapa B, de D1. Las vistas reciben objetos normalizados.
 */
import { statSync } from 'node:fs';
import { join } from 'node:path';
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { noteCategories, notesConfig, showTestNotes, type NoteCategoryId } from '../config/notes';
import { memberPath, notePath, notesListPath, withBase, type Lang } from '../i18n/utils';

export type NoteEntry = CollectionEntry<'notes'>;

export interface NoteAttachment {
  title: string;
  description?: string;
  url: string;
  filename: string;
  sizeBytes: number;
  type: 'pdf';
}

export interface Note {
  /** Slug (nombre del archivo). */
  slug: string;
  entry: NoteEntry;
  title: string;
  summary: string;
  lang: Lang;
  category: NoteCategoryId;
  tags: string[];
  featured: boolean;
  isTest: boolean;
  publishedAt: Date;
  updatedAt?: Date;
  cover?: NoteEntry['data']['cover'];
  author: { id: string; name: string; fullName: string };
  researchAreas: string[];
  links: NoteEntry['data']['links'];
  attachments: NoteAttachment[];
  /** Slug de la nota original si esta es una traducción. */
  translationOf?: string;
}

const publicDir = join(process.cwd(), 'public');

function resolveAttachment(slug: string, a: NoteEntry['data']['attachments'][number]): NoteAttachment {
  const rel = `${notesConfig.filesDir}${a.file}`;
  let size: number;
  try {
    size = statSync(join(publicDir, rel)).size;
  } catch {
    throw new Error(`[notes] "${slug}": no existe el archivo public${rel}`);
  }
  if (size > notesConfig.maxAttachmentBytes) {
    throw new Error(`[notes] "${slug}": ${a.file} supera ${notesConfig.maxAttachmentBytes / 1024 / 1024} MB`);
  }
  return {
    title: a.title,
    description: a.description,
    url: withBase(rel),
    filename: a.file.split('/').at(-1)!,
    sizeBytes: size,
    type: 'pdf',
  };
}

let cache: Promise<Note[]> | undefined;

/**
 * Notas publicadas (y las de prueba si `showTestNotes`), de la más reciente a la más antigua.
 * Valida adjuntos, slugs reservados y que haya como máximo una nota destacada.
 */
export function getNotes(): Promise<Note[]> {
  cache ??= loadNotes();
  return cache;
}

async function loadNotes(): Promise<Note[]> {
  const entries = await getCollection(
    'notes',
    (e) => e.data.status === 'published' && (showTestNotes || !e.data.isTest),
  );
  const notes = await Promise.all(
    entries.map(async (e): Promise<Note> => {
      const d = e.data;
      if ((notesConfig.reservedSlugs as readonly string[]).includes(e.id)) {
        throw new Error(`[notes] el slug "${e.id}" está reservado; renombra el archivo.`);
      }
      const author = await getEntry(d.author);
      if (!author) throw new Error(`[notes] "${e.id}": autor desconocido`);
      return {
        slug: e.id,
        entry: e,
        title: d.title,
        summary: d.summary,
        lang: d.lang,
        category: d.category,
        tags: d.tags,
        featured: d.featured,
        isTest: d.isTest,
        publishedAt: d.publishedAt,
        updatedAt: d.updatedAt,
        cover: d.cover,
        author: {
          id: author.id,
          name: author.data.name,
          fullName: [author.data.academicTitle, author.data.name].filter(Boolean).join(' '),
        },
        researchAreas: d.researchAreas.map((r) => r.id),
        links: d.links,
        attachments: d.attachments.map((a) => resolveAttachment(e.id, a)),
        translationOf: d.translationOf?.id,
      };
    }),
  );
  return notes.sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime() || a.title.localeCompare(b.title),
  );
}

/** Nota destacada: la más reciente con `featured: true`. */
export function featuredNote(notes: Note[]): Note | undefined {
  return notes.find((n) => n.featured);
}

/**
 * Notas que van en la lista de un listado (general o de categoría). En el listado general,
 * la destacada se muestra aparte (solo en la página 1) y no se repite en la lista.
 */
export function listedNotes(all: Note[], category?: NoteCategoryId): Note[] {
  if (category) return all.filter((n) => n.category === category);
  const featured = featuredNote(all);
  return featured ? all.filter((n) => n !== featured) : all;
}

/** Categorías que tienen al menos una nota (las vacías no se muestran). */
export function usedCategories(notes: Note[]): NoteCategoryId[] {
  return (Object.keys(noteCategories) as NoteCategoryId[]).filter((c) => notes.some((n) => n.category === c));
}

export function categoryBySlug(slug: string, lang: Lang): NoteCategoryId | undefined {
  return (Object.keys(noteCategories) as NoteCategoryId[]).find((c) => noteCategories[c].slug[lang] === slug);
}

export function categoryPath(category: NoteCategoryId, lang: Lang, page = 1): string {
  return notesListPath(lang, page, noteCategories[category].slug[lang]);
}

/** Traducción de una nota, en cualquiera de los dos sentidos. */
export function translationFor(note: Note, notes: Note[]): Note | undefined {
  if (note.translationOf) return notes.find((n) => n.slug === note.translationOf);
  return notes.find((n) => n.translationOf === note.slug);
}

/** Divide en páginas. Siempre hay al menos una página (puede estar vacía). */
export function paginate<T>(items: T[], perPage = notesConfig.perPage) {
  const total = Math.max(1, Math.ceil(items.length / perPage));
  return Array.from({ length: total }, (_, i) => ({
    page: i + 1,
    total,
    items: items.slice(i * perPage, (i + 1) * perPage),
  }));
}

/** Rutas de una nota: detalle en cada interfaz, canónica y alternos del selector de idioma. */
export function noteUrls(note: Note, notes: Note[]) {
  const translation = translationFor(note, notes);
  const other: Lang = note.lang === 'en' ? 'es' : 'en';
  const switcher = {
    [note.lang]: notePath(note.slug, note.lang),
    [other]: translation && translation.lang === other ? notePath(translation.slug, other) : notePath(note.slug, other),
  } as Record<Lang, string>;
  return {
    canonical: notePath(note.slug, note.lang),
    /** Solo si hay traducción real (ADR-009). */
    hreflang: translation && translation.lang === other ? switcher : null,
    /** Para el selector de idioma desde la interfaz `lang`. */
    alternatesFrom(lang: Lang): Record<Lang, string> {
      return lang === note.lang ? switcher : { [lang]: notePath(note.slug, lang), [note.lang]: switcher[note.lang] } as Record<Lang, string>;
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

/** Fecha en el idioma de la interfaz. Las fechas del frontmatter son días (UTC). */
export function formatNoteDate(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-MX' : 'en-US', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(date);
}

export const isoDate = (date: Date) => date.toISOString().slice(0, 10);
