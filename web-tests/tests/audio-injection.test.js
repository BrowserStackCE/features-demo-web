const { Builder, By, until } = require('selenium-webdriver');
const { Command } = require('selenium-webdriver/lib/command');

const { pageUrl } = require('../helpers/baseUrl');

const AUDIO_PAGE_URL = pageUrl('audio.html');

/**
 * Android mic/camera permission pop-ups require NATIVE_APP context.
 * https://www.browserstack.com/docs/automate/selenium/handle-permission-pop-ups#camera-and-microphone-pop-ups
 */
function ensureAppiumContextCommands(driver) {
  const executor = driver.getExecutor();
  executor.defineCommand('getContexts', 'GET', '/session/:sessionId/contexts');
  executor.defineCommand('switchContext', 'POST', '/session/:sessionId/context');
}

async function switchContext(driver, name) {
  await driver.execute(new Command('switchContext').setParameter('name', name));
}

async function stopInjectedAudio(driver) {
  try {
    await driver.executeScript('browserstack_executor: {"action":"stopAudio"}');
  } catch (err) {
    // The uploaded clip is only a few seconds long and may already have finished.
    if (!String(err && err.message).includes('BROWSERSTACK_INVALID_ACTION_USED')) throw err;
  }
}

async function acceptAndroidPermissionPopups(driver) {
  ensureAppiumContextCommands(driver);

  const contexts = await driver.execute(new Command('getContexts'));
  const webContext =
    (Array.isArray(contexts) &&
      contexts.find((c) => c === 'CHROMIUM' || String(c).startsWith('WEBVIEW'))) ||
    'CHROMIUM';

  await switchContext(driver, 'NATIVE_APP');
  try {
    // Mic flow often shows two Allow dialogs (Chrome + system), matching BrowserStack docs.
    for (let i = 0; i < 2; i++) {
      try {
        const allowBtn = await driver.wait(
          until.elementLocated(
            By.xpath(
              ".//android.widget.Button[" +
                "@text='While using the app' or " +
                "@text='Only this time' or " +
                "@text='Allow' or " +
                "@text='Allow this time' or " +
                "@text='Allow This Time'" +
                "]"
            )
          ),
          5000
        );
        // Prefer lasting grant when multiple options are present
        const whileUsing = await driver.findElements(
          By.xpath(".//android.widget.Button[@text='While using the app']")
        );
        if (whileUsing.length > 0) {
          await whileUsing[0].click();
        } else {
          await allowBtn.click();
        }
        await driver.sleep(500);
      } catch {
        break;
      }
    }
  } catch (err) {
    console.log('No Android permission Allow button found (may already be granted):', err.message);
  } finally {
    await switchContext(driver, webContext);
  }
}

describe('Audio Injection', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder().build();
  }, 180000);

  afterAll(async () => {
    if (driver) await driver.quit();
  }, 30000);

  // Requires enableAudioInjection (set via npm run test:audio).
  // Android mic permission pop-ups are handled via NATIVE_APP context.
  test('Audio injection: transcribe injected mic stream and verify playback TC-audio-injection', async () => {
    await driver.get(AUDIO_PAGE_URL);
    await driver.wait(until.titleContains('Audio'), 15000);

    const heading = await driver.findElement(By.css('h1'));
    expect(await heading.getText()).toBe('Audio Record & Playback');

    const status = await driver.findElement(By.id('audio-status'));
    expect(await status.getText()).toBe('Ready');

    console.log('Using URL for Injection:', process.env.BROWSERSTACK_AUDIO_URL);

    await driver.executeScript(
      `browserstack_executor: {"action":"injectAudio", "arguments": {"audioUrl" : "${process.env.BROWSERSTACK_AUDIO_URL}"}}`
    );

    const transcriptSection = await driver.findElement(By.id('transcript-section'));
    expect(await transcriptSection.isDisplayed()).toBe(true);

    const recordBtn = await driver.findElement(By.id('record-btn'));
    await recordBtn.click();
    await driver.sleep(2000);
    await acceptAndroidPermissionPopups(driver);

    const badge = await driver.findElement(By.id('stt-badge'));
    await driver.wait(until.elementTextIs(badge, 'listening'), 20000);

    await driver.executeScript('browserstack_executor: {"action":"startAudio"}');

    const transcript = await driver.findElement(By.id('transcript-box'));
    await driver.wait(async () => {
      const badgeText = await badge.getText();
      if (badgeText === 'not supported' || badgeText.startsWith('STT error')) {
        throw new Error(`Speech recognition failed: ${badgeText}`);
      }
      const text = (await transcript.getText()).trim();
      return text.length > 0 && text !== 'Transcript will appear here...' && text !== 'Listening...';
    }, 30000, 'Timed out waiting for a speech-to-text transcript');

    console.log('Transcript:', (await transcript.getText()).trim());

    const stopListeningBtn = await driver.findElement(By.id('stop-btn'));
    expect(await stopListeningBtn.isEnabled()).toBe(true);
    await stopListeningBtn.click();
    await driver.wait(until.elementTextIs(badge, 'done'), 10000);
    await stopInjectedAudio(driver);

    const playbackBtn = await driver.findElement(By.id('record-playback-btn'));
    await playbackBtn.click();
    await driver.sleep(2000);
    await acceptAndroidPermissionPopups(driver);

    await driver.wait(
      until.elementTextIs(driver.findElement(By.id('audio-status')), 'Recording...'),
      20000
    );

    await driver.executeScript('browserstack_executor: {"action":"startAudio"}');
    await driver.sleep(2000);

    const stopBtn = await driver.findElement(By.id('stop-btn'));
    expect(await stopBtn.isEnabled()).toBe(true);
    await stopBtn.click();

    await driver.wait(
      until.elementTextIs(driver.findElement(By.id('audio-status')), 'Saved'),
      15000
    );
    expect(await driver.findElement(By.id('audio-status')).getText()).toBe('Saved');

    const playBtn = await driver.findElement(By.id('play-btn'));
    expect(await playBtn.isEnabled()).toBe(true);
    await stopInjectedAudio(driver);
  }, 180000);
});
