import React, { useState } from 'react';
import {
  Quote,
  Sparkles,
  Compass,
  ArrowRight,
  Plus,
  Check,
  RotateCw,
  MessageSquare,
  TrendingUp,
  Target,
  ChevronLeft,
  ChevronRight,
  Award,
  Zap,
} from 'lucide-react';
import { LongTermGrowthGoal } from '../../types/ayzek';
import { GlassCard } from '../design-system/GlassCard';
import { GlassButton } from '../design-system/GlassButton';

interface LifeCoachNotesCardProps {
  goals: LongTermGrowthGoal[];
  onAcceptMicroHabit: (goalId: string, title: string) => void;
  onOpenChatWithPrompt: (prompt: string) => void;
  onUpdateGoalProgress?: (goalId: string, newProgress: number) => Promise<void>;
  isTaskAdded?: boolean;
}

// Rich wisdom pool indexed by goal category and goal title
const COACH_WISDOM_NOTES: Record<string, string[]> = {
  language: [
    'Dilde mükemmellik değil, temas sıklığı kazandırır. Bugün sadece 10 dakika ilgilendiğin bir konuda İngilizce podcast dinlemek bile zihnindeki sinirsel bağları canlı tutar.',
    'Konuşurken hata yapma korkusu, öğrenme sürecinin doğal bir parçası. Bugün kendine "kusursuz konuşma" değil, sadece "anlaşılma" hedefi koy.',
    'Yabancı dilde düşünmeye başlamak için gün içinde yaptığın 3 basit eylemi (örneğin kahve yaparken) iç sesinle İngilizce ifade etmeyi dene.',
    'Haftada bir gün 3 saat çalışmak yerine, her gün 15 dakikalık ritmik temaslar beynin dil merkezini kalıcı olarak uyanık tutar.',
  ],
  finance: [
    'Tasarruf ve yatırım kendini mahrum bırakmak değil; gelecekteki özgürlüğünü ve dinginliğini bugün satın almaktır.',
    'Bileşik getirinin sırrı sabırdır. Bugün küçük görünen her tasarruf adımı, 1 yıl sonra zihinsel bir kalkan oluşturur.',
    'Gereksiz tüketim dürtüsü geldiğinde kendine sor: "Bunu almak mı beni daha hafif hissettirir, yoksa finansal hedefime yaklaşmak mı?"',
  ],
  career: [
    'Günün telaşında en değerli projen daima "sen"sin. Bugün acil işlerin gürültüsünü kısıp 15 dakika stratejik hedefine odaklan.',
    'Büyük kariyer sıçramaları gürültülü adımlarla değil, her gün sessizce inşa edilen disiplinli uzmanlıklarla gerçekleşir.',
  ],
  wellness: [
    'Bedenin senin bu dünyadaki yegane evin. Ona suçlayarak değil, şefkatle ve küçük yürüyüşlerle yaklaş.',
    'Bugün mükemmel bir antrenman yapmana gerek yok; sadece 15 dakikalık bir esneme bile enerjini dönüştürür.',
  ],
  personal: [
    'Kendi hızında ilerlediğin sürece asla geç kalmış sayılmazsın. Başkalarının takvimleri senin rotan olamaz.',
    'Küçük adımların gücünü küçümseme; 100 sayfalık bir kitap günde 5 sayfa okuyarak 20 günde biter.',
  ],
};

