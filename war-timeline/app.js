/* Native year disclosures and anchors remain usable without JavaScript. */
(() => {
  const data = JSON.parse(document.getElementById('timeline-connections').textContent);
  const status = document.querySelector('.selection-status');
  const years = [...document.querySelectorAll('.timeline-year')];
  let selected = null;

  function reveal(id) {
    const target = document.getElementById(id);
    if (!target) return;
    const year = target.matches('.timeline-year') ? target : target.closest('.timeline-year');
    if (year) year.open = true;
  }

  function clear() {
    document.querySelectorAll('.is-related,.is-selected').forEach(el => el.classList.remove('is-related', 'is-selected'));
    document.querySelectorAll('[data-event]').forEach(el => el.setAttribute('aria-pressed', 'false'));
    status.textContent = 'Select a story or event to highlight its connections.';
    selected = null;
  }

  function select(kind, id) {
    if (selected === `${kind}:${id}`) { clear(); return; }
    clear();
    selected = `${kind}:${id}`;
    const stories = kind === 'story' ? [id] : data.entries.filter(e => e.events.includes(id)).map(e => e.id);
    const events = kind === 'event' ? [id] : data.entries.find(e => e.id === id).events;
    document.querySelectorAll('[data-card],[data-story]').forEach(el => {
      if (stories.includes(el.dataset.card || el.dataset.story)) el.classList.add('is-related');
    });
    document.querySelectorAll('[data-event-note]').forEach(el => {
      if (events.includes(el.dataset.eventNote)) {
        el.classList.add(kind === 'event' ? 'is-selected' : 'is-related');
        reveal(el.id);
      }
    });
    document.querySelectorAll('[data-event]').forEach(el => el.setAttribute('aria-pressed', String(events.includes(el.dataset.event))));
    const label = kind === 'event' ? data.events.find(e => e.id === id).title : data.entries.find(e => e.id === id).title;
    status.textContent = kind === 'event'
      ? (stories.length ? `${label} · ${stories.length} connected ${stories.length === 1 ? 'story' : 'stories'} highlighted.` : `${label} · Historical context; no selected title is connected.`)
      : `${label} · ${events.length} connected ${events.length === 1 ? 'event' : 'events'} highlighted.`;
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'reset-selection';
    reset.textContent = 'Clear selection ×';
    reset.addEventListener('click', () => { clear(); status.focus(); });
    status.append(reset);
  }

  // Match the reference's first-year view; without JS all years remain readable.
  years.forEach((year, index) => { year.open = index === 0; });
  status.tabIndex = -1;
  document.querySelector('.year-controls').hidden = false;
  document.querySelectorAll('[data-years]').forEach(button => button.addEventListener('click', () => {
    years.forEach(year => { year.open = button.dataset.years === 'show'; });
  }));
  document.querySelectorAll('[data-event]').forEach(button => {
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => select('event', button.dataset.event));
  });
  document.querySelectorAll('a[data-story]').forEach(link => link.addEventListener('click', () => select('story', link.dataset.story)));
  document.querySelectorAll('[data-event-link]').forEach(link => link.addEventListener('click', () => {
    reveal(`event-${link.dataset.eventLink}`);
    select('event', link.dataset.eventLink);
  }));
  document.querySelectorAll('[data-year]').forEach(link => link.addEventListener('click', () => {
    if (link.dataset.coverageStory) select('story', link.dataset.coverageStory);
    reveal(`year-${link.dataset.year}`);
  }));
  function revealHash() {
    try { reveal(decodeURIComponent(location.hash.slice(1))); } catch (_) { /* Ignore malformed fragment URLs. */ }
  }
  window.addEventListener('hashchange', revealHash);
  revealHash();
})();
