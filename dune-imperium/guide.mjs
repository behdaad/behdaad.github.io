import { boardSpaces, topics } from './rules.mjs';

export const SAVE_KEY = 'dune-imperium.player-guide.v1';
export const icons = ['Emperor', 'Spacing Guild', 'Bene Gesserit', 'Fremen', 'Landsraad', 'City', 'Spice Trade', 'Spy'];
export const goals = ['Anything', 'Water', 'Spice', 'Solari', 'Troops', 'Cards', 'Influence', 'Spies', 'Upgrades', 'Contracts'];
export const roles = { allyAtreides: 'Ally · Muad’Dib’s team', allyImperium: 'Ally · Shaddam’s team', muaddib: 'Commander · Muad’Dib', shaddam: 'Commander · Shaddam' };
export const defaults = () => ({ version: 1, name: '', count: 4, choam: false, role: 'allyAtreides', bookmarks: [], turn: { type: 'choose', step: 0, revealed: false, space: '' } });
export const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '');
export const isCommander = profile => profile.count === 6 && ['muaddib', 'shaddam'].includes(profile.role);
export const isImperium = profile => profile.count === 6 && ['shaddam', 'allyImperium'].includes(profile.role);

export function readSave(raw) {
  if (!raw) return defaults();
  const value = JSON.parse(raw);
  if (!value || value.version !== 1 || typeof value.name !== 'string' || value.name.length > 40 ||
    ![1, 2, 3, 4, 6].includes(value.count) || typeof value.choam !== 'boolean' || !Object.hasOwn(roles, value.role) ||
    !Array.isArray(value.bookmarks) || !value.bookmarks.every(x => typeof x === 'string' && x.length < 150) ||
    !value.turn || !['choose', 'agent', 'reveal', 'waiting'].includes(value.turn.type) ||
    !Number.isInteger(value.turn.step) || value.turn.step < 0 || value.turn.step > 5 ||
    typeof value.turn.revealed !== 'boolean' || typeof value.turn.space !== 'string' ||
    (value.turn.space && !boardSpaces.some(s => s.name === value.turn.space))) throw new Error('Unsupported save');
  if (value.count === 6) value.choam = true;
  if (value.turn.revealed) value.turn.type = 'waiting';
  return value;
}

const goalSpaces = {
  Water: ['Deliver Supplies', 'Gather Support', 'Sietch Tabr'],
  Spice: ['Deep Desert', 'Hagga Basin', 'Imperial Basin', 'High Council', 'Desert Mastery', 'Economic Support', 'Habbanya Erg'],
  Solari: ['Spice Refinery', 'Shipping', 'Vast Wealth'],
  Troops: ['Arrakeen', 'Desert Tactics', 'Gather Support', 'Heighliner', 'High Council', 'Research Station', 'Sardaukar', 'Sietch Tabr', 'Carthag', 'Hardy Warriors', 'Military Support'],
  Cards: ['Accept Contract', 'Arrakeen', 'Assembly Hall', 'Espionage', 'Fremkit', 'High Council', 'Imperial Privilege', 'Research Station', 'Sardaukar', 'Secrets', 'Carthag', 'Controversial Technology', 'Desert Mastery', 'Habbanya Erg'],
  Spies: ['Espionage'], Upgrades: ['High Council', 'Swordmaster', 'Sietch Tabr'], Contracts: ['Accept Contract', 'Dutiful Service', 'Expedition']
};

export function spacesFor(profile) {
  return boardSpaces.filter(s => !(s.sixOnly && profile.count !== 6) && !(s.standardOnly && profile.count === 6))
    .filter(s => profile.count !== 6 || !s.owner || (s.owner.startsWith('Shaddam') ? profile.role === 'shaddam' : profile.role === 'muaddib'))
    .map(s => ({ ...s, cost: spaceCost(s, profile),
      effect: profile.count === 6 && s.sixEffect ? s.sixEffect : s.effect,
      page: profile.count === 6 && (s.sixOnly || s.name === 'Swordmaster') ? 14 : boardSpaces.filter(b => !b.sixOnly).findIndex(b => b.name === s.name) < 10 ? 1 : 2,
      personal: profile.count === 6 && Boolean(s.owner) }));
}

