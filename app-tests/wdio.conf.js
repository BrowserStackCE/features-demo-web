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
  // Tests run on a BrowserStack cloud device, so no local display is needed. The local
  // runner's xvfb-run wrapper breaks the worker's IPC channel on GitHub runners
  // ("Error: write EINVAL" at process.send in @wdio/local-runner/build/run.js).
  autoXvfb: false,
  specs,
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
        buildName: process.env.BUILD_NAME || 'NexusDemo BFSI - WebdriverIO',
        sessionName: 'BFSI Full Flow',
        debug: true,
        interactiveDebugging: true,
        deviceLogs: true,
        video: true,
        enableCameraImageInjection: true,
        enableCameraVideoInjection: true,
        enableAudioInjection: true,
        enableBiometric: true,
        appProfiling: true,
        ...(process.env.GEO_LOCATION ? { geoLocation: process.env.GEO_LOCATION } : {}),
        // networkLogs re-signs HTTPS traffic; the app then rejects its own IP-lookup calls
        // (CertPathValidatorException in the device log). Opt in with NETWORK_LOGS=true.
        networkLogs: true,
        // Needed for the audio injection spec; the account's group must have the feature enabled.
      },
    },
  ],
};
