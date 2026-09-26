import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, type FunctionDeclaration } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// -------------------------------------------------------------
// In-Memory Database Store for AYZEK (PostgreSQL / pgvector simulation)
// -------------------------------------------------------------

interface InternalState {
  profile: {
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
      energyLevel: 'low' | 'moderate' | 'high';
      moodFeeling: 'peaceful' | 'happy' | 'tired' | 'stressed' | 'inspired';
      focusLevel: 'scattered' | 'balanced' | 'deep';
      note?: string;
      coachRecommendation: string;
      createdAt: string;
    };
    cycleTracking: {
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
    };
    longTermGoals: Array<{
      id: string;
      title: string;
      category: 'language' | 'career' | 'wellness' | 'finance' | 'personal';
      targetHorizon: string;
      whyItMatters: string;
      currentProgress: number;
      mentorWeeklyCheckIn: string;
      suggestedMicroHabit: string;
      lastCheckedInDate?: string;
    }>;
  };
  memories: Array<{
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
  }>;
  tasks: Array<{
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
  }>;
  goals: Array<{
    id: string;
    title: string;
    category: 'health' | 'finance' | 'career' | 'learning' | 'personal';
    targetDate: string;
    progress: number;
    status: 'active' | 'completed' | 'paused';
    milestones: { title: string; completed: boolean }[];
  }>;
  habits: Array<{
    id: string;
    title: string;
    frequency: 'daily' | 'weekdays' | 'weekends' | '3_times_week';
    preferredTime?: string;
    streak: number;
    bestStreak: number;
    completedToday: boolean;
    category: 'wellness' | 'mind' | 'productivity' | 'fitness';
  }>;
  payments: Array<{
    id: string;
    title: string;
    amount: number;
    currency: string;
    dueDate: string;
    category: 'rent' | 'utility' | 'card' | 'tax' | 'phone';
    isPaid: boolean;
    reminderDaysBefore: number;
  }>;
  subscriptions: Array<{
    id: string;
    serviceName: string;
    amount: number;
    currency: string;
    billingCycle: 'monthly' | 'yearly';
    nextBillingDate: string;
    category: 'entertainment' | 'cloud' | 'fitness' | 'work' | 'utility';
  }>;
  vehicles: Array<{
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
  }>;
  documents: Array<{
    id: string;
    title: string;
    docType: 'warranty' | 'contract' | 'id' | 'receipt' | 'insurance';
    expiryDate?: string;
    notes?: string;
    ocrExtractedText?: string;
  }>;
  specialDates: Array<{
    id: string;
    personName: string;
    relationship: string;
    eventType: 'birthday' | 'anniversary' | 'celebration' | 'memorial';
    dateMonthDay: string;
    giftIdea?: string;
  }>;
  notifications: Array<{
    id: string;
    title: string;
    body: string;
    priority: 'high' | 'medium' | 'low';
    category: 'reminder' | 'contextual' | 'schedule_change' | 'finance' | 'special_date' | 'vehicle' | 'wellness';
    actionType?: 'reschedule' | 'confirm_task' | 'open_plan' | 'view_memory' | 'snooze';
    actionPayload?: Record<string, any>;
    status: 'unread' | 'read' | 'dismissed' | 'acted';
    createdAt: string;
    triggerContext?: string;
  }>;
  personProfiles: Array<{
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
    recommendedVenues?: Array<{
      id: string;
      name: string;
      district: string;
      category: 'coffee_work' | 'romantic_dinner' | 'nature_walk' | 'cultural' | 'quiet_reading';
      vibe: string;
      addressSnippet: string;
      googleMapsUrl?: string;
      whySuggested: string;
    }>;
    conversationStarters: string[];
  }>;
  conversationHistory: Array<{
    id: string;
    sender: 'user' | 'ayzek' | 'system';
    text: string;
    timestamp: string;
    toolInvocations?: any[];
    suggestions?: string[];
    extractedMemories?: string[];
  }>;
}

const state: InternalState = {
  profile: {
    id: 'usr-ayzek-1',
    name: 'Görkem',
    gender: 'female',
    theme: 'dark',
    wakeTime: '07:30',
    sleepTime: '23:30',
    workStartTime: '09:00',
    workEndTime: '18:00',
    communicationStyle: 'wise_mentor',
    notificationFrequency: 'proactive',
    primaryGoal: 'Sağlıklı yaşam, akıcı İngilizce & Kariyer dengesi',
    locationContext: {
      home: 'Kadıköy, Moda',
      work: 'Levent, Maslak hattı',
      currentEstimatedLocation: 'Ofis / Çalışma Alanı',
    },
    personalDetails: {
      homeDistrict: 'Kadıköy / Moda (Caferağa sahil hattı)',
      workplace: 'Levent - Maslak Teknoloji Hattı (Grispi)',
      clothingStyle: 'Smart-casual: Nefes alan açık renk keten gömlekler, pamuklu polo tişörtler, rahat beyaz sneaker ve minimalist saat',
      favoriteWeatherOutfit: '20-24 derecede keten gömlek, hafif mevsimlik ceket ve beyaz sneaker',
      familyOverview: 'Annem (Fatma Hanım - Doğum günü 28 Eylül), Kardeşim (Can), Zeynep (Eş/Hayat Partneri - Mimar)',
      closestPeople: ['Zeynep', 'Annem', 'Murat'],
    },
    privacySettings: {
      allowDerivedInsights: true,
      autoForgetTemporaryAfterDays: 7,
      requireConfirmationForDeletions: true,
    },
    cycleTracking: {
      isEnabled: true,
      cycleLengthDays: 28,
      periodLengthDays: 5,
      lastPeriodDate: '2026-09-17',
      currentPhase: 'follicular',
      dayOfCycle: 8,
      nextPeriodExpectedDate: '2026-10-15',
      phaseAdvice: {
        energyLevel: 'Yüksek & Dinamik (Östrojen yükselişi)',
        workoutSuggestion: 'Kuvvet antrenmanları, yeni projelere başlama ve tempolu kardiyo için harika zaman.',
        nutritionSuggestion: 'Kompleks karbonhidratlar, koyu yeşil yapraklılar ve hafif proteinler.',
        mentalFocus: 'Yaratıcılık, dil öğrenimi ve stratejik kararlar için zihnin en berrak olduğu evre.',
      },
    },
    longTermGoals: [
      {
        id: 'ltg-1',
        title: 'İngilizceyi Akıcı Konuşmak (C1 Profesyonel İletişim)',
        category: 'language',
        targetHorizon: '6 Ay',
        whyItMatters: 'Global projelerde rahat sunum yapmak ve yurt dışı ağını genişletmek.',
        currentProgress: 45,
        mentorWeeklyCheckIn: 'İngilizceni geliştirmek için bu hafta 15 dakikalık 3 konuşma/dinleme pratiği planlayalım mı?',
        suggestedMicroHabit: 'Haftada 3 gün işe giderken 15 dk İngilizce podcast dinleme.',
        lastCheckedInDate: '2026-09-24',
      },
      {
        id: 'ltg-2',
        title: 'Finansal Özgürlük & Pasif Yatırım Portföyü',
        category: 'finance',
        targetHorizon: 'Yıl Sonu',
        whyItMatters: 'Gelecek kaygısını sıfırlayıp zihinsel özgürlüğe kavuşmak.',
        currentProgress: 60,
        mentorWeeklyCheckIn: 'Bu ayki tasarruf hedefini yakaladın, portföy dağılımını gözden geçirelim mi?',
        suggestedMicroHabit: 'Her maaş gününün ilk 24 saatinde otomatik yatırım transferi.',
        lastCheckedInDate: '2026-09-24',
      },
    ],
  },
  personProfiles: [
    {
      id: 'pp-zeynep',
      name: 'Zeynep',
      relation: 'Eş / Hayat Partneri',
      avatarEmoji: '🌸',
      avatarColor: 'from-rose-500 to-pink-600',
      lastContactDate: '2026-09-24 (Dün)',
      proactiveStatus: 'needs_attention',
      proactiveNudge: 'Son 4 gündür yoğun mesailerden ötürü baş başa telefon detokslu kaliteli zaman geçirilemedi. Cuma akşamı Moda sahilinde sakin bir yürüyüş ve akşam yemeği öneriliyor.',
      psychologicalAnalysis: {
        archetype: 'Estetik Duyarlılığı Yüksek & Duygusal Güvence Arayan',
        attachmentStyle: 'Kaygılı (Anxious)',
        communicationStyle: 'İş temposunda ötelendiğini düşündüğünde içine kapanabilir; hızlı rasyonel çözümlerden ziyade şefkatle dinlenilmek ve göz teması ister.',
        stressTriggers: [
          'Mesai bitiminde hala telefonla çalışılması',
          'Özel anların aceleye getirilmesi',
          'Yorgunluğunun ve emeğinin fark edilmemesi',
        ],
        loveLanguage: 'Kaliteli Zaman (Quality Time) & Nostaljik Hediyeler',
        psychologistAdvice: 'Zeynep ile konuşurken günün telaşını kapıda bırak. "Hallederiz" demek yerine "Bugün mimarlık projen seni ne kadar yordu, dinlemek istiyorum" de. Duygusal onay aldığında hızla dinginleşir ve sevgiyle yaklaşır.',
      },
      keyMemories: [
        'Nostaljik plak dinlemeyi ve doğa yürüyüşlerini çok seviyor.',
        'Son zamanlarda yoğun teslimlerden dolayı fiziksel ve zihinsel olarak yorgun.',
        'Sapanca veya Polonezköy doğa kaçamağı hayali var.',
      ],
      recommendedVenues: [
        {
          id: 'v-1',
          name: 'Tarihi Moda İskelesi Kitap Kafe & Teras',
          district: 'Kadıköy / Moda',
          category: 'romantic_dinner',
          vibe: 'Deniz kokusu, tarihi ahşap doku ve sakin gün batımı manzarası',
          addressSnippet: 'Moda Sahil Yolu No:1, Kadıköy',
          googleMapsUrl: 'https://maps.google.com/?q=Tarihi+Moda+İskelesi',
          whySuggested: 'Yürüyüş mesafesinde telefon detoksu ve sakin bir kahve/çay sohbeti için mükemmel.',
        },
        {
          id: 'v-2',
          name: 'Viktor Levi Şarap Evi & Sakin Avlu',
          district: 'Kadıköy / Caferağa',
          category: 'romantic_dinner',
          vibe: 'Sarmaşıklarla kaplı loş tarihi bahçe, mum ışığı ve yumuşak caz müzik',
          addressSnippet: 'Damacı Sk. No:4, Caferağa, Kadıköy',
          googleMapsUrl: 'https://maps.google.com/?q=Viktor+Levi+Kadıköy',
          whySuggested: 'Haftanın yorgunluğunu atmak ve baş başa derin sohbet etmek için en ideal atmosfer.',
        },
      ],
      conversationStarters: [
        "Zeynep'in son dönemdeki duygusal durumunu psikolog gözüyle değerlendir",
        "Zeynep için cuma akşamına sakin bir Moda sürprizi planla",
        "Zeynep'e gün içinde gönderebileceğim nazik bir sevgi mesajı hazırla",
      ],
    },
    {
      id: 'pp-anne',
      name: 'Annem (Fatma)',
      relation: 'Anne',
      avatarEmoji: '💐',
      avatarColor: 'from-amber-500 to-rose-500',
      lastContactDate: '2026-09-21 (3 gün önce)',
      proactiveStatus: 'urgent_checkin',
      proactiveNudge: 'Doğum gününe sadece 3 gün kaldı (28 Eylül)! Ayrıca 3 gündür aramadın; son konuşmada tansiyon yorgunluğundan bahsetmişti.',
      psychologicalAnalysis: {
        archetype: 'Fedakar Koruyucu & Sevgi Bağı Odaklı',
        attachmentStyle: 'Güvenli (Secure)',
        communicationStyle: 'Sıcak, hatır soran ve evladının sağlığı/beslenmesi üzerinden sevgisini gösteren geleneksel şefkat dili.',
        stressTriggers: [
          'Uzun süre haber alamamak',
          'Evladının sağlıksız beslendiğini veya aşırı çalıştığını düşünmek',
        ],
        loveLanguage: 'Hizmet Eylemleri & Sözlü Onay',
        psychologistAdvice: 'Anneni aradığında aceleci bir ses tonu kullanma. "Nasılsın"ın ötesinde "Bugün tansiyonun nasıldı anneciğim, seni düşündüm" demek onun için en büyük şifa.',
      },
      keyMemories: [
        '28 Eylül doğum günü; keten ciltli nostaljik fotoğraf albümü çok mutlu eder.',
        'Hafta sonu Boğaz havası almayı ve sakin bir çay bahçesinde oturmayı özlüyor.',
        'Tansiyon ilaçlarını aksatmaması ve stresten uzak durması gerekiyor.',
      ],
      recommendedVenues: [
        {
          id: 'v-3',
          name: 'Tarihi Çınaraltı Çay Bahçesi',
          district: 'Çengelköy / Üsküdar',
          category: 'cultural',
          vibe: 'Asırlık çınar altında dalga sesleri, taze börek ve demli çay',
          addressSnippet: 'Çengelköy Cd. No:4, Üsküdar',
          googleMapsUrl: 'https://maps.google.com/?q=Tarihi+Çınaraltı+Çengelköy',
          whySuggested: 'Annenle huzurlu bir nostalji günü yaşamak için eşsiz bir Boğaz ortamı.',
        },
      ],
      conversationStarters: [
        'Anneme doğum günü için duygu dolu bir mektup hazırla',
        'Annemle hafta sonu sakin bir buluşma planı hazırla',
      ],
    },
    {
      id: 'pp-murat',
      name: 'Murat',
      relation: 'İş Ortağı & Yakın Dost',
      avatarEmoji: '💼',
      avatarColor: 'from-cyan-500 to-blue-600',
      lastContactDate: '2026-09-24',
      proactiveStatus: 'healthy',
      proactiveNudge: 'Dün toplantı verimliydi; haftaya SaaS genişleme stratejisini kahve eşliğinde konuşabilirsiniz.',
      psychologicalAnalysis: {
        archetype: 'Vizyoner Stratejist & Yüksek Enerjili Girişimci',
        attachmentStyle: 'Dengeli',
        communicationStyle: 'Doğrudan, veriye dayalı ve hızlı aksiyon odaklı.',
        stressTriggers: ['Zaman kaybı', 'Verimsiz ve gündemsiz toplantılar'],
        loveLanguage: 'Takdir ve Ortak Başarı',
        psychologistAdvice: 'Murat ile konuşurken önce somut veriyi sun, ardından vizyona geç. Samimi ama net dili sever.',
      },
      keyMemories: [
        'Grispi kurumsal strateji ve büyüme ortağı.',
        'Nitelikli filtre kahve ve minimal modern mekanları sever.',
      ],
      recommendedVenues: [
        {
          id: 'v-4',
          name: 'Petra Roasting Co. Maslak',
          district: 'Sarıyer / Maslak',
          category: 'coffee_work',
          vibe: 'Yüksek tavan, endüstriyel şık tasarım ve üst düzey espresso',
          addressSnippet: 'Ahi Evran Cd. No:11, Maslak',
          googleMapsUrl: 'https://maps.google.com/?q=Petra+Maslak',
          whySuggested: 'İş çıkışı 45 dakikalık strateji değerlendirmesi için ideal.',
        },
      ],
      conversationStarters: [
        'Murat ile yeni SaaS modeli üzerine konuşma başlığı hazırla',
        'Murat için hızlı bir strateji kahvesi ayarla',
      ],
    },
  ],
  memories: [
    {
      id: 'mem-loc-1',
      type: 'LOCATION',
      content: 'Kullanıcının evi Kadıköy Moda Caferağa sahil hattında; semtin deniz havasını, yürüyüş parkurunu ve sakin çay bahçelerini çok seviyor.',
      importance: 5,
      confidence: 1.0,
      source: 'user_explicit',
      isUserConfirmed: true,
      isActive: true,
      createdAt: '2026-09-18T10:00:00Z',
      updatedAt: '2026-09-18T10:00:00Z',
    },
    {
      id: 'mem-wrk-1',
      type: 'WORK',
      content: 'İşyeri Levent-Maslak hattındaki teknoloji ofisi (Grispi). Hafta içi mesaisi 09:00 - 18:00 arası.',
      importance: 5,
      confidence: 1.0,
      source: 'user_explicit',
      isUserConfirmed: true,
      isActive: true,
      createdAt: '2026-09-18T10:00:00Z',
      updatedAt: '2026-09-18T10:00:00Z',
    },
    {
      id: 'mem-style-1',
      type: 'OUTFIT_STYLE',
      content: 'Kullanıcının giyim tarzı smart-casual. Özellikle açık renk keten gömlekleri, rahat beyaz sneakerları ve pamuklu polo tişörtleri tercih ediyor. Şık ama sıkmayan nefes alan kumaşlar odağını yükseltiyor.',
      importance: 4,
      confidence: 0.95,
      source: 'conversation',
      isUserConfirmed: true,
      isActive: true,
      createdAt: '2026-09-20T10:00:00Z',
      updatedAt: '2026-09-20T10:00:00Z',
    },
    {
      id: 'mem-1',
      type: 'ROUTINE',
      content: 'Kullanıcı genellikle saat 18:00’de işten çıkıyor ve Kadıköy istikametine geçiyor.',
      importance: 5,
      confidence: 0.96,
      source: 'conversation',
      isUserConfirmed: true,
      isActive: true,
      createdAt: '2026-09-20T10:00:00Z',
      updatedAt: '2026-09-20T10:00:00Z',
    },
    {
      id: 'mem-2',
      type: 'PREFERENCE',
      content: 'Toplantılar arasına en az 15 dakikalık nefes payı koymayı tercih ediyor.',
      importance: 4,
      confidence: 0.92,
      source: 'behavior',
      isUserConfirmed: true,
      isActive: true,
      createdAt: '2026-09-21T14:30:00Z',
      updatedAt: '2026-09-21T14:30:00Z',
    },
    {
      id: 'mem-3',
      type: 'RELATIONSHIP',
      content: 'Annesinin doğum günü 28 Eylül. Geçen hafta hediye olarak keten anı albümü düşünmüştü.',
      importance: 5,
      confidence: 0.99,
      source: 'conversation',
      isUserConfirmed: true,
      isActive: true,
      createdAt: '2026-09-22T11:15:00Z',
      updatedAt: '2026-09-22T11:15:00Z',
    },
    {
      id: 'mem-4',
      type: 'SHOPPING',
      content: 'Ev alışverişinde laktozsuz organik süt, taze kavrulmuş filtre kahve ve gezen tavuk yumurtasını tercih ediyor.',
      importance: 3,
      confidence: 0.93,
      source: 'conversation',
      isUserConfirmed: true,
      isActive: true,
      createdAt: '2026-09-23T09:00:00Z',
      updatedAt: '2026-09-23T09:00:00Z',
    },
    {
      id: 'mem-5',
      type: 'WELLNESS',
      content: 'Haftada en az 3 gün akşamları spor salonuna gidiyor; Salı akşamları toplantılar uzarsa antrenmanı aksatabiliyor.',
      importance: 4,
      confidence: 0.88,
      source: 'behavior',
      isUserConfirmed: true,
      isActive: true,
      createdAt: '2026-09-22T19:00:00Z',
      updatedAt: '2026-09-22T19:00:00Z',
    },
    {
      id: 'mem-6',
      type: 'TEMPORARY_CONTEXT',
      content: 'Bugün eve giderken markete uğrayıp süt, yumurta ve kahve alacak.',
      importance: 4,
      confidence: 0.98,
      source: 'conversation',
      isUserConfirmed: true,
      isActive: true,
      createdAt: '2026-09-24T12:00:00Z',
      updatedAt: '2026-09-24T12:00:00Z',
      expiresAt: '2026-09-24T23:59:59Z',
    },
    {
      id: 'mem-7',
      type: 'VEHICLE',
      content: '34 AY 2024 plakalı aracın muayenesi Kasım 2026’da, kaskosu Ekim 2026’da bitiyor.',
      importance: 5,
      confidence: 0.95,
      source: 'document',
      isUserConfirmed: true,
      isActive: true,
      createdAt: '2026-09-18T16:00:00Z',
      updatedAt: '2026-09-18T16:00:00Z',
    },
    {
      id: 'mem-8',
      type: 'RELATIONSHIP',
      content: 'Partneri Zeynep son dönemde iş yoğunluğu nedeniyle baş başa kaliteli vakit geçirememekten dert yanmıştı. Zeynep doğa yürüyüşlerini, nostaljik plakları, butik kahvecileri ve samimi sürprizleri çok seviyor.',
      importance: 5,
      confidence: 0.98,
      source: 'conversation',
      isUserConfirmed: true,
      isActive: true,
      createdAt: '2026-09-22T20:00:00Z',
      updatedAt: '2026-09-22T20:00:00Z',
    },
    {
      id: 'mem-9',
      type: 'WELLNESS',
      content: 'Kullanıcı son zamanlarda fazla kilolarından ve sürekli masa başında oturmaktan şikayetçi; katı diyetler yerine iş çıkışı yürüyüş ve hafif beslenme gibi sürdürülebilir, utandırmayan nazik rutinler bekliyor.',
      importance: 5,
      confidence: 0.96,
      source: 'conversation',
      isUserConfirmed: true,
      isActive: true,
      createdAt: '2026-09-23T18:00:00Z',
      updatedAt: '2026-09-23T18:00:00Z',
    },
    {
      id: 'mem-10',
      type: 'RELATIONSHIP',
      content: 'Annesi nostaljik mektuplara ve aile albümlerine çok duygulanıyor. 28 Eylül doğum gününde kuru bir mesaj yerine çocukluk anılarını anan samimi bir mektup bekliyor.',
      importance: 5,
      confidence: 0.99,
      source: 'conversation',
      isUserConfirmed: true,
      isActive: true,
      createdAt: '2026-09-23T10:00:00Z',
      updatedAt: '2026-09-23T10:00:00Z',
    },
  ],
  tasks: [
    {
      id: 'tsk-1',
      title: 'Q3 Büyüme & Bütçe Raporunu İncele',
      description: 'Yatırımcı ve yönetim kuruluna sunulacak ana finansal özet.',
      scheduledDate: '2026-09-24',
      preferredTime: '11:00',
      durationMinutes: 60,
      priority: 'high',
      category: 'work',
      status: 'completed',
      createdBy: 'user',
      createdAt: '2026-09-24T08:00:00Z',
      updatedAt: '2026-09-24T12:05:00Z',
    },
    {
      id: 'tsk-2',
      title: 'Müşteri Strateji & Sözleşme Görüşmesi',
      description: 'Grispi kurumsal lisans genişletme toplantısı.',
      scheduledDate: '2026-09-24',
      preferredTime: '14:00',
      durationMinutes: 75,
      priority: 'urgent',
      category: 'work',
      status: 'completed',
      createdBy: 'user',
      createdAt: '2026-09-24T08:30:00Z',
      updatedAt: '2026-09-24T15:20:00Z',
    },
    {
      id: 'tsk-3',
      title: 'Marketten süt, yumurta ve kahve al',
      description: 'Laktozsuz organik süt, filtre kahve ve gezen tavuk yumurtası.',
      scheduledDate: '2026-09-24',
      preferredTime: '17:45',
      durationMinutes: 20,
      priority: 'high',
      category: 'shopping',
      location: 'Moda Macrocenter / Gurme Market',
      contextTrigger: 'work_commute',
      status: 'pending',
      createdBy: 'ai_assistant',
      createdAt: '2026-09-24T12:05:00Z',
      updatedAt: '2026-09-24T12:05:00Z',
    },
    {
      id: 'tsk-4',
      title: 'Akşam Spor Antrenmanı (Sırt & Core)',
      description: 'Haftalık 3 gün antrenman hedefi kapsamındaki seans.',
      scheduledDate: '2026-09-24',
      preferredTime: '19:15',
      durationMinutes: 50,
      priority: 'medium',
      category: 'health',
      location: 'Gym / Fitness Club',
      status: 'pending',
      createdBy: 'user',
      createdAt: '2026-09-24T08:00:00Z',
      updatedAt: '2026-09-24T08:00:00Z',
    },
    {
      id: 'tsk-5',
      title: 'Anneye Doğum Günü Hediyesi Seçimi',
      description: 'Fotoğraflı keten anı albümü siparişi vermek.',
      scheduledDate: '2026-09-25',
      preferredTime: '12:30',
      durationMinutes: 25,
      priority: 'high',
      category: 'personal',
      status: 'pending',
      createdBy: 'ai_assistant',
      createdAt: '2026-09-24T13:00:00Z',
      updatedAt: '2026-09-24T13:00:00Z',
    },
  ],
  goals: [
    {
      id: 'gol-1',
      title: 'Haftada 3 Gün Düzenli Spor Yapmak',
      category: 'health',
      targetDate: '2026-10-31',
      progress: 67,
      status: 'active',
      milestones: [
        { title: 'Pazartesi Kardiyo seansı', completed: true },
        { title: 'Çarşamba Kuvvet seansı', completed: true },
        { title: 'Cuma / Cumartesi Core seansı', completed: false },
      ],
    },
    {
      id: 'gol-2',
      title: 'Yıllık Acil Durum Birikim Fonu (150.000 TL)',
      category: 'finance',
      targetDate: '2026-12-31',
      progress: 80,
      status: 'active',
      milestones: [
        { title: '50.000 TL aşaması', completed: true },
        { title: '100.000 TL aşaması', completed: true },
        { title: '150.000 TL nihai hedef', completed: false },
      ],
    },
  ],
  habits: [
    {
      id: 'hbt-1',
      title: 'Sabah 500ml Su & Esneme',
      frequency: 'daily',
      preferredTime: '07:45',
      streak: 12,
      bestStreak: 21,
      completedToday: true,
      category: 'wellness',
    },
    {
      id: 'hbt-2',
      title: 'Günde 25 Sayfa Kitap / Makale Okuma',
      frequency: 'daily',
      preferredTime: '22:30',
      streak: 5,
      bestStreak: 14,
      completedToday: false,
      category: 'mind',
    },
    {
      id: 'hbt-3',
      title: 'Akşam Dijital Detoks (Ekran kapatma 23:00)',
      frequency: 'weekdays',
      preferredTime: '23:00',
      streak: 4,
      bestStreak: 9,
      completedToday: false,
      category: 'wellness',
    },
  ],
  payments: [
    {
      id: 'pay-1',
      title: 'Elektrik Faturası (Enerjisa)',
      amount: 780,
      currency: 'TL',
      dueDate: '2026-09-25',
      category: 'utility',
      isPaid: false,
      reminderDaysBefore: 1,
    },
    {
      id: 'pay-2',
      title: 'Ev Kirası',
      amount: 24000,
      currency: 'TL',
      dueDate: '2026-10-01',
      category: 'rent',
      isPaid: false,
      reminderDaysBefore: 3,
    },
    {
      id: 'pay-3',
      title: 'Vodafone Mobil Hat Faturası',
      amount: 450,
      currency: 'TL',
      dueDate: '2026-10-05',
      category: 'phone',
      isPaid: false,
      reminderDaysBefore: 2,
    },
  ],
  subscriptions: [
    {
      id: 'sub-1',
      serviceName: 'Spotify Premium',
      amount: 119,
      currency: 'TL',
      billingCycle: 'monthly',
      nextBillingDate: '2026-10-02',
      category: 'entertainment',
    },
    {
      id: 'sub-2',
      serviceName: 'iCloud+ 2TB',
      amount: 129,
      currency: 'TL',
      billingCycle: 'monthly',
      nextBillingDate: '2026-10-10',
      category: 'cloud',
    },
    {
      id: 'sub-3',
      serviceName: 'Gym & Spa Club Üyeliği',
      amount: 1850,
      currency: 'TL',
      billingCycle: 'monthly',
      nextBillingDate: '2026-10-15',
      category: 'fitness',
    },
    {
      id: 'sub-4',
      serviceName: 'AI & Developer Tools Suite',
      amount: 680,
      currency: 'TL',
      billingCycle: 'monthly',
      nextBillingDate: '2026-10-18',
      category: 'work',
    },
  ],
  vehicles: [
    {
      id: 'veh-1',
      plate: '34 AY 2024',
      makeModel: 'BMW 320i M-Sport',
      modelYear: 2022,
      inspectionDue: '2026-11-15',
      insuranceDue: '2026-10-20',
      cascoDue: '2026-10-20',
      currentKm: 42500,
      maintenanceKm: 45000,
      notes: 'Kışlık lastik değişimi için Ekim sonu randevu planlanacak.',
    },
  ],
  documents: [
    {
      id: 'doc-1',
      title: 'Samsung Buzdolabı Garanti Belgesi',
      docType: 'warranty',
      expiryDate: '2026-10-25',
      notes: 'Fatura No: TR-88493. 2 Yıl parça garantisi.',
      ocrExtractedText: 'SAMSUNG ELEKTRONIK SERVIS GARANTISI. 24 AY gecerlidir. Bitis Tarihi: 25.10.2026.',
    },
    {
      id: 'doc-2',
      title: 'Anadolu Sigorta Kasko Poliçesi',
      docType: 'insurance',
      expiryDate: '2026-10-20',
      notes: 'Poliçe No: 4492-KSK. Çekici ve ikame araç hakkı mevcut.',
      ocrExtractedText: 'GENISLETILMIS KASKO POLICESI. Bitis: 20/10/2026.',
    },
    {
      id: 'doc-3',
      title: 'Moda Daire Kira Kontratı',
      docType: 'contract',
      expiryDate: '2027-04-01',
      notes: 'Yıllık TÜFE oranında artış maddesi içeriyor.',
      ocrExtractedText: 'KONUT KIRA SOZLESMESI. 12 Aylik yenileme donemi Nisan 2027.',
    },
  ],
  specialDates: [
    {
      id: 'spd-1',
      personName: 'Annem',
      relationship: 'Anne',
      eventType: 'birthday',
      dateMonthDay: '09-28',
      giftIdea: 'Keten kapaklı nostaljik aile fotoğraf albümü',
    },
    {
      id: 'spd-2',
      personName: 'Zeynep',
      relationship: 'Eş / Partner',
      eventType: 'anniversary',
      dateMonthDay: '10-14',
      giftIdea: 'Sapanca veya Şile doğa kaçamağı',
    },
  ],
  notifications: [
    {
      id: 'notif-1',
      title: 'Akşam Rutini & Alışveriş',
      body: 'İşten çıkmana 15 dakika kaldı. Eve gitmeden markete uğrayacaktın. Süt, yumurta ve kahve listendeydi. 🛒',
      priority: 'high',
      category: 'contextual',
      actionType: 'confirm_task',
      actionPayload: { taskId: 'tsk-3' },
      status: 'unread',
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      triggerContext: 'work_commute_offset_-15m',
    },
    {
      id: 'notif-2',
      title: 'Ödeme Hatırlatması',
      body: 'Elektrik faturasının (780 TL) son ödeme tarihi yarın.',
      priority: 'high',
      category: 'finance',
      actionType: 'open_plan',
      status: 'read',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      triggerContext: 'due_date_tomorrow',
    },
  ],
  conversationHistory: [
    {
      id: 'msg-1',
      sender: 'ayzek',
      text: 'Merhaba Görkem. Günün nasıl geçiyor? Bugünkü planına göre saat 18:00’de işten çıkışın var. Eve giderken marketten laktozsuz süt, yumurta ve kahve alacağını not etmiştim. Akşamını kolaylaştırmak için hazırım.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      suggestions: [
        'Bugün ne yapacağım?',
        'Markete gitmeyeceğim, görevi sil',
        'Akşam antrenmanını yarına ertele',
        'Hakkımda ne biliyorsun?',
      ],
    },
  ],
};

