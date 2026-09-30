/**
 * Archivos de Notes en Cloudflare R2 (NOTES-F4, ADR-012). Bucket `cabellos-research-files`, binding `NOTES_FILES`.
 * Los archivos se sirven a través del Worker en /files/<clave> (ruta src/pages/files/[...key].ts):
 * el bucket no es público y el navegador nunca recibe credenciales.
 *
 * Reglas (especificación §17–§24, §99): solo PDF, 20 MB por archivo, nombre interno seguro,
 * nombre original como metadato, derecho de distribución obligatorio y tope total de 9.5 GB (D-N9).
 */
import { env } from 'cloudflare:workers';
import { notesConfig } from '../config/notes';

/** Tope del total almacenado: por debajo de los 10 GB gratuitos de R2 (D-N9). */
export const STORAGE_LIMIT_BYTES = 9.5 * 1024 ** 3;

export const RIGHTS = ['open-access', 'public-domain', 'author', 'permission'] as const;
export type Rights = (typeof RIGHTS)[number];

export class UploadError extends Error {
  constructor(
    public code: 'type' | 'size' | 'empty' | 'quota' | 'rights',
    message: string,
  ) {
    super(message);
  }
}

/** Bytes ocupados según la base de datos (fuente de verdad de los adjuntos). */
export async function storageUsage(): Promise<number> {
  const row = await env.DB.prepare(
    "SELECT COALESCE(SUM(size_bytes), 0) AS used FROM attachments WHERE storage_key LIKE 'r2:%'",
  ).first<{ used: number }>();
  return row?.used ?? 0;
}

/** "Mi presentación FINAL (2).pdf" → "mi-presentacion-final-2". */
export function safeBaseName(name: string): string {
  const base = name
    .replace(/\.[^.]+$/, '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return base || 'archivo';
}

/** Clave interna: notes/<año>/<id de nota>/<uuid corto>-<nombre>.pdf (§21–§22). */
export function makeKey(noteId: number, originalName: string, now = new Date()): string {
  const id = crypto.randomUUID().slice(0, 8);
  return `notes/${now.getUTCFullYear()}/${noteId}/${id}-${safeBaseName(originalName)}.pdf`;
}

/** Un PDF de verdad empieza con "%PDF-" (no se confía en la extensión ni en el tipo declarado). */
async function looksLikePdf(file: Blob): Promise<boolean> {
  const head = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  return String.fromCharCode(...head) === '%PDF-';
}

/** Valida un PDF antes de subirlo (tipo real, tamaño, derechos y espacio disponible). Lanza UploadError. */
export async function validateNoteFile(file: File, rights: string): Promise<void> {
  if (!(RIGHTS as readonly string[]).includes(rights)) {
    throw new UploadError('rights', 'Elige si se puede compartir este PDF.');
  }
  if (file.size === 0) throw new UploadError('empty', 'El archivo está vacío.');
  if (file.size > notesConfig.maxAttachmentBytes) {
    throw new UploadError('size', 'El archivo supera el tamaño permitido (20 MB).');
  }
  const nameOk = /\.pdf$/i.test(file.name);
  if (!nameOk || (file.type && file.type !== 'application/pdf') || !(await looksLikePdf(file))) {
    throw new UploadError('type', 'El formato no está permitido: solo PDF.');
  }
  if ((await storageUsage()) + file.size > STORAGE_LIMIT_BYTES) {
    throw new UploadError('quota', 'Se alcanzó el espacio máximo para archivos (9.5 GB).');
  }
}

/**
 * Valida y guarda un PDF en R2. Devuelve los datos para la fila de `attachments`.
 * No escribe en D1: el llamador (panel, NOTES-F5) guarda la fila y, si falla, borra el objeto.
 */
export async function putNoteFile(file: File, noteId: number, rights: string) {
  await validateNoteFile(file, rights);
  const key = makeKey(noteId, file.name);
  // ≤ 20 MB: cabe en memoria del Worker (128 MB); ArrayBuffer evita mezclar tipos de streams.
  await env.NOTES_FILES.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: 'application/pdf' },
    customMetadata: { originalName: file.name, noteId: String(noteId), rights },
  });
  return {
    storageKey: `r2:${key}`,
    originalFilename: file.name,
    sizeBytes: file.size,
    mimeType: 'application/pdf' as const,
    rights: rights as Rights,
  };
}

/** Borra un objeto de R2 (el llamador comprueba antes que no lo use otra nota, §70). */
export async function deleteNoteFile(storageKey: string): Promise<void> {
  if (storageKey.startsWith('r2:')) await env.NOTES_FILES.delete(storageKey.slice(3));
}
