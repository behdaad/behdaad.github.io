import { SAVE_KEY, emptyGame, setCount, getPlayer, availableAgents, maximumRounds, conflictTier, orderFor, allyFor, agentLabel, eligibleFirstPlayers, standings, shouldEnd, transition, encodeSave, decodeSave, COLORS, PHASES } from './engine.mjs';
import { phaseNames, phaseDescriptions, checklistFor, sourceForPhase, boardSpaces, topics, sources } from './rules.mjs';

const $ = selector => document.querySelector(selector);
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const copy = value => JSON.parse(JSON.stringify(value));
let game = emptyGame(), history = [], damagedSave = null, storageError = '', resumed = false;
const ui = { openPlayers: new Set(), referenceTab: 'spaces', query: '', icon: '' };
try {
  const raw = localStorage.getItem(SAVE_KEY);
  if (raw) {
    try { const saved = decodeSave(raw); game = saved.state; history = saved.history; resumed = game.status !== 'setup'; }
    catch { damagedSave = raw; }
  }
} catch { storageError = 'Browser storage is unavailable. You can play, but changes will not survive a refresh. Download a backup from Game menu.'; }

function toast(message) {
  $('#toast').textContent = message; $('#toast').hidden = false;
  clearTimeout(toast.timer); toast.timer = setTimeout(() => { $('#toast').hidden = true; }, 4500);
}
function save() {
  game.updatedAt = new Date().toISOString();
  try {
    const raw = encodeSave(game, history);
    localStorage.setItem(SAVE_KEY, raw);
    if (localStorage.getItem(SAVE_KEY) !== raw) throw new Error('Write failed');
    storageError = '';
  } catch { storageError = 'Your latest changes are not saved. Browser storage may be blocked or full. Download a backup from Game menu before leaving.'; }
  renderSaveStatus();
}
function renderSaveStatus() {
  $('#save-notice').hidden = !storageError;
  $('#save-notice').innerHTML = storageError ? `<span>${escape(storageError)}</span><button data-action="retry-save">Retry saving</button>` : '';
  $('#save-status').textContent = storageError ? 'Not saved' : damagedSave ? 'Saved game needs attention' : game.updatedAt ? '✓ Saved on this browser' : 'Ready when you are';
}
function act(action, label) {
  try {
    const next = transition(game, action);
    history.push({ state: copy(game), label }); history = history.slice(-30);
    game = next; resumed = false; save(); render(!['SCORE', 'SWORDMASTER', 'RECALL_AGENT'].includes(action.type));
  } catch (error) { toast(error.message); }
}
function persistChange() { resumed = false; save(); }
function checkedMap() { return game.phase === 'turns' && game.turn ? game.turn.checks : game.checks; }
function allChecked() { return checklistFor(game).every(item => checkedMap()[item.id]); }
const number = n => String(n).padStart(2, '0');
const roleLabel = p => p.kind === 'rival' ? 'Rival' : p.role === 'commander' ? 'Commander' : p.role === 'ally' ? 'Ally' : 'Player';
const teamLabel = p => p.team === 'atreides' ? 'Muad’Dib' : 'Shaddam';
function button(action, text, classes = '', attrs = '') { return `<button type="button" data-action="${action}" class="${classes}" ${attrs}>${text}</button>`; }
function playerOptions(players, selected) { return players.map(p => `<option value="${p.id}" ${p.id === selected ? 'selected' : ''}>${escape(p.name || p.leader || `Seat ${Number(p.id.slice(1)) + 1}`)}${p.kind === 'rival' ? ' · Rival' : ''}</option>`).join(''); }
function render(focus = false) {
  const focused = document.activeElement?.id;
  if (damagedSave !== null) $('#main').innerHTML = renderRecovery();
  else if (game.status === 'setup') $('#main').innerHTML = renderSetup();
  else $('#main').innerHTML = renderGame();
  renderSaveStatus();
  if (focus) {
    const heading = $('#guide-title');
    heading?.focus({ preventScroll: true });
    const rect = heading?.getBoundingClientRect();
    if (rect && (rect.top < 0 || rect.bottom > innerHeight)) heading.scrollIntoView({ block: 'start', behavior: 'instant' });
  } else if (focused && document.getElementById(focused)) document.getElementById(focused).focus({ preventScroll: true });
  if (focus) $('#announcement').textContent = game.status === 'setup' ? 'Game setup' : `Round ${game.round}. ${phaseNames[game.phase]}.${game.activePlayer ? ` ${getPlayer(game, game.activePlayer)?.name}’s turn.` : ''}`;
}

