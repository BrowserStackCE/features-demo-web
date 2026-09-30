/**
 * File Upload & Download — BrowserStack Automate
 * Tests file upload via input and PDF generation/download.
 * Docs: https://www.browserstack.com/docs/automate/selenium/file-upload
 */
const { Builder, By, until } = require('selenium-webdriver');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

describe('File Upload & Download', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder()
      .usingServer('https://hub.browserstack.com/wd/hub')
      .withCapabilities({
        browserName: 'chrome',
        browserVersion: 'latest',
        'bstack:options': {
          sessionName: 'File Upload & Download Test',
        },
      })
      .build();
  }, 30000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test('file upload shows success result with filename', async () => {
    await driver.get(`${BASE_URL}/file-ops`);

    // Use a small fixture file bundled with the test suite
    const sampleFile = path.resolve(__dirname, '../fixtures/sample.txt');
    const fileInput = await driver.findElement(By.id('file-upload'));

    await fileInput.sendKeys(sampleFile);

    await driver.wait(
      until.elementIsVisible(driver.findElement(By.id('upload-result'))),
      5000
    );

    const details = await driver.findElement(By.id('upload-details')).getText();
    expect(details).toContain('sample.txt');
  }, 30000);

  test('generate PDF button creates downloadable PDF link', async () => {
    await driver.get(`${BASE_URL}/file-ops`);

    const generateBtn = await driver.findElement(By.id('generate-pdf-btn'));
    await generateBtn.click();

    // Wait for download link to appear
    await driver.wait(
      until.elementIsVisible(driver.findElement(By.id('download-pdf'))),
      10000
    );

    const downloadLink = await driver.findElement(By.id('download-pdf'));
    const href = await downloadLink.getAttribute('href');
    expect(href).toBeTruthy();

    const btnText = await generateBtn.getText();
    expect(btnText).toBe('PDF Ready');
  }, 30000);
});
