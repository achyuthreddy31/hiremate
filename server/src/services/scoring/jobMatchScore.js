/**
 * Deterministic Job Match Score Engine
 * Pure functions implementing Section 3.3.
 */
import { MATCH_SCORE_WEIGHTS, PROVISIONAL_COVERAGE_THRESHOLD, EDUCATION_LEVEL_RANKS } from '../../../../shared/constants.js';
import { RequirementStatus } from '../../../../shared/enums.js';
import { getImportanceMultiplier } from './evidenceScoring.js';

/**
 * Calculates candidate total experience in years.
 * Merges overlapping date intervals; counts internships at 50%.
 *
 * @param {Array<{startDate: string|Date, endDate: string|Date, isInternship: boolean}>} experiences
 * @returns {number} Candidate total years
 */
export function calculateCandidateExperienceYears(experiences = []) {
  if (!Array.isArray(experiences) || experiences.length === 0) return 0;

  // Normalize intervals to milliseconds
  const fullTimeIntervals = [];
  const internshipIntervals = [];

  for (const exp of experiences) {
    if (!exp.startDate) continue;
    const start = new Date(exp.startDate).getTime();
    const end = exp.endDate ? new Date(exp.endDate).getTime() : Date.now();

    if (isNaN(start) || isNaN(end) || end < start) continue;

    if (exp.isInternship) {
      internshipIntervals.push([start, end]);
    } else {
      fullTimeIntervals.push([start, end]);
    }
  }

  // Merge intervals helper
  const mergeIntervals = (intervals) => {
    if (intervals.length === 0) return [];
    intervals.sort((a, b) => a[0] - b[0]);
    const merged = [intervals[0]];
    for (let i = 1; i < intervals.length; i++) {
      const current = intervals[i];
      const last = merged[merged.length - 1];
      if (current[0] <= last[1]) {
        last[1] = Math.max(last[1], current[1]);
      } else {
        merged.push(current);
      }
    }
    return merged;
  };

  const msToYears = (intervals) => {
    const totalMs = intervals.reduce((acc, [s, e]) => acc + (e - s), 0);
    return totalMs / (1000 * 60 * 60 * 24 * 365.25);
  };

  const mergedFullTime = mergeIntervals(fullTimeIntervals);
  const mergedInternships = mergeIntervals(internshipIntervals);

  const fullTimeYears = msToYears(mergedFullTime);
  const internshipYears = msToYears(mergedInternships) * 0.5; // Internships count at 50%

  return Math.round((fullTimeYears + internshipYears) * 10) / 10;
}

/**
 * Calculates Resume Quality score deterministically (0 - 100).
 */
export function calculateResumeQualityScore(checklistData = {}) {
  let score = 0;
  const breakdown = {};

  // Contact details: 10
  if (checklistData.hasContactDetails) {
    score += 10;
    breakdown.contactDetails = 10;
  } else breakdown.contactDetails = 0;

  // Skills section: 15
  if (checklistData.hasSkillsSection) {
    score += 15;
    breakdown.skillsSection = 15;
  } else breakdown.skillsSection = 0;

  // Projects or experience present: 15
  if (checklistData.hasProjectsOrExperience) {
    score += 15;
    breakdown.projectsOrExperience = 15;
  } else breakdown.projectsOrExperience = 0;

  // Education present: 10
  if (checklistData.hasEducation) {
    score += 10;
    breakdown.education = 10;
  } else breakdown.education = 0;

  // At least 60% of bullets start with an action verb: 20
  if (checklistData.actionVerbRatio >= 0.6) {
    score += 20;
    breakdown.actionVerbs = 20;
  } else breakdown.actionVerbs = 0;

  // Sensible length: 10
  if (checklistData.hasSensibleLength) {
    score += 10;
    breakdown.sensibleLength = 10;
  } else breakdown.sensibleLength = 0;

  // Text extracted cleanly: 10
  if (checklistData.isCleanlyExtracted) {
    score += 10;
    breakdown.cleanExtraction = 10;
  } else breakdown.cleanExtraction = 0;

  // Professional links present: 10
  if (checklistData.hasProfessionalLinks) {
    score += 10;
    breakdown.professionalLinks = 10;
  } else breakdown.professionalLinks = 0;

  return { score: Math.min(100, score), breakdown };
}

