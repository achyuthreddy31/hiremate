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

  describe('Bug 6 Fix: Skill Strength Scoring Suite', () => {
    it('rates requirement as STRONG when candidate has professional experience', () => {
      const analysis = extractJobRequirementsDeterministically('Requirements: JavaScript, React, Node.js');
      const candidateProfile = {
        calculatedExperienceYears: 3,
        highestEducationLevel: 'bachelor',
        skills: [{ name: 'React', normalizedName: 'React', source: 'resume' }],
        experience: [
          {
            company: 'Tech Solutions Inc',
            role: 'Senior React Developer',
            startDate: '2021-01-01',
            endDate: '2023-01-01',
            isInternship: false,
            bullets: ['Built enterprise React applications with 99.9% uptime']
          }
        ]
      };

      const report = generateMatchReportData({
        jobAnalysis: analysis,
        candidateProfile,
        resumeQualityChecklist: { hasContactDetails: true, hasSkillsSection: true },
        resumeText: 'Requirements: JavaScript, React, Node.js'
      });

      const reactResult = report.requirementsResults.find(r => r.normalizedName === 'React');
      expect(reactResult).toBeDefined();
      expect(reactResult.status).toBe('strong');
      expect(reactResult.score).toBeGreaterThanOrEqual(75);
      expect(reactResult.explanation).toContain('Demonstrated solid verified evidence for React');
    });

    it('awards practice bonus and rates skill as STRONG when combined with project evidence', () => {
      const analysis = extractJobRequirementsDeterministically('Requirements: Python backend systems');
      const candidateProfile = {
        calculatedExperienceYears: 1,
        highestEducationLevel: 'bachelor',
        skills: [{ name: 'Python', normalizedName: 'Python', source: 'profile' }],
        projects: [
          {
            title: 'Automated Data Pipeline',
            skills: ['Python'],
            description: 'Built high-throughput data processing pipeline with Python'
          }
        ]
      };

      // 6 practice attempts with 83% accuracy (>= 5 attempts and >= 70% accuracy)
      const practiceAttempts = [
        { topic: 'Python', isCorrect: true },
        { topic: 'Python', isCorrect: true },
        { topic: 'Python', isCorrect: true },
        { topic: 'Python', isCorrect: true },
        { topic: 'Python', isCorrect: true },
        { topic: 'Python', isCorrect: false }
      ];

      const report = generateMatchReportData({
        jobAnalysis: analysis,
        candidateProfile,
        resumeQualityChecklist: { hasContactDetails: true, hasSkillsSection: true },
        resumeText: 'Requirements: Python backend systems',
        practiceAttempts
      });

      const pythonResult = report.requirementsResults.find(r => r.normalizedName === 'Python');
      expect(pythonResult).toBeDefined();
      expect(pythonResult.status).toBe('strong');
      expect(pythonResult.score).toBeGreaterThanOrEqual(75);
    });

    it('restricts single profile mention to needs_improvement without elevating to strong', () => {
      const analysis = extractJobRequirementsDeterministically('Requirements: Docker containerization');
      const candidateProfile = {
        calculatedExperienceYears: 0,
        highestEducationLevel: 'bachelor',
        skills: [{ name: 'Docker', normalizedName: 'Docker', source: 'profile' }],
        experience: [],
        projects: []
      };

      const report = generateMatchReportData({
        jobAnalysis: analysis,
        candidateProfile,
        resumeQualityChecklist: { hasContactDetails: true, hasSkillsSection: true },
        resumeText: 'Requirements: Docker containerization'
      });

      const dockerResult = report.requirementsResults.find(r => r.normalizedName === 'Docker');
      expect(dockerResult).toBeDefined();
      expect(dockerResult.status).toBe('needs_improvement');
      expect(dockerResult.score).toBe(15);
      expect(dockerResult.explanation).toContain('Single mentions cannot be rated strong');
    });
  });
});
