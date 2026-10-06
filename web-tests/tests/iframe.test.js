const { Builder, By, until } = require('selenium-webdriver');

const IFRAME_URL = 'https://browserstackce.github.io/features-demo-web/iframe.html';

describe('Cross-Origin iFrame', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder().build();
  }, 180000);

  afterAll(async () => {
    if (driver) await driver.quit();
  }, 30000);

  test('iframe lifecycle: loads example.com, status transitions loading→loaded, content extracted', async () => {
    await driver.get(IFRAME_URL);

    // 1. Badge starts at "loading..." before the iframe fires its load event
    const badge = await driver.findElement(By.id('iframe-load-status'));
    await driver.wait(until.elementIsVisible(badge), 5000);

    // 2. Wait for the badge to transition to "loaded" — validates the load event fired
    await driver.wait(
      async () => (await badge.getText()).toLowerCase().includes('loaded'),
      10000,
      'iframe did not fire load event within 10s'
    );
    const loadedText = await badge.getText();
    expect(loadedText.toLowerCase()).toContain('loaded');

    // 3. Verify the iframe src is example.com
    const iframeEl = await driver.findElement(By.id('cross-origin-frame'));
    const initialSrc = await iframeEl.getAttribute('src');
    expect(initialSrc).toContain('example.com');

    // 4. Scroll iframe into view — visible in session recording
    await driver.executeScript(
      'arguments[0].scrollIntoView({behavior:"smooth",block:"center"})',
      iframeEl
    );
    await driver.sleep(1000);

    // 5. Switch into the iframe and extract its content
    await driver.switchTo().frame(iframeEl);
    const iframeTitle = await driver.executeScript('return document.title;');
    const bodyText = await driver.findElement(By.tagName('body')).getText();
    await driver.switchTo().defaultContent();

    console.log('example.com iframe title:', iframeTitle);
    console.log('example.com iframe body (first 200 chars):', bodyText.substring(0, 200));

    expect(iframeTitle.length).toBeGreaterThan(0);
    expect(bodyText.length).toBeGreaterThan(0);

    await driver.sleep(1000);
  }, 60000);

  test('iframe src changes reactively when select changes, wikipedia content extracted', async () => {
    await driver.get(IFRAME_URL);

    // Wait for initial load
    const badge = await driver.findElement(By.id('iframe-load-status'));
    await driver.wait(
      async () => (await badge.getText()).toLowerCase().includes('loaded'),
      10000,
      'initial iframe load timed out'
    );

    // 1. Scroll iframe into view before changing src — visible in recording
    const iframeEl = await driver.findElement(By.id('cross-origin-frame'));
    await driver.executeScript(
      'arguments[0].scrollIntoView({behavior:"smooth",block:"center"})',
      iframeEl
    );

    // 2. Change the select to wikipedia — triggers src change and badge reset
    await driver.executeScript(`
      const sel = document.getElementById('iframe-url-select');
      sel.value = 'https://en.wikipedia.org/wiki/Main_Page';
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    `);

    // 3. Wait for wikipedia to load — badge transitions to "loaded"
    // (the loading→loaded transition is too fast to catch via polling)
    await driver.wait(
      async () => (await badge.getText()).toLowerCase().includes('loaded'),
      20000,
      'wikipedia iframe did not finish loading within 20s'
    );

    // 5. Verify iframe src updated to wikipedia
    const updatedSrc = await iframeEl.getAttribute('src');
    expect(updatedSrc).toContain('wikipedia');
    console.log('wikipedia iframe src:', updatedSrc);

    // 6. Switch into the iframe and extract wikipedia content
    await driver.switchTo().frame(iframeEl);
    const wikiTitle = await driver.executeScript('return document.title;');
    const wikiBody = await driver.findElement(By.tagName('body')).getText();
    await driver.switchTo().defaultContent();

    console.log('wikipedia iframe title:', wikiTitle);
    console.log('wikipedia iframe body (first 300 chars):', wikiBody.substring(0, 300));

    expect(wikiTitle.length).toBeGreaterThan(0);
    expect(wikiBody.length).toBeGreaterThan(0);

    await driver.sleep(1000);
  }, 60000);
});
