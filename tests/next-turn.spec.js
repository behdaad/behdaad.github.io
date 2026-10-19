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
    const count=game.gallery.length;
    expect(count).toBe(6);
    expect(new Set(game.gallery.map(photo=>photo.imageId)).size).toBe(count);
    await page.locator("#search").fill(game.name);
    await page.locator(`.card-title-button[data-detail="${game.id}"]`).click();
    const gallery = page.getByRole("region", { name: `${game.name} photo gallery`, exact: true });
    const photo = gallery.locator(".gallery-image");
    await expect(gallery.locator(".gallery-count")).toHaveText(`1 / ${count}`);
    for (let index = 0; index < game.gallery.length; index++) {
      const image = game.gallery[index];
      expect(image.source).toMatch(/^https:\/\/boardgamegeek.com\/image\/\d+/);
      await expect(photo).toHaveAttribute("src", image.local);
      await expect.poll(() => photo.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
      await expect(gallery.locator(".gallery-credit")).toHaveAttribute("href", image.source);
      await expect(gallery.locator(".gallery-credit")).toContainText(image.credit);
      await expect(gallery.getByRole("button", {name:"Full screen ⤢", exact:true})).toBeVisible();
      await expect(gallery.locator('[aria-pressed="true"]')).toHaveAttribute("data-gallery-index", String(index));
      await gallery.getByRole("button", {name: "Next photo", exact:true}).click();
    }
    await expect(gallery.locator(".gallery-count")).toHaveText(`1 / ${count}`);
    await gallery.getByRole("button", {name: "Previous photo", exact:true}).click();
    await expect(gallery.locator(".gallery-count")).toHaveText(`${count} / ${count}`);
    await gallery.getByRole("button", {name: `Show photo 2 of ${count}`, exact:true}).click();
    await expect(gallery.locator(".gallery-count")).toHaveText(`2 / ${count}`);
    await gallery.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(gallery.locator(".gallery-count")).toHaveText(`1 / ${count}`);
    await page.keyboard.press("ArrowRight");
    await expect(gallery.locator(".gallery-count")).toHaveText(`2 / ${count}`);
    await page.keyboard.press("End");
    await expect(gallery.locator(".gallery-count")).toHaveText(`${count} / ${count}`);
    await page.keyboard.press("Home");
    await expect(gallery.locator(".gallery-count")).toHaveText(`1 / ${count}`);
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
      await expect(gallery.locator(".gallery-count")).toHaveText(`2 / ${count}`);
      await swipe([100,100], [250,105]);
      await expect(gallery.locator(".gallery-count")).toHaveText(`1 / ${count}`);
      // A vertical page gesture must not change the selected photo.
      await swipe([200,100], [190,250]);
      await expect(gallery.locator(".gallery-count")).toHaveText(`1 / ${count}`);
    }
    await page.keyboard.press("Escape");
    await expect(page.locator("#detail-dialog")).not.toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("opens full-screen photos and returns to the game after browsing", async ({ page }, testInfo) => {
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto("/next-turn/");
  const games=await page.evaluate(()=>window.FIELD_GUIDE.games.map(({id,name,gallery})=>({id,name,gallery})));
  for (const game of games) {
    const count=game.gallery.length;
    expect(count).toBe(6);
    expect(new Set(game.gallery.map(photo=>photo.imageId)).size).toBe(count);
    await page.locator("#search").fill(game.name);
    await page.locator(`.card-title-button[data-detail="${game.id}"]`).click();
    const original=page.locator("#detail-dialog .game-gallery");
    await original.getByRole("button",{name:`Show photo 2 of ${count}`,exact:true}).click();
    await original.getByRole("button",{name:"Open photo full screen",exact:true}).click();
    const viewer=page.getByRole("dialog",{name:"Full-screen photos",exact:true});
    const photo=viewer.locator(".gallery-image");
    await expect(viewer).toBeVisible();
    await expect(photo).toHaveAttribute("src",game.gallery[1].local);
    await expect.poll(()=>photo.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
    const viewport=await viewer.evaluate(el=>({width:el.clientWidth,height:el.clientHeight,screenWidth:innerWidth,screenHeight:innerHeight,overflow:el.scrollWidth>el.clientWidth+1||el.scrollHeight>el.clientHeight+1}));
    expect(viewport.width).toBe(viewport.screenWidth);
    expect(viewport.height).toBe(viewport.screenHeight);
    expect(viewport.overflow).toBe(false);
    await viewer.getByRole("button",{name:"Next photo",exact:true}).click();
    await expect(photo).toHaveAttribute("src",game.gallery[2].local);
    await page.keyboard.press("End");
    await expect(photo).toHaveAttribute("src",game.gallery[count-1].local);
    await viewer.getByRole("button",{name:"Next photo",exact:true}).click();
    await expect(photo).toHaveAttribute("src",game.gallery[0].local);
    await viewer.getByRole("button",{name:"Previous photo",exact:true}).click();
    await expect(photo).toHaveAttribute("src",game.gallery[count-1].local);
    await page.keyboard.press("Home");
    await page.keyboard.press("ArrowRight");
    await expect(photo).toHaveAttribute("src",game.gallery[1].local);
    await expect(viewer.locator(".gallery-credit")).toHaveAttribute("href",game.gallery[1].source);
    if(game.id==="kemet-blood-and-sand"){
      await page.screenshot({path:testInfo.outputPath("fullscreen-gallery.png")});
      const stage=viewer.locator(".gallery-stage");
      await stage.evaluate(el=>{
        const touch=x=>new Touch({identifier:1,target:el,clientX:x,clientY:100});
        el.dispatchEvent(new TouchEvent("touchstart",{bubbles:true,touches:[touch(250)]}));
        el.dispatchEvent(new TouchEvent("touchend",{bubbles:true,changedTouches:[touch(100)]}));
      });
      await expect(photo).toHaveAttribute("src",game.gallery[2].local);
    }
    await page.keyboard.press("Escape");
    await expect(viewer).not.toBeVisible();
    await expect(page.locator("#detail-dialog")).toBeVisible();
    await expect(original.locator(".gallery-image")).toHaveAttribute("src",game.gallery[game.id==="kemet-blood-and-sand"?2:1].local);
    await expect(original.getByRole("button",{name:"Open photo full screen",exact:true})).toBeFocused();
    // The other entry point opens the same viewer, with a close button back to details.
    await original.getByRole("button",{name:"Full screen ⤢",exact:true}).click();
    await expect(viewer).toBeVisible();
    await viewer.getByRole("button",{name:"Close full-screen photos",exact:true}).click();
    await expect(viewer).not.toBeVisible();
    await expect(page.locator("#detail-dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#detail-dialog")).not.toBeVisible();
  }
  expect(errors).toEqual([]);
});
