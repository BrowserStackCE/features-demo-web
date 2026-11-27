const IosPage = require('../../pages/ios/ios.page');

// The app runs without Twilio ("enter any 6 digits to demo"), so any 6 digits verify.
const OTP_CODE = '123456';

function randomTenDigitNumber() {
  return '9' + String(Math.floor(Math.random() * 1e9)).padStart(9, '0');
}

describe('iOS OTP', () => {
  const ios = new IosPage();

  it('should send an OTP to a random 10-digit number and verify any 6 digits', async () => {
    const phoneNumber = randomTenDigitNumber();

    await ios.openOtp();

    const phone = await ios.byLabel('Phone number');
    await phone.waitForDisplayed({ timeout: 15000 });
    await phone.setValue(phoneNumber);
    await ios.clickWhenReady(await ios.byLabel('Send OTP'));

    const digit1 = await ios.byLabel('Digit 1 of 6');
    await digit1.waitForDisplayed({
      timeout: 15000,
      timeoutMsg: 'Expected the 6 OTP digit fields after tapping Send OTP',
    });

    await ios.enterOtpDigits(OTP_CODE);

    const verified = await ios.byLabel('Verified successfully');
    await verified.waitForExist({
      timeout: 15000,
      timeoutMsg: 'Expected "Verified successfully" after entering the 6-digit code',
    });
    await expect(verified).toHaveText('Verified successfully', {
      message: 'The OTP screen should confirm "Verified successfully"',
    });
  });
});
