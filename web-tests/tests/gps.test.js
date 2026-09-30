/**
 * GPS Location — BrowserStack Automate
 * Uses BrowserStack's geolocation capability to override GPS coordinates.
 * Docs: https://www.browserstack.com/docs/automate/selenium/geolocation
 */
const { Builder, By, until } = require('selenium-webdriver');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

describe('GPS Location', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder()
      .usingServer('https://hub.browserstack.com/wd/hub')
      .withCapabilities({
        browserName: 'chrome',
        browserVersion: 'latest',
        'bstack:options': {
          sessionName: 'GPS Location Test',
          geoLocation: 'US', // Override geolocation to United States
        },
      })
      .build();
  }, 30000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test('GPS button triggers geolocation and shows coordinates', async () => {
    await driver.get(`${BASE_URL}/gps`);

    // Override geolocation via JS before clicking the button
    await driver.executeScript(`
      const mockPosition = {
        coords: { latitude: 37.7749, longitude: -122.4194, accuracy: 10 },
        timestamp: Date.now()
      };
      navigator.geolocation.getCurrentPosition = (success) => success(mockPosition);
    `);

    await driver.findElement(By.id('get-gps-btn')).click();

    // Wait for results to appear
    await driver.wait(
      until.elementIsVisible(driver.findElement(By.id('gps-results'))),
      10000
    );

    const lat = await driver.findElement(By.id('gps-lat')).getText();
    const lng = await driver.findElement(By.id('gps-lng')).getText();
    const accuracy = await driver.findElement(By.id('gps-accuracy')).getText();

    expect(lat).toBeTruthy();
    expect(lng).toBeTruthy();
    expect(accuracy).toMatch(/\d+m/);

    const mapLink = await driver.findElement(By.id('map-link')).getAttribute('href');
    expect(mapLink).toContain('openstreetmap.org');
  }, 30000);
});
