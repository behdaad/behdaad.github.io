import { getPlayer, conflictTier, variant, shouldEnd, maximumRounds } from './engine.mjs';

export const phaseNames = { roundStart: 'Round start', turns: 'Player turns', combat: 'Combat', makers: 'Makers', recall: 'Recall', endgame: 'Endgame' };
export const phaseDescriptions = {
  roundStart: 'A new conflict. A fresh hand. A different opportunity.',
  turns: 'One decision at a time. The table comes back to you.',
  combat: 'A last chance to change the balance of power.',
  makers: 'Where no one ventured, the spice accumulates.',
  recall: 'Take stock, gather your agents, and pass the initiative.',
  endgame: 'One final intrigue. Then count what you have won.'
};
const step = (id, title, text) => ({ id, title, text });

export function checklistFor(s) {
  const six = s.humanCount === 6, rivals = s.humanCount < 3, p = getPlayer(s, s.activePlayer);
  if (s.status === 'setup') return [
    step('board', 'Check the board and module', six ? 'Use the six-player side and both Commander boards. CHOAM is required. Set aside Shaddam’s two Sardaukar contracts as directed on his Leader.' : `Use the standard board, with the Shield Wall in place. ${s.settings.choam ? 'Include the CHOAM cards and prepare two face-up contracts.' : 'Leave out the CHOAM-marked cards and Shaddam Corrino IV. Contract symbols give 2 Solari.'}`),
    step('deck', 'Check the Conflict deck', six ? 'Five random Conflict II cards sit above all four shuffled Conflict III cards: nine rounds at most. No Conflict I cards.' : 'One random Conflict I card sits above five random Conflict II cards, then all four shuffled Conflict III cards: ten rounds at most.'),
    step('supply', 'Check starting supplies and scores', six ? 'Commanders start at 4 VP; Allies at 1 VP. Everyone starts with 1 water and two agents. Commanders use their special decks and directional agent tokens; only Allies have troops.' : `${s.humanCount === 4 ? 'Everyone starts at 1 VP.' : 'Everyone starts at 0 VP.'} Each human starts with 1 water, three garrisoned troops, two agents and their shuffled ten-card deck.`),
    ...(rivals ? [step('rivals', 'Prepare the Rivals', `Use ${s.humanCount === 1 ? 'two Rival cards and remove the 2P Reshuffle card from House Hagal' : 'one Rival card and keep the 2P Reshuffle card in House Hagal'}. Each Rival starts with two agents, three spies and 1 water. ${s.humanCount === 1 && s.settings.difficulty === 'mercenary' ? 'Mercenary: Rivals start with no garrisoned troops; you start with one Intrigue card.' : 'Each Rival starts with three garrisoned troops.'} ${s.settings.streamlined ? 'Use Lady Amber Metulli or Glossu “The Beast” Rabban for the streamlined Rival.' : 'Use the physical Rival cards for their abilities, faction priorities and Swordmaster values.'}`)] : []),
    step('objectives', 'Check Objectives and the first player', six ? 'Only Allies draw Objectives. Each team needs one Desert Mouse and one Crysknife. If necessary, trade the 4/6P Desert Mouse with the adjacent opposing Ally. Set the first player to the Ally whose Objective shows the marker.' : s.humanCount === 2 ? 'Give the Ornithopter Objective to the Rival. Deal the other two to the humans; the Objective with the First Player marker determines who starts.' : 'Use Objectives marked for this player count. Deal them randomly (including to both Rivals in solo). The Objective with the First Player marker determines who starts.'),
    step('ready', 'Everyone is ready', 'Names and seat order match your table. Keep the cards, resources and rulebooks within reach. The companion will record turns and scores; you resolve the physical game.')
  ];
  if (s.phase === 'roundStart') return [
    step('conflict', `Reveal the Conflict ${conflictTier(s)} card`, 'Turn over the next card from the physical Conflict deck. Read its rewards aloud and leave it visible for everyone.'),
    step('control', 'Check control and the Shield Wall', 'If a player controls the location of this Conflict, they may deploy one troop from their supply as a defensive bonus. With the Shield Wall intact, no sandworms can enter a conflict over Arrakeen, Spice Refinery or Imperial Basin.'),
    step('draw', 'Draw five cards', `Each human draws five cards. If a deck runs out, shuffle its discard pile and keep drawing. ${rivals ? 'Rivals use House Hagal instead of a hand.' : ''}`)
  ];
  if (s.phase === 'turns' && s.turn) {
    if (s.turn.type === 'rival') return [
      step('hagal', 'Reveal a House Hagal card', 'Use the physical deck. Skip occupied destinations and draw again. Resolve Place Spy cards, then draw again until an agent is placed. If the deck runs out or you draw Reshuffle, shuffle and continue.'),
      ...(variant(s, 'smart') ? [step('politics', 'Apply Smart Politics', 'For a free faction space, draw again if the Rival holds that Alliance and leads everyone by at least 1 Influence, or has at least 2 Influence but trails the leader by at least 2.')] : []),
      step('effects', 'Place the agent and resolve the card', 'Ignore the board space’s normal costs and effects; follow the House Hagal card. Rivals gain Influence and Alliances but not the bonus at 4 Influence. Placing their third Spy recalls the other two and triggers their Scheme.'),
      step('deploy', 'Resolve deployment and sandworms', `On a combat space, deploy troops recruited this turn plus up to two from the garrison. At Maker spaces, collect bonus spice, then summon sandworms if the Rival has hooks and the Conflict allows it; otherwise gain base spice. ${variant(s, 'expert') ? 'Expert Deployment: summon sandworms first. In Conflict I or II, do not deploy troops if already ahead by three or more units; Conflict III has no such restriction.' : ''}`),
      step('resources', 'Check resources and update the tracker', `${s.settings.streamlined ? 'Follow the streamlined Rival card. After it gains its Swordmaster, return any Maker bonus spice it would take to the bank. It cannot win the game.' : 'At its printed Swordmaster threshold, spend resources in this order: Solari, spice, Intrigue, water. After acquiring it, exchange 7 Solari, 7 spice, 3 Intrigue cards or 3 water for 1 VP whenever possible.'} If it gained its Swordmaster or VP, update the player panel before finishing.`)
    ];
    const activation = p.role === 'commander' ? [step('ally', `Activate ${getPlayer(s, s.turn.allyId).name}`, 'Your activated Ally receives main-board Influence changes, recruited units, deployment choices and swords. Your own personal-board Influence stays with you. For requirements, use the higher of your two Allies’ main-board Influence.')] : [];
    if (s.turn.type === 'agent') return [
      ...activation,
      step('card', 'Play a card and choose a space', 'Play one card with an Agent icon. Choose a space matching an icon, or use its Spy icon with a connected Spy. Check occupancy, Influence requirements and costs before receiving any effects. Browse Board spaces if you need options.'),
      step('place', 'Pay, place, then check your spies', 'Pay the space’s cost and place the chosen agent. You may recall a connected Spy to infiltrate a space occupied by another player. Immediately after placement, you may recall a connected Spy to draw a card. One Spy cannot do both.'),
      step('resolve', 'Resolve the space and your card', `Resolve the board and Agent-box effects in your chosen order; ignore the Reveal box. Gain the relevant faction Influence and check Leader/Signet Ring abilities. ${s.settings.choam ? 'Check contracts you already held when you sent the agent. Announce completed contracts, take rewards and turn them face down.' : 'A contract symbol gives 2 Solari.'}`),
      step('troops', 'Deploy if this is a combat space', 'You may deploy troops recruited this turn plus up to two more from your garrison. Summoned sandworms enter the Conflict immediately; check Maker Hooks and the Shield Wall. Non-combat spaces do not normally allow deployment.'),
      step('finish', 'Check extras before passing', 'Plot Intrigue cards may be played during your turn. Check any gained or lost VP, new Swordmaster, or recalled agent and record them in the player panel. Keep your played card face up until your Reveal cleanup.')
    ];
    return [
      ...activation,
      step('reveal', 'Reveal the rest of your hand', 'Reveal every card left in your hand. Use only those cards’ Reveal boxes, not the cards used on earlier Agent turns. You are choosing to finish taking turns this round, even if you have unused agents.'),
      step('effects', 'Resolve effects and buy cards', `Resolve Reveal effects in any order. Spend Persuasion before, between or after those effects. Buy from the Imperium Row or Reserve; acquisitions go to your discard pile, and the Row refills immediately. Remember High Council (+2 Persuasion) and Assembly Hall (+1 if you have an agent there). ${six && p.team === 'imperium' ? 'Your team can also acquire cards from Shaddam’s Throne Row.' : ''}`),
      step('strength', 'Set your combat strength', `Troops in the Conflict count 2 each; sandworms count 3 each; swords count 1 each. No units means no strength. Set strength during Reveal effects and adjust it as needed. ${six ? 'A Swordmaster Bonus token adds 2 swords each Reveal, even after its agent has been retired. Commanders give their swords to the activated Ally.' : ''}`),
      step('cleanup', 'Finish effects, then clean up', `You may play Plot Intrigue cards during this turn. Check gained VP, discard all your played and revealed cards, and lose any unspent Persuasion. ${s.settings.churn && s.humanCount === 1 ? 'For Row churn, roll two d6: remove cards at the rolled positions 1–5, counting from the left. Ignore sixes, remove doubles only once, then refill.' : ''}`)
    ];
  }
  if (s.phase === 'combat') return [
    ...(rivals ? [step('bonus', 'Give participating Rivals their combat bonus', `In turn order, for each Rival with units in the Conflict, draw ${variant(s, 'brutal') && conflictTier(s) === 'III' ? 'two House Hagal cards and add both sword totals' : 'a House Hagal card and add its swords'}. Ignore other effects; reshuffle and redraw a Reshuffle card.`)] : []),
    step('intrigue', 'Offer Combat Intrigue in turn order', `Start with the First Player marker and continue clockwise. Players with units may play any number of Combat Intrigue cards or pass. Passing does not prevent playing later. Continue until all eligible players pass consecutively. ${six ? 'Commanders may play for an Ally with units; each card applies to one Ally, not both.' : ''}`),
    step('ranks', 'Resolve strength, ties and rewards', `Use the physical Combat track. Zero strength earns nothing. ${s.humanCount === 4 || six ? 'Award first, second and third rewards.' : 'Normally award only first and second rewards; the third reward is used for a tie in second.'} Tied first: each gets second reward and nobody wins the card. ${s.humanCount === 4 || six ? 'With exactly two tied first, the next player competes for third; with three or more tied first, no other rewards.' : 'After a tie for first, no other rewards.'} Tied second: each gets third; tied third: nothing. ${six ? 'Allies fight separately. Two tied teammates may have one concede the better reward to the other; a concession at third leaves the conceding Ally with nothing. Commanders never receive Conflict rewards.' : ''}`),
    step('worms', 'Apply sandworm doubling and battle icons', 'One or more sandworms doubles the rewards you receive, not the battle icon or control of a location. A paid reward can be purchased a second time by paying again. The sole winner takes the Conflict card; match its battle icon with another face-up Conflict or Objective, flip the pair, and gain 1 VP.'),
    ...(rivals ? [step('rival-rewards', 'Resolve Rival rewards', 'Rivals also collect and double rewards, take control, and match battle icons. They choose their lowest Influence, breaking ties by printed faction priority, and pay for offered VP when able. Contracts give them 2 Solari. Check Swordmaster purchases and VP exchanges again.')] : []),
    step('clear', 'Update scores and clear the Conflict', 'Record any VP changes in the player panel. Return all deployed troops to their owners’ supplies, not their garrisons. Return sandworms to the bank and reset combat markers to zero.')
  ];
  if (s.phase === 'makers') return [
    ...['Deep Desert', 'Hagga Basin', 'Imperial Basin', ...(six ? ['Habbanya Erg'] : [])].map((space, i) => step(`maker${i}`, space, 'Check the physical board. If no agent occupies this space, add 1 spice to its bonus spice. Leave existing bonus spice in place.'))
  ];
  if (s.phase === 'recall') return [
    step('scores', 'Check every score against the board', `If any ${six ? 'individual player' : 'player or scoring Rival'} has at least 10 VP, or the Conflict deck is empty, the game ends after this round. ${six ? 'The combined team score does not trigger the endgame.' : ''} Update scores before continuing. Use the deck checkbox below if the physical deck ran out early.`),
    ...(shouldEnd(s) ? [step('end', 'Prepare for the final scoring', 'The endgame has been triggered. Leave the game state in place and prepare any Endgame Intrigue cards.')] : [
      step('recall', 'Recall your agents', `Return agents to their Leaders. Spies stay at their observation posts. ${six ? 'Return any Swordmaster used this round to the box, even if it was recalled earlier. Keep an unused Swordmaster for a later round. All Swordmaster Bonus tokens stay.' : 'Acquired Swordmasters remain available in future rounds.'}`),
      step('marker', 'Pass the First Player marker', s.humanCount === 2 ? 'Pass to the other human. Next round the Rival again acts between the two human players.' : 'Pass clockwise to the next seat. In solo, Rivals may hold it. In six-player games, Commanders may hold it after the opening round.')
    ])
  ];
  if (s.phase === 'endgame') return [
    step('intrigue', 'Resolve Endgame Intrigue and final battle icons', `Play applicable Endgame Intrigue cards. A wild battle icon may match one face-up battle icon for 1 VP. ${six ? 'Commanders do not own Conflict cards and cannot use endgame effects that require them. Use each Commander’s shared Influence where applicable.' : ''}`),
    step('scores', 'Record the final scores', six ? 'Update all six individual scores. The team total is the sum of its Commander and both Allies.' : 'Update all scores. A scoring Rival can win. A streamlined Rival cannot win.'),
    step('tie', 'Check the winner and any tiebreak', `Highest ${six ? 'combined team score' : 'score'} wins. For a tie, compare spice, then Solari, then water, then garrisoned troops${six ? ', combining resources across each team' : ''}. If a tie remains, leave the result tied. You can record the tiebreak winner below.`)
  ];
  return [];
}

