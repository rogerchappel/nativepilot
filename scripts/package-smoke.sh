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
if [[ $# -gt 1 ]]; then
  echo "usage: $0 [package-tarball]" >&2
  exit 2
fi

if [[ $# -eq 1 ]]; then
  PACKAGE_PATH="$1"
  [[ "$PACKAGE_PATH" = /* ]] || PACKAGE_PATH="$ROOT/$PACKAGE_PATH"
  test -f "$PACKAGE_PATH"
else
  PACKAGE_TARBALL="$(npm pack --silent --pack-destination "$TMP")"
  PACKAGE_PATH="$TMP/$PACKAGE_TARBALL"
fi

while IFS= read -r entry; do
  case "$entry" in
    package/package.json|package/dist/src/*|package/docs/*|package/README.md|package/LICENSE|package/SECURITY.md|package/CONTRIBUTING.md|package/CHANGELOG.md)
      ;;
    *)
      echo "unexpected package entry: $entry" >&2
      exit 1
      ;;
  esac
done < <(tar -tzf "$PACKAGE_PATH")

if tar -tzf "$PACKAGE_PATH" | grep -q '^package/dist/tests/'; then
  echo "compiled tests must not be published" >&2
  exit 1
fi

mkdir "$TMP/consumer"
cd "$TMP/consumer"
npm init --yes --silent >/dev/null
npm install --silent --ignore-scripts "$PACKAGE_PATH"

"$TMP/consumer/node_modules/.bin/nativepilot" create PackagedApp --dir "$APP" > "$TMP/create.json"
"$TMP/consumer/node_modules/.bin/nativepilot" doctor "$APP" --fail-on unsafe-key,stale-guidance > "$TMP/doctor.json"

test -s "$TMP/create.json"
test -s "$TMP/doctor.json"
test -e "$APP/src/ai/client.ts"

echo "nativepilot packaged CLI smoke passed"
