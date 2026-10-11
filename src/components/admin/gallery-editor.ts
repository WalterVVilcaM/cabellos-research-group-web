/**
 * Ayudas del formulario de la Galería (ADR-015):
 * - reduce la foto en el navegador antes de subirla: grande (lado mayor ≤ 2000 px) y miniatura (≤ 960 px),
 *   en WebP (o JPEG si el navegador no sabe hacer WebP), respetando la orientación de la cámara y sin
 *   los metadatos de la foto (ubicación GPS, modelo de cámara);
 * - muestra cómo queda recortada en la cuadrícula y cambia el recorte en vivo;
 * - contadores de caracteres e idioma de la traducción.
 * Si algo falla, el formulario sigue funcionando y se sube el original (el servidor acepta hasta 10 MB).
 */
const SIZES = { full: 2000, thumb: 960 };
const SERVER_MAX = 10 * 1024 * 1024;
const OK_TYPES = /^image\/(jpeg|png|webp)$/;

const fmtSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

async function encode(source: ImageBitmap, max: number) {
  const scale = Math.min(1, max / Math.max(source.width, source.height));
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Sin canvas');
  ctx.fillStyle = '#fff'; // fondo blanco si la imagen tiene transparencia
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, width, height);
  let blob = await toBlob(canvas, 'image/webp', 0.85);
  let ext = 'webp';
  if (!blob || blob.type !== 'image/webp') {
    blob = await toBlob(canvas, 'image/jpeg', 0.86);
    ext = 'jpg';
  }
  if (!blob) throw new Error('No se pudo codificar');
  return { blob, width, height, ext };
}

function setFiles(input: HTMLInputElement, file: File | null) {
  const dt = new DataTransfer();
  if (file) dt.items.add(file);
  input.files = dt.files;
}

export function initGalleryEditor(form: HTMLFormElement) {
  const photo = form.querySelector<HTMLInputElement>('[data-photo]');
  const thumb = form.querySelector<HTMLInputElement>('[data-thumb]');
  const originalName = form.querySelector<HTMLInputElement>('[data-original-name]');
  const frame = form.querySelector<HTMLElement>('[data-frame]');
  const preview = form.querySelector<HTMLImageElement>('[data-preview-img]');
  const status = form.querySelector<HTMLElement>('[data-photo-status]');
  const buttons = [...form.querySelectorAll<HTMLButtonElement>('button[type="submit"]')];
  let busy = false;
  let objectUrl: string | null = null;

  const say = (msg: string, isError = false) => {
    if (!status) return;
    status.textContent = msg;
    status.classList.toggle('is-error', isError);
  };
  const showPreview = (file: Blob) => {
    if (!preview) return;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);
    preview.src = objectUrl;
    preview.hidden = false;
    frame?.removeAttribute('data-empty');
  };

  photo?.addEventListener('change', async () => {
    const file = photo.files?.[0];
    if (thumb) setFiles(thumb, null);
    if (originalName) originalName.value = '';
    if (!file) return;
    busy = true;
    frame?.setAttribute('data-busy', '');
    say('Preparando la foto…');
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions);
      const full = await encode(bitmap, SIZES.full);
      const small = await encode(bitmap, SIZES.thumb);
      bitmap.close();
      // Siempre se vuelve a codificar: así también se quitan los metadatos de la cámara (ubicación GPS, etc.).
      const base = file.name.replace(/\.[^.]+$/, '') || 'foto';
      const fullFile = new File([full.blob], `${base}.${full.ext}`, { type: full.blob.type });
      const thumbFile = new File([small.blob], `${base}-thumb.${small.ext}`, { type: small.blob.type });
      setFiles(photo, fullFile);
      if (thumb) setFiles(thumb, thumbFile);
      if (originalName) originalName.value = file.name;
      showPreview(thumbFile);
      say(`Lista para subir: ${full.width} × ${full.height} px, ${fmtSize(fullFile.size)} (el original pesaba ${fmtSize(file.size)}).`);
    } catch {
      // El navegador no pudo leerla (p. ej. HEIC en Windows) o no sabe reducir fotos.
      if (!OK_TYPES.test(file.type)) {
        setFiles(photo, null);
        say('Este formato no se puede publicar. Si es una foto HEIC del iPhone, compártela o expórtala como JPG y vuelve a elegirla.', true);
      } else if (file.size > SERVER_MAX) {
        setFiles(photo, null);
        say('No se pudo reducir esta foto y pesa más de 10 MB. Prueba con otro navegador (Chrome, Edge o Firefox).', true);
      } else {
        showPreview(file);
        say(`Se subirá sin reducir (${fmtSize(file.size)}).`);
      }
    } finally {
      busy = false;
      frame?.removeAttribute('data-busy');
    }
  });

  // Recorte en vivo
  form.querySelectorAll<HTMLInputElement>('[data-focus]').forEach((r) =>
    r.addEventListener('change', () => {
      if (preview && r.checked) preview.style.objectPosition = r.dataset.focus ?? '50% 50%';
    }),
  );

  // Idioma de la traducción
  const trNames = { es: 'inglés', en: 'español' } as const;
  const langNames = { es: 'español', en: 'inglés' } as const;
  form.querySelectorAll<HTMLInputElement>('[data-lang]').forEach((r) =>
    r.addEventListener('change', () => {
      if (!r.checked) return;
      const lang = r.value === 'en' ? 'en' : 'es';
      form.querySelectorAll('[data-tr-name]').forEach((el) => (el.textContent = trNames[lang]));
      form.querySelectorAll('[data-lang-name]').forEach((el) => (el.textContent = langNames[lang]));
    }),
  );

  // Contadores
  form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-count]').forEach((el) => {
    const counter = form.querySelector<HTMLElement>(`[data-counter-for="${el.id}"]`);
    const max = el.maxLength;
    const update = () => {
      if (!counter) return;
      counter.textContent = `${el.value.length}/${max}`;
      counter.classList.toggle('is-near', el.value.length > max * 0.9);
    };
    el.addEventListener('input', update);
    update();
  });

  // La fecha exacta fija el año
  const year = form.querySelector<HTMLInputElement>('[data-year]');
  const date = form.querySelector<HTMLInputElement>('[data-date]');
  date?.addEventListener('change', () => {
    if (year && /^\d{4}-/.test(date.value)) year.value = date.value.slice(0, 4);
  });

  form.addEventListener('submit', (e) => {
    if (busy) {
      e.preventDefault();
      say('Espera un momento: la foto todavía se está preparando.');
      return;
    }
    const clicked = (e as SubmitEvent).submitter as HTMLButtonElement | null;
    // Se desactivan después de enviar para que el botón pulsado viaje en el formulario.
    setTimeout(() => {
      buttons.forEach((b) => (b.disabled = true));
      if (clicked) clicked.textContent = photo?.files?.length ? 'Subiendo…' : 'Guardando…';
    }, 0);
  });
}
