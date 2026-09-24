# ADR-004 — Content Collections: datos neutrales + textos por idioma

## Estado
Aprobado

## Contexto
Integrantes, líneas y publicaciones se relacionan entre sí y deben existir en ES/EN sin duplicar relaciones (§4.4, §15).

## Decisión
- Colecciones `research`, `members` y `publications` con el loader `file()` sobre YAML; los textos cortos se guardan como `{es, en}`.
- Colección `texts` (loader `glob`) para el Markdown largo por idioma.
- Relaciones declaradas en un solo lado con `reference()` y resueltas de forma inversa en `utils/content.ts`.
- No se crea la entidad `Project` en v1.

## Alternativas consideradas
- Un Markdown por entidad e idioma: relaciones duplicadas en ES y EN.
- CMS headless: fuera de alcance.
- JSON: menos legible que YAML para editar a mano.

## Consecuencias positivas
- El build valida tipos y referencias.
- Agregar una publicación = 1 bloque YAML.

## Consecuencias negativas
- Editar requiere conocer YAML y Git (se documentará en 11-maintenance.md).

## Impacto
Base de las Fases 7–8.

## Fecha
2026-09-23
