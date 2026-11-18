(() => {
  const catalog = document.querySelector('.format-catalog');
  if (!catalog) return;

  const preview = document.createElement('div');
  preview.className = 'format-preview';
  preview.setAttribute('aria-hidden', 'true');
  preview.hidden = true;
  const hoverAvailable = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 900px)');
  let activeCard;

  function closePreview() {
    preview.querySelector('video')?.pause();
    activeCard = undefined;
    preview.hidden = true;
    preview.classList.remove('is-laptop-preview');
  }

  catalog.addEventListener('pointermove', event => {
    if (!hoverAvailable.matches || event.pointerType !== 'mouse') return;
    if (preview.contains(event.target)) return;
    const card = event.target.closest('.format-card');
    if (card === activeCard) return;
    if (!card) {
      closePreview();
      return;
    }

    activeCard = card;
    preview.querySelector('video')?.pause();
    const enlarged = card.cloneNode(true);
    enlarged.querySelector('img').loading = 'eager';
    preview.classList.toggle('is-laptop-preview', Boolean(enlarged.querySelector('.slide-laptop, .micro-phone')));
    preview.replaceChildren(enlarged);
    preview.hidden = false;
    const video = enlarged.querySelector('video[data-preview-video]');
    if (video && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const source = video.dataset.previewVideo;
      video.src = typeof videos === 'undefined' ? source : videos[source.split('/').at(-1)];
      video.play().catch(() => {});
    }
  });

  catalog.append(preview);
  catalog.addEventListener('pointerleave', closePreview);
  hoverAvailable.addEventListener('change', closePreview);
  window.addEventListener('blur', closePreview);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closePreview();
  });
})();
