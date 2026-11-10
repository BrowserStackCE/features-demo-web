require('dotenv').config();

const FEATURES = (process.env.FEATURES || '')
  .split(',')
  .map((f) => f.trim())
  .filter(Boolean);

// Empty FEATURES => full flow only (specs/full-flow.spec.js).
// Otherwise one spec per selected feature.
const specs = FEATURES.length
  ? FEATURES.map((f) => `./specs/${f}.spec.js`)
  : ['./specs/full-flow.spec.js'];

exports.config = {
  user: process.env.BROWSERSTACK_USERNAME,
  key: process.env.BROWSERSTACK_ACCESS_KEY,
  hostname: 'hub.browserstack.com',
  specs,
  maxInstances: 5,
  logLevel: 'info',
  // Explicit waits only (no implicit waits); default timeout 10s.
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 1,
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: { ui: 'bdd', timeout: 300000 },
  services: [
    [
      'browserstack',
      {
        app: process.env.BROWSERSTACK_APP_URL,
        browserstackLocal: process.env.BROWSERSTACK_LOCAL === 'true',
      },
    ],
  ],
  capabilities: [
    {
      platformName: 'android',
      'appium:deviceName': 'Google Pixel 8',
      'appium:platformVersion': '14.0',
      'appium:automationName': 'UiAutomator2',
      'appium:autoGrantPermissions': false,
      'bstack:options': {
        projectName: 'BrowserStack Demo',
        buildName: process.env.BUILD_NAME || 'app-android-demo',
        sessionName: 'android-feature-demo',
        debug: true,
        ...(process.env.GEO_LOCATION ? { geoLocation: process.env.GEO_LOCATION } : {}),
        // networkLogs re-signs HTTPS traffic; the app then rejects its own IP-lookup calls
        // (CertPathValidatorException in the device log). Opt in with NETWORK_LOGS=true.
        networkLogs: process.env.NETWORK_LOGS === 'true',
        // Injection capabilities are opt-in: they need to be enabled for the account's group.
        ...(process.env.ENABLE_INJECTION === 'true'
          ? {
              enableCameraImageInjection: true,
              enableCameraVideoInjection: true,
              enableAudioInjection: true,
            }
          : {}),
      },
    },
  ],
};
