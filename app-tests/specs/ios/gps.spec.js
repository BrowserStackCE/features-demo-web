const IosPage = require('../../pages/ios/ios.page');

describe('iOS GPS', () => {
  const ios = new IosPage();

  it('should show the mocked Bengaluru coordinates after fetching the GPS location', async () => {
    await ios.openGps();

    await ios.fetchGpsLocation();

    // The first fetch can race the permission prompt; set the location, then fetch again.
    await driver.setGeoLocation({ latitude: 12.9716, longitude: 77.5946, altitude: 0 });
    const fetchButton = await ios.byLabel('Get GPS location');
    await ios.clickWhenReady(fetchButton);

    const latitude = await ios.byLabel('12.971600°');
    await latitude.waitForDisplayed({
      timeout: 30000,
      timeoutMsg: 'Expected latitude 12.971600° after mocking Bengaluru and fetching the location',
    });
    await expect(latitude).toHaveText('12.971600°', {
      message: 'Latitude should equal the mocked 12.9716',
    });

    const longitude = await ios.byLabel('77.594600°');
    await expect(longitude).toBeDisplayed({
      message: 'Longitude should equal the mocked 77.5946',
    });

    const address = await driver.$('-ios predicate string:label CONTAINS "Bengaluru"');
    await expect(address).toBeDisplayed({
      message: 'The reverse-geocoded address should be in Bengaluru',
    });
  });
});
