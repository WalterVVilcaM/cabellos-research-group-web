# ADR-014 — Editor del panel: Markdown con barra de formato y vista previa

## Estado
Aprobado (decisión del responsable técnico, 2026-09-30). Implementación: NOTES-F5.

## Contexto
El Dr. Cabellos escribirá notas breves o medianas con subtítulos, listas, citas y enlaces. La base guarda el cuerpo en Markdown (ADR-011) y el sitio lo convierte con `micromark`. El panel lo usan dos personas y debe ser simple y seguro (§41).

## Decisión
1. **Caja de texto Markdown** con barra de formato (negrita, cursiva, subtítulos T2/T3, lista, lista numerada, cita, enlace) y pestaña **Vista previa**, que usa el mismo conversor que el sitio (`/admin/api/markdown/`).
2. **Formulario de servidor con mejora progresiva**: sin JavaScript se escribe Markdown y se guarda igual. El script del editor es propio, pequeño y solo se carga en `/admin`.
3. El panel está **solo en español**. El editor incluye: título, URL (automática, bloqueada al publicar), resumen con contador, idioma, categoría, autor, fechas, etiquetas, destacada (única), líneas de investigación, traducción, enlaces (filas dinámicas) y PDF con derecho de distribución.
4. Estados: *Guardar borrador*, *Guardar y publicar*, *Despublicar*, *Archivar*, *Restaurar*; *Eliminar definitivamente* solo desde "archivada" y escribiendo **ELIMINAR** (§69).

## Alternativas consideradas
- Editor visual (TipTap, Quill, etc.): más cómodo sin conocer Markdown, pero añade una dependencia grande y otro formato que convertir y sanear.

## Consecuencias positivas
- Sin dependencias nuevas en el cliente; el formato guardado es el mismo que se publica.
- La vista previa muestra exactamente lo que verá el visitante.

## Consecuencias negativas
- El Dr. ve símbolos de Markdown mientras escribe (la barra y la vista previa lo compensan).

## Fecha
2026-09-30
