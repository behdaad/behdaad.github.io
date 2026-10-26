/* Shared progressive enhancement. All content and navigation work without JS. */
(() => {
  const data = JSON.parse(document.getElementById('timeline-connections').textContent);
  const status = document.querySelector('.selection-status');
  let selected = null;
  function clear() {
    document.querySelectorAll('.is-related,.is-selected').forEach(el => el.classList.remove('is-related', 'is-selected'));
    document.querySelectorAll('[data-event]').forEach(el => el.setAttribute('aria-pressed', 'false'));
    status.textContent = 'Select an event or story to trace its connections.';
    selected = null;
  }
  function select(kind, id) {
    if (selected === `${kind}:${id}`) { clear(); return; }
    clear();
    selected = `${kind}:${id}`;
    const stories = kind === 'story' ? [id] : data.entries.filter(e => e.events.includes(id)).map(e => e.id);
    const events = kind === 'event' ? [id] : data.entries.find(e => e.id === id).events;
    document.querySelectorAll('[data-card],[data-chart-row],[data-story]').forEach(el => {
      const story = el.dataset.card || el.dataset.chartRow || el.dataset.story;
      if (stories.includes(story)) el.classList.add('is-related');
    });
    document.querySelectorAll('[data-event-note]').forEach(el => {
      if (events.includes(el.dataset.eventNote)) el.classList.add(kind === 'event' ? 'is-selected' : 'is-related');
    });
    document.querySelectorAll('[data-event]').forEach(el => {
      el.setAttribute('aria-pressed', String(events.includes(el.dataset.event)));
    });
    const label = kind === 'event' ? data.events.find(e => e.id === id).title : data.entries.find(e => e.id === id).title;
    status.textContent = kind === 'event' ? (stories.length ? `${label} · ${stories.length} connected ${stories.length === 1 ? 'story' : 'stories'} highlighted.` : `${label} · Historical context; none of the selected titles depicts this event.`) : `${label} · ${events.length} connected events highlighted.`;
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'reset-selection';
    reset.textContent = 'Clear selection ×';
    reset.addEventListener('click', () => { clear(); status.focus(); });
    status.append(reset);
  }
  status.tabIndex = -1;
  document.querySelectorAll('[data-event]').forEach(button => {
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => select('event', button.dataset.event));
  });
  document.querySelectorAll('a[data-story]').forEach(link => link.addEventListener('click', () => select('story', link.dataset.story)));
})();
