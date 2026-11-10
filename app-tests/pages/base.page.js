const DEFAULT_TIMEOUT = 10000;

class BasePage {
  async byUiSelector(selector) {
    return driver.$(`-android uiautomator:new UiSelector().${selector}`);
  }

  async button(instance) {
    return this.byUiSelector(`className("android.widget.Button").instance(${instance})`);
  }

  async clickWhenReady(el, timeout = DEFAULT_TIMEOUT) {
    await el.waitForDisplayed({ timeout });
    await el.click();
  }

  async typeWhenReady(el, value, timeout = DEFAULT_TIMEOUT) {
    await el.waitForDisplayed({ timeout });
    await el.addValue(value);
  }

  async clickButton(instance, timeout = DEFAULT_TIMEOUT) {
    await this.clickWhenReady(await this.button(instance), timeout);
  }

  // Optional OS dialog: a missing dialog must not fail the test.
  async allowIfPrompted(resourceId, timeout = 5000) {
    const el = await driver.$(`id:${resourceId}`);
    try {
      await el.waitForDisplayed({ timeout });
    } catch (e) {
      return false;
    }
    await el.click();
    return true;
  }

  async allowForegroundPermission() {
    return this.allowIfPrompted(
      'com.android.permissioncontroller:id/permission_allow_foreground_only_button'
    );
  }

  async allowPermission() {
    return this.allowIfPrompted('com.android.permissioncontroller:id/permission_allow_button');
  }
}

module.exports = BasePage;
