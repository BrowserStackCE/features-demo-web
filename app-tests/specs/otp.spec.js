const OnboardingPage = require('../pages/onboarding.page');

describe('OTP', () => {
  const onboarding = new OnboardingPage();

  it('should enter the phone number and verify the OTP', async () => {
    await onboarding.selectBfsiDomain();
    await onboarding.register();
    await onboarding.captureProfilePhoto();
    await onboarding.uploadKycDocument();
    await onboarding.enterPhoneNumber();
    await onboarding.verifyOtp();

    const next = await onboarding.button(4);
    await expect(next).toBeDisplayed({
      message: 'After a successful OTP verification, the next BFSI screen should be displayed',
    });
  });
});
