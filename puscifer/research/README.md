# Puscifer field-guide research

Cutoff: 30 October 2026. This is an editorial preparation guide, not an official Puscifer publication or a fixed canon.

## Coverage

- The current [official homepage](https://puscifer.com/), its discography / music-video sections, news article, and navigation.
- The public Shopify catalog: all 97 product records were inventoried; music, films, comics and the DVD-single bundle were examined for distinct media. Apparel and accessory variants do not create consumption tasks.
- All 18 pages in the official pages sitemap, plus the one indexed news article, were retrieved. Trailer embeds and descriptions were inspected; contact, privacy, accessibility and store-policy pages provide no separate lore assignments.
- All 125 public uploads in the [official YouTube channel Videos tab](https://www.youtube.com/@pusciferdotcom/videos) were inventoried, dated from public watch-page metadata, and mapped in `source-ledger.json`. No videos were downloaded. The full *An Easter Story* upload is merged with its Puscifer TV film entry. Shortened cuts, promotional clips, visualizers and excerpts remain individually checkable in the archive route.
- [Apple Music](https://music.apple.com/us/artist/puscifer/48261730) artist-page sections and targeted Apple Music connector searches identified the five studio albums, EPs, remixes, soundtracks, compilations, live audio and standalone releases. Catalog links are returned canonical objects, not invented album IDs. Most links use the Dutch storefront. The early Undertaker soundtrack link is a verified US catalog page.
- Additional media include Sumerian's official *The Algorithm* video and Rick Beato's March 2026 interview linked from Maynard's official Linktree. *Holiday on the Moon* has a clearly marked search fallback. *Sessanta Live* is a physical-only collector detour with secondary references and no asserted streaming availability.

This does not claim coverage of every deleted clip, Short, fan video, magazine feature, interview, vinyl variant, bootleg, or unrelated Maynard guest appearance. The guide points to media and summarizes its relevance; it does not claim that all recordings or films were watched in full during research.

## Chronology and evidence decisions

- Release order takes precedence over fictional story order and performance dates. Year-only entries go at year-end without claiming a precise premiere date. Same-day entries use a stable, arbitrary order after albums/EPs.
- YouTube's public `datePublished` metadata often uses Pacific time. These platform publication dates are retained and labeled; a public premiere can be reported a day later elsewhere. The Sumerian Algorithm entry uses its 29 May announcement (28 May 21:01 Pacific was already 29 May in Amsterdam).
- *Queen B*: the linked official upload is from 2011, but its own description calls it the 2007 first video. Contemporary [4 October reporting](https://blabbermouth.net/news/tool-frontman-s-puscifer-queen-b-video-available) establishes that it was public by that date. It is placed there, with the repost explained.
- The early *Cuntry Boner (Live)* clip is described by its official uploader as a 1999 performance; its public channel upload is September 2007. It is distinct from the 2009 debut of the fully realized concert production.
- *C Is For*: original EP November 2009, a generic January date in Apple metadata, and an expanded edition labeled 2010 in the shop. The entry identifies these differences rather than treating each as a new core album. Original date corroborated by [contemporary EP announcement](https://blabbermouth.net/news/puscifer-to-release-new-ep-in-november).
- *All Re-Mixed Up*: original August 2013, versus November for the linked Apple edition. [Contemporary announcement](https://www.spinmagazine.com/2013/07/puscifer-sir-mix-a-lot-conditions-of-my-parole-remix-fubar/) supplies the original date.
- *Money $hot Your Re-Load*: [Record Store Day Germany's 2016 archive](https://www.recordstoredaygermany.de/wp-content/uploads/2025/02/BF-2016-Liste-Website-Archiv.pdf) confirms the November event; the Apple edition is December.
- *Billy D and the Hall of Feathered Serpents* premiered [17 April 2021](https://mayhemmusicmagazine.com/puscifer-presents-billy-d-and-the-hall-of-feathered-serpents-featuring-money-hot-by-puscifer/); the current shop labels the video 2022. Its prequel status is stated by the band. The soundtrack gets a separate later release entry.
- *What Is…*: the shop's duration header says 93 minutes while the prose calls it a two-hour film. The guide follows the specific duration and preserves the conflict in notes.
- *V Is for Versatile* and *Parole Violator* premiered 28 October 2022; the linked audio releases are dated 11 November. See [contemporary announcement](https://www.revolvermag.com/music/puscifer-announce-dual-streaming-events-and-live-albums).
- *Cinquanta*: recorded May 2014, released March 2024. Its placement is based on the release, not the birthday performance.
- *Normal Isn’t: Live at the Pacific Stock Exchange*: filmed August 2025; [screenings began 6 February 2026](https://www.revolvermag.com/events/puscifer-announce-live-at-the-pacific-stock-exchange-concert-film/), online availability followed 9 February. The first live vinyl release is [BMG's 18 April RSD edition](https://www.bmg.com/news/bmg-celebrates-record-store-day-2026-with-ambassador-bruno-mars), not the later shop repress.
- **Prodcast episode 1 is in the Pendulum Director's Cut.** The [official episode-two description](https://www.youtube.com/watch?v=tNUtJVUCzg4) explicitly links there as episode one. *ImpetuoUs* has comic animation and related introductory material but is not labeled as episode one in this guide. Episodes 2–6 have separate official uploads.
- Comic dates use Shopify `published_at`, not `created_at` or a later press article. Issues are physical books. The shop lists issues 1–4; *A Public Stoning* is also linked as the confirmed video for the *I Am the Briefcase* origin-story art named on the official tour-exclusive page.
- The current show's [venue page](https://gashouder.nl/en/agenda/puscifer) and [promoter](https://www.mojo.nl/concerten/puscifer) agree on Thursday 5 November 2026, doors 19:00, Dave Hill 20:00, Puscifer 21:00, expected end 22:45. Times are changeable and labeled with their check date.

## Assets and maintenance

The band photograph and six record covers were retrieved from the official Shopify CDN. Their original source URLs remain in the guide data. The photo is the site's `Puscifer_Band_Photo_2025.jpg`; the contemporary album announcement credits the press photography to Travis Shinn. Artwork remains the property of its respective owners.

Edit `../data.json` and `../template.html`, then run:

```sh
python3 puscifer/build.py
python3 puscifer/validate.py
node --check puscifer/app.js
npm run build
```

Do not change existing item IDs when correcting metadata: those IDs are the browser's progress keys. `index.html` contains the entire guide for static hosting and no-JavaScript reading. `app.js` only adds filtering and browser-local progress; it never fetches the catalog or embeds third-party players. Export/import merges known, checked IDs; reset requires a modal confirmation.

## Validation performed

- `validate.py`: all 176 rendered entries and checkboxes, five studio albums, four comics, 12 Puscifer TV films, all 125 official-channel uploads accounted for, unique stable IDs, chronological order, source/access URL schemes, generated-page freshness and local asset existence.
- `node --check puscifer/app.js` and the repository's `npm run build` passed.
- In-app browser at 390 × 844 and 1440 × 900: no horizontal overflow; hero, filters and content inspected visually. Checkboxes work by keyboard, remain checked after reload and synchronize between two tabs. Essentials, full archive, comic/character filters, empty results, reset cancellation, reset completion and exported-backup restoration were exercised.
- A temporary local fixture that throws on localStorage access verified the visible warning and session-only checkmarks, which disappear on reload as described. The fixture was removed before delivery. Browser console inspection showed no errors during the exercised flow.
- The complete guide is generated into static HTML with disabled no-JavaScript checkboxes and a noscript explanation. This fallback was checked structurally; no separate JavaScript-disabled browser session was used.

External media are linked rather than embedded. Listings and public metadata were verified, but paid film playback, Apple subscription playback and regional availability were not tested by making purchases or signing into services.
