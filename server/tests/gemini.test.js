import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import {
  normalizeForSearch,
  verifyQuoteInSource,
  callGeminiStructured
} from '../src/services/gemini.service.js';

describe('Gemini AI Service Compatibility & Robustness Suite (Bug 3 fix)', () => {
  describe('Quote Normalization & Verification', () => {
    it('accurately normalizes search text by removing non-alphanumeric chars and extra whitespace', () => {
      expect(normalizeForSearch('  React.js, Node.js (Full-Stack)!  ')).toBe('reactjs nodejs fullstack');
      expect(normalizeForSearch('')).toBe('');
    });

    it('strictly verifies exact quote in source text ignoring punctuation and case', () => {
      const source = 'We require at least 3+ years of experience with Python, Docker, and Kubernetes.';
      expect(verifyQuoteInSource('Python, Docker', source)).toBe(true);
      expect(verifyQuoteInSource('3+ years of experience', source)).toBe(true);
      expect(verifyQuoteInSource('Java 17', source)).toBe(false);
      expect(verifyQuoteInSource('', source)).toBe(false);
      expect(verifyQuoteInSource('Python', '')).toBe(false);
    });
  });

  describe('Response Text Extraction & Schema Validation', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('returns null when Gemini client is not configured', async () => {
      const res = await callGeminiStructured({
        systemInstruction: 'test',
        prompt: 'test',
        client: null // explicitly no client
      });
      // In default test environment without real key, getGeminiClient returns null
      expect(res).toBeNull();
    });

    it('correctly handles response.text as a property getter (SDK v0.2.0 compatibility)', async () => {
      const mockClient = {
        models: {
          generateContent: vi.fn().mockResolvedValue({
            text: JSON.stringify({ skill: 'TypeScript', level: 'advanced' })
          })
        }
      };

      const schema = z.object({
        skill: z.string(),
        level: z.string()
      });

      const res = await callGeminiStructured({
        systemInstruction: 'test',
        prompt: 'test',
        schema,
        client: mockClient
      });

      expect(res).toEqual({ skill: 'TypeScript', level: 'advanced' });
      expect(mockClient.models.generateContent).toHaveBeenCalledTimes(1);
    });

    it('correctly handles response.text() as a function', async () => {
      const mockClient = {
        models: {
          generateContent: vi.fn().mockResolvedValue({
            text: () => JSON.stringify({ result: 'ok' })
          })
        }
      };

      const res = await callGeminiStructured({
        systemInstruction: 'test',
        prompt: 'test',
        client: mockClient
      });

      expect(res).toEqual({ result: 'ok' });
    });

    it('strips markdown code fences when model outputs wrapped JSON', async () => {
      const mockClient = {
        models: {
          generateContent: vi.fn().mockResolvedValue({
            text: '```json\n{"status":"verified","score":95}\n```'
          })
        }
      };

      const schema = z.object({
        status: z.string(),
        score: z.number()
      });

      const res = await callGeminiStructured({
        systemInstruction: 'test',
        prompt: 'test',
        schema,
        client: mockClient
      });

      expect(res).toEqual({ status: 'verified', score: 95 });
    });

    it('retries when JSON is invalid on the first attempt and succeeds on the second', async () => {
      const mockClient = {
        models: {
          generateContent: vi.fn()
            .mockResolvedValueOnce({ text: 'Not valid JSON' })
            .mockResolvedValueOnce({ text: JSON.stringify({ recovered: true }) })
        }
      };

      const res = await callGeminiStructured({
        systemInstruction: 'test',
        prompt: 'test',
        maxRetries: 2,
        client: mockClient
      });

      expect(res).toEqual({ recovered: true });
      expect(mockClient.models.generateContent).toHaveBeenCalledTimes(2);
    });

    it('fails safely and sanitizes error messages without exposing API keys when maxRetries exceeded', async () => {
      const mockClient = {
        models: {
          generateContent: vi.fn().mockRejectedValue(new Error('API failure with key=AIzaSySecretToken12345'))
        }
      };

      await expect(callGeminiStructured({
        systemInstruction: 'test',
        prompt: 'test',
        maxRetries: 1,
        client: mockClient
      })).rejects.toThrow(/Gemini structured call failed after 1 retries: API failure with key=\*\*\*/);
    });
  });
});
