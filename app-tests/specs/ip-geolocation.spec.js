const StandalonePage = require('../pages/standalone.page');

describe('IP geolocation', () => {
  const standalone = new StandalonePage();

  it('should show the language and region derived from the session IP', async () => {
    await standalone.openIpGeo();

    const status = await standalone.byId('hook_geo_ip_status');
    await status.waitForDisplayed({
      timeout: 15000,
      timeoutMsg: 'Expected the IP geo location status card to appear',
    });

    const ipLine = await standalone.byUiSelector('textContains("Region:")');
    await ipLine.waitForDisplayed({
      timeout: 15000,
      timeoutMsg: 'Expected the "IP: ... Region: ..." line once the IP lookup finishes',
    });
    await expect(ipLine).toHaveText(expect.stringContaining('IP: '), {
      message: 'The IP line should show the session IP address',
    });
  });
});
