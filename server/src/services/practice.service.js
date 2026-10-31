import { evaluateAdaptiveDifficulty } from './scoring/adaptiveDifficulty.js';
import { callGeminiStructured, getGeminiClient } from './gemini.service.js';
import { z } from 'zod';
import { evaluateCodingSolution } from './codeExecution/index.js';
import {
  PRACTICE_CATEGORIES,
  DIFFICULTY_MAP,
  REVERSE_DIFFICULTY_MAP,
  CURATED_MCQ_BANK,
  CURATED_CODING_CHALLENGES,
  generateProceduralCodingChallenge
} from './practiceBank.js';

export {
  PRACTICE_CATEGORIES,
  DIFFICULTY_MAP,
  REVERSE_DIFFICULTY_MAP,
  CURATED_MCQ_BANK,
  CURATED_CODING_CHALLENGES
};

/**
 * Fisher-Yates array shuffling to avoid option position biases.
 */
export function shuffleArray(array = []) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Known technical skills across platform categories for text-level skill differentiation.
 */
const KNOWN_SKILLS = [
  'python', 'java', 'c', 'cpp', 'c++', 'javascript', 'typescript',
  'html', 'css', 'react', 'nodejs', 'expressjs', 'fastapi',
  'sql', 'mongodb', 'postgresql', 'mysql',
  'data structures algorithms', 'objectoriented programming', 'dbms',
  'operating systems', 'computer networks',
  'artificial intelligence', 'machine learning', 'data science',
  'pandas', 'numpy'
];

/**
 * Common English stopwords and procedural phrasing boilerplate tokens.
 * Stripped during semantic content comparison to prevent procedural framing from skewing similarity.
 */
const STOP_AND_FRAME_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', 'arent', 'as', 'at', 'be', 'because', 'been', 'before', 'being',
  'below', 'between', 'both', 'but', 'by', 'can', 'cannot', 'could', 'did', 'do',
  'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further',
  'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him',
  'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself',
  'let', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off',
  'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out',
  'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that',
  'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was',
  'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why',
  'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves',
  // Common procedural question frames
  'consider', 'following', 'approach', 'pattern', 'implemented', 'implementing',
  'utilizing', 'utilize', 'using', 'built', 'purpose', 'primary', 'statement',
  'explain', 'describe', 'difference', 'distinction', 'best', 'effective',
  'code', 'snippet', 'output', 'expected', 'expectedtimeseconds'
]);

/**
 * Normalizes question text for robust deduplication.
 * Strips punctuation, collapses whitespace, converts to lowercase.
 */
