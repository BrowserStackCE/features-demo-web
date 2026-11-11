const StandalonePage = require('../pages/standalone.page');

// Any 10-digit mobile number works; the app always accepts the fixed OTP 1234.
const OTP_CODE = '1234';

function randomTenDigitNumber() {
  return '9' + String(Math.floor(Math.random() * 1e9)).padStart(9, '0');
}

describe('OTP', () => {
  const standalone = new StandalonePage();

  it('should send an OTP to a random 10-digit number and verify it with 1234', async () => {
    const phoneNumber = randomTenDigitNumber();

    await standalone.openOtp();
    await standalone.sendOtp(phoneNumber);

    const sentTo = await standalone.byUiSelector('textContains("OTP sent via SMS")');
    await sentTo.waitForDisplayed({
      timeout: 15000,
      timeoutMsg: 'Expected the "OTP sent via SMS to +91..." confirmation after tapping Send OTP',
    });
    await expect(sentTo).toHaveText(expect.stringContaining(phoneNumber), {
      message: 'The OTP confirmation should mention the phone number that was entered',
    });

    await standalone.verifyOtp(OTP_CODE);

    const verified = await standalone.byUiSelector('textContains("OTP verified")');
    await verified.waitForDisplayed({
      timeout: 15000,
      timeoutMsg: 'Expected an "OTP verified" message after entering the OTP 1234',
    });
    await expect(verified).toBeDisplayed({
      message: 'The app should confirm the OTP was verified',
    });
  });
});
