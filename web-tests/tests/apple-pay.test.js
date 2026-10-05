const { Builder, By, until } = require('selenium-webdriver');
const { Command } = require('selenium-webdriver/lib/command');

/**
 * Apple Pay button clicks often fail in webview on iOS Safari.
 * BrowserStack recommends switching to NATIVE_APP and clicking by accessibility name:
 * https://www.browserstack.com/docs/automate/selenium/apple-pay
 */
function ensureAppiumContextCommands(driver) {
  driver.getExecutor().defineCommand('switchContext', 'POST', '/session/:sessionId/context');
}

async function switchContext(driver, name) {
  await driver.execute(new Command('switchContext').setParameter('name', name));
}

async function clickApplePayButton(driver) {
  ensureAppiumContextCommands(driver);
  await switchContext(driver, 'NATIVE_APP');

  const applePayBtn = await driver.wait(
    until.elementLocated(By.xpath("//*[@name='Apple Pay']")),
    15000
  );
  await applePayBtn.click();
}

describe('Apple Pay', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder().build();
  }, 180000);

  afterAll(async () => {
    if (driver) await driver.quit();
  }, 30000);

  test('Apple Pay full flow: trigger sheet, fill details, confirm payment', async () => {
    await driver.get('https://applepaydemo.apple.com');
    await driver.wait(until.titleContains('Apple Pay'), 15000);

    // Give the demo page time to render the Apple Pay button
    await driver.sleep(3000);

    // Click via NATIVE_APP — web clicks / coordinate taps often miss the button
    await clickApplePayButton(driver);

    // Wait for the native Apple Pay sheet to appear
    await driver.sleep(5000);

    // Optional shipping/billing/contact details for the sheet
    // await driver.executeScript(
    //   `browserstack_executor: {"action":"applePayDetails","arguments":{"billingDetails":{"firstName":"Some","lastName":"User","state":"CA","city":"San Francisco","street":"1 Infinite Loop","zip":"95014","country":"United States"},"shippingDetails":{"firstName":"Some","lastName":"User","state":"CA","city":"San Francisco","street":"1 Infinite Loop","zip":"95014","country":"United States"},"contact":{"email":"test@example.com","phone":"+14155552671"}}}`
    // );

    await driver.sleep(2000);

    // Confirm the payment using BrowserStack executor
    await driver.executeScript(
      `browserstack_executor: {"action":"applePay", "arguments": {"confirmPayment": "true"}}`
    );

    await driver.sleep(3000);

    // Enter device passcode to complete payment (BrowserStack Apple Pay docs)
    const activeElement = await driver.switchTo().activeElement();
    await activeElement.sendKeys('123456');
  }, 180000);
});
