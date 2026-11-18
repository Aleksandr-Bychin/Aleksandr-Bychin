const motionPreference = matchMedia('(prefers-reduced-motion: no-preference)');
const projectCovers = document.querySelectorAll('.hero-work');

const experienceGrid = document.querySelector('.about-stats');
if (experienceGrid) {
  const referenceCards = [...experienceGrid.querySelectorAll('.about-stat')].slice(0, 2);
  let lastWidth;

  function fitExperienceCards() {
    const heights = referenceCards.map(card => {
      const summary = card.querySelector('summary');
      const measurement = card.querySelector('.about-stat-content').cloneNode(true);
      measurement.setAttribute('inert', '');
      Object.assign(measurement.style, {
        position: 'absolute',
        visibility: 'hidden',
        inlineSize: summary.getBoundingClientRect().width + 'px',
        blockSize: 'auto',
        margin: '0',
      });
      experienceGrid.append(measurement);
      const height = Math.ceil(measurement.getBoundingClientRect().height);
      measurement.remove();
      return height;
    });
    experienceGrid.style.setProperty('--about-stat-content-height', Math.max(...heights) + 'px');
  }

  const experienceResize = new ResizeObserver(([entry]) => {
    const width = entry.contentRect.width;
    if (width === lastWidth) return;
    lastWidth = width;
    fitExperienceCards();
  });
  experienceResize.observe(experienceGrid);
  document.fonts.ready.then(fitExperienceCards);
}

const projectGrid = document.querySelector('#project-grid');

if (projectGrid) {
  const cards = Array.from(projectGrid.children);
  const controls = document.querySelector('.project-controls');
  const allButton = controls.querySelector('[data-project-all]');
  const status = document.querySelector('[data-project-status]');
  const filters = document.querySelector('.project-filters');
  const filterButtons = Array.from(filters.querySelectorAll('[data-project-filter]'));
  const empty = document.querySelector('[data-project-empty]');
  const previous = controls.querySelector('[data-project-previous]');
  const next = controls.querySelector('[data-project-next]');
  const featuredVideo = projectGrid.querySelector('[data-project-video-featured]');
  let current = 0;
  let selectedType = '';
  let touchStart;
  let suppressClick = false;

  function showProject(direction = 0) {
    current = (current + direction + cards.length) % cards.length;
    projectGrid.classList.add('is-carousel');
    cards.forEach((card, index) => {
      card.hidden = false;
      card.inert = index !== current;
      card.dataset.position = index === current ? 'current' :
        index === (current + 1) % cards.length ? 'next' :
        index === (current - 1 + cards.length) % cards.length ? 'previous' : 'offscreen';
    });
    allButton.setAttribute('aria-expanded', 'false');
    allButton.textContent = 'Смотреть все проекты';
    previous.disabled = next.disabled = cards.length < 2;
    empty.hidden = true;

    const card = cards[current];
    if (direction) {
      status.textContent = `Проект ${current + 1} из ${cards.length}. ${card.querySelector('h3').textContent.replaceAll('\u00ad', '')}`;
    }
  }

  function showList(type = '') {
    if (type === 'video') projectGrid.prepend(featuredVideo);
    else if (selectedType === 'video') projectGrid.append(featuredVideo);
    selectedType = type;
    projectGrid.classList.remove('is-carousel');
    cards.forEach(card => {
      card.inert = false;
      card.hidden = Boolean(type) && !card.dataset.projectTypes.split(' ').includes(type);
    });
    filterButtons.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.projectFilter === type));
    });
    empty.hidden = cards.some(card => !card.hidden);
    previous.disabled = next.disabled = Boolean(type) || cards.length < 2;
    allButton.setAttribute('aria-expanded', 'true');
    allButton.textContent = type ? 'Смотреть все проекты' : 'Свернуть список';
    status.textContent = type ? (empty.hidden ? 'Список проектов обновлён' : empty.textContent) : 'Показаны все проекты';
  }

  allButton.addEventListener('click', () => {
    if (!selectedType && allButton.getAttribute('aria-expanded') === 'true') {
      showProject();
      status.textContent = 'Карусель проектов';
      return;
    }
    showList();
  });
  filterButtons.forEach(button => button.addEventListener('click', () => {
    const type = button.dataset.projectFilter;
    showList(selectedType === type ? '' : type);
  }));
  previous.addEventListener('click', () => showProject(-1));
  next.addEventListener('click', () => showProject(1));

  projectGrid.addEventListener('pointerdown', event => {
    suppressClick = false;
    if (event.pointerType !== 'touch' || !event.isPrimary || !projectGrid.classList.contains('is-carousel')) return;
    touchStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
  });
  projectGrid.addEventListener('pointercancel', event => {
    if (touchStart?.id === event.pointerId) touchStart = undefined;
  });
  projectGrid.addEventListener('pointerup', event => {
    if (touchStart?.id !== event.pointerId) return;
    const dx = event.clientX - touchStart.x;
    const dy = event.clientY - touchStart.y;
    touchStart = undefined;
    if (Math.abs(dx) < 42 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
    suppressClick = true;
    showProject(dx < 0 ? 1 : -1);
  });
  projectGrid.addEventListener('click', event => {
    if (!suppressClick || event.detail === 0) return;
    event.preventDefault();
    suppressClick = false;
  }, { capture: true });
  projectGrid.addEventListener('click', event => {
    if (event.defaultPrevented || !projectGrid.classList.contains('is-carousel') ||
        event.target.closest('.project') || !matchMedia('(min-width: 900px)').matches) return;

    const { left, right } = cards[current].getBoundingClientRect();
    if (event.clientX < left) showProject(-1);
    else if (event.clientX > right) showProject(1);
  });
  showProject();
  controls.hidden = false;
  filters.hidden = false;
}