export function normalizeQuestionText(text = '') {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts substantive technical content tokens, omitting grammatical and procedural boilerplate.
 */
export function extractContentTokens(text = '') {
  const norm = normalizeQuestionText(text);
  if (!norm) return [];
  return norm.split(' ').filter(token => token.length > 1 && !STOP_AND_FRAME_WORDS.has(token));
}

/**
 * Calculates token-level Jaccard similarity between two texts.
 */
export function calculateTokenSimilarity(textA = '', textB = '') {
  const normA = normalizeQuestionText(textA);
  const normB = normalizeQuestionText(textB);
  if (!normA || !normB) return 0;
  if (normA === normB) return 1;

  const tokensA = new Set(normA.split(' ').filter(Boolean));
  const tokensB = new Set(normB.split(' ').filter(Boolean));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersection = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) intersection++;
  }
  const union = new Set([...tokensA, ...tokensB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Calculates semantic content token Jaccard similarity between two texts.
 */
export function calculateContentSimilarity(textA = '', textB = '') {
  const tokensA = new Set(extractContentTokens(textA));
  const tokensB = new Set(extractContentTokens(textB));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersection = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) intersection++;
  }
  const union = new Set([...tokensA, ...tokensB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Extracts recognized platform technical skills from a normalized text.
 * Uses exact token boundaries to prevent single-letter languages (like 'c') from matching substrings.
 */
function extractSkillsFromText(norm = '') {
  if (!norm) return new Set();
  const words = new Set(norm.split(' ').filter(Boolean));
  const detected = new Set();

  for (const sk of KNOWN_SKILLS) {
    const cleanSk = sk.replace(/[^\w\s]/g, '').trim();
    if (cleanSk.includes(' ')) {
      if (norm.includes(cleanSk)) detected.add(cleanSk);
    } else {
      if (words.has(cleanSk)) detected.add(cleanSk);
    }
  }
  return detected;
}

/**
 * Checks whether two texts are explicitly addressing different recognized technical domains.
 */
function detectDifferentSkillsFromText(normA = '', normB = '') {
  const skillsA = extractSkillsFromText(normA);
  const skillsB = extractSkillsFromText(normB);

  // If both texts explicitly reference known skills
  if (skillsA.size > 0 && skillsB.size > 0) {
    // Check if there is any overlap
    for (const skA of skillsA) {
      if (skillsB.has(skA)) {
        return false; // They share at least one skill
      }
    }
    // No shared skills: they are about different skills
    return true;
  }

  return false;
}

/**
 * Checks whether a candidate question is an exact duplicate or near-duplicate
 * of any question in an existing list.
 *
 * Avoids false positives across different skills/categories/modes and procedural frames.
 */
export function isDuplicateOrNearDuplicate(candidate, existingList = [], threshold = 0.75) {
  if (!candidate || !Array.isArray(existingList) || existingList.length === 0) return false;

  const candidateText = typeof candidate === 'string'
    ? candidate
    : candidate?.question || candidate?.problemStatement || '';
  const normCandidate = normalizeQuestionText(candidateText);
  if (!normCandidate) return false;

  const candSkill = typeof candidate === 'object'
    ? normalizeQuestionText(candidate?.skill || candidate?.requirementRef || candidate?.topic || '')
    : '';
  const candCat = typeof candidate === 'object'
    ? normalizeQuestionText(candidate?.category || '')
    : '';
  const candMode = typeof candidate === 'object' ? candidate?.mode : null;

  const candidateSnippet = typeof candidate === 'object' && candidate?.codeSnippet
    ? normalizeQuestionText(candidate.codeSnippet)
    : '';

  for (const item of existingList) {
    if (!item) continue;

    // 1. If both are objects, enforce skill/category/mode boundary checks
    if (typeof candidate === 'object' && typeof item === 'object') {
      const itemSkill = normalizeQuestionText(item?.skill || item?.requirementRef || item?.topic || '');
      if (candSkill && itemSkill && candSkill !== itemSkill) {
        // Different skills are never duplicates
        continue;
      }

      const itemCat = normalizeQuestionText(item?.category || '');
      if (candCat && itemCat && candCat !== itemCat && (!candSkill || candSkill !== itemSkill)) {
        // Different categories with different skills are not duplicates
        continue;
      }

      const itemMode = item?.mode;
      if (candMode && itemMode && candMode !== itemMode) {
        // MCQ vs Coding Challenge are never duplicates
        continue;
      }
    }

    const existingText = typeof item === 'string'
      ? item
      : item?.question || item?.problemStatement || '';
    const normExisting = normalizeQuestionText(existingText);
    if (!normExisting) continue;

    // 2. Exact normalized text match within the same topic
    if (normCandidate === normExisting) return true;

    // 3. Text-level check for mutually exclusive known technical skills
    if (detectDifferentSkillsFromText(normCandidate, normExisting)) {
      continue;
    }

    // 4. Duplicate code snippet with high similarity
    if (candidateSnippet && typeof item === 'object' && item?.codeSnippet) {
      const existingSnippet = normalizeQuestionText(item.codeSnippet);
      if (candidateSnippet === existingSnippet && candidateSnippet.length > 20) {
        const rawSim = calculateTokenSimilarity(normCandidate, normExisting);
        if (rawSim >= 0.50) return true;
      }
    }

    // 5. Semantic content & raw token similarity
    const rawSim = calculateTokenSimilarity(normCandidate, normExisting);
    const contentSim = calculateContentSimilarity(normCandidate, normExisting);

    // Near-identical question intent within the same topic
    if (contentSim >= 0.85 && rawSim >= 0.75) return true;
    if (contentSim >= 0.75 && rawSim >= 0.85) return true;
    if (rawSim >= 0.95) return true;

    // 6. Substring containment with strict length ratio and content similarity
    if (normCandidate.length >= 35 && normExisting.length >= 35) {
      if (normCandidate.includes(normExisting) || normExisting.includes(normCandidate)) {
        const ratio = Math.min(normCandidate.length, normExisting.length) / Math.max(normCandidate.length, normExisting.length);
        if (ratio >= 0.85 && contentSim >= 0.75) return true;
      }
    }
  }

  return false;
}

/**
 * Validates a practice question (MCQ or Coding Challenge):
 */
export function validateQuestionFormat(q) {
  if (!q) return false;

  // Coding challenge validation
  if (q.mode === 'coding_challenges' || q.type === 'code_writing') {
    if (!q.question && !q.problemStatement) return false;
    if (!Array.isArray(q.testCases) || q.testCases.length === 0) return false;
    return true;
  }

  // Standard MCQ validation
  if (!q.question || !q.explanation || !q.requirementRef) return false;
  if (!Array.isArray(q.options) || q.options.length < 2) return false;

  // Distinct options
  const uniqueOpts = new Set(q.options.map(o => String(o).trim()));
  if (uniqueOpts.size !== q.options.length) return false;

  // Exactly one correct option that exists in options
  if (!q.correctAnswer || !q.options.includes(q.correctAnswer)) return false;

  return true;
}

/**
 * Safely evaluates user solution against test cases in an isolated execution sandbox.
 * Re-exports the unified multi-language execution engine.
 */
export { evaluateCodingSolution };



/**
 * Filters and selects distinct questions for a quiz or test session.
 */
export function selectDistinctQuestions({
  pool = [],
  count = 10,
  excludeIds = [],
  excludeQuestions = [],
  targetDifficulty = null
}) {
  const excludeIdSet = new Set(excludeIds.map(id => String(id)));
  const selected = [];
  const selectedIds = new Set();
  const selectedNormTexts = new Set();

  const allExcluded = [...excludeQuestions];

  // Filter pool candidates against exclude lists
  const eligible = pool.filter(q => {
    const qId = q._id ? String(q._id) : null;
    if (qId && excludeIdSet.has(qId)) return false;
    if (isDuplicateOrNearDuplicate(q, allExcluded)) return false;
    return true;
  });

  // Randomize eligible pool to avoid order biases
  const shuffled = shuffleArray(eligible);

  // Group by difficulty preference if specified
  const prioritized = targetDifficulty
    ? [
        ...shuffled.filter(q => q.difficulty === targetDifficulty),
        ...shuffled.filter(q => q.difficulty !== targetDifficulty)
      ]
    : shuffled;

  for (const q of prioritized) {
    if (selected.length >= count) break;
    const qId = q._id ? String(q._id) : null;
    const normText = normalizeQuestionText(q.question || q.problemStatement);

    if (qId && selectedIds.has(qId)) continue;
    if (selectedNormTexts.has(normText)) continue;
    if (isDuplicateOrNearDuplicate(q, selected)) continue;

    selected.push(q);
    if (qId) selectedIds.add(qId);
    selectedNormTexts.add(normText);
  }

  return selected;
}

/**
 * Procedural variation generator for any skill or topic.
 */
function createProceduralVariations(skill, difficulty = 'medium') {
  return [
    {
      type: 'debugging',
      question: 'When profiling an application utilizing ' + skill + ', what is the most effective approach to identify and resolve high CPU contention?',
      codeSnippet: '// Performance profile checkpoint for ' + skill + '\nconst profile = startCpuProfile("' + skill + '");\nexecuteWorkload();\nconst report = profile.stop();\nconsole.log(report.topFunctionsBySelfTime());',
      options: [
        'Analyze call-tree self-time to isolate hot synchronous loops and optimize algorithmic complexity in ' + skill + '.',
        'Reboot the production host every 15 minutes to reset thread priority.',
        'Eliminate all function boundaries by inlining the entire codebase into a single file.',
        'Disable all log ingestion and error reporting pipelines.'
      ],
      correctAnswer: 'Analyze call-tree self-time to isolate hot synchronous loops and optimize algorithmic complexity in ' + skill + '.',
      explanation: 'Profiling self-time reveals exactly where execution threads spend CPU cycles, pointing directly to computational bottlenecks in ' + skill + '.',
      difficulty: 'medium',
      expectedTimeSeconds: 50
    },
    {
      type: 'scenario',
      question: 'An engineering team is scaling a service built with ' + skill + '. Which pattern best mitigates downstream service degradation during transient network faults?',
      options: [
        'Implement a Circuit Breaker pattern with exponential backoff and jitter for outbound calls in ' + skill + '.',
        'Immediately retry all failed network requests in an infinite synchronous while loop.',
        'Suppress all HTTP status codes other than 200 OK.',
        'Route all external API traffic through a single unmonitored proxy server without timeouts.'
      ],
      correctAnswer: 'Implement a Circuit Breaker pattern with exponential backoff and jitter for outbound calls in ' + skill + '.',
      explanation: 'Circuit breakers prevent cascading system failure by temporarily halting requests to an unhealthy dependency, giving it time to recover.',
      difficulty: 'medium',
      expectedTimeSeconds: 50
    },
    {
      type: 'output_prediction',
      question: 'Consider the following operational flow implemented in ' + skill + '. What is the expected status output when processing an array with empty elements?',
      codeSnippet: 'function checkIntegrity(items) {\n  const valid = items.filter(Boolean);\n  return valid.length === items.length ? "ALL_VALID" : "HAS_EMPTY";\n}\nconsole.log(checkIntegrity(["data", "", "verified"]));',
      options: ['HAS_EMPTY', 'ALL_VALID', 'undefined', 'TypeError'],
      correctAnswer: 'HAS_EMPTY',
      explanation: 'The empty string "" is falsy in standard conditional evaluations, so filter(Boolean) drops it, making valid.length (2) !== items.length (3).',
      difficulty: 'easy',
      expectedTimeSeconds: 40
    },
    {
      type: 'mcq',
      question: 'What is a primary architectural principle for ensuring automated testability when building components with ' + skill + '?',
      options: [
        'Adhering to Dependency Inversion by injecting dependencies rather than hardcoding singleton instances within ' + skill + ' modules.',
        'Hardcoding all database credentials directly into test files for convenience.',
        'Removing all assertions from test suites so CI pipelines always succeed.',
        'Writing unit tests that directly query external third-party production payment gateways.'
      ],
      correctAnswer: 'Adhering to Dependency Inversion by injecting dependencies rather than hardcoding singleton instances within ' + skill + ' modules.',
      explanation: 'Dependency injection allows mock and stub implementations to be swapped in easily during testing, creating isolated and deterministic tests.',
      difficulty: 'medium',
      expectedTimeSeconds: 45
    },
    {
      type: 'code_reading',
      question: 'How should idempotent operations be implemented for state-modifying requests in an architecture using ' + skill + '?',
      options: [
        'Attach a unique client-generated Idempotency Key header and store transaction outcomes in a fast cache to deduplicate retries.',
        'Disable client retries completely across the entire distributed network.',
        'Generate a new random primary key on every incoming HTTP POST without checking existing records.',
        'Rely exclusively on browser caching headers (Cache-Control: public).'
      ],
      correctAnswer: 'Attach a unique client-generated Idempotency Key header and store transaction outcomes in a fast cache to deduplicate retries.',
      explanation: 'Idempotency keys ensure that network retries execute the underlying mutation at most once, returning the cached response for duplicate requests.',
      difficulty: 'hard',
      expectedTimeSeconds: 50
    },
    {
      type: 'scenario',
      question: 'When designing high-concurrency data persistence with ' + skill + ', how can the Thundering Herd cache stampede problem be prevented?',
      options: [
        'Utilize mutex locking or probabilistic early recomputation (XFetch) when cached values near expiration.',
        'Clear the entire database cache every minute on a cron job.',
        'Send all concurrent requests directly to the database without caching.',
        'Increase HTTP request timeouts to 60 minutes.'
      ],
      correctAnswer: 'Utilize mutex locking or probabilistic early recomputation (XFetch) when cached values near expiration.',
      explanation: 'Locking ensures only one process recomputes a missed cache key while others wait, preventing database overload.',
      difficulty: 'hard',
      expectedTimeSeconds: 50
    },
    {
      type: 'debugging',
      question: 'In an enterprise microservice implemented in ' + skill + ', why is structured JSON logging with correlation IDs superior to unstructured string printing?',
      options: [
        'Correlation IDs trace a request across distributed boundaries, and structured keys allow log aggregators to filter and query without regex.',
        'JSON strings reduce hard drive sector size.',
        'Standard print statements cannot be read by Docker containers.',
        'Structured logs automatically rewrite failed SQL transactions.'
      ],
      correctAnswer: 'Correlation IDs trace a request across distributed boundaries, and structured keys allow log aggregators to filter and query without regex.',
      explanation: 'Structured logs provide deterministic keys (traceId, level, service) that log analytics platforms index for distributed tracing.',
      difficulty: 'medium',
      expectedTimeSeconds: 45
    },
    {
      type: 'mcq',
      question: 'How does memory leak detection operate when auditing long-running background workers built with ' + skill + '?',
      options: [
        'Comparing differential heap snapshots across garbage collection cycles to identify retainers that grow unbounded over time.',
        'Monitoring CPU temperature only.',
        'Assuming memory never leaks if unit tests pass.',
        'Relying on operating system swap space expansion.'
      ],
      correctAnswer: 'Comparing differential heap snapshots across garbage collection cycles to identify retainers that grow unbounded over time.',
      explanation: 'Heap snapshot comparison identifies objects that should have been deallocated but remain referenced by global variables or unclosed closures.',
      difficulty: 'medium',
      expectedTimeSeconds: 45
    },
    {
      type: 'scenario',
      question: 'In high-throughput systems utilizing ' + skill + ', why is connection pooling essential when connecting to databases or external services?',
      options: [
        'Reusing established TCP connections eliminates the high latency and CPU overhead of repeated TLS handshakes and socket setup.',
        'Connection pooling bypasses database password authentication.',
        'It converts relational SQL tables into static text files.',
        'It disables transaction isolation levels.'
      ],
      correctAnswer: 'Reusing established TCP connections eliminates the high latency and CPU overhead of repeated TLS handshakes and socket setup.',
      explanation: 'Establishing network connections is computationally expensive. Connection pooling maintains a ready pool of active sockets.',
      difficulty: 'medium',
      expectedTimeSeconds: 45
    },
    {
      type: 'debugging',
      question: 'What is the primary risk of using unbounded in-memory queues for asynchronous background tasks in ' + skill + '?',
      options: [
        'During traffic spikes, queued items consume available RAM until the host process crashes with Out-Of-Memory (OOM).',
        'Unbounded queues cause hard drive fragmentation.',
        'Process priority is automatically downgraded to idle.',
        'Unbounded queues trigger premature SSL certificate expiration.'
      ],
      correctAnswer: 'During traffic spikes, queued items consume available RAM until the host process crashes with Out-Of-Memory (OOM).',
      explanation: 'Without backpressure or bounds, consumer lag causes queue memory to balloon, leading to process termination.',
      difficulty: 'medium',
      expectedTimeSeconds: 40
    },
    {
      type: 'code_reading',
      question: 'When evaluating database index selectivity in systems designed with ' + skill + ', which column is the optimal leading column for a composite B-Tree index?',
      options: [
        'The column with the highest cardinality (most unique values) that appears consistently in equality filters.',
        'A boolean column with only two distinct values.',
        'Any column that is null for 90% of rows.',
        'The column with the longest text string.'
      ],
      correctAnswer: 'The column with the highest cardinality (most unique values) that appears consistently in equality filters.',
      explanation: 'High cardinality columns narrow down matched rows fastest, minimizing secondary index lookups.',
      difficulty: 'hard',
      expectedTimeSeconds: 50
    },
    {
      type: 'scenario',
      question: 'How should distributed microservices built with ' + skill + ' implement graceful shutdown when receiving SIGTERM from orchestrators like Kubernetes?',
      options: [
        'Stop accepting new ingress requests, complete active in-flight transactions within a grace timeout, and close database connections.',
        'Immediately kill all threads and drop active database connections.',
        'Reboot the entire host cluster.',
        'Ignore the signal indefinitely.'
      ],
      correctAnswer: 'Stop accepting new ingress requests, complete active in-flight transactions within a grace timeout, and close database connections.',
      explanation: 'Graceful shutdown ensures clients do not receive abrupt connection resets and database transactions commit cleanly.',
      difficulty: 'medium',
      expectedTimeSeconds: 45
    },
    {
      type: 'mcq',
      question: 'What strategy prevents the N+1 query problem when loading related entities in applications using ' + skill + '?',
      options: [
        'Batch fetching related records using SQL IN clauses (eager loading or data loaders) instead of executing a query per item.',
        'Executing queries inside synchronous while loops.',
        'Disabling database foreign key constraints.',
        'Setting the query timeout to 0 milliseconds.'
      ],
      correctAnswer: 'Batch fetching related records using SQL IN clauses (eager loading or data loaders) instead of executing a query per item.',
      explanation: 'Batch loading consolidates N child queries into a single batched query, preventing database connection roundtrip overhead.',
      difficulty: 'medium',
      expectedTimeSeconds: 45
    },
    {
      type: 'debugging',
      question: 'Why is using Math.random() or non-cryptographic PRNGs unsafe for generating session tokens or password reset keys in ' + skill + '?',
      options: [
        'Standard PRNGs are deterministic with small internal state, allowing attackers to predict future tokens after observing previous outputs.',
        'Non-crypto PRNGs cannot generate strings longer than 4 characters.',
        'They corrupt the browser cookies jar.',
        'Operating systems reject non-crypto random numbers.'
      ],
      correctAnswer: 'Standard PRNGs are deterministic with small internal state, allowing attackers to predict future tokens after observing previous outputs.',
      explanation: 'Cryptographically secure pseudorandom number generators (CSPRNG) use entropy sources with high unpredictability.',
      difficulty: 'easy',
      expectedTimeSeconds: 40
    },
    {
      type: 'scenario',
      question: 'In a distributed architecture using ' + skill + ', how does the Token Bucket algorithm enforce rate limiting across client requests?',
      options: [
        'Tokens are replenished at a constant rate into a fixed-capacity bucket; each request consumes a token, rejecting traffic if the bucket is empty.',
        'Tokens are stored in browser localStorage only.',
        'All requests are delayed by exactly 10 seconds.',
        'Tokens are deducted only when queries throw exceptions.'
      ],
      correctAnswer: 'Tokens are replenished at a constant rate into a fixed-capacity bucket; each request consumes a token, rejecting traffic if the bucket is empty.',
      explanation: 'Token bucket permits short bursts of traffic up to bucket capacity while enforcing a strict long-term average throughput rate.',
      difficulty: 'hard',
      expectedTimeSeconds: 50
    },
    {
      type: 'scenario',
      question: 'When managing multi-service workflows in ' + skill + ', why is the Saga pattern preferred over Two-Phase Commit (2PC) in high-scale microservices?',
      options: [
        'Sagas avoid distributed synchronous locks across microservices by executing local transactions coordinated with compensating events.',
        '2PC is completely forbidden by the HTTP/2 specification.',
        'Sagas eliminate the need for databases entirely.',
        '2PC requires all servers to be running in the exact same physical server rack.'
      ],
      correctAnswer: 'Sagas avoid distributed synchronous locks across microservices by executing local transactions coordinated with compensating events.',
      explanation: '2PC holds locks until all participants vote, causing high latency and risk of blocking; Sagas manage consistency via asynchronous compensating actions.',
      difficulty: 'hard',
      expectedTimeSeconds: 50
    },
    {
      type: 'debugging',
      question: 'How can concurrent database deadlocks between transaction threads in ' + skill + ' be systematically eliminated?',
      options: [
        'Enforce a strict, uniform global ordering for acquiring table and row locks across all application transactions.',
        'Remove all primary keys and foreign key constraints from the schema.',
        'Run all database read queries inside non-terminating while loops.',
        'Increase lock timeout to 24 hours.'
      ],
      correctAnswer: 'Enforce a strict, uniform global ordering for acquiring table and row locks across all application transactions.',
      explanation: 'Deadlocks occur when two transactions request locks in circular order; enforcing monotonic lock acquisition order breaks the circular wait condition.',
      difficulty: 'hard',
      expectedTimeSeconds: 50
    },
    {
      type: 'scenario',
      question: 'When implementing a write-through vs cache-aside strategy in ' + skill + ', what is the primary benefit of cache invalidation over cache updates on write?',
      options: [
        'Invalidation prevents race conditions where concurrent updates arrive out of order at the cache, ensuring the next read fetches authoritative database state.',
        'Invalidation increases database disk usage.',
        'Cache updates consume zero network bandwidth.',
        'Invalidating a key deletes the database table row permanently.'
      ],
      correctAnswer: 'Invalidation prevents race conditions where concurrent updates arrive out of order at the cache, ensuring the next read fetches authoritative database state.',
      explanation: 'Concurrent writes can arrive out-of-order at the cache; invalidating the key forces a clean cache miss and authoritative reload.',
      difficulty: 'medium',
      expectedTimeSeconds: 45
    },
    {
      type: 'mcq',
      question: 'How should backpressure be handled in asynchronous stream processing pipelines utilizing ' + skill + '?',
      options: [
        'The consumer signals the producer its buffer availability so the producer pauses emission when the consumer is overwhelmed.',
        'The consumer immediately drops all incoming data packets silently without acknowledgment.',
        'The producer increases emission speed to force the consumer to process faster.',
        'All data is written to synchronous console.log statements.'
      ],
      correctAnswer: 'The consumer signals the producer its buffer availability so the producer pauses emission when the consumer is overwhelmed.',
      explanation: 'Backpressure flow control prevents fast producers from overwhelming slow consumers, avoiding out-of-memory crashes.',
      difficulty: 'medium',
      expectedTimeSeconds: 45
    },
    {
      type: 'code_reading',
      question: 'In web architectures using ' + skill + ', why does a browser dispatch a preflight CORS OPTIONS request prior to a non-simple HTTP request?',
      options: [
        'To verify with the cross-origin server whether the specific HTTP method and custom headers are permitted before sending the actual payload.',
        'To compress the request payload using gzip compression.',
        'To negotiate TLS 1.3 cryptographic cipher suites.',
        'To download server favicon icons.'
      ],
      correctAnswer: 'To verify with the cross-origin server whether the specific HTTP method and custom headers are permitted before sending the actual payload.',
      explanation: 'Browsers safeguard servers from unexpected cross-origin side effects by checking Access-Control-Allow-* headers via an OPTIONS preflight.',
      difficulty: 'easy',
      expectedTimeSeconds: 40
    },
    {
      type: 'debugging',
      question: 'What is the distinction between a connection timeout and a socket read timeout when configuring HTTP clients in ' + skill + '?',
      options: [
        'Connection timeout limits initial TCP/TLS handshake duration, while read timeout limits the time waiting for bytes after the connection is established.',
        'Connection timeout applies to UDP only, while read timeout applies to TCP only.',
        'Read timeout measures the client computer booting time.',
        'Both timeouts are identical and share the same single socket timer.'
      ],
      correctAnswer: 'Connection timeout limits initial TCP/TLS handshake duration, while read timeout limits the time waiting for bytes after the connection is established.',
      explanation: 'Differentiating handshake timeout from response read timeout ensures fast failure during network outages while accommodating long-running queries.',
      difficulty: 'medium',
      expectedTimeSeconds: 45
    },
    {
      type: 'scenario',
      question: 'During production deployments of an application built with ' + skill + ', what is the key advantage of Blue-Green deployment over in-place updates?',
      options: [
        'It allows instant zero-downtime traffic switching via load balancer and immediate rollback if health checks fail on the new environment.',
        'It halves total server infrastructure costs permanently.',
        'It eliminates the need for unit and integration testing.',
        'It runs the new release directly in developer laptops.'
      ],
      correctAnswer: 'It allows instant zero-downtime traffic switching via load balancer and immediate rollback if health checks fail on the new environment.',
      explanation: 'Blue-Green keeps two identical production environments, switching router/balancer traffic instantly once the idle environment is verified.',
      difficulty: 'medium',
      expectedTimeSeconds: 45
    },
    {
      type: 'mcq',
      question: 'Which defense provides comprehensive protection against Stored Cross-Site Scripting (XSS) when rendering user-submitted text in ' + skill + ' interfaces?',
      options: [
        'Context-aware output encoding (HTML, attribute, JS escaping) combined with a strict Content Security Policy (CSP).',
        'Filtering the word "script" with a single case-sensitive string replace.',
        'Storing user inputs in Base64 encoding in the database.',
        'Checking if the user is logged in as an administrator.'
      ],
      correctAnswer: 'Context-aware output encoding (HTML, attribute, JS escaping) combined with a strict Content Security Policy (CSP).',
      explanation: 'Contextual encoding neutralizes executable HTML/JS characters into harmless character entities, while CSP restricts unauthorized script execution.',
      difficulty: 'easy',
      expectedTimeSeconds: 40
    },
    {
      type: 'mcq',
      question: 'When is schema denormalization appropriate in high-throughput data architectures built with ' + skill + '?',
      options: [
        'In read-heavy workloads where avoiding expensive multi-table joins significantly reduces read latency and database query CPU time.',
        'When disk storage space is completely full.',
        'To eliminate the need for primary keys.',
        'When write transactions outnumber read queries by 100 to 1.'
      ],
      correctAnswer: 'In read-heavy workloads where avoiding expensive multi-table joins significantly reduces read latency and database query CPU time.',
      explanation: 'Denormalization duplicates data intentionally to optimize high-volume read access, trading write overhead for fast O(1) query performance.',
      difficulty: 'medium',
      expectedTimeSeconds: 45
    },
    {
      type: 'scenario',
      question: 'In Kubernetes horizontal pod autoscaling (HPA) for services implemented in ' + skill + ', why is queue depth or latency often a superior scaling metric compared to raw CPU usage?',
      options: [
        'Asynchronous I/O workers may saturate worker queues and degrade SLAs while CPU utilization remains low due to asynchronous I/O wait.',
        'Kubernetes cannot monitor container CPU metrics.',
        'CPU percentage is only updated once every 24 hours.',
        'Queue depth metrics prevent memory allocation.'
      ],
      correctAnswer: 'Asynchronous I/O workers may saturate worker queues and degrade SLAs while CPU utilization remains low due to asynchronous I/O wait.',
      explanation: 'I/O-bound services bottleneck on thread queues or network latency long before exhausting CPU cores, making queue depth the true leading indicator.',
      difficulty: 'hard',
      expectedTimeSeconds: 50
    },
    {
      type: 'mcq',
      question: 'When declaring variables in modern ' + skill + ', why is block-scoping preferred over function-scoping or implicit globals?',
      options: [
        'Block-scoping confines variable lifetime to the immediate code block, preventing accidental overwriting and variable hoisting bugs.',
        'Block-scoped variables consume zero bytes in RAM.',
        'Implicit globals execute faster in the CPU cache.',
        'Function-scoping disables unit testing.'
      ],
      correctAnswer: 'Block-scoping confines variable lifetime to the immediate code block, preventing accidental overwriting and variable hoisting bugs.',
      explanation: 'Block scoping limits variable exposure to the smallest enclosing block, preventing leakage and shadowing side effects in ' + skill + '.',
      difficulty: 'easy',
      expectedTimeSeconds: 35
    },
    {
      type: 'code_reading',
      question: 'In conditional expressions written in ' + skill + ', why is strict comparison preferred over loose type-coercing comparison?',
      options: [
        'Strict comparison validates both type and value identity, avoiding unexpected implicit type coercion anomalies.',
        'Strict comparison converts all data types to floating-point numbers.',
        'Loose comparison is not supported by standard compilers.',
        'Strict comparison eliminates the need for unit tests.'
      ],
      correctAnswer: 'Strict comparison validates both type and value identity, avoiding unexpected implicit type coercion anomalies.',
      explanation: 'Strict equality ensures deterministic comparison by verifying that both operands share the same type before comparing values.',
      difficulty: 'easy',
      expectedTimeSeconds: 35
    },
    {
      type: 'debugging',
      question: 'When managing external resource cleanup in ' + skill + ', why is the finally block essential in try-catch-finally control flows?',
      options: [
        'The finally block executes unconditionally regardless of whether an exception was thrown or caught, guaranteeing resource disposal.',
        'Code inside finally blocks runs before any try statements.',
        'The finally block suppresses all compiler warnings.',
        'The finally block automatically restarts the operating system.'
      ],
      correctAnswer: 'The finally block executes unconditionally regardless of whether an exception was thrown or caught, guaranteeing resource disposal.',
      explanation: 'Guaranteed execution in finally blocks ensures open file descriptors, sockets, or lock handles are always released even during errors.',
      difficulty: 'easy',
      expectedTimeSeconds: 40
    },
    {
      type: 'mcq',
      question: 'What is the defining characteristic of a pure function when writing modular routines in ' + skill + '?',
      options: [
        'Given the same arguments, it always returns the same output without causing observable external side effects.',
        'It must contain at least 100 lines of executable code.',
        'It must perform direct asynchronous database modifications.',
        'It can only be executed once during the application lifetime.'
      ],
      correctAnswer: 'Given the same arguments, it always returns the same output without causing observable external side effects.',
      explanation: 'Purity ensures determinism and testability because output depends strictly on input parameters with no mutation of shared state.',
      difficulty: 'easy',
      expectedTimeSeconds: 35
    },
    {
      type: 'output_prediction',
      question: 'What is the standard convention for zero-based collection indexing when accessing array elements in ' + skill + '?',
      options: [
        'The first element is accessed at index 0, and the final element is at index (length - 1).',
        'The first element is at index 1, and the final element is at index (length + 1).',
        'Negative indices always cause immediate system kernel crashes.',
        'Indices must always be formatted as hexadecimal strings.'
      ],
      correctAnswer: 'The first element is accessed at index 0, and the final element is at index (length - 1).',
      explanation: 'Zero-based indexing represents the offset distance from the memory pointer of the array beginning in standard architectures.',
      difficulty: 'easy',
      expectedTimeSeconds: 30
    },
    {
      type: 'mcq',
      question: 'What is the primary operational advantage of non-blocking asynchronous operations compared to synchronous operations in ' + skill + '?',
      options: [
        'Non-blocking I/O allows the thread to continue processing concurrent tasks while waiting for external network or disk responses.',
        'Synchronous code runs at twice the CPU clock frequency.',
        'Asynchronous code bypasses all network security firewalls.',
        'Non-blocking operations delete compiled binaries from disk.'
      ],
      correctAnswer: 'Non-blocking I/O allows the thread to continue processing concurrent tasks while waiting for external network or disk responses.',
      explanation: 'Asynchronous execution prevents worker threads from idling during I/O waits, vastly increasing overall server concurrency.',
      difficulty: 'easy',
      expectedTimeSeconds: 40
    },
    {
      type: 'scenario',
      question: 'When diagnosing cross-boundary latency in distributed microservices using ' + skill + ', how does OpenTelemetry trace context propagation work?',
      options: [
        'Injecting standardized W3C traceparent headers containing trace-id and span-id across outbound HTTP/gRPC requests.',
        'Writing all network packets to a shared USB flash drive.',
        'Executing a full memory dump on every incoming HTTP GET request.',
        'Relying on physical server serial numbers.'
      ],
      correctAnswer: 'Injecting standardized W3C traceparent headers containing trace-id and span-id across outbound HTTP/gRPC requests.',
      explanation: 'Trace headers allow distributed telemetry backends to stitch disparate spans into a coherent end-to-end request timeline.',
      difficulty: 'hard',
      expectedTimeSeconds: 50
    },
    {
      type: 'debugging',
      question: 'In high-contention database updates with ' + skill + ', how does Optimistic Concurrency Control (OCC) prevent lost updates without heavy locks?',
      options: [
        'Updating rows with a version counter condition (WHERE id = ? AND version = ?) and rolling back/retrying if 0 rows were updated.',
        'Locking the entire database table exclusively for 10 minutes per write.',
        'Ignoring conflicting concurrent writes and accepting whichever arrived last.',
        'Disabling all database indexes during write queries.'
      ],
      correctAnswer: 'Updating rows with a version counter condition (WHERE id = ? AND version = ?) and rolling back/retrying if 0 rows were updated.',
      explanation: 'Version checks ensure records have not changed since reading; conflicting writes fail cleanly and retry without blocking reads.',
      difficulty: 'hard',
      expectedTimeSeconds: 50
    }
  ];
}

 export async function generateAiPracticeQuestions({
  applicationId,
  firebaseUid,
  skills = [],
  difficulty = 'medium',
  count = 5,
  existingQuestions = []
}) {
  const client = getGeminiClient();
  if (!client) return [];

  const targetSkills = skills.length > 0 ? skills.slice(0, 3).join(', ') : 'Software Engineering';

  const prompt = `Generate ${count} distinct, high-quality technical practice questions for a software engineer preparing for job interviews.
Target Skills: ${targetSkills}
Target Difficulty: ${difficulty}
Question Types: Include a mix of technical MCQ, debugging, and output prediction with code snippets.
Requirements:
- Exactly 4 distinct options per question.
- Exactly one correct answer that appears verbatim in the options.
- Detailed technical explanation.
- Each question must be completely unique and not generic.`;

  const schema = z.object({
    questions: z.array(z.object({
      type: z.enum(['mcq', 'coding_mcq', 'debugging', 'output_prediction', 'code_reading', 'scenario']),
      question: z.string().min(10),
      codeSnippet: z.string().optional().default(''),
      options: z.array(z.string()).length(4),
      correctAnswer: z.string(),
      explanation: z.string().min(10),
      difficulty: z.enum(['easy', 'medium', 'hard']).default(difficulty),
      skill: z.string().default(skills[0] || 'Engineering'),
      expectedTimeSeconds: z.number().default(50)
    }))
  });

  try {
    const result = await callGeminiStructured({
      systemInstruction: 'You are an expert technical interviewer creating rigorous, original, auto-graded coding and test practice questions.',
      prompt,
      schema,
      maxRetries: 1
    });

    if (!result?.questions || !Array.isArray(result.questions)) return [];

    const accepted = [];
    const allExisting = [...existingQuestions];

    for (const rawQ of result.questions) {
      const q = {
        firebaseUid,
        applicationId,
        type: rawQ.type,
        question: rawQ.question,
        codeSnippet: rawQ.codeSnippet || '',
        options: shuffleArray(rawQ.options),
        correctAnswer: rawQ.correctAnswer,
        explanation: rawQ.explanation,
        difficulty: rawQ.difficulty || difficulty,
        skill: rawQ.skill || skills[0] || 'Software Engineering',
        requirementRef: rawQ.skill || skills[0] || 'Software Engineering',
        expectedTimeSeconds: rawQ.expectedTimeSeconds || 50
      };

      if (!validateQuestionFormat(q)) continue;
      if (isDuplicateOrNearDuplicate(q, allExisting)) continue;
      if (isDuplicateOrNearDuplicate(q, accepted)) continue;

      accepted.push(q);
      allExisting.push(q);
    }

    return accepted;
  } catch (err) {
    console.warn('[PracticeService] AI Question Generation notice:', err.message);
    return [];
  }
}

/**
 * Curated question generator for requirements
 */
export function generateCuratedQuestions({
  applicationId,
  firebaseUid,
  requirements = [],
  count = 10,
  targetDifficulty = 'medium',
  preferredTypes = null,
  existingQuestions = []
}) {
  const activeSkills = requirements.slice(0, 6).map(r => r.normalizedName || r.name);
  const pool = activeSkills.length > 0 ? activeSkills : ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'];

  const candidatePool = [];

  for (const skill of pool) {
    const bankItems = CURATED_MCQ_BANK[skill] || [];
    for (const item of bankItems) {
      const candidate = {
        firebaseUid,
        applicationId,
        type: item.type,
        question: item.question,
        codeSnippet: item.codeSnippet || '',
        options: shuffleArray(item.options),
        correctAnswer: item.correctAnswer,
        explanation: item.explanation,
        difficulty: item.difficulty || targetDifficulty,
        skill,
        requirementRef: skill,
        expectedTimeSeconds: item.expectedTimeSeconds || 45
      };
      if (validateQuestionFormat(candidate)) {
        candidatePool.push(candidate);
      }
    }

    const variations = createProceduralVariations(skill, targetDifficulty);
    for (const v of variations) {
      const candidate = {
        firebaseUid,
        applicationId,
        type: v.type,
        question: v.question,
        codeSnippet: v.codeSnippet || '',
        options: shuffleArray(v.options),
        correctAnswer: v.correctAnswer,
        explanation: v.explanation,
        difficulty: v.difficulty || targetDifficulty,
        skill,
        requirementRef: skill,
        expectedTimeSeconds: v.expectedTimeSeconds || 45
      };
      if (validateQuestionFormat(candidate)) {
        candidatePool.push(candidate);
      }
    }
  }

  let eligibleCandidates = candidatePool;
  if (Array.isArray(preferredTypes) && preferredTypes.length > 0) {
    eligibleCandidates = candidatePool.filter(c => preferredTypes.includes(c.type));
    if (eligibleCandidates.length < count) {
      eligibleCandidates = candidatePool;
    }
  }

  const selected = selectDistinctQuestions({
    pool: eligibleCandidates,
    count,
    excludeQuestions: existingQuestions,
    targetDifficulty
  });

  return selected.slice(0, count);
}

/**
 * Normalizes compound or roadmap topic names into canonical practice bank skills.
 */
export function resolvePracticeSkill(rawSkill) {
  if (!rawSkill || typeof rawSkill !== 'string') return 'JavaScript';
  const clean = rawSkill.trim();

  // If already directly present in Curated MCQ Bank
  if (CURATED_MCQ_BANK[clean]) return clean;

  const lower = clean.toLowerCase();

  if (lower.includes('html')) return 'HTML';
  if (lower.includes('css')) return 'CSS';
  if (lower.includes('react')) return 'React';
  if (lower.includes('node')) return 'Node.js';
  if (lower.includes('express')) return 'Express.js';
  if (lower.includes('fastapi')) return 'FastAPI';
  if (lower.includes('sql') || lower.includes('database') || lower.includes('postgres') || lower.includes('mysql') || lower.includes('dbms')) return 'SQL';
  if (lower.includes('mongo')) return 'MongoDB';
  if (lower.includes('javascript') || lower.includes('js')) return 'JavaScript';
  if (lower.includes('typescript') || lower.includes('ts')) return 'TypeScript';
  if (lower.includes('python')) return 'Python';
  if (lower.includes('java') && !lower.includes('script')) return 'Java';
  if (lower.includes('c++') || lower.includes('cpp')) return 'C++';
  if (lower === 'c' || lower.startsWith('c language')) return 'C';
  if (lower.includes('algorithm') || lower.includes('data structure') || lower.includes('dsa')) return 'Data Structures & Algorithms';
  if (lower.includes('oop') || lower.includes('object-oriented')) return 'Object-Oriented Programming';
  if (lower.includes('operating system') || lower.includes('os concepts')) return 'Operating Systems';
  if (lower.includes('network') || lower.includes('http') || lower.includes('rest')) return 'Computer Networks';
  if (lower.includes('machine learning') || lower.includes('ml')) return 'Machine Learning';
  if (lower.includes('data science')) return 'Data Science';
  if (lower.includes('pandas')) return 'Pandas';
  if (lower.includes('numpy')) return 'NumPy';
  if (lower.includes('ai') || lower.includes('intelligence')) return 'Artificial Intelligence';

  return clean;
}

/**
 * Resolves the underlying executable coding challenge language for any skill/topic.
 */
export function resolveCodingChallengeLanguage(skill) {
  const resolved = resolvePracticeSkill(skill);
  if (['HTML', 'CSS', 'React', 'Node.js', 'Express.js', 'JavaScript'].includes(resolved)) {
    return 'JavaScript';
  }
  if (['SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'DBMS'].includes(resolved)) {
    return 'SQL';
  }
  if (['Python', 'Pandas', 'NumPy', 'Data Science', 'Machine Learning', 'Artificial Intelligence'].includes(resolved)) {
    return 'Python';
  }
  if (['Java', 'C', 'C++', 'TypeScript'].includes(resolved)) {
    return resolved;
  }
  return 'JavaScript';
}

/**
 * Generates targeted practice questions matching user-selected category, skill, difficulty, count, and mode.
 */
export async function generateTargetedPracticeQuestions({
  applicationId,
  firebaseUid,
  category = 'Programming Languages',
  skill = 'JavaScript',
  difficulty = 'medium',
  count = 10,
  mode = 'mcq',
  existingQuestions = [],
  excludeIds = []
}) {
  const normSkill = skill || 'JavaScript';
  const targetDiff = difficulty || 'medium';
  const requestedCount = Math.max(1, Math.min(20, count));

  if (mode === 'coding_challenges') {
    const codingLang = resolveCodingChallengeLanguage(normSkill);
    const candidates = [];
    const curated = CURATED_CODING_CHALLENGES[codingLang] || CURATED_CODING_CHALLENGES['JavaScript'] || [];
    for (const c of curated) {
      candidates.push({
        firebaseUid,
        applicationId,
        category,
        mode: 'coding_challenges',
        type: 'code_writing',
        question: c.problemStatement.slice(0, 80) + '...',
        problemStatement: c.problemStatement,
        inputDescription: c.inputDescription,
        outputDescription: c.outputDescription,
        examples: c.examples || [],
        constraints: c.constraints || [],
        starterCode: c.starterCode || '',
        testCases: c.testCases || [],
        options: [],
        correctAnswer: c.referenceSolution || '',
        referenceSolution: c.referenceSolution || '',
        explanation: `Coding challenge covering ${normSkill} (${codingLang}).`,
        difficulty: c.difficulty || targetDiff,
        skill: normSkill,
        requirementRef: normSkill,
        expectedTimeSeconds: 120
      });
    }

    for (let procIndex = 1; procIndex <= 25; procIndex++) {
      const generated = generateProceduralCodingChallenge(codingLang, targetDiff, procIndex);
      candidates.push({
        ...generated,
        firebaseUid,
        applicationId,
        category,
        requirementRef: normSkill,
        options: [],
        starterCode: generated.starterCode || '',
        correctAnswer: generated.referenceSolution || '',
        referenceSolution: generated.referenceSolution || '',
        expectedTimeSeconds: 120
      });
    }

    const selected = selectDistinctQuestions({
      pool: candidates,
      count: requestedCount,
      excludeIds,
      excludeQuestions: existingQuestions,
      targetDifficulty: targetDiff
    });

    return selected.slice(0, requestedCount);
  }

  // MCQ Mode
  const candidatePool = [];
  const mcqSkill = resolvePracticeSkill(normSkill);

  const bankItems = CURATED_MCQ_BANK[mcqSkill] || CURATED_MCQ_BANK[normSkill] || [];
  for (const item of bankItems) {
    candidatePool.push({
      firebaseUid,
      applicationId,
      category,
      mode: 'mcq',
      type: item.type || 'mcq',
      question: item.question,
      codeSnippet: item.codeSnippet || '',
      options: shuffleArray(item.options),
      correctAnswer: item.correctAnswer,
      explanation: item.explanation,
      difficulty: item.difficulty || targetDiff,
      skill: normSkill,
      requirementRef: normSkill,
      expectedTimeSeconds: item.expectedTimeSeconds || 45
    });
  }

  // Also procedural variations for this skill to ensure deep pool
  const variations = createProceduralVariations(normSkill, targetDiff);
  for (const v of variations) {
    candidatePool.push({
      firebaseUid,
      applicationId,
      category,
      mode: 'mcq',
      type: v.type,
      question: v.question,
      codeSnippet: v.codeSnippet || '',
      options: shuffleArray(v.options),
      correctAnswer: v.correctAnswer,
      explanation: v.explanation,
      difficulty: v.difficulty || targetDiff,
      skill: normSkill,
      requirementRef: normSkill,
      expectedTimeSeconds: v.expectedTimeSeconds || 45
    });
  }

  const excludeIdSet = new Set(excludeIds.map(id => String(id)));
  const unexcludedCandidates = candidatePool.filter(q => {
    const qId = q._id ? String(q._id) : null;
    if (qId && excludeIdSet.has(qId)) return false;
    if (isDuplicateOrNearDuplicate(q, existingQuestions)) return false;
    return true;
  });

  if (unexcludedCandidates.length < requestedCount) {
    try {
      const needed = requestedCount - unexcludedCandidates.length;
      const aiItems = await generateAiPracticeQuestions({
        applicationId,
        firebaseUid,
        skills: [normSkill],
        difficulty: targetDiff,
        count: needed,
        existingQuestions
      });
      for (const item of aiItems) {
        candidatePool.push({
          ...item,
          category,
          mode: 'mcq'
        });
      }
    } catch (e) {
      // AI fallback
    }
  }

  const selected = selectDistinctQuestions({
    pool: candidatePool,
    count: requestedCount,
    excludeIds,
    excludeQuestions: existingQuestions,
    targetDifficulty: targetDiff
  });

  return selected.slice(0, requestedCount);
}
