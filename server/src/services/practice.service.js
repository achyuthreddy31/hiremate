import { evaluateAdaptiveDifficulty } from './scoring/adaptiveDifficulty.js';
import { callGeminiStructured, getGeminiClient } from './gemini.service.js';
import { z } from 'zod';

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
 * Checks whether a candidate question is an exact duplicate or near-duplicate
 * of any question in an existing list.
 *
 * @param {Object|string} candidate
 * @param {Array<Object|string>} existingList
 * @param {number} threshold - similarity threshold (default 0.75)
 * @returns {boolean}
 */
export function isDuplicateOrNearDuplicate(candidate, existingList = [], threshold = 0.75) {
  const candidateText = typeof candidate === 'string' ? candidate : candidate?.question || '';
  const normCandidate = normalizeQuestionText(candidateText);
  if (!normCandidate) return false;

  const candidateSnippet = typeof candidate === 'object' && candidate?.codeSnippet
    ? normalizeQuestionText(candidate.codeSnippet)
    : '';

  for (const item of existingList) {
    const existingText = typeof item === 'string' ? item : item?.question || '';
    const normExisting = normalizeQuestionText(existingText);
    if (!normExisting) continue;

    // 1. Exact normalized text match
    if (normCandidate === normExisting) return true;

    // 2. Token overlap similarity check
    const sim = calculateTokenSimilarity(normCandidate, normExisting);
    if (sim >= threshold) return true;

    // 3. Substring containment for substantial prompts (>= 25 characters)
    if (normCandidate.length >= 25 && normExisting.length >= 25) {
      if (normCandidate.includes(normExisting) || normExisting.includes(normCandidate)) {
        const ratio = Math.min(normCandidate.length, normExisting.length) / Math.max(normCandidate.length, normExisting.length);
        if (ratio >= 0.75) return true;
      }
    }

    // 4. Duplicate code snippet with identical question intent
    if (candidateSnippet && typeof item === 'object' && item?.codeSnippet) {
      const existingSnippet = normalizeQuestionText(item.codeSnippet);
      if (candidateSnippet === existingSnippet && candidateSnippet.length > 20) {
        if (sim >= 0.50) return true;
      }
    }
  }

  return false;
}

/**
 * Validates a practice question per Section 5.8:
 * - Exactly one correct option
 * - Distinct options
 * - Non-empty explanation
 * - Linked requirement
 */
export function validateQuestionFormat(q) {
  if (!q || !q.question || !q.explanation || !q.requirementRef) return false;
  if (!Array.isArray(q.options) || q.options.length < 2) return false;

  // Distinct options
  const uniqueOpts = new Set(q.options.map(o => String(o).trim()));
  if (uniqueOpts.size !== q.options.length) return false;

  // Exactly one correct option that exists in options
  if (!q.correctAnswer || !q.options.includes(q.correctAnswer)) return false;

  return true;
}

/**
 * Filters and selects distinct questions for a quiz or test session.
 * Guarantees that:
 * 1. No question ID appears more than once.
 * 2. No question text is a duplicate or near-duplicate of another in the session.
 * 3. Excludes any question ID in `excludeIds` and any question in `excludeQuestions`.
 * 4. Prioritizes matching target difficulty if specified.
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
    const normText = normalizeQuestionText(q.question);

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
 * Canonical curated questions bank by skill.
 * Contains multiple distinct questions across difficulties and question types.
 */
