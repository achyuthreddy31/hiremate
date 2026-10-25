/**
 * Roadmap Time Allocation Engine
 * Pure functions implementing deterministic, progressive preparation schedules.
 *
 * 1. Days available = calculated from userAvailableDays and interviewDate (if valid future date).
 * 2. Total minutes = days * dailyPreparationMinutes. Reserve final day for revision and checklist.
 * 3. Rank gaps by importanceWeight * (100 - requirementScore).
 * 4. Progressive milestone distribution:
 *    - Day 1+: Foundational concepts and architecture.
 *    - Next: Intermediate applied patterns and drills.
 *    - Next: Advanced optimization, edge cases and trade-offs.
 * 5. Every day from Day 1 to final day is populated sequentially without skipping days.
 * 6. Tasks are strictly sorted chronologically (Day 1 -> Day N).
 */
import { getImportanceMultiplier } from './evidenceScoring.js';

export const MIN_SLOT_MINUTES = 20;

/**
 * Builds progressive phase descriptions for a topic when spread across multiple days.
 */
function getProgressivePhase(topic, phaseIndex, totalPhases) {
  if (totalPhases <= 1) {
    return {
      title: `Master ${topic}: Core Concepts & Practical Application`,
      phase: 'Core Foundations & Practice',
      difficulty: 'medium',
      focus: 'Foundational principles and hands-on drills'
    };
  }

  if (phaseIndex === 0) {
    return {
      title: `${topic}: Core Foundations & Architecture`,
      phase: 'Foundations',
      difficulty: 'easy',
      focus: 'Underlying mechanics, terminology, and syntax essentials'
    };
  } else if (phaseIndex === 1) {
    return {
      title: `${topic}: Implementation Patterns & Problem Solving`,
      phase: 'Applied Patterns',
      difficulty: 'medium',
      focus: 'Common architectural patterns, component state, and real-world implementations'
    };
  } else if (phaseIndex === 2) {
    return {
      title: `${topic}: Advanced Optimization, Debugging & Trade-Offs`,
      phase: 'Advanced',
      difficulty: 'hard',
      focus: 'Performance bottlenecks, concurrency pitfalls, and production edge cases'
    };
  } else {
    return {
      title: `${topic}: System Integration & Mock Interview Drills`,
      phase: 'Integration',
      difficulty: 'hard',
      focus: 'End-to-end integration and mock interview question readiness'
    };
  }
}

/**
 * Builds deterministic day-by-day roadmap slots.
 *
 * @param {Object} params
 * @param {number} params.userAvailableDays - candidate stated available days
 * @param {string|Date} params.interviewDate - target interview date
 * @param {number} params.dailyPreparationMinutes - daily study limit (default 60)
 * @param {Array<Object>} params.gaps - list of identified skill gaps
 * @returns {Object} { totalDays, totalMinutesAvailable, studyDays, scheduledTasks, uncoveredGaps, allocationSummary }
 */
