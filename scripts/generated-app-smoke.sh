#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
smoke_root="$(mktemp -d "${TMPDIR:-/tmp}/nativepilot-generated-smoke.XXXXXX")"
app_root="$smoke_root/GeneratedSmoke"

cleanup() {
  rm -rf "$smoke_root"
}
trap cleanup EXIT

node "$repo_root/dist/src/index.js" create GeneratedSmoke --dir "$app_root" --providers local

(
  cd "$app_root"
  npm install --package-lock-only --ignore-scripts --no-audit --no-fund
  npm ci --ignore-scripts --no-audit --no-fund
  npm ls react-native react-native-reanimated react-native-worklets --depth=0
  npm test
  npm run typecheck
  npm run doctor
)
