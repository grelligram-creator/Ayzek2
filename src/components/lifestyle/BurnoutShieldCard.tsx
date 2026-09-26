import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Brain,
  Coffee,
  Footprints,
  Clock,
  Sparkles,
  Check,
  Zap,
  ArrowRight,
  BatteryCharging,
} from 'lucide-react';
import { GlassCard } from '../design-system/GlassCard';

interface BurnoutShieldCardProps {
  onDecompressSchedule?: () => void;
  onOpenChatWithPrompt?: (prompt: string) => void;
}

export const BurnoutShieldCard: React.FC<BurnoutShieldCardProps> = ({
  onDecompressSchedule,
  onOpenChatWithPrompt,
}) => {
  const [isDecompressed, setIsDecompressed] = useState(false);
  const [shieldActive, setShieldActive] = useState(true);

  // Cognitive Load Level
  const cognitiveScore = isDecompressed ? 42 : 84; // drops after decompression
  const isHighLoad = cognitiveScore > 70;

  const handleDecompress = () => {
    setIsDecompressed(true);
    if (onDecompressSchedule) {
      onDecompressSchedule();
    }
  };

  return (
    <GlassCard className="p-4 sm:p-5 border-indigo-500/30 shadow-[0_12px_40px_rgba(99,102,241,0.12)] relative overflow-hidden space-y-3.5">
      {/* Background ambient glow */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_16px_rgba(99,102,241,0.3)]">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Bilişsel Yük & Tükenmişlik Kalkanı
              </h3>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${
                  isHighLoad
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}
              >
                Bilişsel Yük Skoru: %{cognitiveScore}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Teams, Meet, Gmail ve biyolojik döngüyü analiz ederek anlık zihinsel yük çıkarır
            </p>
          </div>
        </div>

        <button
          onClick={() => setShieldActive(!shieldActive)}
          className={`text-[11px] px-2.5 py-1 rounded-xl border transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
            shieldActive
              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-medium'
              : 'bg-white/5 text-slate-400 border-white/10'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>{shieldActive ? 'Kalkan Devrede' : 'Pasif'}</span>
        </button>
      </div>

      {/* Cognitive Load Bar */}
      <div className="space-y-1.5 relative z-10">
        <div className="flex justify-between text-xs">
          <span className="text-slate-300 font-medium flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Zihinsel Durum:
            <strong className={isHighLoad ? 'text-rose-400 ml-1' : 'text-emerald-400 ml-1'}>
              {isHighLoad ? 'Kritik Sınır (Aşırı Zihinsel Yük)' : 'Dingin & Dengeli'}
            </strong>
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            {isDecompressed ? '20 Dk Mola Bloklandı' : 'Son 4 Saattir Aralıksız Toplantı'}
          </span>
        </div>

        <div className="h-2.5 w-full rounded-full bg-slate-950 p-0.5 border border-white/10 overflow-hidden">
          <div
            style={{ width: `${cognitiveScore}%` }}
            className={`h-full rounded-full transition-all duration-700 ${
              isHighLoad
                ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                : 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
            }`}
          />
        </div>
      </div>

      {/* Proactive Intervention Card */}
      {!isDecompressed ? (
        <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2 relative z-10">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-200 leading-relaxed">
              <strong className="text-indigo-300">AYZEK Koruyucu Müdahalesi: </strong>
              Bugün zihinsel sınırındasın. Son 4 saattir aralıksız toplantıdasın ve gelen mesajlarda stresli bir ton tespit ettim. Saat 16:30'daki esnek iç toplantıyı yarına kaydırmayı öneriyorum. Sana 20 dakikalık kahve ve nefes molası veriliyor.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/10 flex-wrap gap-2">
            <span className="text-[11px] text-slate-400">
              16:30 Toplantısı yarına kayar · 20 Dk kahve/nefes molası bloklanır
            </span>

            <button
              onClick={handleDecompress}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-[0_0_16px_rgba(99,102,241,0.4)] flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Saat 16:30 Toplantısını Kaydır & 20 Dk Mola Blokla</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between gap-3 relative z-10 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-white">Bilişsel Yük Korundu · Mola Devrede</span>
              <p className="text-[11px] text-emerald-300">
                16:30 toplantısı yarın 10:00'a kaydırıldı. 20 dk kahve & 4-7-8 nefes molası takvime işlendi.
              </p>
            </div>
          </div>

          {onOpenChatWithPrompt && (
            <button
              onClick={() => onOpenChatWithPrompt('Bilişsel yükümü hafifletmek için 5 dakikalık rehberli nefes egzersizi başlat')}
              className="text-[11px] text-cyan-300 hover:underline shrink-0"
            >
              Nefes Rehberi →
            </button>
          )}
        </div>
      )}
    </GlassCard>
  );
};
