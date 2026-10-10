# HireMate AI: Architectural & Design Decisions

| ID | Decision | Rationale | Alternatives Considered |
|---|---|---|---|
| DEC-001 | Single-root .env with client & server separation | Simplicity and strict compliance with Section 2 specification. | Nested .env files |
| DEC-002 | Pure Node.js scoring engine | Ensures deterministic, 100% testable mathematical scoring without model hallucinations. | Letting LLM generate raw scores directly |
| DEC-003 | Firebase Auth token mock mode for local testing | Allows end-to-end testing and test runner execution without requiring live Firebase Admin credentials. | Disabling auth in tests |
| DEC-004 | In-memory PDF processing | Avoids ephemeral disk dependencies on platforms like Render; enhances security by not storing raw PDFs on disk. | Writing temp files to /tmp |
| DEC-005 | Shared constants as pure ESM | Imported seamlessly by server and client without requiring complex build steps or monorepo bundlers. | Publishing internal npm package |
| DEC-006 | Adaptive difficulty evaluation on 5-attempt window | Prevents erratic difficulty spikes while ensuring personalized difficulty progression. | Per-attempt updating |
