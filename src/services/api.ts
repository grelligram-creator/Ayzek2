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
  VenueRecommendation,
  AuthUser,
  TwoFactorChallenge,
  IntegrationAccount,
  WorkLifeBalance,
  MessagingAnalysisResult,
} from '../types/ayzek';

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('ayzek_auth_token');
  const userId = localStorage.getItem('ayzek_user_id');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (userId) headers['x-user-id'] = userId;
  return headers;
}

export const api = {
  async getProfile(): Promise<{ success: boolean; profile: UserProfile }> {
    const res = await fetch('/api/profile', { headers: getAuthHeaders() });
    return res.json();
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<{ success: boolean; profile: UserProfile }> {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profile),
    });
    return res.json();
  },

  async getMemories(type?: string): Promise<{ success: boolean; memories: Memory[] }> {
    const query = type ? `?type=${type}` : '';
    const res = await fetch(`/api/memories${query}`, { headers: getAuthHeaders() });
    return res.json();
  },

  async saveMemory(mem: { type: string; content: string; importance?: number }): Promise<{ success: boolean; memory: Memory }> {
    const res = await fetch('/api/memories', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(mem),
    });
    return res.json();
  },

  async forgetMemory(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/memories/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    return res.json();
  },

  async clearAllMemories(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/memories/clear', { method: 'POST', headers: getAuthHeaders() });
    return res.json();
  },

  async getTasks(): Promise<{ success: boolean; tasks: TaskItem[] }> {
    const res = await fetch('/api/tasks', { headers: getAuthHeaders() });
    return res.json();
  },

  async createTask(task: Partial<TaskItem>): Promise<{ success: boolean; task: TaskItem }> {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(task),
    });
    return res.json();
  },

  async updateTask(id: string, updates: Partial<TaskItem>): Promise<{ success: boolean; task: TaskItem }> {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async deleteTask(id: string): Promise<{ success: boolean; task: TaskItem }> {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async getTodayPlan(): Promise<{ success: boolean; plan: DailyPlanItem[]; date: string }> {
    const res = await fetch('/api/plan/today');
    return res.json();
  },

  async reorganizePlan(delayedMinutes = 45, reason = 'Toplantı uzadı'): Promise<{ success: boolean; message: string; plan: DailyPlanItem[] }> {
    const res = await fetch('/api/plan/reorganize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delayedMinutes, reason }),
    });
    return res.json();
  },

  async getLifeData(): Promise<{
    success: boolean;
    goals: Goal[];
    habits: Habit[];
    payments: Payment[];
    subscriptions: Subscription[];
    vehicles: Vehicle[];
    documents: DocumentItem[];
    specialDates: SpecialDate[];
  }> {
    const res = await fetch('/api/life/all');
    return res.json();
  },

  async toggleHabit(id: string): Promise<{ success: boolean; habit: Habit }> {
    const res = await fetch(`/api/habits/${id}/log`, { method: 'POST' });
    return res.json();
  },

  async togglePayment(id: string, isPaid: boolean): Promise<{ success: boolean; payment: Payment }> {
    const res = await fetch(`/api/finance/payments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPaid }),
    });
    return res.json();
  },

  async addDocument(doc: { title: string; docType: string; expiryDate?: string; notes?: string }): Promise<{ success: boolean; document: DocumentItem }> {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });
    return res.json();
  },

  async getNotifications(): Promise<{ success: boolean; notifications: NotificationAlert[] }> {
    const res = await fetch('/api/notifications');
    return res.json();
  },

  async draftSpecialMessage(personName: string, eventType = 'birthday'): Promise<{
    success: boolean;
    personName: string;
    eventType: string;
    memoryContextUsed: string;
    drafts: Array<{ id: string; toneName: string; message: string; usedMemories: string[] }>;
  }> {
    const res = await fetch('/api/relationship/draft-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personName, eventType }),
    });
    return res.json();
  },

  async planPartnerSurprise(personName: string): Promise<{
    success: boolean;
    plan: {
      partnerName: string;
      detectedConcern: string;
      solutionPhilosophy: string;
      steps: Array<{ step: number; title: string; description: string }>;
    };
  }> {
    const res = await fetch('/api/relationship/plan-surprise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personName }),
    });
    return res.json();
  },

  async getWellnessPlan(): Promise<{
    success: boolean;
    wellnessPlan: {
      philosophy: string;
      dailyMicroHabits: Array<{ title: string; context?: string; category: string }>;
      encouragementMessage: string;
    };
  }> {
    const res = await fetch('/api/wellness/personalize-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    return res.json();
  },

  async syncOnboarding(data: {
    name: string;
    gender?: 'female' | 'male' | 'other' | 'prefer_not_to_say';
    wakeTime: string;
    sleepTime: string;
    workStartTime: string;
    workEndTime: string;
    wellnessGoal: string;
    partnerName: string;
    partnerWishes: string;
    notificationStyle: string;
    isCycleEnabled?: boolean;
    lastPeriodDate?: string;
    cycleLengthDays?: number;
  }): Promise<{ success: boolean; profile: UserProfile; message: string }> {
    const res = await fetch('/api/onboarding/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateCycleTracking(data: { isEnabled?: boolean; lastPeriodDate?: string; cycleLengthDays?: number; periodLengthDays?: number }): Promise<{
    success: boolean;
    cycleTracking: any;
    message: string;
  }> {
    const res = await fetch('/api/cycle/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getMentorshipCheckIn(goalId?: string): Promise<{
    success: boolean;
    goal: any;
    mentorshipMessage: string;
    suggestedAction: { title: string; preferredTime: string; durationMinutes: number; category: string };
  }> {
    const res = await fetch('/api/mentorship/check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goalId }),
    });
    return res.json();
  },

  async updateLongTermGoal(goalId: string, updates: Partial<any>): Promise<{
    success: boolean;
    goal: any;
    profile: UserProfile;
    message: string;
  }> {
    const res = await fetch(`/api/goals/long-term/${goalId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async createLongTermGoal(goal: Partial<any>): Promise<{
    success: boolean;
    goal: any;
    profile: UserProfile;
    message: string;
  }> {
    const res = await fetch('/api/goals/long-term', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal),
    });
    return res.json();
  },

  async saveDailyMood(data: {
    energyLevel: string;
    moodFeeling: string;
    focusLevel: string;
    note?: string;
  }): Promise<{
    success: boolean;
    dailyMood: any;
    memory: Memory;
    profile: UserProfile;
    message: string;
  }> {
    const res = await fetch('/api/mood/check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async optimizePlanForMood(): Promise<{
    success: boolean;
    plan: DailyPlanItem[];
    message: string;
  }> {
    const res = await fetch('/api/mood/optimize-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    return res.json();
  },

  async acceptMentorPlan(goalId: string, title: string, preferredTime = '17:30'): Promise<{
    success: boolean;
    task: TaskItem;
    message: string;
  }> {
    const res = await fetch('/api/mentorship/accept-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goalId, title, preferredTime }),
    });
    return res.json();
  },

  async updateNotification(id: string, updates: Partial<NotificationAlert>): Promise<{ success: boolean; notification: NotificationAlert }> {
    const res = await fetch(`/api/notifications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async triggerProactiveScenario(scenario: string): Promise<{ success: boolean; notification: NotificationAlert; message: string }> {
    const res = await fetch('/api/proactive/trigger-scenario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario }),
    });
    return res.json();
  },

  async getPersonProfiles(): Promise<{ success: boolean; people: PersonProfile[] }> {
    const res = await fetch('/api/social/people');
    return res.json();
  },

  async createPersonProfile(person: Partial<PersonProfile>): Promise<{ success: boolean; person: PersonProfile; message: string }> {
    const res = await fetch('/api/social/people', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(person),
    });
    return res.json();
  },

  async updatePersonProfile(id: string, updates: Partial<PersonProfile>): Promise<{ success: boolean; person: PersonProfile }> {
    const res = await fetch(`/api/social/people/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async addPersonNote(id: string, note: string): Promise<{ success: boolean; person: PersonProfile; memory: Memory; message: string }> {
    const res = await fetch(`/api/social/people/${id}/note`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    });
    return res.json();
  },

  async getRecommendedVenues(): Promise<{ success: boolean; venues: VenueRecommendation[] }> {
    const res = await fetch('/api/social/venues');
    return res.json();
  },

  async sendMessage(message: string, clientHistory: ChatMessage[]): Promise<{ success: boolean; message: ChatMessage }> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, clientHistory }),
    });
    return res.json();
  },

  // -------------------------------------------------------------
  // Authentication & 2FA Multi-Device Sync
  // -------------------------------------------------------------
  async getCurrentUser(): Promise<{ success: boolean; user: AuthUser }> {
    const token = localStorage.getItem('ayzek_auth_token') || 'ayzek-token-default';
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  async socialLogin(
    provider: 'google' | 'apple',
    email?: string,
    name?: string,
    avatarUrl?: string
  ): Promise<{ success: boolean; user?: AuthUser; token?: string; isNewUser?: boolean; message?: string }> {
    const res = await fetch('/api/auth/social-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, email, name, avatarUrl }),
    });
    const data = await res.json();
    if (data.success && data.token && data.user) {
      localStorage.setItem('ayzek_auth_token', data.token);
      localStorage.setItem('ayzek_user_id', data.user.id);
    }
    return data;
  },

  async login(email: string, password: string, deviceName?: string): Promise<{
    success: boolean;
    token?: string;
    user?: AuthUser;
    requires2FA?: boolean;
    challenge?: TwoFactorChallenge;
    message?: string;
  }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, deviceName }),
    });
    const data = await res.json();
    if (data.success && data.token && data.user) {
      localStorage.setItem('ayzek_auth_token', data.token);
      localStorage.setItem('ayzek_user_id', data.user.id);
    }
    return data;
  },

  async verify2FA(
    tempToken: string,
    code: string,
    trustDevice = true,
    deviceName?: string
  ): Promise<{
    success: boolean;
    token?: string;
    user?: AuthUser;
    message?: string;
  }> {
    const res = await fetch('/api/auth/verify-2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tempToken, code, trustDevice, deviceName }),
    });
    const data = await res.json();
    if (data.success && data.token && data.user) {
      localStorage.setItem('ayzek_auth_token', data.token);
      localStorage.setItem('ayzek_user_id', data.user.id);
    }
    return data;
  },

  async register(
    email: string,
    password: string,
    name: string,
    enable2FA = true
  ): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, enable2FA }),
    });
    return res.json();
  },

  async toggle2FA(isEnabled: boolean, method?: string): Promise<{ success: boolean; user: AuthUser; message: string }> {
    const res = await fetch('/api/auth/toggle-2fa', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isEnabled, method }),
    });
    return res.json();
  },

  async disconnectDevice(deviceId: string): Promise<{ success: boolean; devices: any[]; message: string }> {
    const res = await fetch('/api/auth/devices/disconnect', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ deviceId }),
    });
    return res.json();
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    localStorage.removeItem('ayzek_auth_token');
    localStorage.removeItem('ayzek_user_id');
    const res = await fetch('/api/auth/logout', { method: 'POST', headers: getAuthHeaders() });
    return res.json();
  },

  // -------------------------------------------------------------
  // Integrations & Work-Life Balance
  // -------------------------------------------------------------
  async getIntegrations(): Promise<{ success: boolean; integrations: IntegrationAccount[] }> {
    const res = await fetch('/api/integrations');
    return res.json();
  },

  async toggleIntegration(service: string): Promise<{ success: boolean; integration: IntegrationAccount; message: string }> {
    const res = await fetch(`/api/integrations/${service}/toggle`, { method: 'POST' });
    return res.json();
  },

  async syncAllIntegrations(): Promise<{ success: boolean; integrations: IntegrationAccount[]; message: string }> {
    const res = await fetch('/api/integrations/sync-all', { method: 'POST' });
    return res.json();
  },

  async getWorkLifeBalance(): Promise<{ success: boolean; balance: WorkLifeBalance }> {
    const res = await fetch('/api/integrations/work-life-balance');
    return res.json();
  },

  async analyzeMessagingChat(
    platform: 'whatsapp' | 'telegram',
    contactName: string,
    chatText: string
  ): Promise<{
    success: boolean;
    analysis: MessagingAnalysisResult;
    message: string;
  }> {
    const res = await fetch('/api/integrations/messaging/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, contactName, chatText }),
    });
    return res.json();
  },

  async getSampleChats(): Promise<{
    success: boolean;
    samples: Array<{
      id: string;
      platform: 'whatsapp' | 'telegram';
      contactName: string;
      avatarEmoji: string;
      preview: string;
      chatText: string;
      extractedTaskTitle: string;
    }>;
  }> {
    const res = await fetch('/api/integrations/messaging/sample-chats');
    return res.json();
  },

  async generateAudioBriefing(
    mode: 'morning' | 'evening',
    regenerateWithAI = false
  ): Promise<{
    success: boolean;
    mode: 'morning' | 'evening';
    userName: string;
    script: string;
    highlights: string[];
    durationSeconds: number;
    generatedAt: string;
  }> {
    const res = await fetch('/api/briefing/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, regenerateWithAI }),
    });
    return res.json();
  },

  async fastStartOnboarding(data: any): Promise<{
    success: boolean;
    profile: UserProfile;
    tasks: TaskItem[];
    plan: DailyPlanItem[];
    memories: Memory[];
    message: ChatMessage;
  }> {
    const res = await fetch('/api/onboarding/fast-start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
