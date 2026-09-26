import React, { useState } from 'react';
import {
  Heart,
  Brain,
  Sparkles,
  MapPin,
  ExternalLink,
  MessageSquare,
  Plus,
  UserPlus,
  Send,
  Calendar,
  Check,
  AlertCircle,
  Clock,
  Shield,
  Smile,
} from 'lucide-react';
import { PersonProfile, VenueRecommendation } from '../../types/ayzek';
import { GlassCard } from '../design-system/GlassCard';
import { GlassButton } from '../design-system/GlassButton';
import { GlassInput } from '../design-system/GlassInput';

interface SocialRelationshipsViewProps {
  people: PersonProfile[];
  onAddNoteToPerson: (personId: string, note: string) => Promise<void>;
  onAddNewPerson: (person: Partial<PersonProfile>) => Promise<void>;
  onOpenChatWithPrompt: (prompt: string) => void;
  onAddPlanTask: (title: string, preferredTime: string, category: string) => void;
}

export const SocialRelationshipsView: React.FC<SocialRelationshipsViewProps> = ({
  people,
  onAddNoteToPerson,
  onAddNewPerson,
  onOpenChatWithPrompt,
  onAddPlanTask,
}) => {
  const [selectedPersonId, setSelectedPersonId] = useState<string>(people[0]?.id || '');
  const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [addedVenues, setAddedVenues] = useState<Record<string, boolean>>({});

  // Form states for new person
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('Arkadaş / Dost');
  const [newNotes, setNewNotes] = useState('');

  const currentPerson = people.find((p) => p.id === selectedPersonId) || people[0];

  const handleAddNote = async () => {
    if (!newNoteText.trim() || !currentPerson) return;
    setIsAddingNote(true);
    await onAddNoteToPerson(currentPerson.id, newNoteText.trim());
    setNewNoteText('');
    setIsAddingNote(false);
  };

  const handleCreatePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    await onAddNewPerson({
      name: newName.trim(),
      relation: newRelation,
      avatarEmoji: '👤',
      avatarColor: 'from-cyan-500 to-indigo-600',
      lastContactDate: 'Yeni eklendi',
      proactiveStatus: 'healthy',
      psychologicalAnalysis: {
        archetype: 'Dengeli & Açık İletişim',
        attachmentStyle: 'Güvenli (Secure)',
        communicationStyle: 'Samimi ve doğrudan sohbet.',
        stressTriggers: ['Belirsizlik'],
        loveLanguage: 'Kaliteli Zaman',
        psychologistAdvice: `${newName} ile düzenli aralıklarla hatır sormak ve açık iletişim kurmak bağı korur.`,
      },
      keyMemories: newNotes ? [newNotes] : [],
      conversationStarters: [
        `${newName} için nazik bir selam mesajı hazırla`,
        `${newName} ile hafta sonu için kahve buluşması planla`,
      ],
    });

    setNewName('');
    setNewNotes('');
    setIsAddPersonModalOpen(false);
  };

  const handleAddVenue = (venue: VenueRecommendation) => {
    onAddPlanTask(`${venue.name} Ziyareti & Buluşması`, '19:30', 'personal');
    setAddedVenues((prev) => ({ ...prev, [venue.id]: true }));
  };

  return (
    <div className="flex flex-col gap-4 pb-20 max-w-xl mx-auto w-full">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-400" />
            <span>Sosyal Çevre & İlişkiler</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Bağlanma stilleri, psikolog analizleri ve kaliteli ortak anlar.
          </p>
        </div>

        <button
          onClick={() => setIsAddPersonModalOpen(true)}
          className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition-all flex items-center gap-1 cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
          <span>Kişi Ekle</span>
        </button>
      </div>

      {/* People Selector Carousel */}
      <div className="w-full flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {people.map((person) => {
          const isSelected = person.id === (currentPerson?.id || '');
          const isUrgent = person.proactiveStatus === 'urgent_checkin';
          const isWarning = person.proactiveStatus === 'needs_attention';

          return (
            <button
              key={person.id}
              onClick={() => setSelectedPersonId(person.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-2xl border text-left transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-rose-500/20 border-rose-400/50 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
                  : 'bg-slate-900/60 border-white/10 hover:border-white/20'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${person.avatarColor || 'from-rose-500 to-indigo-500'} flex items-center justify-center text-sm shadow-sm relative`}
              >
                {person.avatarEmoji || '🌸'}
                {isUrgent && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border border-slate-950 animate-pulse" />
                )}
                {isWarning && !isUrgent && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-950" />
                )}
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-100">{person.name}</h4>
                <p className="text-[10px] text-slate-400">{person.relation}</p>
              </div>
            </button>
          );
        })}
      </div>

      {currentPerson && (
        <div className="space-y-4">
          {/* Proactive Nudge Alert Card */}
          {currentPerson.proactiveNudge && (
            <GlassCard variant="default" className="p-3.5 border-rose-500/30 bg-gradient-to-br from-rose-950/30 via-slate-900/80 to-slate-950/80">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-400/30 shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">
                      Proaktif Yaklaşım Önerisi
                    </span>
                    <span className="text-[10px] text-slate-400">Son İletişim: {currentPerson.lastContactDate}</span>
                  </div>
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                    {currentPerson.proactiveNudge}
                  </p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Psychological Deep Analysis */}
          <GlassCard variant="default" className="p-4 space-y-3 border-indigo-500/25 bg-gradient-to-br from-slate-900/80 via-indigo-950/20 to-slate-950/80">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Psikolog Gözüyle Karakter Analizi
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 font-semibold">
                {currentPerson.psychologicalAnalysis.attachmentStyle}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 font-medium">Kişilik Arketipi</span>
                <p className="text-xs font-semibold text-slate-100">
                  {currentPerson.psychologicalAnalysis.archetype}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 font-medium">Sevgi Dili</span>
                <p className="text-xs font-semibold text-rose-300">
                  {currentPerson.psychologicalAnalysis.loveLanguage}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/25 space-y-1">
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
                Psikolog Yaşam Rehberi
              </span>
              <p className="text-xs text-slate-200 leading-relaxed italic">
                "{currentPerson.psychologicalAnalysis.psychologistAdvice}"
              </p>
            </div>
          </GlassCard>

          {/* Recommended Venues for this Person */}
          {currentPerson.recommendedVenues && currentPerson.recommendedVenues.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>{currentPerson.name} İçin Önerilen Dinlendirici Mekanlar</span>
              </h3>

              <div className="space-y-2">
                {currentPerson.recommendedVenues.map((venue) => {
                  const isAdded = addedVenues[venue.id];
                  return (
                    <GlassCard key={venue.id} variant="default" className="p-3 text-xs flex flex-col gap-2">
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
                            className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-cyan-300 flex items-center gap-1 shrink-0"
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
                        <button
                          onClick={() => handleAddVenue(venue)}
                          disabled={isAdded}
                          className="text-[10.5px] px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 shrink-0 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isAdded ? '✓ Plana Eklendi' : '+ Planıma Ekle'}
                        </button>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Chat Starters for this Person */}
          {currentPerson.conversationStarters && currentPerson.conversationStarters.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-cyan-400" />
                <span>AYZEK ile {currentPerson.name} Hakkında Konuş</span>
              </span>

              <div className="flex flex-wrap gap-1.5">
                {currentPerson.conversationStarters.map((starter, idx) => (
                  <button
                    key={idx}
                    onClick={() => onOpenChatWithPrompt(starter)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 hover:border-cyan-500/40 text-slate-200 hover:text-cyan-200 transition-all text-left cursor-pointer"
                  >
                    💬 {starter}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add a Personal Memory/Note */}
          <GlassCard variant="default" className="p-3.5 space-y-2">
            <span className="text-xs font-semibold text-slate-200 block">
              {currentPerson.name} Hakkında Yeni Bir Not veya Anı Ekle
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Örn: Plak dinlemeyi ve deniz kenarında yürüyüşü çok seviyor..."
                className="flex-1 text-xs rounded-xl bg-slate-900/90 border border-white/15 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
              <GlassButton
                variant="primary"
                onClick={handleAddNote}
                disabled={!newNoteText.trim() || isAddingNote}
                className="shrink-0 text-xs py-2 px-3"
              >
                {isAddingNote ? '...' : 'Kaydet'}
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Add New Person Modal */}
      {isAddPersonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <GlassCard variant="default" className="w-full max-w-sm p-4 space-y-4 border-cyan-500/30">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-cyan-400" />
                <span>Yeni Kişi Ekle</span>
              </h3>
              <button
                onClick={() => setIsAddPersonModalOpen(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Kapat
              </button>
            </div>

            <form onSubmit={handleCreatePerson} className="space-y-3">
              <GlassInput
                label="Adı"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Örn: Deniz, Ahmet, Canan..."
              />
              <GlassInput
                label="Yakınlık Derecesi"
                value={newRelation}
                onChange={(e) => setNewRelation(e.target.value)}
                placeholder="Örn: İş Ortağı, Kardeş, Yakın Dost..."
              />
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Önemli Notlar & Hassasiyetler
                </label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={2}
                  className="w-full text-xs rounded-xl bg-slate-900 border border-white/15 px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500/50"
                  placeholder="Onu mutlu eden şeyler, iletişim tercihleri..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <GlassButton
                  variant="secondary"
                  type="button"
                  onClick={() => setIsAddPersonModalOpen(false)}
                >
                  İptal
                </GlassButton>
                <GlassButton variant="primary" type="submit" disabled={!newName.trim()}>
                  Kişiyi Ekle
                </GlassButton>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
