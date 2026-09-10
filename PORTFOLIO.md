# Portfolio pages

The project case studies are authored as Nunjucks templates in `portfolio-src/` and generated into their public directories:

- `portfolio-src/snapp.njk` → `snapp/index.html`
- `portfolio-src/driver.njk` → `driver/index.html`

Shared document markup lives in `portfolio-src/_includes/`. Edit the source templates rather than the generated HTML files.

Run `npm run build:portfolio` to regenerate the portfolio pages, or `npm run build` to regenerate both the blog and portfolio. The repository’s pre-commit hook runs the complete build and stages generated pages automatically. New case studies can reuse the shared shell when they are added.
