const { Builder, By, until } = require('selenium-webdriver');
const { pageUrl } = require('../helpers/baseUrl');

const CAMERA_PAGE_URL = pageUrl('camera.html');

describe('Camera Injection and QR Scanner', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder().build();
  }, 180000);

  afterAll(async () => {
    if (driver) await driver.quit();
  }, 30000);

  // Requires cameraInjection + cameraInjectionUrl (set via npm run test:camera).
  test('Camera injection: inject video stream and verify live camera feed activates TC-camera-injection', async () => {
    await driver.get(CAMERA_PAGE_URL);
    await driver.wait(until.titleContains('Camera'), 15000);

    // Verify page heading
    const heading = await driver.findElement(By.css('h1'));
    expect(await heading.getText()).toBe('Camera + QR/Barcode Scanning');

    // Verify scan badge starts Idle
    const scanBadge = await driver.findElement(By.id('scan-badge'));
    expect(await scanBadge.getText()).toBe('Idle');

    // Click Start Camera — with cameraInjection: true and cameraInjectionUrl set,
    // BrowserStack injects the uploaded MP4 as the camera stream
    const startBtn = await driver.findElement(By.id('start-camera-btn'));
    await startBtn.click();

    // Wait for scan badge to update to Scanning... or Decoded
    await driver.wait(
      until.elementTextMatches(
        driver.findElement(By.id('scan-badge')),
        /Scanning\.\.\.|Decoded/
      ),
      20000
    );

    const activeBadgeText = await driver.findElement(By.id('scan-badge')).getText();
    expect(activeBadgeText).toMatch(/Scanning\.\.\.|Decoded/);

    // Verify Stop button is enabled
    const stopBtn = await driver.findElement(By.id('stop-camera-btn'));
    expect(await stopBtn.isEnabled()).toBe(true);

    // Stop the camera
    await stopBtn.click();

    // Verify badge returns to Idle
    await driver.wait(
      until.elementTextIs(driver.findElement(By.id('scan-badge')), 'Idle'),
      10000
    );
    expect(await driver.findElement(By.id('scan-badge')).getText()).toBe('Idle');
  }, 120000);
});