function landscape() {
  return `<div class="desert-art" aria-hidden="true"><svg viewBox="0 0 600 260" fill="none"><circle cx="438" cy="66" r="36"/><path d="M-50 244Q155 5 350 186T680 129M-50 254Q155 25 350 196T680 139M-50 264Q155 45 350 206T680 149M-50 274Q155 65 350 216T680 159M-50 284Q155 85 350 226T680 169M-50 294Q155 105 350 236T680 179M-50 304Q155 125 350 246T680 189M-50 314Q155 145 350 256T680 199M-50 324Q155 165 350 266T680 209"/></svg><span>ARRAKIS · THE DESERT PLANET</span></div>`;
}
function renderSetup() {
  if (game.setupStep === 0) return `<section class="welcome"><div class="welcome-copy"><p class="eyebrow">A FIELD GUIDE FOR YOUR TABLE</p><h1 id="guide-title" tabindex="-1">The spice flows.<br><em>Your turn follows.</em></h1><p class="intro">The board is ready. Gather your people.<br>We’ll take it one turn at a time.</p>${landscape()}<p class="welcome-foot">Learn as you play <span>·</span> Keep your place <span>·</span> Share one screen</p></div><section class="setup-card count-card" aria-labelledby="count-title"><span class="chapter">01 / GATHER THE TABLE</span><h2 id="count-title">How many players?</h2><p>Count the people at the table.<br>We’ll add Rivals when you need them.</p><div class="count-options">${[1, 2, 3, 4, 6].map(n => button('count', `<strong>${n}</strong><span>${n === 1 ? 'SOLO' : n === 6 ? 'TWO TEAMS' : 'PLAYERS'}</span>`, `count-option ${n === 6 ? 'six' : ''}`, `data-count="${n}" aria-label="${n === 1 ? '1 player, solo' : `${n} players`}"`)).join('')}</div><p class="small-note">1–2 players use House Hagal Rivals.<br>6 players form two teams of three.<br>The supplied rules have no five-player mode.</p><div class="save-promise"><span aria-hidden="true">◇</span><span>Automatically saved in this browser.<br>No account. Just your table.</span></div></section></section>`;
  return `<section class="setup-page"><div class="setup-heading"><div><p class="eyebrow">${game.humanCount === 6 ? 'TWO TEAMS. ONE IMPERIUM.' : 'MAKE YOURSELF AT HOME'}</p><h1 id="guide-title" tabindex="-1">${game.setupStep === 1 ? 'Who’s at the table?' : 'A moment before we begin.'}</h1></div><div class="setup-progress" aria-label="Setup progress"><span class="done">01 Players</span><span class="${game.setupStep === 1 ? 'current' : 'done'}">02 Your table</span><span class="${game.setupStep === 2 ? 'current' : ''}">03 Ready</span></div></div>${game.setupStep === 1 ? renderTableSetup() : `<div class="setup-grid"><section class="guide-card"><p class="section-kicker">BOARD READY CHECK</p><h2>Match the guide to your board.</h2><p class="muted">A short check, since you’ve already set everything up.</p>${renderChecklist()}<div class="guide-actions">${button('setup-back', '← Your table', 'text-button')}${button('start', 'Begin round one <span aria-hidden="true">→</span>', 'primary', !allChecked() ? 'disabled' : '')}</div></section><aside class="setup-aside">${renderSeating()}<p class="small-note">Starting with <strong>${escape(getPlayer(game, game.firstPlayer).name)}</strong>, as indicated by the Objective card.</p></aside></div>`}</section>`;
}

function renderTableSetup() {
  const six = game.humanCount === 6;
  return `<form id="table-form" class="setup-grid"><section class="setup-card"><div class="section-heading"><div><h2>${six ? 'Two teams of three' : 'Names, seats & colors'}</h2><p class="muted">${six ? 'Enter names in the fixed seating positions shown. Allies can choose any compatible Leader.' : 'Enter names clockwise around the board. Leader names are optional.'}</p></div><span class="pill">${game.humanCount} HUMAN${game.humanCount === 1 ? '' : 'S'}</span></div><div class="setup-players">${game.players.map((p, i) => `<div class="setup-player"><div class="seat-index" style="--player-color:${p.color}">${number(i + 1)}</div><div class="player-fields"><div class="seat-heading">${six ? `${p.role === 'commander' ? p.leader : `Team ${teamLabel(p)} · Ally`}` : p.kind === 'rival' ? 'AUTOMATED RIVAL' : `PLAYER ${game.players.slice(0, i + 1).filter(x => x.kind === 'human').length}`}${six ? `<span>${i === 0 ? 'Bottom of board' : i === 3 ? 'Top of board' : 'See seating diagram'}</span>` : ''}</div><div class="name-fields"><label class="sr-only" for="name-${p.id}">Name for seat ${i + 1}</label><input id="name-${p.id}" data-setup-field="name" data-player="${p.id}" value="${escape(p.name)}" maxlength="60" placeholder="${p.kind === 'rival' ? 'Rival name' : 'Player name'}" autocomplete="off" required><label class="sr-only" for="color-${p.id}">Color for seat ${i + 1}</label><select id="color-${p.id}" data-setup-field="color" data-player="${p.id}" aria-label="Color for seat ${i + 1}">${COLORS.map((c, ci) => `<option value="${c}" ${p.color === c ? 'selected' : ''}>${['Red', 'Blue', 'Yellow', 'Purple', 'Light blue', 'Gray'][ci]}</option>`).join('')}</select></div>${p.role !== 'commander' ? `<label class="sr-only" for="leader-${p.id}">${p.kind === 'rival' ? 'Rival card' : 'Leader'} for seat ${i + 1}</label><input class="leader-field" id="leader-${p.id}" data-setup-field="leader" data-player="${p.id}" value="${escape(p.leader)}" maxlength="80" placeholder="${p.kind === 'rival' ? 'Rival card name (optional)' : 'Leader name (optional)'}" autocomplete="off">` : ''}</div></div>`).join('')}</div><div class="guide-actions">${button('change-count', '← Player count', 'text-button')}<button type="submit" class="primary">Check the board <span aria-hidden="true">→</span></button></div><p id="setup-error" class="inline-error" role="alert"></p></section><aside class="setup-aside">${six ? renderSeating() : ''}<section class="settings-card"><h3>The game you’ve set up</h3><label class="field-label" for="first-player">Who has the First Player marker?</label><select id="first-player">${playerOptions(eligibleFirstPlayers(game), game.firstPlayer)}</select><p class="small-note">Use the marker shown on your physical Objective card.</p><label class="toggle-row"><input type="checkbox" id="choam" data-setting="choam" ${game.settings.choam ? 'checked' : ''} ${six ? 'disabled' : ''}><span>CHOAM contracts<small>${six ? 'Required for six players' : 'Turn on if the module is on your table'}</small></span></label>${game.humanCount === 1 ? `<label class="field-label" for="difficulty">Solo difficulty</label><select id="difficulty" data-setting="difficulty">${[['mercenary', 'Mercenary · novice'], ['sardaukar', 'Sardaukar · veteran'], ['mentat', 'Mentat · expert'], ['kwisatz', 'Kwisatz Haderach · expert+']].map(([v, t]) => `<option value="${v}" ${game.settings.difficulty === v ? 'selected' : ''}>${t}</option>`).join('')}</select><p class="small-note">Expert levels enable all three Rival variants. Expert+ also prevents your Swordmaster.</p><label class="toggle-row"><input type="checkbox" data-setting="churn" ${game.settings.churn ? 'checked' : ''}><span>Dice-based Row churn<small>Use two physical six-sided dice</small></span></label>` : ''}${game.humanCount === 2 ? `<label class="toggle-row"><input id="streamlined" type="checkbox" data-setting="streamlined" ${game.settings.streamlined ? 'checked' : ''}><span>Streamlined Rival<small>Lady Amber or the Beast; cannot win</small></span></label>` : ''}${game.humanCount < 3 ? `<details class="variant-settings"><summary>Optional Rival variants</summary>${[['brutal', 'Brutal Escalation'], ['expert', 'Expert Deployment'], ['smart', 'Smart Politics']].map(([key, label]) => `<label class="toggle-row"><input type="checkbox" data-setting="${key}" ${game.settings[key] || (game.humanCount === 1 && ['mentat', 'kwisatz'].includes(game.settings.difficulty)) ? 'checked' : ''} ${game.humanCount === 1 && ['mentat', 'kwisatz'].includes(game.settings.difficulty) ? 'disabled' : ''}><span>${label}</span></label>`).join('')}</details>` : ''}</section><p class="small-note">Base Uprising and its included CHOAM module. Keep expansion components out for this guide.</p></aside></form>`;
}

