import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Clock,
  Heart,
  Activity,
  CheckCircle2,
  Calendar,
  Flower2,
  MapPin,
  Shirt,
  Briefcase,
  Share2,
  Brain,
  Shield,
  Zap,
} from 'lucide-react';
import { GlassSheet } from '../design-system/GlassSheet';
import { GlassButton } from '../design-system/GlassButton';
import { GlassInput } from '../design-system/GlassInput';

interface InteractiveOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: {
    name: string;
    profession: string;
    gender: 'female' | 'male' | 'other' | 'prefer_not_to_say';
    wakeTime: string;
    sleepTime: string;
    workStartTime: string;
    workEndTime: string;
    homeDistrict: string;
    workplace: string;
    clothingStyle: string;
    wellnessGoal: string;
    partnerName: string;
    partnerRelation: string;
    partnerNotes: string;
    notificationStyle: string;
    isCycleEnabled?: boolean;
    lastPeriodDate?: string;
    cycleLengthDays?: number;
  }) => Promise<void>;
  initialName?: string;
  initialGender?: 'female' | 'male' | 'other' | 'prefer_not_to_say';
}

export const InteractiveOnboardingModal: React.FC<InteractiveOnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialName = 'Görkem',
  initialGender = 'female',
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState(initialName);
  const [profession, setProfession] = useState('Girişimci & Ürün Yöneticisi');
  const [gender, setGender] = useState<'female' | 'male' | 'other' | 'prefer_not_to_say'>(initialGender);
  const [wakeTime, setWakeTime] = useState('07:30');
  const [sleepTime, setSleepTime] = useState('23:30');
  const [workStartTime, setWorkStartTime] = useState('09:00');
  const [workEndTime, setWorkEndTime] = useState('18:00');
  const [homeDistrict, setHomeDistrict] = useState('Kadıköy / Moda');
  const [workplace, setWorkplace] = useState('Levent - Maslak Teknoloji Hattı');
  const [clothingStyle, setClothingStyle] = useState('Smart-casual: Keten gömlek, rahat sneaker ve minimalist tarz');
  const [wellnessGoal, setWellnessGoal] = useState('İş çıkışı yürüyüşle dinç kalmak & masa başı hareketsizliği kırmak');
  const [partnerName, setPartnerName] = useState('Zeynep');
  const [partnerRelation, setPartnerRelation] = useState('Eş / Hayat Partneri');
  const [partnerNotes, setPartnerNotes] = useState('Yoğun mesailerde telefon detokslu kaliteli ortak zaman arar, nostaljik mekanları ve doğayı sever');
  const [notificationStyle, setNotificationStyle] = useState('proactive');

  // Cycle tracking state (auto-enabled if female)
  const [isCycleEnabled, setIsCycleEnabled] = useState(gender === 'female');
  const [lastPeriodDate, setLastPeriodDate] = useState('2026-09-17');
  const [cycleLengthDays, setCycleLengthDays] = useState(28);

  const handleGenderChange = (selected: 'female' | 'male' | 'other' | 'prefer_not_to_say') => {
    setGender(selected);
    if (selected === 'female') {
      setIsCycleEnabled(true);
    } else {
      setIsCycleEnabled(false);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    await onComplete({
      name,
      profession,
      gender,
      wakeTime,
      sleepTime,
      workStartTime,
      workEndTime,
      homeDistrict,
      workplace,
      clothingStyle,
      wellnessGoal,
      partnerName,
      partnerRelation,
      partnerNotes,
      notificationStyle,
      isCycleEnabled: gender === 'female' ? isCycleEnabled : false,
      lastPeriodDate,
      cycleLengthDays: Number(cycleLengthDays) || 28,
    });
    setLoading(false);
    onClose();
  };

  return (
    <GlassSheet
      isOpen={isOpen}
      onClose={onClose}
      title="⚡ AYZEK Hızlı Başlangıç (Fast Start)"
      subtitle={`Adım ${step} / 5 · Kişiselleştirilmiş Yaşam Kurulumu`}
      maxWidth="xl"
    >
      <div className="flex flex-col gap-5 text-slate-100">
        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-rose-500 transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {/* STEP 1: Giriş & 4 Temel Güç */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/60 via-slate-900/80 to-indigo-950/60 border border-cyan-500/30 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center mx-auto mb-3 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">
                "Hayatını sen yaşa. Gerisini AYZEK'e bırak."
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                AYZEK sıradan bir takvim veya sohbet botu değildir; alışkanlıklarını öğrenen, bağlamlarını hatırlayan ve hayatını proaktif olarak kolaylaştıran kişisel yaşam işletim sistemindir.
              </p>
            </div>

            {/* 4 Pillars Preview */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                  <Brain className="w-4 h-4 text-cyan-400" />
                  <span>Kalıcı Hafıza</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Evini, giyim stilini, sevdiğin kahveyi ve yakınlarını asla unutmaz.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>Dinamik Gün</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Toplantı uzadığında planı otomatik esnetir, nefes molaları koyar.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-rose-300 font-semibold">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>Psikolog & Koç</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  İlişki dinamiklerini çözümler, şefkatli tavsiyeler ve mekanlar önerir.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  <span>Canlı Entegrasyon</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  WhatsApp, Teams ve Meet mesajlarından görev ve aksiyonları çıkarır.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <GlassInput
                label="Sana nasıl hitap edelim? (Adın)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Görkem, Deniz, Can..."
              />

              <GlassInput
                label="Mesleğin veya Günlük Uğraşın"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="Örn: Girişimci, Mimar, Yazılım Mühendisi..."
              />
            </div>
          </div>
        )}

        {/* STEP 2: Günlük Ritim & Çalışma Saatleri */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Günlük Biyolojik Ritmimiz</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                AYZEK sabah rutini, odak blokları ve akşam rahatlama tamponlarını bu saatlere göre senkronize eder.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <GlassInput
                label="Uyanış Saati"
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
              />
              <GlassInput
                label="Uyku / Kapanış Saati"
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <GlassInput
                label="İş / Odak Başlangıcı"
                type="time"
                value={workStartTime}
                onChange={(e) => setWorkStartTime(e.target.value)}
              />
              <GlassInput
                label="Mesai / İş Çıkışı"
                type="time"
                value={workEndTime}
                onChange={(e) => setWorkEndTime(e.target.value)}
              />
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200 flex items-start gap-2">
              <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>Akıllı Tampon Güvencesi:</strong> Saat {workEndTime} sonrası toplantı koyulması engellenir; eve dönüş ve kişisel vakit için 45 dakikalık nefes payı ayrılır.
              </span>
            </div>
          </div>
        )}

        {/* STEP 3: Yaşam Alanları & Giyim Stili */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Yaşam Alanların & Kişisel Tarzın</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Mekan önerileri, hava durumu ve sabah kıyafet koçluğunda bu konum ve zevkler temel alınır.
              </p>
            </div>

            <GlassInput
              label="Ev Semtin / İkâmet"
              value={homeDistrict}
              onChange={(e) => setHomeDistrict(e.target.value)}
              placeholder="Örn: Kadıköy / Moda, Beşiktaş, Çankaya..."
            />

            <GlassInput
              label="İşyerin veya Ana Çalışma Alanın"
              value={workplace}
              onChange={(e) => setWorkplace(e.target.value)}
              placeholder="Örn: Levent - Maslak Hattı, Evden (Remote)..."
            />

            <GlassInput
              label="Giyim & Stil Tercihin"
              value={clothingStyle}
              onChange={(e) => setClothingStyle(e.target.value)}
              placeholder="Örn: Smart-casual keten gömlek, rahat sneaker ve minimalist stil..."
            />
          </div>
        )}

        {/* STEP 4: Hayatındaki İnsanlar (Partner, Aile, Dostlar) */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Hayatındaki Özel İnsanlar</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                AYZEK, sevdiklerinle olan bağını bir psikolog derinliğiyle gözetir ve kaliteli ortak anlar planlar.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <GlassInput
                label="Önemli Kişi (İsim)"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="Örn: Zeynep, Can..."
              />
              <GlassInput
                label="Yakınlık Derecesi"
                value={partnerRelation}
                onChange={(e) => setPartnerRelation(e.target.value)}
                placeholder="Örn: Eş / Partner, Anne, Yakın Dost..."
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Onun Hakkındaki Notlar & İhtiyaçları
              </label>
              <textarea
                value={partnerNotes}
                onChange={(e) => setPartnerNotes(e.target.value)}
                rows={3}
                className="w-full text-xs rounded-xl bg-slate-900/80 border border-white/15 px-3 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60"
                placeholder="Örn: Yoğun mesailerde kaliteli ortak zaman arar, nostaljik mekanları ve doğayı sever..."
              />
            </div>
          </div>
        )}

        {/* STEP 5: Sağlık, Spor & Döngü */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Beden, Spor & Wellness Hedefin</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Suçlayıcı olmayan, enerjine ve biyolojine saygılı nazik hedefler.
              </p>
            </div>

            <GlassInput
              label="Sağlık & Hareket Hedefin"
              value={wellnessGoal}
              onChange={(e) => setWellnessGoal(e.target.value)}
              placeholder="Örn: İş çıkışı yürüyüşle dinç kalmak & masa başı hareketsizliği kırmak..."
            />

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-2">Cinsiyet & Döngü Takibi</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'female', label: 'Kadın (Döngü Modu)' },
                  { id: 'male', label: 'Erkek' },
                  { id: 'other', label: 'Diğer / Belirtmek İstemiyorum' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleGenderChange(g.id as any)}
                    className={`py-2 px-2 text-xs rounded-xl border text-center transition-all cursor-pointer ${
                      gender === g.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-semibold shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {gender === 'female' && (
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/25 space-y-3">
                <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold">
                  <Flower2 className="w-4 h-4 text-rose-400" />
                  <span>Biyolojik Hormonal Ritim Entegrasyonu</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <GlassInput
                    label="Son Döngü Tarihi"
                    type="date"
                    value={lastPeriodDate}
                    onChange={(e) => setLastPeriodDate(e.target.value)}
                  />
                  <GlassInput
                    label="Döngü Süresi (Gün)"
                    type="number"
                    value={cycleLengthDays.toString()}
                    onChange={(e) => setCycleLengthDays(Number(e.target.value) || 28)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          {step > 1 ? (
            <GlassButton
              variant="secondary"
              onClick={() => setStep((s) => s - 1)}
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Geri
            </GlassButton>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <GlassButton
              variant="primary"
              onClick={() => setStep((s) => s + 1)}
            >
              Devam Et
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </GlassButton>
          ) : (
            <GlassButton
              variant="primary"
              onClick={handleFinish}
              disabled={loading}
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              {loading ? 'Senkronize Ediliyor...' : 'Yaşam İşletim Sistemini Başlat 🚀'}
            </GlassButton>
          )}
        </div>
      </div>
    </GlassSheet>
  );
};
