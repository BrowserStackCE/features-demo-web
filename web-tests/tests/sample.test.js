const { Builder } = require('selenium-webdriver');

describe('BrowserStack Demo', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder()
      .usingServer('https://hub.browserstack.com/wd/hub')
      .withCapabilities({
        browserName: 'chrome',
        browserVersion: 'latest',
        'bstack:options': {
          sessionName: 'Jest Sample Test',
        },
      })
      .build();
  }, 30000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test('BrowserStack homepage loads', async () => {
    await driver.get('https://www.browserstack.com');
    const title = await driver.getTitle();
    expect(title).toContain('BrowserStack');
  }, 60000);
});
