const { Builder, By, until } = require('selenium-webdriver');
const { pageUrl } = require('../helpers/baseUrl');

const SELF_HEALING_PAGE_URL = pageUrl('self-healing.html');

/**
 * Always use Mode X locators (#username, #password, #login-btn).
 * In Mode Y those ids are renamed; BrowserStack Self-Heal recovers the elements.
 */
async function loginWithModeXSelectors(driver) {
  await driver.findElement(By.css('#username')).sendKeys('demo-user');
  await driver.findElement(By.css('#password')).sendKeys('demo-pass');
  await driver.findElement(By.css('#login-btn')).click();

  await driver.wait(until.elementLocated(By.css('#login-result')), 10000);
  const result = await driver.findElement(By.css('#login-result'));
  await driver.wait(until.elementTextMatches(result, /Login successful/), 10000);
  expect(await result.getText()).toMatch(/Login successful/);
}

describe('Self-Healing Selectors', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder().build();
  }, 180000);

  afterAll(async () => {
    if (driver) await driver.quit();
  }, 30000);

  // Baseline run — registers element context for Self-Heal Agent
  test('Mode X: login succeeds with stable id selectors', async () => {
    await driver.get(SELF_HEALING_PAGE_URL);
    await driver.wait(until.titleContains('Self-Healing'), 15000);

    await loginWithModeXSelectors(driver);
  }, 120000);

  // Same locators after DOM refactor — Self-Heal recovers the renamed ids
  test('Mode Y: same id selectors heal after mode toggle', async () => {
    await driver.get(SELF_HEALING_PAGE_URL);
    await driver.wait(until.titleContains('Self-Healing'), 15000);

    const modeToggle = await driver.findElement(By.css('#mode-toggle'));
    await modeToggle.click();
    await driver.wait(until.elementTextIs(modeToggle, 'Switch to Mode X'), 5000);

    await loginWithModeXSelectors(driver);
  }, 120000);
});
