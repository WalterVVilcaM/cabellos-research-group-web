/**
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
