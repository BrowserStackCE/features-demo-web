const StandalonePage = require('../pages/standalone.page');

describe('Video injection', () => {
  const standalone = new StandalonePage();

  it('should record the injected sample-video.mp4 and show the saved video', async () => {
    // Uploads web-tests/fixtures/sample-video.mp4, injects it, then opens the app's video camera.
    await standalone.openVideoCamera();
    await standalone.recordInjectedVideo();

    // The app finalises the file after "Stop & Save", then returns to the Video injection screen.
    const intro = await standalone.textView('Video injection');
    await intro.waitForDisplayed({
      timeout: 30000,
      timeoutMsg: 'Expected the Video injection screen to be shown again after Stop & Save',
    });

    const failed = await standalone.textView('Video capture failed');
    await expect(failed).not.toBeDisplayed({
      message: 'The app should not report "Video capture failed" after recording the injected video',
    });
    const noFile = await standalone.textView('No file selected');
    await expect(noFile).not.toBeDisplayed({
      message: 'The app should show the recorded video instead of "No file selected" after Stop & Save',
    });
  });
});
