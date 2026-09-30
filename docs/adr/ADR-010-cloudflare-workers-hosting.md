# ADR-010 — Hosting en Cloudflare Workers con Static Assets

## Estado
Aprobado (D-N8, 2026-09-29). Implementación: NOTES-F2.

## Contexto
El Dr. Cabellos publicará notas desde un panel propio (`docs/13-notes-editorial-module.md`, D-N8). GitHub Pages solo sirve archivos estáticos: no puede ejecutar el panel, la API, ni conectarse a una base de datos o a un almacenamiento de archivos. Se compararon Cloudflare, Supabase, Firebase y paneles sobre GitHub (§0.1, D-N8). Tráfico esperado: ~200 visitas al mes.

## Decisión
1. El sitio se sirve desde **Cloudflare Workers con Static Assets** (`wrangler.jsonc`, carpeta `dist/`). Worker: `cabellos-research-group`.
2. Cuenta de Cloudflare: la del responsable técnico (definitiva). El Dr. no necesita cuenta.
3. **NOTES-F2 (hecho):** réplica en `https://cabellos-research-group.cabellos.workers.dev/`. Desde NOTES-F3 (ADR-011) el Worker ejecuta las rutas de Notes y **GitHub Pages deja de actualizarse** (queda congelado con la última versión estática); la vista previa oficial es la de `workers.dev`.
4. En NOTES-F3 en adelante se añade el adaptador `@astrojs/cloudflare` solo para las rutas dinámicas (Notes, `/admin`, `/api`); el resto sigue estático.
5. Despliegue: por ahora manual con un `.cmd` (`wrangler login` en el equipo del responsable técnico; ningún token pasa por el chat ni por el repositorio). Después, **Workers Builds** (el repositorio conectado desde el panel de Cloudflare publica en cada push a `main`, sin tokens en GitHub).
6. `SITE` sigue apuntando al dominio final, así que las canónicas de la réplica apuntan a `cabellosresearchgroup.org` y la réplica no compite en buscadores.

## Alternativas consideradas
- Cloudflare Pages: se prefiere Workers con Static Assets, que es donde Cloudflare concentra las funciones nuevas y permite rutas dinámicas y bindings en la misma unidad.
- Supabase + GitHub Pages: 1 GB de archivos y pausa de proyectos gratuitos tras una semana sin actividad.
- Firebase: Storage exige el plan de pago por uso (Blaze).
- VPS propio: mantenimiento desproporcionado (especificación §109).

## Consecuencias positivas
- Sitio, panel, base de datos y archivos en un mismo proveedor, con cuota gratuita holgada.
- La migración no reescribe el sitio: mismo build de Astro.

## Consecuencias negativas
- Nueva dependencia de desarrollo (`wrangler`).
- Mientras no haya despliegue automático, publicar en Cloudflare requiere ejecutar el `.cmd`.

## Impacto
`wrangler.jsonc`, `package.json` (scripts `cf:deploy`, `cf:dev`), `.gitignore` (`.wrangler/`).

## Fecha
2026-09-29
