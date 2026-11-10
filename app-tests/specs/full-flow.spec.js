const OnboardingPage = require('../pages/onboarding.page');
const { setNetworkProfile } = require('../helpers/browserstack');

// Runs when no feature is selected: the complete BFSI onboarding flow.
describe('NexusDemo BFSI full flow', () => {
  const onboarding = new OnboardingPage();

  it('should complete the full BFSI onboarding flow', async () => {
    await onboarding.selectBfsiDomain();
    await onboarding.register();
    await onboarding.captureProfilePhoto();
    await onboarding.uploadKycDocument();
    await onboarding.enterPhoneNumber();
    await onboarding.verifyOtp();
    await onboarding.completeBfsiJourney();

    await driver.setGeoLocation({ latitude: 12.9716, longitude: 77.5946, altitude: 0 });
    await onboarding.clickButton(0);

    await setNetworkProfile('no-network');

    const loginButton = await onboarding.button(0);
    await expect(loginButton).toBeDisplayed({
      message: 'App should still be responsive and showing a primary button after switching to no-network',
    });
  });
});
