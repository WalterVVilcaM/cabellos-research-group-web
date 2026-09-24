import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

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
      affiliation: z.string(),
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
    volume: z.string().optional(),
    issue: z.string().optional(),
    pages: z.string().optional(),
    doi: z
      .string()
      .regex(/^10\.\d{4,9}\/\S+$/i, 'DOI sin prefijo https://doi.org/')
      .optional(),
    url: z.url().optional(),
    type: z.enum(['article', 'review', 'chapter', 'conference', 'other']).default('article'),
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

export const collections = { research, members, publications, texts };
