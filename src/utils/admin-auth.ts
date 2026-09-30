/**
 * Autenticación del panel /admin (NOTES-F6, ADR-013).
 *
 * Primera barrera: Cloudflare Access (aplicación "self-hosted" para la ruta /admin del dominio del
 * Worker; política por correo con código de un solo uso). Access solo deja pasar a correos autorizados.
 * Segunda barrera (aquí): el Worker comprueba el JWT que Access añade a cada petición
 * (`Cf-Access-Jwt-Assertion`) con las claves públicas del equipo, el emisor y el AUD de la aplicación,
 * y además que el correo esté en ADMIN_EMAILS. Si falta la configuración, el panel queda cerrado.
 *
 * Desarrollo local: solo en localhost/127.0.0.1 y solo si existe ADMIN_DEV_EMAIL (archivo .dev.vars,
 * que no se sube al repositorio) se omite Access.
 */
import { env } from 'cloudflare:workers';
import { createRemoteJWKSet, jwtVerify } from 'jose';

export type AuthResult = { ok: true; email: string } | { ok: false; status: 401 | 403 | 503; reason: string };

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
  if (!email || !allowedEmails().includes(email)) return { ok: false, status: 403, reason: 'not-allowed' };
  return { ok: true, email };
}

const messages: Record<string, string> = {
  'not-configured':
    'El panel todavía no está conectado a Cloudflare Access. Configura ACCESS_TEAM_DOMAIN y ACCESS_AUD en wrangler.jsonc.',
  'no-token': 'Necesitas iniciar sesión con Cloudflare Access para entrar al panel.',
  'invalid-token': 'Tu sesión no es válida o expiró. Vuelve a cargar la página para iniciar sesión.',
  'not-allowed': 'Tu correo no tiene permiso para usar el panel.',
};

/** Página mínima de error (no se revela nada de la configuración). */
export function authErrorResponse(result: Extract<AuthResult, { ok: false }>): Response {
  const body = `<!doctype html><html lang="es-MX"><head><meta charset="utf-8"><meta name="robots" content="noindex">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>Panel · Acceso</title>
<style>body{font-family:system-ui,sans-serif;max-width:40rem;margin:4rem auto;padding:0 1rem;color:#1b2622}
h1{font-size:1.5rem}a{color:#1d6a4e}</style></head><body>
<h1>Acceso al panel</h1><p>${messages[result.reason] ?? 'No tienes acceso.'}</p><p><a href="/">Volver al sitio</a></p></body></html>`;
  return new Response(body, {
    status: result.status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  });
}
