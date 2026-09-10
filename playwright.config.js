const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { open: "never" }]
  ],
  snapshotPathTemplate: "{testDir}/__snapshots__/{platform}/{projectName}/{arg}{ext}",
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.001,
      threshold: 0.2
    }
  },
  use: {
    baseURL: "http://127.0.0.1:4173",
    colorScheme: "light",
    locale: "en-US",
    reducedMotion: "reduce",
    timezoneId: "Europe/Amsterdam"
  },
  projects: [
    {
      name: "desktop-chromium",
      use: {
        browserName: "chromium",
        deviceScaleFactor: 1,
        viewport: { width: 1440, height: 900 }
      }
    },
    {
      name: "mobile-chromium",
      use: {
        browserName: "chromium",
        deviceScaleFactor: 1,
        isMobile: true,
        viewport: { width: 390, height: 844 }
      }
    }
  ],
  webServer: {
    command: "npm run build && python3 -m http.server 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe"
  }
});
