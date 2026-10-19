# Automotive brand archives

Research edition: 20 October 2026. These archives share the design and modal renderer of the main Automotive history.

## Coverage

| Archive | Families | Design chapters | Film / TV listings |
| --- | ---: | ---: | ---: |
| Ferrari | 53 | 122 | 6 |
| Lamborghini | 25 | 53 | 2 |
| Porsche | 21 | 58 | 4 |
| Tesla | 7 | 13 | 3 |
| Mercedes-Benz | 54 | 150 | 3 |
| Total | 160 | 396 | 18 |

The agreed unit is a **production road-car model family**, with generations and visibly distinct production bodies inside its modal. A family can contain renamed successors when they continue the same lineage: Ferrari 550/575, Porsche Boxster/Cayman, Mercedes SLK/SLC and M-Class/GLE are examples. Individual engine, trim, gearbox, market and special-edition badges are not separate families. Small visual updates are grouped rather than illustrated as new cars.

Included: saloons, sports cars, grand tourers, SUVs, personal-use pickups, limited road-going series and explicitly labelled road-capable homologation series. The 550, early 718, 904 and 906 entries describe Porsche's road-capable competition-derived series; they are distinct from the modern 718 nameplate. Road capability does not make these ordinary passenger cars.

Excluded: race-only derivatives, prototypes/concepts, individual commissioned bodies, aftermarket conversions, military-only vehicles, commercial vans, heavy trucks and Tesla Semi. Ferrari FXX/FXX-K, Lamborghini Essenza SCV12, Porsche competition-only prototypes, Mercedes CLK LM/CLR and Tesla's unproduced second-generation Roadster are examples. Publicity about a concept alone is not enough to add it. Small factory road series such as Ferrari F60 America, Sergio and J50 are included; privately commissioned single bodies are not.

Mercedes-Benz begins at the 1926 merger, including the carry-over 400/630/K family. It does **not** claim to enumerate the separate pre-merger Benz, Daimler or Mercedes catalogs. Its current class names are grouped with the relevant historical predecessors. Maybach-branded derivatives are inside the associated Mercedes family; the separate Maybach 57/62 marque is outside this brand's scope.

The timeline uses **introduction years of design chapters**, not a claimed production end date. A reveal can precede customer deliveries or a market's model year. The Cybercab entry is explicitly a production programme, not a statement about unrestricted commercial driverless approval. Latest official production-programme references include:

