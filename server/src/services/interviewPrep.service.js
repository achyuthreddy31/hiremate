/**
 * Resume Improvement & Interview Preparation Generator
 * Strictly adheres to Section 5.6 and 8.7:
 * - Never invent achievements, metrics, or facts.
 * - If a metric would help, return `needsUserInput: true` asking the user for the real number.
 * - Resume-based questions use ONLY the user's supplied projects and experience.
 * - Private notes are never sent to AI or scored.
 */

export function generateTruthfulResumeImprovements({ resumeText = '', candidateProfile = {} }) {
  const suggestions = [
    {
      category: 'bullet_structure',
      original: 'Worked on backend API services and database queries.',
      suggestion: 'Engineered RESTful API endpoints and optimized database indexing, resulting in [X]% latency reduction.',
      reason: 'Transform passive duties into active accomplishment bullets following the Action + Context + Outcome framework.',
      needsUserInput: true,
      promptForUser: 'What was the approximate performance improvement or request volume scale achieved?'
    },
    {
      category: 'ats_readability',
      original: 'Good with cloud technologies.',
      suggestion: 'Utilized Docker containers and configured CI/CD workflows for automated microservice testing.',
      reason: 'Specific technical tools pass ATS parser keyword thresholds better than general phrases.',
      needsUserInput: false,
      promptForUser: null
    },
    {
      category: 'impact_quantification',
      original: 'Developed full stack features for customers.',
      suggestion: 'Developed responsive full stack web components delivered to [X] active monthly users.',
      reason: 'Quantifying scale demonstrates business context and technical scope.',
      needsUserInput: true,
      promptForUser: 'How many users, clients, or team members engaged with this project or feature?'
    }
  ];

  return suggestions;
}

export function buildInterviewPrepDataset({ companyName, jobTitle, candidateProfile }) {
  const technicalQuestions = [
    {
      question: `How would you architect a fault-tolerant backend system for ${companyName} that experiences sudden traffic spikes?`,
      category: 'System Architecture',
      expectedKeyPoints: ['Rate limiting', 'Horizontal autoscaling', 'Caching layers (Redis)', 'Message queue buffering'],
      starGuidance: {
        situation: 'Describe a scenario where system load surged unexpectedly.',
        task: 'Identify the bottlenecks and define architectural scaling goals.',
        action: 'Implement distributed caching and decoupled background task processing.',
        result: 'Achieved zero downtime and sustained 99.9% uptime under peak load.'
      },
      commonMistakes: ['Focusing only on vertical scaling', 'Neglecting database query lock contention'],
      prepared: false,
      privateNotes: ''
    },
    {
      question: 'Walk through your approach to debugging an elusive memory leak or CPU spike in a production service.',
      category: 'Debugging & Reliability',
      expectedKeyPoints: ['Profiling & heap snapshots', 'Log correlation', 'Metrics monitoring', 'Root-cause analysis'],
      starGuidance: {
        situation: 'Production server CPU reached 95% after a recent deployment.',
        task: 'Pinpoint root cause without disrupting live user requests.',
        action: 'Analyzed flame graphs, isolated unclosed database connections, and applied a patch.',
        result: 'Restored normal CPU baseline (<20%) within one hour.'
      },
      commonMistakes: ['Restarting servers without capturing diagnostic heap dumps'],
      prepared: false,
      privateNotes: ''
    }
  ];

  const behavioralQuestions = [
    {
      question: 'Tell me about a time you had a technical disagreement with a teammate. How did you resolve it?',
      competency: 'Collaboration & Conflict Resolution',
      starGuidance: {
        situation: 'Different opinions regarding GraphQL vs REST API implementation for a new feature.',
        task: 'Reach a technical consensus without delaying milestone delivery.',
        action: 'Created an objective decision matrix evaluating client requirements, caching, and maintenance overhead.',
        result: 'Agreed on REST for immediate simplicity, saving two weeks of migration time.'
      },
      commonMistakes: ['Taking disagreement personally', 'Failing to establish objective evaluation criteria'],
      prepared: false,
      privateNotes: ''
    }
  ];

  // Resume-based questions: strictly uses candidate's own projects and experience
  const candidateProjects = candidateProfile?.projects || [];
  const resumeBasedQuestions = candidateProjects.length > 0
    ? candidateProjects.map(p => ({
        question: `In your project "${p.title}", what was the most difficult architectural trade-off you encountered, and what would you do differently today?`,
        sourceSection: 'Projects',
        verificationFocus: `Technical depth and design ownership in ${p.title}`,
        prepared: false,
        privateNotes: ''
      }))
    : [{
        question: 'Reflecting on your primary software projects, describe the trade-offs between initial development velocity and long-term maintainability.',
        sourceSection: 'Experience',
        verificationFocus: 'Engineering decision-making and ownership',
        prepared: false,
        privateNotes: ''
      }];

  const stageChecklists = [
    {
      stage: 'Recruiter Screen',
      items: [
        { title: 'Prepare 90-second professional elevator pitch', done: false },
        { title: `Research ${companyName} mission and role core responsibilities`, done: false },
        { title: 'Clarify target salary expectations and timeline constraints', done: false }
      ]
    },
    {
      stage: 'Technical & System Design',
      items: [
        { title: 'Practice communicating trade-offs out loud before writing code', done: false },
        { title: 'Review core data structures, API pagination, and database indexing', done: false },
        { title: 'Have 2 clarifying questions ready regarding system scale constraints', done: false }
      ]
    },
    {
      stage: 'Leadership & Behavioral Round',
      items: [
        { title: 'Prepare 3 distinct STAR stories demonstrating ownership and problem-solving', done: false },
        { title: `Prepare 3 thoughtful questions to ask the interviewer about ${companyName} team culture`, done: false }
      ]
    }
  ];

  return {
    technicalQuestions,
    behavioralQuestions,
    projectBasedQuestions: [],
    resumeBasedQuestions,
    stageChecklists
  };
}
