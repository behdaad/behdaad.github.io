/* Static charts and title anchors remain readable without JavaScript. */
(() => {
  const data = JSON.parse(document.getElementById('timeline-connections').textContent);
  const status = document.querySelector('.selection-status');
  const years = [...document.querySelectorAll('.timeline-year')];
  const timeline = document.querySelector('.timeline');
  const modal = document.getElementById('movie-modal');
  const canModal = modal && typeof modal.showModal === 'function';
  const cards = new Map([...document.querySelectorAll('[data-card]')].map(card => [card.dataset.card, card]));
  let selected = null;
  let activeMovie = null;
  let layoutQueued = false;
  let labelsQueued = false;
  const spanLabels = [...document.querySelectorAll('.film-span .span-label')];

  function reveal(id) {
    const target = document.getElementById(id);
    const year = target?.matches('.timeline-year') ? target : target?.closest('.timeline-year');
    if (year) year.open = true;
  }

  function clear() {
    document.querySelectorAll('.is-related,.is-selected').forEach(el => el.classList.remove('is-related', 'is-selected'));
    document.querySelectorAll('[data-event]').forEach(el => el.setAttribute('aria-pressed', 'false'));
    timeline.classList.remove('has-story-selection');
    status.textContent = 'Select a story or event to highlight its connections.';
    selected = null;
  }

  function select(kind, id, toggle = false) {
    if (toggle && selected === `${kind}:${id}`) { clear(); return; }
    clear();
    selected = `${kind}:${id}`;
    const stories = kind === 'story' ? [id] : data.entries.filter(e => e.events.includes(id)).map(e => e.id);
    const events = kind === 'event' ? [id] : data.entries.find(e => e.id === id).events;
    timeline.classList.toggle('has-story-selection', kind === 'story');
    document.querySelectorAll('[data-card],[data-story]').forEach(el => {
      if (stories.includes(el.dataset.card || el.dataset.story)) el.classList.add('is-related');
    });
    document.querySelectorAll('[data-marker-story]').forEach(el => {
      if (stories.includes(el.dataset.markerStory) && (kind === 'story' || events.includes(el.dataset.eventLink))) el.classList.add('is-related');
    });
    document.querySelectorAll('[data-event-note]').forEach(el => {
      if (events.includes(el.dataset.eventNote)) el.classList.add(kind === 'event' ? 'is-selected' : 'is-related');
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

  function openMovie(id, opener) {
    const card = cards.get(id);
    if (!card || !canModal) return;
    if (modal.open) {
      activeMovie?.placeholder.replaceWith(activeMovie.card);
      activeMovie = null;
      modal.close();
    }
    const placeholder = document.createComment(`movie:${id}`);
    card.before(placeholder);
    activeMovie = {card, placeholder, opener};
    modal.querySelector('.modal-content').append(card);
    modal.setAttribute('aria-labelledby', `title-${id}`);
    document.body.classList.add('modal-open');
    modal.showModal();
    modal.scrollTop = 0;
    requestAnimationFrame(() => { if (modal.open) modal.querySelector('.modal-close').focus({preventScroll: true}); });
  }

  if (canModal) {
    document.querySelector('.viewing-guide').hidden = true;
    document.querySelectorAll('a[data-story]').forEach(link => link.setAttribute('aria-haspopup', 'dialog'));
    modal.querySelector('.modal-close').addEventListener('click', () => modal.close());
    document.addEventListener('keydown', event => {
      if (!modal.open || event.key !== 'Tab') return;
      const focusable = [...modal.querySelectorAll('button,a[href],summary,[tabindex]')]
        .filter(el => !el.disabled && el.tabIndex >= 0 && el.getClientRects().length);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !modal.contains(document.activeElement))) {
        event.preventDefault();
        first?.focus();
      }
    });
    modal.addEventListener('close', () => {
      if (modal.open) return;
      if (activeMovie) {
        activeMovie.placeholder.replaceWith(activeMovie.card);
        activeMovie.opener?.focus({preventScroll: true});
        activeMovie = null;
      }
      document.body.classList.remove('modal-open');
    });
    modal.addEventListener('click', event => {
      if (event.target !== modal) return;
      const box = modal.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) modal.close();
    });
  }

  // Event markers follow the actual card positions, including expanded sources and collapsed years.
  const markers = [...document.querySelectorAll('.span-event')];
  function layoutMarkers() {
    layoutQueued = false;
    for (const marker of markers) {
      const event = document.getElementById(`event-${marker.dataset.eventLink}`);
      const year = event.closest('.timeline-year');
      marker.hidden = !year.open;
      if (marker.hidden) continue;
      const node = getComputedStyle(event, '::after');
      const border = parseFloat(getComputedStyle(event).borderTopWidth) || 0;
      const extra = node.boxSizing === 'border-box' ? 0 : parseFloat(node.borderTopWidth) + parseFloat(node.borderBottomWidth);
      const center = event.getBoundingClientRect().top + border + parseFloat(node.top) + (parseFloat(node.height) + extra) / 2;
      marker.style.setProperty('--marker-top', `${center - year.getBoundingClientRect().top}px`);
    }
    timeline.classList.add('markers-ready');
    queueLabels();
  }
  // Keep each single label visible while its long bar passes through the viewport.
  function queueLabels() {
    if (labelsQueued) return;
    labelsQueued = true;
    requestAnimationFrame(() => {
      labelsQueued = false;
      for (const label of spanLabels) {
        const bar = label.parentElement.getBoundingClientRect();
        const height = label.getBoundingClientRect().height;
        label.style.top = `${Math.max(10, Math.min(18 - bar.top, bar.height - height - 10))}px`;
      }
    });
  }
  function queueLayout() {
    if (layoutQueued) return;
    layoutQueued = true;
    requestAnimationFrame(layoutMarkers);
  }
  if (typeof ResizeObserver === 'function') {
    const observer = new ResizeObserver(queueLayout);
    years.forEach(year => observer.observe(year));
  }
  years.forEach(year => year.addEventListener('toggle', queueLayout));
  window.addEventListener('resize', queueLayout);
  window.addEventListener('scroll', queueLabels, {passive: true});
  document.querySelector('.timeline-viewport').addEventListener('scroll', queueLabels, {passive: true});
  document.fonts?.ready.then(queueLayout);

  status.tabIndex = -1;
  document.querySelector('.year-controls').hidden = false;
  document.querySelectorAll('[data-years]').forEach(button => button.addEventListener('click', () => {
    years.forEach(year => { year.open = button.dataset.years === 'show'; });
    queueLayout();
  }));
  document.querySelectorAll('[data-event]').forEach(button => {
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => select('event', button.dataset.event, true));
  });
  document.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (link.dataset.story) {
      select('story', link.dataset.story);
      if (canModal) {
        event.preventDefault();
        openMovie(link.dataset.story, link);
      }
    } else if (link.dataset.eventLink) {
      if (canModal && modal.open) modal.close();
      reveal(`event-${link.dataset.eventLink}`);
      select(link.dataset.markerStory ? 'story' : 'event', link.dataset.markerStory || link.dataset.eventLink);
      queueLayout();
    } else if (link.dataset.year) {
      if (canModal && modal.open) modal.close();
      if (link.dataset.coverageStory) select('story', link.dataset.coverageStory);
      reveal(`year-${link.dataset.year}`);
      queueLayout();
    }
  });
  function revealHash() {
    try {
      const id = decodeURIComponent(location.hash.slice(1));
      if (id.startsWith('story-') && canModal && cards.has(id.slice(6))) {
        select('story', id.slice(6));
        if (activeMovie?.card.dataset.card !== id.slice(6)) openMovie(id.slice(6), null);
      } else reveal(id);
      queueLayout();
    } catch (_) { /* Ignore malformed fragment URLs. */ }
  }
  window.addEventListener('hashchange', revealHash);
  revealHash();
})();
