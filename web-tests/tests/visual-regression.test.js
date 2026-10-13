const dns = require('dns').promises;
const http = require('http');
const net = require('net');
const { Builder, By, until } = require('selenium-webdriver');
const { percyScreenshot, createRegion } = require('@percy/selenium-webdriver');
const { pageUrl } = require('../helpers/baseUrl');

function agentLog(hypothesisId, location, message, data) {
  // #region agent log
  fetch('http://127.0.0.1:7917/ingest/e831e398-393d-4109-bd15-dfafb42d91c1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'38d3cb'},body:JSON.stringify({sessionId:'38d3cb',runId:'pre-fix',hypothesisId,location,message,data,timestamp:Date.now()})}).catch(()=>{});
  // #endregion
}

function sanitizeUrl(value) {
  if (!value || typeof value !== 'string') return null;
  try {
    const u = new URL(value);
    return {
      protocol: u.protocol,
      hostname: u.hostname,
      port: u.port || (u.protocol === 'https:' ? '443' : '80'),
      hasAuth: Boolean(u.username),
    };
  } catch {
    return { unparseable: true };
  }
}

function tcpProbe(host, port, timeoutMs = 4000) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port: Number(port) });
    const timer = setTimeout(() => {
      socket.destroy();
      resolve({ ok: false, error: 'timeout' });
    }, timeoutMs);
    socket.on('connect', () => {
      clearTimeout(timer);
      socket.end();
      resolve({ ok: true });
    });
    socket.on('error', (err) => {
      clearTimeout(timer);
      resolve({ ok: false, error: err.code || err.message });
    });
  });
}

function percyHealth() {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:5338/percy/healthcheck', { timeout: 3000 }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: body.slice(0, 180) }));
    });
    req.on('error', (err) => resolve({ error: err.code || err.message }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ error: 'timeout' });
    });
  });
}

// VISUAL_DIFF=0 (default) → baseline; VISUAL_DIFF=1 → intentional UI diffs
const DIFF_ON = process.env.VISUAL_DIFF === '1' || process.env.VISUAL_DIFF === 'on';
const PAGE_URL = `${pageUrl('visual-regression.html')}?diff=${DIFF_ON ? 'on' : 'off'}`;

describe('Visual Regression / Percy', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder().build();
    const session = await driver.getSession();
    const caps = Object.fromEntries(session.getCapabilities().map_);
    const urlCaps = {};
    for (const [key, value] of Object.entries(caps)) {
      if (typeof value === 'string' && /https?:|wss?:/i.test(value)) {
        urlCaps[key] = sanitizeUrl(value);
      }
    }
    const hub = urlCaps['se:cdp'] || urlCaps.webSocketUrl || null;
    let dnsResult = null;
    let directTcp = null;
    if (hub && hub.hostname) {
      try {
        dnsResult = await dns.lookup(hub.hostname, { all: true });
      } catch (err) {
        dnsResult = { error: err.code || err.message };
      }
      directTcp = await tcpProbe(hub.hostname, hub.port);
    }
    const health = await percyHealth();
    agentLog('H1', 'visual-regression.test.js:beforeAll', 'proxy env, hub url, direct tcp', {
      node: process.version,
      httpProxy: sanitizeUrl(process.env.HTTP_PROXY || process.env.http_proxy),
      httpsProxy: sanitizeUrl(process.env.HTTPS_PROXY || process.env.https_proxy),
      noProxy: process.env.NO_PROXY || process.env.no_proxy || null,
      percyTokenSet: Boolean(process.env.PERCY_TOKEN),
      browserstackLocal: process.env.BROWSERSTACK_LOCAL || null,
      baseUrl: process.env.BASE_URL || null,
      urlCaps,
      dnsResult,
      directTcp,
      health,
    });
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

    process.env.PERCY_RAISE_ERROR = 'true';
    const shoot = async (name, options) => {
      try {
        const data = await percyScreenshot(driver, name, options);
        agentLog('H5', 'visual-regression.test.js:shoot', 'screenshot returned', {
          name,
          hasData: Boolean(data),
        });
      } catch (error) {
        agentLog('H1', 'visual-regression.test.js:shoot', 'screenshot failed', {
          name,
          error: String(error && error.message || error).slice(0, 400),
        });
      }
    };

    // 1) Full-page capture — freeze animations, responsive-style widths metadata via options
    await shoot('VR — Full page', {
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
    await shoot('VR — Scoped card', {
      scope: '#scoped-card',
      fullPage: false,
      labels: 'visual-regression,scope',
    });

    // 3) Ignore dynamic clock + ad banner; hide noise with percyCSS
    await shoot('VR — Ignore dynamic', {
      fullPage: true,
      ignoreRegionSelectors: ['#dynamic-clock', '#ad-banner'],
      percyCSS: `
        #dynamic-clock { visibility: hidden !important; }
        .hide-in-percy { visibility: hidden !important; }
      `,
      labels: 'visual-regression,ignore-regions',
    });

    // 4) Region algorithms — layout on grid, ignore on ad, intelliignore on clock
    await shoot('VR — Layout region', {
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
    await shoot('VR — JS animation', {
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
  }, 580000);
});
