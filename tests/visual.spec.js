const path = require("node:path");
const { test, expect } = require("@playwright/test");

const pages = [
  ["home", "/"],
  ["about", "/about/"],
  ["links", "/links/"],
  ["blog", "/blog/"],
  ["blog-masters-study", "/blog/masters-study/"],
  ["blog-reverse-usefulness", "/blog/reverse-usefulness/"],
  ["blog-ios-future-in-iran", "/blog/ios-future-in-iran/"],
  ["blog-luck-snapp-life", "/blog/luck-snapp-life/"],
  ["blog-four-flames-theory", "/blog/four-flames-theory/"],
  ["blog-mindfulness-techniques", "/blog/mindfulness-techniques/"],
  ["tag-farsi", "/tags/farsi/"],
  ["snapp", "/snapp/"],
  ["driver", "/driver/"],
  ["booking", "/booking/"]
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
