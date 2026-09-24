# 01 — Project Charter
## Sitio web académico bilingüe — Cabellos Research Group

| Campo | Valor |
|---|---|
| Documento | Project Charter |
| Fase | 0 — Gobierno, baseline y orquestación |
| Versión | 0.2 |
| Fecha | 2026-09-23 |
| Estado | `APPROVED` — datos base confirmados por el responsable técnico el 2026-09-23 (validación académica final en Fase 10) |
| Documento rector | [`00-orquestador-maestro.md`](./00-orquestador-maestro.md) |

> Este charter congela **qué** es el proyecto y **para qué** existe. No define diseño, rutas finales ni modelo de datos; eso corresponde a fases posteriores. Los datos marcados **PROVISIONAL** fueron definidos por el equipo de desarrollo por instrucción del responsable técnico y deben ratificarse antes del release.

---

## 1. Identidad del proyecto

| Campo | Valor | Estado |
|---|---|---|
| Nombre del proyecto | Sitio web académico bilingüe — Cabellos Research Group | Confirmado |
| Repositorio | `cabellos-research-group-web` (GitHub, privado) | Confirmado |
| Dominio previsto | `cabellosresearchgroup.org` | Previsto |
| Nombre de marca | Cabellos Research Group | Confirmado |
| Nombre descriptivo ES | Grupo de Química Computacional de Clústeres y Materiales | PROVISIONAL |
| Nombre descriptivo EN | Computational Chemistry of Clusters and Materials Group | PROVISIONAL |
| Nombre corto | CRG | PROVISIONAL (uso interno y en metadatos; no se muestra como logotipo) |
| Institución de afiliación | Universidad Politécnica de Tapachula (UPTap), Tapachula, Chiapas, México | Confirmado |
| Logotipo e identidad visual existente | No existe. Se crea identidad propia (monograma tipográfico) en la Fase 4 | Confirmado |
| Tipo de solución | Sitio web académico estático, bilingüe, responsive, orientado a contenido | Confirmado |

---

## 2. Objetivo

### 2.1 Objetivo general

Diseñar, desarrollar, validar y publicar un sitio web académico bilingüe (ES/EN) que represente de forma profesional al grupo de investigación y comunique su identidad científica, áreas de investigación, integrantes y producción académica, con una arquitectura sencilla, rápida, accesible y fácil de actualizar desde el repositorio.

### 2.2 Objetivos específicos

1. Que un visitante nuevo entienda en pocos segundos quién es el grupo y qué investiga.
2. Presentar perfiles académicos estructurados y creíbles de los integrantes.
3. Organizar las publicaciones con acceso directo a la fuente original (DOI/enlace).
4. Relacionar personas, líneas de investigación y publicaciones sin duplicar información.
5. Ofrecer versiones ES y EN de calidad equivalente.
6. Permitir que agregar un integrante o una publicación no requiera editar varias páginas.
7. Publicar bajo dominio propio con despliegue automatizado.

---

## 3. Alcance

### 3.1 Dentro del alcance (v1)

**Apartados principales (6):**

1. Inicio / Home
2. Nosotros / About
3. Investigación / Research (+ detalle por línea)
4. Integrantes / Team (+ perfil por integrante)
5. Publicaciones / Publications
6. Contacto / Contact

Más la página 404. Se permiten páginas internas de detalle cuando el contenido lo requiera.

**Capacidades transversales:**

- versión completa en español y en inglés;
- diseño responsive (320 px a 1920 px);
- sistema visual coherente (tokens y componentes);
- contenido estructurado (Content Collections con schemas);
- SEO técnico base: title, description, canonical, `hreflang`, Open Graph, sitemap, `robots.txt`;
- accesibilidad compatible con WCAG 2.2 AA en lo que aplique;
- optimización de imágenes y rendimiento;
- HTTPS y despliegue automatizado desde GitHub;
- documentación técnica y de actualización de contenido.

### 3.2 Fuera del alcance (v1)

Salvo aprobación formal de cambio (Tipo C, orquestador §30):

login, registro, panel administrativo, base de datos, CMS, backend propio, dashboards, mensajería, comentarios, foros, pagos, autenticación, roles, buscador con servidor, servidor de correo, almacenamiento de formularios, área privada, app móvil, portal de alumnos, gestión de proyectos, scraping permanente de publicaciones, sincronización automática con ORCID/Scholar, traducción científica profesional contratada, analítica avanzada, rediseño institucional externo al sitio, blog y noticias.