function spaceCost(space, profile) {
  if (profile.count !== 6) return space.cost;
  if (space.name === 'Imperial Privilege') return `3 Solari · 2 ${profile.role === 'shaddam' ? 'Great Houses or Emperor' : 'Great Houses'} Influence`;
  if (space.name === 'Sietch Tabr') return `2 ${profile.role === 'muaddib' ? 'Fringe Worlds or Fremen' : 'Fringe Worlds'} Influence`;
  return space.sixCost || space.cost;
}

export function findSpaces(profile, { query = '', selectedIcons = [], goal = 'Anything', combat = false } = {}) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return spacesFor(profile).filter(s => {
    const text = `${s.name} ${s.icon} ${s.cost} ${s.effect}`.toLowerCase();
    const matchesGoal = goal === 'Anything' || (goal === 'Influence' ? /Influence/.test(s.effect) : goal === 'Solari' && !profile.choam && goalSpaces.Contracts.includes(s.name) ? true : (goalSpaces[goal] || []).includes(s.name));
    return terms.every(t => text.includes(t)) && (!selectedIcons.length || selectedIcons.includes('Spy') || selectedIcons.includes(s.icon)) && matchesGoal && (!combat || s.combat);
  });
}

const extraTopics = [
  { title: 'The round at a glance', text: 'Round Start: reveal a Conflict and draw five cards. Player Turns: take an Agent turn or Reveal, one turn at a time in clockwise order; skip players who have Revealed. Combat: resolve Intrigue, strength and rewards. Makers: add one bonus spice to each unoccupied Maker space. Recall: check for endgame; otherwise recover agents and pass first player. Spies stay in place between rounds.', source: 'main', page: 8, category: 'Basics' },
  { title: 'Reading your card', text: 'The icons on the left tell you where an Agent can go. On an Agent turn, use the Agent box below the art. On a Reveal turn, use the Reveal box at the bottom, and only on cards still in your hand. The top-right Persuasion cost is for buying the card, not playing it. A card’s faction is different from its Agent icons. Follow any acquire effect when you buy it.', source: 'main', page: 8, category: 'Basics' },
  { title: 'When to play Combat Intrigue', text: 'Wait until the Combat phase, after all players have Revealed. Starting with the First Player, eligible players may play any number of Combat Intrigue cards or pass. You need a unit in the Conflict. Passing does not prevent you from playing later; continue until everyone eligible passes consecutively. In six-player play, a Commander may play a card for one Ally with units.', source: 'main', page: 14, category: 'Combat' },
  { title: 'Buying cards with Persuasion', text: 'During Reveal, add Persuasion from the cards you reveal and applicable bonuses. Spend it on any number of affordable Imperium Row and Reserve cards, resolving acquire effects and immediately refilling the Row. New cards go to your discard pile unless an effect says otherwise. Purchases and Reveal effects can be interleaved. Remaining Persuasion disappears at the end of this turn.', source: 'main', page: 13, category: 'Cards' },
  { title: 'FAQ: completing contracts', text: 'Complete a contract when its conditions are met; this is mandatory. A single visit can complete multiple contracts for the same destination. A location contract resolves as an Agent-turn effect, in your chosen order with the board and card effects.', source: 'faq', page: 1, category: 'CHOAM' }
];

export const ruleTopics = [...extraTopics, ...topics].map(t => ({ ...t, id: slug(t.title), category: t.category ||
  (t.sixOnly ? 'Teams' : t.rivalOnly ? 'Rivals' : /contract/i.test(t.title) ? 'CHOAM' : /Spy|Spies/.test(t.title) ? 'Spies' : /combat|sandworm|troop|Strength|Control/i.test(t.title) ? 'Combat' : /Influence|Alliance|Winning/.test(t.title) ? 'Scoring' : /Card|Fremen Bond|Costs|Leader|Feyd|Margot|Spacing|drawing/.test(t.title) ? 'Cards' : 'Basics') }));

export function rulesFor(profile) {
  return ruleTopics.filter(t => !(t.sixOnly && profile.count !== 6) && !(t.standardOnly && profile.count === 6) && !(t.rivalOnly && profile.count > 2));
}

