#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP="$(mktemp -d "${TMPDIR:-/tmp}/nativepilot-package-smoke.XXXXXX")"
APP="$TMP/PackagedApp"

cleanup() {
  rm -rf "$TMP"
}
trap cleanup EXIT

cd "$ROOT"
PACKAGE_TARBALL="$(npm pack --silent --pack-destination "$TMP")"

mkdir "$TMP/consumer"
cd "$TMP/consumer"
npm init --yes --silent >/dev/null
npm install --silent --ignore-scripts "$TMP/$PACKAGE_TARBALL"

"$TMP/consumer/node_modules/.bin/nativepilot" create PackagedApp --dir "$APP" > "$TMP/create.json"
"$TMP/consumer/node_modules/.bin/nativepilot" doctor "$APP" --fail-on unsafe-key,stale-guidance > "$TMP/doctor.json"

test -s "$TMP/create.json"
test -s "$TMP/doctor.json"
test -e "$APP/src/ai/client.ts"

echo "nativepilot packaged CLI smoke passed"
