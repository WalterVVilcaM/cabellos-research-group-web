# Architecture Decision Records (ADR)

Registro de decisiones arquitectónicas del proyecto (orquestador §29).

## Cuándo crear un ADR

Cuando una decisión afecta arquitectura, sería costosa de revertir, modifica routing, agrega framework o dependencia importante, cambia i18n, fuente de contenido o despliegue, o agrega backend/CMS.

## Registro

| ID | Título | Fase | Estado |
|---|---|---|---|
| [ADR-001](./ADR-001-astro.md) | Astro como framework, sin React en v1 | 5 | Aprobado |
| [ADR-002](./ADR-002-static-rendering.md) | Renderizado estático (SSG) | 5 | Aprobado |
| [ADR-003](./ADR-003-i18n-routing.md) | Routing i18n (ES sin prefijo, EN bajo `/en/`) y vistas compartidas | 5 | Reemplazado en parte por ADR-007 |
| [ADR-004](./ADR-004-content-collections.md) | Content Collections: datos neutrales + textos por idioma | 5 | Aprobado |
| [ADR-005](./ADR-005-self-hosted-fonts.md) | Fuentes autoalojadas con la Fonts API | 5 | Aprobado |
| [ADR-006](./ADR-006-figuras-y-js-progresivo.md) | Figuras publicadas como portadas y JS de mejora progresiva | 4–7 | Aprobado |
| [ADR-007](./ADR-007-en-idioma-por-defecto.md) | Inglés como idioma por defecto (EN sin prefijo, ES en `/es/`) | 7 | Aprobado |

## Plantilla

```md
# ADR-XXX — Título

## Estado
Propuesto / Aprobado / Reemplazado / Rechazado

## Contexto

## Decisión

## Alternativas consideradas

## Consecuencias positivas

## Consecuencias negativas

## Impacto

## Fecha
```
