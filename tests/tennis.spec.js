const { test, expect } = require('@playwright/test');
const matches = require('../tennis/matches.json');
const audit = require('../tennis/video-audit.json');
const url = 'http://127.0.0.1:4173/tennis/';

test.beforeEach(async ({ page }) => {
  await page.route('https://www.youtube-nocookie.com/**', route => route.fulfill({ body: '<html><body>Video player</body></html>', contentType: 'text/html' }));
  await page.goto(url);
});

test('complete chronological archive, playlist coverage and video audit', async ({ page }) => {
  await expect(page.locator('.match')).toHaveCount(62);
  expect(matches.filter(m => m.origin === 'playlist')).toHaveLength(54);
  expect(matches.filter(m => m.origin === 'discovery')).toHaveLength(8);
  expect(matches.map(m => m.date)).toEqual(matches.map(m => m.date).sort());
  expect(new Set(matches.flatMap(m => m.videos.map(v => v.id))).size).toBe(67);
  expect(audit.playlistVideoIds).toHaveLength(56);
  audit.playlistVideoIds.forEach(id => expect(matches.some(m => m.videos.some(v => v.id === id))).toBe(true));
  expect(audit.videos.every(v => v.status === 'OK' && v.isEmbeddable === true)).toBe(true);
  const originalClips = ['wmy4QbOZDm4', 'FQZ7B7JTta4', 'ckbX699wngs', 'qhX1Yl3SORo'];
  originalClips.forEach(id => expect(matches.some(m => m.videos.some(v => v.id === id))).toBe(true));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  expect(overflow).toBe(false);
});

test('loads one privacy-enhanced video at a time', async ({ page }) => {
  await expect(page.locator('iframe')).toHaveCount(0);
  await page.locator('.video-play').nth(0).click();
  await expect(page.locator('iframe')).toHaveAttribute('src', /youtube-nocookie.com\/embed\/G6PW9pNevIg/);
  await page.locator('.video-play').nth(1).click();
  await expect(page.locator('iframe')).toHaveCount(1);
  await expect(page.locator('iframe')).toHaveAttribute('src', /5qjg3H0r5KU/);
});

test('readable static archive and fallback embeds without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.route('https://www.youtube-nocookie.com/**', route => route.fulfill({ body: 'Video player' }));
  await page.goto(url);
  await expect(page.locator('.match')).toHaveCount(62);
  await expect(page.locator('input, select, aside')).toHaveCount(0);
  await expect(page.locator('noscript iframe')).toHaveCount(62);
  await expect(page.locator('.match').first().getByRole('heading', { level: 3 })).toContainText('Borg');
  await context.close();
});
