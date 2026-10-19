# To the Limit

Standalone static tennis archive at `/tennis/index.html`. Open through a static HTTP server; no framework, database, API key or build step is needed to serve it. The committed HTML contains the whole timeline, and JavaScript only enhances click-to-load video playback.

## Editing

Edit `matches.json`, then run `python3 tennis/build.py` from the repository root to regenerate `index.html`. Styles and browser interactions live in `styles.css` and `app.js`. The site's existing Eleventy builds leave this standalone directory in place.

## Curation and research

Snapshot researched on 19 October 2026 from [the supplied playlist](https://www.youtube.com/playlist?list=PLBrgqZ_qXv7EuHWi05VrZgjKb2f8pXIpP).

- 56 public playlist videos cover 54 distinct matches. The extra Federer–Nadal 2019 closing-game clip and Alcaraz–Djokovic 2023 marathon-game clip are grouped with their matches.
- Eight additions: Borg–McEnroe, Wimbledon 1980; Lendl–McEnroe, Roland-Garros 1984; Capriati–Hingis, Australian Open 2002; Venus Williams–Davenport, Wimbledon 2005; Serena Williams–Dementieva, Wimbledon 2009; Halep–Kerber, Australian Open 2018; Osaka–Kvitová, Australian Open 2019; Świątek–Muchová, Roland-Garros 2023.
- All additions use official tournament channels. Extended highlights are preferred over short cuts; the official Halep–Kerber match highlights are used instead of its full-match replay.
- Three playlist matches have fuller primary highlight cuts: Agassi–Blake 2005 (USTA extended highlights instead of only the tiebreak), Federer–Kyrgios 2017 (Tennis TV extended highlights instead of the retrospective), Alcaraz–Sinner 2025 (Roland-Garros extended highlights instead of the full replay). Original playlist videos remain linked in each entry.
- Match sources are in each entry's expandable sources section and in `matches.json`. Research uses official tournament archives, WTA/ATP reports and the selected footage. Reasons for inclusion are original editorial assessments, not quotations or an objective ranking. Historic playlist entries that are less close contests are identified as such.
- Dates refer to match play, not YouTube uploads; overnight and suspended matches can span calendar days. The collection is a curated snapshot, not an automatic playlist sync or an exhaustive history.

`video-audit.json` records public watch-page metadata for all 67 distinct linked videos and the 56 original playlist video IDs. At the audit, all returned `status: OK` and `playableInEmbed: true` (stored as `isEmbeddable`). This validates metadata, not universal playback: regional restrictions, browser policies, consent screens and later rights changes can affect viewing. Every embedded selection has a direct YouTube fallback link.

Only a selected player loads on click, through `youtube-nocookie.com`; loading a new player removes the previous one. Thumbnails load from YouTube. With JavaScript disabled, the static match archive and native lazy-loaded embeds remain available.

## Validation

- `npm run build`
- `npx playwright test tests/tennis.spec.js --reporter=list`

The tests cover desktop and mobile widths, all original playlist IDs, chronological order, one-player-at-a-time loading, the absence of search/filter controls and sidebar, and the no-JavaScript archive. Player network responses are stubbed in UI tests to verify our interaction deterministically; the metadata audit is separate.
