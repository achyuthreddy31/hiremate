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

export function cleanHeading(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/~~+/g, '') // strip markdown strikethrough
    .replace(/[*_#`~]/g, '') // strip markdown formatting characters
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Builds progressive phase descriptions for a topic when spread across multiple days.
 * Guarantees distinct milestone titles with progressive depth.
 */
function getProgressivePhase(topic, phaseIndex, totalPhases) {
  const cleanTopic = cleanHeading(topic);
  if (totalPhases <= 1) {
    return {
      title: `${cleanTopic}: Core Principles & Applied Drills`,
      phase: 'Core Foundations & Practice',
      difficulty: 'medium',
      focus: 'Foundational principles, execution flow, and practical problem-solving drills'
    };
  }

  if (phaseIndex === 0) {
    return {
      title: `${cleanTopic}: Core Foundations & Architecture`,
      phase: 'Foundations',
      difficulty: 'easy',
      focus: 'Underlying mechanics, syntax primitives, runtime behavior, and architecture standards'
    };
  } else if (phaseIndex === 1) {
    return {
      title: `${cleanTopic}: Implementation Patterns & Practical Drills`,
      phase: 'Applied Patterns',
      difficulty: 'medium',
      focus: 'Common architectural patterns, component state, API design, and practical implementations'
    };
  } else if (phaseIndex === 2) {
    return {
      title: `${cleanTopic}: Advanced Optimization & Concurrency Trade-Offs`,
      phase: 'Advanced',
      difficulty: 'hard',
      focus: 'Performance bottlenecks, concurrency pitfalls, memory management, and production edge cases'
    };
  } else if (phaseIndex === 3) {
    return {
      title: `${cleanTopic}: System Integration & Mock Interview Drills`,
      phase: 'Integration',
      difficulty: 'hard',
      focus: 'End-to-end integration, mock interview question readiness, and scalability trade-offs'
    };
  } else if (phaseIndex === 4) {
    return {
      title: `${cleanTopic}: Production Edge Cases & Benchmark Tuning`,
      phase: 'Deep Mastery',
      difficulty: 'hard',
      focus: 'Distributed patterns, resilience strategies, and high-throughput tuning'
    };
  } else {
    return {
      title: `${cleanTopic}: Real-World Architectural Case Studies (Day ${phaseIndex + 1})`,
      phase: 'Case Studies',
      difficulty: 'hard',
      focus: 'Complex system scenarios, architectural trade-offs, and defense'
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

  // 4. Distribute study days across ranked gaps with strict topic continuity (contiguous blocks)
  // Ensure every study day from 1 to studyDays has assigned topics without skips
  const dayAssignments = [];
  for (let d = 1; d <= studyDays; d++) {
    dayAssignments.push({
      day: d,
      slots: []
    });
  }

  // Determine how many contiguous days each gap will receive
  const gapAllocations = new Map();
  const numGaps = rankedGaps.length;

  if (studyDays <= numGaps) {
    // Each of the top studyDays gaps gets 1 day
    for (let i = 0; i < studyDays; i++) {
      const key = rankedGaps[i].id || rankedGaps[i].name;
      gapAllocations.set(key, 1);
    }
    for (let i = studyDays; i < numGaps; i++) {
      const key = rankedGaps[i].id || rankedGaps[i].name;
      gapAllocations.set(key, 0);
    }
  } else {
    // Every gap gets at least 1 base day
    for (const g of rankedGaps) {
      gapAllocations.set(g.id || g.name, 1);
    }
    let remainingDays = studyDays - numGaps;
    const totalPriority = rankedGaps.reduce((acc, g) => acc + (g.priorityScore || 1), 0);

    // Distribute proportionally by priority score
    for (const g of rankedGaps) {
      if (remainingDays <= 0) break;
      const key = g.id || g.name;
      const proportion = (g.priorityScore || 1) / (totalPriority || 1);
      const extra = Math.min(remainingDays, Math.floor(remainingDays * proportion));
      gapAllocations.set(key, gapAllocations.get(key) + extra);
      remainingDays -= extra;
    }

    // Allocate any leftover days to the highest priority gaps
    let leftoverIdx = 0;
    while (remainingDays > 0) {
      const key = rankedGaps[leftoverIdx % numGaps].id || rankedGaps[leftoverIdx % numGaps].name;
      gapAllocations.set(key, gapAllocations.get(key) + 1);
      remainingDays--;
      leftoverIdx++;
    }
  }

  // Populate days CONTIGUOUSLY for each gap to preserve topic continuity
  let currentDay = 1;
  for (const gap of rankedGaps) {
    const key = gap.id || gap.name;
    const daysForGap = gapAllocations.get(key) || 0;
    if (daysForGap <= 0) continue;

    for (let phaseIdx = 0; phaseIdx < daysForGap; phaseIdx++) {
      if (currentDay > studyDays) break;
      const progressive = getProgressivePhase(
        gap.normalizedName || gap.name,
        phaseIdx,
        daysForGap
      );

      dayAssignments[currentDay - 1].slots.push({
        topic: gap.normalizedName || gap.name,
        requirementRef: gap.requirementRef || gap.id,
        gapRef: gap.id || gap.requirementRef,
        title: progressive.title,
        phase: progressive.phase,
        difficulty: progressive.difficulty,
        priority: gap.importance || 'important',
        estimatedMinutes: dailyMins,
        dayLabel: `Day ${currentDay}`,
        reason: `Day ${currentDay} milestone targeting ${gap.normalizedName || gap.name}: ${progressive.focus}`
      });
      currentDay++;
    }
  }

  // 5. Flatten scheduled tasks and ensure chronological order
  const scheduledTasks = [];
  for (const dayObj of dayAssignments) {
    for (const slot of dayObj.slots) {
      scheduledTasks.push({
        day: dayObj.day,
        dayLabel: slot.dayLabel || `Day ${dayObj.day}`,
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
  // Sub-day task structure prevents duplicate identical Day 14 labels while maintaining day index
  const finalDayNumber = daysAvailable;
  const revisionTasks = [];
  if (isMultiDay) {
    revisionTasks.push({
      day: finalDayNumber,
      subTask: 1,
      subTaskTotal: 2,
      dayLabel: `Day ${finalDayNumber} (Part 1 of 2)`,
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
      subTask: 2,
      subTaskTotal: 2,
      dayLabel: `Day ${finalDayNumber} (Part 2 of 2)`,
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
