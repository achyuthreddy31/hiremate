/**
 * Roadmap Time Allocation Engine
 * Pure functions strictly implementing Section 3.6.
 *
 * 1. Days available = min(user.availableDays, daysUntilInterview). Default 14.
 * 2. Total minutes = days * dailyPreparationMinutes. Reserve final day for revision and checklist.
 * 3. Rank gaps by importanceWeight * (100 - requirementScore).
 *    Allocate minutes proportionally across gaps using min slots of 20 mins.
 * 4. Prioritize critical gaps; flag uncovered ones.
 * 5. Deterministic day-by-day slot generation.
 */
import { getImportanceMultiplier } from './evidenceScoring.js';

export const MIN_SLOT_MINUTES = 20;

/**
 * Builds deterministic day-by-day roadmap slots.
 *
 * @param {Object} params
 * @param {number} params.userAvailableDays - candidate stated available days
 * @param {string|Date} params.interviewDate - target interview date
 * @param {number} params.dailyPreparationMinutes - daily study limit (default 60)
 * @param {Array<Object>} params.gaps - list of identified skill gaps
 * @returns {Object} { totalDays, totalMinutes, allocatedTasks, uncoveredGaps, revisionDay }
 */
export function allocateRoadmapSlots({
  userAvailableDays = 14,
  interviewDate = null,
  dailyPreparationMinutes = 60,
  gaps = []
}) {
  // 1. Days available calculation
  let daysAvailable = userAvailableDays > 0 ? userAvailableDays : 14;

  if (interviewDate) {
    const now = new Date();
    const interview = new Date(interviewDate);
    const diffMs = interview.getTime() - now.getTime();
    if (!isNaN(diffMs) && diffMs > 0) {
      const daysUntil = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      daysAvailable = Math.min(daysAvailable, daysUntil);
    }
  }

  // Bound to at least 1 day
  daysAvailable = Math.max(1, Math.min(180, daysAvailable));

  // 2. Total study days excluding final revision day (if > 1 day)
  const isMultiDay = daysAvailable > 1;
  const studyDays = isMultiDay ? daysAvailable - 1 : 1;
  const dailyMins = Math.max(20, dailyPreparationMinutes || 60);
  const totalStudyMinutes = studyDays * dailyMins;

  // 3. Rank gaps by importanceWeight * (100 - requirementScore)
  const rankedGaps = (gaps || []).map(gap => {
    const weight = getImportanceMultiplier(gap.importance);
    const score = typeof gap.score === 'number' ? gap.score : 0;
    const gapSeverity = Math.max(0, 100 - score);
    const priorityScore = weight * gapSeverity;
    return {
      ...gap,
      weight,
      gapSeverity,
      priorityScore
    };
  });

  rankedGaps.sort((a, b) => b.priorityScore - a.priorityScore);

  const totalPriorityScore = rankedGaps.reduce((sum, g) => sum + g.priorityScore, 0);

  // 4. Proportional time allocation with minimum 20 min slots
  const allocatedGaps = [];
  const uncoveredGaps = [];
  let remainingMinutesToDistribute = totalStudyMinutes;

  if (totalPriorityScore > 0 && rankedGaps.length > 0) {
    for (const gap of rankedGaps) {
      if (remainingMinutesToDistribute < MIN_SLOT_MINUTES) {
        uncoveredGaps.push({
          ...gap,
          reason: 'Insufficient study time remaining; prioritized higher impact gaps'
        });
        continue;
      }

      // Proportional share rounded to 20-min chunks
      const share = (gap.priorityScore / totalPriorityScore) * totalStudyMinutes;
      const roundedMinutes = Math.max(MIN_SLOT_MINUTES, Math.round(share / MIN_SLOT_MINUTES) * MIN_SLOT_MINUTES);
      const allocatedMins = Math.min(remainingMinutesToDistribute, roundedMinutes);

      if (allocatedMins >= MIN_SLOT_MINUTES) {
        allocatedGaps.push({
          ...gap,
          allocatedMinutes: allocatedMins
        });
        remainingMinutesToDistribute -= allocatedMins;
      } else {
        uncoveredGaps.push({
          ...gap,
          reason: 'Time quota depleted before meeting minimum 20-minute threshold'
        });
      }
    }
  }

  // 5. Build Day-by-Day schedule
  const scheduledTasks = [];
  let currentDay = 1;
  let currentDayMinutesUsed = 0;

  for (const gap of allocatedGaps) {
    let gapMinutesRemaining = gap.allocatedMinutes;

    while (gapMinutesRemaining > 0 && currentDay <= studyDays) {
      const roomInDay = dailyMins - currentDayMinutesUsed;

      if (roomInDay < MIN_SLOT_MINUTES) {
        // Move to next day
        currentDay++;
        currentDayMinutesUsed = 0;
        if (currentDay > studyDays) break;
        continue;
      }

      const slotMinutes = Math.min(gapMinutesRemaining, roomInDay);
      scheduledTasks.push({
        day: currentDay,
        topic: gap.normalizedName || gap.name,
        requirementRef: gap.requirementRef || gap.id,
        gapRef: gap.id || gap.requirementRef,
        estimatedMinutes: slotMinutes,
        priority: gap.importance || 'important',
        difficulty: gap.difficulty || 'medium',
        reason: `Targeting gap in ${gap.normalizedName || gap.name} (Priority Score: ${gap.priorityScore})`,
        status: 'pending'
      });

      gapMinutesRemaining -= slotMinutes;
      currentDayMinutesUsed += slotMinutes;

      if (currentDayMinutesUsed >= dailyMins) {
        currentDay++;
        currentDayMinutesUsed = 0;
      }
    }
  }

  // Final Day: Revision & Final Checklist
  const finalDayNumber = daysAvailable;
  const revisionTasks = [];
  if (isMultiDay) {
    revisionTasks.push({
      day: finalDayNumber,
      topic: 'Final Comprehensive Review',
      requirementRef: 'revision_comprehensive',
      gapRef: 'revision',
      estimatedMinutes: Math.round(dailyMins * 0.6),
      priority: 'critical',
      difficulty: 'medium',
      reason: 'Consolidate key concepts and review notes across all completed topics before the target interview date.',
      status: 'pending'
    });
    revisionTasks.push({
      day: finalDayNumber,
      topic: 'Final Interview Readiness Checklist',
      requirementRef: 'final_checklist_audit',
      gapRef: 'checklist',
      estimatedMinutes: Math.round(dailyMins * 0.4),
      priority: 'critical',
      difficulty: 'easy',
      reason: 'Complete the finalized job-specific interview checklist and verify readiness requirements.',
      status: 'pending'
    });
  }

  return {
    totalDays: daysAvailable,
    dailyMinutes: dailyMins,
    totalMinutesAvailable: daysAvailable * dailyMins,
    studyDays,
    scheduledTasks: [...scheduledTasks, ...revisionTasks],
    uncoveredGaps,
    allocationSummary: {
      allocatedGapsCount: allocatedGaps.length,
      uncoveredGapsCount: uncoveredGaps.length,
      totalTasksCount: scheduledTasks.length + revisionTasks.length
    }
  };
}
