# HireMate AI: Architecture & Implementation Plan

## 1. Overview & Positioning
HireMate AI is an AI-powered, personalized preparation assistant focused on a single target job application. It performs transparent, explainable skill-gap analysis, dated preparation roadmap allocation, targeted practice, and readiness tracking with deterministic scoring algorithms computed directly in backend code.

### Non-negotiable Constraints
- **Product Name**: HireMate AI (Strictly no use of forbidden names).
- **No Mock Interviews**: No simulated conversational/voice interviews, no AI grading of live interview answers. Preparation is focused on structured question prep, STAR framework, private notes, and checklists.
- **Strict Stack**: React + Vite + Tailwind (Client), Node.js + Express (ESM) + Mongoose (Server), Firebase Auth, Gemini API (`@google/genai` on server only), Vitest. No non-listed DBs or auth providers.
- **Explainable Deterministic Scoring**: Gemini extracts evidence and quotes; mathematical scoring rules are executed strictly in pure Node.js services.

---

## 2. Confirmed Stack & Directory Layout

### Stack
- **Frontend**: React 18/19, Vite, React Router 6/7, Tailwind CSS, Axios, React Hook Form, Zod, Recharts, Lucide React.
- **Backend**: Node.js (ES modules), Express, Mongoose, Multer (memory storage), `pdf-parse`, Firebase Admin SDK, Helmet, CORS, `express-rate-limit`, Zod, `@google/genai`.
- **Testing**: Vitest for unit & integration tests on server and client.
- **Deploy**: Vercel (client), Render (server from root).

### Repository Structure
```
hiremate-ai/
├── README.md
├── .env.example
├── .gitignore
├── package.json (root workspace scripts)
├── client/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       ├── services/
│       ├── styles/
│       └── utils/
├── server/
│   ├── package.json
│   ├── vitest.config.js
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── prompts/
│       ├── validators/
│       ├── utils/
│       └── data/
├── shared/
│   ├── index.js
│   ├── constants.js
│   └── enums.js
├── evaluation/
│   ├── dataset/
│   ├── eval.js
│   └── README.md
└── docs/
    ├── PLAN.md
    ├── PROGRESS.md
    ├── DECISIONS.md
    ├── API.md
    ├── scoring-rubric.md
    ├── MANUAL_TESTING.md
    └── EVALUATION.md
```

---

## 3. Implementation Phases
- **Phase 0: Foundation**: Repo layout, root configs, server & client package setups, shared constants, Zod env validation, health route, skill dictionary (150+ entries) and pure normalization logic with Vitest tests, and `scoring-rubric.md`.
- **Phase 1: Auth, Profile & Applications**: Firebase Auth integration (client & Admin SDK server mockable verification), User & Application models, CRUD routes, ownership middleware, settings/deletion.
- **Phase 2: Resume Processing**: In-memory PDF upload via Multer, `pdf-parse` extraction, signature & sanity checks, resume data extraction, deterministic Resume Quality scoring, CandidateProfile consolidation, UI for review/corrections.
- **Phase 3: Job Analysis & Matching**: Job requirement extraction, skill normalization, evidence evaluation (pure formulas), Job Match Score calculation (provisional/reweighting handling), Skill Gap generation, MatchReport model, UI with "Why" explanation panels.
- **Phase 4: Company Research**: Grounded search simulation/Gemini grounding handling, UTF-8 byte boundary verification, company research models, verified quiz generation, reviewed status tracking.
- **Phase 5: Roadmap & Learning**: Deterministic roadmap allocation algorithm (proportional minutes based on gap priorities), Gemini task wording generation, task status updates & re-planning, learning recommendations.
- **Phase 6: Practice & Coding**: PracticeQuestion & PracticeAttempt models, question generation (MCQ, debugging, output prediction, code reading, scenario, etc.), option shuffling, server-side grading, adaptive difficulty engine (5-attempt window), topic performance tracking.
- **Phase 7: Resume Improvement & Interview Preparation**: Truthful bullet improvements (strictly using supplied facts, `needsUserInput` requests for metrics), interview question generation (technical, HR, behavioral, project-based), STAR guidance, answer structure, private notes and prepared checklist.
- **Phase 8: Readiness, Checklist & Dashboard**: Interview Readiness Score calculation, Final Checklist generation, Comprehensive Dashboard UI.
- **Phase 9: Prepare-Completely Workflow**: `GenerationJob` pipeline with 15 granular stages, background progression, retry failed stages only, idempotency, polling API and workflow progress UI.
- **Phase 10: Hardening, Evaluation & Documentation**: `evaluation/` synthetic dataset and evaluation harness, security audit, accessibility review, dual-theme pass, API docs, complete `README.md`, manual testing guide.

---

## 4. Risks & Mitigations
1. **Missing Live Cloud Credentials**:
   - Provide clean mock capabilities for tests and offline runs; document live steps in `MANUAL_TESTING.md`.
2. **Deterministic vs. LLM Hallucinations**:
   - Gemini extracts evidence with quotes; code verifies quote substrings in source text and executes all score math.
3. **Monorepo / Shared Package Imports**:
   - Backend imports `shared/` with relative ES module path; root package scripts support running from root.
