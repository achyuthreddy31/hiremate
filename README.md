# HireMate Nexus

**HireMate Nexus** is an AI-powered, personalized preparation assistant for **one specific job application**. It helps students and job seekers prepare with laser focus for their chosen company and role.

It analyzes the user's profile, in-memory PDF resume, real job description, target interview date, daily preparation time, and practice performance. It calculates a transparent, explainable **Job Match Score**, allocates a dated preparation roadmap, provides auto-graded coding and test practice with adaptive difficulty, and tracks an effort-based **Interview Readiness Score**.

---

## 1. Transparent Product Positioning
Resume parsing, skill-gap analysis, learning paths, and AI coaching exist across published literature. What HireMate Nexus uniquely contributes is **the integration**: an evidence-aware, adaptive, target-application-focused preparation workflow with **deterministic, explainable scoring** computed strictly in Node.js backend code.

- **No mock-interview features of any kind**: No simulated interviewer conversations, no chat or voice interviews, no AI grading of interview answers. Preparation focuses on prepared technical/behavioral questions, STAR guidance, and private self-tracking notes.
- **Explainable Scores**: Scores are calculated using transparent formulas in pure backend services. The score is an alignment and preparation indicator—it is **never a hiring probability**.
- **In-Memory Security**: Uploaded PDF resumes are parsed in memory using `pdf-parse` and never saved to persistent disk.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, Vite, React Router, Tailwind CSS (Dual Light/Dark themes), Axios, React Hook Form, Zod, Recharts, Lucide Icons |
| **Backend** | Node.js, Express (ES modules), Mongoose, Multer (Memory Storage), `pdf-parse`, Firebase Admin SDK, Helmet, CORS, `express-rate-limit`, Zod |
| **Database** | MongoDB Atlas |
| **Authentication** | Firebase Authentication (Client) & Firebase Admin Token Verification (Server) |
| **AI Integration** | Gemini API (`@google/genai`) on the server side only |
| **Testing** | Vitest unit and integration test suites |

---

## 3. Repository Layout

```
hiremate-ai/
├── README.md
├── .env.example
├── client/          # React + Vite frontend application
├── server/          # Node.js + Express backend (ES modules)
│   ├── src/
│   │   ├── config/      # Environment validation & DB connections
│   │   ├── controllers/ # Request controllers
│   │   ├── middleware/  # Auth, upload, and error middleware
│   │   ├── models/      # Mongoose schemas & indexes
│   │   ├── routes/      # REST API v1 endpoints
│   │   ├── services/    # Business logic & deterministic scoring engine
│   │   └── data/        # Canonical skills dictionary (159 skills)
│   └── tests/       # Vitest unit test suites
├── shared/          # Pure ESM constants, weights, and enums
├── evaluation/      # Benchmark dataset & eval script
└── docs/            # Architecture & specifications
    ├── PLAN.md
    ├── PROGRESS.md
    ├── DECISIONS.md
    ├── API.md
    ├── scoring-rubric.md
    ├── MANUAL_TESTING.md
    └── EVALUATION.md
```

---

## 4. Setup & Running Locally

### Prerequisites
- Node.js (v18+ or v22+)
- npm (v9+)

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd miniproject

# Install server dependencies
npm --prefix server install

# Install client dependencies
npm --prefix client install
```

### Environment Variables
Copy `.env.example` to `.env` in the repository root:
```bash
cp .env.example .env
```
Populate your Firebase, MongoDB, and Gemini credentials. (The server includes local mock fallback modes for offline testing).

### Running Tests & Evaluation
```bash
# Run server Vitest tests (32 tests across 6 suites)
npm --prefix server test

# Run evaluation benchmark
npm run eval
```

### Building for Production
```bash
# Build server verification
npm --prefix server run build

# Build client distribution bundle
npm --prefix client run build
```

### Running Locally
```bash
# Start backend server (Port 5000)
npm --prefix server start

# Start frontend development server (Port 5173)
npm --prefix client run dev
```

---

## 5. Deployment Guide

### Deploying Frontend to Vercel
1. Set the **Root Directory** to `client`.
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Configure Environment Variables: `VITE_API_BASE_URL`, `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, etc.

### Deploying Backend to Render
1. Create a new **Web Service** on Render connected to this repository.
2. Root Directory: leave as repository root (or `/`), because the server imports `shared/` constants via ES module relative paths.
3. Build Command: `npm --prefix server install`.
4. Start Command: `npm --prefix server start`.
5. Environment Variables: `NODE_ENV=production`, `PORT=5000`, `CLIENT_URL=<your-vercel-domain>`, `MONGODB_URI`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `GEMINI_API_KEY`.
