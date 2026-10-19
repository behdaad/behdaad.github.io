const { test, expect } = require("@playwright/test");

for (const count of [2, 3]) {
  test(`compares ${count} games in readable adjacent columns`, async ({ page }, testInfo) => {
    await page.goto("/next-turn/");
    const selectedNames = await page.locator(".game-card h3").allTextContents();
    for (let i = 0; i < count; i++) {
      await page.locator("[data-compare]").nth(i).check();
    }
    await page.locator("#compare-open").click();
    await expect(page.locator(".compare-table h3")).toHaveCount(count);
    expect((await page.locator(".compare-table h3").allTextContents()).sort())
      .toEqual(selectedNames.slice(0, count).sort());

    const layout = await page.locator(".compare-table").evaluate(table => {
      const wrap = table.parentElement;
      const columns = [...table.querySelectorAll("thead th")].slice(1);
      return {
        widths: columns.map(column => column.getBoundingClientRect().width),
        viewportWidth: wrap.clientWidth,
        tableWidth: table.getBoundingClientRect().width,
        pageWidth: document.documentElement.scrollWidth,
        screenWidth: window.innerWidth,
        cellOverflows: [...table.querySelectorAll("th, td")]
          .some(cell => cell.scrollWidth > cell.clientWidth + 1)
      };
    });
    expect(layout.cellOverflows).toBe(false);
    expect(Math.max(...layout.widths) - Math.min(...layout.widths)).toBeLessThan(2);
    expect(Math.min(...layout.widths)).toBeGreaterThan(150);
    expect(layout.pageWidth).toBeLessThanOrEqual(layout.screenWidth);

    if (testInfo.project.name.startsWith("desktop")) {
      expect(layout.tableWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);
    } else {
      expect(layout.tableWidth).toBeGreaterThan(layout.viewportWidth);
      const scrollRegion = page.getByRole("region", { name: "Game comparison" });
      await scrollRegion.focus();
      for (let i = 0; i < 20; i++) await page.keyboard.press("ArrowRight");
      await expect.poll(() => scrollRegion.evaluate(el =>
        el.scrollLeft + el.clientWidth >= el.scrollWidth - 1
      )).toBe(true);
      const lastColumnIsReachable = await page.locator(".compare-table th:last-child").evaluate(cell => {
        const viewport = cell.closest(".table-wrap").getBoundingClientRect();
        const column = cell.getBoundingClientRect();
        return column.right <= viewport.right + 1 && column.right > viewport.left;
      });
      expect(lastColumnIsReachable).toBe(true);
    }
    await page.screenshot({ path: testInfo.outputPath(`compare-${count}.png`) });
  });
}

test("keeps comparison selections through filters and enforces the three-game limit", async ({ page }) => {
  await page.goto("/next-turn/");
  await expect(page.locator("#compare-bar")).toBeHidden();
  await page.locator("[data-compare]").nth(0).check();
  await expect(page.locator("#compare-open")).toBeDisabled();
  await page.locator("[data-compare]").nth(1).check();
  await expect(page.locator("#compare-open")).toBeEnabled();

  await page.locator("#search").fill("no matching game here");
  await expect(page.locator(".game-card")).toHaveCount(0);
  await page.locator("#reset").click();
  await expect(page.locator("[data-compare]:checked")).toHaveCount(2);
  await page.locator("[data-compare]").nth(2).check();
  // A fourth selection is rejected by the app, so use click rather than check.
  await page.locator("[data-compare]").nth(3).click();
  await expect(page.locator("[data-compare]:checked")).toHaveCount(3);
  await expect(page.locator("#toast")).toHaveText("Choose up to three games to compare");
  await page.locator("#compare-clear").click();
  await expect(page.locator("#compare-bar")).toBeHidden();
  await expect(page.locator("[data-compare]:checked")).toHaveCount(0);
});

