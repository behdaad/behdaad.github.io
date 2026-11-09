import { sources } from './rules.mjs';
import { SAVE_KEY, defaults, readSave, icons, goals, roles, slug, spacesFor, findSpaces, rulesFor, turnSteps, strength } from './guide.mjs';

const $ = selector => document.querySelector(selector);
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let profile = defaults(), blockedSave = false;
let board = { query: '', selectedIcons: [], goal: 'Anything', combat: false };
let rules = { query: '', category: 'All', saved: false };
const sourceLink = (source, page, label) => `<a class="source-link" href="${sources[source].url}#page=${page}" target="_blank" rel="noopener noreferrer">${esc(label || `${source === 'main' ? 'Rulebook' : source === 'faq' ? 'FAQ' : 'Supplement'} · p. ${page}`)} <span aria-hidden="true">↗</span></a>`;
const ruleLink = (title, label = 'Read the rule') => `<a class="inline-link" href="#rules/${slug(title)}">${esc(label)} <span aria-hidden="true">↗</span></a>`;
const announce = text => { $('#announcement').textContent = text; };
function storageNotice(text, reset = false) {
  $('#storage-notice').hidden = false;
  $('#storage-notice').innerHTML = `${esc(text)}${reset ? ' <button data-action="reset-save">Reset this guide’s saved data</button>' : ''}`;
}
try { profile = readSave(localStorage.getItem(SAVE_KEY)); }
catch { blockedSave = true; storageNotice('Your saved guide could not be read. You can still browse; the existing save is preserved.', true); }
function save() {
  if (blockedSave) return;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(profile)); }
  catch { storageNotice('This browser cannot save your guide. It will work for this visit, but progress may be lost when you leave.'); }
}
function modeLabel() { return `${profile.count === 1 ? 'Solo' : `${profile.count} players`}${profile.choam ? ' · CHOAM' : ''}`; }
function heading(kicker, title, description) {
  return `<div class="page-heading"><p class="eyebrow">${kicker}</p><h1>${title}</h1><p class="lede">${description}</p></div>`;
}
function render() {
  const parts = location.hash.slice(1).split('/');
  const view = ['turn', 'board', 'rules'].includes(parts[0]) ? parts[0] : 'turn';
  document.body.dataset.view = view;
  $('#profile-label').textContent = profile.name || 'Your guide';
  document.querySelectorAll('[data-view]').forEach(a => {
    if (a.dataset.view === view) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  if (view === 'turn') renderTurn();
  else if (view === 'board') renderBoard();
  else renderRules(parts[1]);
}
function focusMain() { $('#main').focus({ preventScroll: true }); window.scrollTo(0, 0); }
function go(view) { if (location.hash === `#${view}`) { render(); focusMain(); } else location.hash = view; }

function renderTurn() {
  const turn = profile.turn;
  if (['agent', 'reveal'].includes(turn.type)) return renderWalkthrough();
  const waiting = turn.type === 'waiting';
  $('#main').innerHTML = `<section class="hero ${waiting ? 'waiting-hero' : ''}">
    <div class="hero-art" aria-hidden="true"><div class="sun"></div><div class="orbit"></div><div class="dune dune-one"></div><div class="dune dune-two"></div><span>ARRAKIS / FIELD NOTES</span></div>
    <div class="hero-content"><p class="eyebrow">THE PLAYER’S FIELD GUIDE <span class="edition-tag">${modeLabel()}</span></p>
    <h1>${waiting ? 'A moment<br>to plan.' : 'Your move.<br><em>Make it count.</em>'}</h1>
    <p>${waiting ? (turn.revealed ? 'You’ve Revealed. Keep an eye on the Conflict while the table finishes its turns.' : 'Your turn is done. A little preparation goes a long way.') : `${profile.name ? `${esc(profile.name)}, t` : 'T'}ake your next turn with confidence. Your options, the order of play, and the rules that matter.`}</p></div>
  </section>
  <section class="turn-layout">
    <div><div class="section-label"><span>${waiting ? 'BETWEEN TURNS' : 'WHEN IT COMES TO YOU'}</span><span>${waiting ? 'PLAN AHEAD' : '01 / YOUR DECISION'}</span></div>
    ${waiting ? `<div class="waiting-card"><span class="small-symbol" aria-hidden="true">${turn.revealed ? '◒' : '↻'}</span><h2>${turn.revealed ? 'Stay ready for Combat.' : 'Look one move ahead.'}</h2><p>${turn.revealed ? 'Combat Intrigue comes after everyone has Revealed. Your agents stay in place until Recall.' : 'Check the next space you want, what it costs, and whether you need a backup if another player gets there first.'}</p>
      <button class="primary-button" data-action="${turn.revealed ? 'next-round' : 'next-turn'}">${turn.revealed ? 'Start my next round' : 'It’s my turn again'} <span aria-hidden="true">→</span></button>
      ${turn.revealed ? '<button class="quiet-button" data-action="undo-reveal">Marked Reveal by mistake? Undo</button>' : '<button class="quiet-button" data-action="reveal">I still need to Reveal →</button>'}</div>` : `
      <button class="choice-card agent-choice" data-action="agent"><span class="choice-icon" aria-hidden="true">↟</span><span><span class="eyebrow">I HAVE AN AVAILABLE AGENT</span><strong>Take an Agent turn</strong><span>Play a card. Visit a space. Resolve its effects.</span></span><span class="arrow" aria-hidden="true">↗</span></button>
      <button class="choice-card" data-action="reveal"><span class="choice-icon" aria-hidden="true">▱</span><span><span class="eyebrow">I’M READY TO FINISH THE ROUND</span><strong>Take a Reveal turn</strong><span>Use your remaining cards and buy new ones.</span></span><span class="arrow" aria-hidden="true">↗</span></button>
      <p class="small-note">No agents left? You must Reveal. You can also Reveal early, but cannot take another Agent turn this round. ${sourceLink('main', 8)}</p>`}
    </div>
    <aside class="pocket-note"><div class="section-label"><span>${waiting ? 'KEEP IN MIND' : 'BEFORE YOU COMMIT'}</span><span aria-hidden="true">✳</span></div><h2>${waiting ? 'Read the table.' : 'One card. Two possibilities.'}</h2><p>${waiting ? 'Watch the market, open spaces and opponents’ combat strength. Keep your plan flexible until your next turn.' : 'Sending an agent uses a card’s Agent box. Saving it for Reveal uses its Reveal box. You don’t get both.'}</p>${ruleLink(waiting ? 'When to play Combat Intrigue' : 'Reading your card', waiting ? 'Combat timing' : 'How to read a card')}<div class="note-divider"></div><p class="mini-label">${profile.count === 6 ? esc(roles[profile.role]) : 'MAKE IT YOURS'}</p><p class="small-note">${profile.count === 6 ? 'Guidance and board spaces adapt to your team and role.' : 'Set your player count and CHOAM option. Each player keeps their own guide.'}</p><button class="text-button" data-action="profile">Adjust my guide <span aria-hidden="true">↗</span></button></aside>
  </section>
  <section class="quick-section"><div class="section-label"><span>${waiting ? 'WHILE YOU WAIT' : 'KEEP THESE CLOSE'}</span><span>02 / QUICK REFERENCE</span></div><div class="quick-grid">
    <a href="#board" class="quick-card"><span class="quick-number">01</span><h2>Find your next space <span aria-hidden="true">↗</span></h2><p>Start with a card icon or something you need.</p></a>
    <a href="#rules/spies-access-infiltration-and-intelligence" class="quick-card"><span class="quick-number">02</span><h2>Make use of your Spies <span aria-hidden="true">↗</span></h2><p>Get access, infiltrate, or gather intelligence.</p></a>
    <a href="#rules" class="quick-card"><span class="quick-number">03</span><h2>Settle a rules question <span aria-hidden="true">↗</span></h2><p>Short answers, with the official page a tap away.</p></a>
  </div></section>`;
}

function renderWalkthrough() {
  const turn = profile.turn, steps = turnSteps(turn.type, profile);
  turn.step = Math.min(turn.step, steps.length - 1);
  const s = steps[turn.step], last = turn.step === steps.length - 1;
  const chosen = spacesFor(profile).find(b => b.name === turn.space);
  $('#main').innerHTML = `<div class="walkthrough"><div class="walk-top"><button class="text-button" data-action="choose">← Change turn</button><span class="mini-label">${modeLabel()}</span></div>
    <div class="walk-heading"><p class="eyebrow">${turn.type === 'agent' ? 'AGENT' : 'REVEAL'} TURN</p><span class="step-count">${String(turn.step + 1).padStart(2, '0')}<span> / ${String(steps.length).padStart(2, '0')}</span></span></div>
    <div class="step-bars" aria-label="Step ${turn.step + 1} of ${steps.length}">${steps.map((_, i) => `<span class="${i <= turn.step ? 'active' : ''}"></span>`).join('')}</div>
    <section class="step-card"><h1>${s.title}</h1><p class="step-copy">${esc(s.text)}</p>
      ${turn.type === 'agent' && chosen ? `<aside class="selected-space"><span class="eyebrow">YOUR CHOSEN SPACE · ${esc(chosen.icon)}</span><h2>${esc(chosen.name)}${chosen.combat ? '<span class="combat-tag">Combat</span>' : ''}</h2><p><strong>${esc(chosen.cost)}</strong></p><p>${esc(chosen.effect)}</p>${sourceLink('supplement', chosen.page)} <a class="inline-link" href="#board">Change space ↗</a></aside>` : ''}
      ${s.board ? '<a class="secondary-button" href="#board">Explore board spaces <span aria-hidden="true">↗</span></a>' : ''}
      ${s.calculator ? calculator(s.calculator) : ''}
      <div class="step-sources">${sourceLink(s.source, s.page)}${s.also ? sourceLink('main', s.also) : ''}${s.topic ? ruleLink(s.topic) : ''}</div>
    </section><div class="step-actions"><button class="secondary-button" data-action="previous" ${turn.step === 0 ? 'disabled' : ''}>← Back</button><button class="primary-button" data-action="advance">${last ? (turn.type === 'reveal' ? 'Finish my Reveal' : 'Finish my turn') : 'Done · next step'} <span aria-hidden="true">→</span></button></div>
    <p class="small-note centered">Follow along as you play. The physical cards and board are the game state.</p></div>`;
}
function calculator(type) {
  const fields = type === 'combat' ? [['troops', 'Troops', 0], ['worms', 'Sandworms', 0], ['swords', 'Total swords', 0]] : [['cards', 'From cards', 0], ['other', 'Other bonuses', 0]];
  return `<details class="calculator"><summary>${type === 'combat' ? 'Check my combat strength' : 'Add up my Persuasion'} <span aria-hidden="true">＋</span></summary><div class="calculator-body" data-calculator="${type}"><p class="small-note">Scratchpad only. Enter the current ${type === 'combat' ? 'units and total swords for this player, including any bonuses.' : 'card values and bonuses; spending is handled at the table.'}</p><div class="number-fields">${fields.map(([id, label, value]) => `<label>${label}<input type="number" inputmode="numeric" min="0" max="999" value="${value}" data-number="${id}" aria-label="${label}"></label>`).join('')}</div>${type === 'persuasion' ? '<label class="check-label"><input type="checkbox" data-number="council"> High Council seat (+2)</label><label class="check-label"><input type="checkbox" data-number="assembly"> My agent is at Assembly Hall (+1)</label>' : ''}<output class="calculator-total" aria-live="polite">0 <span>${type === 'combat' ? 'strength · no units in the Conflict' : 'Persuasion'}</span></output></div></details>`;
}

function renderBoard() {
  $('#main').innerHTML = `${heading('THE BOARD / YOUR OPTIONS', 'Find your next move.', 'A shortlist starts with your card. Check the table before you commit.')}
    <section class="finder"><div class="filter-panel"><label class="search-label" for="space-search">Search board spaces</label><div class="search-box"><span aria-hidden="true">⌕</span><input type="search" id="space-search" placeholder="A space, resource or effect…" value="${esc(board.query)}" autocomplete="off"></div>
    <fieldset><legend>Which Agent icons are on your card? <span>Choose any · optional</span></legend><div class="chips" id="icon-filters">${icons.map((icon, i) => `<button class="chip icon-chip icon-${i}" data-icon="${icon}" aria-pressed="${board.selectedIcons.includes(icon)}"><span class="icon-mark" aria-hidden="true">${['♜', '◎', '✳', '◇', '▥', '⌂', '✦', '◉'][i]}</span>${icon}</button>`).join('')}</div></fieldset>
    <div class="goal-row"><label for="space-goal">I’m looking for<select id="space-goal">${goals.map(g => `<option ${g === board.goal ? 'selected' : ''}>${g}</option>`).join('')}</select></label><label class="check-label"><input type="checkbox" id="combat-only" ${board.combat ? 'checked' : ''}> Combat spaces</label></div>
    <button class="text-button" data-action="clear-board">Clear filters ↺</button></div>
    <div class="board-results-wrap"><div class="result-heading"><p id="space-count" role="status"></p><span class="mini-label">${modeLabel()}</span></div><p class="filter-context" id="space-context"></p><div id="space-results" class="space-results"></div></div></section>`;
  updateSpaces();
}
function updateSpaces() {
  const list = findSpaces(profile, board);
  $('#space-count').textContent = `${list.length} ${list.length === 1 ? 'space' : 'spaces'} to consider`;
  $('#space-context').textContent = (board.selectedIcons.includes('Spy') ? 'Spy access depends on your actual observation posts. Only spaces connected to one of your Spies qualify; still check costs and occupancy.' : 'Match a card icon, pay the cost, meet requirements and check occupancy. Card and Leader exceptions can change your options.') + (profile.count === 6 ? ' Emperor and Fremen icons also represent Great Houses and Fringe Worlds. Personal spaces are shown only for their Commander; Commanders use their Allies’ higher main-board Influence for requirements.' : '');
  $('#space-results').innerHTML = list.length ? list.map(s => `<details class="space-card"><summary><span><span class="space-icon-label">${esc(s.icon)}${s.personal ? ' · Personal board' : ''}</span><strong>${esc(s.name)}</strong><span class="space-cost">${esc(s.cost)}</span></span><span class="space-right">${s.combat ? '<span class="combat-tag">Combat</span>' : ''}<span class="expand-icon" aria-hidden="true">＋</span></span></summary><div class="space-body"><p>${esc(s.effect)}</p>${s.name === 'High Council' ? '<p class="small-note">The spice, Intrigue and troops option is available only after you have a Council seat.</p>' : ''}${s.combat ? '<p class="small-note">Combat space: you may deploy troops recruited this turn plus up to two from your garrison.</p>' : ''}<div class="space-bottom">${sourceLink('supplement', s.page)}${profile.count === 6 && s.name === 'Sietch Tabr' ? sourceLink('supplement', 9, 'Team hooks · p. 9') : ''}${profile.turn.revealed ? '<span class="small-note">Plan for next round; you have Revealed.</span>' : `<button class="text-button" data-space="${esc(s.name)}">Use in my Agent guide →</button>`}</div></div></details>`).join('') : '<div class="empty-state"><h2>No spaces match.</h2><p>Try a different goal or clear an icon filter. Special card effects may give you other options.</p><button class="secondary-button" data-action="clear-board">Clear filters</button></div>';
}

function renderRules(openId) {
  if (openId) rules = { query: '', category: 'All', saved: false };
  const categories = ['All', ...new Set(rulesFor(profile).map(t => t.category))];
  $('#main').innerHTML = `${heading('BETWEEN TURNS / THE REFERENCE', 'A little knowledge.<br>A better next turn.', 'Find a rule, save a reminder, or open the official page for the full explanation.')}
    <div class="rule-toolbar"><label class="search-label" for="rule-search">Search the rules</label><div class="search-box"><span aria-hidden="true">⌕</span><input type="search" id="rule-search" placeholder="Try “sandworms”, “ties” or “Intrigue”…" value="${esc(rules.query)}" autocomplete="off"></div>
    <div class="chips rule-chips">${categories.map(c => `<button class="chip" data-category="${c}" aria-pressed="${rules.category === c}">${c}</button>`).join('')}<button class="chip saved-filter" data-action="saved" aria-pressed="${rules.saved}">☆ Saved</button></div></div>
    <div class="reference-layout"><section><div class="result-heading"><p id="rule-count" role="status"></p><button class="text-button" data-action="clear-rules">Clear filters ↺</button></div><div id="rule-results"></div></section>
    <aside class="source-panel"><p class="eyebrow">GO TO THE SOURCE</p><h2>The official rulebooks.</h2><p>These notes cover base Uprising, CHOAM, Rivals and six-player teams. For other expansions or mixed decks, use the publisher’s rules.</p>${Object.entries(sources).map(([id, s]) => sourceLink(id, 1, s.label)).join('')}<a class="source-link" href="https://www.direwolfdigital.com/dune-imperium/resources/" target="_blank" rel="noopener noreferrer">Publisher resources ↗</a><p class="small-note">Page links use PDF page numbers. Your phone’s PDF viewer may open at the beginning; use the page number shown. Main rules and supplements: October 2023. FAQ: January 2025. Printed card text and official rulings take precedence.</p></aside></div>`;
  updateRules(openId);
}
function updateRules(openId) {
  const terms = rules.query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const list = rulesFor(profile).filter(t => (rules.category === 'All' || t.category === rules.category) && (!rules.saved || profile.bookmarks.includes(t.id)) && terms.every(term => `${t.title} ${t.text} ${t.category}`.toLowerCase().includes(term)));
  $('#rule-count').textContent = `${list.length} ${rules.saved ? 'saved ' : ''}${list.length === 1 ? 'topic' : 'topics'}`;
  $('#rule-results').innerHTML = list.length ? list.map(t => `<details class="rule-card" id="rule-${t.id}" ${openId === t.id ? 'open' : ''}><summary><span><span class="space-icon-label">${esc(t.category)}${t.source === 'faq' ? ' · Publisher FAQ' : ''}</span><strong>${esc(t.title)}</strong></span><span class="expand-icon" aria-hidden="true">＋</span></summary><div class="rule-body"><p>${esc(t.text)}</p><div class="space-bottom">${sourceLink(t.source, t.page)}<button class="bookmark-button" data-bookmark="${t.id}" aria-pressed="${profile.bookmarks.includes(t.id)}">${profile.bookmarks.includes(t.id) ? '★ Saved' : '☆ Save rule'}</button></div></div></details>`).join('') : `<div class="empty-state"><h2>${rules.saved ? 'Keep a useful rule here.' : 'No matching rules.'}</h2><p>${rules.saved ? 'Open any topic and tap “Save rule”. Your bookmarks stay on this phone.' : 'Try a shorter phrase, another term, or clear the filters.'}</p><button class="secondary-button" data-action="clear-rules">Browse all rules</button></div>`;
  if (openId) {
    const target = document.getElementById(`rule-${openId}`);
    if (target) requestAnimationFrame(() => {
      target.querySelector('summary').focus({ preventScroll: true });
      target.scrollIntoView({ block: 'start' });
    });
  }
}

function openProfile() {
  const dialog = $('#profile-dialog');
  dialog.innerHTML = `<div class="dialog-head"><p class="eyebrow">YOUR SIDE OF THE TABLE</p><button class="close-button" data-action="close-profile" aria-label="Close settings">×</button></div><h2 id="profile-title">Make this guide yours.</h2><p class="small-note">One phone, one guide. Preferences, bookmarks and your place in a turn are saved in this browser.</p>
    <form id="profile-form"><label>Your name <span class="optional">optional</span><input name="name" maxlength="40" autocomplete="given-name" value="${esc(profile.name)}" placeholder="What should we call you?"></label>
    <label>Players at the table<select name="count" id="player-count">${[1, 2, 3, 4, 6].map(n => `<option value="${n}" ${n === profile.count ? 'selected' : ''}>${n === 1 ? '1 · Solo with Rivals' : n === 2 ? '2 · With a Rival' : n === 6 ? '6 · Teams' : `${n} players`}</option>`).join('')}</select></label>
    <label id="role-label" ${profile.count !== 6 ? 'hidden' : ''}>Your six-player role<select name="role">${Object.entries(roles).map(([id, label]) => `<option value="${id}" ${id === profile.role ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
    <label class="check-label"><input type="checkbox" name="choam" ${profile.choam ? 'checked' : ''} ${profile.count === 6 ? 'disabled' : ''}> Play with CHOAM contracts</label><p id="choam-help" class="small-note">${profile.count === 6 ? 'CHOAM is required for six-player games.' : 'Match the option your table is playing.'}</p>
    <p class="small-note">Changing the game mode restarts the turn guide. Bookmarks are kept.</p><button class="primary-button" type="submit">Save my preferences →</button></form>
    <div class="dialog-footer"><button class="text-button" data-action="new-game">Start a new game guide ↺</button><p class="small-note">Restarts turn progress; keeps your preferences and saved rules. The shared table companion has its own separate save.</p></div>`;
  dialog.showModal();
}

document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  const action = button.dataset.action;
  if (button.id === 'profile-open' || action === 'profile') return openProfile();
  if (action === 'close-profile') return $('#profile-dialog').close();
  if (button.dataset.icon) {
    const icon = button.dataset.icon;
    board.selectedIcons = board.selectedIcons.includes(icon) ? board.selectedIcons.filter(x => x !== icon) : [...board.selectedIcons, icon];
    button.setAttribute('aria-pressed', String(board.selectedIcons.includes(icon))); updateSpaces(); return;
  }
  if (button.dataset.category) {
    rules.category = button.dataset.category;
    document.querySelectorAll('[data-category]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.category === rules.category)));
    updateRules(); return;
  }
  if (button.dataset.bookmark) {
    const id = button.dataset.bookmark, exists = profile.bookmarks.includes(id);
    profile.bookmarks = exists ? profile.bookmarks.filter(x => x !== id) : [...profile.bookmarks, id];
    save(); button.setAttribute('aria-pressed', String(!exists)); button.textContent = exists ? '☆ Save rule' : '★ Saved';
    announce(exists ? 'Rule removed from saved rules.' : 'Rule saved on this phone.');
    if (rules.saved && exists) { updateRules(); $('[data-action="saved"]').focus(); }
    return;
  }
  if (button.dataset.space) {
    if (profile.turn.revealed) return;
    profile.turn = { type: 'agent', step: 0, revealed: false, space: button.dataset.space }; save(); go('turn'); return;
  }
  if (action === 'clear-board') { board = { query: '', selectedIcons: [], goal: 'Anything', combat: false }; renderBoard(); $('#space-search').focus(); return; }
  if (action === 'clear-rules') { rules = { query: '', category: 'All', saved: false }; renderRules(); $('#rule-search').focus(); return; }
  if (action === 'saved') { rules.saved = !rules.saved; button.setAttribute('aria-pressed', String(rules.saved)); updateRules(); return; }
  if (action === 'reset-save') {
    blockedSave = false; profile = defaults(); $('#storage-notice').hidden = true; save(); render(); return;
  }
  if (['agent', 'reveal'].includes(action)) { if (profile.turn.revealed) return; profile.turn.type = action; profile.turn.step = 0; }
  else if (['choose', 'next-turn', 'next-round', 'undo-reveal', 'new-game'].includes(action)) {
    profile.turn = defaults().turn;
    if (action === 'new-game') $('#profile-dialog').close();
  } else if (action === 'previous') profile.turn.step = Math.max(0, profile.turn.step - 1);
  else if (action === 'advance') {
    const last = turnSteps(profile.turn.type, profile).length - 1;
    if (profile.turn.step < last) profile.turn.step++;
    else { profile.turn.revealed = profile.turn.type === 'reveal'; profile.turn.type = 'waiting'; }
  } else return;
  save(); go('turn');
});

document.addEventListener('input', event => {
  const input = event.target;
  if (input.id === 'space-search') { board.query = input.value; updateSpaces(); }
  if (input.id === 'rule-search') { rules.query = input.value; updateRules(); }
  if (input.dataset.number) {
    const calc = input.closest('[data-calculator]');
    const n = id => Math.min(999, Math.max(0, Math.floor(Number(calc.querySelector(`[data-number="${id}"]`)?.value) || 0)));
    const checked = id => calc.querySelector(`[data-number="${id}"]`)?.checked;
    const value = calc.dataset.calculator === 'combat' ? strength(n('troops'), n('worms'), n('swords')) : n('cards') + n('other') + (checked('council') ? 2 : 0) + (checked('assembly') ? 1 : 0);
    calc.querySelector('output').innerHTML = `${value} <span>${calc.dataset.calculator === 'combat' ? `strength${n('troops') + n('worms') === 0 ? ' · no units in the Conflict' : ''}` : 'Persuasion'}</span>`;
  }
});
document.addEventListener('change', event => {
  if (event.target.id === 'space-goal') { board.goal = event.target.value; updateSpaces(); }
  if (event.target.id === 'combat-only') { board.combat = event.target.checked; updateSpaces(); }
  if (event.target.id === 'player-count') {
    const six = event.target.value === '6';
    $('#role-label').hidden = !six;
    const checkbox = $('#profile-form [name="choam"]'); checkbox.disabled = six; if (six) checkbox.checked = true;
    $('#choam-help').textContent = six ? 'CHOAM is required for six-player games.' : 'Match the option your table is playing.';
  }
});
document.addEventListener('submit', event => {
  if (event.target.id !== 'profile-form') return;
  event.preventDefault();
  const data = new FormData(event.target), count = Number(data.get('count')), role = data.get('role'), choam = count === 6 || data.has('choam');
  if (profile.count !== count || profile.role !== role || profile.choam !== choam) profile.turn = defaults().turn;
  Object.assign(profile, { name: String(data.get('name')).trim().slice(0, 40), count, role, choam });
  save(); $('#profile-dialog').close(); board = { query: '', selectedIcons: [], goal: 'Anything', combat: false }; rules = { query: '', category: 'All', saved: false };
  render(); announce('Your guide preferences are saved.');
});
window.addEventListener('hashchange', () => { if (location.hash === '#main') return; render(); if (!location.hash.startsWith('#rules/')) focusMain(); });
render();
