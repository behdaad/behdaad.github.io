# 30 October

Standalone outing guide for five friends on Friday 30 October 2026.

- Edit `data.json`, then run `python3 30-october/build.py` from the repository root.
- `index.html` is checked in so the normal static deployment serves `/30-october/`.
- `styles.css` uses the shared 17px body-size convention.
- Venue photographs are local WebP files; original URLs and credits are in `images/credits.json`.
- Maps use locally vendored Leaflet 1.9.4 (BSD-2-Clause, see `vendor/LICENSE`) and OpenStreetMap tiles. Addresses/directions remain usable if JavaScript or tiles are unavailable.
- Map pins are address centroids, not routing waypoints. Super Lyan is approximate; walks are conservative editorial estimates. No straight-line connector is presented as a walking route.
- Friday opening hours were checked on 21 October 2026. No date-specific table availability is asserted. Recheck hours, menus and prices before a future reuse.
- Prices cover one cocktail plus dinner food; add drinks with dinner. No booking, vote storage, or shared state is implied. Copy buttons share only a direct URL.
- Run `npx playwright test tests/30-october.spec.js` for desktop/mobile galleries, maps, sorting, image availability, overflow, and JavaScript-free fallback checks.
