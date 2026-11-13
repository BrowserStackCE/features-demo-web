const { buildConfig } = require('./base.conf');

// BFSI full flow. Run: npm run test:full-flow
exports.config = buildConfig({
  specs: ['full-flow.spec.js'],
  sessionName: 'BFSI Full Flow',
  buildName: 'full-flow-demo',
});
