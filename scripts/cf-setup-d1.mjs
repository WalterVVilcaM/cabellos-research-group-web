/**
 * Prepara la base de datos D1 de Notes en la cuenta de Cloudflare (NOTES-F3, ADR-011).
 * Idempotente: si la base `cabellos-notes` ya existe, solo escribe su id en wrangler.jsonc.
 * Requiere haber iniciado sesión con `npx wrangler login`.
 *
 *   node scripts/cf-setup-d1.mjs
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const DB_NAME = 'cabellos-notes';
const LOCATION = 'wnam'; // Norteamérica occidental: la más cercana a Tapachula entre las opciones de D1
const CONFIG = new URL('../wrangler.jsonc', import.meta.url);

const wrangler = (args) =>
  execSync(`npx wrangler ${args}`, { encoding: 'utf8', stdio: ['inherit', 'pipe', 'inherit'] });

function findDatabase() {
  const out = wrangler('d1 list --json');
  const list = JSON.parse(out.slice(out.indexOf('[')));
  return list.find((db) => db.name === DB_NAME);
}

let db = findDatabase();
if (db) {
  console.log(`La base "${DB_NAME}" ya existe (${db.uuid}).`);
} else {
  console.log(`Creando la base "${DB_NAME}"...`);
  wrangler(`d1 create ${DB_NAME} --location ${LOCATION}`);
  db = findDatabase();
  if (!db) throw new Error(`No se encontró "${DB_NAME}" después de crearla.`);
  console.log(`Base creada (${db.uuid}).`);
}

const text = readFileSync(CONFIG, 'utf8');
const updated = text.replace(
  /("database_name":\s*"cabellos-notes",[\s\S]*?"database_id":\s*")[0-9a-f-]{36}(")/,
  `$1${db.uuid}$2`,
);
if (updated === text && !text.includes(db.uuid)) {
  throw new Error('No se pudo escribir el id en wrangler.jsonc (¿cambió su formato?).');
}
writeFileSync(CONFIG, updated);
console.log(`wrangler.jsonc apunta a la base ${db.uuid}.`);
