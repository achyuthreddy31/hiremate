import { describe, it, expect } from 'vitest';
import { parseGroundingBulletPoints, buildCompanyResearchDataset } from '../src/services/companyResearch.service.js';

describe('Company Research & Grounding Parser Tests', () => {
  it('parses multi-byte and standard text and keeps verified only with >= 30% byte coverage and valid source', () => {
    const bulletLines = [
      '• Acquired innovative cloud technology for $1B',
      '• Headquartered in New York City and expanding globally',
      '• Definite unsourced secret interview question answers'
    ];

    const groundingSupports = [
      { text: 'Acquired innovative cloud technology', sourceIndex: 0 },
      { text: 'Headquartered in New York City', sourceIndex: 0 }
    ];

    const groundingSources = [
      { url: 'https://example.com/press-release' }
    ];

    const result = parseGroundingBulletPoints({
      bulletLines,
      groundingSupports,
      groundingSources
    });

    expect(result.items.length).toBe(2);
    expect(result.items[0].label).toBe('verified');
    expect(result.items[0].sourceUrl).toBe('https://example.com/press-release');
    // The unsourced factual claim should be cleanly dropped
    expect(result.droppedClaimsCount).toBe(1);
  });

  it('builds dataset with verified-only quiz questions', () => {
    const dataset = buildCompanyResearchDataset('Acme Corp');

    expect(dataset.companyName).toBe('Acme Corp');
    expect(dataset.quiz.length).toBeGreaterThan(0);
    for (const q of dataset.quiz) {
      expect(q.sourceUrl).toBeDefined();
      expect(q.options.length).toBe(4);
    }
  });
});
