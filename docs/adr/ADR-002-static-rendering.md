# ADR-002 — Renderizado estático (SSG)

## Estado
Aprobado

## Contexto
No hay backend, login ni datos dinámicos (§11). Hosting previsto: Cloudflare Pages.

## Decisión
Salida `static` (predeterminada en Astro), `trailingSlash: 'always'` y `build.format: 'directory'`. Sin adaptador SSR.

## Alternativas consideradas
- SSR en Cloudflare Workers: complejidad sin requisito.
- ISR/híbrido: sin contenido que cambie en tiempo real.

## Consecuencias positivas
- HTML precomputado: rápido, seguro y cacheable en CDN.
- Despliegue trivial y rollback por commit.

## Consecuencias negativas
- Cada cambio de contenido requiere un build (≈ 2 s localmente).

## Impacto
Afecta al despliegue (Fase 11).

## Fecha
2026-09-23
