import { z } from 'zod';
import { normalizeSkill } from './scoring/skillNormalization.js';
import { verifyQuoteInSource, callGeminiStructured } from './gemini.service.js';
import { calculateRequirementScore } from './scoring/evidenceScoring.js';
import { calculateJobMatchScore } from './scoring/jobMatchScore.js';
import { EvidenceType } from '../../../shared/enums.js';

export const jobAnalysisOutputSchema = z.object({
  requirements: z.array(z.object({
    name: z.string(),
    requiredOrPreferred: z.enum(['required', 'preferred']).default('required'),
    importance: z.enum(['critical', 'important', 'beneficial']).default('important'),
    evidenceQuote: z.string()
  })),
  experienceMinYears: z.number().default(0),
  experienceQuote: z.string().default(''),
  educationLevel: z.enum(['none', 'diploma', 'bachelor', 'master', 'doctorate']).default('bachelor'),
  educationQuote: z.string().default(''),
  atsKeywords: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  assessmentTopics: z.array(z.string()).default([])
});

/**
 * Extracts job requirements deterministically or via structured Gemini call.
 * Enforces quote verification against job description in code.
 */
export async function analyzeJobDescription(jobDescription = '') {
  if (!jobDescription || jobDescription.trim().length < 10) {
    throw new Error('Job description is too short to analyze.');
  }

  const prompt = `
You are analyzing a target job description for a candidate's preparation roadmap.
Data:
<job_description>
${jobDescription}
</job_description>

Extract:
1. Technical and skill requirements. Each requirement MUST contain the exact text quote from the job description where it appears.
2. Required experience years and exact quote.
3. Minimum education level ('none', 'diploma', 'bachelor', 'master', 'doctorate') and exact quote.
4. ATS keywords, responsibilities, and assessment topics.
Return strictly valid JSON conforming to the schema.
`;

  let parsed = null;
  try {
    parsed = await callGeminiStructured({
      systemInstruction: 'You extract job requirements accurately. Never hallucinate skills or quotes not present in the text.',
      prompt,
      schema: jobAnalysisOutputSchema
    });
  } catch (err) {
    console.warn('Gemini job analysis fallback to deterministic extractor:', err.message);
  }

  // Fallback to deterministic dictionary parsing if no Gemini API key or call failed
  if (!parsed) {
    parsed = extractJobRequirementsDeterministically(jobDescription);
  }

  // Code-side verification of quoted evidence in source text
  const validatedRequirements = [];
  for (const req of parsed.requirements) {
    const isVerified = verifyQuoteInSource(req.evidenceQuote, jobDescription);
    const norm = normalizeSkill(req.name);

    validatedRequirements.push({
      name: req.name,
      normalizedName: norm.normalized || req.name,
      category: norm.canonicalSkill?.category || 'concept',
      requiredOrPreferred: req.requiredOrPreferred,
      importance: req.importance,
      evidence: isVerified ? req.evidenceQuote : (isVerified ? req.evidenceQuote : jobDescription.slice(0, 100)),
      confidence: isVerified ? 0.95 : 0.4, // drop confidence if quote doesn't verify
      sourceType: 'job_description',
      uncertain: !isVerified
    });
  }

  return {
    requirements: validatedRequirements,
    experienceRequirement: {
      minYears: parsed.experienceMinYears,
      evidence: parsed.experienceQuote,
      uncertain: !verifyQuoteInSource(parsed.experienceQuote, jobDescription)
    },
    educationRequirement: {
      level: parsed.educationLevel,
      evidence: parsed.educationQuote,
      uncertain: !verifyQuoteInSource(parsed.educationQuote, jobDescription)
    },
    atsKeywords: (parsed.atsKeywords || []).map(kw => ({ keyword: kw, category: 'general' })),
    responsibilities: parsed.responsibilities || [],
    assessmentTopics: parsed.assessmentTopics || []
  };
}

/**
 * Deterministic fallback extractor for job descriptions.
 */
