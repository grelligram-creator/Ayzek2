# AYZEK — Personal Life AI: Comprehensive System Architecture & Specification

## 1. Recommended Technology Stack & Rationale

| Layer | Recommended Choice | Production Rationale |
| :--- | :--- | :--- |
| **Mobile Client** | Native iOS (SwiftUI + Combine / Swift Concurrency) & Native Android (Jetpack Compose) | Zero-latency 60fps animations, native Glassmorphism/Metal shaders, Apple HealthKit/Google Health Connect integration, local offline SQLite sync, APNs/FCM push with rich interactive actions, system background task workers, and secure Keychain/Keystore hardware encryption. |
| **Web / Prototype OS Client** | React 19 + TypeScript + Vite + Tailwind CSS v4 + Motion (Lucide Icons) | Cross-platform access, progressive web capability, ultra-responsive tactile UI with glassmorphism surface tokens, accessible WCAG AA, instant interactive proactive engine simulator. |
| **Backend API** | TypeScript + Express / NestJS | Type-safe end-to-end, async event-driven architecture, modular micro-service or clean layered monolith, native streaming responses for AI chat & proactive alerts. |
| **AI Layer** | `@google/genai` TypeScript SDK (Server-Side) with `gemini-3.8-flash` | Ultra-fast latency, high reasoning fidelity for tool calling (`FunctionDeclaration`), structured JSON output schema support for memory extraction & plan synthesis, multimodal OCR for document vaults. Key stays strictly server-side. |
| **Database** | PostgreSQL 16 + `pgvector` extension | ACID relational integrity for financial, vehicle, relationship, and task entities paired with vector embeddings (768/1536 dim) for semantic long-term memory retrieval and contextual matching. |
| **Cache & Realtime** | Redis 7 | In-memory token bucket rate limiting, session cache, proactive notification deduplication, and notification fatigue tracking. |
| **Background Jobs** | BullMQ / Celery (Queue-based worker pool) | Scheduled contextual reminders, relative routine offset evaluators (`work_end - 15m`), daily plan reorganization cron, memory consolidation, and document OCR worker. |
| **Storage** | Encrypted S3-compatible Blob Storage (AES-256-GCM) | For encrypted document vault (receipts, warranties, insurance, vehicle papers) with server-side decryption and presigned time-limited access URLs. |

---

## 2. Complete Repository / Folder Structure

```
ayzek-os/
├── docs/
│   └── AYZEK_ARCHITECTURE.md             # System design, data contracts & roadmap
├── server/
│   ├── server.ts                         # Express server entry point & Vite middleware mounting
│   ├── ai/
│   │   ├── geminiClient.ts               # GoogleGenAI initialization (User-Agent: aistudio-build)
│   │   ├── aiProvider.ts                 # AI Provider abstraction interface
│   │   ├── promptTemplates.ts            # System instructions, tone calibration, safety filters
│   │   └── tools.ts                      # Tool definitions & execution handlers
│   ├── modules/
│   │   ├── memory/                       # Long-term & short-term memory engine
│   │   ├── planner/                      # Dynamic daily planner & reorganization
│   │   ├── tasks/                        # Contextual task management
│   │   ├── proactive/                    # Proactive Intelligence & fatigue engine
│   │   ├── notifications/                # Multi-channel priority calculator
│   │   ├── life/                         # Finance, Subscriptions, Vehicles, Vault, Special Dates
│   │   └── user/                         # Profile & Personalization engine
│   └── store/
│       └── mockDatabase.ts               # In-memory relational & semantic database seed
├── src/
│   ├── main.tsx                          # React DOM entry
│   ├── index.css                         # Tailwind CSS v4 & custom glass design tokens
│   ├── App.tsx                           # Master application shell & state coordinator
│   ├── types/
│   │   └── ayzek.ts                      # Universal domain models & TypeScript interfaces
│   ├── components/
│   │   ├── design-system/                # Atomic Glassmorphism Design System
│   │   │   ├── GlassCard.tsx
│   │   │   ├── GlassButton.tsx
│   │   │   ├── GlassInput.tsx
│   │   │   ├── GlassChip.tsx
│   │   │   ├── GlassSheet.tsx
│   │   │   └── GlassNavigationBar.tsx
│   │   ├── navigation/                   # Floating glass bottom bar & status bar
│   │   ├── home/                         # Home View (Contextual Morning/Evening briefing)
│   │   ├── plan/                         # Dynamic Daily Timeline & Reorganization Engine
│   │   ├── life/                         # Life Modules (Finance, Vehicle, Vault, Dates, Goals, Habits)
│   │   ├── chat/                         # Personal Life AI Conversation & Tool Execution
│   │   ├── profile/                      # Memory Explorer, Privacy Controls & Tone Settings
│   │   ├── proactive/                    # Proactive Live Notification Drawer & Simulation Hub
│   │   └── architecture/                 # In-app interactive architecture visualizer
│   ├── services/
│   │   └── api.ts                        # Client API communication layer
│   └── utils/
│       └── formatters.ts                 # Date/Time, currency, relative time formatters
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 3. High-Level System Architecture

```
                               ┌─────────────────────────────────────────┐
                               │       Client (Web / iOS / Android)      │
                               │  Glassmorphism UI · Local Offline Sync  │
                               └────────────────────┬────────────────────┘
                                                    │ HTTPS / REST / SSE
                                                    ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│                               AYZEK Backend Application Layer                                 │
