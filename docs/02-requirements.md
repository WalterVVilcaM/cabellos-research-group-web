# 02 — Requerimientos

| Campo | Valor |
|---|---|
| Fase | 1 — Descubrimiento, requerimientos y contenido |
| Versión | 1.0 |
| Fecha | 2026-09-23 |
| Estado | `APPROVED` |
| Depende de | `01-project-charter.md` v0.2 |

---

## 1. Resultado del descubrimiento

### 1.1 Identidad

| Dato | Valor | Fuente |
|---|---|---|
| Marca | Cabellos Research Group | Responsable técnico |
| Nombre descriptivo ES | Grupo de Química Computacional de Clústeres y Materiales | PROVISIONAL (definido por desarrollo) |
| Nombre descriptivo EN | Computational Chemistry of Clusters and Materials Group | PROVISIONAL |
| Institución | Universidad Politécnica de Tapachula (UPTap) | Responsable técnico |
| Adscripción | Coordinación de Investigación y Desarrollo Tecnológico, UPTap, Tapachula 30830, Chiapas, México | Afiliación publicada en *R. Soc. Open Sci.* 2023, doi:10.1098/rsos.230908 |
| Investigador principal | Dr. José Luis Cabellos Quiroz | Responsable técnico |
| ORCID del PI | 0000-0002-9438-8725 | orcid.org |
| Google Scholar del PI | `EwYPXrAAAAAJ` | scholar.google.com |
| Logotipo | No existe; se crea un monograma tipográfico propio | Decisión de desarrollo |

### 1.2 Perfil científico (derivado de la producción publicada)

La producción indexada del PI (Crossref/ORCID, 2009–2026) se agrupa en cuatro líneas:

| Clave | Línea (ES) | Línea (EN) | Evidencia |
|---|---|---|---|
| `structure-prediction` | Predicción estructural de clústeres | Cluster structure prediction | Estrategia de optimización global GLOMOS; algoritmos genéticos acoplados a DFT (Au10, Be6B11⁻, Be4B8, Cu13, Agₙ) |
| `finite-temperature` | Efectos de temperatura y termodinámica estadística | Finite-temperature effects and statistical thermodynamics | Superficies de energía libre, poblaciones de Boltzmann, espectros IR/VCD dependientes de temperatura |
| `chemical-bonding` | Enlace químico y aromaticidad | Chemical bonding and aromaticity | Carbonos planos pentacoordinados, estrellas moleculares E₃M₃⁺, motivos tubulares de boro, arenos de 10 electrones π |
| `optical-properties` | Propiedades ópticas y electrónicas de materiales | Optical and electronic properties of materials | Generación de segundo armónico (PRB 2009, PR Materials 2024), KCl:Cu, propiedades termoeléctricas |

> Los textos de cada línea son borradores técnicos redactados a partir de las publicaciones; el responsable académico los valida en la Fase 10.

### 1.3 Benchmark (TheoChemMerida)

Solo se analiza **profundidad**, no diseño (orquestador §44). Patrones relevantes observados:

- publicaciones numeradas en orden cronológico descendente (autores, título, revista, año, volumen/páginas);
- página de personas agrupada por rol;
- la investigación y la producción son protagonistas;
- secciones de eventos/redes (fuera de alcance v1 para este proyecto).

Mejoras propias frente al benchmark: DOI enlazado en cada publicación, relación explícita línea ↔ integrante ↔ publicación, perfiles individuales navegables y versión EN equivalente.

---

## 2. Requerimientos funcionales

