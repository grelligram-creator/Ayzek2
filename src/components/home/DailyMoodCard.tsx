import React, { useState } from 'react';
import {
  Smile,
  Zap,
  Target,
  Sparkles,
  Check,
  RotateCcw,
  MessageSquare,
  Sliders,
  Heart,
  ChevronRight,
  Brain,
} from 'lucide-react';
import { DailyMoodCheckIn, EnergyLevel, MoodFeeling, FocusLevel } from '../../types/ayzek';
import { GlassCard } from '../design-system/GlassCard';
import { GlassButton } from '../design-system/GlassButton';

interface DailyMoodCardProps {
  currentMood?: DailyMoodCheckIn;
  onSaveMood: (data: {
    energyLevel: EnergyLevel;
    moodFeeling: MoodFeeling;
    focusLevel: FocusLevel;
    note?: string;
  }) => Promise<void>;
  onOptimizePlanForMood?: () => Promise<void>;
  onOpenChatWithPrompt: (prompt: string) => void;
}

export const DailyMoodCard: React.FC<DailyMoodCardProps> = ({
  currentMood,
  onSaveMood,
  onOptimizePlanForMood,
  onOpenChatWithPrompt,
}) => {
  const [isEditing, setIsEditing] = useState(!currentMood);
  const [energy, setEnergy] = useState<EnergyLevel>(currentMood?.energyLevel || 'moderate');
  const [feeling, setFeeling] = useState<MoodFeeling>(currentMood?.moodFeeling || 'peaceful');
  const [focus, setFocus] = useState<FocusLevel>(currentMood?.focusLevel || 'balanced');
  const [note, setNote] = useState(currentMood?.note || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const energyOptions: Array<{ id: EnergyLevel; label: string; icon: string; desc: string }> = [
    { id: 'low', label: 'Düşük', icon: '🪫', desc: 'Dinlenme & sakinlik lazım' },
    { id: 'moderate', label: 'Dengeli', icon: '⚡', desc: 'Rutin tempoda' },
    { id: 'high', label: 'Yüksek', icon: '🔥', desc: 'Dinamik & üretken' },
  ];

  const feelingOptions: Array<{ id: MoodFeeling; label: string; icon: string }> = [
    { id: 'peaceful', label: 'Dingin', icon: '🧘' },
    { id: 'happy', label: 'Neşeli', icon: '😊' },
    { id: 'inspired', label: 'İlham Dolu', icon: '✨' },
    { id: 'tired', label: 'Yorgun', icon: '🥱' },
    { id: 'stressed', label: 'Telaşlı', icon: '⚡' },
  ];

  const focusOptions: Array<{ id: FocusLevel; label: string; icon: string; desc: string }> = [
    { id: 'scattered', label: 'Dağınık', icon: '💭', desc: 'Hafif molalar gerekli' },
    { id: 'balanced', label: 'Dengeli', icon: '⚖️', desc: 'Normal iş akışı' },
    { id: 'deep', label: 'Derin Odak', icon: '🎯', desc: 'Karmaşık işler için ideal' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSaveMood({
        energyLevel: energy,
        moodFeeling: feeling,
        focusLevel: focus,
        note: note.trim() ? note.trim() : undefined,
      });
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOptimizePlan = async () => {
    if (!onOptimizePlanForMood) return;
    setIsOptimizing(true);
    try {
      await onOptimizePlanForMood();
    } finally {
      setIsOptimizing(false);
    }
  };

  // If already logged today and not currently in edit mode, show the reflective wisdom card
  if (currentMood && !isEditing) {
    const energyMeta = energyOptions.find((e) => e.id === currentMood.energyLevel) || energyOptions[1];
    const feelingMeta = feelingOptions.find((f) => f.id === currentMood.moodFeeling) || feelingOptions[0];
    const focusMeta = focusOptions.find((f) => f.id === currentMood.focusLevel) || focusOptions[1];

    return (
      <GlassCard
        variant="default"
        className="p-3.5 sm:p-4 relative overflow-hidden border-teal-500/25 bg-gradient-to-br from-slate-900/80 via-teal-950/20 to-slate-950/80 shadow-md"
      >
        {/* Soft specular light */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/30">
              <Smile className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider">
                Bugünkü Modun Kaydedildi
              </span>
              <h3 className="text-xs font-semibold text-slate-100 flex items-center gap-1.5 mt-0.5">
                <span>{energyMeta.icon} {energyMeta.label} Enerji</span>
                <span className="text-slate-500">•</span>
                <span>{feelingMeta.icon} {feelingMeta.label}</span>
                <span className="text-slate-500">•</span>
                <span>{focusMeta.icon} {focusMeta.label}</span>
              </h3>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="text-[11px] text-slate-400 hover:text-teal-300 flex items-center gap-1 p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            title="Modu güncelle"
          >
            <Sliders className="w-3 h-3" />
            <span className="hidden sm:inline">Güncelle</span>
          </button>
        </div>

        {/* Coach Advice based on the combination */}
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 mb-3 text-xs leading-relaxed text-slate-200">
          <div className="flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-300 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11.5px] italic text-teal-100/90 font-medium">
                "{currentMood.coachRecommendation}"
              </p>
              {currentMood.note && (
                <p className="text-[10.5px] text-slate-400 mt-1">
                  Kişisel Notun: <span className="text-slate-300">{currentMood.note}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5 text-xs">
          <button
            onClick={() =>
              onOpenChatWithPrompt(
                `Bugünkü modumu "${energyMeta.label} enerji, ${feelingMeta.label} his ve ${focusMeta.label}" olarak kaydettim. Günümü buna göre nasıl dengelememi önerirsin?`
              )
            }
            className="text-[11px] text-cyan-300 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <MessageSquare className="w-3 h-3" />
            <span>AYZEK ile Konuş</span>
          </button>

          {onOptimizePlanForMood && (
            <GlassButton
              size="sm"
              variant="secondary"
              onClick={handleOptimizePlan}
              disabled={isOptimizing}
              className="text-[11px] py-1 px-2.5 gap-1 shrink-0 h-7 text-teal-300 border-teal-500/30"
            >
              {isOptimizing ? (
                <span>Plan Uyarlanıyor...</span>
              ) : (
                <>
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Planı Moduma Uyarla</span>
                </>
              )}
            </GlassButton>
          )}
        </div>
      </GlassCard>
    );
  }

  // Interactive Check-in Form
  return (
    <GlassCard
      variant="default"
      className="p-3.5 sm:p-4 relative overflow-hidden border-teal-500/30 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-950/80 shadow-lg shadow-teal-950/15"
    >
      {/* Specular fluid light accent */}
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/30">
            <Smile className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Bugün Nasılsın?
            </h3>
            <p className="text-[10px] text-slate-400">
              Enerji, ruh hali ve odağını kaydet; AYZEK günün planını ve tavsiyelerini sana uyarlasın.
            </p>
          </div>
        </div>

        {currentMood && (
          <button
            onClick={() => setIsEditing(false)}
            className="text-[10px] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            Vazgeç
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Dimension 1: Energy Level */}
        <div>
          <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1 mb-1.5">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Enerji Seviyen:</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {energyOptions.map((opt) => {
              const isSelected = energy === opt.id;
              return (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setEnergy(opt.id)}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-500/20 border-teal-400/60 text-white shadow-sm'
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{opt.icon}</span>
                    <span className="text-xs font-semibold">{opt.label}</span>
                  </div>
                  <span className="text-[9.5px] text-slate-400 block mt-0.5 leading-tight truncate">
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dimension 2: Feeling / Mood */}
        <div>
          <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1 mb-1.5">
            <Heart className="w-3 h-3 text-rose-400" />
            <span>Ruh Halin / Duygun:</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {feelingOptions.map((opt) => {
              const isSelected = feeling === opt.id;
              return (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setFeeling(opt.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-rose-500/20 border-rose-400/60 text-white font-medium shadow-sm'
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dimension 3: Focus Level */}
        <div>
          <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1 mb-1.5">
            <Target className="w-3 h-3 text-cyan-400" />
            <span>Zihinsel Odaklanma:</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {focusOptions.map((opt) => {
              const isSelected = focus === opt.id;
              return (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setFocus(opt.id)}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400/60 text-white shadow-sm'
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{opt.icon}</span>
                    <span className="text-xs font-semibold">{opt.label}</span>
                  </div>
                  <span className="text-[9.5px] text-slate-400 block mt-0.5 leading-tight truncate">
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Note */}
        <div>
          <input
            type="text"
            placeholder="Kısa bir not (örn: Sabah biraz yorgundum, hafif tempo iyi gelir)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl bg-slate-950/70 border border-white/10 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-400/50"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <GlassButton
            type="submit"
            size="sm"
            variant="primary"
            disabled={isSubmitting}
            className="text-xs py-1.5 px-4 gap-1.5"
          >
            {isSubmitting ? (
              <span>Kaydediliyor...</span>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Modumu Kaydet & Tavsiye Al</span>
              </>
            )}
          </GlassButton>
        </div>
      </form>
    </GlassCard>
  );
};
