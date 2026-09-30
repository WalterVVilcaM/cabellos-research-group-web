/**
 * Mejora progresiva del editor de notas (NoteForm.astro): dirección automática, contador,
 * barra de formato, diálogo de enlace, filas de enlaces, PDF y vista previa en vivo.
 * Sin dependencias del servidor: el Markdown se convierte en el navegador con el mismo conversor del sitio.
 */
type Lang = 'es' | 'en';
type Labels = Record<'links' | 'files' | 'tags' | 'research' | 'updated' | 'open' | 'download', string>;
interface PreviewConfig {
  host: string;
  prefixes: Record<Lang, string>;
  authors: Record<string, string>;
  research: Record<string, Record<Lang, string>>;
  categories: Record<string, Record<Lang, string>>;
  kinds: Record<string, Record<Lang, string>>;
  labels: Record<Lang, Labels>;
  attachments: { id: number; title: string; sizeBytes: number }[];
  isTest: boolean;
}

const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');

const formatBytes = (bytes: number, lang: Lang) => {
  const nf = new Intl.NumberFormat(lang === 'es' ? 'es-MX' : 'en-US', { maximumFractionDigits: 1 });
  return bytes >= 1024 * 1024 ? `${nf.format(bytes / 1024 / 1024)} MB` : `${nf.format(Math.max(1, Math.round(bytes / 1024)))} KB`;
};

const formatDate = (iso: string, lang: Lang) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-MX' : 'en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(
    new Date(`${iso}T00:00:00Z`),
  );
};

