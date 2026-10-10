# HireMate AI API Documentation (v1)

Base URL: `/api/v1`
Standard Response Envelope:
```json
{
  "success": true,
  "data": { ... }
}
```
Standard Error Envelope:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable explanation",
    "details": []
  }
}
```

---

## 1. System Health
- `GET /health`: Server health check, uptime, and timestamp.

---

## 2. Authentication & User Profile
- `GET /users/profile`: Fetch authenticated user profile.
- `PUT /users/profile`: Create or update user profile (education, skills, experience, projects, links).
- `DELETE /users/account`: Cascade delete user profile and all application records.

---

## 3. Target Applications
- `GET /applications`: List all target applications for the verified user.
- `POST /applications`: Create target application (company, title, description, interview date, study minutes).
- `GET /applications/:id`: Fetch application details by ID.
- `PUT /applications/:id`: Update application details.
- `DELETE /applications/:id`: Delete application and cascade delete all associated preparation modules.

---

## 4. In-Memory Resume Processing
- `POST /resumes/upload`: Upload PDF resume in-memory (`multipart/form-data`), extract text via `pdf-parse`, compute quality checklist.
- `GET /resumes/:applicationId`: Fetch parsed resume and quality checklist.
- `PUT /resumes/:applicationId`: Update parsed resume fields (verified edits win).

---

## 5. Job Analysis & Match Scoring
- `POST /jobs/analyze/:applicationId`: Extract structured requirements, experience, and ATS keywords.
- `GET /jobs/analysis/:applicationId`: Fetch job analysis.
- `POST /jobs/match/:applicationId`: Compute deterministic Job Match Score and versioned `MatchReport`.
- `GET /jobs/match/:applicationId`: Get latest `MatchReport`.
- `GET /jobs/history/:applicationId`: Get versioned match history.

---

## 6. Grounded Company Research & Quiz
- `POST /company/generate/:applicationId`: Generate grounded company facts with UTF-8 byte span verification.
- `GET /company/:applicationId`: Get company facts, reviewed status, and quiz.
- `POST /company/review/:applicationId`: Toggle section reviewed status.
- `POST /company/quiz/:applicationId`: Submit answers to verified company quiz.

---

## 7. Preparation Roadmap & Learning
- `POST /roadmap/generate/:applicationId`: Proportionally allocate study time across gaps into dated slots.
- `GET /roadmap/:applicationId`: Fetch preparation roadmap.
- `PATCH /roadmap/:applicationId/tasks/:taskId`: Update task status (`pending`, `completed`, `skipped`).
- `GET /roadmap/recommendations/:applicationId`: Fetch grounded search recommendations for skill gaps.

---

## 8. Practice & Auto-Graded Coding
- `POST /practice/generate/:applicationId`: Generate 10 curated questions (MCQ, debugging, output prediction, code reading).
- `GET /practice/:applicationId`: Fetch active practice questions (answers hidden).
- `POST /practice/submit/:applicationId/:questionId`: Submit answer; returns correctness, explanation, and adaptive difficulty.
- `GET /practice/performance/:applicationId`: Get topic performance accuracy.

---

## 9. Interview Preparation
- `POST /interview-prep/generate/:applicationId`: Generate technical questions, STAR guidance, behavioral questions, and resume questions.
- `GET /interview-prep/:applicationId`: Get interview preparation dataset.
- `PATCH /interview-prep/:applicationId/questions/:questionType/:questionIndex`: Toggle prepared status or update private reflection notes.
- `GET /interview-prep/resume-improvements/:applicationId`: Get truthful resume improvements with `needsUserInput` metric prompts.

---

## 10. Readiness, Final Checklist & Dashboard
- `POST /readiness/readiness/:applicationId`: Calculate and record `ReadinessSnapshot` across 7 core areas.
- `GET /readiness/readiness/:applicationId`: Get latest readiness snapshot.
- `POST /readiness/checklist/:applicationId`: Generate final pre-interview checklist.
- `GET /readiness/checklist/:applicationId`: Get final checklist.
- `PATCH /readiness/checklist/:applicationId/:itemIndex`: Update checklist item status.
- `GET /readiness/overview/:applicationId`: Dashboard aggregation for active target application.

---

## 11. Staged Generation Workflow ("Prepare Completely")
- `POST /workflow/start/:applicationId`: Initiate or resume 15-stage workflow with idempotency support.
- `GET /workflow/status/:applicationId`: Poll status and progress percentage of background `GenerationJob`.
