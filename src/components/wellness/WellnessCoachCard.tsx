import React from 'react';
import {
  Activity,
  Heart,
  Sparkles,
  Footprints,
  Plus,
  Check,
  Shield,
  Smile,
} from 'lucide-react';
import { GlassCard } from '../design-system/GlassCard';

interface WellnessCoachCardProps {
  onAddWalkingTask?: () => void;
  isTaskAdded?: boolean;
}

export const WellnessCoachCard: React.FC<WellnessCoachCardProps> = ({
  onAddWalkingTask,
  isTaskAdded = false,
}) => {
  return (
    <GlassCard variant="default" className="p-4 relative overflow-hidden border-emerald-500/25 bg-gradient-to-br from-slate-900/80 via-emerald-950/20 to-slate-950/80 space-y-3">
      {/* Specular Ambient Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
                Beden & Form Koçluğu
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-200 border border-emerald-400/20">
                Suçlayıcı Olmayan Yaklaşım
              </span>
            </div>
            <h3 className="text-xs font-semibold text-slate-100 mt-0.5">
              Günlük Mikro Hareket & Zihinsel Dinginlik
            </h3>
          </div>
        </div>
      </div>

      {/* Message & Philosophy */}
      <p className="text-xs text-slate-200 leading-relaxed">
        Katı diyetler ve yorucu zorlamalar yerine, günün doğal akışına eklenen 20 dakikalık bir akşam yürüyüşü metabolizmanı canlı tutar ve masa başı kortizolünü nötrler.
      </p>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-300">
          <Footprints className="w-3.5 h-3.5" />
          <span>İş Çıkışı 20 Dk Tempolu Yürüyüş</span>
        </div>

        {onAddWalkingTask && (
          <button
            onClick={onAddWalkingTask}
            disabled={isTaskAdded}
            className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-colors"
          >
            {isTaskAdded ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Plana Eklendi</span>
              </>
            ) : (
              <>
                <Plus className="w-3 h-3" />
                <span>Plana Ekle</span>
              </>
            )}
          </button>
        )}
      </div>
    </GlassCard>
  );
};