export const sources = {
  main: { label: 'Main rulebook', url: 'https://d19y2ttatozxjp.cloudfront.net/pdfs/DUNE_IMPERIUM_UPRISING_Main_Rulebook_23-10-12.pdf' },
  supplement: { label: 'Rules supplements', url: 'https://d19y2ttatozxjp.cloudfront.net/pdfs/DUNE_IMPERIUM_UPRISING_Rules_Supplements_23-10-12.pdf' }
};

// Main board-space guide: supplement PDF pp. 1–2. Six-player additions: PDF p. 14.
const space = (name, icon, cost, effect, combat = false, extra = {}) => ({ name, icon, cost, effect, combat, ...extra });
export const boardSpaces = [
  space('Accept Contract', 'Spice Trade', 'No cost', 'Draw a card and take a contract (or gain 2 Solari without CHOAM or when contracts run out).'),
  space('Arrakeen', 'City', 'No cost', 'Recruit one troop and draw a card. The controller of Arrakeen gains 1 Solari.', true),
  space('Assembly Hall', 'Landsraad', 'No cost', 'Draw an Intrigue card. Gain 1 Persuasion during your Reveal if your agent is here.'),
  space('Deep Desert', 'Spice Trade', '3 water', 'Collect bonus spice, then choose 4 spice OR summon two sandworms with Maker Hooks. The Shield Wall may prevent summoning.', true),
  space('Deliver Supplies', 'Spacing Guild', 'No cost', 'Gain 1 Spacing Guild Influence and 1 water.'),
  space('Desert Tactics', 'Fremen', '1 water', 'Gain 1 Fremen Influence. Recruit one troop and trash a card.', true, { standardOnly: true }),
  space('Dutiful Service', 'Emperor', 'No cost', 'Gain 1 Emperor Influence and take a contract (or gain 2 Solari without CHOAM or when contracts run out).', false, { standardOnly: true }),
  space('Espionage', 'Bene Gesserit', '1 spice', 'Gain 1 Bene Gesserit Influence, draw a card and place a Spy.'),
  space('Fremkit', 'Fremen', 'No cost', 'Gain 1 Fremen Influence and draw a card.', true, { standardOnly: true }),
  space('Gather Support', 'Landsraad', '0 or 2 Solari', 'Recruit two troops. If you paid 2 Solari, also gain 1 water.'),
  space('Hagga Basin', 'Spice Trade', '1 water', 'Collect bonus spice, then choose 2 spice OR summon one sandworm with Maker Hooks. Check the Shield Wall.', true),
  space('Heighliner', 'Spacing Guild', '5 spice', 'Gain 1 Spacing Guild Influence and recruit five troops.', true),
  space('High Council', 'Landsraad', '5 Solari', 'First visit: take a Council seat for +2 Persuasion on every Reveal. Later visits: gain 2 spice, draw an Intrigue card and recruit three troops.'),
  space('Imperial Basin', 'Spice Trade', 'No cost', 'Gain 1 spice plus accumulated bonus spice. Its controller also gains 1 spice.', true),
  space('Imperial Privilege', 'Landsraad', '3 Solari · 2 Emperor Influence', 'You may discard an Intrigue to draw one. Recall one of your other agents and draw a card. Record the recalled agent in the player panel.'),
  space('Research Station', 'City', '2 water', 'Recruit two troops and draw two cards.', true),
  space('Sardaukar', 'Emperor', '4 spice', 'Gain 1 Emperor Influence. Draw an Intrigue card and recruit four troops.', false, { sixCost: '3 spice', owner: 'Shaddam (six players)' }),
  space('Secrets', 'Bene Gesserit', 'No cost', 'Gain 1 Bene Gesserit Influence and draw an Intrigue card. Each opponent with at least four Intrigue cards gives you one at random.'),
  space('Shipping', 'Spice Trade', '3 spice · 2 Spacing Guild Influence', 'Gain 5 Solari and 1 Influence with a faction of your choice.'),
  space('Sietch Tabr', 'City', '2 Fremen Influence', 'Choose: gain Maker Hooks if you lack them, recruit one troop and gain 1 water; OR gain 1 water and optionally remove the Shield Wall.', true),
  space('Spice Refinery', 'City', '0 or 1 spice', 'Gain 2 Solari, or 4 if you paid 1 spice. Its controller also gains 1 Solari.', true),
  space('Swordmaster', 'Landsraad', '8 Solari; 6 once anyone gains theirs', 'Visit only once per game. Gain your third agent, available immediately and in later rounds. Record it in the player panel.', false, { sixEffect: 'Gain your Swordmaster and a permanent +2-sword Reveal bonus token. Retire the agent at the end of the round in which it is used; keep it if unused. Record acquisition and use in the player panel.' }),
  space('Carthag', 'City', 'No cost', 'Recruit one troop and draw an Intrigue card.', true, { sixOnly: true }),
  space('Controversial Technology', 'Fremen', '2 spice', 'Gain 1 Fringe Worlds Influence. Draw an Intrigue card, draw a card and trash a card.', false, { sixOnly: true }),
  space('Desert Mastery', 'Fremen', 'No cost', 'Gain 1 Fremen Influence. Draw a card and gain 1 spice.', true, { sixOnly: true, owner: 'Muad’Dib' }),
  space('Economic Support', 'Emperor', 'No cost', 'Gain 1 Great Houses Influence and 1 spice. Trade with one teammate: each may give any amount of a single kind of good (Intrigue, spice, water or Solari), or nothing.', false, { sixOnly: true }),
  space('Expedition', 'Fremen', 'No cost', 'Gain 1 Fringe Worlds Influence. Take a contract, or gain 2 Solari if none remain.', false, { sixOnly: true }),
  space('Habbanya Erg', 'Spice Trade', '1 water', 'Gain 2 spice plus accumulated bonus spice. Draw a card.', true, { sixOnly: true }),
  space('Hardy Warriors', 'Fremen', '1 water', 'Gain 1 Fremen Influence. Recruit two troops.', true, { sixOnly: true, owner: 'Muad’Dib' }),
  space('Military Support', 'Emperor', '2 spice', 'Gain 1 Great Houses Influence. Recruit three troops divided between your two Allies; any of these may deploy. This is not a combat space, so it does not grant extra deployment from garrisons.', false, { sixOnly: true }),
  space('Vast Wealth', 'Emperor', 'No cost', 'Gain 1 Emperor Influence and 3 Solari.', false, { sixOnly: true, owner: 'Shaddam' })
].sort((a, b) => a.name.localeCompare(b.name));

