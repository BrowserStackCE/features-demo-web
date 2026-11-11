const BasePage = require('./base.page');
const env = require('../helpers/env');
const { injectCameraImage, pushFileToDevice } = require('../helpers/browserstack');

const KYC_DEVICE_PATH = '/sdcard/Download/sample.pdf';

// BFSI onboarding flow of the NexusDemo app. Locators are taken from the recorded flow.
class OnboardingPage extends BasePage {
  async selectBfsiDomain() {
    await this.clickWhenReady(
      await this.byUiSelector('resourceId("domain_card_bfsi")'),
      15000
    );
  }

  async register() {
    await this.typeWhenReady(
      await this.byUiSelector('resourceId("register_input_name")'),
      env.registerName()
    );
    await this.typeWhenReady(
      await this.byUiSelector('resourceId("register_input_email")'),
      env.registerEmail()
    );
    await this.typeWhenReady(
      await this.byUiSelector('resourceId("register_input_password")'),
      env.registerPassword()
    );
    await this.clickButton(0);
  }

  // Image injection: inject the image into the camera feed, then capture it.
  async captureProfilePhoto() {
    await injectCameraImage('dropbox-1-logo-png-transparent.png', 'SampleMedia');
    await this.clickButton(0, 15000);
    await this.allowForegroundPermission();
    await this.allowPermission();
    await this.clickButton(0, 15000);
  }

  // File upload: push the PDF to the device and pick it in the system document picker.
  async uploadKycDocument() {
    await pushFileToDevice('sample.pdf', KYC_DEVICE_PATH);
    await this.clickButton(2);
    await this.clickButton(0);
    await this.clickWhenReady(await driver.$('accessibility id:Show roots'));
    await this.clickWhenReady(
      await this.byUiSelector('className("android.widget.LinearLayout").instance(17)')
    );

    const thumb = await driver.$('id:com.google.android.documentsui:id/icon_thumb');
    let picked = false;
    try {
      await thumb.waitForDisplayed({ timeout: 10000 });
      await thumb.click();
      picked = true;
    } catch (e) {
      // Fall back to the first row below.
    }
    if (!picked) {
      await this.clickWhenReady(
        await this.byUiSelector('className("android.widget.RelativeLayout").instance(0)')
      );
    }

    await this.clickWhenReady(
      await driver.$('id:com.google.android.documentsui:id/action_menu_select')
    );
    await this.clickButton(1);
  }

  async enterPhoneNumber() {
    await this.typeWhenReady(
      await driver.$('class name:android.widget.EditText'),
      env.phoneNumber(),
      15000
    );
    await this.clickButton(0);
    await this.allowPermission();
  }

  async verifyOtp() {
    await this.typeWhenReady(
      await driver.$('class name:android.widget.EditText'),
      env.otp(),
      15000
    );
    await this.clickButton(0);
    await this.allowForegroundPermission();
  }

  // Remaining BFSI steps of the recorded flow, up to the GPS screen.
  async completeBfsiJourney() {
    await this.clickButton(4);
    await this.clickButton(0);
    await this.clickWhenReady(await driver.$('id:android:id/button1'));
    await this.clickButton(1);
    await this.clickButton(1);
    await this.typeWhenReady(await driver.$('class name:android.widget.EditText'), '10');
    await this.clickButton(0);
    await this.clickButton(1);
    await this.pressBackAndWaitForChange();
    await this.pressBackAndWaitForChange();
    await this.clickButton(3);
  }

  // Android BACK that only returns once the screen has actually changed, so the next
  // press is not swallowed by the previous transition (e.g. the share-receipt sheet).
  async pressBackAndWaitForChange(timeout = 10000) {
    const before = await driver.getPageSource();
    try {
      await driver.execute("mobile: pressKey", { keycode: 4 });
    } catch (e) {
      await driver.back();
    }
    await driver.waitUntil(async () => (await driver.getPageSource()) !== before, {
      timeout,
      timeoutMsg: "Screen did not change after pressing Android BACK",
    });
    await this.waitForScreenToSettle();
  }
}

module.exports = OnboardingPage;
