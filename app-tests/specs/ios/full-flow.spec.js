const IosPage = require('../../pages/ios/ios.page');

function randomTenDigitNumber() {
  return '9' + String(Math.floor(Math.random() * 1e9)).padStart(9, '0');
}

// Happy-path BFSI journey: biometric sign-in -> OTP -> dashboard -> GPS-driven ATM search.
describe('iOS NexusDemo BFSI full flow', () => {
  const ios = new IosPage();

  it('should sign in with Face ID, verify the OTP and find ATMs near the mocked location', async () => {
    await ios.clickWhenReady(await ios.byLabel('BFSI, Banking & transfers'), 30000);

    // Biometric step: sign in with Face ID and pass the biometric prompt.
    await ios.clickWhenReady(await ios.byLabel('Sign in with Face ID'));
    await ios.clickWhenReady(await ios.byLabel('Pass'), 15000);

    // OTP step.
    const phone = await ios.byLabel('Phone number');
    await phone.waitForDisplayed({ timeout: 15000 });
    await phone.setValue(randomTenDigitNumber());
    await ios.clickWhenReady(await ios.byLabel('Send OTP'));
    const digit1 = await ios.byLabel('Digit 1 of 6');
    await digit1.waitForDisplayed({ timeout: 15000 });
    await ios.enterOtpDigits('123456');

    const verified = await ios.byLabel('Verified successfully');
    await verified.waitForDisplayed({
      timeout: 15000,
      timeoutMsg: 'Expected "Verified successfully" after the OTP digits were entered',
    });
    await expect(verified).toHaveText('Verified successfully', {
      message: 'The OTP step should confirm "Verified successfully"',
    });

    await ios.clickWhenReady(await ios.byLabel('Continue to app'));

    // Dashboard.
    // The account rows embed a changing balance, so anchor on the stable section header.
    const accounts = await ios.byLabel('ACCOUNTS');
    await accounts.waitForDisplayed({
      timeout: 20000,
      timeoutMsg: 'Expected the accounts dashboard after continuing into the app',
    });

    // GPS step: mock Bengaluru, then the ATM search must be centred on it.
    await driver.setGeoLocation({ latitude: 12.9716, longitude: 77.5946, altitude: 0 });
    await ios.clickWhenReady(await ios.byLabel('Find ATMs near me'));
    await ios.acceptAlertIfPresent('Allow While Using App');

    const nearBengaluru = await ios.byLabel('Showing ATMs near Bengaluru');
    await nearBengaluru.waitForDisplayed({
      timeout: 30000,
      timeoutMsg: 'Expected "Showing ATMs near Bengaluru" after mocking the Bengaluru location',
    });
    await expect(nearBengaluru).toHaveText('Showing ATMs near Bengaluru', {
      message: 'The ATM list should be centred on the mocked Bengaluru location',
    });
  });
});
