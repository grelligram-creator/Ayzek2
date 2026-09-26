import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Bell,
  Download,
  Share,
  CheckCircle2,
  AlertTriangle,
  Play,
  Clock,
  Sparkles,
  ShieldCheck,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  ChevronRight,
  AppWindow,
  Compass,
} from 'lucide-react';
import { GlassSheet } from '../design-system/GlassSheet';
import { GlassCard } from '../design-system/GlassCard';
import { notificationService } from '../../services/notificationService';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface MobileStorePublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerScenario?: (scenarioName: string) => void;
}

export const MobileStorePublishModal: React.FC<MobileStorePublishModalProps> = ({
  isOpen,
  onClose,
  onTriggerScenario,
}) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'publish' | 'install'>('notifications');
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [lastSentText, setLastSentText] = useState<string | null>(null);

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, [isOpen]);

  const handleRequestPermissionAndTest = async (preset?: { title: string; body: string; tag: string }) => {
    const perm = await notificationService.requestPermission();
    setPermission(perm);

    const title = preset?.title || '🎙️ AYZEK: Sabah 07:45 Sesli Brifingi Hazır';
    const body =
      preset?.body ||
      "Günaydın Görkem, bugün Levent'te 2 kritik toplantın var. Saat 14:00 Teams öncesi 30 dk hazırlık bloklandı. Moda 22°C.";

    await notificationService.sendNotification({
      id: `test-${Date.now()}`,
      title,
      body,
      tag: preset?.tag || 'ayzek-test',
    });

    setLastSentText(title);
    setTimeout(() => setLastSentText(null), 4000);
  };

  const handleDelayedNotification = (seconds = 10) => {
    setCountdown(seconds);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    notificationService.scheduleNotification(
      {
        id: `delayed-${Date.now()}`,
        title: '🛡️ AYZEK Bilişsel Yük Kalkanı Uyarısı (%84)',
        body: 'Son 4 saattir aralıksız toplantıdasın. Saat 16:30 esnek toplantısını erteleyip 20 dk kahve/nefes molası bloklamayı öneriyorum.',
        tag: 'burnout-shield',
      },
      seconds
    );
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(key);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  return (
    <GlassSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Mobil Deneyim & Store Dağıtım Merkezi"
      subtitle="Android & iOS Proaktif Bildirim Testi, Play Store ve App Store Yayın Hazırlığı"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-2 px-2.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'notifications'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>1. Bildirim Testi</span>
          </button>

          <button
            onClick={() => setActiveTab('install')}
            className={`flex-1 py-2 px-2.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'install'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>2. Telefona Yükle (PWA)</span>
          </button>

          <button
            onClick={() => setActiveTab('publish')}
            className={`flex-1 py-2 px-2.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'publish'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AppWindow className="w-3.5 h-3.5" />
            <span>3. Play & App Store</span>
          </button>
        </div>

        {/* TAB 1: REAL PROACTIVE NOTIFICATION TEST */}
        {activeTab === 'notifications' && (
          <div className="space-y-3.5 animate-fade-in">
            {/* Status Card */}
            <GlassCard className="p-4 border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Sistem Bildirim İzin Durumu</h3>
                    <p className="text-[11px] text-slate-400">
                      Android (Chrome/Edge) ve iOS (Safari PWA 16.4+)
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] px-2.5 py-1 rounded-full font-mono font-bold border ${
                    permission === 'granted'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : permission === 'denied'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {permission === 'granted'
                    ? 'İzin Verildi (Aktif)'
                    : permission === 'denied'
                    ? 'Engellendi'
                    : 'İzin Bekleniyor'}
                </span>
              </div>

              {lastSentText && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sistem bildirimi ve ses sinyali başarıyla cihazınıza iletildi!</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  onClick={() => handleRequestPermissionAndTest()}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Anında Proaktif Test Bildirimi Gönder</span>
                </button>

                <button
                  onClick={() => handleDelayedNotification(10)}
                  disabled={countdown !== null}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Ekranı kilitleyip bildirim alma testi"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {countdown !== null
                      ? `${countdown} Sn Sonra Gelecek (Ekranı Kilitle)`
                      : '10 Sn Sonra Gönder (Kilit Ekranı Testi)'}
                  </span>
                </button>
              </div>
            </GlassCard>

            {/* Test Specific Life Scenarios */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                AYZEK Gerçek Yaşam Senaryolarını Tetikle:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() =>
                    handleRequestPermissionAndTest({
                      title: '🎙️ 07:45 Sabah Sesli Brifingi Hazır',
                      body: 'Levent mesainde 2 kritik toplantı var. Saat 14:00 öncesi 30 dk hazırlık bloklandı.',
                      tag: 'morning-briefing',
                    })
                  }
                  className="p-3 rounded-xl bg-slate-950/70 border border-white/10 hover:border-cyan-500/40 text-left transition-all cursor-pointer group"
                >
                  <span className="font-bold text-cyan-300 block">1. Sabah Sesli Brifingi</span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block leading-tight">
                    07:45 hava durumu, Levent toplantıları & keten gömlek önerisi.
                  </span>
                </button>

                <button
                  onClick={() =>
                    handleRequestPermissionAndTest({
                      title: '🛡️ Bilişsel Yük Kalkanı (%84)',
                      body: '4 saattir toplantıdasın. Saat 16:30 esnek toplantısını yarına kaydırıp 20 dk mola açalım.',
                      tag: 'burnout-shield',
                    })
                  }
                  className="p-3 rounded-xl bg-slate-950/70 border border-white/10 hover:border-indigo-500/40 text-left transition-all cursor-pointer group"
                >
                  <span className="font-bold text-indigo-300 block">2. Tükenmişlik Kalkanı</span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block leading-tight">
                    Aşırı zihinsel yükte toplantı erteleme ve nefes molası önerisi.
                  </span>
                </button>

                <button
                  onClick={() =>
                    handleRequestPermissionAndTest({
                      title: '🌸 Vefa Sinyali: Annem Fatma Hanım',
                      body: '4 gün önce tansiyonundan bahsetmişti; iş çıkışında 5 dk aramak harika hissettirir.',
                      tag: 'empathy-crm',
                    })
                  }
                  className="p-3 rounded-xl bg-slate-950/70 border border-white/10 hover:border-rose-500/40 text-left transition-all cursor-pointer group"
                >
                  <span className="font-bold text-rose-300 block">3. Vefa & Empati Hatırlatması</span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block leading-tight">
                    Tansiyon takibi ve doğum günü öncesi içten hatır sorma uyarısı.
                  </span>
                </button>

                <button
                  onClick={() =>
                    handleRequestPermissionAndTest({
                      title: '🤖 Söz Takipçisi: Zeynep İçin Market',
                      body: 'Akşam eve dönerken organik laktozsuz süt ve kahve alacağını not etmiştin. İş çıkışı 15 dk kala.',
                      tag: 'commitment-tracker',
                    })
                  }
                  className="p-3 rounded-xl bg-slate-950/70 border border-white/10 hover:border-emerald-500/40 text-left transition-all cursor-pointer group"
                >
                  <span className="font-bold text-emerald-300 block">4. Söz Takipçisi Bildirimi</span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block leading-tight">
                    WhatsApp konuşmasından yakalanan taahhüt saati geldiğinde uyarır.
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TELEFONA YÜKLE (PWA INSTALL FLOW) */}
        {activeTab === 'install' && (
          <div className="space-y-3.5 animate-fade-in">
            <GlassCard className="p-4 border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Telefona Doğrudan Yükleme</h3>
                    <p className="text-[11px] text-slate-400">
                      Uygulama Mağazası beklemeden anında tam ekran uygulama deneyimi
                    </p>
                  </div>
                </div>

                {isInstalled && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                    Yüklü · Standalone
                  </span>
                )}
              </div>

              {/* Install trigger button */}
              {isInstallable && (
                <button
                  onClick={install}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  <span>AYZEK'i Telefona Yükle (Tek Tıkla Kurulum)</span>
                </button>
              )}

              {/* iOS Safari Guide */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 space-y-2 text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Share className="w-3.5 h-3.5 text-cyan-400" />
                  iPhone / iPad (iOS Safari) Kurulum Adımları:
                </span>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1 text-[11.5px]">
                  <li>Safari alt menüsündeki <strong>Paylaş (Share)</strong> simgesine dokunun.</li>
                  <li>Aşağı kaydırıp <strong>"Ana Ekrana Ekle" (Add to Home Screen)</strong> seçin.</li>
                  <li>Sağ üstteki <strong>"Ekle"</strong> butonuna basın.</li>
                </ol>
                <p className="text-[10.5px] text-cyan-300/80 pt-1">
                  💡 iOS 16.4+ ile birlikte Ana Ekrana eklenen AYZEK, kilit ekranında gerçek Proaktif Bildirim gönderme yeteneğine kavuşur.
                </p>
              </div>

              {/* Android Chrome Guide */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 space-y-1.5 text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  Android (Chrome / Samsung Internet) Kurulumu:
                </span>
                <p className="text-[11.5px] text-slate-300">
                  Tarayıcınızın sağ üstündeki üç noktaya dokunun ve <strong>"Uygulamayı Yükle"</strong> seçeneğini seçin. Otomatik APK paketi oluşturulup ana ekranınıza eklenir.
                </p>
              </div>
            </GlassCard>
          </div>
        )}

        {/* TAB 3: PLAY STORE & APP STORE PUBLISHING */}
        {activeTab === 'publish' && (
          <div className="space-y-3.5 animate-fade-in">
            <GlassCard className="p-4 border-indigo-500/30 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <AppWindow className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Google Play & Apple App Store Paketleme</h3>
                  <p className="text-[11px] text-slate-400">
                    Proje Capacitor / TWA yapılandırmasıyla mağaza submission'ına hazırlandı
                  </p>
                </div>
              </div>

              {/* Android Play Store Commands */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <span>🤖 Google Play Store (Android AAB / APK)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                      android/ Hazır ✓
                    </span>
                  </span>
                  <button
                    onClick={() =>
                      handleCopy('android-cmd', 'npm run build:android && npm run open:android')
                    }
                    className="text-[10.5px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCmd === 'android-cmd' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Kopyalandı</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Komutları Kopyala</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-200 border border-white/10 overflow-x-auto">
                  <code>npm run build:android && npm run open:android</code>
                </div>
                <p className="text-[10.5px] text-slate-400">
                  Android Studio doğrudan açılır; <strong>Build &gt; Generate Signed Bundle / APK</strong> diyerek Google Play Console'a yükleyeceğiniz `.aab` dosyasını tek tıkla üretebilirsiniz. (Terminalden direkt üretim: <code>cd android && ./gradlew bundleRelease</code>)
                </p>
              </div>

              {/* iOS App Store Commands */}
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                    <span>🍏 Apple App Store (iOS Archive & TestFlight)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                      ios/ Hazır ✓
                    </span>
                  </span>
                  <button
                    onClick={() =>
                      handleCopy('ios-cmd', 'npm run build:ios && npm run open:ios')
                    }
                    className="text-[10.5px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCmd === 'ios-cmd' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Kopyalandı</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Komutları Kopyala</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-200 border border-white/10 overflow-x-auto">
                  <code>npm run build:ios && npm run open:ios</code>
                </div>
                <p className="text-[10.5px] text-slate-400">
                  Xcode doğrudan açılır; <strong>Product &gt; Archive</strong> seçeneği ile TestFlight ve App Store Connect'e tek tıkla gönderilir.
                </p>
              </div>

              {/* App Configuration Specs */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Package ID:</span>
                  <span className="text-cyan-300 font-mono font-bold">com.ayzek.personalai</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Uygulama Adı:</span>
                  <span className="text-white font-medium">AYZEK</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Hedef Ekran:</span>
                  <span className="text-slate-200 font-mono">9:16 Portrait (Mobile)</span>
                </div>
                <div>
                  <span className="text-slate-400 block">PWA Manifest:</span>
                  <span className="text-emerald-400 font-mono">Doğrulandı ✓</span>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </GlassSheet>
  );
};
