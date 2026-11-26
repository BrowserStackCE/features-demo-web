const IosPage = require('../../pages/ios/ios.page');
const { setNetworkProfile } = require('../../helpers/browserstack');

describe('iOS Network', () => {
  const ios = new IosPage();

  it('should show the offline alert and Offline status after switching to no-network', async () => {
    await ios.openNetwork();

    const connected = await ios.byLabel('Connected');
    await connected.waitForDisplayed({
      timeout: 15000,
      timeoutMsg: 'Expected the Network Test screen to start as "Connected"',
    });

    try {
      await setNetworkProfile('no-network');

      const offlineAlert = await ios.byLabel("You're Offline");
      await offlineAlert.waitForDisplayed({
        timeout: 30000,
        timeoutMsg: 'Expected the "You\'re Offline" alert after switching to no-network',
      });
      await expect(offlineAlert).toHaveText("You're Offline", {
        message: 'The offline alert title should read "You\'re Offline"',
      });

      await ios.clickWhenReady(await ios.byLabel('OK'));
      const offline = await ios.byLabel('Offline');
      await offline.waitForDisplayed({
        timeout: 15000,
        timeoutMsg: 'Expected the connection status to read "Offline"',
      });
      await expect(offline).toHaveText('Offline', {
        message: 'The connection status should read "Offline"',
      });
    } finally {
      // Always restore connectivity so later tests on the shared session are unaffected.
      await setNetworkProfile('reset');
    }
  });
});
