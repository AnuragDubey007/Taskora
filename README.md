# Taskora — AI Voice Task Manager

> **Urban Ground Full Stack Engineer Assessment**  
> Built by **Anurag Dubey**

A production-ready voice-controlled task manager where every action — create, read, update, delete — happens through natural conversation. No buttons. No typing. Just speak.

---

## Live Demo

**Frontend:** https://taskora-dusky.vercel.app

**Backend API:** https://taskora-0kde.onrender.com
> ⚠️ **Note for Reviewers:** The live demo uses a shared Gemini API key which may be exhausted.
> For guaranteed functionality, clone the repo and add your own `GEMINI_API_KEY` in the backend `.env` file.
> Setup takes under 5 minutes — instructions below.
---

## What It Does

Taskora is a full-stack AI voice agent. You tap the mic, speak naturally, and the assistant understands, acts, and confirms — all through voice.

- "Create a task for gym at 7 AM tomorrow"
- "What are my evening tasks today?"
- "Move the LinkedIn post to 6 PM"
- "Delete the gym task" → confirms before deleting
- "Actually change the previous one to 8 PM" → uses conversation memory

---

## Features Implemented

### Voice Interaction
- **Speech-to-Text** via Web Speech API (Chrome/Edge)
- **Text-to-Speech** via Google Cloud Neural TTS (deep male voice) with browser TTS fallback
- Continuous listening loop — automatically resumes after AI speaks
- **Interruption handling** — tap mic while AI is speaking to stop it instantly and redirect

### AI & Context
- **Gemini 2.5 Flash** with function calling for intent detection and tool execution
- Full **conversation history** maintained across turns
- Context-aware references — "the previous one", "the second task", "that" all resolve correctly
- Semantic search — "evening workout" matches "gym session"
- Multi-task creation in a single utterance

### Task Management (Voice CRUD)
- Create tasks with name, time, date, and details
- Read tasks — summarized conversationally, filtered by time of day
- Update any field — time, date, name, status
- Delete with mandatory confirmation — never deletes without explicit "yes"
- Time-range filtering — morning / afternoon / evening / night / today / tomorrow

### UI & Animations
- Task cards animate on create (green glow), update (blue pulse), delete (red fade-out)
- Live voice panel with animated wave bars while listening
- Thinking dots while AI processes
- Confirm card overlay for voice-triggered actions
- Fully responsive — mobile and desktop

### Auth
- JWT-based signup and login
- Persisted session via localStorage (Zustand)
- All task and chat endpoints protected by auth middleware
- Per-user task isolation — users only see their own tasks

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| State | Zustand |
| Routing | React Router v6 |
| Voice STT | Web Speech API |
| Voice TTS | Google Cloud Neural TTS + browser fallback |
| AI | Google Gemini 2.5 Flash (function calling) |
| Backend | Node.js, Express |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT + bcryptjs |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Project Structure

```
taskora/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   └── authController.js      # Signup, login, me
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT verification
│   ├── models/
│   │   ├── taskModel.js           # Task schema (user, name, time, date, status)
│   │   └── User.js                # User schema with bcrypt hashing
│   ├── routes/
│   │   └── authRoutes.js          # /api/auth/signup, /login, /me
│   ├── services/
│   │   └── gemini.js              # Gemini AI, system prompt, tool calling
│   ├── taskTools.js               # createTask, getAllTasks, updateTask, deleteTask, findTasksByName, getTasksByTimeRange
│   └── server.js                  # Express app, /api/chat, /api/tasks, /api/tts
│
└── frontend/
    └── src/
        ├── components/
        │   ├── ConfirmCard.jsx    # Action confirmation overlay
        │   ├── Hero.jsx           # Landing header
        │   ├── Navbar.jsx         # Logo + logout
        │   ├── ProtectedRoute.jsx # Auth guard
        │   ├── TaskCard.jsx       # Task with glow animations
        │   ├── TaskGrid.jsx       # Responsive task grid
        │   └── VoicePanel.jsx     # Mic button + transcript panel
        ├── config/
        │   └── api.js             # API_URL from env
        ├── hooks/
        │   └── useVoiceAgent.js   # Core voice loop, STT, TTS, chat logic
        ├── pages/
        │   ├── Home.jsx           # Main app page
        │   ├── Login.jsx          # Login form
        │   └── Signup.jsx         # Signup form
        ├── store/
        │   ├── authStore.js       # Zustand auth (user, token, persist)
        │   └── taskStore.js       # Zustand tasks (CRUD, animations, confirmCard)
        ├── App.jsx                # Routes
        └── main.jsx               # Entry point
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- MongoDB Atlas URI
- Google Gemini API key
- Google Cloud TTS API key (optional — browser TTS fallback included)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/taskora.git
cd taskora
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=3001
MONGO_URI=your_mongodb_atlas_uri
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret_string
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
```

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:5173`

---

## How the Voice Loop Works

```
User taps mic
     ↓
