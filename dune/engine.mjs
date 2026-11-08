export const SAVE_KEY = 'dune-uprising.session';
export const VERSION = 1;
export const COUNTS = [1, 2, 3, 4, 6];
export const PHASES = ['roundStart', 'turns', 'combat', 'makers', 'recall', 'endgame'];
export const COLORS = ['#aa4737', '#397b87', '#b18b2f', '#71618d', '#75a8ac', '#74756c'];
const clone = value => JSON.parse(JSON.stringify(value));

export function emptyGame() {
  return { schemaVersion: VERSION, status: 'setup', setupStep: 0, humanCount: null,
    settings: { choam: false, difficulty: 'mercenary', streamlined: false, churn: false, brutal: false, expert: false, smart: false },
    players: [], firstPlayer: '', round: 1, phase: 'roundStart', activePlayer: '', turn: null,
    checks: {}, deckEmpty: false, winner: '', updatedAt: null };
}

function player(index, count) {
  const commander = count === 6 && [0, 3].includes(index);
  const rival = count === 1 ? index > 0 : count === 2 && index === 1;
  return { id: `p${index}`, name: rival ? `Rival ${count === 1 ? index : 1}` : '',
    color: count === 6 ? COLORS[[4, 0, 1, 5, 2, 3][index]] : COLORS[index], leader: commander ? (index === 0 ? 'Muad’Dib' : 'Shaddam Corrino IV') : '',
    kind: rival ? 'rival' : 'human', role: commander ? 'commander' : count === 6 ? 'ally' : 'player',
    team: count === 6 ? (index % 2 === 0 ? 'atreides' : 'imperium') : null,
    score: commander ? 4 : count === 4 || count === 6 ? 1 : 0, revealed: false,
    swordmasterBonus: false,
    agents: ['a', 'b', 's'].map((id, i) => ({ id, status: i === 2 ? 'locked' : 'available',
      usedThisRound: false, side: commander ? ['left', 'right', 'either'][i] : null })) };
}

export function setCount(game, count) {
  if (!COUNTS.includes(count)) throw new Error('Choose 1, 2, 3, 4 or 6 players.');
  const next = emptyGame();
  next.humanCount = count;
  next.players = Array.from({ length: count < 3 ? 3 : count }, (_, i) => player(i, count));
  next.settings.choam = count === 6;
  next.firstPlayer = count === 6 ? 'p2' : 'p0';
  next.setupStep = 1;
  return next;
}

export const getPlayer = (game, id) => game.players.find(p => p.id === id);
export const availableAgents = p => p.agents.filter(a => a.status === 'available');
export const maximumRounds = game => game.humanCount === 6 ? 9 : 10;
export const conflictTier = game => game.humanCount === 6 ? (game.round <= 5 ? 'II' : 'III') : game.round === 1 ? 'I' : game.round <= 6 ? 'II' : 'III';
export const expertMode = game => game.humanCount === 1 && ['mentat', 'kwisatz'].includes(game.settings.difficulty);
export const variant = (game, key) => expertMode(game) || game.settings[key];
export const eligibleFirstPlayers = game => game.players.filter(p => game.humanCount === 2 ? p.kind === 'human' : game.humanCount === 6 ? p.role === 'ally' : true);

export function orderFor(game) {
  if (game.humanCount === 2) {
    return [game.firstPlayer, game.players.find(p => p.kind === 'rival').id,
      game.players.find(p => p.kind === 'human' && p.id !== game.firstPlayer).id];
  }
  const index = game.players.findIndex(p => p.id === game.firstPlayer);
  return [...game.players.slice(index), ...game.players.slice(0, index)].map(p => p.id);
}

export function allyFor(game, commanderId, side) {
  const index = game.players.findIndex(p => p.id === commanderId);
  return game.players[(index + (side === 'left' ? 2 : 4)) % 6];
}

export function agentLabel(game, p, a) {
  if (a.id === 's') return 'Swordmaster';
  if (p.role === 'commander') return `${a.side === 'left' ? 'Left' : 'Right'} · ${allyFor(game, p.id, a.side).name || 'Ally'}`;
  return `Agent ${a.id === 'a' ? '1' : '2'}`;
}

