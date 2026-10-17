# Next Turn

A personal board game field guide researched on 17 October 2026 and expanded on 18 October 2026.

## Open

Unzip the download, then open `next-turn/index.html` in a modern browser. No install, build step or account is required. Keep `index.html`, `styles.css`, `app.js`, `data.js` and `assets/` together.

For a local server, run this command inside `next-turn/`, then open http://localhost:8000:

```sh
python3 -m http.server 8000
```

The 23 game records, original 22-game play log and source links are in `data.js`. Read `research-notes.md` for a plain-text version. Edit `data.js` to update ratings, release dates or recommendations later. The site can be served as static files on any host.

## Use

- Browse thirteen established matches, four upcoming launches/retail arrivals, a recent-release Essen demo bonus, and five different strategic experiments.
- Filter by player count, maximum full-game duration, BGG complexity, randomness and confirmed demos. Unknown complexity is excluded by an active maximum filter. Dune's six-player team mode is supported; five players is excluded.
- See a dated price on every card and in comparisons. Open a game for edition, language, source and expansion details, including what changes gameplay, what is bundled and what is cosmetic.
- Select up to three games to compare side by side. Two selections enable the comparison button. On narrow screens, scroll the comparison table horizontally.

Photos and core functionality are local; optional Google web fonts and outbound links need internet. System fonts provide an offline fallback.

## Research limits

Fit scores are editorial judgments from a small, mixed-signal history, not probabilities. BGG ratings and weights are dated snapshots. Direct BGG reads sometimes returned 403, so readable search-index data and community comments were used. Upcoming review evidence is limited. Valhalla's average includes admitted unplayed ratings and should be interpreted cautiously.

Only Entropy has an explicitly verified playable 2026 Essen demo in this guide (Frosted, Hall 3, 3G300). Other listed booth/demo details are qualified in each record. Recheck event plans and language at the show. Valhalla's November 6 date is US retail; backer copies already exist, and other regions can differ. The old Valhalla Essen announcement is from 2025, not 2026.

Photos are real publisher/promotional/retailer assets with individual source credits. Santorini imagery shows a current edition; statistics are for the original 2016 BGG entry. The static guide is tracked and published through the repository’s normal push workflow.

## Prices and add-ons

All 23 recommendations have `commerce` data in `data.js`: a sourced price reference and dated expansion/add-on notes. Euro listings are preferred where verified, with USD/GBP explicitly labeled. Quotes distinguish retail, MSRP, show prices and preorder bundles, and name the priced language and edition. Shipping and checkout taxes may be extra. Each add-on explains its contribution and compatibility; bundled modules are marked to avoid duplicate purchases. No additional expansion verified is not a claim that none exists. The original 22-game play log is unchanged.

## Omission audit

`omission-audit.md` records the 20-candidate screen, nine additions, score calculations and reasons for holding back eleven alternatives. The new game records include euro prices, expansion notes, credited local images and individual snapshot dates. The Sources & Methodology dialog links the audit and opens each added game. Original fit scores and the 22-game play log are preserved; category ranks update to include the additions.
