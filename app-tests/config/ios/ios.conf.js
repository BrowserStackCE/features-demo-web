const { buildIosConfig } = require('./base.ios.conf');

// iOS NexusDemo suite. Run everything: npm run test:ios
// Run one feature:  IOS_SPEC=gps npm run test:ios   (image-injection, biometric, video-injection, file-download,
// network, gps, otp, full-flow). Audio injection is not available on iOS.
// CI (workflow_dispatch) sets FEATURES, a comma-separated list: FEATURES=gps,network.
// An empty FEATURES in CI (FEATURES set but blank) runs the E2E flow (full-flow.spec.js).
const fromList = (process.env.FEATURES || '')
  .split(',')
  .map((f) => f.trim())
  .filter(Boolean);
const single = process.env.IOS_SPEC;
const isCi = process.env.FEATURES !== undefined;

let specs;
if (fromList.length) specs = fromList.map((f) => `${f}.spec.js`);
else if (single) specs = [`${single}.spec.js`];
else if (isCi) specs = ['full-flow.spec.js'];
else specs = ['*.spec.js'];

exports.config = buildIosConfig({
  specs,
  sessionName: fromList.length ? `iOS ${fromList.join(', ')}` : single ? `iOS ${single}` : 'iOS NexusDemo',
  buildName: 'nexusdemo-ios',
});
