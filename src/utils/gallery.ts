/**
 * Capa de datos de la Galería (ADR-015). Las fotos están en D1 (`gallery_photos`) y los archivos en R2
 * (bucket de Notes, prefijo `gallery/`). Se administran desde el panel (/admin/galeria/).
 *
 * `ensureGallery()` crea las tablas si faltan (mismo SQL que migrations/0003_gallery.sql) y copia una sola vez
 * las fotos iniciales de public/gallery-seed a R2 y D1. Así el sitio funciona sin correr Wrangler a mano.
 * Si D1 o R2 fallan, la página pública muestra las fotos iniciales desde public/ (nunca una página rota).
 */
import { env } from 'cloudflare:workers';
import schemaSql from '../../migrations/0003_gallery.sql?raw';
import {
  galleryFocus,
  galleryLicenses,
  gallerySeed,
  type GalleryFocus,
  type GalleryLicense,
  type GalleryRights,
} from '../config/gallery';
import { withBase, type Lang } from '../i18n/utils';

export type GalleryStatus = 'draft' | 'published';

export interface GalleryRow {
  id: number;
  seed_id: string | null;
  lang: Lang;
  caption_es: string | null;
  caption_en: string | null;
  alt_es: string | null;
  alt_en: string | null;
  place_es: string | null;
  place_en: string | null;
  year: number;
  taken_on: string | null;
  credit: string;
  source_url: string | null;
  license: GalleryLicense;
  rights: GalleryRights;
  focus: GalleryFocus;
  status: GalleryStatus;
  image_key: string;
  thumb_key: string;
  width: number;
  height: number;
  thumb_width: number;
  mime_type: string;
  size_bytes: number;
  original_filename: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

/** Texto en el idioma pedido o, si falta, en el otro (con su idioma, para el atributo lang). */
interface Localized {
  text: string;
  lang: Lang;
}

/** Foto lista para la página pública. */
export interface GalleryItem {
  id: string;
  caption: Localized;
  alt: Localized;
  place?: Localized;
  year: number;
  credit: string;
  sourceUrl?: string;
  license?: { name: string; url: string };
  objectPosition: string;
  width: number;
  height: number;
  thumb: { url: string; width: number };
  full: { url: string; width: number };
}

export const ORDER_BY = 'year DESC, taken_on DESC, id DESC';
export const GALLERY_PREFIX = 'gallery/';
const SEED_PREFIX = 'gallery/seed/';
const SEEDED_FLAG = 'gallery_seeded';

/** /files/gallery/... : el Worker sirve el archivo de R2 solo si la foto está publicada. */
export const publicFileUrl = (key: string) => withBase(`/files/${key}`);

/* ——— Esquema y fotos iniciales ——— */

/** Sentencias del archivo de migración (sin comentarios). */
function schemaStatements(): string[] {
  return schemaSql
    .split('\n')
    .map((line) => line.replace(/--.*$/, ''))
    .join('\n')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function readSeedFile(file: string, origin?: string): Promise<ArrayBuffer> {
  const path = `/gallery-seed/${file}`;
  const res = env.ASSETS
    ? await env.ASSETS.fetch(new URL(path, 'https://assets.local').href)
    : await fetch(new URL(withBase(path), origin ?? 'http://localhost'));
  if (!res.ok) throw new Error(`No se encontró ${path} (${res.status})`);
  return res.arrayBuffer();
}

async function importSeed(origin?: string): Promise<void> {
  // Al revés: con el orden «id DESC», la primera de la lista queda primero dentro de su año.
  for (const p of [...gallerySeed].reverse()) {
    const exists = await env.DB.prepare('SELECT 1 FROM gallery_photos WHERE seed_id = ?').bind(p.id).first();
    if (exists) continue;
    const key = `${SEED_PREFIX}${p.file}`;
    const data = await readSeedFile(p.file, origin);
    await env.NOTES_FILES.put(key, data, {
      httpMetadata: { contentType: 'image/webp' },
      customMetadata: { originalName: p.file, seed: p.id },
    });
    await env.DB.prepare(
      `INSERT OR IGNORE INTO gallery_photos
        (seed_id, lang, caption_es, caption_en, alt_es, alt_en, place_es, place_en, year, credit, source_url,
         license, rights, focus, status, image_key, thumb_key, width, height, thumb_width, mime_type, size_bytes,
         original_filename, created_by)
       VALUES (?, 'es', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?, ?, ?, 'image/webp', ?, ?, 'importación inicial')`,
    )
      .bind(
        p.id,
        p.caption.es,
        p.caption.en,
        p.alt.es,
        p.alt.en,
        p.place?.es ?? null,
        p.place?.en ?? null,
        p.year,
        p.credit,
        p.sourceUrl,
        p.license,
        p.rights,
        p.focus,
        key,
        key,
        p.width,
        p.height,
        p.width,
        data.byteLength,
        p.file,
      )
      .run();
  }
  await env.DB.prepare(
    "INSERT INTO site_flags (key, value) VALUES (?, '1') ON CONFLICT(key) DO UPDATE SET value = '1', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')",
  )
    .bind(SEEDED_FLAG)
    .run();
}

let ready: Promise<void> | null = null;

/** Tablas listas y fotos iniciales importadas. Una vez por instancia del Worker; si falla, se reintenta. */
export function ensureGallery(origin?: string): Promise<void> {
  ready ??= (async () => {
    await env.DB.batch(schemaStatements().map((s) => env.DB.prepare(s)));
    const flag = await env.DB.prepare('SELECT value FROM site_flags WHERE key = ?').bind(SEEDED_FLAG).first();
    if (!flag) await importSeed(origin);
  })().catch((e) => {
    ready = null;
    throw e;
  });
  return ready;
}

/* ——— Página pública ——— */

function pick(es: string | null, en: string | null, lang: Lang): Localized | undefined {
  const own = lang === 'es' ? es : en;
  if (own) return { text: own, lang };
  const other = lang === 'es' ? en : es;
  return other ? { text: other, lang: lang === 'es' ? 'en' : 'es' } : undefined;
}

function licenseOf(id: GalleryLicense) {
  const l = galleryLicenses[id] ?? galleryLicenses.none;
  return l.name ? { name: l.name, url: l.url } : undefined;
}

export function toItem(r: GalleryRow, lang: Lang, url: (key: string) => string = publicFileUrl): GalleryItem {
  return {
    id: String(r.id),
    caption: pick(r.caption_es, r.caption_en, lang)!,
    alt: pick(r.alt_es, r.alt_en, lang)!,
    place: pick(r.place_es, r.place_en, lang),
    year: r.year,
    credit: r.credit,
    sourceUrl: r.source_url ?? undefined,
    license: licenseOf(r.license),
    objectPosition: (galleryFocus[r.focus] ?? galleryFocus.center).position,
    width: r.width,
    height: r.height,
    thumb: { url: url(r.thumb_key), width: r.thumb_width },
    full: { url: url(r.image_key), width: r.width },
  };
}

/** Fotos iniciales servidas desde public/ (respaldo si D1 o R2 no responden). */
function seedItems(lang: Lang): GalleryItem[] {
  return gallerySeed.map((p) => {
    const url = withBase(`/gallery-seed/${p.file}`);
    return {
      id: p.id,
      caption: pick(p.caption.es, p.caption.en, lang)!,
      alt: pick(p.alt.es, p.alt.en, lang)!,
      place: p.place ? pick(p.place.es, p.place.en, lang) : undefined,
      year: p.year,
      credit: p.credit,
      sourceUrl: p.sourceUrl,
      license: licenseOf(p.license),
      objectPosition: galleryFocus[p.focus].position,
      width: p.width,
      height: p.height,
      thumb: { url, width: p.width },
      full: { url, width: p.width },
    };
  });
}

/** Fotos publicadas, de la más reciente a la más antigua. */
export async function loadGallery(lang: Lang, origin?: string): Promise<GalleryItem[]> {
  try {
    await ensureGallery(origin);
    const { results } = await env.DB.prepare(
      `SELECT * FROM gallery_photos WHERE status = 'published' ORDER BY ${ORDER_BY}`,
    ).all<GalleryRow>();
    return results.map((r) => toItem(r, lang));
  } catch (e) {
    console.error('Galería: se muestran las fotos iniciales porque D1/R2 falló', e);
    return seedItems(lang);
  }
}

/** ¿Esta clave de R2 pertenece a una foto publicada? (para /files/gallery/...) */
export async function isPublishedGalleryKey(key: string): Promise<{ mime: string } | null> {
  const row = await env.DB.prepare(
    "SELECT mime_type FROM gallery_photos WHERE status = 'published' AND (image_key = ?1 OR thumb_key = ?1) LIMIT 1",
  )
    .bind(key)
    .first<{ mime_type: string }>();
  return row ? { mime: row.mime_type } : null;
}

/** Bytes que ocupan las fotos en R2 (0 si la tabla aún no existe). */
export async function galleryStorageUsage(): Promise<number> {
  try {
    const row = await env.DB.prepare('SELECT COALESCE(SUM(size_bytes), 0) AS used FROM gallery_photos').first<{
      used: number;
    }>();
    return row?.used ?? 0;
  } catch {
    return 0;
  }
}

/** Respuesta con un archivo de imagen de R2 (también la usa el panel para fotos sin publicar). */
export async function serveGalleryObject(key: string, request: Request, cacheControl: string): Promise<Response> {
  const object = await env.NOTES_FILES.get(key, { onlyIf: request.headers as never });
  if (!object) return new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain' } });
  const headers = new Headers();
  headers.set('Content-Type', object.httpMetadata?.contentType ?? 'application/octet-stream');
  headers.set('ETag', object.httpEtag);
  headers.set('Cache-Control', cacheControl);
  headers.set('X-Content-Type-Options', 'nosniff');
  if (!('body' in object) || !object.body) return new Response(null, { status: 304, headers });
  headers.set('Content-Length', String(object.size));
  return new Response(object.body as unknown as ReadableStream, { status: 200, headers });
}