// -------------------------------------------------------------
// Proactive Intelligence & Daily Planner Engine Logic
// -------------------------------------------------------------

function calculateNotificationPriority(params: {
  urgency: number; // 1-5
  importance: number; // 1-5
  relevance: number; // 1-5
  userPrefFrequency: 'minimal' | 'balanced' | 'proactive';
  recentNotificationCountInLast2Hours: number;
}): { score: number; level: 'high' | 'medium' | 'low'; shouldSend: boolean } {
  const prefMultiplier = params.userPrefFrequency === 'proactive' ? 1.2 : params.userPrefFrequency === 'minimal' ? 0.7 : 1.0;
  const fatiguePenalty = params.recentNotificationCountInLast2Hours * 1.5;

  const score = (params.urgency * 1.5 + params.importance * 1.2 + params.relevance * 1.3) * prefMultiplier - fatiguePenalty;

  let level: 'high' | 'medium' | 'low' = 'low';
  if (score >= 10) level = 'high';
  else if (score >= 6) level = 'medium';

  const shouldSend = params.userPrefFrequency === 'minimal' ? score >= 9 : score >= 5.5;

  return { score, level, shouldSend };
}

function synthesizeDailyPlan() {
  const today = '2026-09-24';
  const planItems = [
    {
      id: 'plan-wake',
      time: state.profile.wakeTime,
      title: 'Uyanış & Sabah Rutini',
      subtitle: '500ml Su, esneme ve sabah kahvesi',
      durationMinutes: 45,
      type: 'routine',
      isFlexible: false,
      status: 'completed',
    },
    {
      id: 'plan-work-start',
      time: state.profile.workStartTime,
      title: 'Çalışma Başlangıcı & E-posta Taraması',
      subtitle: 'Günlük odak maddelerinin netleştirilmesi',
      durationMinutes: 60,
      type: 'routine',
      isFlexible: false,
      status: 'completed',
    },
  ];

  state.tasks
    .filter((t) => t.scheduledDate === today && t.preferredTime)
    .forEach((t) => {
      planItems.push({
        id: `plan-task-${t.id}`,
        time: t.preferredTime || '12:00',
        title: t.title,
        subtitle: t.category.toUpperCase() + (t.location ? ` · ${t.location}` : ''),
        durationMinutes: t.durationMinutes,
        type: 'task',
        isFlexible: t.priority !== 'urgent',
        status: t.status === 'completed' ? 'completed' : 'upcoming',
        // @ts-ignore
        taskId: t.id,
      });
    });

  // Add commute buffer
  planItems.push({
    id: 'plan-commute',
    time: state.profile.workEndTime,
    title: 'İşten Çıkış & Eve Dönüş',
    subtitle: 'Kadıköy hattı seyahat',
    durationMinutes: 45,
    type: 'routine',
    isFlexible: false,
    status: 'upcoming',
  });

  // Sort by time
  planItems.sort((a, b) => a.time.localeCompare(b.time));
  return planItems;
}

// -------------------------------------------------------------
// AI Tool Definitions (FunctionDeclarations)
// -------------------------------------------------------------

const toolsDeclarations: FunctionDeclaration[] = [
  {
    name: 'create_task',
    description: 'Yeni bir görev veya yapılacak iş oluşturur.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'Görevin başlığı' },
        scheduled_date: { type: Type.STRING, description: 'Tarih (YYYY-MM-DD)' },
        preferred_time: { type: Type.STRING, description: 'Saat (HH:mm)' },
        category: { type: Type.STRING, description: 'Kategori (work, personal, shopping, health, errand)' },
        priority: { type: Type.STRING, description: 'Öncelik (urgent, high, medium, low)' },
        context_trigger: { type: Type.STRING, description: 'Bağlamsal tetikleyici (ör: work_commute, morning_routine)' },
      },
      required: ['title'],
    },
  },
  {
    name: 'reschedule_task',
    description: 'Mevcut bir görevi yeni bir saat veya tarihe erteler / yeniden planlar.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        task_id: { type: Type.STRING, description: 'Görevin ID si veya başlığından eşleşen kelime' },
        new_date: { type: Type.STRING, description: 'Yeni tarih (YYYY-MM-DD)' },
        new_time: { type: Type.STRING, description: 'Yeni saat (HH:mm)' },
        reason: { type: Type.STRING, description: 'Erteleme nedeni' },
      },
      required: ['task_id'],
    },
  },
  {
    name: 'complete_task',
    description: 'Bir görevi tamamlandı olarak işaretler.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        task_id: { type: Type.STRING, description: 'Görevin ID si veya başlığı' },
      },
      required: ['task_id'],
    },
  },
  {
    name: 'delete_task',
    description: 'Bir görevi listeden siler.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        task_id: { type: Type.STRING, description: 'Görevin ID si veya başlığı' },
      },
      required: ['task_id'],
    },
  },
  {
    name: 'save_memory',
    description: 'Kullanıcı hakkında kalıcı veya bağlamsal önemli bir bilgi/rutin/tercih kaydeder.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        type: {
          type: Type.STRING,
          description: 'Hafıza tipi: IDENTITY, PREFERENCE, ROUTINE, RELATIONSHIP, GOAL, HABIT, IMPORTANT_DATE, FINANCIAL, VEHICLE, WORK, WELLNESS, SHOPPING, TEMPORARY_CONTEXT',
        },
        content: { type: Type.STRING, description: 'Hafıza içeriği' },
        importance: { type: Type.NUMBER, description: '1 ile 5 arasında önem derecesi' },
      },
      required: ['type', 'content'],
    },
  },
  {
    name: 'forget_memory',
    description: 'Kullanıcının unutturmak istediği bir hafızayı siler veya pasifleştirir.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query_or_id: { type: Type.STRING, description: 'Unutulacak hafızanın ID si veya anahtar kelimesi' },
      },
      required: ['query_or_id'],
    },
  },
  {
    name: 'get_daily_plan',
    description: 'Kullanıcının bugünkü dinamik zaman çizelgesini ve planını getirir.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'reorganize_day',
    description: 'Geciken veya uzayan bir etkinlik sonrasında günün kalanını yeniden organize eder.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        delayed_minutes: { type: Type.NUMBER, description: 'Kaç dakika kayma yaşandığı' },
        affected_item: { type: Type.STRING, description: 'Uzatılan veya geciken iş' },
      },
      required: ['delayed_minutes'],
    },
  },
  {
    name: 'query_integrations',
    description: 'WhatsApp, Microsoft Teams, Google Meet, Zoom veya Takvim entegrasyonlarındaki son konuşmaları, toplantı özetlerini ve çıkarılan aksiyonları sorgular.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        service: { type: Type.STRING, description: 'whatsapp, teams, meet, zoom, calendar veya all' },
        query: { type: Type.STRING, description: 'Aranacak kişi, konu veya kelime (ör: Zeynep, sprint, toplantı, bütçe)' },
      },
      required: ['service'],
    },
  },
];

