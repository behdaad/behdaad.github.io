const { test, expect } = require('@playwright/test');

async function setRange(page, id, value) {
  await page.locator(`#control-${id}`).evaluate((input, value) => {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }, String(value));
}

async function imageSignature(page) {
  return page.locator('#scene').evaluate(canvas => canvas.toDataURL());
}

async function imageBrightness(page) {
  return page.locator('#scene').evaluate(canvas => {
    const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    let total = 0;
    for (let i = 0; i < data.length; i += 4) total += (data[i] + data[i + 1] + data[i + 2]) / 3;
    return total / (data.length / 4);
  });
}

test('lessons change the image, retain their controls and support comparison and reset', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/photography/');
  await expect(page.locator('.lesson:visible')).toHaveCount(1);
  await expect(page.locator('[aria-current="step"]')).toHaveAttribute('data-lesson', 'shutter');
  const reference = await imageSignature(page);
  await page.getByRole('slider', { name: 'Shutter speed' }).focus();
  await page.keyboard.press('End');
  await expect(page.locator('#control-shutter')).toHaveAttribute('aria-valuetext', '1/15 s');
  expect(await imageSignature(page)).not.toBe(reference);
  await expect(page.locator('#scene-feedback')).toContainText('leaves a trail');
  await page.getByRole('button', { name: 'Show reference', exact: true }).click();
  expect(await imageSignature(page)).toBe(reference);
  await page.getByRole('button', { name: 'Return to my settings' }).click();
  expect(await imageSignature(page)).not.toBe(reference);
  for (const [lesson, control, value] of [['aperture', 'aperture', 0], ['iso', 'iso', 5], ['white-balance', 'kelvin', 3200], ['focal-length', 'focal', 4], ['focus', 'focus', 2]]) {
    await page.locator(`[data-lesson="${lesson}"]`).click();
    await expect(page.locator('.lesson:visible')).toHaveAttribute('id', lesson);
    const before = await imageSignature(page);
    await setRange(page, control, value);
    expect(await imageSignature(page)).not.toBe(before);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  }
  await page.locator('[data-lesson="shutter"]').click();
  await expect(page.locator('#control-shutter')).toHaveValue('7');
  await page.getByRole('button', { name: 'Reset this lesson' }).click();
  expect(await imageSignature(page)).toBe(reference);
  expect(errors).toEqual([]);
  await page.locator('.learning').screenshot({ path: testInfo.outputPath('playground.png') });
});

test('exposure follows stops and the assignment checks the intended tradeoff', async ({ page }) => {
  await page.goto('/photography/#exposure');
  await expect(page.locator('.histogram-panel')).toBeVisible();
  await expect(page.locator('#exposure-meter')).toHaveText('+0.0 EV from reference');
  const referenceBrightness = await imageBrightness(page);
  await setRange(page, 'shutter', 2);
  await expect(page.locator('#exposure-meter')).toHaveText('-1.0 EV from reference');
  expect(await imageBrightness(page)).toBeLessThan(referenceBrightness * .8);
  await setRange(page, 'iso', 1);
  await expect(page.locator('#exposure-meter')).toHaveText('+0.0 EV from reference');
  expect(Math.abs(await imageBrightness(page) - referenceBrightness)).toBeLessThan(1);
  await setRange(page, 'aperture', 3);
  await expect(page.locator('#exposure-meter')).toHaveText('-1.0 EV from reference');
  await page.locator('#mission').selectOption('balance');
  await page.getByRole('button', { name: 'Check my setting' }).click();
  await expect(page.locator('#mission-result')).toContainText('start this assignment first');
  await page.getByRole('button', { name: 'Try in the playground' }).click();
  await expect(page.locator('#exposure-meter')).toHaveText('-1.0 EV from reference');
  await page.getByRole('button', { name: 'Check my setting' }).click();
  await expect(page.locator('#mission-result')).toContainText('Doubling ISO');
  await setRange(page, 'iso', 1);
  await page.getByRole('button', { name: 'Check my setting' }).click();
  await expect(page.locator('#mission-result')).toContainText('Yes. ISO 200');
  await page.locator('#mission').selectOption('color');
  await page.getByRole('button', { name: 'Try in the playground' }).click();
  await setRange(page, 'kelvin', 5500);
  await page.getByRole('button', { name: 'Check my setting' }).click();
  await expect(page.locator('#mission-result')).toContainText('Yes. Matching');
});

test('static lessons and field notes remain readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/photography/');
  await expect(page.locator('.lesson:visible')).toHaveCount(7);
  await expect(page.locator('.simulator')).toBeHidden();
  await expect(page.locator('.notice')).toBeVisible();
  await expect(page.locator('.notice')).toContainText('lessons below work without JavaScript');
  await page.getByText('RAW, ProRAW & HEIF', { exact: false }).click();
  await expect(page.locator('details').first()).toHaveAttribute('open', '');
  await context.close();
});
