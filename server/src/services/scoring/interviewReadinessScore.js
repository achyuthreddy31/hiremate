/**
 * Interview Readiness Score (0 - 100)
 * Pure functions strictly implementing Section 3.4.
 *
 * Weights:
 * Skill Match: 25
 * Coding: 15
 * Practice Tests: 15
 * Resume: 15
 * Interview Preparation: 15
 * Company Knowledge: 10
 * Roadmap Completion: 5
 */
import { READINESS_SCORE_WEIGHTS } from '../../../../shared/constants.js';

/**
 * Calculates the overall Interview Readiness Score.
 * Any unstarted area contributes 0 to the total (effort-based model).
 */
export function calculateInterviewReadinessScore({
  skillMatchTotal = 0,
  codingAttempts = [],
  practiceTestScores = [],
  resumeQualityScore = 0,
  interviewPrepData = { preparedQuestions: 0, totalQuestions: 0, checklistDone: 0, totalChecklist: 0 },
  companyKnowledgeData = { quizScore: null, sectionsReviewedRatio: null },
  roadmapData = { completedTasks: 0, totalTasks: 0 }
}) {
  const categories = {};
  let areasStartedCount = 0;

  // 1. Skill Match (25)
  // Current Job Match total
  const skillMatchStarted = typeof skillMatchTotal === 'number' && skillMatchTotal > 0;
  if (skillMatchStarted) areasStartedCount++;
  categories.skillMatch = {
    score: skillMatchTotal || 0,
    weight: READINESS_SCORE_WEIGHTS.skillMatch,
    status: skillMatchStarted ? 'active' : 'not_started',
    explanation: skillMatchStarted ? `Based on Job Match Score: ${skillMatchTotal}/100` : 'Complete job analysis and match calculation to start this area.'
  };

  // 2. Coding (15)
  // Average accuracy on auto-graded coding items (debugging, output prediction, code reading)
  // Note: AI-reviewed code-writing does NOT affect the score!
  const autoGradedTypes = ['debugging', 'output_prediction', 'code_reading', 'coding_mcq'];
  const validCodingAttempts = (codingAttempts || []).filter(a => autoGradedTypes.includes(a.type));

  const codingStarted = validCodingAttempts.length > 0;
  let codingScore = 0;
  if (codingStarted) {
    areasStartedCount++;
    const correctCount = validCodingAttempts.filter(a => a.isCorrect).length;
    codingScore = Math.round((correctCount / validCodingAttempts.length) * 100);
  }
  categories.coding = {
    score: codingScore,
    weight: READINESS_SCORE_WEIGHTS.coding,
    status: codingStarted ? 'active' : 'not_started',
    explanation: codingStarted ? `Auto-graded coding accuracy: ${codingScore}% over ${validCodingAttempts.length} problem(s).` : 'No auto-graded coding questions completed yet.'
  };

  // 3. Practice Tests (15)
  // Average of user's last 3 submitted tests (called "Practice Tests", never "Mock Tests")
  const testsStarted = Array.isArray(practiceTestScores) && practiceTestScores.length > 0;
  let practiceTestsScore = 0;
  if (testsStarted) {
    areasStartedCount++;
    const lastThree = practiceTestScores.slice(-3);
    const sum = lastThree.reduce((acc, s) => acc + s, 0);
    practiceTestsScore = Math.round(sum / lastThree.length);
  }
  categories.practiceTests = {
    score: practiceTestsScore,
    weight: READINESS_SCORE_WEIGHTS.practiceTests,
    status: testsStarted ? 'active' : 'not_started',
    explanation: testsStarted ? `Average of last ${Math.min(3, practiceTestScores.length)} practice test(s): ${practiceTestsScore}%` : 'Take your first 10-question practice test to start this area.'
  };

  // 4. Resume (15)
  // Resume Quality category score
  const resumeStarted = typeof resumeQualityScore === 'number' && resumeQualityScore > 0;
  if (resumeStarted) areasStartedCount++;
  categories.resume = {
    score: resumeQualityScore || 0,
    weight: READINESS_SCORE_WEIGHTS.resume,
    status: resumeStarted ? 'active' : 'not_started',
    explanation: resumeStarted ? `Resume Quality score: ${resumeQualityScore}/100` : 'Upload and verify resume to evaluate quality.'
  };

  // 5. Interview Preparation (15)
  // 80% * (prepared questions / generated questions) + 20% * (checklist items done / total)
  const totalQuestions = interviewPrepData?.totalQuestions || 0;
  const prepQuestions = interviewPrepData?.preparedQuestions || 0;
  const totalChecklist = interviewPrepData?.totalChecklist || 0;
  const checklistDone = interviewPrepData?.checklistDone || 0;

  const prepStarted = totalQuestions > 0 || totalChecklist > 0;
  let interviewPrepScore = 0;
  if (prepStarted) {
    areasStartedCount++;
    const qRatio = totalQuestions > 0 ? (prepQuestions / totalQuestions) : 0;
    const cRatio = totalChecklist > 0 ? (checklistDone / totalChecklist) : 0;
    interviewPrepScore = Math.round(((0.8 * qRatio) + (0.2 * cRatio)) * 100);
  }
  categories.interviewPrep = {
    score: interviewPrepScore,
    weight: READINESS_SCORE_WEIGHTS.interviewPrep,
    status: prepStarted ? 'active' : 'not_started',
    explanation: prepStarted ? `${prepQuestions}/${totalQuestions} questions prepared, ${checklistDone}/${totalChecklist} checklist items completed.` : 'Review prepared interview questions and stage checklist.'
  };

  // 6. Company Knowledge (10)
  // Average of available values: latest company quiz score, and % of research sections reviewed
  const quizScore = companyKnowledgeData?.quizScore;
  const sectionsRatio = companyKnowledgeData?.sectionsReviewedRatio;
  const availableCompanyVals = [];

  if (typeof quizScore === 'number') availableCompanyVals.push(quizScore);
  if (typeof sectionsRatio === 'number') availableCompanyVals.push(Math.round(sectionsRatio * 100));

  const companyStarted = availableCompanyVals.length > 0;
  let companyScore = 0;
  if (companyStarted) {
    areasStartedCount++;
    const sum = availableCompanyVals.reduce((a, b) => a + b, 0);
    companyScore = Math.round(sum / availableCompanyVals.length);
  }
  categories.companyKnowledge = {
    score: companyScore,
    weight: READINESS_SCORE_WEIGHTS.companyKnowledge,
    status: companyStarted ? 'active' : 'not_started',
    explanation: companyStarted ? `Average of company quiz (${quizScore ?? 'N/A'}) and research reviewed (${typeof sectionsRatio === 'number' ? Math.round(sectionsRatio * 100) + '%' : 'N/A'}).` : 'Review company research sections and take the company quiz.'
  };

  // 7. Roadmap Completion (5)
  // completed tasks / total tasks
  const totalTasks = roadmapData?.totalTasks || 0;
  const completedTasks = roadmapData?.completedTasks || 0;
  const roadmapStarted = totalTasks > 0;
  let roadmapScore = 0;
  if (roadmapStarted) {
    areasStartedCount++;
    roadmapScore = Math.round((completedTasks / totalTasks) * 100);
  }
  categories.roadmapCompletion = {
    score: roadmapScore,
    weight: READINESS_SCORE_WEIGHTS.roadmapCompletion,
    status: roadmapStarted ? 'active' : 'not_started',
    explanation: roadmapStarted ? `${completedTasks} of ${totalTasks} roadmap tasks completed.` : 'Generate and start your preparation roadmap.'
  };

  // Total calculation: sum(score * weight) / 100
  // Categories marked 'not_started' contribute 0
  let totalScoreSum = 0;
  for (const cat of Object.values(categories)) {
    if (cat.status === 'active') {
      totalScoreSum += (cat.score * cat.weight);
    }
  }

  const finalReadinessScore = Math.round(totalScoreSum / 100);

  return {
    total: finalReadinessScore,
    areasStartedCount,
    totalAreas: 7,
    statusSummary: `${areasStartedCount} of 7 areas started`,
    categories,
    disclaimer: 'HireMate AI Interview Readiness Score measures candidate preparation effort and completeness. It is never a chance of being selected.'
  };
}
