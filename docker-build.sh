#!/bin/bash
set -e

echo "🏇 Building Strike Tips APK with Docker..."

cd "$(dirname "$0")"

docker build -t striketips-builder -f Dockerfile .

mkdir -p striketips-pages/downloads

docker run --rm -v "$(pwd)/striketips-pages/downloads:/output" striketips-builder

echo "✅ APK built and copied to striketips-pages/downloads/striketips.apk"
ls -lh striketips-pages/downloads/striketips.apk
