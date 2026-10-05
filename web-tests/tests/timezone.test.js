const { Builder, By, until } = require('selenium-webdriver');

const TIMEZONE_URL = 'https://browserstackce.github.io/features-demo-web/locale.html';

describe('Device Language & Timezone', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder().build();
  }, 180000);

  afterAll(async () => {
    if (driver) await driver.quit();
  }, 30000);

  test('Timezone info — device timezone and UTC offset are displayed', async () => {
    await driver.get(TIMEZONE_URL);
    await driver.sleep(2000);

    // Assert device timezone is populated
    const timezone = await driver.findElement(By.id('device-timezone'));
    await driver.wait(until.elementIsVisible(timezone), 5000);
    const timezoneText = await timezone.getText();
    expect(timezoneText.length).toBeGreaterThan(0);

    // Assert UTC offset is populated
    const offset = await driver.findElement(By.id('device-offset'));
    const offsetText = await offset.getText();
    expect(offsetText).toMatch(/UTC/i);

    // Pause so timezone info is clearly visible in the session recording
    await driver.sleep(3000);
  }, 60000);

  test('Language info — device language and locale are displayed', async () => {
    await driver.get(TIMEZONE_URL);
    await driver.sleep(2000);

    // Assert device language is populated
    const language = await driver.findElement(By.id('device-language'));
    await driver.wait(until.elementIsVisible(language), 5000);
    const languageText = await language.getText();
    expect(languageText.length).toBeGreaterThan(0);

    // Assert device locale is populated
    const locale = await driver.findElement(By.id('device-locale'));
    const localeText = await locale.getText();
    expect(localeText.length).toBeGreaterThan(0);

    // Assert current time is displayed
    const deviceTime = await driver.findElement(By.id('device-time'));
    const timeText = await deviceTime.getText();
    expect(timeText).toMatch(/\d{1,2}:\d{2}/);

    // Pause so language/locale info is clearly visible in the session recording
    await driver.sleep(3000);
  }, 60000);
});