function canAct(p) { return p.kind === 'rival' ? availableAgents(p).length > 0 : !p.revealed; }
function nextTurn(game, after = '') {
  const order = orderFor(game);
  const start = after ? (order.indexOf(after) + 1) % order.length : 0;
  for (let i = 0; i < order.length; i++) {
    const id = order[(start + i) % order.length];
    if (canAct(getPlayer(game, id))) { game.activePlayer = id; game.turn = null; return; }
  }
  game.phase = 'combat'; game.activePlayer = ''; game.turn = null; game.checks = {};
}

export function shouldEnd(game) {
  return game.deckEmpty || game.round >= maximumRounds(game) || game.players.some(p => p.score >= 10 && !(p.kind === 'rival' && game.settings.streamlined));
}

export function standings(game) {
  if (game.humanCount === 6) return ['atreides', 'imperium'].map(id => ({ id,
    name: id === 'atreides' ? 'Team Muad’Dib' : 'Team Shaddam',
    score: game.players.filter(p => p.team === id).reduce((sum, p) => sum + p.score, 0) })).sort((a, b) => b.score - a.score);
  return game.players.filter(p => !(p.kind === 'rival' && game.settings.streamlined)).map(p => ({ id: p.id, name: p.name, score: p.score })).sort((a, b) => b.score - a.score);
}

