/**
 * Cross-Origin iFrame — BrowserStack Automate
 * Tests cross-origin iframe rendering and switching.
 * Docs: https://www.browserstack.com/docs/automate/selenium/handle-iframes
 */
const { Builder, By, until } = require('selenium-webdriver');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

describe('Cross-Origin iFrame', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder()
      .usingServer('https://hub.browserstack.com/wd/hub')
      .withCapabilities({
        browserName: 'chrome',
        browserVersion: 'latest',
        'bstack:options': {
          sessionName: 'Cross-Origin iFrame Test',
        },
      })
      .build();
  }, 30000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test('iframe loads with default URL (example.com)', async () => {
    await driver.get(`${BASE_URL}/iframe`);

    const iframe = await driver.findElement(By.id('cross-origin-frame'));
    expect(await iframe.isDisplayed()).toBe(true);

    const src = await iframe.getAttribute('src');
    expect(src).toContain('example.com');
  }, 30000);

  test('selecting a different URL updates the iframe src', async () => {
    await driver.get(`${BASE_URL}/iframe`);

    const select = await driver.findElement(By.id('iframe-url-select'));
    const options = await select.findElements(By.css('option'));

    // Pick the second option
    if (options.length > 1) {
      await options[1].click();
      await driver.sleep(1000);

      const iframe = await driver.findElement(By.id('cross-origin-frame'));
      const src = await iframe.getAttribute('src');
      const selectedValue = await options[1].getAttribute('value');
      expect(src).toContain(selectedValue.replace('https://', '').split('/')[0]);
    }
  }, 30000);

  test('can switch into iframe context', async () => {
    await driver.get(`${BASE_URL}/iframe`);

    const iframe = await driver.findElement(By.id('cross-origin-frame'));
    await driver.switchTo().frame(iframe);

    // Verify we're inside the iframe by checking the page source
    const bodyText = await driver.findElement(By.css('body')).getText();
    expect(bodyText).toBeTruthy();

    await driver.switchTo().defaultContent();
  }, 30000);
});
