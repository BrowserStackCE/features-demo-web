#!/usr/bin/env bash
set -euo pipefail

curl -X POST "https://features-demo-api.vercel.app/api/trigger" \
  -H "Content-Type: application/json" \
  -d "{
    \"workflow\": \"self-healing\",
    \"username\": \"${BROWSERSTACK_USERNAME}\",
    \"accessKey\": \"${BROWSERSTACK_ACCESS_KEY}\",
    \"localTesting\": false,
    \"ref\": \"main\"
  }"
