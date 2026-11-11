const DEFAULT_TIMEOUT = 10000;
// Short settle time after each interaction so the next screen has rendered before the next lookup.
const SETTLE_MS = 1500;

class BasePage {
  async byUiSelector(selector) {
    return driver.$(`-android uiautomator:new UiSelector().${selector}`);
  }

  async button(instance) {
    return this.byUiSelector(`className("android.widget.Button").instance(${instance})`);
  }

  // Waits for the UI to go quiet: the page source stops changing for `quietMs`.
  async waitForScreenToSettle(quietMs = SETTLE_MS, timeout = DEFAULT_TIMEOUT) {
    let last = await driver.getPageSource();
    let stableSince = Date.now();
    await driver
      .waitUntil(
        async () => {
          const now = await driver.getPageSource();
          if (now !== last) {
            last = now;
            stableSince = Date.now();
            return false;
          }
          return Date.now() - stableSince >= quietMs;
        },
        { timeout, interval: 500 }
      )
      .catch(() => {
        // Screens with animations never go fully quiet: carry on, the next explicit wait guards the step.
      });
  }

  async clickWhenReady(el, timeout = DEFAULT_TIMEOUT) {
    await el.waitForDisplayed({ timeout });
    await el.waitForEnabled({ timeout });
    await el.click();
    await this.waitForScreenToSettle();
  }

  async typeWhenReady(el, value, timeout = DEFAULT_TIMEOUT) {
    await el.waitForDisplayed({ timeout });
    await el.addValue(value);
    await this.waitForScreenToSettle();
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
    await this.waitForScreenToSettle();
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