const step = (title, text, page, extra = {}) => ({ title, text, page, source: 'main', ...extra });
export function turnSteps(type, profile) {
  const six = profile.count === 6;
  const activation = isCommander(profile) ? [step('Activate your Ally', type === 'agent' ? 'Use the Ally indicated by your agent’s arrow: the teammate two seats to your left or right. With the Swordmaster, choose either Ally. Main-board Influence, units and swords go to this Ally; other resources and cards normally go to you. For requirements, use the higher of your Allies’ Influence.' : 'Choose either Ally to activate. Your Reveal swords, units and main-board Influence go to that Ally. Your own personal-board Influence stays with you.', 9, { source: 'supplement', topic: 'Commanders, Allies and shared Influence' })] : [];
  if (type === 'agent') return [...activation,
    step('Choose your card & destination', 'Have an available agent and a card with an Agent icon. Play one card and choose a space matching an icon. A Spy icon can instead access a space connected to one of your Spies. Keep the card face up.', 9, { board: true, topic: 'Spies: access, infiltration and intelligence' }),
    step('Check access. Pay. Place.', 'Check the required Influence and pay the entry cost before gaining effects. The space must be empty, unless you recall a connected Spy to infiltrate an opponent’s space. You can never bypass your own agent. Immediately after placement, you may recall a connected Spy to draw a card; the same Spy cannot do both.', 9, { also: 11, topic: 'Spies: access, infiltration and intelligence' }),
    step('Resolve your card & the space', `Use the Agent box, not the Reveal box. Resolve card and space effects in your chosen order. Advance Influence and check your Leader, Signet Ring and any conditional effects. ${profile.choam ? 'Check contracts: a location contract must be yours before sending the agent. Complete any fulfilled contracts and take their rewards.' : 'A contract symbol gives you 2 Solari while CHOAM is off.'}`, 9, { topic: profile.choam ? 'CHOAM contracts' : 'Costs, acquire effects and Signet Ring' }),
    step('Decide what to deploy', `At a combat space, you may deploy any troops recruited this turn plus up to two from your garrison. Without a combat space or another enabling effect, recruited troops stay in the garrison. Summoned sandworms enter the Conflict immediately; check Maker Hooks and the Shield Wall.${six ? ' Shaddam’s team cannot gain hooks; Muad’Dib’s Allies share the hook upgrade.' : ''}`, 10, { topic: 'Deploying troops and summoning sandworms' }),
    step('Anything before you pass?', 'You may play Plot Intrigue during your own turn if you meet its conditions and costs. Check Influence rewards, Alliance changes and your VP. Keep this turn’s card face up until your Reveal cleanup. Leave your agent on its space, then pass to the next player who has not Revealed.', 7, { topic: 'Influence and Alliances' })
  ];
  return [...activation,
    step('Reveal your remaining hand', 'Reveal every card still in your hand. Use only these cards’ Reveal boxes. Cards played on previous Agent turns stay in play, but do not give their Reveal effects. Once you Reveal, you take no more Agent turns this round, even if you have unused agents.', 12, { topic: 'Agent or Reveal?' }),
    step('Resolve effects & acquire cards', `Resolve Reveal effects and buy cards in any order. Add +2 Persuasion for a High Council seat and +1 if your agent occupies Assembly Hall. Acquired cards go to your discard; resolve acquire effects and refill the market immediately. You can buy new arrivals too.${isImperium(profile) ? ' Your team may also buy from Shaddam’s Throne Row.' : ''} Cards drawn during Reveal are revealed and used immediately. Set or adjust combat strength at any point during these effects; the next screen helps you check the total.`, 12, { also: 13, topic: 'Buying cards with Persuasion', calculator: 'persuasion' }),
    step('Check your combat strength', `Each deployed troop is worth 2, each sandworm 3, and each sword 1. With no units in the Conflict, your strength is zero, regardless of swords. You may set strength during any Reveal effect; update it when effects change it.${six ? ' A Swordmaster Bonus token adds 2 swords. Commanders give swords to their activated Ally; include that Ally’s existing swords when calculating their total.' : ''}`, 12, { topic: 'Strength, swords and the Shield Wall', calculator: 'combat' }),
    step('Finish your Reveal', 'Play any final Plot Intrigue and finish your effects and purchases. Discard all cards you played or revealed this round. Lose any unspent Persuasion. Your agents stay on the board until Recall. Combat starts only after everyone has Revealed.', 12, { topic: 'When to play Combat Intrigue' })
  ];
}

export function strength(troops, worms, swords) { return troops + worms > 0 ? troops * 2 + worms * 3 + swords : 0; }
