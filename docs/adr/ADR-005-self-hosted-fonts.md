# ADR-005 — Fuentes autoalojadas con la Fonts API (proveedor local)

## Estado
Aprobado

## Contexto
El sistema de diseño usa Source Serif 4, IBM Plex Sans e IBM Plex Mono. Se requiere privacidad (sin terceros) y builds reproducibles.

## Decisión
Copiar a `src/assets/fonts/` los woff2 del subset latin de los pesos usados (9 archivos, licencia OFL incluida) y declararlos con `fontProviders.local()`. Precargar solo Plex Sans 400.

## Alternativas consideradas
- `fontProviders.fontsource()` o `google()`: descargan en cada build (fallan sin red y dependen de terceros).
- Paquetes `@fontsource/*`: dependencias extra por archivos estáticos.

## Consecuencias positivas
- Build 100 % offline y determinista.
- Sin peticiones a terceros en el cliente (RNF-10, RNF-11).
- Fallbacks de métricas generados por Astro (menos CLS).

## Consecuencias negativas
- Actualizar una fuente es manual.
- Los caracteres fuera de latin (subíndices ₁₀, griego) usan la fuente de respaldo.

## Impacto
Afecta al rendimiento y la privacidad.

## Fecha
2026-09-23

## Actualización 2026-09-23 (design system v1.1)
Se deja **solo IBM Plex Sans** (4 archivos). Source Serif 4 e IBM Plex Mono se retiran de la configuración. Sus archivos en `src/assets/fonts/` ya no se usan y deben borrarse del repo.
