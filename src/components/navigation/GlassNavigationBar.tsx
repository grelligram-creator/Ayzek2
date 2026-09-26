import React, { useState } from 'react';
import {
  Home,
  Calendar,
  Sparkles,
  MessageSquare,
  User,
  Bell,
  Heart,
  Share2,
  Grid,
  X,
  Scale,
  Smartphone,
  ShieldCheck,
  UserPlus,
  BookOpen,
  ArrowRight,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';

export type NavTab = 'home' | 'plan' | 'integrations' | 'chat' | 'social' | 'life' | 'profile';

interface GlassNavigationBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  onOpenMobileStore?: () => void;
  onOpenDecisionCopilot?: () => void;
  onOpenRelationshipAssistant?: () => void;
  onOpenOnboarding?: () => void;
  onOpenArchitecture?: () => void;
  onOpenAuth?: () => void;
}

export const GlassNavigationBar: React.FC<GlassNavigationBarProps> = ({
  activeTab,
  onTabChange,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onOpenMobileStore,
  onOpenDecisionCopilot,
  onOpenRelationshipAssistant,
  onOpenOnboarding,
  onOpenArchitecture,
  onOpenAuth,
}) => {
  const [isHubOpen, setIsHubOpen] = useState(false);

  // Check if a secondary view is currently active
  const isSecondaryActive =
    activeTab === 'life' ||
    activeTab === 'social' ||
    activeTab === 'integrations' ||
    activeTab === 'profile';

  const getSecondaryLabel = () => {
    switch (activeTab) {
      case 'life':
        return 'Yaşam';
      case 'social':
        return 'Sosyal';
      case 'integrations':
        return 'Entegre';
      case 'profile':
        return 'Profil';
      default:
        return 'Merkez';
    }
  };

  const handleSelectTab = (tabId: NavTab) => {
    onTabChange(tabId);
    setIsHubOpen(false);
  };

  const handleOpenAction = (actionFn?: () => void) => {
    setIsHubOpen(false);
    if (actionFn) actionFn();
  };

  return (
    <>
      {/* 4-Item Mobile-First Floating Glass Bar (Ergonomically spaced for 9:16 Screens) */}
      <nav
        aria-label="Ana Gezinti"
        className="fixed bottom-[max(14px,env(safe-area-inset-bottom,20px))] inset-x-0 z-40 flex justify-center px-3 pointer-events-none select-none"
      >
        <div className="pointer-events-auto w-full max-w-[340px] sm:max-w-sm flex items-center justify-between px-2 py-1.5 rounded-full bg-slate-950/90 backdrop-blur-2xl border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.75)]">
          {/* Item 1: Akış (Home Flow) */}
          <button
            onClick={() => handleSelectTab('home')}
            className={`relative flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-full transition-all duration-150 cursor-pointer min-h-[46px] ${
              activeTab === 'home'
                ? 'bg-white/10 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span className="text-[10px] mt-0.5 tracking-tight">Akış</span>
            {activeTab === 'home' && (
              <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
            )}
          </button>

          {/* Item 2: Plan (Timeline & Tasks) */}
          <button
            onClick={() => handleSelectTab('plan')}
            className={`relative flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-full transition-all duration-150 cursor-pointer min-h-[46px] ${
              activeTab === 'plan'
                ? 'bg-white/10 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === 'plan' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span className="text-[10px] mt-0.5 tracking-tight">Plan</span>
            {activeTab === 'plan' && (
              <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
            )}
          </button>

          {/* Item 3: Center Hero Action (AYZEK AI Dialogue) */}
          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={() => handleSelectTab('chat')}
              className={`relative -top-2.5 flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 cursor-pointer shadow-lg ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-tr from-cyan-400 via-sky-500 to-indigo-500 text-slate-950 shadow-[0_0_24px_rgba(6,182,212,0.65)] scale-110'
                  : 'bg-gradient-to-tr from-cyan-500 to-indigo-600 text-slate-950 hover:scale-105 shadow-[0_0_16px_rgba(6,182,212,0.4)]'
              }`}
              title="AYZEK Kişisel AI Sohbet & Sesli İletişim"
            >
              <MessageSquare className="w-5 h-5 fill-slate-950 stroke-[2.2]" />
              {activeTab === 'chat' ? (
                <span className="absolute -top-1 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#fff]" />
              ) : (
                <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_#67e8f9] animate-pulse" />
              )}
            </button>
          </div>

          {/* Item 4: Merkez / Menü (Hub Drawer for Secondary Tools) */}
          <button
            onClick={() => setIsHubOpen(!isHubOpen)}
            className={`relative flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-full transition-all duration-150 cursor-pointer min-h-[46px] ${
              isHubOpen || isSecondaryActive
                ? 'bg-white/10 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="AYZEK Kontrol Merkezi & Diğer Özellikler"
          >
            {isSecondaryActive ? (
              <Layers className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            ) : (
              <Grid className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8]" />
            )}
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">
              {getSecondaryLabel()}
            </span>

            {/* Notification or Active Indicator */}
            {unreadNotificationsCount > 0 ? (
              <span className="absolute top-1 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
            ) : isSecondaryActive || isHubOpen ? (
              <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
            ) : null}
          </button>
        </div>
      </nav>

      {/* Hub / Menü Bottom Drawer (Slide-up Sheet optimized for 9:16 Screens) */}
      {isHubOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-t-3xl bg-slate-900/95 border-t border-x border-white/15 p-4 sm:p-5 shadow-[0_-20px_50px_rgba(0,0,0,0.85)] pb-10 max-h-[85vh] overflow-y-auto space-y-4">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <div>
                  <span className="text-xs font-bold text-white tracking-wide uppercase block">
                    AYZEK Kontrol & Yaşam Merkezi
                  </span>
                  <span className="text-[10.5px] text-slate-400">
                    Kişisel Yaşam İşletim Sistemi Modülleri
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsHubOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SECTION 1: CORE LIFE MODULES */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block px-1">
                Ana Modüller
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* 1. Yaşam, Rutinler & Finans */}
                <button
                  onClick={() => handleSelectTab('life')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer group flex flex-col justify-between h-22 ${
                    activeTab === 'life'
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-sm'
                      : 'bg-slate-950/70 border-white/10 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block group-hover:text-cyan-300 transition-colors">
                      Yaşam & Finans
                    </span>
                    <span className="text-[10px] text-slate-400">Rutinler, belgeler, ödemeler</span>
                  </div>
                </button>

                {/* 2. Sosyal CRM & Vefa Takibi */}
                <button
                  onClick={() => handleSelectTab('social')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer group flex flex-col justify-between h-22 ${
                    activeTab === 'social'
                      ? 'bg-rose-950/40 border-rose-500/60 shadow-sm'
                      : 'bg-slate-950/70 border-white/10 hover:border-rose-500/40'
                  }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block group-hover:text-rose-300 transition-colors">
                      Sosyal & Vefa CRM
                    </span>
                    <span className="text-[10px] text-slate-400">Empati & hatır sorma</span>
                  </div>
                </button>

                {/* 3. Entegrasyonlar */}
                <button
                  onClick={() => handleSelectTab('integrations')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer group flex flex-col justify-between h-22 ${
                    activeTab === 'integrations'
                      ? 'bg-indigo-950/40 border-indigo-500/60 shadow-sm'
                      : 'bg-slate-950/70 border-white/10 hover:border-indigo-500/40'
                  }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block group-hover:text-indigo-300 transition-colors">
                      Entegrasyonlar Hub
                    </span>
                    <span className="text-[10px] text-slate-400">Teams, Gmail, WhatsApp</span>
                  </div>
                </button>

                {/* 4. Profil & pgvector Bellek */}
                <button
                  onClick={() => handleSelectTab('profile')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer group flex flex-col justify-between h-22 ${
                    activeTab === 'profile'
                      ? 'bg-slate-800/60 border-cyan-500/60 shadow-sm'
                      : 'bg-slate-950/70 border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-white/10 text-slate-200 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Profil & Hafıza</span>
                    <span className="text-[10px] text-slate-400">pgvector Bilgi Tabanı</span>
                  </div>
                </button>
              </div>
            </div>

            {/* SECTION 2: CRITICAL ASSISTANTS & TOOLS */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block px-1">
                Kritik Asistanlar & Mobil Araçlar
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* İkilem Çözücü */}
                <button
                  onClick={() => handleOpenAction(onOpenDecisionCopilot)}
                  className="p-3 rounded-2xl bg-slate-950/70 border border-amber-500/25 hover:border-amber-500/50 text-left transition-all cursor-pointer group flex flex-col justify-between h-22"
                >
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block group-hover:text-amber-300 transition-colors">
                      Karar Matrisi
                    </span>
                    <span className="text-[10px] text-slate-400">İkilem & Analiz Copilot</span>
                  </div>
                </button>

                {/* Mobil Yayın & Bildirim */}
                <button
                  onClick={() => handleOpenAction(onOpenMobileStore)}
                  className="p-3 rounded-2xl bg-slate-950/70 border border-emerald-500/25 hover:border-emerald-500/50 text-left transition-all cursor-pointer group flex flex-col justify-between h-22"
                >
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block group-hover:text-emerald-300 transition-colors">
                      Store & Bildirim
                    </span>
                    <span className="text-[10px] text-slate-400">Android/iOS Test & Yayın</span>
                  </div>
                </button>

                {/* Özel Gün & Sürpriz */}
                <button
                  onClick={() => handleOpenAction(onOpenRelationshipAssistant)}
                  className="p-3 rounded-2xl bg-slate-950/70 border border-rose-500/20 hover:border-rose-500/40 text-left transition-all cursor-pointer group flex flex-col justify-between h-22"
                >
                  <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block group-hover:text-rose-300 transition-colors">
                      Özel Gün & Hediye
                    </span>
                    <span className="text-[10px] text-slate-400">Sürpriz Sipariş Taslağı</span>
                  </div>
                </button>

                {/* Proaktif Olaylar */}
                <button
                  onClick={() => handleOpenAction(onOpenNotifications)}
                  className="p-3 rounded-2xl bg-slate-950/70 border border-cyan-500/20 hover:border-cyan-500/40 text-left transition-all cursor-pointer group flex flex-col justify-between h-22"
                >
                  <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block group-hover:text-cyan-300 transition-colors">
                      Proaktif Olaylar
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {unreadNotificationsCount} Bekleyen Uyarı
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Bottom Row: 2FA & Onboarding & Architecture */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <button
                onClick={() => handleOpenAction(onOpenAuth)}
                className="hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer py-1"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>2FA Güvenlik</span>
              </button>

              <button
                onClick={() => handleOpenAction(onOpenOnboarding)}
                className="hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer py-1"
              >
                <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Yaşam Senkronu</span>
              </button>

              <button
                onClick={() => handleOpenAction(onOpenArchitecture)}
                className="hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer py-1"
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>Mimari Şartname</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