function renderSeating() {
  const six = game.humanCount === 6;
  return `<section class="seating-card"><p class="section-kicker">${six ? 'CLOCKWISE SEATING' : 'YOUR TABLE'}</p>${six ? `<div class="seat-map"><div class="board-center">DUNE<span>UPRISING</span><i>↻</i></div>${game.players.map((p, i) => `<div class="map-seat seat-${i}" style="--player-color:${p.color}"><b>${number(i + 1)}</b><span>${escape(p.name || (p.role === 'commander' ? p.leader : 'Ally'))}</span><small>${teamLabel(p)}</small></div>`).join('')}</div><p class="small-note">Commanders face each other. Each sits between the opposing team’s Allies.</p>` : `<ol class="seat-list">${orderFor(game).map(id => { const p = getPlayer(game, id); return `<li><i style="--player-color:${p.color}"></i><span>${escape(p.name || 'Unnamed player')}</span><small>${roleLabel(p)}</small></li>`; }).join('')}</ol>`}</section>`;
}

function renderChecklist() {
  const steps = checklistFor(game), checks = checkedMap(), count = steps.filter(s => checks[s.id]).length;
  return `<div class="checklist-head"><span>${count} OF ${steps.length} COMPLETE</span>${button('check-all', count === steps.length ? 'Clear checks' : 'Mark all done', 'text-button')}</div><ol class="checklist">${steps.map(item => {
    const cut = item.text.length > 240 ? item.text.indexOf('. ', 80) : -1;
    const short = cut > -1 ? item.text.slice(0, cut + 1) : item.text;
    const detail = cut > -1 ? item.text.slice(cut + 2) : '';
    return `<li class="${checks[item.id] ? 'checked' : ''}"><label for="check-${item.id}"><input type="checkbox" id="check-${item.id}" data-check="${item.id}" ${checks[item.id] ? 'checked' : ''}><span class="check-copy"><strong>${escape(item.title)}</strong><span>${escape(short)}</span></span></label>${detail ? `<details class="step-detail"><summary>Details & reminders</summary><p>${escape(detail)}</p></details>` : ''}</li>`;
  }).join('')}</ol><p class="rule-source">${sourceForPhase(game)} · Page numbers refer to the PDF pages.</p>`;
}

function renderGame() {
  const p = getPlayer(game, game.activePlayer);
  const phases = game.phase === 'endgame' || game.status === 'finished' ? [...PHASES.filter(x => x !== 'endgame'), 'endgame'] : PHASES.filter(x => x !== 'endgame');
  return `<section class="game-page">${resumed ? `<div class="resume-note"><span><b>Welcome back.</b> Your table is just as you left it.</span>${button('dismiss-resume', 'Continue', 'text-button')}</div>` : ''}<div class="game-heading"><div><p class="eyebrow">${game.humanCount === 6 ? 'TWO TEAMS · SIX PLAYERS' : game.humanCount === 1 ? 'SOLO · TWO RIVALS' : game.humanCount === 2 ? 'TWO PLAYERS · ONE RIVAL' : `${game.humanCount} PLAYERS`}${game.settings.choam ? ' · CHOAM' : ''}</p><h1>Round <span>${number(game.round)}</span><small>/ ${number(maximumRounds(game))}</small></h1></div><div class="round-detail"><span class="conflict-badge">${conflictTier(game)}</span><div>Conflict ${conflictTier(game)}<small>${game.status === 'finished' ? 'Game complete' : `First player: ${escape(getPlayer(game, game.firstPlayer).name)}`}</small></div></div></div><nav class="phase-track" aria-label="Round phases">${phases.map((phase, i) => `<div class="phase-item ${phase === game.phase ? 'active' : PHASES.indexOf(phase) < PHASES.indexOf(game.phase) ? 'past' : ''}" ${phase === game.phase ? 'aria-current="step"' : ''}><span>${number(i + 1)}</span>${phaseNames[phase]}</div>`).join('')}</nav><div class="play-layout"><section class="guide-card ${game.status === 'finished' ? 'finished-card' : ''}">${game.status === 'finished' ? renderFinished() : game.phase === 'turns' ? renderTurn(p) : renderPhase()}</section><aside class="table-rail">${renderRoster()}<div class="rail-tools">${button('reference', 'Explore board spaces <span aria-hidden="true">↗</span>', 'reference-link')}<p>Look up costs, icons and effects without leaving your place.</p><div>${button('undo', '↶ Undo', 'text-button', `id="undo-action" ${history.length ? '' : 'disabled'} aria-label="${escape(history.length ? `Undo ${history.at(-1).label}` : 'Nothing to undo')}"`)}${button('correct', 'Correct game', 'text-button')}</div></div></aside></div></section>`;
}

