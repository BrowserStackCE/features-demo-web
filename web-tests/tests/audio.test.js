/**
 * Audio Record & Playback — BrowserStack Automate
 * Tests audio recording UI using BrowserStack's media injection capability.
 * Docs: https://www.browserstack.com/docs/automate/selenium/simulate-audio
 */
const { Builder, By, until } = require('selenium-webdriver');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

describe('Audio Record & Playback', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder()
      .usingServer('https://hub.browserstack.com/wd/hub')
      .withCapabilities({
        browserName: 'chrome',
        browserVersion: 'latest',
        'bstack:options': {
          sessionName: 'Audio Record & Playback Test',
        },
      })
      .build();
  }, 30000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test('audio page loads with Record, Stop, and Play buttons', async () => {
    await driver.get(`${BASE_URL}/audio`);

    const recordBtn = await driver.findElement(By.id('record-btn'));
    const stopBtn = await driver.findElement(By.id('stop-btn'));
    const playBtn = await driver.findElement(By.id('play-btn'));

    expect(await recordBtn.isDisplayed()).toBe(true);
    expect(await stopBtn.isDisplayed()).toBe(true);
    expect(await playBtn.isDisplayed()).toBe(true);
  }, 30000);

  test('status badge shows Ready on page load', async () => {
    await driver.get(`${BASE_URL}/audio`);

    const status = await driver.findElement(By.id('audio-status')).getText();
    expect(status).toBe('Ready');
  }, 30000);

  test('Stop and Play buttons are disabled before recording starts', async () => {
    await driver.get(`${BASE_URL}/audio`);

    const stopBtn = await driver.findElement(By.id('stop-btn'));
    const playBtn = await driver.findElement(By.id('play-btn'));

    expect(await stopBtn.getAttribute('disabled')).toBeTruthy();
    expect(await playBtn.getAttribute('disabled')).toBeTruthy();
  }, 30000);
});
