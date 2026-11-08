const { test, expect } = require('@playwright/test');

const key = 'dune-uprising.session';
async function fresh(page) {
  await page.goto('/dune/');
  await page.evaluate(k => localStorage.removeItem(k), key);
  await page.reload();
}
async function configure(page, count = 3) {
  await page.getByRole('button', { name: count === 1 ? '1 player, solo' : `${count} players`, exact: true }).click();
  const seats = count < 3 ? 3 : count;
  for (let i = 0; i < seats; i++) await page.getByLabel(`Name for seat ${i + 1}`, { exact: true }).fill(['Behdad', 'Sam', 'Alex', 'Noor', 'Robin', 'Kim'][i]);
  await page.getByRole('button', { name: 'Check the board', exact: false }).click();
  await page.getByRole('button', { name: 'Mark all done', exact: true }).click();
  await page.getByRole('button', { name: 'Begin round one', exact: false }).click();
}
async function complete(page, name) {
  await page.getByRole('button', { name: 'Mark all done', exact: true }).click();
  await page.getByRole('button', { name, exact: false }).click();
}
async function seed(page, count, patch = {}) {
  await page.goto('/dune/');
  await page.evaluate(async ({ count, patch, key }) => {
    const e = await import('/dune/engine.mjs');
    let s = e.setCount(e.emptyGame(), count);
    s.players.forEach((p, i) => { p.name = ['Behdad', 'Sam', 'Alex', 'Noor', 'Robin', 'Kim'][i]; });
    s = e.transition(s, { type: 'START' });
    s = e.transition(s, { type: 'ADVANCE' });
    Object.assign(s, patch);
    localStorage.setItem(key, e.encodeSave(s));
  }, { count, patch, key });
  await page.reload();
}
async function state(page) { return page.evaluate(k => JSON.parse(localStorage.getItem(k)).state, key); }

test('player-count setup, all supported modes and initial scores', async ({ page }) => {
  for (const count of [1, 2, 3, 4, 6]) {
    await fresh(page);
    await expect(page.getByRole('button', { name: '5 players', exact: true })).toHaveCount(0);
    await configure(page, count);
    await expect(page.getByRole('heading', { name: 'Round start', exact: true })).toBeVisible();
    const s = await state(page);
    expect(s.humanCount).toBe(count);
    expect(s.players.filter(p => p.kind === 'human')).toHaveLength(count);
    expect(s.players.reduce((n, p) => n + p.score, 0)).toBe(count === 6 ? 12 : count === 4 ? 4 : 0);
    if (count === 6) expect(s.settings.choam).toBe(true);
  }
});

test('setup edits, selected options and partially checked setup survive refresh', async ({ page }) => {
  await fresh(page);
  await page.getByRole('button', { name: '1 player, solo', exact: true }).click();
  await page.getByLabel('Name for seat 1', { exact: true }).fill('Behdad');
  await page.locator('#difficulty').selectOption('kwisatz');
  await page.locator('#choam').check();
  await page.reload();
  await expect(page.getByLabel('Name for seat 1', { exact: true })).toHaveValue('Behdad');
  await expect(page.locator('#difficulty')).toHaveValue('kwisatz');
  await expect(page.locator('#choam')).toBeChecked();
  await page.getByRole('button', { name: 'Check the board', exact: false }).click();
  await page.locator('#check-board').check();
  await page.reload();
  await expect(page.locator('#check-board')).toBeChecked();
  await expect(page.getByRole('button', { name: 'Begin round one', exact: false })).toBeDisabled();
});

test('Agent turn, progress, points and undo persist across reload and a new tab', async ({ page, context }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await seed(page, 3);
  await page.getByRole('button', { name: 'Agent 1', exact: true }).click();
  await page.locator('#check-card').check();
  await page.getByRole('button', { name: 'Add a point to Behdad', exact: true }).click();
  await page.reload();
  await expect(page.locator('#check-card')).toBeChecked();
  await expect(page.locator('output[aria-label="Behdad score"]')).toHaveText('1');
  await complete(page, 'Finish turn');
  await expect(page.getByRole('heading', { name: 'Sam’s turn', exact: true })).toBeVisible();
  const another = await context.newPage();
  await another.goto('/dune/');
  await expect(another.getByRole('heading', { name: 'Sam’s turn', exact: true })).toBeVisible();
  await another.locator('#undo-action').click();
  await expect(another.getByRole('heading', { name: 'Behdad', exact: true })).toBeVisible();
  await expect(another.locator('#check-card')).toBeChecked();
  await another.close();
  expect(errors).toEqual([]);
});

