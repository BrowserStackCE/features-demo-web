const IosPage = require('../../pages/ios/ios.page');

describe('iOS Biometric', () => {
  const ios = new IosPage();

  it('should pass the biometric prompt and show the success result', async () => {
    await ios.openBiometric();

    const runButton = await ios.byLabel('Run biometric authentication test');
    await expect(runButton).toBeDisplayed({
      message: 'The "Run biometric authentication test" button should be displayed',
    });

    await ios.runBiometricPass();

    const success = await ios.byLabel('Authentication succeeded.');
    await success.waitForDisplayed({
      timeout: 15000,
      timeoutMsg: 'Expected "Authentication succeeded." after choosing Pass in the biometric dialog',
    });
    await expect(success).toHaveText('Authentication succeeded.', {
      message: 'The biometric result should read "Authentication succeeded."',
    });
  });
});