const CANONICAL_QUESTION_BANK = {
  JavaScript: [
    {
      type: 'mcq',
      question: 'Which statement accurately describes how the JavaScript event loop manages the microtask queue versus the macrotask queue?',
      options: [
        'All microtasks in the queue are executed immediately after the current call stack clears, before the next macrotask is dequeued.',
        'Microtasks and macrotasks are interleaved strictly in a 1:1 alternating order.',
        'Macrotasks take precedence over microtasks when handling network response callbacks.',
        'The microtask queue is only evaluated once during window initialization.'
      ],
      correctAnswer: 'All microtasks in the queue are executed immediately after the current call stack clears, before the next macrotask is dequeued.',
      explanation: 'Microtasks (Promises, queueMicrotask) run immediately following script execution and before yielding to rendering or the macrotask queue (setTimeout, setInterval).',
      difficulty: 'medium',
      expectedTimeSeconds: 50
    },
    {
      type: 'output_prediction',
      question: 'What is the exact console output of this JavaScript code snippet regarding closure scoping in asynchronous loops?',
      codeSnippet: 'for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}',
      options: ['3 3 3', '0 1 2', 'undefined undefined undefined', 'ReferenceError'],
      correctAnswer: '3 3 3',
      explanation: 'Variables declared with "var" are function-scoped, not block-scoped. By the time the timeout callbacks run, the loop has completed with i = 3.',
      difficulty: 'easy',
      expectedTimeSeconds: 40
    },
    {
      type: 'debugging',
      question: 'In JavaScript, why does comparing two identical object literals with strict equality (({ a: 1 } === { a: 1 })) return false?',
      options: [
        'Objects are compared by heap memory reference rather than structural value equality.',
        'Strict equality cannot evaluate keys with numerical values.',
        'Object literals must first be serialized using JSON.stringify to be compared.',
        'JavaScript engine throws a silent TypeCoercionError.'
      ],
      correctAnswer: 'Objects are compared by heap memory reference rather than structural value equality.',
      explanation: 'In JavaScript, non-primitive data types (objects, arrays, functions) are compared by reference identity in memory, not structural equality.',
      difficulty: 'easy',
      expectedTimeSeconds: 35
    },
    {
      type: 'code_reading',
      question: 'What is the return value of Promise.all() when one of the input promises in the array rejects?',
      options: [
        'It immediately rejects with the reason of the first promise that rejected (fail-fast).',
        'It waits for all promises to settle and returns an array of status objects.',
        'It ignores the rejected promise and resolves with the remaining fulfilled promises.',
        'It automatically retries the rejected promise up to 3 times.'
      ],
      correctAnswer: 'It immediately rejects with the reason of the first promise that rejected (fail-fast).',
      explanation: 'Promise.all has fail-fast semantics; it rejects immediately upon the first rejection. Promise.allSettled is used when all outcomes are needed.',
      difficulty: 'medium',
      expectedTimeSeconds: 45
    },
    {
      type: 'output_prediction',
      question: 'What will be printed to the console when executing the following snippet demonstrating JavaScript array mutation?',
      codeSnippet: 'const a = [1, 2, 3];\nconst b = a.concat(4);\nb.push(5);\nconsole.log(a.length, b.length);',
      options: ['3 5', '4 5', '5 5', '3 4'],
      correctAnswer: '3 5',
      explanation: 'Array.prototype.concat creates and returns a shallow copy without mutating the original array "a". Therefore a.length remains 3 while b becomes length 5.',
      difficulty: 'medium',
      expectedTimeSeconds: 45
    }
  ],
  TypeScript: [
    {
      type: 'mcq',
      question: 'In TypeScript, what is the key difference between the "unknown" and "any" top types?',
      options: [
        '"unknown" enforces type-checking and narrowing before properties or methods can be accessed, whereas "any" turns off type checking.',
        '"unknown" can only be assigned to string and number types.',
        '"any" requires explicit runtime type guards, while "unknown" does not.',
        '"unknown" is compiled to a specialized runtime symbol, while "any" is removed.'
      ],
      correctAnswer: '"unknown" enforces type-checking and narrowing before properties or methods can be accessed, whereas "any" turns off type checking.',
      explanation: '"unknown" is the type-safe counterpart of "any". Anything is assignable to unknown, but unknown is not assignable to anything else without type narrowing.',
      difficulty: 'medium',
      expectedTimeSeconds: 45
    },
    {
      type: 'debugging',
      question: 'Which TypeScript utility type constructs a type with all properties of Type set to optional?',
      options: [
        'Partial<T>',
        'Required<T>',
        'Readonly<T>',
        'Record<K, T>'
      ],
      correctAnswer: 'Partial<T>',
      explanation: 'Partial<T> returns a type where every field in T is marked with the optional "?" modifier.',
      difficulty: 'easy',
      expectedTimeSeconds: 30
    },
    {
      type: 'code_reading',
      question: 'What does the TypeScript "keyof" operator produce when applied to an interface?',
      options: [
        'A union type of known, public property names of that type.',
        'An array containing runtime property name strings.',
        'A boolean indicating whether a key exists in an object.',
        'A generic map interface mapping keys to boolean values.'
      ],
      correctAnswer: 'A union type of known, public property names of that type.',
      explanation: 'The keyof operator produces a string or numeric literal union of keys of the provided object type.',
      difficulty: 'medium',
      expectedTimeSeconds: 40
    }
  ],
  React: [
    {
      type: 'mcq',
      question: 'When should you pass a cleanup function as the return value of a React useEffect hook?',
      options: [
        'To unsubscribe from subscriptions, clear timers, or abort in-flight network requests when the component unmounts or dependencies change.',
        'To force the component to immediately trigger a synchronous DOM re-paint.',
        'To purge component state from the browser localStorage.',
        'To reset all ancestor component props back to their default values.'
      ],
      correctAnswer: 'To unsubscribe from subscriptions, clear timers, or abort in-flight network requests when the component unmounts or dependencies change.',
      explanation: 'The returned cleanup function is executed before the effect is re-run and when the component unmounts, preventing memory leaks and stale event listeners.',
      difficulty: 'medium',
      expectedTimeSeconds: 45
    },
    {
      type: 'debugging',
      question: 'Why must React state never be mutated directly (e.g., state.items.push(newItem))?',
      options: [
        'Direct mutation preserves the previous object reference, causing React shallow equality checks to skip re-rendering.',
        'Direct mutation throws an uncatchable browser DOMException.',
        'React state stores data in immutable WebAssembly memory buffers.',
        'Component props are automatically overwritten whenever state is mutated.'
      ],
      correctAnswer: 'Direct mutation preserves the previous object reference, causing React shallow equality checks to skip re-rendering.',
      explanation: 'React compares previous and next states using Object.is. Mutating in place keeps the reference identical, so React assumes nothing changed.',
      difficulty: 'medium',
      expectedTimeSeconds: 45
    },
    {
      type: 'output_prediction',
      question: 'In React, what is the output in the console after clicking a button that calls setVal(val + 1) twice synchronously?',
      codeSnippet: 'const [val, setVal] = useState(0);\nconst handleClick = () => {\n  setVal(val + 1);\n  setVal(val + 1);\n};',
      options: [
        'val becomes 1 in the next render, because both calls read from the same render snapshot.',
        'val becomes 2 in the next render, because state setters are always synchronous.',
        'val becomes 0, because multiple setter calls cancel each other.',
        'A MaximumUpdateDepthExceeded error is thrown.'
      ],
      correctAnswer: 'val becomes 1 in the next render, because both calls read from the same render snapshot.',
      explanation: 'In the render snapshot, val is 0. Both calls execute setVal(0 + 1). To increment twice, the functional updater form setVal(prev => prev + 1) must be used.',
      difficulty: 'medium',
      expectedTimeSeconds: 50
    },
    {
      type: 'code_reading',
      question: 'What is the primary role of React.useMemo hook?',
      options: [
        'Cache the calculated result of an expensive computation between renders until its dependencies change.',
        'Persist component state across page reloads in sessionStorage.',
        'Prevent a component from receiving new props from its parent.',
        'Automatically compile JSX templates into optimized WebGL shaders.'
      ],
      correctAnswer: 'Cache the calculated result of an expensive computation between renders until its dependencies change.',
      explanation: 'useMemo memoizes the result of a function call to avoid expensive recalculations on every render when dependencies have not changed.',
      difficulty: 'easy',
      expectedTimeSeconds: 35
    }
  ],
  'Node.js': [
    {
      type: 'mcq',
      question: 'How should high-throughput streaming in Node.js handle the scenario where the readable stream is faster than the writable stream?',
      options: [
        'By honoring backpressure via pipe(), pipeline(), or checking stream.write() return value and waiting for the "drain" event.',
        'By allocating an unbounded V8 heap buffer to store pending chunks in memory.',
        'By spawning a separate child process for every incoming stream chunk.',
        'By switching the HTTP server to synchronous blocking filesystem calls.'
      ],
      correctAnswer: 'By honoring backpressure via pipe(), pipeline(), or checking stream.write() return value and waiting for the "drain" event.',
      explanation: 'Handling backpressure prevents memory exhaustion by pausing the readable stream when the writable internal buffer is full until the "drain" event fires.',
      difficulty: 'hard',
      expectedTimeSeconds: 55
    },
    {
      type: 'debugging',
      question: 'What happens if an asynchronous Promise rejects in Node.js without an attached .catch() or unhandledRejection listener?',
      options: [
        'Node.js emits an unhandledRejection event and terminates the process with a non-zero exit code.',
        'The exception is silently swallowed and execution continues normally.',
        'The event loop resets all active network sockets to prevent corruption.',
        'Node.js restarts the application automatically using cluster mode.'
      ],
      correctAnswer: 'Node.js emits an unhandledRejection event and terminates the process with a non-zero exit code.',
      explanation: 'Modern Node.js crashes the process on unhandled promise rejections to adhere to the fail-fast principle and avoid corrupted state.',
      difficulty: 'medium',
      expectedTimeSeconds: 40
    },
    {
      type: 'scenario',
      question: 'In a Node.js API server, how can CPU-intensive computational tasks (such as image resizing or crypto mining) be prevented from blocking HTTP request handling?',
      options: [
        'Offload the intensive computation to Worker Threads or an external background queue worker.',
        'Increase the Node.js memory limit using --max-old-space-size.',
        'Wrap the computational code in process.nextTick() loops.',
        'Execute the computation inside a synchronous while loop.'
      ],
      correctAnswer: 'Offload the intensive computation to Worker Threads or an external background queue worker.',
      explanation: 'Node.js runs JS on a single event-loop thread. Long-running synchronous CPU operations block the loop, starving all I/O unless offloaded to worker threads or external worker services.',
      difficulty: 'medium',
      expectedTimeSeconds: 50
    }
  ],
  Python: [
    {
      type: 'output_prediction',
      question: 'What is the console output of this Python snippet with a default mutable argument?',
      codeSnippet: 'def append_val(val, target=[]):\n    target.append(val)\n    return target\n\nprint(append_val(1), append_val(2))',
      options: [
        '[1, 2] [1, 2]',
        '[1] [2]',
        '[1] [1, 2]',
        'TypeError: default argument cannot be mutated'
      ],
      correctAnswer: '[1, 2] [1, 2]',
      explanation: 'In Python, default arguments are evaluated once at function definition time, not every time the function is called. The shared list accumulates both values.',
      difficulty: 'medium',
      expectedTimeSeconds: 50
    },
    {
      type: 'mcq',
      question: 'In Python CPython, what is the role of the Global Interpreter Lock (GIL)?',
      options: [
        'A mutex that protects access to Python objects, preventing multiple native threads from executing Python bytecodes simultaneously.',
        'A security sandbox that disables unauthorized filesystem access.',
        'A compiler flag that converts Python scripts into native C binaries.',
        'A database lock used by SQLite when running multi-threaded queries.'
      ],
      correctAnswer: 'A mutex that protects access to Python objects, preventing multiple native threads from executing Python bytecodes simultaneously.',
      explanation: 'The GIL ensures thread-safe memory management in CPython by permitting only one native thread to hold control of the Python interpreter at any given instant.',
      difficulty: 'medium',
      expectedTimeSeconds: 45
    }
  ],
  SQL: [
    {
      type: 'sql',
      question: 'What is the performance consequence of using a leading wildcard in a SQL LIKE query (e.g., WHERE username LIKE "%smith")?',
      options: [
        'The query planner cannot utilize a standard B-tree index on username, forcing a full table scan.',
        'The query is automatically cached in memory, doubling query throughput.',
        'The query fails with a syntax error because wildcards can only appear at the end.',
        'The database engine promotes the transaction to an exclusive lock.'
      ],
      correctAnswer: 'The query planner cannot utilize a standard B-tree index on username, forcing a full table scan.',
      explanation: 'B-Tree indexes sort entries sequentially. A leading wildcard obscures the starting prefix, making index traversal impossible and necessitating a full table scan.',
      difficulty: 'medium',
      expectedTimeSeconds: 45
    },
    {
      type: 'mcq',
      question: 'Which SQL transaction isolation level prevents dirty reads, non-repeatable reads, and phantom reads?',
      options: [
        'SERIALIZABLE',
        'REPEATABLE READ',
        'READ COMMITTED',
        'READ UNCOMMITTED'
      ],
      correctAnswer: 'SERIALIZABLE',
      explanation: 'SERIALIZABLE is the strictest isolation level, completely isolating concurrent transactions and eliminating phantom reads, non-repeatable reads, and dirty reads.',
      difficulty: 'hard',
      expectedTimeSeconds: 40
    }
  ],
  'System Design': [
    {
      type: 'scenario',
      question: 'When designing a distributed rate limiter for a public REST API, what algorithmic strategy avoids burst traffic while allowing controlled token consumption?',
      options: [
        'Token Bucket or Leaky Bucket algorithm backed by Redis with atomic Lua scripts.',
        'Storing request counts in client-side localStorage cookies.',
        'Re-starting the server process whenever traffic exceeds 500 requests per minute.',
        'Performing synchronous database table count queries on every incoming HTTP request.'
      ],
      correctAnswer: 'Token Bucket or Leaky Bucket algorithm backed by Redis with atomic Lua scripts.',
      explanation: 'Token bucket allows smooth handling of traffic bursts while capping sustained throughput. Backing it with Redis and Lua scripts guarantees atomic, distributed operations.',
      difficulty: 'medium',
      expectedTimeSeconds: 50
    },
    {
      type: 'mcq',
      question: 'According to the CAP Theorem, what tradeoff must a distributed data store make during a network partition (P)?',
      options: [
        'Choose between Consistency (C) and Availability (A).',
        'Choose between Performance (P) and Latency (L).',
        'Consistency and Availability are both guaranteed regardless of partitions.',
        'Network partitions can be eliminated entirely using multi-region load balancers.'
      ],
      correctAnswer: 'Choose between Consistency (C) and Availability (A).',
      explanation: 'When network partitions occur, a distributed system must decide whether to continue serving potentially stale or unconfirmed writes (Availability) or reject requests until synchronization occurs (Consistency).',
      difficulty: 'medium',
      expectedTimeSeconds: 45
    }
  ],
  Algorithms: [
    {
      type: 'code_reading',
      question: 'What is the worst-case time complexity of finding an element in an unsorted array of size N versus a balanced binary search tree of size N?',
      options: [
        'O(N) for the unsorted array and O(log N) for the balanced BST.',
        'O(log N) for the unsorted array and O(1) for the balanced BST.',
        'O(1) for both data structures.',
        'O(N^2) for the unsorted array and O(N) for the balanced BST.'
      ],
      correctAnswer: 'O(N) for the unsorted array and O(log N) for the balanced BST.',
      explanation: 'Searching an unsorted array requires scanning up to N elements (linear O(N)). In a balanced BST, each comparison halves the search space (logarithmic O(log N)).',
      difficulty: 'easy',
      expectedTimeSeconds: 35
    },
    {
      type: 'debugging',
      question: 'In binary search implementation on a 32-bit integer array, why is calculating mid as "low + Math.floor((high - low) / 2)" preferred over "Math.floor((low + high) / 2)"?',
      options: [
        'It avoids potential integer overflow when low + high exceeds the maximum integer capacity in fixed-width languages.',
        'It runs twice as fast by skipping fractional rounding in the CPU ALU.',
        'It allows the search to execute in O(1) constant time.',
        'It is required by the ECMAScript 6 standard for typed arrays.'
      ],
      correctAnswer: 'It avoids potential integer overflow when low + high exceeds the maximum integer capacity in fixed-width languages.',
      explanation: 'When low and high are very large, their sum can overflow fixed-width 32-bit signed integers. Subtracting before dividing avoids this overflow.',
      difficulty: 'medium',
      expectedTimeSeconds: 45
    }
  ]
};

