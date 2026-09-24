# ADR-003 — Routing i18n: ES sin prefijo, EN en /en/, vistas compartidas

## Estado
Aprobado. El punto 1 y las rutas ES/EN fueron reemplazados por [ADR-007](./ADR-007-en-idioma-por-defecto.md) (EN por defecto, ES en `/es/`).

## Contexto
El sitio es bilingüe (§18). Hay que decidir prefijos, slugs y cómo evitar duplicar páginas.

## Decisión
1. i18n nativo de Astro: `defaultLocale: 'es'`, `prefixDefaultLocale: false`.
2. Secciones con rutas traducidas (`/investigacion/` ↔ `/en/research/`), centralizadas en `src/i18n/utils.ts`.
3. Slugs de líneas traducidos (definidos en datos); slugs de integrantes compartidos.
4. Cada vista vive una vez en `src/views/` y recibe `lang`; los archivos de `src/pages/` solo la instancian. Se agrega la carpeta `src/views/` al árbol del orquestador.
5. Diccionario de UI tipado: las claves faltantes en EN no compilan.
6. 404 única y bilingüe.

## Alternativas consideradas
- Prefijo en ambos idiomas (`/es/`): URLs más largas para el público principal.
- Duplicar páginas por idioma: mantenimiento doble.
- Slugs únicos en inglés para todo: peor para el público hispanohablante.

## Consecuencias positivas
- Selector de idioma que conserva la página equivalente.
- `hreflang` correcto en todas las rutas.
- Una sola implementación por vista.

## Consecuencias negativas
- Las rutas de sección están en código (cambiarlas requiere un redirect 301).

## Impacto
Congela las URLs públicas (Gate 5).

## Fecha
2026-09-23
