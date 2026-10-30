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