export function allocateRoadmapSlots({
  userAvailableDays = 14,
  interviewDate = null,
  dailyPreparationMinutes = 60,
  gaps = []
}) {
  // 1. Calculate available days
  let daysAvailable = userAvailableDays > 0 ? Number(userAvailableDays) : 14;

  if (interviewDate) {
    const now = new Date();
    const interview = new Date(interviewDate);
    const diffMs = interview.getTime() - now.getTime();
    if (!isNaN(diffMs) && diffMs > 0) {
      const daysUntil = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      daysAvailable = Math.min(daysAvailable, daysUntil);
    }
  }

  daysAvailable = Math.max(1, Math.min(180, daysAvailable));

  // 2. Determine study days (reserve final day for review if > 1 day)
  const isMultiDay = daysAvailable > 1;
  const studyDays = isMultiDay ? daysAvailable - 1 : 1;
  const dailyMins = Math.max(20, Number(dailyPreparationMinutes) || 60);

  // 3. Rank gaps by importanceWeight * (100 - requirementScore)
  const rawGaps = Array.isArray(gaps) && gaps.length > 0 ? gaps : [
    { id: 'core_cs', name: 'Data Structures & Algorithms', importance: 'critical', score: 30 },
    { id: 'web_arch', name: 'System Design & REST Architecture', importance: 'important', score: 40 },
    { id: 'db_opt', name: 'Database Queries & Optimization', importance: 'important', score: 45 }
  ];

  const rankedGaps = rawGaps.map(gap => {
    const weight = getImportanceMultiplier(gap.importance || 'important');
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

  // 4. Distribute study days across ranked gaps
  // Ensure every study day from 1 to studyDays has assigned topics without skips
  const dayAssignments = [];
  for (let d = 1; d <= studyDays; d++) {
    dayAssignments.push({
      day: d,
      slots: []
    });
  }

  // Count how many days each gap will receive
  const gapDayCounts = new Map();
  rankedGaps.forEach(g => gapDayCounts.set(g.id || g.name, 0));

  for (let d = 0; d < studyDays; d++) {
    const gap = rankedGaps[d % rankedGaps.length];
    const key = gap.id || gap.name;
    const currentCount = gapDayCounts.get(key) || 0;
    gapDayCounts.set(key, currentCount + 1);

    const progressive = getProgressivePhase(
      gap.normalizedName || gap.name,
      currentCount,
      Math.ceil(studyDays / rankedGaps.length)
    );

    dayAssignments[d].slots.push({
      topic: gap.normalizedName || gap.name,
      requirementRef: gap.requirementRef || gap.id,
      gapRef: gap.id || gap.requirementRef,
      title: progressive.title,
      phase: progressive.phase,
      difficulty: progressive.difficulty,
      priority: gap.importance || 'important',
      estimatedMinutes: dailyMins,
      reason: `Day ${d + 1} milestone targeting ${gap.normalizedName || gap.name}: ${progressive.focus}`
    });
  }

  // 5. Flatten scheduled tasks and ensure chronological order
  const scheduledTasks = [];
  for (const dayObj of dayAssignments) {
    for (const slot of dayObj.slots) {
      scheduledTasks.push({
        day: dayObj.day,
        title: slot.title,
        topic: slot.topic,
        requirementRef: slot.requirementRef,
        gapRef: slot.gapRef,
        estimatedMinutes: slot.estimatedMinutes,
        priority: slot.priority,
        difficulty: slot.difficulty,
        reason: slot.reason,
        status: 'pending'
      });
    }
  }

  // 6. Final Day: Review & Final Checklist (if multi-day)
  const finalDayNumber = daysAvailable;
  const revisionTasks = [];
  if (isMultiDay) {
    revisionTasks.push({
      day: finalDayNumber,
      title: 'Final Comprehensive Review & Concept Consolidation',
      topic: 'Final Comprehensive Review',
      requirementRef: 'revision_comprehensive',
      gapRef: 'revision',
      estimatedMinutes: Math.round(dailyMins * 0.6),
      priority: 'critical',
      difficulty: 'medium',
      reason: 'Consolidate key concepts, system trade-offs, and STAR stories across all completed topics.',
      status: 'pending'
    });
    revisionTasks.push({
      day: finalDayNumber,
      title: 'Final Interview Readiness & Logistics Audit',
      topic: 'Final Interview Readiness Checklist',
      requirementRef: 'final_checklist_audit',
      gapRef: 'checklist',
      estimatedMinutes: Math.round(dailyMins * 0.4),
      priority: 'critical',
      difficulty: 'easy',
      reason: 'Verify role requirements, logistics, company insights, and final checklist readiness.',
      status: 'pending'
    });
  }

  // Strictly sort all tasks by day ascending
  const allTasks = [...scheduledTasks, ...revisionTasks].sort((a, b) => a.day - b.day);

  return {
    totalDays: daysAvailable,
    dailyMinutes: dailyMins,
    totalMinutesAvailable: daysAvailable * dailyMins,
    studyDays,
    scheduledTasks: allTasks,
    uncoveredGaps: [],
    allocationSummary: {
      allocatedGapsCount: rankedGaps.length,
      uncoveredGapsCount: 0,
      totalTasksCount: allTasks.length
    }
  };
}
