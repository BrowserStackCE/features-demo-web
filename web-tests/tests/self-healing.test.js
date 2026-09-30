/**
 * Self-Healing Selectors — BrowserStack Automate
 * Tests the self-healing demo page which toggles between stable (Mode X)
 * and changed (Mode Y) DOM attributes to simulate selector drift.
 * Docs: https://www.browserstack.com/docs/automate/selenium/self-healing
 */
const { Builder, By, until } = require('selenium-webdriver');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

describe('Self-Healing Selectors', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder()
      .usingServer('https://hub.browserstack.com/wd/hub')
      .withCapabilities({
        browserName: 'chrome',
        browserVersion: 'latest',
        'bstack:options': {
          sessionName: 'Self-Healing Selectors Test',
        },
      })
      .build();
  }, 30000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test('Mode X — login form works with stable IDs', async () => {
    await driver.get(`${BASE_URL}/self-healing`);

    // Mode X is default — stable IDs present
    await driver.findElement(By.id('username')).sendKeys('testuser');
    await driver.findElement(By.id('password')).sendKeys('testpass');
    await driver.findElement(By.id('login-btn')).click();

    await driver.wait(
      until.elementIsVisible(driver.findElement(By.id('login-result'))),
      5000
    );

    const result = await driver.findElement(By.id('login-result')).getText();
    expect(result).toContain('Login successful');
  }, 30000);

  test('Mode Y — toggle changes DOM attributes, self-healing recovers', async () => {
    await driver.get(`${BASE_URL}/self-healing`);

    // Switch to Mode Y (changed attributes)
    await driver.findElement(By.id('mode-toggle')).click();
    await driver.sleep(500);

    const banner = await driver.findElement(By.id('selector-mode-banner'));
    const bannerText = await banner.getText();
    expect(bannerText).toContain('Mode Y');

    // Self-healing should find the login fields via data-qa attributes
    await driver.findElement(By.css('[data-qa="user-field"]')).sendKeys('testuser');
    await driver.findElement(By.css('[data-qa="pass-field"]')).sendKeys('testpass');
    await driver.findElement(By.css('[data-qa="submit-btn"]')).click();

    await driver.wait(
      until.elementIsVisible(driver.findElement(By.id('login-result'))),
      5000
    );

    const result = await driver.findElement(By.id('login-result')).getText();
    expect(result).toContain('Login successful');
  }, 60000);
});
