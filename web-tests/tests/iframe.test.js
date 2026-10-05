const { Builder, By, until } = require('selenium-webdriver');

const IFRAME_URL = 'https://browserstackce.github.io/features-demo-web/iframe.html';

describe('Cross-Origin iFrame', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder().build();
  }, 180000);

  afterAll(async () => {
    if (driver) await driver.quit();
  }, 30000);

  test('Default iframe loads example.com and shows loaded status', async () => {
    await driver.get(IFRAME_URL);
    await driver.sleep(2000);

    // Verify the load status shows "loaded"
    const loadStatus = await driver.findElement(By.id('iframe-load-status'));
    await driver.wait(until.elementIsVisible(loadStatus), 10000);

    const statusText = await loadStatus.getText();
    expect(statusText.toLowerCase()).toContain('loaded');

    // Pause so the iframe is clearly visible in the session recording
    await driver.sleep(3000);
  }, 60000);

  test('Switch iframe to wikipedia.org and verify select value updates', async () => {
    await driver.get(IFRAME_URL);
    await driver.sleep(2000);

    // Use JS to set the select value and dispatch change event.
    // Avoids waiting for the slow wikipedia.org iframe to fully load.
    await driver.executeScript(`
      const sel = document.getElementById('iframe-url-select');
      sel.value = 'https://en.wikipedia.org/wiki/Main_Page';
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    `);

    // Pause so the iframe src change is clearly visible in the session recording
    await driver.sleep(3000);

    // Assert the select value was updated
    const urlSelect = await driver.findElement(By.id('iframe-url-select'));
    const selectedValue = await urlSelect.getAttribute('value');
    expect(selectedValue).toContain('wikipedia');

    await driver.sleep(2000);
  }, 60000);
});
