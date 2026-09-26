import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  CreditCard,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  DollarSign,
  PieChart,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Info,
  Zap,
} from 'lucide-react';
import { Payment, Subscription } from '../../types/ayzek';
import { GlassCard } from '../design-system/GlassCard';

interface FinancialHealthCardProps {
  payments: Payment[];
  subscriptions: Subscription[];
  onOpenChatWithPrompt?: (prompt: string) => void;
  onTogglePayment?: (id: string, isPaid: boolean) => void;
}

export const FinancialHealthCard: React.FC<FinancialHealthCardProps> = ({
  payments,
  subscriptions,
  onOpenChatWithPrompt,
  onTogglePayment,
}) => {
  // Budget limit state (persisted to localStorage)
  const [budgetLimit, setBudgetLimit] = useState<number>(() => {
    const saved = localStorage.getItem('ayzek_monthly_budget');
    return saved ? Number(saved) : 35000;
  });

  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudgetInput, setTempBudgetInput] = useState(budgetLimit.toString());
  const [activeTrendView, setActiveTrendView] = useState<'trends' | 'categories'>('trends');

  useEffect(() => {
    localStorage.setItem('ayzek_monthly_budget', budgetLimit.toString());
  }, [budgetLimit]);

  // Calculations based on live payments and subscriptions
  const paymentsTotal = payments.reduce((acc, p) => acc + p.amount, 0);
  const unpaidPayments = payments.filter((p) => !p.isPaid);
  const unpaidTotal = unpaidPayments.reduce((acc, p) => acc + p.amount, 0);
  const subscriptionsTotal = subscriptions.reduce((acc, s) => acc + s.amount, 0);
  const estimatedDiscretionary = 5400; // Food, transport, groceries
  const totalMonthlySpend = paymentsTotal + subscriptionsTotal + estimatedDiscretionary;

  // Percentage of budget used
  const spendPercentage = Math.round((totalMonthlySpend / budgetLimit) * 100);
  const remainingBudget = budgetLimit - totalMonthlySpend;
  const isOverBudget = totalMonthlySpend > budgetLimit;
  const isNearBudget = spendPercentage >= 85 && !isOverBudget;

  // Financial Health Score (0 - 100)
  let healthScore = 85;
  if (isOverBudget) {
    const overRatio = (totalMonthlySpend - budgetLimit) / budgetLimit;
    healthScore = Math.max(35, Math.round(70 - overRatio * 150));
  } else if (isNearBudget) {
    healthScore = 74;
  } else {
    healthScore = Math.min(96, Math.round(85 + ((budgetLimit - totalMonthlySpend) / budgetLimit) * 20));
  }

  // Monthly Spending Trend Data (Last 4 Months)
  const monthlyTrends = [
    { month: 'Haziran', spend: 29800, budget: 35000, height: 68 },
    { month: 'Temmuz', spend: 31400, budget: 35000, height: 75 },
    { month: 'Ağustos', spend: 32600, budget: 35000, height: 82 },
    { month: 'Eylül (Mevcut)', spend: totalMonthlySpend, budget: budgetLimit, height: Math.min(100, Math.round((totalMonthlySpend / 40000) * 100)), isCurrent: true },
  ];

  // Category Distribution
  const categories = [
    {
      name: 'Barınma & Kira',
      amount: payments.find((p) => p.category === 'rent')?.amount || 24000,
      color: 'bg-indigo-500',
      percentage: Math.round(((payments.find((p) => p.category === 'rent')?.amount || 24000) / totalMonthlySpend) * 100),
    },
    {
      name: 'Faturalar & İletişim',
      amount: payments.filter((p) => p.category !== 'rent').reduce((acc, p) => acc + p.amount, 0),
      color: 'bg-cyan-500',
      percentage: Math.round((payments.filter((p) => p.category !== 'rent').reduce((acc, p) => acc + p.amount, 0) / totalMonthlySpend) * 100),
    },
    {
      name: 'Abonelikler & Hizmetler',
      amount: subscriptionsTotal,
      color: 'bg-amber-500',
      percentage: Math.round((subscriptionsTotal / totalMonthlySpend) * 100),
    },
    {
      name: 'Gündelik / Market / Ulaşım',
      amount: estimatedDiscretionary,
      color: 'bg-emerald-500',
      percentage: Math.round((estimatedDiscretionary / totalMonthlySpend) * 100),
    },
  ];

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(tempBudgetInput);
    if (!isNaN(val) && val > 5000) {
      setBudgetLimit(val);
      setIsEditingBudget(false);
    }
  };

  return (
    <GlassCard className="p-5 border-amber-500/30 shadow-[0_12px_40px_rgba(245,158,11,0.12)] relative overflow-hidden space-y-4">
      {/* Ambient Glow Orbs */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Health Score Badge */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-[0_0_16px_rgba(245,158,11,0.25)]">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">Finansal Sağlık & Bütçe</h3>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${
                  isOverBudget
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                    : isNearBudget
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}
              >
                Skor: {healthScore}/100
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Sabit faturalar, 4 aktif abonelik ve aylık harcama eğilimi
            </p>
          </div>
        </div>

        {/* Quick Budget Setting Button */}
        <button
          onClick={() => {
            setTempBudgetInput(budgetLimit.toString());
            setIsEditingBudget(!isEditingBudget);
          }}
          className="text-[11px] px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all flex items-center gap-1 cursor-pointer shrink-0"
          title="Aylık Bütçe Hedefini Düzenle"
        >
          <Sliders className="w-3 h-3 text-cyan-400" />
          <span>Bütçe Hedefi</span>
        </button>
      </div>

      {/* Inline Budget Editor Form */}
      {isEditingBudget && (
        <form onSubmit={handleSaveBudget} className="p-3 rounded-2xl bg-slate-950/80 border border-white/15 flex items-center justify-between gap-3 animate-fade-in relative z-10">
          <div className="flex-1">
            <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">
              Aylık Harcama Limiti (TL)
            </label>
            <input
              type="number"
              value={tempBudgetInput}
              onChange={(e) => setTempBudgetInput(e.target.value)}
              className="w-full bg-slate-900 border border-white/15 text-white font-mono text-sm py-1.5 px-3 rounded-xl focus:outline-none focus:border-amber-400"
              placeholder="35000"
            />
          </div>
          <div className="flex gap-1.5 pt-4">
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all cursor-pointer"
            >
              Kaydet
            </button>
            <button
              type="button"
              onClick={() => setIsEditingBudget(false)}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs transition-all cursor-pointer"
            >
              İptal
            </button>
          </div>
        </form>
      )}

      {/* Budget Meter Bar */}
      <div className="space-y-1.5 relative z-10">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium">
            Toplam Harcama: <strong className="text-white font-bold">{totalMonthlySpend.toLocaleString()} TL</strong>
          </span>
          <span className="text-slate-400 text-[11px]">
            Hedef Bütçe: <strong className="text-slate-200">{budgetLimit.toLocaleString()} TL</strong> ({spendPercentage}%)
          </span>
        </div>

        {/* Dynamic Multi-color or Warning Progress Bar */}
        <div className="h-3 w-full rounded-full bg-slate-950/80 p-0.5 overflow-hidden border border-white/10 flex">
          <div
            style={{ width: `${Math.min(100, spendPercentage)}%` }}
            className={`h-full rounded-full transition-all duration-700 shadow-sm ${
              isOverBudget
                ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-red-600'
                : isNearBudget
                ? 'bg-gradient-to-r from-cyan-500 via-amber-400 to-amber-500'
                : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
            }`}
          />
        </div>

        <div className="flex justify-between text-[11px]">
          <span className="text-slate-400">
            Bekleyen Faturalar: <strong className="text-amber-300">{unpaidTotal.toLocaleString()} TL</strong>
          </span>
          <span className={isOverBudget ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-medium'}>
            {isOverBudget
              ? `Bütçe ${Math.abs(remainingBudget).toLocaleString()} TL Aşıldı!`
              : `${remainingBudget.toLocaleString()} TL Kullanılabilir Bakiye`}
          </span>
        </div>
      </div>

      {/* PROACTIVE BUDGET ALERT BANNER */}
      {(isOverBudget || isNearBudget || unpaidTotal > 0) && (
        <div
          className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-1.5 relative z-10 ${
            isOverBudget
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              : isNearBudget
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              : 'bg-cyan-950/40 border-cyan-500/30 text-cyan-200'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-xs">
            <AlertTriangle className={`w-4 h-4 shrink-0 ${isOverBudget ? 'text-rose-400' : 'text-amber-400'}`} />
            <span>
              {isOverBudget
                ? '⚠️ Proaktif Uyarı: Bütçe Limiti Aşıldı!'
                : isNearBudget
                ? '⚠️ Proaktif Bütçe Eşiği Uyarısı (%95 Sınır)'
                : '💡 Akıllı Finansal Hatırlatma'}
            </span>
          </div>

          <p className="text-[11px] opacity-90">
            {isOverBudget
              ? `Eylül ayı için belirlediğin ${budgetLimit.toLocaleString()} TL'lik bütçeyi ${Math.abs(remainingBudget).toLocaleString()} TL aştın. Ay sonuna 6 gün kala serbest yeme-içme ve lüks harcamaları durdurarak sabit dengeni koruman önerilir.`
              : isNearBudget
              ? `Eylül ayı bütçenin %${spendPercentage}'ine ulaştın. Ayın kalan 6 gününde serbest günlük harcamayı maksimum 250 TL ile sınırlandırman, hedefin aşılmasını önleyecektir.`
              : `Yarın son ödeme tarihi olan ${unpaidPayments[0]?.title || 'Elektrik Faturası'} (${unpaidTotal} TL) bulunuyor. Ödemeyi gecikmeden kapatarak ceza faizinden kaçınabilirsin.`}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {unpaidPayments.length > 0 && onTogglePayment && (
              <button
                type="button"
                onClick={() => onTogglePayment(unpaidPayments[0].id, true)}
                className="text-[10.5px] px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium flex items-center gap-1 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{unpaidPayments[0].title} Ödendi Olarak İşaretle</span>
              </button>
            )}

            {onOpenChatWithPrompt && (
              <button
                type="button"
                onClick={() => onOpenChatWithPrompt('Finansal harcama analizimi değerlendir ve bu ay için tasarruf planı öner')}
                className="text-[10.5px] px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-medium flex items-center gap-1 transition-all cursor-pointer ml-auto"
              >
                <Sparkles className="w-3 h-3" />
                <span>AYZEK'e Danış</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabs: Monthly Trends vs Category Breakdown */}
      <div className="space-y-3 pt-1 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 p-0.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setActiveTrendView('trends')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeTrendView === 'trends' ? 'bg-amber-500/20 text-amber-300 font-medium' : 'text-slate-400'
              }`}
            >
              Son 4 Aylık Eğilim
            </button>
            <button
              type="button"
              onClick={() => setActiveTrendView('categories')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeTrendView === 'categories' ? 'bg-amber-500/20 text-amber-300 font-medium' : 'text-slate-400'
              }`}
            >
              Harcama Dağılımı
            </button>
          </div>

          <span className="text-[10.5px] text-slate-400 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
            <span>Geçen aya göre +%2.4</span>
          </span>
        </div>

        {/* VIEW 1: MONTHLY BAR TRENDS */}
        {activeTrendView === 'trends' && (
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2">
            <div className="grid grid-cols-4 gap-2 items-end h-28 pt-4 pb-1">
              {monthlyTrends.map((t, idx) => (
                <div key={idx} className="flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-mono">
                    {Math.round(t.spend / 1000)}k TL
                  </span>
                  <div
                    style={{ height: `${t.height}%` }}
                    className={`w-full max-w-[40px] rounded-xl transition-all duration-500 ${
                      t.isCurrent
                        ? isOverBudget
                          ? 'bg-gradient-to-t from-rose-600 to-amber-400 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                          : 'bg-gradient-to-t from-amber-500 to-cyan-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                  />
                  <span className={`text-[10px] mt-1.5 truncate max-w-[65px] ${t.isCurrent ? 'text-amber-300 font-bold' : 'text-slate-400'}`}>
                    {t.month}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[10.5px] text-slate-400 text-center pt-1 border-t border-white/5">
              Yıllık Acil Durum Fonu hedefiyle uyumlu harcama çizgisi
            </p>
          </div>
        )}

        {/* VIEW 2: CATEGORY BREAKDOWN */}
        {activeTrendView === 'categories' && (
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2.5">
            {categories.map((c, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{c.name}</span>
                  <span className="text-white font-mono font-semibold">
                    {c.amount.toLocaleString()} TL ({c.percentage}%)
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden">
                  <div style={{ width: `${c.percentage}%` }} className={`h-full ${c.color} rounded-full`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Interactive Budget Preset Simulator */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 relative z-10">
        <span className="text-[11px]">Bütçe Eşik Simülasyonu:</span>
        <div className="flex gap-1.5">
          {[30000, 35000, 40000].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setBudgetLimit(preset)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-all cursor-pointer ${
                budgetLimit === preset
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400'
              }`}
            >
              {preset / 1000}k TL
            </button>
          ))}
        </div>
      </div>
    </GlassCard>
  );
};
