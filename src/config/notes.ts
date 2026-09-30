/**
 * Configuración de la sección Notes / Notas (VIEW-007).
 * Especificación: docs/13-notes-editorial-module.md · Modelo: ADR-008 · Idioma: ADR-009 · D1: ADR-011.
 * Las notas de prueba se muestran solo si la variable SHOW_TEST_NOTES = "true" (wrangler.jsonc → vars).
 */
import type { Lang } from '../i18n/ui';

export const noteCategoryIds = ['opinion', 'readings', 'books'] as const;
export type NoteCategoryId = (typeof noteCategoryIds)[number];

/** Categorías fijas: la nota guarda solo el identificador. */
export const noteCategories: Record<
  NoteCategoryId,
  { slug: Record<Lang, string>; name: Record<Lang, string>; description: Record<Lang, string> }
> = {
  opinion: {
    slug: { en: 'opinion', es: 'opinion' },
    name: { en: 'Opinion', es: 'Opinión' },
    description: {
      en: 'Opinions and commentary by Dr. Cabellos.',
      es: 'Opiniones y comentarios del Dr. Cabellos.',
    },
  },
  readings: {
    slug: { en: 'readings', es: 'lecturas' },
    name: { en: 'Readings', es: 'Lecturas' },
    description: {
      en: 'Recommended articles and publications, with links.',
      es: 'Artículos y publicaciones recomendados, con enlaces.',
    },
  },
  books: {
    slug: { en: 'books', es: 'libros' },
    name: { en: 'Books', es: 'Libros' },
    description: {
      en: 'Recommended books, with a link or a file when it can be shared.',
      es: 'Libros recomendados, con enlace o archivo cuando se puede compartir.',
    },
  },
};

export const notesConfig = {
  /** Notas por página en el listado y en cada categoría. */
  perPage: 10,
  /** Carpeta de los adjuntos estáticos anteriores a R2 ("static:"); desde NOTES-F4 los PDF viven en R2 (ADR-012). */
  filesDir: '/files/notes/',
  /** Tamaño máximo de un adjunto. */
  maxAttachmentBytes: 20 * 1024 * 1024,
  /** Palabras que no pueden usarse como slug (chocan con rutas de la sección). */
  reservedSlugs: ['page', 'pagina', 'category', 'categoria'],
} as const;
