'use strict';

for (const viewer of document.querySelectorAll('[data-viewer]')) {
  const image = viewer.querySelector('.slide-image');
  const controls = viewer.querySelector('.viewer-controls');
  const select = viewer.querySelector('select');
  const previous = viewer.querySelector('[data-previous]');
  const next = viewer.querySelector('[data-next]');
  const original = viewer.querySelector('.slide-open');
  const status = viewer.querySelector('[data-status]');
  const total = Number(viewer.dataset.count);
  const base = viewer.dataset.base;
  const caption = viewer.dataset.title;
  let current = 1;

  for (let i = 1; i <= total; i++) {
    select.add(new Option(String(i), String(i)));
  }

  function show(number) {
    const active = document.activeElement;
    current = Math.max(1, Math.min(total, number));
    const source = `${base}${current}.webp`;
    image.src = source;
    image.alt = `${caption}. Слайд ${current} из ${total}`;
    original.href = source;
    select.value = String(current);
    previous.disabled = current === 1;
    next.disabled = current === total;
    if (active === previous && previous.disabled) next.focus();
    if (active === next && next.disabled) previous.focus();
    status.textContent = `Слайд ${current} из ${total}`;
  }

  controls.hidden = false;
  previous.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  select.addEventListener('change', () => show(Number(select.value)));
  viewer.addEventListener('keydown', (event) => {
    if (event.target === select || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      show(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  show(1);
}
