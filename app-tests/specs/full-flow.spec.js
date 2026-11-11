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

    // The flow ends by switching the session to no-network. The app has no stable UI to assert
    // while offline, so the step passes when BrowserStack accepts the profile change
    // (setNetworkProfile throws on any non-2xx response), then the session ends.
    await expect(setNetworkProfile('no-network')).resolves.toBeUndefined();
  });
});
