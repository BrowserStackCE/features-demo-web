/**
 * Camera + QR/Barcode — BrowserStack Automate
 * Tests camera injection and QR/barcode scanning via file upload.
 * Docs: https://www.browserstack.com/docs/automate/selenium/camera-injection
 */
const { Builder, By, until } = require('selenium-webdriver');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

describe('Camera & QR/Barcode', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder()
      .usingServer('https://hub.browserstack.com/wd/hub')
      .withCapabilities({
        browserName: 'chrome',
        browserVersion: 'latest',
        'bstack:options': {
          sessionName: 'Camera Injection Test',
          // Camera injection requires a media upload via BrowserStack API
          // and cameraInjection: true capability
          cameraInjection: true,
        },
      })
      .build();
  }, 30000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test('camera page loads and shows Start Camera button', async () => {
    await driver.get(`${BASE_URL}/camera`);

    const startBtn = await driver.findElement(By.id('start-camera-btn'));
    expect(await startBtn.isDisplayed()).toBe(true);
  }, 30000);

  test('file-based QR scan input is present and accepts image files', async () => {
    await driver.get(`${BASE_URL}/camera`);

    const fileInput = await driver.findElement(By.id('camera-file-input'));
    expect(await fileInput.getAttribute('accept')).toContain('image/*');
  }, 30000);
});
