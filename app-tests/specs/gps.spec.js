const StandalonePage = require('../pages/standalone.page');

describe('GPS', () => {
  const standalone = new StandalonePage();

  it('should show the mocked GPS location after setting it and refreshing', async () => {
    await standalone.openIpGeo();

    const status = await standalone.byId('hook_geo_ip_status');
    await status.waitForDisplayed({
      timeout: 15000,
      timeoutMsg: 'Expected the IP geo location status card to appear',
    });

    await driver.setGeoLocation({ latitude: 12.9716, longitude: 77.5946, altitude: 0 });
    await standalone.refreshLocation();

    // After the refresh the "Device GPS" line must no longer read the default Atlanta location.
    const gpsLine = await standalone.byUiSelector('textStartsWith("GPS On")');
    await gpsLine.waitForDisplayed({
      timeout: 20000,
      timeoutMsg: 'Expected a "GPS On · <place>" line after refreshing the location',
    });
    await driver.waitUntil(async () => !(await gpsLine.getText()).includes('Atlanta'), {
      timeout: 20000,
      timeoutMsg: 'Device GPS line still shows Atlanta after setting the location to Bengaluru and refreshing',
    });
    await expect(gpsLine).not.toHaveText(expect.stringContaining('Atlanta'), {
      message: 'The Device GPS line should reflect the mocked location, not the default Atlanta one',
    });
  });
});
