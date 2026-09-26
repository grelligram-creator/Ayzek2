import React, { useState } from 'react';
import {
  CreditCard,
  Car,
  FileText,
  Heart,
  Target,
  Flame,
  CheckCircle2,
  Circle,
  Plus,
  Calendar,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import {
  Goal,
  Habit,
  Payment,
  Subscription,
  Vehicle,
  DocumentItem,
  SpecialDate,
} from '../../types/ayzek';
import { GlassCard } from '../design-system/GlassCard';
import { GlassButton } from '../design-system/GlassButton';
import { GlassSheet } from '../design-system/GlassSheet';
import { GlassInput } from '../design-system/GlassInput';
import { FinancialHealthCard } from './FinancialHealthCard';

interface LifeViewProps {
  goals: Goal[];
  habits: Habit[];
  payments: Payment[];
  subscriptions: Subscription[];
  vehicles: Vehicle[];
  documents: DocumentItem[];
  specialDates: SpecialDate[];
  onToggleHabit: (id: string) => void;
  onTogglePayment: (id: string, isPaid: boolean) => void;
  onAddDocument: (doc: { title: string; docType: string; expiryDate?: string; notes?: string }) => void;
  onOpenRelationshipAssistant?: () => void;
  onOpenChatWithPrompt?: (prompt: string) => void;
}

export const LifeView: React.FC<LifeViewProps> = ({
  goals,
  habits,
  payments,
  subscriptions,
  vehicles,
  documents,
  specialDates,
  onToggleHabit,
  onTogglePayment,
  onAddDocument,
  onOpenRelationshipAssistant,
  onOpenChatWithPrompt,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'finance' | 'vehicle' | 'goals' | 'dates'>('all');
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('warranty');
  const [docExpiry, setDocExpiry] = useState('2026-12-31');
  const [docNotes, setDocNotes] = useState('');

  const monthlySubscriptionTotal = subscriptions.reduce((acc, s) => acc + s.amount, 0);

  const handleCreateDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;
    onAddDocument({
      title: docTitle.trim(),
      docType,
      expiryDate: docExpiry,
      notes: docNotes,
    });
    setDocTitle('');
    setDocNotes('');
    setIsDocModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 pb-24 max-w-xl mx-auto w-full">
      {/* Editorial Header */}
      <div className="pt-2">
        <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Kişisel Yaşam Modülleri
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 mt-1">
          Yaşam & Varlıklar
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Finans, abonelikler, araç, dijital kasa ve hedeflerin tek bir zeki merkezde.
        </p>
      </div>

      {/* Segmented Filter Control */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-white/10 overflow-x-auto custom-scrollbar">
        {[
          { id: 'all', label: 'Tümü' },
          { id: 'finance', label: 'Finans & Abonelik' },
          { id: 'vehicle', label: 'Araç & Kasa' },
          { id: 'goals', label: 'Hedef & Alışkanlık' },
          { id: 'dates', label: 'Özel Günler' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === tab.id
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: Finance & Subscriptions */}
      {(activeCategory === 'all' || activeCategory === 'finance') && (
        <div className="space-y-4">
          {/* Finansal Sağlık & Harcama Eğilimleri Kartı */}
          <FinancialHealthCard
            payments={payments}
            subscriptions={subscriptions}
            onOpenChatWithPrompt={onOpenChatWithPrompt}
            onTogglePayment={onTogglePayment}
          />

          <div className="flex items-center justify-between pt-2">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              Faturalar & Ödemeler
            </h2>
            <span className="text-xs text-slate-400">
              Aylık Abonelik Toplamı: <strong className="text-slate-100">{monthlySubscriptionTotal} TL</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {payments.map((p) => (
              <GlassCard
                key={p.id}
                variant={p.isPaid ? 'subtle' : 'default'}
                className={`p-3.5 ${p.isPaid ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">
                      Son Ödeme: {p.dueDate}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-100 mt-0.5">
                      {p.title}
                    </h4>
                    <p className="text-base font-bold text-amber-300 mt-1">
                      {p.amount} {p.currency}
                    </p>
                  </div>
                  <button
                    onClick={() => onTogglePayment(p.id, !p.isPaid)}
                    className="p-1 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                    title={p.isPaid ? 'Ödenmedi işaretle' : 'Ödendi işaretle'}
                  >
                    {p.isPaid ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Subscriptions List */}
          <GlassCard variant="subtle" className="p-4">
            <h4 className="text-xs font-semibold text-slate-300 mb-2">
              Aktif Abonelikler & Tekrarlayan Maliyetler
            </h4>
            <div className="divide-y divide-white/5">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="py-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-slate-200">{sub.serviceName}</span>
                    <span className="text-slate-500 text-[11px] ml-2">Sonraki: {sub.nextBillingDate}</span>
                  </div>
                  <span className="font-semibold text-slate-300">
                    {sub.amount} {sub.currency} / {sub.billingCycle === 'monthly' ? 'ay' : 'yıl'}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* SECTION 2: Vehicles & Document Vault */}
      {(activeCategory === 'all' || activeCategory === 'vehicle') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Car className="w-4 h-4 text-cyan-400" />
              Araç Bilgisi & Takip
            </h2>
          </div>

          {vehicles.map((v) => (
            <GlassCard key={v.id} variant="default" className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-xs font-mono font-bold text-slate-100">
                      {v.plate}
                    </span>
                    <span className="text-xs text-slate-400">
                      {v.modelYear} · {v.makeModel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Güncel KM: <strong className="text-slate-200">{v.currentKm.toLocaleString()} KM</strong> (Bakım: {v.maintenanceKm.toLocaleString()} KM)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-amber-400 font-medium block">
                    Muayene: {v.inspectionDue}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Kasko: {v.insuranceDue}
                  </span>
                </div>
              </div>
              {v.notes && (
                <p className="text-xs text-cyan-300/80 bg-cyan-950/30 p-2 rounded-xl mt-3 border border-cyan-500/20">
                  💡 {v.notes}
                </p>
              )}
            </GlassCard>
          ))}

          {/* Document Vault */}
          <div className="flex items-center justify-between pt-2">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Kasa & Garanti Belgeleri (OCR Analizli)
            </h2>
            <GlassButton size="sm" variant="ghost" onClick={() => setIsDocModalOpen(true)}>
              <Plus className="w-3.5 h-3.5" />
              Belge Tara / Ekle
            </GlassButton>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {documents.map((doc) => (
              <GlassCard key={doc.id} variant="subtle" className="p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="uppercase">{doc.docType}</span>
                    {doc.expiryDate && (
                      <span className="text-amber-400 font-medium">Bitiş: {doc.expiryDate}</span>
                    )}
                  </div>
                  <h4 className="text-xs font-semibold text-slate-100 mt-1">
                    {doc.title}
                  </h4>
                  {doc.notes && (
                    <p className="text-[11px] text-slate-400 mt-1">{doc.notes}</p>
                  )}
                </div>
                {doc.ocrExtractedText && (
                  <div className="mt-2.5 pt-2 border-t border-white/5 text-[10px] text-slate-500 font-mono line-clamp-2">
                    OCR: {doc.ocrExtractedText}
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: Goals & Habits */}
      {(activeCategory === 'all' || activeCategory === 'goals') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              Hedefler & İlerleme
            </h2>
          </div>

          <div className="space-y-3">
            {goals.map((goal) => (
              <GlassCard key={goal.id} variant="default" className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">
                      Hedef Tarih: {goal.targetDate}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-100 mt-0.5">
                      {goal.title}
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    %{goal.progress}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden mt-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>

                {/* Milestones list */}
                {goal.milestones && (
                  <div className="mt-3 space-y-1.5 pt-2 border-t border-white/5">
                    {goal.milestones.map((m, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                        <span className={m.completed ? 'text-emerald-400' : 'text-slate-600'}>
                          {m.completed ? '✓' : '○'}
                        </span>
                        <span className={m.completed ? 'line-through text-slate-400' : ''}>
                          {m.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            ))}
          </div>

          {/* Habits */}
          <div className="pt-2">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-orange-400" />
              Alışkanlık Takibi & Seri (Streak)
            </h2>

            <div className="space-y-2.5">
              {habits.map((habit) => (
                <GlassCard
                  key={habit.id}
                  variant={habit.completedToday ? 'subtle' : 'default'}
                  className="p-3.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onToggleHabit(habit.id)}
                      className="p-1 text-slate-400 hover:text-orange-400 transition-colors cursor-pointer"
                    >
                      {habit.completedToday ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <h4
                        className={`text-xs font-semibold ${
                          habit.completedToday ? 'line-through text-slate-400' : 'text-slate-100'
                        }`}
                      >
                        {habit.title}
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        {habit.frequency} · Tercih: {habit.preferredTime}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-orange-400">
                    <Flame className="w-3.5 h-3.5 fill-orange-400" />
                    <span>{habit.streak} gün</span>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: Special Dates & Relationships */}
      {(activeCategory === 'all' || activeCategory === 'dates') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              İlişkiler & Özel Günler
            </h2>
            {onOpenRelationshipAssistant && (
              <GlassButton
                size="sm"
                variant="ghost"
                onClick={onOpenRelationshipAssistant}
                className="text-xs text-rose-300 hover:text-rose-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                Mesaj & Sürpriz Üret
              </GlassButton>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {specialDates.map((d) => (
              <GlassCard key={d.id} variant="default" className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-rose-400 font-medium">
                      {d.dateMonthDay} · {d.eventType.toUpperCase()}
                    </span>
                    <h4 className="text-sm font-bold text-slate-100 mt-0.5">
                      {d.personName}
                    </h4>
                    <span className="text-xs text-slate-400">{d.relationship}</span>
                  </div>
                </div>

                {d.giftIdea && (
                  <div className="mt-3 p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/20 text-xs text-rose-200">
                    🎁 <strong>Not edilen hediye:</strong> {d.giftIdea}
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      <GlassSheet
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        title="Belge veya Garanti Ekle"
        subtitle="AYZEK OCR ile süre bitimini tespit eder ve proaktif uyarır."
      >
        <form onSubmit={handleCreateDoc} className="space-y-4">
          <GlassInput
            label="Belge Adı"
            placeholder="ör: Kahve Makinesi Garanti Belgesi, Kasko..."
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Belge Tipi
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full rounded-xl bg-slate-900/70 border border-white/10 px-3 py-2.5 text-sm text-slate-100"
              >
                <option value="warranty">Garanti Belgesi</option>
                <option value="insurance">Sigorta / Kasko</option>
                <option value="contract">Sözleşme / Kontrat</option>
                <option value="receipt">Fatura & Makbuz</option>
              </select>
            </div>

            <GlassInput
              label="Son Geçerlilik / Garanti Bitiş"
              type="date"
              value={docExpiry}
              onChange={(e) => setDocExpiry(e.target.value)}
            />
          </div>

          <GlassInput
            label="Özel Notlar veya Poliçe/Fatura No"
            placeholder="ör: Fatura no TR-994, 2 yıl değişim garantisi"
            value={docNotes}
            onChange={(e) => setDocNotes(e.target.value)}
          />

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
            <GlassButton type="button" variant="ghost" onClick={() => setIsDocModalOpen(false)}>
              İptal
            </GlassButton>
            <GlassButton type="submit" variant="primary">
              Kayıt & OCR Tara
            </GlassButton>
          </div>
        </form>
      </GlassSheet>
    </div>
  );
};
