#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
smoke_root="$(mktemp -d "${TMPDIR:-/tmp}/nativepilot-generated-smoke.XXXXXX")"
app_root="$smoke_root/GeneratedSmoke"
package_tarball="$(cd "$repo_root" && npm pack --silent --pack-destination "$smoke_root")"

cleanup() {
  rm -rf "$smoke_root"
}
trap cleanup EXIT

node "$repo_root/dist/src/index.js" create GeneratedSmoke --dir "$app_root" --providers local

(
  cd "$app_root"
  node -e "const pkg = require('./package.json'); if (pkg.devDependencies.nativepilot !== '^0.1.0') process.exit(1)"
  npm install --save-dev "$smoke_root/$package_tarball" --package-lock-only --ignore-scripts --no-audit --no-fund
  npm ci --ignore-scripts --no-audit --no-fund
  npm ls react-native react-native-reanimated react-native-worklets --depth=0
  bash "$repo_root/scripts/expo-dependency-check.sh"
  npm test
  npm run typecheck
  npm run doctor
  npm run nativepilot:doctor
)
