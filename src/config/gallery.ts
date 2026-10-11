/**
 * Fotografías del sitio.
 * `heroGallery`: carrusel de la página de inicio (fijo en el código).
 * La página Galería se administra desde el panel (/admin/galeria/, ADR-015) y se lee de D1:
 * aquí solo quedan sus opciones (licencias, recorte, derechos) y `gallerySeed`, las fotos iniciales.
 *
 * Fotografías del hero de la página de inicio.
 * PROVISIONALES: tomadas de las notas públicas de uptapachula.edu.mx (crédito UPTap).
 * Sustituir por fotografías propias del grupo cuando existan: basta con cambiar
 * el `import` y los textos; el orden del arreglo es el orden del carrusel.
 * `focus` es el object-position del recorte (útil en móvil, donde el marco es más alto).
 */
import type { ImageMetadata } from 'astro';
import campusLetras from '../assets/gallery/campus-letras.webp';
import tallerMicroscopia1 from '../assets/gallery/taller-microscopia-1.webp';
import campusExplanada from '../assets/gallery/campus-explanada.webp';
import examenMaestria from '../assets/gallery/examen-maestria.webp';
import tallerMicroscopia3 from '../assets/gallery/taller-microscopia-3.webp';

type L = { es: string; en: string };
export interface GalleryPhoto {
  image: ImageMetadata;
  alt: L;
  caption: L;
  year: number;
  credit: string;
  sourceUrl: string;
  /** Licencia de la foto, si se publicó con una (p. ej. CC BY 4.0). */
  license?: { name: string; url: string };
  focus?: string;
}

export const heroGallery: GalleryPhoto[] = [
  {
    image: campusLetras,
    alt: {
      es: 'Estudiantes y docentes frente a las letras monumentales de la UPTap, en el campus de Tapachula.',
      en: 'Students and faculty in front of the UPTap monumental letters on the Tapachula campus.',
    },
    caption: { es: 'Campus UPTap, Tapachula', en: 'UPTap campus, Tapachula' },
    year: 2026,
    credit: 'UPTap',
    sourceUrl: 'https://www.uptapachula.edu.mx/noticias/',
    focus: '50% 60%',
  },
  {
    image: tallerMicroscopia1,
    alt: {
      es: 'Niñas y niños con un investigador de la UPTap durante el taller «Un mundo microscópico», impartido por los doctores José Luis Cabellos y Khirbet López Velázquez.',
      en: 'Children with a UPTap researcher during the “A microscopic world” workshop, led by Drs. José Luis Cabellos and Khirbet López Velázquez.',
    },
    caption: { es: 'Taller «Un mundo microscópico»', en: '“A microscopic world” workshop' },
    year: 2026,
    credit: 'UPTap',
    sourceUrl: 'https://www.uptapachula.edu.mx/noticias/uptap-participa-en-la-caravana-planetario-itinerante',
    focus: '40% 30%',
  },
  {
    image: campusExplanada,
    alt: {
      es: 'Explanada del campus de la UPTap con su techumbre y áreas verdes.',
      en: 'Open grounds of the UPTap campus with its canopy and green areas.',
    },
    caption: { es: 'Explanada del campus', en: 'Campus grounds' },
    year: 2026,
    credit: 'UPTap',
    sourceUrl: 'https://www.uptapachula.edu.mx/noticias/',
    focus: '50% 45%',
  },
  {
    image: examenMaestria,
    alt: {
      es: 'Comité sinodal de un examen de grado de la Maestría en Ingeniería de la UPTap, del que forma parte el Dr. Cabellos.',
      en: 'Examining committee of a UPTap Master of Engineering thesis defense, which includes Dr. Cabellos.',
    },
    caption: { es: 'Examen de grado, Maestría en Ingeniería', en: 'Thesis defense, Master of Engineering' },
    year: 2024,
    credit: 'UPTap',
    sourceUrl: 'https://www.uptapachula.edu.mx/noticias/grado-de-maestria-en-ingenieria',
    focus: '50% 55%',
  },
  {
    image: tallerMicroscopia3,
    alt: {
      es: 'Un investigador ajusta un microscopio mientras una niña observa una muestra, en el taller «Un mundo microscópico».',
      en: 'A researcher adjusts a microscope while a girl looks at a sample during the “A microscopic world” workshop.',
    },
    caption: { es: 'Divulgación: microscopía óptica', en: 'Outreach: optical microscopy' },
    year: 2026,
    credit: 'UPTap',
    sourceUrl: 'https://www.uptapachula.edu.mx/noticias/uptap-participa-en-la-caravana-planetario-itinerante',
    focus: '60% 50%',
  },
];

/* ——— Galería (panel) ——— */

