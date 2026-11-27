// iOS NexusDemo page object. Every locator below was verified on a live iPhone session
// (accessibility ids / labels read from the XCUITest page source).
const DEFAULT_TIMEOUT = 15000;

class IosPage {
  // --- generic helpers -----------------------------------------------------
  async byLabel(label) {
    return driver.$(`~${label}`);
  }

  async clickWhenReady(el, timeout = DEFAULT_TIMEOUT) {
    await el.waitForDisplayed({ timeout });
    await el.waitForEnabled({ timeout });
    await el.click();
  }

  // System alert (permission dialogs). A missing alert must not fail the test.
  async acceptAlertIfPresent(button, timeout = 5000) {
    try {
      await driver.waitUntil(
        async () => {
          try {
            await driver.getAlertText();
            return true;
          } catch (e) {
            return false;
          }
        },
        { timeout, interval: 500 }
      );
    } catch (e) {
      return false;
    }
    await driver.execute('mobile: alert', { action: 'accept', buttonLabel: button });
    return true;
  }

  async setBiometric(result) {
    await driver.execute(
      `browserstack_executor: ${JSON.stringify({
        action: 'biometric',
        arguments: { biometricMatch: result },
      })}`
    );
  }

  // --- navigation ----------------------------------------------------------
  async openStandalone() {
    await this.clickWhenReady(await this.byLabel('Standalone demo, Test features without the full flow'), 30000);
  }

  async openFeature(listLabel) {
    await this.openStandalone();
    const item = await this.byLabel(listLabel);
    if (!(await item.isDisplayed())) {
      await driver.execute('mobile: scroll', { direction: 'down', name: listLabel });
    }
    await this.clickWhenReady(item);
  }

  // --- image injection -----------------------------------------------------
  async openImageInjection() {
    await this.openFeature('1, Image injection, Camera still capture');
    const noImage = await this.byLabel('No image selected');
    await noImage.waitForDisplayed({ timeout: DEFAULT_TIMEOUT });
    return noImage;
  }

  async openImageCamera() {
    await this.clickWhenReady(await this.byLabel('Capture image with camera'));
    // Camera permission prompt, shown only on the first launch of the camera.
    await this.acceptAlertIfPresent('Allow');
  }

  // "PhotoCapture" is the shutter, "Done" is the "Use Photo" button of the capture preview.
  async captureAndUsePhoto() {
    const shutter = await this.byLabel('PhotoCapture');
    await this.clickWhenReady(shutter, 20000);
    await this.clickWhenReady(await this.byLabel('Done'), 20000);
  }

  // --- video injection -----------------------------------------------------
  async recordInjectedVideo() {
    await this.openFeature('3, Video injection, Record + play video');
    const noVideo = await this.byLabel('No video selected');
    await noVideo.waitForDisplayed({ timeout: DEFAULT_TIMEOUT });
    return noVideo;
  }

  async openVideoCamera() {
    await this.clickWhenReady(await this.byLabel('Record video with camera'));
    // Two consecutive permission prompts: Camera, then Microphone.
    await this.acceptAlertIfPresent('Allow');
    await this.acceptAlertIfPresent('Allow');
  }

  // --- biometric -----------------------------------------------------------
  async openBiometric() {
    await this.openFeature('2, Biometric test, Fingerprint / face prompt');
  }

  async runBiometricPass() {
    await this.clickWhenReady(await this.byLabel('Run biometric authentication test'));
    await this.clickWhenReady(await this.byLabel('Pass'), 15000);
  }

  // --- file download -------------------------------------------------------
  async openFiles() {
    await this.openFeature('4, File upload & download, Document pick + share');
  }

  // --- network -------------------------------------------------------------
  async openNetwork() {
    await this.openFeature('7, Network test, Connection status');
  }

  // --- GPS -----------------------------------------------------------------
  async openGps() {
    await this.openFeature('8, GPS test, Device GPS + reverse geocode');
  }

  async fetchGpsLocation() {
    await this.clickWhenReady(await this.byLabel('Get GPS location'));
    await this.acceptAlertIfPresent('Allow While Using App');
  }

  // --- OTP (standalone screen) --------------------------------------------
  async openOtp() {
    await this.openFeature('9, OTP test, Send + verify code');
  }

  async enterOtpDigits(digits) {
    for (let i = 1; i <= digits.length; i += 1) {
      const field = await this.byLabel(`Digit ${i} of 6`);
      await field.waitForDisplayed({ timeout: DEFAULT_TIMEOUT });
      await field.setValue(digits[i - 1]);
    }
  }
}

module.exports = IosPage;
