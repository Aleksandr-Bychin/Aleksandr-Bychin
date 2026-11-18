(() => {
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  for (const button of document.querySelectorAll('a[data-rocket-button]')) {
    let launching = false;
    button.addEventListener('click', async event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey ||
          event.ctrlKey || event.shiftKey || event.altKey || motionPreference.matches ||
          typeof button.animate !== 'function') return;
      event.preventDefault();
      if (launching) return;
      launching = true;
      const destination = button.href;
      const launch = button.animate(
        [{ transform: 'translateX(0)' }, { transform: 'translateX(32px)', opacity: .45 }],
        { duration: 210, easing: 'cubic-bezier(.55,.05,.95,.6)' }
      );
      try {
        await launch.finished;
        location.assign(destination);
      } finally {
        launching = false;
      }
    });
  }
})();
