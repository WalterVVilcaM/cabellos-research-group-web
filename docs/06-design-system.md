# 06 — Sistema de diseño

| Campo | Valor |
|---|---|
| Fase | 4 — Sistema visual y UI |
| Versión | 1.2 |
| Fecha | 2026-09-23 |
| Estado | `APPROVED` |
| Implementación | `src/styles/tokens.css`, `src/styles/global.css`, `src/components/` |

---

## 1. Dirección visual

**v1.1 (2026-09-23), tras la revisión del responsable técnico:** la v1.0 (fondo crema, serif y acento cobre) se percibía genérica y demasiado cargada. La nueva dirección es **institucional, directa y limpia**:

- fondo **blanco**, con **verdes** en bandas puntuales: encabezados de página, publicaciones del Home y el footer;
- una sola familia tipográfica sans (IBM Plex Sans);
- sin patrones de fondo, gradientes ni sombras decorativas;
- Home directo: identidad en pocas líneas y enseguida las líneas de investigación.

Las ilustraciones moleculares generadas por código se conservan en verde como imagen de cada línea. TheoChemMerida se toma como referencia de sobriedad (blanco + verde), no de diseño: no se copia ningún layout ni recurso.

**v1.2 (2026-09-23):** se incorporan los patrones del benchmark (`09-benchmark-ux-theochem.md`): figuras científicas reales como portadas, carruseles accesibles, banda verde profunda de cifras, barra de acento en títulos, encabezados internos con barra superior verde y breadcrumb, y movimiento sutil (aparición, contadores, elevación de tarjetas).

## 2. Color

| Token | Valor | Uso | Contraste sobre blanco |
|---|---|---|---|
| `--color-bg` / `--color-surface` | `#FFFFFF` | Fondo y tarjetas | — |
| `--color-surface-alt` | `#F2F7F4` | Bandas verdes claras | — |
| `--color-text` | `#1B2622` | Texto principal | 15.59:1 ✅ |
| `--color-text-muted` | `#56635D` | Secundario | 6.29:1 ✅ (5.81 sobre alt) |
| `--color-primary` | `#1D6A4E` | Enlaces, botones, foco | 6.51:1 ✅ |
| `--color-primary-hover` | `#144D38` | Hover | 9.77:1 ✅ |
| `--color-accent` | `#2A7556` | Etiquetas y números | 5.56:1 ✅ |
| `--color-accent-deco` | `#8CC3A6` | Solo decorativo (átomos) | no apto para texto |
| `--color-border` | `#DBE4DF` | Bordes | — |
| `--color-focus` | `#1D6A4E` | Anillo de foco | 6.51:1 ✅ |
| `--color-ink` | `#123A2D` | Footer (verde profundo) | — |
| `--color-on-ink` | `#EEF5F1` | Texto sobre footer | 11.37:1 ✅ |
| `--color-on-ink-muted` | `#A8C7B8` | Secundario sobre footer | 6.91:1 ✅ |
| `--color-accent-on-ink` | `#9FDCBC` | Títulos del footer | 8.05:1 ✅ |

**Modo oscuro:** fuera del alcance de v1.

## 3. Tipografía

| Rol | Familia | Pesos |
|---|---|---|
| Títulos, cuerpo, etiquetas y datos | IBM Plex Sans (autoalojada) | 400, 400 itálica, 500, 600 |

Las etiquetas (eyebrows) van en sans 600, mayúsculas, con tracking de 0.06em y en verde. Los números de publicación y los DOI también usan la sans.

### Escala (fluida, `clamp`)

| Token | Mín → máx | Uso |
|---|---|---|
| `--text-xs` | 0.75 → 0.8rem | Etiquetas |
| `--text-sm` | 0.875 → 0.9rem | Metadatos |
| `--text-base` | 1 → 1.0625rem | Cuerpo |
| `--text-lg` | 1.125 → 1.25rem | Entradillas, títulos de tarjeta |
| `--text-xl` | 1.25 → 1.5rem | h3 |
| `--text-2xl` | 1.5 → 2rem | h2 |
| `--text-3xl` | 2 → 2.75rem | h1 de página |
| `--text-4xl` | 2.25 → 3.25rem | h1 del Home |

- `line-height`: 1.6 en el cuerpo y 1.2 en los títulos (tracking −0.015em).
- Ancho de lectura: `--measure: 68ch`.

## 4. Espaciado, layout y forma

| Grupo | Tokens |
|---|---|
| Espaciado (base 4 px) | `--space-1` 0.25rem · `-2` 0.5 · `-3` 0.75 · `-4` 1 · `-6` 1.5 · `-8` 2 · `-12` 3 · `-16` 4 · `-24` 6 |
| Sección vertical | `--section-y: clamp(3rem, 8vw, 6rem)` |
| Contenedor | `--container: 72rem` (1152 px) · `--container-narrow: 48rem` · padding lateral `clamp(1rem, 4vw, 2rem)` |
| Grid | 12 columnas lógicas en desktop, implementadas con CSS Grid y `minmax` |
| Breakpoints | `600px` (sm), `900px` (md, navegación desktop), `1100px` (lg) |
| Radios | `--radius-sm` 4px · `--radius-md` 8px · `--radius-pill` 999px |
| Bordes | `--border: 1px solid var(--color-border)` |
| Sombras | `--shadow-focus` (anillo). Desde v1.2, sombra suave solo como respuesta a interacción (hover de tarjetas), en el marco del carrusel del Home y en el botón flotante; nunca en reposo sobre texto |
| Z-index | `--z-header: 50` · `--z-menu: 60` · `--z-skip: 100` |
| Movimiento | `--duration-fast: 120ms` · `--duration: 200ms` · `--ease: cubic-bezier(.2,.6,.2,1)`. v1.2: aparición al desplazarse 600 ms (escalonada 80 ms), contadores 1.2 s, autoplay del carrusel del Home 6.5 s, zoom de figura 1.04 en hover. Todo se anula con `prefers-reduced-motion: reduce` |

