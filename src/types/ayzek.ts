/**
 * AYZEK — Personal Life AI Operating System
 * Core TypeScript Definitions
 */

export type EnergyLevel = 'low' | 'moderate' | 'high';
export type MoodFeeling = 'peaceful' | 'happy' | 'tired' | 'stressed' | 'inspired';
export type FocusLevel = 'scattered' | 'balanced' | 'deep';
export type MemoryType = 'fact' | 'preference' | 'relationship' | 'commitment' | 'decision';

export interface DailyMoodCheckIn {
  id: string;
  date: string;
  energyLevel: EnergyLevel;
  moodFeeling: MoodFeeling;
  focusLevel: FocusLevel;
  note?: string;
  coachRecommendation: string;
  createdAt: string;
}

export interface MicroHabitItem {
  id: string;
  title: string;
  shortDesc?: string;
  category: string;
  iconName: string;
  accentColor: string;
  completed: boolean;
  targetCount?: number;
  currentCount?: number;
  unit?: string;
  coachFeedback: string;
  streak?: number;
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  impactStatement?: string;
}

export interface CycleTracking {
  isEnabled: boolean;
  cycleLengthDays: number;
  periodLengthDays: number;
  lastPeriodDate: string;
  currentPhase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
  dayOfCycle: number;
  nextPeriodExpectedDate: string;
  phaseAdvice: {
    energyLevel: string;
    workoutSuggestion: string;
    nutritionSuggestion: string;
    mentalFocus: string;
  };
}

export interface LongTermGoal {
  id: string;
  title: string;
  category: 'language' | 'career' | 'wellness' | 'finance' | 'personal';
  targetHorizon: string;
  whyItMatters: string;
  currentProgress: number;
  mentorWeeklyCheckIn: string;
  suggestedMicroHabit: string;
  lastCheckedInDate?: string;
}

export type LongTermGrowthGoal = LongTermGoal;

export interface UserProfile {
  id: string;
  name: string;
  gender: 'female' | 'male' | 'other' | 'prefer_not_to_say';
  theme: 'dark' | 'light';
  wakeTime: string;
  sleepTime: string;
  workStartTime: string;
  workEndTime: string;
  communicationStyle: 'warm_concise' | 'direct' | 'playful_empathetic' | 'detailed' | 'wise_mentor';
  notificationFrequency: 'minimal' | 'balanced' | 'proactive';
  primaryGoal: string;
  locationContext: {
    home: string;
    work: string;
    currentEstimatedLocation?: string;
  };
  privacySettings: {
    allowDerivedInsights: boolean;
    autoForgetTemporaryAfterDays: number;
    requireConfirmationForDeletions: boolean;
  };
  personalDetails?: {
    homeDistrict: string;
    workplace: string;
    clothingStyle: string;
    favoriteWeatherOutfit: string;
    familyOverview: string;
    closestPeople: string[];
  };
  dailyMood?: {
    id: string;
    date: string;
    energyLevel: EnergyLevel;
    moodFeeling: MoodFeeling;
    focusLevel: FocusLevel;
    note?: string;
    coachRecommendation: string;
    createdAt: string;
  };
  cycleTracking: CycleTracking;
  longTermGoals: LongTermGoal[];
}

export interface Memory {
  id: string;
  type: string;
  content: string;
  importance: number;
  confidence: number;
  source: string;
  isUserConfirmed: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string | null;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  scheduledDate: string;
  preferredTime?: string;
  durationMinutes: number;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  category: 'work' | 'personal' | 'shopping' | 'health' | 'finance' | 'errand' | 'learning' | 'cycle';
  location?: string;
  contextTrigger?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rescheduled' | 'cancelled';
  createdBy: 'user' | 'ai_assistant';
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  title: string;
  category: 'health' | 'finance' | 'career' | 'learning' | 'personal';
  targetDate: string;
  progress: number;
  status: 'active' | 'completed' | 'paused';
  milestones: { title: string; completed: boolean }[];
}

export interface Habit {
  id: string;
  title: string;
  frequency: 'daily' | 'weekdays' | 'weekends' | '3_times_week';
  preferredTime?: string;
  streak: number;
  bestStreak: number;
  completedToday: boolean;
  category: 'wellness' | 'mind' | 'productivity' | 'fitness';
}

export interface Payment {
  id: string;
  title: string;
  amount: number;
  currency: string;
  dueDate: string;
  category: 'rent' | 'utility' | 'card' | 'tax' | 'phone';
  isPaid: boolean;
  reminderDaysBefore: number;
}

export interface Subscription {
  id: string;
  serviceName: string;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
  category: 'entertainment' | 'cloud' | 'fitness' | 'work' | 'utility';
}

export interface Vehicle {
  id: string;
  plate: string;
  makeModel: string;
  modelYear: number;
  inspectionDue: string;
  insuranceDue: string;
  maintenanceKm: number;
  currentKm: number;
  cascoDue?: string;
  notes?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  docType: 'warranty' | 'contract' | 'id' | 'receipt' | 'insurance';
  expiryDate?: string;
  notes?: string;
  ocrExtractedText?: string;
}

export interface SpecialDate {
  id: string;
  personName: string;
  relationship: string;
  eventType: 'birthday' | 'anniversary' | 'celebration' | 'memorial';
  dateMonthDay: string;
  giftIdea?: string;
}

