# Formula 1 viewing journey

Researched 20 October 2026. Independent fan guide; no subscriber video is copied, embedded or downloaded.

## Coverage

- 130 selected Grands Prix across every championship season, 1950–2026.
- 42 races before 1991; 88 from 1991 onward. The 2026 season is in progress: latest included race is Singapore on 11 October.
- 23 selected F1 TV documentary entries (including a three-episode series), 11 external films/series and 38 individual people introductions.
- Fiction, historical drama, documentary, season review, race highlights and full replay have separate labels.

The selection uses the official Formula 1 greatest-races and title-showdown articles, official year/race results, the F1 TV archive/documentary catalog, and F1's film recommendations. It is an editorial viewing route, not a claim that F1 or another publication ranked every chosen race. Race notes link to the result, a historical account with references, and additional primary reporting for selected rulings. Interpretive commentary is original.

## Provenance

`f1tv-archive.json`, `f1tv-documentaries.json`, `season-*.json` and `race-*.json` contain public catalog anchors and image URLs observed in the requested in-app browser. Images use the card's published `data-src` when lazy loading leaves `src` empty. They are DOM inventories, not private APIs or subscriber playback records. Modern selections were checked at the individual race-weekend page to distinguish race highlights from qualifying, support races and sprints. Monza is explicitly distinguished from Imola; the 2023 Qatar race is distinguished from a sponsor named Qatar Airways.

`results.json` contains all 77 official year-result tables. `fetch-results.py` parses the published HTML tables. Selected dates and winner names are joined from those tables; race links are retained. The source domain's historical event naming is normalised only for matching, for example `Caesar's Palace` and `USA East`.

`races.txt`, `documentaries.txt`, `people.txt` and `films.json` are the editable editorial inputs. `prepare.py` matches selected races to the catalog, then `build-data.py` combines the inputs. It preserves existing local artwork metadata and follow-up sources. Run `fetch-artwork.py` after adding new watch entries. `fetch-portraits.py` reads the biography infobox photograph, retrieves Commons author/licence metadata, and writes `portraits.json` plus local WebP files. Its Pillow/lxml dependencies are available through the workspace Python runtime. Image selections were reviewed as a contact sheet.

All F1 TV artwork retains the original catalog URL and Formula 1/F1 TV credit; it is not labelled as freely licensed. Portraits retain their original Commons file pages and specific licences. They are reference portraits, not necessarily photographs taken in the timeline year. Nobody's photograph is labelled with two people's names.

## Known catalog limits

- No individual pre-1970 race highlights are listed in the public archive. Those entries have historical sources rather than invented watch IDs.
- 1970–1980 links are whole-season films. A link does not guarantee footage of the selected race is present.
- United States 2005, United States 2015 and Spain 2016 have full F1 TV race replays because the inspected season pages did not list individual highlights. Spain 2016 also has an official Formula 1 YouTube highlights alternative.
- Belgium 2021 links to the catalog's Race Recap, not a conventional racing highlights package.
- Qatar 2023 includes both Grand Prix highlights and a separately labelled title-clinching sprint link.
- Links were catalog-verified. Subscriber playback, regional availability and authentication were not tested. Following a detail URL can legitimately open the F1 sign-in page.
- Screen works use verified provider links where available, otherwise an explicitly labelled Formula 1 viewing guide. No regional streaming availability is promised.

## Validation

`npm run build`

`npx playwright test tests/formula1.spec.js --reporter=list`

The tests cover year coverage and modern weighting, cutoff dates, catalog membership, local image requests, mixed entry counts, search/combined filters and year navigation, direct modal links, focus/scroll restoration, outcome hiding and landscape images/narrow-screen overflow. Existing Automotive suites are also run after the directory link is added.
