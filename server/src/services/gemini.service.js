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
 * Handles both getter property (v0.2.0 @google/genai SDK) and method variants of response.text.
 */
export async function callGeminiStructured({
  systemInstruction,
  prompt,
  schema,
  maxRetries = 2,
  client = undefined
}) {
  const activeClient = client !== undefined ? client : getGeminiClient();

  // If no live Gemini key configured, return null to let caller use deterministic fallback / mock
  if (!activeClient) {
    return null;
  }

  let attempt = 0;
  let currentPrompt = prompt;

  while (attempt <= maxRetries) {
    try {
      const response = await activeClient.models.generateContent({
        model: env.GEMINI_MODEL || 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: currentPrompt }] }
        ],
        config: {
          systemInstruction,
          responseMimeType: 'application/json'
        }
      });

      // Compatible response text extraction across SDK variants (getter vs function vs parts)
      let rawText = '';
      if (typeof response?.text === 'function') {
        rawText = response.text() || '';
      } else if (typeof response?.text === 'string') {
        rawText = response.text;
      } else if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
        rawText = response.candidates[0].content.parts[0].text;
      }

      if (!rawText || !rawText.trim()) {
        throw new Error('Gemini API returned an empty text response.');
      }

      // Strip markdown code fences if model wrapped JSON output
      const cleanedText = rawText
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      const parsedJson = JSON.parse(cleanedText);

      if (schema) {
        const validated = schema.parse(parsedJson);
        return validated;
      }

      return parsedJson;
    } catch (err) {
      attempt++;
      // Sanitize error message to prevent logging any potential API key values
      const safeErrorMessage = err.message
        ? err.message.replace(/key=[a-zA-Z0-9_\-]+/gi, 'key=***')
        : 'Unknown error';

      if (attempt > maxRetries) {
        console.warn(`[GeminiService] Structured AI generation failed after ${maxRetries} attempts: ${safeErrorMessage}`);
        throw new Error(`Gemini structured call failed after ${maxRetries} retries: ${safeErrorMessage}`);
      }
      currentPrompt = `${prompt}\n\n[CORRECTION NOTICE: Previous response was invalid. Error: ${safeErrorMessage}. Please output strictly valid JSON conforming to the schema.]`;
    }
  }
}
