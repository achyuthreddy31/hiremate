/**
 * Deterministic Evidence Strength & Requirement Scoring
 * Pure functions strictly implementing Section 3.2.
 */
import {
  EVIDENCE_POINTS,
  ADDITIONAL_EVIDENCE_BONUS,
  SUCCESSFUL_PRACTICE_BONUS,
  PRACTICE_BONUS_MIN_ATTEMPTS,
  PRACTICE_BONUS_MIN_ACCURACY
} from '../../../../shared/constants.js';
import { EvidenceType, RequirementStatus, ImportanceWeight } from '../../../../shared/enums.js';

/**
 * Calculates the deterministic score for a single requirement.
 *
 * @param {Array<{evidenceType: string, quote?: string, confidence?: number}>} evidenceItems
 * @param {Object} practiceHistory - { attemptsCount: number, accuracy: number }
 * @param {boolean} resumeParsedSuccessfully - whether resume parsing succeeded
 * @returns {Object} { score: number, status: string, bonusAwarded: boolean, evidenceItems: Array }
 */
export function calculateRequirementScore(
  evidenceItems = [],
  practiceHistory = { attemptsCount: 0, accuracy: 0 },
  resumeParsedSuccessfully = true
) {
  if (!resumeParsedSuccessfully) {
    return {
      score: 0,
      status: RequirementStatus.INSUFFICIENT_DATA,
      bonusAwarded: false,
      reason: 'Resume could not be parsed'
    };
  }

  if (!evidenceItems || evidenceItems.length === 0) {
    return {
      score: 0,
      status: RequirementStatus.MISSING,
      bonusAwarded: false,
      reason: 'No evidence found'
    };
  }

  // Check highest confidence
  let maxConfidence = 0;
  for (const item of evidenceItems) {
    const conf = typeof item.confidence === 'number' ? item.confidence : 1.0;
    if (conf > maxConfidence) {
      maxConfidence = conf;
    }
  }

  // If evidence exists but best confidence is below 0.5 -> insufficient_data
  if (maxConfidence < 0.5) {
    return {
      score: 0,
      status: RequirementStatus.INSUFFICIENT_DATA,
      bonusAwarded: false,
      reason: 'Highest evidence confidence below 0.5 threshold'
    };
  }

  // Find points for all valid evidence types
  const pointsList = [];
  const processedTypes = new Set();

  for (const item of evidenceItems) {
    const typePoints = EVIDENCE_POINTS[item.evidenceType] || 0;
    if (typePoints > 0) {
      pointsList.push(typePoints);
      processedTypes.add(item.evidenceType);
    }
  }

  if (pointsList.length === 0) {
    return {
      score: 0,
      status: RequirementStatus.MISSING,
      bonusAwarded: false,
      reason: 'No recognized evidence type points'
    };
  }

  // Sort descending: highest points first
  pointsList.sort((a, b) => b - a);
  const highestPoints = pointsList[0];
  const distinctExtraCount = processedTypes.size - 1; // +5 for each additional distinct evidence item

  let totalScore = highestPoints + (Math.max(0, distinctExtraCount) * ADDITIONAL_EVIDENCE_BONUS);

  // Practice bonus: >= 5 attempts with >= 70% accuracy
  let bonusAwarded = false;
  const attempts = practiceHistory?.attemptsCount || 0;
  const accuracy = practiceHistory?.accuracy || 0;

  if (attempts >= PRACTICE_BONUS_MIN_ATTEMPTS && accuracy >= PRACTICE_BONUS_MIN_ACCURACY) {
    totalScore += SUCCESSFUL_PRACTICE_BONUS;
    bonusAwarded = true;
  }

  // Cap at 100
  totalScore = Math.min(100, Math.max(0, Math.round(totalScore)));

  // Status mapping
  let status;
  if (totalScore >= 75) {
    status = RequirementStatus.STRONG;
  } else if (totalScore >= 50) {
    status = RequirementStatus.GOOD;
  } else if (totalScore >= 1) {
    status = RequirementStatus.NEEDS_IMPROVEMENT;
  } else {
    status = RequirementStatus.MISSING;
  }

  return {
    score: totalScore,
    status,
    bonusAwarded,
    highestPoints,
    distinctExtraCount
  };
}

/**
 * Maps importance label to numerical multiplier.
 */
export function getImportanceMultiplier(importance) {
  const norm = String(importance || '').toLowerCase();
  if (norm === 'critical') return ImportanceWeight.CRITICAL;
  if (norm === 'important') return ImportanceWeight.IMPORTANT;
  return ImportanceWeight.BENEFICIAL;
}
