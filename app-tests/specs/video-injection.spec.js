const StandalonePage = require('../pages/standalone.page');

describe('Video injection', () => {
  const standalone = new StandalonePage();

  it('should inject sample-video.mp4 into the camera and open the video camera', async () => {
    // Uploads web-tests/fixtures/sample-video.mp4, injects it, then opens the app's video camera.
    await standalone.openVideoCamera();

    // The camera screen replaces the "Video injection" intro screen.
    const intro = await standalone.textView('No file selected');
    await expect(intro).not.toBeDisplayed({
      message: 'After opening the video camera the "No file selected" intro screen should no longer be shown',
    });
  });
});
