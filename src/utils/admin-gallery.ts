/**
 * Panel: alta, edición y borrado de fotos de la Galería (ADR-015).
 * El navegador del editor reduce la foto antes de subirla (src/components/admin/gallery-editor.ts):
 * llega una foto grande (lado mayor ≤ 2000 px) y una miniatura (≤ 960 px). Sin JavaScript llega el
 * original (hasta 10 MB) y se usa también como miniatura.
 */
import { env } from 'cloudflare:workers';
import {
  galleryFocusIds,
  galleryLicenseIds,
  galleryMaxBytes,
  galleryRightsIds,
  type GalleryFocus,
  type GalleryLicense,
  type GalleryRights,
} from '../config/gallery';
import { withBase, type Lang } from '../i18n/utils';
import { ensureGallery, ORDER_BY, type GalleryRow, type GalleryStatus } from './gallery';
import { imageInfo, type ImageInfo } from './image-info';
import { safeBaseName, STORAGE_LIMIT_BYTES, storageUsage } from './storage';

export const LIMITS = { caption: 140, alt: 400, place: 100, credit: 120, url: 500 } as const;

export interface GalleryDraft {
  lang: Lang;
  /** Textos en el idioma elegido. */
  caption: string;
  alt: string;
  place: string;
  /** Traducción opcional al otro idioma. */
  captionTr: string;
  altTr: string;
  placeTr: string;
  year: string;
  takenOn: string;
  credit: string;
  sourceUrl: string;
  license: GalleryLicense;
  rights: GalleryRights | '';
  focus: GalleryFocus;
  status: GalleryStatus;
}

export type FieldErrors = Partial<Record<keyof GalleryDraft | 'photo', string>>;

/** Foto ya guardada (para editar). */
export interface AdminPhoto {
  id: number;
  draft: GalleryDraft;
  imageUrl: string;
  thumbUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  originalFilename: string | null;
  isSeed: boolean;
  updatedAt: string;
  row: GalleryRow;
}

const other = (lang: Lang): Lang => (lang === 'es' ? 'en' : 'es');

/** Imagen vista desde el panel: funciona también para fotos sin publicar. */
export const adminImageUrl = (id: number, size: 'full' | 'thumb', updatedAt: string) =>
  withBase(`/admin/galeria/${id}/imagen/?t=${size}&v=${encodeURIComponent(updatedAt)}`);

export function emptyDraft(): GalleryDraft {
  return {
    lang: 'es',
    caption: '',
    alt: '',
    place: '',
    captionTr: '',
    altTr: '',
    placeTr: '',
    year: String(new Date().getUTCFullYear()),
    takenOn: '',
    credit: 'José Luis Cabellos',
    sourceUrl: '',
    license: 'none',
    rights: '',
    focus: 'center',
    status: 'published',
  };
}

function rowToDraft(r: GalleryRow): GalleryDraft {
  const col = (base: 'caption' | 'alt' | 'place', lang: Lang) => (r[`${base}_${lang}` as keyof GalleryRow] as string | null) ?? '';
  const tr = other(r.lang);
  return {
    lang: r.lang,
    caption: col('caption', r.lang),
    alt: col('alt', r.lang),
    place: col('place', r.lang),
    captionTr: col('caption', tr),
    altTr: col('alt', tr),
    placeTr: col('place', tr),
    year: String(r.year),
    takenOn: r.taken_on ?? '',
    credit: r.credit,
    sourceUrl: r.source_url ?? '',
    license: r.license,
    rights: r.rights,
    focus: r.focus,
    status: r.status,
  };
}

function toAdminPhoto(r: GalleryRow): AdminPhoto {
  return {
    id: r.id,
    draft: rowToDraft(r),
    imageUrl: adminImageUrl(r.id, 'full', r.updated_at),
    thumbUrl: adminImageUrl(r.id, 'thumb', r.updated_at),
    width: r.width,
    height: r.height,
    sizeBytes: r.size_bytes,
    originalFilename: r.original_filename,
    isSeed: Boolean(r.seed_id),
    updatedAt: r.updated_at,
    row: r,
  };
}

/* ——— Lectura ——— */

export async function listAdminPhotos(status?: GalleryStatus): Promise<AdminPhoto[]> {
  await ensureGallery();
  const where = status ? 'WHERE status = ?' : '';
  const stmt = env.DB.prepare(`SELECT * FROM gallery_photos ${where} ORDER BY ${ORDER_BY}`);
  const { results } = await (status ? stmt.bind(status) : stmt).all<GalleryRow>();
  return results.map(toAdminPhoto);
}

