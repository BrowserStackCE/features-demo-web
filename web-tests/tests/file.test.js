const { Builder, By, until } = require('selenium-webdriver');
const path = require('path');
const fs = require('fs');

const FILE_OPS_URL = 'https://browserstackce.github.io/features-demo-web/file-ops.html';
const FIXTURE_PATH = path.resolve(__dirname, '../fixtures/sample.txt');

describe('File Upload & Download', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder().build();
  }, 180000);

  afterAll(async () => {
    if (driver) await driver.quit();
  }, 30000);

  test('File Upload — upload sample.txt and verify result panel', async () => {
    await driver.get(FILE_OPS_URL);

    // Pause so the page is clearly visible before upload starts
    await driver.sleep(2000);

    // Highlight the upload drop zone so it is clearly visible in the session recording
    await driver.executeScript(`
      const label = document.querySelector('label');
      if (label) {
        label.style.border = '3px solid #2563eb';
        label.style.background = '#dbeafe';
      }
    `);
    await driver.sleep(1500);

    // Read fixture content and inject a synthetic File object via JS DataTransfer.
    // The hidden input is made visible first so the upload action is visible in the recording.
    const fileContent = fs.readFileSync(FIXTURE_PATH, 'utf8');
    const fileName = path.basename(FIXTURE_PATH);

    // Make the file input visible so the filename appears in the session recording
    await driver.executeScript(`
      const input = document.getElementById('file-upload');
      input.style.display = 'block';
      input.style.position = 'relative';
      input.style.zIndex = '9999';
      input.style.opacity = '1';
      input.style.width = '100%';
      input.style.marginTop = '8px';
    `);
    await driver.sleep(1000);

    // Inject the file via DataTransfer and dispatch change event
    await driver.executeScript(`
      const input = document.getElementById('file-upload');
      const blob = new Blob([arguments[0]], { type: 'text/plain' });
      const file = new File([blob], arguments[1], { type: 'text/plain' });
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    `, fileContent, fileName);

    // Wait for the upload result panel to become visible
    const uploadResult = await driver.findElement(By.id('upload-result'));
    await driver.wait(until.elementIsVisible(uploadResult), 10000);

    // Pause so the upload result (filename, size) is clearly visible in the session recording
    await driver.sleep(3000);

    // Assert that upload details text is non-empty
    const uploadDetails = await driver.findElement(By.id('upload-details'));
    const detailsText = await uploadDetails.getText();
    expect(detailsText.length).toBeGreaterThan(0);

    // Final pause before test ends
    await driver.sleep(2000);
  }, 60000);

  test('PDF Download — click Generate & Download PDF and verify download link', async () => {
    await driver.get(FILE_OPS_URL);

    // Pause so the page is clearly visible before clicking
    await driver.sleep(2000);

    // Scroll to and highlight the PDF download button
    const generateBtn = await driver.findElement(By.id('generate-pdf-btn'));
    await driver.executeScript('arguments[0].scrollIntoView({behavior: "smooth", block: "center"})', generateBtn);
    await driver.sleep(1000);

    // Click the Generate & Download PDF button
    await generateBtn.click();

    // Wait for the download anchor to appear
    const downloadLink = await driver.findElement(By.id('download-pdf'));
    await driver.wait(until.elementIsVisible(downloadLink), 10000);

    // Pause so the download link is clearly visible in the session recording
    await driver.sleep(3000);

    // The app generates a client-side Blob URL (blob:https://...) — assert it is non-empty
    const href = await downloadLink.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href.length).toBeGreaterThan(0);

    // Final pause before test ends
    await driver.sleep(2000);
  }, 60000);
});
