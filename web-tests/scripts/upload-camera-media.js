#!/usr/bin/env node
/**
 * Upload fixtures/sample-video.mp4 to BrowserStack Automate and print media_url.
 * Skips upload if the file already exists (matched by media_name).
 * Used by npm run test:camera to set BROWSERSTACK_CAMERA_URL before the SDK starts.
 *
 * Docs: https://www.browserstack.com/docs/automate/selenium/camera-injection
 * List API: https://www.browserstack.com/docs/automate/api-reference/selenium/media#list-uploaded-media-files
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const filePath = path.resolve(__dirname, '../fixtures/sample-video.mp4');
const username = process.env.BROWSERSTACK_USERNAME;
const accessKey = process.env.BROWSERSTACK_ACCESS_KEY;
const authHeader = 'Basic ' + Buffer.from(`${username}:${accessKey}`).toString('base64');

if (!username || !accessKey) {
  console.error('BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY must be set');
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error('Missing fixture:', filePath);
  process.exit(1);
}

const filename = path.basename(filePath);

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function findExistingMediaUrl() {
  const { statusCode, data } = await request({
    hostname: 'api-cloud.browserstack.com',
    path: '/automate/recent_media_files',
    method: 'GET',
    headers: { Authorization: authHeader },
  });

  if (statusCode !== 200) {
    console.error('Failed to list media files:', data);
    return null;
  }

  const files = JSON.parse(data);
  if (!Array.isArray(files)) return null;

  const match = files.find((f) => f.media_name === filename && f.media_url);
  return match ? match.media_url : null;
}

async function uploadMedia() {
  const fileContent = fs.readFileSync(filePath);
  const boundary = '----FormBoundary' + Date.now();
  const body = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: video/mp4\r\n\r\n`
    ),
    fileContent,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);

  const { data } = await request(
    {
      hostname: 'api-cloud.browserstack.com',
      path: '/automate/upload-media',
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
    },
    body
  );

  const parsed = JSON.parse(data);
  if (!parsed.media_url) {
    throw new Error('Upload failed: ' + data);
  }
  return parsed.media_url;
}

(async () => {
  try {
    const existing = await findExistingMediaUrl();
    if (existing) {
      console.error(`Reusing existing upload for ${filename}: ${existing}`);
      process.stdout.write(existing);
      return;
    }

    const mediaUrl = await uploadMedia();
    console.error(`Uploaded ${filename}: ${mediaUrl}`);
    process.stdout.write(mediaUrl);
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
})();
