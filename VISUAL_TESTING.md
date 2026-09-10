# Visual snapshot testing

Playwright captures full-page screenshots for every public route at desktop and mobile viewport sizes. Reference PNGs are stored by operating system in `tests/__snapshots__/` and checked on every pull request. Keeping separate macOS and Linux references avoids false failures caused by platform font rendering.

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

Review the rendered change, update the baselines for your current operating system, and include the changed PNGs in the same pull request:

```sh
npm run test:visual:update
```

GitHub Actions uses the committed Linux references. When accepting a visual change, update those references in a Linux environment as well.

The footer year and CSS animations are suppressed only while screenshots are captured, removing changes that do not represent a visual regression.
