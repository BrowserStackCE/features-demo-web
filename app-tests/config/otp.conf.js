const { buildConfig } = require('./base.conf');

// OTP. Run: npm run test:otp
exports.config = buildConfig({
  specs: ['otp.spec.js'],
  sessionName: 'OTP',
  buildName: 'otp-demo',
});
