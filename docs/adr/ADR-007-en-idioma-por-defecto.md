# ADR-007 — Inglés como idioma por defecto (EN sin prefijo, ES en /es/)

## Estado
Aprobado. Reemplaza el punto 1 de ADR-003 y las rutas que ADR-003 congeló.

## Contexto
Walter Vilca, el responsable técnico, pidió el 2026-09-24 que el inglés sea el idioma principal del sitio y el español el secundario. El sitio aún no está publicado porque el Gate 7 sigue pendiente, así que ninguna URL pública se pierde.

## Decisión
1. i18n de Astro: `locales: ['en', 'es']`, `defaultLocale: 'en'`, `prefixDefaultLocale: false`.
2. EN en la raíz (`/`, `/research/`, `/team/`, `/publications/`, `/contact/`). ES bajo `/es/`, con sus slugs en español (`/es/investigacion/`, `/es/integrantes/`, `/es/publicaciones/`, `/es/contacto/`).
3. `hreflang="x-default"` apunta a la versión en inglés. El selector se muestra como `EN / ES`. La 404 presenta primero el inglés y después el español.
4. El resto de ADR-003 sigue vigente: vistas compartidas, slugs traducidos, diccionario tipado y 404 única.
5. Rutas anteriores:
   - las rutas ES sin prefijo (`/contacto/`, `/investigacion/…` y las demás) redirigen con 301 a su equivalente bajo `/es/`;
   - las rutas `/en/…` no pueden redirigir, porque con EN por defecto el middleware i18n de Astro deja de servirlas. Sus archivos quedan vacíos y hay que borrarlos.

## Alternativas consideradas
- Prefijo en ambos idiomas (`/en/` y `/es/`): URLs más largas sin beneficio claro.
- Detectar el idioma del navegador y redirigir: requiere JS o servidor, y dificulta el rastreo. Queda fuera de v1.

## Consecuencias positivas
- El público internacional y los buscadores reciben primero el inglés.
- El cambio se hizo solo en `sectionPaths`, en la configuración y en los envoltorios de `src/pages/`; las vistas no cambiaron.

## Consecuencias negativas
- El inglés aún no está validado por el equipo, y ahora es la cara principal del sitio. La validación del inglés pasa a ser prioritaria en la Fase 10.
- Mientras existan los archivos antiguos de `src/pages/en/`, el build genera páginas vacías en `/en/`. Hay que borrar esa carpeta antes del release.

## Impacto
Cambia las URLs congeladas en el Gate 5 y en `04-information-architecture.md` (v1.1).

## Fecha
2026-09-24
