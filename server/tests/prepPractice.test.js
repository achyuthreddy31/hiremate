import { describe, it, expect } from 'vitest';
import { generateCuratedQuestions, validateQuestionFormat } from '../src/services/practice.service.js';
import { generateTruthfulResumeImprovements, buildInterviewPrepDataset } from '../src/services/interviewPrep.service.js';

describe('Practice & Truthful Prep Generator Tests', () => {
  it('generates 10 curated questions with distinct options, explanation and requirement reference', () => {
    const questions = generateCuratedQuestions({
      applicationId: 'mock_app_id',
      firebaseUid: 'mock_user_id',
      requirements: [{ name: 'React', normalizedName: 'React' }, { name: 'Node.js', normalizedName: 'Node.js' }]
    });

    expect(questions.length).toBe(10);
    for (const q of questions) {
      expect(validateQuestionFormat(q)).toBe(true);
      expect(q.options.length).toBeGreaterThanOrEqual(4);
      expect(q.explanation).toBeTruthy();
      expect(q.requirementRef).toBeTruthy();
    }
  });

  it('generates truthful resume improvements with needsUserInput when metric is missing', () => {
    const improvements = generateTruthfulResumeImprovements({ resumeText: 'Sample text' });
    expect(improvements.length).toBeGreaterThan(0);

    const metricItem = improvements.find(i => i.needsUserInput);
    expect(metricItem).toBeDefined();
    expect(metricItem.promptForUser).toBeTruthy();
    expect(metricItem.suggestion).toContain('[X]');
  });

  it('builds interview prep dataset with candidate-specific project questions and STAR guidance', () => {
    const prep = buildInterviewPrepDataset({
      companyName: 'Stripe',
      jobTitle: 'Backend Engineer',
      candidateProfile: {
        projects: [{ title: 'Payment Processing Microservice' }]
      }
    });

    expect(prep.technicalQuestions.length).toBeGreaterThan(0);
    expect(prep.technicalQuestions[0].starGuidance).toBeDefined();
    expect(prep.technicalQuestions[0].commonMistakes.length).toBeGreaterThan(0);

    // Resume based question uses candidate's own project!
    expect(prep.resumeBasedQuestions[0].question).toContain('Payment Processing Microservice');
  });
});
