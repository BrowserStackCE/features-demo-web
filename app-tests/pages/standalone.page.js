const BasePage = require('./base.page');
const {
  injectCameraImage,
  injectCameraVideo,
  injectAudio,
  pushFileToDevice,
} = require('../helpers/browserstack');

// "Standalone demo" lets each feature run without the BFSI onboarding.
// All resource-ids below were read from the live app (com.demobank.app).
class StandalonePage extends BasePage {
  async byId(id) {
    return this.byUiSelector(`resourceId("${id}")`);
  }

  async textView(text) {
    return this.byUiSelector(`text("${text}")`);
  }

  async openStandalone() {
    await this.clickWhenReady(await this.byId('domain_card_standalone'), 20000);
  }

  async openFeature(itemId) {
    await this.openStandalone();
    await this.clickWhenReady(await this.byId(itemId));
  }

  // --- Image injection ---------------------------------------------------
  async captureInjectedImage() {
    await this.openFeature('standalone_item_image');
    await injectCameraImage('dropbox-1-logo-png-transparent.png', 'SampleMedia');
    await this.clickWhenReady(await this.textView('Open camera'));
    await this.allowForegroundPermission();
    await this.allowPermission();
    await this.clickWhenReady(await this.byId('hook_camera_capture'), 15000);
  }

  // --- Video injection ---------------------------------------------------
  async openVideoCamera() {
    await this.openFeature('standalone_item_video');
    await injectCameraVideo('sample-video.mp4', 'SampleVideo');
    await this.clickWhenReady(await this.textView('Open video camera'));
    await this.allowForegroundPermission();
    await this.allowPermission();
  }

  // The video camera screen shows "Start Recording"; while recording it shows "\u25cf REC" and "Stop & Save".
  async recordInjectedVideo(recordMs = 5000) {
    await this.clickWhenReady(await this.textView('Start Recording'), 15000);
    const recIndicator = await this.textView('\u25cf REC');
    await recIndicator.waitForDisplayed({
      timeout: 10000,
      timeoutMsg: 'Expected the recording indicator after tapping Start Recording',
    });
    // Let the injected video play into the recording for a few seconds.
    await driver.pause(recordMs);
    await this.clickWhenReady(await this.textView('Stop & Save'), 10000);
  }

  // --- Audio injection ---------------------------------------------------
  async openAudio() {
    await this.openFeature('standalone_item_audio');
  }

  async recordInjectedAudio() {
    await injectAudio('audio_sample.mp3', 'SampleAudio');
    await this.clickWhenReady(await this.textView('Record'));
    await this.allowForegroundPermission();
    await this.allowPermission();
  }

  // --- File upload & download -------------------------------------------
  async openFiles() {
    await this.openFeature('standalone_item_files');
  }

  // Pushes sample.pdf to the device, opens the app's file picker and selects it.
  async uploadSamplePdf() {
    const devicePath = '/sdcard/Download/sample.pdf';
    await this.pushSamplePdf(devicePath);
    await this.clickWhenReady(await this.byId('hook_file_upload'));
    const file = await this.byUiSelector('text("sample.pdf")');
    await this.clickWhenReady(file, 15000);
  }

  async downloadSamplePdf() {
    await this.clickWhenReady(await this.byId('hook_file_download'));
  }

  async pushSamplePdf(devicePath) {
    await pushFileToDevice('sample.pdf', devicePath);
  }

  // --- Biometric -----------------------------------------------------------
  async openBiometric() {
    await this.openFeature('standalone_item_biometric');
  }

  async runBiometricPrompt() {
    await this.clickWhenReady(await this.byId('hook_biometric_authorize'));
  }

  // BrowserStack shows a "Do you want it to pass or fail?" dialog for the biometric prompt.
  async choosePassOnBiometricDialog() {
    await this.clickWhenReady(await driver.$('id:android:id/button1'), 15000);
  }

  // --- OTP -----------------------------------------------------------------
  // The OTP test is below the fold of the Standalone list, so scroll before tapping it.
  async openOtp() {
    await this.openStandalone();
    await driver.execute('mobile: scrollGesture', {
      left: 200,
      top: 800,
      width: 600,
      height: 1200,
      direction: 'down',
      percent: 1.0,
    });
    await this.clickWhenReady(await this.byId('standalone_item_otp'));
  }

  async sendOtp(phoneNumber) {
    const phone = await driver.$('class name:android.widget.EditText');
    await phone.waitForDisplayed({ timeout: 15000 });
    await phone.addValue(phoneNumber);
    await this.clickWhenReady(await this.textView('Send OTP'));
  }

  async verifyOtp(code) {
    const otpField = await driver.$('class name:android.widget.EditText');
    await otpField.waitForDisplayed({ timeout: 15000 });
    await otpField.addValue(code);
    await this.clickWhenReady(await this.textView('Verify OTP'));
  }

  // --- IP geolocation / GPS ---------------------------------------------
  async openIpGeo() {
    await this.openFeature('standalone_item_geo');
    await this.allowForegroundPermission();
  }

  async refreshLocation() {
    await this.clickWhenReady(await this.byId('hook_location_fetch'));
  }
}

module.exports = StandalonePage;