if (projectCovers.length && 'IntersectionObserver' in window) {
  const desktopTimeline = CSS.supports('animation-timeline: view()') &&
    CSS.supports('animation-range: entry 0% entry 90%');
  const compact = matchMedia('(max-width: 660px)');
  const coverObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting || !motionPreference.matches) continue;
      if (compact.matches || !desktopTimeline) {
        entry.target.classList.add('is-entering');
      }
      coverObserver.unobserve(entry.target);
    }
  }, { threshold: 0.15 });
  projectCovers.forEach(cover => coverObserver.observe(cover));
}

function animateProjectSlide(transition, image) {
  if (!motionPreference.matches || !image || !image.complete || !image.naturalWidth) {
    transition.skipTransition();
    return;
  }

  image.style.viewTransitionName = 'project-slide';
  document.documentElement.classList.add('project-transition');
  transition.finished.finally(() => {
    image.style.removeProperty('view-transition-name');
    document.documentElement.classList.remove('project-transition');
  }).catch(() => {});
}

window.addEventListener('pageswap', (event) => {
  if (!event.viewTransition) return;
  const destination = event.activation?.entry?.url;
  const project = Array.from(document.querySelectorAll('[data-slide-transition]'))
    .find(link => link.href === destination);
  animateProjectSlide(event.viewTransition, project?.querySelector('.hero-plate-front img'));
});

window.addEventListener('pagereveal', (event) => {
  if (!event.viewTransition) return;
  const source = window.navigation?.activation?.from?.url;
  const fromHome = source &&
    new URL(source).pathname.replace(/index\.html$/, '') === new URL('../../', location.href).pathname;
  const gallery = location.hash === '#slides';
  const slide = fromHome && document.querySelector(gallery ? '.slide-image' : '.case-hero .hero-plate-front img');
  if (slide && gallery && motionPreference.matches) {
    document.querySelector('#slides').scrollIntoView({ behavior: 'instant' });
  }
  animateProjectSlide(event.viewTransition, slide);
});
