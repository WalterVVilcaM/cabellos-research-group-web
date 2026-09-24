# Registro de Gates 1–7

| Campo | Valor |
|---|---|
| Fecha | 2026-09-23 |
| Autoridad | El responsable técnico (Walter Vilca) delegó en el equipo de desarrollo la definición completa del proyecto ("define todo lo que sea necesario") y pidió avanzar lo más posible antes del siguiente commit |
| Validación académica | Se concentra en la Fase 10 (UAT) con el Dr. José Luis Cabellos Quiroz |

> Excepción documentada a §1 del orquestador: las Fases 1–7 se ejecutaron en una sola sesión. Cada fase se cerró con su entregable antes de empezar la siguiente, y los datos faltantes se clasificaron como **contenido** (Fase 8), no como **estructura**. Por eso ningún Gate estructural quedó abierto.

| Gate | Decisión | Evidencia | Observaciones no bloqueantes |
|---|---|---|---|
| 1 Requerimientos | APROBADO CON OBSERVACIONES NO BLOQUEANTES | `02-requirements.md`, `03-content-inventory.md` | D-10…D-15: correo, foto, integrantes, bio validada, lista completa de publicaciones, colaboraciones |
| 2 IA | APROBADO | `04-information-architecture.md` | — |
| 3 UX | APROBADO | `05-view-specifications.md`, `docs/views/*` | Wireframes en baja fidelidad (texto) |
| 4 UI | APROBADO | `06-design-system.md`, `src/styles/tokens.css` | Modo oscuro fuera de v1 |
| 5 Arquitectura | APROBADO | `07-content-model.md`, `08-technical-architecture.md`, ADR-001…005 | — |
| 6 Foundation | APROBADO | `npm run build` (23 páginas) y `npm run check` (0 errores/0 warnings); menú y teclado probados con Playwright | Pruebas hechas en Chromium headless |
| 7 Vistas | PENDIENTE (en revisión) | 9 vistas × 2 idiomas; sin overflow a 320/375/1280 px; Lighthouse Perf 98–100, A11y 100, BP 100, SEO 100 | Falta la revisión visual del responsable en navegadores reales |

## Evidencia de pruebas (2026-09-23, entorno de desarrollo)

| Página | Perf | A11y | BP | SEO | LCP | CLS |
|---|---:|---:|---:|---:|---:|---:|
| `/` | 98 | 100 | 100 | 100 | 2.0 s | 0.003 |
| `/investigacion/` | 100 | 100 | 100 | 100 | 1.5 s | 0.006 |
| `/en/research/cluster-structure-prediction/` | 99 | 100 | 100 | 100 | 1.8 s | 0.001 |
| `/publicaciones/` | 99 | 100 | 100 | 100 | 1.8 s | 0 |
| `/integrantes/jose-luis-cabellos/` | 99 | 100 | 100 | 100 | 1.9 s | 0.003 |

Lighthouse 12 en emulación móvil sobre `astro preview`. Es un control interno, no una certificación (§25.3).
