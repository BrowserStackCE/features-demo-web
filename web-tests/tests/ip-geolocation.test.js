const { Builder, By, until } = require('selenium-webdriver');

const IP_GEO_URL = 'https://browserstackce.github.io/features-demo-web/ip-geolocation.html';

describe('IP Geolocation', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder().build();
  }, 180000);

  afterAll(async () => {
    if (driver) await driver.quit();
  }, 30000);

  test('Fetch My Location — displays IP geolocation results', async () => {
    await driver.get(IP_GEO_URL);
    await driver.sleep(2000);

    // Click the Fetch My Location button
    const fetchBtn = await driver.findElement(By.id('fetch-ip-geo'));
    await fetchBtn.click();

    // Wait for results panel to become visible
    const geoResults = await driver.findElement(By.id('geo-results'));
    await driver.wait(until.elementIsVisible(geoResults), 15000);

    // Pause so results are clearly visible in the session recording
    await driver.sleep(3000);

    // Assert IP address field is populated
    const ipAddress = await driver.findElement(By.id('ip-address'));
    const ipText = await ipAddress.getText();
    expect(ipText.length).toBeGreaterThan(0);

    // Assert country field is populated
    const ipCountry = await driver.findElement(By.id('ip-country'));
    const countryText = await ipCountry.getText();
    expect(countryText.length).toBeGreaterThan(0);

    await driver.sleep(2000);
  }, 60000);
});
