# HireMate AI: Scoring and Evidence Rubric (Deterministic)

All scores are computed strictly in Node.js backend code. Gemini extracts evidence, quotes, and explanations, but never produces numbers used in scoring formulas.

---

## 1. Skill Dictionary & Normalization
- Canonical dictionary contains 150+ skills across languages, frameworks, databases, cloud, tools, and computer science concepts.
- `normalizeSkill(text)` matches against canonical names and aliases.
- Unmatched terms are kept with `normalized: null` and flagged.
- Original job/candidate wording is always retained as evidence.

---

## 2. Evidence Strength Points & Requirement Scoring

### Evidence Points Table
| Evidence Type | Points |
|---|---|
| `mention_only` | 15 |
| `course_or_certificate` | 35 |
| `academic_project` | 55 |
| `personal_project` | 65 |
| `internship` | 80 |
| `professional_experience` | 90 |

### Requirement Score Formula
$$\text{Requirement Score} = \min(100, \text{highestEvidencePoints} + (5 \times \text{additionalDistinctItems}))$$

**Practice Bonus**: When a candidate has $\ge 5$ practice attempts on that skill with accuracy $\ge 70\%$, add $+10$ points (capped at 100) and record `successful_practice` as evidence.

### Requirement Status Thresholds
- **`missing`**: No evidence at all.
- **`insufficient_data`**: Evidence exists but highest confidence $< 0.5$, or resume could not be parsed.
- **`strong`**: Requirement score $\ge 75$. (Note: a skill mentioned only once gets $15$, so single mentions can never be strong).
- **`good`**: Requirement score between $50$ and $74$.
- **`needs_improvement`**: Requirement score between $1$ and $49$.

### Requirement Importance Weights
- `critical`: Weight = 3
- `important`: Weight = 2
- `beneficial`: Weight = 1

---

## 3. Job Match Score (0 - 100)

### Categories & Default Weights
| Category | Weight | Description |
|---|---|---|
| **Technical Skills** | 35 | Importance-weighted average of requirement scores for technical categories. `insufficient_data` requirements are excluded and listed separately. |
| **Experience** | 15 | $\min(100, (\text{candidateYears} / \text{requiredYears}) \times 100)$. Internships count at $50\%$; overlapping date ranges are merged. If no required years stated, category is `not_applicable`. If candidate dates cannot be parsed, category is `insufficient_data`. |
| **Projects** | 15 | Relevant projects count (uses at least 1 required normalized skill): 0 projects $\to 0$, 1 project $\to 40$, 2 projects $\to 80$, $\ge 3$ projects $\to 100$. |
| **Education** | 10 | Degree levels: Diploma = 1, Bachelor = 2, Master = 3, Doctorate = 4. Candidate at or above requirement $\to 100$, 1 level below $\to 50$, otherwise $\to 0$. If no stated requirement, category is `not_applicable`. |
| **Keywords** | 15 | Percentage of the job description ATS keywords (normalized) found in resume text. |
| **Resume Quality** | 10 | Deterministic checklist (max 100): Contact details (10), Skills section (15), Projects/Experience present (15), Education present (10), $\ge 60\%$ of bullets start with action verbs (20), Sensible length (10), Text extracted cleanly (10), Professional links present (10). |

### Re-weighting and Provisional Status
- Total score is calculated only over **included** categories:
  $$\text{Total Match Score} = \frac{\sum_{\text{included}} (\text{Category Score} \times \text{Category Weight})}{\sum_{\text{included}} \text{Category Weight}}$$
- Excluded categories (`not_applicable` or `insufficient_data`) are shown separately with explicit explanations.
- **Coverage**: Sum of included category weights out of 100.
- If **$\text{Coverage} < 60$**, the score is explicitly flagged as **provisional**.
- Missing information is never silently treated as zero.

---

## 4. Interview Readiness Score (0 - 100)

Measures active preparation effort across 7 core areas:
| Area | Weight | Definition |
|---|---|---|
| **Skill Match** | 25 | Current Job Match Score total. |
| **Coding** | 15 | Average accuracy on auto-graded coding items (debugging, output prediction, code reading). AI-reviewed code-writing does not affect score. |
| **Practice Tests** | 15 | Average accuracy of the candidate's last 3 submitted tests. |
| **Resume** | 15 | Resume Quality category score. |
| **Interview Preparation** | 15 | $80\% \times (\frac{\text{preparedQuestions}}{\text{totalGeneratedQuestions}}) + 20\% \times (\frac{\text{interviewChecklistItemsDone}}{\text{totalChecklistItems}})$. |
| **Company Knowledge** | 10 | Average of available values: latest company quiz score, and $\%$ of company research sections reviewed. |
| **Roadmap Completion** | 5 | $\frac{\text{completedTasks}}{\text{totalTasks}} \times 100\%$. |

### Unstarted Categories
- Any area with no activity yet is marked **`not_started`** and contributes **0** to readiness (reflecting effort needed).
- The UI reports: "X of 7 areas started".

---

## 5. Adaptive Difficulty Engine
- Tracked per topic: `easy`, `medium`, `hard`.
- Evaluated only after $\ge 5$ attempts, considering the last 5:
  - Accuracy $\ge 80\%$ AND median time $\le$ expected time $\to$ promote 1 level.
  - Accuracy $< 40\%$ $\to$ demote 1 level.
  - Otherwise $\to$ maintain level.
- Maximum 1 level shift per 5-attempt evaluation window.
- User manual overrides are respected.
- After 3 sessions on a topic with accuracy $< 50\%$, add a foundational task to the roadmap.

---

## 6. Roadmap Allocation Algorithm
1. Available days $D = \min(\text{userAvailableDays}, \text{daysUntilInterview})$. If no interview date, $D = 14$.
2. Total preparation minutes $M = D \times \text{dailyPreparationMinutes}$. The final day is reserved for revision and final checklist.
3. Rank gaps by priority score: $\text{importanceWeight} \times (100 - \text{requirementScore})$.
4. Allocate time proportionally across gaps with minimum slot size of 20 minutes.
5. If total minutes cannot cover all gaps, prioritize critical gaps and flag remaining gaps as "not covered in time available".
6. Code builds the dated slots; Gemini provides only task title, learning activity, practice activity, and rationale.
