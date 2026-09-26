import React, { useState, useEffect } from 'react';
import {
  Bell,
  Volume2,
  X,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Heart,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { notificationService, ProactivePushPayload } from '../../services/notificationService';

interface ActiveNotification extends ProactivePushPayload {
  timestamp: Date;
}

interface ProactiveNotificationBannerProps {
  onActionClick?: (notification: ActiveNotification) => void;
}

export const ProactiveNotificationBanner: React.FC<ProactiveNotificationBannerProps> = ({
  onActionClick,
}) => {
  const [currentNotif, setCurrentNotif] = useState<ActiveNotification | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((payload) => {
      setCurrentNotif(payload);
      setIsVisible(true);

      // Auto dismiss after 7 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 7000);

      return () => clearTimeout(timer);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (!currentNotif || !isVisible) return null;

  const getCategoryBadge = () => {
    switch (currentNotif.category) {
      case 'briefing':
        return {
          label: 'Sabah/Akşam Brifingi',
          icon: Sparkles,
          color: 'from-amber-500/20 to-cyan-500/20 text-cyan-300 border-cyan-500/40',
        };
      case 'burnout':
        return {
          label: 'Bilişsel Yük Kalkanı',
          icon: ShieldAlert,
          color: 'from-indigo-500/20 to-purple-500/20 text-indigo-300 border-indigo-500/40',
        };
      case 'relationship':
        return {
          label: 'Vefa & Empati',
          icon: Heart,
          color: 'from-rose-500/20 to-pink-500/20 text-rose-300 border-rose-500/40',
        };
      case 'commitment':
        return {
          label: 'Söz Takipçisi',
          icon: CheckCircle,
          color: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/40',
        };
      default:
        return {
          label: 'Proaktif Bildirim',
          icon: Bell,
          color: 'from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/40',
        };
    }
  };

  const badge = getCategoryBadge();
  const IconComponent = badge.icon;

  return (
    <div className="fixed top-2.5 sm:top-4 inset-x-2 sm:inset-x-auto sm:right-4 z-50 pointer-events-none select-none max-w-sm sm:w-96 mx-auto animate-bounce-in">
      <div className="pointer-events-auto p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-cyan-500/40 shadow-[0_16px_40px_rgba(0,0,0,0.8)] text-slate-100 flex flex-col gap-2.5">
        {/* Top Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center text-slate-950 font-black text-[10px] shadow-[0_0_8px_rgba(6,182,212,0.5)]">
              A
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-white tracking-tight">AYZEK</span>
              <span
                className={`text-[9.5px] px-2 py-0.5 rounded-full font-medium border bg-gradient-to-r ${badge.color} flex items-center gap-1`}
              >
                <IconComponent className="w-2.5 h-2.5" />
                <span>{badge.label}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span
              className="p-1 text-cyan-400"
              title="Akustik ses sinyali ve titreşim tetiklendi"
            >
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
            </span>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div>
          <h4 className="text-xs font-bold text-slate-100 leading-snug">{currentNotif.title}</h4>
          <p className="text-[11px] text-slate-300/90 mt-1 line-clamp-3 leading-relaxed">
            {currentNotif.body}
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-1 border-t border-white/10 text-xs">
          <span className="text-[10px] text-slate-400 font-mono">
            {currentNotif.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Sistem Bildirimi
          </span>

          <button
            onClick={() => {
              setIsVisible(false);
              if (onActionClick) onActionClick(currentNotif);
            }}
            className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>İncele</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
