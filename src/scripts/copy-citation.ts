/** Botones «Copiar cita» ([data-copy]); compartido por las dos vistas de publicación. */
document.addEventListener('click', async (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-copy]');
  if (!btn || !navigator.clipboard) return;
  const label = btn.querySelector('[data-label]');
  const original = label?.textContent ?? '';
  try {
    await navigator.clipboard.writeText(btn.dataset.copy ?? '');
    btn.classList.add('is-done');
    if (label) label.textContent = btn.dataset.done ?? original;
    setTimeout(() => {
      btn.classList.remove('is-done');
      if (label) label.textContent = original;
    }, 2000);
  } catch {
    /* sin permiso de portapapeles: no hacemos nada */
  }
});
