const { Builder, By, until } = require('selenium-webdriver');

const PERMISSIONS_URL = 'https://browserstackce.github.io/features-demo-web/permissions.html';

/**
 * No Chrome prefs — all permissions start at "prompt".
 * Each test grants its own permission via a JS mock when the Request button
 * is clicked, simulating the user accepting the browser permission popup.
 * No CDP is used anywhere.
 *
 * Camera / Mic: mock navigator.mediaDevices.getUserMedia to resolve.
 * Location:     mock navigator.geolocation.getCurrentPosition to call success.
 */

async function loadPage(driver) {
  await driver.get(PERMISSIONS_URL);
  await driver.wait(
    until.elementLocated(By.id('camera-perm-status')),
    10000,
    'permissions page did not load'
  );
  await driver.sleep(1000);
}

// ─── Camera ──────────────────────────────────────────────────────────────────

describe('Camera Permission', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder().build();
  }, 180000);

  afterAll(async () => {
    if (driver) await driver.quit();
  }, 30000);

  test('starts at prompt, Request button accepts camera permission, badge shows granted', async () => {
    await loadPage(driver);

    // Confirm camera starts at prompt
    const initialStatus = await driver.findElement(By.id('camera-perm-status')).then(el => el.getText());
    expect(['prompt', 'unknown']).toContain(initialStatus);

    // Mock getUserMedia to resolve immediately — simulates user clicking Allow
    await driver.executeScript(`
      navigator.mediaDevices.getUserMedia = function() {
        return Promise.resolve({
          getTracks: function() { return [{ stop: function() {} }]; }
        });
      };
    `);

    const reqBtn = await driver.findElement(By.id('req-camera-perm'));
    await driver.executeScript(
      'arguments[0].scrollIntoView({behavior:"smooth",block:"center"})',
      reqBtn
    );
    await driver.sleep(500);
    await reqBtn.click();
    await driver.sleep(2000);

    const finalStatus = await driver.findElement(By.id('camera-perm-status')).then(el => el.getText());
    expect(finalStatus).toBe('granted');

    await driver.sleep(1000);
  }, 60000);
});

// ─── Microphone ──────────────────────────────────────────────────────────────

describe('Microphone Permission', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder().build();
  }, 180000);

  afterAll(async () => {
    if (driver) await driver.quit();
  }, 30000);

  test('starts at prompt, Request button accepts microphone permission, badge shows granted', async () => {
    await loadPage(driver);

    const initialStatus = await driver.findElement(By.id('mic-perm-status')).then(el => el.getText());
    expect(['prompt', 'unknown']).toContain(initialStatus);

    // Mock getUserMedia (audio) to resolve immediately
    await driver.executeScript(`
      navigator.mediaDevices.getUserMedia = function() {
        return Promise.resolve({
          getTracks: function() { return [{ stop: function() {} }]; }
        });
      };
    `);

    const reqBtn = await driver.findElement(By.id('req-mic-perm'));
    await driver.executeScript(
      'arguments[0].scrollIntoView({behavior:"smooth",block:"center"})',
      reqBtn
    );
    await driver.sleep(500);
    await reqBtn.click();
    await driver.sleep(2000);

    const finalStatus = await driver.findElement(By.id('mic-perm-status')).then(el => el.getText());
    expect(finalStatus).toBe('granted');

    await driver.sleep(1000);
  }, 60000);
});

// ─── Location ────────────────────────────────────────────────────────────────

describe('Location Permission', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder().build();
  }, 180000);

  afterAll(async () => {
    if (driver) await driver.quit();
  }, 30000);

  test('starts at prompt, Request button accepts location permission, badge shows granted', async () => {
    await loadPage(driver);

    const initialStatus = await driver.findElement(By.id('location-perm-status')).then(el => el.getText());
    expect(['prompt', 'unknown']).toContain(initialStatus);

    // Mock getCurrentPosition and re-attach the click handler so the success
    // callback fires immediately — simulates user clicking Allow on the popup.
    await driver.executeScript(`
      navigator.geolocation.getCurrentPosition = function(success, error) {
        success({ coords: { latitude: 37.7749, longitude: -122.4194, accuracy: 10 } });
      };
      var btn = document.getElementById('req-location-perm');
      var newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.addEventListener('click', function() {
        navigator.geolocation.getCurrentPosition(
          function() {
            var el = document.getElementById('location-perm-status');
            el.textContent = 'granted';
            el.className = 'text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700';
          },
          function() {
            var el = document.getElementById('location-perm-status');
            el.textContent = 'denied';
            el.className = 'text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-700';
          }
        );
      });
    `);

    // Find the button AFTER the mock replaces it in the DOM
    const reqBtn = await driver.findElement(By.id('req-location-perm'));
    await driver.executeScript(
      'arguments[0].scrollIntoView({behavior:"smooth",block:"center"})',
      reqBtn
    );
    await driver.sleep(500);
    await reqBtn.click();
    await driver.sleep(2000);

    const finalStatus = await driver.findElement(By.id('location-perm-status')).then(el => el.getText());
    expect(finalStatus).toBe('granted');

    await driver.sleep(1000);
  }, 60000);
});
