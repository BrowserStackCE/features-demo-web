require('dotenv').config();
const path = require('path');

// Shared WebdriverIO + BrowserStack App Automate config.
// Per-feature configs in this folder call buildConfig() with their own spec, session and build names.
function buildConfig({ specs, sessionName, buildName, bstackOptions = {} }) {
  return {
    user: process.env.BROWSERSTACK_USERNAME,
    key: process.env.BROWSERSTACK_ACCESS_KEY,
    hostname: 'hub.browserstack.com',
    // Tests run on a BrowserStack cloud device, so no local display is needed. The local
    // runner's xvfb-run wrapper breaks the worker's IPC channel on GitHub runners.
    autoXvfb: false,
    specs: specs.map((s) => path.resolve(__dirname, '../specs', s)),
    maxInstances: 5,
    logLevel: process.env.WDIO_LOG_LEVEL || 'info',
    // Explicit waits only (no implicit waits).
    waitforTimeout: 25000,
    connectionRetryTimeout: 300000,
    connectionRetryCount: 3,
    framework: 'mocha',
    reporters: ['spec'],
    mochaOpts: { ui: 'bdd', timeout: 300000 },
    services: [
      [
        'browserstack',
        {
          app: process.env.BROWSERSTACK_APP_URL,
          browserstackLocal: process.env.BROWSERSTACK_LOCAL === 'true',
          accessibility: true,
        },
      ],
    ],
    capabilities: [
      {
        platformName: 'android',
        'appium:deviceName': 'Samsung Galaxy S22',
        'appium:platformVersion': '12.0',
        'appium:automationName': 'UiAutomator2',
        'appium:autoGrantPermissions': true,
        'bstack:options': {
          projectName: 'NexusDemo BFSI Automation',
          buildName: process.env.BUILD_NAME || buildName,
          sessionName,
          debug: true,
          interactiveDebugging: true,
          deviceLogs: true,
          video: true,
          enableCameraImageInjection: true,
          enableCameraVideoInjection: true,
          // Audio injection must be enabled for the account's group, otherwise every session is
          // rejected (BROWSERSTACK_INVALID_ACTION_BY_GROUP). Only audio-injection.conf.js turns it on.
          enableAudioInjection: false,
          enableBiometric: true,
          appProfiling: true,
          ...(process.env.GEO_LOCATION ? { geoLocation: process.env.GEO_LOCATION } : {}),
          // networkLogs re-signs HTTPS traffic; keep on as before.
          networkLogs: true,
          ...bstackOptions,
        },
      },
    ],
  };
}

module.exports = { buildConfig };