### 3.3 Entregables principales

| Entregable | Fase |
|---|---|
| Documentación rectora (`docs/`) | 0–5 |
| Wireframes y especificaciones de vista | 3 |
| Sistema de diseño | 4 |
| Sitio implementado (9 vistas) | 6–7 |
| Contenido real ES/EN cargado | 8 |
| Reporte QA | 9 |
| Sitio en producción bajo dominio propio | 11 |
| README, guía de mantenimiento, guía de despliegue, release notes | 12 |

---

## 4. Stakeholders

| Rol | Persona | Responsabilidad principal | Estado |
|---|---|---|---|
| Responsable técnico / desarrollador | Walter Vilca | Arquitectura, implementación, QA técnico, SEO, despliegue, mantenimiento del orquestador | Confirmado |
| Responsable académico / cliente | Dr. José Luis Cabellos Quiroz (UPTap) | Validar contenido científico, identidad, integrantes, publicaciones, fotografías y textos finales | Confirmado |
| Validador de contenido en inglés | Equipo del proyecto (desarrollo + responsable académico) | Equivalencia semántica y terminología científica EN | Confirmado |
| Integrantes del grupo | — | Proveer biografías, fotografías y enlaces de sus perfiles | POR CONFIRMAR en Fase 1 |

**Regla de autoridad (orquestador §8.4):** el desarrollador decide implementación y arquitectura; el responsable académico valida contenido e información pública; las decisiones mixtas requieren acuerdo.

---

## 5. Restricciones (constraints)

| ID | Restricción |
|---|---|
| C-01 | Stack: Astro + TypeScript + Content Collections. React solo con justificación documentada. |
| C-02 | Renderizado estático (SSG). SSR solo ante un requisito que no pueda resolverse de forma estática. |
| C-03 | Infraestructura: GitHub privado + Cloudflare Pages + Cloudflare DNS. |
| C-04 | Sin backend, base de datos ni CMS en v1. |
| C-05 | Bilingüe ES/EN obligatorio; el EN sigue el flujo de validación de §16.4. |
| C-06 | TheoChemMerida es benchmark de profundidad, no plantilla: no se copian layouts, textos, recursos ni identidad gráfica. |
| C-07 | Ningún placeholder (texto, correo, DOI, nombre, fotografía) puede llegar a producción. |
| C-08 | Plazo de referencia: 4 semanas (§33). Las semanas no sustituyen a los Gates. |
| C-09 | Proyecto de un solo desarrollador. |
| C-10 | Toda fotografía publicada requiere autorización. |

---

## 6. Supuestos (assumptions)

Si un supuesto resulta falso, se evalúa su impacto con el control de cambios (§30).

| ID | Supuesto | Se valida en |
|---|---|---|
| A-01 | El grupo proporcionará la información de identidad, líneas, integrantes y contacto durante la Fase 1. | Fase 1 |
| A-02 | Existe una lista de publicaciones o una fuente verificable (ORCID, DOI, perfiles académicos). | Fase 1 |
| A-03 | Habrá fotografías autorizadas de calidad suficiente, o se aceptará un fallback visual definido. | Fase 1 |
| A-04 | El volumen inicial de contenido es manejable como archivos en el repositorio (sin CMS). | Fase 1 |
| A-05 | El equipo del proyecto valida el inglés; no se contrata traducción externa. | Confirmado |
| A-06 | El dominio `cabellosresearchgroup.org` está disponible o puede registrarse, y el grupo aprueba su uso. | Antes de Fase 11 |
| A-07 | Español es el idioma por defecto (sin prefijo) e inglés va bajo `/en/`. | ADR-003 (Fase 5) |
| A-08 | El responsable académico podrá revisar entregables clave en tiempos compatibles con el plan. | Continuo |

---

## 7. Riesgos iniciales

Riesgos priorizados del orquestador (§31) según su impacto en el arranque.

