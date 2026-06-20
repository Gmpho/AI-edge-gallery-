#!/bin/bash
set -e

echo "🏇 Deploying Strike Tips APK to Cloudflare Pages..."

APK_SOURCE="Android/src/app/build/outputs/apk/release/app-release.apk"
APK_DEST="striketips-pages/downloads/striketips.apk"

if [ ! -f "$APK_SOURCE" ]; then
    echo "❌ APK not found at $APK_SOURCE"
    echo "Make sure the Gradle build completed successfully."
    exit 1
fi

cp "$APK_SOURCE" "$APK_DEST"
echo "✅ APK copied to $APK_DEST"
ls -lh "$APK_DEST"

echo "🚀 Deploying to Cloudflare Pages..."
npx wrangler pages deploy striketips-pages --project-name=striketips

echo "✅ Strike Tips APK is now live at:"
echo "   https://striketips.pages.dev/downloads/striketips.apk"
echo "   https://striketips.pages.dev"
