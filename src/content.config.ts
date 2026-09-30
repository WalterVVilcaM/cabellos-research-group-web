import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { noteCategoryIds } from './config/notes';

/** Texto corto localizado: debe existir en ambos idiomas. */
const localized = z.object({ es: z.string().min(1), en: z.string().min(1) });

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug: minúsculas, números y guiones');

/** Líneas de investigación: datos neutrales + textos cortos ES/EN. */
const research = defineCollection({
  loader: file('src/content/data/research.yaml'),
  schema: ({ image }) => z.object({
    order: z.number().int().positive(),
    slug: z.object({ es: slug, en: slug }),
    title: localized,
    shortTitle: localized,
    summary: localized,
    keywords: z.object({ es: z.array(z.string()), en: z.array(z.string()) }),
    /** Motivo de la ilustración decorativa generada por código. */
    motif: z.enum(['cluster', 'thermal', 'planar', 'lattice']),
    /**
     * Portada: figura publicada por el grupo (reutilizada bajo su licencia).
     * PROVISIONAL: se sustituye cuando el grupo entregue figuras propias.
     */
    cover: z
      .object({
        image: image(),
        alt: localized,
        caption: localized,
        figure: z.string(),
        source: reference('publications'),
        license: z.string().default('CC BY 4.0'),
        licenseUrl: z.url().default('https://creativecommons.org/licenses/by/4.0/'),
      })
      .optional(),
    featured: z.boolean().default(true),
  }),
});

const memberRoles = [
  'pi',
  'researcher',
  'postdoc',
  'phd',
  'masters',
  'undergrad',
  'collaborator',
  'alumni',
] as const;

/** Integrantes: datos neutrales + cargo/afiliación ES/EN. */
const members = defineCollection({
  loader: file('src/content/data/members.yaml'),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      /** Nombre para citas (p. ej. "J. L. Cabellos"); se resalta en listas de autores. */
      citationNames: z.array(z.string()).default([]),
      academicTitle: z.string().optional(),
      role: z.enum(memberRoles),
      position: localized,
      affiliation: z.string().optional(),
      photo: image().optional(),
      /** Formación y distinciones verificables (se muestran en el perfil). */
      education: z.array(localized).default([]),
      distinctions: z.array(localized).default([]),
      researchAreas: z.array(reference('research')).default([]),
      links: z
        .object({
          email: z.email().optional(),
          orcid: z.string().regex(/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/).optional(),
          googleScholar: z.string().optional(),
          researchGate: z.url().optional(),
          scopus: z.string().optional(),
          website: z.url().optional(),
          frontiersLoop: z.url().optional(),
        })
        .default({}),
      order: z.number().int().default(100),
      featured: z.boolean().default(false),
      active: z.boolean().default(true),
    }),
});

/** Publicaciones: neutrales al idioma (no se traducen títulos ni revistas). */
const publications = defineCollection({
  loader: file('src/content/data/publications.yaml'),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()).min(1),
    journal: z.string(),
    year: z.number().int().min(1990).max(2100),
    /** Fecha de publicación (YYYY-MM-DD) para ordenar dentro del año; las más recientes primero. */
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'fecha YYYY-MM-DD').optional(),
    volume: z.string().optional(),
    issue: z.string().optional(),
    pages: z.string().optional(),
    doi: z
      .string()
      .regex(/^10\.\d{4,9}\/\S+$/i, 'DOI sin prefijo https://doi.org/')
      .optional(),
    url: z.url().optional(),
    /** PDF de acceso abierto (versión legal y gratuita). Si no hay, se muestra solo el DOI. */
    pdf: z.url().optional(),
    type: z.enum(['article', 'review', 'chapter', 'conference', 'preprint', 'thesis', 'software', 'other']).default('article'),
    featured: z.boolean().default(false),
    researchAreas: z.array(reference('research')).default([]),
    members: z.array(reference('members')).default([]),
  }),
});

/** Textos largos por idioma: <locale>/<research|members>/<clave>.md */
const texts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/texts' }),
  schema: z.object({
    /** Marca de estado editorial: se valida antes del release (Gate 8). */
    status: z.enum(['draft', 'approved']).default('draft'),
  }),
});


/**
 * Notas (VIEW-007): un archivo Markdown por nota en src/content/notes/<slug>.md.
 * Cada nota está en un solo idioma (`lang`); ver ADR-008 y ADR-009.
 */
const noteFile = z
  .string()
  .regex(
    /^(?:\d{4}|test)\/[a-z0-9]+(?:-[a-z0-9]+)*\.pdf$/,
    'archivo: "<año>/<nombre>.pdf" o "test/<nombre>.pdf", en minúsculas, números y guiones',
  );

const notes = defineCollection({
  loader: glob({ pattern: '[!_]*.md', base: 'src/content/notes' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      /** Idioma del contenido de la nota (no de la interfaz). */
      lang: z.enum(['en', 'es']),
      summary: z.string().min(1).max(320),
      author: reference('members'),
      category: z.enum(noteCategoryIds),
      tags: z.array(z.string().min(1)).default([]),
      status: z.enum(['draft', 'published', 'archived']).default('draft'),
      /** Nota de prueba: solo en desarrollo y vista previa (SHOW_TEST_NOTES). */
      isTest: z.boolean().default(false),
      featured: z.boolean().default(false),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      cover: z.object({ src: image(), alt: z.string().min(1) }).optional(),
      researchAreas: z.array(reference('research')).default([]),
      /** Si esta nota es una traducción: la nota original. */
      translationOf: reference('notes').optional(),
      links: z
        .array(
          z.object({
            title: z.string().min(1),
            url: z.url({ protocol: /^https?$/ }),
            kind: z.enum(['doi', 'publisher', 'open-access', 'book', 'other']).default('other'),
            description: z.string().optional(),
          }),
        )
        .default([]),
      attachments: z
        .array(
          z.object({
            title: z.string().min(1),
            /** Ruta dentro de public/files/notes/. */
            file: noteFile,
            /** Derecho de distribución (obligatorio). Sin derecho, se enlaza en vez de subir el PDF. */
            rights: z.enum(['open-access', 'public-domain', 'author', 'permission']),
            description: z.string().optional(),
          }),
        )
        .default([]),
    }),
});

export const collections = { research, members, publications, texts, notes };
