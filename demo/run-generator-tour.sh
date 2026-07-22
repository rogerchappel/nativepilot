#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEMO_DIR="$(mktemp -d "${TMPDIR:-/tmp}/nativepilot-demo.XXXXXX")"
APP="$DEMO_DIR/SupportCopilot"
trap 'rm -rf "$DEMO_DIR"' EXIT

cd "$ROOT"
npm run build >/dev/null

echo "1/3 Generate an Expo app with explicit provider lanes"
node dist/src/index.js create SupportCopilot \
  --dir "$APP" \
  --providers openai,anthropic,local

echo
echo "2/3 Validate structure, guidance, aliases, and secret boundaries"
node dist/src/index.js doctor "$APP" --fail-on unsafe-key,stale-guidance

echo
echo "3/3 Print the generated handoff for a coding agent"
node dist/src/index.js print-agent-brief "$APP" --for codex

echo
echo "Generated files (top two levels):"
find "$APP" -mindepth 1 -maxdepth 2 -type f \
  | sed "s|$APP/||" \
  | sort
