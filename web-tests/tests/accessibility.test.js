const { Builder, By, until } = require('selenium-webdriver');

const ACCESSIBILITY_URL =
  process.env.ACCESSIBILITY_URL ||
  'https://browserstackce.github.io/features-demo-web/accessibility.html';

/**
 * The accessibility scan is enabled by `accessibility: true` in
 * config/accessibility.yml. The SDK scans each page the session loads and
 * reports results to the BrowserStack Accessibility dashboard.
 */

describe('Accessibility page', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder().build();
  }, 180000);

  afterAll(async () => {
    if (driver) await driver.quit();
  }, 30000);

  test('loads the accessibility sample page with all sections', async () => {
    await driver.get(ACCESSIBILITY_URL);
    await driver.wait(
      until.elementLocated(By.id('images-section')),
      10000,
      'accessibility page did not load'
    );

    const sectionIds = [
      'images-section',
      'forms-section',
      'buttons-section',
      'text-section',
      'links-section',
      'headings-section',
      'table-section',
      'controls-section',
      'media-section',
      'widgets-section',
      'language-section',
    ];
    for (const id of sectionIds) {
      const section = await driver.findElement(By.id(id));
      expect(await section.isDisplayed()).toBe(true);
    }

    const heading = await driver.findElement(By.css('h1'));
    expect(await heading.getText()).toBe('Accessibility');

    await driver.sleep(2000);
  }, 60000);

  test('modal dialog opens and closes', async () => {
    await driver.get(ACCESSIBILITY_URL);
    await driver.wait(until.elementLocated(By.id('modal-open')), 10000);

    const openBtn = await driver.findElement(By.id('modal-open'));
    await driver.executeScript('arguments[0].scrollIntoView({block:"center"})', openBtn);
    await openBtn.click();

    const closeBtn = await driver.wait(
      until.elementIsVisible(await driver.findElement(By.id('modal-close'))),
      5000
    );
    await closeBtn.click();

    const open = await driver.executeScript('return document.getElementById("dialog-one").open');
    expect(open).toBe(false);

    await driver.sleep(1000);
  }, 60000);
});
