import pdfParse from 'pdf-parse';
import { normalizeSkill, getAllCanonicalSkills } from './scoring/skillNormalization.js';
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

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createSkillRegex(str) {
  const escaped = escapeRegex(str);
  const leadingBoundary = /^\w/.test(str) ? '\\b' : '(?<=^|[^a-zA-Z0-9_])';
  const trailingBoundary = /\w$/.test(str) ? '\\b' : '(?=$|[^a-zA-Z0-9_])';
  return new RegExp(`${leadingBoundary}${escaped}${trailingBoundary}`, 'i');
}

// Precompile canonical skill patterns once at module initialization
const rawSkills = getAllCanonicalSkills();
const compiledSkillPatterns = [];
for (const skill of rawSkills) {
  compiledSkillPatterns.push({
    canonical: skill.name,
    category: skill.category || 'other',
    regex: createSkillRegex(skill.name),
    isSingleChar: skill.name.length === 1
  });
  if (Array.isArray(skill.aliases)) {
    for (const alias of skill.aliases) {
      if (alias.length <= 1) continue;
      compiledSkillPatterns.push({
        canonical: skill.name,
        category: skill.category || 'other',
        regex: createSkillRegex(alias),
        isSingleChar: false
      });
    }
  }
}

function parseDateRange(str) {
  if (!str) return { startDate: null, endDate: null };
  const parts = str.split(/\s*(?:-|–|—|\bto\b)\s*/i);
  if (parts.length >= 1) {
    const parsePart = (p) => {
      if (!p) return null;
      if (/present|current|now/i.test(p)) return null;
      const monthYearMatch = p.match(/(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?(\d{4})/i);
      if (monthYearMatch) {
        const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const year = parseInt(monthYearMatch[2], 10);
        const month = monthYearMatch[1] ? monthNames.indexOf(monthYearMatch[1].toLowerCase().slice(0, 3)) : 0;
        return new Date(Date.UTC(year, month >= 0 ? month : 0, 1)).toISOString();
      }
      return null;
    };

    const startDate = parsePart(parts[0].trim());
    const endDate = parts[1] ? parsePart(parts[1].trim()) : null;
    return { startDate, endDate };
  }
  return { startDate: null, endDate: null };
}

function splitSections(text) {
  const lines = text.split('\n');
  const sections = {
    header: [],
    summary: [],
    skills: [],
    experience: [],
    projects: [],
    education: [],
    certifications: []
  };

  const sectionHeaderRegex = /^\s*(skills|technical\s+skills|technologies|proficiencies|core\s+competencies|work\s+experience|professional\s+experience|employment\s+history|work\s+history|experience|projects|personal\s+projects|academic\s+projects|key\s+projects|education|academic\s+background|academic\s+history|academics|certifications|certificates|licenses\s*(?:&|and)\s*certifications|summary|objective|about\s+me)\s*[:]?\s*$/i;

  let currentSection = 'header';

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const match = line.match(sectionHeaderRegex);
    if (match) {
      const headerText = match[1].toLowerCase();
      if (/skills|technologies|proficiencies|competencies/.test(headerText)) {
        currentSection = 'skills';
      } else if (/experience|employment|work/.test(headerText)) {
        currentSection = 'experience';
      } else if (/projects/.test(headerText)) {
        currentSection = 'projects';
      } else if (/education|academic/.test(headerText)) {
        currentSection = 'education';
      } else if (/certif/.test(headerText)) {
        currentSection = 'certifications';
      } else if (/summary|objective|about/.test(headerText)) {
        currentSection = 'summary';
      }
      continue;
    }

    sections[currentSection].push(line);
  }

  return {
    header: sections.header.join('\n'),
    summary: sections.summary.join('\n'),
    skills: sections.skills.join('\n'),
    experience: sections.experience.join('\n'),
    projects: sections.projects.join('\n'),
    education: sections.education.join('\n'),
    certifications: sections.certifications.join('\n')
  };
}

