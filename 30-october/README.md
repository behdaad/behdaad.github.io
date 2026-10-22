# 30 October

Standalone outing guide for five friends on Friday 30 October 2026.

- Edit `data.json`, then run `python3 30-october/build.py` from the repository root.
- `index.html` is checked in so the normal static deployment serves `/30-october/`.
- `styles.css` uses the shared 17px body-size convention.
- Venue photographs are local image files; original URLs and credits are in `images/credits.json`.
- Maps use locally vendored Leaflet 1.9.4 (BSD-2-Clause, see `vendor/LICENSE`) and OpenStreetMap tiles. Addresses/directions remain usable if JavaScript or tiles are unavailable.
- Map pins are address centroids, not routing waypoints. Super Lyan, KID and Pendergast are approximate; walks are conservative editorial estimates. No straight-line connector is presented as a walking route.
- Friday opening hours were checked on 21 October 2026. No date-specific table availability is asserted. Recheck hours, menus and prices before a future reuse.
- Prices cover one cocktail plus dinner food; add drinks with dinner. No booking, vote storage, or shared state is implied. Copy buttons share only a direct URL.
- Run `npx playwright test tests/30-october.spec.js` for desktop/mobile galleries, maps, sorting, image availability, overflow, and JavaScript-free fallback checks.

The shortlist includes eight paired plans. The second research round added Nomi (Vijzelstraat), Esh Pitaria & Bar, Morgan & Mees Amsterdam, Sins of Sal, Flying Dutchmen Cocktails and Bar Mokum. Esh is provisional: its official site was unavailable, so editorial sources support the address and reported hours, with current kitchen hours, prices and group seating requiring direct confirmation. Food photos are credited to Raphael Meibergen / De Buik; its interior photo comes from Studio Michiel Wijnen. KID food photos come from Amsterdam NOW. Flying Dutchmen’s currently linked 2026 menu lists cocktails at €15–19; its €15 signature is the suggested order. Pulitzer’s Bar was excluded for its published four-person limit.

Local JavaScript and styles use content-versioned URLs so browsers refresh map code and styling when the guide changes.

Food and cocktails are the main photo galleries (six to eight distinct photos per place), with compact setting galleries below. The suggested drink/food order section has been removed; timing and walking maps remain. Some images show bakery items or historical dishes rather than the current dinner menu. Guest photos retain source watermarks; attribution and source URLs are in `images/credits.json`. New gallery photos were checked on 22 October 2026.
