# Checklist de accesibilidad (WCAG 2.2 AA aplicable)

| Criterio | Implementación | Estado |
|---|---|---|
| Un `h1` por vista, jerarquía sin saltos | Revisado; Lighthouse `heading-order` OK | ✅ |
| Landmarks `header`/`nav`/`main`/`footer` | BaseLayout | ✅ |
| Skip link | Primer foco de cada página ("Saltar al contenido") | ✅ |
| Foco visible | Anillo de 3 px `--color-focus` (3.84:1) | ✅ |
| Contraste de texto | Tokens calculados ≥ 4.5:1 (ver 06-design-system §2) | ✅ |
| `lang` del documento y de fragmentos EN | `es-MX` / `en`; títulos de publicaciones con `lang="en"` | ✅ |
| Enlaces externos | Icono + texto oculto "(abre sitio externo)" | ✅ |
| Menú móvil | `aria-expanded`, `aria-controls`, Escape | ✅ |
| `aria-current` en navegación y breadcrumb | ✅ | ✅ |
| Imágenes decorativas | SVG con `aria-hidden` | ✅ |
| Targets táctiles ≥ 44 px | Botones, nav y selector de idioma (36 px, dentro de lo que permite WCAG 2.5.8) | ✅ |
| `prefers-reduced-motion` | Duraciones a 0 | ✅ |
| Sin bloqueo de zoom | `initial-scale=1` sin `maximum-scale` | ✅ |
| Lighthouse Accessibility | 100 en Home, Research, Research Detail, Publications y Member | ✅ |
| Lector de pantalla real (NVDA/VoiceOver) | — | ☐ Pendiente (Fase 9) |
