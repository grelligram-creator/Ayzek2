import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sun,
  Moon,
  Sparkles,
  RotateCcw,
  Check,
  Clock,
  Compass,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  Headphones,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { GlassCard } from '../design-system/GlassCard';
import { api } from '../../services/api';

interface AudioDailyBriefingProps {
  userName?: string;
  onOpenChatWithPrompt?: (prompt: string) => void;
  onAddPlanTask?: (title: string, preferredTime: string, category: string) => void;
}

export const AudioDailyBriefing: React.FC<AudioDailyBriefingProps> = ({
  userName = 'Görkem',
  onOpenChatWithPrompt,
  onAddPlanTask,
}) => {
  const [mode, setMode] = useState<'morning' | 'evening'>('morning');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isTaskAdded, setIsTaskAdded] = useState(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(0);

  // Default scripts crafted specifically for AYZEK
  const [morningScript, setMorningScript] = useState(
    `Günaydın ${userName}, bugün Levent'te 2 kritik toplantın var. Saat 14:00'teki Teams toplantısı öncesinde 30 dakika hazırlık partisi koydum. Moda'da hava 22 derece, keten gömlek harika bir tercih. Zeynep dün teslimattan yorgun döndü; akşam ona Moda sahilinde ufak bir yürüyüş planladım. Zihnini ferah tut, harika bir gün olsun!`
  );

  const [eveningScript, setEveningScript] = useState(
    `İyi akşamlar ${userName}. Günün değerlendirmesi: Bugün Levent mesaini, 3 kritik iş görevini ve mikro-rutinlerini başarıyla tamamladın. Zeynep ile akşam sahil yürüyüşü zihnini dinlendirdi. Şimdi zihinsel dekompresyon ve uykuya geçiş rehberi devrede. Ekranları kapatıp derin nefes egzersiziyle uykuya hazırlanabilirsin. Huzurlu geceler.`
  );

  const activeScript = mode === 'morning' ? morningScript : eveningScript;

  // Split script into sentences for karaoke-style visual reading
  const sentences = activeScript
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 0);

  const highlights =
    mode === 'morning'
      ? [
          '☀️ Moda 22°C (Keten gömlek önerisi)',
          '💼 11:00 Büyüme & 14:00 Teams toplantısı',
          '⏱️ 13:30 - 14:00 Odak Partisi takvimde',
          '🌸 Zeynep ile akşam sahil yürüyüşü',
        ]
      : [
          '✨ 3 Kritik iş görevi tamamlandı',
          '🚶 10.000 Adım & market alışverişi bitti',
          '🌙 22:30 Mavi ışık & ekran detoksu devrede',
          '🫁 4-7-8 Rahatlatıcı nefes & uyku rehberi',
        ];

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<any>(null);

  // Initialize SpeechSynthesis and Voice Detection
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSpeechSupported(false);
      return;
    }

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);

      // Prioritize Turkish voices
      const trVoices = voices.filter((v) => v.lang.startsWith('tr'));
      if (trVoices.length > 0) {
        setSelectedVoice(trVoices[0]);
      } else if (voices.length > 0) {
        setSelectedVoice(voices[0]);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Audio Playback / Pause / Resume
  const handleTogglePlay = () => {
    if (!isSpeechSupported) {
      simulateAudioProgress();
      return;
    }

    if (isPlaying) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
        startProgressTimer();
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(activeScript);
      utterance.rate = playbackSpeed;
      utterance.lang = 'tr-TR';
      utterance.pitch = 1.0;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
        setActiveSentenceIndex(0);
        startProgressTimer();
      };

      utterance.onboundary = (event) => {
        if (event.name === 'sentence' || event.name === 'word') {
          // Calculate approx sentence based on char index
          const charIndex = event.charIndex;
          let runningLength = 0;
          for (let i = 0; i < sentences.length; i++) {
            runningLength += sentences[i].length + 1;
            if (charIndex < runningLength) {
              setActiveSentenceIndex(i);
              break;
            }
          }
        }
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setProgressPercent(100);
        setActiveSentenceIndex(sentences.length - 1);
        if (intervalRef.current) clearInterval(intervalRef.current);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setIsPaused(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startProgressTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const totalDurationSeconds = 50 / playbackSpeed;
    const stepMs = 400;
    const increment = (stepMs / 1000 / totalDurationSeconds) * 100;

    intervalRef.current = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) {
          clearInterval(intervalRef.current);
          return 100;
        }
        const next = prev + increment;
        const targetSentence = Math.min(
          sentences.length - 1,
          Math.floor((next / 100) * sentences.length)
        );
        setActiveSentenceIndex(targetSentence);
        return next;
      });
    }, stepMs);
  };

  const simulateAudioProgress = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      setIsPlaying(true);
      startProgressTimer();
    }
  };

  const handleReset = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPlaying(false);
    setIsPaused(false);
    setProgressPercent(0);
    setActiveSentenceIndex(0);
  };

  const handleChangeMode = (newMode: 'morning' | 'evening') => {
    handleReset();
    setMode(newMode);
    setIsTaskAdded(false);
  };

  // Live AI Regeneration
  const handleRegenerateWithAI = async () => {
    setIsGeneratingAI(true);
    handleReset();
    try {
      const res = await api.generateAudioBriefing(mode, true);
      if (res.success && res.script) {
        if (mode === 'morning') {
          setMorningScript(res.script);
        } else {
          setEveningScript(res.script);
        }
      }
    } catch (err) {
      console.error('Failed to regenerate AI briefing:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Add Briefing Action to Today's Plan
  const handleAddBriefingToPlan = () => {
    if (onAddPlanTask) {
      if (mode === 'morning') {
        onAddPlanTask(
          '13:30 Teams Öncesi 30 Dk Odak Partisi & Akşam Sahil Yürüyüşü',
          '13:30',
          'work'
        );
      } else {
        onAddPlanTask(
          '22:30 Zihinsel Dekompresyon, Mavi Işık Detoksu & 4-7-8 Nefes',
          '22:30',
          'health'
        );
      }
      setIsTaskAdded(true);
      setTimeout(() => setIsTaskAdded(false), 3000);
    }
  };

  return (
    <GlassCard className="p-4 sm:p-5 border-cyan-500/30 shadow-[0_12px_40px_rgba(6,182,212,0.12)] relative overflow-hidden space-y-4">
      {/* Background ambient liquid glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Mode Switcher */}
      <div className="flex items-start justify-between relative z-10 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-500 text-slate-950 flex items-center justify-center font-bold shadow-[0_0_16px_rgba(6,182,212,0.35)] shrink-0">
            <Volume2 className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                60 Saniyelik Sabah & Akşam Sesli Brifingi
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/40">
                AI Audio Digest
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Güne başlarken veya günü kapatırken hayatını düzene sokan ses
            </p>
          </div>
        </div>

        {/* Morning / Evening Segmented Toggle */}
        <div className="flex p-0.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs">
          <button
            onClick={() => handleChangeMode('morning')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              mode === 'morning'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Sabah 07:45</span>
          </button>
          <button
            onClick={() => handleChangeMode('evening')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              mode === 'evening'
                ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Akşam 22:30</span>
          </button>
        </div>
      </div>

      {/* Audio Waveform Player Control Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-950/75 border border-white/10 flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          {/* Main Circular Play / Pause Button */}
          <button
            onClick={handleTogglePlay}
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-slate-950 transition-all duration-200 cursor-pointer shadow-lg shrink-0 ${
              isPlaying && !isPaused
                ? 'bg-amber-400 hover:bg-amber-300 scale-105 shadow-[0_0_20px_rgba(251,191,36,0.6)]'
                : 'bg-gradient-to-tr from-cyan-400 to-indigo-400 hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
            }`}
            title={isPlaying && !isPaused ? 'Durdur' : 'Brifingi Dinle'}
          >
            {isPlaying && !isPaused ? (
              <Pause className="w-5 h-5 fill-slate-950" />
            ) : (
              <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
            )}
          </button>

          <div>
            <span className="text-xs font-bold text-white block">
              {mode === 'morning'
                ? 'Sabah Odak & Ritim Brifingi'
                : 'Akşam Zihinsel Dekompresyon & Uyku Rehberi'}
            </span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-cyan-400" />
              {isPlaying
                ? isPaused
                  ? 'Duraklatıldı'
                  : 'Seslendiriliyor · Web Speech API'
                : '~55 Saniye · 07:45 Rutini'}
            </span>
          </div>
        </div>

        {/* Animated Sound Wave Bars */}
        <div className="hidden sm:flex items-center gap-1 h-8 px-2">
          {[35, 70, 50, 95, 65, 100, 45, 85, 40, 90, 60, 80, 50, 75].map((h, i) => (
            <div
              key={i}
              style={{
                height:
                  isPlaying && !isPaused
                    ? `${Math.max(15, (h * (progressPercent + i * 7)) % 100)}%`
                    : '15%',
              }}
              className={`w-1 rounded-full transition-all duration-150 ${
                isPlaying && !isPaused
                  ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                  : 'bg-slate-700/60'
              }`}
            />
          ))}
        </div>

        {/* Speed Selector, AI Regenerate & Reset */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() =>
              setPlaybackSpeed((s) =>
                s === 1.0 ? 1.25 : s === 1.25 ? 1.5 : s === 1.5 ? 0.8 : 1.0
              )
            }
            className="text-[10px] px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 font-mono border border-white/10 transition-colors"
            title="Oynatma Hızı"
          >
            {playbackSpeed}x
          </button>

          <button
            onClick={handleRegenerateWithAI}
            disabled={isGeneratingAI}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors disabled:opacity-50"
            title="Gemini ile Canlı Brifing Üret"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isGeneratingAI ? 'animate-spin text-cyan-400' : ''}`}
            />
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Başa Sar / Sıfırla"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Track */}
      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/5">
        <div
          style={{ width: `${progressPercent}%` }}
          className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-amber-400 transition-all duration-300 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.5)]"
        />
      </div>

      {/* 4 Core Contextual Highlight Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {highlights.map((h, idx) => (
          <div
            key={idx}
            className="p-2 rounded-xl bg-slate-950/60 border border-white/5 text-slate-300 flex items-center gap-2"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
            <span className="text-[11.5px] font-medium leading-tight">{h}</span>
          </div>
        ))}
      </div>

      {/* Karaoke / Transcript Text Bubble */}
      <div className="p-3.5 rounded-2xl bg-cyan-950/25 border border-cyan-500/20 text-xs text-slate-300 leading-relaxed relative z-10 space-y-2">
        <div className="flex items-center justify-between pb-1 border-b border-white/5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-300 font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Brifing Konuşma Metni
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {sentences.length} Cümle · Türkçe Sentezleyici
          </span>
        </div>

        {/* Sentences with active highlighted sentence */}
        <div className="space-y-1.5 font-sans text-xs">
          {sentences.map((sentence, idx) => (
            <span
              key={idx}
              className={`inline mr-1.5 transition-all duration-200 rounded px-1 py-0.5 ${
                isPlaying && activeSentenceIndex === idx
                  ? 'bg-cyan-500/25 text-white font-semibold border-b border-cyan-400 shadow-sm'
                  : 'text-slate-300'
              }`}
            >
              {sentence}
            </span>
          ))}
        </div>

        {/* Bottom Quick Action Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 flex-wrap gap-2">
          <button
            onClick={handleAddBriefingToPlan}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {isTaskAdded ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Görevi Plana Eklendi</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>Brifingi Bugünkü Plana Ekle</span>
              </>
            )}
          </button>

          {onOpenChatWithPrompt && (
            <button
              onClick={() =>
                onOpenChatWithPrompt(
                  `${mode === 'morning' ? 'Sabah' : 'Akşam'} sesli brifingindeki konuları detaylandır ve takvimi organize et`
                )
              }
              className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer ml-auto"
            >
              <span>AYZEK'e Detay Sor</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </GlassCard>
  );
};