function renderTurn(p) {
  const t = game.turn;
  return `<div class="turn-heading"><span class="player-mark" style="--player-color:${p.color}">${escape(p.name.slice(0, 1).toUpperCase())}</span><div><p class="section-kicker">${t ? t.type === 'rival' ? 'HOUSE HAGAL TURN' : `${t.type.toUpperCase()} TURN` : 'AT THE TABLE'}</p><h2 id="guide-title" tabindex="-1">${escape(p.name)}${t ? '' : '’s turn'}</h2><p class="muted">${escape(p.leader || (p.role === 'commander' ? 'Commander' : p.kind === 'rival' ? 'Follow the physical House Hagal deck.' : `${availableAgents(p).length} agent${availableAgents(p).length === 1 ? '' : 's'} available · ${p.revealed ? 'Revealed' : 'Choose your next move.'}`))}</p></div></div>${t ? `${t.allyId ? `<div class="activation-banner">Activating <strong>${escape(getPlayer(game, t.allyId).name)}</strong>${t.agentId ? ` · ${escape(agentLabel(game, p, p.agents.find(a => a.id === t.agentId)))}` : ''}</div>` : ''}${renderChecklist()}<div class="guide-actions">${button('cancel-turn', '← Change turn choice', 'text-button')}${button('finish-turn', 'Finish turn <span aria-hidden="true">→</span>', 'primary', !allChecked() ? 'disabled' : '')}</div>` : renderTurnChoices(p)}`;
}

function renderTurnChoices(p) {
  const agents = availableAgents(p), commander = p.role === 'commander';
  return `<div class="turn-options">${p.kind !== 'rival' ? `<p class="turn-intro">You can send an agent to the board, or reveal your remaining cards and finish your turns for this round.</p>` : ''}${agents.length ? `<section class="turn-option agent-option"><span class="option-symbol" aria-hidden="true">△</span><div><h3>${p.kind === 'rival' ? 'Take a Rival turn' : 'Send an agent'}</h3><p>${p.kind === 'rival' ? 'Reveal House Hagal cards until an agent is placed. The Rival never takes a Reveal turn.' : 'Play a card to visit a space, resolve its effects and put your plan in motion.'}</p><div class="agent-choices">${agents.map(a => button('begin-agent', escape(agentLabel(game, p, a)), 'agent-button', `data-agent="${a.id}"`)).join('')}</div>${commander && agents.some(a => a.id === 's') ? `<label class="field-label" for="swordmaster-ally">Ally to activate with Swordmaster</label><select id="swordmaster-ally">${playerOptions(game.players.filter(a => a.team === p.team && a.role === 'ally'), game.players.find(a => a.team === p.team && a.role === 'ally').id)}</select>` : ''}</div></section>` : '<div class="quiet-note">All your agents have been sent. Reveal to finish your round, unless an effect has returned an agent.</div>'}${p.kind !== 'rival' ? `<section class="turn-option reveal-option"><span class="option-symbol" aria-hidden="true">▱</span><div><h3>Reveal your hand</h3><p>Use your remaining cards’ Reveal effects, acquire cards and set your combat strength.${agents.length ? ' Any unused agents stay unused this round.' : ''}</p>${commander ? `<label class="field-label" for="reveal-ally">Ally to activate</label><select id="reveal-ally">${playerOptions(game.players.filter(a => a.team === p.team && a.role === 'ally'), '')}</select>` : ''}${button('begin-reveal', 'Take a Reveal turn <span aria-hidden="true">→</span>', agents.length ? 'secondary' : 'primary')}</div></section>` : ''}</div><div class="turn-footnote"><span aria-hidden="true">✧</span> ${commander ? 'Each arrow activates the Ally on that side. Their Influence, troops and swords receive your support.' : 'Your cards can override the usual rules. Keep them in sight, and check your Leader’s abilities.'}</div>`;
}

function renderPhase() {
  const names = { roundStart: 'Begin player turns', combat: 'Continue to Makers', makers: 'Continue to Recall', recall: shouldEnd(game) ? 'Go to final scoring' : 'Begin the next round', endgame: 'Finish game' };
  return `<p class="section-kicker">${game.phase === 'endgame' ? 'THE FINAL RECKONING' : `PHASE ${number(PHASES.indexOf(game.phase) + 1)}`}</p><h2 id="guide-title" tabindex="-1">${phaseNames[game.phase]}</h2><p class="phase-description">${phaseDescriptions[game.phase]}</p>${game.phase === 'combat' ? `<div class="order-ribbon"><span>TURN ORDER</span>${orderFor(game).map(id => `<b>${escape(getPlayer(game, id).name)}</b>`).join('<i aria-hidden="true">→</i>')}</div>` : ''}${renderChecklist()}${game.phase === 'recall' ? `<label class="deck-check"><input type="checkbox" id="deck-empty" ${game.deckEmpty ? 'checked' : ''}><span>The physical Conflict deck is empty<small>Check only if no unrevealed Conflict cards remain.</small></span></label>${shouldEnd(game) ? '<p class="endgame-notice">Endgame triggered. Finish this check, then resolve final scoring.</p>' : ''}` : ''}${game.phase === 'endgame' ? renderScores() : ''}<div class="guide-actions"><span class="small-note">${game.phase === 'combat' ? 'Resolve combat on the board; record VP in the panel.' : 'Check each step, or mark all done when ready.'}</span>${button('advance', `${names[game.phase]} <span aria-hidden="true">→</span>`, 'primary', !allChecked() ? 'disabled' : '')}</div>`;
}