export const LifeCoachNotesCard: React.FC<LifeCoachNotesCardProps> = ({
  goals,
  onAcceptMicroHabit,
  onOpenChatWithPrompt,
  onUpdateGoalProgress,
  isTaskAdded = false,
}) => {
  // Safe fallback goal if none exists
  const activeGoals: LongTermGrowthGoal[] = goals && goals.length > 0
    ? goals
    : [
        {
          id: 'ltg-default',
          title: 'İngilizceyi Akıcı Konuşmak (C1 Seviyesi)',
          category: 'language',
          targetHorizon: '6 Ay',
          whyItMatters: 'Global projelerde rahat sunum yapmak ve yurt dışı ağını genişletmek.',
          currentProgress: 45,
          mentorWeeklyCheckIn: 'İngilizceni geliştirmek için bu hafta 15 dakikalık 3 konuşma/dinleme pratiği planlayalım mı?',
          suggestedMicroHabit: 'İşe giderken 15 dk İngilizce podcast dinleme.',
        },
      ];

  const [activeGoalIndex, setActiveGoalIndex] = useState(0);
  const [noteVariationIndex, setNoteVariationIndex] = useState(0);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [addedTasksMap, setAddedTasksMap] = useState<Record<string, boolean>>({});

  const currentGoal = activeGoals[activeGoalIndex] || activeGoals[0];

  // Pick category wisdom
  const categoryNotes = COACH_WISDOM_NOTES[currentGoal.category] || COACH_WISDOM_NOTES.personal;
  const currentNote = categoryNotes[noteVariationIndex % categoryNotes.length];

  const handleNextGoal = () => {
    setActiveGoalIndex((prev) => (prev + 1) % activeGoals.length);
    setNoteVariationIndex(0);
  };

  const handlePrevGoal = () => {
    setActiveGoalIndex((prev) => (prev - 1 + activeGoals.length) % activeGoals.length);
    setNoteVariationIndex(0);
  };

  const handleRotateNote = () => {
    setNoteVariationIndex((prev) => prev + 1);
  };

  const handleQuickAddProgress = async (increment: number) => {
    if (!onUpdateGoalProgress) return;
    setIsUpdatingProgress(true);
    try {
      const nextProgress = Math.min(100, Math.max(0, currentGoal.currentProgress + increment));
      await onUpdateGoalProgress(currentGoal.id, nextProgress);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const handleAddHabit = () => {
    onAcceptMicroHabit(currentGoal.id, currentGoal.suggestedMicroHabit || `${currentGoal.title} Mikro Adımı`);
    setAddedTasksMap((prev) => ({ ...prev, [currentGoal.id]: true }));
  };

  const isCurrentTaskAdded = isTaskAdded || !!addedTasksMap[currentGoal.id];

  const categoryLabels: Record<string, { label: string; badgeClass: string }> = {
    language: { label: 'Yabancı Dil', badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/20' },
    finance: { label: 'Finans & Yatırım', badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-400/20' },
    career: { label: 'Kariyer & İletişim', badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/20' },
    wellness: { label: 'Sağlık & Yaşam', badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-400/20' },
    personal: { label: 'Kişisel Gelişim', badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/20' },
  };

  const catMeta = categoryLabels[currentGoal.category] || categoryLabels.personal;

  return (
    <div className="relative group">
      {/* iOS 27 Liquid Glass Ambient Specular Light */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-indigo-500/15 rounded-full blur-2xl pointer-events-none transition-all duration-700" />
      <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-gradient-to-tr from-emerald-400/15 to-teal-500/10 rounded-full blur-xl pointer-events-none" />

      <GlassCard
        variant="accent"
        className="p-3.5 sm:p-4 relative overflow-hidden border-cyan-500/25 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-950/80 shadow-lg shadow-cyan-950/20"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center shrink-0">
              <Quote className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-300">
                  Yaşam Koçu Notu
                </span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium border ${catMeta.badgeClass}`}>
                  {catMeta.label}
                </span>
              </div>
            </div>
          </div>

          {/* Goal Selector Switcher (if multiple) & Refresh Button */}
          <div className="flex items-center gap-1">
            {activeGoals.length > 1 && (
              <div className="flex items-center gap-0.5 mr-1 bg-white/5 rounded-lg p-0.5 border border-white/10">
                <button
                  onClick={handlePrevGoal}
                  className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-colors cursor-pointer"
                  title="Önceki Hedef"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <span className="text-[10px] text-slate-300 font-mono px-1">
                  {activeGoalIndex + 1}/{activeGoals.length}
                </span>
                <button
                  onClick={handleNextGoal}
                  className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-colors cursor-pointer"
                  title="Sonraki Hedef"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}

            <button
              onClick={handleRotateNote}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 transition-all border border-white/10 cursor-pointer"
              title="Farklı Bir Koç Notu Gör"
            >
              <RotateCw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Goal Title & Target Horizon Sub-strip */}
        <div className="flex items-baseline justify-between gap-2 mb-2 pb-2 border-b border-white/5">
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-slate-100 truncate">
              {currentGoal.title}
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
              <span>Ufuk: {currentGoal.targetHorizon}</span>
              <span>•</span>
              <span className="truncate max-w-[220px]">{currentGoal.whyItMatters}</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-cyan-300 font-mono">
              %{currentGoal.currentProgress}
            </span>
            {onUpdateGoalProgress && (
              <button
                onClick={() => handleQuickAddProgress(5)}
                disabled={isUpdatingProgress || currentGoal.currentProgress >= 100}
                className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-medium border border-cyan-400/30 transition-colors cursor-pointer disabled:opacity-50"
                title="Bugünkü çalışmayı kaydet (+%5 ilerleme)"
              >
                +5%
              </button>
            )}
          </div>
        </div>

        {/* Progress Track */}
        <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden mb-2.5">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-500 transition-all duration-500 rounded-full"
            style={{ width: `${currentGoal.currentProgress}%` }}
          />
        </div>

        {/* The Empathetic Coach Wisdom Bubble */}
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-cyan-500/15 mb-2.5 text-xs text-slate-200 shadow-inner">
          <div className="flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[11.5px] leading-relaxed italic text-slate-200">
                "{currentNote}"
              </p>
              {currentGoal.suggestedMicroHabit && (
                <div className="mt-1.5 text-[10.5px] text-cyan-300/90 font-medium flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span>Günün Mikro-Adımı: {currentGoal.suggestedMicroHabit}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons: Add Micro-step to Plan or Chat with Coach */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={() =>
              onOpenChatWithPrompt(
                `${currentGoal.title} hedefimle ilgili Yaşam Koçu notundaki tavsiyeyi dinlemek ve bugün için 10-15 dakikalık hızlı bir pratik/alıştırma planlamak istiyorum.`
              )
            }
            className="text-[11px] text-cyan-300 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <MessageSquare className="w-3 h-3" />
            <span>Koçla Konuş</span>
          </button>

          <GlassButton
            size="sm"
            variant={isCurrentTaskAdded ? 'secondary' : 'primary'}
            disabled={isCurrentTaskAdded}
            onClick={handleAddHabit}
            className="text-[11px] py-1 px-2.5 gap-1 shrink-0 h-7"
          >
            {isCurrentTaskAdded ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Günün Planında</span>
              </>
            ) : (
              <>
                <Plus className="w-3 h-3" />
                <span>Planıma Ekle (15 Dk)</span>
              </>
            )}
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
};
