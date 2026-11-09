#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
NODE_BIN=/Users/jamie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin
export PATH="$NODE_BIN:$PATH"
node scripts/build-design-module.mjs
case "${1:-check}" in
 check) node node_modules/astro/bin/astro.mjs check; node scripts/verify-recovered-gate.mjs ;;
 build) node node_modules/astro/bin/astro.mjs check; node node_modules/astro/bin/astro.mjs build ;;
 preview) node node_modules/astro/bin/astro.mjs preview --host 127.0.0.1 --port 4321 ;;
 dev) node node_modules/astro/bin/astro.mjs dev --host 127.0.0.1 --port 4321 ;;
 *) echo 'Usage: sh scripts/local-maintenance.sh check|build|preview|dev'; exit 2 ;;
esac
