const base = require('../playwright.config.js');
module.exports = {
  ...base,
  testDir: '../tests',
  testMatch: 'dune-imperium.spec.js',
  reporter: [['list']],
  projects: [
    ...base.projects,
    { name: 'player-guide-iphone-webkit', use: { browserName: 'webkit', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 } }
  ]
};
