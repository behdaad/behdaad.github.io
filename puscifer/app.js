(() => {
  'use strict';
  const key = 'puscifer-field-guide:v1';
  const entries = [...document.querySelectorAll('.entry')];
  const ids = new Set(entries.map(entry => entry.dataset.id));
  const byId = id => document.getElementById(id);
  const search = byId('search');
  const kind = byId('kind');
  const character = byId('character');
  const hideDone = byId('hide-done');
  const radios = [...document.querySelectorAll('[name="route"]')];
  const warning = byId('storage-warning');
  let completed = {};
  let storageAvailable = true;
  const notice = text => { warning.textContent = text; warning.hidden = false; };
  const validCompleted = value => value && typeof value === 'object' && !Array.isArray(value) && Object.entries(value).every(([id, checked]) => typeof id === 'string' && typeof checked === 'boolean');
  const sanitize = value => Object.fromEntries(Object.entries(value).filter(([id, checked]) => ids.has(id) && checked));
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!validCompleted(parsed)) throw new Error('Invalid progress data');
      completed = sanitize(parsed);
    }
  } catch (error) {
    notice('Saved progress could not be read. This session starts with an empty log; export any new checkmarks as a backup.');
  }
  const persist = () => {
    try {
      localStorage.setItem(key, JSON.stringify(completed));
      storageAvailable = true;
      byId('storage-note').textContent = 'Saved on this browser · no account needed';
    } catch (error) {
      storageAvailable = false;
      byId('storage-note').textContent = 'Session only · progress could not be saved';
      notice('Browser storage is unavailable. Your checkmarks work for this page session, but will not survive a reload. Use Export to save a backup.');
    }
  };
  // Detect denied writes before the first click without overwriting an unreadable log.
  try { localStorage.setItem(key + ':probe', '1'); localStorage.removeItem(key + ':probe'); }
  catch (error) { storageAvailable = false; byId('storage-note').textContent = 'Session only · browser storage unavailable'; notice('Browser storage is unavailable. Checkmarks last for this page session. Use Export to save a backup.'); }

  function syncCheckboxes() {
    entries.forEach(entry => {
      const checked = !!completed[entry.dataset.id];
      entry.querySelector('input[type="checkbox"]').checked = checked;
      entry.classList.toggle('done', checked);
    });
  }
  function filters() {
    return { route: radios.find(radio => radio.checked).value, query: search.value.trim().toLowerCase(), kind: kind.value, character: character.value };
  }
  function baseMatch(entry, f) {
    return (f.route !== 'essential' || entry.dataset.essential === 'true') &&
      (f.route === 'archive' || entry.dataset.extra !== 'true') &&
      (f.kind === 'all' || entry.dataset.kind === f.kind) &&
      (f.character === 'all' || entry.dataset.characters.split('|').includes(f.character)) &&
      (!f.query || entry.dataset.search.includes(f.query));
  }
  function applyFilters() {
    const f = filters();
    const routeEntries = entries.filter(entry => baseMatch(entry, f));
    const done = routeEntries.filter(entry => completed[entry.dataset.id]).length;
    entries.forEach(entry => { entry.hidden = !baseMatch(entry, f) || (hideDone.checked && !!completed[entry.dataset.id]); });
    document.querySelectorAll('.era').forEach(era => {
      const hasEntries = [...era.querySelectorAll('.entry')].some(entry => !entry.hidden);
      era.hidden = !hasEntries;
      const jump = document.querySelector(`.chapter-nav a[href="#${era.id}"]`);
      jump.hidden = !hasEntries;
    });
    const visible = entries.filter(entry => !entry.hidden);
    byId('empty-state').hidden = visible.length > 0;
    const total = routeEntries.length;
    const percent = total ? Math.round(done / total * 100) : 0;
    byId('progress-text').textContent = `${done} / ${total} consumed${hideDone.checked ? ` · ${visible.length} remaining` : ''}`;
    byId('progress').max = Math.max(total, 1);
    byId('progress').value = done;
    byId('progress-percent').textContent = `${percent}%`;
    byId('resume').disabled = !visible.some(entry => !completed[entry.dataset.id]);
  }
  function clearFilters() {
    search.value = ''; kind.value = 'all'; character.value = 'all'; hideDone.checked = false;
    radios.find(radio => radio.value === 'journey').checked = true;
    applyFilters();
  }
  entries.forEach(entry => {
    const checkbox = entry.querySelector('input[type="checkbox"]');
    checkbox.disabled = false;
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) completed[entry.dataset.id] = true;
      else delete completed[entry.dataset.id];
      entry.classList.toggle('done', checkbox.checked);
      persist(); applyFilters();
      // If filtering hides this row, keep keyboard focus on a usable control.
      if (entry.hidden) hideDone.focus({ preventScroll: true });
    });
  });
  document.querySelectorAll('.js-only').forEach(el => { el.hidden = false; });
  search.addEventListener('input', applyFilters);
  [kind, character, hideDone, ...radios].forEach(control => control.addEventListener('change', applyFilters));
  byId('clear-filters').addEventListener('click', clearFilters);
  byId('resume').addEventListener('click', () => {
    const next = entries.find(entry => !entry.hidden && !completed[entry.dataset.id]);
    if (!next) return;
    entries.forEach(entry => entry.classList.remove('just-resumed'));
    next.classList.add('just-resumed');
    next.scrollIntoView({ block: 'start' });
    next.querySelector('input').focus({ preventScroll: true });
  });
  document.querySelectorAll('[data-thread]').forEach(link => link.addEventListener('click', () => {
    clearFilters();
    character.value = link.dataset.thread;
    applyFilters();
  }));
  byId('export-progress').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ guide: 'puscifer-field-guide', version: 1, exportedAt: new Date().toISOString(), completed }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'puscifer-progress.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  byId('import-progress').addEventListener('click', () => byId('import-file').click());
  byId('import-file').addEventListener('change', async event => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      if (file.size > 1000000) throw new Error('File too large');
      const data = JSON.parse(await file.text());
      if (data.guide !== 'puscifer-field-guide' || data.version !== 1 || !validCompleted(data.completed)) throw new Error('Wrong file format');
      // Merge imports so an older backup never silently unchecks new progress.
      completed = { ...completed, ...sanitize(data.completed) };
      syncCheckboxes(); persist(); applyFilters();
      if (storageAvailable) notice('Progress imported and merged with your current checkmarks.');
    } catch (error) {
      notice('This file could not be imported. Choose a Puscifer progress JSON backup exported by this guide. Your existing checkmarks are unchanged.');
    }
    event.target.value = '';
  });
  const dialog = byId('reset-dialog');
  byId('reset-progress').addEventListener('click', () => dialog.showModal());
  dialog.querySelector('button[value="reset"]').addEventListener('click', () => {
    completed = {}; syncCheckboxes(); persist(); applyFilters();
    if (storageAvailable) notice('Progress reset in this browser.');
  });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    try {
      const parsed = event.newValue ? JSON.parse(event.newValue) : {};
      if (!validCompleted(parsed)) return;
      completed = sanitize(parsed); syncCheckboxes(); applyFilters();
    } catch (error) { /* Leave this tab's progress intact if another tab writes invalid data. */ }
  });
  syncCheckboxes(); applyFilters();
  // Deep links remain usable when a bookmarked entry belongs to archive extras.
  const target = document.getElementById(location.hash.slice(1));
  if (target?.classList.contains('entry') && target.hidden) {
    radios.find(radio => radio.value === 'archive').checked = true;
    applyFilters(); target.scrollIntoView();
  }
})();
