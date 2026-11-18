(() => {
  const key = 'portfolio-2-display-theme';
  const root = document.documentElement;
  const normalize = value => value === 'daylight' ? 'daylight' : 'gold';

  let theme = 'gold';
  try {
    theme = normalize(localStorage.getItem(key));
  } catch {}
  root.dataset.theme = theme;

  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('[data-display-theme-toggle]');
    const themeColor = document.querySelector('meta[name="theme-color"]');
    function apply(next) {
      theme = next;
      root.dataset.theme = next;
      toggle.setAttribute('aria-pressed', String(next === 'daylight'));
      themeColor?.setAttribute('content', next === 'daylight' ? '#faf7f0' : '#08080a');
    }
    apply(theme);
    toggle.hidden = false;
    toggle.addEventListener('click', () => {
      apply(theme === 'daylight' ? 'gold' : 'daylight');
      try { localStorage.setItem(key, theme); } catch {}
    });
    window.addEventListener('storage', event => {
      if (event.key === key) apply(normalize(event.newValue));
    });
  });
})();
