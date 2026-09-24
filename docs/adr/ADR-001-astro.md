# ADR-001 — Astro como framework, sin React en v1

## Estado
Aprobado

## Contexto
El orquestador fija Astro + TypeScript y pide justificar React (§17.3). El sitio es de contenido, con una sola interacción: el menú móvil.

## Decisión
Usar Astro 7 con componentes `.astro` y TypeScript estricto. No instalar `@astrojs/react` en v1. El menú móvil se resuelve con ~0.5 KB de JS nativo.

## Alternativas consideradas
- Next.js / Gatsby: más JS en cliente y runtime innecesario.
- Astro + React para la navegación: hidratación sin beneficio.
- HTML estático sin framework: sin schemas, i18n ni componentes.

## Consecuencias positivas
- JS mínimo; Lighthouse Performance 98–100 en las pruebas locales.
- Menos dependencias y superficie de mantenimiento.

## Consecuencias negativas
- Si en el futuro hace falta un buscador client-side o filtros ricos, habrá que agregar una isla (nuevo ADR).

## Impacto
Afecta a todos los componentes. Reversible con bajo costo (Astro admite islas).

## Fecha
2026-09-23
