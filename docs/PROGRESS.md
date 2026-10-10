# HireMate AI: Progress Log

## Phases Completed

### Phase 0: Foundation
- **Status**: Completed
- **Features**: Workspace layout (`client/`, `server/`, `shared/`, `docs/`, `evaluation/`), Zod environment validation, shared constants & scoring enums, canonical skill dictionary with 160 skills, deterministic `normalizeSkill` with alias support, pure Vitest scoring unit tests.
- **Changed Files**: `docs/PLAN.md`, `docs/DECISIONS.md`, `docs/scoring-rubric.md`, `.env.example`, `shared/*`, `server/src/config/env.js`, `server/src/data/skills.json`, `server/src/services/scoring/*`, `server/tests/scoring.test.js`.

### Phase 1: Auth, Profile & Applications
- **Status**: Completed
- **Features**: Firebase Auth (client and server mockable integration), User and Application Mongoose models with `firebaseUid` indexes and strict ownership enforcement, Application CRUD, cascade account deletion.
- **Changed Files**: `server/src/config/firebase.js`, `server/src/middleware/auth.middleware.js`, `server/src/models/user.model.js`, `server/src/models/application.model.js`, `server/src/controllers/user.controller.js`, `server/src/controllers/application.controller.js`, `server/src/routes/*`, `server/tests/auth.test.js`.

### Phase 2: Resume In-Memory Processing
- **Status**: Completed
- **Features**: Multer in-memory upload, `%PDF-` signature verification, `pdf-parse` text extraction, deterministic Resume Quality scoring (contact details, skills, education, action verbs, links), `CandidateProfile` consolidation where user-verified edits win.
- **Changed Files**: `server/src/models/resume.model.js`, `server/src/models/candidateProfile.model.js`, `server/src/middleware/upload.middleware.js`, `server/src/services/resume.service.js`, `server/src/controllers/resume.controller.js`, `server/tests/resume.test.js`.

### Phase 3: Job Analysis & Deterministic Matching
- **Status**: Completed
- **Features**: `JobAnalysis` model, structured requirement extraction with quote verification, deterministic Job Match Score engine with reweighting and provisional status (<60 coverage), MatchReport versioning, explainable "Why" panels.
- **Changed Files**: `server/src/models/jobAnalysis.model.js`, `server/src/models/matchReport.model.js`, `server/src/services/jobAnalysis.service.js`, `server/src/controllers/jobAnalysis.controller.js`, `server/tests/jobAnalysis.test.js`.

### Phase 4: Grounded Company Research
- **Status**: Completed
- **Features**: `CompanyResearch` model, UTF-8 byte span parser for Google Search grounding, unsupported claim dropping, company labels (`verified`, `inferred`, `predicted`, `unavailable`), verified-only company quiz, section reviewed toggles.
- **Changed Files**: `server/src/models/companyResearch.model.js`, `server/src/services/companyResearch.service.js`, `server/src/controllers/companyResearch.controller.js`, `server/tests/companyResearch.test.js`.

### Phase 5: Roadmap & Learning
- **Status**: Completed
- **Features**: Deterministic roadmap allocation (gap priority ranking, min 20 min slots, final day revision reservation), task status updates (`pending`, `completed`), learning recommendations with grounded search query fallbacks.
- **Changed Files**: `server/src/models/roadmap.model.js`, `server/src/models/learningRecommendation.model.js`, `server/src/services/roadmap.service.js`, `server/src/controllers/roadmap.controller.js`.

### Phase 6: Practice & Coding
- **Status**: Completed
- **Features**: `PracticeQuestion` and `PracticeAttempt` models, 10-question test generation, auto-graded debugging and output prediction items, option shuffling, hidden answers before submission, 5-attempt adaptive difficulty window.
- **Changed Files**: `server/src/models/practiceQuestion.model.js`, `server/src/models/practiceAttempt.model.js`, `server/src/services/practice.service.js`, `server/src/controllers/practice.controller.js`, `server/tests/prepPractice.test.js`.

### Phase 7: Resume Improvements & Interview Preparation
- **Status**: Completed
- **Features**: Truthful resume bullet rewrites strictly using provided facts and `needsUserInput` metric prompts, interview questions with STAR guidance, candidate-specific project questions, private candidate notes (never sent to AI, never scored).
- **Changed Files**: `server/src/models/interviewPreparation.model.js`, `server/src/services/interviewPrep.service.js`, `server/src/controllers/interviewPrep.controller.js`.

### Phase 8: Readiness, Checklist & Dashboard
- **Status**: Completed
- **Features**: Interview Readiness Score across 7 core areas (unstarted areas contribute 0), `ReadinessSnapshot` history, Final Checklist generation and toggles, unified dashboard aggregation endpoint.
- **Changed Files**: `server/src/models/checklist.model.js`, `server/src/models/readinessSnapshot.model.js`, `server/src/controllers/readinessDashboard.controller.js`.

### Phase 9: Staged Workflow Pipeline ("Prepare Completely")
- **Status**: Completed
- **Features**: `GenerationJob` pipeline with 15 granular stages, background sequential execution, retry failed stages only, idempotency key support, stale job cleanup on startup.
- **Changed Files**: `server/src/models/generationJob.model.js`, `server/src/services/workflow.service.js`, `server/src/controllers/workflow.controller.js`.

### Phase 10: Hardening, Evaluation & Complete UI
- **Status**: Completed
- **Features**: React + Vite + Tailwind client with dual theme (light/dark tokens), accessible UI components, full routing, evaluation toolkit with 5 synthetic test pairs, `docs/EVALUATION.md`, `docs/API.md`, `docs/MANUAL_TESTING.md`.
- **Test Run Results**: All 32 server Vitest tests passing, client builds with 0 errors, evaluation script reports 80.8% F1 with 0% unsupported claims.
