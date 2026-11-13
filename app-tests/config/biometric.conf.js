const { buildConfig } = require('./base.conf');

// Biometric. Run: npm run test:biometric
exports.config = buildConfig({
  specs: ['biometric.spec.js'],
  sessionName: 'Biometric',
  buildName: 'biometric-demo',
});
