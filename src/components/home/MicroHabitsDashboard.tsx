import React, { useState, useEffect } from 'react';
import {
  Droplets,
  Activity,
  Wind,
  Eye,
  Footprints,
  Sparkles,
  Apple,
  CheckCircle2,
  Circle,
  Plus,
  RotateCcw,
  Zap,
  Flame,
  Check,
  ChevronRight,
  X,
  Smile,
  Heart,
  BookOpen,
} from 'lucide-react';
import { MicroHabitItem } from '../../types/ayzek';
import { GlassCard } from '../design-system/GlassCard';

interface MicroHabitsDashboardProps {
  onOpenChatWithPrompt?: (prompt: string) => void;
  className?: string;
}

const DEFAULT_MICRO_HABITS: MicroHabitItem[] = [
  {
    id: 'mh-water',
    title: '1 Bardak Su İç',
    shortDesc: 'Hücrelerini ve odağını tazeleyen hidrasyon',
    category: 'water',
    iconName: 'Droplets',
    accentColor: 'cyan',
    completed: false,
    targetCount: 8,
    currentCount: 5,
    unit: 'bardak',
    coachFeedback: '💧 Harika! 1 bardak su metabolizmanı ve beyin fonksiyonlarını anında canlandırdı.',
  },
  {
    id: 'mh-stretch',
    title: '5 Dk Esne & Postür',
    shortDesc: 'Masa başı boyun, omuz ve omurga esnemesi',
    category: 'stretch',
    iconName: 'Activity',
    accentColor: 'amber',
    completed: false,
    coachFeedback: '🧘 Harika bir mola! Omurgan dikleşti ve boyun gerginliğin hafifledi.',
  },
  {
    id: 'mh-breathe',
    title: '2 Dk Derin Nefes',
    shortDesc: '4-7-8 tekniği ile parasempatik zihin sıfırlama',
    category: 'breathe',
    iconName: 'Wind',
    accentColor: 'teal',
    completed: true,
    coachFeedback: '🌬️ Zihnin berraklaştı. Kortizol düştü ve kalp ritmin dengelendi.',
  },
  {
    id: 'mh-eyes',
    title: 'Göz Dinlendir (20-20-20)',
    shortDesc: '20 saniye boyunca 6 metre uzağa odaklan',
    category: 'eyes',
    iconName: 'Eye',
    accentColor: 'indigo',
    completed: false,
    coachFeedback: '👁️ Göz kasların dinlendi ve dijital ekran yorgunluğu azaldı.',
  },
  {
    id: 'mh-walk',
    title: '250 Adım / Kısa Tur',
    shortDesc: 'Masa başından kalkıp bacakları ve kanı hareketlendir',
    category: 'walk',
    iconName: 'Footprints',
    accentColor: 'emerald',
    completed: true,
    coachFeedback: '🚶‍♂️ Harika hareket! Kan dolaşımı hızlandı, bacakların rahatladı.',
  },
  {
    id: 'mh-gratitude',
    title: '1 Güzel Şey / Şükran',
    shortDesc: 'Bugünün iyi giden bir detayını fark et ve gülümse',
    category: 'gratitude',
    iconName: 'Sparkles',
    accentColor: 'rose',
    completed: false,
    coachFeedback: '✨ Harika bir farkındalık! Beynin dopamin ve dinginlik salgıladı.',
  },
];