function renderRoster() {
  return `<section class="roster"><div class="roster-heading"><h2>Your table</h2><span>VICTORY POINTS</span></div>${game.humanCount === 6 ? `<div class="team-totals">${standings(game).map(t => `<div><span>${escape(t.name)}</span><strong>${t.score}</strong></div>`).join('')}</div>` : ''}<div class="roster-players">${orderFor(game).map(id => { const p = getPlayer(game, id); return `<article class="roster-player ${id === game.activePlayer && game.phase === 'turns' ? 'current' : ''}" style="--player-color:${p.color}"><div class="roster-row"><span class="color-dot" aria-hidden="true"></span><div class="roster-name"><strong>${escape(p.name)}</strong><small>${p.kind === 'rival' ? `Rival${game.settings.streamlined ? ' · non-scoring' : ''}` : game.humanCount === 6 ? `${roleLabel(p)} · ${teamLabel(p)}` : p.revealed ? 'Revealed' : `${availableAgents(p).length} agent${availableAgents(p).length === 1 ? '' : 's'} ready`}</small></div><div class="score-control">${button('score', '−', '', `id="minus-${p.id}" data-player="${p.id}" data-delta="-1" aria-label="Remove a point from ${escape(p.name)}" ${p.score <= 0 ? 'disabled' : ''}`)}<output aria-label="${escape(p.name)} score">${p.score}</output>${button('score', '+', '', `id="plus-${p.id}" data-player="${p.id}" data-delta="1" aria-label="Add a point to ${escape(p.name)}" ${p.score >= 99 ? 'disabled' : ''}`)}</div></div><details class="agent-tools" data-player-details="${p.id}" ${ui.openPlayers.has(p.id) ? 'open' : ''}><summary><span class="agent-dots" aria-hidden="true">${p.agents.map(a => `<i class="${a.status}" title="${a.status}"></i>`).join('')}</span><span>Agents & upgrades</span>${p.revealed ? '<span class="revealed-tag">Revealed</span>' : ''}</summary><div class="agent-tool-content">${p.agents.map(a => `<div><span>${escape(agentLabel(game, p, a))}<small>${a.status === 'locked' ? 'Not acquired' : a.status === 'retired' ? 'Retired · bonus kept' : a.status === 'board' ? 'On the board' : 'Available'}${game.humanCount === 6 && a.id === 's' && a.usedThisRound && a.status === 'available' ? ' · retires at Recall' : ''}</small></span>${a.status === 'board' && game.status !== 'finished' ? button('recall-agent', 'Recall', 'small-button', `data-player="${p.id}" data-agent="${a.id}" aria-label="Recall ${escape(agentLabel(game, p, a))} for ${escape(p.name)}"`) : a.status === 'locked' && game.status !== 'finished' && !(game.humanCount === 1 && game.settings.difficulty === 'kwisatz' && p.kind === 'human') ? button('swordmaster', 'Acquired', 'small-button', `data-player="${p.id}" aria-label="${escape(p.name)} acquired Swordmaster"`) : ''}</div>`).join('')}${p.swordmasterBonus ? '<p class="small-note">+2 swords on each Reveal. Keep this bonus.</p>' : ''}<p class="small-note">Record effects after resolving them on the board.</p></div></details></article>`; }).join('')}</div></section>`;
}

function renderScores() {
  const scores = standings(game), tied = scores.filter(p => p.score === scores[0].score);
  return `<div class="final-scores">${scores.map((p, i) => `<div><span>${number(i + 1)}</span><strong>${escape(p.name)}</strong><b>${p.score}<small>VP</small></b></div>`).join('')}</div>${tied.length > 1 ? `<label class="field-label" for="tie-winner">Tiebreak result from the physical resources</label><select id="tie-winner"><option value="">Still tied / not resolved</option>${tied.map(p => `<option value="${p.id}" ${game.winner === p.id ? 'selected' : ''}>${escape(p.name)} wins the tiebreak</option>`).join('')}</select>` : ''}`;
}
function renderFinished() {
  const scores = standings(game), winner = scores.find(p => p.id === game.winner);
  return `<p class="section-kicker">THE SPICE WILL FLOW AGAIN</p><div class="victory-mark" aria-hidden="true">✧</div><h2 id="guide-title" tabindex="-1">${winner ? `${escape(winner.name)} wins.` : 'An Imperium shared.'}</h2><p class="phase-description">${winner ? 'The final scores are in. Until the next conflict.' : 'The highest scores remain tied. Your table has the final word.'}</p>${renderScores()}<p class="small-note">Completed after ${game.round} round${game.round === 1 ? '' : 's'}. This result stays here until you start another game.</p><div class="guide-actions">${button('export', 'Download game', 'secondary')}${button('new-game', 'Set another table <span aria-hidden="true">→</span>', 'primary')}</div>`;
}

function renderRecovery() {
  return `<section class="recovery setup-card"><p class="eyebrow">YOUR SAVE NEEDS ATTENTION</p><h1 id="guide-title" tabindex="-1">Let’s keep your place safe.</h1><p>The saved game is damaged or from an unsupported version. It has not been overwritten.</p><p>Download the existing save before starting fresh, or import a previous backup from Game menu.</p><div class="guide-actions">${button('export', 'Download existing save', 'secondary')}${button('new-game', 'Start a new game', 'primary')}</div></section>`;
}