## 5. Iconografía e imágenes

- Iconos SVG en línea, trazo 1.5 px de `currentColor`, 20 px. Sin librería de iconos (se definen los necesarios: flecha, externo, correo, ubicación, menú, cerrar).
- **Ilustraciones moleculares** (`MolecularArt`): SVG generado de forma determinista a partir de una semilla (clave de la línea). Átomos como círculos (verde claro, verde profundo y huecos con borde) y enlaces como líneas finas. Son decorativas (`aria-hidden`).
- **Figuras científicas (v1.2)**: portadas de las líneas tomadas de artículos del PI (CC BY 4.0), siempre sobre fondo blanco, `object-fit: contain` (nunca se recortan) y con pie de crédito (`ResearchFigure`). En tarjetas pequeñas son decorativas (`alt=""`) porque el título ya describe el enlace; en figuras con pie llevan `alt` descriptivo.
- **Fotografías de personas**: formato 4:5, recorte centrado en el rostro, `astro:assets` con AVIF/WebP, `width` y `height` explícitos. Sin foto: `Avatar` con iniciales en serif sobre `--color-surface-alt`.

## 6. Componentes y estados

| Componente | Variantes | Estados |
|---|---|---|
| `Button` | `primary` (relleno), `secondary` (borde), `ghost` (texto + flecha) | default · hover (fondo más oscuro / subrayado) · focus-visible (anillo 3 px `--color-focus`, offset 2 px) · active (desplazamiento de 1 px) |
| Enlace de texto | en prosa: subrayado de 1 px con offset 3 px | hover: subrayado de 2 px · focus-visible: anillo |
| `ResearchCard` | default | hover: borde primary + la flecha avanza 4 px · focus-within: anillo sobre la tarjeta |
| `MemberCard` | `featured`, `default`, `compact` | igual que ResearchCard |
| `PublicationItem` | `numbered`, `plain` | enlace DOI con estados de enlace |
| `Tag` | `static`, `link` | link: hover con fondo `--color-surface-alt` |
| `LanguageSwitcher` | — | idioma actual con peso 600 y `aria-current`; el otro es un enlace |
| `MobileMenu` | — | cerrado / abierto (`aria-expanded`); Escape cierra y devuelve el foco al botón |
| `Breadcrumb` | — | el último ítem no es enlace (`aria-current="page"`) |
| `Carousel` | `perView` 1–3 | controles solo con JS; punto activo `aria-current`; pausa `aria-pressed`; diapositivas ocultas con `inert` |
| `ResearchFigure` | con pie / solo crédito | enlace DOI y licencia |
| Insignia numérica (01–04) | — | verde primario, texto blanco (6.51:1) |
| Chip de filtro | — | `aria-pressed="true"`: relleno primario y texto blanco |

Disabled: no hay controles deshabilitables en v1.

## 7. Reglas de uso

1. Ningún color, tamaño o espacio fuera de los tokens. Si hace falta uno nuevo, se agrega aquí primero.
2. Los estilos de componente van dentro de su `.astro` (scoped); lo global solo en `global.css`.
3. Nada de estilos inline, salvo variables CSS dinámicas (`style="--i: 2"`).
4. El acento cobre en texto solo con `--color-accent` (pasa AA); `--color-accent-deco` nunca en texto.

## 8. Gate 4

- [x] foundations aprobados
- [x] componentes principales definidos
- [x] estados definidos
- [x] contraste revisado (tabla §2, calculado con la fórmula WCAG)
- [x] sistema válido en móvil (escala fluida y breakpoints)
- [x] no se necesitan estilos ad hoc por pantalla

## Historial

| Versión | Fecha | Cambio |
|---|---|---|
| 1.0 | 2026-09-23 | Dirección "cuaderno de laboratorio": crema, serif y cobre |
| 1.1 | 2026-09-23 | Blanco + verde, solo sans, Home directo, contacto en el footer (Tipo A/B, a petición del responsable técnico) |
| 1.2 | 2026-09-23 | Patrones del benchmark: figuras reales, carruseles, cifras animadas, acentos, breadcrumb global (ADR-006) |

## Colores por línea de investigación (v1.7, 2026-09-24)

Paleta sobria: tonos sólidos apagados (saturación 23–37 %) de la misma profundidad que el verde institucional. Se definen en `src/styles/tokens.css` (`--line-N` y `--line-N-ink`) y se activan con `data-line="N"` (`src/styles/global.css`).

| Línea | Tono | Sólido | Texto sobre blanco |
|---|---|---|---|
| 01 Predicción estructural | Latón (clústeres de Au) | `#8C7440` | `#6B5528` |
| 02 Efectos de temperatura | Arcilla | `#9A5F4E` | `#7A4436` |
| 03 Enlace y aromaticidad | Verde salvia | `#3F7A70` | `#2E5E56` |
| 04 Propiedades ópticas | Pizarra índigo | `#555C87` | `#454B73` |

Uso restringido: número de la línea (círculo sólido con número blanco, ≥ 4.5:1), etiqueta "Línea 0X" y palabras clave (fondo al 10 % + texto tinta, ≥ 7:1). Fondos, botones, cifras, menú y pie siguen en blanco y verde institucional. Se descartaron versiones pastel y de saturación alta porque restaban seriedad.
