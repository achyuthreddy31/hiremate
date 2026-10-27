import { allocateRoadmapSlots } from './scoring/roadmapAllocation.js';

/**
 * Builds complete preparation roadmap with deterministic time allocation.
 * Enforces rule: Every task MUST reference a requirementRef and a gapRef.
 * Strictly guarantees chronological order starting from Day 1 to final day.
 * Structures daily learning activities into 3 sequential stages:
 *   Stage 1 — Fundamentals & Concepts
 *   Stage 2 — Guided Coding Practice
 *   Stage 3 — Advanced Topics & Challenges
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

  // Enhance scheduled tasks with progressive 3-stage learning activities
  const tasksWithWording = allocation.scheduledTasks.map(task => {
    let title = task.title || `Master ${task.topic}`;
    let learningObjectives = `Master fundamental concepts, execute guided implementations, and conquer advanced interview problems in ${task.topic}.`;
    let stage1_fundamentals = `Stage 1 — Fundamentals & Concepts: Review core principles, mental models, runtime characteristics, and essential syntax for ${task.topic}.`;
    let stage2_guidedPractice = `Stage 2 — Guided Coding Practice: Implement idiomatic coding patterns, build mini-modules, and complete structured problem-solving drills in ${task.topic}.`;
    let stage3_advancedTopics = `Stage 3 — Advanced Topics & Challenges: Tackle complex edge cases, concurrency/memory trade-offs, performance optimization, and rigorous interview-level coding challenges for ${task.topic}.`;

    if (task.difficulty === 'easy') {
      learningObjectives = `Establish rock-solid conceptual foundations and syntax fluency for ${task.topic}.`;
      stage1_fundamentals = `Stage 1 — Fundamentals & Concepts: Study core terminology, execution flow, language primitives, and architecture standards for ${task.topic}.`;
      stage2_guidedPractice = `Stage 2 — Guided Coding Practice: Write clean, self-contained implementation examples and verify output across baseline test cases for ${task.topic}.`;
      stage3_advancedTopics = `Stage 3 — Advanced Topics & Challenges: Identify anti-patterns, resolve subtle logic traps, and solve introductory algorithm problems for ${task.topic}.`;
    } else if (task.difficulty === 'hard') {
      learningObjectives = `Deep-dive into high-performance architecture, distributed paradigms, and advanced edge cases in ${task.topic}.`;
      stage1_fundamentals = `Stage 1 — Fundamentals & Concepts: Examine internal engine architectures, memory layout, lock contention, and protocol specifications for ${task.topic}.`;
      stage2_guidedPractice = `Stage 2 — Guided Coding Practice: Architect scalable system components, implement robust error-handling boundaries, and run benchmarks for ${task.topic}.`;
      stage3_advancedTopics = `Stage 3 — Advanced Topics & Challenges: Troubleshoot production outages, optimize algorithmic complexity (time & space), and defend trade-offs in ${task.topic}.`;
    }

    if (task.requirementRef === 'revision_comprehensive') {
      title = 'Comprehensive Revision & Note Review';
      learningObjectives = 'Consolidate key system architectures, algorithmic paradigms, and STAR interview stories across all completed domains.';
      stage1_fundamentals = 'Stage 1 — Fundamentals & Concepts: Rapidly review comprehensive revision notes, core mechanics, and architectural cheat sheets.';
      stage2_guidedPractice = 'Stage 2 — Guided Coding Practice: Run timed self-quizzing and write out solution blueprints for recurring technical questions.';
      stage3_advancedTopics = 'Stage 3 — Advanced Topics & Challenges: Synthesize cross-cutting trade-offs, scalability bottlenecks, and behavioral STAR stories.';
    } else if (task.requirementRef === 'final_checklist_audit') {
      title = 'Final Target Job Readiness Audit';
      learningObjectives = 'Finalize interview logistics, role alignment, and technical confidence for target company evaluation.';
      stage1_fundamentals = 'Stage 1 — Fundamentals & Concepts: Audit role requirements, job description nuances, and company research facts.';
      stage2_guidedPractice = 'Stage 2 — Guided Coding Practice: Rehearse system walkthroughs and walk through your technical portfolio highlights.';
      stage3_advancedTopics = 'Stage 3 — Advanced Topics & Challenges: Execute final checklist verification, interview environment setup, and logistics check.';
    }

    return {
      ...task,
      title,
      learningObjectives,
      stage1_fundamentals,
      stage2_guidedPractice,
      stage3_advancedTopics,
      learningActivity: stage1_fundamentals,
      practiceActivity: `${stage2_guidedPractice} Then ${stage3_advancedTopics}`
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
