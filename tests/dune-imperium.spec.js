const { test, expect } = require('@playwright/test');
const key = 'dune-imperium.player-guide.v1';
const tableKey = 'dune-uprising.session';
async function open(page) { await page.goto('/dune-imperium/'); }
async function settings(page, count, role) {
  await page.getByRole('button', { name: 'Your guide settings' }).click();
  if (count) await page.getByLabel('Players at the table').selectOption(String(count));
  if (role) await page.getByLabel('Your six-player role').selectOption(role);
}
async function saveSettings(page) { await page.getByRole('button', { name: 'Save my preferences' }).click(); }
async function next(page) { await page.getByRole('button', { name: 'Done · next step' }).click(); }
async function state(page) { return page.evaluate(k => JSON.parse(localStorage.getItem(k)), key); }

test('personal guide persists progress without touching the table companion', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await open(page);
  await page.evaluate(k => localStorage.setItem(k, 'table-save-sentinel'), tableKey);
  await expect(page.getByRole('heading', { name: 'Your move. Make it count.' })).toBeVisible();
  await settings(page, 3);
  await page.getByLabel('Your name').fill('Behdad');
  await saveSettings(page);
  await page.getByRole('button', { name: 'Take an Agent turn', exact: false }).click();
  await next(page);
  await page.getByRole('link', { name: 'Rulebook', exact: true }).click();
  await page.getByRole('link', { name: 'My turn', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Check access. Pay. Place.' })).toBeVisible();
  expect((await state(page)).name).toBe('Behdad');
  expect(await page.evaluate(k => localStorage.getItem(k), tableKey)).toBe('table-save-sentinel');
  expect(errors).toEqual([]);
});

test('board finder combines icons, goals and search then carries a choice into the turn', async ({ page }) => {
  await open(page);
  await page.getByRole('link', { name: 'Board spaces', exact: true }).click();
  await expect(page.locator('#space-count')).toHaveText('22 spaces to consider');
  await page.getByRole('button', { name: 'City', exact: true }).click();
  await expect(page.getByRole('button', { name: 'City', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByLabel('I’m looking for').selectOption('Water');
  await expect(page.locator('.space-card')).toHaveCount(1);
  await page.locator('.space-card summary').click();
  await expect(page.locator('.space-cost')).toContainText('2 Fremen Influence');
  await expect(page.locator('.space-card').getByRole('link', { name: 'Supplement' })).toHaveAttribute('href', /#page=2$/);
  await page.getByRole('button', { name: 'Use in my Agent guide' }).click();
  await expect(page.locator('.selected-space')).toContainText('Sietch Tabr');
  await next(page);
  await page.reload();
  await expect(page.locator('.selected-space')).toContainText('Sietch Tabr');
  for (let i = 0; i < 3; i++) await next(page);
  await page.getByRole('button', { name: 'Finish my turn', exact: true }).click();
  await expect(page.getByRole('button', { name: 'It’s my turn again' })).toBeVisible();
  expect((await state(page)).turn.revealed).toBe(false);
  await page.getByRole('button', { name: 'It’s my turn again' }).click();
  await expect(page.getByRole('button', { name: 'Take an Agent turn', exact: false })).toBeVisible();
});

test('Spy access remains conditional and the board finder handles empty results', async ({ page }) => {
  await page.goto('/dune-imperium/#board');
  await page.getByRole('button', { name: 'Spy', exact: true }).click();
  await expect(page.locator('#space-count')).toHaveText('22 spaces to consider');
  await expect(page.locator('#space-context')).toContainText('actual observation posts');
  await page.getByLabel('Search board spaces').fill('nothing-like-this');
  await expect(page.getByRole('heading', { name: 'No spaces match.' })).toBeVisible();
  await expect(page.getByLabel('Search board spaces')).toBeFocused();
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await page.getByLabel('Combat spaces', { exact: true }).check();
  expect(await page.locator('.space-card').count()).toBeGreaterThan(0);
  expect(await page.locator('.space-card').count()).toBe(await page.locator('.space-card .combat-tag').count());
});

test('Reveal guidance checks Persuasion and combat, then waits until the next round', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Take a Reveal turn', exact: false }).click();
  await next(page);
  await page.locator('.calculator summary').click();
  await page.getByLabel('From cards', { exact: true }).fill('5');
  await page.getByLabel('Other bonuses', { exact: true }).fill('1');
  await page.getByLabel('High Council seat').check();
  await page.getByLabel('My agent is at Assembly Hall').check();
  await expect(page.locator('output')).toHaveText('9 Persuasion');
  await next(page);
  await page.locator('.calculator summary').click();
  await page.getByLabel('Total swords', { exact: true }).fill('9');
  await expect(page.locator('output')).toContainText('0 strength');
  await page.getByLabel('Troops', { exact: true }).fill('2');
  await page.getByLabel('Sandworms', { exact: true }).fill('1');
  await expect(page.locator('output')).toHaveText('16 strength');
  await next(page);
  await page.getByRole('button', { name: 'Finish my Reveal', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Stay ready for Combat.' })).toBeVisible();
  await page.getByRole('link', { name: 'Board spaces', exact: true }).click();
  await page.locator('.space-card summary').first().click();
  await expect(page.getByRole('button', { name: 'Use in my Agent guide' })).toHaveCount(0);
  await page.getByRole('link', { name: 'My turn', exact: true }).click();
  await page.getByRole('button', { name: 'Start my next round' }).click();
  expect((await state(page)).turn.revealed).toBe(false);
  await expect(page.getByRole('button', { name: 'Take an Agent turn', exact: false })).toBeVisible();
});

test('search, direct rule links, bookmarks and official PDF page links work', async ({ page }) => {
  await page.goto('/dune-imperium/#rules/spies-access-infiltration-and-intelligence');
  const topic = page.locator('#rule-spies-access-infiltration-and-intelligence');
  await expect(topic).toHaveAttribute('open', '');
  await expect(topic.getByRole('link', { name: 'Rulebook' })).toHaveAttribute('href', /Main_Rulebook.*#page=11$/);
  await topic.getByRole('button', { name: 'Save rule' }).click();
  await page.reload();
  await expect(topic.getByRole('button', { name: 'Saved', exact: false })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '☆ Saved', exact: true }).click();
  await expect(page.locator('.rule-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Clear filters', exact: false }).click();
  await page.getByLabel('Search the rules').fill('sandworms');
  expect(await page.locator('.rule-card').count()).toBeGreaterThan(0);
  await expect(page.getByLabel('Search the rules')).toBeFocused();
  await page.getByLabel('Search the rules').fill('xyz-no-rule');
  await expect(page.getByRole('heading', { name: 'No matching rules.' })).toBeVisible();
});

test('six-player roles filter personal spaces and add Commander activation', async ({ page }) => {
  await open(page);
  await settings(page, 6, 'allyImperium');
  await expect(page.getByLabel('Play with CHOAM contracts')).toBeChecked();
  await expect(page.getByLabel('Play with CHOAM contracts')).toBeDisabled();
  await saveSettings(page);
  await page.getByRole('link', { name: 'Board spaces', exact: true }).click();
  await expect(page.locator('#space-count')).toHaveText('24 spaces to consider');
  await page.getByLabel('Search board spaces').fill('Sardaukar');
  await expect(page.locator('.space-card')).toHaveCount(0);
  await page.getByLabel('Search board spaces').fill('Imperial Privilege');
  await expect(page.locator('.space-cost')).toContainText('2 Great Houses Influence');
  await page.getByLabel('Search board spaces').fill('Sietch Tabr');
  await expect(page.locator('.space-cost')).toHaveText('2 Fringe Worlds Influence');
  await settings(page, 6, 'shaddam'); await saveSettings(page);
  await expect(page.locator('#space-count')).toHaveText('26 spaces to consider');
  await page.getByLabel('Search board spaces').fill('Sardaukar');
  await expect(page.locator('.space-cost')).toHaveText('3 spice');
  await page.locator('.space-card summary').click();
  await page.getByRole('button', { name: 'Use in my Agent guide' }).click();
  await expect(page.getByRole('heading', { name: 'Activate your Ally' })).toBeVisible();
  await settings(page, 6, 'muaddib'); await saveSettings(page);
  await page.getByRole('link', { name: 'Board spaces', exact: true }).click();
  await page.getByLabel('Search board spaces').fill('Desert Mastery');
  await expect(page.locator('.space-card')).toHaveCount(1);
  await page.getByLabel('Search board spaces').fill('Sietch Tabr');
  await expect(page.locator('.space-cost')).toHaveText('2 Fringe Worlds or Fremen Influence');
  await page.getByLabel('Search board spaces').fill('Swordmaster');
  await page.locator('.space-card summary').click();
  await expect(page.locator('.space-body')).toContainText('one placement per game');
  await expect(page.locator('.space-body').getByRole('link', { name: 'Supplement' })).toHaveAttribute('href', /#page=14$/);
});

test('separate phone browsers keep independent profiles and turn progress', async ({ page, browser }) => {
  await open(page);
  await settings(page, 3);
  await page.getByLabel('Your name').fill('Player one'); await saveSettings(page);
  await page.getByRole('button', { name: 'Take a Reveal turn', exact: false }).click();
  const other = await browser.newContext();
  try {
    const phone = await other.newPage();
    await phone.goto('http://127.0.0.1:4173/dune-imperium/');
    await expect(phone.locator('#profile-label')).toHaveText('Your guide');
    await expect(phone.getByRole('button', { name: 'Take an Agent turn', exact: false })).toBeVisible();
    await phone.getByRole('button', { name: 'Take an Agent turn', exact: false }).click();
    await next(phone);
    expect((await state(phone)).turn.type).toBe('agent');
    expect((await state(page)).turn.type).toBe('reveal');
  } finally { await other.close(); }
});

test('solo and two-player rule references show Rivals; standard mode does not', async ({ page }) => {
  await open(page);
  for (const count of [1, 2, 3, 4]) {
    await settings(page, count); await saveSettings(page);
    await page.getByRole('link', { name: 'Rulebook', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Rivals', exact: true })).toHaveCount(count < 3 ? 1 : 0);
    await page.getByRole('link', { name: 'Board spaces', exact: true }).click();
    await expect(page.locator('#space-count')).toHaveText('22 spaces to consider');
  }
});

test('corrupted save stays intact until explicit reset and other saves remain intact', async ({ page }) => {
  await open(page);
  await page.evaluate(({ key, tableKey }) => { localStorage.setItem(key, '{broken'); localStorage.setItem(tableKey, 'keep-me'); }, { key, tableKey });
  await page.reload();
  await expect(page.locator('#storage-notice')).toContainText('existing save is preserved');
  await page.getByRole('button', { name: 'Take an Agent turn', exact: false }).click();
  await next(page);
  expect(await page.evaluate(k => localStorage.getItem(k), key)).toBe('{broken');
  await page.getByRole('button', { name: 'Reset this guide’s saved data' }).click();
  expect((await state(page)).turn.type).toBe('choose');
  expect(await page.evaluate(k => localStorage.getItem(k), tableKey)).toBe('keep-me');
});

test('blocked storage still allows turns and announces unsaved progress', async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('blocked'); }; });
  await open(page);
  await page.getByRole('button', { name: 'Take an Agent turn', exact: false }).click();
  await expect(page.locator('#storage-notice')).toContainText('cannot save your guide');
  await next(page);
  await expect(page.getByRole('heading', { name: 'Check access. Pay. Place.' })).toBeVisible();
});

test('settings are keyboard accessible and names render as text', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Your guide settings' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Your guide settings' })).toBeFocused();
  await settings(page);
  await page.getByLabel('Your name').fill('<img src=x onerror=alert(1)>');
  await saveSettings(page);
  await expect(page.locator('#profile-label')).toHaveText('<img src=x onerror=alert(1)>');
  await expect(page.locator('img')).toHaveCount(0);
});

test('all main screens fit small phones and wide layouts', async ({ page }, testInfo) => {
  await open(page);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    for (const view of ['turn', 'board', 'rules']) {
      await page.goto(`/dune-imperium/#${view}`);
      await expect(page.locator('h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${view} at ${width}px`).toBeLessThanOrEqual(width);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/dune-imperium/#turn');
  await page.screenshot({ path: testInfo.outputPath('player-guide-phone.png'), fullPage: true });
  await page.goto('/dune-imperium/#board');
  await page.screenshot({ path: testInfo.outputPath('player-guide-board.png'), fullPage: true });
});
