const StandalonePage = require('../pages/standalone.page');

describe('File upload and download', () => {
  const standalone = new StandalonePage();

  it('should download the sample PDF into the device Downloads folder', async () => {
    await standalone.openFiles();
    await standalone.downloadSamplePdf();

    const saved = await standalone.byUiSelector('textStartsWith("Saved to Downloads")');
    await saved.waitForDisplayed({
      timeout: 15000,
      timeoutMsg: 'Expected a "Saved to Downloads" confirmation after tapping Download sample PDF',
    });
    await expect(saved).toHaveText(expect.stringContaining('.pdf'), {
      message: 'The download confirmation should name a saved .pdf file',
    });
  });
});
