import React, { useState } from 'react';
import {
  Flower2,
  Calendar,
  Sparkles,
  Activity,
  Zap,
  Plus,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CycleTracking } from '../../types/ayzek';
import { GlassCard } from '../design-system/GlassCard';
import { GlassButton } from '../design-system/GlassButton';

interface CycleTrackerCardProps {
  cycleTracking: CycleTracking;
  onUpdateCycle?: (data: {
    isEnabled?: boolean;
    lastPeriodDate?: string;
    cycleLengthDays?: number;
    periodLengthDays?: number;
  }) => Promise<void>;
  onAddCycleTask?: (title: string, preferredTime: string) => void;
  isTaskAdded?: boolean;
}

export const CycleTrackerCard: React.FC<CycleTrackerCardProps> = ({
  cycleTracking,
  onUpdateCycle,
  onAddCycleTask,
  isTaskAdded = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [lastPeriodDate, setLastPeriodDate] = useState(cycleTracking.lastPeriodDate);
  const [cycleLength, setCycleLength] = useState(cycleTracking.cycleLengthDays);

  const phaseNames: Record<string, string> = {
    menstrual: 'Menstrüasyon (Dinlenme & İçe Dönüş)',
    follicular: 'Foliküler Evre (Yüksek Enerji & Odak)',
    ovulatory: 'Ovülasyon (Pik Canlılık & İletişim)',
    luteal: 'Luteal Evre (Yavaşlama & Özen)',
  };

  const handleSave = async () => {
    if (onUpdateCycle) {
      await onUpdateCycle({
        lastPeriodDate,
        cycleLengthDays: Number(cycleLength) || 28,
      });
      setIsEditing(false);
    }
  };

  const handleAddPhaseWorkout = () => {
    if (onAddCycleTask) {
      onAddCycleTask(
        `Foliküler Evre Güç Antrenmanı & Esneme`,
        '18:30'
      );
    }
  };

  return (
    <GlassCard variant="default" className="p-4 relative overflow-hidden border-rose-500/25 bg-gradient-to-br from-slate-900/80 via-rose-950/20 to-slate-950/80 space-y-3">
      {/* Specular Ambient Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-400/30">
            <Flower2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-rose-300 font-bold uppercase tracking-wider">
                Biyolojik Hormonal Ritim
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-rose-500/15 text-rose-200 border border-rose-400/20">
                Gün {cycleTracking.dayOfCycle}
              </span>
            </div>
            <h3 className="text-xs font-semibold text-slate-100 mt-0.5">
              {phaseNames[cycleTracking.currentPhase] || cycleTracking.currentPhase}
            </h3>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-[11px] text-rose-300 hover:text-rose-100 underline decoration-rose-500/40 cursor-pointer"
        >
          {isEditing ? 'Kapat' : 'Düzenle'}
        </button>
      </div>

      {/* Advice Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
          <span className="text-[10px] text-slate-400 font-medium">Beden & Antrenman</span>
          <p className="text-xs text-slate-200 leading-snug">
            {cycleTracking.phaseAdvice.workoutSuggestion}
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
          <span className="text-[10px] text-slate-400 font-medium">Zihinsel Odak</span>
          <p className="text-xs text-slate-200 leading-snug">
            {cycleTracking.phaseAdvice.mentalFocus}
          </p>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
        <span className="text-[11px] text-slate-400 truncate">
          Sonraki Beklenen: {cycleTracking.nextPeriodExpectedDate}
        </span>

        {onAddCycleTask && (
          <button
            onClick={handleAddPhaseWorkout}
            disabled={isTaskAdded}
            className="text-xs px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-colors"
          >
            {isTaskAdded ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Plana Eklendi</span>
              </>
            ) : (
              <>
                <Plus className="w-3 h-3" />
                <span>Günü Optimize Et</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Edit Drawer */}
      {isEditing && (
        <div className="pt-2 border-t border-white/10 space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Son Periyot Tarihi</label>
              <input
                type="date"
                value={lastPeriodDate}
                onChange={(e) => setLastPeriodDate(e.target.value)}
                className="w-full text-xs rounded-xl bg-slate-900 border border-white/15 px-2.5 py-1.5 text-slate-100"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Döngü Süresi (Gün)</label>
              <input
                type="number"
                value={cycleLength}
                onChange={(e) => setCycleLength(Number(e.target.value))}
                className="w-full text-xs rounded-xl bg-slate-900 border border-white/15 px-2.5 py-1.5 text-slate-100"
              />
            </div>
          </div>
          <button
            onClick={handleSave}
            className="w-full text-xs py-1.5 rounded-xl bg-rose-500 text-slate-950 font-semibold cursor-pointer"
          >
            Tarihleri Güncelle
          </button>
        </div>
      )}
    </GlassCard>
  );
};