export async function getAdminPhoto(id: number): Promise<AdminPhoto | undefined> {
  await ensureGallery();
  const row = await env.DB.prepare('SELECT * FROM gallery_photos WHERE id = ?').bind(id).first<GalleryRow>();
  return row ? toAdminPhoto(row) : undefined;
}

export async function galleryCounts(): Promise<Record<GalleryStatus, number>> {
  const counts: Record<GalleryStatus, number> = { published: 0, draft: 0 };
  try {
    await ensureGallery();
    const { results } = await env.DB.prepare('SELECT status, COUNT(*) AS n FROM gallery_photos GROUP BY status').all<{
      status: GalleryStatus;
      n: number;
    }>();
    for (const r of results) counts[r.status] = r.n;
  } catch (e) {
    console.error('Galería: no se pudieron contar las fotos', e);
  }
  return counts;
}

/* ——— Formulario ——— */

export interface ParsedForm {
  draft: GalleryDraft;
  photo: File | null;
  thumb: File | null;
  originalName: string;
}

const text = (form: FormData, key: string) => String(form.get(key) ?? '').replace(/\r\n/g, '\n').trim();
const oneLine = (form: FormData, key: string) => text(form, key).replace(/\s+/g, ' ');
const fileOf = (form: FormData, key: string) => {
  const f = form.get(key);
  return f instanceof File && f.size > 0 ? f : null;
};

export function parseForm(form: FormData, base: GalleryDraft): ParsedForm {
  const lang = form.get('lang') === 'en' ? 'en' : 'es';
  const license = String(form.get('license') ?? '');
  const rights = String(form.get('rights') ?? '');
  const focus = String(form.get('focus') ?? '');
  const draft: GalleryDraft = {
    ...base,
    lang,
    caption: oneLine(form, 'caption'),
    alt: oneLine(form, 'alt'),
    place: oneLine(form, 'place'),
    captionTr: oneLine(form, 'captionTr'),
    altTr: oneLine(form, 'altTr'),
    placeTr: oneLine(form, 'placeTr'),
    year: oneLine(form, 'year'),
    takenOn: oneLine(form, 'takenOn'),
    credit: oneLine(form, 'credit'),
    sourceUrl: oneLine(form, 'sourceUrl'),
    license: (galleryLicenseIds as string[]).includes(license) ? (license as GalleryLicense) : 'none',
    rights: (galleryRightsIds as string[]).includes(rights) ? (rights as GalleryRights) : '',
    focus: (galleryFocusIds as string[]).includes(focus) ? (focus as GalleryFocus) : 'center',
  };
  // Con fecha exacta, el año sale de ella.
  if (/^\d{4}-\d{2}-\d{2}$/.test(draft.takenOn)) draft.year = draft.takenOn.slice(0, 4);
  const photo = fileOf(form, 'photo');
  return {
    draft,
    photo,
    thumb: fileOf(form, 'thumb'),
    originalName: oneLine(form, 'original_name') || photo?.name || '',
  };
}

