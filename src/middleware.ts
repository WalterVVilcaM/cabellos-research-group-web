/**
 * Middleware: protege /admin (panel de Notes). El resto del sitio no pasa por aquí.
 * Ver src/utils/admin-auth.ts y ADR-013.
 */
import { defineMiddleware } from 'astro:middleware';
import { authenticate, authErrorResponse } from './utils/admin-auth';
import { withBase } from './i18n/utils';

const ADMIN_PREFIX = withBase('/admin');

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  if (context.isPrerendered || !(pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`))) {
    return next();
  }
  const auth = await authenticate(context.request, context.url);
  if (!auth.ok) return authErrorResponse(auth);
  context.locals.adminEmail = auth.email;

  const response = await next();
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'same-origin');
  return response;
});