/** Crea un elemento con clase y texto (siempre textContent: nada del usuario se inserta como HTML). */
function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function initNoteEditor(renderMarkdown: (md: string) => string) {
  const form = document.querySelector<HTMLFormElement>('[data-note-form]');
  const workspace = document.querySelector<HTMLElement>('[data-workspace]');
  const configEl = document.querySelector('[data-preview-config]');
  if (!form || !workspace || !configEl) return;
  const cfg = JSON.parse(configEl.textContent || '{}') as PreviewConfig;
  const $ = <T extends Element = HTMLInputElement>(sel: string) => form.querySelector<T>(sel);
  const $$ = <T extends Element = HTMLInputElement>(sel: string) => [...form.querySelectorAll<T>(sel)];

  document.querySelector<HTMLElement>('[data-error-summary]')?.focus();

  const title = $('[data-title]')!;
  const slug = $('[data-slug]')!;
  const slugAuto = $('[data-slug-auto]')!;
  const slugBox = $<HTMLElement>('[data-slug-box]')!;
  const slugPrefix = $<HTMLElement>('[data-slug-prefix]')!;
  const urlLine = $<HTMLElement>('[data-url-line]')!;
  const urlBase = $<HTMLElement>('[data-url-base]')!;
  const urlSlug = $<HTMLElement>('[data-url-slug]')!;
  const summary = $<HTMLTextAreaElement>('[data-summary]')!;
  const content = $<HTMLTextAreaElement>('[data-content]')!;
  const lang = (): Lang => ($('[data-lang]:checked')?.value === 'en' ? 'en' : 'es');

  // ——— Modo Editar / Vista previa (pantallas angostas) ———
  // Al ir a la vista previa se muestra la parte que se estaba editando; al volver a Editar
  // se regresa exactamente al mismo lugar (posición y campo con el cursor).
  const switcher = document.querySelector<HTMLElement>('[data-view-switch]');
  let lastField: HTMLElement | null = null;
  let editScrollY = 0;
  form.addEventListener('focusin', (e) => {
    const t = e.target as HTMLElement;
    if (t.matches('input, textarea, select')) lastField = t;
  });
  // Qué parte de la vista previa corresponde al campo que se estaba editando.
  const previewTargetFor = (field: HTMLElement | null): string | null => {
    if (!field) return null;
    if (field.matches('[data-content]')) return '[data-pv="body"]';
    if (field.matches('[data-summary]')) return '[data-pv="summary"]';
    if (field.closest('[data-link-row]')) return '[data-pv="links"]';
    if (field.matches('[data-file], [data-file-title], [data-remove-file], [name="new_file_rights"]')) return '[data-pv="files"]';
    if (field.matches('[data-tags]')) return '[data-pv="tags"]';
    if (field.matches('[data-research]')) return '[data-pv="research"]';
    return null;
  };
  const stickyOffset = () => (switcher?.offsetHeight ?? 0) + 24;
  if (switcher) {
    switcher.hidden = false;
    switcher.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-view-btn]');
      if (!btn) return;
      const view = btn.dataset.viewBtn!;
      if (view === workspace.dataset.view) return;
      switcher.querySelectorAll('[data-view-btn]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      if (view === 'preview') {
        editScrollY = window.scrollY;
        workspace.dataset.view = 'preview';
        renderPreview();
        const sel = previewTargetFor(lastField);
        const target = sel ? page.querySelector<HTMLElement>(sel) : null;
        let top = target
          ? target.getBoundingClientRect().top + window.scrollY - stickyOffset()
          : workspace.getBoundingClientRect().top + window.scrollY - 16;
        // En el texto, se aproxima el punto donde estaba el cursor (proporcional a su posición).
        if (target && lastField === content && content.value.length > 0) {
          const ratio = content.selectionStart / content.value.length;
          top += Math.max(0, ratio * target.offsetHeight - window.innerHeight * 0.3);
        }
        window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
      } else {
        workspace.dataset.view = 'edit';
        window.scrollTo({ top: editScrollY, behavior: 'instant' });
        lastField?.focus({ preventScroll: true });
      }
    });
  }

  // ——— Dirección (URL) ———
  const hasSlugError = slug.getAttribute('aria-invalid') === 'true';
  const updateUrl = () => {
    const prefix = cfg.prefixes[lang()];
    slugPrefix.textContent = prefix;
    urlBase.textContent = cfg.host + prefix;
    urlSlug.textContent = slug.value || '…';
  };
  if (!hasSlugError) {
    urlLine.hidden = false;
    slugBox.hidden = true;
  }
  $<HTMLButtonElement>('[data-url-edit]')?.addEventListener('click', (e) => {
    slugBox.hidden = false;
    (e.currentTarget as HTMLElement).hidden = true;
    slug.focus();
    slug.select();
  });
  if (!slug.readOnly) {
    title.addEventListener('input', () => {
      if (slugAuto.value === 'true') slug.value = slugify(title.value);
      updateUrl();
    });
    slug.addEventListener('input', () => {
      slugAuto.value = slug.value ? 'false' : 'true';
      updateUrl();
    });
    // Al salir del campo se normaliza ("Mi Nota" → "mi-nota"; una dirección completa → su última parte).
    slug.addEventListener('change', () => {
      slug.value = slugify(slug.value.replace(/\/+$/, '').split('/').pop() ?? '');
      if (!slug.value) {
        slugAuto.value = 'true';
        slug.value = slugify(title.value);
      }
      updateUrl();
      renderPreview();
    });
  }
  updateUrl();

  // ——— Contador del resumen ———
  const count = $<HTMLElement>('[data-count]')!;
  const counter = $<HTMLElement>('[data-counter]')!;
  const updateCount = () => {
    count.textContent = String(summary.value.length);
    counter.classList.toggle('is-near', summary.value.length > 280);
  };
  summary.addEventListener('input', updateCount);
  updateCount();

  // ——— Barra de formato ———
  const bar = $<HTMLElement>('[data-toolbar]')!;
  bar.hidden = false;
  const wrap = (before: string, after = before, placeholder = 'texto') => {
    const { selectionStart: a, selectionEnd: b, value } = content;
    const sel = value.slice(a, b) || placeholder;
    content.setRangeText(before + sel + after, a, b, 'end');
    content.focus();
    content.setSelectionRange(a + before.length, a + before.length + sel.length);
    content.dispatchEvent(new Event('input'));
  };
  const prefixLines = (fn: (line: string, i: number) => string) => {
    const { selectionStart: a, selectionEnd: b, value } = content;
    const start = value.lastIndexOf('\n', a - 1) + 1;
    const end = value.indexOf('\n', b) === -1 ? value.length : value.indexOf('\n', b);
    const lines = value
      .slice(start, end)
      .split('\n')
      .map((l, i) => fn(l, i));
    content.setRangeText(lines.join('\n'), start, end, 'select');
    content.focus();
    content.dispatchEvent(new Event('input'));
  };

  // Diálogo para enlaces dentro del texto (en lugar de la ventana "prompt" del navegador).
  const dialog = document.querySelector<HTMLDialogElement>('[data-link-dialog]');
  const dText = dialog?.querySelector<HTMLInputElement>('[data-dialog-text]');
  const dUrl = dialog?.querySelector<HTMLInputElement>('[data-dialog-url]');
  const dError = dialog?.querySelector<HTMLElement>('[data-dialog-error]');
  let range: [number, number] = [0, 0];
  const openLinkDialog = () => {
    range = [content.selectionStart, content.selectionEnd];
    if (!dialog || typeof dialog.showModal !== 'function') {
      const url = window.prompt('Dirección del enlace (https://…)', 'https://');
      if (url) wrap('[', `](${url})`, 'texto del enlace');
      return;
    }
    dText!.value = content.value.slice(range[0], range[1]);
    dUrl!.value = '';
    dError!.hidden = true;
    dialog.showModal();
    (dText!.value ? dUrl! : dText!).focus();
  };
  dialog?.querySelector('[data-dialog-cancel]')?.addEventListener('click', () => dialog.close());
  dialog?.querySelector('form')?.addEventListener('submit', (e) => {
    const url = dUrl!.value.trim();
    if (!/^https?:\/\/\S+\.\S+/.test(url)) {
      e.preventDefault();
      dError!.hidden = false;
      dUrl!.focus();
      return;
    }
    const text = dText!.value.trim() || url;
    content.focus();
    content.setSelectionRange(range[0], range[1]);
    content.setRangeText(`[${text.replace(/[[\]]/g, '')}](${url})`, range[0], range[1], 'end');
    content.dispatchEvent(new Event('input'));
  });

  const actions: Record<string, () => void> = {
    bold: () => wrap('**'),
    italic: () => wrap('*'),
    h2: () => prefixLines((l) => '## ' + l.replace(/^#+\s*/, '')),
    ul: () => prefixLines((l) => '- ' + l.replace(/^([-*]|\d+\.)\s+/, '')),
    ol: () => prefixLines((l, i) => `${i + 1}. ` + l.replace(/^([-*]|\d+\.)\s+/, '')),
    quote: () => prefixLines((l) => '> ' + l.replace(/^>\s*/, '')),
    link: openLinkDialog,
  };
  bar.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-md]');
    if (btn) actions[btn.dataset.md!]?.();
  });
  // Atajos habituales: Ctrl/Cmd + B, I, K.
  content.addEventListener('keydown', (e) => {
    if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
    const key = e.key.toLowerCase();
    const map: Record<string, string> = { b: 'bold', i: 'italic', k: 'link' };
    if (map[key]) {
      e.preventDefault();
      actions[map[key]!]!();
    }
  });

  // ——— Filas de enlaces ———
  const list = $<HTMLElement>('[data-links]')!;
  const tpl = document.querySelector<HTMLTemplateElement>('[data-link-template]')!;
  const add = $<HTMLButtonElement>('[data-add-link]')!;
  add.hidden = false;
  list.querySelectorAll<HTMLElement>('[data-remove-link]').forEach((b) => (b.hidden = false));
  // Sin enlaces: se quita la fila vacía y queda solo el botón "Agregar enlace".
  const rows = list.querySelectorAll('[data-link-row]');
  if (rows.length === 1 && [...rows[0]!.querySelectorAll('input')].every((i) => !i.value)) rows[0]!.remove();
  add.addEventListener('click', () => {
    list.append(tpl.content.cloneNode(true));
    list.lastElementChild?.querySelector('input')?.focus();
  });
  list.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('[data-remove-link]');
    if (!btn) return;
    btn.closest('[data-link-row]')?.remove();
    add.focus();
    renderPreview();
  });

  // ——— PDF: nombre y derechos solo aparecen al elegir un archivo ———
  const file = $('[data-file]')!;
  const fileExtra = $<HTMLElement>('[data-file-extra]')!;
  const fileError = file.getAttribute('aria-invalid') === 'true';
  const syncFile = () => {
    fileExtra.hidden = !fileError && !(file.files && file.files.length > 0);
  };
  file.addEventListener('change', syncFile);
  syncFile();

  // ——— Vista previa en vivo ———
  const page = document.querySelector<HTMLElement>('[data-pv-page]')!;
  const pvUrl = document.querySelector<HTMLElement>('[data-pv-url]')!;
  let lastMd: string | null = null;
  let bodyHtml = '';

  function renderPreview() {
    const l = lang();
    const L = cfg.labels[l];
    pvUrl.textContent = `${cfg.host}${cfg.prefixes[l]}${slug.value || '…'}/`;

    if (content.value !== lastMd) {
      lastMd = content.value;
      try {
        bodyHtml = renderMarkdown(content.value);
      } catch {
        bodyHtml = '';
      }
    }

    const root = el('article', 'pv');
    root.lang = l;

    const labels = el('p', 'pv__labels');
    const cat = $('[data-category]:checked')?.value ?? 'opinion';
    labels.append(el('span', 'pv__cat', cfg.categories[cat]?.[l] ?? ''));
    root.append(labels);

    root.append(title.value.trim() ? el('h1', '', title.value) : el('h1', 'is-placeholder', 'Título de la nota'));
    root.append(
      summary.value.trim()
        ? el('p', 'pv__summary', summary.value)
        : el('p', 'pv__summary is-placeholder', 'Aquí aparecerá el resumen.'),
    );
    (root.lastElementChild as HTMLElement).dataset.pv = 'summary';

    const meta = el('p', 'pv__meta');
    const authorId = $<HTMLInputElement | HTMLSelectElement>('[data-author]')?.value ?? '';
    meta.append(el('span', '', cfg.authors[authorId] ?? ''));
    const pub = formatDate($('[data-published]')?.value ?? '', l);
    if (pub) meta.append(el('span', '', '·'), el('span', '', pub));
    const rev = formatDate($('[data-revised]')?.value ?? '', l);
    if (rev) meta.append(el('span', '', '·'), el('span', '', `${L.updated} ${rev}`));
    root.append(meta);

    const body = el('div', 'pv__body prose');
    body.dataset.pv = 'body';
    if (bodyHtml.trim()) body.innerHTML = bodyHtml; // HTML seguro: el conversor no deja pasar HTML crudo.
    else body.append(el('p', 'is-placeholder', 'Aquí aparecerá el texto de la nota mientras lo escribes.'));
    root.append(body);

    // Enlaces
    const links = $$<HTMLElement>('[data-link-row]')
      .map((row) => ({
        url: row.querySelector<HTMLInputElement>('[data-link-url]')?.value.trim() ?? '',
        title: row.querySelector<HTMLInputElement>('[data-link-title]')?.value.trim() ?? '',
        kind: row.querySelector<HTMLSelectElement>('[data-link-kind]')?.value ?? 'other',
        desc: row.querySelector<HTMLInputElement>('[data-link-desc]')?.value.trim() ?? '',
      }))
      .filter((k) => k.url || k.title);
    if (links.length) {
      const sec = el('section', 'pv__block');
      sec.dataset.pv = 'links';
      sec.append(el('h2', 'pv__block-title', L.links));
      const ul = el('ul', 'pv__links');
      ul.setAttribute('role', 'list');
      for (const k of links) {
        const li = el('li', 'pv__link');
        li.append(el('span', 'pv__link-kind', cfg.kinds[k.kind]?.[l] ?? ''));
        li.append(el('span', 'pv__link-title' + (k.title ? '' : ' is-placeholder'), k.title || k.url));
        if (k.desc) li.append(el('span', 'pv__link-desc', k.desc));
        ul.append(li);
      }
      sec.append(ul);
      root.append(sec);
    }

    // Archivos: los guardados que no se van a quitar + el nuevo elegido.
    const removed = new Set($$('[data-remove-file]:checked').map((c) => Number(c.value)));
    const files = cfg.attachments.filter((a) => !removed.has(a.id)).map((a) => ({ title: a.title, size: a.sizeBytes }));
    const chosen = file.files?.[0];
    if (chosen) {
      files.push({
        title: $('[data-file-title]')?.value.trim() || chosen.name.replace(/\.pdf$/i, ''),
        size: chosen.size,
      });
    }
    if (files.length) {
      const sec = el('section', 'pv__block');
      sec.dataset.pv = 'files';
      sec.append(el('h2', 'pv__block-title', L.files));
      const ul = el('ul', 'pv__files');
      ul.setAttribute('role', 'list');
      for (const f of files) {
        const li = el('li', 'pv__file');
        li.append(el('span', 'pv__file-icon', 'PDF'));
        const b = el('div', 'pv__file-body');
        b.append(el('p', 'pv__file-title', f.title), el('p', 'pv__file-meta', `PDF · ${formatBytes(f.size, l)}`));
        li.append(b, el('span', 'pv__file-btn pv__file-btn--primary', L.open), el('span', 'pv__file-btn', L.download));
        ul.append(li);
      }
      sec.append(ul);
      root.append(sec);
    }

    // Etiquetas y líneas
    const tags = [
      ...new Set(
        ($('[data-tags]')?.value ?? '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      ),
    ].slice(0, 10);
    const lines = $$('[data-research]:checked').map((c) => cfg.research[c.value]?.[l] ?? c.value);
    for (const [key, label, items] of [
      ['tags', L.tags, tags],
      ['research', L.research, lines],
    ] as const) {
      if (!items.length) continue;
      const sec = el('section', 'pv__block');
      sec.dataset.pv = key;
      sec.append(el('h2', 'pv__block-title', label));
      const ul = el('ul', 'pv__tags');
      ul.setAttribute('role', 'list');
      items.forEach((t) => ul.append(el('li', 'pv__tag', t)));
      sec.append(ul);
      root.append(sec);
    }

    page.replaceChildren(root);
  }

  let timer: number | undefined;
  const schedule = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(renderPreview, 120);
  };
  form.addEventListener('input', schedule);
  form.addEventListener('change', (e) => {
    if ((e.target as HTMLElement).matches('[data-lang]')) updateUrl();
    schedule();
  });
  renderPreview();
}
