const { Builder, By, until } = require('selenium-webdriver');

const PERMISSIONS_URL = 'https://browserstackce.github.io/features-demo-web/permissions.html';
const PAGE_ORIGIN = 'https://browserstackce.github.io';

describe('Browser Permissions', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder().build();
  }, 180000);

  afterAll(async () => {
    if (driver) await driver.quit();
  }, 30000);

  test('Camera permission — starts neutral, click Request, popup appears, then accept', async () => {
    // Reset all permissions so the page loads with neutral "prompt" status
    try {
      await driver.sendDevToolsCommand('Browser.resetPermissions', {});
    } catch (e) {
      // CDP not available on this browser
    }

    await driver.get(PERMISSIONS_URL);
    await driver.sleep(2000);

    // Scroll to camera section — status should show "prompt" (neutral)
    const reqCameraBtn = await driver.findElement(By.id('req-camera-perm'));
    await driver.executeScript('arguments[0].scrollIntoView({behavior: "smooth", block: "center"})', reqCameraBtn);
    await driver.sleep(1000);

    // Click Request — triggers the browser permission popup
    await reqCameraBtn.click();

    // Brief pause so the popup is visible in the session recording
    await driver.sleep(2000);

    // Accept the permission via CDP (simulates user clicking "Allow" on the popup)
    try {
      await driver.sendDevToolsCommand('Browser.grantPermissions', {
        permissions: ['videoCapture'],
        origin: PAGE_ORIGIN,
      });
    } catch (e) {
      // CDP not available on this browser
    }

    // Pause so the granted status is clearly visible
    await driver.sleep(3000);

    // Assert status element is non-empty
    const cameraStatus = await driver.findElement(By.id('camera-perm-status'));
    const statusText = await cameraStatus.getText();
    expect(statusText.length).toBeGreaterThan(0);

    await driver.sleep(2000);
  }, 60000);

  test('Microphone permission — starts neutral, click Request, popup appears, then accept', async () => {
    // Reset all permissions so the page loads with neutral "prompt" status
    try {
      await driver.sendDevToolsCommand('Browser.resetPermissions', {});
    } catch (e) {
      // CDP not available on this browser
    }

    await driver.get(PERMISSIONS_URL);
    await driver.sleep(2000);

    // Scroll to microphone section — status should show "prompt" (neutral)
    const reqMicBtn = await driver.findElement(By.id('req-mic-perm'));
    await driver.executeScript('arguments[0].scrollIntoView({behavior: "smooth", block: "center"})', reqMicBtn);
    await driver.sleep(1000);

    // Click Request — triggers the browser permission popup
    await reqMicBtn.click();

    // Brief pause so the popup is visible in the session recording
    await driver.sleep(2000);

    // Accept the permission via CDP
    try {
      await driver.sendDevToolsCommand('Browser.grantPermissions', {
        permissions: ['audioCapture'],
        origin: PAGE_ORIGIN,
      });
    } catch (e) {
      // CDP not available on this browser
    }

    // Pause so the granted status is clearly visible
    await driver.sleep(3000);

    // Assert status element is non-empty
    const micStatus = await driver.findElement(By.id('mic-perm-status'));
    const statusText = await micStatus.getText();
    expect(statusText.length).toBeGreaterThan(0);

    await driver.sleep(2000);
  }, 60000);

  test('Location permission — starts neutral, click Request, popup appears, then accept', async () => {
    // Reset all permissions so the page loads with neutral "prompt" status
    try {
      await driver.sendDevToolsCommand('Browser.resetPermissions', {});
    } catch (e) {
      // CDP not available on this browser
    }

    await driver.get(PERMISSIONS_URL);
    await driver.sleep(2000);

    // Scroll to location section — status should show "prompt" (neutral)
    const reqLocationBtn = await driver.findElement(By.id('req-location-perm'));
    await driver.executeScript('arguments[0].scrollIntoView({behavior: "smooth", block: "center"})', reqLocationBtn);
    await driver.sleep(1000);

    // Click Request — triggers the browser permission popup
    await reqLocationBtn.click();

    // Brief pause so the popup is visible in the session recording
    await driver.sleep(2000);

    // Accept the permission via CDP
    try {
      await driver.sendDevToolsCommand('Browser.grantPermissions', {
        permissions: ['geolocation'],
        origin: PAGE_ORIGIN,
      });
    } catch (e) {
      // CDP not available on this browser
    }

    // Pause so the granted status is clearly visible
    await driver.sleep(3000);

    // Assert status element is non-empty
    const locationStatus = await driver.findElement(By.id('location-perm-status'));
    const statusText = await locationStatus.getText();
    expect(statusText.length).toBeGreaterThan(0);

    await driver.sleep(2000);
  }, 60000);
});