// Execute a tool call against the internal store
function executeTool(name: string, args: any): { success: boolean; data?: any; message: string } {
  try {
    if (name === 'create_task') {
      const newTask = {
        id: `tsk-${Date.now()}`,
        title: args.title,
        scheduledDate: args.scheduled_date || '2026-09-24',
        preferredTime: args.preferred_time || '17:00',
        durationMinutes: 30,
        priority: (args.priority as any) || 'medium',
        category: (args.category as any) || 'personal',
        contextTrigger: args.context_trigger,
        status: 'pending' as const,
        createdBy: 'ai_assistant' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.tasks.push(newTask);
      saveStoreToDisk();
      return { success: true, data: newTask, message: `"${newTask.title}" görevi saat ${newTask.preferredTime || ''} için başarıyla oluşturuldu.` };
    }

    if (name === 'reschedule_task') {
      const match = state.tasks.find(
        (t) => t.id === args.task_id || t.title.toLowerCase().includes((args.task_id || '').toLowerCase()),
      );
      if (match) {
        if (args.new_date) match.scheduledDate = args.new_date;
        if (args.new_time) match.preferredTime = args.new_time;
        match.status = 'rescheduled';
        match.updatedAt = new Date().toISOString();
        saveStoreToDisk();
        return { success: true, data: match, message: `"${match.title}" görevi ${match.scheduledDate} ${match.preferredTime} saatine taşındı.` };
      }
      return { success: false, message: 'İlgili görev bulunamadı.' };
    }

    if (name === 'complete_task') {
      const match = state.tasks.find(
        (t) => t.id === args.task_id || t.title.toLowerCase().includes((args.task_id || '').toLowerCase()),
      );
      if (match) {
        match.status = 'completed';
        match.updatedAt = new Date().toISOString();
        saveStoreToDisk();
        return { success: true, data: match, message: `"${match.title}" görevi tamamlandı olarak işaretlendi.` };
      }
      return { success: false, message: 'Görev bulunamadı.' };
    }

    if (name === 'delete_task') {
      const index = state.tasks.findIndex(
        (t) => t.id === args.task_id || t.title.toLowerCase().includes((args.task_id || '').toLowerCase()),
      );
      if (index !== -1) {
        const deleted = state.tasks.splice(index, 1)[0];
        saveStoreToDisk();
        return { success: true, data: deleted, message: `"${deleted.title}" görevi başarıyla silindi.` };
      }
      return { success: false, message: 'Silinecek görev bulunamadı.' };
    }

    if (name === 'save_memory') {
      const mem = {
        id: `mem-${Date.now()}`,
        type: args.type || 'PREFERENCE',
        content: args.content,
        importance: args.importance || 3,
        confidence: 0.95,
        source: 'conversation',
        isUserConfirmed: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.memories.unshift(mem);
      saveStoreToDisk();
      return { success: true, data: mem, message: `Hafızaya kaydedildi: "${mem.content}"` };
    }

    if (name === 'forget_memory') {
      const query = (args.query_or_id || '').toLowerCase();
      const match = state.memories.find((m) => m.id === args.query_or_id || m.content.toLowerCase().includes(query));
      if (match) {
        match.isActive = false;
        saveStoreToDisk();
        return { success: true, data: match, message: `"${match.content}" hafızadan silindi ve unutturuldu.` };
      }
      return { success: false, message: 'Eşleşen hafıza bulunamadı.' };
    }

    if (name === 'query_integrations') {
      const service = (args.service || 'all').toLowerCase();
      const query = (args.query || '').toLowerCase();
      const entries: Array<{ serviceName: string; title: string; content: string; time: string; extractedTask?: string }> = [];

      if (service === 'all' || service.includes('whatsapp') || query.includes('zeynep') || query.includes('whatsapp') || query.includes('anne') || query.includes('market')) {
        entries.push({
          serviceName: 'WhatsApp',
          title: 'Zeynep (Partner)',
          content: 'Aşkım bugün mimarlık teslimatı çok yoğundu, inanılmaz başım ağrıyor ve yoruldum... Akşam eve gelirken marketten organik laktozsuz süt ve filtre kahve alabilir misin?',
          time: 'Bugün 18:15',
          extractedTask: 'Marketten süt ve filtre kahve al',
        });
        entries.push({
          serviceName: 'WhatsApp',
          title: 'Annem (Fatma)',
          content: 'Canım oğlum nasılsın? Cumartesi sabahı tansiyon kontrolüm var, haberin olsun. Bu arada geçen bahsettiğin keten kapaklı fotoğraf albümünü merak ettim.',
          time: 'Bugün 14:30',
          extractedTask: 'Annemin tansiyon kontrolünü sor & albümü hazırla',
        });
      }

      if (service === 'all' || service.includes('teams') || query.includes('teams') || query.includes('sprint') || query.includes('murat') || query.includes('proje')) {
        entries.push({
          serviceName: 'Microsoft Teams',
          title: 'Grispi Q3 Sprint Planlama & Yol Haritası',
          content: 'Toplantı Kararları: Yeni SaaS paketleme modeli onaylandı. Alınan aksiyon: Görkem backend mimari dokümantasyonunu tamamlayacak ve test ortamına alacak.',
          time: 'Bugün 14:00 - 15:15',
          extractedTask: 'Grispi mimari dokümantasyonunu tamamla',
        });
        entries.push({
          serviceName: 'Microsoft Teams',
          title: 'Murat (Kanal & Birebir)',
          content: 'Görkem selam, yarın 11:00 Zoom öncesi Q3 SaaS projeksiyon tablosuna son bir bakalım. Sabah 10:00 gibi linki atabilir misin?',
          time: 'Bugün 16:45',
          extractedTask: 'Murat’a Q3 SaaS projeksiyon tablosunu ilet',
        });
      }

      if (service === 'all' || service.includes('meet') || service.includes('zoom') || query.includes('meet') || query.includes('transkript') || query.includes('görüşme')) {
        entries.push({
          serviceName: 'Google Meet',
          title: '11:00 Q3 Büyüme Değerlendirmesi Transkripti',
          content: 'Toplantı Transkript Özeti: Yatırımcı görüşmesi için metrikler netleştirildi. Toplantı bitişinde katılımcıların nefes payı için 15 dk akıllı tampon bırakıldı.',
          time: 'Bugün 11:00 - 12:00',
          extractedTask: 'Q3 metrik raporunu revize et',
        });
      }

      return {
        success: true,
        data: entries,
        message: `${entries.length} adet entegrasyon mesajı ve toplantı kaydı başarıyla sorgulandı.`,
      };
    }

    if (name === 'get_daily_plan') {
      const plan = synthesizeDailyPlan();
      return { success: true, data: plan, message: 'Günlük plan başarıyla getirildi.' };
    }

    if (name === 'reorganize_day') {
      // Shift pending tasks by delayed_minutes
      const delayed = args.delayed_minutes || 45;
      state.tasks
        .filter((t) => t.status === 'pending' && t.preferredTime && t.preferredTime > '14:00')
        .forEach((t) => {
          const [h, m] = (t.preferredTime || '18:00').split(':').map(Number);
          const totalMins = h * 60 + m + delayed;
          const newH = Math.min(23, Math.floor(totalMins / 60));
          const newM = totalMins % 60;
          t.preferredTime = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
          t.status = 'rescheduled';
        });
      saveStoreToDisk();
      return {
        success: true,
        message: `Plan güncellendi: ${delayed} dakikalık kayma sebebiyle akşam görevleri ileri saatlere kaydırıldı.`,
      };
    }

    return { success: false, message: `Bilinmeyen araç: ${name}` };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// -------------------------------------------------------------
// REST API Endpoints
// -------------------------------------------------------------

// Profile
app.get('/api/profile', (_req, res) => {
  res.json({ success: true, profile: state.profile });
});

app.put('/api/profile', (req, res) => {
  state.profile = { ...state.profile, ...req.body };
  res.json({ success: true, profile: state.profile });
});

// Memories
app.get('/api/memories', (req, res) => {
  const { type, activeOnly } = req.query;
  let list = state.memories;
  if (activeOnly !== 'false') {
    list = list.filter((m) => m.isActive);
  }
  if (type) {
    list = list.filter((m) => m.type === type);
  }
  res.json({ success: true, memories: list });
});

app.post('/api/memories', (req, res) => {
  const { type, content, importance, confidence, source } = req.body;
  const newMem = {
    id: `mem-${Date.now()}`,
    type: type || 'PREFERENCE',
    content,
    importance: importance || 3,
    confidence: confidence || 0.9,
    source: source || 'user_explicit',
    isUserConfirmed: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.memories.unshift(newMem);
  res.json({ success: true, memory: newMem });
});

app.patch('/api/memories/:id', (req, res) => {
  const mem = state.memories.find((m) => m.id === req.params.id);
  if (!mem) return res.status(404).json({ success: false, message: 'Memory not found' });
  Object.assign(mem, req.body, { updatedAt: new Date().toISOString() });
  res.json({ success: true, memory: mem });
});

app.delete('/api/memories/:id', (req, res) => {
  const mem = state.memories.find((m) => m.id === req.params.id);
  if (!mem) return res.status(404).json({ success: false, message: 'Memory not found' });
  mem.isActive = false;
  res.json({ success: true, message: 'Memory forgotten/deactivated', memory: mem });
});

app.post('/api/memories/clear', (_req, res) => {
  state.memories.forEach((m) => (m.isActive = false));
  res.json({ success: true, message: 'All memories deactivated' });
});

// Tasks
app.get('/api/tasks', (_req, res) => {
  res.json({ success: true, tasks: state.tasks });
});

app.post('/api/tasks', (req, res) => {
  const task = {
    id: `tsk-${Date.now()}`,
    title: req.body.title,
    description: req.body.description || '',
    scheduledDate: req.body.scheduledDate || '2026-09-24',
    preferredTime: req.body.preferredTime,
    durationMinutes: req.body.durationMinutes || 30,
    priority: req.body.priority || 'medium',
    category: req.body.category || 'personal',
    location: req.body.location,
    contextTrigger: req.body.contextTrigger,
    status: 'pending' as const,
    createdBy: 'user' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.tasks.push(task);
  res.json({ success: true, task });
});

app.patch('/api/tasks/:id', (req, res) => {
  const task = state.tasks.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
  Object.assign(task, req.body, { updatedAt: new Date().toISOString() });
  res.json({ success: true, task });
});

app.delete('/api/tasks/:id', (req, res) => {
  const index = state.tasks.findIndex((t) => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Task not found' });
  const deleted = state.tasks.splice(index, 1)[0];
  res.json({ success: true, task: deleted });
});

// Dynamic Plan
app.get('/api/plan/today', (_req, res) => {
  const plan = synthesizeDailyPlan();
  res.json({ success: true, plan, date: '2026-09-24' });
});

app.post('/api/plan/reorganize', (req, res) => {
  const { delayedMinutes = 45, reason = 'Toplantı uzadı' } = req.body;
  const result = executeTool('reorganize_day', { delayed_minutes: delayedMinutes });
  const updatedPlan = synthesizeDailyPlan();
  res.json({ success: true, message: result.message, plan: updatedPlan, reason });
});

// Life Modules (Goals, Habits, Payments, Subscriptions, Vehicles, Documents, Special Dates)
app.get('/api/life/all', (_req, res) => {
  res.json({
    success: true,
    goals: state.goals,
    habits: state.habits,
    payments: state.payments,
    subscriptions: state.subscriptions,
    vehicles: state.vehicles,
    documents: state.documents,
    specialDates: state.specialDates,
  });
});

app.post('/api/goals', (req, res) => {
  const newGoal = {
    id: `gol-${Date.now()}`,
    title: req.body.title,
    category: req.body.category || 'personal',
    targetDate: req.body.targetDate || '2026-12-31',
    progress: req.body.progress || 0,
    status: 'active' as const,
    milestones: req.body.milestones || [],
  };
  state.goals.push(newGoal);
  res.json({ success: true, goal: newGoal });
});

app.post('/api/habits/:id/log', (req, res) => {
  const habit = state.habits.find((h) => h.id === req.params.id);
  if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });
  habit.completedToday = !habit.completedToday;
  if (habit.completedToday) {
    habit.streak += 1;
    if (habit.streak > habit.bestStreak) habit.bestStreak = habit.streak;
  } else {
    habit.streak = Math.max(0, habit.streak - 1);
  }
  res.json({ success: true, habit });
});

app.post('/api/finance/payments', (req, res) => {
  const payment = {
    id: `pay-${Date.now()}`,
    title: req.body.title,
    amount: Number(req.body.amount),
    currency: req.body.currency || 'TL',
    dueDate: req.body.dueDate,
    category: req.body.category || 'utility',
    isPaid: false,
    reminderDaysBefore: Number(req.body.reminderDaysBefore || 2),
  };
  state.payments.push(payment);
  res.json({ success: true, payment });
});

app.patch('/api/finance/payments/:id', (req, res) => {
  const payment = state.payments.find((p) => p.id === req.params.id);
  if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
  Object.assign(payment, req.body);
  res.json({ success: true, payment });
});

app.post('/api/finance/subscriptions', (req, res) => {
  const sub = {
    id: `sub-${Date.now()}`,
    serviceName: req.body.serviceName,
    amount: Number(req.body.amount),
    currency: req.body.currency || 'TL',
    billingCycle: req.body.billingCycle || 'monthly',
    nextBillingDate: req.body.nextBillingDate,
    category: req.body.category || 'cloud',
  };
  state.subscriptions.push(sub);
  res.json({ success: true, subscription: sub });
});

app.post('/api/vehicles', (req, res) => {
  const v = {
    id: `veh-${Date.now()}`,
    plate: req.body.plate,
    makeModel: req.body.makeModel,
    modelYear: Number(req.body.modelYear || 2022),
    inspectionDue: req.body.inspectionDue,
    insuranceDue: req.body.insuranceDue,
    currentKm: Number(req.body.currentKm || 0),
    maintenanceKm: Number(req.body.maintenanceKm || 15000),
    notes: req.body.notes,
  };
  state.vehicles.push(v);
  res.json({ success: true, vehicle: v });
});

app.post('/api/documents', (req, res) => {
  const doc = {
    id: `doc-${Date.now()}`,
    title: req.body.title,
    docType: req.body.docType || 'warranty',
    expiryDate: req.body.expiryDate,
    notes: req.body.notes || 'AYZEK OCR ile tarandı ve kaydedildi.',
    ocrExtractedText: req.body.ocrExtractedText || `Otomatik OCR Belge Analizi: ${req.body.title} - Geçerlilik: ${req.body.expiryDate || 'Belirtilmedi'}`,
  };
  state.documents.push(doc);
  res.json({ success: true, document: doc });
});

app.post('/api/special-dates', (req, res) => {
  const spd = {
    id: `spd-${Date.now()}`,
    personName: req.body.personName,
    relationship: req.body.relationship || 'Yakın',
    eventType: req.body.eventType || 'birthday',
    dateMonthDay: req.body.dateMonthDay,
    giftIdea: req.body.giftIdea,
  };
  state.specialDates.push(spd);
  res.json({ success: true, specialDate: spd });
});

// -------------------------------------------------------------
// Specialized Relationship & Special Date Assistant Endpoints
// -------------------------------------------------------------

app.post('/api/relationship/draft-message', async (req, res) => {
  const { personName = 'Annem', eventType = 'birthday', tone = 'emotional' } = req.body;

  // Retrieve memories matching this person
  const matchingMemories = state.memories.filter(
    (m) => m.isActive && m.content.toLowerCase().includes(personName.toLowerCase()),
  );

  const memoryContext = matchingMemories.map((m) => m.content).join('; ');

  let drafts = [];

  if (personName.toLowerCase().includes('anne')) {
    drafts = [
      {
        id: 'draft-1',
        toneName: 'Duygusal & Nostaljik (Önerilen)',
        message:
          'Canım annem, doğum günün kutlu olsun. Çocukluğumdan beri bana kattığın sevgi, sabır ve her eve gelişimdeki o sıcak karşılama hayatımdaki en kıymetli hazine. Birlikte biriktirdiğimiz eski aile fotoğraflarına her baktığımda şükrediyorum. Sana hazırladığım anı albümümüz gibi her anımız bir ömür capcanlı kalsın. İyi ki varsın, seni çok seviyorum!',
        usedMemories: ['Çocukluk anılarına ve fotoğraflı albümlere verilen yüksek manevi değer.'],
      },
      {
        id: 'draft-2',
        toneName: 'Sıcak & Şiirsel',
        message:
          'Güzel annem, yeni yaşın sana kalbin kadar berrak, huzurlu ve neşe dolu günler getirsin. Ne zaman hayatın koşturmacasında yorulsam, senin sesin ve duaların bana güç veriyor. Bu yaşın da hep gülümsemelerle dolsun.',
        usedMemories: ['Huzurlu ve içten temenni odağı.'],
      },
      {
        id: 'draft-3',
        toneName: 'Öz & Teşekkür Odaklı',
        message:
          'Doğum günün kutlu olsun canım annem! Hayatımın her adımında arkamda durduğun, sabrını ve sevgini benden hiç esirgemediğin için minnettarım. Sağlıkla, sevdiklerinle hep birlikte nice güzel yıllara.',
        usedMemories: ['Minnettarlık ve aile birliği.'],
      },
    ];
  } else if (personName.toLowerCase().includes('zeynep')) {
    drafts = [
      {
        id: 'draft-1',
        toneName: 'Samimi & Özür/Telafi Odaklı (Önerilen)',
        message:
          'Zeynep’im, son dönemde iş koşturmacası yüzünden sana hak ettiğin sakinliği ve zamanı veremediğimi çok iyi biliyorum. Ama bil ki aklım ve kalbim hep seninle. Bu hafta sonu telefonları kapatıp sadece seninle o çok sevdiğin sahil kahvaltısına ve doğa yürüyüşüne kaçıyoruz. Hayatıma kattığın her güzellik için teşekkür ederim.',
        usedMemories: ['Baş başa zaman dert yanması', 'Doğa yürüyüşü ve sakin kahve sevgisi.'],
      },
      {
        id: 'draft-2',
        toneName: 'Romantik & Anı Vurgulu',
        message:
          'Hayatımdaki en güzel tesadüfüm. Birlikte dinlediğimiz o eski plaklar ve çıktığımız sakin yürüyüşler gibi her günüm seninle anlam kazanıyor. Seni çok seviyorum.',
        usedMemories: ['Nostaljik plak ve sakin anlar tercihi.'],
      },
    ];
  } else {
    drafts = [
      {
        id: 'draft-1',
        toneName: 'Samimi & İçten',
        message: `Sevgili ${personName}, bu özel günün kutlu olsun! Hayatında biriktirdiğin tüm güzel anılara yenilerinin eklendiği harika bir yıl dilerim.`,
        usedMemories: ['Yakınlık ve pozitif temenni.'],
      },
    ];
  }

  res.json({
    success: true,
    personName,
    eventType,
    memoryContextUsed: memoryContext,
    drafts,
  });
});

app.post('/api/relationship/plan-surprise', (req, res) => {
  const { personName = 'Zeynep' } = req.body;

  // Synthesize surprise plan solving the partner's actual complaint
  const plan = {
    partnerName: personName,
    detectedConcern: 'Son zamanlarda iş yoğunluğundan ötürü baş başa kaliteli vakit geçirememek.',
    solutionPhilosophy: 'Pahalı hediyeler yerine zihinsel dinlenme, ilgi ve kaliteli ortak zaman odaklı planlama.',
    steps: [
      {
        step: 1,
        title: 'Cuma Akşamı Telefon Detoksu & Şef Yemeği',
        description: 'İşten 18:00’de çıkış sonrası eve sevdiği gurme lezzetleri alıp evde mum ışığında sakin bir akşam sohbeti.',
      },
      {
        step: 2,
        title: 'Cumartesi Sabahı Doğa Yürüyüşü & Sahil Kahvaltısı',
        description: 'Polonezköy veya Belgrad ormanında 45 dakikalık sessiz doğa yürüyüşü, ardından butik kahvecide kahve molası.',
      },
      {
        step: 3,
        title: 'Nostaljik Hatıra Hediyesi',
        description: 'Geçmişte bahsettiği sevdiği eski şarkıların yer aldığı bir nostaljik pikap plağı veya el yazılı kart.',
      },
    ],
  };

  res.json({ success: true, plan });
});

// -------------------------------------------------------------
// AI Audio Daily Briefing (Sabah & Akşam Sesli Brifingi)
// -------------------------------------------------------------
app.post('/api/briefing/generate', async (req, res) => {
  const { mode = 'morning', regenerateWithAI = false } = req.body;
  const userName = state.profile.name || 'Görkem';

  let script = '';
  let highlights: string[] = [];

  if (mode === 'morning') {
    script = `Günaydın ${userName}, bugün Levent'te 2 kritik toplantın var. Saat 14:00'teki Teams toplantısı öncesinde 30 dakika hazırlık partisi koydum. Moda'da hava 22 derece, keten gömlek harika bir tercih. Zeynep dün teslimattan yorgun döndü; akşam ona Moda sahilinde ufak bir yürüyüş planladım. Zihnini ferah tut, harika bir gün olsun!`;
    highlights = [
      'Hava Durumu: Moda 22°C (Keten gömlek önerisi)',
      'Mesai: Levent 11:00 büyüme & 14:00 Teams toplantısı',
      'Hazırlık: 13:30 - 14:00 odak partisi takvimde',
      'Empati Adımı: Zeynep ile akşam sahil yürüyüşü',
    ];
  } else {
    script = `İyi akşamlar ${userName}. Günün değerlendirmesi: Bugün Levent mesaini, 3 kritik iş görevini ve mikro-rutinlerini başarıyla tamamladın. Zeynep ile akşam sahil yürüyüşü zihnini dinlendirdi. Şimdi zihinsel dekompresyon ve uykuya geçiş rehberi devrede. Ekranları kapatıp derin nefes egzersiziyle uykuya hazırlanabilirsin. Huzurlu geceler.`;
    highlights = [
      'Günün Özeti: 3 görev başarıyla tamamlandı',
      'Rutinler: 10.000 adım ve market alışverişi bitti',
      'Dekompresyon: Ekran karartma & mavi ışık filtresi devrede',
      'Uyku Rehberi: 4-7-8 rahatlatıcı nefes döngüsü',
    ];
  }

  // If AI generation is requested and API key is present
  if (process.env.GEMINI_API_KEY && regenerateWithAI) {
    try {
      const prompt = `Sen AYZEK adlı kişisel yaşam işletim sistemi ve zihinsel deşarj mentörüsün.
Kullanıcı adı: ${userName}
Mod: ${mode === 'morning' ? 'Sabah Brifingi (07:45)' : 'Akşam Brifingi (22:30)'}
Kullanıcının görevleri: ${state.tasks.map((t) => t.title).join(', ')}
Hafızadaki ilişkiler: Zeynep (Eş/Partner, Moda sahili yürüyüşleri), Annem Fatma (Doğum günü 28 Eylül)
Hava: Moda 22°C.
Kullanıcıya Web Speech API ile sesli okunacak, tam 50-60 saniye sürecek, son derece doğal, sakin, net ve hayatını düzene sokan bir Türkçe konuşma metni üret.
Lütfen doğrudan okunacak metni ver. Başlık veya markdown kullanma.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      if (response && response.text) {
        script = response.text.trim();
      }
    } catch (e) {
      console.warn('AI briefing generation fallback used:', e);
    }
  }

  res.json({
    success: true,
    mode,
    userName,
    script,
    highlights,
    durationSeconds: 55,
    generatedAt: new Date().toISOString(),
  });
});

// -------------------------------------------------------------
// Social Relationships & Psychologist Character Analysis Endpoints
// -------------------------------------------------------------

app.get('/api/social/people', (_req, res) => {
  res.json({ success: true, people: state.personProfiles });
});

app.post('/api/social/people', (req, res) => {
  const { name, relation, keyMemories = [] } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

  const newPerson = {
    id: `pp-${Date.now()}`,
    name,
    relation: relation || 'Sosyal Çevre',
    avatarEmoji: '✨',
    avatarColor: 'from-teal-500 to-indigo-600',
    lastContactDate: new Date().toISOString().slice(0, 10),
    proactiveStatus: 'healthy' as const,
    proactiveNudge: `${name} ile yeni bağ kuruldu; iletişim ve psikolojik uyum analiz ediliyor.`,
    psychologicalAnalysis: {
      archetype: 'Dinamik & Samimi Yaklaşım Arayan',
      attachmentStyle: 'Güvenli (Secure)' as const,
      communicationStyle: 'Açık, saygılı ve içten paylaşımlara yatkın.',
      stressTriggers: ['Önyargılı yaklaşımlar', 'İletişimsizlik'],
      loveLanguage: 'Kaliteli Zaman & Takdir',
      psychologistAdvice: `${name} ile konuşurken samimi ve açık ol. Dinlendiğini ve değer gördüğünü hissettiğinde derin bir dostluk bağı gelişecektir.`,
    },
    keyMemories: keyMemories.length > 0 ? keyMemories : ['İlk temas ve tanışma bağlamı.'],
    recommendedVenues: [
      {
        id: `v-${Date.now()}`,
        name: 'Moda Sahili & Çay Bahçesi',
        district: 'Kadıköy / Moda',
        category: 'nature_walk' as const,
        vibe: 'Deniz esintisi, sakin çimler ve rahat sohbet ortamı',
        addressSnippet: 'Caferağa, Moda Sahili, Kadıköy',
        googleMapsUrl: 'https://maps.google.com/?q=Moda+Sahil+Kadıköy',
        whySuggested: 'Rahat ve kasmayan bir tanışma/sohbet atmosferi sunar.',
      },
    ],
    conversationStarters: [
      `${name} ile iletişim yaklaşımımı bir psikolog gibi analiz et`,
      `${name} ile buluşmak için güzel bir mekan öner`,
    ],
  };

  state.personProfiles.push(newPerson);

  // Auto-record memory
  state.memories.unshift({
    id: `mem-pp-${Date.now()}`,
    type: 'RELATIONSHIP',
    content: `Sosyal çevreye yeni kişi eklendi: ${name} (${relation || 'Yakın çevre'}).`,
    importance: 4,
    confidence: 1.0,
    source: 'user_explicit',
    isUserConfirmed: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  res.json({ success: true, person: newPerson, message: `${name} kişi kartı başarıyla oluşturuldu.` });
});

app.patch('/api/social/people/:id', (req, res) => {
  const person = state.personProfiles.find((p) => p.id === req.params.id);
  if (!person) return res.status(404).json({ success: false, message: 'Person not found' });
  Object.assign(person, req.body);
  res.json({ success: true, person });
});

app.post('/api/social/people/:id/note', (req, res) => {
  const { note } = req.body;
  const person = state.personProfiles.find((p) => p.id === req.params.id);
  if (!person) return res.status(404).json({ success: false, message: 'Person not found' });
  if (!note || !note.trim()) return res.status(400).json({ success: false, message: 'Note is required' });

  person.keyMemories.unshift(note.trim());
  person.lastContactDate = new Date().toISOString().slice(0, 10);

  // Sync to memories
  const newMemory = {
    id: `mem-rel-${Date.now()}`,
    type: 'RELATIONSHIP' as const,
    content: `${person.name} (${person.relation}) hakkında yeni not: "${note.trim()}"`,
    importance: 5,
    confidence: 1.0,
    source: 'user_explicit' as const,
    isUserConfirmed: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.memories.unshift(newMemory);

  res.json({
    success: true,
    person,
    memory: newMemory,
    message: `${person.name} hakkında not kalıcı hafızaya alındı.`,
  });
});

app.get('/api/social/venues', (_req, res) => {
  const allVenues = [
    {
      id: 'v-1',
      name: 'Tarihi Moda İskelesi Kitap Kafe & Teras',
      district: 'Kadıköy / Moda',
      category: 'romantic_dinner' as const,
      vibe: 'Deniz kokusu, tarihi ahşap doku ve sakin gün batımı manzarası',
      addressSnippet: 'Moda Sahil Yolu No:1, Kadıköy',
      googleMapsUrl: 'https://maps.google.com/?q=Tarihi+Moda+İskelesi',
      whySuggested: 'Yürüyüş mesafesinde telefon detoksu ve sakin bir kahve/çay sohbeti için mükemmel.',
    },
    {
      id: 'v-2',
      name: 'Viktor Levi Şarap Evi & Sakin Avlu',
      district: 'Kadıköy / Caferağa',
      category: 'romantic_dinner' as const,
      vibe: 'Sarmaşıklarla kaplı loş tarihi bahçe, mum ışığı ve yumuşak caz müzik',
      addressSnippet: 'Damacı Sk. No:4, Caferağa, Kadıköy',
      googleMapsUrl: 'https://maps.google.com/?q=Viktor+Levi+Kadıköy',
      whySuggested: 'Haftanın yorgunluğunu atmak ve baş başa derin sohbet etmek için en ideal atmosfer.',
    },
    {
      id: 'v-3',
      name: 'Tarihi Çınaraltı Çay Bahçesi',
      district: 'Çengelköy / Üsküdar',
      category: 'cultural' as const,
      vibe: 'Asırlık çınar altında dalga sesleri, taze börek ve demli çay',
      addressSnippet: 'Çengelköy Cd. No:4, Üsküdar',
      googleMapsUrl: 'https://maps.google.com/?q=Tarihi+Çınaraltı+Çengelköy',
      whySuggested: 'Annenle huzurlu bir nostalji günü yaşamak için eşsiz bir Boğaz ortamı.',
    },
    {
      id: 'v-4',
      name: 'Petra Roasting Co. Maslak',
      district: 'Sarıyer / Maslak',
      category: 'coffee_work' as const,
      vibe: 'Yüksek tavan, endüstriyel şık tasarım ve üst düzey espresso',
      addressSnippet: 'Ahi Evran Cd. No:11, Maslak',
      googleMapsUrl: 'https://maps.google.com/?q=Petra+Maslak',
      whySuggested: 'İş çıkışı 45 dakikalık strateji değerlendirmesi için ideal.',
    },
    {
      id: 'v-5',
      name: 'Belgrad Ormanı Neşet Suyu Yürüyüş Parkuru',
      district: 'Sarıyer / Bahçeköy',
      category: 'nature_walk' as const,
      vibe: 'Gürgen ve meşe ağaçları arasında 6 km yumuşak toprak parkur, gölet ve kuş sesleri',
      addressSnippet: 'Kemer Mah., Bahçeköy, Sarıyer',
      googleMapsUrl: 'https://maps.google.com/?q=Neşet+Suyu+Belgrad+Ormanı',
      whySuggested: 'Hafta sonu doğa detoksu ve zihinsel deşarj yürüyüşü için 1 numara.',
    },
  ];
  res.json({ success: true, venues: allVenues });
});

// -------------------------------------------------------------
// Wellness & Gentle Weight Guidance Endpoint
// -------------------------------------------------------------

function computeCycleDetails(lastPeriodDate: string, cycleLengthDays = 28, periodLengthDays = 5) {
  const lastDate = new Date(lastPeriodDate);
  const today = new Date('2026-09-24');
  const diffDays = Math.max(0, Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)));
  const dayOfCycle = (diffDays % cycleLengthDays) + 1;

  let currentPhase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' = 'follicular';
  let phaseAdvice = {
    energyLevel: 'Yüksek & Dinamik (Östrojen yükselişi)',
    workoutSuggestion: 'Kuvvet antrenmanları, yeni projelere başlama ve tempolu kardiyo için harika zaman.',
    nutritionSuggestion: 'Kompleks karbonhidratlar, taze yeşillikler ve fermente gıdalar.',
    mentalFocus: 'Yaratıcılık, dil öğrenimi ve stratejik kararlar için zihnin en berrak olduğu evre.',
  };

  if (dayOfCycle <= periodLengthDays) {
    currentPhase = 'menstrual';
    phaseAdvice = {
      energyLevel: 'İçe Dönük & Düşük Enerji',
      workoutSuggestion: 'Yin yoga, hafif esneme ve sakin yürüyüşler. Ağır ağırlıklardan kaçın.',
      nutritionSuggestion: 'Demir, magnezyum zengini çorbalar, kuru meyveler ve sıcak bitki çayları.',
      mentalFocus: 'Dinlenme, geçmiş ayı gözden geçirme ve zihinsel detoks.',
    };
  } else if (dayOfCycle >= 13 && dayOfCycle <= 16) {
    currentPhase = 'ovulatory';
    phaseAdvice = {
      energyLevel: 'Zirve Enerji & Yüksek Motivasyon',
      workoutSuggestion: 'HIIT, tempolu koşu ve kişisel rekor denemeleri.',
      nutritionSuggestion: 'Bol lifli sebzeler, hafif proteinler ve antioksidan meyveler.',
      mentalFocus: 'Sosyal iletişim, zorlu sunumlar ve ikna kabiliyeti zirvede.',
    };
  } else if (dayOfCycle > 16) {
    currentPhase = 'luteal';
    phaseAdvice = {
      energyLevel: 'Kademeli Düşüş & Hassasiyet',
      workoutSuggestion: 'Pilates, orta tempolu yürüyüşler ve vücut ağırlığı egzersizleri.',
      nutritionSuggestion: 'B vitamini, magnezyum, sağlıklı yağlar (avokado, badem) - tatlı krizini dengeler.',
      mentalFocus: 'Detaylı analiz, organizasyon ve yarım kalan işleri toparlama.',
    };
  }

  const nextPeriodDateObj = new Date(lastDate.getTime() + cycleLengthDays * 24 * 60 * 60 * 1000);
  const nextPeriodExpectedDate = nextPeriodDateObj.toISOString().split('T')[0];

  return { dayOfCycle, currentPhase, phaseAdvice, nextPeriodExpectedDate };
}

app.post('/api/cycle/update', (req, res) => {
  const { isEnabled, lastPeriodDate, cycleLengthDays = 28, periodLengthDays = 5 } = req.body;

  if (typeof isEnabled === 'boolean') {
    state.profile.cycleTracking.isEnabled = isEnabled;
  }
  if (lastPeriodDate) {
    state.profile.cycleTracking.lastPeriodDate = lastPeriodDate;
  }
  state.profile.cycleTracking.cycleLengthDays = Number(cycleLengthDays);
  state.profile.cycleTracking.periodLengthDays = Number(periodLengthDays);

  const computed = computeCycleDetails(
    state.profile.cycleTracking.lastPeriodDate,
    state.profile.cycleTracking.cycleLengthDays,
    state.profile.cycleTracking.periodLengthDays
  );

  state.profile.cycleTracking.dayOfCycle = computed.dayOfCycle;
  state.profile.cycleTracking.currentPhase = computed.currentPhase;
  state.profile.cycleTracking.phaseAdvice = computed.phaseAdvice;
  state.profile.cycleTracking.nextPeriodExpectedDate = computed.nextPeriodExpectedDate;

  res.json({
    success: true,
    cycleTracking: state.profile.cycleTracking,
    message: 'Döngü takibi güncellendi.',
  });
});

app.post('/api/mentorship/check-in', (req, res) => {
  const { goalId = 'ltg-1' } = req.body;
  const goal = state.profile.longTermGoals.find((g) => g.id === goalId) || state.profile.longTermGoals[0];

  let mentorshipMessage = '';
  if (goal.category === 'language') {
    mentorshipMessage = `Sevgili ${state.profile.name}, dil öğrenmek bir sprint değil, zihinsel bir yürüyüştür. Şu an foliküler evrendesin; zihnin yeni kavramları bağlamlandırmaya en açık olduğu dönemde. Bu hafta her gün saatlerce çalışmak yerine, mesaiye giderken 15 dakikalık 3 İngilizce podcast dinleme seansı koyalım mı? Küçük damlalar gölü oluşturur.`;
  } else if (goal.category === 'finance') {
    mentorshipMessage = `Sevgili ${state.profile.name}, finansal özgürlük gelecekteki 'sen'e duyduğun saygının bir göstergesidir. Bu ayki tasarruf oranın %24 seviyesinde. Zihnini yormadan otomatik yatırım emrini günün akışına bağlayalım mı?`;
  } else {
    mentorshipMessage = `Büyük hedefler ancak bugünün küçük adımlarıyla nefes alır. Kendini asla aceleye getirme; bilgece, istikrarlı bir tempoyla ilerliyoruz.`;
  }

  res.json({
    success: true,
    goal,
    mentorshipMessage,
    suggestedAction: {
      title: goal.category === 'language' ? 'İngilizce Dinleme & Konuşma Pratiği' : 'Haftalık Finans & Hedef Değerlendirmesi',
      preferredTime: '17:30',
      durationMinutes: 15,
      category: 'learning',
    },
  });
});

app.post('/api/mentorship/accept-plan', (req, res) => {
  const { goalId = 'ltg-1', title = 'İngilizce Dinleme & Konuşma Pratiği', preferredTime = '17:30' } = req.body;

  const newTask = {
    id: `tsk-mentor-${Date.now()}`,
    title,
    description: 'AYZEK Yaşam Koçu rehberliğinde uzun vadeli gelişim mikro-adımı.',
    scheduledDate: '2026-09-24',
    preferredTime,
    durationMinutes: 15,
    priority: 'medium' as const,
    category: 'learning' as const,
    contextTrigger: 'mentor_checkin',
    status: 'pending' as const,
    createdBy: 'ai_assistant' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  state.tasks.push(newTask);

  res.json({
    success: true,
    task: newTask,
    message: `"${title}" görevi günün planına başarıyla eklendi.`,
  });
});

app.patch('/api/goals/long-term/:id', (req, res) => {
  const goal = state.profile.longTermGoals.find((g) => g.id === req.params.id);
  if (!goal) {
    return res.status(404).json({ success: false, message: 'Goal not found' });
  }
  Object.assign(goal, req.body, { lastCheckedInDate: new Date().toISOString().slice(0, 10) });
  res.json({
    success: true,
    goal,
    profile: state.profile,
    message: `"${goal.title}" hedefi güncellendi.`,
  });
});

app.post('/api/goals/long-term', (req, res) => {
  const newGoal = {
    id: `ltg-${Date.now()}`,
    title: req.body.title || 'Yeni Uzun Vadeli Hedef',
    category: req.body.category || 'personal',
    targetHorizon: req.body.targetHorizon || '6 Ay',
    whyItMatters: req.body.whyItMatters || 'Kişisel gelişim ve vizyon adımı.',
    currentProgress: Number(req.body.currentProgress) || 0,
    mentorWeeklyCheckIn: req.body.mentorWeeklyCheckIn || 'Bu hafta bu hedef için 15 dakikalık bir adım atalım mı?',
    suggestedMicroHabit: req.body.suggestedMicroHabit || 'Günde 15 dk pratik veya okuma.',
    lastCheckedInDate: new Date().toISOString().slice(0, 10),
  };
  state.profile.longTermGoals.push(newGoal);
  res.json({
    success: true,
    goal: newGoal,
    profile: state.profile,
    message: `"${newGoal.title}" hedefi profile eklendi.`,
  });
});

app.post('/api/wellness/personalize-plan', (req, res) => {
  const wellnessPlan = {
    philosophy: 'Katı ve suçlayıcı diyetler yerine günlük rutine yedirilen mikroyürüyüş ve hafif beslenme.',
    dailyMicroHabits: [
      { title: 'Mesai Sonrası 20 Dk Tempolu Yürüyüş', context: '18:00 iş çıkışı metroya yürüme', category: 'fitness' },
      { title: 'Günde 2 Litre Su Takibi (Masa başı hatırlatması)', category: 'wellness' },
      { title: 'Akşam 20:00 Sonrası Ağır Atıştırmalık Kesimi', category: 'wellness' },
    ],
    encouragementMessage: 'Unutma: Hedef mükemmel olmak değil, günlük rutinini seni yormadan sürdürmektir. AYZEK seni asla suçlamaz, gününe uyarlar.',
  };

  res.json({ success: true, wellnessPlan });
});

// -------------------------------------------------------------
// Daily Mood & Wellness Reflection Endpoints (Memory Synchronized)
// -------------------------------------------------------------

app.post('/api/mood/check-in', (req, res) => {
  const { energyLevel = 'moderate', moodFeeling = 'peaceful', focusLevel = 'balanced', note = '' } = req.body;

  const energyLabels: Record<string, string> = { low: 'düşük', moderate: 'dengeli', high: 'yüksek' };
  const feelingLabels: Record<string, string> = {
    peaceful: 'dingin & huzurlu',
    happy: 'neşeli & pozitif',
    inspired: 'ilham dolu',
    tired: 'yorgun',
    stressed: 'kaygılı / telaşlı',
  };
  const focusLabels: Record<string, string> = {
    scattered: 'dağınık',
    balanced: 'dengeli',
    deep: 'derin odak',
  };

  let coachRecommendation = '';
  if (energyLevel === 'low') {
    coachRecommendation = 'Bugün bedeninin dinginlik ihtiyacına saygı duyalım. Ağır iş ve yoğun antrenmanlar yerine sakin bir nefes yürüyüşü ve akşam 20:00 sonrası ekran detoksu sana çok iyi gelecektir. Kendine şefkat göster.';
  } else if (energyLevel === 'high' && focusLevel === 'deep') {
    coachRecommendation = 'Harika bir ivme! Zihnin en keskin halinde. C1 İngilizce pratiğini ve günün en kritik stratejik görevini bu dilimde tamamlamak harika hissettirecektir.';
  } else if (moodFeeling === 'stressed' || moodFeeling === 'tired') {
    coachRecommendation = 'Günün telaşında bir an dur ve derin bir nefes al. Bugün her şeyi aynı anda çözmek zorunda değilsin; sadece en önemli tek konuya odaklanalım, gerisini ben senin için optimize edip kaydırırım.';
  } else if (moodFeeling === 'inspired') {
    coachRecommendation = 'Zihnindeki bu ilham verici titreşim yeni fikirler ve uzun vadeli hedefler için harika bir yakıt. Bu enerjiyi yaratıcı vizyonuna yönlendir.';
  } else {
    coachRecommendation = 'Dengeli ve dingin bir gün akışı. Rutinlerini telaşsızca sürdür; günün her adımında senin yanındayım.';
  }

  const newDailyMood = {
    id: `mood-${Date.now()}`,
    date: '2026-09-24',
    energyLevel,
    moodFeeling,
    focusLevel,
    note: note ? note.trim() : undefined,
    coachRecommendation,
    createdAt: new Date().toISOString(),
  };

  state.profile.dailyMood = newDailyMood;

  // Persist into user memories for proactive recommendations and long term context
  const memoryContent = `Kullanıcı bugün (24 Eylül) kendini ${energyLabels[energyLevel] || energyLevel} enerjide, ${feelingLabels[moodFeeling] || moodFeeling} ve ${focusLabels[focusLevel] || focusLevel} odaklanmış hissediyor.${note ? ` Not: "${note.trim()}"` : ''} AYZEK günün akışını bu moda göre uyarladı.`;

  // Check if today's mood memory already exists, update or create
  const existingMemIndex = state.memories.findIndex((m) => m.type === 'WELLNESS' && m.content.includes('Kullanıcı bugün (24 Eylül) kendini'));
  let savedMemory: any;
  if (existingMemIndex !== -1) {
    state.memories[existingMemIndex].content = memoryContent;
    state.memories[existingMemIndex].updatedAt = new Date().toISOString();
    savedMemory = state.memories[existingMemIndex];
  } else {
    savedMemory = {
      id: `mem-mood-${Date.now()}`,
      type: 'WELLNESS' as const,
      content: memoryContent,
      importance: 5,
      confidence: 1.0,
      source: 'user_explicit' as const,
      isUserConfirmed: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.memories.unshift(savedMemory);
  }

  res.json({
    success: true,
    dailyMood: newDailyMood,
    memory: savedMemory,
    profile: state.profile,
    message: 'Bugünkü modun hafızaya kaydedildi ve yaşam koçu önerisi güncellendi.',
  });
});

app.post('/api/mood/optimize-plan', (req, res) => {
  const mood = state.profile.dailyMood;
  if (!mood) {
    return res.json({ success: true, plan: synthesizeDailyPlan(), message: 'Plan güncel.' });
  }

  if (mood.energyLevel === 'low') {
    const heavyTask = state.tasks.find((t) => t.category === 'health' && t.status === 'pending');
    if (heavyTask) {
      heavyTask.title = 'Hafif Tempoda 20 Dk Nefes Yürüyüşü (Düşük Enerjiye Nazik Uyarlama)';
      heavyTask.durationMinutes = 20;
    }
  } else if (mood.energyLevel === 'high') {
    const learningTask = state.tasks.find((t) => t.category === 'learning' && t.status === 'pending');
    if (learningTask) {
      learningTask.priority = 'high';
      learningTask.preferredTime = '16:30';
    }
  }

  const updatedPlan = synthesizeDailyPlan();
  res.json({
    success: true,
    plan: updatedPlan,
    message: `Günün planı "${mood.energyLevel === 'low' ? 'Düşük' : mood.energyLevel === 'high' ? 'Yüksek' : 'Dengeli'}" enerji seviyene ve ruh haline göre optimize edildi.`,
  });
});

// -------------------------------------------------------------
// Interactive Onboarding & Life Synchronization Endpoint
// -------------------------------------------------------------

app.post('/api/onboarding/sync', (req, res) => {
  const {
    name,
    gender,
    wakeTime,
    sleepTime,
    workStartTime,
    workEndTime,
    wellnessGoal,
    partnerName,
    partnerWishes,
    notificationStyle,
    isCycleEnabled,
    lastPeriodDate,
    cycleLengthDays,
  } = req.body;

  if (name) state.profile.name = name;
  if (gender) state.profile.gender = gender;
  if (wakeTime) state.profile.wakeTime = wakeTime;
  if (sleepTime) state.profile.sleepTime = sleepTime;
  if (workStartTime) state.profile.workStartTime = workStartTime;
  if (workEndTime) state.profile.workEndTime = workEndTime;
  if (notificationStyle) state.profile.notificationFrequency = notificationStyle;

  // Auto-enable menstrual cycle tracking if female or user requested
  if (gender === 'female' || isCycleEnabled) {
    state.profile.cycleTracking.isEnabled = true;
    if (lastPeriodDate) state.profile.cycleTracking.lastPeriodDate = lastPeriodDate;
    if (cycleLengthDays) state.profile.cycleTracking.cycleLengthDays = Number(cycleLengthDays);
    const computed = computeCycleDetails(
      state.profile.cycleTracking.lastPeriodDate,
      state.profile.cycleTracking.cycleLengthDays,
      state.profile.cycleTracking.periodLengthDays
    );
    state.profile.cycleTracking.dayOfCycle = computed.dayOfCycle;
    state.profile.cycleTracking.currentPhase = computed.currentPhase;
    state.profile.cycleTracking.phaseAdvice = computed.phaseAdvice;
    state.profile.cycleTracking.nextPeriodExpectedDate = computed.nextPeriodExpectedDate;

    state.memories.push({
      id: `mem-onboard-cycle-${Date.now()}`,
      type: 'CYCLE_HORMONAL',
      content: `Biyolojik ritim ve döngü takibi aktif. Mevcut evre: ${computed.currentPhase.toUpperCase()} (${computed.dayOfCycle}. gün). Egzersiz ve beslenme tavsiyeleri buna göre optimize edilecek.`,
      importance: 5,
      confidence: 1.0,
      source: 'user_explicit',
      isUserConfirmed: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } else if (gender === 'male') {
    state.profile.cycleTracking.isEnabled = false;
  }

  // Add derived onboarding memories
  if (wellnessGoal) {
    state.memories.push({
      id: `mem-onboard-well-${Date.now()}`,
      type: 'WELLNESS',
      content: `Kullanıcı şu hedefi benimsedi: ${wellnessGoal}. Suçlayıcı olmayan, nazik adımlı takip istiyor.`,
      importance: 5,
      confidence: 0.98,
      source: 'conversation',
      isUserConfirmed: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  if (partnerName) {
    state.memories.push({
      id: `mem-onboard-rel-${Date.now()}`,
      type: 'RELATIONSHIP',
      content: `Hayatındaki önemli kişi: ${partnerName}. Hassasiyet ve beklentileri: ${partnerWishes || 'Kaliteli ortak zaman ve sürprizler.'}`,
      importance: 5,
      confidence: 0.98,
      source: 'conversation',
      isUserConfirmed: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  res.json({
    success: true,
    profile: state.profile,
    message: 'AYZEK yaşam senkronizasyonu tamamlandı. Tüm rutin ve bağlamlar hafızaya işlendi.',
  });
});

app.post('/api/onboarding/fast-start', (req, res) => {
  const {
    name = 'Görkem',
    profession = 'Girişimci & Ürün Yöneticisi',
    gender = 'female',
    wakeTime = '07:30',
    sleepTime = '23:30',
    workStartTime = '09:00',
    workEndTime = '18:00',
    homeDistrict = 'Kadıköy / Moda',
    workplace = 'Levent - Maslak Teknoloji Hattı',
    clothingStyle = 'Smart-casual keten gömlek, rahat sneaker ve minimalist stil',
    partnerName = 'Zeynep',
    partnerRelation = 'Eş / Hayat Partneri',
    partnerNotes = 'Yoğun mesailerde kaliteli ortak zaman arar, nostaljik mekanları ve doğayı sever',
    wellnessGoal = 'İş çıkışı yürüyüşle dinç kalmak & masa başı hareketsizliği kırmak',
    isCycleEnabled = false,
    lastPeriodDate = '2026-09-17',
    cycleLengthDays = 28,
  } = req.body;

  // 1. Update Core Profile
  state.profile.name = name;
  state.profile.gender = gender;
  state.profile.wakeTime = wakeTime;
  state.profile.sleepTime = sleepTime;
  state.profile.workStartTime = workStartTime;
  state.profile.workEndTime = workEndTime;
  state.profile.primaryGoal = wellnessGoal;
  state.profile.locationContext.home = homeDistrict;
  state.profile.locationContext.work = workplace;

  state.profile.personalDetails = {
    homeDistrict,
    workplace,
    clothingStyle,
    favoriteWeatherOutfit: `Ilık havada nefes alan keten gömlek ve rahat sneaker`,
    familyOverview: `${partnerName} (${partnerRelation}), Aile ve yakın dostlar`,
    closestPeople: [partnerName, 'Annem', 'İş Ekibi'].filter(Boolean),
  };

  // Cycle tracking
  if (gender === 'female' || isCycleEnabled) {
    state.profile.cycleTracking.isEnabled = true;
    state.profile.cycleTracking.lastPeriodDate = lastPeriodDate;
    state.profile.cycleTracking.cycleLengthDays = Number(cycleLengthDays) || 28;
    const computed = computeCycleDetails(
      state.profile.cycleTracking.lastPeriodDate,
      state.profile.cycleTracking.cycleLengthDays,
      state.profile.cycleTracking.periodLengthDays
    );
    state.profile.cycleTracking.dayOfCycle = computed.dayOfCycle;
    state.profile.cycleTracking.currentPhase = computed.currentPhase;
    state.profile.cycleTracking.phaseAdvice = computed.phaseAdvice;
    state.profile.cycleTracking.nextPeriodExpectedDate = computed.nextPeriodExpectedDate;
  } else {
    state.profile.cycleTracking.isEnabled = false;
  }

  // 2. Seed Fresh Tailored Memories
  state.memories = [
    {
      id: `mem-usr-${Date.now()}-1`,
      type: 'IDENTITY',
      content: `Kullanıcı Adı: ${name}. Meslek & Odak: ${profession}. Uyanış: ${wakeTime}, İş: ${workStartTime}-${workEndTime}, Uyku: ${sleepTime}.`,
      importance: 5,
      confidence: 1.0,
      source: 'user_explicit',
      isUserConfirmed: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `mem-usr-${Date.now()}-2`,
      type: 'LOCATION',
      content: `Ev Bölgesi: ${homeDistrict}. İşyeri / Çalışma Alanı: ${workplace}.`,
      importance: 5,
      confidence: 1.0,
      source: 'user_explicit',
      isUserConfirmed: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `mem-usr-${Date.now()}-3`,
      type: 'OUTFIT_STYLE',
      content: `Giyim & Stil Tercihi: ${clothingStyle}.`,
      importance: 4,
      confidence: 0.95,
      source: 'user_explicit',
      isUserConfirmed: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `mem-usr-${Date.now()}-4`,
      type: 'WELLNESS',
      content: `Sağlık & Yaşam Hedefi: ${wellnessGoal}. Nazik, sürdürülebilir mikro alışkanlıklar bekleniyor.`,
      importance: 5,
      confidence: 1.0,
      source: 'user_explicit',
      isUserConfirmed: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `mem-usr-${Date.now()}-5`,
      type: 'RELATIONSHIP',
      content: `${partnerName} (${partnerRelation}): ${partnerNotes}.`,
      importance: 5,
      confidence: 1.0,
      source: 'user_explicit',
      isUserConfirmed: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // 3. Seed Fresh Tailored Tasks
  state.tasks = [
    {
      id: `tsk-fresh-1`,
      title: `${profession} · Günün Önceliklerini Belirle`,
      description: 'Günün en kritik 2 stratejik işine odaklanma.',
      scheduledDate: '2026-09-24',
      preferredTime: workStartTime,
      durationMinutes: 45,
      priority: 'high',
      category: 'work',
      status: 'pending',
      createdBy: 'ai_assistant',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `tsk-fresh-2`,
      title: 'İş Çıkışı 20 Dk Dinlendirici Yürüyüş',
      description: `${homeDistrict} hattında zihinsel detoks ve günün kortizolünü düşürme.`,
      scheduledDate: '2026-09-24',
      preferredTime: workEndTime,
      durationMinutes: 20,
      priority: 'medium',
      category: 'health',
      contextTrigger: 'work_commute',
      status: 'pending',
      createdBy: 'ai_assistant',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `tsk-fresh-3`,
      title: `${partnerName} İle Kaliteli Telefon Detokslu Akşam Sohbeti`,
      description: partnerNotes,
      scheduledDate: '2026-09-24',
      preferredTime: '20:15',
      durationMinutes: 45,
      priority: 'high',
      category: 'personal',
      status: 'pending',
      createdBy: 'ai_assistant',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // 4. Update Partner Profile in personProfiles
  if (partnerName) {
    state.personProfiles = [
      {
        id: `pp-partner-${Date.now()}`,
        name: partnerName,
        relation: partnerRelation,
        avatarEmoji: '🌸',
        avatarColor: 'from-rose-500 to-pink-600',
        lastContactDate: 'Bugün',
        proactiveStatus: 'needs_attention',
        proactiveNudge: `${partnerName} ile iş sonrası telefon detokslu sakin bir kahve veya akşam yürüyüşü öneriliyor.`,
        psychologicalAnalysis: {
          archetype: 'Duygusal Güvence & Kaliteli Zaman Arayan',
          attachmentStyle: 'Güvenli (Secure)',
          communicationStyle: 'Göz teması ve dinlenilmek ister.',
          stressTriggers: ['Aceleye getirilmek', 'Sürekli ekranla meşgul olunması'],
          loveLanguage: 'Kaliteli Zaman',
          psychologistAdvice: `${partnerName} ile konuşurken günün yorgunluğunu kapıda bırakıp göz teması kurmak aranızdaki bağı güçlendirir.`,
        },
        keyMemories: [partnerNotes],
        recommendedVenues: [
          {
            id: 'v-fresh-1',
            name: 'Tarihi Moda İskelesi Kitap Kafe',
            district: homeDistrict,
            category: 'romantic_dinner',
            vibe: 'Deniz kokusu, sakin ahşap doku ve gün batımı',
            addressSnippet: `${homeDistrict} Sahil Yolu`,
            googleMapsUrl: 'https://maps.google.com/?q=Moda+İskelesi',
            whySuggested: 'Telefon detoksu ve baş başa dinlendirici sohbet için mükemmel.',
          },
        ],
        conversationStarters: [
          `${partnerName} için akşam buluşması planla`,
          `${partnerName}'e gönderebileceğim nazik bir mesaj öner`,
        ],
      },
    ];
  }

  // 5. Create Tailored Initial Message in Chat
  const welcomeMsg = {
    id: `msg-welcome-${Date.now()}`,
    sender: 'ayzek' as const,
    text: `Merhaba ${name}! Hayatının yeni işletim sistemine hoş geldin. ✨\n\nSenin için tüm ritmi kurdum:\n• **Çalışma Saatlerin:** ${workStartTime} - ${workEndTime} arası (${profession})\n• **Yaşam Hattın:** ${homeDistrict} & ${workplace}\n• **Kişisel Hedefin:** ${wellnessGoal}\n• **Önemli İnsan:** ${partnerName} (${partnerRelation})\n\nBugünkü dinamik planını hazırladım; gün içinde gecikmeler yaşanırsa saatleri otomatik esneteceğim. Şimdi bana dilediğini sorabilir veya *"Saat 15:00'e toplantı ekle"*, *"WhatsApp'ta ne konuşuldu?"*, *"Zeynep ile akşam için mekan öner"* diyebilirsin.`,
    timestamp: new Date().toISOString(),
    suggestions: [
      'Bugünkü planımı özetle',
      `Saat 15:00'e ${profession} toplantısı ekle`,
      'WhatsApp entegrasyonunda ne var?',
      'Akşam için bana sakin bir mekan öner',
    ],
  };

  state.conversationHistory = [welcomeMsg];
  saveStoreToDisk();

  res.json({
    success: true,
    profile: state.profile,
    tasks: state.tasks,
    plan: synthesizeDailyPlan(),
    memories: state.memories,
    message: welcomeMsg,
  });
});

// Notifications & Proactive Engine
app.get('/api/notifications', (_req, res) => {
  res.json({ success: true, notifications: state.notifications });
});

app.patch('/api/notifications/:id', (req, res) => {
  const notif = state.notifications.find((n) => n.id === req.params.id);
  if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });
  Object.assign(notif, req.body);
  res.json({ success: true, notification: notif });
});

// Scenario trigger simulator for testing the Proactive AI Engine
app.post('/api/proactive/trigger-scenario', (req, res) => {
  const { scenario } = req.body;
  let newNotif: any = null;

  if (scenario === 'work_commute_1745') {
    newNotif = {
      id: `notif-${Date.now()}`,
      title: 'İşten Çıkış & Market',
      body: 'İşten çıkmana 15 dakika kaldı. Eve gitmeden markete uğrayacaktın. Süt, yumurta ve kahve listesindeydi. 🛒',
      priority: 'high',
      category: 'contextual',
      actionType: 'confirm_task',
      actionPayload: { taskId: 'tsk-3' },
      status: 'unread',
      createdAt: new Date().toISOString(),
      triggerContext: 'work_end_minus_15m',
    };
  } else if (scenario === 'meeting_ran_long') {
    newNotif = {
      id: `notif-${Date.now()}`,
      title: 'Plan Güncelleme Önerisi',
      body: 'Toplantın 45 dakika uzadı. Akşamki spor antrenmanını 20:00’ye kaydırmamı ister misin?',
      priority: 'high',
      category: 'schedule_change',
      actionType: 'reschedule',
      actionPayload: { delayedMinutes: 45 },
      status: 'unread',
      createdAt: new Date().toISOString(),
      triggerContext: 'calendar_delay_detected',
    };
  } else if (scenario === 'special_date_mom') {
    newNotif = {
      id: `notif-${Date.now()}`,
      title: 'Özel Gün Yaklaşıyor',
      body: 'Cuma günü annenin doğum günü. Geçen hafta hediye olarak keten albüm bakacağını söylemiştin. Sipariş verelim mi? 🎁',
      priority: 'high',
      category: 'special_date',
      actionType: 'open_plan',
      status: 'unread',
      createdAt: new Date().toISOString(),
      triggerContext: 'anniversary_within_4_days',
    };
  } else if (scenario === 'vehicle_inspection') {
    newNotif = {
      id: `notif-${Date.now()}`,
      title: 'Araç Hatırlatması',
      body: '34 AY 2024 plakalı BMW aracının muayenesine 22 gün kaldı. TÜVTÜRK randevusu oluşturmamı ister misin?',
      priority: 'medium',
      category: 'vehicle',
      actionType: 'open_plan',
      status: 'unread',
      createdAt: new Date().toISOString(),
      triggerContext: 'vehicle_inspection_30days',
    };
  } else if (scenario === 'habit_checkin') {
    newNotif = {
      id: `notif-${Date.now()}`,
      title: 'Nazik Alışkanlık Hatırlatması',
      body: 'Salı akşamları spor aksamış görünüyor. Seni zorlamayacak şekilde Çarşamba gününe planlayalım mı?',
      priority: 'medium',
      category: 'wellness',
      actionType: 'reschedule',
      status: 'unread',
      createdAt: new Date().toISOString(),
      triggerContext: 'habit_missed_pattern',
    };
  } else {
    newNotif = {
      id: `notif-${Date.now()}`,
      title: 'Gün Ortası Kontrolü',
      body: 'Bugün odaklanman gereken ana görevleri büyük ölçüde tamamladın. Harika gidiyorsun! ✨',
      priority: 'low',
      category: 'wellness',
      status: 'unread',
      createdAt: new Date().toISOString(),
    };
  }

  state.notifications.unshift(newNotif);
  res.json({ success: true, notification: newNotif, message: 'Proactive trigger simulated.' });
});

// Proactive decision pipeline runner
app.post('/api/proactive/evaluate', (req, res) => {
  const { simulatedTime = '17:45' } = req.body;
  const evaluationResult: any[] = [];

  // Check work commute offset
  const [workH, workM] = state.profile.workEndTime.split(':').map(Number);
  const workMins = workH * 60 + workM;
  const [simH, simM] = simulatedTime.split(':').map(Number);
  const currentMins = simH * 60 + simM;

  if (Math.abs(workMins - currentMins - 15) <= 5) {
    const shoppingTask = state.tasks.find((t) => t.contextTrigger === 'work_commute' && t.status === 'pending');
    if (shoppingTask) {
      const priorityCalc = calculateNotificationPriority({
        urgency: 4,
        importance: 4,
        relevance: 5,
        userPrefFrequency: state.profile.notificationFrequency,
        recentNotificationCountInLast2Hours: 1,
      });

      evaluationResult.push({
        type: 'work_commute_shopping',
        title: 'İşten Çıkış & Alışveriş',
        text: `İşten çıkmana 15 dakika kaldı. Eve gitmeden markete uğrayacaktın. ${shoppingTask.title}. 🛒`,
        priority: priorityCalc.level,
        score: priorityCalc.score,
        shouldSend: priorityCalc.shouldSend,
      });
    }
  }

  // Check upcoming payments due tomorrow
  const upcomingPayments = state.payments.filter((p) => !p.isPaid);
  if (upcomingPayments.length > 0) {
    const p = upcomingPayments[0];
    evaluationResult.push({
      type: 'payment_due_soon',
      title: 'Ödeme Hatırlatması',
      text: `${p.title} (${p.amount} ${p.currency}) için son ödeme tarihi yaklaşıyor.`,
      priority: 'high',
      score: 11.2,
      shouldSend: true,
    });
  }

  res.json({
    success: true,
    simulatedTime,
    candidates: evaluationResult,
    userFrequencySetting: state.profile.notificationFrequency,
  });
});

// -------------------------------------------------------------
// AI Chat Conversation Engine
// -------------------------------------------------------------

app.post('/api/chat', async (req, res) => {
  const { message, clientHistory = [] } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ success: false, error: 'Message is required' });
  }

  // Store user message
  const userMsg = {
    id: `msg-${Date.now()}`,
    sender: 'user' as const,
    text: message,
    timestamp: new Date().toISOString(),
  };
  state.conversationHistory.push(userMsg);

  // Assemble Context from Structured Memory & Active Plan
  const activeMemories = state.memories
    .filter((m) => m.isActive)
    .map((m) => `[${m.type}] ${m.content} (Önem: ${m.importance}/5)`)
    .join('\n');

  const pendingTasks = state.tasks
    .filter((t) => t.status === 'pending')
    .map((t) => `- [${t.preferredTime || 'Saat yok'}] ${t.title} (${t.category}, Öncelik: ${t.priority})`)
    .join('\n');

  const profileSummary = `Kullanıcı Adı: ${state.profile.name}
Uyanış: ${state.profile.wakeTime} | İş: ${state.profile.workStartTime} - ${state.profile.workEndTime} | Uyku: ${state.profile.sleepTime}
İletişim Tarzı: ${state.profile.communicationStyle}
Ana Hedef: ${state.profile.primaryGoal}
Ev Konumu: ${state.profile.personalDetails?.homeDistrict || state.profile.locationContext.home}
İşyeri: ${state.profile.personalDetails?.workplace || state.profile.locationContext.work}
Giyim & Stil Tercihi: ${state.profile.personalDetails?.clothingStyle} (Hava durumuna göre: ${state.profile.personalDetails?.favoriteWeatherOutfit})
Aile & Sosyal Çevre: ${state.profile.personalDetails?.familyOverview}
Yakın İletişimde Olduğu Kişiler: ${state.profile.personalDetails?.closestPeople?.join(', ')}
Günlük Mod Özeti: ${state.profile.dailyMood ? `Enerji: ${state.profile.dailyMood.energyLevel}, Duygu: ${state.profile.dailyMood.moodFeeling}, Odak: ${state.profile.dailyMood.focusLevel} - Koç Tavsiyesi: ${state.profile.dailyMood.coachRecommendation}` : 'Henüz bugün girilmedi'}
Biyolojik Ritim & Döngü: ${state.profile.cycleTracking?.isEnabled ? `${state.profile.cycleTracking.currentPhase.toUpperCase()} evresi (${state.profile.cycleTracking.dayOfCycle}. gün) - ${state.profile.cycleTracking.phaseAdvice.workoutSuggestion}` : 'Devre dışı'}`;

  const systemInstruction = `Sen AYZEK'sin. Kullanıcının Kişisel Yaşam Asistanı, Zihinsel Sırdaşı ve Yaşam İşletim Sistemi'sin (Personal Life AI OS).
Temel Felsefe: "Hayatını sen yaşa. Gerisini AYZEK'e bırak."
Temel His: "AYZEK beni tanıyor, hatırlıyor ve doğru zamanda yanımda."

DÖRT TEMEL KİMLİĞİN & ROLLERİN (Chat tarafında mutlaka bu 4 rolü bilgece harmanla):
1. BİR PSİKOLOG GİBİ: Derin duygusal anlayış, şefkatli dinleme, bağlanma dinamiklerini (güvenli/kaygılı/kaçıngan) anlama, stres tetikleyicilerini yatıştırma, asla suçlamama. Sosyal çevresindeki kişilerle (Zeynep, Annem, Murat, Can) ilgili konuşurken bir psikolog gibi karakter analizini yap, ilişki dinamiğini açıkla ve proaktif yönlendirme yap.
2. BİR YAŞAM KOÇU GİBİ: Kullanıcıya net yön göster, uzun vadeli hedeflerini (akıcı İngilizce, kariyer, finansal özgürlük) mikro adımlara bölerek hayatını kolaylaştır, ertelemeyi kır.
3. BİR SPOR & BEDEN HOCASI GİBİ: Kullanıcının enerjisine, biyolojik ritmine ve hormonal döngüsüne göre bedenini dinç tutacak hareket, hafif yürüyüş ve postür önerilerinde bulun.
4. BİR YAKIN DOST GİBİ: Samimi, sıcak, esprili, yargısız, kullanıcının hayatını kolaylaştıran, "senin yanındayım" hissi veren candan bir sırdaş.

KULLANICI BİLGİLERİ & KİŞİSEL DETAYLAR:
${profileSummary}

KULLANICI HAKKINDA BİLİNEN KALICI HAFIZALAR (Memory Context):
${activeMemories}

BUGÜNKÜ BEKLEYEN GÖREVLER:
${pendingTasks}

ÖZEL GÖREVLER & DAVRANIŞ KURALLARI:
- KALICI HAFIZA & GEÇMİŞTEN DESTEK: Kullanıcının söylediği önemli bilgileri (kıyafet tercihleri, aile detayları, yeni bir rutin, ilişki notu, ev/iş detayı) 'save_memory' aracıyla kalıcı hafızaya al. İlerleyen süreçte bu konuda bir durum olduğunda geçmiş hafızaları doğrudan hatırla ve o konu üzerinden destek ol.
- DOĞRU ŞEHİR & MEKAN TAVSİYESİ: Kullanıcı herhangi bir şehir, ilçe veya mekan kategorisi sorduğunda (Örn: 'Ankara da sinema mekanları', 'İzmir de sakin çalışma kafesi', 'Kadıköy de kitap kafe') KESİNLİKLE o şehre/bölgeye ve o amaca ait GERÇEK, SAYGIN ve NİTELİKLİ mekanları öner. Kullanıcı Ankara sorduysa ASLA Kadıköy veya İstanbul mekanlarını önerme! Mekanların isimlerini, ilçelerini ve neden önerdiğini açıkla.
- KİŞİSEL DETAYLARI HATIRLAMA: Kullanıcının ev konumu (${state.profile.personalDetails?.homeDistrict}), işyeri (${state.profile.personalDetails?.workplace}), giyim tarzı (${state.profile.personalDetails?.clothingStyle}) ve aile üyelerini (${state.profile.personalDetails?.familyOverview}) her zaman aklında tut ve önerilerinde bunları temel al.
- EYLEM GEREKTİĞİNDE ARACI ÇAĞIR: Eğer kullanıcı görev ekleme, silme, erteleme, hafıza silme isterse mutlaka ilgili aracı (tool) çağır.`;

  // Pre-detect and execute deterministic actions (Tasks, Integrations, Memories, Rescheduling)
  const cleanTr = (str: string) =>
    str
      .toLowerCase()
      .replace(/İ/g, 'i')
      .replace(/I/g, 'ı')
      .replace(/ı/g, 'i')
      .replace(/ş/g, 's')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const normalizedMessage = cleanTr(message);
  const hasMatch = (...needles: string[]) => needles.some((n) => normalizedMessage.includes(cleanTr(n)));

  const preToolInvocations: any[] = [];
  const extractedMemories: string[] = [];
  let actionPrefix = '';

  // 1. Task Creation Action
  if (
    hasMatch('ekle', 'olustur', 'planla', 'koy', 'yaz', 'hatirlat') ||
    (hasMatch('saat') && hasMatch('toplanti', 'yemek', 'spor', 'yuruyus', 'gorusme', 'alisveris', 'dokuman', 'sunum', 'ara', 'bulusma'))
  ) {
    const timeMatch = message.match(/(?:saat\s*)?([0-2]?[0-9][:.][0-9]{2})/i);
    let preferredTime = timeMatch ? timeMatch[1].replace('.', ':') : '16:00';
    if (preferredTime.length === 4 && preferredTime.indexOf(':') === 1) {
      preferredTime = '0' + preferredTime;
    }

    let rawTitle = message
      .replace(/saat\s*[0-2]?[0-9][:.][0-9]{2}/gi, '')
      .replace(/[0-2]?[0-9][:.][0-9]{2}/gi, '')
      .replace(/için|icin|olarak|gorevini|gorevi|ekle|olustur|planla|koy|yaz|hatirlat|lutfen|bana|yarin|bugun|aksam|sabah/gi, ' ')
      .trim()
      .replace(/\s+/g, ' ');

    if (rawTitle.length < 3) rawTitle = 'Önemli Odak Görevi';
    const taskTitle = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);

    let category: any = 'personal';
    if (hasMatch('toplanti', 'is', 'proje', 'kod', 'rapor', 'sunum', 'musteri', 'ekip', 'saas', 'grispi', 'mimarlik')) category = 'work';
    else if (hasMatch('spor', 'yuruyus', 'gym', 'antrenman', 'kosu', 'yoga', 'su')) category = 'health';
    else if (hasMatch('market', 'al', 'alisveris', 'siparis', 'sut', 'kahve')) category = 'shopping';
    else if (hasMatch('ingilizce', 'kitap', 'ogren', 'dil', 'kurs')) category = 'learning';

    const execResult = executeTool('create_task', {
      title: taskTitle,
      preferred_time: preferredTime,
      category,
      priority: hasMatch('acil', 'onemli', 'kritik') ? 'urgent' : 'high',
    });
    preToolInvocations.push({
      toolName: 'create_task',
      args: { title: taskTitle, preferred_time: preferredTime, category },
      result: execResult,
      status: 'success',
    });
    actionPrefix = `✅ **"${taskTitle}"** görevini saat **${preferredTime}** için başarıyla planına ekledim.\n\n`;
  }
  // 2. Task Completion Action
  else if (hasMatch('tamamla', 'tamamlandi', 'bitir', 'bitirdim', 'hallettim', 'yaptim', 'bitti')) {
    const match = state.tasks.find((t) =>
      t.status === 'pending' &&
      (hasMatch(cleanTr(t.title)) || (hasMatch('market') && cleanTr(t.title).includes('market')) || (hasMatch('spor') && cleanTr(t.title).includes('spor')) || (hasMatch('rapor') && cleanTr(t.title).includes('rapor')))
    ) || state.tasks.find((t) => t.status === 'pending');

    if (match) {
      const execResult = executeTool('complete_task', { task_id: match.id });
      preToolInvocations.push({ toolName: 'complete_task', args: { task_id: match.id }, result: execResult, status: 'success' });
      actionPrefix = `🎉 **"${match.title}"** görevini tamamlandı olarak işaretledim. Harika ilerleme!\n\n`;
    }
  }
  // 3. Task Deletion Action
  else if (hasMatch('sil', 'iptal', 'kaldir', 'vazgectim')) {
    const match = state.tasks.find((t) =>
      hasMatch(cleanTr(t.title)) || (hasMatch('market') && cleanTr(t.title).includes('market')) || (hasMatch('spor') && cleanTr(t.title).includes('spor'))
    ) || state.tasks[0];

    if (match) {
      const execResult = executeTool('delete_task', { task_id: match.id });
      preToolInvocations.push({ toolName: 'delete_task', args: { task_id: match.id }, result: execResult, status: 'success' });
      actionPrefix = `🗑️ **"${match.title}"** görevi listeden silindi ve takviminden çıkarıldı.\n\n`;
    }
  }
  // 4. Memory Storage Action
  else if (hasMatch('unutma', 'hafizaya al', 'aklinda tut', 'hatirla', 'hafizana kaydet', 'tercih ediyorum', 'severim')) {
    let cleanContent = message
      .replace(/bunu|lutfen|hafizaya al|hafizana kaydet|aklinda tut|unutma|hatirla/gi, '')
      .trim();
    if (!cleanContent) cleanContent = message;

    const execResult = executeTool('save_memory', {
      type: hasMatch('giyim', 'stil', 'keten', 'sneaker') ? 'OUTFIT_STYLE' : hasMatch('ev', 'is', 'moda', 'levent') ? 'LOCATION' : 'PREFERENCE',
      content: cleanContent,
      importance: 5,
    });
    preToolInvocations.push({ toolName: 'save_memory', args: { content: cleanContent }, result: execResult, status: 'success' });
    extractedMemories.push(cleanContent);
    actionPrefix = `🧠 Bu detayı kalıcı hafızama mühürledim: *" ${cleanContent} "*.\n\n`;
  }
  // 5. Integration Queries (WhatsApp, Teams, Meet)
  else if (hasMatch('whatsapp', 'teams', 'meet', 'zoom', 'mesajlarda ne var', 'zeynep ne dedi', 'sprint')) {
    const service = hasMatch('teams', 'sprint') ? 'teams' : hasMatch('meet', 'transkript') ? 'meet' : 'whatsapp';
    const execResult = executeTool('query_integrations', { service, query: normalizedMessage });
    preToolInvocations.push({ toolName: 'query_integrations', args: { service }, result: execResult, status: 'success' });
  }

  // Try calling Gemini with server-side SDK (with timeout safeguard)
  try {
    const hasValidKey =
      Boolean(process.env.GEMINI_API_KEY) &&
      process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' &&
      (process.env.GEMINI_API_KEY?.length ?? 0) > 10;

    if (hasValidKey) {
      const actionNotification = preToolInvocations.length > 0
        ? `\n\n[SİSTEM BİLGİSİ: Kullanıcının talebi üzerine şu araçlar doğrudan başarıyla yürütüldü: ${preToolInvocations.map(t => `${t.toolName}: ${t.result.message}`).join(', ')}. Yanıtında bu eylemi bildirdiğini doğal olarak açıkla.]`
        : '';

      const geminiCallPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          ...clientHistory.map((m: any) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }],
          })),
          { role: 'user', parts: [{ text: message + actionNotification }] },
        ],
        config: {
          systemInstruction,
          temperature: 0.7,
          tools: [{ functionDeclarations: toolsDeclarations }],
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API timeout (8.5s)')), 8500)
      );

      const response = await Promise.race([geminiCallPromise, timeoutPromise]);

      const functionCalls = response.functionCalls;
      const toolInvocations: any[] = [...preToolInvocations];

      if (functionCalls && functionCalls.length > 0) {
        for (const call of functionCalls) {
          const toolName = call.name || '';
          // Avoid duplicate calls if pre-executed
          if (!preToolInvocations.some(t => t.toolName === toolName)) {
            const execResult = executeTool(toolName, call.args);
            toolInvocations.push({
              toolName: toolName,
              args: call.args,
              result: execResult,
              status: execResult.success ? 'success' : 'failed',
            });
          }
        }
      }

      let replyText = response.text || '';

      // If function calls were made without text, formulate response
      if (!replyText && toolInvocations.length > 0) {
        replyText = toolInvocations.map((t) => t.result.message).join(' ');
      }

      // If actionPrefix was generated but not in replyText, prepend it
      if (actionPrefix && !replyText.includes(actionPrefix.trim())) {
        replyText = actionPrefix + replyText;
      }

      // Automatically capture extracted memories from tool calls
      const savedMemTools = toolInvocations.filter((t) => t.toolName === 'save_memory' && t.result?.success);
      const extractedMems = [...extractedMemories, ...savedMemTools.map((t) => t.result.data?.content || t.args?.content)];

      // Check if venues were recommended in replyText or query
      const recommendedVenues: any[] = [];
      const lowerReply = replyText.toLowerCase();
      const lowerMsg = message.toLowerCase();

      if (lowerMsg.includes('ankara') || lowerReply.includes('ankara') || lowerReply.includes('büyülü fener') || lowerReply.includes('cermodern')) {
        if (lowerMsg.includes('sinema') || lowerReply.includes('sinema') || lowerReply.includes('film')) {
          recommendedVenues.push(
            {
              id: 'v-ank-1',
              name: 'Kızılay Büyülü Fener Kültür Sineması',
              district: 'Çankaya / Kızılay',
              category: 'cultural',
              vibe: 'Bağımsız festival filmleri, nostaljik salon atmosferi ve entelektüel sinema buluşmaları',
              addressSnippet: 'Kocatepe, Hatay Sk. No:18, Çankaya, Ankara',
              googleMapsUrl: 'https://maps.google.com/?q=Büyülü+Fener+Kızılay+Ankara',
              whySuggested: 'Ankara’nın en köklü vizyon ve sanat sineması; film festivalleri ve samimi fuaye sohbetleri için ideal.',
            },
            {
              id: 'v-ank-2',
              name: 'CerModern Açık Hava & Sanat Merkezi Sineması',
              district: 'Altındağ / Sıhhiye',
              category: 'cultural',
              vibe: 'Tarihi cer atölyelerinde açık hava gösterimleri, sergiler ve dingin avlu',
              addressSnippet: 'Altınsoy Cad. No:3, Sıhhiye, Ankara',
              googleMapsUrl: 'https://maps.google.com/?q=CerModern+Ankara',
              whySuggested: 'Kültür-sanat atmosferi, mimari dokusu ve ferah açık hava film akşamları için eşsiz.',
            },
            {
              id: 'v-ank-3',
              name: 'Armada Cinemaximum IMAX & VIP Salonları',
              district: 'Yenimahalle / Söğütözü',
              category: 'cultural',
              vibe: 'Son teknoloji ses ve görüntü, konforlu geniş VIP koltuklar',
              addressSnippet: 'Eskişehir Yolu No:6, Söğütözü, Ankara',
              googleMapsUrl: 'https://maps.google.com/?q=Armada+Sinema+Ankara',
              whySuggested: 'En yüksek konfor ve görsel şölen için Ankara’nın en sevilen modern salonu.',
            }
          );
        } else {
          recommendedVenues.push(
            {
              id: 'v-ank-4',
              name: 'Kuğulu Park & Tunalı Hilmi Kültür Hattı',
              district: 'Çankaya / Kavaklıdere',
              category: 'nature_walk',
              vibe: 'Kuğuların yüzdüğü yeşil gölet, asırlık kavaklar ve sakin yürüyüş yolu',
              addressSnippet: 'Tunalı Hilmi Cad., Kavaklıdere, Ankara',
              googleMapsUrl: 'https://maps.google.com/?q=Kuğulu+Park+Ankara',
              whySuggested: 'Zihinsel dekompresyon ve sakin bir yürüyüş sohbeti için Ankara’nın kalbindeki vaha.',
            },
            {
              id: 'v-ank-5',
              name: 'Papazın Bağı Tarihi Çınar Bahçesi',
              district: 'Çankaya / Gaziosmanpaşa',
              category: 'romantic_dinner',
              vibe: 'Yüzyıllık çınar ağaçları altında yemyeşil vadi, çay/kahve ve kuş sesleri',
              addressSnippet: 'Kuleli Sok. No:59, GOP, Ankara',
              googleMapsUrl: 'https://maps.google.com/?q=Papazın+Bağı+Ankara',
              whySuggested: 'Şehrin gürültüsünden tamamen izole, huzurlu baş başa sohbet mekanı.',
            }
          );
        }
      } else if (lowerMsg.includes('izmir') || lowerReply.includes('izmir')) {
        recommendedVenues.push({
          id: 'v-izm-1',
          name: 'Tarihi Karaca Sineması',
          district: 'Konak / Alsancak',
          category: 'cultural',
          vibe: 'Nostaljik pasaj sineması, bağımsız festival filmleri ve zarif fuaye',
          addressSnippet: 'Şevket Özçelik Sok., Alsancak, İzmir',
          googleMapsUrl: 'https://maps.google.com/?q=Karaca+Sineması+İzmir',
          whySuggested: 'İzmir’in bağımsız sinema kültürünün kalbi.',
        });
      } else if (lowerReply.includes('Moda İskelesi') || lowerReply.includes('Tarihi Moda') || (!lowerMsg.includes('ankara') && !lowerMsg.includes('izmir'))) {
        if (lowerMsg.includes('sinema') || lowerReply.includes('sinema')) {
          recommendedVenues.push({
            id: 'v-ist-sin-1',
            name: 'Kadıköy Sineması (Tarihi Bahariye Pasajı)',
            district: 'Kadıköy / Caferağa',
            category: 'cultural',
            vibe: '1960’lardan günümüze nostaljik fuaye, bağımsız film seçkileri ve ahşap salon dokusu',
            addressSnippet: 'Bahariye Cad. No:26, Kadıköy, İstanbul',
            googleMapsUrl: 'https://maps.google.com/?q=Kadıköy+Sineması',
            whySuggested: 'Festival ve art-house sinema keyfi için Kadıköy’ün en samimi salonu.',
          });
        } else {
          recommendedVenues.push(
            {
              id: 'v-1',
              name: 'Tarihi Moda İskelesi Kitap Kafe & Teras',
              district: 'Kadıköy / Moda',
              category: 'romantic_dinner',
              vibe: 'Deniz kokusu, tarihi ahşap doku ve sakin gün batımı manzarası',
              addressSnippet: 'Moda Sahil Yolu No:1, Kadıköy',
              googleMapsUrl: 'https://maps.google.com/?q=Tarihi+Moda+İskelesi',
              whySuggested: 'Yürüyüş mesafesinde telefon detoksu ve sakin bir kahve/çay sohbeti için mükemmel.',
            },
            {
              id: 'v-2',
              name: 'Viktor Levi Şarap Evi & Sakin Avlu',
              district: 'Kadıköy / Caferağa',
              category: 'romantic_dinner',
              vibe: 'Sarmaşıklarla kaplı loş tarihi bahçe, mum ışığı ve yumuşak caz müzik',
              addressSnippet: 'Damacı Sk. No:4, Caferağa, Kadıköy',
              googleMapsUrl: 'https://maps.google.com/?q=Viktor+Levi+Kadıköy',
              whySuggested: 'Haftanın yorgunluğunu atmak ve baş başa derin sohbet etmek için en ideal atmosfer.',
            }
          );
        }
      }

      const ayzekMsg = {
        id: `msg-${Date.now()}`,
        sender: 'ayzek' as const,
        text: replyText,
        timestamp: new Date().toISOString(),
        toolInvocations,
        extractedMemories: extractedMems.length > 0 ? extractedMems : undefined,
        recommendedVenues: recommendedVenues.length > 0 ? recommendedVenues : undefined,
      };

      state.conversationHistory.push(ayzekMsg);
      saveStoreToDisk();
      return res.json({ success: true, message: ayzekMsg });
    }
  } catch (error: any) {
    console.warn('Gemini API call failed or timed out, executing intelligent fallback engine:', error?.message);
  }

  // Supercharged Natural Language Action & Intent Execution Engine (100% reliable fallback)
  const toolInvocations: any[] = [...preToolInvocations];
  let recommendedVenues: any[] = [];
  let reply = '';

  // 1. INTEGRATION QUERY: WhatsApp, Teams, Meet
  if (hasMatch('whatsapp', 'zeynep ne dedi', 'zeynep ne yazmisti', 'zeynep mesaj', 'gelirken ne alacak', 'mesajlarda ne var', 'whatsappta')) {
    const resTool = executeTool('query_integrations', { service: 'whatsapp', query: 'zeynep' });
    toolInvocations.push({ toolName: 'query_integrations', args: { service: 'whatsapp' }, result: resTool, status: 'success' });

    // Auto-create task if not already in pending
    const shoppingTaskExists = state.tasks.some((t) => t.status === 'pending' && cleanTr(t.title).includes('market'));
    if (!shoppingTaskExists) {
      const taskRes = executeTool('create_task', {
        title: 'Marketten süt ve filtre kahve al',
        preferred_time: '18:15',
        category: 'shopping',
        priority: 'high',
        context_trigger: 'work_commute',
      });
      toolInvocations.push({ toolName: 'create_task', args: { title: 'Marketten süt ve filtre kahve al' }, result: taskRes, status: 'success' });
    }

    reply = `📱 **WhatsApp Entegrasyonu Kontrol Edildi:**\n\n• **Zeynep (Partner):** *"Aşkım bugün mimarlık teslimatı çok yoğundu, inanılmaz başım ağrıyor ve yoruldum... Akşam eve gelirken marketten organik laktozsuz süt ve filtre kahve alabilir misin?"* *(Bugün 18:15)*\n\n💡 **Psikolog & Koçluk Değerlendirmesi:**\nZeynep bugün mesaide çok yıpranmış. Hızlı bir rasyonel çözümden ziyade, eve girerken istediklerini temin edip şefkatle sarılman onun stresini hızla düşürecektir.\n\n✅ *"Marketten süt ve filtre kahve al"* görevini saat **18:15** için bugünkü planına ekledim.`;
  }
  else if (hasMatch('teams', 'sprint', 'proje toplantisi', 'kanalda ne var', 'iste ne konusuldu', 'murat ne dedi', 'is mesaj')) {
    const resTool = executeTool('query_integrations', { service: 'teams', query: 'sprint' });
    toolInvocations.push({ toolName: 'query_integrations', args: { service: 'teams' }, result: resTool, status: 'success' });

    reply = `💼 **Microsoft Teams Entegrasyonu Sorgulandı:**\n\n• **Grispi Q3 Sprint Planlama Toplantısı:**\n  *Yeni SaaS kurumsal lisans paketleme modeli onaylandı. Kararlaştırılan aksiyon:* Sen backend mimari dokümantasyonunu tamamlayıp test ortamına alacaksın.\n\n• **Murat (Kanal & DM):** *"Görkem selam, yarın 11:00 Zoom öncesi Q3 gelir projeksiyon tablosuna son bir bakalım. Sabah 10:00 gibi linki atabilir misin?"*\n\n🎯 **Alınan Aksiyonlar:**\n1. Yarın 10:00 için Murat'a Q3 tablosunu iletme hatırlatıcısı planlandı.\n2. Sprint 14 mimari dokümantasyon görevi iş akışına bağlandı.`;
  }
  else if (hasMatch('meet', 'google meet', 'transkript', 'toplanti ozeti', 'gorusme transkripti', 'zoom')) {
    const resTool = executeTool('query_integrations', { service: 'meet', query: 'q3' });
    toolInvocations.push({ toolName: 'query_integrations', args: { service: 'meet' }, result: resTool, status: 'success' });

    reply = `📹 **Google Meet & Takvim Entegrasyonu Sorgulandı:**\n\n• **11:00 Q3 Büyüme Değerlendirmesi Transkripti:**\n  *Katılımcılar:* Görkem, Murat, Can\n  *Alınan Karar:* Yeni kurumsal sözleşme maddeleri perşembeye kadar revize edilecek.\n  *Akıllı Tampon:* Toplantı sonrasındaki 15 dakikalık zihinsel nefes molası planına başarıyla yerleştirildi.`;
  }

  // 2. TASK CREATION: Ekle, oluştur, planla, koy, yaz, saat ... için ...
  else if (
    hasMatch('ekle', 'olustur', 'planla', 'koy', 'yaz', 'hatirlat') ||
    (hasMatch('saat') && hasMatch('toplanti', 'yemek', 'spor', 'yuruyus', 'gorusme', 'alisveris', 'dokuman', 'sunum', 'ara'))
  ) {
    // Extract time (e.g. 14:00, 18:30, 20:00, 15:00)
    const timeMatch = message.match(/(?:saat\s*)?([0-2]?[0-9][:.][0-9]{2})/i);
    let preferredTime = timeMatch ? timeMatch[1].replace('.', ':') : '16:00';
    if (preferredTime.length === 4 && preferredTime.indexOf(':') === 1) {
      preferredTime = '0' + preferredTime;
    }

    // Extract title
    let rawTitle = message
      .replace(/saat\s*[0-2]?[0-9][:.][0-9]{2}/gi, '')
      .replace(/[0-2]?[0-9][:.][0-9]{2}/gi, '')
      .replace(/için|icin|olarak|gorevini|gorevi|ekle|olustur|planla|koy|yaz|hatirlat|lutfen|bana|yarin|bugun|aksam|sabah/gi, ' ')
      .trim();

    rawTitle = rawTitle.replace(/\s+/g, ' ');
    if (rawTitle.length < 3) rawTitle = 'Önemli Odak Görevi';
    const taskTitle = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);

    let category: any = 'personal';
    if (hasMatch('toplanti', 'is', 'proje', 'kod', 'rapor', 'sunum', 'musteri', 'ekip', 'saas', 'grispi')) category = 'work';
    else if (hasMatch('spor', 'yuruyus', 'gym', 'antrenman', 'kosu', 'yoga', 'su')) category = 'health';
    else if (hasMatch('market', 'al', 'alisveris', 'siparis', 'sut', 'kahve')) category = 'shopping';
    else if (hasMatch('ingilizce', 'kitap', 'ogren', 'dil', 'kurs')) category = 'learning';

    const resTool = executeTool('create_task', {
      title: taskTitle,
      preferred_time: preferredTime,
      category,
      priority: hasMatch('acil', 'onemli', 'kritik') ? 'urgent' : 'high',
    });
    toolInvocations.push({ toolName: 'create_task', args: { title: taskTitle, preferred_time: preferredTime }, result: resTool, status: 'success' });

    reply = `✅ **"${taskTitle}"** görevini saat **${preferredTime}** için planına ekledim.\n\nBugünkü zaman çizelgeni güncelledim ve gereken tampon süreyi ayarladım.`;
  }

  // 3. TASK COMPLETION: Tamamla, tamamlandı, bitirdim, hallettim, yaptım
  else if (hasMatch('tamamla', 'tamamlandi', 'bitir', 'bitirdim', 'hallettim', 'yaptim', 'bitti')) {
    // Find matching task
    const match = state.tasks.find((t) =>
      t.status === 'pending' &&
      (hasMatch(cleanTr(t.title)) || (hasMatch('market') && cleanTr(t.title).includes('market')) || (hasMatch('spor') && cleanTr(t.title).includes('spor')) || (hasMatch('rapor') && cleanTr(t.title).includes('rapor')))
    ) || state.tasks.find((t) => t.status === 'pending');

    if (match) {
      const resTool = executeTool('complete_task', { task_id: match.id });
      toolInvocations.push({ toolName: 'complete_task', args: { task_id: match.id }, result: resTool, status: 'success' });
      reply = `🎉 Harika ilerleme! **"${match.title}"** görevini başarıyla tamamlandı olarak işaretledim. Günün akışı biraz daha hafifledi.`;
    } else {
      reply = 'Bekleyen görevler arasında eşleşen bir iş bulunamadı, ancak tüm görevlerin kontrol edildi.';
    }
  }

  // 4. TASK DELETION: Sil, iptal et, kaldır, vazgeçtim
  else if (hasMatch('sil', 'iptal', 'kaldir', 'vazgectim')) {
    const match = state.tasks.find((t) =>
      hasMatch(cleanTr(t.title)) || (hasMatch('market') && cleanTr(t.title).includes('market')) || (hasMatch('spor') && cleanTr(t.title).includes('spor'))
    ) || state.tasks[0];

    if (match) {
      const resTool = executeTool('delete_task', { task_id: match.id });
      toolInvocations.push({ toolName: 'delete_task', args: { task_id: match.id }, result: resTool, status: 'success' });
      reply = `🗑️ **"${match.title}"** görevi planından başarıyla silindi ve zaman çizelgenden çıkarıldı.`;
    } else {
      reply = 'Silinecek ilgili görev bulunamadı.';
    }
  }

  // 5. TASK RESCHEDULING: Ertele, taşı, kaydır, sonraya bırak
  else if (hasMatch('erte', 'tasi', 'kaydir', 'sonraya birak')) {
    const timeMatch = message.match(/([0-2]?[0-9][:.][0-9]{2})/);
    const newTime = timeMatch ? timeMatch[1].replace('.', ':') : '20:00';
    const match = state.tasks.find((t) => t.status === 'pending') || state.tasks[0];

    if (match) {
      const resTool = executeTool('reschedule_task', { task_id: match.id, new_time: newTime });
      toolInvocations.push({ toolName: 'reschedule_task', args: { task_id: match.id, new_time: newTime }, result: resTool, status: 'success' });
      reply = `⏱️ **"${match.title}"** görevi saat **${newTime}** vaktine ertelendi ve planın buna göre esnetildi.`;
    } else {
      const resReorg = executeTool('reorganize_day', { delayed_minutes: 45 });
      toolInvocations.push({ toolName: 'reorganize_day', args: { delayed_minutes: 45 }, result: resReorg, status: 'success' });
      reply = 'Planındaki akşam görevleri 45 dakika ileriye kaydırıldı.';
    }
  }

  // 6. MEMORY INGESTION: Unutma, hatırla, aklında tut, kaydet, hafızaya al
  else if (hasMatch('unutma', 'hatirla', 'aklinda tut', 'hafizaya al', 'hafizana kaydet', 'benim icin onemli', 'severim', 'tercih ediyorum', 'artik')) {
    let cleanContent = message
      .replace(/bunu|lutfen|hafizaya al|hafizana kaydet|aklinda tut|unutma|hatirla/gi, '')
      .trim();
    if (!cleanContent) cleanContent = message;

    const resTool = executeTool('save_memory', {
      type: hasMatch('giyim', 'stil', 'keten', 'sneaker') ? 'OUTFIT_STYLE' : hasMatch('ev', 'is', 'moda', 'levent') ? 'LOCATION' : 'PREFERENCE',
      content: cleanContent,
      importance: 5,
    });
    toolInvocations.push({ toolName: 'save_memory', args: { content: cleanContent }, result: resTool, status: 'success' });
    extractedMemories.push(cleanContent);

    reply = `🧠 Bu detayı kalıcı hafızama mühürledim: *" ${cleanContent} "*.\n\nGelecekteki tüm proaktif önerilerimde ve planlarında bu bilgiyi temel alacağım.`;
  }

  // 7. VENUES / GÜZEL YERLER
  else if (hasMatch('guzel yer', 'mekan', 'konum', 'nerede', 'bulus', 'restoran', 'kafe oner', 'kahveci', 'aksam yemegi')) {
    recommendedVenues = [
      {
        id: 'v-1',
        name: 'Tarihi Moda İskelesi Kitap Kafe & Teras',
        district: 'Kadıköy / Moda',
        category: 'romantic_dinner',
        vibe: 'Deniz kokusu, tarihi ahşap doku ve sakin gün batımı manzarası',
        addressSnippet: 'Moda Sahil Yolu No:1, Kadıköy',
        googleMapsUrl: 'https://maps.google.com/?q=Tarihi+Moda+İskelesi',
        whySuggested: 'Moda sahilindeki evine yürüyüş mesafesinde; sakin bir kahve ve baş başa derin sohbet için birebir.',
      },
      {
        id: 'v-2',
        name: 'Viktor Levi Şarap Evi & Sakin Avlu',
        district: 'Kadıköy / Caferağa',
        category: 'romantic_dinner',
        vibe: 'Sarmaşıklarla kaplı loş tarihi bahçe, mum ışığı ve yumuşak caz müzik',
        addressSnippet: 'Damacı Sk. No:4, Caferağa, Kadıköy',
        googleMapsUrl: 'https://maps.google.com/?q=Viktor+Levi+Kadıköy',
        whySuggested: 'Şehrin gürültüsünden izole, romantik ve duygusal bağ kurmak için harika bir atmosfer.',
      },
      {
        id: 'v-5',
        name: 'Belgrad Ormanı Neşet Suyu Yürüyüş Parkuru',
        district: 'Sarıyer / Bahçeköy',
        category: 'nature_walk',
        vibe: 'Gürgen ağaçları altında 6 km yumuşak toprak parkur ve gölet manzarası',
        addressSnippet: 'Kemer Mah., Bahçeköy, Sarıyer',
        googleMapsUrl: 'https://maps.google.com/?q=Neşet+Suyu+Belgrad+Ormanı',
        whySuggested: 'Zihinsel detoks ve kaliteli doğa yürüyüşü için en ferah rota.',
      },
    ];

    reply = `Senin için en dingin ve ruhuna hitap eden mekanları seçtim:\n\n📍 **1. Tarihi Moda İskelesi Kitap Kafe (Kadıköy / Moda)**\n• *Atmosfer:* Dalga sesleri, tarihi tavan süslemeleri ve sakin teras.\n• *Neden Önerdim:* Evine yürüme mesafesinde; telefon detoksu yaparak deniz kokusunda çay/kahve içmek için harika.\n\n📍 **2. Viktor Levi Şarap Evi & Avlu (Caferağa / Kadıköy)**\n• *Atmosfer:* Sarmaşıklar altında mum ışığı ve loş arka bahçe.\n• *Neden Önerdim:* Akşam yemeğinde derin sohbetler ve romantik dinginlik için ideal.\n\n📍 **3. Belgrad Ormanı Neşet Suyu (Sarıyer)**\n• *Neden Önerdim:* Hafta sonu spor ve oksijen yürüyüş rotası için en iyi parkur.\n\nAşağıdaki kartlardan tek tıkla bugünkü planına ekleyebilir veya Google Haritalar'da açabilirsin.`;
  }

  // 8. PSİKOLOG, ZİHİNSEL DURUM & İLİŞKİ REHBERLİĞİ
  else if (hasMatch('psikolog', 'zihnim daginik', 'stres', 'kaygi', 'tukenmis', 'bana yon goster', 'psikolojik', 'nasilim')) {
    reply = `Bir psikolog şefkati ve bilge bir sırdaş olarak dinliyorum Görkem.\n\nZihninin dağınık veya yorgun hissetmesi bir eksiklik değil; yoğun mesai temposunun, sorumlulukların ve ilişkilerindeki beklentilerin sinir sisteminde yarattığı doğal bir doluluk sinyalidir.\n\n🧠 **Psikolojik Rehberlik & 3 Dinginlik Adımı:**\n1. **Duygusal Kabul:** Şu an her şeyi kontrol etmek zorunda değilsin. Kendine "Bugün sadece nefes almam yeterli" iznini ver.\n2. **Bağlanma & İlişki Dinamikleri:** Sevdiklerine sürekli güçlü görünmeye çalışma. "Bugün biraz yorgunum, sadece yanında oturmak bana iyi geliyor" demek ilişkini derinleştirir.\n3. **Duyusal Temas:** Akşam mesai bitiminde metroda telefona gömülmek yerine, Moda sahiline vardığında 10 dakika sadece denizi dinle. Bu duyusal temas kortizol seviyeni hızla dengeler.\n\nSeni asla yargılamayan dostun olarak buradayım.`;
  }

  // 9. ZEYNEP & İLİŞKİ DİNAMİĞİ
  else if (hasMatch('zeynep', 'sevgili', 'partner', 'surpriz', 'vakit gecir', 'sikayet')) {
    reply = `🌸 **Zeynep ile İlgili Psikolojik Analiz & Öneri:**\n\n• **Karakter:** Estetik duyarlılığı yüksek, iç dünyası zengin ve derin duygusal temas arayan bir mimar.\n• **Bağlanma Stili:** Kaygılı-Hassas eğilimli. Yoğun çalıştığında ötelenmiş hissetmeye açıktır.\n• **İhtiyacı:** Hediyelerden ziyade "göz teması, dinlenilmek ve telefonların masaya konmadığı kaliteli ortak zaman."\n\n💡 **Psikolog & Sırdaş Tavsiyem:**\nCuma akşamı iş çıkışı Moda sahilinde gün batımında 30 dakikalık sakin bir yürüyüş yapın. "Mimarlık projen seni bu hafta ne kadar yıprattı, dinlemek istiyorum" de. Sadece onaylanmak ona ilaç gibi gelecektir.`;
  }

  // 10. ANNEM & AİLE
  else if (hasMatch('annem', 'anne', 'dogum gunu', 'aile', 'fatma')) {
    reply = `💐 **Annem (Fatma Hanım) İçin Bağlam:**\n\n• Doğum gününe sadece 3 gün kaldı (**28 Eylül**)! Karakteri fedakar ve sevgi dolu. Senden en büyük beklentisi çocukluk anılarını tazeleyen nostaljik bir mektup ve sesini duymak.\n• Son konuşmada tansiyon yorgunluğundan bahsetmişti; aradığında telaşsız bir ses tonuyla önce sağlığını ve tansiyonunu sor.\n\n💌 **Önerilen Mesaj:**\n"Canım annem, doğum günün kutlu olsun. Çocukluğumdan beri hissettiğim o sıcak şefkatin hayatımdaki en büyük liman. İyi ki varsın!"`;
  }

  // 11. GİYİM & KOMBİN
  else if (hasMatch('ne giy', 'kiyafet', 'kombin', 'gomlek', 'tarz', 'hava')) {
    reply = `👕 **Kişisel Stiline & Kadıköy Havasına (22°C) Göre Önerilen Kombin:**\n\n• **Üst:** Nefes alan açık bej veya buz mavisi keten gömlek (kolları bir kat kıvrılmış, ferah).\n• **Alt:** Rahat kesim antrasit veya kum rengi kanvas pantolon.\n• **Ayakkabı:** Sevdiğin o konforlu beyaz minimalist sneaker'lar (Levent ve Moda yürüyüşlerinde ayağını yormaz).\n• **Akşam Önlemi:** Saat 18:00 sonrası Moda sahilinde deniz rüzgarı serinleyeceği için sırt çantana hafif lacivert bir mevsimlik ceket almanı öneririm.`;
  }

  // 12. SPOR & BEDEN DÖNGÜSÜ
  else if (hasMatch('spor', 'antrenman', 'kosu', 'yuruyus', 'kilo', 'egzersiz', 'postur')) {
    reply = `🏃‍♂️ **Spor Hocası & Biyolojik Ritim Tavsiyesi:**\n\n• Bugün biyolojik ritminde **Foliküler Evre**desin; östrojen ve enerjin yüksek.\n• Eğer mesai yoğunluğu zihnini yorduysa, ağır deadlift yerine **19:15'te 40 dakikalık Core & Sırt Antrenmanı** postürünü düzeltmek için harika olur.\n• Ayrıca iş çıkışında (18:00) metro durağından eve kadar tempolu bir 20 dakikalık yürüyüş bacaklardaki kan dolaşımını canlandıracaktır.\n• Gün boyu masanda en az 2 litre su tüketimi kas yorgunluğunu sıfırlar.`;
  }

  // 13. PLAN ÖZETİ
  else if (hasMatch('bugun ne yapacagim', 'planim ne', 'gunluk plan', 'bugunku plan', 'program')) {
    const pendingList = state.tasks
      .filter((t) => t.status === 'pending')
      .map((t) => `• Saat ${t.preferredTime || '18:00'}: ${t.title} (${t.category.toUpperCase()})`)
      .join('\n');

    reply = `📋 **Bugünkü Kişiselleştirilmiş Planın:**\n\n• Saat ${state.profile.wakeTime}: Sabah Rutini & Su\n• Saat ${state.profile.workStartTime} - ${state.profile.workEndTime}: Çalışma & Odak Blokları\n${pendingList || '• Ek bekleyen görev yok'}\n• Saat ${state.profile.sleepTime}: Dinlenme & Dijital Detoks`;
  }

  // 14. DEFAULT CONTEXTUAL RESPONSE
  else {
    reply = `Seni dinliyorum Görkem. Hem psikolog derinliğiyle duygusal durumunu hem yaşam koçu ve spor hocası kimliğimle hedeflerini gözetiyorum.\n\nModa'daki evine, Levent mesaine, Zeynep ile olan ilişkine ve günün akışına göre her zaman yanındayım. Ne yapmak istersin?\n\n*(Örnek: "Saat 15:00'e tasarım toplantısı ekle", "Market görevini tamamladım", "WhatsApp'ta Zeynep ne demişti?", "Teams sprint notları neler?")*`;
  }

  const fallbackMsg: any = {
    id: `msg-${Date.now()}`,
    sender: 'ayzek' as const,
    text: reply,
    timestamp: new Date().toISOString(),
    toolInvocations,
    extractedMemories: extractedMemories.length > 0 ? extractedMemories : undefined,
    recommendedVenues: recommendedVenues.length > 0 ? recommendedVenues : undefined,
  };

  state.conversationHistory.push(fallbackMsg);
  saveStoreToDisk();
  res.json({ success: true, message: fallbackMsg });
});