function openReference() {
  const dialog = $('#reference-dialog');
  dialog.innerHTML = `<div class="dialog-heading"><div><p class="eyebrow">KEEP THE GAME MOVING</p><h2 id="reference-title">The field guide</h2></div>${button('close-dialog', '×', 'close-button', 'aria-label="Close field guide"')}</div><div class="reference-tabs" role="tablist" aria-label="Reference sections"><button role="tab" data-ref-tab="spaces" aria-selected="${ui.referenceTab === 'spaces'}">Board spaces</button><button role="tab" data-ref-tab="rules" aria-selected="${ui.referenceTab === 'rules'}">Rules & reminders</button><button role="tab" data-ref-tab="sources" aria-selected="${ui.referenceTab === 'sources'}">Rulebooks</button></div><div class="reference-filters" ${ui.referenceTab === 'sources' ? 'hidden' : ''}><label class="search-label"><span aria-hidden="true">⌕</span><input id="reference-search" type="search" placeholder="${ui.referenceTab === 'spaces' ? 'Find a space, resource or effect…' : 'Find a rule…'}" aria-label="Search field guide" value="${escape(ui.query)}"></label>${ui.referenceTab === 'spaces' ? `<select id="reference-icon" aria-label="Filter by Agent icon"><option value="">All Agent icons</option>${['Emperor', 'Spacing Guild', 'Bene Gesserit', 'Fremen', 'Landsraad', 'City', 'Spice Trade'].map(i => `<option ${i === ui.icon ? 'selected' : ''}>${i}</option>`).join('')}</select>` : ''}</div><div id="reference-results" class="reference-results" role="tabpanel"></div>`;
  renderReferenceResults();
  if (!dialog.open) dialog.showModal();
}
function renderReferenceResults() {
  const six = game.humanCount === 6, query = ui.query.trim().toLowerCase();
  if (ui.referenceTab === 'sources') {
    $('#reference-results').innerHTML = `<div class="source-intro"><h3>From the rulebooks to your table.</h3><p>This companion uses the October 12, 2023 Uprising rulebooks supplied for this project. Explanations are condensed; printed cards and official rulings take precedence.</p><p>References use PDF page numbers. In the combined supplement, the Board Space Guide is pp. 1–2, Rivals pp. 3–6, and six-player rules pp. 7–14.</p>${Object.values(sources).map(s => `<a class="source-link" href="${s.url}" target="_blank" rel="noopener noreferrer">${s.label} <span>Open PDF ↗</span></a>`).join('')}<a class="source-link" href="https://www.direwolfdigital.com/dune-imperium/resources/" target="_blank" rel="noopener noreferrer">Publisher resources <span>Rules & FAQ ↗</span></a><p class="small-note">An unofficial fan-made companion. Dune and Dune: Imperium — Uprising belong to their respective owners. No affiliation with Dire Wolf, Legendary or Gale Force Nine.</p></div>`;
    return;
  }
  if (ui.referenceTab === 'rules') {
    const found = topics.filter(t => (!t.sixOnly || six) && (!t.rivalOnly || game.humanCount === null || game.humanCount < 3) && `${t.title} ${t.text}`.toLowerCase().includes(query));
    $('#reference-results').innerHTML = `<p class="reference-count">${found.length} REMINDERS</p>${found.map(t => `<details class="rule-topic" ${query ? 'open' : ''}><summary>${escape(t.title)}</summary><p>${escape(t.text)}</p><a class="rule-source" href="${sources[t.source].url}#page=${t.page}" target="_blank" rel="noopener noreferrer">${sources[t.source].label} · PDF p. ${t.page} ↗</a></details>`).join('') || '<p class="empty-result">No matching rules. Try “spies”, “combat” or “cards”.</p>'}`;
    return;
  }
  const found = boardSpaces.filter(b => (!b.sixOnly || six) && (!b.standardOnly || !six) && (!ui.icon || b.icon === ui.icon) && `${b.name} ${b.cost} ${b.effect} ${b.icon}`.toLowerCase().includes(query));
  $('#reference-results').innerHTML = `<p class="reference-note">${six ? 'Six-player board. Emperor icons generally refer to Great Houses; Fremen icons to Fringe Worlds. Commanders may use their own corresponding faction. Personal-board spaces are Commander-only.' : 'Standard board. Choose a space your card can reach, then check the physical board for costs and occupancy.'} A Spy icon can access a space connected to your Spy. This guide does not check your hand or resources.</p><p class="reference-count">${found.length} SPACES</p><div class="space-grid">${found.map(b => `<article class="space-card"><div class="space-tags"><span>${b.icon}</span>${b.combat ? '<span class="combat-tag">⚔ Combat</span>' : ''}</div><h3>${b.name}</h3><p class="space-cost">${escape(six && b.sixCost ? b.sixCost : six ? b.cost.replace('Emperor Influence', 'Great Houses / Emperor Influence').replace('Fremen Influence', 'Fringe Worlds / Fremen Influence') : b.cost)}</p><p>${escape(six && b.sixEffect ? b.sixEffect : b.effect)}</p>${six && b.owner ? `<p class="personal-space">Personal board · ${b.owner.replace(' (six players)', '')} only</p>` : ''}<a class="rule-source" href="${sources.supplement.url}#page=${b.sixOnly || (six && b.name === 'Swordmaster') ? 14 : ['Accept Contract', 'Arrakeen', 'Assembly Hall', 'Deep Desert', 'Deliver Supplies', 'Desert Tactics', 'Dutiful Service', 'Espionage', 'Fremkit', 'Gather Support'].includes(b.name) ? 1 : 2}" target="_blank" rel="noopener noreferrer">Board Space Guide ↗</a></article>`).join('')}</div>${found.length ? '' : '<p class="empty-result">No matching spaces. Try another icon or search term.</p>'}`;
}

