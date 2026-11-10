const StandalonePage = require('../pages/standalone.page');

describe('Audio injection', () => {
  const standalone = new StandalonePage();

  it('should inject audio_sample.mp3 into the microphone and record it', async () => {
    await standalone.openAudio();

    const play = await standalone.textView('Play recording');
    await expect(play).toBeDisplayed({
      message: 'The "Play recording" button should be visible on the Audio injection screen',
    });

    // Uploads web-tests/fixtures/audio_sample.mp3, injects it, then starts the recording.
    await standalone.recordInjectedAudio();

    const recordButton = await standalone.textView('Play recording');
    await recordButton.waitForDisplayed({
      timeout: 15000,
      timeoutMsg: 'Expected the Audio injection screen to stay available after recording',
    });
  });
});
