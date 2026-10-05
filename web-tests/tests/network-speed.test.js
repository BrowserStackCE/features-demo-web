const { Builder, By, until } = require('selenium-webdriver');
const { pageUrl } = require('../helpers/baseUrl');

const NETWORK_SPEED_PAGE_URL = pageUrl('network-speed.html');

// network.yml uses networkProfile: 4g-lte-advanced-good (25 Mbps down).
// Loose band proves throttling without requiring an exact hit.
const MIN_MBPS = 5;
const MAX_MBPS = 35;

describe('Network Speed Throttling', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder().build();
  }, 180000);

  afterAll(async () => {
    if (driver) await driver.quit();
  }, 30000);

  test('4g-lte-advanced-good: measured download speed stays within profile band', async () => {
    await driver.get(NETWORK_SPEED_PAGE_URL);
    await driver.wait(until.titleContains('Network Speed'), 15000);

    const runBtn = await driver.findElement(By.id('run-speed-test'));
    await runBtn.click();

    const statusEl = await driver.findElement(By.id('speed-status'));
    await driver.wait(async () => {
      const text = await statusEl.getText();
      if (text.startsWith('Error:')) {
        throw new Error(`Speed test failed on page: ${text}`);
      }
      return text === 'Test complete';
    }, 180000, 'Timed out waiting for speed test to complete');

    const speedText = await driver.findElement(By.id('speed-result')).getText();
    const latencyText = await driver.findElement(By.id('speed-latency')).getText();

    const speedMbps = parseFloat(speedText);
    const latencyMs = parseFloat(latencyText);

    expect(Number.isFinite(speedMbps)).toBe(true);
    expect(speedMbps).toBeGreaterThanOrEqual(MIN_MBPS);
    expect(speedMbps).toBeLessThanOrEqual(MAX_MBPS);

    expect(Number.isFinite(latencyMs)).toBe(true);
    expect(latencyMs).toBeGreaterThan(0);
    expect(latencyMs).toBeLessThan(5000);
  }, 240000);
});