export function transition(source, action) {
  const game = clone(source);
  const p = getPlayer(game, action.playerId || game.activePlayer);
  switch (action.type) {
    case 'START':
      if (game.status !== 'setup' || !COUNTS.includes(game.humanCount)) throw new Error('Set up a game first.');
      if (game.players.some(p => !p.name.trim())) throw new Error('Give every seat a name.');
      if (!eligibleFirstPlayers(game).some(p => p.id === game.firstPlayer)) throw new Error('Choose the player with the First Player marker.');
      game.status = 'playing'; game.phase = 'roundStart'; game.checks = {}; break;
    case 'BEGIN_TURN': {
      if (game.phase !== 'turns' || game.turn || !p || !canAct(p)) throw new Error('This turn is not available.');
      const type = p.kind === 'rival' ? 'rival' : action.turnType;
      if (!['agent', 'reveal', 'rival'].includes(type)) throw new Error('Choose an Agent or Reveal turn.');
      const agent = type !== 'reveal' ? p.agents.find(a => a.id === action.agentId && a.status === 'available') : null;
      if (type !== 'reveal' && !agent) throw new Error('Choose an available agent.');
      const allyId = p.role === 'commander' && agent && agent.side !== 'either' ? allyFor(game, p.id, agent.side).id : action.allyId || null;
      if (p.role === 'commander' && !game.players.some(a => a.id === allyId && a.team === p.team && a.role === 'ally')) throw new Error('Choose an Ally to activate.');
      game.turn = { type, agentId: agent?.id || null, allyId, checks: {} }; break;
    }
    case 'FINISH_TURN':
      if (game.phase !== 'turns' || !game.turn || !p) throw new Error('There is no active turn to finish.');
      if (game.turn.type === 'reveal') p.revealed = true;
      else {
        const agent = p.agents.find(a => a.id === game.turn.agentId);
        if (agent.status !== 'available') throw new Error('That agent is no longer available.');
        agent.status = 'board'; agent.usedThisRound = true;
      }
      nextTurn(game, p.id); break;
    case 'CANCEL_TURN': game.turn = null; break;
    case 'SWORDMASTER': {
      if (!p || p.agents[2].status !== 'locked') throw new Error('This player already has their Swordmaster.');
      if (game.settings.difficulty === 'kwisatz' && game.humanCount === 1 && p.kind === 'human') throw new Error('Kwisatz Haderach difficulty does not allow your Swordmaster.');
      p.agents[2].status = 'available'; p.swordmasterBonus = game.humanCount === 6; break;
    }
    case 'RECALL_AGENT': {
      const agent = p?.agents.find(a => a.id === action.agentId);
      if (!agent || agent.status !== 'board') throw new Error('Choose an agent already on the board.');
      agent.status = 'available'; break;
    }
    case 'SCORE':
      if (!p || !Number.isInteger(action.score) || action.score < 0 || action.score > 99) throw new Error('Enter a score from 0 to 99.');
      p.score = action.score; game.winner = '';
      if (game.status === 'finished') {
        const scores = standings(game);
        if (scores[0].score > (scores[1]?.score ?? -1)) game.winner = scores[0].id;
      }
      break;
    case 'ADVANCE':
      if (game.status !== 'playing') throw new Error('Start a game first.');
      if (game.phase === 'roundStart') { game.phase = 'turns'; game.checks = {}; nextTurn(game); }
      else if (game.phase === 'combat') game.phase = 'makers';
      else if (game.phase === 'makers') game.phase = 'recall';
      else if (game.phase === 'recall') {
        if (shouldEnd(game)) game.phase = 'endgame';
        else {
          const order = orderFor(game);
          game.firstPlayer = game.humanCount === 2 ? order[2] : order[1];
          for (const player of game.players) {
            player.revealed = false;
            for (const a of player.agents) {
              if (game.humanCount === 6 && a.id === 's' && a.usedThisRound) a.status = 'retired';
              else if (a.status === 'board') a.status = 'available';
              a.usedThisRound = false;
            }
          }
          game.round++; game.phase = 'roundStart'; game.deckEmpty = false;
        }
      } else if (game.phase === 'endgame') {
        game.status = 'finished';
        const scores = standings(game);
        if (!game.winner && scores[0].score > (scores[1]?.score ?? -1)) game.winner = scores[0].id;
      } else throw new Error('Finish the player turns first.');
      game.checks = {}; break;
    case 'CORRECT': {
      if (!PHASES.includes(action.phase) || !Number.isInteger(action.round) || action.round < 1 || action.round > maximumRounds(game)) throw new Error('Choose a valid round and phase.');
      if (!getPlayer(game, action.firstPlayer) || (game.humanCount === 2 && getPlayer(game, action.firstPlayer).kind === 'rival')) throw new Error('Choose a valid first player.');
      game.status = 'playing'; game.phase = action.phase; game.round = action.round;
      game.firstPlayer = action.firstPlayer; game.turn = null; game.checks = {}; game.winner = ''; game.deckEmpty = false;
      if (action.players) {
        for (const patch of action.players) {
          const target = getPlayer(game, patch.id);
          if (!target || !Number.isInteger(patch.score) || patch.score < 0 || patch.score > 99) throw new Error('Check the corrected scores.');
          target.score = patch.score; target.revealed = target.kind === 'human' && !!patch.revealed;
          for (const a of target.agents) {
            const update = patch.agents.find(x => x.id === a.id);
            if (!update || !['available', 'board', 'locked', 'retired'].includes(update.status) || (a.id !== 's' && ['locked', 'retired'].includes(update.status))) throw new Error('Check the agent statuses.');
            a.status = update.status; a.usedThisRound = update.status === 'board' || !!update.usedThisRound;
          }
          target.swordmasterBonus = game.humanCount === 6 && target.agents[2].status !== 'locked';
        }
      }
      game.activePlayer = '';
      if (game.phase === 'turns') {
        const active = getPlayer(game, action.activePlayer);
        if (!active || !canAct(active)) throw new Error('The current player must have a turn remaining. Clear Revealed or return an agent first.');
        game.activePlayer = active.id;
      }
      break;
    }
    default: throw new Error('Unknown game action.');
  }
  game.updatedAt = new Date().toISOString();
  return game;
}

