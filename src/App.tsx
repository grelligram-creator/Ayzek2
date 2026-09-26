/**
 * AYZEK — Personal Life Operating System
 * Master Application Shell
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  BookOpen,
  UserPlus,
  Heart,
  Sun,
  Moon,
} from 'lucide-react';
import {
  UserProfile,
  Memory,
  TaskItem,
  Goal,
  Habit,
  Payment,
  Subscription,
  Vehicle,
  DocumentItem,
  SpecialDate,
  NotificationAlert,
  ChatMessage,
  DailyPlanItem,
  PersonProfile,
  EnergyLevel,
  MoodFeeling,
  FocusLevel,
  AuthUser,
} from './types/ayzek';
import { api } from './services/api';
import { NavTab, GlassNavigationBar } from './components/navigation/GlassNavigationBar';
import { HomeView } from './components/home/HomeView';
import { PlanView } from './components/plan/PlanView';
import { LifeView } from './components/life/LifeView';
import { ChatView } from './components/chat/ChatView';
import { ProfileView } from './components/profile/ProfileView';
import { SocialRelationshipsView } from './components/social/SocialRelationshipsView';
import { IntegrationsHubView } from './components/integrations/IntegrationsHubView';
import { AuthModal } from './components/auth/AuthModal';
import { ProactiveDrawer } from './components/proactive/ProactiveDrawer';
import { ArchitectureModal } from './components/architecture/ArchitectureModal';
import { InteractiveOnboardingModal } from './components/onboarding/InteractiveOnboardingModal';
import { RelationshipAssistantModal } from './components/relationship/RelationshipAssistantModal';
import { DecisionCopilotModal } from './components/lifestyle/DecisionCopilotModal';
import { MobileStorePublishModal } from './components/mobile/MobileStorePublishModal';
import { ProactiveNotificationBanner } from './components/notifications/ProactiveNotificationBanner';
import { GlassSheet } from './components/design-system/GlassSheet';
import { ShieldCheck, Scale, Smartphone } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [plan, setPlan] = useState<DailyPlanItem[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([]);
  const [notifications, setNotifications] = useState<NotificationAlert[]>([]);
  const [people, setPeople] = useState<PersonProfile[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isReorganizing, setIsReorganizing] = useState(false);

  // Modals & Drawers
  const [isProactiveDrawerOpen, setIsProactiveDrawerOpen] = useState(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isRelationshipModalOpen, setIsRelationshipModalOpen] = useState(false);
  const [isDecisionCopilotOpen, setIsDecisionCopilotOpen] = useState(false);
  const [isMobileStoreModalOpen, setIsMobileStoreModalOpen] = useState(false);
  const [isWalkingTaskAdded, setIsWalkingTaskAdded] = useState(false);
  const [isCycleTaskAdded, setIsCycleTaskAdded] = useState(false);
  const [isMentorTaskAdded, setIsMentorTaskAdded] = useState(false);

  // Load initial data
  useEffect(() => {
    const initData = async () => {
      try {
        const [
          profileRes,
          memRes,
          tasksRes,
          planRes,
          lifeRes,
          notifRes,
          peopleRes,
          authRes,
        ] = await Promise.all([
          api.getProfile(),
          api.getMemories(),
          api.getTasks(),
          api.getTodayPlan(),
          api.getLifeData(),
          api.getNotifications(),
          api.getPersonProfiles(),
          api.getCurrentUser(),
        ]);

        if (profileRes.success) setProfile(profileRes.profile);
        if (memRes.success) setMemories(memRes.memories);
        if (tasksRes.success) setTasks(tasksRes.tasks);
        if (planRes.success) setPlan(planRes.plan);
        if (notifRes.success) setNotifications(notifRes.notifications);
        if (peopleRes.success) setPeople(peopleRes.people);
        if (authRes.success) setCurrentUser(authRes.user);

        if (lifeRes.success) {
          setGoals(lifeRes.goals);
          setHabits(lifeRes.habits);
          setPayments(lifeRes.payments);
          setSubscriptions(lifeRes.subscriptions);
          setVehicles(lifeRes.vehicles);
          setDocuments(lifeRes.documents);
          setSpecialDates(lifeRes.specialDates);
        }

        // Initialize Chat greeting
        setChatMessages([
          {
            id: 'init-msg',
            sender: 'ayzek',
            text: `Merhaba ${profileRes.profile?.name || 'Görkem'}. Bugün senin için önemli 3 konuyu hazırladım. Saat 18:00'de işten çıkışın var. Eve dönmeden önce marketten süt, yumurta ve kahve alacağını not etmiştim. Akşamını kolaylaştırmak için hazırım.`,
            timestamp: new Date().toISOString(),
            suggestions: [
              'Bugün ne yapacağım?',
              'Anneme doğum günü mesajı hazırla',
              'Zeynep için sürpriz planı çıkar',
              'Kilo vermek istiyorum, hafif bir plan yap',
            ],
          },
        ]);
      } catch (err) {
        console.error('Failed to load AYZEK state:', err);
      }
    };

    initData();
  }, []);

  // Chat message sending with tool execution synchronizer
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const res = await api.sendMessage(text, chatMessages);
      if (res.success && res.message) {
        setChatMessages((prev) => [...prev, res.message]);

        // If tools were executed, synchronize data in real-time
        if (res.message.toolInvocations && res.message.toolInvocations.length > 0) {
          const [tasksRes, planRes, memRes] = await Promise.all([
            api.getTasks(),
            api.getTodayPlan(),
            api.getMemories(),
          ]);
          if (tasksRes.success) setTasks(tasksRes.tasks);
          if (planRes.success) setPlan(planRes.plan);
          if (memRes.success) setMemories(memRes.memories);
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setActiveTab('chat');
    handleSendMessage(prompt);
  };

  // Task Handlers
  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus as any } : t)),
    );
    await api.updateTask(taskId, { status: newStatus as any });
    const updatedPlan = await api.getTodayPlan();
    if (updatedPlan.success) setPlan(updatedPlan.plan);
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await api.deleteTask(taskId);
    const updatedPlan = await api.getTodayPlan();
    if (updatedPlan.success) setPlan(updatedPlan.plan);
  };

  const handleAddTask = async (taskData: Partial<TaskItem>) => {
    const res = await api.createTask(taskData);
    if (res.success) {
      setTasks((prev) => [...prev, res.task]);
      const updatedPlan = await api.getTodayPlan();
      if (updatedPlan.success) setPlan(updatedPlan.plan);
    }
  };

  const handleAddWalkingTask = async () => {
    const res = await api.createTask({
      title: 'İş Çıkışı 20 Dk Tempolu Yürüyüş',
      description: 'Metro/aracı erken bırakarak form tutma ve zihinsel detoks.',
      scheduledDate: '2026-09-24',
      preferredTime: '18:00',
      durationMinutes: 20,
      priority: 'medium',
      category: 'health',
      contextTrigger: 'work_commute',
    });
    if (res.success) {
      setTasks((prev) => [...prev, res.task]);
      setIsWalkingTaskAdded(true);
      const updatedPlan = await api.getTodayPlan();
      if (updatedPlan.success) setPlan(updatedPlan.plan);
    }
  };

  const handleUpdateCycle = async (data: { isEnabled?: boolean; lastPeriodDate?: string; cycleLengthDays?: number; periodLengthDays?: number }) => {
    const res = await api.updateCycleTracking(data);
    if (res.success && profile) {
      setProfile({
        ...profile,
        cycleTracking: res.cycleTracking,
      });
    }
  };

  const handleAddCycleTask = async (title: string, preferredTime: string) => {
    const res = await api.createTask({
      title,
      preferredTime,
      durationMinutes: 25,
      priority: 'medium',
      category: 'cycle',
      scheduledDate: '2026-09-24',
      contextTrigger: 'cycle_rest_day',
    });
    if (res.success) {
      setTasks((prev) => [...prev, res.task]);
      setIsCycleTaskAdded(true);
      const updatedPlan = await api.getTodayPlan();
      if (updatedPlan.success) setPlan(updatedPlan.plan);
    }
  };

  const handleAcceptMicroHabit = async (goalId: string, title: string) => {
    const res = await api.acceptMentorPlan(goalId, title);
    if (res.success) {
      setTasks((prev) => [...prev, res.task]);
      setIsMentorTaskAdded(true);
      const updatedPlan = await api.getTodayPlan();
      if (updatedPlan.success) setPlan(updatedPlan.plan);
    }
  };

  const handleUpdateGoalProgress = async (goalId: string, newProgress: number) => {
    try {
      const res = await api.updateLongTermGoal(goalId, { currentProgress: newProgress });
      if (res.success && res.profile) {
        setProfile(res.profile);
      } else if (profile) {
        setProfile({
          ...profile,
          longTermGoals: (profile.longTermGoals || []).map((g) =>
            g.id === goalId ? { ...g, currentProgress: newProgress } : g
          ),
        });
      }
    } catch (err) {
      console.error('Failed to update goal progress:', err);
    }
  };

  const handleSaveDailyMood = async (data: {
    energyLevel: EnergyLevel;
    moodFeeling: MoodFeeling;
    focusLevel: FocusLevel;
    note?: string;
  }) => {
    try {
      const res = await api.saveDailyMood(data);
      if (res.success) {
        setProfile(res.profile);
        setMemories((prev) => [res.memory, ...prev]);
      }
    } catch (err) {
      console.error('Failed to save daily mood:', err);
    }
  };

  const handleOptimizePlanForMood = async () => {
    try {
      const res = await api.optimizePlanForMood();
      if (res.success) {
        setPlan(res.plan);
      }
    } catch (err) {
      console.error('Failed to optimize plan for mood:', err);
    }
  };

  const handleDecompressSchedule = async () => {
    await handleAddTask({
      title: '☕ 20 Dk Kahve & 4-7-8 Nefes Molası',
      description: 'Bilişsel yük kalkanı müdahalesi: zihinsel sıfırlama ve dekompresyon.',
      scheduledDate: '2026-09-24',
      preferredTime: '16:30',
      durationMinutes: 20,
      priority: 'urgent',
      category: 'health',
    });
    setNotifications((prev) => [
      {
        id: `notif-burnout-${Date.now()}`,
        title: 'Bilişsel Yük Kalkanı Devrede',
        body: 'Saat 16:30 iç toplantısı yarın 10:00\'a kaydırıldı. 20 dakikalık kahve ve nefes molası takvime bloklandı.',
        priority: 'high',
        category: 'contextual',
        actionType: 'open_plan',
        status: 'unread',
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleAddNoteToPerson = async (personId: string, note: string) => {
    try {
      const res = await api.addPersonNote(personId, note);
      if (res.success) {
        setPeople((prev) => prev.map((p) => (p.id === personId ? res.person : p)));
        setMemories((prev) => [res.memory, ...prev]);
      }
    } catch (err) {
      console.error('Failed to add note to person:', err);
    }
  };

  const handleAddNewPerson = async (personData: Partial<PersonProfile>) => {
    try {
      const res = await api.createPersonProfile(personData);
      if (res.success) {
        setPeople((prev) => [...prev, res.person]);
        const memRes = await api.getMemories();
        if (memRes.success) setMemories(memRes.memories);
      }
    } catch (err) {
      console.error('Failed to create person:', err);
    }
  };

  const handleToggleTheme = async () => {
    if (!profile) return;
    const newTheme: 'dark' | 'light' = profile.theme === 'light' ? 'dark' : 'light';
    setProfile((prev) => (prev ? { ...prev, theme: newTheme } : null));
    await api.updateProfile({ theme: newTheme });
  };

  // Dynamic Reorganization
  const handleReorganize = async (delayedMinutes: number) => {
    setIsReorganizing(true);
    try {
      const res = await api.reorganizePlan(delayedMinutes);
      if (res.success) {
        setPlan(res.plan);
        const tasksRes = await api.getTasks();
        if (tasksRes.success) setTasks(tasksRes.tasks);
      }
    } catch (err) {
      console.error('Reorganize failed:', err);
    } finally {
      setIsReorganizing(false);
    }
  };

  // Life Handlers
  const handleToggleHabit = async (habitId: string) => {
    const res = await api.toggleHabit(habitId);
    if (res.success) {
      setHabits((prev) => prev.map((h) => (h.id === habitId ? res.habit : h)));
    }
  };

  const handleTogglePayment = async (paymentId: string, isPaid: boolean) => {
    const res = await api.togglePayment(paymentId, isPaid);
    if (res.success) {
      setPayments((prev) => prev.map((p) => (p.id === paymentId ? res.payment : p)));
    }
  };

  const handleAddDocument = async (doc: { title: string; docType: string; expiryDate?: string; notes?: string }) => {
    const res = await api.addDocument(doc);
    if (res.success) {
      setDocuments((prev) => [...prev, res.document]);
    }
  };

  // Memory Handlers
  const handleForgetMemory = async (memId: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== memId));
    await api.forgetMemory(memId);
  };

  const handleClearAllMemories = async () => {
    setMemories([]);
    await api.clearAllMemories();
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    const res = await api.updateProfile(updates);
    if (res.success) setProfile(res.profile);
  };

  // Onboarding completion
  const handleOnboardingComplete = async (data: any) => {
    const res = await api.fastStartOnboarding(data);
    if (res.success) {
      setProfile(res.profile);
      if (res.tasks) setTasks(res.tasks);
      if (res.plan) setPlan(res.plan);
      if (res.memories) setMemories(res.memories);
      if (res.message) setChatMessages([res.message]);

      const [peopleRes] = await Promise.all([
        api.getPersonProfiles(),
      ]);
      if (peopleRes.success) setPeople(peopleRes.people);

      // Add a celebration notification
      setNotifications((prev) => [
        {
          id: `notif-onboard-${Date.now()}`,
          title: '⚡ AYZEK Yaşam İşletim Sistemi Aktif',
          body: `Hoş geldin ${data.name}! Rutinlerin (${data.workStartTime} - ${data.workEndTime}), sağlık hedefin ve sevdiklerine dair bağlamlar sisteme işlendi. Artık doğru zamanda senin yanındayım. ✨`,
          priority: 'high',
          category: 'contextual',
          actionType: 'open_plan',
          status: 'unread',
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setActiveTab('chat');
    }
  };

  // Proactive Simulation
  const handleSimulateScenario = async (scenario: string) => {
    const res = await api.triggerProactiveScenario(scenario);
    if (res.success && res.notification) {
      setNotifications((prev) => [res.notification, ...prev]);
    }
  };

  const handleNotificationAction = async (notif: NotificationAlert, action: string) => {
    if (action === 'reschedule') {
      await handleReorganize(notif.actionPayload?.delayedMinutes || 45);
      setIsProactiveDrawerOpen(false);
      setActiveTab('plan');
    } else if (action === 'confirm_task') {
      setIsProactiveDrawerOpen(false);
      setActiveTab('plan');
    } else if (action === 'open_plan') {
      setIsProactiveDrawerOpen(false);
      setActiveTab('life');
    }
    await api.updateNotification(notif.id, { status: 'acted' });
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, status: 'acted' } : n)),
    );
  };

  const handleDismissNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await api.updateNotification(id, { status: 'dismissed' });
  };

  const handleNotificationBannerAction = (notif: any) => {
    if (notif.category === 'briefing') {
      setActiveTab('home');
      setTimeout(() => {
        const el = document.getElementById('section-audio-briefing');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (notif.category === 'burnout') {
      setActiveTab('home');
      setTimeout(() => {
        const el = document.getElementById('section-burnout-shield');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (notif.category === 'relationship') {
      setIsRelationshipModalOpen(true);
    } else if (notif.category === 'decision') {
      setIsDecisionCopilotOpen(true);
    } else if (notif.category === 'commitment') {
      setActiveTab('home');
      setTimeout(() => {
        const el = document.getElementById('section-commitment-tracker');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      setIsProactiveDrawerOpen(true);
    }
  };

  const unreadNotifs = notifications.filter((n) => n.status === 'unread');

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400 animate-spin" />
          <span className="text-sm">AYZEK Yaşam İşletim Sistemi Başlatılıyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${profile.theme === 'light' ? 'theme-light bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'} flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200 transition-colors duration-200`}>
      {/* Real-time Proactive In-App Banner */}
      <ProactiveNotificationBanner onActionClick={handleNotificationBannerAction} />

      {/* Ambient background glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`absolute -top-40 -left-40 w-96 h-96 ${profile.theme === 'light' ? 'bg-cyan-200/40' : 'bg-cyan-600/15'} rounded-full blur-3xl`} />
        <div className={`absolute top-1/3 -right-40 w-96 h-96 ${profile.theme === 'light' ? 'bg-indigo-200/40' : 'bg-indigo-600/15'} rounded-full blur-3xl`} />
        <div className={`absolute -bottom-40 left-1/4 w-96 h-96 ${profile.theme === 'light' ? 'bg-cyan-100/30' : 'bg-cyan-700/10'} rounded-full blur-3xl`} />
      </div>

      {/* Persistent Top Glass Status Bar */}
      <header className="sticky top-0 z-30 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center text-slate-950 font-black text-xs shadow-[0_0_14px_rgba(6,182,212,0.4)]">
              A
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1">
                AYZEK
                <span className="text-[10px] text-cyan-400 font-mono font-medium">OS</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Fast Start / Yaşam Kurulumu */}
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="h-8 px-3 rounded-full bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 text-cyan-300 border border-cyan-400/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.25)] text-xs font-semibold shrink-0"
              title="Hızlı Başlangıç & Yeni Profil Kurulumu (Fast Start)"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Fast Start</span>
            </button>

            {/* Dark / Light Liquid Glass Theme Switcher */}
            <button
              onClick={handleToggleTheme}
              className="w-8 h-8 rounded-full bg-slate-900 border border-white/15 hover:border-cyan-500/50 text-slate-300 hover:text-white transition-all flex items-center justify-center cursor-pointer shrink-0"
              title={profile.theme === 'light' ? 'Koyu Temaya Geç' : 'Açık Temaya Geç (iOS 27 Liquid Glass)'}
            >
              {profile.theme === 'light' ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Mobil Store & PWA Testi (Desktop/Tablet) */}
            <button
              onClick={() => setIsMobileStoreModalOpen(true)}
              className="hidden sm:flex h-8 px-2.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all items-center gap-1 cursor-pointer shrink-0 text-xs font-medium"
              title="Mobil Kurulum, Bildirim Testi & Store Dağıtımı"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Store</span>
            </button>

            {/* 2FA & Multi-Device Sync Modal Launcher */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="hidden lg:flex h-8 px-2.5 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition-all items-center gap-1 cursor-pointer shrink-0 text-xs font-medium"
              title="2FA Giriş & Çoklu Cihaz Senkronizasyonu"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>2FA</span>
            </button>

            {/* İkilem Çözücü & Karar Matrisi (Desktop / Tablet) */}
            <button
              onClick={() => setIsDecisionCopilotOpen(true)}
              className="hidden md:flex h-8 px-2.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all items-center gap-1 cursor-pointer shrink-0 text-xs font-medium"
              title="İkilem Çözücü & Karar Matrisi"
            >
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span>Karar</span>
            </button>

            {/* Özel Gün & İlişki Asistanı */}
            <button
              onClick={() => setIsRelationshipModalOpen(true)}
              className="hidden md:flex h-8 px-2.5 rounded-full bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all items-center gap-1 cursor-pointer shrink-0 text-xs font-medium"
              title="Özel Gün & İlişki Asistanı"
            >
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>Özel Gün</span>
            </button>

            {/* Proaktif Çekmece */}
            <button
              onClick={() => setIsProactiveDrawerOpen(true)}
              className="w-8 h-8 rounded-full bg-slate-900 border border-white/15 hover:border-cyan-500/50 text-slate-300 hover:text-white transition-all flex items-center justify-center cursor-pointer shrink-0 relative"
              title="Proaktif Zeka & Senaryolar"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-slate-950" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="relative z-10 flex-1 px-3 sm:px-4 pt-3 sm:pt-4 pb-32 max-w-xl mx-auto w-full">
        {activeTab === 'home' && (
          <HomeView
            profile={profile}
            tasks={tasks}
            notifications={notifications}
            onNavigateTab={setActiveTab}
            onQuickPrompt={handleQuickPrompt}
            onOpenSimulator={() => setIsProactiveDrawerOpen(true)}
            onOpenRelationshipAssistant={() => setIsRelationshipModalOpen(true)}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            onOpenDecisionCopilot={() => setIsDecisionCopilotOpen(true)}
            onOpenMobileStore={() => setIsMobileStoreModalOpen(true)}
            onDecompressSchedule={handleDecompressSchedule}
            onAddPlanTask={(title, preferredTime, category) => {
              handleAddTask({
                title,
                preferredTime,
                category: category as any,
                priority: 'high',
                scheduledDate: '2026-09-24',
              });
            }}
            onAddWalkingTask={handleAddWalkingTask}
            isWalkingTaskAdded={isWalkingTaskAdded}
            onUpdateCycle={handleUpdateCycle}
            onAddCycleTask={handleAddCycleTask}
            isCycleTaskAdded={isCycleTaskAdded}
            onAcceptMicroHabit={handleAcceptMicroHabit}
            isMentorTaskAdded={isMentorTaskAdded}
            onUpdateGoalProgress={handleUpdateGoalProgress}
            people={people}
            onSaveMood={handleSaveDailyMood}
            onOptimizePlanForMood={handleOptimizePlanForMood}
          />
        )}

        {activeTab === 'plan' && (
          <PlanView
            plan={plan}
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onAddTask={handleAddTask}
            onReorganize={handleReorganize}
            isReorganizing={isReorganizing}
          />
        )}

        {activeTab === 'integrations' && (
          <IntegrationsHubView
            onAddPlanTask={(title, preferredTime, category) => {
              handleAddTask({
                title,
                preferredTime,
                category: category as any,
                priority: 'high',
                scheduledDate: '2026-09-24',
              });
            }}
            onNavigateToChat={handleQuickPrompt}
          />
        )}

        {activeTab === 'social' && (
          <SocialRelationshipsView
            people={people}
            onAddNoteToPerson={handleAddNoteToPerson}
            onAddNewPerson={handleAddNewPerson}
            onOpenChatWithPrompt={handleQuickPrompt}
            onAddPlanTask={(title, preferredTime, category) => {
              handleAddTask({
                title,
                preferredTime,
                category: category as any,
                priority: 'high',
                scheduledDate: '2026-09-24',
              });
            }}
          />
        )}

        {activeTab === 'life' && (
          <LifeView
            goals={goals}
            habits={habits}
            payments={payments}
            subscriptions={subscriptions}
            vehicles={vehicles}
            documents={documents}
            specialDates={specialDates}
            onToggleHabit={handleToggleHabit}
            onTogglePayment={handleTogglePayment}
            onAddDocument={handleAddDocument}
            onOpenRelationshipAssistant={() => setIsRelationshipModalOpen(true)}
            onOpenChatWithPrompt={handleQuickPrompt}
          />
        )}

        {activeTab === 'chat' && (
          <ChatView
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={isChatLoading}
            profile={profile}
            onAddPlanTask={(title, preferredTime, category) => {
              handleAddTask({
                title,
                preferredTime,
                category: category as any,
                priority: 'high',
                scheduledDate: '2026-09-24',
              });
            }}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            profile={profile}
            memories={memories}
            onUpdateProfile={handleUpdateProfile}
            onForgetMemory={handleForgetMemory}
            onClearAllMemories={handleClearAllMemories}
            onOpenArchitecture={() => setIsArchModalOpen(true)}
          />
        )}
      </main>

      {/* Floating Glass Navigation Bar */}
      <GlassNavigationBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadNotificationsCount={unreadNotifs.length}
        onOpenNotifications={() => setIsProactiveDrawerOpen(true)}
        onOpenMobileStore={() => setIsMobileStoreModalOpen(true)}
        onOpenDecisionCopilot={() => setIsDecisionCopilotOpen(true)}
        onOpenRelationshipAssistant={() => setIsRelationshipModalOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenArchitecture={() => setIsArchModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Interactive Onboarding & Life Synchronization Modal */}
      <InteractiveOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={handleOnboardingComplete}
        initialName={profile.name}
        initialGender={profile.gender}
      />

      {/* Special Date, Emotional Messages & Partner Surprise Copilot Modal */}
      <RelationshipAssistantModal
        isOpen={isRelationshipModalOpen}
        onClose={() => setIsRelationshipModalOpen(false)}
        onAddPlanTask={(title, preferredTime, category) => {
          handleAddTask({
            title,
            preferredTime,
            category: category as any,
            priority: 'high',
            scheduledDate: '2026-09-24',
          });
        }}
        onNavigateToChat={handleQuickPrompt}
      />

      {/* Dilemma & Decision Copilot Matrix Modal */}
      <DecisionCopilotModal
        isOpen={isDecisionCopilotOpen}
        onClose={() => setIsDecisionCopilotOpen(false)}
        onNavigateToChat={handleQuickPrompt}
      />

      {/* Mobile Store Publishing & Proactive Notification Test Modal */}
      <MobileStorePublishModal
        isOpen={isMobileStoreModalOpen}
        onClose={() => setIsMobileStoreModalOpen(false)}
        onTriggerScenario={handleSimulateScenario}
      />

      {/* Proactive Notification Hub & Scenario Simulator Drawer */}
      <GlassSheet
        isOpen={isProactiveDrawerOpen}
        onClose={() => setIsProactiveDrawerOpen(false)}
        title="Proaktif Zeka & Bildirim Merkezi"
        subtitle="Rutinler, bağlamsal zamanlama ve olay simülasyonları"
        maxWidth="xl"
      >
        <ProactiveDrawer
          notifications={notifications}
          onAction={handleNotificationAction}
          onSimulateScenario={handleSimulateScenario}
          onDismiss={handleDismissNotification}
          onClose={() => setIsProactiveDrawerOpen(false)}
        />
      </GlassSheet>

      {/* In-app 14-Point Architecture Specification Viewer */}
      <ArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />

      {/* 2FA & Multi-Device Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
        }}
        onLogout={async () => {
          await api.logout();
          setCurrentUser(null);
          setIsAuthModalOpen(false);
        }}
      />
    </div>
  );
}
