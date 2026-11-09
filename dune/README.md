# Dune: Imperium — Uprising companion

Public route: `/dune/`. This is a standalone, buildless page in the existing static site. Serve the repository root and open that route; `file://` is not supported because the app uses ES modules.

## What it records

One shared browser records the table, player names/colors/optional Leaders, seating, game options, round, phase, active turn, agent tokens, manually entered VP, checklist progress and up to 30 undo snapshots. One current game is stored in `localStorage` at `dune-uprising.session`, with a versioned payload. Setup drafts and completed games also persist. Saves can be downloaded and imported from Game menu. Storage failures are visible; unreadable or unsupported saves are preserved for recovery instead of being overwritten.

Cards, resources, Influence, board occupancy and combat strength remain on the physical table. Board-space help explains conditions but does not calculate legal moves. Combat is a checklist, not a calculator. The app does not randomize or replace House Hagal. No accounts, backend, multiplayer synchronization or offline service worker are included.

## Rules and mode coverage

The source texts are the October 12, 2023 PDFs supplied by the owner, also available from Dire Wolf:

- [Main rulebook](https://d19y2ttatozxjp.cloudfront.net/pdfs/DUNE_IMPERIUM_UPRISING_Main_Rulebook_23-10-12.pdf)
- [Combined supplements](https://d19y2ttatozxjp.cloudfront.net/pdfs/DUNE_IMPERIUM_UPRISING_Rules_Supplements_23-10-12.pdf)
- [Publisher resources and FAQ](https://www.direwolfdigital.com/dune-imperium/resources/)

References in the companion use PDF page numbers, which differ from printed page numbers in the combined supplement. Explanations are condensed and the supplied 2023 rules are the documented version, not a promise to incorporate later rulings automatically. Selected clarifications from the January 13, 2025 publisher FAQ are explicitly labeled. Card text and official rulings take precedence. See [the rule-by-rule audit](RULES_AUDIT.md) for coverage, corrections and physical-table boundaries.

| Area | Source |
| --- | --- |
| Initial supply, scores, Objectives | Main pp. 4–5; supplement pp. 3, 8 |
| Round/Agent/Reveal turns, spies, deployment | Main pp. 8–13 |
| Combat, ties, sandworms, battle icons | Main pp. 14–15; supplement p. 11 |
| Makers, Recall, endgame | Main p. 15; supplement p. 11 |
| Contracts and additional terms | Main pp. 16, 20 |
| Standard board spaces | Supplement pp. 1–2 |
| Solo/two-player Rivals and variants | Supplement pp. 3–6 |
| Six-player setup, Commanders, shared effects | Supplement pp. 7–11 |
| Six-player board spaces | Supplement p. 14 |

Supported player counts are 1, 2, 3, 4 and 6. CHOAM is optional for 1–4 and mandatory for 6. Solo supports all four difficulties plus optional Row churn; the three advanced Rival variants are also available individually. Two-player setup supports standard or streamlined Rivals. Other expansions and mixed decks are not supported.

Six-player seating uses a fixed clockwise ring starting at Muad’Dib at the bottom: opposing Ally, friendly Ally, Shaddam, friendly Ally, opposing Ally. The initial first player is an Ally selected from the physical Objective. Later rounds rotate through every seat. Commander arrows activate the same-team player two seats clockwise (left) or counterclockwise (right). Swordmasters permit one placement per game, including when recalled. Used Swordmasters retire at Recall even if recalled earlier that round; unused ones carry over. The permanent Reveal bonus remains.

## Code and verification

- `engine.mjs`: pure transitions, mode rules, agent identities and save validation.
- `rules.mjs`: teaching steps, board-space reference and source mapping.
- `app.js`: DOM rendering, event handling, persistence, corrections and backups.
- `styles.css`: light desert theme, iPad/MacBook layouts, touch and keyboard controls.

From the repository root:

```sh
node --test dune/tests/engine.test.mjs
npx playwright test tests/dune.spec.js
npx playwright install webkit
npx playwright test --config=dune/playwright.config.cjs
npm run build
npm run test:visual
```

The browser tests exercise all player counts, a full round, early Reveal, Rivals, Commander activation, upgrades/recalls, corrections, final scoring, refresh/new-tab restoration, backup import/export, corrupted/blocked storage, safe rendering of names and keyboard use. Screenshots at iPad landscape/portrait, MacBook and phone sizes are produced as test artifacts for visual review, without altering the main site's existing snapshot baselines.
