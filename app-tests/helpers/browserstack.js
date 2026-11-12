const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const ASSETS_DIR = path.resolve(__dirname, '../../docs/assets');
// Video/audio samples are shared with the web tests.
const FIXTURES_DIR = path.resolve(__dirname, '../../web-tests/fixtures');

function credentials() {
  const username = process.env.BROWSERSTACK_USERNAME;
  const password = process.env.BROWSERSTACK_ACCESS_KEY;
  if (!username) throw new Error('BROWSERSTACK_USERNAME is not available.');
  if (!password) throw new Error('BROWSERSTACK_ACCESS_KEY is not available.');
  return { username, password };
}

function assetPath(name) {
  const candidates = [path.join(ASSETS_DIR, name), path.join(FIXTURES_DIR, name)];
  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) throw new Error(`Asset not found in: ${candidates.join(' or ')}`);
  return found;
}

// Uploads a media file (image/video/audio) and returns its media_url (bs://...).
async function uploadMedia(fileName, customId) {
  const form = new FormData();
  form.append('file', fs.createReadStream(assetPath(fileName)));
  form.append('custom_id', customId);
  try {
    const res = await axios.post(
      'https://api-cloud.browserstack.com/app-automate/upload-media',
      form,
      { auth: credentials(), headers: form.getHeaders() }
    );
    if (!res.data.media_url) {
      throw new Error('BrowserStack media upload did not return media_url.');
    }
    return res.data.media_url;
  } catch (error) {
    // Never print the full axios error: it carries request config/auth.
    throw new Error(
      `Media upload failed: ${error.response?.status || error.response?.data?.error || error.message}`
    );
  }
}

async function executor(action, args) {
  return driver.execute(
    `browserstack_executor: ${JSON.stringify({ action, arguments: args })}`
  );
}

async function injectCameraImage(fileName, customId) {
  const imageUrl = await uploadMedia(fileName, customId);
  await executor('cameraImageInjection', { imageUrl });
}

async function injectCameraVideo(fileName, customId) {
  const videoUrl = await uploadMedia(fileName, customId);
  await executor('cameraVideoInjection', { videoUrl });
}

async function injectAudio(fileName, customId) {
  const audioUrl = await uploadMedia(fileName, customId);
  // "injectAudio" is the action BrowserStack accepts (the web tests use it too); "audioInjection" is rejected.
  await executor('injectAudio', { audioUrl });
}

async function pushFileToDevice(fileName, devicePath) {
  const base64 = fs.readFileSync(assetPath(fileName)).toString('base64');
  await driver.pushFile(devicePath, base64);
}

async function setNetworkProfile(profile) {
  const sessionId = driver.sessionId;
  if (!sessionId) throw new Error('BrowserStack session ID is not available.');
  try {
    await axios.put(
      `https://api-cloud.browserstack.com/app-automate/sessions/${sessionId}/update_network.json`,
      { networkProfile: profile },
      { auth: credentials(), headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    throw new Error(
      `Network update failed: ${error.response?.status || error.response?.data?.error || error.message}`
    );
  }
}

module.exports = {
  assetPath,
  uploadMedia,
  executor,
  injectCameraImage,
  injectCameraVideo,
  injectAudio,
  pushFileToDevice,
  setNetworkProfile,
};
