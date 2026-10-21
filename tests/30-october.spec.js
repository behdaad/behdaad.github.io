const { test, expect } = require('@playwright/test');

test('outing guide works at desktop and mobile widths', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/30-october/');
  await expect(page.getByRole('heading', {name:'Good drinks. Better company.'})).toBeVisible();
  await expect(page.locator('body')).toHaveCSS('font-size', '17px');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({path: testInfo.outputPath('hero.png')});
  for (const card of await page.locator('.pair').all()) {
    await card.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect((await card.locator('h2').boundingBox()).width).toBeGreaterThan(250);
    await expect(card.locator('.evening > .route')).toHaveCount(1);
    await expect(card.locator('.venue-links a[href^="https://www.google.com/maps/search/"]')).toHaveCount(2);
    const galleries = card.locator('.gallery');
    await expect(galleries).toHaveCount(2);
    for (const gallery of await galleries.all()) {
      if (await gallery.locator('.slide').count() < 2) continue;
      const next = gallery.getByRole('button', {name:/Next photo/});
      await next.click();
      await expect(gallery.locator('.counter')).toContainText('2 /');
      await gallery.getByRole('button',{name:/Previous photo/}).click();
      await expect(gallery.locator('.counter')).toContainText('1 /');
    }
    await card.locator('.map').scrollIntoViewIfNeeded();
    await expect(card.locator('.leaflet-marker-icon')).toHaveCount(2);
    for (const image of await card.locator('img[src^="images/"]').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect(image).toBeVisible();
      expect(await image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
    }
  }
  await page.locator('#sort').selectOption('walk');
  await expect(page.locator('#pair-list > article').last()).toHaveAttribute('id','oldenhof-pendergast');
  await page.locator('#sort').selectOption('rank');
  await expect(page.locator('#pair-list > article').nth(2)).toHaveAttribute('id','oldenhof-stacks');
  await page.goto('/30-october/#super-lyan-janine');
  await page.reload();
  await page.locator('#super-lyan-janine').scrollIntoViewIfNeeded();
  await page.screenshot({path:testInfo.outputPath('first-pair.png')});
  await page.locator('#sins-of-sal-morgan-mees .pair-header').evaluate(el => el.scrollIntoView({block:'start'}));
  await expect(page.locator('#sins-of-sal-morgan-mees .gallery img').first()).toBeVisible();
  await page.locator('#sins-of-sal-morgan-mees .gallery img').first().evaluate(img => img.decode());
  await page.screenshot({path:testInfo.outputPath('new-pair.png')});
  await expect(page.locator('#bar-mokum-esh .tradeoff')).toContainText('provisional');
  await expect(page.locator('.research-note')).toContainText('four-person limit');
  expect(errors).toEqual([]);
});

test('information and directions remain available without JavaScript', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/30-october/');
  await expect(page.locator('.pair')).toHaveCount(8);
  await expect(page.locator('.venue')).toHaveCount(16);
  await expect(page.locator('a.route-link')).toHaveCount(8);
  await expect(page.locator('.map-fallback').first()).toContainText('Nieuwezijds Voorburgwal');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});
