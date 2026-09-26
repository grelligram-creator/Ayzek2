import React, { useState } from 'react';
import { Bell, Sparkles, CheckCircle2, Clock, Calendar, ArrowRight, Play } from 'lucide-react';
import { NotificationAlert } from '../../types/ayzek';
import { GlassCard } from '../design-system/GlassCard';
import { GlassButton } from '../design-system/GlassButton';

interface ProactiveDrawerProps {
  notifications: NotificationAlert[];
  onAction: (notif: NotificationAlert, action: string) => void;
  onSimulateScenario: (scenario: string) => void;
  onDismiss: (id: string) => void;
  onClose: () => void;
}

export const ProactiveDrawer: React.FC<ProactiveDrawerProps> = ({
  notifications,
  onAction,
  onSimulateScenario,
  onDismiss,
  onClose,
}) => {
  const [simulating, setSimulating] = useState<string | null>(null);

  const scenarios = [
    {
      id: 'work_commute_1745',
      label: 'İş Çıkışı Market Hatırlatması (17:45)',
      desc: 'Rutin: 18:00 iş çıkışı - 15 dk kala bağlamsal market listesi.',
      icon: Clock,
      badge: 'Rutin & Bağlam',
    },
    {
      id: 'meeting_ran_long',
      label: 'Toplantı Uzadı & Plan Dengeleme',
      desc: 'Toplantı 45 dk uzadı; akşam görevlerini ileri kaydırma önerisi.',
      icon: Calendar,
      badge: 'Dinamik Plan',
    },
    {
      id: 'special_date_mom',
      label: 'Yaklaşan Özel Gün (Anne Doğum Günü)',
      desc: 'Cuma günü için önceden konuşulan hediye sipariş teklifi.',
      icon: Sparkles,
      badge: 'Özel Gün',
    },
    {
      id: 'vehicle_inspection',
      label: 'Araç Muayene Yaklaşımı (22 Gün)',
      desc: 'TÜVTÜRK muayenesi yaklaşan araç için randevu planlama.',
      icon: CheckCircle2,
      badge: 'Araç',
    },
  ];

  const handleSimulate = async (scenarioId: string) => {
    setSimulating(scenarioId);
    await onSimulateScenario(scenarioId);
    setSimulating(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Intro info banner */}
      <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200/90 leading-relaxed">
        <p className="font-semibold text-cyan-300 mb-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Proaktif Karar Motoru (Proactive Intelligence Pipeline)
        </p>
        AYZEK pasif bir sohbet robotu değildir. Günlük rutinini, toplantı kaymalarını, fatura tarihlerini ve hafızasındaki bağlamları takip ederek doğru anda doğrudan iletişime geçer.
      </div>

      {/* Active Notifications Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Bell className="w-4 h-4 text-cyan-400" />
            Aktif & Gelen Proaktif Bildirimler ({notifications.length})
          </h3>
        </div>

        {notifications.length === 0 ? (
          <GlassCard variant="subtle" className="p-5 text-center text-slate-400 text-xs">
            Şu an bekleyen yeni proaktif bildirim yok. Aşağıdaki senaryo simülatöründen bir tetikleyici çalıştırabilirsin.
          </GlassCard>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map((notif) => (
              <GlassCard
                key={notif.id}
                variant={notif.priority === 'high' ? 'accent' : 'default'}
                className="p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-100">
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {notif.priority.toUpperCase()} ÖNCELİK
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {notif.body}
                    </p>
                  </div>
                </div>

                {/* Quick actions depending on notification */}
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                  <GlassButton
                    size="sm"
                    variant="ghost"
                    onClick={() => onDismiss(notif.id)}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    Kapat
                  </GlassButton>

                  {notif.actionType === 'reschedule' && (
                    <GlassButton
                      size="sm"
                      variant="primary"
                      onClick={() => onAction(notif, 'reschedule')}
                    >
                      Planı 45 Dk Kaydır
                    </GlassButton>
                  )}

                  {notif.actionType === 'confirm_task' && (
                    <GlassButton
                      size="sm"
                      variant="primary"
                      onClick={() => onAction(notif, 'confirm_task')}
                    >
                      Görevi Gör & Onayla
                    </GlassButton>
                  )}

                  {notif.actionType === 'open_plan' && (
                    <GlassButton
                      size="sm"
                      variant="secondary"
                      onClick={() => onAction(notif, 'open_plan')}
                    >
                      Detayları Aç
                    </GlassButton>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Scenario Simulator */}
      <div>
        <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
          <Play className="w-3.5 h-3.5 text-indigo-400" />
          Proaktif Senaryo Test Laboratuvarı
        </h3>
        <p className="text-xs text-slate-400 mb-3">
          Sistemin arka plan çalışanlarının (background workers) gerçek zamanlı tetikleme mantığını test et:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            const isRunning = simulating === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => handleSimulate(sc.id)}
                disabled={isRunning}
                className="p-3 rounded-xl bg-slate-900/60 border border-white/10 hover:border-cyan-500/40 text-left transition-all hover:bg-slate-800/60 flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="p-1 rounded-lg bg-white/5 text-cyan-400">
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {sc.badge}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                    {sc.label}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {sc.desc}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-cyan-400">
                  <span>{isRunning ? 'Tetikleniyor...' : 'Senaryoyu Başlat'}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
