const IosPage = require('../../pages/ios/ios.page');
const { injectCameraVideo } = require('../../helpers/browserstack');

describe('iOS Video injection', () => {
  const ios = new IosPage();

  it('should record the injected sample-video.mp4 and show the selected video', async () => {
    const noVideo = await ios.recordInjectedVideo();
    await expect(noVideo).toBeDisplayed({
      message: 'The Video injection screen should start with "No video selected"',
    });

    // Uploads web-tests/fixtures/sample-video.mp4 and injects it into the camera feed.
    await injectCameraVideo('sample-video.mp4', 'SampleVideo');
    await ios.openVideoCamera();

    // The shutter button keeps the accessibility id "VideoCapture" while its label flips
    // between "Record Video" and "Stop Recording Video".
    const shutter = await ios.byLabel('VideoCapture');
    await shutter.waitForDisplayed({ timeout: 15000 });
    await shutter.click();
    await driver.waitUntil(async () => (await shutter.getAttribute('label')) === 'Stop Recording Video', {
      timeout: 10000,
      timeoutMsg: 'Expected the shutter label to become "Stop Recording Video" after starting the recording',
    });
    // Let the injected clip record for a moment: the "00:00:00" timer label must disappear.
    const timerAtZero = await ios.byLabel('00:00:00');
    await timerAtZero.waitForExist({
      timeout: 15000,
      reverse: true,
      timeoutMsg: 'Expected the recording timer to advance past 00:00:00',
    });
    await shutter.click();

    // The "Use Video" button has the accessibility id "Done".
    await ios.clickWhenReady(await ios.byLabel('Done'), 20000);

    const clear = await ios.byLabel('Clear selected video');
    await clear.waitForDisplayed({
      timeout: 30000,
      timeoutMsg: 'Expected "Clear selected video" once the recorded video was selected',
    });
    await expect(noVideo).not.toBeDisplayed({
      message: 'After Use Video the "No video selected" placeholder should be gone',
    });
  });
});
