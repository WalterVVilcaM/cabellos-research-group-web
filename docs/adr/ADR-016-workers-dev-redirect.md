# ADR-016 — Redirección permanente de *.workers.dev al dominio propio

## Estado
Aprobado (decisión del responsable técnico, 2026-10-13).

## Contexto
Desde el 2026-10-10 el sitio vive en `cabellosresearchgroup.org`, pero la dirección gratuita `cabellos-research-group.cabellos.workers.dev` siguió sirviendo el sitio completo. El 2026-10-13 los buscadores ya la mostraban como resultado del grupo, mientras que el dominio propio aún no aparecía. Las canónicas apuntan al dominio, pero dos direcciones con el mismo contenido retrasan el cambio.

Opciones para workers.dev:
- **Apagarla** (`workers_dev: false`): el resultado indexado da error, no transfiere nada al dominio y los enlaces ya compartidos se rompen.
- **Redirigir con 301**: el buscador traslada lo indexado al dominio y los enlaces viejos siguen funcionando.

## Decisión
1. Toda petición a `cabellos-research-group.cabellos.workers.dev` recibe un **301** a `https://cabellosresearchgroup.org` con la misma ruta y los mismos parámetros. También `/admin/…`.
2. La redirección vive en una **entrada propia del Worker** (`src/worker.ts`, `main` en `wrangler.jsonc`) que después llama al manejador del adaptador (`@astrojs/cloudflare/handler`). No va en `src/middleware.ts` porque las páginas estáticas no pasan por el middleware.
3. `assets.run_worker_first: true` para que también las páginas estáticas entren primero al Worker. Las reglas de redirección de Cloudflare no sirven aquí: workers.dev no es una zona de la cuenta.
4. Solo se redirige el nombre exacto. Las URL de vista previa (`<versión>-cabellos-research-group.cabellos.workers.dev`) y `localhost` no cambian.

## Consecuencias
- Cada petición, también la de archivos estáticos, cuenta como invocación del Worker. Con ~200 visitas al mes queda muy por debajo del límite gratuito (100 000 al día).
- La app de Access del panel puede quedarse solo con el destino `cabellosresearchgroup.org/admin`; el de workers.dev ya no recibe tráfico.
- Cuando el buscador muestre el dominio propio y ya no workers.dev, se puede poner `workers_dev: false`, quitar `src/worker.ts`, `main` y `run_worker_first`.

## Fecha
2026-10-13