export const MicroHabitsDashboard: React.FC<MicroHabitsDashboardProps> = ({
  onOpenChatWithPrompt,
  className = '',
}) => {
  const todayKey = `ayzek_micro_habits_${new Date().toISOString().slice(0, 10)}`;

  const [habits, setHabits] = useState<MicroHabitItem[]>(() => {
    try {
      const saved = localStorage.getItem(todayKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return DEFAULT_MICRO_HABITS;
  });

  const [coachToast, setCoachToast] = useState<{ message: string; color: string } | null>(null);
  const [streakDays, setStreakDays] = useState(7);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Persist to local storage
  useEffect(() => {
    try {
      localStorage.setItem(todayKey, JSON.stringify(habits));
    } catch {
      // ignore
    }
  }, [habits, todayKey]);

  // Dismiss toast after 3.5s
  useEffect(() => {
    if (!coachToast) return;
    const timer = setTimeout(() => {
      setCoachToast(null);
    }, 3800);
    return () => clearTimeout(timer);
  }, [coachToast]);

  const completedCount = habits.filter((h) => h.completed).length;
  const totalCount = habits.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const vitalityPoints = completedCount * 15;

  const handleToggleHabit = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id === id) {
          const nextCompleted = !habit.completed;
          if (nextCompleted) {
            // Trigger feedback toast
            setCoachToast({
              message: habit.coachFeedback,
              color: habit.accentColor,
            });
            // If water habit, also increment count if available
            if (habit.category === 'water' && habit.targetCount && (habit.currentCount || 0) < habit.targetCount) {
              const updatedCount = Math.min(habit.targetCount, (habit.currentCount || 0) + 1);
              return {
                ...habit,
                completed: true,
                currentCount: updatedCount,
                lastCompletedAt: new Date().toISOString(),
              };
            }
          }
          return {
            ...habit,
            completed: nextCompleted,
            lastCompletedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return habit;
      })
    );
  };

  const handleIncrementWater = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.category === 'water') {
          const current = habit.currentCount || 0;
          const target = habit.targetCount || 8;
          const next = Math.min(target, current + 1);
          const isDone = next >= target;
          setCoachToast({
            message: `💧 Harika! ${next}/${target} bardak su içtin. Vücudun canlandı.`,
            color: 'cyan',
          });
          return {
            ...habit,
            currentCount: next,
            completed: isDone || habit.completed,
          };
        }
        return habit;
      })
    );
  };

  const handleResetDay = () => {
    setHabits((prev) =>
      prev.map((h) => ({
        ...h,
        completed: false,
        currentCount: h.category === 'water' ? 0 : h.currentCount,
      }))
    );
    setCoachToast({
      message: 'Günün mikro-alışkanlıkları sıfırlandı. Yeni bir başlangıç! ✨',
      color: 'cyan',
    });
  };

  const handleAddNewHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newHabit: MicroHabitItem = {
      id: `mh-custom-${Date.now()}`,
      title: newTitle.trim(),
      shortDesc: newDesc.trim() || 'Kişiselleştirilmiş günlük mikro-ritim',
      category: 'custom',
      iconName: 'Sparkles',
      accentColor: 'indigo',
      completed: false,
      coachFeedback: `👏 Harika bir adım! "${newTitle.trim()}" tamamlandı.`,
    };

    setHabits((prev) => [...prev, newHabit]);
    setNewTitle('');
    setNewDesc('');
    setIsAddingNew(false);
    setCoachToast({
      message: `"${newHabit.title}" mikro-alışkanlıklarına eklendi!`,
      color: 'indigo',
    });
  };

  const renderIcon = (iconName: string, color: string, completed: boolean) => {
    const iconClass = `w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-200 ${
      completed ? 'text-emerald-400 scale-105' : `text-${color}-400 group-hover:scale-110`
    }`;

    switch (iconName) {
      case 'Droplets':
        return <Droplets className={iconClass} />;
      case 'Activity':
        return <Activity className={iconClass} />;
      case 'Wind':
        return <Wind className={iconClass} />;
      case 'Eye':
        return <Eye className={iconClass} />;
      case 'Footprints':
        return <Footprints className={iconClass} />;
      case 'Sparkles':
        return <Sparkles className={iconClass} />;
      case 'Apple':
        return <Apple className={iconClass} />;
      default:
        return <Sparkles className={iconClass} />;
    }
  };

  const getAccentBg = (color: string, completed: boolean) => {
    if (completed) {
      return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300';
    }
    switch (color) {
      case 'cyan':
        return 'bg-cyan-500/15 border-cyan-500/25 text-cyan-300';
      case 'amber':
        return 'bg-amber-500/15 border-amber-500/25 text-amber-300';
      case 'teal':
        return 'bg-teal-500/15 border-teal-500/25 text-teal-300';
      case 'indigo':
        return 'bg-indigo-500/15 border-indigo-500/25 text-indigo-300';
      case 'emerald':
        return 'bg-emerald-500/15 border-emerald-500/25 text-emerald-300';
      case 'rose':
        return 'bg-rose-500/15 border-rose-500/25 text-rose-300';
      default:
        return 'bg-cyan-500/15 border-cyan-500/25 text-cyan-300';
    }
  };

  return (
    <GlassCard
      variant="default"
      className={`p-4 sm:p-5 relative overflow-hidden border-cyan-500/20 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/80 shadow-lg ${className}`}
    >
      {/* Background ambient lighting */}
      <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/10 border border-cyan-500/30 text-cyan-400 shadow-sm">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider text-cyan-400 uppercase">
                  Mikro-Alışkanlık Mini-Dashboard
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-medium">
                  Tek Tıkla
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100 mt-0.5">
                Günün Canlılık & Odak Rutinleri
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-xl"
              title="Kesintisiz günlük mikro-seri"
            >
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{streakDays} Gün Seri</span>
            </span>
            <button
              onClick={handleResetDay}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-white/5 transition-colors cursor-pointer"
              title="Günü Sıfırla"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar & Vitality Tracker */}
        <div className="p-3 rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">
                Bugünkü İlerleme:
              </span>
              <span className="font-bold text-cyan-300">
                {completedCount} / {totalCount} Tamamlandı
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">
                +{vitalityPoints} Canlılık Puanı
              </span>
              <span className="font-extrabold text-xs text-emerald-400 font-mono">
                %{progressPercent}
              </span>
            </div>
          </div>

          {/* Liquid progress track */}
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 transition-all duration-500 ease-out shadow-[0_0_12px_rgba(6,182,212,0.6)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Realtime Coach Encouragement Toast */}
        {coachToast && (
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-emerald-200 text-xs shadow-md animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium leading-snug">{coachToast.message}</span>
            </div>
            <button
              onClick={() => setCoachToast(null)}
              className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Micro-Habit Interactive Button Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {habits.map((habit) => {
            const isCompleted = habit.completed;
            const isWater = habit.category === 'water';

            return (
              <div
                key={habit.id}
                onClick={() => handleToggleHabit(habit.id)}
                className={`group relative p-3 rounded-2xl border transition-all duration-200 cursor-pointer select-none flex items-center justify-between gap-2.5 active:scale-[0.98] ${
                  isCompleted
                    ? 'bg-emerald-950/25 border-emerald-500/35 shadow-[0_4px_16px_rgba(16,185,129,0.12)]'
                    : 'bg-slate-900/50 hover:bg-slate-900/80 border-white/10 hover:border-cyan-500/30 shadow-sm'
                }`}
              >
                {/* Specular glass reflection */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Category Icon Badge */}
                  <div
                    className={`p-2 rounded-xl border shrink-0 transition-colors ${getAccentBg(
                      habit.accentColor,
                      isCompleted
                    )}`}
                  >
                    {renderIcon(habit.iconName, habit.accentColor, isCompleted)}
                  </div>

                  {/* Habit Text Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4
                        className={`text-xs font-semibold truncate transition-colors ${
                          isCompleted
                            ? 'line-through text-slate-400'
                            : 'text-slate-100 group-hover:text-cyan-200'
                        }`}
                      >
                        {habit.title}
                      </h4>
                      {isCompleted && (
                        <span className="text-[10px] text-emerald-400 font-medium shrink-0">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {isWater && habit.currentCount !== undefined && habit.targetCount
                        ? `${habit.currentCount}/${habit.targetCount} bardak · ${habit.shortDesc}`
                        : habit.shortDesc}
                    </p>
                  </div>
                </div>

                {/* Right Action: One-Click Toggle or Water Stepper */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {isWater && !isCompleted && (
                    <button
                      onClick={handleIncrementWater}
                      title="1 Bardak Ekle"
                      className="px-2 py-1 text-[10px] font-bold rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer"
                    >
                      +1 Bardak
                    </button>
                  )}

                  <button
                    onClick={(e) => handleToggleHabit(habit.id, e)}
                    className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-cyan-400 hover:border-cyan-400/40'
                    }`}
                    title={isCompleted ? 'Tamamlandı (Geri al)' : 'Tamamla'}
                  >
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : (
                      <Circle className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions: Custom Habit Adder & Coach Prompt */}
        <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          {!isAddingNew ? (
            <button
              onClick={() => setIsAddingNew(true)}
              className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 py-1 px-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Özel Mikro-Alışkanlık Ekle</span>
            </button>
          ) : (
            <form
              onSubmit={handleAddNewHabit}
              className="w-full flex items-center gap-2 p-2 rounded-2xl bg-slate-900/90 border border-cyan-500/30"
            >
              <input
                type="text"
                placeholder="Örn: 10 Derin Squat, D Vitamini..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 bg-transparent text-xs text-slate-100 placeholder:text-slate-500 outline-none px-2 py-1"
                autoFocus
              />
              <button
                type="submit"
                className="px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors cursor-pointer"
              >
                Ekle
              </button>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {onOpenChatWithPrompt && (
            <button
              onClick={() =>
                onOpenChatWithPrompt(
                  `Bugün ${completedCount} adet mikro-alışkanlık tamamladım (su, esneme, nefes vb.). Günün enerjisini ve odağımı yüksek tutmak için bana kısa bir psikolog ve koç değerlendirmesi yapar mısın?`
                )
              }
              className="text-[11px] text-cyan-300/90 hover:text-cyan-200 flex items-center gap-1 transition-colors cursor-pointer ml-auto"
            >
              <span>AYZEK'ten Mikro-Değerlendirme Al</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* 100% Completion Celebration Banner */}
        {progressPercent === 100 && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-300">
            <span className="text-xl">🎉</span>
            <div>
              <strong className="text-emerald-300 block">
                Muhteşem İvme! Tüm Günlük Mikro-Rutinler Tamamlandı
              </strong>
              <span className="text-[11px] text-emerald-400/90">
                Bedenin, zihnin ve odağın bugün seninle mükemmel bir uyum içinde çalışıyor.
              </span>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
