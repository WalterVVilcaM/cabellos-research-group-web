# ADR-012 — Archivos de Notes en Cloudflare R2, servidos por el Worker

## Estado
Aprobado (D-N8, D-N9). Implementación: NOTES-F4.

## Contexto
Las notas pueden llevar PDF (lecturas, libros con derecho de distribución, material propio). Guardarlos en el repositorio lo hace crecer para siempre y deja visibles los archivos de borradores. R2 ya está activado en la cuenta del responsable técnico (plan gratuito: 10 GB-mes, 1 M operaciones clase A y 10 M clase B al mes, sin cargo por descargas).

## Decisión
1. **Bucket privado** `cabellos-research-files` (binding `NOTES_FILES`, ubicación `wnam`). Lo crea `scripts/cf-setup-r2.mjs`.
2. **Los archivos los sirve el Worker** en `/files/<clave>` (`src/pages/files/[...key].pdf.ts`), no un dominio público de R2:
   - funciona ya en `*.workers.dev`, sin dominio propio;
   - solo entrega adjuntos de **notas visibles** (un PDF de un borrador o de una nota archivada responde 404 aunque se conozca la URL);
   - soporta rangos (`206`) para visores de PDF, `ETag`/`304`, `Cache-Control: public, max-age=3600`, `nosniff`;
   - `?download=1` responde con `Content-Disposition: attachment` y el nombre original del archivo.
3. **Claves** `notes/<año>/<id de nota>/<uuid corto>-<nombre seguro>.pdf` (minúsculas, sin acentos ni espacios); el nombre original se guarda en D1 y como metadato del objeto (§21–§22).
4. **Validación en el servidor** (`src/utils/storage.ts`, la usará el panel en NOTES-F5): extensión `.pdf`, tipo `application/pdf`, firma `%PDF-` en los primeros bytes, 1 byte–20 MB, derecho de distribución obligatorio (`rights`) y **tope total de 9.5 GB** calculado con la suma de `attachments.size_bytes` en D1 (D-N9). Errores con mensajes claros para el editor (§90).
5. En D1, `attachments.storage_key` usa `r2:<clave>`. El formato anterior `static:<ruta>` sigue soportado por compatibilidad, pero `public/files/` se retira.
6. La subida y el borrado desde el navegador llegan con el panel (NOTES-F5) y **solo detrás de Cloudflare Access** (NOTES-F6): no hay ningún endpoint de escritura público.
7. El PDF de prueba vive en `seeds/files/` y se sube con `npm run files:seed:remote`.

## Alternativas consideradas
- Bucket público con subdominio `r2.dev`: limitado en tasa por Cloudflare (no apto para producción) y expone archivos de borradores.
- Dominio propio para archivos (`files.cabellosresearchgroup.org`): requiere el dominio en Cloudflare; se puede añadir después sin cambiar las vistas (§4 de la especificación).
- Seguir en el repositorio: crecimiento del repo y borradores públicos.

## Consecuencias positivas
- El repositorio deja de crecer con PDF; los borradores quedan privados.
- Costo $0 con el tope de 9.5 GB; descargas sin cargo de salida.
- Las vistas no cambian: reciben `attachment.url` ya resuelta.

## Consecuencias negativas
- Cada descarga pasa por el Worker (cuenta en la cuota de peticiones de Workers, muy por encima del uso esperado).
- R2 requiere un método de pago registrado aunque no se cobre.

## Impacto
`wrangler.jsonc` (`r2_buckets`), `src/utils/storage.ts`, `src/pages/files/[...key].pdf.ts`, `src/utils/notes.ts` (`fileUrl`, `visibleAttachment`), `src/env.d.ts`, `seeds/`, `scripts/cf-setup-r2.mjs`, `package.json` (`files:*`). Se elimina `public/files/`.

## Fecha
2026-09-30
