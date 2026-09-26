import React, { useState } from 'react';
import {
  Layers,
  Database,
  Cpu,
  Shield,
  Bell,
  CheckCircle,
  FileCode,
  Smartphone,
  Palette,
  Terminal,
} from 'lucide-react';
import { GlassSheet } from '../design-system/GlassSheet';
import { GlassCard } from '../design-system/GlassCard';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeSection, setActiveSection] = useState<'stack' | 'db' | 'ai' | 'proactive' | 'security' | 'screens'>('stack');

  return (
    <GlassSheet
      isOpen={isOpen}
      onClose={onClose}
      title="AYZEK — Sistem & Mimari Belgesi (14 Madde)"
      subtitle="Üretim seviyesi Kişisel Yaşam İşletim Sistemi Mimari Şartnamesi"
      maxWidth="2xl"
    >
      <div className="flex flex-col gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-white/10 overflow-x-auto custom-scrollbar">
          {[
            { id: 'stack', label: '1-3. Mimari & Stack', icon: Layers },
            { id: 'db', label: '4-5. DB Şema & API', icon: Database },
            { id: 'ai', label: '6-7. AI & Hafıza', icon: Cpu },
            { id: 'proactive', label: '8-9. Proaktif & Bildirim', icon: Bell },
            { id: 'screens', label: '10-11. Ekranlar & Tasarım', icon: Smartphone },
            { id: 'security', label: '12-14. Güvenlik & Test', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  activeSection === tab.id
                    ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* SECTION 1: Tech Stack & System Architecture */}
        {activeSection === 'stack' && (
          <div className="space-y-3 text-xs leading-relaxed text-slate-300">
            <GlassCard variant="subtle" className="p-4">
              <h3 className="text-sm font-bold text-slate-100 mb-1">
                1. Teknoloji Yığını & Gerekçeler
              </h3>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Mobil İstemci:</strong> Native iOS (SwiftUI + Combine/Async) & Native Android (Jetpack Compose). 60 FPS akıcı Metal/Glassmorphism gölgelendirmeleri, HealthKit senkronizasyonu, arka plan APNs/FCM bildirimleri ve Keychain şifreleme.</li>
                <li><strong>Web & Prototip:</strong> React 19 + TypeScript + Vite + Tailwind CSS v4 + Motion.</li>
                <li><strong>Backend:</strong> TypeScript + Express / NestJS. Asenkron olay tabanlı mimari.</li>
                <li><strong>Yapay Zeka:</strong> Server-side <code>@google/genai</code> SDK (<code>gemini-3.8-flash</code>) ile gerçek Tool Calling (FunctionDeclaration). API anahtarı asla istemcide tutulmaz.</li>
                <li><strong>Veritabanı:</strong> PostgreSQL 16 + <code>pgvector</code> ile semantik hafıza erişimi + Redis 7 bildirim kuyruğu (BullMQ) & önbellek.</li>
              </ul>
            </GlassCard>

            <GlassCard variant="subtle" className="p-4">
              <h3 className="text-sm font-bold text-slate-100 mb-1">
                2 & 3. Yüksek Seviye Sistem Mimarisi & Repo Yapısı
              </h3>
              <p className="mb-2">AYZEK modüler katmanlı bir mimariye sahiptir:</p>
              <pre className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-cyan-300 overflow-x-auto">
{`Client (iOS / Android / Web)
       │ HTTPS / REST / SSE
       ▼
API Gateway / Auth (JWT Token Rotation + Rate Limiting)
       │
Context Assembly Engine (Memories + Tasks + Routine + Preferences)
       │
AI Abstraction Layer (Gemini 3.8 Flash SDK + Tool Calling)
  ├── Task & Planner Engine (Dinamik gün dengeleyici)
  ├── Long-Term Memory Engine (pgvector semantik filtre)
  └── Proactive Intelligence Engine (Fatigue check + Relative offset)
       │
PostgreSQL (ACID + pgvector) · Redis 7 · Encrypted S3 Document Vault`}
              </pre>
            </GlassCard>
          </div>
        )}

        {/* SECTION 2: Database Schema & API */}
        {activeSection === 'db' && (
          <div className="space-y-3 text-xs leading-relaxed text-slate-300">
            <GlassCard variant="subtle" className="p-4">
              <h3 className="text-sm font-bold text-slate-100 mb-1">
                4. PostgreSQL + pgvector Veritabanı Şeması
              </h3>
              <p className="mb-2">Kritik tablolar ve ilişkiler:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li><code>users & profiles</code>: Uyanış, uyku, iş başlangıç/bitiş rutinleri ve iletişim tercihleri.</li>
                <li><code>memories</code>: <code>type</code> (IDENTITY, ROUTINE, PREFERENCE, GOAL, SHOPPING, vb.), <code>confidence</code>, <code>source</code>, <code>embedding vector(768)</code>, <code>is_active</code>.</li>
                <li><code>tasks</code>: <code>scheduled_date</code>, <code>preferred_time</code>, <code>priority</code>, <code>context_trigger</code> ('work_commute'), <code>status</code>.</li>
                <li><code>payments & subscriptions</code>: Son ödeme günleri, tutarlar, hatırlatma politikaları.</li>
                <li><code>vehicles & documents</code>: Plaka, muayene bitişi, OCR analizli garanti belgeleri.</li>
              </ul>
            </GlassCard>

            <GlassCard variant="subtle" className="p-4">
              <h3 className="text-sm font-bold text-slate-100 mb-1">
                5. REST API Sözleşmeleri
              </h3>
              <div className="space-y-1 font-mono text-[11px]">
                <p><span className="text-emerald-400">POST</span> /api/chat — Sohbet ve tool execution</p>
                <p><span className="text-cyan-400">GET</span> /api/memories — Yapılandırılmış hafıza filtreleri</p>
                <p><span className="text-rose-400">DELETE</span> /api/memories/:id — "Bunu unut" kalıcı silme</p>
                <p><span className="text-cyan-400">GET</span> /api/plan/today — Dinamik zaman çizelgesi</p>
                <p><span className="text-indigo-400">POST</span> /api/plan/reorganize — Gecikmelerde planı kaydırma</p>
                <p><span className="text-amber-400">POST</span> /api/proactive/evaluate — Proaktif karar hattı</p>
              </div>
            </GlassCard>
          </div>
        )}

        {/* SECTION 3: AI & Memory Architecture */}
        {activeSection === 'ai' && (
          <div className="space-y-3 text-xs leading-relaxed text-slate-300">
            <GlassCard variant="subtle" className="p-4">
              <h3 className="text-sm font-bold text-slate-100 mb-1">
                6 & 7. AI & Yapılandırılmış Hafıza Mimarisi
              </h3>
              <p>
                Her mesaj doğrudan LLM'e ham gönderilmez. Önce kullanıcının uyanış/iş saatleri, bugünkü bekleyen işleri ve semantik olarak alakalı hafızaları birleştirilir.
              </p>
              <div className="mt-2 p-3 rounded-xl bg-slate-950/80 border border-white/5 space-y-1">
                <p className="text-cyan-300 font-semibold">Tetiklenen AI Araçları (Tools):</p>
                <p>• <code>create_task</code>: Bağlamsal görev oluşturma</p>
                <p>• <code>reschedule_task</code>: Görev saatini veya tarihini kaydırma</p>
                <p>• <code>complete_task / delete_task</code>: Görev durumlarını yönetme</p>
                <p>• <code>save_memory</code>: Yeni rutin, tercih veya ilişki çıkarma</p>
                <p>• <code>forget_memory</code>: Bilgiyi hafızadan pasife alıp silme</p>
                <p>• <code>reorganize_day</code>: Geciken etkinlikler sonrası akşamı dengeleme</p>
              </div>
            </GlassCard>
          </div>
        )}

        {/* SECTION 4: Proactive Engine & Notification */}
        {activeSection === 'proactive' && (
          <div className="space-y-3 text-xs leading-relaxed text-slate-300">
            <GlassCard variant="subtle" className="p-4">
              <h3 className="text-sm font-bold text-slate-100 mb-1">
                8 & 9. Proaktif Zeka Hattı & Bildirim Yorulması (Fatigue)
              </h3>
              <p className="mb-2">
                AYZEK bildirim göndermeden önce şu formülü hesaplar:
              </p>
              <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-[11px] text-amber-300">
                Score = (Urgency × 1.5 + Importance × 1.2 + Relevance × 1.3) × PrefMultiplier - RecentNotifCount × 1.5
              </div>
              <p className="mt-2 text-slate-300">
                Örnek: 18:00 iş çıkışı olan bir kullanıcı için 17:45'te (15 dakika kala), markete uğrama görevi varsa ve son 2 saatte bildirim yağmuruna tutulmadıysa bildirim tetiklenir.
              </p>
            </GlassCard>
          </div>
        )}

        {/* SECTION 5: Screens & Design System */}
        {activeSection === 'screens' && (
          <div className="space-y-3 text-xs leading-relaxed text-slate-300">
            <GlassCard variant="subtle" className="p-4">
              <h3 className="text-sm font-bold text-slate-100 mb-1">
                10 & 11. Mobil Ekran Haritası & Glassmorphism Tasarım Sistemi
              </h3>
              <p>5 Ana Bölüm ve Yüzen Cam Gezinti Çubuğu:</p>
              <ul className="list-disc pl-4 space-y-1 mt-1">
                <li><strong>Home:</strong> Dashboard değil; bugünün 3 odak maddesi ve anlık proaktif kart.</li>
                <li><strong>Plan:</strong> Dinamik zaman çizelgesi, tek tıkla gün dengeleme ve görev yönetimi.</li>
                <li><strong>AYZEK (Chat):</strong> Kişisel asistan iletişimi; gerçek araç (tool) badge'leri ile görselleştirilmiş eylemler.</li>
                <li><strong>Life:</strong> Finans, abonelikler, araç, kasa belgeleri, hedefler, alışkanlık serileri.</li>
                <li><strong>Hafıza:</strong> Kullanıcı hakkında bilinen her şeyin şeffaf dökümü ("Bunu unut" butonuyla).</li>
              </ul>
            </GlassCard>
          </div>
        )}

        {/* SECTION 6: Security & Roadmap */}
        {activeSection === 'security' && (
          <div className="space-y-3 text-xs leading-relaxed text-slate-300">
            <GlassCard variant="subtle" className="p-4">
              <h3 className="text-sm font-bold text-slate-100 mb-1">
                12-14. Güvenlik, MVP Yol Haritası & Test Stratejisi
              </h3>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Sıfır API Anahtarı Sızıntısı:</strong> Gemini anahtarları yalnızca backend ortamında tutulur, istemciye gönderilmez.</li>
                <li><strong>Kritik Eylemlerde Teyit:</strong> Görev silme, takvim değişikliği ve finansal hatırlatma onay gerektirir.</li>
                <li><strong>MVP Kapsamı:</strong> Kimlik/Rutin, AI Sohbet + Tool Calling, Hafıza Gezgini, Görev & Dinamik Plan, Proaktif Bildirimler, Özel Günler, Temel Finans/Abonelik/Belgeler.</li>
                <li><strong>Testler:</strong> Otomatik plan dengeleme birim testleri, bildirim öncelik skoru hesaplayıcı testleri ve araç çalıştırma doğrulayıcıları.</li>
              </ul>
            </GlassCard>
          </div>
        )}
      </div>
    </GlassSheet>
  );
};
