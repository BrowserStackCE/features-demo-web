const StandalonePage = require('../pages/standalone.page');

describe('Biometric', () => {
  const standalone = new StandalonePage();

  it('should show the biometric test screen with its run button', async () => {
    await standalone.openBiometric();

    const status = await standalone.byId('hook_biometric_prompt');
    await status.waitForDisplayed({
      timeout: 10000,
      timeoutMsg: 'Expected the biometric status label on the Biometric test screen',
    });
    await expect(status).toHaveText('Tap to run the biometric prompt.', {
      message: 'The biometric status label should prompt the user to run the biometric prompt',
    });

    const runButton = await standalone.byId('hook_biometric_authorize');
    await expect(runButton).toBeDisplayed({
      message: 'The "Run biometric prompt" button should be displayed',
    });
  });
});
