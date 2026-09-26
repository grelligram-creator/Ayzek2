#!/usr/bin/env bash
# ==============================================================================
# AYZEK Mobile Publishing Automation Script
# Prepares and validates Android (.aab) and iOS (.ipa / archive) for app stores
# ==============================================================================

set -e

echo "🚀 [AYZEK] Mobil Dağıtım & Paketleme Başlatılıyor..."

# 1. Production Build
echo "📦 1/3 Vite Production derlemesi yapılıyor..."
npm run build

# 2. Capacitor Sync
echo "🔄 2/3 Web varlıkları Android ve iOS native kabuklarına aktarılıyor..."
npx cap sync

echo "✅ 3/3 Native Projeler Mağaza Dağıtımına Hazır!"
echo ""
echo "🤖 ANDROID (Google Play Store):"
echo "   - Android Studio'da açmak için: npm run open:android"
echo "   - Terminalden Google Play AAB paketi üretmek için: cd android && ./gradlew bundleRelease"
echo "   - Çıktı: android/app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "🍏 iOS (Apple App Store):"
echo "   - Xcode'da açmak için: npm run open:ios"
echo "   - Xcode menüsünden: Product > Archive > Distribute App (TestFlight & App Store Connect)"
echo ""
echo "✨ AYZEK Mobil Dağıtım Paketi Başarıyla Hazırlandı!"
