# Gate 0 — Acta de cierre de la Fase 0

## Gobierno, baseline y orquestación

| Campo | Valor |
|---|---|
| Fase | 0 — Gobierno, baseline y orquestación |
| Fecha de emisión | 2026-09-23 |
| Responsable | Walter Vilca (responsable técnico) |
| Estado de la fase | `IN_REVIEW` |
| Decisión del Gate | **PENDIENTE**: faltan las verificaciones locales marcadas con ☐ |

> Una fase se cierra solo cuando cumple sus criterios de aceptación y existe evidencia verificable (orquestador §0). Esta acta registra la evidencia de cada criterio del Gate 0.

---

## 1. Criterios del Gate 0

| # | Criterio | Estado | Evidencia |
|---|---|---|---|
| 1 | Orquestador creado | ☑ Cumplido | `docs/00-orquestador-maestro.md` (v1.0) |
| 2 | Alcance base registrado | ☑ Cumplido | Orquestador §9–§11; charter §3 |
| 3 | Metodología registrada | ☑ Cumplido | Orquestador §5–§6 (Waterfall ligero + Stage-Gate + iteración interna) |
| 4 | DoD definida | ☑ Cumplido | Orquestador §7.2 (global) y §7.3 (vista) |
| 5 | Estrategia Git registrada | ☑ Cumplido | Orquestador §28 (ramas, commits, tags) |
| 6 | Build base funciona | ☑ Cumplido en el entorno de desarrollo | `npm run build` (23 páginas) y `npm run check` (0 errores) el 2026-09-23; repetir en local tras `npm install` |
| 7 | Repositorio limpio | ☐ Pendiente de verificar | Resultado de `git status` tras el commit (ver §3) |
| 8 | No hay secretos versionados | ☐ Pendiente de verificar | `.gitignore` excluye `.env` y `.env.production`; falta revisar `git ls-files` (ver §3) |
| 9 | Archivos locales de agentes no trackeados | ◐ Parcial | `.gitignore` ahora excluye `AGENTS.md`, `CLAUDE.md` y `.claude/`; falta confirmar que no estén ya en el índice (ver §3) |

---

## 2. Actividades de la Fase 0 (orquestador §32)

| Actividad | Estado | Dónde |
|---|---|---|
| Crear el orquestador | ☑ | `docs/00-orquestador-maestro.md` |
| Registrar el estado inicial | ☑ | Orquestador §35 (tablero) |
| Definir metodología, Stage Gates y DoR/DoD | ☑ | Orquestador §5–§7 |
| Definir Git y ADR | ☑ | Orquestador §28–§29; `docs/adr/README.md` |
| Definir estructura documental | ☑ | `docs/README.md` y subcarpetas `adr/`, `views/`, `qa/` |
| Registrar alcance inicial y lo que queda fuera | ☑ | Charter §3 |
| Verificar build base | ☐ | Ver §3 |
| Verificar `.gitignore` | ☑ | Revisado y ampliado (ver §4) |
| Verificar exclusión local de archivos de agentes | ◐ | Ver §3 |
| Registrar herramientas de desarrollo | ☑ | Ver §5 |
| Establecer convenciones de nombres | ☑ | `docs/README.md` (sección Convenciones) |

### Entregables

| Entregable | Estado |
|---|---|
| `docs/00-orquestador-maestro.md` | ☑ |
| `docs/01-project-charter.md` | ☑ Borrador v0.1 (la aprobación académica llega en la Fase 1, ver §6) |
| Estructura `docs/` | ☑ |
| ADR iniciales planificados | ☑ ADR-001 a ADR-004 en `docs/adr/README.md` |

---

## 3. Verificaciones locales pendientes

Ejecutar en la raíz del repositorio y registrar el resultado en la tabla.