function openMenu() {
  const dialog = $('#menu-dialog');
  dialog.innerHTML = `<div class="dialog-heading"><div><p class="eyebrow">YOUR TABLE, YOUR PACE</p><h2 id="menu-title">Game menu</h2></div>${button('close-dialog', '×', 'close-button', 'aria-label="Close game menu"')}</div><div class="menu-body"><p>One game is saved on this browser. Refreshing keeps your place; clearing browser data removes it.</p><div class="menu-options">${button('export', 'Download a backup <span>Keep a copy of this game as a JSON file.</span>', 'menu-option')}<label class="menu-option file-option">Import a backup<span>Restore a game previously saved by this companion.</span><input id="import-file" type="file" accept="application/json,.json"></label>${game.status !== 'setup' && !damagedSave ? button('correct', 'Correct game state <span>Fix the round, turn, scores or agents to match the board.</span>', 'menu-option') : ''}${button('new-game', 'Start a new game <span>Replace the current game after confirmation.</span>', 'menu-option danger')}</div><p class="small-note">Supported: base Uprising, CHOAM, solo/two-player Rivals and the six-player team game.</p></div>`;
  if (!dialog.open) dialog.showModal();
}
function openCorrections() {
  $('#menu-dialog').close();
  const dialog = $('#correction-dialog');
  dialog.innerHTML = `<div class="dialog-heading"><div><p class="eyebrow">MATCH THE PHYSICAL BOARD</p><h2 id="correction-title">Correct the game</h2></div>${button('close-dialog', '×', 'close-button', 'aria-label="Close corrections"')}</div><form id="correction-form"><p class="muted">These changes replace the current step and clear its checks. You can undo them.</p><div class="correction-fields"><label>Round<input type="number" name="round" min="1" max="${maximumRounds(game)}" value="${game.round}" required></label><label>Phase<select name="phase">${PHASES.map(p => `<option value="${p}" ${p === game.phase ? 'selected' : ''}>${phaseNames[p]}</option>`).join('')}</select></label><label>First player<select name="firstPlayer">${playerOptions(game.players.filter(p => game.humanCount !== 2 || p.kind === 'human'), game.firstPlayer)}</select></label><label>Current turn (Player turns only)<select name="activePlayer">${playerOptions(game.players, game.activePlayer || game.firstPlayer)}</select></label></div><div class="correction-players">${game.players.map(p => `<fieldset><legend>${escape(p.name)}</legend><div class="correction-player-top"><label>Victory points<input name="score-${p.id}" type="number" min="0" max="99" value="${p.score}" required></label>${p.kind === 'human' ? `<label class="toggle-row"><input type="checkbox" name="revealed-${p.id}" ${p.revealed ? 'checked' : ''}><span>Already revealed this round</span></label>` : ''}</div>${p.agents.map(a => `<div class="correction-agent"><label>${escape(agentLabel(game, p, a))}<select name="agent-${p.id}-${a.id}">${[...(a.id === 's' ? ['locked'] : []), 'available', 'board', ...(a.id === 's' && game.humanCount === 6 ? ['retired'] : [])].map(status => `<option value="${status}" ${status === a.status ? 'selected' : ''}>${{ locked: 'Not acquired', available: 'Available', board: 'On the board', retired: 'Retired' }[status]}</option>`).join('')}</select></label>${a.id === 's' && game.humanCount === 6 ? `<label class="toggle-row"><input name="used-${p.id}" type="checkbox" ${a.usedThisRound ? 'checked' : ''}><span>Used this round (retires at Recall)</span></label>` : ''}</div>`).join('')}</fieldset>`).join('')}</div><p id="correction-error" class="inline-error" role="alert"></p><div class="guide-actions">${button('close-dialog', 'Cancel', 'secondary')}<button type="submit" class="primary">Apply corrections</button></div></form>`;
  dialog.showModal();
}

