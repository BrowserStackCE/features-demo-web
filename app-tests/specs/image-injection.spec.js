const StandalonePage = require('../pages/standalone.page');

describe('Image injection', () => {
  const standalone = new StandalonePage();

  it('should inject an image into the camera and capture it', async () => {
    await standalone.captureInjectedImage();

    const captured = await standalone.textView('Captured photo');
    await captured.waitForDisplayed({
      timeout: 15000,
      timeoutMsg: 'Expected the "Captured photo" label to appear after capturing the injected image',
    });
    await expect(captured).toBeDisplayed({
      message: 'The "Captured photo" label should be shown after capturing the injected image',
    });
  });
});
