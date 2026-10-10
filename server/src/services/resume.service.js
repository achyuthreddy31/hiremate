import pdfParse from 'pdf-parse';
import { normalizeSkill } from './scoring/skillNormalization.js';
import { calculateResumeQualityScore } from './scoring/jobMatchScore.js';

// Common action verbs for resume bullet points
const ACTION_VERBS = new Set([
  'built', 'developed', 'created', 'designed', 'implemented', 'engineered', 'led',
  'managed', 'architected', 'spearheaded', 'orchestrated', 'optimized', 'reduced',
  'increased', 'improved', 'automated', 'delivered', 'deployed', 'scaled', 'refactored',
  'integrated', 'maintained', 'analyzed', 'collaborated', 'authored', 'established',
  'launched', 'mentored', 'streamlined', 'resolved', 'programmed', 'tested'
]);

/**
 * Extracts raw text from an in-memory PDF buffer using pdf-parse.
 */
export async function extractTextFromPdf(buffer) {
  try {
    const data = await pdfParse(buffer);
    const text = data.text || '';
    if (!text.trim()) {
      throw new Error('PDF appears to be empty or scanned (no selectable text found). Please upload a text-based PDF resume.');
    }
    return {
      text,
      numPages: data.numpages,
      info: data.info
    };
  } catch (err) {
    throw new Error(`Failed to extract text from PDF: ${err.message}`);
  }
}

/**
 * Analyzes resume text quality deterministically.
 */
export function analyzeResumeQuality(text = '') {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Contact details check
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
  const hasContactDetails = hasEmail && hasPhone;

  // Skills section check
  const hasSkillsSection = /skills|technical skills|technologies|proficiencies/i.test(text);

  // Projects or Experience check
  const hasExperience = /experience|employment|work history|internship/i.test(text);
  const hasProjects = /projects|portfolio|personal projects/i.test(text);
  const hasProjectsOrExperience = hasExperience || hasProjects;

  // Education check
  const hasEducation = /education|university|college|degree|bachelor|master|b\.s|m\.s/i.test(text);

  // Professional links
  const hasGithub = /github\.com/i.test(text);
  const hasLinkedin = /linkedin\.com/i.test(text);
  const hasProfessionalLinks = hasGithub || hasLinkedin;

  // Bullet point action verb analysis: match lines starting with bullet symbols
  const explicitBullets = lines.filter(l => /^[•\-*]\s+/.test(l));
  const candidateBullets = explicitBullets.length > 0 ? explicitBullets : lines.filter(l => l.length > 30);

  let actionVerbCount = 0;
  for (const b of candidateBullets) {
    const cleanBullet = b.replace(/^[•\-*\s]+/, '').trim();
    const firstWord = cleanBullet.split(/\s+/)[0]?.toLowerCase();
    if (ACTION_VERBS.has(firstWord)) {
      actionVerbCount++;
    }
  }
  const actionVerbRatio = candidateBullets.length > 0 ? (actionVerbCount / candidateBullets.length) : 0.65;

  // Sensible length: between 150 and 2000 words
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const hasSensibleLength = wordCount >= 30 && wordCount <= 2000;

  // Clean extraction: low ratio of weird symbols
  const weirdChars = (text.match(/[\ufffd\x00-\x08\x0B\x0C\x0E-\x1F]/g) || []).length;
  const isCleanlyExtracted = weirdChars < 10;

  const qualityChecklist = {
    hasContactDetails,
    hasSkillsSection,
    hasProjectsOrExperience,
    hasEducation,
    actionVerbRatio: Math.min(1.0, Math.round(actionVerbRatio * 100) / 100),
    hasSensibleLength,
    isCleanlyExtracted,
    hasProfessionalLinks
  };

  const scoreResult = calculateResumeQualityScore(qualityChecklist);

  return {
    checklist: qualityChecklist,
    score: scoreResult.score,
    breakdown: scoreResult.breakdown
  };
}

/**
 * Deterministic parser for structured resume fields from text.
 */
export function parseResumeFields(text = '') {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : '';

  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  const githubMatch = text.match(/https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
  const linkedinMatch = text.match(/https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);

  // Extract skills by cleaning tokens and matching canonical dictionary
  const foundSkills = [];
  const rawTokens = text.split(/[\s,;|/()]+/).filter(Boolean);
  const checked = new Set();

  for (const rawToken of rawTokens) {
    // Strip trailing punctuation like dots or commas
    const token = rawToken.replace(/^[.,:;]+|[.,:;]+$/g, '').trim();
    if (token.length < 2) continue;
    const lower = token.toLowerCase();
    if (checked.has(lower)) continue;
    checked.add(lower);

    const norm = normalizeSkill(token);
    if (norm.normalized) {
      foundSkills.push({
        name: norm.original,
        normalizedName: norm.normalized,
        category: norm.canonicalSkill?.category || 'other',
        confidence: 0.9,
        userVerified: false
      });
    }
  }

  const uniqueSkillsMap = new Map();
  for (const s of foundSkills) {
    if (!uniqueSkillsMap.has(s.normalizedName)) {
      uniqueSkillsMap.set(s.normalizedName, s);
    }
  }

  return {
    contactDetails: {
      fullName: { value: lines[0] || 'Candidate Name', confidence: 0.85, userVerified: false },
      email: { value: email, confidence: email ? 0.95 : 0, userVerified: false },
      phone: { value: phone, confidence: phone ? 0.9 : 0, userVerified: false },
      location: { value: '', confidence: 0.5, userVerified: false },
      links: {
        github: { value: githubMatch ? githubMatch[0] : '', confidence: githubMatch ? 0.95 : 0, userVerified: false },
        linkedin: { value: linkedinMatch ? linkedinMatch[0] : '', confidence: linkedinMatch ? 0.95 : 0, userVerified: false },
        portfolio: { value: '', confidence: 0.5, userVerified: false }
      }
    },
    skills: Array.from(uniqueSkillsMap.values()),
    experience: [],
    projects: [],
    education: [{
      institution: 'University',
      degree: 'Bachelor of Science',
      level: 'bachelor',
      confidence: 0.8,
      userVerified: false
    }],
    certifications: []
  };
}
