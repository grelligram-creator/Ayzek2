import React from 'react';
import {
  Sparkles,
  ShoppingBag,
  CreditCard,
  Heart,
  Clock,
  ArrowRight,
  Zap,
  UserPlus,
  PenTool,
  Compass,
  Share2,
  Scale,
  Smartphone,
  Bell,
} from 'lucide-react';
import { UserProfile, TaskItem, NotificationAlert } from '../../types/ayzek';
import { GlassCard } from '../design-system/GlassCard';
import { GlassButton } from '../design-system/GlassButton';
import { WellnessCoachCard } from '../wellness/WellnessCoachCard';
import { CycleTrackerCard } from '../wellness/CycleTrackerCard';
import { MentorGrowthCard } from '../mentorship/MentorGrowthCard';
import { LifeCoachNotesCard } from '../mentorship/LifeCoachNotesCard';
import { DailyMoodCard } from './DailyMoodCard';
import { MicroHabitsDashboard } from './MicroHabitsDashboard';
import { SocialRelationshipsCard } from '../social/SocialRelationshipsCard';
import { AudioDailyBriefing } from '../lifestyle/AudioDailyBriefing';
import { BurnoutShieldCard } from '../lifestyle/BurnoutShieldCard';
import { CommitmentTrackerCard } from '../lifestyle/CommitmentTrackerCard';
import { EnergyLevel, MoodFeeling, FocusLevel, PersonProfile } from '../../types/ayzek';

interface HomeViewProps {
  profile: UserProfile;
  tasks: TaskItem[];
  notifications: NotificationAlert[];
  people?: PersonProfile[];
  onNavigateTab: (tab: 'home' | 'plan' | 'integrations' | 'social' | 'chat' | 'life' | 'profile') => void;
  onQuickPrompt: (prompt: string) => void;
  onOpenSimulator: () => void;
  onOpenRelationshipAssistant: () => void;
  onOpenOnboarding: () => void;
  onOpenDecisionCopilot?: () => void;
  onOpenMobileStore?: () => void;
  onDecompressSchedule?: () => void;
  onAddPlanTask?: (title: string, preferredTime: string, category: string) => void;
  onAddWalkingTask: () => void;
  isWalkingTaskAdded?: boolean;
  onUpdateCycle: (data: { isEnabled?: boolean; lastPeriodDate?: string; cycleLengthDays?: number }) => Promise<void>;
  onAddCycleTask: (title: string, preferredTime: string) => void;
  isCycleTaskAdded?: boolean;
  onAcceptMicroHabit: (goalId: string, title: string) => void;
  isMentorTaskAdded?: boolean;
  onUpdateGoalProgress?: (goalId: string, newProgress: number) => Promise<void>;
  onSaveMood?: (data: { energyLevel: EnergyLevel; moodFeeling: MoodFeeling; focusLevel: FocusLevel; note?: string }) => Promise<void>;
  onOptimizePlanForMood?: () => Promise<void>;
}

