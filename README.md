# behdaad.github.io

The source for [behdaad.me](https://behdaad.me): a static personal site built with [Eleventy](https://www.11ty.dev/). The repository includes the generated site files, so source changes and their generated output are committed together.

## Prerequisites

- Node.js 22 (the version used by GitHub Actions)
- npm
- Git

For visual tests, install Playwright's Chromium browser after installing dependencies.

## Install

```sh
git clone https://github.com/behdaad/behdaad.github.io.git
cd behdaad.github.io
npm ci
npx playwright install chromium
git config core.hooksPath .githooks
```

The last command enables the repository's pre-commit hook. It runs the full build and stages regenerated `blog/`, `tags/`, `snapp/`, and `driver/` output, so review those generated changes before committing.

## Common commands

```sh
npm run build              # regenerate blog and portfolio pages
npm run build:blog         # regenerate the blog, tag archives, and RSS feed
npm run build:portfolio    # regenerate portfolio case studies
npm run serve:blog         # serve the blog source through Eleventy
npm run serve:portfolio    # serve portfolio source through Eleventy
npm run test:visual        # check visual snapshots
npm run test:visual:update # re-record visual snapshots for this OS
```

## Add a blog post

1. Add a Markdown file to `blog-src/posts/`. Its filename becomes the post slug.
2. Include the front matter appropriate to the post language and layout. A minimal English post looks like this:

   ```md
   ---
   layout: base.njk
   title: My post title
   description: A short summary shown on the blog index.
   date: 2026-09-14
   tags: [English]
   permalink: "/blog/{{ page.fileSlug }}/"
   pageClass: post
   relativeRoot: ../..
   blogRoot: ..
   tagLinkPrefix: ../
   ---

   Post content goes here.
   ```

   Use the existing posts as the source of truth for Farsi metadata, including `lang: fa`, `direction: rtl`, labels, and the deeper relative paths.
3. Put local images in `assets/blog/` and reference them with a path relative to the generated post, such as `../../assets/blog/my-image.jpg`.
4. Run `npm run build:blog`. This regenerates the post, the blog index, tag pages, and `blog/feed.xml`.
5. Review and commit both the Markdown source and generated output.

More detail is available in [BLOGGING.md](BLOGGING.md).

## Visual snapshots

Visual tests cover every public route at desktop and mobile viewport sizes. Run them before opening a pull request:

```sh
npm run test:visual
```

For an intentional visual change, first inspect the rendered result. Then re-record only the affected test where practical:

```sh
npm run test:visual:update -- --grep 'links matches its visual baseline'
```

Or re-record every snapshot:

```sh
npm run test:visual:update
```

Snapshots are stored separately for macOS and Linux under `tests/__snapshots__/`. GitHub Actions runs on Linux, so a visual change must include updated Linux baselines as well as any macOS baselines you intentionally maintain. See [VISUAL_TESTING.md](VISUAL_TESTING.md) for details.

## Source layout

- `blog-src/`: Markdown posts and blog templates
- `portfolio-src/`: Nunjucks source for portfolio case studies
- `assets/`: images, icons, and other static assets
- `blog/`, `tags/`, `snapp/`, `driver/`: generated output committed to the site
- `tests/`: Playwright visual tests and snapshot baselines

For portfolio-specific authoring guidance, see [PORTFOLIO.md](PORTFOLIO.md).
