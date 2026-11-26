const IosPage = require('../../pages/ios/ios.page');

describe('iOS File download', () => {
  const ios = new IosPage();

  it('should download the sample PDF and confirm it was downloaded', async () => {
    await ios.openFiles();

    await ios.clickWhenReady(await ios.byLabel('Download sample PDF'));

    const alertTitle = await ios.byLabel('File Downloaded ✓');
    await alertTitle.waitForDisplayed({
      timeout: 15000,
      timeoutMsg: 'Expected the "File Downloaded ✓" alert after tapping Download sample PDF',
    });
    await ios.clickWhenReady(await ios.byLabel('Later'));

    const status = await ios.byLabel('Downloaded: nexus_demo_info.pdf');
    await status.waitForDisplayed({
      timeout: 10000,
      timeoutMsg: 'Expected the "Downloaded: nexus_demo_info.pdf" status after dismissing the alert',
    });
    await expect(status).toHaveText('Downloaded: nexus_demo_info.pdf', {
      message: 'The download status should name nexus_demo_info.pdf',
    });
  });
});
