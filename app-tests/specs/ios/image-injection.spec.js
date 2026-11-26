const IosPage = require('../../pages/ios/ios.page');
const { injectCameraImage } = require('../../helpers/browserstack');

describe('iOS Image injection', () => {
  const ios = new IosPage();

  it('should capture the injected logo through the camera and return to the Image Injection screen', async () => {
    const noImage = await ios.openImageInjection();
    await expect(noImage).toBeDisplayed({
      message: 'The Image injection screen should start with "No image selected"',
    });

    // Uploads docs/assets/dropbox-1-logo-png-transparent.png and injects it into the camera feed.
    await injectCameraImage('dropbox-1-logo-png-transparent.png', 'SampleMedia');
    await ios.openImageCamera();

    // The camera must be open with its shutter before capturing.
    const shutter = await ios.byLabel('PhotoCapture');
    await shutter.waitForDisplayed({
      timeout: 20000,
      timeoutMsg: 'Expected the camera shutter (PhotoCapture) after opening the camera',
    });
    await expect(shutter).toBeDisplayed({
      message: 'The camera shutter should be shown once the camera opens',
    });

    await ios.captureAndUsePhoto();

    // After "Use Photo" the camera closes and the Image Injection screen is back.
    const captureButton = await ios.byLabel('Capture image with camera');
    await captureButton.waitForDisplayed({
      timeout: 20000,
      timeoutMsg: 'Expected the Image Injection screen after confirming the captured photo',
    });
    await expect(captureButton).toBeDisplayed({
      message: 'The Image Injection screen should be shown again after using the captured photo',
    });
    await expect(shutter).not.toBeDisplayed({
      message: 'The camera should be closed after using the captured photo',
    });
  });
});
