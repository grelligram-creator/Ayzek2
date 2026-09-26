import React, { useState, useEffect } from 'react';
import {
  Heart,
  Sparkles,
  Copy,
  Check,
  Calendar,
  Gift,
  Smile,
  PhoneCall,
  Clock,
  Music,
  ShoppingBag,
  ArrowRight,
  BookOpen,
  MessageSquare,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { GlassSheet } from '../design-system/GlassSheet';
import { GlassCard } from '../design-system/GlassCard';
import { GlassButton } from '../design-system/GlassButton';

interface RelationshipAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlanTask: (title: string, preferredTime: string, category: string) => void;
  onNavigateToChat: (prompt: string) => void;
}

export const RelationshipAssistantModal: React.FC<RelationshipAssistantModalProps> = ({
  isOpen,
  onClose,
  onAddPlanTask,
  onNavigateToChat,
}) => {
  const [selectedPerson, setSelectedPerson] = useState<'Annem' | 'Zeynep' | 'Can'>('Annem');
  const [activeTab, setActiveTab] = useState<'empathy' | 'memory' | 'surprise'>('empathy');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [calledPersons, setCalledPersons] = useState<Record<string, boolean>>({});

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddTask = (title: string, time = '18:30') => {
    onAddPlanTask(title, time, 'personal');
    onClose();
  };

  const markCalled = (personKey: string) => {
    setCalledPersons((prev) => ({ ...prev, [personKey]: true }));
  };

  return (
    <GlassSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Derin İlişki Zekası & Vefa Asistanı"
      subtitle="Empati takibi, özel anı hafızası ve tek tıkla sürpriz / hediye motoru"
      maxWidth="2xl"
    >
      <div className="flex flex-col gap-4">
        {/* Person Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-white/10">
          <button
            onClick={() => setSelectedPerson('Annem')}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              selectedPerson === 'Annem'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>Annem (Fatma) · 28 Eylül</span>
          </button>

          <button
            onClick={() => setSelectedPerson('Zeynep')}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              selectedPerson === 'Zeynep'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Zeynep (Eş/Partner)</span>
          </button>

          <button
            onClick={() => setSelectedPerson('Can')}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              selectedPerson === 'Can'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>⚡ Can (Kardeş) · Sınav</span>
          </button>
        </div>

        {/* 3 Core Functional Sub-tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('empathy')}
            className={`text-xs pb-1 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'empathy'
                ? 'text-rose-300 border-b-2 border-rose-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>1. Empati & Vefa Takibi</span>
          </button>

          <button
            onClick={() => setActiveTab('memory')}
            className={`text-xs pb-1 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'memory'
                ? 'text-cyan-300 border-b-2 border-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>2. Özel Gün & Anı Hafızası</span>
          </button>

          <button
            onClick={() => setActiveTab('surprise')}
            className={`text-xs pb-1 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'surprise'
                ? 'text-amber-300 border-b-2 border-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>3. Tek Tıkla Sürpriz & Hediye</span>
          </button>
        </div>

        {/* TAB 1: EMPATİ & VEFA TAKİBİ */}
        {activeTab === 'empathy' && (
          <div className="space-y-3 animate-fade-in">
            {selectedPerson === 'Annem' && (
              <GlassCard className="p-4 border-rose-500/30 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0 border border-rose-500/30">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        Vefa Sinyali: Annem Fatma Hanım
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono">
                        Son Arama: 4 Gün Önce
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                      "Annem 4 gün önce aradığında tansiyonundan bahsetmişti; iş çıkışında 5 dakikalık bir hatır sorma harika hissettirir."
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-300 block">
                    💬 Tavsiye Edilen Konuşma Açılışı:
                  </span>
                  <p className="text-xs text-slate-300 italic">
                    "Anneciğim selam, mesaim bitti seni aklımdan çıkaramadım. Geçen tansiyonun yükselmişti ya, bugün nasılsın, ilacını alabildin mi?"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                  <span className="text-[11px] text-slate-400">
                    {calledPersons['annem'] ? '✅ Bugün arandı olarak işaretlendi' : '18:30 iş çıkışına eklenir'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => markCalled('annem')}
                      className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs border border-white/10 transition-colors cursor-pointer"
                    >
                      {calledPersons['annem'] ? 'Arandı ✓' : 'Aradım'}
                    </button>
                    <button
                      onClick={() => handleAddTask('Annemi 5 dk ara (Tansiyon takibi & hatır sorma)', '18:30')}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Bugünkü Plana 5 Dk Arama Ekle</span>
                    </button>
                  </div>
                </div>
              </GlassCard>
            )}

            {selectedPerson === 'Zeynep' && (
              <GlassCard className="p-4 border-indigo-500/30 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-500/30">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        Duygusal Empati: Zeynep
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                        Yüksek Yorgunluk Tespiti
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                      "Zeynep dün teslimattan döndüğünde çok yorgundu; akşam ona Moda sahilinde ufak bir yürüyüş ve papatya çayı harika hissettirecektir."
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                  <span className="text-[11px] text-slate-400">19:00 sahil dinlenme saati</span>
                  <button
                    onClick={() => handleAddTask('Zeynep ile Moda sahilinde 20 dk dingin yürüyüş', '19:00')}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <span>Sahil Yürüyüşünü Plana Ekle</span>
                  </button>
                </div>
              </GlassCard>
            )}

            {selectedPerson === 'Can' && (
              <GlassCard className="p-4 border-cyan-500/30 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-500/30">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        Kardeş Desteği: Can
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                        Cumartesi 10:00 Sınav
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                      "Can bu Cumartesi AWS Cloud Architect sertifika sınavına giriyor. Cuma akşamı moral mesajı veya Cumartesi sabahı motive edici bir arama motivasyonunu yükseltir."
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                  <span className="text-[11px] text-slate-400">Cuma 20:00 Hatırlatması</span>
                  <button
                    onClick={() => handleAddTask("Can'a AWS sınavı moral mesajı gönder", '20:00')}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Cuma Günü Hatırlatıcı Ekle</span>
                  </button>
                </div>
              </GlassCard>
            )}
          </div>
        )}

        {/* TAB 2: ÖZEL GÜN & ANI HAFIZASI */}
        {activeTab === 'memory' && (
          <div className="space-y-3 animate-fade-in">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-white/10">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 mb-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                AYZEK Derin Anı Hafıza Matrisi ({selectedPerson})
              </span>

              {selectedPerson === 'Annem' && (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-white/5 flex items-start gap-2">
                    <span className="text-rose-400 font-bold">🍰 En Sevdiği Tatlı:</span>
                    <span className="text-slate-200">Fıstıklı Antep Katmeri ve Karaköy usulü Fıstıklı Trileçe.</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-white/5 flex items-start gap-2">
                    <span className="text-rose-400 font-bold">💐 Sevdiği Çiçek:</span>
                    <span className="text-slate-200">Beyaz Ortanca ve taze pastel Laleler (salon köşesine koymayı seviyor).</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-white/5 flex items-start gap-2">
                    <span className="text-rose-400 font-bold">📅 Kritik Tarih:</span>
                    <span className="text-slate-200">28 Eylül Doğum Günü (4 gün kaldı, keten fotoğraf albümü anısı).</span>
                  </div>
                </div>
              )}

              {selectedPerson === 'Zeynep' && (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-white/5 flex items-start gap-2">
                    <Music className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-indigo-300">Sevdiği Plak Sanatçısı: </strong>
                      <span className="text-slate-200">Jakuzi ve Teoman 33'lük LP vinil plakları. Pikapta analog ses dinlemeyi seviyor.</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-white/5 flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">☕ Kahve & Mekan:</span>
                    <span className="text-slate-200">Moda'daki sakin üçüncü nesil kahvecilerde Yirgacheffe pour-over filtre kahve.</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-white/5 flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">📅 Özel Gün:</span>
                    <span className="text-slate-200">20 Ekim Birliktelik Yıldönümü.</span>
                  </div>
                </div>
              )}

              {selectedPerson === 'Can' && (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-white/5 flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">🎯 Sınav & Hedef:</span>
                    <span className="text-slate-200">Cumartesi 10:00 AWS Cloud Solutions Architect Sertifikası.</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-white/5 flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">📷 Hobi:</span>
                    <span className="text-slate-200">Analog fotoğrafçılık (Kodak Portra 400 film rulolarını hediye olarak çok seviyor).</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: TEK TIKLA SÜRPRİZ & HEDİYE SİPARİŞ TASLAĞI */}
        {activeTab === 'surprise' && (
          <div className="space-y-3 animate-fade-in">
            {selectedPerson === 'Annem' && (
              <div className="space-y-3">
                <GlassCard className="p-4 border-rose-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-rose-400" />
                      <span className="text-xs font-bold text-white">
                        Doğum Günü Hediye Paketi: Beyaz Ortanca & Fıstıklı Trileçe
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                      Bütçe: 850 TL
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Annemin anı hafızasında yer alan beyaz ortanca buketi ve en sevdiği tatlı olan fıstıklı trileçe paketi.
                  </p>

                  {/* Order Draft Box */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] font-bold text-rose-300 uppercase tracking-wide">
                        Tek Tıkla Sipariş / Not Taslağı:
                      </span>
                      <button
                        onClick={() =>
                          handleCopy(
                            'gift-order-annem',
                            'Sipariş: 1x Pastel Beyaz Ortanca Buketi + 1x Gurme Fıstıklı Trileçe Kutusu. Not Kartı: Canım Annem, doğum günün kutlu olsun. Evimizin neşesi, her şeyimizsin. Sağlıkla, huzurla nice yaşlara. — Görkem',
                          )
                        }
                        className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === 'gift-order-annem' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Kopyalandı</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Sipariş Taslağını Kopyala</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-200 font-mono bg-black/40 p-2.5 rounded-lg border border-white/5">
                      "Canım Annem, doğum günün kutlu olsun. Evimizin neşesi, her şeyimizsin. Sağlıkla, huzurla nice yaşlara. — Görkem"
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleAddTask('Anneme pasta ve çiçek siparişi ver', '12:00')}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Siparişi 28 Eylül Görevlerine Ekle</span>
                    </button>
                  </div>
                </GlassCard>
              </div>
            )}

            {selectedPerson === 'Zeynep' && (
              <GlassCard className="p-4 border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white">
                      Sürpriz: Jakuzi Vinil 33'lük LP Plak + Moda Sahil Yürüyüşü
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                    Bütçe: 950 TL
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Zeynep'in son dönem iş stresini hafifletmek ve pikap sevgisini taçlandırmak için Kadıköy'deki plakçıdan Jakuzi albümü ve akşam sahil yürüyüşü.
                </p>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold text-indigo-300 uppercase tracking-wide">
                      Plak Notu Taslağı:
                    </span>
                    <button
                      onClick={() =>
                        handleCopy(
                          'gift-order-zeynep',
                          'Zeynep için kart notu: Sevgilim, yoğun teslimat haftanın yorgunluğunu birlikte dinleyeceğimiz bu plak alsın gitsin. Akşam kahveler benden. Seni seviyorum.',
                        )
                      }
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === 'gift-order-zeynep' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Kopyalandı</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Notu Kopyala</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-200 font-mono bg-black/40 p-2.5 rounded-lg border border-white/5">
                    "Yoğun haftanın yorgunluğunu birlikte dinleyeceğimiz bu plak alsın gitsin. Akşam kahveler benden."
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleAddTask("Zeynep'e plak sürprizi ve sahil yürüyüşü", '18:45')}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <span>Sürprizi Akşam Planına Ekle</span>
                  </button>
                </div>
              </GlassCard>
            )}

            {selectedPerson === 'Can' && (
              <GlassCard className="p-4 border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    Can İçin: 2x Kodak Portra 400 Analog Film Hediyesi
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                    Bütçe: 600 TL
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  AWS sınavı sonrası rahatlaması için sevdiği analog fotoğraf makinesine 2 kutu renkli film.
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleAddTask("Can'a sınav sonrası analog film hediye et", '14:00')}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer"
                  >
                    Hafta Sonu Görevine Ekle
                  </button>
                </div>
              </GlassCard>
            )}
          </div>
        )}
      </div>
    </GlassSheet>
  );
};
