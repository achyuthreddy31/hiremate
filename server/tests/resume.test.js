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
});
