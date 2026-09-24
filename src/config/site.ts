/**
 * Datos globales del sitio. Fuente única para identidad, institución y contacto.
 * Los campos `null` se omiten en la interfaz (nunca se muestran datos ficticios).
 * Estado de cada dato: docs/03-content-inventory.md
 */
export const site = {
  brand: 'Cabellos Research Group',
  shortName: 'CRG',
  /** PROVISIONAL — pendiente de ratificación (charter D-01). */
  descriptiveName: {
    es: 'Grupo de Química Computacional de Clústeres y Materiales',
    en: 'Computational Chemistry of Clusters and Materials Group',
  },
  url: 'https://cabellosresearchgroup.org',
  institution: {
    name: 'Universidad Politécnica de Tapachula',
    shortName: 'UPTap',
    unit: {
      es: 'Coordinación de Investigación y Desarrollo Tecnológico',
      en: 'Research and Technological Development Office',
    },
    url: 'https://www.uptapachula.edu.mx/',
    city: 'Tapachula',
    state: 'Chiapas',
    postalCode: '30830',
    country: { es: 'México', en: 'Mexico' },
  },
  contact: {
    /** Correo del Dr. Cabellos (confirmado por el responsable técnico, 2026-09-23). */
    email: 'jose.luis@uptapachula.edu.mx' as string | null,
    /** Teléfono visible y en formato internacional para enlaces tel:. */
    phone: '962 465 9908' as string | null,
    phoneIntl: '+529624659908' as string | null,
    /** Dirección pública del campus (uptapachula.edu.mx). FALTA: edificio/cubículo del grupo. */
    streetAddress: 'Carretera Tapachula–Puerto Madero km 24 + 300' as string | null,
  },
  startYear: 2026,
} as const;

export type Site = typeof site;
