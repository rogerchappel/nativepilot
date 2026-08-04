#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP="${TMPDIR:-/tmp}/nativepilot-smoke-$$"
APP="$TMP/SmokeApp"
mkdir -p "$TMP"
node "$ROOT/dist/src/index.js" create SmokeApp --dir "$APP" --providers openai,anthropic,gemini,local > "$TMP/create.json"
node "$ROOT/dist/src/index.js" doctor "$APP" --fail-on unsafe-key,stale-guidance > "$TMP/doctor.json"
node "$ROOT/dist/src/index.js" print-agent-brief "$APP" --for codex > "$TMP/brief.md"
(cd "$APP" && node "scripts/nativepilot-smoke.mjs")
node "$ROOT/dist/src/index.js" clean-demo "$APP" > "$TMP/clean.json"
test ! -e "$APP/app/chat.tsx"
test -e "$APP/src/ai/client.ts"
node "$ROOT/dist/src/index.js" doctor "$APP" --fail-on unsafe-key,stale-guidance > "$TMP/doctor-cleaned.json"
echo "nativepilot CLI smoke passed: $APP"
