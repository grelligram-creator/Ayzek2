import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  RefreshCw,
  Trash2,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { TaskItem, DailyPlanItem } from '../../types/ayzek';
import { GlassCard } from '../design-system/GlassCard';
import { GlassButton } from '../design-system/GlassButton';
import { GlassSheet } from '../design-system/GlassSheet';
import { GlassInput } from '../design-system/GlassInput';

interface PlanViewProps {
  plan: DailyPlanItem[];
  tasks: TaskItem[];
  onToggleTask: (taskId: string, currentStatus: string) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (task: Partial<TaskItem>) => void;
  onReorganize: (delayedMinutes: number) => void;
  isReorganizing?: boolean;
}

export const PlanView: React.FC<PlanViewProps> = ({
  plan,
  tasks,
  onToggleTask,
  onDeleteTask,
  onAddTask,
  onReorganize,
  isReorganizing = false,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('16:00');
  const [newCategory, setNewCategory] = useState<'work' | 'personal' | 'shopping' | 'health'>('personal');
  const [newPriority, setNewPriority] = useState<'urgent' | 'high' | 'medium' | 'low'>('medium');
  const [newContext, setNewContext] = useState('work_commute');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask({
      title: newTitle.trim(),
      preferredTime: newTime,
      category: newCategory,
      priority: newPriority,
      contextTrigger: newContext,
      durationMinutes: 30,
    });
    setNewTitle('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 pb-24 max-w-xl mx-auto w-full">
      {/* Editorial Header */}
      <div className="flex items-start justify-between gap-4 pt-2">
        <div>
          <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Dinamik Zaman Çizelgesi
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 mt-1">
            Bugünün Akışı
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            24 Eylül 2026, Perşembe · Bağlamsal planlama devrede
          </p>
        </div>

        <GlassButton
          size="sm"
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          className="shrink-0"
        >
          <Plus className="w-4 h-4" />
          Görev Ekle
        </GlassButton>
      </div>

      {/* Dynamic Reorganizer Action Card */}
      <GlassCard variant="accent" className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Dinamik Plan Dengeleyici (Dynamic Planner)
            </span>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Günün uzadı veya toplantın sarktı mı? AYZEK akşam görevlerini otomatik olarak kaydırıp dinlenme paylarını korur.
            </p>
          </div>
          <GlassButton
            size="sm"
            variant="secondary"
            loading={isReorganizing}
            onClick={() => onReorganize(45)}
            className="shrink-0 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            +45 Dk Kaydır
          </GlassButton>
        </div>
      </GlassCard>

      {/* Timeline Items List */}
      <div className="relative pl-6 sm:pl-8 border-l border-white/10 space-y-4">
        {plan.map((item) => {
          const matchingTask = item.taskId
            ? tasks.find((t) => t.id === item.taskId)
            : null;
          const isCompleted = item.status === 'completed';

          return (
            <div key={item.id} className="relative group">
              {/* Timeline dot */}
              <div
                className={`absolute -left-[31px] sm:-left-[39px] top-4 w-4 h-4 rounded-full border-2 transition-colors flex items-center justify-center ${
                  isCompleted
                    ? 'border-emerald-400 bg-slate-950 text-emerald-400'
                    : item.type === 'task'
                    ? 'border-cyan-400 bg-cyan-950/80 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'border-slate-600 bg-slate-900'
                }`}
              >
                {isCompleted && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              </div>

              {/* Item Card */}
              <GlassCard
                variant={isCompleted ? 'subtle' : item.type === 'task' ? 'default' : 'subtle'}
                className={`p-3.5 sm:p-4 transition-all ${
                  isCompleted ? 'opacity-70' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-cyan-400 font-mono">
                        {item.time}
                      </span>
                      <span className="text-slate-600 text-xs">·</span>
                      <span className="text-[11px] text-slate-400">
                        {item.durationMinutes} dk
                      </span>
                      {matchingTask && (
                        <span className="text-[10px] text-slate-400 uppercase">
                          {matchingTask.category}
                        </span>
                      )}
                      {matchingTask?.contextTrigger === 'work_commute' && (
                        <span className="text-[10px] text-indigo-300">
                          İş Çıkışı Bağlamı
                        </span>
                      )}
                    </div>

                    <h3
                      className={`text-sm font-semibold ${
                        isCompleted
                          ? 'line-through text-slate-400'
                          : 'text-slate-100'
                      }`}
                    >
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {item.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Action buttons if it's a task */}
                  {matchingTask && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() =>
                          onToggleTask(matchingTask.id, matchingTask.status)
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-white/5 transition-colors cursor-pointer"
                        title={
                          isCompleted
                            ? 'Görevi geri al'
                            : 'Tamamlandı işaretle'
                        }
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => onDeleteTask(matchingTask.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
                        title="Görevi Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      <GlassSheet
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Yeni Görev veya Rutin Ekle"
        subtitle="AYZEK bağlamsal tetikleyicilerle doğru zamanda hatırlatacaktır."
      >
        <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
          <GlassInput
            label="Görev Başlığı"
            placeholder="ör: Eczaneden vitamin al, Raporu hazırla..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
            <GlassInput
              label="Tercih Edilen Saat"
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
            />

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Kategori
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full rounded-xl bg-slate-900/70 border border-white/10 px-3 py-2.5 text-sm text-slate-100 backdrop-blur-md focus:border-cyan-500/50 focus:outline-none"
              >
                <option value="personal">Kişisel</option>
                <option value="work">İş & Kariyer</option>
                <option value="shopping">Alışveriş</option>
                <option value="health">Sağlık & Spor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Öncelik
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full rounded-xl bg-slate-900/70 border border-white/10 px-3 py-2.5 text-sm text-slate-100 backdrop-blur-md focus:border-cyan-500/50 focus:outline-none"
              >
                <option value="urgent">Acil</option>
                <option value="high">Yüksek</option>
                <option value="medium">Normal</option>
                <option value="low">Düşük</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Bağlamsal Tetikleyici
              </label>
              <select
                value={newContext}
                onChange={(e) => setNewContext(e.target.value)}
                className="w-full rounded-xl bg-slate-900/70 border border-white/10 px-3 py-2.5 text-sm text-slate-100 backdrop-blur-md focus:border-cyan-500/50 focus:outline-none"
              >
                <option value="work_commute">İşten Çıkış (15 dk kala)</option>
                <option value="morning_routine">Sabah Rutini Sonrası</option>
                <option value="post_dinner">Akşam Yemeği Sonrası</option>
                <option value="specific_time">Sadece Belirtilen Saatte</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
            <GlassButton
              type="button"
              variant="ghost"
              onClick={() => setIsAddModalOpen(false)}
            >
              Vazgeç
            </GlassButton>
            <GlassButton type="submit" variant="primary">
              Görevi Kaydet
            </GlassButton>
          </div>
        </form>
      </GlassSheet>
    </div>
  );
};
