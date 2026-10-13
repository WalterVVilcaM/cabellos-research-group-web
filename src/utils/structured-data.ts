/**
 * Datos estructurados (JSON-LD, schema.org) del inicio y del perfil del investigador principal.
 * Ayudan a que los buscadores asocien el sitio con el grupo, la UPTap y el Dr. Cabellos
 * (sus perfiles de ORCID, Google Scholar, etc. van en `sameAs`). No cambian nada visible.
 *
 * Los @id son fijos y en el dominio propio, iguales en ambos idiomas: así las dos versiones
 * describen la misma organización y la misma persona.
 * Solo el investigador principal se describe como persona; las mascotas del equipo no.
 */
import { site } from '../config/site';
import { memberPath, sectionPath, type Lang } from '../i18n/utils';
import type { Member, Research } from './content';

const ORG_ID = `${site.url}/#organization`;
const WEBSITE_ID = `${site.url}/#website`;
const UNIVERSITY_ID = `${site.url}/#uptap`;
const personId = (member: Member) => `${site.url}${memberPath(member.id, 'en')}#person`;

const absolute = (path: string, base: URL) => new URL(path, base).href;

/** Universidad Politécnica de Tapachula, con la dirección pública del campus. */
function university() {
  const i = site.institution;
  return {
    '@type': 'CollegeOrUniversity',
    '@id': UNIVERSITY_ID,
    name: i.name,
    alternateName: i.shortName,
    url: i.url,
    address: {
      '@type': 'PostalAddress',
      ...(site.contact.streetAddress && { streetAddress: site.contact.streetAddress }),
      addressLocality: i.city,
      addressRegion: i.state,
      postalCode: i.postalCode,
      addressCountry: 'MX',
    },
  };
}

/** Perfiles externos del miembro (mismos enlaces que muestra su página). */
function profileLinks(member: Member): string[] {
  const l = member.data.links ?? {};
  return [
    l.orcid && `https://orcid.org/${l.orcid}`,
    l.googleScholar && `https://scholar.google.com/citations?user=${l.googleScholar}`,
    l.researchGate,
    l.frontiersLoop,
    l.figshare,
    l.scopus && `https://www.scopus.com/authid/detail.uri?authorId=${l.scopus}`,
    l.website,
  ].filter((x): x is string => Boolean(x));
}

/** Persona: investigador principal. `full` agrega los datos que solo van en su perfil. */
function person(member: Member, lang: Lang, base: URL, research: Research[], full: boolean) {
  const d = member.data;
  const lines = research.filter((r) => d.researchAreas.some((ref) => ref.id === r.id));
  return {
    '@type': 'Person',
    '@id': personId(member),
    name: d.name,
    ...(d.academicTitle && { honorificPrefix: d.academicTitle }),
    url: absolute(memberPath(member.id, lang), base),
    jobTitle: d.position[lang],
    worksFor: { '@id': ORG_ID },
    affiliation: { '@id': UNIVERSITY_ID },
    sameAs: profileLinks(member),
    ...(full && {
      ...(d.citationNames.length > 0 && { alternateName: d.citationNames }),
      ...(d.photo && { image: absolute(d.photo.src, base) }),
      ...(d.links?.email && { email: `mailto:${d.links.email}` }),
      ...(d.links?.orcid && {
        identifier: { '@type': 'PropertyValue', propertyID: 'ORCID', value: d.links.orcid },
      }),
      ...(lines.length > 0 && { knowsAbout: lines.map((r) => r.data.title[lang]) }),
    }),
  };
}

/** Grupo de investigación. */
function organization(lang: Lang, base: URL, pi?: Member) {
  return {
    '@type': 'ResearchOrganization',
    '@id': ORG_ID,
    name: site.brand,
    alternateName: site.descriptiveName[lang],
    url: absolute(sectionPath('home', lang), base),
    parentOrganization: { '@id': UNIVERSITY_ID },
    ...(site.contact.email && { email: `mailto:${site.contact.email}` }),
    ...(site.contact.phoneIntl && { telephone: site.contact.phoneIntl }),
    ...(pi && { founder: { '@id': personId(pi) }, member: [{ '@id': personId(pi) }] }),
  };
}

/** Inicio: sitio web + grupo + universidad + investigador principal. */
export function homeJsonLd(lang: Lang, base: URL, description: string, research: Research[], pi?: Member) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        name: site.brand,
        url: `${site.url}/`,
        inLanguage: ['en', 'es'],
        publisher: { '@id': ORG_ID },
      },
      { ...organization(lang, base, pi), description },
      university(),
      ...(pi ? [person(pi, lang, base, research, false)] : []),
    ],
  };
}

/** Perfil del investigador principal (ProfilePage). Para otros miembros devuelve undefined. */
export function memberJsonLd(member: Member, lang: Lang, base: URL, research: Research[]) {
  if (member.data.role !== 'pi') return undefined;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        url: absolute(memberPath(member.id, lang), base),
        inLanguage: lang,
        mainEntity: { '@id': personId(member) },
        isPartOf: { '@id': WEBSITE_ID },
      },
      person(member, lang, base, research, true),
      organization(lang, base, member),
      university(),
    ],
  };
}
