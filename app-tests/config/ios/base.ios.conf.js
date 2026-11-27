require('dotenv').config();
const path = require('path');

// Shared WebdriverIO + BrowserStack App Automate config for the iOS NexusDemo build.
// Per-feature configs in this folder call buildIosConfig() with their own spec and names.
// BROWSERSTACK_IOS_APP_URL must hold the bs:// id of the uploaded nexus-demo.ipa.
function buildIosConfig({ specs, sessionName, buildName, bstackOptions = {} }) {
  return {
    user: process.env.BROWSERSTACK_USERNAME,
    key: process.env.BROWSERSTACK_ACCESS_KEY,
    hostname: 'hub.browserstack.com',
    autoXvfb: false,
    specs: specs.map((s) => path.resolve(__dirname, '../../specs/ios', s)),
    maxInstances: 1,
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
          app: process.env.BROWSERSTACK_IOS_APP_URL,
          browserstackLocal: false,
        },
      ],
    ],
    capabilities: [
      {
        platformName: 'ios',
        'appium:deviceName': process.env.IOS_DEVICE_NAME || 'iPhone 15',
        'appium:platformVersion': process.env.IOS_PLATFORM_VERSION || '17',
        'appium:automationName': 'XCUITest',
        'bstack:options': {
          projectName: 'NexusDemo BFSI Automation',
          buildName: process.env.BUILD_NAME || buildName,
          sessionName,
          debug: true,
          deviceLogs: true,
          video: true,
          // Audio injection is not supported on iOS, so it is never enabled here.
          enableCameraImageInjection: true,
          enableCameraVideoInjection: true,
          enableBiometric: true,
          ...bstackOptions,
        },
      },
    ],
  };
}

module.exports = { buildIosConfig };
