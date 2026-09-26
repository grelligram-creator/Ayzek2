import React, { useState } from 'react';
import {
  Brain,
  Trash2,
  Shield,
  Clock,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Eye,
  Sliders,
  AlertTriangle,
  Sun,
  Moon,
  Heart,
  Compass,
  Target,
  Plus,
  ChevronRight,
} from 'lucide-react';
import { Memory, UserProfile, MemoryType, LongTermGrowthGoal } from '../../types/ayzek';
import { GlassCard } from '../design-system/GlassCard';
import { GlassButton } from '../design-system/GlassButton';
import { GlassSheet } from '../design-system/GlassSheet';
import { GlassInput } from '../design-system/GlassInput';

interface ProfileViewProps {
  profile: UserProfile;
  memories: Memory[];
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onForgetMemory: (id: string) => void;
  onClearAllMemories: () => void;
  onOpenArchitecture: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  memories,
  onUpdateProfile,
  onForgetMemory,
  onClearAllMemories,
  onOpenArchitecture,
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isEditingRoutines, setIsEditingRoutines] = useState(false);
  const [wakeTime, setWakeTime] = useState(profile.wakeTime);
  const [sleepTime, setSleepTime] = useState(profile.sleepTime);
  const [workStartTime, setWorkStartTime] = useState(profile.workStartTime);
  const [workEndTime, setWorkEndTime] = useState(profile.workEndTime);
  const [commStyle, setCommStyle] = useState(profile.communicationStyle);
  const [notifFreq, setNotifFreq] = useState(profile.notificationFrequency);
  const [gender, setGender] = useState(profile.gender || 'female');
  const [isCycleEnabled, setIsCycleEnabled] = useState(profile.cycleTracking?.isEnabled ?? true);
  const [cycleLength, setCycleLength] = useState(profile.cycleTracking?.cycleLengthDays ?? 28);
  const [lastPeriodDate, setLastPeriodDate] = useState(profile.cycleTracking?.lastPeriodDate ?? '2026-09-17');
  const [isAddingGoalModal, setIsAddingGoalModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState<'language' | 'career' | 'wellness' | 'finance' | 'personal'>('language');
  const [newGoalHorizon, setNewGoalHorizon] = useState('6 Ay');
  const [newGoalWhy, setNewGoalWhy] = useState('');
  const [newGoalMicroHabit, setNewGoalMicroHabit] = useState('');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    const newGoal: LongTermGrowthGoal = {
      id: `ltg-${Date.now()}`,
      title: newGoalTitle.trim(),
      category: newGoalCategory,
      targetHorizon: newGoalHorizon,
      whyItMatters: newGoalWhy.trim() || 'Kişisel vizyon ve gelişim adımı.',
      currentProgress: 10,
      mentorWeeklyCheckIn: `${newGoalTitle.trim()} için bu hafta 15 dakikalık bir pratik planlayalım mı?`,
      suggestedMicroHabit: newGoalMicroHabit.trim() || 'Haftada 3 gün 15 dk odaklanma pratiği.',
      lastCheckedInDate: new Date().toISOString().slice(0, 10),
    };

    const updatedGoals = [...(profile.longTermGoals || []), newGoal];
    onUpdateProfile({ longTermGoals: updatedGoals });
    setIsAddingGoalModal(false);
    setNewGoalTitle('');
    setNewGoalWhy('');
    setNewGoalMicroHabit('');
  };

  const handleUpdateGoalProgressInProfile = (goalId: string, delta: number) => {
    const updatedGoals = (profile.longTermGoals || []).map((g) => {
      if (g.id === goalId) {
        const nextProgress = Math.min(100, Math.max(0, g.currentProgress + delta));
        return { ...g, currentProgress: nextProgress };
      }
      return g;
    });
    onUpdateProfile({ longTermGoals: updatedGoals });
  };

  const filteredMemories = memories.filter((m) => {
    if (!m.isActive) return false;
    if (selectedType === 'all') return true;
    return m.type === selectedType;
  });

  const handleSaveRoutines = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      wakeTime,
      sleepTime,
      workStartTime,
      workEndTime,
      communicationStyle: commStyle,
      notificationFrequency: notifFreq,
      gender,
      cycleTracking: {
        ...profile.cycleTracking,
        isEnabled: isCycleEnabled,
        cycleLengthDays: Number(cycleLength),
        lastPeriodDate,
      },
    });
    setIsEditingRoutines(false);
  };

  const handleThemeToggle = (newTheme: 'dark' | 'light') => {
    onUpdateProfile({ theme: newTheme });
  };

  const memoryTypeLabels: Record<string, string> = {
    ROUTINE: 'Rutin',
    PREFERENCE: 'Tercih',
    RELATIONSHIP: 'İlişki & Yakın',
    SHOPPING: 'Alışveriş',
    WELLNESS: 'Sağlık & Spor',
    CYCLE_HORMONAL: 'Hormon & Döngü',
    VEHICLE: 'Araç',
    TEMPORARY_CONTEXT: 'Geçici Bağlam',
    FINANCIAL: 'Finans',
  };

  return (
    <div className="flex flex-col gap-6 pb-24 max-w-xl mx-auto w-full">
      {/* Editorial Header */}
      <div className="flex items-start justify-between gap-4 pt-2">
        <div>
          <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5" />
            Uzun Vadeli Hafıza & Profil
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 mt-1">
            Hafıza & Yaşam Ayarları
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            AYZEK'in senin hakkında bildiği tüm bağlamları şeffafça incele veya unuttur.
          </p>
        </div>

        <GlassButton
          size="sm"
          variant="secondary"
          onClick={onOpenArchitecture}
          className="shrink-0 text-xs"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Sistem Mimarisi
        </GlassButton>
      </div>

      {/* Routine & Persona Summary Card */}
      <GlassCard variant="accent" className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] text-cyan-300 font-semibold uppercase">
              Tanımlı Rutinler & Mentörlük
            </span>
            <h3 className="text-sm font-bold text-slate-100 mt-0.5">
              {profile.name} · Mesai ({profile.workStartTime} - {profile.workEndTime})
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Uyanış: {profile.wakeTime} · Uyku: {profile.sleepTime} · Ton: {commStyle === 'wise_mentor' ? 'Bilge Mentör' : 'Samimi'}
            </p>
          </div>
          <GlassButton
            size="sm"
            variant="ghost"
            onClick={() => setIsEditingRoutines(true)}
            className="text-cyan-300 hover:text-white"
          >
            <Sliders className="w-3.5 h-3.5" />
            Düzenle
          </GlassButton>
        </div>
      </GlassCard>

      {/* Devam Eden Uzun Vadeli Hedefler (Yaşam Koçu Senkronu) */}
      <GlassCard variant="default" className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                Devam Eden Uzun Vadeli Hedefler ({profile.longTermGoals?.length || 0})
              </h3>
              <p className="text-[10px] text-slate-400">
                Anasayfadaki "Yaşam Koçu Notları" kartıyla anlık senkronizedir.
              </p>
            </div>
          </div>

          <GlassButton
            size="sm"
            variant="ghost"
            onClick={() => setIsAddingGoalModal(true)}
            className="text-xs text-cyan-300 hover:text-white gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Hedef Ekle
          </GlassButton>
        </div>

        <div className="space-y-2.5">
          {(profile.longTermGoals || []).map((goal) => (
            <div
              key={goal.id}
              className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-200">
                  {goal.title}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    %{goal.currentProgress}
                  </span>
                  <button
                    onClick={() => handleUpdateGoalProgressInProfile(goal.id, 5)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 transition-colors cursor-pointer"
                    title="İlerlemeyi %5 artır"
                  >
                    +5%
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500"
                  style={{ width: `${goal.currentProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                <span>Hedef Ufku: {goal.targetHorizon}</span>
                <span className="italic text-cyan-300/80">Koç Notu Aktif</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* iOS 27 Liquid Glass Theme Switcher */}
      <GlassCard variant="subtle" className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              iOS 27 Liquid Glass Görünümü
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Sıvı ışık kırılımları, akışkan speküler yansımalar ve derinlik.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-900/90 border border-white/10">
            <button
              onClick={() => handleThemeToggle('dark')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                profile.theme !== 'light'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark</span>
            </button>
            <button
              onClick={() => handleThemeToggle('light')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                profile.theme === 'light'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light</span>
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Memory Filter Tabs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-cyan-400" />
            Kayıtlı Hafıza Girişleri ({filteredMemories.length})
          </h2>
          <button
            onClick={onClearAllMemories}
            className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
            title="Tüm hafızayı sıfırla"
          >
            <Trash2 className="w-3 h-3" />
            Tümünü Unut
          </button>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-white/10 overflow-x-auto custom-scrollbar mb-3">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              selectedType === 'all'
                ? 'bg-cyan-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tümü
          </button>
          {Object.entries(memoryTypeLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedType(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedType === key
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Memories List */}
        <div className="space-y-3">
          {filteredMemories.map((mem) => (
            <GlassCard key={mem.id} variant="default" className="p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-cyan-400 font-semibold uppercase">
                      {memoryTypeLabels[mem.type] || mem.type}
                    </span>
                    <span className="text-slate-600 text-xs">·</span>
                    <span className="text-[10px] text-slate-400">
                      Güven Skoru: %{Math.round(mem.confidence * 100)}
                    </span>
                    <span className="text-slate-600 text-xs">·</span>
                    <span className="text-[10px] text-slate-400">
                      Kaynak: {mem.source}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-slate-200 leading-relaxed">
                    {mem.content}
                  </p>
                </div>

                <GlassButton
                  size="sm"
                  variant="ghost"
                  onClick={() => onForgetMemory(mem.id)}
                  className="text-slate-500 hover:text-rose-400 shrink-0 text-xs gap-1 cursor-pointer"
                  title="Bu bilgiyi unut"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Unut</span>
                </GlassButton>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Privacy Guarantee & Controls */}
      <GlassCard variant="subtle" className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-200">
              Sıfır İhlal & Gizlilik Garantisi (Privacy by Design)
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              AYZEK senin verilerini üçüncü partilerle paylaşmaz. Finansal veya kişisel bağlamlar cihazına ve güvenli şifreli veri tabanına bağlıdır. Dilediğin an "Bunu unut" diyerek tüm hafızayı silebilirsin.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Edit Routines Sheet */}
      <GlassSheet
        isOpen={isEditingRoutines}
        onClose={() => setIsEditingRoutines(false)}
        title="Rutin ve Tercihleri Yapılandır"
        subtitle="AYZEK bağlamsal zamanlamalarını bu saatlere göre ayarlar."
      >
        <form onSubmit={handleSaveRoutines} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <GlassInput
              label="Uyanış Saati"
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
            />
            <GlassInput
              label="Uyku Saati"
              type="time"
              value={sleepTime}
              onChange={(e) => setSleepTime(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <GlassInput
              label="Mesai Başlangıcı"
              type="time"
              value={workStartTime}
              onChange={(e) => setWorkStartTime(e.target.value)}
            />
            <GlassInput
              label="Mesai Bitişi"
              type="time"
              value={workEndTime}
              onChange={(e) => setWorkEndTime(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              İletişim & Rehberlik Tavrı
            </label>
            <select
              value={commStyle}
              onChange={(e) => setCommStyle(e.target.value as any)}
              className="w-full rounded-xl bg-slate-900/70 border border-white/10 px-3 py-2.5 text-sm text-slate-100"
            >
              <option value="wise_mentor">Bilge Mentör & Samimi Yaşam Koçu (Önerilen)</option>
              <option value="warm_concise">Sıcak, Öz ve Net</option>
              <option value="direct">Doğrudan & Minimalist</option>
              <option value="playful_empathetic">Empatik & Samimi Sırdaş</option>
              <option value="detailed">Detaylı & Analitik</option>
            </select>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5" />
                Kadın Biyolojik Döngü Takibi
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCycleEnabled}
                  onChange={(e) => setIsCycleEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
              </label>
            </div>

            {isCycleEnabled && (
              <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Son Döngü Başlangıcı</label>
                  <input
                    type="date"
                    value={lastPeriodDate}
                    onChange={(e) => setLastPeriodDate(e.target.value)}
                    className="w-full rounded-xl bg-slate-900/80 border border-white/10 p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Döngü Süresi (Gün)</label>
                  <input
                    type="number"
                    min="21"
                    max="40"
                    value={cycleLength}
                    onChange={(e) => setCycleLength(Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-900/80 border border-white/10 p-2 text-slate-100"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
            <GlassButton type="button" variant="ghost" onClick={() => setIsEditingRoutines(false)}>
              İptal
            </GlassButton>
            <GlassButton type="submit" variant="primary">
              Kaydet
            </GlassButton>
          </div>
        </form>
      </GlassSheet>

      {/* Add New Long Term Goal Sheet */}
      <GlassSheet
        isOpen={isAddingGoalModal}
        onClose={() => setIsAddingGoalModal(false)}
        title="Yeni Uzun Vadeli Hedef Ekle"
        subtitle="Bu hedef 'Yaşam Koçu Notları' kartında ve anasayfa akışında otomatik yer alır."
      >
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <GlassInput
            label="Hedef Başlığı (Örn: İspanyolca B1, Maraton Koşusu)"
            placeholder="Örn: İngilizce C1 Seviyesi veya 10 Kitap Bitirme"
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Kategori
              </label>
              <select
                value={newGoalCategory}
                onChange={(e) => setNewGoalCategory(e.target.value as any)}
                className="w-full rounded-xl bg-slate-900/70 border border-white/10 px-3 py-2.5 text-sm text-slate-100"
              >
                <option value="language">Yabancı Dil</option>
                <option value="career">Kariyer & İletişim</option>
                <option value="wellness">Sağlık & Spor</option>
                <option value="finance">Finans & Birikim</option>
                <option value="personal">Kişisel Gelişim</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Hedef Ufku
              </label>
              <select
                value={newGoalHorizon}
                onChange={(e) => setNewGoalHorizon(e.target.value)}
                className="w-full rounded-xl bg-slate-900/70 border border-white/10 px-3 py-2.5 text-sm text-slate-100"
              >
                <option value="3 Ay">3 Ay</option>
                <option value="6 Ay">6 Ay</option>
                <option value="1 Yıl">1 Yıl</option>
                <option value="Yıl Sonu">Yıl Sonu</option>
              </select>
            </div>
          </div>

          <GlassInput
            label="Neden Önemli? (Motivasyon Cümlen)"
            placeholder="Örn: Yurt dışı projelerinde kendimi akıcı ve özgüvenli ifade etmek."
            value={newGoalWhy}
            onChange={(e) => setNewGoalWhy(e.target.value)}
          />

          <GlassInput
            label="Önerilen Günlük Mikro-Adım (10-15 Dk)"
            placeholder="Örn: İşe giderken 15 dk podcast dinleme veya günde 1 makale okuma."
            value={newGoalMicroHabit}
            onChange={(e) => setNewGoalMicroHabit(e.target.value)}
          />

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
            <GlassButton type="button" variant="ghost" onClick={() => setIsAddingGoalModal(false)}>
              İptal
            </GlassButton>
            <GlassButton type="submit" variant="primary">
              Hedefi Ekle & Senkronize Et
            </GlassButton>
          </div>
        </form>
      </GlassSheet>
    </div>
  );
};
