# Pipeline Trigger API

Hono app for Vercel. Triggers GitHub Actions `workflow_dispatch` pipelines and returns signed tokens you can poll for status.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/trigger` | Start one or more workflows |
| `GET` | `/api/status` | Poll run status by token(s) |
| `GET` | `/api/health` | Liveness check |

### Trigger

```bash
curl -X POST "$API_URL/api/trigger" \
  -H "Content-Type: application/json" \
  -d '{
    "workflow": "apple-pay",
    "workflows": ["camera", "network"],
    "username": "YOUR_BS_USERNAME",
    "accessKey": "YOUR_BS_ACCESS_KEY",
    "localTesting": false,
    "ref": "main"
  }'
```

Response:

```json
{
  "runs": [
    {
      "workflow": "apple-pay",
      "token": "<signed-poll-token>",
      "htmlUrl": "https://github.com/.../actions/runs/123"
    }
  ]
}
```

Allowed workflow aliases: `apple-pay`, `camera`, `audio`, `network`, `self-healing`.

### Status

```bash
curl "$API_URL/api/status?token=<signed-poll-token>"

# Multiple:
curl "$API_URL/api/status?tokens=TOKEN1,TOKEN2"
curl "$API_URL/api/status?token=TOKEN1&token=TOKEN2"
```

Response:

```json
{
  "runs": [
    {
      "token": "<signed-poll-token>",
      "workflow": "apple-pay",
      "runId": 123456789,
      "status": "completed",
      "conclusion": "success",
      "htmlUrl": "https://github.com/.../actions/runs/123456789"
    }
  ]
}
```

## Vercel env vars

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GITHUB_TOKEN` | yes | — | PAT with `actions:write` + `actions:read` on the target repo |
| `GITHUB_OWNER` | no | `BrowserStackCE` | GitHub org/user |
| `GITHUB_REPO` | no | `features-demo-web` | Repository name |
| `TOKEN_SECRET` | recommended | falls back to `GITHUB_TOKEN` | HMAC secret for poll tokens |

BrowserStack credentials are **not** stored on Vercel; send them in each trigger request body.

## Local

```bash
npm install
npm run dev
```

Runs the Hono app via `@hono/node-server` on `http://localhost:3000` (override with `PORT`). Loads env from `api/.env`.

For production, deploy to Vercel (`npx vercel`) and set the env vars in the Vercel project settings.
