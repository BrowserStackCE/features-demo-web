const { Builder, By, until } = require('selenium-webdriver');
const { percyScreenshot, createRegion } = require('@percy/selenium-webdriver');

const BASE_URL = 'https://browserstackce.github.io/features-demo-web/visual-regression.html';

// VISUAL_DIFF=0 (default) → baseline; VISUAL_DIFF=1 → intentional UI diffs
const DIFF_ON = process.env.VISUAL_DIFF === '1' || process.env.VISUAL_DIFF === 'on';
const PAGE_URL = `${BASE_URL}?diff=${DIFF_ON ? 'on' : 'off'}`;

describe('Visual Regression / Percy', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder().build();
  }, 180000);

  afterAll(async () => {
    if (driver) await driver.quit();
  }, 30000);

  test('Percy feature showcase — full page, scope, ignore, regions, JS/percyCSS', async () => {
    await driver.get(PAGE_URL);
    await driver.wait(until.elementLocated(By.id('hero-panel')), 15000);
    await driver.sleep(1500);

    // Confirm toggle state matches env (URL-driven; no click needed)
    const diffState = await driver.executeScript('return document.body.dataset.diff');
    expect(diffState).toBe(DIFF_ON ? 'on' : 'off');

    // 1) Full-page capture — freeze animations, responsive-style widths metadata via options
    await percyScreenshot(driver, 'VR — Full page', {
      fullPage: true,
      freezeAnimatedImage: true,
      percyCSS: '.hide-in-percy { visibility: hidden !important; }',
      widths: [375, 768, 1280],
      minHeight: 1024,
      responsiveSnapshotCapture: true,
      labels: 'visual-regression,full-page',
      testCase: 'percy-feature-showcase',
    });

    // 2) Scoped element — product card only
    await driver.findElement(By.id('scoped-card')).then((el) =>
      driver.executeScript('arguments[0].scrollIntoView({block:"center"})', el)
    );
    await percyScreenshot(driver, 'VR — Scoped card', {
      scope: '#scoped-card',
      fullPage: false,
      labels: 'visual-regression,scope',
    });

    // 3) Ignore dynamic clock + ad banner; hide noise with percyCSS
    await percyScreenshot(driver, 'VR — Ignore dynamic', {
      fullPage: true,
      ignoreRegionSelectors: ['#dynamic-clock', '#ad-banner'],
      percyCSS: `
        #dynamic-clock { visibility: hidden !important; }
        .hide-in-percy { visibility: hidden !important; }
      `,
      labels: 'visual-regression,ignore-regions',
    });

    // 4) Region algorithms — layout on grid, ignore on ad, intelliignore on clock
    await percyScreenshot(driver, 'VR — Layout region', {
      fullPage: true,
      regions: [
        createRegion({
          elementCSS: '#layout-grid',
          algorithm: 'layout',
        }),
        createRegion({
          elementCSS: '#ad-banner',
          algorithm: 'ignore',
        }),
        createRegion({
          elementCSS: '#dynamic-clock',
          algorithm: 'intelliignore',
          diffSensitivity: 2,
          imageIgnoreThreshold: 0.2,
          adsEnabled: true,
          bannersEnabled: true,
          diffIgnoreThreshold: 0.4,
        }),
      ],
      labels: 'visual-regression,regions',
    });

    // 5) Animated banner — enable JS in Percy renderer + settle with percyCSS
    await driver.findElement(By.id('animated-banner')).then((el) =>
      driver.executeScript('arguments[0].scrollIntoView({block:"center"})', el)
    );
    await percyScreenshot(driver, 'VR — JS animation', {
      scope: '#animated-banner',
      enableJavaScript: true,
      freezeAnimatedImage: true,
      percyCSS: `
        #animated-banner .pulse-bar {
          animation: none !important;
          transform: none !important;
          opacity: 1 !important;
        }
      `,
      labels: 'visual-regression,enable-javascript',
    });
  }, 180000);
});