test('early reveals skip players and the combat/Makers/Recall checklist advances a full round', async ({ page }) => {
  await seed(page, 3);
  for (const name of ['Behdad', 'Sam', 'Alex']) {
    await expect(page.getByRole('heading', { name: `${name}’s turn`, exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Take a Reveal turn', exact: false }).click();
    await complete(page, 'Finish turn');
    await expect(page.locator('#guide-title')).toBeInViewport();
  }
  await expect(page.getByRole('heading', { name: 'Combat', exact: true })).toBeVisible();
  await complete(page, 'Continue to Makers');
  await expect(page.locator('.checklist > li')).toHaveCount(3);
  await complete(page, 'Continue to Recall');
  await complete(page, 'Begin the next round');
  expect((await state(page)).round).toBe(2);
  expect((await state(page)).firstPlayer).toBe('p1');
  await complete(page, 'Begin player turns');
  await expect(page.getByRole('heading', { name: 'Sam’s turn', exact: true })).toBeVisible();
});

test('two-player Rival receives two turns and never a Reveal option', async ({ page }) => {
  await seed(page, 2);
  await page.getByRole('button', { name: 'Take a Reveal turn', exact: false }).click();
  await complete(page, 'Finish turn');
  await expect(page.getByRole('heading', { name: 'Sam’s turn', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Take a Reveal turn', exact: false })).toHaveCount(0);
  await page.getByRole('button', { name: 'Agent 1', exact: true }).click();
  await complete(page, 'Finish turn');
  await page.getByRole('button', { name: 'Take a Reveal turn', exact: false }).click();
  await complete(page, 'Finish turn');
  await expect(page.getByRole('heading', { name: 'Sam’s turn', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Agent 2', exact: true }).click();
  await complete(page, 'Finish turn');
  await expect(page.getByRole('heading', { name: 'Combat', exact: true })).toBeVisible();
});

test('Commander direction, activated Ally, acquired Swordmaster and agent recall are usable', async ({ page }) => {
  await seed(page, 6, { activePlayer: 'p0' });
  await page.getByRole('button', { name: 'Left · Alex', exact: true }).click();
  await expect(page.locator('.activation-banner')).toContainText('Alex');
  await page.locator('#check-ally').check();
  await page.reload();
  await expect(page.locator('.activation-banner')).toContainText('Alex');
  await expect(page.locator('#check-ally')).toBeChecked();
  await page.locator('[data-player-details="p0"] summary').click();
  await page.getByRole('button', { name: 'Behdad acquired Swordmaster', exact: true }).click();
  await complete(page, 'Finish turn');
  await expect(page.getByRole('button', { name: 'Recall Left · Alex for Behdad', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Recall Left · Alex for Behdad', exact: true }).click();
  const p = (await state(page)).players[0];
  expect(p.agents.filter(a => a.status === 'available')).toHaveLength(3);
  expect(p.swordmasterBonus).toBe(true);
});

test('corrections, final scoring and a completed result survive refresh', async ({ page }) => {
  await seed(page, 6);
  await page.getByRole('button', { name: 'Correct game', exact: true }).click();
  await page.locator('[name="phase"]').selectOption('recall');
  await page.locator('[name="score-p2"]').fill('10');
  await page.getByRole('button', { name: 'Apply corrections', exact: true }).click();
  await expect(page.getByText('Endgame triggered.', { exact: false })).toBeVisible();
  await complete(page, 'Go to final scoring');
  await expect(page.locator('.final-scores')).toContainText('15');
  await complete(page, 'Finish game');
  await expect(page.getByRole('heading', { name: 'Team Muad’Dib wins.', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Team Muad’Dib wins.', exact: true })).toBeVisible();
});

test('searchable reference respects six-player rules and preserves the current step', async ({ page }) => {
  await seed(page, 6);
  await page.getByRole('button', { name: 'Explore board spaces', exact: false }).click();
  await page.getByRole('searchbox', { name: 'Search field guide' }).fill('Swordmaster');
  await expect(page.locator('.space-card')).toHaveCount(1);
  await expect(page.locator('.space-card')).toContainText('Retire the agent');
  await page.getByRole('tab', { name: 'Rules & reminders', exact: true }).click();
  await page.getByRole('searchbox', { name: 'Search field guide' }).fill('Commander');
  await expect(page.locator('.rule-topic')).not.toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Alex’s turn', exact: true })).toBeVisible();
});

test('damaged saves are preserved, can be downloaded, and reset requires confirmation', async ({ page }) => {
  await page.goto('/dune/');
  await page.evaluate(k => localStorage.setItem(k, '{damaged-save'), key);
  await page.reload();
  await expect(page.getByText('It has not been overwritten.', { exact: false })).toBeVisible();
  expect(await page.evaluate(k => localStorage.getItem(k), key)).toBe('{damaged-save');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download existing save', exact: true }).click();
  expect((await downloadPromise).suggestedFilename()).toContain('recovery');
  page.once('dialog', d => d.dismiss());
  await page.getByRole('button', { name: 'Start a new game', exact: true }).click();
  await expect(page.getByText('It has not been overwritten.', { exact: false })).toBeVisible();
  page.once('dialog', d => d.accept());
  await page.getByRole('button', { name: 'Start a new game', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'How many players?', exact: true })).toBeVisible();
});

test('blocked storage shows an honest unsaved warning while allowing play and backup', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = function () { throw new DOMException('blocked', 'QuotaExceededError'); };
  });
  await page.goto('/dune/');
  await page.getByRole('button', { name: '3 players', exact: true }).click();
  await expect(page.locator('#save-notice')).toContainText('not saved');
  await expect(page.locator('#save-status')).toHaveText('Not saved');
  await page.getByRole('button', { name: 'Game menu', exact: true }).click();
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download a backup', exact: false }).click();
  expect((await downloaded).suggestedFilename()).toContain('game');
});

test('player text is rendered safely; the reference is keyboard accessible', async ({ page }) => {
  await fresh(page);
  await page.getByRole('button', { name: '3 players', exact: true }).click();
  await page.getByLabel('Name for seat 1', { exact: true }).fill('<img src=x onerror=alert(1)>');
  await page.getByLabel('Name for seat 2', { exact: true }).fill('Sam');
  await page.getByLabel('Name for seat 3', { exact: true }).fill('Alex');
  await page.getByRole('button', { name: 'Check the board', exact: false }).click();
  expect(await page.locator('img').count()).toBe(0);
  await expect(page.locator('.seat-list')).toContainText('<img src=x onerror=alert(1)>');
  await page.locator('#reference-open').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#reference-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#reference-open')).toBeFocused();
});

test('iPad, MacBook and narrow layouts keep controls readable without horizontal overflow', async ({ page }, testInfo) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  for (const [width, height, name] of [[1194, 834, 'ipad-landscape'], [834, 1194, 'ipad-portrait'], [1440, 900, 'macbook'], [390, 844, 'phone']]) {
    await page.setViewportSize({ width, height });
    await fresh(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`welcome-${name}.png`), fullPage: true });
    await seed(page, 6, { activePlayer: 'p0' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect((await page.locator('#reveal-ally').boundingBox()).height).toBeGreaterThanOrEqual(44);
    expect((await page.locator('#plus-p0').boundingBox()).width).toBeGreaterThanOrEqual(44);
    await page.screenshot({ path: testInfo.outputPath(`game-${name}.png`), fullPage: true });
    await page.getByRole('button', { name: 'Left · Alex', exact: true }).click();
    await page.locator('#check-ally').check();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('backup import restores the exact game and rejects unsupported files', async ({ page }) => {
  await seed(page, 4);
  await page.getByRole('button', { name: 'Agent 1', exact: true }).click();
  await page.locator('#check-card').check();
  const raw = await page.evaluate(k => localStorage.getItem(k), key);
  await fresh(page);
  await page.getByRole('button', { name: 'Game menu', exact: true }).click();
  await page.locator('#import-file').setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('{}') });
  await expect(page.locator('#toast')).toContainText('Could not import');
  page.once('dialog', d => d.accept());
  await page.locator('#import-file').setInputFiles({ name: 'game.json', mimeType: 'application/json', buffer: Buffer.from(raw) });
  await expect(page.locator('#check-card')).toBeChecked();
  expect((await state(page)).humanCount).toBe(4);
});