| ID | Requerimiento | Vista | Prioridad |
|---|---|---|---|
| RF-01 | Mostrar identidad del grupo (marca, nombre descriptivo, institución) en el primer viewport del Home | VIEW-001 | Must |
| RF-02 | Listar las líneas de investigación con resumen y enlace a su detalle | VIEW-001, VIEW-003 | Must |
| RF-03 | Página de detalle por línea con descripción, integrantes y publicaciones relacionadas | VIEW-003-D | Must |
| RF-04 | Listar integrantes agrupados por rol; no mostrar grupos vacíos | VIEW-004 | Must |
| RF-05 | Perfil individual con biografía, líneas, publicaciones seleccionadas y enlaces académicos disponibles | VIEW-004-D | Must |
| RF-06 | Listar publicaciones agrupadas por año, orden descendente, con numeración global | VIEW-005 | Must |
| RF-07 | Cada publicación con DOI enlaza a `https://doi.org/<doi>` | VIEW-005 y listas | Must |
| RF-08 | Filtrar publicaciones por línea de investigación mediante enlaces estáticos (sin JS obligatorio) | VIEW-005 | Should |
| RF-09 | Mostrar publicaciones recientes en Home (5) | VIEW-001 | Must |
| RF-10 | Página de contacto con institución, dirección, correo autorizado y perfiles académicos | VIEW-006 | Must |
| RF-11 | Selector de idioma que conserva la página equivalente | Global | Must |
| RF-12 | Navegación principal con 6 apartados + menú móvil accesible | Global | Must |
| RF-13 | Página 404 bilingüe con salida a Home | VIEW-404 | Must |
| RF-14 | Breadcrumbs en vistas de detalle | VIEW-003-D, VIEW-004-D | Must |
| RF-15 | Métricas de producción derivadas de datos (nº de publicaciones, rango de años) sin escribirlas a mano | VIEW-001, VIEW-002 | Should |
| RF-16 | Perfil sin fotografía muestra un avatar tipográfico (iniciales), nunca foto genérica | VIEW-004, VIEW-004-D | Must |

## 3. Requerimientos no funcionales

| ID | Requerimiento | Métrica |
|---|---|---|
| RNF-01 | Sitio estático (SSG) | `astro build` genera HTML para todas las rutas |
| RNF-02 | Cero JS obligatorio para leer contenido | Contenido completo con JS deshabilitado |
| RNF-03 | JS total en cliente | ≤ 10 KB sin comprimir por página, ≤ 3 KB gzip (ADR-006) |
| RNF-04 | Rendimiento | LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms; Lighthouse Performance ≥ 90 |
| RNF-05 | Accesibilidad | WCAG 2.2 AA aplicable; Lighthouse Accessibility ≥ 95 |
| RNF-06 | SEO | title, description, canonical, hreflang, OG, sitemap, robots en todas las rutas indexables |
| RNF-07 | Responsive | Sin overflow horizontal entre 320 y 1920 px |
| RNF-08 | Mantenibilidad | Agregar una publicación = editar 1 archivo; agregar integrante = 1 entrada + 2 textos |
| RNF-09 | Validación de datos | El build falla si una entidad referencia una clave inexistente |
| RNF-10 | Privacidad | Sin cookies, sin analítica ni rastreadores en v1 |
| RNF-11 | Fuentes | Autoalojadas (sin llamadas a terceros en tiempo de ejecución) |
| RNF-12 | Navegadores | Últimas 2 versiones de Chrome, Edge, Firefox y Safari |

## 4. Fuente de publicaciones (D-05)

1. **Fuente primaria:** ORCID `0000-0002-9438-8725` y Crossref (metadatos por DOI).
2. **Complemento:** lista que proporcione el PI para trabajos no indexados con ORCID.
3. Carga manual en `src/content/data/publications.yaml`; sin sincronización automática (fuera de alcance).
4. Se excluyen erratas, preprints duplicados y reimpresiones (p. ej. la edición alemana de *Angew. Chem.*).

## 5. Política ES/EN

- Español: idioma por defecto, sin prefijo. Inglés: prefijo `/en/`.
- Todos los textos existen en ambos idiomas antes del release.
- Nombres propios, títulos de publicaciones y revistas no se traducen.
- Traducción y validación: equipo del proyecto.

## 6. Decisiones abiertas tras la Fase 1

| ID | Decisión | Bloquea |
|---|---|---|
| D-10 | Integrantes adicionales (estudiantes, colaboradores, egresados) | Contenido de VIEW-004 (no la estructura) |
| D-11 | ~~Correo público~~ → jose.luis@uptapachula.edu.mx · tel. 962 465 9908 (cerrada) | — |
| D-12 | Fotografía del PI y fotografías del grupo | Imágenes (hay fallback) |
| D-13 | Biografía y trayectoria validadas del PI | Contenido de VIEW-004-D |
| D-14 | Lista completa de publicaciones validada | Contenido de VIEW-005 |
| D-15 | Colaboraciones institucionales que se pueden mencionar | Bloque opcional del Home |

Ninguna bloquea la estructura, el diseño ni la implementación: todas afectan a contenido de la Fase 8.
