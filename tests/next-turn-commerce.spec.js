const { test, expect } = require('@playwright/test');

test('every game exposes its sourced price, expansion effects and compatibility', async ({ page }) => {
  await page.goto('/next-turn/');
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const records = await page.evaluate(() => window.FIELD_GUIDE.games.map(g => ({
    id: g.id, price: g.commerce.price, extras: g.commerce.extras, note: g.commerce.note
  })));
  expect(records).toHaveLength(14);
  await expect(page.locator('.card-price')).toHaveCount(14);
  for (const record of records) {
    await page.locator(`#search`).fill('');
    await page.locator(`.card-title-button[data-detail="${record.id}"]`).click();
    const section = page.locator('.commerce-section');
    await expect(section.getByRole('heading', { name: 'What it costs' })).toBeVisible();
    await expect(section.locator('.purchase-price')).toHaveText(record.price.display);
    await expect(section.getByRole('link', { name: 'View price source' }))
      .toHaveAttribute('href', record.price.url);
    await expect(section).toContainText(record.price.edition);
    await expect(section).toContainText(record.note);
    await expect(section.locator('.addon')).toHaveCount(record.extras.length);
    for (const [i, extra] of record.extras.entries()) {
      const entry = section.locator('.addon').nth(i);
      await expect(entry.getByRole('heading')).toHaveText(extra.name);
      await expect(entry).toContainText(extra.adds);
      await expect(entry).toContainText(extra.compatibility);
      await expect(entry.getByRole('link')).toHaveAttribute('href', extra.url);
    }
    await section.getByRole('heading', { name: 'What it costs' }).scrollIntoViewIfNeeded();
    const overflow = await page.locator('#detail-dialog').evaluate(dialog =>
      dialog.scrollWidth > dialog.clientWidth + 1);
    expect(overflow, record.id).toBe(false);
    if (record.id === 'foundations-of-rome' || record.id === 'spirit-island') {
      await page.screenshot({ path: test.info().outputPath(`${record.id}-commerce.png`) });
    }
    await page.locator('#detail-dialog [data-close]').click();
  }
  expect(errors).toEqual([]);
});

test('comparison shows the quoted edition and currency for each selected game', async ({ page }) => {
  await page.goto('/next-turn/');
  for (const id of ['concordia', 'foundations-of-rome']) {
    await page.locator(`[data-compare="${id}"]`).check();
  }
  await page.locator('#compare-open').click();
  const row = page.locator('.compare-table tr').filter({ has: page.locator('td:first-child', { hasText: /^Price reference$/ }) });
  await expect(row).toContainText('€46.80');
  await expect(row).toContainText('$220–300 USD');
  await expect(row).toContainText('Emperor / Maximus');
});
