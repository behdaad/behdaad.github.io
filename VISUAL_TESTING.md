# Visual snapshot testing

Playwright captures full-page screenshots for every public route at desktop and mobile viewport sizes. Reference PNGs are stored in `tests/__snapshots__/` and checked on every pull request.

## Run the tests

Install Chromium once after `npm install`:

```sh
npx playwright install chromium
```

Then run:

```sh
npm run test:visual
```

## Accept an intentional visual change

Review the rendered change, update the baselines, and include the changed PNGs in the same pull request:

```sh
npm run test:visual:update
```

The footer year and CSS animations are suppressed only while screenshots are captured, removing changes that do not represent a visual regression.