export const topics = [
  { title: 'Agent or Reveal?', text: 'Take an Agent turn to play one card and send an available agent to a legal space. Take a Reveal turn to use all remaining cards’ Reveal effects, acquire cards and finish your turns for this round. You may Reveal early, but cannot resume Agent turns afterward.', source: 'main', page: 8 },
  { title: 'Spies: access, infiltration and intelligence', text: 'A Spy Agent icon lets your card access a space connected to one of your Spies without recalling it. To enter a space occupied by another player, recall a connected Spy to infiltrate. Immediately after placing an agent, you may recall a connected Spy to draw a card, before card/space effects. The same Spy cannot perform both recalls. Place new Spies only on empty observation posts; if your supply is empty, you may first recall one for no effect.', source: 'main', page: 11 },
  { title: 'Influence and Alliances', text: 'Reaching 2 Influence gives 1 VP; falling below 2 loses it. Reaching 4 gives the faction’s bonus; the first player there also gains its Alliance and 1 VP. Passing the holder transfers the Alliance and its VP; matching them does not. Rivals gain Alliances but not the printed faction bonus. Update the physical tracks and record score changes here.', source: 'main', page: 7 },
  { title: 'Deploying troops and summoning sandworms', text: 'Combat spaces let you deploy any troops recruited during that turn, plus up to two from your garrison. Troops in the Conflict are worth 2 strength and sandworms 3. Summoned sandworms deploy immediately, never to a garrison. Usually you need Maker Hooks. While the Shield Wall stands, Arrakeen, Spice Refinery and Imperial Basin conflicts cannot contain summoned sandworms.', source: 'main', page: 10 },
  { title: 'Combat rewards and tied strength', text: 'Zero strength earns no reward. A tie for first gives each tied player the second reward and nobody the card. With four/six players and exactly two tied first, the remaining players compete for third; otherwise no further reward. A tie for second gives each tied player third reward. A tie for third gives nothing. With three or fewer players, third reward is only used for tied second. In six-player play, two tied teammates may concede the better reward to one another.', source: 'main', page: 14 },
  { title: 'Sandworm rewards and battle icons', text: 'Any sandworm doubles the Conflict reward you receive, but additional worms do not multiply it again. Control and the battle icon do not double. Paid rewards require another payment to gain a second copy. The winner takes the card and must match its battle icon to another face-up Objective/Conflict if possible: flip the pair for 1 VP. A wild icon is matched at endgame.', source: 'main', page: 14 },
  { title: 'CHOAM contracts', text: 'Take one of two face-up contracts and refill its spot. Without CHOAM, or when all contracts have been taken, the symbol grants 2 Solari. Complete a contract by fulfilling its condition, take its reward and turn it face down. A location contract must already be yours when you send the agent; picking it up later that turn does not complete it. Harvest contracts count all spice gained that turn. Immediate contracts complete on acquisition. Rivals always receive 2 Solari instead.', source: 'main', page: 16 },
  { title: 'Cards, timing and Intrigue', text: 'Card text may override normal rules. Plot Intrigue is played during your own Agent or Reveal turn, Combat Intrigue during Combat, and Endgame Intrigue at the end. Acquired cards normally go to your discard pile. Drawing from an empty deck reshuffles its discard. Trashing may select a card from hand, discard or in play; reserve cards return to their stack. Unspent Persuasion is lost after Reveal.', source: 'main', page: 20 },
  { title: 'Rivals and their resources', text: 'Use physical Rival cards for faction priorities, Signet Ring, Scheme and Swordmaster threshold. A Rival buys its Swordmaster as soon as its total resources reach the threshold, spending Solari, spice, Intrigue then water. Afterward it exchanges 7 Solari, 7 spice, 3 Intrigue or 3 water for 1 VP. Lady Amber and the Beast follow their streamlined card behavior and cannot win. A third Spy triggers a Scheme and recalls the other two; Rivals do not use normal Spy recalls.', source: 'supplement', page: 5, rivalOnly: true },
  { title: 'Commanders, Allies and shared Influence', text: 'A Commander activates the Ally indicated by their agent arrow; the Swordmaster or Reveal allows a choice. Main-board Influence changes, units and swords go to that Ally. For requirements, the Commander has the higher of their Allies’ Influence, even when activating the other. Personal-board Influence stays with its Commander. All Allies use Great Houses for Emperor icons and Fringe Worlds for Fremen icons; Shaddam may instead use his Emperor track, and Muad’Dib his Fremen track.', source: 'supplement', page: 9, sixOnly: true },
  { title: 'Six-player Swordmasters and Throne Row', text: 'Each acquired Swordmaster grants a permanent token worth 2 swords per Reveal. Retire its agent at the end of the round in which it is used, but keep an unused one for later. Commander swords go to their activated Ally. Shaddam can move cards into the Throne Row using printed effects, immediately refilling the Imperium Row. Only his team can acquire Throne Row cards; they are no longer part of the Imperium Row.', source: 'supplement', page: 11, sixOnly: true },
  { title: 'Six-player combat coordination', text: 'Allies fight separately; Commanders never win a Conflict or own its card. Commander effects may deploy or retreat an Ally’s troops even after that Ally has revealed. If an Ally enters a Conflict after having no units at their own Reveal, their earlier swords remain lost. Commander Combat Intrigue applies to one Ally with units. Shared recruitment and deployment count for both Commander and activated Ally.', source: 'supplement', page: 10, sixOnly: true },
  { title: 'Winning the game', text: 'Check at Recall: 10 VP for any individual player, or an empty Conflict deck, triggers endgame. Resolve Endgame Intrigue, then compare scores. In six-player games, compare the sum of all three team members’ scores, not their best player. Tiebreakers are spice, Solari, water, then garrisoned troops; combine these across a team. A tied game can remain tied if all tiebreakers are equal.', source: 'main', page: 15 }
];

export function sourceForPhase(s) {
  if (s.status === 'setup') return 'Main pp. 4–5 · Supplements pp. 3, 8';
  if (s.turn?.type === 'rival') return 'Supplements pp. 4–6';
  return { roundStart: 'Main p. 8', turns: 'Main pp. 8–13', combat: 'Main pp. 14–15', makers: 'Main p. 15', recall: 'Main p. 15', endgame: 'Main p. 15' }[s.phase] + (s.humanCount === 6 ? ' · Supplements pp. 9–11' : '');
}