function exportSave() {
  const raw = damagedSave !== null ? damagedSave : encodeSave(game, history);
  const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url;
  a.download = `dune-uprising-${damagedSave ? 'recovery' : 'game'}-${new Date().toISOString().slice(0, 10)}.json`;
  a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function newGame() {
  if ((damagedSave !== null || game.players.length) && !confirm('Replace this saved game and start a new one? Download a backup first if you want to keep it.')) return;
  damagedSave = null; history = []; game = emptyGame(); resumed = false; ui.openPlayers.clear();
  document.querySelectorAll('dialog[open]').forEach(d => d.close());
  save(); render(true);
}

document.addEventListener('click', event => {
  const tab = event.target.closest('[data-ref-tab]');
  if (tab) { ui.referenceTab = tab.dataset.refTab; ui.query = ''; openReference(); return; }
  const b = event.target.closest('[data-action]');
  if (!b || b.disabled) return;
  const action = b.dataset.action;
  if (action === 'count') { game = setCount(game, Number(b.dataset.count)); history = []; save(); render(true); }
  else if (action === 'change-count') { game.setupStep = 0; save(); render(true); }
  else if (action === 'setup-back') { game.setupStep = 1; game.checks = {}; save(); render(true); }
  else if (action === 'check-all') {
    const all = allChecked(), checks = checkedMap(); checklistFor(game).forEach(s => { checks[s.id] = !all; });
    persistChange(); render();
  }
  else if (action === 'start' && allChecked()) act({ type: 'START' }, 'starting the game');
  else if (action === 'begin-agent') act({ type: 'BEGIN_TURN', turnType: 'agent', agentId: b.dataset.agent, allyId: $('#swordmaster-ally')?.value }, 'choosing the turn');
  else if (action === 'begin-reveal') act({ type: 'BEGIN_TURN', turnType: 'reveal', allyId: $('#reveal-ally')?.value }, 'choosing Reveal');
  else if (action === 'cancel-turn') act({ type: 'CANCEL_TURN' }, 'changing the turn choice');
  else if (action === 'finish-turn' && allChecked()) act({ type: 'FINISH_TURN' }, 'finishing the turn');
  else if (action === 'advance' && allChecked()) act({ type: 'ADVANCE' }, `finishing ${phaseNames[game.phase]}`);
  else if (action === 'score') act({ type: 'SCORE', playerId: b.dataset.player, score: getPlayer(game, b.dataset.player).score + Number(b.dataset.delta) }, 'the score change');
  else if (action === 'swordmaster') act({ type: 'SWORDMASTER', playerId: b.dataset.player }, 'acquiring Swordmaster');
  else if (action === 'recall-agent') act({ type: 'RECALL_AGENT', playerId: b.dataset.player, agentId: b.dataset.agent }, 'recalling the agent');
  else if (action === 'undo' && history.length) { const previous = history.pop(); game = previous.state; save(); render(true); toast(`Undid ${previous.label}.`); }
  else if (action === 'reference') { ui.referenceTab = 'spaces'; openReference(); }
  else if (action === 'correct') openCorrections();
  else if (action === 'close-dialog') b.closest('dialog').close();
  else if (action === 'export') exportSave();
  else if (action === 'new-game') newGame();
  else if (action === 'retry-save') { if (damagedSave === null) save(); }
  else if (action === 'dismiss-resume') { resumed = false; render(true); }
});
$('#reference-open').addEventListener('click', openReference);
$('#menu-open').addEventListener('click', openMenu);

document.addEventListener('input', event => {
  const input = event.target;
  if (input.dataset.setupField && input.dataset.setupField !== 'color') {
    getPlayer(game, input.dataset.player)[input.dataset.setupField] = input.value; persistChange();
    // Refresh the marker labels without replacing the active name input.
    $('#first-player').innerHTML = playerOptions(eligibleFirstPlayers(game), game.firstPlayer);
    if (game.humanCount === 6) { const map = $(`.map-seat.seat-${Number(input.dataset.player.slice(1))} > span`); if (map) map.textContent = getPlayer(game, input.dataset.player).name || 'Unnamed'; }
  }
  if (input.id === 'reference-search') { ui.query = input.value; renderReferenceResults(); }
});
document.addEventListener('change', async event => {
  const input = event.target;
  if (input.dataset.setupField === 'color') {
    const p = getPlayer(game, input.dataset.player), other = game.players.find(x => x.id !== p.id && x.color === input.value);
    if (other) other.color = p.color;
    p.color = input.value; persistChange(); render();
  } else if (input.dataset.setting) {
    game.settings[input.dataset.setting] = input.type === 'checkbox' ? input.checked : input.value;
    persistChange(); if (input.dataset.setting === 'difficulty') render();
  } else if (input.id === 'first-player') { game.firstPlayer = input.value; persistChange(); }
  else if (input.dataset.check) { checkedMap()[input.dataset.check] = input.checked; persistChange(); render(); }
  else if (input.id === 'deck-empty') { game.deckEmpty = input.checked; game.checks = {}; persistChange(); render(); }
  else if (input.id === 'tie-winner') { game.winner = input.value; persistChange(); if (game.status === 'finished') render(); }
  else if (input.id === 'reference-icon') { ui.icon = input.value; renderReferenceResults(); }
  else if (input.id === 'import-file' && input.files[0]) {
    try {
      if (input.files[0].size > 2_000_000) throw new Error('This file is too large to be a companion save.');
      const imported = decodeSave(await input.files[0].text());
      if (!confirm('Replace the current game with this backup?')) { input.value = ''; return; }
      game = imported.state; history = imported.history; damagedSave = null; resumed = true;
      $('#menu-dialog').close(); save(); render(true); toast('Backup restored.');
    } catch (error) { toast(`Could not import: ${error.message}`); input.value = ''; }
  }
});
document.addEventListener('toggle', event => {
  const id = event.target.dataset?.playerDetails;
  if (id) { if (event.target.open) ui.openPlayers.add(id); else ui.openPlayers.delete(id); }
}, true);
document.addEventListener('submit', event => {
  if (event.target.id === 'table-form') {
    event.preventDefault();
    game.players.forEach(p => { p.name = p.name.trim(); p.leader = p.leader.trim(); });
    if (game.players.some(p => !p.name)) { $('#setup-error').textContent = 'Please give every seat a name.'; return; }
    if (game.settings.streamlined) {
      const rival = game.players.find(p => p.kind === 'rival');
      if (!rival.leader) rival.leader = 'Lady Amber Metulli / Glossu “The Beast” Rabban';
    }
    game.setupStep = 2; game.checks = {}; save(); render(true);
  }
  if (event.target.id === 'correction-form') {
    event.preventDefault(); const data = new FormData(event.target);
    const action = { type: 'CORRECT', phase: data.get('phase'), round: Number(data.get('round')), firstPlayer: data.get('firstPlayer'), activePlayer: data.get('activePlayer'), players: game.players.map(p => ({ id: p.id, score: Number(data.get(`score-${p.id}`)), revealed: data.has(`revealed-${p.id}`), agents: p.agents.map(a => ({ id: a.id, status: data.get(`agent-${p.id}-${a.id}`), usedThisRound: a.id === 's' && data.has(`used-${p.id}`) })) })) };
    try { transition(game, action); } catch (error) { $('#correction-error').textContent = error.message; return; }
    $('#correction-dialog').close(); act(action, 'the correction');
  }
});

// Another tab may have a newer copy. Restore it before the next action rather than overwriting it.
window.addEventListener('storage', event => {
  if (event.key !== SAVE_KEY || !event.newValue) return;
  try {
    const incoming = decodeSave(event.newValue);
    game = incoming.state; history = incoming.history; damagedSave = null;
    document.querySelectorAll('dialog[open]').forEach(d => d.close());
    resumed = true; render(); toast('Updated from another tab in this browser.');
  } catch { storageError = 'Another tab changed this save to an unreadable version. Download your current game before continuing.'; renderSaveStatus(); }
});
render();
