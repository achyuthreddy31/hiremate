/**
 * Adaptive Difficulty Engine
 * Pure functions strictly implementing Section 3.5.
 *
 * Levels: easy, medium, hard (tracked per topic)
 * Evaluated only after >= 5 attempts, using the last 5:
 * - accuracy >= 80% and median time <= expected time -> promote one level
 * - accuracy < 40% -> demote one level
 * - otherwise stay
 *
 * Max 1 level change per 5 attempts. Manual override is kept.
 * After 3 sessions on a topic with accuracy < 50%, flag foundational task needed.
 */
import { DifficultyLevel } from '../../../../shared/enums.js';

export const DIFFICULTY_ORDER = [DifficultyLevel.EASY, DifficultyLevel.MEDIUM, DifficultyLevel.HARD];

export function getMedian(numbers = []) {
  if (!numbers || numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Evaluates adaptive difficulty based on recent attempt history.
 *
 * @param {Object} params
 * @param {string} params.currentDifficulty - 'easy' | 'medium' | 'hard'
 * @param {boolean} params.isManualOverride - if user set an explicit override
 * @param {Array<{isCorrect: boolean, timeTakenSeconds: number}>} params.recentAttempts - list of attempts
 * @param {number} params.expectedTimeSeconds - baseline target duration
 * @param {Array<number>} params.pastSessionAccuracies - recent session accuracy percentages [e.g. 40, 30, 45]
 * @returns {Object} { newDifficulty, changed, reason, needsFoundationalTask }
 */
export function evaluateAdaptiveDifficulty({
  currentDifficulty = DifficultyLevel.MEDIUM,
  isManualOverride = false,
  recentAttempts = [],
  expectedTimeSeconds = 60,
  pastSessionAccuracies = []
}) {
  const currentIndex = DIFFICULTY_ORDER.indexOf(currentDifficulty);
  const safeIndex = currentIndex !== -1 ? currentIndex : 1;

  // 1. Check foundational task trigger: 3 sessions below 50%
  let needsFoundationalTask = false;
  if (Array.isArray(pastSessionAccuracies) && pastSessionAccuracies.length >= 3) {
    const lastThreeSessions = pastSessionAccuracies.slice(-3);
    if (lastThreeSessions.every(acc => acc < 0.50)) {
      needsFoundationalTask = true;
    }
  }

  // 2. If manual override is active, keep it
  if (isManualOverride) {
    return {
      newDifficulty: currentDifficulty,
      changed: false,
      reason: 'Manual user override is active',
      needsFoundationalTask
    };
  }

  // 3. Must have at least 5 attempts to evaluate
  if (!Array.isArray(recentAttempts) || recentAttempts.length < 5) {
    return {
      newDifficulty: currentDifficulty,
      changed: false,
      reason: `Insufficient attempts (${recentAttempts?.length || 0}/5 required for evaluation)`,
      needsFoundationalTask
    };
  }

  // Evaluate the last 5 attempts
  const evalWindow = recentAttempts.slice(-5);
  const correctCount = evalWindow.filter(a => a.isCorrect).length;
  const accuracy = correctCount / 5;
  const medianTime = getMedian(evalWindow.map(a => a.timeTakenSeconds || 0));

  let nextIndex = safeIndex;
  let reason = 'Difficulty sustained based on balanced performance';

  if (accuracy >= 0.80 && medianTime <= expectedTimeSeconds) {
    if (safeIndex < DIFFICULTY_ORDER.length - 1) {
      nextIndex = safeIndex + 1;
      reason = `Promoted to ${DIFFICULTY_ORDER[nextIndex]}: high accuracy (${Math.round(accuracy * 100)}%) and quick response time (${medianTime}s <= ${expectedTimeSeconds}s).`;
    } else {
      reason = 'Already at maximum difficulty (hard).';
    }
  } else if (accuracy < 0.40) {
    if (safeIndex > 0) {
      nextIndex = safeIndex - 1;
      reason = `Demoted to ${DIFFICULTY_ORDER[nextIndex]}: low accuracy (${Math.round(accuracy * 100)}% < 40%).`;
    } else {
      reason = 'Already at minimum difficulty (easy).';
    }
  }

  return {
    newDifficulty: DIFFICULTY_ORDER[nextIndex],
    changed: nextIndex !== safeIndex,
    reason,
    needsFoundationalTask,
    metrics: { accuracy, medianTime, expectedTimeSeconds }
  };
}
