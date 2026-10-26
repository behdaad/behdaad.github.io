# History through stories: reusable war timeline

The approved layout is **chart + reading list**, selected on 26 October 2026. `/world-war-i/` is the first researched page. The vertical and watchlist-first alternatives have been removed from both the published pages and the shared templates. Do not recreate them when making another war page.

## Source of truth

- `war-timeline/build.py` reads a page folder's `data.json`, combines `templates/shell.html` and `templates/chart.html`, and writes a complete static `index.html`.
- `war-timeline/styles.css` and `app.js` are shared across war pages. JavaScript enhances relationship highlighting; reading, title anchors, and native date-note disclosures work without it.
- Each war has its own root-level folder and content file, e.g. `world-war-i/data.json`. Entry array order is suggested viewing order; events are ordered chronologically, including events within the same year.
- Commit the source data and generated HTML: the existing Eleventy build leaves these standalone pages in place and does not generate them.

Asset URLs include content hashes to refresh cached styles and interactions. When shared assets change, regenerate every existing war page so its versioned URLs update.

Do not hand-edit generated HTML or duplicate the shared styles. The reusable unit is **one new content folder pointing to the same renderer and assets**, not a separately maintained copy of the entire design.

## Generate and preview

From the repository root:

```sh
python3 war-timeline/build.py world-war-i
python3 -m http.server 4175 --bind 127.0.0.1
```

Open `http://127.0.0.1:4175/world-war-i/`. Use Python 3.9 or newer; no third-party Python packages are required.

The chart uses equal-width, inclusive year buckets. A single-year story occupies one bucket. Separate intervals produce separate bars, with visible gaps. Every title has its own row, so overlaps align against the same axis. Event markers are grouped by year, with numbers matching the event notes below. Several events can occupy the same year without shifting markers into another year's column.

Longer timelines automatically widen the chart to keep year labels and single-year spans legible. On mobile only the chart scrolls horizontally. Cards, events and explanatory text fit the viewport. Keep the 17px default body size, keyboard access, readable labels alongside colour, and reduced-motion support. Do not add layout comparison controls, a sidebar, search, filters or homepage navigation without a request.

## Content contract

Use ordinary text, not HTML. Stable IDs contain lowercase letters, digits and hyphens. URLs are absolute HTTP(S) links. The generator escapes text and checks IDs, event references, coverage bounds, interval order and six-digit hex colours.

### Page fields

| Field | Meaning |
| --- | --- |
| `slug` | Page identifier, such as `world-war-ii`; the CLI folder argument determines output location. |
| `title`, `subtitle` | Heading and short viewing-route introduction. |
| `startYear`, `endYear` | Inclusive integer bounds. Include a meaningful prewar context stop, even if no film's central story takes place that early. |
| `researchDate` | Date of the editorial research, `YYYY-MM-DD`. |
| `introNote` | Selection size, total commitment/edition assumptions, rating snapshot date and method. |
| `scopeNote` | Honest limits of this short route: omitted theatres, perspectives or themes. |
| `closingNote` | War-specific ending/aftermath context. Keep historical claims in page data, not the shared shell. |
| `events` | Chronologically ordered event records. |
| `entries` | Viewing entries in suggested watch order, within the user’s requested title budget. WW1 uses six; WWII began with twelve and was expanded to twenty at the owner’s request. |

### Event fields

Each event has a unique `id`, integer `year`, `title`, `description`, and `sources`. Optional `dateLabel` supplies a human-readable date or interval; `year` is the chart-marker anchor, normally the start year. Explain multi-year event spans in `dateLabel` and the description.

`sources` is an array of `{ "label": "Source title", "url": "https://..." }` objects.

Use optional `gapNote` for essential history not directly depicted by any selection. Do not invent a film connection simply to populate a card. The event still appears in the timeline and can be selected, with an explicit no-selected-title message.

### Viewing-entry fields