test("introduces every game and explains its distinctive dynamic", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/next-turn/");
  const games = await page.evaluate(() => window.FIELD_GUIDE.games.map(({ id, name }) => ({ id, name })));
  expect(games).toHaveLength(23);
  for (const game of games) {
    await page.locator("#search").fill(game.name);
    await page.locator(`.card-title-button[data-detail="${game.id}"]`).click();
    const dialog = page.locator("#detail-dialog");
    await expect(dialog.getByRole("heading", { name: "Game overview", exact: true })).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "What makes it stand out", exact: true })).toBeVisible();
    for (const section of [".game-overview", ".game-dynamic"]) {
      expect((await dialog.locator(`${section} p`).innerText()).length).toBeGreaterThan(100);
    }
    expect(await dialog.locator(".detail-layout > div > section h3").allTextContents())
      .toEqual(expect.arrayContaining(["Game overview", "What makes it stand out", "Why you might love it"]));
    expect(await dialog.evaluate(el => el.scrollWidth > el.clientWidth + 1)).toBe(false);
    await page.keyboard.press("Escape");
  }
  expect(errors).toEqual([]);
});

test("browses every BGG gallery with buttons, thumbnails and keyboard", async ({ page }, testInfo) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/next-turn/");
  const games = await page.evaluate(() => window.FIELD_GUIDE.games.map(({id, name, gallery}) => ({id, name, gallery})));
  for (const game of games) {
    await page.locator("#search").fill(game.name);
    await page.locator(`.card-title-button[data-detail="${game.id}"]`).click();
    const gallery = page.getByRole("region", { name: `${game.name} photo gallery`, exact: true });
    const photo = gallery.locator(".gallery-image");
    await expect(gallery.locator(".gallery-count")).toHaveText("1 / 3");
    for (let index = 0; index < game.gallery.length; index++) {
      const image = game.gallery[index];
      expect(image.source).toMatch(/^https:\/\/boardgamegeek.com\/image\/\d+/);
      await expect(photo).toHaveAttribute("src", image.local);
      await expect.poll(() => photo.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
      await expect(gallery.locator(".gallery-credit")).toHaveAttribute("href", image.source);
      await expect(gallery.locator(".gallery-credit")).toContainText(image.credit);
      await expect(gallery.locator(".gallery-full")).toHaveAttribute("href", image.local);
      await expect(gallery.locator('[aria-pressed="true"]')).toHaveAttribute("data-gallery-index", String(index));
      await gallery.getByRole("button", {name: "Next photo", exact:true}).click();
    }
    await expect(gallery.locator(".gallery-count")).toHaveText("1 / 3");
    await gallery.getByRole("button", {name: "Previous photo", exact:true}).click();
    await expect(gallery.locator(".gallery-count")).toHaveText("3 / 3");
    await gallery.getByRole("button", {name: "Show photo 2 of 3", exact:true}).click();
    await expect(gallery.locator(".gallery-count")).toHaveText("2 / 3");
    await gallery.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(gallery.locator(".gallery-count")).toHaveText("1 / 3");
    await page.keyboard.press("ArrowRight");
    await expect(gallery.locator(".gallery-count")).toHaveText("2 / 3");
    await page.keyboard.press("End");
    await expect(gallery.locator(".gallery-count")).toHaveText("3 / 3");
    await page.keyboard.press("Home");
    await expect(gallery.locator(".gallery-count")).toHaveText("1 / 3");
    expect(await page.locator("#detail-dialog").evaluate(el=>el.scrollWidth>el.clientWidth+1)).toBe(false);
    if (game.id === "kemet-blood-and-sand") {
      await page.screenshot({path:testInfo.outputPath("game-gallery.png")});
      const stage = gallery.locator(".gallery-stage");
      const swipe = (start, end) => stage.evaluate((el, {start, end}) => {
        const touch = position => new Touch({identifier:1, target:el, clientX:position[0], clientY:position[1]});
        el.dispatchEvent(new TouchEvent("touchstart", {bubbles:true, touches:[touch(start)]}));
        el.dispatchEvent(new TouchEvent("touchend", {bubbles:true, changedTouches:[touch(end)]}));
      }, {start, end});
      await swipe([250,100], [100,105]);
      await expect(gallery.locator(".gallery-count")).toHaveText("2 / 3");
      await swipe([100,100], [250,105]);
      await expect(gallery.locator(".gallery-count")).toHaveText("1 / 3");
      // A vertical page gesture must not change the selected photo.
      await swipe([200,100], [190,250]);
      await expect(gallery.locator(".gallery-count")).toHaveText("1 / 3");
    }
    await page.keyboard.press("Escape");
    await expect(page.locator("#detail-dialog")).not.toBeVisible();
  }
  expect(errors).toEqual([]);
});
