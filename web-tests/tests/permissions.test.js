/**
 * Browser Permissions — BrowserStack Automate
 * Tests camera, microphone, and location permission states.
 * BrowserStack grants permissions automatically via capabilities.
 * Docs: https://www.browserstack.com/docs/automate/selenium/handle-permission-pop-ups
 */
const { Builder, By, until } = require('selenium-webdriver');
const { BASE_URL, BS_HUB_URL, BS_BROWSER, BS_BROWSER_VERSION } = require('./config');

describe('Browser Permissions', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder()
      .usingServer(BS_HUB_URL)
      .withCapabilities({
        browserName: BS_BROWSER,
        browserVersion: BS_BROWSER_VERSION,
        'bstack:options': {
          sessionName: 'Browser Permissions Test',
        },
      })
      .build();
  }, 30000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test('page loads and shows permission cards for camera, mic, and location', async () => {
    await driver.get(`${BASE_URL}/permissions`);

    const cameraStatus = await driver.findElement(By.id('camera-perm-status'));
    const micStatus = await driver.findElement(By.id('mic-perm-status'));
    const locationStatus = await driver.findElement(By.id('location-perm-status'));

    expect(await cameraStatus.isDisplayed()).toBe(true);
    expect(await micStatus.isDisplayed()).toBe(true);
    expect(await locationStatus.isDisplayed()).toBe(true);
  }, 30000);

  test('requesting camera permission updates badge', async () => {
    await driver.get(`${BASE_URL}/permissions`);

    await driver.findElement(By.id('req-camera-perm')).click();

    await driver.wait(async () => {
      const text = await driver.findElement(By.id('camera-perm-status')).getText();
      return text === 'granted' || text === 'denied';
    }, 10000, 'Camera permission badge did not update');

    const status = await driver.findElement(By.id('camera-perm-status')).getText();
    expect(['granted', 'denied']).toContain(status);
  }, 30000);
});
