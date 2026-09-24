# Documentación del proyecto — Cabellos Research Group Web

Carpeta documental oficial del proyecto. Su estructura sigue la sección **§19** del orquestador maestro y se crea como **Paso 1** de la sección **§46 (Próximo paso oficial)**.

> Regla: los documentos de esta carpeta pueden ampliar una fase, pero no contradecir el orquestador sin actualizar primero la decisión correspondiente (ADR o registro de cambio).

## Estructura

| Carpeta | Propósito |
|---|---|
| `docs/` | Documentos rectores numerados por fase (00–11). |
| `docs/adr/` | Architecture Decision Records (§29). |
| `docs/views/` | Especificaciones de vista por ID estable (§13, §38). |
| `docs/qa/` | Checklists de calidad (§22–§25, §41). |

## Documentos planificados

| Archivo | Contenido | Fase | Estado |
|---|---|---|---|
| `00-orquestador-maestro.md` | Documento rector técnico y operativo | 0 | Vigente (v1.0) |
| `01-project-charter.md` | Identidad, objetivo, alcance, stakeholders, restricciones, supuestos, riesgos, éxito | 0 | Aprobado v0.2 |
| `gate-0-acta-cierre.md` | Evidencia y decisión del Gate 0 | 0 | En revisión (faltan verificaciones git locales) |
| `02-requirements.md` | Requerimientos funcionales y no funcionales | 1 | Aprobado v1.0 |
| `03-content-inventory.md` | Inventario de contenido y matriz de faltantes | 1 | Aprobado v1.0 |
| `04-information-architecture.md` | Sitemap, rutas, navegación, relaciones | 2 | Aprobado v1.0 |
| `05-view-specifications.md` | Índice de especificaciones de vista | 3 | Aprobado v1.0 |
| `06-design-system.md` | Tokens, foundations, componentes | 4 | Aprobado v1.0 |
| `07-content-model.md` | Schemas de entidades | 5 | Aprobado v1.0 |
| `08-technical-architecture.md` | Routing, i18n, componentes, SEO, imágenes | 5 | Aprobado v1.0 |
| `gates-registro.md` | Registro de decisiones de Gate 1–7 | 1–7 | Vigente |
| `09-qa-plan.md` | Plan de pruebas integral | 9 | Pendiente |
| `10-deployment.md` | Cloudflare Pages, dominio, DNS, rollback | 11 | Pendiente |
| `11-maintenance.md` | Guía de actualización y mantenimiento | 12 | Pendiente |

## Convenciones

- Nombres de archivo en minúsculas con guiones (`kebab-case`), prefijo numérico de dos dígitos para documentos rectores.
- ADR: `ADR-XXX-titulo-corto.md` (numeración correlativa de tres dígitos, nunca reutilizada).
- Vistas: `VIEW-XXX-nombre.md` usando los IDs de §13.
- Idioma de la documentación: español.
