import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Clock,
  MessageSquare,
  Plus,
  Sparkles,
  Check,
  UserCheck,
  Filter,
  Shield,
  Heart,
  Briefcase,
  Trash2,
} from 'lucide-react';
import { GlassCard } from '../design-system/GlassCard';

export interface CommitmentItem {
  id: string;
  recipientName: string;
  relation: string;
  avatarEmoji: string;
  promiseText: string;
  deadlineText: string;
  platform: 'whatsapp' | 'telegram' | 'teams' | 'direct';
  category: 'personal' | 'work' | 'family';
  isCompleted: boolean;
  createdAt: string;
}

interface CommitmentTrackerCardProps {
  onAddPlanTask?: (title: string, preferredTime: string, category: string) => void;
  onOpenChatWithPrompt?: (prompt: string) => void;
}

export const CommitmentTrackerCard: React.FC<CommitmentTrackerCardProps> = ({
  onAddPlanTask,
  onOpenChatWithPrompt,
}) => {
  const [commitments, setCommitments] = useState<CommitmentItem[]>([
    {
      id: 'com-1',
      recipientName: 'Zeynep',
      relation: 'Eş / Partner',
      avatarEmoji: '🌸',
      promiseText: 'Akşam eve dönerken marketten organik laktozsuz süt ve kahve alacağım.',
      deadlineText: 'Bugün 17:45',
      platform: 'whatsapp',
      category: 'personal',
      isCompleted: false,
      createdAt: '2026-09-24T12:00:00Z',
    },
    {
      id: 'com-2',
      recipientName: 'Murat (Grispi)',
      relation: 'İş Ortağı & Grispi',
      avatarEmoji: '💼',
      promiseText: 'Yarın sabah 10:00 öncesi Q3 SaaS gelir tablosu raporunu revize edip göndereceğim.',
      deadlineText: 'Yarın 10:00',
      platform: 'telegram',
      category: 'work',
      isCompleted: false,
      createdAt: '2026-09-24T14:30:00Z',
    },
    {
      id: 'com-3',
      recipientName: 'Cem',
      relation: 'Ürün Yöneticisi',
      avatarEmoji: '☕',
      promiseText: 'Haftaya Salı günü Moda sahilinde kahve içip yeni mimariyi konuşalım.',
      deadlineText: 'Gelecek Salı 15:00',
      platform: 'teams',
      category: 'work',
      isCompleted: false,
      createdAt: '2026-09-24T16:00:00Z',
    },
    {
      id: 'com-4',
      recipientName: 'Annem (Fatma)',
      relation: 'Anne',
      avatarEmoji: '💐',
      promiseText: 'İş çıkışında tansiyonunu sormak için 5 dakika arayacağım.',
      deadlineText: 'Bugün 18:30',
      platform: 'whatsapp',
      category: 'family',
      isCompleted: false,
      createdAt: '2026-09-23T11:00:00Z',
    },
    {
      id: 'com-5',
      recipientName: 'Can',
      relation: 'Kardeş',
      avatarEmoji: '⚡',
      promiseText: 'AWS sınavı öncesi Cuma akşamı arayıp moral vereceğim.',
      deadlineText: 'Cuma 20:00',
      platform: 'direct',
      category: 'family',
      isCompleted: true,
      createdAt: '2026-09-22T09:00:00Z',
    },
  ]);

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newRecipient, setNewRecipient] = useState('');
  const [newPromise, setNewPromise] = useState('');
  const [newDeadline, setNewDeadline] = useState('Bugün 18:00');
  const [newPlatform, setNewPlatform] = useState<'whatsapp' | 'telegram' | 'teams' | 'direct'>('whatsapp');

  const handleToggle = (id: string) => {
    setCommitments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isCompleted: !c.isCompleted } : c))
    );
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipient.trim() || !newPromise.trim()) return;

    const newItem: CommitmentItem = {
      id: `com-${Date.now()}`,
      recipientName: newRecipient.trim(),
      relation: 'Önemli Kişi',
      avatarEmoji: '🤝',
      promiseText: newPromise.trim(),
      deadlineText: newDeadline.trim() || 'Bugün',
      platform: newPlatform,
      category: 'personal',
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    setCommitments([newItem, ...commitments]);
    setNewRecipient('');
    setNewPromise('');
    setIsAddingNew(false);

    // Also add to daily plan
    if (onAddPlanTask) {
      onAddPlanTask(`${newItem.recipientName}: ${newItem.promiseText}`, '18:00', 'personal');
    }
  };

  const filtered = commitments.filter((c) => {
    if (activeFilter === 'pending') return !c.isCompleted;
    if (activeFilter === 'completed') return c.isCompleted;
    return true;
  });

  const pendingCount = commitments.filter((c) => !c.isCompleted).length;

  return (
    <GlassCard className="p-4 sm:p-5 border-emerald-500/30 shadow-[0_12px_40px_rgba(16,185,129,0.12)] relative overflow-hidden space-y-3.5">
      {/* Background ambient glow */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_16px_rgba(16,185,129,0.25)]">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Kime Ne Söz Verdim? (Taahhüt Takipçisi)
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/40">
                {pendingCount} Bekleyen Söz
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              WhatsApp, Telegram ve Teams konuşmalarından çıkarılan sözler ve taahhütler
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddingNew(!isAddingNew)}
          className="text-[11px] px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all flex items-center gap-1 cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span>Söz Ekle</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between text-xs relative z-10">
        <div className="flex gap-1 p-0.5 rounded-xl bg-slate-950/80 border border-white/10">
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeFilter === 'pending'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bekleyenler ({pendingCount})
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeFilter === 'completed'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tutulan Sözler
          </button>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeFilter === 'all'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tümü
          </button>
        </div>

        <span className="text-[11px] text-slate-400">
          Güven & İtibar Skoru: <strong className="text-emerald-400 font-mono">%92</strong>
        </span>
      </div>

      {/* Inline Form to Add a Commitment */}
      {isAddingNew && (
        <form onSubmit={handleAddNew} className="p-3.5 rounded-2xl bg-slate-950/90 border border-emerald-500/30 space-y-2.5 animate-fade-in relative z-10">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              required
              value={newRecipient}
              onChange={(e) => setNewRecipient(e.target.value)}
              placeholder="Kime söz verildi? (ör: Zeynep, Murat)"
              className="w-full text-xs p-2 rounded-xl bg-slate-900 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
            />
            <input
              type="text"
              value={newDeadline}
              onChange={(e) => setNewDeadline(e.target.value)}
              placeholder="Hedef Zaman (ör: Bugün 18:00)"
              className="w-full text-xs p-2 rounded-xl bg-slate-900 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
            />
          </div>

          <textarea
            rows={2}
            required
            value={newPromise}
            onChange={(e) => setNewPromise(e.target.value)}
            placeholder="Verilen söz veya taahhüt detayı..."
            className="w-full text-xs p-2 rounded-xl bg-slate-900 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
          />

          <div className="flex justify-between items-center pt-1">
            <select
              value={newPlatform}
              onChange={(e: any) => setNewPlatform(e.target.value)}
              className="text-xs bg-slate-900 border border-white/15 text-slate-300 rounded-lg p-1"
            >
              <option value="whatsapp">WhatsApp Sohbeti</option>
              <option value="telegram">Telegram Mesajı</option>
              <option value="teams">Teams Kanalı</option>
              <option value="direct">Yüz Yüze / Sözlü</option>
            </select>

            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-all"
              >
                Kaydet & Plana Ekle
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Commitments List */}
      <div className="space-y-2 relative z-10">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`p-3 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
              item.isCompleted
                ? 'bg-slate-950/40 border-white/5 opacity-60'
                : 'bg-slate-950/70 border-white/10 hover:border-emerald-500/30'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <button
                type="button"
                onClick={() => handleToggle(item.id)}
                className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
              >
                {item.isCompleted ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>

              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm">{item.avatarEmoji}</span>
                  <strong className="text-xs text-white font-semibold">{item.recipientName}</strong>
                  <span className="text-[10px] text-slate-400">({item.relation})</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono uppercase ${
                      item.platform === 'whatsapp'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                        : item.platform === 'telegram'
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20'
                        : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                    }`}
                  >
                    {item.platform}
                  </span>
                </div>

                <p
                  className={`text-xs mt-1 leading-snug ${
                    item.isCompleted ? 'line-through text-slate-500' : 'text-slate-200'
                  }`}
                >
                  "{item.promiseText}"
                </p>

                <div className="flex items-center gap-2 mt-1.5 text-[10.5px] text-slate-400">
                  <span className="flex items-center gap-1 text-amber-300">
                    <Clock className="w-3 h-3" />
                    {item.deadlineText}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleToggle(item.id)}
              className={`text-[10px] px-2 py-1 rounded-lg border transition-all shrink-0 cursor-pointer ${
                item.isCompleted
                  ? 'bg-white/5 text-slate-400 border-white/5'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/30 font-medium'
              }`}
            >
              {item.isCompleted ? 'Tamamlandı' : 'Sözü Tuttum ✓'}
            </button>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};
