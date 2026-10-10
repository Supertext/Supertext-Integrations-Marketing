#!/bin/sh
# Builds the Supertext translation plugin from its GitHub repo into plugins/supertext.tgz
# (it isn't published on npm). package.json depends on that file, so run this before
# npm install / npm ci. Usage: npm run plugin   (PLUGIN_REF=v0.1.0 for a tag)
set -eu
ref="${PLUGIN_REF:-main}"
here="$(cd "$(dirname "$0")/.." && pwd)"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
git clone --quiet --depth 1 --branch "$ref" https://github.com/Supertext/Strapi-Supertext-Translation "$work/plugin"
cd "$work/plugin"
npm ci --no-audit --no-fund
npm run build
npm pack --pack-destination "$work"
mkdir -p "$here/plugins"
mv "$work"/strapi-plugin-supertext-translation-*.tgz "$here/plugins/supertext.tgz"
echo "Supertext plugin ($ref) built: plugins/supertext.tgz"
