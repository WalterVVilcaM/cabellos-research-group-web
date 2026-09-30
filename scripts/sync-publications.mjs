#!/usr/bin/env node
/**
 * Sincroniza src/content/data/publications.yaml con OpenAlex (ORCID del Dr. Cabellos) + Crossref.
 *
 *   node scripts/sync-publications.mjs            → agrega las publicaciones nuevas al YAML
 *   node scripts/sync-publications.mjs --dry-run  → solo muestra qué agregaría
 *
 * Lo ejecuta cada semana .github/workflows/deploy.yml. El sitio solo se publica si después
 * pasan `astro check` y `astro build`; si algo falla, la página no cambia.
 *
 * Seguridad:
 * - Nunca borra ni modifica entradas existentes; solo agrega al final.
 * - Ignora preprints, repositorios (Zenodo/Figshare), erratas, portadas, material suplementario,
 *   duplicados (por DOI y por título) y los DOI de scripts/publications-ignore.txt.
 * - Si aparecen más de MAX_NEW publicaciones de golpe, no toca nada y falla (algo raro pasó).
 * - Si OpenAlex o Crossref no responden, no toca nada y termina sin error.
 */
import { readFile, writeFile, appendFile } from 'node:fs/promises';
import { processWorks, readKnown } from './publications-core.mjs';

const YAML_PATH = new URL('../src/content/data/publications.yaml', import.meta.url);
const IGNORE_PATH = new URL('./publications-ignore.txt', import.meta.url);

/** Identidades del Dr. Cabellos en OpenAlex. Si su ORCID se liga a otro perfil, agrégalo aquí. */
const ORCID = '0000-0002-9438-8725';
const OPENALEX_AUTHORS = ['A5001201662', 'A5055480952'];
const MAX_NEW = 12;
const UA = 'cabellos-research-group-web (https://github.com/WalterVVilcaM/cabellos-research-group-web)';
const DRY = process.argv.includes('--dry-run');

async function getJson(url, tries = 3) {
  for (let i = 1; ; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
      if (r.status === 404) return null;
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) {
      if (i >= tries) throw new Error(`${url}: ${e.message}`);
      await new Promise((res) => setTimeout(res, 2000 * i));
    }
  }
}

async function openAlexWorks(filter) {
  const key = process.env.OPENALEX_API_KEY ? `&api_key=${process.env.OPENALEX_API_KEY}` : '';
  const out = [];
  let cursor = '*';
  while (cursor) {
    const d = await getJson(`https://api.openalex.org/works?filter=${filter}&per-page=200&cursor=${cursor}${key}`);
    if (!d?.results?.length) break;
    out.push(...d.results);
    cursor = d.meta?.next_cursor;
  }
  return out;
}

async function setOutput(name, value) {
  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
}
async function summary(md) {
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, `${md}\n`);
}

async function main() {
  const yamlText = await readFile(YAML_PATH, 'utf8');
  const ignoreText = await readFile(IGNORE_PATH, 'utf8').catch(() => '');
  const ignore = new Set(
    ignoreText.split(/\r?\n/).map((l) => l.replace(/#.*/, '').trim().toLowerCase()).filter(Boolean),
  );
  const known = { ...readKnown(yamlText), ignore };

  let works;
  try {
    const lists = await Promise.all([
      openAlexWorks(`author.orcid:${ORCID}`),
      openAlexWorks(`author.id:${OPENALEX_AUTHORS.join('|')}`),
    ]);
    const byId = new Map();
    for (const w of lists.flat()) byId.set(w.id, w);
    works = [...byId.values()];
  } catch (e) {
    console.warn(`OpenAlex no respondió; no se cambia nada. (${e.message})`);
    await summary(`⚠️ OpenAlex no respondió; no se cambió nada.\n\n\`${e.message}\``);
    await setOutput('changed', 'false');
    return;
  }
  console.log(`OpenAlex: ${works.length} obras; en el sitio: ${known.dois.size}.`);

  // Solo se consulta Crossref para los DOI que todavía no están en el sitio.
  const pending = works
    .map((w) => String(w.doi ?? '').replace(/^https?:\/\/doi\.org\//i, '').toLowerCase())
    .filter((d) => d && !known.dois.has(d) && !ignore.has(d));
  const crossref = {};
  for (const doi of pending) {
    try {
      const d = await getJson(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
      if (d?.message) crossref[doi] = d.message;
    } catch (e) {
      console.warn(`Crossref sin datos para ${doi}: ${e.message}`);
    }
  }

  const { added, skipped } = processWorks(works, crossref, known);

  for (const s of skipped) console.log(`  omitida  ${s.doi || '(sin DOI)'} — ${s.reason} — ${s.title}`);
  for (const a of added) console.log(`  NUEVA    ${a.doi} — ${a.title}`);

  if (added.length > MAX_NEW) {
    const msg = `Se encontraron ${added.length} publicaciones nuevas de golpe (máximo ${MAX_NEW}). No se cambia nada: revisa a mano.`;
    console.error(msg);
    await summary(`❌ ${msg}`);
    process.exit(1);
  }

  if (!added.length) {
    console.log('Sin publicaciones nuevas.');
    await summary('Sin publicaciones nuevas.');
    await setOutput('changed', 'false');
    return;
  }

  await summary(
    `### ${added.length} publicación(es) nueva(s)\n\n${added.map((a) => `- ${a.title} — https://doi.org/${a.doi}`).join('\n')}` +
      (skipped.length ? `\n\n<details><summary>${skipped.length} omitida(s)</summary>\n\n${skipped.map((s) => `- ${s.doi}: ${s.reason}`).join('\n')}\n</details>` : ''),
  );

  if (DRY) {
    console.log('\n--dry-run: no se escribe nada.\n');
    console.log(added.map((a) => a.yaml).join('\n'));
    await setOutput('changed', 'false');
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const block = added.map((a) => `# Agregada automáticamente el ${today} (revisar researchAreas)\n${a.yaml}`).join('\n');
  await writeFile(YAML_PATH, `${yamlText.replace(/\s*$/, '')}\n\n${block}`, 'utf8');
  console.log(`Agregadas ${added.length} publicación(es) a publications.yaml.`);
  await setOutput('changed', 'true');
  await setOutput('count', String(added.length));
}

main().catch(async (e) => {
  console.error(e);
  await summary(`❌ Error inesperado: ${e.message}`);
  process.exit(1);
});
