# ADR-014 — Editor del panel: Markdown con barra de formato y vista previa en vivo

## Estado
Aprobado (decisión del responsable técnico, 2026-09-30). Implementación: NOTES-F5. Revisado el mismo día tras la primera prueba en producción (ver «Revisión 1»).

## Contexto
El Dr. Cabellos escribirá notas breves o medianas con subtítulos, listas, citas y enlaces. La base guarda el cuerpo en Markdown (ADR-011) y el sitio lo convierte con `micromark`. El panel lo usan dos personas y debe ser simple y seguro (§41).

## Decisión
1. **Caja de texto Markdown** con barra de formato (negrita, cursiva, subtítulos T2/T3, lista, lista numerada, cita, enlace) y pestaña **Vista previa**, que usa el mismo conversor que el sitio (`/admin/api/markdown/`).
2. **Formulario de servidor con mejora progresiva**: sin JavaScript se escribe Markdown y se guarda igual. El script del editor es propio, pequeño y solo se carga en `/admin`.
3. El panel está **solo en español**. El editor incluye: título, URL (automática, bloqueada al publicar), resumen con contador, idioma, categoría, autor, fechas, etiquetas, destacada (única), líneas de investigación, traducción, enlaces (filas dinámicas) y PDF con derecho de distribución.
4. Estados: *Guardar borrador*, *Guardar y publicar*, *Despublicar*, *Archivar*, *Restaurar*; *Eliminar definitivamente* solo desde "archivada" y escribiendo **ELIMINAR** (§69).

## Revisión 1 (2026-09-30) — editor más sencillo
Tras probar el panel, el responsable técnico pidió un editor más fácil de usar, con indicaciones y vista previa en vivo:
1. **Vista previa en vivo de la nota completa**: formulario a la izquierda y, a la derecha, la nota como se verá en el sitio (categoría, título, resumen, autor, fechas, texto, enlaces, PDF, etiquetas y líneas), actualizada al escribir. En pantallas angostas se alterna *Editar / Vista previa*. El Markdown se convierte **en el navegador** con el mismo módulo del sitio (`src/utils/markdown.ts`); se retira `/admin/api/markdown/`.
2. **Pasos numerados con indicaciones**: 1 Tipo de nota (idioma en botones y categoría en tarjetas con descripción), 2 Título y resumen, 3 Texto, 4 Enlaces recomendados, 5 Archivo PDF; *Más opciones* (fechas, etiquetas, líneas, destacar) plegado. Los datos del PDF (nombre y «¿Se puede compartir?») aparecen al elegir el archivo.
3. **Dirección automática**: se muestra completa (`<dominio>/es/notas/<slug>/`) con un botón *Cambiar*. El servidor acepta lo que se escriba (normaliza acentos y espacios y, si se pega la dirección completa, usa la última parte); si una dirección automática ya existe, agrega `-2`, `-3`… Bloqueada al publicar.
4. **Sin campo de traducción**: «Es traducción de» se quitó del panel; el vínculo que ya tenga una nota se conserva (y se quita solo si deja de ser válido). El modelo de datos no cambia.
5. Enlaces dentro del texto con un diálogo propio (no `prompt`), atajos Ctrl/Cmd + B, I, K; controles del formulario con estilo común (los `select` nativos se veían distintos en cada navegador); barra fija de guardar (*Guardar borrador* / *Publicar*).
6. **Cómodo en celular y tableta**: menú plegable, listado de notas como tarjetas con botones grandes (≤ 899 px), contadores compactos y áreas táctiles de al menos 44 px.

## Alternativas consideradas
- Editor visual (TipTap, Quill, etc.): más cómodo sin conocer Markdown, pero añade una dependencia grande y otro formato que convertir y sanear.

## Consecuencias positivas
- Sin dependencias nuevas; el formato guardado es el mismo que se publica. El conversor (micromark) se incluye solo en el script del panel.
- La vista previa muestra exactamente lo que verá el visitante, mientras se escribe.

## Consecuencias negativas
- El Dr. ve símbolos de Markdown mientras escribe (la barra y la vista previa lo compensan).

## Fecha
2026-09-30
