/**
 * Lógica pura del sincronizador de publicaciones (sin dependencias de Node).
 * La usa scripts/sync-publications.mjs. Reglas de decisión documentadas en cada función.
 */

/** Tipos de OpenAlex que se aceptan. Preprints, datasets, erratas, libros completos, etc. se ignoran. */
const ALLOWED_TYPES = new Set(['article', 'review', 'book-chapter', 'conference-paper', 'proceedings-article']);

/** Prefijos/patrones de DOI que nunca son artículos del grupo (repositorios, resúmenes, duplicados). */
const SKIP_DOI = [
  /^10\.5281\//, // Zenodo
  /^10\.6084\//, // Figshare
  /^10\.5517\//, // CCDC (estructuras cristalinas)
  /^10\.48550\//, // arXiv (preprint)
  /^10\.26434\//, // ChemRxiv (preprint)
  /^10\.20944\//, // Preprints.org
  /^10\.2139\//, // SSRN (preprint)
  /^10\.1002\/ange\./, // edición alemana de Angewandte (duplicado)
  /^10\.1002\/chin\./, // ChemInform (resumen de otro artículo)
  /^10\.1021\/scimeetings\./, // resúmenes de congresos ACS
];

/** Títulos que indican material que no es un trabajo nuevo. */
const SKIP_TITLE =
  /^(erratum|errata|correction|corrigendum|retraction|retracted|cover picture|cover image|inside (front |back )?cover|back cover|front cover|frontispiece|supplementary|supporting information|chem ?inform abstract|reply to|comment on)\b/i;

const RESEARCH_RULES = [
  ['structure-prediction', /cluster|global (search|minimum)|potential energy surface|isomer|tubular|cage|borospherene|structure search/i],
  ['finite-temperature', /temperature|thermal|thermodynamic|boltzmann|population|molecular dynamics|free energy/i],
  ['chemical-bonding', /bond|aromatic|planar (tetra|penta)coordinate|sandwich|arene/i],
  ['optical-properties', /optical|second[- ]harmonic|spin injection|shift[- ]current|absorption spectr|band structure|dichroism|momentum matrix/i],
];

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
export function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}

/**
 * Título de Crossref (JATS/MathML) → notación del sitio: `_{…}` subíndice, `^{…}` superíndice.
 * Ej.: "Be<sub>6</sub>B<sub>11</sub><sup>−</sup>" → "Be_{6}B_{11}^{−}".
 */
export function cleanTitle(raw) {
  // Algunas editoriales depositan las etiquetas escapadas (&lt;sub&gt;)
  let s = String(raw ?? '').replace(/&lt;(\/?(?:sub|sup|i|b|scp))&gt;/gi, '<$1>');
  // MathML: <mml:msub><mml:mi>X</mml:mi><mml:mn>2</mml:mn></mml:msub> → X_{2} (también msup)
  const mml = (tag) =>
    new RegExp(`<(?:mml:)?${tag}>\\s*<(?:mml:)?m\\w+[^>]*>([^<]*)</(?:mml:)?m\\w+>\\s*<(?:mml:)?m\\w+[^>]*>([^<]*)</(?:mml:)?m\\w+>\\s*</(?:mml:)?${tag}>`, 'g');
  s = s.replace(mml('msub'), '$1_{$2}').replace(mml('msup'), '$1^{$2}');
  // Quitar etiquetas que no sean sub/sup (i, b, scp, span, mml:*…) sin dejar espacios extra
  s = s.replace(/<(?!\/?(sub|sup)\b)[^>]+>/gi, '');
  // Espacios pegados a sub/sup vienen del XML, no del título (el espacio DESPUÉS del cierre sí se conserva)
  s = s.replace(/\s*<(sub|sup)>\s*/gi, '<$1>').replace(/\s*<\/(sub|sup)>/gi, '</$1>');
  s = s.replace(/<sub>([^<]*)<\/sub>/gi, '_{$1}').replace(/<sup>([^<]*)<\/sup>/gi, '^{$1}');
  s = decodeEntities(s);
  s = s.replace(/[\u2010\u2011]/g, '-').replace(/\s+/g, ' ').trim();
  s = s.replace(/\s+([_^]\{)/g, '$1').replace(/([_^]\{)\s+/g, '$1').replace(/\s+\}/g, '}');
  s = s.replace(/_\{\}|\^\{\}/g, '');
  // El sangrado del XML deja espacios falsos: "Li_{2} B_{24} :" → "Li_{2}B_{24}:", "( n = 2)" → "(n = 2)"
  s = s.replace(/\}\s+(?=[A-Z][a-z]?[_^]\{)/g, '}');
  s = s.replace(/\s+([:;,.?!)\]])/g, '$1').replace(/([(\[])\s+/g, '$1');
  return s;
}

/** Un título es publicable si no quedan etiquetas, llaves desbalanceadas ni restos de marcado. */
export function titleProblems(t) {
  const p = [];
  if (!t || t.length < 8) p.push('título vacío o muy corto');
  if (/[<>]/.test(t)) p.push('quedan etiquetas HTML');
  if ((t.match(/\{/g) || []).length !== (t.match(/\}/g) || []).length) p.push('llaves desbalanceadas');
  if (/[_^](?!\{)/.test(t.replace(/\w_\w/g, ''))) p.push('marcado _ o ^ suelto');
  if (/\$|\\[a-z]+/i.test(t)) p.push('restos de LaTeX');
  return p;
}

/** Texto plano comparable para detectar duplicados por título. */
export const normTitle = (t) =>
  String(t ?? '')
    .replace(/\^\{[^}]*\}/g, '') // las cargas (^{2−}) a veces faltan en otras versiones del mismo título
    .replace(/_\{([^}]*)\}/g, '$1')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

