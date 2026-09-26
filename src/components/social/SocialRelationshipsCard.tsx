import React from 'react';
import {
  Heart,
  Brain,
  Sparkles,
  ArrowRight,
  MapPin,
  AlertCircle,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';
import { PersonProfile } from '../../types/ayzek';
import { GlassCard } from '../design-system/GlassCard';
import { GlassButton } from '../design-system/GlassButton';

interface SocialRelationshipsCardProps {
  people: PersonProfile[];
  onNavigateToSocial: () => void;
  onOpenChatWithPrompt: (prompt: string) => void;
}

export const SocialRelationshipsCard: React.FC<SocialRelationshipsCardProps> = ({
  people,
  onNavigateToSocial,
  onOpenChatWithPrompt,
}) => {
  // Find urgent check-in or first person
  const urgentPerson =
    people.find((p) => p.proactiveStatus === 'urgent_checkin') ||
    people.find((p) => p.proactiveStatus === 'needs_attention') ||
    people[0];

  if (!urgentPerson) return null;

  return (
    <GlassCard variant="default" className="p-3.5 sm:p-4 relative overflow-hidden border-rose-500/25 bg-gradient-to-br from-slate-900/80 via-rose-950/20 to-slate-950/80 shadow-md">
      {/* Specular fluid light accent */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-400/30">
            <Heart className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-rose-300 font-bold uppercase tracking-wider">
                Sosyal Çevre & Psikolojik Dinamikler
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-400/20">
                Psikolog Analizi
              </span>
            </div>
            <h3 className="text-xs font-semibold text-slate-100 mt-0.5">
              {urgentPerson.name} · {urgentPerson.relation}
            </h3>
          </div>
        </div>

        <button
          onClick={onNavigateToSocial}
          className="text-[11px] text-rose-300 hover:text-white flex items-center gap-0.5 transition-colors cursor-pointer"
        >
          <span>Tümünü Gör</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Proactive Insight & Psychologist advice */}
      <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 mb-2.5 text-xs text-slate-200">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-[11.5px] leading-snug text-slate-200 font-medium">
              {urgentPerson.proactiveNudge || urgentPerson.psychologicalAnalysis.psychologistAdvice}
            </p>
            {urgentPerson.recommendedVenues && urgentPerson.recommendedVenues[0] && (
              <p className="text-[10.5px] text-rose-300/90 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-400" />
                <span>Önerilen Mekan: {urgentPerson.recommendedVenues[0].name} ({urgentPerson.recommendedVenues[0].district})</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Person selector Avatars & Action */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5 text-xs">
        <div className="flex items-center gap-1.5">
          {people.slice(0, 3).map((p) => (
            <button
              key={p.id}
              onClick={onNavigateToSocial}
              className="w-7 h-7 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-xs hover:scale-105 transition-transform"
              title={`${p.name} (${p.relation})`}
            >
              {p.avatarEmoji || '👤'}
            </button>
          ))}
          <span className="text-[10px] text-slate-400 ml-1">Karakter kartları aktif</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <GlassButton
            size="sm"
            variant="ghost"
            onClick={() =>
              onOpenChatWithPrompt(
                `${urgentPerson.name} ile ilgili psikolojik dinamikleri ve iletişim yaklaşımımızı nasıl yönetelim? Psikolog ve bilge dost tavsiyeni dinlemek istiyorum.`
              )
            }
            className="text-[11px] py-1 px-2.5 gap-1 h-7 text-rose-300 hover:text-white"
          >
            <MessageSquare className="w-3 h-3" />
            <span>Sohbet Et</span>
          </GlassButton>

          <GlassButton
            size="sm"
            variant="secondary"
            onClick={onNavigateToSocial}
            className="text-[11px] py-1 px-2.5 gap-1 h-7"
          >
            <span>Kişi Kartı</span>
            <ChevronRight className="w-3 h-3" />
          </GlassButton>
        </div>
      </div>
    </GlassCard>
  );
};
