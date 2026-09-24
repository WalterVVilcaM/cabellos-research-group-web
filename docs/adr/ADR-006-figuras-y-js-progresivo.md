# ADR-006 — Figuras publicadas como portadas y JS de mejora progresiva

## Estado
Aprobado (2026-09-23)

## Contexto
El responsable técnico pidió que el sitio "dé la impresión de terminado": portadas para las líneas de investigación basadas en trabajos reales del Dr. Cabellos (no imágenes generadas), además de animaciones y carruseles. Hasta ahora las líneas usaban ilustraciones SVG abstractas y el sitio solo tenía JS para el menú móvil (RNF-03 ≤ 5 KB).

## Decisión
1. **Portadas provisionales = figuras publicadas por el PI en acceso abierto (CC BY 4.0, MDPI).** Se guardan en `src/assets/research/*.webp` (680 px de ancho) y se sirven con `astro:assets` (srcset 340/680 px). Cada línea declara `cover` en `research.yaml`: imagen, `alt` y pie ES/EN, número de figura, publicación fuente (`reference('publications')`) y licencia. El crédito ("Fig. 1 de Rojas-González et al., *Molecules* (2024). CC BY 4.0") se genera desde los datos de la publicación: no se escribe a mano.

   | Línea | Figura | Fuente (DOI) |
   |---|---|---|
   | Predicción estructural | Fig. 1, isómeros de Au₁₀ | 10.3390/molecules29143374 |
   | Efectos de temperatura | Fig. 4, poblaciones de Be₆B₁₁⁻ | 10.3390/ma14010112 |
   | Enlace y aromaticidad | Fig. 2, AdNDP de Au₁₀ | 10.3390/molecules29143374 |
   | Propiedades ópticas | Fig. 1, celdas de KCl:Cu | 10.3390/ma13194300 |

2. **JS de mejora progresiva, sin framework:** carrusel (`Carousel.astro`), aparición al desplazarse y contadores (`src/scripts/enhance.ts`), botón "volver arriba", buscador/filtro de publicaciones y "copiar cita". Todo el contenido es legible sin JS (el carrusel degrada a scroll horizontal con snap; buscador y botón de copiar se ocultan).
3. **RNF-03 se actualiza:** JS en cliente ≤ 10 KB sin comprimir por página (≤ 3 KB gzip). Medición actual: Home 4.9 KB (1.9 KB gzip), Publicaciones 6.1 KB (2.3 KB gzip).

## Alternativas consideradas
- Ilustraciones SVG abstractas (anterior): cero bytes, pero se perciben como plantilla.
- Imágenes generadas o de bancos: no representan el trabajo del grupo.
- Librería de carrusel (Swiper, Embla): 10–40 KB, innecesaria para 4–6 diapositivas.

## Consecuencias positivas
- El sitio muestra ciencia real del grupo desde el primer viewport.
- Sustituir una portada = cambiar un archivo y un bloque YAML.
- Lighthouse se mantiene en 99–100 (rendimiento) y 100 (accesibilidad).

## Consecuencias negativas
- Obligación de conservar el crédito CC BY en cada uso de la figura.
- Figuras con texto pequeño (etiquetas de ejes) pierden legibilidad en tarjetas pequeñas: el pie y el enlace al DOI compensan.

## Impacto
`content.config.ts` (campo `cover`), `research.yaml`, `ResearchCard`, `ResearchFeature`, `ResearchDetailView`, `HomeView`, `PublicationsView`, `BaseLayout`. `prefers-reduced-motion` desactiva autoplay, apariciones y contadores.

## Fecha
2026-09-23
