'use strict';

{
const stages = document.querySelector('#process-stages');
const controls = document.querySelector('[data-process-controls]');
const cards = [...stages.children];
const previous = controls.querySelector('[data-process-previous]');
const next = controls.querySelector('[data-process-next]');
const status = controls.querySelector('[data-process-status]');
let current = 0;
let animation;

function showStage(index, direction = 0) {
  current = (index + cards.length) % cards.length;
  animation?.cancel();
  for (const [position, card] of cards.entries()) {
    card.hidden = position !== current;
  }

  const activeCard = cards[current];
  status.textContent = `Этап ${current + 1} из ${cards.length}`;
  if (direction && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    animation = activeCard.animate(
      [{ transform: `translateY(${direction * 28}px)`, opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
      { duration: 320, easing: 'cubic-bezier(.2,.75,.25,1)' }
    );
  }
}

previous.addEventListener('click', () => showStage(current - 1, -1));
next.addEventListener('click', () => showStage(current + 1, 1));
controls.addEventListener('keydown', event => {
  if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
  event.preventDefault();
  const direction = event.key === 'ArrowDown' ? 1 : -1;
  showStage(current + direction, direction);
});

stages.classList.add('is-stage-carousel');
for (const card of cards) card.classList.add('orbit-frame');
showStage(0);
controls.hidden = false;
}
