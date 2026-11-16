const { buildConfig } = require('./base.conf');

// File upload and download. Run: npm run test:file-upload-download
exports.config = buildConfig({
  specs: ['file-upload-download.spec.js'],
  sessionName: 'File upload and download',
  buildName: 'file-upload-download-demo',
});
