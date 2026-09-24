# Checklist responsive

Anchos de control (orquestador §22.1): 320 · 375 · 430 · 768 · 1024 · 1280 · 1440 · 1920 px.

| Verificación | Método | Resultado 2026-09-23 |
|---|---|---|
| Sin overflow horizontal | `scrollWidth ≤ viewport` en las 9 vistas (Playwright) a 320, 375 y 1280 px | ✅ |
| Navegación móvil (< 900 px) | Abrir/cerrar, Escape devuelve el foco | ✅ |
| Navegación desktop (≥ 900 px) | Visual | ✅ |
| Grids de tarjetas | Home 2×2 → 1 col; Team auto-fill | ✅ |
| Títulos largos de publicaciones | Visual en /publicaciones/ | ✅ |
| DOI y URLs largas | `overflow-wrap: anywhere` | ✅ |
| Nombres académicos largos | Perfil y tarjetas | ✅ |
| Cambio de idioma conserva la página | Playwright: EN detalle → ES detalle equivalente | ✅ |
| Footer | 3 col → 1 col | ✅ |
| 768 / 1024 / 1440 / 1920 px | Revisión manual en navegador real | ☐ Pendiente (Fase 9) |
| Safari iOS / Android Chrome reales | Dispositivos | ☐ Pendiente (Fase 9) |
