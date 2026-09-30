import { ui, defaultLang, type Lang, type UiKey } from './ui';

export { type Lang } from './ui';

/** Devuelve la función de traducción para un idioma. Soporta `{var}`. */
export function useTranslations(lang: Lang) {
  return function t(key: UiKey, vars?: Record<string, string | number>): string {
    let text: string = ui[lang][key] ?? ui[defaultLang][key];
    if (vars) {
      for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, String(v));
    }
    return text;
  };
}

export type SectionKey = 'home' | 'about' | 'research' | 'team' | 'publications' | 'notes' | 'gallery' | 'contact';

/** Subruta de despliegue (`base` en astro.config), sin barra final: '' en la raíz, '/repo' en GitHub Pages. */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Antepone la subruta de despliegue a una ruta absoluta del sitio ('/favicon.svg' → '/repo/favicon.svg'). */
export function withBase(path: string): string {
  return `${BASE}${path}`;
}

/** Rutas de sección por idioma: EN sin prefijo, ES bajo /es/ (ADR-007, docs/04-information-architecture.md). */
const rawSectionPaths: Record<SectionKey, Record<Lang, string>> = {
  home: { en: '/', es: '/es/' },
  about: { en: '/about/', es: '/es/nosotros/' },
  research: { en: '/research/', es: '/es/investigacion/' },
  team: { en: '/team/', es: '/es/integrantes/' },
  publications: { en: '/publications/', es: '/es/publicaciones/' },
  notes: { en: '/notes/', es: '/es/notas/' },
  gallery: { en: '/gallery/', es: '/es/galeria/' },
  contact: { en: '/contact/', es: '/es/contacto/' },
};

/** Las mismas rutas, ya con la subruta de despliegue. Es lo que usan los enlaces. */
export const sectionPaths = Object.fromEntries(
  Object.entries(rawSectionPaths).map(([key, paths]) => [key, { en: withBase(paths.en), es: withBase(paths.es) }]),
) as Record<SectionKey, Record<Lang, string>>;

export const navOrder: SectionKey[] = ['home', 'research', 'team', 'publications', 'notes', 'gallery', 'contact'];

export function sectionPath(section: SectionKey, lang: Lang): string {
  return sectionPaths[section][lang];
}

/** Ruta del detalle de una línea de investigación. */
export function researchPath(slugs: Record<Lang, string>, lang: Lang): string {
  return `${sectionPaths.research[lang]}${slugs[lang]}/`;
}

/** Ruta del perfil de un integrante (slug compartido entre idiomas). */
export function memberPath(id: string, lang: Lang): string {
  return `${sectionPaths.team[lang]}${id}/`;
}

/** Segmentos traducidos de las rutas de Notes (docs/04-information-architecture.md §2). */
const notesSegments: Record<Lang, { page: string; category: string }> = {
  en: { page: 'page', category: 'category' },
  es: { page: 'pagina', category: 'categoria' },
};

/** Ruta del detalle de una nota (mismo slug en ambas interfaces; ADR-009). */
export function notePath(slug: string, lang: Lang): string {
  return `${sectionPaths.notes[lang]}${slug}/`;
}

/**
 * Ruta de un listado de notas: general o de una categoría (`categorySlug` ya traducido), página `page`.
 * La página 1 no lleva segmento de página.
 */
export function notesListPath(lang: Lang, page = 1, categorySlug?: string): string {
  const seg = notesSegments[lang];
  const base = categorySlug ? `${sectionPaths.notes[lang]}${seg.category}/${categorySlug}/` : sectionPaths.notes[lang];
  return page > 1 ? `${base}${seg.page}/${page}/` : base;
}

/** Rutas equivalentes de una página en ambos idiomas (para hreflang y selector). */
export type Alternates = Record<Lang, string>;

export function sectionAlternates(section: SectionKey): Alternates {
  return sectionPaths[section];
}

export const otherLang = (lang: Lang): Lang => (lang === 'es' ? 'en' : 'es');
