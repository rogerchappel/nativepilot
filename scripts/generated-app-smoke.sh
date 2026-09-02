#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
smoke_root="$(mktemp -d "${TMPDIR:-/tmp}/nativepilot-generated-smoke.XXXXXX")"
app_root="$smoke_root/GeneratedSmoke"
package_tarball="$(cd "$repo_root" && npm pack --silent)"

cleanup() {
  rm -f "$repo_root/$package_tarball"
  rm -rf "$smoke_root"
}
trap cleanup EXIT

(
  cd "$smoke_root"
  node "$repo_root/dist/src/index.js" create GeneratedSmoke --providers local
)

(
  cd "$app_root"
  node -e "const pkg = require('./package.json'); if (pkg.devDependencies.nativepilot !== '^0.1.0') process.exit(1)"
  npm install --save-dev "$repo_root/$package_tarball" --ignore-scripts --no-audit --no-fund
  npm ls react-native react-native-reanimated react-native-worklets --depth=0
  bash "$repo_root/scripts/expo-dependency-check.sh"
  npm run typecheck
  npm run doctor
  npm run nativepilot:doctor
)