│                                                                                               │
│  ┌───────────────────────┐   ┌────────────────────────┐   ┌────────────────────────────────┐  │
│  │   API Router / Auth   │   │ Context Assembly Engine│   │  Proactive Intelligence Engine │  │
│  │   · JWT Token Auth    │──▶│ · Short-term context   │──▶│  · Event bus listener          │  │
│  │   · Rate limiter      │   │ · Semantic memories    │   │  · Urgency/Fatigue scorer      │  │
│  │   · Validation pipe   │   │ · Tasks & Calendar     │   │  · Relative timing evaluator   │  │
│  └───────────────────────┘   └───────────┬────────────┘   └────────────────┬───────────────┘  │
│                                          │                                 │                  │
│                                          ▼                                 ▼                  │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ AI Abstraction Layer (Gemini 3.8 Flash SDK)                                             │  │
│  │ · Conversation & Natural Language Understanding                                         │  │
│  │ · Tool Calling Engine (create_task, reschedule_task, save_memory, forget_memory)         │  │
│  │ · Dynamic Planner Reorganizer                                                           │  │
│  │ · Structured Memory Extractor & Confidence Assessor                                     │  │
│  └───────────────────────────────────────┬─────────────────────────────────────────────────┘  │
│                                          │                                                    │
│  ┌───────────────────────────────────────┴─────────────────────────────────────────────────┐  │
│  │ Modules Domain Core                                                                     │  │
│  │ Tasks │ Planner │ Habits │ Goals │ Finance │ Vault │ Vehicle │ Relationships │ Profiles │  │
│  └───────────────────────────────────────┬─────────────────────────────────────────────────┘  │
└──────────────────────────────────────────┼────────────────────────────────────────────────────┘
                                           │
                                           ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 Persistence & Storage Layer                                   │
│  PostgreSQL 16 + pgvector (Semantic Embeddings + Relational Store) · Redis 7 · Encrypted S3   │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Database ER / Schema (PostgreSQL + pgvector)

```sql
-- 1. Users & Profiles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    wake_time TIME NOT NULL DEFAULT '07:30:00',
    sleep_time TIME NOT NULL DEFAULT '23:30:00',
    work_start_time TIME NOT NULL DEFAULT '09:00:00',
    work_end_time TIME NOT NULL DEFAULT '18:00:00',
    communication_style VARCHAR(50) DEFAULT 'empathetic_concise',
    notification_frequency VARCHAR(50) DEFAULT 'balanced',
    primary_goal TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Structured Memories (with pgvector)
CREATE TYPE memory_type AS ENUM (
    'IDENTITY', 'PREFERENCE', 'ROUTINE', 'RELATIONSHIP', 
    'GOAL', 'HABIT', 'IMPORTANT_DATE', 'FINANCIAL', 
    'VEHICLE', 'WORK', 'WELLNESS', 'SHOPPING', 
    'TEMPORARY_CONTEXT', 'DERIVED_INSIGHT'
);

CREATE TABLE memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type memory_type NOT NULL,
    content TEXT NOT NULL,
    importance INT CHECK (importance BETWEEN 1 AND 5) DEFAULT 3,
    confidence FLOAT CHECK (confidence BETWEEN 0.0 AND 1.0) DEFAULT 0.9,
    source VARCHAR(50) NOT NULL DEFAULT 'conversation',
    is_user_confirmed BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    embedding vector(768)
);
CREATE INDEX idx_memories_user_active ON memories(user_id, is_active);
CREATE INDEX idx_memories_embedding ON memories USING ivfflat (embedding vector_cosine_ops);

-- 3. Contextual Tasks & Daily Planner
CREATE TYPE task_priority AS ENUM ('urgent', 'high', 'medium', 'low');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'rescheduled', 'cancelled');

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_date DATE NOT NULL,
    preferred_time TIME NULL,
    duration_minutes INT DEFAULT 30,
    priority task_priority DEFAULT 'medium',
    category VARCHAR(50) DEFAULT 'personal',
    location VARCHAR(100),
    context_trigger VARCHAR(100), -- e.g. 'work_commute', 'post_dinner'
    status task_status DEFAULT 'pending',
    created_by VARCHAR(50) DEFAULT 'user', -- 'user' or 'ai_assistant'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Goals & Habits
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    target_date DATE,
    progress_percentage INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active'
);

CREATE TABLE habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    frequency VARCHAR(50) NOT NULL DEFAULT 'daily',
    preferred_time TIME,
    current_streak INT DEFAULT 0,
    best_streak INT DEFAULT 0,
    last_completed_date DATE
);

-- 5. Finance & Subscriptions
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'TRY',
    due_date DATE NOT NULL,
    category VARCHAR(50) NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE,
    reminder_days_before INT DEFAULT 2
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'TRY',
    billing_cycle VARCHAR(50) DEFAULT 'monthly',
    next_billing_date DATE NOT NULL,
    category VARCHAR(50)
);

-- 6. Vehicle, Documents, Special Dates
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plate VARCHAR(20) NOT NULL,
    make_model VARCHAR(100) NOT NULL,
    model_year INT,
    inspection_due DATE,
    insurance_due DATE,
    maintenance_km INT,
    current_km INT
);

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    doc_type VARCHAR(50) NOT NULL, -- 'warranty', 'contract', 'id', 'receipt'
    expiry_date DATE,
    notes TEXT,
    ocr_extracted_text TEXT
);

CREATE TABLE special_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    person_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'birthday', 'anniversary'
    date_month_day VARCHAR(10) NOT NULL, -- '09-28'
    gift_idea TEXT
);

-- 7. Proactive Notification & Audit Log
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL, -- 'high', 'medium', 'low'
    category VARCHAR(50) NOT NULL,
    action_type VARCHAR(50),
    action_payload JSONB,
    status VARCHAR(20) DEFAULT 'unread', -- 'unread', 'read', 'dismissed', 'acted'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 5. API Contract Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/profile` | Current user routines, preferences, work hours |