| Field | Meaning |
| --- | --- |
| `id`, `title`, `releaseYear` | Stable ID, exact title and release year. Release year is separate from story dates. |
| `format` | `Film` or `Series`. |
| `minutes` | Film runtime in minutes for the specified edition. |
| `episodes`, `episodeMinutes` | Recommended episode count and average runtime for a series. Their product contributes to the approximate total. State whether the complete series or particular episodes are intended. |
| `rating`, `imdbUrl`, `ratingChecked` | IMDb score string, canonical HTTPS IMDb title URL with trailing slash, and date checked. Record indexed/cached evidence limits in the research notes when applicable. |
| `color` | Dark, readable six-digit CSS hex colour for the title and coverage marks. |
| `coverage` | Inclusive `[startYear, endYear]` pairs, ordered and non-overlapping. Example: `[[1914,1914],[1917,1918]]`. |
| `events` | Related event IDs, assigned editorially rather than inferred automatically from dates. |
| `eventNotes` | Optional object mapping event IDs to short relationship labels: e.g. `{ "origins": "Background", "somme": "Later context" }`. Without a label, the event link reads “Watch for this event”. |
| `premise`, `learn` | Short setup and why this title helps someone understand the conflict. Avoid major fictional plot spoilers. |
| `coverageNote` | Evidence for main-story dates, jumps and exclusions; important dramatic liberties or uncertain dates. |
| `sources` | Evidence links in the same format as event sources. Rendered inside the story-date disclosure. |

Keep selections grounded in the historical course of the conflict. Dramatised characters, dialogue and missions are acceptable; alternate-history plots that rewrite major events or the war’s outcome are excluded unless explicitly requested.

IMDb links and dates are required. Scores are a proxy for engaging viewing, not for historical reliability. Record exact film identity and edition; do not substitute a remake, documentary, or similarly named series without checking.

## Main-story coverage rules

Include years containing a substantial part of the central story. A brief prologue, remembered childhood, framing interview or old-age epilogue does not extend a bar. A story mainly in 1918 with a closing scene in 1958 gets `[[1918,1918]]`.

Separate substantial story sections when intervening years are absent. Never stretch a bar across an unsupported gap. At year-level precision, a 1917 opening and a jump to November 1918 may be represented by `[[1917,1918]]`; the note must explain the jump and where most of the action occurs. If an opening is merely a framing scene, exclude it.

Examples from the researched WW1 page:

- `37 Days`: `[[1914,1914]]`. The July Crisis begins before the war, within the same calendar year. Linking prewar background does not extend the bar into 1913.
- `Lawrence of Arabia`: `[[1916,1918]]`. The brief opening in 1935 is excluded.
- `1917`: `[[1917,1917]]`. Its link to the 1916 attrition note is labelled “Later context”; the film does not depict the Somme or Verdun.

A date span alone never proves an event appears on screen. Use relationship labels and event prose to distinguish depiction from historical background. Show essential gaps explicitly rather than exceeding the requested title budget or implying coverage that does not exist.

## Make another war page

1. Read this guide and the existing page's research notes. Create a new root-level folder such as `world-war-ii/`, copying only the content file as a scaffold.
2. Replace **all** war-specific metadata, dates, events, titles, IMDb IDs, coverage, explanations and sources. Reuse the shared renderer and assets unchanged unless the new content exposes a concrete limitation.
3. Research the number of engaging films/series requested by the owner; default to five or six when no budget is specified. Record IMDb scores with dates, total viewing commitment and any edition or episode assumptions. Prefer complementary coverage rather than several interchangeable depictions of the same moment.
4. Begin before the conflict, explain its principal turning points, and acknowledge omitted events and perspectives. Dramatization is acceptable; explain major liberties that might otherwise teach a false lesson.
5. Verify main-story dates through film/episode evidence, production/distributor information and reliable film references. Use museum, archive, scholarly or comparable historical sources for event context. Add a short `research/README.md` explaining evidence and curation decisions.
6. Run `python3 war-timeline/build.py world-war-ii` and preview the resulting page.
7. Manually inspect desktop and mobile, title/event links, highlighting, date disclosures, overlap and gaps, and overflow. Run the existing site build and `git diff --check`. **Do not add or run automated tests unless the owner changes that instruction.**
8. Commit the new content, research notes and generated HTML, together with any intentional shared-template changes. Explicitly stage requested paths, inspect outgoing commits, and push under the repository's standing Git authorization. Leave unrelated work untouched.

### Prompt for a future chat

> Use `war-timeline/TEMPLATE.md` in this repository to create a history-through-film page at `/another-war/` using the approved chart + reading list layout. Begin before the conflict and explain its key events. Recommend a short route within my requested title budget (default five or six) using dated IMDb scores as a proxy. Show main-story coverage only, preserve gaps and overlaps, distinguish depiction from context, and record sources. Do not create or run automated tests. Follow the repository's Git delivery instructions.