export interface NotificationAlert {
  id: string;
  title: string;
  body: string;
  priority: 'high' | 'medium' | 'low';
  category: 'reminder' | 'contextual' | 'schedule_change' | 'finance' | 'special_date' | 'vehicle' | 'wellness' | 'briefing' | 'burnout' | 'relationship' | 'decision' | 'commitment';
  actionType?: 'reschedule' | 'confirm_task' | 'open_plan' | 'view_memory' | 'snooze';
  actionPayload?: Record<string, any>;
  status: 'unread' | 'read' | 'dismissed' | 'acted';
  createdAt: string;
  triggerContext?: string;
}

export interface VenueRecommendation {
  id: string;
  name: string;
  district: string;
  category: 'coffee_work' | 'romantic_dinner' | 'nature_walk' | 'cultural' | 'quiet_reading';
  vibe: string;
  addressSnippet: string;
  googleMapsUrl?: string;
  whySuggested: string;
}

export interface PersonProfile {
  id: string;
  name: string;
  relation: string;
  avatarEmoji?: string;
  avatarColor?: string;
  lastContactDate: string;
  proactiveStatus: 'healthy' | 'needs_attention' | 'urgent_checkin';
  proactiveNudge?: string;
  psychologicalAnalysis: {
    archetype: string;
    attachmentStyle: 'Güvenli (Secure)' | 'Kaygılı (Anxious)' | 'Kaçıngan (Avoidant)' | 'Dengeli';
    communicationStyle: string;
    stressTriggers: string[];
    loveLanguage: string;
    psychologistAdvice: string;
  };
  keyMemories: string[];
  recommendedVenues?: VenueRecommendation[];
  conversationStarters: string[];
}

export interface DailyPlanItem {
  id: string;
  time: string;
  title: string;
  subtitle: string;
  durationMinutes: number;
  type: string;
  isFlexible: boolean;
  status: 'completed' | 'upcoming';
  taskId?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ayzek' | 'system';
  text: string;
  timestamp: string;
  toolInvocations?: Array<{
    toolName: string;
    args?: any;
    result?: {
      success: boolean;
      message?: string;
      data?: any;
    };
    status: 'success' | 'failed';
  }>;
  suggestions?: string[];
  extractedMemories?: string[];
  recommendedVenues?: VenueRecommendation[];
  groundingSources?: Array<{
    title: string;
    url: string;
    snippet?: string;
  }>;
  searchQueries?: string[];
}

export interface IntegrationAccount {
  id: string;
  service: 'teams' | 'gmail' | 'meet' | 'zoom' | 'google_calendar' | 'outlook_calendar' | 'whatsapp' | 'telegram';
  name: string;
  iconName: string;
  category: 'work' | 'personal' | 'messaging' | 'calendar';
  emailOrHandle: string;
  isConnected: boolean;
  permissionsGranted: string[];
  lastSyncAt: string;
  status: 'active' | 'syncing' | 'paused' | 'disconnected';
  metrics: {
    itemsCount: number;
    tasksExtracted: number;
    activeMeetingsCount?: number;
    unreadHighPriority?: number;
  };
  recentSyncPreview: string[];
}

export interface WorkLifeBalance {
  currentStatus: 'healthy' | 'warning' | 'overloaded';
  overallScore: number;
  weeklyWorkHours: number;
  targetMaxWorkHours: number;
  workHoursToday?: number;
  personalHoursToday?: number;
  overtimeMinutesThisWeek: number;
  personalCareRatio: number;
  upcomingMeetingsCountToday: number;
  coachInsight: string;
  aiRecommendation?: string;
  bufferProtectedDays: number;
  breakdown: {
    workPercentage: number;
    lifePercentage: number;
    workHoursToday?: number;
    personalHoursToday?: number;
  };
}

export interface MessagingAnalysisResult {
  contactName: string;
  contactOrGroupName?: string;
  avatarEmoji?: string;
  platform: 'whatsapp' | 'telegram';
  emotionalTone: 'warm' | 'stressed' | 'neutral' | 'urgent' | 'stressed_fatigued' | 'loving_supportive' | 'urgent_work';
  extractedTasks: Array<{
    title: string;
    preferredTime?: string;
    priority?: 'urgent' | 'high' | 'medium' | 'low';
    category?: 'personal' | 'errand' | 'work';
  }>;
  psychologistLifeCoachAdvice?: string;
  coachingInsight?: string;
  relationshipImpact?: string;
  recommendedReplyDraft?: string;
  suggestedReply?: string;
}

export interface AuthDevice {
  deviceId: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'browser';
  locationSnippet: string;
  ipAddressSnippet: string;
  lastActiveAt: string;
  isCurrentDevice: boolean;
  isTrusted2FA: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider?: 'email' | 'google' | 'apple';
  onboardingCompleted?: boolean;
  is2FAEnabled: boolean;
  twoFactorMethod: 'authenticator_totp' | 'sms' | 'email';
  backupCodesRemaining: number;
  devices: AuthDevice[];
  createdAt: string;
  lastLoginAt: string;
}

export interface TwoFactorChallenge {
  tempToken: string;
  method: 'authenticator_totp' | 'sms' | 'email';
  destinationMasked: string;
  expiresInSeconds: number;
}
