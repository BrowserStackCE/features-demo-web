const { Builder, By, until } = require('selenium-webdriver');

const GPS_URL = 'https://browserstackce.github.io/features-demo-web/gps.html';

describe('GPS Location', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder().build();
  }, 180000);

  afterAll(async () => {
    if (driver) await driver.quit();
  }, 30000);

  test('Get My GPS Location — page loads with button and GPS results appear after mock', async () => {
    await driver.get(GPS_URL);
    await driver.sleep(2000);

    // Mock the browser Geolocation API so the app receives coordinates
    // without requiring a real GPS permission grant on the remote session
    await driver.executeScript(`
      navigator.geolocation.getCurrentPosition = function(success) {
        success({
          coords: {
            latitude: 37.7749,
            longitude: -122.4194,
            accuracy: 10
          }
        });
      };
    `);

    // Click the Get My GPS Location button
    const gpsBtn = await driver.findElement(By.id('get-gps-btn'));
    await gpsBtn.click();

    // Wait for GPS results panel to become visible
    const gpsResults = await driver.findElement(By.id('gps-results'));
    await driver.wait(until.elementIsVisible(gpsResults), 10000);

    // Pause so results are clearly visible in the session recording
    await driver.sleep(3000);

    // Assert latitude is populated
    const gpsLat = await driver.findElement(By.id('gps-lat'));
    const latText = await gpsLat.getText();
    expect(latText.length).toBeGreaterThan(0);

    // Assert longitude is populated
    const gpsLng = await driver.findElement(By.id('gps-lng'));
    const lngText = await gpsLng.getText();
    expect(lngText.length).toBeGreaterThan(0);

    await driver.sleep(2000);
  }, 60000);
});
