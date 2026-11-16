# Demo Pipeline

BrowserStack Automate feature demos, the Jest suite that exercises them, and a small API that starts those runs on GitHub Actions.

The demo pages live in [`docs/`](docs/) and are published at [browserstackce.github.io/features-demo-web](https://browserstackce.github.io/features-demo-web). Tests in [`web-tests/`](web-tests/) run against that site (or a local server) through the [BrowserStack Node SDK](https://www.browserstack.com/docs/automate/selenium/getting-started/nodejs). [`api/`](api/) dispatches the matching `workflow_dispatch` workflows and returns signed tokens you can poll for status.

## Layout

| Path | What it is |
|------|------------|
| `docs/` | Static HTML demos (Apple Pay, camera, GPS, Percy, and others) |
| `web-tests/` | Jest + Selenium tests and per-feature `browserstack.yml` configs |
| `api/` | Hono app that triggers workflows and reports run status |
| `.github/workflows/` | One `workflow_dispatch` workflow per feature |

## Prerequisites

- Node.js 24
- A [BrowserStack](https://www.browserstack.com/) account

Export your credentials before running tests:

```bash
export BROWSERSTACK_USERNAME=your_username
export BROWSERSTACK_ACCESS_KEY=your_access_key
```

## Run a feature locally

```bash
cd web-tests
npm ci
npm run test:network
```

Tests open the published demo site by default. Point them at a local copy with BrowserStack Local:

```bash
npx --yes serve docs -l 3000

cd web-tests
BASE_URL=http://localhost:3000 BROWSERSTACK_LOCAL=true npm run test:network
```

| Script | Feature |
|--------|---------|
| `npm run test:apple-pay` | Apple Pay on a real iOS device |
| `npm run test:camera` | Camera injection and QR decode |
| `npm run test:audio` | Audio injection |
| `npm run test:network` | Network throttling |
| `npm run test:self-healing` | Self-healing selectors |
| `npm run test:file-upload` | File upload and download |
| `npm run test:gps` | GPS geolocation |
| `npm run test:ip-geolocation` | IP geolocation |
| `npm run test:timezone` | Timezone |
| `npm run test:iframe` | Cross-origin iframe |
| `npm run test:permissions` | Camera, microphone, and location permissions |
| `npm run test:visual-regression` | Percy visual regression |

Config files and the SDK flags they set are described in [`web-tests/config/README.md`](web-tests/config/README.md).

## GitHub Actions

Each feature workflow is started with `workflow_dispatch`. Inputs are `username`, `accessKey`, and optional `localTesting`. When local testing is on, the job serves `docs/` on port 3000 and sets `BROWSERSTACK_LOCAL`.

Trigger one from the Actions tab, or with the GitHub CLI:

```bash
gh workflow run test-network.yml \
  -f username="$BROWSERSTACK_USERNAME" \
  -f accessKey="$BROWSERSTACK_ACCESS_KEY"
```

## Trigger API

The API in [`api/`](api/) starts one or more of those workflows and returns a signed token per run. Poll `GET /api/status` with the token instead of holding GitHub credentials on the client. BrowserStack credentials are sent on each trigger request and are not stored by the API.

Setup, endpoints, and environment variables are in [`api/README.md`](api/README.md).

```bash
cd api
npm install
npm run dev
```

## App Automate (Android)

[`app-tests/`](app-tests/) holds WebdriverIO + BrowserStack App Automate tests for the NexusDemo Android app (`docs/assets/NexusDemo-v2.9.10.apk`). Locators are kept in page objects under `app-tests/pages/`, and test data comes from the environment, not from the specs.

Each feature has its own spec and its own `workflow_dispatch` workflow (`.github/workflows/android-*.yml`). The "Upload APK" step uploads the APK and passes its `bs://` id to the tests as `BROWSERSTACK_APP_URL`.

| Feature | Spec | Workflow |
|---------|------|----------|
| E2E flow (full BFSI onboarding) | `full-flow.spec.js` | `android-e2e.yml` |
| Image injection | `image-injection.spec.js` | `android-image-injection.yml` |
| Video injection | `video-injection.spec.js` | `android-video-injection.yml` |
| Audio injection | `audio-injection.spec.js` | `android-audio-injection.yml` |
| Biometric | `biometric.spec.js` | `android-biometric.yml` |
| File upload & download | `file-upload-download.spec.js` | `android-file-upload-download.yml` |
| Network | `network.spec.js` | `android-network.yml` |
| GPS | `gps.spec.js` | `android-gps.yml` |
| OTP | `otp.spec.js` | `android-otp.yml` |

### E2E flow

The E2E flow runs `full-flow.spec.js` through the BFSI onboarding: domain selection, registration, profile photo (camera image injection), KYC document upload, phone number, OTP, the remaining BFSI screens, GPS, and finally a switch to the no-network profile. The test passes when BrowserStack accepts the no-network profile.

- Registration name, email, password and phone number are random unless `REGISTER_NAME`, `REGISTER_EMAIL`, `REGISTER_PASSWORD` or `PHONE_NUMBER` is set. The OTP defaults to `1234` unless `OTP_VALUE` is set.
- Every click, text entry and Back press waits for the screen to settle before the next step.

### Run from the page

[`docs/run-on-browserstack.html`](docs/run-on-browserstack.html) can start these runs. Pick **App Automate** and **Android**, then choose features under **App Features (Android)**:

- **Select all** ticks every feature except E2E; with nothing selected, all features except E2E run.
- **Run E2E flow** is one of the options in the list. While it is ticked, the other options are disabled, and it dispatches `android-e2e.yml`.

The trigger API accepts `product: "app-automate"`, `platform: "android"` and a `features` list (`e2e`, `image-injection`, `biometric`, `video-injection`, `file-upload-download`, `audio-injection`, `network`, `gps`, `otp`), and starts one workflow per feature. When the page is not served by the hosted API, open it with `?api=http://localhost:8787` to use a local `npm run dev` of [`api/`](api/).

### Run locally

```bash
cd app-tests
npm ci
npm run test:gps   # one feature, see the table below
```

Before running, provide the BrowserStack credentials and the app id (`bs://...` of the uploaded APK) in one of two ways:

- **Create `app-tests/.env`** (git-ignored; start from `cp .env.example .env`) with `BROWSERSTACK_USERNAME`, `BROWSERSTACK_ACCESS_KEY` and `BROWSERSTACK_APP_URL`.
- **Or update the config directly** (`user`, `key` and the `app` option of the `browserstack` service): `app-tests/config/base.conf.js` for the `npm run test:<feature>` commands, `app-tests/wdio.conf.js` for `npm test`. Don't commit real credentials.

Each feature has its own WebdriverIO config in `app-tests/config/` (`<feature>.conf.js`), built on the shared `base.conf.js` (device, capabilities, BrowserStack service). A config only sets its own spec, session name and build name.

| Script | Config | Feature |
|--------|--------|---------|
| `npm run test:full-flow` | `config/full-flow.conf.js` | E2E flow (full BFSI onboarding) |
| `npm run test:image-injection` | `config/image-injection.conf.js` | Camera image injection |
| `npm run test:video-injection` | `config/video-injection.conf.js` | Camera video injection |
| `npm run test:audio-injection` | `config/audio-injection.conf.js` | Audio injection |
| `npm run test:biometric` | `config/biometric.conf.js` | Biometric |
| `npm run test:file-upload-download` | `config/file-upload-download.conf.js` | File upload and download |
| `npm run test:network` | `config/network.conf.js` | Network throttling |
| `npm run test:gps` | `config/gps.conf.js` | GPS location |
| `npm run test:otp` | `config/otp.conf.js` | OTP |

`npm test` still uses `wdio.conf.js` (used by CI): `FEATURES=gps,network npm test` runs a comma-separated list, and an empty `FEATURES` runs the E2E flow.

The optional test data (`REGISTER_*`, `PHONE_NUMBER`, `OTP_VALUE`) can be supplied through the GitHub secrets `APP_REGISTER_NAME`, `APP_REGISTER_EMAIL`, `APP_REGISTER_PASSWORD`, `APP_PHONE_NUMBER` and `APP_OTP_VALUE` in CI.
