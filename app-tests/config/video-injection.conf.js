const { buildConfig } = require('./base.conf');

// Camera video injection. Run: npm run test:video-injection
exports.config = buildConfig({
  specs: ['video-injection.spec.js'],
  sessionName: 'Video injection',
  buildName: 'video-injection-demo',
});
