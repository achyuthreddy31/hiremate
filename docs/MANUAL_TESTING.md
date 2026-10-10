# Manual Testing Guide for HireMate AI

This document catalogs every integration, flow, and check that requires real credentials (Firebase, MongoDB Atlas, Gemini API).

---

## 1. Firebase Authentication & Admin SDK
**Required Credentials**:
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`

**Manual Checks**:
1. **User Sign Up & Email Verification**: Create a new account with email/password; confirm Firebase user record created.
2. **User Login & Session Persistence**: Log in, refresh browser, and verify token refresh on protected API requests.
3. **Password Reset**: Send password reset email; confirm email delivery via Firebase console.
4. **Token Verification on Backend**: Ensure invalid or expired tokens return `401 Unauthorized`.
5. **Account Deletion**: Request account deletion; verify user removed from Firebase Auth and MongoDB.

---

## 2. MongoDB Atlas Database
**Required Credentials**: `MONGODB_URI`

**Manual Checks**:
1. **Connection & Schema Indexing**: Verify connection succeeds and indexes on `firebaseUid` and `applicationId` are active.
2. **Cascade Delete**: Delete an application and verify cascade deletion of Resume, JobAnalysis, MatchReport, Roadmap, PracticeQuestions, etc.
3. **Data Isolation**: Query collections directly to ensure cross-user documents are never returned.

---

## 3. Gemini API (`@google/genai`)
**Required Credentials**: `GEMINI_API_KEY`, `GEMINI_MODEL=gemini-2.5-flash`

**Manual Checks**:
1. **Job Analysis Extraction**: Submit a real job posting; check structured JSON response and quote verification.
2. **Resume Parsing**: Upload a complex PDF resume; check extracted skills, experience intervals, and action verb ratios.
3. **Google Search Grounding (Company Research)**: Run company research on a real target company (e.g. Google, Microsoft); verify that sources contain live URLs and UTF-8 byte spans cover statements.
4. **Practice Questions Generation**: Generate 10-question tests; check validity, option shuffling, and non-empty explanations.
5. **Resume Suggestions**: Request truthful suggestions; verify `needsUserInput` is returned when metric is missing.

---

## 4. Local Test Mode (Without Real Credentials)
- All scoring formulas (skill normalization, evidence points, job match, readiness, adaptive difficulty, roadmap allocation) are tested via Vitest mocks.
- Run `npm test` from root to execute all automated test suites.