export function extractJobRequirementsDeterministically(jobDescription = '') {
  const words = jobDescription.split(/[\s,;|/()]+/).filter(Boolean);
  const matchedSkills = new Map();

  for (const rawWord of words) {
    const word = rawWord.replace(/^[.,:;]+|[.,:;]+$/g, '').trim();
    if (word.length < 2) continue;
    const norm = normalizeSkill(word);
    if (norm.normalized && !matchedSkills.has(norm.normalized)) {
      // Find a sentence containing this word as quote evidence
      const sentenceRegex = new RegExp(`([^.?!]*?\\b${word}\\b[^.?!]*)`, 'i');
      const match = jobDescription.match(sentenceRegex);
      const quote = match ? match[0].trim() : word;

      matchedSkills.set(norm.normalized, {
        name: norm.original,
        evidenceQuote: quote,
        requiredOrPreferred: 'required',
        importance: 'important'
      });
    }
  }

  // Detect experience years (e.g., "3+ years", "5 years of experience")
  const expMatch = jobDescription.match(/(\d+)\+?\s*years?(?:\s+of)?\s+experience/i);
  const expYears = expMatch ? parseInt(expMatch[1], 10) : 0;
  const expQuote = expMatch ? expMatch[0] : '';

  // Detect education
  let eduLevel = 'bachelor';
  let eduQuote = '';
  if (/master'?s|m\.s\.|postgraduate/i.test(jobDescription)) {
    eduLevel = 'master';
    eduQuote = "Master's degree preferred";
  } else if (/bachelor'?s|b\.s\.|undergraduate/i.test(jobDescription)) {
    eduLevel = 'bachelor';
    eduQuote = "Bachelor's degree required";
  }

  return {
    requirements: Array.from(matchedSkills.values()),
    experienceMinYears: expYears,
    experienceQuote: expQuote,
    educationLevel: eduLevel,
    educationQuote: eduQuote,
    atsKeywords: Array.from(matchedSkills.keys()),
    responsibilities: ['Develop and maintain software solutions.', 'Collaborate with cross-functional teams.'],
    assessmentTopics: Array.from(matchedSkills.keys()).slice(0, 5)
  };
}

/**
 * Evaluates candidate profile against job analysis and computes deterministic match report.
 */
export function generateMatchReportData({
  jobAnalysis,
  candidateProfile,
  resumeQualityChecklist = {},
  resumeText = ''
}) {
  const candidateSkillMap = new Map();
  for (const s of (candidateProfile?.skills || [])) {
    candidateSkillMap.set((s.normalizedName || s.name).toLowerCase(), s);
  }

  const requirementsResults = [];
  const requiredSkillsList = [];

  for (const req of (jobAnalysis.requirements || [])) {
    const reqKey = (req.normalizedName || req.name).toLowerCase();
    requiredSkillsList.push(req.normalizedName || req.name);

    const candSkill = candidateSkillMap.get(reqKey);
    const evidenceItems = [];

    if (candSkill) {
      // Build evidence items
      const evType = candSkill.source === 'profile' ? EvidenceType.MENTION_ONLY : EvidenceType.PERSONAL_PROJECT;
      evidenceItems.push({
        evidenceType: evType,
        quote: candSkill.name,
        confidence: 0.9
      });
    }

    const scoringResult = calculateRequirementScore(evidenceItems);

    let explanation = '';
    let action = '';

    if (scoringResult.status === 'strong') {
      explanation = `Demonstrated solid verified evidence for ${req.normalizedName}.`;
      action = 'Keep sharp with practice questions and refine key interview stories.';
    } else if (scoringResult.status === 'good') {
      explanation = `Good foundational evidence for ${req.normalizedName}, but could benefit from practical depth.`;
      action = 'Review core architectural patterns and complete targeted coding practice.';
    } else if (scoringResult.status === 'needs_improvement') {
      explanation = `Only single mention or limited evidence detected for ${req.normalizedName}. Single mentions cannot be rated strong.`;
      action = 'Add project evidence, practice code implementations, or complete course certification.';
    } else {
      explanation = `No evidence found in candidate profile or resume for required skill ${req.normalizedName}.`;
      action = 'Allocate high-priority roadmap study time and build focused project proof.';
    }

    requirementsResults.push({
      requirementRef: req._id ? req._id.toString() : req.normalizedName,
      name: req.name,
      normalizedName: req.normalizedName,
      category: req.category,
      importance: req.importance,
      status: scoringResult.status,
      score: scoringResult.score,
      evidenceItems,
      confidence: scoringResult.status === 'insufficient_data' ? 0.4 : 0.9,
      explanation,
      recommendedAction: action
    });
  }

  // Calculate full Job Match Score across 6 categories
  const matchScoreResult = calculateJobMatchScore({
    technicalRequirements: requirementsResults,
    candidateYears: candidateProfile?.calculatedExperienceYears || 0,
    requiredYears: jobAnalysis.experienceRequirement?.minYears || 0,
    candidateProjects: candidateProfile?.projects || [],
    requiredSkills: requiredSkillsList,
    candidateEducationLevel: candidateProfile?.highestEducationLevel || 'bachelor',
    requiredEducationLevel: jobAnalysis.educationRequirement?.level || 'bachelor',
    atsKeywords: (jobAnalysis.atsKeywords || []).map(k => k.keyword),
    resumeText,
    resumeQualityChecklist
  });

  return {
    totalScore: matchScoreResult.total,
    coverage: matchScoreResult.coverage,
    isProvisional: matchScoreResult.isProvisional,
    requirementsResults,
    categoryScores: matchScoreResult.categoryScores,
    excludedCategories: matchScoreResult.excludedCategories,
    disclaimer: matchScoreResult.disclaimer,
    promptVersion: '1.0.0'
  };
}
