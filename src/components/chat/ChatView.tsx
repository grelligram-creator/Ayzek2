import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  CheckCircle2,
  Wrench,
  Clock,
  ArrowRight,
  Shield,
  Brain,
  Heart,
  MapPin,
  ExternalLink,
  Calendar,
  Check,
  Zap,
  Globe,
} from 'lucide-react';
import { ChatMessage, UserProfile, VenueRecommendation } from '../../types/ayzek';
import { GlassCard } from '../design-system/GlassCard';
import { GlassButton } from '../design-system/GlassButton';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  profile: UserProfile;
  onAddPlanTask?: (title: string, preferredTime: string, category: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  isLoading,
  profile,
  onAddPlanTask,
}) => {
  const [inputText, setInputText] = useState('');
  const [addedVenues, setAddedVenues] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (isLoading) return;
    onSendMessage(suggestion);
  };

  const handleAddVenueToPlan = (venue: VenueRecommendation) => {
    if (onAddPlanTask) {
      onAddPlanTask(`${venue.name} Ziyareti & Buluşması`, '19:00', 'personal');
      setAddedVenues((prev) => ({ ...prev, [venue.id]: true }));
    }
  };

  const quickPrompts = [
    'WhatsApp: Zeynep ne yazmıştı?',
    'Teams: Sprint kararları ve görevlerim neler?',
    'Meet: Q3 strateji toplantısı özeti',
    'Saat 15:00 için tasarım toplantısı ekle',
    'Market alışverişi görevini tamamladım',
    'Zeynep ile kaliteli vakit için sakin bir yer öner',
    'Anneme doğum günü için duygu dolu bir mektup hazırla',
    'Yarın işe giderken ne giyeyim? Moda havasına uygun kombin öner',
  ];

  return (
    <div className="flex flex-col h-[calc(100dvh-130px)] max-w-xl mx-auto w-full">
      {/* Header bar: 4-in-1 Persona representation */}
      <div className="py-2 border-b border-white/10 shrink-0 mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-500 to-rose-500 flex items-center justify-center text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              A
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                  AYZEK
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                </h1>
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 font-medium">
                  Psikolog · Yaşam Koçu · Spor Hocası · Dost
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate max-w-[260px]">
                {profile.locationContext?.home || 'Kadıköy, Moda'} · {profile.personalDetails?.workplace || 'Levent Grispi'} · {profile.personalDetails?.clothingStyle ? 'Smart-Casual' : 'Kişisel Hafıza'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded-lg shrink-0">
            <Shield className="w-3 h-3" />
            <span>Kişisel Hafıza Aktif</span>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-cyan-500 text-slate-950 font-medium shadow-[0_4px_16px_rgba(6,182,212,0.25)] rounded-br-sm'
                    : 'bg-slate-900/80 backdrop-blur-xl border border-white/10 text-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-bl-sm'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Automatically Extracted Memories Banner */}
                {msg.extractedMemories && msg.extractedMemories.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-cyan-500/20 space-y-1">
                    <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Kalıcı Hafızaya Alındı
                    </span>
                    {msg.extractedMemories.map((mem, i) => (
                      <div
                        key={i}
                        className="text-[11px] p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 flex items-start gap-1.5"
                      >
                        <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{mem}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Google Search Grounding Verification Badge */}
                {msg.groundingSources && msg.groundingSources.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-cyan-500/20 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                      <Globe className="w-3 h-3 text-cyan-400" />
                      <span>Google Search Doğrulaması</span>
                      {msg.searchQueries && msg.searchQueries.length > 0 && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-white/10 font-normal text-slate-300 lowercase truncate max-w-[150px]">
                          "{msg.searchQueries[0]}"
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      {msg.groundingSources.map((source, i) => (
                        <a
                          key={i}
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-white/10 hover:border-cyan-500/40 text-[11px] text-slate-300 hover:text-cyan-200 transition-colors group"
                        >
                          <div className="truncate pr-2">
                            <span className="font-semibold text-white block truncate">{source.title}</span>
                            {source.snippet && (
                              <span className="text-[10px] text-slate-400 truncate block">{source.snippet}</span>
                            )}
                          </div>
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-cyan-400 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Venues & Locations Cards */}
                {msg.recommendedVenues && msg.recommendedVenues.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-white/10 space-y-2">
                    <span className="text-[10px] text-rose-300 font-bold uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-400" />
                      Önerilen Mekanlar & Konumlar
                    </span>
                    {msg.recommendedVenues.map((venue) => {
                      const isAdded = addedVenues[venue.id];
                      return (
                        <div
                          key={venue.id}
                          className="p-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-xs flex flex-col gap-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-semibold text-slate-100">{venue.name}</h4>
                              <p className="text-[11px] text-slate-400">{venue.district} · {venue.vibe}</p>
                            </div>

                            {venue.googleMapsUrl && (
                              <a
                                href={venue.googleMapsUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-cyan-300 hover:text-white flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 shrink-0"
                              >
                                <span>Harita</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                            <span className="text-[10.5px] italic text-slate-300">
                              {venue.whySuggested}
                            </span>

                            {onAddPlanTask && (
                              <button
                                onClick={() => handleAddVenueToPlan(venue)}
                                disabled={isAdded}
                                className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 shrink-0 transition-colors cursor-pointer disabled:opacity-50"
                              >
                                {isAdded ? '✓ Plana Eklendi' : '+ Planıma Ekle'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Tool Invocations feedback badge */}
                {msg.toolInvocations && msg.toolInvocations.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-white/10 space-y-1.5">
                    {msg.toolInvocations.map((tool, idx) => {
                      const isTaskCreate = tool.toolName === 'create_task';
                      const isTaskComplete = tool.toolName === 'complete_task';
                      const isTaskDelete = tool.toolName === 'delete_task';
                      const isIntegration = tool.toolName === 'query_integrations';
                      const isMemory = tool.toolName === 'save_memory';

                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-xl border ${
                            isTaskCreate || isTaskComplete
                              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                              : isIntegration
                              ? 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300'
                              : isMemory
                              ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                              : isTaskDelete
                              ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                              : 'bg-cyan-950/60 border-cyan-500/30 text-cyan-300'
                          }`}
                        >
                          <Zap className="w-3 h-3 shrink-0" />
                          <span className="font-semibold shrink-0">
                            {isTaskCreate ? 'Görev Eklendi' : isTaskComplete ? 'Görev Tamamlandı' : isIntegration ? 'Entegrasyon Sorgulandı' : isMemory ? 'Hafıza Mühürlendi' : isTaskDelete ? 'Görev Silindi' : tool.toolName}
                          </span>
                          <span className="text-white/40">·</span>
                          <span className="truncate text-[10.5px] opacity-90">{tool.result?.message || 'Aksiyon başarıyla yürütüldü'}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <span className="text-[10px] text-slate-500 px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>

              {/* Suggestions chips */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {msg.suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(s)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-900/80 border border-white/10 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/30 transition-all cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex items-center gap-2 max-w-[80%] rounded-2xl px-4 py-3 bg-slate-900/80 border border-white/10 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>AYZEK psikolog & yaşam koçu bilgeliğiyle değerlendiriyor...</span>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Quick Starter Chips */}
      <div className="py-2 overflow-x-auto flex items-center gap-1.5 custom-scrollbar shrink-0">
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSuggestionClick(prompt)}
            className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/30 whitespace-nowrap transition-all cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="pt-2 shrink-0 pb-20 sm:pb-16">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="AYZEK'e Zeynep'i, anneni, modunu veya günün planını anlat..."
            disabled={isLoading}
            className="w-full rounded-2xl bg-slate-900/90 border border-white/15 pl-4 pr-12 py-3 text-sm text-slate-100 placeholder-slate-500 backdrop-blur-2xl focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="absolute right-2 p-2 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 transition-all cursor-pointer"
            title="Gönder"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