const slug = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const STOP = new Set(
  'a an the of on in and for to from with by via how does do is are why what its their study effect effects first structure structures structural theoretical exploring exploration understanding new one two la de el del los las y en un una'.split(' '),
);

const cleanName = (s) =>
  decodeEntities(String(s ?? ''))
    .replace(/[\u2010\u2011]/g, '-')
    .replace(/\b([A-Z])\.(?=[A-Z])/g, '$1. ') // "J.L. Cabellos" → "J. L. Cabellos"
    .replace(/\s+/g, ' ')
    .trim();

export function researchAreasFor(title) {
  return RESEARCH_RULES.filter(([, re]) => re.test(title)).map(([id]) => id);
}

/**
 * Decide qué obras de OpenAlex son nuevas y las convierte en entradas del YAML.
 * @param {object[]} works      resultados de OpenAlex (campos completos)
 * @param {Record<string, object>} crossref  mensaje de Crossref por DOI en minúsculas (puede faltar)
 * @param {{dois:Set<string>, titles:Set<string>, keys:Set<string>, ignore:Set<string>}} known
 * @returns {{added: {key:string, yaml:string, title:string, doi:string}[], skipped: {doi:string, title:string, reason:string}[]}}
 */
export function processWorks(works, crossref, known) {
  const added = [];
  const skipped = [];
  const seenTitles = new Set(known.titles);
  const seenDois = new Set(known.dois);
  const keys = new Set(known.keys);
  // Artículos primero: si hay capítulo y artículo con el mismo título, gana el artículo.
  const rank = (w) => (w.type === 'article' || w.type === 'review' ? 0 : 1);
  const sorted = [...works].sort((a, b) => rank(a) - rank(b));

  for (const w of sorted) {
    const doi = String(w.doi ?? '').replace(/^https?:\/\/doi\.org\//i, '').toLowerCase();
    const oaTitle = w.title ?? w.display_name ?? '';
    const skip = (reason) => skipped.push({ doi, title: oaTitle, reason });
    try {
      if (!doi) { skip('sin DOI'); continue; }
      if (seenDois.has(doi)) continue; // ya está en el sitio: no se informa
      if (known.ignore.has(doi)) continue; // excluida a propósito
      if (SKIP_DOI.some((re) => re.test(doi))) { skip('repositorio, preprint o duplicado conocido'); continue; }
      if (!ALLOWED_TYPES.has(w.type)) { skip(`tipo "${w.type}" no se publica`); continue; }
      if (w.is_retracted) { skip('retractado'); continue; }
      if (SKIP_TITLE.test(oaTitle)) { skip('errata, portada o material suplementario'); continue; }

      const c = crossref[doi] ?? {};
      let title = cleanTitle((c.title && c.title[0]) || oaTitle);
      if (titleProblems(title).length) title = cleanTitle(oaTitle).replace(/[_^]\{([^}]*)\}/g, '$1');
      const problems = titleProblems(title);
      if (problems.length) { skip(`título con problemas: ${problems.join(', ')}`); continue; }
      if (SKIP_TITLE.test(title)) { skip('errata, portada o material suplementario'); continue; }
      const nt = normTitle(title);
      if (seenTitles.has(nt)) { skip('mismo título que otra publicación del sitio'); continue; }

      let authors = (c.author ?? [])
        .map((a) => cleanName([a.given, a.family].filter(Boolean).join(' ') || a.name))
        .filter(Boolean);
      if (!authors.length) authors = (w.authorships ?? []).map((a) => cleanName(a.author?.display_name)).filter(Boolean);
      authors = [...new Set(authors)];
      if (!authors.length) { skip('sin autores'); continue; }
      if (!authors.some((a) => /cabellos/i.test(a))) { skip('el Dr. Cabellos no aparece entre los autores'); continue; }

      const src = w.primary_location?.source?.display_name ?? '';
      // Vide Leaf (10.37247) deposita en Crossref un título de libro equivocado.
      let journal = cleanName(doi.startsWith('10.37247/') ? 'Prime Archives (Vide Leaf)' : (c['container-title']?.[0] ?? src));
      if (!journal) { skip('sin revista o libro'); continue; }

      const year = Number(c.issued?.['date-parts']?.[0]?.[0] ?? w.publication_year);
      if (!Number.isInteger(year) || year < 1990 || year > 2100) { skip('año inválido'); continue; }

      // Fecha de publicación para ordenar: la primera fecha completa de Crossref (en línea, impresa) del mismo año;
      // si no hay, la de OpenAlex. Algunas revistas solo dan AAAA-01-01 en OpenAlex.
      const pad = (n) => String(n).padStart(2, '0');
      const crDates = [c['published-online'], c['published-print'], c.published]
        .map((x) => x?.['date-parts']?.[0])
        .filter((p) => Array.isArray(p) && p.length === 3 && p[0] === year)
        .map((p) => `${p[0]}-${pad(p[1])}-${pad(p[2])}`)
        .sort();
      const oaDate = /^\d{4}-\d{2}-\d{2}$/.test(w.publication_date ?? '') ? w.publication_date : '';
      const date = crDates[0] || oaDate;
      const b = w.biblio ?? {};
      const volume = String(c.volume ?? b.volume ?? '').trim();
      const issue = String(c.issue ?? b.issue ?? '').trim();
      let pages = String(c.page ?? [b.first_page, b.last_page].filter(Boolean).join('-')).trim();
      pages = pages.replace(/^(\S+)-\1$/, '$1').replace(/^(\d+)-(\d+)$/, '$1–$2');

      const ct = c.type ?? '';
      const type =
        w.type === 'review' ? 'review'
        : ct === 'book-chapter' || w.type === 'book-chapter' ? 'chapter'
        : ct === 'proceedings-article' || /conference|proceedings/.test(w.type) ? 'conference'
        : 'article';

      const pdfRaw = w.best_oa_location?.pdf_url ?? '';
      const pdf = /^https:\/\//.test(pdfRaw) ? pdfRaw : '';

      const family = slug((c.author?.[0]?.family) || authors[0].split(' ').pop());
      const word = slug(title).split('-').find((x) => x.length > 2 && !STOP.has(x) && !/^\d+$/.test(x)) || 'trabajo';
      let key = `${year}-${family}-${word}`;
      for (let n = 2; keys.has(key); n++) key = `${year}-${family}-${word}-${n}`;

      const q = (v) => JSON.stringify(v);
      let yaml = `${key}:\n  title: ${q(title)}\n  authors:\n${authors.map((a) => `    - ${q(a)}`).join('\n')}\n  journal: ${q(journal)}\n  year: ${year}\n`;
      if (date) yaml += `  date: ${q(date)}\n`;
      if (volume) yaml += `  volume: ${q(volume)}\n`;
      if (issue) yaml += `  issue: ${q(issue)}\n`;
      if (pages) yaml += `  pages: ${q(pages)}\n`;
      yaml += `  doi: ${q(doi)}\n`;
      if (pdf) yaml += `  pdf: ${q(pdf)}\n`;
      yaml += `  type: ${type}\n  researchAreas: [${researchAreasFor(title).join(', ')}]\n  members: [jose-luis-cabellos]\n`;

      keys.add(key);
      seenDois.add(doi);
      seenTitles.add(nt);
      added.push({ key, yaml, title, doi });
    } catch (e) {
      skip(`error al procesar: ${e?.message ?? e}`);
    }
  }
  return { added, skipped };
}

/** Lee DOIs, títulos y claves ya presentes en publications.yaml (sin parser YAML). */
export function readKnown(yamlText) {
  const dois = new Set();
  const titles = new Set();
  const keys = new Set();
  for (const line of yamlText.split(/\r?\n/)) {
    let m;
    if ((m = line.match(/^([A-Za-z0-9][\w-]*):\s*$/))) keys.add(m[1]);
    else if ((m = line.match(/^ {2}doi:\s*"(.*)"\s*$/))) dois.add(JSON.parse(`"${m[1]}"`).toLowerCase());
    else if ((m = line.match(/^ {2}title:\s*"(.*)"\s*$/))) titles.add(normTitle(JSON.parse(`"${m[1]}"`)));
  }
  return { dois, titles, keys };
}
