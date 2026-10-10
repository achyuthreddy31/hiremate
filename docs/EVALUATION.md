# HireMate AI: Evaluation Benchmark & Methodology

## 1. Overview
The HireMate AI evaluation toolkit is located in `evaluation/`. It assesses the accuracy, consistency, and grounding compliance of the requirement extraction and skill-matching pipeline against a ground-truth dataset of synthetic, anonymized job descriptions and resumes.

---

## 2. Benchmark Dataset
Located in `evaluation/dataset/benchmark_pairs.json`.
Contains 5 synthetic pairs across diverse engineering roles:
- Full Stack Engineer (CloudScale Inc)
- Backend Python Developer (DataStream Corp)
- Frontend React Specialist (DesignFirst Media)
- DevOps / Infrastructure Engineer (SaaS Platform)
- AI Application Engineer (Cognitive AI)

Each test pair specifies:
- Raw Job Description
- Raw Resume Text
- Expected Requirements list
- Expected Skills list
- Expected Requirement Status breakdown (`strong`, `good`, `needs_improvement`, `missing`)

---

## 3. Evaluation Metrics Reported
1. **Requirement Precision, Recall, and F1 Score**: Measures coverage of job requirement detection against ground-truth labels.
2. **Valid-JSON Rate**: Percentage of model and pipeline outputs conforming strictly to expected schemas.
3. **Unsupported-Claim Rate**: Percentage of quoted evidence strings not found in source text (enforced at 0% via code verification).
4. **Repeated-Run Consistency**: Agreement between multiple pipeline runs on identical inputs (100% for deterministic engine).
5. **API Pipeline Latency**: Mean latency across execution stages.

---

## 4. Running the Benchmark
```bash
# Run evaluation benchmark from workspace root
npm run eval
```

When a live `GEMINI_API_KEY` is present, the suite evaluates live model responses with fallback to deterministic validation.

---

## 5. Candidate User-Experience (UX) Measures to Collect
In staging and user trials, the following UX telemetry is tracked:
1. **Task Completion Rate**: Percentage of users who complete their daily preparation roadmap tasks.
2. **Score-Explanation Clarity**: User rating (1-5) on whether the "Why" panels clearly explained why a skill was marked Strong, Good, Needs Improvement, or Missing.
3. **Preparedness Confidence**: User self-assessed confidence change from Day 1 to the final checklist.
