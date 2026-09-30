/**
 * Crea el bucket R2 de Notes si no existe (NOTES-F4, ADR-012). Idempotente.
 * Requiere R2 activado en la cuenta y haber iniciado sesión con `npx wrangler login`.
 *
 *   node scripts/cf-setup-r2.mjs
 */
import { execSync } from 'node:child_process';

const BUCKET = 'cabellos-research-files';
const LOCATION = 'wnam'; // Norteamérica occidental, como la base D1

const wrangler = (args) =>
  execSync(`npx wrangler ${args}`, { encoding: 'utf8', stdio: ['inherit', 'pipe', 'inherit'] });

const exists = () => new RegExp(`name:\\s+${BUCKET}\\s`).test(`${wrangler('r2 bucket list')}\n`);

if (exists()) {
  console.log(`El bucket "${BUCKET}" ya existe.`);
} else {
  console.log(`Creando el bucket "${BUCKET}"...`);
  wrangler(`r2 bucket create ${BUCKET} --location ${LOCATION}`);
  if (!exists()) throw new Error(`No se encontró "${BUCKET}" después de crearlo.`);
  console.log('Bucket creado (privado: los archivos los sirve el Worker).');
}
