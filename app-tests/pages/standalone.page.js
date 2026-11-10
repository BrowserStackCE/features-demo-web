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
