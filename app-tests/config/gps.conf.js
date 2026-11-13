const { buildConfig } = require('./base.conf');

// GPS location. Run: npm run test:gps
exports.config = buildConfig({
  specs: ['gps.spec.js'],
  sessionName: 'GPS',
  buildName: 'gps-demo',
});
