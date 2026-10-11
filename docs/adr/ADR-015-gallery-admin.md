# ADR-015 — Galería administrable desde el panel (D1 + R2)

## Estado
Aprobado (decisión del responsable técnico, 2026-10-10).

## Contexto
La Galería (VIEW-008) estaba fija en el código (`src/config/gallery.ts`): cada foto nueva requería un commit. El Dr. Cabellos quiere subir fotos él mismo desde `/admin`. El panel ya usa Cloudflare D1 (ADR-011), R2 (ADR-012) y Access (ADR-013) para Notas.

## Decisión
1. **Fotos en D1 y R2.** Tabla `gallery_photos` (migración `0003_gallery.sql`) y archivos en el mismo bucket de Notes bajo el prefijo `gallery/`. Las fotos cuentan en el tope común de 9.5 GB (D-N9).
2. **Las 4 fotos que había (Figshare, CC BY 4.0) se pasan al panel.** Sus archivos están en `public/gallery-seed/` y `gallerySeed` (src/config/gallery.ts) guarda sus datos. La primera visita a la Galería o al panel las copia a R2 y D1 una sola vez (bandera `gallery_seeded` en `site_flags`). Después se editan, ocultan o borran como cualquier otra.
3. **El Worker crea las tablas si faltan** (`ensureGallery`, mismo SQL que la migración, todo `IF NOT EXISTS`), porque en producción no siempre hay Wrangler a mano. Correr después `wrangler d1 migrations apply` no causa problemas.
4. **Un idioma y traducción opcional**, como en Notas: el Dr. escribe pie, descripción (texto alternativo) y lugar en español o inglés; si falta la traducción, el sitio en el otro idioma muestra el original con su atributo `lang`.
5. **Orden por fecha**: año (obligatorio) y fecha exacta opcional; de la más reciente a la más antigua. Sin álbumes.
6. **El navegador reduce la foto antes de subirla**: foto grande (lado mayor ≤ 2000 px) y miniatura (≤ 960 px) en WebP, o JPEG si el navegador no codifica WebP. Se respeta la orientación de la cámara y se quitan los metadatos (ubicación GPS). El servidor revisa el formato real por sus primeros bytes y lee el tamaño en píxeles (`src/utils/image-info.ts`). Sin JavaScript se sube el original (hasta 10 MB) y sirve también de miniatura.
7. **Servido por el Worker**: `/files/gallery/…` solo entrega fotos publicadas (caché de un día; cada foto nueva usa una clave nueva). El panel ve las no publicadas en `/admin/galeria/<id>/imagen/`.
8. **Permiso obligatorio** al subir: foto propia o del grupo, con permiso de quien la tomó, o con licencia abierta. Licencia visible opcional (CC BY 4.0, CC BY-SA 4.0, CC0).
9. El **carrusel de inicio** sigue fijo en el código (`heroGallery`).
10. La Galería se renderiza bajo demanda (`prerender = false`). Si D1 o R2 fallan, muestra las fotos iniciales desde `public/` en lugar de una página rota.

## Alternativas consideradas
- Cloudflare Images para redimensionar en el servidor: de pago y otra pieza más. Reducir en el navegador es gratis y suficiente para unas cuantas fotos al mes.
- Dejar las 4 fotos fijas y sumar las del panel: dos lugares para administrar lo mismo.

## Consecuencias
- El Dr. publica fotos sin commits. La página de la Galería consulta D1 en cada visita (tráfico bajo, ~200 visitas al mes).
- Al reemplazar o eliminar una foto se borran sus archivos de R2.
- Se corrigió de paso el sitemap: ya no lista las páginas de `/admin/`.

## Fecha
2026-10-10
