const StandalonePage = require('../pages/standalone.page');

describe('File upload and download', () => {
  const standalone = new StandalonePage();

  it('should upload the sample PDF and download the sample PDF into Downloads', async () => {
    await standalone.openFiles();

    const noFile = await standalone.textView('No file selected');
    await expect(noFile).toBeDisplayed({
      message: 'The Files screen should show "No file selected" before a file is uploaded',
    });

    // Upload: push sample.pdf to the device, open the picker and select it.
    await standalone.uploadSamplePdf();

    const uploaded = await standalone.byUiSelector('textStartsWith("Uploaded:")');
    await uploaded.waitForDisplayed({
      timeout: 15000,
      timeoutMsg: 'Expected an "Uploaded: ..." confirmation after selecting sample.pdf in the picker',
    });
    await expect(noFile).not.toBeDisplayed({
      message: 'After uploading sample.pdf the "No file selected" label should be gone',
    });

    // Download: the app writes a sample PDF into the device Downloads folder.
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
