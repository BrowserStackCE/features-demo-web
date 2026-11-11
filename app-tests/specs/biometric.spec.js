const StandalonePage = require('../pages/standalone.page');

describe('Biometric', () => {
  const standalone = new StandalonePage();

  it('should run the biometric prompt and pass it from the dialog', async () => {
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

    await standalone.runBiometricPrompt();

    // The dialog asks "Do you want it to pass or fail?"; PASS is android:id/button1.
    const message = await driver.$('id:android:id/message');
    await message.waitForDisplayed({
      timeout: 15000,
      timeoutMsg: 'Expected the biometric "pass or fail" dialog after tapping Run biometric prompt',
    });
    await expect(message).toHaveText(expect.stringContaining('pass or fail'), {
      message: 'The biometric dialog should ask whether the prompt should pass or fail',
    });

    await standalone.choosePassOnBiometricDialog();

    await message.waitForDisplayed({
      reverse: true,
      timeout: 15000,
      timeoutMsg: 'Expected the biometric dialog to close after choosing PASS',
    });
    await expect(message).not.toBeDisplayed({
      message: 'The biometric dialog should be closed after choosing PASS',
    });
  });
});
