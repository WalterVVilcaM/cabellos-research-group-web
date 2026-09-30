/**
 * Markdown seguro de las notas (ADR-014): micromark + GFM, sin HTML crudo ni enlaces javascript:.
 * Sin dependencias del Worker: lo usan el sitio (servidor) y la vista previa en vivo del panel (navegador),
 * así lo que se ve al escribir es exactamente lo que se publica.
 */
import { micromark } from 'micromark';
import { gfm, gfmHtml } from 'micromark-extension-gfm';

export function renderMarkdown(md: string): string {
  return micromark(md, { extensions: [gfm()], htmlExtensions: [gfmHtml()] })
    .replace(/<(\/?)h1>/g, '<$1h2>')
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, '</table></div>');
}
