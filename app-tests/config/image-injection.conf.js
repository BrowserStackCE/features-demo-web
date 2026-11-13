const { buildConfig } = require('./base.conf');

// Camera image injection. Run: npm run test:image-injection
exports.config = buildConfig({
  specs: ['image-injection.spec.js'],
  sessionName: 'Image injection',
  buildName: 'image-injection-demo',
});
