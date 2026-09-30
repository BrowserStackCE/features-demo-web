/**
 * IP Geolocation — BrowserStack Automate
 * Tests IP-based geolocation lookup using BrowserStack's IP geolocation feature.
 * Docs: https://www.browserstack.com/docs/automate/selenium/ip-geolocation
 */
const { Builder, By, until } = require('selenium-webdriver');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

describe('IP Geolocation', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder()
      .usingServer('https://hub.browserstack.com/wd/hub')
      .withCapabilities({
        browserName: 'chrome',
        browserVersion: 'latest',
        'bstack:options': {
          sessionName: 'IP Geolocation Test',
          geoLocation: 'GB', // Route traffic through UK IP
        },
      })
      .build();
  }, 30000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test('fetch location button shows IP geolocation data', async () => {
    await driver.get(`${BASE_URL}/ip-geolocation`);

    await driver.findElement(By.id('fetch-ip-geo')).click();

    // Wait for loading indicator to disappear then results to appear
    await driver.wait(
      until.elementIsNotVisible(driver.findElement(By.id('geo-loading'))),
      20000
    );
    await driver.wait(
      until.elementIsVisible(driver.findElement(By.id('geo-results'))),
      20000
    );

    const ip = await driver.findElement(By.id('ip-address')).getText();
    const country = await driver.findElement(By.id('ip-country')).getText();
    const city = await driver.findElement(By.id('ip-city')).getText();

    expect(ip).toMatch(/\d+\.\d+\.\d+\.\d+/); // valid IPv4
    expect(country).toBeTruthy();
    expect(city).toBeTruthy();
  }, 30000);
});
