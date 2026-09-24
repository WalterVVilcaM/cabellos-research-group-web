/**
 * Mejoras progresivas globales (el contenido es legible sin JS):
 * - [data-reveal]: aparición suave al entrar en pantalla.
 * - [data-count]: contador animado hasta el valor ya renderizado.
 * - [data-to-top]: botón "volver arriba" visible tras desplazarse.
 * Todo se desactiva con prefers-reduced-motion.
 */
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function animateCount(el: HTMLElement) {
  const target = Number(el.dataset.count);
  if (!Number.isFinite(target) || reduce) return;
  const duration = 1200;
  const t0 = performance.now();
  const step = (now: number) => {
    const p = Math.min(1, (now - t0) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = String(Math.round(target * eased));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const reveal = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
const counters = [...document.querySelectorAll<HTMLElement>('[data-count]')];

if (reduce || !('IntersectionObserver' in window)) {
  reveal.forEach((el) => el.classList.add('is-visible'));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        el.classList.add('is-visible');
        io.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  reveal.forEach((el) => {
    // Lo que ya está en pantalla al cargar no se anima (evita parpadeo)
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.92) el.classList.add('is-visible');
    else io.observe(el);
  });

  const cio = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        animateCount(e.target as HTMLElement);
        cio.unobserve(e.target);
      }
    },
    { threshold: 0.6 },
  );
  counters.forEach((el) => cio.observe(el));
}

const toTop = document.querySelector<HTMLElement>('[data-to-top]');
if (toTop) {
  let ticking = false;
  const sync = () => {
    toTop.classList.toggle('is-visible', window.scrollY > 700);
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(sync);
      }
    },
    { passive: true },
  );
  toTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    document.getElementById('main')?.focus({ preventScroll: true });
  });
  sync();
}
