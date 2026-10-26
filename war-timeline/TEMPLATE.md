# History through stories: reusable war timeline

This is the source guide for the three-layout demo at `/world-war-i/`. All current titles, events, dates, and scores are fictional. Do not treat them as WW1 research. The owner must approve a layout before researching and replacing the demonstration content.

## Architecture and source of truth

- `war-timeline/build.py`: dependency-free Python 3 generator. It reads a page folder's `data.json` and writes three complete static HTML pages.
- `war-timeline/templates/`: a shared HTML shell and three distinct layouts (`chart`, `vertical`, `watchlist`).
- `war-timeline/styles.css` and `app.js`: shared presentation and progressive enhancement. Content, layout navigation, title links, and date explanations remain usable without JavaScript.
- `world-war-i/data.json`: the demo content source. Entry array order is the suggested viewing order; event array order is chronological.
- Generated HTML is committed because the site's deployment serves these standalone files directly. The Eleventy build does not generate these pages.

Do not hand-edit the generated HTML. Change the data, templates, or shared assets and regenerate. Do not maintain copies of the shared CSS and JS in each war folder.

## Generate and preview

From the repository root:

```sh
python3 war-timeline/build.py world-war-i
python3 -m http.server 4175 --bind 127.0.0.1
```

Compare:

- `http://127.0.0.1:4175/world-war-i/`: chart and reading list.
- `http://127.0.0.1:4175/world-war-i/vertical/`: year rows with five numbered coverage lanes.
- `http://127.0.0.1:4175/world-war-i/watchlist/`: viewing cards with individual coverage strips.

The chart uses equal-width year buckets, including both endpoint years. A single-year story occupies one bucket. The vertical layout groups events within each year; row height follows the event notes, so lane length is not a precise elapsed-time scale. Mobile keeps five compact numbered lanes beside the notes. The overview chart scrolls within its own region on narrow screens; the document itself should not scroll horizontally.

## Content contract

Top-level fields:

| Field | Meaning |
| --- | --- |
| `slug` | Target page identifier, e.g. `world-war-ii`; the CLI folder argument determines output location. |
| `title`, `subtitle` | Page heading and introduction. |
| `demo` | `true` displays fictional-content notices and sample-score labels; `false` displays the production introduction and IMDb labels. |
| `startYear`, `endYear` | Inclusive integer bounds for all coverage intervals and events. Include the relevant prewar period. |
| `events` | Chronologically ordered event records. |
| `entries` | Viewing entries in editorial watch order, independent of release order. |

Each event has a unique `id`, integer `year`, `title`, and `description`. Optional `sources` is an array of `{ "label": "...", "url": "https://..." }` objects for historical evidence.

Each viewing entry has:

| Field | Meaning |
| --- | --- |
| `id`, `title`, `releaseYear` | Stable unique ID, exact title, and release year, separate from story dates. |
| `format` | `Film` or `Series`. |
| `minutes` | Film runtime in minutes. |
| `episodes`, `episodeMinutes` | For a series: recommended episode count and average episode runtime. The header counts their product toward total viewing time. Explain partial-series selections in the premise. |
| `rating` | Display score string. Fictional in demo mode; verified IMDb score in production. |
| `imdbUrl`, `ratingChecked` | Optional direct IMDb title URL and date checked, required editorially for researched entries. |
| `color` | Readable, dark CSS hex colour for its numbered key and coverage marks. |
| `coverage` | Array of inclusive `[startYear, endYear]` pairs. Example: `[[1914,1914],[1917,1918]]`. Keep intervals ordered and non-overlapping. |
| `events` | Array of related event IDs. These are editorial connections, not automatically inferred from the date range. |
| `premise`, `learn` | Short synopsis and what this selection contributes to understanding the conflict. |
| `coverageNote` | Explain the story-date evidence, uncertainty, exclusions, and any substantial jumps. |
| `sources` | Optional evidence links in the same format as event sources. |

Use plain text for content, not HTML. URLs must be absolute HTTP(S) links. Stable IDs must be lowercase letters, digits and hyphens. The generator escapes content and rejects broken event references or out-of-bounds coverage.

## What “main-story coverage” means

Include years with a substantial part of the central story. Exclude a brief prologue, a remembered childhood moment, a framing interview, or an old-age epilogue. A story mainly in 1918 with a closing scene in 1958 has `coverage: [[1918,1918]]`.

Separate substantial story sections into separate intervals when intervening years are absent. Do not stretch one bar across a jump. For uncertain dates, use only a defensible year range and explain the uncertainty in `coverageNote`; the UI is year-level rather than day-level precision.

A title's date span is not proof that it depicts every event within that period. Associate event IDs only when the story meaningfully depicts or illuminates them, and make clear when its connection is contextual. Multiple entries can connect to one event and one entry can connect to multiple events. Event cards automatically link to their associated titles.

## Create another war page

After the owner approves a layout:

1. Retain the approved layout as the default; remove the alternative pages and comparison navigation as part of that explicit follow-up, preserving the shared content contract and coverage semantics.
2. Create a new root-level folder, e.g. `world-war-ii/`, and copy the content file as a scaffold. Replace its title, slug, timeline bounds, events, and entries completely. Do not carry fictional content into the new page.
3. Research a short watchlist of at most five or six films/series. IMDb scores are a proxy for engaging viewing, not historical reliability. Record a direct IMDb title link and the score-check date. Account for the full proposed viewing commitment, especially for series.
4. Begin before the war and curate its principal turning points. Prefer useful coverage and varied perspectives within the viewing budget; acknowledge important gaps rather than inventing a match or quietly exceeding the title limit. Dramatization is acceptable; explain major simplifications where they affect learning.
5. Verify event context and main-story dates using credible historical sources and film/episode evidence. Supply event and entry source links. Set `demo` to `false` only when researched content is ready.
6. Run `python3 war-timeline/build.py world-war-ii` (or the target folder). Shared asset paths work for root-level war folders and their nested layout pages.
7. Manually inspect desktop and mobile, links, highlighting, separate coverage intervals, and overflow. Run `npm run build` and `git diff --check`. Do not add or run automated tests unless the owner changes that instruction.
8. Commit the target page's content and generated HTML plus any intentional shared-template changes. Inspect outgoing commits and push only requested work. Do not commit caches, local servers, preview captures, or unrelated changes.

### Prompt for a future chat

> Use `war-timeline/TEMPLATE.md` in this repository to create a history-through-film page at `/world-war-ii/`, using the approved timeline layout. Begin before the conflict, explain its key events, and recommend no more than five or six engaging films/series using verified IMDb scores as a proxy. Show main-story coverage only, preserve gaps and overlaps, and record sources. Do not create or run automated tests. Follow the repository's Git delivery instructions.

## Current approval boundary

The three demo layouts deliberately share the exact same data and visual language. They differ in information hierarchy and mobile arrangement. No real WW1 recommendations, film availability claims, posters, embedded trailers, progress tracking, search, or filters have been added. Homepage navigation is unchanged.
