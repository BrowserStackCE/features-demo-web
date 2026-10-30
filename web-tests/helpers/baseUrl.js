/**
 * Demo site origin for page tests.
 * Override with BASE_URL (e.g. http://localhost:3000 when using BrowserStack Local).
 */
const BASE_URL = (
  process.env.BASE_URL || 'https://browserstackce.github.io/features-demo-web'
).replace(/\/$/, '');

function pageUrl(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${normalized}`;
}

module.exports = { BASE_URL, pageUrl };