/** Licencias que se pueden mostrar al pie de una foto. `none` = no se muestra licencia. */
export const galleryLicenses = {
  none: { label: 'Sin licencia (no se muestra)', name: '', url: '' },
  'cc-by-4.0': { label: 'CC BY 4.0', name: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' },
  'cc-by-sa-4.0': { label: 'CC BY-SA 4.0', name: 'CC BY-SA 4.0', url: 'https://creativecommons.org/licenses/by-sa/4.0/' },
  cc0: { label: 'CC0 (dominio público)', name: 'CC0 1.0', url: 'https://creativecommons.org/publicdomain/zero/1.0/' },
} as const;
export type GalleryLicense = keyof typeof galleryLicenses;
export const galleryLicenseIds = Object.keys(galleryLicenses) as GalleryLicense[];

/** Qué parte de la foto se ve en la cuadrícula (el marco es 4:3). */
export const galleryFocus = {
  center: { label: 'Centro', position: '50% 50%' },
  top: { label: 'Arriba', position: '50% 22%' },
  bottom: { label: 'Abajo', position: '50% 72%' },
} as const;
export type GalleryFocus = keyof typeof galleryFocus;
export const galleryFocusIds = Object.keys(galleryFocus) as GalleryFocus[];

/** Por qué se puede publicar la foto (obligatorio al subirla). */
export const galleryRights = {
  own: 'La tomé yo o alguien del grupo',
  permission: 'Tengo permiso de quien la tomó',
  'open-license': 'Está publicada con una licencia abierta (por ejemplo, Creative Commons)',
} as const;
export type GalleryRights = keyof typeof galleryRights;
export const galleryRightsIds = Object.keys(galleryRights) as GalleryRights[];

/** Tamaños que prepara el navegador del editor antes de subir (lado mayor, en píxeles). */
export const galleryImageSizes = { full: 2000, thumb: 960 } as const;
/** Topes del servidor: con JavaScript las fotos llegan ya reducidas; sin él, el original. */
export const galleryMaxBytes = { full: 10 * 1024 * 1024, thumb: 3 * 1024 * 1024 } as const;

export interface GallerySeedPhoto {
  /** Identificador estable: evita importar dos veces la misma foto. */
  id: string;
  /** Archivo en public/gallery-seed/. */
  file: string;
  width: number;
  height: number;
  alt: L;
  caption: L;
  place?: L;
  year: number;
  credit: string;
  sourceUrl: string;
  license: GalleryLicense;
  rights: GalleryRights;
  focus: GalleryFocus;
}

/**
 * Fotos iniciales de la Galería: archivo del Dr. Cabellos publicado por él en Figshare con licencia CC BY 4.0
 * (perfil https://figshare.com/authors/Jose_Luis_Cabellos/24669280). La primera visita a la Galería o al panel
 * las copia a R2 y D1 (una sola vez). Mientras eso no ocurra, o si D1 falla, la Galería las muestra desde aquí.
 * Orden: las más recientes primero.
 */
export const gallerySeed: GallerySeedPhoto[] = [
  {
    id: 'cabellos-stallman-2008',
    file: 'cabellos-stallman-2008.webp',
    width: 1448,
    height: 1086,
    alt: {
      es: 'Richard Stallman, con camisa roja, de pie junto al Dr. José Luis Cabellos en un salón de la Universidad Iberoamericana León, con banderas al fondo.',
      en: 'Richard Stallman, in a red shirt, standing next to Dr. José Luis Cabellos in a hall at Universidad Iberoamericana León, with flags in the background.',
    },
    caption: {
      es: 'Con Richard Stallman durante su visita a la Ibero León',
      en: 'With Richard Stallman during his visit to Ibero León',
    },
    place: { es: 'León, Guanajuato', en: 'León, Guanajuato, Mexico' },
    year: 2008,
    credit: 'José Luis Cabellos',
    sourceUrl: 'https://doi.org/10.6084/m9.figshare.33942058',
    license: 'cc-by-4.0',
    rights: 'own',
    focus: 'center',
  },
  {
    id: 'cabellos-leon-2008',
    file: 'cabellos-leon-2008.webp',
    width: 839,
    height: 629,
    alt: {
      es: 'El Dr. Cabellos, durante su doctorado, escribe un análisis estructural a mano junto a un monitor que muestra un modelo molecular.',
      en: 'Dr. Cabellos, during his PhD, writes a structural analysis by hand next to a monitor showing a molecular model.',
    },
    caption: {
      es: 'Modelado molecular durante el doctorado',
      en: 'Molecular modeling during the PhD',
    },
    place: { es: 'León, Guanajuato', en: 'León, Guanajuato, Mexico' },
    year: 2008,
    credit: 'José Luis Cabellos',
    sourceUrl: 'https://doi.org/10.6084/m9.figshare.33826726',
    license: 'cc-by-4.0',
    rights: 'own',
    focus: 'center',
  },
  {
    id: 'osi7-jackson-hole-2007-a',
    file: 'osi7-jackson-hole-2007-a.webp',
    width: 1011,
    height: 599,
    alt: {
      es: 'Foto de grupo de unos sesenta participantes sobre el pasto, con bosque al fondo, en el congreso Optics of Surfaces and Interfaces VII.',
      en: 'Group photo of about sixty participants on the grass, with a forest behind them, at the Optics of Surfaces and Interfaces VII meeting.',
    },
    caption: {
      es: 'Congreso Optics of Surfaces and Interfaces VII',
      en: 'Optics of Surfaces and Interfaces VII meeting',
    },
    place: { es: 'Jackson Hole, Wyoming, EUA', en: 'Jackson Hole, Wyoming, USA' },
    year: 2007,
    credit: 'José Luis Cabellos',
    sourceUrl: 'https://doi.org/10.6084/m9.figshare.33473407',
    license: 'cc-by-4.0',
    rights: 'own',
    focus: 'bottom',
  },
  {
    id: 'osi7-jackson-hole-2007-b',
    file: 'osi7-jackson-hole-2007-b.webp',
    width: 1146,
    height: 599,
    alt: {
      es: 'Otra foto de grupo del congreso Optics of Surfaces and Interfaces VII, con montañas y bosque al fondo.',
      en: 'Another group photo of the Optics of Surfaces and Interfaces VII meeting, with mountains and forest in the background.',
    },
    caption: {
      es: 'Optics of Surfaces and Interfaces VII, segunda toma',
      en: 'Optics of Surfaces and Interfaces VII, second shot',
    },
    place: { es: 'Jackson Hole, Wyoming, EUA', en: 'Jackson Hole, Wyoming, USA' },
    year: 2007,
    credit: 'José Luis Cabellos',
    sourceUrl: 'https://doi.org/10.6084/m9.figshare.33457075',
    license: 'cc-by-4.0',
    rights: 'own',
    focus: 'bottom',
  },
];