- [Tesla Q1 2026 update / April 2026 filing](https://ir.tesla.com/_flysystem/s3/sec/000162828026026551/tsla-20260422-gen.pdf)
- [Mercedes-AMG electric GT 4-Door production-model announcement, 20 May 2026](https://media.mbusa.com/news/the-new-mercedes-amg-gt-4-door-coupe-revolutionary-performance-maximum-intensity)
- [Ferrari 849 Testarossa Spider announcement, 9 September 2025](https://www.ferrari.com/content/dam/ferrari-fcom/news/corporate/2025/09/pdf/CS_849_Testarossa_Spider_gbr.pdf)

`coverage.json` records the exact families, chapters and source indexes for this edition. The catalogs are comprehensive at this grouping level, rather than a promise to enumerate every coachbuilt chassis, paint/trim combination or regional badge.

## Source indexes

Coverage follows model indexes, checked against official heritage/model references. Wikipedia model articles provide the linked histories and bibliographies. Automotive publications referenced by those histories supply additional reviews and contemporary reporting; their titles and outlets are retained. A news item is not relabelled a road test.

| Brand | Model index | Manufacturer reference |
| --- | --- | --- |
| Ferrari | [Road cars](https://en.wikipedia.org/wiki/List_of_Ferrari_road_cars) | [Past models](https://www.ferrari.com/en-EN/auto/past-models) |
| Lamborghini | [Automobiles](https://en.wikipedia.org/wiki/List_of_Lamborghini_automobiles) | [History](https://www.lamborghini.com/en-en/history) |
| Porsche | [Vehicles](https://en.wikipedia.org/wiki/List_of_Porsche_vehicles) | [Classic models](https://www.porsche.com/usa/accessoriesandservice/classic/models/) |
| Tesla | [Company / vehicle range](https://en.wikipedia.org/wiki/Tesla,_Inc.) | [Meet your Tesla](https://www.tesla.com/support/meet-your-tesla) |
| Mercedes-Benz | [Vehicles](https://en.wikipedia.org/wiki/List_of_Mercedes-Benz_vehicles) | [Museum](https://www.mercedes-benz.com/en/art-and-culture/museum/) |

The main Automotive page remains an editorial selection with its existing evidence scores. These five complete-family catalogs do not assign influence scores or rank one production model above another.

## Photographs

`photo-plan.json` maps each chapter to its exact photographs. `photo-overrides.json` records manual corrections where automatic candidate matching selected the wrong generation, an interior/detail, a concept or a racing derivative. `pages.json` retains the source candidates and section context. `image-credits.json` stores the photographer, source description page, license, transformation and local path for every selected image.

Images are served locally, rather than hotlinked to remote thumbnails. Archive and contemporary Wikimedia Commons photographs make up most of the collection. Photographs can show later examples of a body introduced earlier; body chronology and photograph date are distinct. Viewpoints vary where historical material is limited. A rare model can have a one-photo gallery rather than borrowed photographs of a different car.

A few newly introduced cars use **manufacturer publicity photographs with rights retained**. These are labelled as such, not given a Creative Commons license. The source pages are official Mercedes-Benz press material or authorized Ferrari dealer model pages. `official-photos.json` preserves the exact source image URLs; gallery credits link to the publishing page. Copyright remains with the credited owners.

All main photographs and comparison slots use landscape layout. No portrait photo space is reserved. Cabin photographs may supplement the exterior gallery when the redesign chiefly affects the cabin.

## Reviews and screen titles

`videos.json` contains the selected model-specific YouTube videos. Top Gear and Auto Focus are prioritised, followed by established outlets and presenters such as Hagerty, Carfection, Jay Leno, Harry Metcalfe, Fifth Gear, Doug DeMuro and carwow. Every one of the 160 model families has a YouTube player and a direct watch link: 128 driving reviews, 17 specialist features, 12 walkarounds, two first looks and one historical overview. The player loads only after the visitor presses Play.

A video can cover a representative generation or body within its family; it is not a claim that every chapter has an individual review. Rare historic models sometimes have no accessible independent driving review. Those entries use clearly labelled specialist/dealer features, museum material, historical overviews or exterior/interior walkarounds. Replica reviews, toy reviews, gameplay, unrelated cars with matching badges and speculative future-model videos are excluded. Dealer and manufacturer perspectives are identified in the notes.

`video-queries.json` records the research queries. `find-videos.py` collects public YouTube title/channel/duration/snippet metadata into a temporary candidate file for manual review; it never changes the public selections. `video-verification.json` records the public oEmbed response for every selected family, including the exact video ID, title, uploader and verification date. `verify-videos.py` checks metadata without downloading any video. Public metadata verifies the selected video's identity; regional availability and later removals can still change playback.

`brands.json` contains the film/TV listings with title, date, type, filmmaker/broadcaster, relevance and a source link. Dramas, independent reporting and manufacturer films are distinguished. A wider F1 series or driver biography is described as such. Links point to title information, official trailers or official full films; a title listing is not a guarantee of current regional streaming availability.

National Geographic's [Dutch series guide](https://www.natgeotv.com/nl/programmas/natgeo/megafactories) and [South African guide](https://www.natgeotv.com/za/shows/natgeo/megafactories) establish the factory episodes. Episode numbering varies between regions, so the identifiable car title is used. Feature-film and other television sources are attached to each listing.

## Maintenance

From the repository root, with Python, Pillow and lxml installed:

```sh
python3 automotive/research/brands/fetch-pages.py
python3 automotive/research/brands/prepare-media.py
python3 automotive/research/brands/fetch-photos.py
python3 automotive/research/brands/fetch-official-photos.py
python3 automotive/research/brands/verify-videos.py
python3 automotive/research/brands/build-pages.py
python3 automotive/research/brands/contact-sheets.py
npm run build
npx playwright test tests/automotive.spec.js tests/automotive-brands.spec.js --reporter=list
```

Fetches are cached and resumable. Respect source rate limits; do not run multiple photo-manifest writers concurrently. Review generated contact sheets in `/tmp/brand-*.jpg` and the source captions before accepting new selections. Do not run the original main-page `optimize-media.py` against the brand catalog: the new collection deliberately lives in `automotive/brand-assets/`.

The tests cover every family's modal, chronology, attributed local photographs, gallery controls, deep links, category/search filters, film listings, modal scroll reset, and desktop/mobile overflow (including 320px width). They also preserve the original main-page regressions.
