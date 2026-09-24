import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/utils';

export type Research = CollectionEntry<'research'>;
export type Member = CollectionEntry<'members'>;
export type Publication = CollectionEntry<'publications'>;

/** Líneas de investigación ordenadas. */
export async function getResearch(): Promise<Research[]> {
  const items = await getCollection('research');
  return items.sort((a, b) => a.data.order - b.data.order);
}

export const roleOrder = [
  'pi',
  'researcher',
  'postdoc',
  'phd',
  'masters',
  'undergrad',
  'collaborator',
  'alumni',
] as const;
export type Role = (typeof roleOrder)[number];

/** Integrantes ordenados por rol y luego por `order`/nombre. */
export async function getMembers(): Promise<Member[]> {
  const items = await getCollection('members');
  return items.sort(
    (a, b) =>
      roleOrder.indexOf(a.data.role) - roleOrder.indexOf(b.data.role) ||
      a.data.order - b.data.order ||
      a.data.name.localeCompare(b.data.name, 'es'),
  );
}

/** Publicaciones en orden cronológico descendente, con número global (la más reciente = N). */
export async function getPublications(): Promise<(Publication & { number: number })[]> {
  const items = await getCollection('publications');
  const sorted = items.sort(
    (a, b) => b.data.year - a.data.year || a.data.title.localeCompare(b.data.title),
  );
  return sorted.map((p, i) => ({ ...p, number: sorted.length - i }));
}

export type NumberedPublication = Awaited<ReturnType<typeof getPublications>>[number];

export function publicationsByResearch(pubs: NumberedPublication[], researchId: string) {
  return pubs.filter((p) => p.data.researchAreas.some((r) => r.id === researchId));
}

export function publicationsByMember(pubs: NumberedPublication[], memberId: string) {
  return pubs
    .filter((p) => p.data.members.some((m) => m.id === memberId))
    .sort((a, b) => Number(b.data.featured) - Number(a.data.featured) || b.number - a.number);
}

export function membersByResearch(members: Member[], researchId: string) {
  return members.filter((m) => m.data.researchAreas.some((r) => r.id === researchId));
}

/** Agrupa publicaciones por año (descendente). */
export function groupByYear(pubs: NumberedPublication[]) {
  const map = new Map<number, NumberedPublication[]>();
  for (const p of pubs) {
    const list = map.get(p.data.year) ?? [];
    list.push(p);
    map.set(p.data.year, list);
  }
  return [...map.entries()].sort((a, b) => b[0] - a[0]);
}

/** Métricas derivadas de los datos (RF-15). */
export async function getStats() {
  const [pubs, research, members] = await Promise.all([getPublications(), getResearch(), getMembers()]);
  const groupNames = members.flatMap((m) => [m.data.name, ...m.data.citationNames]);
  const years = pubs.map((p) => p.data.year);
  const from = years.length ? Math.min(...years) : null;
  const to = years.length ? Math.max(...years) : null;
  const journals = new Set(pubs.map((p) => p.data.journal)).size;
  return {
    publications: pubs.length,
    from,
    to,
    lines: research.length,
    journals,
    activeYears: from !== null && to !== null ? to - from + 1 : 0,
    coauthors: coauthorsOf(pubs, groupNames).length,
  };
}

const normName = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

/**
 * Coautores frecuentes derivados de las publicaciones (dato real, no inventado).
 * `exclude`: nombres del integrante (y variantes de cita) que no se cuentan.
 * Agrupa variantes por apellido + inicial del nombre.
 */
export function coauthorsOf(pubs: NumberedPublication[], exclude: string[]) {
  const skip = new Set(exclude.map(normName));
  const key = (name: string) => {
    const parts = normName(name).split(' ');
    return `${parts[0]?.[0] ?? ''} ${parts.slice(-2).join(' ')}`;
  };
  const skipKeys = new Set(exclude.map(key));
  const map = new Map<string, { name: string; count: number; last: number }>();
  for (const p of pubs) {
    const seen = new Set<string>();
    for (const a of p.data.authors) {
      if (skip.has(normName(a))) continue;
      const k = key(a);
      if (skipKeys.has(k) || seen.has(k)) continue;
      seen.add(k);
      const cur = map.get(k);
      if (cur) {
        cur.count++;
        cur.last = Math.max(cur.last, p.data.year);
        if (a.length > cur.name.length) cur.name = a;
      } else map.set(k, { name: a, count: 1, last: p.data.year });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || b.last - a.last || a.name.localeCompare(b.name));
}

/** Publicación fuente de la portada de una línea (para el crédito CC BY). */
export async function getCoverSource(item: Research) {
  const ref = item.data.cover?.source;
  return ref ? getEntry(ref) : undefined;
}

/** "Rojas-González et al." a partir de la lista de autores. */
export function shortAuthors(authors: string[]): string {
  const surname = (a: string) => a.trim().split(/\s+/).at(-1) ?? a;
  if (authors.length === 1) return surname(authors[0]!);
  if (authors.length === 2) return `${surname(authors[0]!)} & ${surname(authors[1]!)}`;
  return `${surname(authors[0]!)} et al.`;
}

/** Texto largo por idioma: texts/<lang>/<kind>/<id>.md */
export async function getText(lang: Lang, kind: 'research' | 'members', id: string) {
  return getEntry('texts', `${lang}/${kind}/${id}`);
}

/** Iniciales para el avatar tipográfico (máx. 2). */
export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const second = parts.length > 2 ? parts[parts.length - 2]?.[0] : parts[1]?.[0];
  return (first + (second ?? '')).toUpperCase();
}

/** Formatea un rango de años. */
export function yearSpan(from: number | null, to: number | null): string {
  if (from === null || to === null) return '—';
  return from === to ? String(from) : `${from}–${to}`;
}