export const HomeView: React.FC<HomeViewProps> = ({
  profile,
  tasks,
  notifications,
  people = [],
  onNavigateTab,
  onQuickPrompt,
  onOpenSimulator,
  onOpenRelationshipAssistant,
  onOpenOnboarding,
  onOpenDecisionCopilot,
  onOpenMobileStore,
  onDecompressSchedule,
  onAddPlanTask,
  onAddWalkingTask,
  isWalkingTaskAdded = false,
  onUpdateCycle,
  onAddCycleTask,
  isCycleTaskAdded = false,
  onAcceptMicroHabit,
  isMentorTaskAdded = false,
  onUpdateGoalProgress,
  onSaveMood,
  onOptimizePlanForMood,
}) => {
  // Time contextual greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? 'Günaydın ☀️'
      : hour < 17
      ? 'Tünaydın 🌤️'
      : hour < 22
      ? 'İyi akşamlar 🌙'
      : 'Huzurlu geceler ✨';

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const shoppingTask = pendingTasks.find((t) => t.category === 'shopping') || pendingTasks[0];
  const latestProactive = notifications[0];

  return (
    <div className="flex flex-col gap-6 pb-24 max-w-xl mx-auto w-full">
      {/* Editorial Header */}
      <div className="pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
            AYZEK Kişisel Yaşam Asistanı & Mentör
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenOnboarding}
              className="text-xs text-slate-300 hover:text-cyan-300 flex items-center gap-1 transition-colors px-2.5 py-1 rounded-full bg-white/5 border border-white/10 cursor-pointer"
              title="AYZEK ile Yaşam Senkronizasyonu Sihirbazı"
            >
              <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Yaşam Senkronu</span>
            </button>
            <button
              onClick={onOpenSimulator}
              className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
              title="Proaktif Karar Motoru Simülatörü"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Proaktif Test</span>
            </button>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 mt-1">
          {greeting}, {profile.name}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Bugün senin için bilmen gereken en önemli 3 konu:
        </p>

        {/* 9:16 Mobile Ergonomic Quick-Jump Pills */}
        <div className="w-full flex items-center gap-1.5 overflow-x-auto pb-1 mt-3 no-scrollbar text-xs select-none">
          <button
            onClick={() => {
              const el = document.getElementById('section-audio-briefing');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="shrink-0 px-2.5 py-1.5 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 font-medium transition-all cursor-pointer"
          >
            <span>🎙️ 07:45 Brifing</span>
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('section-burnout-shield');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="shrink-0 px-2.5 py-1.5 rounded-full bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 font-medium transition-all cursor-pointer"
          >
            <span>🛡️ Kalkan %84</span>
          </button>

          <button
            onClick={onOpenDecisionCopilot}
            className="shrink-0 px-2.5 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-medium transition-all cursor-pointer"
          >
            <span>⚖️ Karar Matrisi</span>
          </button>

          <button
            onClick={onOpenRelationshipAssistant}
            className="shrink-0 px-2.5 py-1.5 rounded-full bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 flex items-center gap-1 font-medium transition-all cursor-pointer"
          >
            <span>🌸 Vefa & Annem</span>
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('section-commitment-tracker');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="shrink-0 px-2.5 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-medium transition-all cursor-pointer"
          >
            <span>🤖 Sözler (3)</span>
          </button>

          <button
            onClick={onOpenMobileStore}
            className="shrink-0 px-2.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 flex items-center gap-1 font-medium transition-all cursor-pointer"
          >
            <span>📱 Store & Test</span>
          </button>
        </div>
      </div>

      {/* Entegrasyonlar & İş-Özel Hayat Dengesi Mini-Hub */}
      <GlassCard className="p-4 border-cyan-500/25 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">İş & Özel Hayat Dengesi</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  Dengeli · %78
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Teams, Gmail, Meet, Zoom, Takvimler, WhatsApp & Telegram aktif
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('integrations')}
            className="text-xs px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10 flex items-center gap-1 transition-all cursor-pointer shrink-0"
          >
            <span>Yönet</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-white/10">
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 font-medium">
            Teams: 2 Toplantı
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/20 font-medium">
            Gmail: E-Fatura Aksiyonu
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 font-medium">
            WhatsApp: Konuşma Analizi
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/20 font-medium">
            Smart Guard: 18:00 Koruma
          </span>
        </div>
      </GlassCard>

      {/* Bugün Nasılsın? Günlük Mod (Enerji, Mutluluk, Odak) Etkileşimli Kartı */}
      <DailyMoodCard
        currentMood={profile.dailyMood}
        onSaveMood={onSaveMood || (async () => {})}
        onOptimizePlanForMood={onOptimizePlanForMood}
        onOpenChatWithPrompt={onQuickPrompt}
      />

      {/* Günlük Tek Tıkla Tamamlanan Mikro-Alışkanlıklar Mini-Dashboard'u */}
      <MicroHabitsDashboard onOpenChatWithPrompt={onQuickPrompt} />

      {/* 📱 Mobil 9:16 Store Dağıtımı & Proaktif Bildirim Merkezi */}
      <GlassCard className="p-4 border-emerald-500/30 relative overflow-hidden bg-gradient-to-br from-slate-900/85 via-emerald-950/20 to-slate-950/85 shadow-md space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-white">Mobil Store & Proaktif Bildirim</h3>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30 font-bold">
                  Android & iOS 9:16
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Play Store, App Store hazır paket & kilit ekranı proaktif bildirim motoru
              </p>
            </div>
          </div>

          <button
            onClick={onOpenMobileStore}
            className="text-xs px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 shadow-sm"
          >
            <span>Yayın & Test</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-white/10 text-xs flex-wrap gap-2">
          <span className="text-[11px] text-slate-300 flex items-center gap-1">
            <Bell className="w-3.5 h-3.5 text-cyan-400" />
            <span>Kilit Ekranı Bildirim Testi & PWA Doğrulandı</span>
          </span>

          <button
            onClick={onOpenMobileStore}
            className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer ml-auto"
          >
            <span>Test Bildirimi Gönder →</span>
          </button>
        </div>
      </GlassCard>

      {/* 1. 🎙️ 60 Saniyelik Sabah & Akşam Sesli Brifingi (AI Audio Digest) */}
      <div id="section-audio-briefing">
        <AudioDailyBriefing
          userName={profile.name}
          onOpenChatWithPrompt={onQuickPrompt}
          onAddPlanTask={onAddPlanTask}
        />
      </div>

      {/* 2. 🛡️ Bilişsel Yük & Tükenmişlik Kalkanı (Burnout & Overwhelm Shield) */}
      <div id="section-burnout-shield">
        <BurnoutShieldCard
          onDecompressSchedule={onDecompressSchedule}
          onOpenChatWithPrompt={onQuickPrompt}
        />
      </div>

      {/* 5. 🤖 "Kime Ne Söz Verdim?" Taahhüt Takipçisi (Commitment Tracker) */}
      <div id="section-commitment-tracker">
        <CommitmentTrackerCard
          onAddPlanTask={onAddPlanTask}
          onOpenChatWithPrompt={onQuickPrompt}
        />
      </div>

      {/* 4. ⚖️ İkilem Çözücü & Karar Matrisi (Dilemma & Decision Copilot Card) */}
      <GlassCard className="p-4 border-amber-500/30 relative overflow-hidden bg-gradient-to-br from-slate-900/80 via-amber-950/20 to-slate-950/80 shadow-md space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-white">İkilem Çözücü & Karar Matrisi</h3>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                  Psikolog & Stratejist
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Hedeflerine, bütçene ve değerlerine göre artı-eksi analiz tablosu
              </p>
            </div>
          </div>

          <button
            onClick={onOpenDecisionCopilot}
            className="text-xs px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-slate-950 font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 shadow-sm"
          >
            <span>Karar Matrisi</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-white/10 text-xs">
          <button
            onClick={onOpenDecisionCopilot}
            className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 hover:border-amber-500/40 text-left transition-all text-slate-300 flex items-center justify-between cursor-pointer group"
          >
            <span className="text-[11px] font-medium group-hover:text-amber-200">
              "Grispi'den başka şirkete geçmeli miyim?"
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold ml-1">
              %88 Uyum
            </span>
          </button>
          <button
            onClick={onOpenDecisionCopilot}
            className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 hover:border-amber-500/40 text-left transition-all text-slate-300 flex items-center justify-between cursor-pointer group"
          >
            <span className="text-[11px] font-medium group-hover:text-amber-200">
              "Bu arabayı şimdi almalı mıyım?"
            </span>
            <span className="text-[10px] text-cyan-400 font-mono font-bold ml-1">
              %92 Yatırım
            </span>
          </button>
        </div>
      </GlassCard>

      {/* Proactive Live Alert (Contextual Hero Card) */}
      {latestProactive && (
        <GlassCard variant="accent" className="p-4 sm:p-5 relative">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wide">
                  AYZEK Proaktif Hatırlatma
                </span>
                <span className="text-[11px] text-slate-400">Şimdi</span>
              </div>
              <p className="text-sm font-medium text-slate-100 mt-1 leading-snug">
                {latestProactive.body}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <GlassButton
                  size="sm"
                  variant="primary"
                  onClick={() => onQuickPrompt('Akşam market alışverişi listesini aç')}
                >
                  Listeyi Gör
                </GlassButton>
                <GlassButton
                  size="sm"
                  variant="ghost"
                  onClick={() => onQuickPrompt('Bugün markete gitmeyeceğim, görevi sil')}
                >
                  Gitmeyeceğim
                </GlassButton>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* The 3 Core Focal Items */}
      <div className="flex flex-col gap-2.5">
        {/* Focal 1: Next Pending Contextual Task */}
        <GlassCard
          variant="default"
          interactive
          onClick={() => onNavigateTab('plan')}
          className="p-4 flex items-center justify-between gap-3 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-200">
                  17:45 · Market Alışverişi
                </span>
                <span className="text-[10px] text-slate-400">
                  İş Çıkışı · 15 dk kala
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {shoppingTask?.title || 'Süt, yumurta ve kahve alımı'}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
        </GlassCard>

        {/* Focal 2: Urgent Payment Due */}
        <GlassCard
          variant="default"
          interactive
          onClick={() => onNavigateTab('life')}
          className="p-4 flex items-center justify-between gap-3 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-200">
                  Yarın · Elektrik Faturası
                </span>
                <span className="text-[10px] text-amber-400 font-medium">
                  780 TL Son Gün
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Enerjisa fatura ödeme hatırlatıcısı aktif
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
        </GlassCard>

        {/* Focal 3: Special Date & Memory Copilot Action */}
        <GlassCard
          variant="default"
          interactive
          onClick={onOpenRelationshipAssistant}
          className="p-4 flex items-center justify-between gap-3 group border-rose-500/20 hover:border-rose-500/40"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-200">
                  4 Gün Kaldı · Annemin Doğum Günü
                </span>
                <span className="text-[10px] text-rose-400 font-medium">28 Eylül</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Anılardan üretilen mektup taslağını ve hediye planını gör 🎁
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-rose-400 font-medium">
            <PenTool className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mesaj Hazırla</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </GlassCard>
      </div>

      {/* Sosyal Çevre & Psikolog Karakter Analizleri Kartı */}
      <SocialRelationshipsCard
        people={people}
        onNavigateToSocial={() => onNavigateTab('social')}
        onOpenChatWithPrompt={onQuickPrompt}
      />

      {/* Motive Edici 'Yaşam Koçu Notları' Kartı (Profil Verisindeki Hedeflerle Senkronize) */}
      <LifeCoachNotesCard
        goals={profile.longTermGoals || []}
        onAcceptMicroHabit={onAcceptMicroHabit}
        onOpenChatWithPrompt={onQuickPrompt}
        onUpdateGoalProgress={onUpdateGoalProgress}
        isTaskAdded={isMentorTaskAdded}
      />

      {/* Routine & Day Overview Snapshot */}
      <GlassCard variant="subtle" className="p-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Bugünkü Rutin & Zaman Dağılımı
          </span>
          <span className="text-[11px] text-slate-400">
            {profile.workStartTime} - {profile.workEndTime} Mesai
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
          <div className="p-2.5 rounded-xl bg-slate-900/50 border border-white/5">
            <span className="text-[10px] text-slate-400 block">Tamamlanan</span>
            <span className="text-sm font-bold text-emerald-400 mt-0.5 block">2 Görev</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/50 border border-white/5">
            <span className="text-[10px] text-slate-400 block">Kalan İş</span>
            <span className="text-sm font-bold text-cyan-300 mt-0.5 block">2 Görev</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/50 border border-white/5">
            <span className="text-[10px] text-slate-400 block">Akşam Boşluğu</span>
            <span className="text-sm font-bold text-indigo-300 mt-0.5 block">~50 Dk</span>
          </div>
        </div>
      </GlassCard>

      {/* Biyolojik Ritim & Kadın Hormonal Döngü Takibi (Eğer aktifse) */}
      {profile.cycleTracking?.isEnabled && (
        <CycleTrackerCard
          cycleTracking={profile.cycleTracking}
          onUpdateCycle={onUpdateCycle}
          onAddCycleTask={onAddCycleTask}
          isTaskAdded={isCycleTaskAdded}
        />
      )}

      {/* Uzun Vadeli Yaşam Koçu & Bilge Mentörlük Kartı (İngilizce / Kariyer) */}
      <MentorGrowthCard
        goals={profile.longTermGoals || []}
        onAcceptMicroHabit={onAcceptMicroHabit}
        onOpenChatWithPrompt={onQuickPrompt}
        isTaskAdded={isMentorTaskAdded}
      />

      {/* Nazik Form & Kilo Rehberi (Empathetic, Guilt-Free Wellness Coach) */}
      <WellnessCoachCard
        onAddWalkingTask={onAddWalkingTask}
        isTaskAdded={isWalkingTaskAdded}
      />

      {/* Fast AYZEK Interaction Triggers */}
      <div>
        <span className="text-xs font-medium text-slate-400 block mb-2">
          AYZEK ile Hızlı İletişim & Çıkarımlar:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onQuickPrompt('İngilizcemi geliştirmek için bu hafta nasıl bir plan yapalım?')}
            className="px-3 py-2 rounded-xl bg-slate-900/70 border border-cyan-500/30 hover:border-cyan-400 text-xs text-cyan-200 transition-all cursor-pointer hover:bg-slate-800"
          >
            🧭 "İngilizce için mentör planı yap"
          </button>
          <button
            onClick={() => onQuickPrompt('Döngümün foliküler evresine göre bugünü nasıl değerlendirmeliyim?')}
            className="px-3 py-2 rounded-xl bg-slate-900/70 border border-rose-500/30 hover:border-rose-400 text-xs text-rose-200 transition-all cursor-pointer hover:bg-slate-800"
          >
            🌸 "Döngüme göre gün tavsiyesi"
          </button>
          <button
            onClick={() => onQuickPrompt('Anneme doğum günü mesajı hazırla')}
            className="px-3 py-2 rounded-xl bg-slate-900/70 border border-rose-500/30 hover:border-rose-400 text-xs text-rose-200 transition-all cursor-pointer hover:bg-slate-800"
          >
            💌 "Anneme doğum günü mektubu hazırla"
          </button>
          <button
            onClick={() => onQuickPrompt('Zeynep ile kaliteli vakit geçirme sürprizi planla')}
            className="px-3 py-2 rounded-xl bg-slate-900/70 border border-indigo-500/30 hover:border-indigo-400 text-xs text-indigo-200 transition-all cursor-pointer hover:bg-slate-800"
          >
            🎁 "Zeynep için sürpriz planı hazırla"
          </button>
        </div>
      </div>
    </div>
  );
};
