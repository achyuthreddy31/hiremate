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

  it('builds dataset with comprehensive 7-area research hub and sections reviewed structure', () => {
    const dataset = buildCompanyResearchDataset('Acme Corp');

    expect(dataset.companyName).toBe('Acme Corp');
    expect(dataset.items.length).toBeGreaterThanOrEqual(14);
    expect(dataset.sectionsReviewed.length).toBe(7);
    expect(dataset.quiz).toBeUndefined();
    for (const item of dataset.items) {
      expect(item.sourceUrl).toBeDefined();
      expect(['verified', 'inferred', 'predicted', 'unavailable']).toContain(item.label);
    }
  });

  it('Bug 7 Fix: marks template statements as inferred with realistic confidence and includes honest disclaimer', () => {
    const dataset = buildCompanyResearchDataset('Google');

    // Disclaimer item present
    const disclaimerItem = dataset.items.find(i => i.information.includes('General guidance — check the company'));
    expect(disclaimerItem).toBeDefined();
    expect(disclaimerItem.label).toBe('inferred');
    expect(disclaimerItem.confidence).toBeGreaterThanOrEqual(0.60);
    expect(disclaimerItem.confidence).toBeLessThanOrEqual(0.75);

    // No ungrounded template item should falsely claim to be 'verified'
    const verifiedItems = dataset.items.filter(i => i.label === 'verified');
    expect(verifiedItems.length).toBe(0);

    // All items should have realistic confidence between 0.60 and 0.70
    for (const item of dataset.items) {
      expect(item.label).toBe('inferred');
      expect(item.confidence).toBeGreaterThanOrEqual(0.60);
      expect(item.confidence).toBeLessThanOrEqual(0.70);
    }
  });
});
