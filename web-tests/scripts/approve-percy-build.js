#!/usr/bin/env node
/**
 * Wait for the baseline Percy build to finish, then approve it.
 * Auth: BrowserStack username/access key only (Basic) — no PERCY_TOKEN.
 * Build id: PERCY_BUILD_ID env, or web-tests/.percy-baseline-build-id (from healthcheck).
 *
 * @see https://www.browserstack.com/docs/percy/api-reference/builds#approve-build
 */
const fs = require('fs');
const path = require('path');

const BUILD_ID_FILE = path.join(__dirname, '..', '.percy-baseline-build-id');
const PERCY_API = 'https://percy.io/api/v1';
const POLL_MS = 10_000;
const TIMEOUT_MS = 10 * 60 * 1000;

function basicAuthHeader(username, accessKey) {
  const token = Buffer.from(`${username}:${accessKey}`, 'utf8').toString('base64');
  return `Basic ${token}`;
}

function readBuildId() {
  if (process.env.PERCY_BUILD_ID) {
    return String(process.env.PERCY_BUILD_ID).trim();
  }
  if (!fs.existsSync(BUILD_ID_FILE)) {
    throw new Error(
      `Missing Percy build id. Set PERCY_BUILD_ID or ensure baseline test wrote ${BUILD_ID_FILE}`
    );
  }
  const id = fs.readFileSync(BUILD_ID_FILE, 'utf8').trim();
  if (!id) throw new Error(`${BUILD_ID_FILE} is empty`);
  return id;
}

async function percyFetch(pathname, { method = 'GET', body, auth } = {}) {
  const res = await fetch(`${PERCY_API}${pathname}`, {
    method,
    headers: {
      Authorization: auth,
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { ok: res.ok, status: res.status, json };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitUntilFinished(buildId, auth) {
  const started = Date.now();
  while (Date.now() - started < TIMEOUT_MS) {
    const { ok, status, json } = await percyFetch(`/builds/${buildId}`, { auth });
    if (!ok) {
      throw new Error(`GET /builds/${buildId} failed (${status}): ${JSON.stringify(json)}`);
    }
    const attrs = (json && json.data && json.data.attributes) || {};
    const state = attrs.state;
    const reviewState = attrs['review-state'];
    const webUrl = attrs['web-url'];
    const total = attrs['total-comparisons'];
    const finishedComparisons = attrs['total-comparisons-finished'];
    const comparisonsDone =
      total == null || finishedComparisons == null || Number(finishedComparisons) >= Number(total);

    console.log(
      `[percy] build ${buildId} state=${state} review-state=${reviewState}` +
        (total != null ? ` comparisons=${finishedComparisons}/${total}` : '') +
        (webUrl ? ` ${webUrl}` : '')
    );

    if (state === 'failed') {
      throw new Error(`Percy build ${buildId} failed: ${attrs['failed-reason'] || attrs['failure-details'] || 'unknown'}`);
    }

    if (state === 'finished' && comparisonsDone) {
      return { attrs, webUrl };
    }

    await sleep(POLL_MS);
  }
  throw new Error(`Timed out waiting for Percy build ${buildId} to finish (${TIMEOUT_MS}ms)`);
}

async function approveBuild(buildId, auth) {
  const body = {
    data: {
      attributes: { action: 'approve' },
      relationships: {
        build: {
          data: { type: 'builds', id: String(buildId) },
        },
      },
    },
  };
  const { ok, status, json } = await percyFetch('/reviews', { method: 'POST', body, auth });
  if (!ok) {
    throw new Error(`POST /reviews approve failed (${status}): ${JSON.stringify(json)}`);
  }
  return json;
}

async function main() {
  const username = process.env.BROWSERSTACK_USERNAME;
  const accessKey = process.env.BROWSERSTACK_ACCESS_KEY;
  if (!username || !accessKey) {
    throw new Error('BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY are required');
  }

  const buildId = readBuildId();
  const auth = basicAuthHeader(username, accessKey);
  console.log(`[percy] approving build id=${buildId}`);

  const { attrs, webUrl } = await waitUntilFinished(buildId, auth);

  if (attrs['review-state'] === 'approved') {
    console.log(`[percy] build ${buildId} already approved${webUrl ? ` — ${webUrl}` : ''}`);
    return;
  }

  const review = await approveBuild(buildId, auth);
  const reviewState =
    review &&
    review.data &&
    review.data.attributes &&
    review.data.attributes['review-state'];
  console.log(
    `[percy] approved build ${buildId}` +
      (reviewState ? ` review-state=${reviewState}` : '') +
      (webUrl ? ` — ${webUrl}` : '')
  );
}

main().catch((err) => {
  console.error(`[percy] ${err.message || err}`);
  process.exit(1);
});
