# ADR-009 — Política de idioma de Notes (interfaz bilingüe, contenido en un idioma)

## Estado
Aprobado. Parte de NOTES-F0 (`docs/13-notes-editorial-module.md`, §102–§104).

## Contexto
El resto del sitio se traduce completo (ADR-003, ADR-007). En Notes no es viable: el Dr. Cabellos decide en qué idioma escribe cada nota, y exigir traducción bloquearía la publicación. El responsable técnico pidió la solución más sencilla (2026-09-29).

## Decisión
1. La **interfaz** de la sección es bilingüe como todo el sitio: inglés en `/notes/`, español en `/es/notas/`.
2. El **contenido** de cada nota está en un solo idioma (`lang`) y se escribe una sola vez.
3. Las dos interfaces listan todas las notas publicadas. Cuando el idioma de la nota no coincide con el de la interfaz, la tarjeta y el detalle muestran la etiqueta **EN** o **ES** y el cuerpo lleva el atributo `lang`.
4. El detalle se genera en las dos interfaces con el mismo slug (`/notes/<slug>/` y `/es/notas/<slug>/`). El selector de idioma cambia la interfaz y nunca lleva a una página vacía.
5. **SEO:** la URL canónica de una nota es la de la interfaz de su idioma. La otra declara esa canónica, no se incluye en el sitemap y no declara `hreflang`. `og:locale` sigue el idioma de la nota. El listado y las categorías sí llevan `hreflang` EN/ES.
6. Una traducción es otra nota con su propio `lang` y `translationOf`. En ese caso el selector de idioma de la nota lleva a la traducción y ambas se declaran `hreflang` entre sí.

## Alternativas consideradas
- Toda nota en ES + EN (política A): bloquea publicaciones y duplica trabajo.
- Mostrar en cada interfaz solo las notas de su idioma: esconde contenido y rompe el selector de idioma en notas sin traducción.
- Una sola URL por nota sin versión con la otra interfaz: el selector tendría que llevar a otra página (el listado), lo que desorienta.

## Consecuencias positivas
- El Dr. escribe una vez; ninguna nota queda oculta; el selector siempre funciona.
- Sin contenido duplicado para los buscadores gracias a la canónica.

## Consecuencias negativas
- La interfaz y el contenido pueden quedar en idiomas distintos en la misma página (se indica con la etiqueta de idioma).

## Impacto
`Seo.astro` y `BaseLayout.astro` aceptan una canónica, alternos y `og:locale` opcionales; `astro.config.mjs` excluye del sitemap las URL no canónicas de notas y las notas de prueba.

## Fecha
2026-09-29