/**
 * Procedural variation generator for any skill or topic.
 * Generates distinct questions with unique angles (architecture, reliability, optimization, security, debugging).
 */
function createProceduralVariations(skill, difficulty = 'medium') {
  const variations = [
    {
      type: 'debugging',
      question: `When profiling an application utilizing ${skill}, what is the most effective approach to identify and resolve high CPU contention?`,
      codeSnippet: `// Example monitoring profile for ${skill}\nconst profile = startCpuProfile('${skill}');\nexecuteWorkload();\nconst report = profile.stop();\nconsole.log(report.topFunctionsBySelfTime());`,
      options: [
        `Analyze call-tree self-time to isolate hot synchronous loops and optimize algorithmic complexity in ${skill}.`,
        `Reboot the production host every 15 minutes to reset thread priority.`,
        `Eliminate all function boundaries by inlining the entire codebase into a single file.`,
        `Disable all log ingestion and error reporting pipelines.`
      ],
      correctAnswer: `Analyze call-tree self-time to isolate hot synchronous loops and optimize algorithmic complexity in ${skill}.`,
      explanation: `Profiling self-time reveals exactly where the execution thread spends CPU cycles, pointing directly to computational bottlenecks in ${skill}.`,
      difficulty,
      expectedTimeSeconds: 50
    },
    {
      type: 'scenario',
      question: `An engineering team is scaling a service built with ${skill}. Which pattern best mitigates downstream service degradation during transient network faults?`,
      options: [
        `Implement a Circuit Breaker pattern with exponential backoff and jitter for outbound calls in ${skill}.`,
        `Immediately retry all failed network requests in an infinite synchronous while loop.`,
        `Suppress all HTTP status codes other than 200 OK.`,
        `Route all external API traffic through a single unmonitored proxy server without timeouts.`
      ],
      correctAnswer: `Implement a Circuit Breaker pattern with exponential backoff and jitter for outbound calls in ${skill}.`,
      explanation: `Circuit breakers prevent cascading system failure by temporarily halting requests to an unhealthy dependency, giving it time to recover.`,
      difficulty,
      expectedTimeSeconds: 50
    },
    {
      type: 'output_prediction',
      question: `Consider the following operational flow implemented in ${skill}. What is the expected status output when processing an array with empty elements?`,
      codeSnippet: `function checkIntegrity(items) {\n  const valid = items.filter(Boolean);\n  return valid.length === items.length ? 'ALL_VALID' : 'HAS_EMPTY';\n}\nconsole.log(checkIntegrity(['data', '', 'verified']));`,
      options: ['HAS_EMPTY', 'ALL_VALID', 'undefined', 'TypeError'],
      correctAnswer: 'HAS_EMPTY',
      explanation: `The empty string '' is falsy in standard conditional evaluations, so filter(Boolean) drops it, making valid.length (2) !== items.length (3).`,
      difficulty: 'easy',
      expectedTimeSeconds: 40
    },
    {
      type: 'mcq',
      question: `What is a primary architectural principle for ensuring automated testability when building components with ${skill}?`,
      options: [
        `Adhering to Dependency Inversion by injecting dependencies rather than hardcoding singleton instances within ${skill} modules.`,
        `Hardcoding all database credentials directly into test files for convenience.`,
        `Removing all assertions from test suites so CI pipelines always succeed.`,
        `Writing unit tests that directly query external third-party production payment gateways.`
      ],
      correctAnswer: `Adhering to Dependency Inversion by injecting dependencies rather than hardcoding singleton instances within ${skill} modules.`,
      explanation: `Dependency injection allows mock and stub implementations to be swapped in easily during testing, creating isolated and deterministic tests.`,
      difficulty,
      expectedTimeSeconds: 45
    },
    {
      type: 'code_reading',
      question: `How should idempotent operations be implemented for state-modifying requests in an architecture using ${skill}?`,
      options: [
        `Attach a unique client-generated Idempotency Key header and store transaction outcomes in a fast cache to deduplicate retries.`,
        `Disable client retries completely across the entire distributed network.`,
        `Generate a new random primary key on every incoming HTTP POST without checking existing records.`,
        `Rely exclusively on browser caching headers (Cache-Control: public).`
      ],
      correctAnswer: `Attach a unique client-generated Idempotency Key header and store transaction outcomes in a fast cache to deduplicate retries.`,
      explanation: `Idempotency keys ensure that network retries execute the underlying mutation at most once, returning the cached response for duplicate requests.`,
      difficulty: 'hard',
      expectedTimeSeconds: 50
    }
  ];

  return variations;
}

