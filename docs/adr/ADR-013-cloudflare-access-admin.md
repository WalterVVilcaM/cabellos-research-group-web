# ADR-013 — Panel /admin protegido con Cloudflare Access y verificación del JWT

## Estado
Aprobado (D-N8). Implementación: NOTES-F6 (junto con el panel, NOTES-F5).

## Contexto
El panel permite crear, editar, publicar y borrar notas y archivos. No se implementan contraseñas propias (§42). El sitio público y el panel viven en el mismo Worker y el mismo dominio (`*.workers.dev` hoy; `cabellosresearchgroup.org` después). La protección "por Worker" de Access cubre todo el Worker, así que no sirve: el sitio debe seguir siendo público.

## Decisión
1. **Todo lo privado vive bajo `/admin`**: el panel (`/admin/…`) y su API (`/admin/api/…`). Así basta **una aplicación de Access** de tipo *self-hosted* para el dominio del Worker con la ruta `admin`.
2. **Política de Access:** *Allow* por correo (hoy solo el del responsable técnico; el del Dr. se agrega después), con inicio de sesión por **código de un solo uso** enviado al correo.
3. **Defensa en profundidad en el Worker** (`src/middleware.ts`, `src/utils/admin-auth.ts`): en cada petición a `/admin` se verifica el JWT de Access (`Cf-Access-Jwt-Assertion` o la cookie `CF_Authorization`) con la biblioteca `jose`: firma con las claves públicas del equipo (`/cdn-cgi/access/certs`), emisor = dominio del equipo, audiencia = AUD de la aplicación, vigencia. Después, el correo debe estar en `ADMIN_EMAILS`.
4. **Falla cerrado:** sin `ACCESS_TEAM_DOMAIN` y `ACCESS_AUD` el panel responde 503; token ausente o inválido → 401; correo no autorizado → 403.
5. Respuestas del panel con `Cache-Control: no-store`, `X-Robots-Tag: noindex`, `X-Frame-Options: DENY`, `Referrer-Policy: same-origin`. `robots.txt` excluye `/admin/`. Los formularios POST quedan protegidos contra CSRF por la verificación de origen de Astro.
6. **Desarrollo local:** con `ADMIN_DEV_EMAIL` en `.dev.vars` (no se versiona) y solo en `localhost`/`127.0.0.1` se omite Access.
7. Las variables (`ACCESS_TEAM_DOMAIN`, `ACCESS_AUD`, `ADMIN_EMAILS`) no son secretos y van en `wrangler.jsonc`.

## Alternativas consideradas
- Access para todo el Worker ("Protect this Worker"): haría privado el sitio público.
- Login propio con contraseñas: más superficie y mantenimiento (§42).
- Confiar solo en Access sin verificar el JWT: si algún día cambia una ruta o un dominio, el panel quedaría abierto.

## Consecuencias positivas
- Sin contraseñas que guardar; alta y baja de editores desde el panel de Access y `ADMIN_EMAILS`.
- Si Access se desconfigura, el panel se cierra en lugar de abrirse.

## Consecuencias negativas
- Al pasar al dominio final hay que crear (o ampliar) la aplicación de Access para ese dominio.
- Nueva dependencia: `jose`.

## Verificación
Probado en local con claves generadas y un JWKS local: token válido → 200 (cabecera o cookie); audiencia incorrecta, firma falsa o token vencido → 401; correo no autorizado → 403; sin configuración → 503; formularios desde otro origen → 403.

## Fecha
2026-09-30