/**
 * Calculates Job Match Score across 6 categories with re-weighting and provisional status handling.
 */
export function calculateJobMatchScore({
  technicalRequirements = [],
  candidateYears,
  requiredYears,
  dateParseFailed = false,
  candidateProjects = [],
  requiredSkills = [],
  candidateEducationLevel,
  requiredEducationLevel,
  atsKeywords = [],
  resumeText = '',
  resumeQualityChecklist = {}
}) {
  const categoryScores = {};
  const excludedCategories = [];

  // 1. Technical Skills (35)
  // Importance-weighted average of requirement scores for technical categories.
  // insufficient_data requirements excluded and listed separately.
  const validTech = [];
  const insufficientTech = [];

  for (const req of technicalRequirements) {
    if (req.status === RequirementStatus.INSUFFICIENT_DATA) {
      insufficientTech.push(req);
    } else {
      validTech.push(req);
    }
  }

  if (validTech.length > 0) {
    let weightedSum = 0;
    let totalWeight = 0;
    for (const req of validTech) {
      const w = getImportanceMultiplier(req.importance);
      weightedSum += (req.score || 0) * w;
      totalWeight += w;
    }
    categoryScores.technicalSkills = {
      score: Math.round(weightedSum / totalWeight),
      weight: MATCH_SCORE_WEIGHTS.technicalSkills,
      status: 'included',
      explanation: `Calculated from ${validTech.length} technical requirements. ${insufficientTech.length} requirement(s) excluded due to insufficient data.`
    };
  } else {
    categoryScores.technicalSkills = {
      score: 0,
      weight: MATCH_SCORE_WEIGHTS.technicalSkills,
      status: 'insufficient_data',
      explanation: 'No technical requirements had sufficient data to score.'
    };
    excludedCategories.push({
      category: 'technicalSkills',
      reason: 'insufficient_data',
      explanation: 'All technical requirements lacked sufficient data.'
    });
  }

  // 2. Experience (15)
  if (requiredYears === null || requiredYears === undefined || requiredYears === 0) {
    categoryScores.experience = {
      score: 0,
      weight: MATCH_SCORE_WEIGHTS.experience,
      status: 'not_applicable',
      explanation: 'The job posting does not specify a minimum experience requirement.'
    };
    excludedCategories.push({
      category: 'experience',
      reason: 'not_applicable',
      explanation: 'No required experience specified.'
    });
  } else if (dateParseFailed) {
    categoryScores.experience = {
      score: 0,
      weight: MATCH_SCORE_WEIGHTS.experience,
      status: 'insufficient_data',
      explanation: 'Resume experience dates could not be parsed reliably.'
    };
    excludedCategories.push({
      category: 'experience',
      reason: 'insufficient_data',
      explanation: 'Dates could not be parsed.'
    });
  } else {
    const candidateY = typeof candidateYears === 'number' ? candidateYears : 0;
    const ratioScore = Math.min(100, Math.round((candidateY / requiredYears) * 100));
    categoryScores.experience = {
      score: ratioScore,
      weight: MATCH_SCORE_WEIGHTS.experience,
      status: 'included',
      explanation: `${candidateY} candidate year(s) vs ${requiredYears} required year(s).`
    };
  }

  // 3. Projects (15)
  // Relevant project uses at least 1 required normalized skill: 0->0, 1->40, 2->80, >=3->100
  const normalizedReqSkillSet = new Set(requiredSkills.map(s => String(s).toLowerCase().trim()));
  let relevantProjectsCount = 0;

  for (const proj of candidateProjects) {
    const projSkills = (proj.skills || []).map(s => String(s).toLowerCase().trim());
    const isRelevant = projSkills.some(ps => normalizedReqSkillSet.has(ps));
    if (isRelevant) {
      relevantProjectsCount++;
    }
  }

  let projectsScore = 0;
  if (relevantProjectsCount === 1) projectsScore = 40;
  else if (relevantProjectsCount === 2) projectsScore = 80;
  else if (relevantProjectsCount >= 3) projectsScore = 100;

  categoryScores.projects = {
    score: projectsScore,
    weight: MATCH_SCORE_WEIGHTS.projects,
    status: 'included',
    explanation: `${relevantProjectsCount} relevant project(s) matching target job skills.`
  };

  // 4. Education (10)
  if (!requiredEducationLevel || requiredEducationLevel === 'none') {
    categoryScores.education = {
      score: 0,
      weight: MATCH_SCORE_WEIGHTS.education,
      status: 'not_applicable',
      explanation: 'No minimum education level specified by job.'
    };
    excludedCategories.push({
      category: 'education',
      reason: 'not_applicable',
      explanation: 'No education requirement stated.'
    });
  } else {
    const candRank = EDUCATION_LEVEL_RANKS[String(candidateEducationLevel || '').toLowerCase()] || 0;
    const reqRank = EDUCATION_LEVEL_RANKS[String(requiredEducationLevel || '').toLowerCase()] || 0;

    let eduScore = 0;
    if (candRank >= reqRank) {
      eduScore = 100;
    } else if (candRank === reqRank - 1) {
      eduScore = 50;
    } else {
      eduScore = 0;
    }

    categoryScores.education = {
      score: eduScore,
      weight: MATCH_SCORE_WEIGHTS.education,
      status: 'included',
      explanation: `Candidate education level rank ${candRank} vs required rank ${reqRank}.`
    };
  }

  // 5. Keywords (15)
  if (!atsKeywords || atsKeywords.length === 0) {
    categoryScores.keywords = {
      score: 100,
      weight: MATCH_SCORE_WEIGHTS.keywords,
      status: 'included',
      explanation: 'No explicit ATS keywords required; full credit awarded.'
    };
  } else {
    const lowerResume = (resumeText || '').toLowerCase();
    let foundCount = 0;
    for (const kw of atsKeywords) {
      if (lowerResume.includes(String(kw).toLowerCase().trim())) {
        foundCount++;
      }
    }
    const kwScore = Math.round((foundCount / atsKeywords.length) * 100);
    categoryScores.keywords = {
      score: kwScore,
      weight: MATCH_SCORE_WEIGHTS.keywords,
      status: 'included',
      explanation: `Found ${foundCount} of ${atsKeywords.length} ATS keywords in resume.`
    };
  }

  // 6. Resume Quality (10)
  const quality = calculateResumeQualityScore(resumeQualityChecklist);
  categoryScores.resumeQuality = {
    score: quality.score,
    weight: MATCH_SCORE_WEIGHTS.resumeQuality,
    status: 'included',
    explanation: 'Deterministic resume formatting and content structure check.',
    breakdown: quality.breakdown
  };

  // Re-weighting calculation over INCLUDED categories only
  let totalNumerator = 0;
  let includedWeightsSum = 0;

  for (const [catKey, catData] of Object.entries(categoryScores)) {
    if (catData.status === 'included') {
      totalNumerator += catData.score * catData.weight;
      includedWeightsSum += catData.weight;
    }
  }

  const finalTotal = includedWeightsSum > 0 ? Math.round(totalNumerator / includedWeightsSum) : 0;
  const coverage = includedWeightsSum;
  const isProvisional = coverage < PROVISIONAL_COVERAGE_THRESHOLD;

  return {
    total: finalTotal,
    coverage,
    isProvisional,
    categoryScores,
    excludedCategories,
    insufficientRequirements: insufficientTech,
    disclaimer: 'HireMate AI alignment score reflects target job alignment and preparation progress. It is never a hiring probability.'
  };
}