function validUrl(s: string) {
  try {
    const u = new URL(s);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

export interface CheckedFiles {
  full: { file: File; info: ImageInfo };
  thumb: { file: File; info: ImageInfo };
}

/** Revisa textos y, si hay foto nueva, su formato real y tamaño. */
export async function validate(
  p: ParsedForm,
  needsPhoto: boolean,
): Promise<{ errors: FieldErrors; files: CheckedFiles | null }> {
  const d = p.draft;
  const errors: FieldErrors = {};
  const maxYear = new Date().getUTCFullYear() + 1;

  if (!d.caption) errors.caption = 'Escribe un pie de foto.';
  else if (d.caption.length > LIMITS.caption) errors.caption = `El pie de foto admite hasta ${LIMITS.caption} caracteres.`;
  if (!d.alt) errors.alt = 'Describe lo que se ve en la foto (lo leen quienes no pueden verla).';
  else if (d.alt.length > LIMITS.alt) errors.alt = `La descripción admite hasta ${LIMITS.alt} caracteres.`;
  if (d.place.length > LIMITS.place) errors.place = `El lugar admite hasta ${LIMITS.place} caracteres.`;
  if (d.captionTr.length > LIMITS.caption) errors.captionTr = `Hasta ${LIMITS.caption} caracteres.`;
  if (d.altTr.length > LIMITS.alt) errors.altTr = `Hasta ${LIMITS.alt} caracteres.`;
  if (d.placeTr.length > LIMITS.place) errors.placeTr = `Hasta ${LIMITS.place} caracteres.`;
  if ((d.captionTr || d.placeTr) && !d.altTr && !errors.altTr) {
    errors.altTr = 'Si traduces el pie de foto, traduce también la descripción.';
  }
  if (d.altTr && !d.captionTr && !errors.captionTr) {
    errors.captionTr = 'Si traduces la descripción, traduce también el pie de foto.';
  }

  if (d.takenOn && !/^\d{4}-\d{2}-\d{2}$/.test(d.takenOn)) errors.takenOn = 'La fecha no es válida.';
  const year = Number(d.year);
  if (!/^\d{4}$/.test(d.year) || year < 1900 || year > maxYear) {
    errors.year = `Escribe el año con cuatro cifras (entre 1900 y ${maxYear}).`;
  }
  if (!d.credit) errors.credit = 'Escribe quién tomó la foto.';
  else if (d.credit.length > LIMITS.credit) errors.credit = `Hasta ${LIMITS.credit} caracteres.`;
  if (d.sourceUrl && (d.sourceUrl.length > LIMITS.url || !validUrl(d.sourceUrl))) {
    errors.sourceUrl = 'La dirección debe empezar con https:// (o déjala vacía).';
  }
  if (!d.rights) errors.rights = 'Elige por qué se puede publicar esta foto.';

  let files: CheckedFiles | null = null;
  if (!p.photo) {
    if (needsPhoto) errors.photo = 'Elige la foto que quieres subir.';
  } else {
    const info = await imageInfo(p.photo);
    if (!info) {
      errors.photo = 'Ese archivo no es una foto que el sitio pueda mostrar. Usa JPG, PNG o WebP.';
    } else if (p.photo.size > galleryMaxBytes.full) {
      errors.photo = 'La foto pesa más de 10 MB. Vuelve a elegirla con el panel abierto en Chrome, Edge, Firefox o Safari: ahí se reduce sola antes de subir.';
    } else {
      files = { full: { file: p.photo, info }, thumb: { file: p.photo, info } };
      if (p.thumb && p.thumb.size <= galleryMaxBytes.thumb) {
        const tInfo = await imageInfo(p.thumb);
        if (tInfo) files.thumb = { file: p.thumb, info: tInfo };
      }
      const extra = files.full.file.size + (files.thumb.file === files.full.file ? 0 : files.thumb.file.size);
      if ((await storageUsage()) + extra > STORAGE_LIMIT_BYTES) {
        errors.photo = 'Se alcanzó el espacio máximo para archivos (9.5 GB).';
      }
    }
  }
  return { errors, files };
}

/* ——— Escritura ——— */

async function putFiles(files: CheckedFiles, originalName: string, email: string) {
  const stem = `gallery/${new Date().getUTCFullYear()}/${crypto.randomUUID().slice(0, 8)}-${safeBaseName(originalName || 'foto')}`;
  const fullKey = `${stem}.${files.full.info.ext}`;
  const separateThumb = files.thumb.file !== files.full.file;
  const thumbKey = separateThumb ? `${stem}-thumb.${files.thumb.info.ext}` : fullKey;
  const meta = { originalName: originalName || 'foto', uploadedBy: email };
  await env.NOTES_FILES.put(fullKey, await files.full.file.arrayBuffer(), {
    httpMetadata: { contentType: files.full.info.mime },
    customMetadata: meta,
  });
  if (separateThumb) {
    await env.NOTES_FILES.put(thumbKey, await files.thumb.file.arrayBuffer(), {
      httpMetadata: { contentType: files.thumb.info.mime },
      customMetadata: meta,
    });
  }
  return {
    fullKey,
    thumbKey,
    width: files.full.info.width,
    height: files.full.info.height,
    thumbWidth: files.thumb.info.width,
    mime: files.full.info.mime,
    sizeBytes: files.full.file.size + (separateThumb ? files.thumb.file.size : 0),
  };
}

async function deleteKeys(...keys: (string | undefined)[]) {
  const unique = [...new Set(keys.filter((k): k is string => Boolean(k?.startsWith('gallery/'))))];
  if (unique.length > 0) await env.NOTES_FILES.delete(unique);
}

/** Columnas de texto según el idioma elegido. */
function textColumns(d: GalleryDraft) {
  const tr = other(d.lang);
  const cols: Record<string, string | null> = {};
  cols[`caption_${d.lang}`] = d.caption;
  cols[`alt_${d.lang}`] = d.alt;
  cols[`place_${d.lang}`] = d.place || null;
  cols[`caption_${tr}`] = d.captionTr || null;
  cols[`alt_${tr}`] = d.altTr || null;
  cols[`place_${tr}`] = d.placeTr || null;
  return cols as Record<'caption_es' | 'caption_en' | 'alt_es' | 'alt_en' | 'place_es' | 'place_en', string | null>;
}

/** Crea (sin `id`) o actualiza una foto. Devuelve su id. */
export async function savePhoto(
  p: ParsedForm,
  files: CheckedFiles | null,
  email: string,
  opts: { id?: number; status: GalleryStatus; previous?: GalleryRow },
): Promise<number> {
  const d = p.draft;
  const t = textColumns(d);
  const uploaded = files ? await putFiles(files, p.originalName, email) : null;
  const common = [
    d.lang,
    t.caption_es,
    t.caption_en,
    t.alt_es,
    t.alt_en,
    t.place_es,
    t.place_en,
    Number(d.year),
    d.takenOn || null,
    d.credit,
    d.sourceUrl || null,
    d.license,
    d.rights,
    d.focus,
    opts.status,
  ];
  try {
    if (opts.id === undefined) {
      if (!uploaded) throw new Error('Falta la foto');
      const row = await env.DB.prepare(
        `INSERT INTO gallery_photos
          (lang, caption_es, caption_en, alt_es, alt_en, place_es, place_en, year, taken_on, credit, source_url,
           license, rights, focus, status, image_key, thumb_key, width, height, thumb_width, mime_type, size_bytes,
           original_filename, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING id`,
      )
        .bind(
          ...common,
          uploaded.fullKey,
          uploaded.thumbKey,
          uploaded.width,
          uploaded.height,
          uploaded.thumbWidth,
          uploaded.mime,
          uploaded.sizeBytes,
          p.originalName || null,
          email || null,
        )
        .first<{ id: number }>();
      return row!.id;
    }

    const fileSet = uploaded
      ? `, image_key = ?, thumb_key = ?, width = ?, height = ?, thumb_width = ?, mime_type = ?, size_bytes = ?, original_filename = ?`
      : '';
    const fileValues = uploaded
      ? [
          uploaded.fullKey,
          uploaded.thumbKey,
          uploaded.width,
          uploaded.height,
          uploaded.thumbWidth,
          uploaded.mime,
          uploaded.sizeBytes,
          p.originalName || null,
        ]
      : [];
    await env.DB.prepare(
      `UPDATE gallery_photos SET lang = ?, caption_es = ?, caption_en = ?, alt_es = ?, alt_en = ?, place_es = ?,
         place_en = ?, year = ?, taken_on = ?, credit = ?, source_url = ?, license = ?, rights = ?, focus = ?,
         status = ?${fileSet}, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = ?`,
    )
      .bind(...common, ...fileValues, opts.id)
      .run();
  } catch (e) {
    // La fila no se guardó: no dejar archivos huérfanos en R2.
    if (uploaded) await deleteKeys(uploaded.fullKey, uploaded.thumbKey).catch(() => {});
    throw e;
  }
  // Se cambió la foto: se borran los archivos anteriores.
  if (uploaded && opts.previous) {
    await deleteKeys(opts.previous.image_key, opts.previous.thumb_key).catch((e) =>
      console.error('Galería: no se pudieron borrar los archivos anteriores', e),
    );
  }
  return opts.id;
}

export async function setPhotoStatus(id: number, status: GalleryStatus): Promise<void> {
  await env.DB.prepare(
    "UPDATE gallery_photos SET status = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?",
  )
    .bind(status, id)
    .run();
}

export async function deletePhoto(row: GalleryRow): Promise<void> {
  await env.DB.prepare('DELETE FROM gallery_photos WHERE id = ?').bind(row.id).run();
  await deleteKeys(row.image_key, row.thumb_key).catch((e) =>
    console.error('Galería: la foto se borró, pero sus archivos siguen en R2', e),
  );
}
