# Dune: Imperium — Uprising player guide

Public route: `/dune-imperium/`. A standalone, buildless guide for each player's phone. Serve the repository root over HTTP; the page uses ES modules.

## Experience

- **My turn:** Agent and Reveal walkthroughs, a chosen-space reminder, optional Persuasion/strength scratchpads, and between-turn planning. Finishing Reveal keeps the guide in a waiting state until the player starts the next round or corrects their selection.
- **Board spaces:** filter by any of a card's Agent icons, intended reward, combat access, or search text. Filters produce possibilities, not legal-move validation. Spy access still depends on the actual observation posts; costs, occupancy, requirements and card exceptions are checked on the table.
- **Rulebook:** searchable, categorized explanations, direct links to official PDF pages, and personal bookmarks. Direct topic links use `#rules/<topic-id>`.
- **Preferences:** optional name, 1/2/3/4/6 players, CHOAM, and a six-player Commander/Ally role. Six-player mode requires CHOAM and limits personal board spaces to their Commander.

The guide covers **Uprising**, matching the existing table companion, rather than the original Dune: Imperium board. Other expansions and mixed decks are outside its scope. Solo difficulty and optional Rival variants are explained in the reference, not tracked by the turn guide. Leaders and card text are resolved physically.

## Independence and persistence

The `/dune/` table companion is unchanged. This directory has its own application, styles, rule data and storage key; it imports no code from `/dune/` and never reads or writes the shared companion's save.

The versioned key `dune-imperium.player-guide.v1` stores preferences, rule bookmarks, the selected board space, walkthrough step and whether the player has Revealed. Each browser is independent: no room code, backend or cross-phone synchronization. Multiple tabs in the same browser share that browser's saved guide. Filters and calculator scratchpads are temporary. Calculator inputs are entered manually and never update the physical game or companion.

Unavailable storage produces a visible notice while keeping the guide usable. Invalid or unsupported saves are preserved until the user explicitly resets this guide. Starting a new game resets only turn progress, keeping preferences and bookmarks. There is no offline service worker; official PDFs and optional Google Fonts require a connection.

## Rule sources

The initial reference was adapted from the existing companion's audited Uprising rule data, then separated from its table-management instructions. Publisher sources were checked on November 9, 2026:

- [Main rulebook, October 12, 2023](https://d19y2ttatozxjp.cloudfront.net/pdfs/DUNE_IMPERIUM_UPRISING_Main_Rulebook_23-10-12.pdf): Influence and Intrigue p. 7; card anatomy and turn choice p. 8; Agent turns pp. 9–11; Reveal pp. 12–13; Combat pp. 14–15; contracts p. 16; additional terms p. 20. Strength may be set at any point during Reveal effects; the walkthrough's strength screen is a check, not a timing restriction.
- [Combined supplements, October 12, 2023](https://d19y2ttatozxjp.cloudfront.net/pdfs/DUNE_IMPERIUM_UPRISING_Rules_Supplements_23-10-12.pdf): standard spaces pp. 1–2; Rivals pp. 3–6; teams pp. 7–11; six-player spaces p. 14. Hagga Basin begins PDF page 2. Sardaukar's six-player cost is on page 2.
- [Publisher FAQ, January 13, 2025](https://d19y2ttatozxjp.cloudfront.net/pdfs/DUNE_IMPERIUM_FAQ_25-1-13.pdf): selected clarifications are labeled as FAQ entries, including contract timing, Alliance loss, drawing during Reveal, and Spy recalls.
- [Publisher resources](https://www.direwolfdigital.com/dune-imperium/resources/).

References use PDF page numbers, not the separately numbered supplement booklets. Some mobile PDF viewers ignore `#page`; each link also displays its target page. Printed card text and official rulings take precedence. No official artwork or rulebook PDFs are redistributed.

## Files and verification

- `app.js`: accessible interface, navigation, profile and persistence.
- `guide.mjs`: filters, mode-specific turn instructions, save validation and calculator arithmetic.
- `rules.mjs`: standalone board-space and rule reference data.
- `styles.css`: responsive dark desert theme, touch controls and reduced-motion support.

From the repository root:

```sh
npm run build
npx playwright test --config=dune-imperium/playwright.config.cjs
```

The focused configuration runs Chromium at desktop/phone sizes and WebKit with an iPhone viewport. Tests cover complete Agent/Reveal flows, selected destinations, combined filters, Commander roles, bookmarks and links, saved progress, corrupt/blocked storage, independence from the table save, keyboard controls, safe name rendering and widths from 320 to 1440 pixels. Screenshots are generated in ignored test artifacts without replacing the site's existing visual baselines.
