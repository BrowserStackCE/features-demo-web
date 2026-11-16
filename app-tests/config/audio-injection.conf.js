const { buildConfig } = require('./base.conf');

// Audio injection (account group must have the feature enabled). Run: npm run test:audio-injection
exports.config = buildConfig({
  specs: ['audio-injection.spec.js'],
  sessionName: 'Audio injection',
  buildName: 'audio-injection-demo',
  bstackOptions: { enableAudioInjection: true },
});
