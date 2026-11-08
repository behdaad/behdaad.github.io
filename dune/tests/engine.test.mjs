import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyGame, setCount, getPlayer, availableAgents, transition as move, orderFor, maximumRounds, conflictTier, shouldEnd, standings, validGame, encodeSave, decodeSave } from '../engine.mjs';
import { checklistFor, boardSpaces } from '../rules.mjs';

function setup(count) {
  const s = setCount(emptyGame(), count);
  s.players.forEach((p, i) => { p.name = `Seat ${i + 1}`; });
  return s;
}
function start(count) { return move(move(setup(count), { type: 'START' }), { type: 'ADVANCE' }); }
function finishTurns(s) {
  let guard = 0;
  while (s.phase === 'turns') {
    assert.ok(guard++ < 30, 'turns must terminate');
    const p = getPlayer(s, s.activePlayer);
    s = move(s, { type: 'BEGIN_TURN', turnType: 'reveal', agentId: availableAgents(p)[0]?.id,
      allyId: s.players.find(a => a.role === 'ally' && a.team === p.team)?.id });
    s = move(s, { type: 'FINISH_TURN' });
  }
  return s;
}
function nextRound(s) {
  s = finishTurns(s);
  while (['combat', 'makers', 'recall'].includes(s.phase)) s = move(s, { type: 'ADVANCE' });
  return s;
}

test('every supported table has the correct roles, supplies, starting scores and save shape', () => {
  assert.ok(validGame(emptyGame()));
  for (const count of [1, 2, 3, 4, 6]) {
    const s = setup(count);
    assert.equal(s.players.filter(p => p.kind === 'human').length, count);
    assert.equal(s.players.filter(p => p.kind === 'rival').length, count < 3 ? 3 - count : 0);
    assert.equal(s.players.reduce((sum, p) => sum + p.score, 0), count === 6 ? 12 : count === 4 ? 4 : 0);
    assert.ok(s.players.every(p => availableAgents(p).length === 2));
    assert.ok(validGame(s));
    assert.deepEqual(decodeSave(encodeSave(s)).state, s);
  }
  assert.throws(() => setCount(emptyGame(), 5));
});

test('early Reveal skips a human while Rivals finish all placements without Reveal', () => {
  let s = start(2);
  s = move(s, { type: 'BEGIN_TURN', turnType: 'reveal' });
  s = move(s, { type: 'FINISH_TURN' });
  assert.equal(s.activePlayer, 'p1');
  s = finishTurns(s);
  assert.equal(s.phase, 'combat');
  assert.ok(s.players[0].revealed);
  assert.equal(availableAgents(s.players[0]).length, 2);
  assert.equal(s.players[1].revealed, false);
  assert.equal(availableAgents(s.players[1]).length, 0);
  assert.ok(validGame(s));
});

test('two-player order always puts the Rival between humans and passes first player only to humans', () => {
  let s = start(2);
  assert.deepEqual(orderFor(s), ['p0', 'p1', 'p2']);
  s = nextRound(s);
  assert.equal(s.firstPlayer, 'p2');
  assert.deepEqual(orderFor(s), ['p2', 'p1', 'p0']);
  s = nextRound(move(s, { type: 'ADVANCE' }));
  assert.equal(s.firstPlayer, 'p0');
  assert.equal(s.round, 3);
});

test('solo Rivals and six-player Commanders can receive the marker in later rounds', () => {
  let solo = start(1);
  solo = nextRound(solo); assert.equal(solo.firstPlayer, 'p1');
  solo = nextRound(move(solo, { type: 'ADVANCE' })); assert.equal(solo.firstPlayer, 'p2');
  const six = nextRound(start(6));
  assert.equal(six.firstPlayer, 'p3');
  assert.equal(six.players[3].role, 'commander');
  assert.ok(validGame(six));
});

test('Swordmaster is immediately available; recalled agents can be used again', () => {
  let s = start(3);
  s = move(s, { type: 'BEGIN_TURN', turnType: 'agent', agentId: 'a' });
  s = move(s, { type: 'SWORDMASTER' });
  s = move(s, { type: 'FINISH_TURN' });
  assert.equal(availableAgents(s.players[0]).length, 2);
  s = move(s, { type: 'RECALL_AGENT', playerId: 'p0', agentId: 'a' });
  assert.equal(availableAgents(s.players[0]).length, 3);
  s = nextRound(s);
  assert.equal(availableAgents(s.players[0]).length, 3);
  assert.throws(() => move(s, { type: 'SWORDMASTER', playerId: 'p0' }));
});

test('six-player Commander arrows activate the correct teammate, never a neighboring opponent', () => {
  let s = start(6); s.activePlayer = 'p0';
  const left = move(s, { type: 'BEGIN_TURN', turnType: 'agent', agentId: 'a' });
  const right = move(s, { type: 'BEGIN_TURN', turnType: 'agent', agentId: 'b' });
  assert.equal(left.turn.allyId, 'p2'); assert.equal(right.turn.allyId, 'p4');
  assert.ok(validGame(left)); assert.ok(validGame(right));
  assert.throws(() => move(s, { type: 'BEGIN_TURN', turnType: 'reveal', allyId: 'p1' }));
  s = move(s, { type: 'SWORDMASTER' });
  assert.equal(move(s, { type: 'BEGIN_TURN', turnType: 'agent', agentId: 's', allyId: 'p4' }).turn.allyId, 'p4');
});

