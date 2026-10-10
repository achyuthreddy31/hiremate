import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';

let aiInstance = null;

export function getGeminiClient() {
  if (aiInstance) return aiInstance;
  if (env.GEMINI_API_KEY && env.GEMINI_API_KEY !== 'mock-gemini-key') {
    aiInstance = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }
  return aiInstance;
}

/**
 * Normalizes text for evidence quote verification.
 */
export function normalizeForSearch(text = '') {
  return String(text)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .trim();
}

/**
 * Strictly verifies whether a quoted evidence string exists in source text.
 */
export function verifyQuoteInSource(quote, sourceText) {
  if (!quote || !sourceText) return false;
  const normQuote = normalizeForSearch(quote);
  const normSource = normalizeForSearch(sourceText);
  if (!normQuote) return false;
  return normSource.includes(normQuote);
}

/**
 * Standard robust Gemini call wrapper with structured schema and retry.
 */
export async function callGeminiStructured({
  systemInstruction,
  prompt,
  schema,
  maxRetries = 2
}) {
  const client = getGeminiClient();

  // If no live Gemini key configured, return null to let caller use deterministic fallback / mock
  if (!client) {
    return null;
  }

  let attempt = 0;
  let currentPrompt = prompt;

  while (attempt <= maxRetries) {
    try {
      const response = await client.models.generateContent({
        model: env.GEMINI_MODEL || 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: currentPrompt }] }
        ],
        config: {
          systemInstruction,
          responseMimeType: 'application/json'
        }
      });

      const rawText = response.text?.() || response.text || '';
      const parsedJson = JSON.parse(rawText);

      if (schema) {
        const validated = schema.parse(parsedJson);
        return validated;
      }

      return parsedJson;
    } catch (err) {
      attempt++;
      if (attempt > maxRetries) {
        throw new Error(`Gemini structured call failed after ${maxRetries} retries: ${err.message}`);
      }
      currentPrompt = `${prompt}\n\n[CORRECTION NOTICE: Previous response was invalid. Error: ${err.message}. Please output strictly valid JSON conforming to the schema.]`;
    }
  }
}
