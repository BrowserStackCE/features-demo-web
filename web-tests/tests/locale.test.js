/**
 * Language & Timezone — BrowserStack Automate
 * Tests locale and timezone display using BrowserStack's locale/timezone capabilities.
 * Docs: https://www.browserstack.com/docs/automate/selenium/timezone
 *       https://www.browserstack.com/docs/automate/selenium/set-language
 */
const { Builder, By } = require('selenium-webdriver');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

describe('Language and Timezone', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder()
      .usingServer('https://hub.browserstack.com/wd/hub')
      .withCapabilities({
        browserName: 'chrome',
        browserVersion: 'latest',
        'bstack:options': {
          sessionName: 'Locale & Timezone Test',
          timezone: 'New_York',
          browserLanguage: 'fr-FR',
        },
      })
      .build();
  }, 30000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test('page displays language, timezone, and locale info', async () => {
    await driver.get(`${BASE_URL}/locale`);

    // Page auto-populates on load — wait briefly for JS to run
    await driver.sleep(1000);

    const language = await driver.findElement(By.id('device-language')).getText();
    const timezone = await driver.findElement(By.id('device-timezone')).getText();
    const locale = await driver.findElement(By.id('device-locale')).getText();
    const offset = await driver.findElement(By.id('device-offset')).getText();

    expect(language).toBeTruthy();
    expect(timezone).toBeTruthy();
    expect(locale).toBeTruthy();
    expect(offset).toBeTruthy();
  }, 30000);

  test('timezone reflects BrowserStack timezone override (America/New_York)', async () => {
    await driver.get(`${BASE_URL}/locale`);
    await driver.sleep(1000);

    const timezone = await driver.findElement(By.id('device-timezone')).getText();
    expect(timezone).toContain('New_York');
  }, 30000);
});
