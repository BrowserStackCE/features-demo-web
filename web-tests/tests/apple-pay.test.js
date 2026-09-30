const { Builder, By, until } = require('selenium-webdriver');

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

    const applePayBtn = await driver.findElement(
      By.css('apple-pay-button, [type="apple-pay-button"], button.apple-pay-button, [data-testid="apple-pay-button"]')
    );

    // 1. Calculate viewport-relative center coordinates
    const coords = await driver.executeScript(`
      const rect = arguments[0].getBoundingClientRect();
      return {
        x: Math.round(rect.left + rect.width / 2),
        y: Math.round(rect.top + rect.height / 2)
      };
    `, applePayBtn);

    // 2. Add iOS Status Bar / Browser Chrome offset
    // iPhone 15 status bar is typically ~47px. Adjust this value depending on 
    // whether Safari's address bar is expanded or collapsed.
    const STATUS_BAR_OFFSET = 47; 
    
    const finalX = coords.x;
    const finalY = coords.y + STATUS_BAR_OFFSET;

    console.log(`Adjusted Screen Coordinates -> X: ${finalX}, Y: ${finalY}`);

    // 3. Execute 'mobile: tap' with absolute screen coordinates
    await driver.executeScript('mobile: tap', { x: finalX, y: finalY });

    // Wait for the native Apple Pay sheet to appear
    await driver.sleep(3000);

    // Confirm the payment using BrowserStack executor
    await driver.executeScript(
      `browserstack_executor: {"action":"applePay", "arguments": {"confirmPayment": "true"}}`
    );

    await driver.sleep(10000);

    await driver.actions().sendKeys('123456').perform();
  }, 120000);
});