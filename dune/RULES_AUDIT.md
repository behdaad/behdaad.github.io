# Uprising rules audit — November 9, 2026

Audited the supplied October 12, 2023 main rulebook (20 PDF pages) and combined supplements (14 PDF pages), including illustrated board text. Page numbers below are PDF pages, not the supplement’s separately numbered booklets.

The companion supports base Uprising, CHOAM, 1–2-player Rivals, 3–4-player games and six-player teams. It automates turn/phase order, agents and manually recorded scores. Cards, resources, Influence, occupied spaces, unit deployment and combat resolution remain physical, with checklists and searchable guidance. This audit does not turn the companion into a complete digital implementation of every printed card.

Sources:

- [Supplied main rulebook](https://d19y2ttatozxjp.cloudfront.net/pdfs/DUNE_IMPERIUM_UPRISING_Main_Rulebook_23-10-12.pdf)
- [Supplied combined supplements](https://d19y2ttatozxjp.cloudfront.net/pdfs/DUNE_IMPERIUM_UPRISING_Rules_Supplements_23-10-12.pdf)
- [Publisher FAQ, January 13, 2025](https://d19y2ttatozxjp.cloudfront.net/pdfs/DUNE_IMPERIUM_FAQ_25-1-13.pdf), linked by the publisher’s support page when checked. Selected clarifications are labeled separately in the field guide.

## Corrections made

- **Six-player Swordmaster reuse:** a recalled Swordmaster could previously be placed again in the same round. The supplement specifies a single use per game (pp. 11, 14). It is now excluded from available agents after its first placement, with the permanent Reveal bonus retained. A legacy save paused at an illegal second placement returns to the turn picker; names, round, scores, upgrades and undo history are preserved.
- **Six-player board text:** added the illustrated rules missing from extracted PDF prose: Shaddam’s team cannot gain Maker Hooks; one of Muad’Dib’s Allies gaining hooks also grants them to the other Ally; Shaddam starts his Throne Row with a non-Fremen market card and refills the market (supplement p. 9). Added personal-track team rewards, ownership of bonuses and public communication guidance.
- **Streamlined Rivals:** entering Lady Amber Metulli or Glossu “The Beast” Rabban as a Rival now excludes that seat from endgame triggering and standings even without the checkbox. Two-player custom names still use the explicit toggle. A named streamlined card in solo excludes only that Rival; the other opponent can still score and win.
- **House Hagal:** corrected the overbroad implication that Imperial Basin can summon sandworms. Added conditional destinations, typed and priority-based Spy placement, immediate Schemes, troops recruited before placement, hooks-dependent Wall removal, immediate resource spending and lowest-Influence selection. Uprising Expert Deployment uses the supplement’s three-unit lead rule.
- **Contracts:** added the Maker-space requirement for Harvest, the next-acquisition trigger for The Spice Must Flow, and keeping completed contracts for later card effects.
- **Timing and reference gaps:** added Fremen Bond, Influence/Alliance requirements, one-faction double Influence, optional trashing, hand-only discard, acquire effects, Leader setup/timing clarifications, control bonuses, finite troop supplies, retreat versus cleanup, swords without units, own-agent occupancy and the doubled Influence-reward exception.
- **FAQ clarifications:** added labeled reminders for Alliance loss, the final individual Reveal-order tiebreak, drawing during/after Reveal and Spy recall limits. The supplied six-player rules specify combined resource tiebreaks but no further team criterion; the companion does not invent one.
- **Transition safety:** beginning/finishing another seat’s turn and assigning a human a Rival turn are rejected. Standard games cannot acquire a six-player-only retired agent state through corrections.

## Coverage by rule section

“Guided” means a checklist/reference explains the rule and players resolve it on the physical table. It does not mean the app can validate an unseen card, cost, token or board position.

| Source | Rules checked | Implementation / boundary |
| --- | --- | --- |
| Main pp. 1–3 | Introduction and component inventory | Physical components; setup guidance does not replace an inventory check. |
| Main pp. 4–5 | Board, decks, market, Leaders, supplies, Objectives, first player | Guided setup; engine enforces supported counts, starting VP, seats and first-player eligibility. |
| Main pp. 6–7 | Victory, deck building, Leaders, Influence, Alliances, Intrigue | Phase/endgame engine plus guided effects and manual VP updates. Bonus retention and repeat crossings are documented. |
| Main p. 8 | Round start, draw five, Agent/Reveal choice | Phase/turn engine; physical Conflict reveal, defensive troop and card draws. |
| Main pp. 9–11 | Agent icons, costs, occupancy, effects, deployment, control, sandworms, Spies | Guided Agent checklist, board reference and searchable reminders. Agent availability/recalls tracked; legal destinations checked on table. |
| Main pp. 12–13 | Reveal, purchases, acquire effects, combat strength, cleanup | Engine skips Revealed players; checklist explains resolution, purchases and cleanup. Hand, Persuasion and strength are physical. |
| Main pp. 14–15 | Combat Intrigue, rewards/ties, doubling, battle icons, cleanup | Combat checklist covers player-count differences and six-player concessions. No combat calculator, as agreed. |
| Main p. 15 | Makers, Recall, endgame and resource tiebreaks | Makers checklist; engine recalls agents, rotates initiative, checks individual 10 VP/deck exhaustion/round limit and totals scores. Tiebreak winner entered manually. |
| Main p. 16 | CHOAM setup, contract acquisition and four completion types | Mode-dependent setup/turn reminders and complete contract-type reference. Contracts remain physical. |
| Main p. 17 | Feyd, Jessica, Margot, Irulan, Shaddam, Spacing Guild’s Favor | All listed rules clarifications included in searchable reminders; relevant setup/turn reminders included. Strategy tips are not automated decisions. |
| Main p. 18 | Mixing other products | Outside the agreed base-Uprising scope; expansion/mixed decks remain explicitly unsupported. |
| Main p. 19 | Credits | No gameplay logic. |
| Main p. 20 | Icon glossary and additional terms | Covered through phase reminders, board spaces and searchable topics; card-specific amounts/conditions remain printed on the cards. |
| Supplement pp. 1–2 | All 22 standard board spaces | Searchable effects, costs, requirements and combat labels, checked against each entry. |
| Supplement p. 3 | Rival setup, Objectives and four difficulties | Engine creates the correct Rival seats and limits the human Swordmaster at Expert+; setup/variant guidance covers remaining physical adjustments. |
| Supplement p. 4 | Rival turns, Hagal effects, Spies, conditional destinations | Engine never gives Rivals Reveal turns; guided physical deck resolution and placement. Two-player order always puts the Rival between humans. |
| Supplement p. 5 | Resource spending, schemes, Maker spaces, combat, control, rewards | Guided rules and manual upgrades/VP. Resource-exchange icons visually checked: 7 Solari / 7 spice / 3 Intrigue / 3 water per VP. |
| Supplement p. 6 | Smart Politics, Brutal Escalation, Expert Deployment, streamlined Rivals, solo churn | Mode/difficulty-dependent checklists and reference; streamlined standings/endgame exclusion enforced. Expansion-specific Hagal changes excluded with expansions. |
| Supplement pp. 7–8 | Six-player teams, seating, Commander supplies, setup, Objectives, nine-card deck | Engine enforces alternating teams, fixed Commanders, initial Ally initiative, CHOAM and nine-round maximum; physical setup guided. |
| Supplement p. 9 | Ally activation, personal boards, illustrated team abilities, communication | Engine maps directional tokens and validates chosen Allies. Shared effects, personal/team rewards, hooks and Throne Row setup guided. |
| Supplement p. 10 | Shared Influence, dual-purpose faction icons, shared units, trade, reinforce | Guided Commander turns and searchable reference. Personal spaces marked Commander-only. |
| Supplement p. 11 | Swordmasters, Throne Row, Combat Intrigue, Ally ties, team endgame | Single placement/retirement/bonus tracked; combat and card rules guided. Team scores summed; individual 10 VP triggers endgame. |
| Supplement pp. 12–13 | Six-player combinations with other products | Outside agreed scope, including Epic and Go to 11. No implicit support for altered decks, tracks or scoring thresholds. |
| Supplement p. 14 | Six-player board spaces and icons | All additions and replacements checked. Six-player reference has 28 spaces including four personal spaces, correct Sardaukar cost and single-use Swordmaster. |

## Validation

- 20 engine tests pass, including complete games through the final Conflict for every supported player count, turn order, early Reveal, Swordmaster acquisition/recall/retirement, mode-specific endgame, corrections and version-1 save restoration.
- 32 Chromium browser cases pass across desktop and phone; 16 WebKit cases pass with the iPad configuration.
- Browser regressions exercise actual single-use Swordmaster UI after refresh, named streamlined Rival exclusion, searched rule text/source links, six-player hooks guidance, partial progress, undo, import/export and storage failures.
- Site build, JavaScript syntax and whitespace/diff checks pass. Responsive screenshots inspected separately from assertions.

No new saved-game schema or storage key is required. Previously completed physical actions are not retroactively reversed; the manual correction tools remain available to reconcile a saved game with the table.
