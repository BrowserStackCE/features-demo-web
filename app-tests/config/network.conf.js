const { buildConfig } = require('./base.conf');

// Network throttling. Run: npm run test:network
exports.config = buildConfig({
  specs: ['network.spec.js'],
  sessionName: 'Network',
  buildName: 'network-demo',
});