test('six-player used Swordmaster retires even after recall; unused one carries over and bonuses persist', () => {
  let s = start(6);
  s = move(s, { type: 'SWORDMASTER', playerId: 'p2' });
  s = move(s, { type: 'SWORDMASTER', playerId: 'p4' });
  s = move(s, { type: 'BEGIN_TURN', turnType: 'agent', agentId: 's' });
  s = move(s, { type: 'FINISH_TURN' });
  s = move(s, { type: 'RECALL_AGENT', playerId: 'p2', agentId: 's' });
  s = nextRound(s);
  assert.equal(s.players[2].agents[2].status, 'retired');
  assert.equal(s.players[4].agents[2].status, 'available');
  assert.ok(s.players[2].swordmasterBonus && s.players[4].swordmasterBonus);
  assert.ok(validGame(s));
});

test('endgame waits for Recall; team total of 10 is not an individual threshold', () => {
  let s = start(4);
  s = move(s, { type: 'SCORE', playerId: 'p0', score: 10 });
  assert.equal(s.phase, 'turns');
  s = nextRound(s); assert.equal(s.phase, 'endgame');
  let six = start(6);
  six = move(six, { type: 'SCORE', playerId: 'p2', score: 7 });
  assert.equal(standings(six)[0].score, 12);
  assert.equal(shouldEnd(six), false);
  six = nextRound(six); assert.equal(six.phase, 'roundStart');
});

test('final round and physical deck exhaustion both trigger endgame', () => {
  for (const count of [1, 2, 3, 4, 6]) {
    let s = start(count); s.round = maximumRounds(s);
    assert.equal(nextRound(s).phase, 'endgame');
    s = start(count); s.deckEmpty = true;
    assert.equal(nextRound(s).phase, 'endgame');
  }
  const s = setup(6); assert.equal(conflictTier(s), 'II'); s.round = 6; assert.equal(conflictTier(s), 'III');
  const three = setup(3); assert.equal(conflictTier(three), 'I'); three.round = 6; assert.equal(conflictTier(three), 'II'); three.round = 7; assert.equal(conflictTier(three), 'III');
});

test('non-scoring streamlined Rival cannot trigger or win the endgame', () => {
  let s = start(2); s.settings.streamlined = true;
  s = move(s, { type: 'SCORE', playerId: 'p1', score: 10 });
  assert.equal(shouldEnd(s), false);
  assert.equal(standings(s).length, 2);
});

test('Expert+ blocks the human Swordmaster but still permits Rival acquisition', () => {
  let s = start(1); s.settings.difficulty = 'kwisatz';
  assert.throws(() => move(s, { type: 'SWORDMASTER', playerId: 'p0' }));
  s = move(s, { type: 'SWORDMASTER', playerId: 'p1' });
  assert.equal(s.players[1].agents[2].status, 'available');
  s.activePlayer = 'p1'; s = move(s, { type: 'BEGIN_TURN', agentId: 'a' });
  assert.ok(checklistFor(s).some(x => x.id === 'politics'));
  assert.ok(checklistFor(s).find(x => x.id === 'deploy').text.includes('Expert Deployment'));
});

test('a save retains a partial Commander turn and undo; incompatible or malformed data is rejected', () => {
  let s = start(6); s.activePlayer = 'p0';
  const before = structuredClone(s);
  s = move(s, { type: 'BEGIN_TURN', turnType: 'agent', agentId: 'a' }); s.turn.checks.ally = true;
  const raw = encodeSave(s, [{ state: before, label: 'choosing the turn' }]);
  assert.deepEqual(decodeSave(raw).state, s);
  for (const alter of [x => x.schemaVersion = 9, x => x.state.players[0].agents = [], x => x.state.turn.allyId = 'p1', x => x.state.players[1].color = 'url(evil)', x => x.state.phase = 'missing', x => x.state.activePlayer = 'missing']) {
    const broken = JSON.parse(raw); alter(broken); assert.throws(() => decodeSave(JSON.stringify(broken)));
  }
  assert.throws(() => decodeSave('{broken'));
});

test('corrections are validated and can resume a skipped player', () => {
  let s = start(3); s.players[0].revealed = true;
  assert.throws(() => move(s, { type: 'CORRECT', phase: 'turns', round: 2, firstPlayer: 'p0', activePlayer: 'p0' }));
  const players = structuredClone(s.players); players[0].revealed = false;
  s = move(s, { type: 'CORRECT', phase: 'turns', round: 2, firstPlayer: 'p0', activePlayer: 'p0', players });
  assert.equal(s.activePlayer, 'p0'); assert.equal(s.round, 2); assert.ok(validGame(s));
});

test('checklists change by mode and completed-game score corrections recalculate the winner', () => {
  let s = start(6); s.phase = 'makers'; assert.equal(checklistFor(s).length, 4);
  s = start(3); s.phase = 'makers'; assert.equal(checklistFor(s).length, 3);
  s.phase = 'endgame'; s.players[0].score = 10; s = move(s, { type: 'ADVANCE' });
  assert.equal(s.winner, 'p0');
  s = move(s, { type: 'SCORE', playerId: 'p1', score: 11 }); assert.equal(s.winner, 'p1');
  assert.equal(boardSpaces.filter(b => !b.sixOnly).length, 22);
});