function extractEducation(sectionText, fullText) {
  const textToScan = (sectionText && sectionText.trim()) ? sectionText : fullText;
  if (!textToScan || !textToScan.trim()) return [];

  const lines = textToScan.split('\n').map(l => l.trim()).filter(Boolean);
  const educationEntries = [];

  const levelPatterns = [
    { level: 'doctorate', regex: /\b(ph\.?d|doctor\s+of\s+philosophy|doctorate)\b/i },
    { level: 'master', regex: /\b(master'?s?|m\.?s\.?|m\.?tech|m\.?e\.?|m\.?sc\.?|mba)\b/i },
    { level: 'bachelor', regex: /\b(bachelor'?s?|b\.?s\.?|b\.?tech|b\.?e\.?|b\.?sc\.?|b\.?a\.?)\b/i },
    { level: 'diploma', regex: /\b(diploma|associate'?s?)\b/i }
  ];

  let currentEntry = null;

  for (const line of lines) {
    let detectedLevel = null;
    for (const lp of levelPatterns) {
      if (lp.regex.test(line)) {
        detectedLevel = lp.level;
        break;
      }
    }

    const isInstitution = /\b(university|college|institute|school|academy|polytechnic)\b/i.test(line);
    const yearMatch = line.match(/\b(19\d\d|20\d\d)\b/g);

    // If single line has both institution and degree separated by - or |
    if (isInstitution && detectedLevel && (line.includes(' - ') || line.includes(' | '))) {
      if (currentEntry) {
        educationEntries.push(currentEntry);
        currentEntry = null;
      }
      const parts = line.split(/\s*[-|]\s*/);
      const instPart = parts.find(p => /\b(university|college|institute|school|academy|polytechnic)\b/i.test(p)) || parts[0];
      const degPart = parts.find(p => p !== instPart) || parts[1];
      const inMatch = degPart ? degPart.match(/\bin\s+([A-Za-z\s&,]+?)(?:\s*\(|\s*\d{4}|$|\s*[-–—])/i) : null;
      const lastYear = yearMatch ? parseInt(yearMatch[yearMatch.length - 1], 10) : null;

      educationEntries.push({
        institution: instPart.trim(),
        degree: degPart ? degPart.trim() : line.trim(),
        fieldOfStudy: inMatch ? inMatch[1].trim() : '',
        level: detectedLevel,
        endYear: lastYear,
        confidence: 0.85,
        userVerified: false
      });
      continue;
    }

    if (isInstitution && !currentEntry) {
      currentEntry = {
        institution: line.replace(/^[•\-*\s]+/, '').trim(),
        degree: '',
        fieldOfStudy: '',
        level: 'bachelor',
        endYear: null,
        confidence: 0.85,
        userVerified: false
      };
    } else if (currentEntry && isInstitution && currentEntry.degree) {
      educationEntries.push(currentEntry);
      currentEntry = {
        institution: line.replace(/^[•\-*\s]+/, '').trim(),
        degree: '',
        fieldOfStudy: '',
        level: 'bachelor',
        endYear: null,
        confidence: 0.85,
        userVerified: false
      };
    } else if (detectedLevel) {
      if (!currentEntry) {
        currentEntry = {
          institution: 'University',
          degree: '',
          fieldOfStudy: '',
          level: detectedLevel,
          endYear: null,
          confidence: 0.8,
          userVerified: false
        };
      }
      currentEntry.level = detectedLevel;
      currentEntry.degree = line.replace(/^[•\-*\s]+/, '').trim();
      const inMatch = line.match(/\bin\s+([A-Za-z\s&,]+?)(?:\s*\(|\s*\d{4}|$|\s*[-–—])/i);
      if (inMatch) {
        currentEntry.fieldOfStudy = inMatch[1].trim();
      }
      if (yearMatch) {
        const lastYear = parseInt(yearMatch[yearMatch.length - 1], 10);
        currentEntry.endYear = lastYear;
      }
    } else if (currentEntry && yearMatch && !currentEntry.endYear) {
      const lastYear = parseInt(yearMatch[yearMatch.length - 1], 10);
      currentEntry.endYear = lastYear;
    } else if (currentEntry && !currentEntry.degree && line.length > 5 && !/^[•\-*]/.test(line)) {
      currentEntry.degree = line;
    }
  }

  if (currentEntry && (currentEntry.degree || currentEntry.institution !== 'University')) {
    educationEntries.push(currentEntry);
  }

  // If scanning full text without explicit education section, ensure the detected entry actually looks like education
  if (sectionText.trim().length === 0) {
    return educationEntries.filter(e => e.degree || e.institution !== 'University');
  }

  return educationEntries;
}

function extractExperience(sectionText, fullText) {
  const textToScan = (sectionText && sectionText.trim()) ? sectionText : '';
  if (!textToScan || !textToScan.trim()) return [];

  const lines = textToScan.split('\n').map(l => l.trim()).filter(Boolean);
  const experiences = [];
  let currentExp = null;

  const dateRegex = /(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?\d{4}\s*[-–—\bto\b]+\s*(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}|present|current|now)/i;
  const roleKeywords = /\b(engineer|developer|architect|designer|manager|consultant|lead|director|intern|internship|specialist|analyst|programmer|administrator)\b/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isBullet = /^[•\-*]/.test(line);
    const hasRoleKeyword = roleKeywords.test(line);
    const hasAt = /\s+at\s+/i.test(line);
    const hasSeparator = /\s+[-|]\s+/.test(line);
    const lineHasDate = dateRegex.test(line);

    if (!isBullet && (hasRoleKeyword || hasAt || (hasSeparator && !lineHasDate))) {
      if (currentExp && (currentExp.company || currentExp.role)) {
        experiences.push(currentExp);
      }

      let role = '';
      let company = '';

      if (hasAt) {
        const atParts = line.split(/\s+at\s+/i);
        role = atParts[0].trim();
        company = atParts.slice(1).join(' at ').trim();
      } else if (hasSeparator) {
        const sepParts = line.split(/\s+[-|]\s+/);
        if (roleKeywords.test(sepParts[0])) {
          role = sepParts[0].trim();
          company = sepParts.slice(1).join(' - ').trim();
        } else {
          company = sepParts[0].trim();
          role = sepParts.slice(1).join(' - ').trim();
        }
      } else {
        role = line;
      }

      let startDate = null;
      let endDate = null;
      const inlineDateMatch = (company || role).match(dateRegex);
      if (inlineDateMatch) {
        const parsed = parseDateRange(inlineDateMatch[0]);
        startDate = parsed.startDate;
        endDate = parsed.endDate;
        company = company.replace(inlineDateMatch[0], '').replace(/[,|()\-]+$/, '').trim();
      }

      currentExp = {
        company: company || 'Company',
        role: role || 'Software Engineer',
        startDate,
        endDate,
        isInternship: /\bintern\b|\binternship\b/i.test(role) || /\bintern\b|\binternship\b/i.test(company),
        bullets: [],
        confidence: 0.85,
        userVerified: false
      };
      continue;
    }

    if (currentExp && !currentExp.startDate && dateRegex.test(line)) {
      const match = line.match(dateRegex);
      const parsed = parseDateRange(match[0]);
      currentExp.startDate = parsed.startDate;
      currentExp.endDate = parsed.endDate;
      continue;
    }

    if (currentExp) {
      if (isBullet) {
        currentExp.bullets.push(line.replace(/^[•\-*\s]+/, '').trim());
      } else if (line.length > 25 && !hasRoleKeyword) {
        currentExp.bullets.push(line);
      }
    }
  }

  if (currentExp && (currentExp.company || currentExp.role)) {
    experiences.push(currentExp);
  }

  return experiences;
}

function extractProjects(sectionText, fullText) {
  const textToScan = (sectionText && sectionText.trim()) ? sectionText : '';
  if (!textToScan || !textToScan.trim()) return [];

  const lines = textToScan.split('\n').map(l => l.trim()).filter(Boolean);
  const projects = [];
  let currentProject = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isBullet = /^[•\-*]/.test(line);
    const isTechLine = /^(?:technologies|tech\s+stack|tools|built\s+with)\s*[:\-]/i.test(line);
    const linkMatch = line.match(/(?:https?:\/\/[^\s]+|(?:www\.)?github\.com\/[^\s]+)/i);

    if (!isBullet && !isTechLine && line.length < 80 && !linkMatch) {
      if (currentProject && (currentProject.title || currentProject.bullets.length > 0)) {
        projects.push(currentProject);
      }
      currentProject = {
        title: line.replace(/^[•\-*\s]+/, '').trim(),
        description: '',
        skills: [],
        bullets: [],
        link: '',
        confidence: 0.85,
        userVerified: false
      };
      continue;
    }

    if (currentProject) {
      if (linkMatch && !currentProject.link) {
        currentProject.link = linkMatch[0];
      }

      if (isTechLine) {
        const techStr = line.replace(/^(?:technologies|tech\s+stack|tools|built\s+with)\s*[:\-]\s*/i, '');
        const techs = techStr.split(/[,|;/]+/).map(t => t.trim()).filter(Boolean);
        currentProject.skills = Array.from(new Set([...currentProject.skills, ...techs]));
      } else if (isBullet) {
        const bulletText = line.replace(/^[•\-*\s]+/, '').trim();
        currentProject.bullets.push(bulletText);
        if (!currentProject.description) {
          currentProject.description = bulletText;
        }
      } else if (!linkMatch && line.length > 15) {
        if (!currentProject.description) {
          currentProject.description = line;
        } else {
          currentProject.bullets.push(line);
        }
      }
    }
  }

  if (currentProject && (currentProject.title || currentProject.bullets.length > 0)) {
    projects.push(currentProject);
  }

  return projects;
}

/**
 * Deterministic parser for structured resume fields from text.
 * Accurately extracts canonical multi-word skills, real experience, real projects, and real education.
 * Does NOT generate fake placeholders for missing sections.
 */
export function parseResumeFields(text = '') {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : '';

  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);

  const sections = splitSections(text);

  // Extract skills via precompiled canonical regex patterns
  const foundSkillsMap = new Map();
  for (const p of compiledSkillPatterns) {
    if (p.isSingleChar) {
      if (new RegExp(`(?:^|[\\s,;/|])${escapeRegex(p.canonical)}(?:[\\s,;/|]|$)`).test(text)) {
        if (!foundSkillsMap.has(p.canonical.toLowerCase())) {
          foundSkillsMap.set(p.canonical.toLowerCase(), {
            name: p.canonical,
            normalizedName: p.canonical,
            category: p.category,
            confidence: 0.9,
            userVerified: false
          });
        }
      }
    } else if (p.regex.test(text)) {
      if (!foundSkillsMap.has(p.canonical.toLowerCase())) {
        foundSkillsMap.set(p.canonical.toLowerCase(), {
          name: p.canonical,
          normalizedName: p.canonical,
          category: p.category,
          confidence: 0.9,
          userVerified: false
        });
      }
    }
  }

  // Also scan tokens in the skills section through normalizeSkill
  if (sections.skills) {
    const tokens = sections.skills.split(/[\s,;|/()]+/).filter(Boolean);
    for (const rawToken of tokens) {
      const token = rawToken.replace(/^[.,:;]+|[.,:;]+$/g, '').trim();
      if (token.length < 2) continue;
      const norm = normalizeSkill(token);
      if (norm.normalized && !foundSkillsMap.has(norm.normalized.toLowerCase())) {
        foundSkillsMap.set(norm.normalized.toLowerCase(), {
          name: norm.original,
          normalizedName: norm.normalized,
          category: norm.canonicalSkill?.category || 'other',
          confidence: 0.9,
          userVerified: false
        });
      }
    }
  }

  const educations = extractEducation(sections.education, text);
  const experiences = extractExperience(sections.experience, text);
  const projects = extractProjects(sections.projects, text);

  // Candidate name: first line of header that isn't email, phone, or URL
  let fullName = 'Candidate Name';
  for (const line of lines) {
    if (
      !line.includes('@') &&
      !line.includes('http') &&
      !line.includes('github.com') &&
      !line.includes('linkedin.com') &&
      !/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(line) &&
      line.length > 2 &&
      line.length < 50
    ) {
      fullName = line;
      break;
    }
  }

  return {
    contactDetails: {
      fullName: { value: fullName, confidence: 0.85, userVerified: false },
      email: { value: email, confidence: email ? 0.95 : 0, userVerified: false },
      phone: { value: phone, confidence: phone ? 0.9 : 0, userVerified: false },
      location: { value: '', confidence: 0.5, userVerified: false },
      links: {
        github: { value: githubMatch ? githubMatch[0] : '', confidence: githubMatch ? 0.95 : 0, userVerified: false },
        linkedin: { value: linkedinMatch ? linkedinMatch[0] : '', confidence: linkedinMatch ? 0.95 : 0, userVerified: false },
        portfolio: { value: '', confidence: 0.5, userVerified: false }
      }
    },
    skills: Array.from(foundSkillsMap.values()),
    experience: experiences,
    projects: projects,
    education: educations,
    certifications: []
  };
}