| ID | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---:|---:|---|
| R-01 | El contenido llega tarde | alta | alta | Placeholders controlados + fecha de congelamiento de contenido |
| R-02 | Scope creep | alta | alta | Control de cambios Tipo A/B/C |
| R-03 | Publicaciones incompletas o inconsistentes | alta | media | Schema flexible + inventario + validación académica |
| R-04 | Inglés sin validar | media | alta | Validador identificado antes del cierre de traducción |
| R-05 | Datos académicos incorrectos | media | alta | Aprobación del responsable académico |
| R-06 | Diseño inconsistente | media | alta | Sistema de diseño antes de maquetar vistas |
| R-07 | Problemas responsive detectados tarde | media | alta | QA por vista, no solo QA final |
| R-08 | Fotografías insuficientes | media | media | Requisitos mínimos + fallback visual |
| R-09 | Nombre descriptivo provisional no ratificado | media | baja | Nombre centralizado en un solo archivo de configuración (`src/config/site.ts`) |
| R-10 | URLs cambian tarde | baja | alta | Congelar IA y routing (Fases 2 y 5) |

---

## 8. Definición de éxito

El proyecto es exitoso cuando:

1. **Se cumplen los Gates 0 a 12** del orquestador con evidencia verificable.
2. **Superar las preguntas de §42:**
   - un visitante nuevo entiende quién es el grupo y qué investiga;
   - puede identificar investigadores y profundizar en sus perfiles;
   - llega con facilidad a publicaciones reales;
   - navega sin tener que aprender la estructura;
   - ES y EN tienen calidad equivalente;
   - la experiencia móvil parece diseñada, no comprimida;
   - agregar una publicación o un integrante no requiere editar varias páginas.
3. **Métricas técnicas de referencia:**
   - LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1;
   - Lighthouse en páginas representativas: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95;
   - cero enlaces internos rotos y cero placeholders en producción.
4. **Percepción:** el sitio queda en la misma categoría de profesionalismo académico que el benchmark, con identidad propia.
5. **Operación:** sitio en producción con HTTPS, despliegue automático y rollback conocido, más documentación que permita mantenerlo sin depender de la memoria del desarrollador.

---

## 9. Hitos

| Hito | Criterio | Semana ref. |
|---|---|---|
| H0 | Gate 0 cerrado (gobierno) | 1 |
| H1 | Gate 1 cerrado (requerimientos y contenido) | 1 |
| H2 | Gate 2 cerrado (arquitectura de información) | 1 |
| H3 | Gates 3–5 cerrados (UX, UI, arquitectura técnica) | 2 |
| H4 | Gates 6–7 cerrados (foundation + vistas) | 3 |
| H5 | Gate 8 cerrado (contenido + i18n) | 3–4 |
| H6 | Gates 9–10 cerrados (QA + UAT) | 4 |
| H7 | Release `v1.0.0` en producción (Gates 11–12) | 4 |

---

## 10. Decisiones abiertas al emitir este charter

| ID | Decisión | Responsable | Fase |
|---|---|---|---|
| D-01 | Ratificar nombre descriptivo ES/EN (provisional definido) | Académico | 10 |
| D-02 | Uso del logotipo de la UPTap en el sitio (por defecto: no se usa) | Académico | 8 |
| D-03 | ~~Responsable académico~~ → Dr. José Luis Cabellos Quiroz | — | Cerrada |
| D-04 | ~~Validador de inglés~~ → equipo del proyecto | — | Cerrada |
| D-05 | ~~Fuente de publicaciones~~ → ORCID 0000-0002-9438-8725 + Crossref (ver `02-requirements.md`) | — | Cerrada |
| D-06 | Política de slugs ES/EN | Desarrollo | 2 / ADR-003 |
| D-07 | ~~Entidad `Project`~~ → no se crea en v1 (ADR-004) | — | Cerrada |
| D-08 | Uso de analítica (por defecto: ninguna) | Mixto | antes de 11 |
| D-09 | Política www / no-www | Desarrollo | 11 |

---

## 11. Aprobación

| Rol | Nombre | Decisión | Fecha |
|---|---|---|---|
| Responsable técnico | Walter Vilca | ☐ Aprobado | |
| Responsable académico | Dr. José Luis Cabellos Quiroz | ☐ Aprobado ☐ Aprobado con observaciones ☐ No aprobado | |

## Historial

| Versión | Fecha | Cambio |
|---|---|---|
| 0.1 | 2026-09-23 | Borrador inicial derivado del orquestador maestro v1.0 |
| 0.2 | 2026-09-23 | Institución, responsable académico, validación EN y nombre provisional confirmados |
