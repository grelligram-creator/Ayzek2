import React from 'react';
import {
  Compass,
  Sparkles,
  BookOpen,
  ArrowRight,
  Plus,
  Check,
  Target,
  MessageSquare,
} from 'lucide-react';
import { LongTermGrowthGoal } from '../../types/ayzek';
import { GlassCard } from '../design-system/GlassCard';
import { GlassButton } from '../design-system/GlassButton';

interface MentorGrowthCardProps {
  goals: LongTermGrowthGoal[];
  onAcceptMicroHabit: (goalId: string, title: string) => void;
  onOpenChatWithPrompt: (prompt: string) => void;
  isTaskAdded?: boolean;
}

export const MentorGrowthCard: React.FC<MentorGrowthCardProps> = ({
  goals,
  onAcceptMicroHabit,
  onOpenChatWithPrompt,
  isTaskAdded = false,
}) => {
  const activeGoal = goals[0] || {
    id: 'ltg-1',
    title: 'İngilizceyi Akıcı Konuşmak (C1 Seviyesi)',
    category: 'language',
    targetHorizon: '6 Ay',
    whyItMatters: 'Global sunumları rahatça yapmak ve uluslararası ağ kurmak.',
    currentProgress: 45,
    mentorWeeklyCheckIn: 'İngilizceni geliştirmek için bu hafta 15 dakikalık 3 konuşma/dinleme pratiği planlayalım mı?',
    suggestedMicroHabit: 'İşe giderken 15 dk İngilizce podcast dinleme ve özet çıkarma.',
  };

  return (
    <GlassCard variant="accent" className="p-4 sm:p-5 relative overflow-hidden">
      {/* Specular fluid light accent */}
      <div className="absolute -top-12 -left-12 w-36 h-36 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">
                Yaşam Koçu & Bilge Rehber
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-medium">
                Hedef: {activeGoal.targetHorizon}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-100 mt-0.5">
              {activeGoal.title}
            </h3>
          </div>
        </div>

        <span className="text-xs font-bold text-cyan-300 font-mono">
          %{activeGoal.currentProgress}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-500"
          style={{ width: `${activeGoal.currentProgress}%` }}
        />
      </div>

      {/* Wise Mentor Counsel Bubble */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 mb-3 text-xs leading-relaxed text-slate-200">
        <p className="italic text-cyan-200/90 font-medium mb-1">
          "Büyük hedefler bir günde değil, her gün atılan 15 dakikalık dingin adımlarla nefes alır."
        </p>
        <p className="text-slate-300 text-[11px]">
          {activeGoal.mentorWeeklyCheckIn}
        </p>
      </div>

      {/* Micro-Habit Suggestion */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
        <div className="text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300 block">Önerilen Mikro-Adım:</span>
          <span>{activeGoal.suggestedMicroHabit}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <GlassButton
            size="sm"
            variant="ghost"
            onClick={() => onOpenChatWithPrompt(`İngilizce hedefimle ilgili bu haftaki planımı nasıl yapalım? Tavsiyeni dinlemek istiyorum.`)}
            className="text-xs text-cyan-300 hover:text-white"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mentörle Konuş</span>
          </GlassButton>

          <GlassButton
            size="sm"
            variant={isTaskAdded ? 'secondary' : 'primary'}
            disabled={isTaskAdded}
            onClick={() => onAcceptMicroHabit(activeGoal.id, 'İngilizce Dinleme & Konuşma Pratiği (15 Dk)')}
            className="text-xs gap-1"
          >
            {isTaskAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Plana Eklendi
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Günün Planına Al
              </>
            )}
          </GlassButton>
        </div>
      </div>
    </GlassCard>
  );
};