// Saves are user-controlled input: validate shape and relationships before rendering.
export function validGame(s) {
  if (!s || s.schemaVersion !== VERSION || !['setup', 'playing', 'finished'].includes(s.status)) return false;
  if (!Number.isInteger(s.setupStep) || s.setupStep < 0 || s.setupStep > 2 || !Array.isArray(s.players)) return false;
  const z = s.settings;
  if (!z || !['mercenary', 'sardaukar', 'mentat', 'kwisatz'].includes(z.difficulty) || ['choam', 'streamlined', 'churn', 'brutal', 'expert', 'smart'].some(k => typeof z[k] !== 'boolean')) return false;
  const boolMap = v => !!v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length <= 50 && Object.values(v).every(x => typeof x === 'boolean');
  if (!PHASES.includes(s.phase) || !boolMap(s.checks) || typeof s.deckEmpty !== 'boolean' || typeof s.winner !== 'string') return false;
  if (s.humanCount === null) return s.status === 'setup' && s.setupStep === 0 && s.players.length === 0;
  if (!COUNTS.includes(s.humanCount) || s.players.length !== (s.humanCount < 3 ? 3 : s.humanCount)) return false;
  if (s.humanCount === 6 && !z.choam) return false;
  if (!Number.isInteger(s.round) || s.round < 1 || s.round > maximumRounds(s)) return false;
  for (const [i, p] of s.players.entries()) {
    const expected = player(i, s.humanCount);
    if (!p || ['id', 'kind', 'role', 'team'].some(k => p[k] !== expected[k])) return false;
    if (typeof p.name !== 'string' || p.name.length > 60 || typeof p.leader !== 'string' || p.leader.length > 80 || !/^#[0-9a-f]{6}$/i.test(p.color)) return false;
    if (s.status !== 'setup' && !p.name.trim()) return false;
    if (!Number.isInteger(p.score) || p.score < 0 || p.score > 99 || typeof p.revealed !== 'boolean' || typeof p.swordmasterBonus !== 'boolean') return false;
    if (p.kind === 'rival' && p.revealed) return false;
    if (!Array.isArray(p.agents) || p.agents.length !== 3) return false;
    if (p.agents.some((a, j) => !a || a.id !== expected.agents[j].id || a.side !== expected.agents[j].side || typeof a.usedThisRound !== 'boolean' || !(j === 2 ? ['locked', 'available', 'board', ...(s.humanCount === 6 ? ['retired'] : [])] : ['available', 'board']).includes(a.status))) return false;
    if (p.swordmasterBonus !== (s.humanCount === 6 && p.agents[2].status !== 'locked')) return false;
  }
  if (!getPlayer(s, s.firstPlayer) || (s.humanCount === 2 && getPlayer(s, s.firstPlayer).kind === 'rival')) return false;
  if (s.phase === 'turns' && s.status === 'playing' && !canAct(getPlayer(s, s.activePlayer) || { kind: 'human', revealed: true })) return false;
  if (s.turn !== null) {
    const p = getPlayer(s, s.activePlayer), t = s.turn;
    if (s.phase !== 'turns' || !p || !boolMap(t.checks) || !['agent', 'rival', 'reveal'].includes(t.type)) return false;
    if ((p.kind === 'rival') !== (t.type === 'rival')) return false;
    if (t.type !== 'reveal' && !p.agents.some(a => a.id === t.agentId && a.status === 'available')) return false;
    if (p.role === 'commander' && !s.players.some(a => a.id === t.allyId && a.role === 'ally' && a.team === p.team)) return false;
    if (p.role === 'commander' && t.type === 'agent' && t.agentId !== 's' && allyFor(s, p.id, p.agents.find(a => a.id === t.agentId).side).id !== t.allyId) return false;
  }
  return true;
}

export function encodeSave(state, history = []) {
  return JSON.stringify({ schemaVersion: VERSION, state, history: history.slice(-30) });
}
export function decodeSave(raw) {
  if (typeof raw !== 'string' || raw.length > 2_000_000) throw new Error('This save is too large or unreadable.');
  const data = JSON.parse(raw);
  if (data.schemaVersion !== VERSION || !validGame(data.state) || !Array.isArray(data.history) || data.history.length > 30 || data.history.some(h => !h || typeof h.label !== 'string' || h.label.length > 200 || !validGame(h.state))) throw new Error('This save is damaged or belongs to an unsupported version.');
  return data;
}
