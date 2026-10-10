import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read canonical skills dictionary
const skillsDataPath = path.resolve(__dirname, '../../data/skills.json');
const rawSkills = JSON.parse(fs.readFileSync(skillsDataPath, 'utf8'));

// Build lookup maps for O(1) matching
const canonicalMap = new Map(); // lowercase name -> canonical skill
const aliasMap = new Map();     // lowercase alias -> canonical skill

for (const skill of rawSkills) {
  canonicalMap.set(skill.name.toLowerCase().trim(), skill);
  if (Array.isArray(skill.aliases)) {
    for (const alias of skill.aliases) {
      aliasMap.set(alias.toLowerCase().trim(), skill);
    }
  }
}

/**
 * Normalizes a raw skill string against the canonical skill dictionary.
 * Deterministic: matches in code first.
 * Returns: { normalized: string | null, canonicalSkill: object | null, original: string, matchedVia: 'canonical' | 'alias' | null }
 */
export function normalizeSkill(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return {
      normalized: null,
      canonicalSkill: null,
      original: String(rawText || ''),
      matchedVia: null
    };
  }

  const clean = rawText.trim();
  const lower = clean.toLowerCase();

  // 1. Exact match on canonical name
  if (canonicalMap.has(lower)) {
    const canonical = canonicalMap.get(lower);
    return {
      normalized: canonical.name,
      canonicalSkill: canonical,
      original: clean,
      matchedVia: 'canonical'
    };
  }

  // 2. Exact match on alias
  if (aliasMap.has(lower)) {
    const canonical = aliasMap.get(lower);
    return {
      normalized: canonical.name,
      canonicalSkill: canonical,
      original: clean,
      matchedVia: 'alias'
    };
  }

  // 3. Fallback normalization: strip trailing punctuation or common prefixes (e.g., "proficiency in Python" -> "Python")
  const stripped = lower.replace(/^(experience with|knowledge of|proficient in|proficiency in|working knowledge of|expert in)\s+/i, '');
  if (canonicalMap.has(stripped)) {
    const canonical = canonicalMap.get(stripped);
    return {
      normalized: canonical.name,
      canonicalSkill: canonical,
      original: clean,
      matchedVia: 'canonical_prefix_stripped'
    };
  }
  if (aliasMap.has(stripped)) {
    const canonical = aliasMap.get(stripped);
    return {
      normalized: canonical.name,
      canonicalSkill: canonical,
      original: clean,
      matchedVia: 'alias_prefix_stripped'
    };
  }

  // Genuinely unmatched: keep normalized as null and original wording as evidence
  return {
    normalized: null,
    canonicalSkill: null,
    original: clean,
    matchedVia: null
  };
}

/**
 * Get all canonical skills in the dictionary.
 */
export function getAllCanonicalSkills() {
  return rawSkills;
}
