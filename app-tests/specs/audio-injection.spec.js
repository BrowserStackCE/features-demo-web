const StandalonePage = require('../pages/standalone.page');

describe('Audio injection', () => {
  const standalone = new StandalonePage();

  it('should inject audio_sample.mp3 into the microphone and record it', async () => {
    await standalone.openAudio();

    // Uploads web-tests/fixtures/audio_sample.mp3 and injects it into the microphone.
    await standalone.injectSampleAudio();

    // Start the recording
    const el1 = await driver.$('-android uiautomator:new UiSelector().className("android.widget.Button").instance(0)');
    await el1.click();

    await driver.pause(10000);

    // End the recording
    const el2 = await driver.$('-android uiautomator:new UiSelector().className("android.widget.Button").instance(0)');
    await el2.click();

    // Assert the text: Recorded. Injected audio should play back.
    const status = await driver.$('//android.widget.TextView[@text="Recorded. Injected audio should play back."]');
    await expect(status).toBeDisplayed({
      message: 'The status line "Recorded. Injected audio should play back." should be shown after the recording ends',
    });
  });
});
