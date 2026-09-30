/**
 * Network Speed Test — BrowserStack Automate
 * Tests network speed measurement with BrowserStack network throttling profiles.
 * Docs: https://www.browserstack.com/docs/automate/selenium/simulate-network-conditions
 */
const { Builder, By, until } = require('selenium-webdriver');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

describe('Network Speed Test', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder()
      .usingServer('https://hub.browserstack.com/wd/hub')
      .withCapabilities({
        browserName: 'chrome',
        browserVersion: 'latest',
        'bstack:options': {
          sessionName: 'Network Speed Test',
          networkProfile: '4g-lte-advanced-good', // Throttle to 4G LTE
        },
      })
      .build();
  }, 30000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test('speed test runs and displays Mbps and latency values', async () => {
    await driver.get(`${BASE_URL}/network-speed`);

    await driver.findElement(By.id('run-speed-test')).click();

    // Wait for speed result to populate (not '--')
    await driver.wait(async () => {
      const val = await driver.findElement(By.id('speed-result')).getText();
      return val !== '--';
    }, 30000, 'Speed test did not complete in time');

    const speed = await driver.findElement(By.id('speed-result')).getText();
    const latency = await driver.findElement(By.id('speed-latency')).getText();

    expect(parseFloat(speed)).toBeGreaterThan(0);
    expect(parseInt(latency)).toBeGreaterThanOrEqual(0);
  }, 60000);
});
