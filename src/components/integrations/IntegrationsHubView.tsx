import React, { useState, useEffect } from 'react';
import {
  Share2,
  Calendar,
  Mail,
  Video,
  MessageSquare,
  Send,
  Shield,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Clock,
  Zap,
  Sparkles,
  Heart,
  Briefcase,
  AlertTriangle,
  UserCheck,
  Copy,
  Check,
  ArrowRight,
  TrendingUp,
  Sliders,
} from 'lucide-react';
import { IntegrationAccount, WorkLifeBalance, MessagingAnalysisResult, TaskItem } from '../../types/ayzek';
import { api } from '../../services/api';
import { GlassCard } from '../design-system/GlassCard';

interface IntegrationsHubViewProps {
  onAddPlanTask: (title: string, preferredTime: string, category: string) => void;
  onNavigateToChat: (prompt: string) => void;
}

export const IntegrationsHubView: React.FC<IntegrationsHubViewProps> = ({
  onAddPlanTask,
  onNavigateToChat,
}) => {
  const [integrations, setIntegrations] = useState<IntegrationAccount[]>([]);
  const [balance, setBalance] = useState<WorkLifeBalance | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState('');

  // Messaging Analysis State (WhatsApp & Telegram)
  const [platform, setPlatform] = useState<'whatsapp' | 'telegram'>('whatsapp');
  const [contactName, setContactName] = useState('Zeynep (Partner)');
  const [chatInput, setChatInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState<MessagingAnalysisResult | null>(null);
  const [sampleChats, setSampleChats] = useState<any[]>([]);
  const [copiedReply, setCopiedReply] = useState(false);
  const [addedTaskId, setAddedTaskId] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [intRes, balRes, samplesRes] = await Promise.all([
          api.getIntegrations(),
          api.getWorkLifeBalance(),
          api.getSampleChats(),
        ]);
        if (intRes.success) setIntegrations(intRes.integrations);
        if (balRes.success) setBalance(balRes.balance);
        if (samplesRes.success) setSampleChats(samplesRes.samples);
      } catch (err) {
        console.error('Failed to load integrations hub data:', err);
      }
    };
    loadData();
  }, []);

  const handleToggleIntegration = async (service: string) => {
    try {
      const res = await api.toggleIntegration(service);
      if (res.success && res.integration) {
        setIntegrations((prev) =>
          prev.map((item) => (item.service === service ? res.integration : item))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    setSyncSuccessMessage('');
    try {
      const res = await api.syncAllIntegrations();
      if (res.success) {
        setIntegrations(res.integrations);
        const balRes = await api.getWorkLifeBalance();
        if (balRes.success) setBalance(balRes.balance);
        setSyncSuccessMessage('Teams, Gmail, Meet, Zoom, Takvimler ve Mesajlar eşitlendi! Günlük plan güncellendi.');
        setTimeout(() => setSyncSuccessMessage(''), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRunAnalysis = async (selectedChatText?: string, contact?: string, plat?: 'whatsapp' | 'telegram') => {
    const textToAnalyze = selectedChatText || chatInput;
    const targetContact = contact || contactName;
    const targetPlatform = plat || platform;

    if (!textToAnalyze.trim()) return;

    setIsAnalyzing(true);
    try {
      const res = await api.analyzeMessagingChat(targetPlatform, targetContact, textToAnalyze);
      if (res.success) {
        setLatestAnalysis(res.analysis);
        // Refresh balance after new tasks extracted
        const balRes = await api.getWorkLifeBalance();
        if (balRes.success) setBalance(balRes.balance);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectSample = (sample: any) => {
    setPlatform(sample.platform);
    setContactName(sample.contactName);
    setChatInput(sample.chatText);
    handleRunAnalysis(sample.chatText, sample.contactName, sample.platform);
  };

  const handleCopyReply = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedReply(true);
    setTimeout(() => setCopiedReply(false), 2000);
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Share2 className="w-5 h-5 text-cyan-400" />
            Entegrasyonlar & İş-Özel Hayat Dengesi
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Teams, Gmail, Meet, Zoom, Takvimler, WhatsApp & Telegram ile tam uyum
          </p>
        </div>

        <button
          onClick={handleSyncAll}
          disabled={isSyncing}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Eşitleniyor...' : 'Tümünü Senkronize Et'}</span>
        </button>
      </div>

      {syncSuccessMessage && (
        <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{syncSuccessMessage}</span>
        </div>
      )}

      {/* 1. WORK-LIFE BALANCE DASHBOARD */}
      {balance && (
        <GlassCard className="p-5 border-cyan-500/30 shadow-[0_8px_32px_rgba(6,182,212,0.15)] relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  İş & Özel Hayat Denge Skoru
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                    {balance.overallScore} / 100
                  </span>
                </h2>
                <span className="text-[11px] text-slate-400">
                  Toplantı yükü ve kişisel vakit uyumu: <strong className="text-emerald-400 font-medium">Dengeli & Sağlıklı</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[11px] font-medium hidden sm:inline">Smart Guard Aktif</span>
            </div>
          </div>

          {/* Visual Progress Bar: Work vs Life */}
          <div className="space-y-1.5 mt-3">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Briefcase className="w-3.5 h-3.5" />
                İş & Toplantılar (%{balance.breakdown.workPercentage} · {balance.workHoursToday} Saat)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Heart className="w-3.5 h-3.5" />
                Özel Hayat & Dinlenme (%{balance.breakdown.lifePercentage} · {balance.personalHoursToday} Saat)
              </span>
            </div>

            <div className="h-3 w-full rounded-full bg-slate-950/80 p-0.5 flex overflow-hidden border border-white/10">
              <div
                style={{ width: `${balance.breakdown.workPercentage}%` }}
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-l-full transition-all duration-500 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
              />
              <div
                style={{ width: `${balance.breakdown.lifePercentage}%` }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-r-full transition-all duration-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
              />
            </div>
          </div>

          {/* AI Life Coach Recommendation Bubble */}
          <div className="mt-4 p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/20 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-200 leading-relaxed">
              <strong className="text-cyan-300">AYZEK Denge Rehberi: </strong>
              {balance.aiRecommendation}
            </p>
          </div>
        </GlassCard>
      )}

      {/* 2. CONNECTED INTEGRATIONS LIST (Teams, Gmail, Meet, Zoom, Calendars) */}
      <div>
        <h2 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Aktif Kurumsal & Kişisel Servisler
          </span>
          <span className="text-xs text-slate-400 font-normal">
            Yetkiler Kapsamında Canlı Eşitleme
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {integrations.map((item) => {
            const isWork = item.category === 'work';
            const isCal = item.category === 'calendar';
            const isMsg = item.category === 'messaging';

            let Icon = Briefcase;
            if (item.service === 'teams') Icon = Briefcase;
            else if (item.service === 'gmail') Icon = Mail;
            else if (item.service === 'meet' || item.service === 'zoom') Icon = Video;
            else if (item.service === 'google_calendar') Icon = Calendar;
            else if (item.service === 'whatsapp' || item.service === 'telegram') Icon = MessageSquare;

            return (
              <GlassCard
                key={item.id}
                className={`p-4 transition-all ${
                  item.isConnected ? 'border-white/15' : 'border-white/5 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base ${
                        item.isConnected
                          ? isWork
                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                            : isCal
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-white/5 text-slate-500'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{item.name}</span>
                        {item.isConnected && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                            Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        {item.emailOrHandle}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleIntegration(item.service)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                      item.isConnected ? 'bg-cyan-500' : 'bg-slate-800'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        item.isConnected ? 'translate-x-4.5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Integration Details & Sync Snippets */}
                {item.isConnected && item.recentSyncPreview && item.recentSyncPreview.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1.5">
                    {item.recentSyncPreview.slice(0, 2).map((snippet, idx) => (
                      <p key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5 truncate">
                        <span className="text-cyan-400 text-xs leading-none mt-0.5">•</span>
                        <span className="truncate">{snippet}</span>
                      </p>
                    ))}

                    {/* Quick Query to Chat */}
                    {onNavigateToChat && (
                      <div className="pt-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const prompt =
                              item.service === 'whatsapp'
                                ? 'WhatsApp: Zeynep ne yazmıştı?'
                                : item.service === 'teams'
                                ? 'Teams: Sprint kararları ve görevlerim neler?'
                                : item.service === 'meet'
                                ? 'Meet: Q3 strateji toplantısı özeti'
                                : `${item.name} entegrasyonundaki son gelişmeleri özetle`;
                            onNavigateToChat(prompt);
                          }}
                          className="w-full text-[10.5px] py-1.5 px-2.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 flex items-center justify-center gap-1 font-medium transition-all cursor-pointer"
                        >
                          <MessageSquare className="w-3 h-3 text-cyan-400" />
                          <span>Bu Servisi Chat'te AYZEK'e Sor</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* 3. WHATSAPP & TELEGRAM MESSAGING ANALYSIS & LIFE COACHING */}
      <GlassCard className="p-5 border-emerald-500/30 shadow-[0_12px_40px_rgba(16,185,129,0.1)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_16px_rgba(16,185,129,0.3)]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                WhatsApp & Telegram İzinli Konuşma Analizörü
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  Psikolog & Koç
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Konuşmaları analiz ederek otomatik görev çıkarır, iletişim tonunu tartar ve hayat koçluğu sağlar
              </p>
            </div>
          </div>
        </div>

        {/* Sample Presets to Try */}
        <div className="space-y-1.5 mb-3">
          <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Test Etmek İçin Örnek Sohbet Seçin:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {sampleChats.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className="p-2.5 rounded-xl bg-slate-950/70 border border-white/10 hover:border-emerald-500/40 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">{sample.avatarEmoji}</span>
                  <span className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                    {sample.contactName}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                  "{sample.preview}"
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Text Area for Analysis */}
        <div className="space-y-2 mt-4">
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl bg-slate-950/80 p-0.5 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setPlatform('whatsapp')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  platform === 'whatsapp' ? 'bg-emerald-500/20 text-emerald-300 font-medium' : 'text-slate-400'
                }`}
              >
                WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setPlatform('telegram')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  platform === 'telegram' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400'
                }`}
              >
                Telegram
              </button>
            </div>

            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Kişi / Grup Adı (örn: Zeynep, Grispi Ekip)"
              className="flex-1 py-1.5 px-3 text-xs rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
            />
          </div>

          <textarea
            rows={3}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Analiz edilecek mesajı buraya yapıştırın veya yukarıdaki örneklerden seçin..."
            className="w-full p-3 text-xs rounded-2xl bg-slate-950/80 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
          />

          <div className="flex justify-end">
            <button
              onClick={() => handleRunAnalysis()}
              disabled={isAnalyzing || !chatInput.trim()}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-[0_0_16px_rgba(16,185,129,0.35)] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Konuşmayı Analiz Et & Görev Çıkar</span>
            </button>
          </div>
        </div>

        {/* Analysis Result Card */}
        {latestAnalysis && (
          <div className="mt-5 p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/40 space-y-3.5 animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-lg">{latestAnalysis.avatarEmoji}</span>
                <span className="text-xs font-bold text-white">
                  {latestAnalysis.contactOrGroupName} Analiz Raporu
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                {latestAnalysis.emotionalTone === 'stressed_fatigued'
                  ? 'Yorgunluk & Destek İhtiyacı'
                  : latestAnalysis.emotionalTone === 'loving_supportive'
                  ? 'Sevgi & Sıcak İletişim'
                  : latestAnalysis.emotionalTone === 'urgent_work'
                  ? 'İş & Zaman Taahhüdü'
                  : 'Dengeli Frekans'}
              </span>
            </div>

            {/* Extracted Tasks from Conversation */}
            {latestAnalysis.extractedTasks.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-cyan-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Konuşmadan Çıkarılan Görevler ve Sözler:
                </span>
                {latestAnalysis.extractedTasks.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/25 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-medium text-white">{t.title}</span>
                      <p className="text-[10px] text-slate-400">
                        Planlanan Saat: {t.preferredTime || '18:00'} · Öncelik: {(t.priority || 'medium').toUpperCase()}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onAddPlanTask(t.title, t.preferredTime || '18:00', t.category || 'personal');
                        setAddedTaskId(t.title);
                        setTimeout(() => setAddedTaskId(null), 3000);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer"
                    >
                      {addedTaskId === t.title ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Plana Eklendi</span>
                        </>
                      ) : (
                        <>
                          <span>Günün Planına Ekle</span>
                          <ArrowRight className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Psychologist & Life Coach Insights */}
            <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1">
              <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" />
                Psikolog & Hayat Koçu İletişim Tavsiyesi:
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {latestAnalysis.coachingInsight}
              </p>
              {latestAnalysis.relationshipImpact && (
                <p className="text-[11px] text-slate-400 pt-1">
                  <strong>İlişki Dinamiği: </strong>
                  {latestAnalysis.relationshipImpact}
                </p>
              )}
            </div>

            {/* Suggested Empathetic Reply */}
            {latestAnalysis.suggestedReply && (
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between gap-3">
                <div className="flex-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400">
                    Önerilen Yanıt Taslağı
                  </span>
                  <p className="text-xs text-slate-200 mt-0.5 italic">
                    "{latestAnalysis.suggestedReply}"
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyReply(latestAnalysis.suggestedReply!)}
                  className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition-colors shrink-0"
                  title="Yanıtı Kopyala"
                >
                  {copiedReply ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
};
