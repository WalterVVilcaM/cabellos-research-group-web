/**
 * Autenticación del panel /admin (NOTES-F6, ADR-013).
 *
 * Primera barrera: Cloudflare Access (aplicación "self-hosted" para la ruta /admin del dominio;
 * política por correo con código de un solo uso). Access solo deja pasar a correos autorizados.
 * **La lista de correos se administra solo en Access** (Zero Trust → Policies → «Correos del panel»).
 * Segunda barrera (aquí): el Worker comprueba el JWT que Access añade a cada petición
 * (`Cf-Access-Jwt-Assertion`) con las claves públicas del equipo, el emisor y el AUD de la aplicación.
 * ADMIN_EMAILS es opcional: si se define, además restringe a esos correos; vacía o ausente, vale
 * cualquier correo que Access haya autorizado. Si falta ACCESS_TEAM_DOMAIN o ACCESS_AUD, el panel queda cerrado.
 *
 * Desarrollo local: solo en localhost/127.0.0.1 y solo si existe ADMIN_DEV_EMAIL (archivo .dev.vars,
 * que no se sube al repositorio) se omite Access.
 */
import { env } from 'cloudflare:workers';
import { createRemoteJWKSet, jwtVerify } from 'jose';

export type AuthResult =
  | { ok: true; email: string }
  | { ok: false; status: 401 | 403 | 503; reason: string; email?: string };

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function jwks(teamDomain: string) {
  let set = jwksCache.get(teamDomain);
  if (!set) {
    set = createRemoteJWKSet(new URL('/cdn-cgi/access/certs', teamDomain));
    jwksCache.set(teamDomain, set);
  }
  return set;
}

const allowedEmails = () =>
  (env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

function tokenFrom(request: Request): string | null {
  const header = request.headers.get('Cf-Access-Jwt-Assertion');
  if (header) return header;
  const cookie = request.headers.get('Cookie') ?? '';
  const match = /(?:^|;\s*)CF_Authorization=([^;]+)/.exec(cookie);
  return match ? decodeURIComponent(match[1]!) : null;
}

export async function authenticate(request: Request, url: URL): Promise<AuthResult> {
  const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  if (isLocal && env.ADMIN_DEV_EMAIL) return { ok: true, email: env.ADMIN_DEV_EMAIL.toLowerCase() };

  const team = env.ACCESS_TEAM_DOMAIN?.replace(/\/$/, '');
  const aud = env.ACCESS_AUD;
  if (!team || !aud) return { ok: false, status: 503, reason: 'not-configured' };

  const token = tokenFrom(request);
  if (!token) return { ok: false, status: 401, reason: 'no-token' };

  let email: string | undefined;
  try {
    const { payload } = await jwtVerify(token, jwks(team), { issuer: team, audience: aud });
    email = typeof payload.email === 'string' ? payload.email.toLowerCase() : undefined;
  } catch {
    return { ok: false, status: 401, reason: 'invalid-token' };
  }
  if (!email) return { ok: false, status: 403, reason: 'not-allowed' };
  const allowed = allowedEmails();
  if (allowed.length > 0 && !allowed.includes(email)) return { ok: false, status: 403, reason: 'not-allowed', email };
  return { ok: true, email };
}

const messages: Record<string, string> = {
  'not-configured':
    'El panel todavía no está conectado a Cloudflare Access. Configura ACCESS_TEAM_DOMAIN y ACCESS_AUD en wrangler.jsonc.',
  'no-token': 'Necesitas iniciar sesión con Cloudflare Access para entrar al panel.',
  'invalid-token': 'Tu sesión no es válida o expiró. Vuelve a cargar la página para iniciar sesión.',
  'not-allowed': 'Tu correo no tiene permiso para usar el panel.',
};

const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/**
 * Página mínima de error (no se revela nada de la configuración).
 * Si ya hay una sesión de Access (correo sin permiso o sesión inválida), se ofrece cerrarla:
 * la cookie de Access dura 24 h y, sin cerrar sesión, cada visita a /admin repetiría este mensaje.
 * `/cdn-cgi/access/logout` revoca la sesión en todas las aplicaciones de Access.
 */
export function authErrorResponse(result: Extract<AuthResult, { ok: false }>): Response {
  const who = result.email ? `<p>Entraste como <strong>${escapeHtml(result.email)}</strong>.</p>` : '';
  const canSwitch = result.reason === 'not-allowed' || result.reason === 'invalid-token';
  const actions = canSwitch
    ? `<p><a class="btn" href="/cdn-cgi/access/logout">Cerrar sesión y entrar con otro correo</a></p>
<p class="hint">Después de cerrar sesión, vuelve a abrir /admin/ y escribe el correo autorizado.</p>
<p><a href="/">Volver al sitio</a></p>`
    : `<p><a href="/">Volver al sitio</a></p>`;
  const body = `<!doctype html><html lang="es-MX"><head><meta charset="utf-8"><meta name="robots" content="noindex">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>Panel · Acceso</title>
<style>body{font-family:system-ui,sans-serif;max-width:40rem;margin:4rem auto;padding:0 1rem;color:#1b2622;line-height:1.5}
h1{font-size:1.5rem}a{color:#1d6a4e}.btn{display:inline-block;padding:.7rem 1.1rem;border-radius:.5rem;background:#1d6a4e;color:#fff;
text-decoration:none;font-weight:600}.btn:hover,.btn:focus-visible{background:#15513b}.hint{color:#4a5752;font-size:.95rem}</style></head><body>
<h1>Acceso al panel</h1><p>${messages[result.reason] ?? 'No tienes acceso.'}</p>${who}${actions}</body></html>`;
  return new Response(body, {
    status: result.status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  });
}