Web Speech API (STT) captures speech
     ↓
Text sent to /api/chat with conversation history
     ↓
Gemini 2.5 Flash decides which tool to call
     ↓
Tool executes against MongoDB (create / read / update / delete)
     ↓
Gemini generates a natural spoken reply
     ↓
Google Cloud TTS (or browser fallback) plays the audio
     ↓
UI animates the result (glow on card, confirm overlay)
     ↓
Listening resumes automatically
```

### Race Condition Handling

The `useVoiceAgent` hook uses a `speakSessionRef` counter. Every `speakText` call captures a session ID. All audio callbacks (onended, onerror, play rejection) check this ID before acting — so if the user interrupts mid-speech, the stale audio callback cannot trigger a second listen cycle. A `fallbackCalled` guard additionally prevents both `audio.onerror` and `audio.play().catch` from triggering the browser TTS fallback simultaneously.

---

## Example Voice Flows

**Create**
> "Schedule a team sync at 9 AM tomorrow"  
> Taskora: "Done. Team sync added for tomorrow at 9 AM."

**Context reference**
> "Actually move that to 10 AM"  
> Taskora: "Updated. Team sync is now at 10 AM."

**Delete with confirmation**
> "Delete the gym task"  
> Taskora: "I found Gym Session. Should I delete it?"  
> "Yes"  
> Taskora: "Done. Gym Session has been removed."

**Time-range query**
> "What are my evening tasks today?"  
> Taskora: "You have a product sync at 6 PM and a LinkedIn post at 8 PM."

**Multi-task**
> "Create three tasks — gym at 7, standup at 9, and lunch with client at 1 PM"  
> Taskora: "All three tasks have been created."

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/health | No | Server health check |
| POST | /api/auth/signup | No | Register new user |
| POST | /api/auth/login | No | Login, returns JWT |
| GET | /api/auth/me | Yes | Get current user |
| GET | /api/tasks | Yes | Get all tasks for user |
| POST | /api/chat | Yes | Send voice message, get AI reply |
| POST | /api/tts | No | Convert text to speech audio |

---

## Deployment

### Backend — Render

1. Push backend to GitHub
2. Create a new Web Service on Render
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add all environment variables from `.env`

### Frontend — Vercel

1. Push frontend to GitHub
2. Import project on Vercel
3. Set environment variable: `VITE_API_URL=https://your-render-url.onrender.com`
4. Deploy

---

## Design Decisions

**Why Gemini 2.5 Flash?** Function calling support with low latency. The model reliably maps natural language to structured tool calls (create_task, update_task etc.) without hallucinating extra actions.

**Why browser TTS fallback?** Google Cloud TTS returns high-quality MP3 audio but requires a billing-enabled API key. The browser fallback ensures the app works for evaluators without any API key configuration.

**Why Zustand over Redux?** Minimal boilerplate for this scope. The task store, auth store, and animation state (deletingId, newTaskId, confirmCard) are clean and co-located without reducers or actions files.

**Why `speakSessionRef` instead of a simple boolean?** A boolean can't distinguish between "the previous session stopped" and "this session was never started." The incrementing integer cleanly invalidates all callbacks from any prior call, even if multiple are in flight simultaneously.

---

*Built for the Urban Ground Full Stack Engineer Assessment · June 2026*
