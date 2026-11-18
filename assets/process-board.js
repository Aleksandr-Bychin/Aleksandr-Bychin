(() => {
  const stages = document.getElementById('process-stages');
  if (!stages) return;

  const cards = [...stages.children];
  const board = document.createElement('div');
  board.className = 'process-board orbit-frame';
  const choices = document.createElement('div');
  choices.className = 'process-choices';
  choices.setAttribute('role', 'group');
  choices.setAttribute('aria-label', 'Выбрать этап разработки');

  const buttons = cards.map((card, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'process-choice';
    button.setAttribute('aria-controls', stages.id);
    const number = document.createElement('span');
    number.textContent = card.querySelector('.process-number').textContent;
    const title = document.createElement('strong');
    title.textContent = card.querySelector('h3').textContent;
    button.append(number, title);
    button.addEventListener('click', () => selectStage(index));
    choices.append(button);
    return button;
  });

  const status = document.createElement('p');
  status.className = 'sr-only';
  status.setAttribute('role', 'status');

  function selectStage(index) {
    cards.forEach((card, position) => {
      card.hidden = position !== index;
    });
    buttons.forEach((button, position) => {
      button.setAttribute('aria-pressed', String(position === index));
    });
    status.textContent = cards[index].querySelector('p').textContent;
  }

  stages.before(board);
  board.append(stages, choices, status);
  selectStage(0);
})();
