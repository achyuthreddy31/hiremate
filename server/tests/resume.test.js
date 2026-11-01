import { describe, it, expect } from 'vitest';
import { validatePdfSignature } from '../src/middleware/upload.middleware.js';
import { analyzeResumeQuality, parseResumeFields } from '../src/services/resume.service.js';

describe('Resume Processing & In-Memory Validation Tests', () => {
  it('validates %PDF- signature correctly', () => {
    const validPdfBuffer = Buffer.from('%PDF-1.4 sample content');
    const invalidBuffer = Buffer.from('Not a PDF file');

    expect(validatePdfSignature(validPdfBuffer)).toBe(true);
    expect(validatePdfSignature(invalidBuffer)).toBe(false);
    expect(validatePdfSignature(Buffer.from(''))).toBe(false);
  });

  it('analyzes resume quality and scores bullet action verbs', () => {
    const resumeText = `
John Doe
john.doe@example.com | +1 (555) 123-4567 | github.com/johndoe | linkedin.com/in/johndoe

Summary:
Experienced software engineer passionate about web systems.

Skills:
JavaScript, React, Node.js, Python, Docker

Experience:
Senior Developer at Tech Corp
• Built high-performance microservices serving 10M requests daily
• Developed responsive web applications using React and Tailwind
• Automated deployment pipelines reducing release time by 40%

Education:
University of Technology - Bachelor of Science in Computer Science
    `;

    const quality = analyzeResumeQuality(resumeText);
    expect(quality.checklist.hasContactDetails).toBe(true);
    expect(quality.checklist.hasSkillsSection).toBe(true);
    expect(quality.checklist.hasEducation).toBe(true);
    expect(quality.checklist.hasProfessionalLinks).toBe(true);
    expect(quality.checklist.actionVerbRatio).toBeGreaterThanOrEqual(0.6);
    expect(quality.score).toBeGreaterThanOrEqual(80);
  });

  it('extracts skills and normalizes canonical entries', () => {
    const sampleText = 'Proficient in Python, JS, Docker, and K8s.';
    const parsed = parseResumeFields(sampleText);

    const normSkills = parsed.skills.map(s => s.normalizedName);
    expect(normSkills).toContain('Python');
    expect(normSkills).toContain('JavaScript');
    expect(normSkills).toContain('Docker');
    expect(normSkills).toContain('Kubernetes');
  });

  describe('Bug 5 Fix: Incomplete Resume Parsing Suite', () => {
    it('accurately extracts canonical multi-word skills from resume text', () => {
      const resumeText = `
Skills:
Machine Learning, Deep Learning, Spring Boot, REST API, Tailwind CSS, React Native, Google Cloud
      `;

      const parsed = parseResumeFields(resumeText);
      const skillNames = parsed.skills.map(s => s.name);

      expect(skillNames).toContain('Machine Learning');
      expect(skillNames).toContain('Deep Learning');
      expect(skillNames).toContain('Spring Boot');
      expect(skillNames).toContain('REST API');
      expect(skillNames).toContain('Tailwind CSS');
      expect(skillNames).toContain('React Native');
      expect(skillNames).toContain('Google Cloud Platform');
    });

    it('extracts real experience with roles, companies, dates, internships, and bullets', () => {
      const resumeText = `
Jane Doe
jane.doe@example.com | 555-0199

Experience:
Lead Architect at Innovate Labs
2021 - Present
• Orchestrated event-driven microservices architecture
• Scaled database throughput by 300%

Software Engineering Intern at CloudBase Systems
Jan 2020 - Dec 2020
• Developed REST APIs using Python and Flask
• Wrote automated test pipelines
      `;

      const parsed = parseResumeFields(resumeText);
      expect(parsed.experience.length).toBe(2);

      const exp1 = parsed.experience[0];
      expect(exp1.role).toBe('Lead Architect');
      expect(exp1.company).toBe('Innovate Labs');
      expect(exp1.startDate).toContain('2021');
      expect(exp1.endDate).toBeNull();
      expect(exp1.isInternship).toBe(false);
      expect(exp1.bullets.length).toBe(2);

      const exp2 = parsed.experience[1];
      expect(exp2.role).toBe('Software Engineering Intern');
      expect(exp2.company).toBe('CloudBase Systems');
      expect(exp2.isInternship).toBe(true);
      expect(exp2.startDate).toContain('2020-01');
      expect(exp2.endDate).toContain('2020-12');
      expect(exp2.bullets.length).toBe(2);
    });

    it('extracts real projects with titles, technologies, descriptions, bullets, and links', () => {
      const resumeText = `
Projects:
AI Resume Matcher
Technologies: React, Node.js, MongoDB, Tailwind CSS
• Built AI-powered ATS resume matching engine with 95% parsing accuracy
• Integrated candidate analytics dashboard
https://github.com/janedoe/ai-matcher
      `;

      const parsed = parseResumeFields(resumeText);
      expect(parsed.projects.length).toBe(1);

      const proj = parsed.projects[0];
      expect(proj.title).toBe('AI Resume Matcher');
      expect(proj.skills).toContain('React');
      expect(proj.skills).toContain('Node.js');
      expect(proj.skills).toContain('MongoDB');
      expect(proj.bullets.length).toBe(2);
      expect(proj.link).toBe('https://github.com/janedoe/ai-matcher');
    });

    it('extracts real education with degree, field of study, institution, level, and graduation year', () => {
      const resumeText = `
Education:
Stanford University
Master of Science in Artificial Intelligence
2019 - 2021
      `;

      const parsed = parseResumeFields(resumeText);
      expect(parsed.education.length).toBe(1);

      const edu = parsed.education[0];
      expect(edu.institution).toBe('Stanford University');
      expect(edu.degree).toContain('Master of Science in Artificial Intelligence');
      expect(edu.fieldOfStudy).toBe('Artificial Intelligence');
      expect(edu.level).toBe('master');
      expect(edu.endYear).toBe(2021);
    });

    it('returns empty arrays without fake placeholders when sections are missing', () => {
      const bareText = `
Alex Smith
alex.smith@example.com
Full-stack developer with enthusiasm for building reliable software.
      `;

      const parsed = parseResumeFields(bareText);
      expect(parsed.experience).toEqual([]);
      expect(parsed.projects).toEqual([]);
      expect(parsed.education).toEqual([]);
      expect(parsed.certifications).toEqual([]);

      // Ensure no fake Bachelor of Science or University placeholders exist
      const hasFakeEducation = parsed.education.some(
        e => e.degree === 'Bachelor of Science' && e.institution === 'University'
      );
      expect(hasFakeEducation).toBe(false);
    });
  });
});
