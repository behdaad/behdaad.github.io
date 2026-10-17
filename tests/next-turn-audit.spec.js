const { test, expect } = require('@playwright/test');

test('expanded shelves show all additions with valid local images and unchanged taste evidence', async ({ page }) => {
  await page.goto('/next-turn/');
  await expect(page.locator('.game-card')).toHaveCount(23);
  await expect(page.locator('#total-count')).toHaveText('23');
  const records = await page.evaluate(() => ({
    played: window.FIELD_GUIDE.played.length,
    added: window.FIELD_GUIDE.games.filter(g => g.researchAddedAt).map(g => ({
      id: g.id, score: g.fitScore, factors: g.factors, date: g.snapshotCheckedAt,
      price: g.commerce.price.display
    }))
  }));
  expect(records.played).toBe(22);
  expect(records.added).toHaveLength(9);
  for (const game of records.added) {
    expect(game.date).toBe('2026-10-18');
    expect(game.price).toMatch(/^€/);
    const weights = [0.30, 0.25, 0.15, 0.15, 0.15];
    const calculated = Math.round(Object.values(game.factors)
      .reduce((sum, factor, i) => sum + factor * weights[i], 0) * 20 + 1e-9);
    expect(game.score, game.id).toBe(calculated);
    const card = page.locator('.game-card').filter({ has: page.locator(`.card-title-button[data-detail="${game.id}"]`) });
    await card.scrollIntoViewIfNeeded();
    const img = card.locator('img');
    await expect.poll(() => img.evaluate(el => el.complete && el.naturalWidth > 0), { message: game.id }).toBe(true);
  }
  for (const [shelf, count] of [['essentials', 13], ['upcoming', 5], ['wildcards', 5]]) {
    await page.locator(`[data-shelf="${shelf}"]`).click();
    await expect(page.locator('.game-card')).toHaveCount(count);
  }
});

test('new player counts and audit links lead to usable game details', async ({ page }) => {
  await page.goto('/next-turn/');
  await page.locator('#search').fill('7 Wonders Duel');
  await page.locator('#players').selectOption('3');
  await expect(page.locator('.game-card')).toHaveCount(0);
  await page.locator('#players').selectOption('2');
  await expect(page.locator('.game-card')).toHaveCount(1);
  await page.locator('#search').fill('Gaia Project');
  await page.locator('#players').selectOption('1');
  await expect(page.locator('.game-card')).toHaveCount(1);
  await page.locator('[data-action="method"]').click();
  const audit = page.locator('.audit-summary');
  await expect(audit.getByRole('link')).toHaveAttribute('href', 'omission-audit.md');
  const response = await page.request.get('/next-turn/omission-audit.md');
  expect(response.ok()).toBe(true);
  expect(await response.text()).toContain('Other candidates screened and held');
  await audit.locator('[data-detail="el-grande"]').click();
  await expect(page.locator('#info-dialog')).not.toBeVisible();
  await expect(page.locator('#detail-dialog')).toBeVisible();
  await expect(page.locator('#detail-dialog')).toContainText('El Grande');
  await page.locator('.commerce-section').scrollIntoViewIfNeeded();
  await page.screenshot({ path: test.info().outputPath('el-grande-expanded-detail.png') });
  expect(await page.locator('#detail-dialog').evaluate(el => el.scrollWidth > el.clientWidth + 1)).toBe(false);
});
