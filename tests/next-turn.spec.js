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
