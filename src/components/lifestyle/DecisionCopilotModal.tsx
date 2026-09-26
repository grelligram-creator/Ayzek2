import React, { useState } from 'react';
import {
  Scale,
  Brain,
  Sparkles,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ShieldCheck,
  Compass,
  ArrowRight,
  X,
  Target,
} from 'lucide-react';
import { GlassCard } from '../design-system/GlassCard';

interface DecisionCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToChat: (prompt: string) => void;
}

interface DilemmaPreset {
  id: string;
  title: string;
  category: 'career' | 'finance' | 'lifestyle';
  description: string;
  alignmentScore: number; // 0 - 100
  recommendation: string;
  pros: string[];
  cons: string[];
  longTermImpact: string;
}

export const DecisionCopilotModal: React.FC<DecisionCopilotModalProps> = ({
  isOpen,
  onClose,
  onNavigateToChat,
}) => {
  const presets: DilemmaPreset[] = [
    {
      id: 'dil-1',
      title: "Grispi'den Başka Bir Şirkete Geçmeli miyim?",
      category: 'career',
      description: 'Mevcut şirketim Grispi’deki sorumluluklarım ile %35 daha yüksek döviz maaşlı global teklif arasında kaldım.',
      alignmentScore: 88,
      recommendation: 'Teklifi kabul etmek stratejik açıdan çok güçlü. C1 İngilizce hedefin ve finansal özgürlük vizyonunla %88 uyumlu. Ancak haftalık çalışma saatlerini netleştirip Zeynep ile vakti koruman şartıyla.',
      pros: [
        'C1 İngilizce pratiğini günlük iş akışının doğal bir parçası haline getirir.',
        'Döviz bazlı birikim sayesinde yıllık 150.000 TL fon hedefine 4 ay erken ulaşılır.',
        'Global network ve uluslararası SaaS referansı sağlar.',
      ],
      cons: [
        'Farklı zaman dilimi nedeniyle akşam 18:00 sonrası toplantı riski artar (Smart Guard zorlanabilir).',
        'Yeni adaptasyon sürecinin ilk 60 gününde zihinsel stres seviyesi yükselecektir.',
      ],
      longTermImpact: '6 Aylık gelişim vizyonunu hızlandırır, finansal özgürlük yolunu açar.',
    },
    {
      id: 'dil-2',
      title: 'Bu Arabayı Şimdi Almalı mıyım?',
      category: 'finance',
      description: 'Mevcut 2022 BMW 320i aracımı üst modele yenilemek veya parayı fon/gayrimenkul birikimine ayırmak.',
      alignmentScore: 92,
      recommendation: 'Kesinlikle Pasif Yatırım ve Birikim tercih edilmeli. Mevcut aracının muayenesi Kasım 2026’ya kadar geçerli ve henüz 42.500 km’de. Yeni araba almak amortisman ve kasko yükü yaratırken, yatırım fonu finansal hedefini destekler.',
      pros: [
        'Mevcut araba mükemmel kondisyonda; masrafsız sürüş devam edebilir.',
        'Aylık tasarruf oranı %24 seviyesinde korunarak portföy büyümesi sürer.',
        'Gereksiz kasko ve vergi artışından tasarruf edilir.',
      ],
      cons: [
        'Yeni model heyecanı ve statü tatmini ertelenir.',
      ],
      longTermImpact: 'Yıl sonu 150.000 TL acil durum fonu ve pasif gelir temeli güçlenir.',
    },
    {
      id: 'dil-3',
      title: 'Moda’daki Evi Yenilemek mi, Yoksa Başka Semte Taşınmak mı?',
      category: 'lifestyle',
      description: 'Caferağa sahil hattındaki evde kalıp iç mimariyi yenilemek mi, Maslak ofise yakın bir yere taşınmak mı?',
      alignmentScore: 84,
      recommendation: 'Moda’da kalıp iç mimariyi yenilemek ruh sağlığı ve ilişki dengesi için çok daha değerli. Zeynep mimar olduğu için yenileme projesi ortak bir yaratıcı bağ yaratacaktır; ayrıca Moda sahil yürüyüşleri zihinsel kortizolü düşüren ana unsurdur.',
      pros: [
        'Zeynep ile ortak estetik proje; kaliteli paylaşılan zaman artar.',
        'Sevdiğin çay bahçeleri, deniz havası ve yürüyüş parkuru korunur.',
        'Taşınma stresi ve yeni çevre yabancılaşması yaşanmaz.',
      ],
      cons: [
        'Levent mesaisi için haftada birkaç gün gidiş-dönüş seyahati devam eder.',
      ],
      longTermImpact: 'Duygusal aidiyet ve psikolojik dinginlik en üst seviyede korunur.',
    },
  ];

  const [selectedDilemma, setSelectedDilemma] = useState<DilemmaPreset>(presets[0]);
  const [customQuestion, setCustomQuestion] = useState('');

  if (!isOpen) return null;

  const handleConsultChat = (questionText: string) => {
    onClose();
    onNavigateToChat(`Bir ikilemde kaldım, karar vermeme bir stratejist ve mentör gibi yardım et: "${questionText}". Bütçemi, kariyer hedeflerimi ve aile dengemi gözet.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900/90 border border-white/15 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.85)] text-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 -right-20 w-52 h-52 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-cyan-500 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_16px_rgba(245,158,11,0.35)]">
              <Scale className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                İkilem Çözücü & Karar Matrisi
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                  Decision Copilot
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Hedeflerini, bütçeni ve değerlerini tartan rasyonel zeka
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 custom-scrollbar">
          {/* Preset Buttons */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-300">
              Analiz Edilen Örnek İkilemler:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedDilemma(preset)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedDilemma.id === preset.id
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                      : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs font-semibold block line-clamp-2 leading-tight">
                    {preset.title}
                  </span>
                  <span className="text-[10px] text-cyan-400 mt-1 block">
                    Uyum: %{preset.alignmentScore}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Dilemma Analysis Card */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/15 space-y-3.5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{selectedDilemma.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  Stratejik Uyum: %{selectedDilemma.alignmentScore}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{selectedDilemma.description}</p>
            </div>

            {/* Pros and Cons Split */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
              {/* Pros */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Avantajlar & Kazanımlar
                </span>
                <ul className="space-y-1">
                  {selectedDilemma.pros.map((pro, i) => (
                    <li key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  Riskler & Dikkat Noktaları
                </span>
                <ul className="space-y-1">
                  {selectedDilemma.cons.map((con, i) => (
                    <li key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                      <span className="text-rose-400 mt-0.5">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommendation Box */}
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-1">
              <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                AYZEK Mentör Tavsiyesi:
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {selectedDilemma.recommendation}
              </p>
            </div>

            {/* Action button */}
            <button
              onClick={() => handleConsultChat(selectedDilemma.title)}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Bu Kararı AYZEK ile Sohbette Derinleştir</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Custom Dilemma Input */}
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-cyan-400" />
              Kendi Kararını / İkilemini Danış:
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Örn: Bu yıl İngiltere'ye dil kursuna gitmeli miyim?"
                className="flex-1 text-xs px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={() => {
                  if (customQuestion.trim()) {
                    handleConsultChat(customQuestion.trim());
                  }
                }}
                disabled={!customQuestion.trim()}
                className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                Danış
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
