# Automotive — research and maintenance

Research edition: 19 October 2026. The public page is `../index.html`; it is plain HTML, CSS and JavaScript, served directly by the existing GitHub Pages repository. No new framework or build step is required.

## Local preview

Run `npm run serve:automotive` from the repository root, then open <http://127.0.0.1:4173/automotive/>. Keep that process running while using the preview: the browser loads photographs as you scroll and open galleries, so an already-open tab still needs the server. If the server was interrupted, restart it and reload the tab to retry failed image requests.

## Scope and inclusion

The main timeline contains **25 model families from 19 makers** (1.32 families per maker; maximum permitted at 2.5 is 47). Every listed maker is represented. There are **84 selected evolution entries** inside those families, and **11 honorable mentions** outside the main timeline.

This is a bounded introduction to industrial and visual history, not a claim that these are objectively the 19 most important manufacturers. Candidates must have an explicit nomination, retrospective appraisal or design assessment in a named automotive publication. The maker registry is derived from the marques of the cited candidates; a maker’s presence is evidence of its included cars, rather than an invented brand ranking.

The selection bibliography is in `../data.json` and visible under the page’s selection disclosure and in each car modal. The major anchors are:

- [Autocar: The world’s most influential cars](https://www.autocar.co.uk/car-news/slideshow/world%E2%80%99s-most-influential-cars) — Model T, Airflow, DS, Mini, Golf GTI and Prius; additional candidates in honorable mentions.
- [Car and Driver: Greatest cars of the sixties](https://www.caranddriver.com/features/a32964167/the-greatest-cars-of-all-time-the-sixties/) — Mini, E-Type, Mustang and Miura.
- [Top Gear: Greatest Italian cars](https://www.topgear.com/car-news/list/these-are-50-greatest-italian-cars-all-time) — Miura, Countach and Stratos, plus Fiat 500 in honorable mentions.
- [Top Gear: Greatest French cars](https://www.topgear.com/car-news/list/50-greatest-french-cars-all-time) — Espace and additional French candidates.
- The individually linked Top Gear, Car and Driver and Hagerty articles provide the remaining nominations and design evidence.

These publications do not use one common ranking system. The page’s **evidence index is a synthesis, not a published review score**:

| Component | Points | Evidence required |
| --- | --- | --- |
| Design | 0 / 30 / 60 | No design appraisal / positive or enduring design appraisal / explicit radical form or packaging appraisal |
| Industry influence | 0 / 30 | An explicit historical-impact claim |
| Independent corroboration | 0 / 10 | A second distinct publication, not another article from the same outlet |

Design carries the greatest weight. Sources and the inclusion rationale appear next to the breakdown in each modal. Scores do not reorder the historical timeline. The Prius design score includes its later reinvention; the Cybertruck receives no assumed long-term industry-influence points. A score is not evidence that a car is good to buy or commercially successful.

## Dates and generations

The main dates use introduction or first-production years. Generation dates can precede model years, explicitly indicated for Mustangs. The 1963 911 introduction is distinguished from later deliveries; the Golf enters in 1974 and the GTI follows in 1976. The 2023 Cybertruck production model is separated from the 2019 prototype.

Wikipedia model histories, linked individually in each evolution entry, support generation dates, body changes and further references. They are **not used to establish editorial importance**. `image-candidates.json` records the filenames and surrounding captions retrieved from model articles; `media-overrides.json` stores explicit choices to avoid blindly mixing generations on redirect pages.

Minor trims, small facelifts and engine-only changes are condensed. Each family explains its exclusions. The following are explicitly distinguished:

- Benz’s pre-merger cars and the later Mercedes-Benz marque.
- The BMC Mini, the BMW-era MINI hatch and the electric J01.
- The original Countach and the separate LPI 800-4 nameplate revival.
- Road cars and Stratos Group 4, F40 LM and F1 GTR Longtail competition derivatives.
- The i3 I01 hatchback and unrelated later i3 saloons.
- The Model S cabin redesign and Plaid drivetrain, which do not constitute a new vehicle generation.

The 84 entries are selective visual chapters, not an exhaustive list of every badge, body style or mechanical derivative. Photographs may show a later example within the stated chapter; the original file description identifies the pictured example. A replica is described as such in its source caption.

## Photography and video

Launch photography and a common three-quarter angle were preferred, but a consistently identified, attributed set was more readily verifiable through Wikimedia Commons. The current edition therefore uses **archive and contemporary photographs rather than claiming a complete set of official launch photos**. This limitation is disclosed on the public page. The image filename, photographer, license and Commons description link remain in each gallery. All displayed images are served locally. The hero has an additional visible credit link; timeline photographs link to the car’s credited gallery.

`image-credits.json` is the media attribution manifest. Resizing and WebP conversion, where applied, are the only image transformations. Images are contained in their frames to preserve the complete car; they are never mirrored to force a matching angle.

`video-verification.json` records YouTube oEmbed title/channel checks. Preference is given to official Top Gear / Top Gear Classic and Auto Focus uploads. Jay Leno’s Garage, Harry’s Garage, Carbuyer, Auto Express, AutoWeek, Carfection and Petrolicious cover gaps; their identities and the actual filmed generation are visible. Historical driving features, performance comparisons and owner films are labelled as such. Three entries use Top Gear episode references rather than a verified official YouTube upload:

| Car | Top Gear episode | Segment |
| --- | --- | --- |
| 300 SL | Series 5, episode 5 | James May’s anniversary retrospective |
| DS | Series 2, episode 8 | James May’s greatest-car nomination |
| E-Type | Series 17, episode 1 | 50th-anniversary feature |

The Beetle has a stock-car review from Jay Leno’s Garage, with the Top Gear series 16, episode 1 stunt as an additional reference. The F1 has a Carfection driving review, with the Top Gear Veyron comparison as an additional video.

Players load only after an explicit play click, using YouTube’s privacy-enhanced embed domain. Direct YouTube links remain available if embedding is restricted.

## Regenerating the catalog

1. Edit and run `build-catalog.py` (Python standard library). This regenerates `../data.json` **without media**.
2. Existing filename selections are retained in `media-overrides.json`. To discover new photos, `fetch-media.py --catalog-only` refreshes the candidate snapshot. Network requests are cached under `/tmp/automotive-research-cache` and spaced apart to respect Wikimedia throttling.
3. Run `fetch-media.py` to attach metadata and download the selected photographs. Inspect its output for failed licenses, empty galleries or galleries with fewer than two pictures. The script does not substitute another generation’s image after a failure.
4. Run `optimize-media.py` using a Python environment with Pillow to produce WebP assets and contact sheets for visual inspection. All attribution links survive conversion.
5. Run `npm run build` and `npx playwright test tests/automotive.spec.js --reporter=list` from the repository root. The tests cover the count cap, chronological order, media completeness, filtering, every modal, generation differences, gallery controls, deep links, browser back, focus return, video opt-in and mobile overflow.

`select-media.py` documents the initial manual selections using indices into the checked candidate snapshot. Its output is the stable filename override file. Do not rerun it against a new candidate snapshot without checking the indices.