```bash
# 1. Build base
npm run build

# 2. Si los archivos de agentes ya estaban trackeados, sacarlos del índice (no los borra del disco)
git ls-files AGENTS.md CLAUDE.md .claude
git rm --cached AGENTS.md CLAUDE.md          # solo si el comando anterior los listó

# 3. Secretos: no debe aparecer ningún .env ni archivo con credenciales
git ls-files | grep -iE '\.env|secret|token|credential|\.pem|\.key'

# 4. Eliminar la copia antigua del orquestador en la raíz (ya vive en docs/)
git rm 00_ORQUESTADOR_MAESTRO_CABELLOS_RESEARCH_GROUP_WEB.md   # o borrarla si no estaba trackeada

# 5. Commit y verificación de limpieza
npm install                # instala @astrojs/sitemap, @astrojs/check y typescript
git add -A
git commit -m "feat(site): phases 0-7 docs, foundation and bilingual views"
git status          # debe decir: nothing to commit, working tree clean

# 6. Tag de baseline (orquestador §28.5)
git tag phase-0-baseline
```

| Verificación | Resultado esperado | Resultado obtenido | OK |
|---|---|---|---|
| `npm run build` | Termina sin errores y genera `dist/` | | ☐ |
| `git ls-files AGENTS.md CLAUDE.md .claude` | Sin salida | | ☐ |
| Búsqueda de secretos en `git ls-files` | Sin salida | | ☐ |
| `git status` | working tree clean | | ☐ |
| Tag `phase-0-baseline` | Creado | | ☐ |

---

## 4. Cambios realizados en esta fase

| Archivo | Cambio |
|---|---|
| `docs/README.md` | Nuevo: índice documental y convenciones |
| `docs/adr/README.md` | Nuevo: guía y plantilla de ADR, ADR planificados |
| `docs/views/README.md` | Nuevo: inventario de vistas por ID |
| `docs/qa/README.md` | Nuevo: checklists planificados |
| `docs/00-orquestador-maestro.md` | Movido desde la raíz; tablero §35 actualizado |
| `docs/01-project-charter.md` | Nuevo: charter v0.1 |
| `docs/gate-0-acta-cierre.md` | Nuevo: esta acta |
| `.gitignore` | Añadidos `AGENTS.md`, `CLAUDE.md` y `.claude/` |

---

## 5. Herramientas de desarrollo registradas

| Herramienta | Versión / fuente | Uso |
|---|---|---|
| Node.js | `>=22.12.0` (`package.json` → `engines`) | Runtime |
| npm | Incluido con Node | Gestor de paquetes (`package-lock.json`) |
| Astro | `^7.3.4` | Framework (plantilla *minimal*) |
| TypeScript | Configuración base de Astro (`tsconfig.json`) | Tipado |
| Git + GitHub (privado) | — | Control de versiones |
| VS Code | `.vscode/` en el repositorio | Editor |
| Cloudflare Pages + DNS | Previsto para la Fase 11 | Hosting y dominio |

Sin dependencias adicionales. Cualquier dependencia importante nueva requiere un ADR (§29).

---

## 6. Observaciones no bloqueantes

1. **Charter en borrador.** El charter tiene datos **POR CONFIRMAR** (nombre oficial, institución, responsable académico, validador de inglés). No bloquean el Gate 0 porque su resolución es parte del alcance de la Fase 1. La aprobación académica del charter pasa a ser la primera actividad de la Fase 1.
2. **README raíz.** Sigue siendo el de la plantilla de Astro. Se reemplaza en la Fase 12 (o antes, si se decide hacerlo como tarea menor).
3. **`CLAUDE.md` es un symlink.** En Windows, Git puede tratarlo como archivo de texto. Con la regla de `.gitignore` y `git rm --cached` queda excluido en ambos casos.

---

## 7. Decisión del Gate

| Opción | Condición |
|---|---|
| ☐ `APROBADO` | Las 5 verificaciones de §3 en OK |
| ☐ `APROBADO CON OBSERVACIONES NO BLOQUEANTES` | Las 5 verificaciones de §3 en OK, con las observaciones de §6 registradas |
| ☐ `NO APROBADO` | Falla el build o hay secretos/archivos de agentes versionados |

**Decisión recomendada:** `APROBADO CON OBSERVACIONES NO BLOQUEANTES`, una vez completada la §3.

| Rol | Nombre | Firma / fecha |
|---|---|---|
| Responsable técnico | Walter Vilca | |

Al aprobarse:

- actualizar el tablero §35 del orquestador: Fase 0 → `CLOSED` y Fase 1 → `READY`;
- hacer commit con `docs(phase-0): close governance phase`.

**Siguiente tarea válida:** Fase 1, Discovery + Requirements + Content Inventory (`02-requirements.md`, `03-content-inventory.md`).