/**
 * AI Question Generator using Gemini API with structured schema validation.
 * Rejects any generated question that duplicates or near-duplicates existing questions.
 */
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
 * Curated question generator that guarantees diverse, non-duplicate questions
 * across practice sessions and respects existing/served questions.
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
  const pool = activeSkills.length > 0 ? activeSkills : ['JavaScript', 'Algorithms', 'Web Development'];

  const candidatePool = [];

  // 1. Gather candidates from canonical repository
  for (const skill of pool) {
    const bankItems = CANONICAL_QUESTION_BANK[skill] || [];
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

    // 2. Add procedural variations for this skill to ensure depth
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

  // 3. Filter candidates by preferredTypes if specified (e.g. coding-specific stages)
  let eligibleCandidates = candidatePool;
  if (Array.isArray(preferredTypes) && preferredTypes.length > 0) {
    eligibleCandidates = candidatePool.filter(c => preferredTypes.includes(c.type));
    // If not enough match preferredTypes, include remaining to ensure count
    if (eligibleCandidates.length < count) {
      eligibleCandidates = candidatePool;
    }
  }

  // 4. Select distinct questions that DO NOT duplicate existing questions or each other
  const selected = selectDistinctQuestions({
    pool: eligibleCandidates,
    count,
    excludeQuestions: existingQuestions,
    targetDifficulty
  });

  // 5. Fallback padding if pool was small, ensuring 100% unique items
  let fallbackIndex = 1;
  while (selected.length < count && fallbackIndex <= 15) {
    const skill = pool[fallbackIndex % pool.length];
    const genericCandidate = {
      firebaseUid,
      applicationId,
      type: fallbackIndex % 2 === 0 ? 'debugging' : 'scenario',
      question: `Engineering Reliability Scenario #${fallbackIndex}: How should an engineering team handle memory pressure during peak concurrency in ${skill}?`,
      codeSnippet: `// Diagnostic checkpoint for ${skill}\nif (process.memoryUsage().heapUsed > THRESHOLD) {\n  triggerGracefulShedding();\n}`,
      options: [
        `Implement graceful load shedding and optimize resource recycling in ${skill}.`,
        `Ignore memory metrics until the host machine enters kernel panic.`,
        `Force all network callers into an infinite blocking queue.`,
        `Write all in-flight heap objects directly to unbuffered raw disk logs.`
      ],
      correctAnswer: `Implement graceful load shedding and optimize resource recycling in ${skill}.`,
      explanation: `Graceful load shedding relieves memory pressure while preserving service health for existing operations in ${skill}.`,
      difficulty: targetDifficulty,
      skill,
      requirementRef: skill,
      expectedTimeSeconds: 50
    };
    genericCandidate.options = shuffleArray(genericCandidate.options);

    if (
      validateQuestionFormat(genericCandidate) &&
      !isDuplicateOrNearDuplicate(genericCandidate, existingQuestions) &&
      !isDuplicateOrNearDuplicate(genericCandidate, selected)
    ) {
      selected.push(genericCandidate);
    }
    fallbackIndex++;
  }

  return selected.slice(0, count);
}
