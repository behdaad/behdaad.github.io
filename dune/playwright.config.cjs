const base = require('../playwright.config.js');
module.exports = {
  ...base,
  testDir: '../tests',
  testMatch: 'dune.spec.js',
  reporter: [['list']],
  projects: [{ name: 'dune-webkit-ipad', use: { browserName: 'webkit', viewport: { width: 1194, height: 834 }, hasTouch: true, deviceScaleFactor: 1 } }]
};
