const path = require("node:path");
const { test, expect } = require("@playwright/test");

const pages = [
  ["home", "/"],
  ["booking", "/booking/"],
  ["snapp", "/snapp/"],
  ["driver", "/driver/"],
  ["about", "/about/"],
  ["blog", "/blog/"],
  // The depression post represents the shared blog-post layout.
  ["blog-reverse-usefulness", "/blog/reverse-usefulness/"]
];

for (const [name, url] of pages) {
  test(`${name} matches its visual baseline`, async ({ page }) => {
    await page.goto(url, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);

    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
      stylePath: path.join(__dirname, "visual-snapshot.css")
    });
  });
}