| `PUT` | `/api/profile` | Update profile preferences and communication style |
| `GET` | `/api/memories` | Filtered list of structured memories with confidence & status |
| `POST` | `/api/memories` | Explicitly save or derive a memory |
| `PATCH` | `/api/memories/:id` | Confirm or toggle memory active status |
| `DELETE`| `/api/memories/:id` | Forget memory item ("Bunu unut") |
| `POST` | `/api/memories/clear`| Clear all memories (Privacy control) |
| `GET` | `/api/tasks` | Get contextual tasks with triggers and deadlines |
| `POST` | `/api/tasks` | Create task (with AI or manual) |
| `PATCH` | `/api/tasks/:id` | Update status, deadline or reschedule |
| `DELETE`| `/api/tasks/:id` | Safe task deletion |
| `GET` | `/api/plan/today` | Synthesized dynamic daily timeline |
| `POST` | `/api/plan/reorganize` | Trigger dynamic reorganization (e.g. meeting ran late) |
| `GET` | `/api/life/all` | Aggregated finance, subscriptions, vehicles, dates, vault |
| `POST` | `/api/proactive/evaluate`| Run proactive decision pipeline and return candidate alerts |
| `POST` | `/api/chat` | AI conversation engine with tool execution & memory extraction |

---

## 6. AI Architecture & Tool Calling Design

AYZEK utilizes the modern `@google/genai` TypeScript SDK on the server with `gemini-3.8-flash`.
Key tools declared via `FunctionDeclaration`:
1. `create_task(title, scheduled_date, preferred_time, category, priority, context_trigger)`
2. `reschedule_task(task_id, new_date, new_time, reason)`
3. `complete_task(task_id)`
4. `save_memory(type, content, importance, confidence)`
5. `forget_memory(memory_id_or_keyword)`
6. `create_reminder(title, trigger_time, context)`
7. `get_daily_plan()`
8. `reorganize_day(reason, delayed_minutes)`

---

## 7. Proactive Decision Pipeline

```
Event / Time Tick
       ↓
Load Context (Current Time, Routine, Today's Tasks, Weather, Calendar)
       ↓
Relevance Check (Is there a task or routine matching current context?)
       ↓
User Preference Check (Do not disturb hours? Notification frequency setting?)
       ↓
Urgency & Importance Calculation:
  Score = Urgency (1-5) + Importance (1-5) + ContextRelevance (1-5) 
          - RecentNotificationsInLastHour * 2 - FatiguePenalty
       ↓
Notification Fatigue Check (Skip if Score < Threshold or spam detected)
       ↓
Generate Message (Empathetic, concise, natural tone, actionable)
       ↓
Safety Validation (No shame language, no fake transactions, user confirmation)
       ↓
Deliver (In-App Floating Alert / Push Simulation)
       ↓
Log & Learn User Response (Acted vs Dismissed feedback loop)
```
