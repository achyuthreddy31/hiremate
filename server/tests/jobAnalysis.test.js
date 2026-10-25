import { describe, it, expect } from 'vitest';
import { extractJobRequirementsDeterministically, generateMatchReportData } from '../src/services/jobAnalysis.service.js';

describe('Job Analysis & Deterministic Match Report Tests', () => {
  const sampleJobDesc = `
We are looking for a Full Stack Software Engineer with at least 3 years of experience.
Requirements:
- Strong proficiency in JavaScript and React for frontend systems
- Solid backend knowledge with Node.js and Express
- Experience with Docker and MongoDB database design
- Bachelor's degree in Computer Science or related field required
  `;

  it('extracts job requirements and experience requirement deterministically', () => {
    const analysis = extractJobRequirementsDeterministically(sampleJobDesc);

    expect(analysis.experienceMinYears).toBe(3);
    expect(analysis.educationLevel).toBe('bachelor');

    const reqNames = analysis.requirements.map(r => r.name);
    expect(reqNames).toContain('JavaScript');
    expect(reqNames).toContain('React');
    expect(reqNames).toContain('Node.js');
    expect(reqNames).toContain('Docker');
    expect(reqNames).toContain('MongoDB');
  });

  it('generates match report with per-requirement explanations and no NaN', () => {
    const analysis = extractJobRequirementsDeterministically(sampleJobDesc);
    const candidateProfile = {
      calculatedExperienceYears: 2,
      highestEducationLevel: 'bachelor',
      skills: [
        { name: 'JavaScript', normalizedName: 'JavaScript', source: 'resume' },
        { name: 'React', normalizedName: 'React', source: 'resume' }
      ],
      projects: [
        { title: 'Fullstack App', skills: ['React', 'Node.js'] }
      ]
    };

    const report = generateMatchReportData({
      jobAnalysis: analysis,
      candidateProfile,
      resumeQualityChecklist: { hasContactDetails: true, hasSkillsSection: true },
      resumeText: sampleJobDesc
    });

    expect(report.totalScore).toBeGreaterThan(0);
    expect(report.totalScore).toBeLessThanOrEqual(100);
    expect(isNaN(report.totalScore)).toBe(false);
    expect(report.requirementsResults.length).toBeGreaterThan(0);
    expect(report.disclaimer || '').not.toContain('never a hiring probability');
  });
});
