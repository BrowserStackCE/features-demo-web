const StandalonePage = require('../pages/standalone.page');
const { setNetworkProfile } = require('../helpers/browserstack');

describe('Network', () => {
  const standalone = new StandalonePage();

  it('should show the offline dialog after switching the session to no-network', async () => {
    const standaloneCard = await standalone.scrollToStandaloneCard();
    await expect(standaloneCard).toBeDisplayed({
      message: 'Expected the domain selector to load before changing the network profile',
    });

    await setNetworkProfile('no-network');

    const offlineDialog = await standalone.byId('hook_network_offline_dialog');
    await offlineDialog.waitForDisplayed({
      timeout: 20000,
      timeoutMsg: 'Expected the "No network found" dialog after switching to no-network',
    });
    const title = await standalone.textView('No network found');
    await expect(title).toHaveText('No network found', {
      message: 'The offline dialog title should read "No network found"',
    });
  });
});