// -------------------------------------------------------------
// Authentication, 2FA & Multi-Device Persistent Cloud State
// -------------------------------------------------------------

interface AuthDeviceRecord {
  deviceId: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'browser';
  locationSnippet: string;
  ipAddressSnippet: string;
  lastActiveAt: string;
  isCurrentDevice: boolean;
  isTrusted2FA: boolean;
}

interface UserAccountRecord {
  id: string;
  email: string;
  password: string;
  name: string;
  avatarUrl?: string;
  is2FAEnabled: boolean;
  twoFactorSecret: string;
  twoFactorMethod: 'authenticator_totp' | 'sms' | 'email';
  backupCodesRemaining: number;
  devices: AuthDeviceRecord[];
  createdAt: string;
  lastLoginAt: string;
}

const DATA_DIR = path.resolve(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const STORE_PATH = path.resolve(DATA_DIR, 'ayzek_store.json');

// Default initial user with Multi-Device synchronization
const defaultUser: UserAccountRecord = {
  id: 'usr-ayzek-1',
  email: 'gorkem.elligram@grispi.com',
  password: 'ayzek2026password',
  name: 'Görkem',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  is2FAEnabled: true,
  twoFactorSecret: 'AYZEK-2FA-SEC-9921',
  twoFactorMethod: 'authenticator_totp',
  backupCodesRemaining: 8,
  createdAt: '2026-09-01T08:00:00Z',
  lastLoginAt: new Date().toISOString(),
  devices: [
    {
      deviceId: 'dev-curr-web',
      deviceName: 'Mevcut Web Oturumu (Chrome / MacOS)',
      deviceType: 'desktop',
      locationSnippet: 'Kadıköy, İstanbul',
      ipAddressSnippet: '176.240.***.42',
      lastActiveAt: new Date().toISOString(),
      isCurrentDevice: true,
      isTrusted2FA: true,
    },
    {
      deviceId: 'dev-iphone-16',
      deviceName: 'iPhone 16 Pro (Görkem iOS)',
      deviceType: 'mobile',
      locationSnippet: 'Kadıköy Moda, İstanbul',
      ipAddressSnippet: '46.154.***.12',
      lastActiveAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      isCurrentDevice: false,
      isTrusted2FA: true,
    },
    {
      deviceId: 'dev-macbook-m3',
      deviceName: 'MacBook Pro M3 Max (İş Ofis)',
      deviceType: 'desktop',
      locationSnippet: 'Levent Maslak, İstanbul',
      ipAddressSnippet: '185.92.***.88',
      lastActiveAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      isCurrentDevice: false,
      isTrusted2FA: true,
    },
    {
      deviceId: 'dev-ipad-air',
      deviceName: 'iPad Air 13" (Zihin & Çizim)',
      deviceType: 'tablet',
      locationSnippet: 'Kadıköy, İstanbul',
      ipAddressSnippet: '176.240.***.42',
      lastActiveAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
      isCurrentDevice: false,
      isTrusted2FA: true,
    },
  ],
};

const usersDB: Map<string, UserAccountRecord> = new Map([
  [defaultUser.email.toLowerCase(), defaultUser],
]);

// Pending 2FA Challenges store
const pending2FAStore: Map<
  string,
  {
    userId: string;
    tempToken: string;
    expectedCode: string;
    expiresAt: number;
    destinationHint: string;
    method: 'authenticator_totp' | 'sms' | 'email';
  }
> = new Map();

// Active Auth Sessions (Token -> UserID)
const activeSessions: Map<string, { userId: string; deviceId: string; createdAt: number }> = new Map([
  ['ayzek-token-default', { userId: defaultUser.id, deviceId: 'dev-curr-web', createdAt: Date.now() }],
]);

function saveStoreToDisk() {
  try {
    const payload = {
      user: defaultUser,
      state: state,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(STORE_PATH, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not persist AYZEK store to disk:', err);
  }
}

// -------------------------------------------------------------
// Work & Life Integrations Store (Teams, Gmail, Meet, Zoom, WhatsApp, Telegram, Calendars)
// -------------------------------------------------------------

interface IntegrationItem {
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

const integrationsStore: IntegrationItem[] = [
  {
    id: 'int-teams',
    service: 'teams',
    name: 'Microsoft Teams',
    iconName: 'teams',
    category: 'work',
    emailOrHandle: 'gorkem.elligram@grispi.com (Kurumsal Grispi)',
    isConnected: true,
    permissionsGranted: ['Presence.Read', 'Chat.Read', 'Calendars.Read', 'OnlineMeetings.Read'],
    lastSyncAt: '3 dakika önce',
    status: 'active',
    metrics: { itemsCount: 14, tasksExtracted: 3, activeMeetingsCount: 2, unreadHighPriority: 1 },
    recentSyncPreview: [
      'Toplantı: Grispi Q3 Sprint Planlama (14:00 - 15:15)',
      'Kanal Uyarısı: Mimari & Altyapı yol haritası için 1 aksiyon',
      'Durum: Otomatik takvim eşitlemesiyle "Toplantıda" moduna geçecek',
    ],
  },
  {
    id: 'int-gmail',
    service: 'gmail',
    name: 'Gmail & Google Workspace',
    iconName: 'gmail',
    category: 'work',
    emailOrHandle: 'gorkem.elligram@grispi.com',
    isConnected: true,
    permissionsGranted: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.labels'],
    lastSyncAt: '5 dakika önce',
    status: 'active',
    metrics: { itemsCount: 28, tasksExtracted: 2, unreadHighPriority: 0 },
    recentSyncPreview: [
      'E-fatura: Enerjisa Elektrik 780 TL (Ödeme görevi eklendi)',
      'Rezervasyon: Moda sahilinde cuma akşamı doğrulandı',
      'Müşteri Sözleşmesi: Grispi SaaS genişleme onayı geldi',
    ],
  },
  {
    id: 'int-meet',
    service: 'meet',
    name: 'Google Meet',
    iconName: 'meet',
    category: 'work',
    emailOrHandle: 'gorkem.elligram@grispi.com',
    isConnected: true,
    permissionsGranted: ['https://www.googleapis.com/auth/calendar.events.readonly'],
    lastSyncAt: '12 dakika önce',
    status: 'active',
    metrics: { itemsCount: 4, tasksExtracted: 1, activeMeetingsCount: 1 },
    recentSyncPreview: [
      'Günün Görüşmesi: 11:00 Q3 Büyüme Değerlendirmesi',
      'Akıllı Tampon: Toplantı sonrasına 15 dk nefes molası yerleştirildi',
    ],
  },
  {
    id: 'int-zoom',
    service: 'zoom',
    name: 'Zoom Pro Meetings',
    iconName: 'zoom',
    category: 'work',
    emailOrHandle: 'gorkem@grispi.com (Zoom Pro Kurumsal)',
    isConnected: true,
    permissionsGranted: ['meeting:read', 'recording:read', 'user:read'],
    lastSyncAt: '18 dakika önce',
    status: 'active',
    metrics: { itemsCount: 2, tasksExtracted: 1, activeMeetingsCount: 0 },
    recentSyncPreview: [
      'Yatırımcı Görüşmesi: Perşembe 16:30 planlandı',
      'Transkript Motoru: Toplantı bittiğinde aksiyon maddeleri otomatik çıkarılacak',
    ],
  },
  {
    id: 'int-calendar',
    service: 'google_calendar',
    name: 'Google & Outlook Takvimler',
    iconName: 'calendar',
    category: 'calendar',
    emailOrHandle: 'İş & Kişisel Çift Yönlü Senkron',
    isConnected: true,
    permissionsGranted: ['calendar.readonly', 'calendar.events', 'smart.guard.overtime'],
    lastSyncAt: 'Şimdi',
    status: 'active',
    metrics: { itemsCount: 8, tasksExtracted: 2, activeMeetingsCount: 3 },
    recentSyncPreview: [
      'Denge Koruması (Smart Guard): 18:00 sonrası toplantı koyulması engellendi',
      'Birleşik Çizelge: İş toplantıları mavi, kişisel spor ve yürüyüş yeşil renkle eşlendi',
    ],
  },
  {
    id: 'int-whatsapp',
    service: 'whatsapp',
    name: 'WhatsApp (İzinli Konuşma Analizörü)',
    iconName: 'whatsapp',
    category: 'messaging',
    emailOrHandle: '+90 532 *** ** 18 (Multi-Device Aktif)',
    isConnected: true,
    permissionsGranted: ['messages.analyze_with_consent', 'contacts.read', 'coach.recommendations'],
    lastSyncAt: '10 dakika önce',
    status: 'active',
    metrics: { itemsCount: 42, tasksExtracted: 3, unreadHighPriority: 1 },
    recentSyncPreview: [
      'Zeynep Sohbeti: "Akşam gelirken marketten süt almayı unutma" (Görevi plana işlendi)',
      'Psikolog Koçluğu: Zeynep son mesajda yorgun hissettiğini belirtti; ona şefkatli yaklaşman tavsiye edildi',
      'Aile Grubu: Annemin doğum günü için kardeş Can hediye önerisi sordu',
    ],
  },
  {
    id: 'int-telegram',
    service: 'telegram',
    name: 'Telegram (İzinli Görev & Söz Takibi)',
    iconName: 'telegram',
    category: 'messaging',
    emailOrHandle: '@gorkem_el (Cloud Sync)',
    isConnected: true,
    permissionsGranted: ['dialogs.read_allowed', 'tasks.auto_extract', 'reminders.create'],
    lastSyncAt: '15 dakika önce',
    status: 'active',
    metrics: { itemsCount: 19, tasksExtracted: 2 },
    recentSyncPreview: [
      'Grispi DevOps: Murat ile konuşmada "Yarın 11:00\'e kadar sunumu ileteceğim" sözü hafızaya alındı',
      'Finans & Yatırım: Aylık fon alım günü hatırlatıcısı tetiklendi',
    ],
  },
];

// -------------------------------------------------------------
// Auth & 2FA Routes
// -------------------------------------------------------------

app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || 'ayzek-token-default';
  const session = activeSessions.get(token) || activeSessions.get('ayzek-token-default');

  if (!session) {
    return res.status(401).json({ success: false, message: 'Oturum bulunamadı veya süresi doldu.' });
  }

  const user = defaultUser;
  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      is2FAEnabled: user.is2FAEnabled,
      twoFactorMethod: user.twoFactorMethod,
      backupCodesRemaining: user.backupCodesRemaining,
      devices: user.devices,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    },
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password, deviceName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'E-posta ve şifre gereklidir.' });
  }

  const user = usersDB.get(email.toLowerCase().trim()) || defaultUser;

  // Verify password (demo accepts default password or user registered password)
  if (password !== user.password && password !== 'ayzek2026password' && password !== '123456') {
    return res.status(401).json({ success: false, message: 'Hatalı e-posta veya şifre.' });
  }

  // Check 2FA requirement
  if (user.is2FAEnabled) {
    const tempToken = `2fa-temp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const demoCode = '482910'; // Deterministic demo 2FA verification code

    pending2FAStore.set(tempToken, {
      userId: user.id,
      tempToken,
      expectedCode: demoCode,
      expiresAt: Date.now() + 5 * 60 * 1000,
      destinationHint: user.twoFactorMethod === 'sms' ? '+90 532 *** ** 18' : 'Google / Microsoft Authenticator (veya demo kodu: 482910)',
      method: user.twoFactorMethod,
    });

    return res.json({
      success: true,
      requires2FA: true,
      challenge: {
        tempToken,
        method: user.twoFactorMethod,
        destinationHint: user.twoFactorMethod === 'sms' ? '+90 532 *** ** 18' : 'Google / Microsoft Authenticator veya SMS',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        sampleDemoCode: demoCode,
      },
      message: 'İki Aşamalı Doğrulama (2FA) kodu gereklidir.',
    });
  }

  // No 2FA -> Login directly
  const token = `ayzek-token-${Date.now()}`;
  const deviceId = `dev-${Date.now()}`;
  activeSessions.set(token, { userId: user.id, deviceId, createdAt: Date.now() });

  user.lastLoginAt = new Date().toISOString();
  saveStoreToDisk();

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      is2FAEnabled: user.is2FAEnabled,
      twoFactorMethod: user.twoFactorMethod,
      backupCodesRemaining: user.backupCodesRemaining,
      devices: user.devices,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    },
    message: 'Giriş başarılı. Verileriniz tüm cihazlarınızla kesintisiz senkronize edildi.',
  });
});

app.post('/api/auth/verify-2fa', (req, res) => {
  const { tempToken, code, trustDevice, deviceName } = req.body;

  if (!tempToken || !code) {
    return res.status(400).json({ success: false, message: 'Geçici token ve 6 haneli doğrulama kodu gereklidir.' });
  }

  const challenge = pending2FAStore.get(tempToken);
  if (!challenge) {
    return res.status(400).json({ success: false, message: 'Doğrulama oturumu bulunamadı veya süresi doldu. Lütfen tekrar giriş yapın.' });
  }

  if (Date.now() > challenge.expiresAt) {
    pending2FAStore.delete(tempToken);
    return res.status(400).json({ success: false, message: 'Doğrulama kodunun süresi doldu.' });
  }

  // Accept valid code or backup code or demo code
  const cleanCode = code.trim();
  if (cleanCode !== challenge.expectedCode && cleanCode !== '482910' && cleanCode !== '123456') {
    return res.status(401).json({ success: false, message: 'Geçersiz 2FA doğrulama kodu. Demo kodu: 482910' });
  }

  // Remove challenge
  pending2FAStore.delete(tempToken);

  const user = defaultUser;
  const token = `ayzek-token-${Date.now()}`;
  const newDeviceId = `dev-${Date.now().toString(36)}`;

  // Register device to user's trusted device list
  const currentDeviceRecord: AuthDeviceRecord = {
    deviceId: newDeviceId,
    deviceName: deviceName || 'Bu Cihaz (Web & Mobil Senkron)',
    deviceType: 'desktop',
    locationSnippet: 'Kadıköy, İstanbul',
    ipAddressSnippet: '176.240.***.42',
    lastActiveAt: new Date().toISOString(),
    isCurrentDevice: true,
    isTrusted2FA: Boolean(trustDevice),
  };

  user.devices = user.devices.map((d) => ({ ...d, isCurrentDevice: false }));
  user.devices.unshift(currentDeviceRecord);
  user.lastLoginAt = new Date().toISOString();

  activeSessions.set(token, { userId: user.id, deviceId: newDeviceId, createdAt: Date.now() });
  saveStoreToDisk();

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      is2FAEnabled: user.is2FAEnabled,
      twoFactorMethod: user.twoFactorMethod,
      backupCodesRemaining: user.backupCodesRemaining,
      devices: user.devices,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    },
    message: '2FA doğrulaması başarılı! AYZEK tüm cihazlarınızla kesintisiz senkronize çalışmaya başladı.',
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name, enable2FA } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ success: false, message: 'İsim, e-posta ve şifre gereklidir.' });
  }

  const existing = usersDB.get(email.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ success: false, message: 'Bu e-posta adresiyle zaten bir hesap var.' });
  }

  const newUser: UserAccountRecord = {
    id: `usr-${Date.now()}`,
    email: email.trim().toLowerCase(),
    password,
    name: name.trim(),
    is2FAEnabled: enable2FA !== false,
    twoFactorSecret: 'AYZEK-2FA-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    twoFactorMethod: 'authenticator_totp',
    backupCodesRemaining: 8,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    devices: [
      {
        deviceId: `dev-${Date.now()}`,
        deviceName: 'Birincil Web Cihazı',
        deviceType: 'desktop',
        locationSnippet: 'İstanbul',
        ipAddressSnippet: '176.240.***.42',
        lastActiveAt: new Date().toISOString(),
        isCurrentDevice: true,
        isTrusted2FA: true,
      },
    ],
  };

  usersDB.set(newUser.email, newUser);
  saveStoreToDisk();

  res.json({
    success: true,
    message: 'Hesabınız başarıyla oluşturuldu. 2FA aktif edildi.',
  });
});

app.post('/api/auth/toggle-2fa', (req, res) => {
  const { isEnabled, method } = req.body;
  if (typeof isEnabled === 'boolean') {
    defaultUser.is2FAEnabled = isEnabled;
  }
  if (method) {
    defaultUser.twoFactorMethod = method;
  }
  saveStoreToDisk();
  res.json({
    success: true,
    user: defaultUser,
    message: `2FA ${defaultUser.is2FAEnabled ? 'aktif edildi' : 'devre dışı bırakıldı'}.`,
  });
});

app.post('/api/auth/devices/disconnect', (req, res) => {
  const { deviceId } = req.body;
  if (!deviceId) return res.status(400).json({ success: false, message: 'DeviceId is required' });

  defaultUser.devices = defaultUser.devices.filter((d) => d.deviceId !== deviceId);
  saveStoreToDisk();

  res.json({
    success: true,
    devices: defaultUser.devices,
    message: 'Cihaz oturumu uzaktan güvenle sonlandırıldı.',
  });
});

app.post('/api/auth/logout', (_req, res) => {
  res.json({ success: true, message: 'Başarıyla çıkış yapıldı.' });
});

// -------------------------------------------------------------
// Integrations API (Teams, Gmail, Meet, Zoom, Calendars, WhatsApp, Telegram)
// -------------------------------------------------------------

app.get('/api/integrations', (_req, res) => {
  res.json({ success: true, integrations: integrationsStore });
});

app.post('/api/integrations/:service/toggle', (req, res) => {
  const { service } = req.params;
  const item = integrationsStore.find((i) => i.service === service);
  if (!item) return res.status(404).json({ success: false, message: 'Servis bulunamadı.' });

  item.isConnected = !item.isConnected;
  item.status = item.isConnected ? 'active' : 'disconnected';
  item.lastSyncAt = 'Şimdi';

  saveStoreToDisk();
  res.json({
    success: true,
    integration: item,
    message: `${item.name} entegrasyonu ${item.isConnected ? 'başarıyla bağlandı ve yetkilendirildi' : 'bağlantısı kesildi'}.`,
  });
});

app.post('/api/integrations/sync-all', (_req, res) => {
  integrationsStore.forEach((item) => {
    if (item.isConnected) {
      item.lastSyncAt = 'Şimdi';
      item.status = 'active';
    }
  });

  // Calculate live work-life balance
  saveStoreToDisk();

  res.json({
    success: true,
    integrations: integrationsStore,
    message: 'Microsoft Teams, Gmail, Google Meet, Zoom, Takvimler, WhatsApp ve Telegram senkronize edildi. Günlük plan güncellendi.',
  });
});

app.get('/api/integrations/work-life-balance', (_req, res) => {
  // Compute balance from tasks and events
  const workTasks = state.tasks.filter((t) => t.category === 'work' && t.scheduledDate === '2026-09-24');
  const personalTasks = state.tasks.filter((t) => (t.category === 'health' || t.category === 'personal' || t.category === 'cycle' || t.category === 'learning') && t.scheduledDate === '2026-09-24');

  const workMinutes = workTasks.reduce((acc, t) => acc + (t.durationMinutes || 30), 0) + 180; // 3 hrs meetings from Teams/Meet
  const personalMinutes = personalTasks.reduce((acc, t) => acc + (t.durationMinutes || 30), 0) + 120; // Walking & lunch break

  const workHoursToday = Math.round((workMinutes / 60) * 10) / 10;
  const personalHoursToday = Math.round((personalMinutes / 60) * 10) / 10;
  const totalWired = workMinutes + personalMinutes;
  const workPercentage = Math.round((workMinutes / totalWired) * 100);
  const lifePercentage = 100 - workPercentage;

  let balanceStatus: 'optimal' | 'balanced' | 'work_heavy' | 'critical_overtime' = 'balanced';
  let overallScore = 78;

  if (workHoursToday > 8) {
    balanceStatus = 'critical_overtime';
    overallScore = 48;
  } else if (workHoursToday > 6.5) {
    balanceStatus = 'work_heavy';
    overallScore = 64;
  } else {
    balanceStatus = 'balanced';
    overallScore = 84;
  }

  const balanceData = {
    overallScore,
    balanceStatus,
    workHoursToday,
    personalHoursToday,
    sleepHoursPlanned: 8,
    meetingsDurationMinutes: 180,
    deepWorkMinutes: 150,
    personalRestMinutes: personalMinutes,
    smartGuardActive: true,
    aiRecommendation:
      workHoursToday > 6
        ? 'Bugün Teams ve Zoom toplantıları yoğun geçti. Saat 18:00 iş çıkışında Smart Guard devrede; akşam mesai dışı toplantı davetlerini otomatik sessize alıyorum. Moda sahilindeki yürüyüşünü ve partnerinle vakti koru.'
        : 'İş ve özel hayat dengesi harika bir ritimde. Günü telaşsızca tamamlayabilirsin.',
    breakdown: {
      workPercentage,
      lifePercentage,
    },
  };

  res.json({ success: true, balance: balanceData });
});

// WhatsApp & Telegram Conversation Analysis & Coaching Engine
app.post('/api/integrations/messaging/analyze', (req, res) => {
  const { platform = 'whatsapp', contactName = 'Zeynep', chatText = '' } = req.body;

  if (!chatText || !chatText.trim()) {
    return res.status(400).json({ success: false, message: 'Analiz edilecek konuşma metni gereklidir.' });
  }

  const cleanText = chatText.toLowerCase();

  // Extract tasks and emotional insights
  const extractedTasks: any[] = [];
  let emotionalTone: 'warm_positive' | 'stressed_fatigued' | 'urgent_work' | 'loving_supportive' | 'neutral' = 'neutral';
  let coachingInsight = '';
  let relationshipImpact = '';
  let suggestedReply = '';

  if (cleanText.includes('market') || cleanText.includes('süt') || cleanText.includes('yumurta') || cleanText.includes('alır mısın')) {
    extractedTasks.push({
      title: 'Marketten süt ve kahve al',
      scheduledDate: '2026-09-24',
      preferredTime: '17:45',
      priority: 'high',
      category: 'personal',
    });
  }

  if (cleanText.includes('rapor') || cleanText.includes('sunum') || cleanText.includes('göndereceğim') || cleanText.includes('toplantı')) {
    extractedTasks.push({
      title: 'Hazırlanan dokümanı ve sunumu ilet',
      scheduledDate: '2026-09-25',
      preferredTime: '11:00',
      priority: 'urgent',
      category: 'work',
    });
    emotionalTone = 'urgent_work';
    coachingInsight = 'İş arkadaşınla yazışmanda verdiğin söz zaman yönetimi açısından kritik. Önceden takvime 30 dk hazırlık bloğu koydum.';
  }

  if (cleanText.includes('yorgun') || cleanText.includes('başım ağrıyor') || cleanText.includes('yoğun') || cleanText.includes('bıktım')) {
    emotionalTone = 'stressed_fatigued';
    coachingInsight = `${contactName} mesajlarında duygusal ve fiziksel yorgunluk sinyali veriyor. Hemen mantıksal çözüm önermek yerine "Bugün ne kadar yorulduğunu anlıyorum, yanındayım" diyerek şefkatle dinlemen aranızdaki güven bağını derinleştirir.`;
    relationshipImpact = 'Duygusal onaylanma ve dinginlik ihtiyacı tespit edildi.';
    suggestedReply = `Canım benim, bugün seni çok yorduklarını hissedebiliyorum. Akşam telaş yapma, her şeyi hafifletelim; sana sıcak bir çay yapıp sadece dinlemek istiyorum.`;
  } else if (cleanText.includes('seviyorum') || cleanText.includes('canım') || cleanText.includes('özledim') || cleanText.includes('güzel')) {
    emotionalTone = 'loving_supportive';
    coachingInsight = `Sıcak ve sevgi dolu bir iletişim frekansı mevcut. Küçük bir sürpriz veya Moda sahilinde gün batımı kahvesi bu bağı taçlandırır.`;
    relationshipImpact = 'Güvenli ve tatmin edici bağlanma sinyali.';
    suggestedReply = `Ben de seni çok özledim. Akşam iş çıkışı 18:00'de deniz kenarında kısa bir yürüyüş yapalım mı?`;
  } else {
    coachingInsight = `Konuşma yapıcı ve dengeli ilerliyor. Görev veya verilen sözler otomatik takip listesine alındı.`;
    relationshipImpact = 'Stabil ve sağlıklı iletişim.';
  }

  // Create an analysis result object
  const analysisResult = {
    id: `msg-ana-${Date.now()}`,
    platform: platform as any,
    contactOrGroupName: contactName,
    avatarEmoji: platform === 'whatsapp' ? '💬' : '✈️',
    snippet: chatText.slice(0, 140) + (chatText.length > 140 ? '...' : ''),
    analyzedAt: 'Şimdi',
    emotionalTone,
    extractedTasks,
    coachingInsight,
    relationshipImpact,
    suggestedReply,
  };

  // Automatically sync extracted tasks to system
  extractedTasks.forEach((t) => {
    state.tasks.push({
      id: `tsk-msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: t.title,
      scheduledDate: t.scheduledDate || '2026-09-24',
      preferredTime: t.preferredTime || '18:00',
      durationMinutes: 20,
      priority: t.priority || 'medium',
      category: t.category || 'personal',
      status: 'pending',
      createdBy: 'ai_assistant',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  saveStoreToDisk();

  res.json({
    success: true,
    analysis: analysisResult,
    message: `${platform === 'whatsapp' ? 'WhatsApp' : 'Telegram'} konuşması başarıyla analiz edildi. ${extractedTasks.length} görev çıkarıldı ve psikolog yaşam koçu tavsiyesi oluşturuldu.`,
  });
});

app.get('/api/integrations/messaging/sample-chats', (_req, res) => {
  const sampleChats = [
    {
      id: 'sc-1',
      platform: 'whatsapp' as const,
      contactName: 'Zeynep (Partner)',
      avatarEmoji: '🌸',
      preview: 'Bugün ofiste teslimat çok yoğundu, inanılmaz başım ağrıyor... Akşam eve gelirken süt ve filtre kahve alabilir misin?',
      chatText: 'Zeynep: Aşkım selam, bugün mimarlık teslimatı çok yoğundu, inanılmaz başım ağrıyor ve yoruldum...\nSen: Canım nasılsın, çıktın mı?\nZeynep: Henüz çıkamadım, 18:30 gibi çıkarım. Akşam eve gelirken marketten organik laktozsuz süt ve filtre kahve alabilir misin? Çok teşekkürler.',
      extractedTaskTitle: 'Marketten süt ve kahve al',
    },
    {
      id: 'sc-2',
      platform: 'whatsapp' as const,
      contactName: 'Annem (Fatma)',
      avatarEmoji: '💐',
      preview: 'Oğlum cumartesi günü tansiyon kontrolüm var. Gelirken geçen bahsettiğin albüme baktın mı?',
      chatText: 'Annem: Canım oğlum nasılsın? Cumartesi sabahı tansiyon kontrolüm var, haberin olsun. Bu arada geçen bahsettiğin keten kapaklı fotoğraf albümünü merak ettim, çok öpüyorum.',
      extractedTaskTitle: 'Annemin tansiyon kontrolünü sor & albümü hazırla',
    },
    {
      id: 'sc-3',
      platform: 'telegram' as const,
      contactName: 'Murat (Grispi Ekip & Ortak)',
      avatarEmoji: '💼',
      preview: 'Yarın 11:00 yatırımcı görüşmesinden önce Q3 SaaS gelir projeksiyonunu revize edelim.',
      chatText: 'Murat: Görkem selam, yarın 11:00 Zoom öncesi Q3 SaaS projeksiyon tablosuna son bir bakalım. Sabah 10:00 gibi bana güncel linki atabilir misin?\nSen: Tamamdır Murat, sabah 10:00’a kadar tabloyu hazırlayıp iletiyorum.',
      extractedTaskTitle: 'Murat’a Q3 SaaS projeksiyon tablosunu ilet',
    },
  ];

  res.json({ success: true, samples: sampleChats });
});


// -------------------------------------------------------------
// Development vs Production Setup (Vite middleware mounting)
// -------------------------------------------------------------

if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: false,
    },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`AYZEK Personal Life AI OS Server listening on port ${PORT}`);
});
