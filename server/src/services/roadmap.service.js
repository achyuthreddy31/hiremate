import { allocateRoadmapSlots } from './scoring/roadmapAllocation.js';

/**
 * Builds complete preparation roadmap with deterministic time allocation.
 * Enforces rule: Every task MUST reference a requirementRef and a gapRef.
 * Strictly guarantees chronological order starting from Day 1 to final day.
 */
export function generateRoadmapPlan({
  userAvailableDays = 14,
  interviewDate = null,
  dailyPreparationMinutes = 60,
  requirementsResults = []
}) {
  // Identify gaps (requirements that are not strong)
  const gaps = requirementsResults
    .filter(r => r.status !== 'strong')
    .map(r => ({
      id: r.requirementRef || r.normalizedName || r.name,
      requirementRef: r.requirementRef || r.normalizedName || r.name,
      name: r.name,
      normalizedName: r.normalizedName || r.name,
      importance: r.importance || 'important',
      score: r.score || 0,
      difficulty: r.score < 30 ? 'easy' : (r.score < 60 ? 'medium' : 'hard')
    }));

  const allocation = allocateRoadmapSlots({
    userAvailableDays,
    interviewDate,
    dailyPreparationMinutes,
    gaps
  });

  // Enhance scheduled tasks with progressive learning activities & practice descriptions
  const tasksWithWording = allocation.scheduledTasks.map(task => {
    let title = task.title || `Master ${task.topic}`;
    let learningActivity = `Read official documentation and architectural patterns for ${task.topic}.`;
    let practiceActivity = `Build a hands-on proof-of-concept module and solve practice questions for ${task.topic}.`;

    if (task.difficulty === 'easy') {
      learningActivity = `Review foundational mechanics, key terminology, and syntax essentials for ${task.topic}.`;
      practiceActivity = `Implement core code examples and complete introductory practice questions for ${task.topic}.`;
    } else if (task.difficulty === 'hard') {
      learningActivity = `Deep-dive into concurrency trade-offs, system optimization, and edge cases in ${task.topic}.`;
      practiceActivity = `Debug complex scenario items and execute performance optimization drills for ${task.topic}.`;
    }

    if (task.requirementRef === 'revision_comprehensive') {
      title = 'Comprehensive Revision & Note Review';
      learningActivity = 'Review personal prep notes, key architectural trade-offs, and STAR stories.';
      practiceActivity = 'Simulate self-quizzing across all target job requirements.';
    } else if (task.requirementRef === 'final_checklist_audit') {
      title = 'Final Target Job Readiness Audit';
      learningActivity = 'Verify all checklist items, role details, and company research facts.';
      practiceActivity = 'Complete final self-audit and interview logistics check.';
    }

    return {
      ...task,
      title,
      learningActivity,
      practiceActivity
    };
  });

  // Ensure strict chronological sort
  tasksWithWording.sort((a, b) => a.day - b.day);

  return {
    totalDays: allocation.totalDays,
    dailyMinutes: allocation.dailyMinutes,
    completionPercentage: 0,
    tasks: tasksWithWording,
    uncoveredGaps: allocation.uncoveredGaps.map(g => ({
      name: g.normalizedName || g.name,
      importance: g.importance,
      reason: g.reason
    }))
  };
}

/**
 * Generates learning recommendations linked to specific requirement gaps.
 */
export function generateRecommendationsForGaps({ applicationId, firebaseUid, gaps = [] }) {
  const recommendations = [];

  for (const gap of gaps) {
    const topic = gap.normalizedName || gap.name;
    recommendations.push({
      firebaseUid,
      applicationId,
      title: `${topic} Official Guides and Architecture Handbook`,
      type: 'documentation',
      link: null, // rule: null link unless grounded search; use searchQuery
      searchQuery: `learn ${topic} official documentation best practices`,
      skill: topic,
      requirementRef: gap.requirementRef || topic,
      reason: `Directly bridges requirement gap in target skill ${topic}.`,
      difficulty: 'medium',
      estimatedMinutes: 45,
      confidence: 0.95
    });

    recommendations.push({
      firebaseUid,
      applicationId,
      title: `Build a Production-Ready ${topic} Feature`,
      type: 'project_idea',
      link: null,
      searchQuery: `${topic} hands on practical project github`,
      skill: topic,
      requirementRef: gap.requirementRef || topic,
      reason: `Practical implementation evidence for ${topic}.`,
      difficulty: 'hard',
      estimatedMinutes: 60,
      confidence: 0.90
    });
  }

  return recommendations;
}
