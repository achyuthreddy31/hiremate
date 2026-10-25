/**
 * HireMate Nexus - Comprehensive Practice & Coding Question Bank
 * Covers 5 dynamic categories, 26 skills, and Beginner/Intermediate/Advanced tiers.
 */

export const PRACTICE_CATEGORIES = {
  'Programming Languages': [
    'Python',
    'Java',
    'C',
    'C++',
    'JavaScript',
    'TypeScript'
  ],
  'Web Development': [
    'HTML',
    'CSS',
    'JavaScript',
    'React',
    'Node.js',
    'Express.js',
    'FastAPI'
  ],
  'Databases': [
    'SQL',
    'MongoDB',
    'PostgreSQL',
    'MySQL'
  ],
  'Core CS & DSA': [
    'Data Structures & Algorithms',
    'Object-Oriented Programming',
    'DBMS',
    'Operating Systems',
    'Computer Networks'
  ],
  'AI & Data Science': [
    'Artificial Intelligence',
    'Machine Learning',
    'Data Science',
    'Pandas',
    'NumPy'
  ]
};

export const DIFFICULTY_MAP = {
  'Beginner': 'easy',
  'Intermediate': 'medium',
  'Advanced': 'hard',
  'easy': 'easy',
  'medium': 'medium',
  'hard': 'hard'
};

export const REVERSE_DIFFICULTY_MAP = {
  'easy': 'Beginner',
  'medium': 'Intermediate',
  'hard': 'Advanced'
};

/**
 * Curated Canonical MCQs across all 26 skills
 */
export const CURATED_MCQ_BANK = {
  // Programming Languages
  Python: [
    {
      type: 'output_prediction',
      difficulty: 'easy',
      question: 'What is the output of the following Python slice operation on a list?',
      codeSnippet: 'nums = [10, 20, 30, 40, 50]\nprint(nums[1:4:2])',
      options: ['[20, 40]', '[20, 30, 40]', '[10, 30]', '[20]'],
      correctAnswer: '[20, 40]',
      explanation: 'Slicing syntax is [start:stop:step]. Index 1 is 20, step 2 skips index 2 (30) and includes index 3 (40). Index 4 is exclusive.'
    },
    {
      type: 'mcq',
      difficulty: 'medium',
      question: 'In Python CPython, what is the role and consequence of the Global Interpreter Lock (GIL)?',
      options: [
        'A mutex that protects access to Python objects, preventing multiple native threads from executing Python bytecodes simultaneously in one process.',
        'A sandboxing mechanism preventing untrusted code from modifying disk files.',
        'A just-in-time compiler feature that compiles loops to machine code.',
        'A database lock used by SQLite when multi-threading queries.'
      ],
      correctAnswer: 'A mutex that protects access to Python objects, preventing multiple native threads from executing Python bytecodes simultaneously in one process.',
      explanation: 'The GIL synchronizes memory management in CPython, restricting bytecode execution to one native thread per process at a time.'
    },
    {
      type: 'debugging',
      difficulty: 'medium',
      question: 'Why does defining a default argument as a mutable list in a Python function create unexpected state persistence across calls?',
      codeSnippet: 'def add_item(item, basket=[]):\n    basket.append(item)\n    return basket',
      options: [
        'Default argument expressions are evaluated once when the function definition is executed, binding the same list object to all subsequent calls.',
        'Python variables declared without self are allocated in global registers.',
        'Lists in Python cannot be passed into function signatures by reference.',
        'The function scope is recompiled on every invocation.'
      ],
      correctAnswer: 'Default argument expressions are evaluated once when the function definition is executed, binding the same list object to all subsequent calls.',
      explanation: 'In Python, default arguments are evaluated only once at definition time. The list is mutated in-place across all invocations sharing the default.'
    },
    {
      type: 'code_reading',
      difficulty: 'hard',
      question: 'What does the __enter__ and __exit__ protocol enable when creating custom Python classes?',
      options: [
        'Context manager support, enabling resource allocation and deterministic cleanup using the "with" statement.',
        'Multi-threaded locking using the threading.Thread superclass.',
        'Custom serialization for the pickle module.',
        'Automatic operator overloading for logical conjunction.'
      ],
      correctAnswer: 'Context manager support, enabling resource allocation and deterministic cleanup using the "with" statement.',
      explanation: 'The context management protocol (__enter__ and __exit__) guarantees that setup and teardown code run deterministically, even if exceptions are raised.'
    }
  ],

  Java: [
    {
      type: 'mcq',
      difficulty: 'easy',
      question: 'In Java, what is the key difference between String, StringBuilder, and StringBuffer?',
      options: [
        'String is immutable; StringBuilder is mutable and not thread-safe; StringBuffer is mutable and thread-safe (synchronized).',
        'String and StringBuilder are identical, while StringBuffer is used only for file I/O.',
        'StringBuilder is immutable, while String is mutable.',
        'StringBuffer cannot be instantiated directly in Java 17+.'
      ],
      correctAnswer: 'String is immutable; StringBuilder is mutable and not thread-safe; StringBuffer is mutable and thread-safe (synchronized).',
      explanation: 'String literals are immutable in the pool. StringBuilder provides faster un-synchronized character buffer mutations, whereas StringBuffer synchronizes method calls.'
    },
    {
      type: 'debugging',
      difficulty: 'medium',
      question: 'Why must hashCode() always be overridden whenever equals() is overridden in a Java class?',
      options: [
        'To maintain the contract that equal objects according to equals() must return the same hashCode, ensuring correct behavior in hash-based collections like HashMap and HashSet.',
        'To allow the JVM to serialize the class into JSON.',
        'To prevent memory leaks in the Young Generation Garbage Collector.',
        'Java compiler refuses to compile classes if only equals() is implemented.'
      ],
      correctAnswer: 'To maintain the contract that equal objects according to equals() must return the same hashCode, ensuring correct behavior in hash-based collections like HashMap and HashSet.',
      explanation: 'If two objects are equal by equals(), their hashCode values must match. Violating this causes HashMaps to store or fail to find elements in appropriate buckets.'
    },
    {
      type: 'mcq',
      difficulty: 'hard',
      question: 'How does the Java Memory Model define the "happens-before" relationship with respect to volatile fields?',
      options: [
        'A write to a volatile field happens-before every subsequent read of that same volatile field across threads, guaranteeing memory visibility.',
        'Volatile fields bypass CPU cache and force thread preemption.',
        'Volatile fields are stored directly in the heap Metaspace.',
        'Volatile prevents deadlocks by locking all class methods.'
      ],
      correctAnswer: 'A write to a volatile field happens-before every subsequent read of that same volatile field across threads, guaranteeing memory visibility.',
      explanation: 'Under the JMM, a volatile write establishes a memory barrier ensuring all preceding writes become visible to any thread that subsequently reads the volatile variable.'
    }
  ],

  C: [
    {
      type: 'output_prediction',
      difficulty: 'easy',
      question: 'What is the output of the following C code snippet demonstrating pointer dereferencing?',
      codeSnippet: '#include <stdio.h>\nint main() {\n  int x = 10;\n  int *p = &x;\n  *p += 5;\n  printf("%d", x);\n  return 0;\n}',
      options: ['15', '10', 'Address of x', 'Compilation Error'],
      correctAnswer: '15',
      explanation: 'Pointer *p dereferences the memory address of x. Incrementing *p by 5 directly modifies the value of x to 15.'
    },
    {
      type: 'debugging',
      difficulty: 'medium',
      question: 'In C, what catastrophic bug occurs if free() is called twice on the same allocated heap memory pointer without reallocating?',
      options: [
        'Double Free Vulnerability, which corrupts heap metadata and can lead to arbitrary code execution or segmentation faults.',
        'The second free() call is safely ignored by the operating system kernel.',
        'A StackOverflowError is thrown immediately.',
        'The memory is automatically converted into static memory.'
      ],
      correctAnswer: 'Double Free Vulnerability, which corrupts heap metadata and can lead to arbitrary code execution or segmentation faults.',
      explanation: 'Calling free() on an already freed block corrupts the free-list data structures in the memory allocator, creating severe security vulnerabilities.'
    },
    {
      type: 'mcq',
      difficulty: 'hard',
      question: 'What is undefined behavior in C when performing pointer arithmetic across different, unrelated allocated arrays?',
      options: [
        'Pointers in C may only be legally subtracted or compared if they point to elements within the same array or one past the end.',
        'Pointer arithmetic across different arrays always yields the physical byte offset.',
        'The compiler automatically inserts bounds-checking loops.',
        'Unrelated pointer subtraction returns 0.'
      ],
      correctAnswer: 'Pointers in C may only be legally subtracted or compared if they point to elements within the same array or one past the end.',
      explanation: 'The C standard stipulates that pointer comparisons or differences between objects belonging to distinct allocations result in undefined behavior.'
    }
  ],

  'C++': [
    {
      type: 'mcq',
      difficulty: 'easy',
      question: 'In modern C++ (C++11 and later), which smart pointer guarantees exclusive ownership of a dynamically allocated object?',
      options: [
        'std::unique_ptr',
        'std::shared_ptr',
        'std::weak_ptr',
        'std::auto_ptr'
      ],
      correctAnswer: 'std::unique_ptr',
      explanation: 'std::unique_ptr implements strict exclusive ownership with zero overhead over a raw pointer, destroying the managed resource when it goes out of scope.'
    },
    {
      type: 'code_reading',
      difficulty: 'medium',
      question: 'What is the purpose of std::move in modern C++?',
      options: [
        'It unconditionally casts an expression to an rvalue reference, enabling move semantics without copying underlying heap data.',
        'It physically copies memory bytes to a newly allocated stack frame.',
        'It spawns a background thread to transfer CPU registers.',
        'It deletes the source object from memory immediately.'
      ],
      correctAnswer: 'It unconditionally casts an expression to an rvalue reference, enabling move semantics without copying underlying heap data.',
      explanation: 'std::move does not move anything at runtime; it performs a static_cast to an rvalue reference (T&&) allowing constructors and operators to pilfer resources.'
    },
    {
      type: 'debugging',
      difficulty: 'hard',
      question: 'Why should base class destructors almost always be declared "virtual" in C++ when polymorphism is used?',
      options: [
        'To ensure that deleting a derived object through a base class pointer invokes the derived class destructor, preventing resource leaks.',
        'To make the base class an abstract interface.',
        'To prevent derived classes from overriding the destructor.',
        'Virtual destructors speed up stack frame allocation.'
      ],
      correctAnswer: 'To ensure that deleting a derived object through a base class pointer invokes the derived class destructor, preventing resource leaks.',
      explanation: 'Deleting a derived instance through a pointer to base with a non-virtual destructor results in undefined behavior and skips the derived cleanup logic.'
    }
  ],

  JavaScript: [
    {
      type: 'output_prediction',
      difficulty: 'easy',
      question: 'What is the console output of this JavaScript snippet demonstrating variable scoping with "var"?',
      codeSnippet: 'for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}',
      options: ['3 3 3', '0 1 2', 'undefined undefined undefined', 'ReferenceError'],
      correctAnswer: '3 3 3',
      explanation: 'Variables declared with "var" are function-scoped. By the time the timeout callbacks run, the loop has completed with i = 3.'
    },
    {
      type: 'mcq',
      difficulty: 'medium',
      question: 'Which statement accurately describes how the JavaScript event loop manages the microtask queue versus the macrotask queue?',
      options: [
        'All microtasks in the queue are executed immediately after the current call stack clears, before the next macrotask is dequeued.',
        'Microtasks and macrotasks are interleaved strictly in a 1:1 alternating order.',
        'Macrotasks take precedence over microtasks when handling network response callbacks.',
        'The microtask queue is only evaluated once during window initialization.'
      ],
      correctAnswer: 'All microtasks in the queue are executed immediately after the current call stack clears, before the next macrotask is dequeued.',
      explanation: 'Microtasks (Promises, queueMicrotask) run immediately following script execution and before yielding to rendering or the macrotask queue (setTimeout, setInterval).'
    },
    {
      type: 'debugging',
      difficulty: 'hard',
      question: 'In JavaScript, why does comparing two identical object literals with strict equality (({ a: 1 } === { a: 1 })) return false?',
      options: [
        'Objects are compared by heap memory reference rather than structural value equality.',
        'Strict equality cannot evaluate keys with numerical values.',
        'Object literals must first be serialized using JSON.stringify to be compared.',
        'JavaScript engine throws a silent TypeCoercionError.'
      ],
      correctAnswer: 'Objects are compared by heap memory reference rather than structural value equality.',
      explanation: 'In JavaScript, non-primitive data types (objects, arrays, functions) are compared by reference identity in memory, not structural equality.'
    }
  ],

  TypeScript: [
    {
      type: 'mcq',
      difficulty: 'easy',
      question: 'Which TypeScript utility type constructs a type with all properties of Type set to optional?',
      options: [
        'Partial<T>',
        'Required<T>',
        'Readonly<T>',
        'Record<K, T>'
      ],
      correctAnswer: 'Partial<T>',
      explanation: 'Partial<T> returns a type where every field in T is marked with the optional "?" modifier.'
    },
    {
      type: 'mcq',
      difficulty: 'medium',
      question: 'In TypeScript, what is the key difference between the "unknown" and "any" top types?',
      options: [
        '"unknown" enforces type-checking and narrowing before properties or methods can be accessed, whereas "any" turns off type checking.',
        '"unknown" can only be assigned to string and number types.',
        '"any" requires explicit runtime type guards, while "unknown" does not.',
        '"unknown" is compiled to a specialized runtime symbol, while "any" is removed.'
      ],
      correctAnswer: '"unknown" enforces type-checking and narrowing before properties or methods can be accessed, whereas "any" turns off type checking.',
      explanation: '"unknown" is the type-safe counterpart of "any". Anything is assignable to unknown, but unknown is not assignable to anything else without type narrowing.'
    },
    {
      type: 'code_reading',
      difficulty: 'hard',
      question: 'What does the TypeScript "infer" keyword do when used inside a conditional type definition?',
      options: [
        'It introduces a type variable within the "extends" clause to be deduced automatically from the matched type.',
        'It infers the runtime memory address of a variable.',
        'It forces TypeScript to compile code without emitting JavaScript declarations.',
        'It converts interface declarations into abstract classes.'
      ],
      correctAnswer: 'It introduces a type variable within the "extends" clause to be deduced automatically from the matched type.',
      explanation: 'The "infer" keyword allows conditional types to extract component types (such as return types, array element types, or promise payloads).'
    }
  ],

  // Web Development
  HTML: [
    {
      type: 'mcq',
      difficulty: 'easy',
      question: 'What is the primary benefit of using semantic HTML5 elements like <header>, <nav>, <main>, and <article>?',
      options: [
        'Improves web accessibility for screen readers and assists search engine web crawlers in understanding document structure.',
        'Automatically adds CSS animations without external stylesheets.',
        'Speeds up JavaScript execution by compiling DOM trees to binary.',
        'Prevents Cross-Site Scripting (XSS) vulnerabilities automatically.'
      ],
      correctAnswer: 'Improves web accessibility for screen readers and assists search engine web crawlers in understanding document structure.',
      explanation: 'Semantic elements provide meaningful structural information to assistive technologies, browser user agents, and search engines.'
    },
    {
      type: 'mcq',
      difficulty: 'medium',
      question: 'What is the difference between the "defer" and "async" attributes on HTML script tags?',
      options: [
        '"async" executes as soon as the script is downloaded (interrupting parsing), while "defer" executes only after the HTML document is fully parsed in order.',
        '"defer" pauses HTML parsing during download, while "async" does not.',
        '"async" only works for inline scripts, while "defer" works for external scripts.',
        'Both attributes have identical browser execution behavior.'
      ],
      correctAnswer: '"async" executes as soon as the script is downloaded (interrupting parsing), while "defer" executes only after the HTML document is fully parsed in order.',
      explanation: 'Both download asynchronously, but "async" executes immediately upon arrival, while "defer" guarantees execution order and waits for DOMContentLoaded.'
    },
    {
      type: 'mcq',
      difficulty: 'hard',
      question: 'How do Content Security Policy (CSP) headers declared in HTML meta tags protect web applications?',
      options: [
        'They restrict the sources and domains from which scripts, styles, images, and frames can be loaded and executed, mitigating XSS attacks.',
        'They encrypt the HTML document using AES-256 before transmission.',
        'They block browser caching for all HTML form submissions.',
        'They automatically authenticate users via OAuth2.'
      ],
      correctAnswer: 'They restrict the sources and domains from which scripts, styles, images, and frames can be loaded and executed, mitigating XSS attacks.',
      explanation: 'CSP defines trusted whitelists of executable script and asset sources, preventing malicious injected scripts from executing.'
    }
  ],

  CSS: [
    {
      type: 'mcq',
      difficulty: 'easy',
      question: 'In the standard CSS box model, what is the correct formula for total rendered element width when box-sizing is set to "content-box"?',
      options: [
        'width + padding-left + padding-right + border-left + border-right',
        'width only (padding and border are absorbed)',
        'width + margin-left + margin-right',
        'width - padding-left - padding-right'
      ],
      correctAnswer: 'width + padding-left + padding-right + border-left + border-right',
      explanation: 'Under content-box, specified width applies only to content. Padding and borders are added to calculate total rendered width.'
    },
    {
      type: 'mcq',
      difficulty: 'medium',
      question: 'How does CSS specificity calculate which style declaration wins when multiple selectors target the same element?',
      options: [
        'Inline styles (1000) > IDs (100) > Classes, attributes, and pseudo-classes (10) > Elements and pseudo-elements (1).',
        'The longest selector string in characters always wins.',
        'Styles defined earliest in the CSS file override later styles.',
        'Tag selectors always override ID selectors.'
      ],
      correctAnswer: 'Inline styles (1000) > IDs (100) > Classes, attributes, and pseudo-classes (10) > Elements and pseudo-elements (1).',
      explanation: 'CSS specificity is computed as a 4-part tuple: inline styles, ID selectors, class/attribute/pseudo-class selectors, and tag/pseudo-element selectors.'
    },
    {
      type: 'mcq',
      difficulty: 'hard',
      question: 'What creates a new Stacking Context in CSS?',
      options: [
        'Elements with opacity < 1, transform not none, filter not none, or positioned elements with explicit z-index.',
        'Any element styled with display: block.',
        'Any div that contains text content.',
        'Elements with margin set to auto.'
      ],
      correctAnswer: 'Elements with opacity < 1, transform not none, filter not none, or positioned elements with explicit z-index.',
      explanation: 'A stacking context is formed by root element, positioned elements with z-index, elements with transforms, opacity, filters, or will-change.'
    }
  ],

  React: [
    {
      type: 'mcq',
      difficulty: 'easy',
      question: 'What is the primary role of the React useMemo hook?',
      options: [
        'Cache the calculated result of an expensive computation between renders until its dependencies change.',
        'Persist component state across page reloads in sessionStorage.',
        'Prevent a component from receiving new props from its parent.',
        'Automatically compile JSX templates into optimized WebGL shaders.'
      ],
      correctAnswer: 'Cache the calculated result of an expensive computation between renders until its dependencies change.',
      explanation: 'useMemo memoizes the result of a function call to avoid expensive recalculations on every render when dependencies have not changed.'
    },
    {
      type: 'debugging',
      difficulty: 'medium',
      question: 'Why must React state never be mutated directly (e.g., state.items.push(newItem))?',
      options: [
        'Direct mutation preserves the previous object reference, causing React shallow equality checks to skip re-rendering.',
        'Direct mutation throws an uncatchable browser DOMException.',
        'React state stores data in immutable WebAssembly memory buffers.',
        'Component props are automatically overwritten whenever state is mutated.'
      ],
      correctAnswer: 'Direct mutation preserves the previous object reference, causing React shallow equality checks to skip re-rendering.',
      explanation: 'React compares previous and next states using Object.is. Mutating in place keeps the reference identical, so React assumes nothing changed.'
    },
    {
      type: 'code_reading',
      difficulty: 'hard',
      question: 'When should you pass a cleanup function as the return value of a React useEffect hook?',
      options: [
        'To unsubscribe from subscriptions, clear timers, or abort in-flight network requests when the component unmounts or dependencies change.',
        'To force the component to immediately trigger a synchronous DOM re-paint.',
        'To purge component state from the browser localStorage.',
        'To reset all ancestor component props back to their default values.'
      ],
      correctAnswer: 'To unsubscribe from subscriptions, clear timers, or abort in-flight network requests when the component unmounts or dependencies change.',
      explanation: 'The returned cleanup function is executed before the effect is re-run and when the component unmounts, preventing memory leaks and stale event listeners.'
    }
  ],

  'Node.js': [
    {
      type: 'debugging',
      difficulty: 'easy',
      question: 'What happens if an asynchronous Promise rejects in Node.js without an attached .catch() handler or unhandledRejection listener?',
      options: [
        'Node.js emits an unhandledRejection event and terminates the process with a non-zero exit code.',
        'The exception is silently swallowed and execution continues normally.',
        'The event loop resets all active network sockets to prevent corruption.',
        'Node.js restarts the application automatically using cluster mode.'
      ],
      correctAnswer: 'Node.js emits an unhandledRejection event and terminates the process with a non-zero exit code.',
      explanation: 'Modern Node.js crashes the process on unhandled promise rejections to adhere to the fail-fast principle and avoid corrupted state.'
    },
    {
      type: 'scenario',
      difficulty: 'medium',
      question: 'In a Node.js API server, how can CPU-intensive computational tasks (such as image resizing or crypto hashing) be prevented from blocking HTTP request handling?',
      options: [
        'Offload the intensive computation to Worker Threads or an external background queue worker.',
        'Increase the Node.js memory limit using --max-old-space-size.',
        'Wrap the computational code in process.nextTick() loops.',
        'Execute the computation inside a synchronous while loop.'
      ],
      correctAnswer: 'Offload the intensive computation to Worker Threads or an external background queue worker.',
      explanation: 'Node.js runs JS on a single event-loop thread. Long-running synchronous CPU operations block the loop, starving all I/O unless offloaded to worker threads or external worker services.'
    },
    {
      type: 'mcq',
      difficulty: 'hard',
      question: 'How should high-throughput streaming in Node.js handle the scenario where the readable stream is faster than the writable stream?',
      options: [
        'By honoring backpressure via pipe(), pipeline(), or checking stream.write() return value and waiting for the "drain" event.',
        'By allocating an unbounded V8 heap buffer to store pending chunks in memory.',
        'By spawning a separate child process for every incoming stream chunk.',
        'By switching the HTTP server to synchronous blocking filesystem calls.'
      ],
      correctAnswer: 'By honoring backpressure via pipe(), pipeline(), or checking stream.write() return value and waiting for the "drain" event.',
      explanation: 'Handling backpressure prevents memory exhaustion by pausing the readable stream when the writable internal buffer is full until the "drain" event fires.'
    }
  ],

  'Express.js': [
    {
      type: 'mcq',
      difficulty: 'easy',
      question: 'In Express.js, what is the role of the "next" function parameter in route middleware?',
      options: [
        'It passes control to the next middleware function in the execution stack.',
        'It sends an HTTP redirect to the browser.',
        'It closes the database connection pool.',
        'It restarts the Express HTTP server.'
      ],
      correctAnswer: 'It passes control to the next middleware function in the execution stack.',
      explanation: 'Calling next() invokes the subsequent middleware in the pipeline. If next(err) is called with an argument, Express skips to error handling middleware.'
    },
    {
      type: 'debugging',
      difficulty: 'medium',
      question: 'How must an error-handling middleware function be defined in Express.js so that Express recognizes it as an error handler?',
      options: [
        'It must take exactly 4 parameters: (err, req, res, next).',
        'It must be named function errorHandler().',
        'It must return a Promise that rejects.',
        'It must be placed at the very beginning of the app.use() sequence.'
      ],
      correctAnswer: 'It must take exactly 4 parameters: (err, req, res, next).',
      explanation: 'Express inspects function.length. Middleware functions with arity 4 (err, req, res, next) are classified as specialized error handlers.'
    },
    {
      type: 'scenario',
      difficulty: 'hard',
      question: 'Why should helmet middleware and rate-limiting middleware be applied at the entry point of an Express.js production application?',
      options: [
        'Helmet sets secure HTTP headers (HSTS, CSP, X-Frame-Options), while rate limiting mitigates brute-force and Denial-of-Service (DoS) abuse.',
        'Helmet compresses JSON payloads with gzip.',
        'They replace the need for HTTPS encryption certificates.',
        'They compile Express routes into native C++ bindings.'
      ],
      correctAnswer: 'Helmet sets secure HTTP headers (HSTS, CSP, X-Frame-Options), while rate limiting mitigates brute-force and Denial-of-Service (DoS) abuse.',
      explanation: 'Helmet configures standard defense-in-depth HTTP security headers, while express-rate-limit prevents endpoint abuse and credential stuffing.'
    }
  ],

  FastAPI: [
    {
      type: 'mcq',
      difficulty: 'easy',
      question: 'Which underlying library powers request data validation and serialization in FastAPI?',
      options: [
        'Pydantic',
        'Marshmallow',
        'Django ORM',
        'Cerberus'
      ],
      correctAnswer: 'Pydantic',
      explanation: 'FastAPI relies on Pydantic schemas for request body parsing, type validation, data conversion, and OpenAPI schema generation.'
    },
    {
      type: 'code_reading',
      difficulty: 'medium',
      question: 'In FastAPI, what is the role of the "Depends" utility in route path operations?',
      options: [
        'It declares dependency injection, allowing shared logic (authentication, database sessions, permissions) to be resolved per request.',
        'It schedules asynchronous background tasks to run every hour.',
        'It enforces synchronous blocking threads on incoming requests.',
        'It compiles Python code into WebAssembly.'
      ],
      correctAnswer: 'It declares dependency injection, allowing shared logic (authentication, database sessions, permissions) to be resolved per request.',
      explanation: 'Depends() is FastAPI’s dependency injection system, enabling modular, reusable, and testable components like auth guards and DB sessions.'
    },
    {
      type: 'mcq',
      difficulty: 'hard',
      question: 'How does FastAPI handle routes declared with "async def" versus standard "def"?',
      options: [
        '"async def" functions run directly on the event loop, whereas regular "def" functions are executed in an external threadpool to prevent blocking the event loop.',
        'Regular "def" functions are rejected with a SyntaxError at startup.',
        '"async def" runs inside separate operating system processes.',
        'FastAPI converts regular "def" functions into synchronous generators.'
      ],
      correctAnswer: '"async def" functions run directly on the event loop, whereas regular "def" functions are executed in an external threadpool to prevent blocking the event loop.',
      explanation: 'FastAPI runs standard "def" routes in an AnyIO worker threadpool so synchronous blocking code (like blocking DB calls) does not freeze the async event loop.'
    }
  ],

  // Databases
  SQL: [
    {
      type: 'sql',
      difficulty: 'easy',
      question: 'What is the consequence of using a leading wildcard in a SQL LIKE query (e.g., WHERE username LIKE "%smith")?',
      options: [
        'The query planner cannot utilize a standard B-tree index on username, forcing a full table scan.',
        'The query is automatically cached in memory, doubling query throughput.',
        'The query fails with a syntax error because wildcards can only appear at the end.',
        'The database engine promotes the transaction to an exclusive lock.'
      ],
      correctAnswer: 'The query planner cannot utilize a standard B-tree index on username, forcing a full table scan.',
      explanation: 'B-Tree indexes sort entries sequentially. A leading wildcard obscures the starting prefix, making index traversal impossible and necessitating a full table scan.'
    },
    {
      type: 'mcq',
      difficulty: 'medium',
      question: 'Which SQL transaction isolation level prevents dirty reads, non-repeatable reads, and phantom reads?',
      options: [
        'SERIALIZABLE',
        'REPEATABLE READ',
        'READ COMMITTED',
        'READ UNCOMMITTED'
      ],
      correctAnswer: 'SERIALIZABLE',
      explanation: 'SERIALIZABLE is the strictest isolation level, ensuring transactions execute as if strictly serial, preventing all anomalies including phantom reads.'
    },
    {
      type: 'scenario',
      difficulty: 'hard',
      question: 'In database indexing, what is a "covering index"?',
      options: [
        'An index that contains all columns requested by a query, allowing the database to satisfy the query entirely from the index without looking up table rows.',
        'An index applied to every single column in a database table.',
        'An encrypted index that covers sensitive personal data.',
        'A temporary index generated exclusively during bulk CSV imports.'
      ],
      correctAnswer: 'An index that contains all columns requested by a query, allowing the database to satisfy the query entirely from the index without looking up table rows.',
      explanation: 'A covering index satisfies the query directly from the leaf nodes of the B-Tree index, avoiding expensive secondary disk lookups to the main heap table.'
    }
  ],

  MongoDB: [
    {
      type: 'mcq',
      difficulty: 'easy',
      question: 'What is the default primary key field automatically generated by MongoDB for every document in a collection?',
      options: [
        '_id (an ObjectId)',
        'id (an auto-incrementing integer)',
        'uuid (a GUID string)',
        'key (a SHA-256 hash)'
      ],
      correctAnswer: '_id (an ObjectId)',
      explanation: 'MongoDB assigns a unique 12-byte BSON ObjectId to the _id field of every document unless explicitly overridden.'
    },
    {
      type: 'mcq',
      difficulty: 'medium',
      question: 'What is the purpose of the MongoDB Aggregation Pipeline stage "$lookup"?',
      options: [
        'Performs a left outer join to documents in another collection within the same database.',
        'Performs a full-text search index query.',
        'Sorts documents according to geographical coordinates.',
        'Creates a backup archive in Amazon S3.'
      ],
      correctAnswer: 'Performs a left outer join to documents in another collection within the same database.',
      explanation: '$lookup performs an equality match between a local field and a foreign collection field, returning matched documents as an array.'
    },
    {
      type: 'debugging',
      difficulty: 'hard',
      question: 'In MongoDB replica sets, what does write concern "w: majority" ensure?',
      options: [
        'The write is acknowledged only after being written to the on-disk journal of a majority of voting replica set nodes, preventing stale reads and data loss during failover.',
        'The write is replicated to at least 10 nodes.',
        'The write automatically updates secondary read replicas before the primary.',
        'The write converts all collections into sharded clusters.'
      ],
      correctAnswer: 'The write is acknowledged only after being written to the on-disk journal of a majority of voting replica set nodes, preventing stale reads and data loss during failover.',
      explanation: 'Write concern w: majority guarantees that once acknowledged, the write will survive the crash or election of any primary node.'
    }
  ],

  PostgreSQL: [
    {
      type: 'mcq',
      difficulty: 'easy',
      question: 'What is the key benefit of PostgreSQL\'s JSONB column type over standard JSON text columns?',
      options: [
        'JSONB stores parsed binary format supporting GIN indexing and fast key-based lookups, whereas JSON stores verbatim text that must be reparsed.',
        'JSONB enforces a maximum document size of 100 bytes.',
        'JSONB does not allow nested objects or arrays.',
        'JSONB only works with GraphQL endpoints.'
      ],
      correctAnswer: 'JSONB stores parsed binary format supporting GIN indexing and fast key-based lookups, whereas JSON stores verbatim text that must be reparsed.',
      explanation: 'JSONB is pre-parsed into binary format, allowing fast indexable queries using GIN and operators like @> and ?.'
    },
    {
      type: 'mcq',
      difficulty: 'medium',
      question: 'How does PostgreSQL implement Multi-Version Concurrency Control (MVCC) without table-level read locks?',
      options: [
        'By maintaining multiple tuple versions using xmin and xmax transaction IDs, allowing readers to read historical snapshots without blocking writers.',
        'By pausing incoming writes until all active reads finish.',
        'By writing all updates to a single shared mutex.',
        'By caching all table rows in browser memory.'
      ],
      correctAnswer: 'By maintaining multiple tuple versions using xmin and xmax transaction IDs, allowing readers to read historical snapshots without blocking writers.',
      explanation: 'In PostgreSQL, updates create new row versions while marking old ones. Readers view consistent snapshots according to their transaction visibility rules.'
    },
    {
      type: 'scenario',
      difficulty: 'hard',
      question: 'What is the role of VACUUM in PostgreSQL maintenance?',
      options: [
        'Reclaims storage occupied by dead tuples from deleted or updated rows and updates visibility maps to speed up index-only scans.',
        'Deletes old user accounts that have been inactive for 90 days.',
        'Clears the query execution cache to restart the server.',
        'Compresses WAL log files into zip archives.'
      ],
      correctAnswer: 'Reclaims storage occupied by dead tuples from deleted or updated rows and updates visibility maps to speed up index-only scans.',
      explanation: 'Because PostgreSQL MVCC creates new row versions on updates, VACUUM frees space occupied by dead tuples and prevents transaction ID wraparound.'
    }
  ],

  MySQL: [
    {
      type: 'mcq',
      difficulty: 'easy',
      question: 'What is the default transactional storage engine in modern MySQL versions (5.5+)?',
      options: [
        'InnoDB',
        'MyISAM',
        'Memory',
        'Archive'
      ],
      correctAnswer: 'InnoDB',
      explanation: 'InnoDB provides ACID transactions, foreign keys, row-level locking, and crash recovery, making it the standard default engine in MySQL.'
    },
    {
      type: 'mcq',
      difficulty: 'medium',
      question: 'In MySQL InnoDB, how are primary key indexes structured compared to secondary indexes?',
      options: [
        'The primary key is a Clustered Index storing the entire row data at the leaf nodes, while secondary indexes store the primary key value as their leaf pointer.',
        'Primary key indexes are stored as hash maps in RAM, while secondary indexes are stored on disk.',
        'Secondary indexes cannot use B-Trees.',
        'InnoDB does not support secondary indexes.'
      ],
      correctAnswer: 'The primary key is a Clustered Index storing the entire row data at the leaf nodes, while secondary indexes store the primary key value as their leaf pointer.',
      explanation: 'In InnoDB, the table data is physically organized according to the clustered primary key index. Secondary indexes point to the primary key.'
    },
    {
      type: 'scenario',
      difficulty: 'hard',
      question: 'How does MySQL semi-synchronous replication improve data durability over asynchronous replication?',
      options: [
        'The primary waits until at least one replica has received and logged the transaction events to its relay log before committing.',
        'The primary waits for all replicas to apply changes to their physical tables.',
        'Replication happens strictly via optical cables.',
        'It requires transactions to be entered twice by two different administrators.'
      ],
      correctAnswer: 'The primary waits until at least one replica has received and logged the transaction events to its relay log before committing.',
      explanation: 'Semi-synchronous replication guarantees that transactions are safely recorded on at least one slave relay log before the primary confirms success.'
    }
  ],

  // Core CS & DSA
  'Data Structures & Algorithms': [
    {
      type: 'mcq',
      difficulty: 'easy',
      question: 'What is the average time complexity of searching, inserting, and deleting elements in a well-balanced Binary Search Tree (such as an AVL or Red-Black tree)?',
      options: [
        'O(log n)',
        'O(1)',
        'O(n)',
        'O(n log n)'
      ],
      correctAnswer: 'O(log n)',
      explanation: 'Balanced BSTs maintain height proportional to log(n), guaranteeing logarithmic time for lookup, insertion, and deletion.'
    },
    {
      type: 'mcq',
      difficulty: 'medium',
      question: 'When implementing Dijkstra’s algorithm to find shortest paths in a graph with non-negative edge weights, what data structure yields the optimal O((V + E) log V) time complexity?',
      options: [
        'Min-Priority Queue (Binary Heap or Fibonacci Heap)',
        'LIFO Stack',
        'Doubly Linked List',
        'Unsorted Array'
      ],
      correctAnswer: 'Min-Priority Queue (Binary Heap or Fibonacci Heap)',
      explanation: 'A min-priority queue allows extracting the minimum distance vertex in logarithmic time, achieving O((V + E) log V).'
    },
    {
      type: 'scenario',
      difficulty: 'hard',
      question: 'How does the Floyd-Warshall algorithm differ from the Bellman-Ford algorithm?',
      options: [
        'Floyd-Warshall computes all-pairs shortest paths in O(V^3) using dynamic programming, while Bellman-Ford computes single-source shortest paths in O(V * E) and detects negative cycles.',
        'Floyd-Warshall cannot handle directed graphs, while Bellman-Ford can.',
        'Bellman-Ford only works on unweighted trees.',
        'Floyd-Warshall requires all edge weights to be equal to 1.'
      ],
      correctAnswer: 'Floyd-Warshall computes all-pairs shortest paths in O(V^3) using dynamic programming, while Bellman-Ford computes single-source shortest paths in O(V * E) and detects negative cycles.',
      explanation: 'Floyd-Warshall provides the shortest distance between every pair of vertices, whereas Bellman-Ford focuses on a single source and handles negative weight edges.'
    }
  ],

  'Object-Oriented Programming': [
    {
      type: 'mcq',
      difficulty: 'easy',
      question: 'Which OOP principle is demonstrated when an internal implementation detail is hidden from external consumers, exposing only a public interface?',
      options: [
        'Encapsulation',
        'Polymorphism',
        'Inheritance',
        'Multiple Dispatch'
      ],
      correctAnswer: 'Encapsulation',
      explanation: 'Encapsulation bundles data and methods while restricting direct access to internal state through access modifiers (private, protected).'
    },
    {
      type: 'mcq',
      difficulty: 'medium',
      question: 'In SOLID principles, what does the Liskov Substitution Principle (LSP) dictate?',
      options: [
        'Objects of a superclass should be replaceable with objects of a subclass without altering the correctness or desirable properties of the program.',
        'Classes should be open for modification but closed for extension.',
        'High-level modules should depend directly on concrete low-level implementations.',
        'A class should have at least five distinct public responsibilities.'
      ],
      correctAnswer: 'Objects of a superclass should be replaceable with objects of a subclass without altering the correctness or desirable properties of the program.',
      explanation: 'LSP ensures derived classes fulfill the contracts of their base types without throwing unexpected exceptions or violating preconditions.'
    },
    {
      type: 'scenario',
      difficulty: 'hard',
      question: 'Why is composition often favored over class inheritance in modern object-oriented software engineering ("Favor Composition Over Inheritance")?',
      options: [
        'Composition creates loosely coupled systems where behaviors can be swapped or decorated dynamically at runtime, avoiding brittle deep class hierarchies.',
        'Inheritance is not supported in modern programming languages.',
        'Composition automatically converts classes into microservices.',
        'Inheritance consumes double the CPU registers at runtime.'
      ],
      correctAnswer: 'Composition creates loosely coupled systems where behaviors can be swapped or decorated dynamically at runtime, avoiding brittle deep class hierarchies.',
      explanation: 'Inheritance exposes subclasses to parent implementation details (fragile base class problem), whereas composition enables modular, testable dependencies.'
    }
  ],

  DBMS: [
    {
      type: 'mcq',
      difficulty: 'easy',
      question: 'In relational database theory, what does the ACID acronym stand for?',
      options: [
        'Atomicity, Consistency, Isolation, Durability',
        'Authentication, Caching, Indexing, Decryption',
        'Aggregation, Clustering, Ingestion, Distribution',
        'Asynchronous, Concurrency, Iteration, Deployment'
      ],
      correctAnswer: 'Atomicity, Consistency, Isolation, Durability',
      explanation: 'ACID properties guarantee reliable transaction processing in database management systems.'
    },
    {
      type: 'mcq',
      difficulty: 'medium',
      question: 'What is the primary condition required for a relation to satisfy Third Normal Form (3NF)?',
      options: [
        'It is in 2NF and contains no transitive dependencies (no non-key attribute depends on another non-key attribute).',
        'Every cell contains multiple comma-separated values.',
        'All attributes must be encrypted with RSA keys.',
        'The relation must have at least three primary keys.'
      ],
      correctAnswer: 'It is in 2NF and contains no transitive dependencies (no non-key attribute depends on another non-key attribute).',
      explanation: '3NF eliminates transitive functional dependencies, ensuring every non-prime attribute depends only on the primary candidate keys.'
    },
    {
      type: 'scenario',
      difficulty: 'hard',
      question: 'In distributed database systems, what does the CAP theorem postulate regarding partitions?',
      options: [
        'In the event of a network partition (P), a distributed system must choose between Consistency (C) and Availability (A).',
        'A database can achieve unlimited scalability without partitioning.',
        'Consistency is only possible in single-core processors.',
        'Availability is inversely proportional to database index count.'
      ],
      correctAnswer: 'In the event of a network partition (P), a distributed system must choose between Consistency (C) and Availability (A).',
      explanation: 'When network partitions occur, nodes cannot communicate; the system must either reject writes/reads (Consistency) or return stale data (Availability).'
    }
  ],

  'Operating Systems': [
    {
      type: 'mcq',
      difficulty: 'easy',
      question: 'What is the key difference between a process and a thread in modern operating systems?',
      options: [
        'A process has its own isolated virtual address space, whereas threads within the same process share code, heap, and file descriptors.',
        'Threads cannot execute on multi-core processors, while processes can.',
        'Processes share the same call stack, while threads have separate address spaces.',
        'Threads are managed strictly by the hardware motherboard without kernel knowledge.'
      ],
      correctAnswer: 'A process has its own isolated virtual address space, whereas threads within the same process share code, heap, and file descriptors.',
      explanation: 'Processes provide memory isolation with independent address spaces. Threads are lightweight execution units that share the parent process’s memory space.'
    },
    {
      type: 'mcq',
      difficulty: 'medium',
      question: 'What are the four Coffman conditions necessary for a deadlock to occur in an operating system?',
      options: [
        'Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.',
        'Segmentation, Paging, Virtual Memory, and Swapping.',
        'Read lock, Write lock, Shared lock, and Exclusive lock.',
        'Kernel mode, User mode, Interrupt handler, and System call.'
      ],
      correctAnswer: 'Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.',
      explanation: 'Deadlock can only arise if all four conditions hold simultaneously. Breaking any one of these conditions prevents deadlocks.'
    },
    {
      type: 'scenario',
      difficulty: 'hard',
      question: 'How does virtual memory paging translate a virtual address to a physical memory address in modern CPU architectures?',
      options: [
        'The CPU Memory Management Unit (MMU) uses Page Tables and a Translation Lookaside Buffer (TLB) cache to map virtual page numbers to physical page frames.',
        'Virtual addresses are directly wired to the BIOS ROM chip.',
        'The OS copies the entire hard drive to L1 cache on every cycle.',
        'The process executes memory translation inside user space via libc.'
      ],
      correctAnswer: 'The CPU Memory Management Unit (MMU) uses Page Tables and a Translation Lookaside Buffer (TLB) cache to map virtual page numbers to physical page frames.',
      explanation: 'The MMU checks the TLB for fast hardware page translation; on a TLB miss, it walks the multi-level page table hierarchy in memory.'
    }
  ],

  'Computer Networks': [
    {
      type: 'mcq',
      difficulty: 'easy',
      question: 'In the OSI 7-layer reference model, at which layer do protocols like TCP and UDP operate?',
      options: [
        'Layer 4 (Transport Layer)',
        'Layer 3 (Network Layer)',
        'Layer 7 (Application Layer)',
        'Layer 2 (Data Link Layer)'
      ],
      correctAnswer: 'Layer 4 (Transport Layer)',
      explanation: 'Layer 4 handles end-to-end communication, port addressing, segmentation, and reliability (TCP) or connectionless datagram delivery (UDP).'
    },
    {
      type: 'mcq',
      difficulty: 'medium',
      question: 'What mechanism does TCP use to establish a reliable full-duplex connection between client and server?',
      options: [
        'Three-Way Handshake: SYN -> SYN-ACK -> ACK',
        'Two-Way Handshake: PING -> PONG',
        'Four-Way Handshake: FIN -> ACK -> FIN -> ACK',
        'Single UDP Broadcast packet'
      ],
      correctAnswer: 'Three-Way Handshake: SYN -> SYN-ACK -> ACK',
      explanation: 'The client sends SYN, the server responds with SYN-ACK, and the client acknowledges with ACK, synchronizing sequence numbers in both directions.'
    },
    {
      type: 'scenario',
      difficulty: 'hard',
      question: 'What is the key technological innovation of HTTP/3 compared to HTTP/2?',
      options: [
        'HTTP/3 replaces TCP with QUIC over UDP, eliminating head-of-line blocking at the transport layer and speeding up connection establishment.',
        'HTTP/3 eliminates JSON and forces all APIs to use XML-RPC.',
        'HTTP/3 operates exclusively without TLS encryption.',
        'HTTP/3 increases maximum packet size to 10 gigabytes.'
      ],
      correctAnswer: 'HTTP/3 replaces TCP with QUIC over UDP, eliminating head-of-line blocking at the transport layer and speeding up connection establishment.',
      explanation: 'HTTP/2 suffered from TCP head-of-line blocking when a single packet dropped. QUIC multiplexes streams independently over UDP with built-in TLS 1.3.'
    }
  ],

  // AI & Data Science
  'Artificial Intelligence': [
    {
      type: 'mcq',
      difficulty: 'easy',
      question: 'In artificial intelligence search algorithms, what distinguishes an informed (heuristic) search like A* from an uninformed search like Breadth-First Search (BFS)?',
      options: [
        'A* utilizes a heuristic function h(n) to estimate the cost from current state to the goal, prioritizing exploration of the most promising paths.',
        'A* guarantees finding a solution only if the graph has no cycles.',
        'BFS uses exponential backoff while A* uses linear decay.',
        'Informed search cannot be used on discrete grids.'
      ],
      correctAnswer: 'A* utilizes a heuristic function h(n) to estimate the cost from current state to the goal, prioritizing exploration of the most promising paths.',
      explanation: 'A* evaluates nodes using f(n) = g(n) + h(n), where g(n) is the exact path cost and h(n) is the admissible heuristic estimate to the target.'
    },
    {
      type: 'mcq',
      difficulty: 'medium',
      question: 'What is the role of the Minimax algorithm with Alpha-Beta pruning in two-player adversarial games?',
      options: [
        'It identifies optimal moves by assuming both players play rationally, pruning branches that cannot influence the final decision to halve exploration depth.',
        'It generates synthetic game assets using generative adversarial networks.',
        'It converts recursive trees into breadth-first queues.',
        'It randomly samples moves using Monte Carlo heuristics.'
      ],
      correctAnswer: 'It identifies optimal moves by assuming both players play rationally, pruning branches that cannot influence the final decision to halve exploration depth.',
      explanation: 'Alpha-Beta pruning discards subtrees that are mathematically proven to be worse than an already evaluated alternative, drastically improving performance.'
    },
    {
      type: 'scenario',
      difficulty: 'hard',
      question: 'In modern large language models, what is the core mechanism of the Transformer architecture introduced by Vaswani et al.?',
      options: [
        'Multi-Head Self-Attention, allowing tokens to dynamically attend to and weigh contextual relationships with all other tokens in parallel without recurrence.',
        'Recurrent feedback loops that process text strictly one character at a time.',
        'Convolutional filters applied across 3D pixel matrices.',
        'Hardcoded grammatical syntax trees stored in relational tables.'
      ],
      correctAnswer: 'Multi-Head Self-Attention, allowing tokens to dynamically attend to and weigh contextual relationships with all other tokens in parallel without recurrence.',
      explanation: 'Self-attention calculates Query, Key, and Value dot products across tokens simultaneously, capturing long-range dependencies efficiently.'
    }
  ],

  'Machine Learning': [
    {
      type: 'mcq',
      difficulty: 'easy',
      question: 'What is the fundamental difference between Supervised Learning and Unsupervised Learning?',
      options: [
        'Supervised learning trains on labeled input-output pairs to predict targets, whereas unsupervised learning discovers intrinsic patterns or clusters from unlabeled data.',
        'Supervised learning does not use mathematical optimization.',
        'Unsupervised learning can only be applied to image classification.',
        'Supervised learning requires quantum computing hardware.'
      ],
      correctAnswer: 'Supervised learning trains on labeled input-output pairs to predict targets, whereas unsupervised learning discovers intrinsic patterns or clusters from unlabeled data.',
      explanation: 'Supervised learning learns a mapping f(X) -> y using ground truth labels. Unsupervised learning analyzes structure in X without target labels.'
    },
    {
      type: 'mcq',
      difficulty: 'medium',
      question: 'In statistical modeling, how does the "bias-variance tradeoff" manifest when increasing model complexity?',
      options: [
        'Higher model complexity reduces training bias but increases variance, raising the risk of overfitting on unseen test data.',
        'Higher complexity increases both bias and variance simultaneously.',
        'Increasing complexity reduces both training error and test error to absolute zero.',
        'Bias and variance are mutually independent of model architecture.'
      ],
      correctAnswer: 'Higher model complexity reduces training bias but increases variance, raising the risk of overfitting on unseen test data.',
      explanation: 'Complex models fit training noise (high variance / low bias). Simpler models make stronger assumptions (high bias / low variance).'
    },
    {
      type: 'scenario',
      difficulty: 'hard',
      question: 'Why is Cross-Entropy Loss preferred over Mean Squared Error (MSE) when training neural network classifiers with softmax activation?',
      options: [
        'Cross-Entropy produces steep gradients when predictions are confidently wrong, preventing vanishing gradients and speeding up gradient descent convergence.',
        'MSE cannot be calculated on numerical arrays.',
        'Cross-Entropy forces model weights to remain strictly positive.',
        'MSE requires inverting a high-dimensional covariance matrix.'
      ],
      correctAnswer: 'Cross-Entropy produces steep gradients when predictions are confidently wrong, preventing vanishing gradients and speeding up gradient descent convergence.',
      explanation: 'When paired with Softmax/Sigmoid, cross-entropy loss gradient is proportional to (prediction - target), avoiding the saturated flat plateau of MSE.'
    }
  ],

  'Data Science': [
    {
      type: 'mcq',
      difficulty: 'easy',
      question: 'What is the difference between Mean, Median, and Mode when analyzing a skewed numerical distribution?',
      options: [
        'The Median is resistant to extreme outliers, whereas the Mean is pulled towards the long tail; the Mode is the most frequent observation.',
        'The Mean is always the middle value when sorted.',
        'The Median only applies to categorical text data.',
        'All three metrics are identical in any distribution.'
      ],
      correctAnswer: 'The Median is resistant to extreme outliers, whereas the Mean is pulled towards the long tail; the Mode is the most frequent observation.',
      explanation: 'The median represents the 50th percentile and is robust against skew and outliers, unlike the arithmetic mean.'
    },
    {
      type: 'mcq',
      difficulty: 'medium',
      question: 'Why should feature scaling (e.g., StandardScaler or MinMaxScaler) be fitted ONLY on training data before transforming test/validation sets?',
      options: [
        'To prevent data leakage, ensuring test evaluations accurately reflect generalization performance on unseen real-world data.',
        'Because test data cannot be converted into floating-point numbers.',
        'Feature scaling destroys categorical columns if applied to test sets.',
        'Scikit-learn raises a syntax error if fit_transform is called on test data.'
      ],
      correctAnswer: 'To prevent data leakage, ensuring test evaluations accurately reflect generalization performance on unseen real-world data.',
      explanation: 'Fitting scalers or imputers on the full dataset leaks information about the test set distribution into the training pipeline.'
    },
    {
      type: 'scenario',
      difficulty: 'hard',
      question: 'When evaluating an imbalanced fraud detection classifier where fraud accounts for 0.1% of transactions, why is Accuracy a misleading metric?',
      options: [
        'A trivial classifier predicting "No Fraud" for every transaction achieves 99.9% accuracy while detecting zero actual fraud cases; Precision, Recall, and PR-AUC are required.',
        'Accuracy cannot be calculated when sample size exceeds 1,000.',
        'Fraud cases have negative labels that confuse accuracy algorithms.',
        'Imbalanced classes invalidate cross-validation seeds.'
      ],
      correctAnswer: 'A trivial classifier predicting "No Fraud" for every transaction achieves 99.9% accuracy while detecting zero actual fraud cases; Precision, Recall, and PR-AUC are required.',
      explanation: 'In heavy class imbalance, high accuracy can conceal complete failure to detect minority target classes. Precision, Recall, and F1-score must be used.'
    }
  ],

  Pandas: [
    {
      type: 'mcq',
      difficulty: 'easy',
      question: 'In Pandas, what is the key difference between the DataFrame accessors .loc[] and .iloc[]?',
      options: [
        '.loc[] is label-based indexing (using index names/column names), while .iloc[] is integer position-based indexing (0 to length-1).',
        '.loc[] only works on Series, while .iloc[] works on DataFrames.',
        '.iloc[] is label-based, while .loc[] is integer-based.',
        '.loc[] automatically saves output to disk.'
      ],
      correctAnswer: '.loc[] is label-based indexing (using index names/column names), while .iloc[] is integer position-based indexing (0 to length-1).',
      explanation: '.loc indexes using row and column labels, while .iloc indexes by 0-based integer positions in memory.'
    },
    {
      type: 'output_prediction',
      difficulty: 'medium',
      question: 'What is the return type of df.groupby("department")["salary"].mean() in Pandas?',
      options: [
        'A Pandas Series indexed by unique department values with mean salary values.',
        'A Python dictionary.',
        'A 2D NumPy array.',
        'A single float representing total company average.'
      ],
      correctAnswer: 'A Pandas Series indexed by unique department values with mean salary values.',
      explanation: 'Applying an aggregation to a single selected column after groupby returns a Series indexed by the grouped categorical keys.'
    },
    {
      type: 'scenario',
      difficulty: 'hard',
      question: 'Why does using df.apply(axis=1) on a large DataFrame with millions of rows cause poor performance, and how should it be optimized?',
      options: [
        'apply(axis=1) iterates row-by-row in Python without C-level acceleration; it should be replaced with vectorized NumPy operations or Series expressions.',
        'apply(axis=1) converts all data into temporary CSV files on disk.',
        'apply(axis=1) triggers garbage collection on every cell.',
        'apply(axis=1) is deprecated in Pandas 2.0.'
      ],
      correctAnswer: 'apply(axis=1) iterates row-by-row in Python without C-level acceleration; it should be replaced with vectorized NumPy operations or Series expressions.',
      explanation: 'Row-wise apply creates a Series object per row, incurring heavy Python interpreter overhead. Vectorized operations run in compiled C/Fortran.'
    }
  ],

  NumPy: [
    {
      type: 'mcq',
      difficulty: 'easy',
      question: 'Why are NumPy ndarrays dramatically faster than standard Python lists for numerical computations?',
      options: [
        'NumPy arrays store elements contiguously in homogeneous C-type memory buffers, avoiding Python object pointer indirection and enabling SIMD vectorization.',
        'NumPy compiles Python code directly into assembly at import time.',
        'Standard Python lists are stored on disk instead of RAM.',
        'NumPy uses GPU processing by default for all array additions.'
      ],
      correctAnswer: 'NumPy arrays store elements contiguously in homogeneous C-type memory buffers, avoiding Python object pointer indirection and enabling SIMD vectorization.',
      explanation: 'Contiguous memory layout allows CPU caches and SIMD vector registers to process numbers in parallel without pointer unpacking.'
    },
    {
      type: 'output_prediction',
      difficulty: 'medium',
      question: 'What is the resulting shape of broadcasting an array of shape (4, 1) with an array of shape (1, 5) in NumPy?',
      options: [
        '(4, 5)',
        '(5, 4)',
        '(4, 1, 5)',
        'ValueError: shapes are incompatible'
      ],
      correctAnswer: '(4, 5)',
      explanation: 'NumPy compares dimensions from right to left. Dimension 1 stretches to match the other: (4, 1) and (1, 5) broadcast to (4, 5).'
    },
    {
      type: 'scenario',
      difficulty: 'hard',
      question: 'What is the difference between a view and a copy of a NumPy array when taking a slice (e.g., b = a[1:5])?',
      options: [
        'Slicing returns a view sharing the original memory buffer (mutating b also mutates a); an explicit .copy() allocates new memory.',
        'Slicing always creates a full deep copy in RAM.',
        'Views cannot be modified.',
        'Copies can only be made from 1-dimensional arrays.'
      ],
      correctAnswer: 'Slicing returns a view sharing the original memory buffer (mutating b also mutates a); an explicit .copy() allocates new memory.',
      explanation: 'NumPy slicing creates memory views without copying data for efficiency. Modifying the view mutates the underlying original array.'
    }
  ]
};

/**
 * Curated Coding Challenges for each Category & Skill
 */
export const CURATED_CODING_CHALLENGES = {
  // Programming Languages
  Python: [
    {
      difficulty: 'easy',
      problemStatement: 'Write a function `two_sum(nums, target)` that returns the 0-based indices of the two numbers in `nums` that add up to `target`. Assume exactly one solution exists.',
      inputDescription: 'nums: list of integers, target: integer',
      outputDescription: 'List of two integers [index1, index2] sorted in ascending order',
      examples: [
        { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' }
      ],
      constraints: ['2 <= len(nums) <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Exactly one valid answer exists'],
      starterCode: 'def two_sum(nums, target):\n    # Write your solution here\n    pass',
      testCases: [
        { input: JSON.stringify({ nums: [2, 7, 11, 15], target: 9 }), expectedOutput: JSON.stringify([0, 1]) },
        { input: JSON.stringify({ nums: [3, 2, 4], target: 6 }), expectedOutput: JSON.stringify([1, 2]) },
        { input: JSON.stringify({ nums: [3, 3], target: 6 }), expectedOutput: JSON.stringify([0, 1]) }
      ]
    },
    {
      difficulty: 'medium',
      problemStatement: 'Write a function `is_valid_parentheses(s)` that determines if the input string containing characters "(", ")", "{", "}", "[" and "]" has valid bracket pairing.',
      inputDescription: 's: string of bracket characters',
      outputDescription: 'Boolean: True if valid, False otherwise',
      examples: [
        { input: 's = "()[]{}"', output: 'True', explanation: 'All brackets open and close in correct order' },
        { input: 's = "(]"', output: 'False', explanation: 'Mismatched closing bracket' }
      ],
      constraints: ['1 <= len(s) <= 10^4', 's consists of parentheses only ()[]{}'],
      starterCode: 'def is_valid_parentheses(s):\n    # Write your solution here\n    pass',
      testCases: [
        { input: JSON.stringify({ s: '()' }), expectedOutput: 'true' },
        { input: JSON.stringify({ s: '()[]{}' }), expectedOutput: 'true' },
        { input: JSON.stringify({ s: '(]' }), expectedOutput: 'false' },
        { input: JSON.stringify({ s: '([)]' }), expectedOutput: 'false' }
      ]
    }
  ],

  JavaScript: [
    {
      difficulty: 'easy',
      problemStatement: 'Write a function `reverseString(str)` that reverses a string in-place or returns the reversed string.',
      inputDescription: 'str: string to reverse',
      outputDescription: 'String reversed',
      examples: [
        { input: 'str = "hello"', output: '"olleh"', explanation: 'Reversed characters' }
      ],
      constraints: ['0 <= str.length <= 10^4'],
      starterCode: 'function reverseString(str) {\n  // Write your solution here\n  return str.split("").reverse().join("");\n}',
      testCases: [
        { input: JSON.stringify({ str: 'hello' }), expectedOutput: '"olleh"' },
        { input: JSON.stringify({ str: 'Nexus' }), expectedOutput: '"suxeN"' },
        { input: JSON.stringify({ str: '' }), expectedOutput: '""' }
      ]
    },
    {
      difficulty: 'medium',
      problemStatement: 'Write a function `groupAnagrams(strs)` that groups an array of strings that are anagrams of each other.',
      inputDescription: 'strs: array of strings',
      outputDescription: 'Array of arrays containing grouped anagram strings',
      examples: [
        { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["eat","tea","ate"],["tan","nat"],["bat"]]', explanation: 'Anagrams share character counts' }
      ],
      constraints: ['1 <= strs.length <= 10^4', '0 <= strs[i].length <= 100'],
      starterCode: 'function groupAnagrams(strs) {\n  const map = {};\n  for (const s of strs) {\n    const key = s.split("").sort().join("");\n    if (!map[key]) map[key] = [];\n    map[key].push(s);\n  }\n  return Object.values(map);\n}',
      testCases: [
        { input: JSON.stringify({ strs: ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'] }), expectedOutput: '[["eat","tea","ate"],["tan","nat"],["bat"]]' },
        { input: JSON.stringify({ strs: [''] }), expectedOutput: '[[""]]' },
        { input: JSON.stringify({ strs: ['a'] }), expectedOutput: '[["a"]]' }
      ]
    }
  ],

  TypeScript: [
    {
      difficulty: 'easy',
      problemStatement: 'Implement a function `filterEvenNumbers(nums: number[]): number[]` that filters out all odd numbers from an array.',
      inputDescription: 'nums: array of numbers',
      outputDescription: 'Filtered array containing only even numbers',
      examples: [
        { input: 'nums = [1, 2, 3, 4, 5, 6]', output: '[2, 4, 6]', explanation: 'Even numbers divisible by 2' }
      ],
      constraints: ['0 <= nums.length <= 10^5'],
      starterCode: 'function filterEvenNumbers(nums: number[]): number[] {\n  return nums.filter(n => n % 2 === 0);\n}',
      testCases: [
        { input: JSON.stringify({ nums: [1, 2, 3, 4, 5, 6] }), expectedOutput: JSON.stringify([2, 4, 6]) },
        { input: JSON.stringify({ nums: [1, 3, 5] }), expectedOutput: JSON.stringify([]) },
        { input: JSON.stringify({ nums: [2, 4, 8] }), expectedOutput: JSON.stringify([2, 4, 8]) }
      ]
    }
  ],

  'Data Structures & Algorithms': [
    {
      difficulty: 'easy',
      problemStatement: 'Write a function `maxSubArray(nums)` that finds the contiguous subarray with the largest sum and returns its sum (Kadane’s Algorithm).',
      inputDescription: 'nums: array of integers',
      outputDescription: 'Integer: maximum subarray sum',
      examples: [
        { input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]', output: '6', explanation: 'The subarray [4, -1, 2, 1] has the largest sum = 6' }
      ],
      constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
      starterCode: 'function maxSubArray(nums) {\n  let maxSum = nums[0];\n  let currentSum = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    currentSum = Math.max(nums[i], currentSum + nums[i]);\n    maxSum = Math.max(maxSum, currentSum);\n  }\n  return maxSum;\n}',
      testCases: [
        { input: JSON.stringify({ nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] }), expectedOutput: '6' },
        { input: JSON.stringify({ nums: [1] }), expectedOutput: '1' },
        { input: JSON.stringify({ nums: [5, 4, -1, 7, 8] }), expectedOutput: '23' }
      ]
    },
    {
      difficulty: 'medium',
      problemStatement: 'Write a function `lengthOfLongestSubstring(s)` that finds the length of the longest substring without repeating characters (Sliding Window technique).',
      inputDescription: 's: string',
      outputDescription: 'Integer: maximum length of substring with unique characters',
      examples: [
        { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' }
      ],
      constraints: ['0 <= s.length <= 5 * 10^4'],
      starterCode: 'function lengthOfLongestSubstring(s) {\n  let maxLen = 0;\n  let start = 0;\n  const seen = new Map();\n  for (let end = 0; end < s.length; end++) {\n    const char = s[end];\n    if (seen.has(char) && seen.get(char) >= start) {\n      start = seen.get(char) + 1;\n    }\n    seen.set(char, end);\n    maxLen = Math.max(maxLen, end - start + 1);\n  }\n  return maxLen;\n}',
      testCases: [
        { input: JSON.stringify({ s: 'abcabcbb' }), expectedOutput: '3' },
        { input: JSON.stringify({ s: 'bbbbb' }), expectedOutput: '1' },
        { input: JSON.stringify({ s: 'pwwkew' }), expectedOutput: '3' }
      ]
    }
  ],

  SQL: [
    {
      difficulty: 'medium',
      problemStatement: 'Write a SQL query to find the second highest salary from an `Employee` table. If there is no second highest salary, return NULL.',
      inputDescription: 'Table: Employee (id INT, salary INT)',
      outputDescription: 'Single column SecondHighestSalary',
      examples: [
        { input: 'Employee: [(1, 100), (2, 200), (3, 300)]', output: '200', explanation: '200 is the second highest distinct salary' }
      ],
      constraints: ['Standard ANSI SQL compatible'],
      starterCode: 'SELECT MAX(salary) AS SecondHighestSalary\nFROM Employee\nWHERE salary < (SELECT MAX(salary) FROM Employee);',
      testCases: [
        { input: 'SELECT SecondHighestSalary', expectedOutput: 'MATCH_QUERY' }
      ]
    }
  ]
};

/**
 * Procedural generator for coding challenges when bank items are exhausted
 */
/**
 * Procedural generator for coding challenges when bank items are exhausted.
 * Contains 25 distinct algorithmic templates to support multiple consecutive sessions.
 */
export function generateProceduralCodingChallenge(skill, difficulty = 'medium', index = 1) {
  const problems = [
    {
      title: `Array Element Frequency Counter in ${skill}`,
      statement: `Implement an algorithmic solution in ${skill} that takes an array of values and returns an object or map recording the frequency count of each unique element.`,
      input: 'items: array of numbers or strings',
      output: 'Record/Map of element frequencies',
      starter: `// Solution in ${skill}\nfunction countFrequencies(items) {\n  const freq = {};\n  for (const item of items) {\n    freq[item] = (freq[item] || 0) + 1;\n  }\n  return freq;\n}`,
      testCases: [
        { input: JSON.stringify({ items: ['a', 'b', 'a', 'c'] }), expectedOutput: JSON.stringify({ a: 2, b: 1, c: 1 }) },
        { input: JSON.stringify({ items: [1, 2, 2, 3] }), expectedOutput: JSON.stringify({ 1: 1, 2: 2, 3: 1 }) }
      ]
    },
    {
      title: `Sliding Window Maximum Sum in ${skill}`,
      statement: `Write a function in ${skill} that takes an array of integers and an integer k, and computes the maximum sum of any contiguous subarray of size k.`,
      input: 'nums: array of integers, k: window size integer',
      output: 'Integer maximum window sum',
      starter: `// Solution in ${skill}\nfunction maxSubarraySumK(nums, k) {\n  if (nums.length < k) return 0;\n  let windowSum = 0;\n  for (let i = 0; i < k; i++) windowSum += nums[i];\n  let maxSum = windowSum;\n  for (let i = k; i < nums.length; i++) {\n    windowSum += nums[i] - nums[i - k];\n    maxSum = Math.max(maxSum, windowSum);\n  }\n  return maxSum;\n}`,
      testCases: [
        { input: JSON.stringify({ nums: [2, 1, 5, 1, 3, 2], k: 3 }), expectedOutput: '9' },
        { input: JSON.stringify({ nums: [1, 2, 3], k: 1 }), expectedOutput: '3' }
      ]
    },
    {
      title: `Binary Search Implementation in ${skill}`,
      statement: `Implement an iterative binary search in ${skill} that searches for a target value in a sorted array and returns its index, or -1 if not found.`,
      input: 'nums: sorted integer array, target: integer',
      output: 'Index of target or -1',
      starter: `// Solution in ${skill}\nfunction binarySearch(nums, target) {\n  let left = 0, right = nums.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}`,
      testCases: [
        { input: JSON.stringify({ nums: [1, 3, 5, 7, 9], target: 5 }), expectedOutput: '2' },
        { input: JSON.stringify({ nums: [1, 3, 5, 7, 9], target: 4 }), expectedOutput: '-1' }
      ]
    },
    {
      title: `Two Sum Pair Finder in ${skill}`,
      statement: `Write a function that returns the indices of two elements in nums that sum to target using a single pass hash map in ${skill}.`,
      input: 'nums: integer array, target: integer',
      output: 'Array of two indices [i, j]',
      starter: `// Solution in ${skill}\nfunction twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
      testCases: [
        { input: JSON.stringify({ nums: [2, 7, 11, 15], target: 9 }), expectedOutput: JSON.stringify([0, 1]) },
        { input: JSON.stringify({ nums: [3, 2, 4], target: 6 }), expectedOutput: JSON.stringify([1, 2]) }
      ]
    },
    {
      title: `Palindrome String Validator in ${skill}`,
      statement: `Write a function that checks if a string is a palindrome, ignoring non-alphanumeric characters and casing in ${skill}.`,
      input: 's: string',
      output: 'Boolean: true if palindrome, false otherwise',
      starter: `// Solution in ${skill}\nfunction isPalindrome(s) {\n  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n  return clean === clean.split('').reverse().join('');\n}`,
      testCases: [
        { input: JSON.stringify({ s: 'A man, a plan, a canal: Panama' }), expectedOutput: 'true' },
        { input: JSON.stringify({ s: 'race a car' }), expectedOutput: 'false' }
      ]
    },
    {
      title: `Remove Duplicates from Sorted Array in ${skill}`,
      statement: `Implement a function that removes duplicates in-place from a sorted array and returns the number of unique elements in ${skill}.`,
      input: 'nums: sorted array of integers',
      output: 'Integer count of unique elements',
      starter: `// Solution in ${skill}\nfunction removeDuplicates(nums) {\n  if (nums.length === 0) return 0;\n  let i = 0;\n  for (let j = 1; j < nums.length; j++) {\n    if (nums[j] !== nums[i]) {\n      i++;\n      nums[i] = nums[j];\n    }\n  }\n  return i + 1;\n}`,
      testCases: [
        { input: JSON.stringify({ nums: [1, 1, 2] }), expectedOutput: '2' },
        { input: JSON.stringify({ nums: [0, 0, 1, 1, 1, 2, 2, 3, 3, 4] }), expectedOutput: '5' }
      ]
    },
    {
      title: `Prefix Sum Range Query in ${skill}`,
      statement: `Compute the sum of elements between indices left and right inclusive in constant time after preprocessing in ${skill}.`,
      input: 'nums: array of numbers, left: integer, right: integer',
      output: 'Integer sum',
      starter: `// Solution in ${skill}\nfunction rangeSum(nums, left, right) {\n  const prefix = [0];\n  for (let i = 0; i < nums.length; i++) prefix.push(prefix[i] + nums[i]);\n  return prefix[right + 1] - prefix[left];\n}`,
      testCases: [
        { input: JSON.stringify({ nums: [-2, 0, 3, -5, 2, -1], left: 0, right: 2 }), expectedOutput: '1' },
        { input: JSON.stringify({ nums: [-2, 0, 3, -5, 2, -1], left: 2, right: 5 }), expectedOutput: '-1' }
      ]
    },
    {
      title: `Move Zeroes to End in ${skill}`,
      statement: `Given an integer array nums, move all 0's to the end while maintaining the relative order of the non-zero elements in ${skill}.`,
      input: 'nums: array of integers',
      output: 'Array with zeroes shifted to end',
      starter: `// Solution in ${skill}\nfunction moveZeroes(nums) {\n  let nonZero = 0;\n  for (let i = 0; i < nums.length; i++) {\n    if (nums[i] !== 0) {\n      const temp = nums[nonZero];\n      nums[nonZero] = nums[i];\n      nums[i] = temp;\n      nonZero++;\n    }\n  }\n  return nums;\n}`,
      testCases: [
        { input: JSON.stringify({ nums: [0, 1, 0, 3, 12] }), expectedOutput: JSON.stringify([1, 3, 12, 0, 0]) },
        { input: JSON.stringify({ nums: [0] }), expectedOutput: JSON.stringify([0]) }
      ]
    },
    {
      title: `First Unique Character Finder in ${skill}`,
      statement: `Find the first non-repeating character in a string and return its 0-based index. If it does not exist, return -1 in ${skill}.`,
      input: 's: string',
      output: 'Integer index or -1',
      starter: `// Solution in ${skill}\nfunction firstUniqChar(s) {\n  const count = {};\n  for (const c of s) count[c] = (count[c] || 0) + 1;\n  for (let i = 0; i < s.length; i++) {\n    if (count[s[i]] === 1) return i;\n  }\n  return -1;\n}`,
      testCases: [
        { input: JSON.stringify({ s: 'leetcode' }), expectedOutput: '0' },
        { input: JSON.stringify({ s: 'loveleetcode' }), expectedOutput: '2' },
        { input: JSON.stringify({ s: 'aabb' }), expectedOutput: '-1' }
      ]
    },
    {
      title: `Product of Array Except Self in ${skill}`,
      statement: `Given an integer array nums, return an array answer such that answer[i] is equal to the product of all elements of nums except nums[i] in ${skill}.`,
      input: 'nums: array of integers',
      output: 'Array of integer products',
      starter: `// Solution in ${skill}\nfunction productExceptSelf(nums) {\n  const res = new Array(nums.length).fill(1);\n  let left = 1;\n  for (let i = 0; i < nums.length; i++) {\n    res[i] = left;\n    left *= nums[i];\n  }\n  let right = 1;\n  for (let i = nums.length - 1; i >= 0; i--) {\n    res[i] *= right;\n    right *= nums[i];\n  }\n  return res;\n}`,
      testCases: [
        { input: JSON.stringify({ nums: [1, 2, 3, 4] }), expectedOutput: JSON.stringify([24, 12, 8, 6]) },
        { input: JSON.stringify({ nums: [-1, 1, 0, -3, 3] }), expectedOutput: JSON.stringify([0, 0, 9, 0, 0]) }
      ]
    },
    {
      title: `Maximum Subarray Sum (Kadane) in ${skill}`,
      statement: `Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum in ${skill}.`,
      input: 'nums: array of integers',
      output: 'Integer maximum sum',
      starter: `// Solution in ${skill}\nfunction maxSubArray(nums) {\n  let maxS = nums[0], curr = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    curr = Math.max(nums[i], curr + nums[i]);\n    maxS = Math.max(maxS, curr);\n  }\n  return maxS;\n}`,
      testCases: [
        { input: JSON.stringify({ nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] }), expectedOutput: '6' },
        { input: JSON.stringify({ nums: [1] }), expectedOutput: '1' }
      ]
    },
    {
      title: `Climbing Stairs Ways Counter in ${skill}`,
      statement: `You are climbing a staircase that takes n steps to reach the top. Each time you can climb 1 or 2 steps. How many distinct ways can you climb to the top in ${skill}?`,
      input: 'n: integer positive number of steps',
      output: 'Integer distinct combinations',
      starter: `// Solution in ${skill}\nfunction climbStairs(n) {\n  if (n <= 2) return n;\n  let a = 1, b = 2;\n  for (let i = 3; i <= n; i++) {\n    const c = a + b;\n    a = b;\n    b = c;\n  }\n  return b;\n}`,
      testCases: [
        { input: JSON.stringify({ n: 2 }), expectedOutput: '2' },
        { input: JSON.stringify({ n: 3 }), expectedOutput: '3' },
        { input: JSON.stringify({ n: 5 }), expectedOutput: '8' }
      ]
    },
    {
      title: `Find Minimum in Rotated Sorted Array in ${skill}`,
      statement: `Find the minimum element in a sorted rotated array in O(log n) time complexity in ${skill}.`,
      input: 'nums: rotated sorted integer array',
      output: 'Integer minimum element',
      starter: `// Solution in ${skill}\nfunction findMin(nums) {\n  let l = 0, r = nums.length - 1;\n  while (l < r) {\n    const m = Math.floor((l + r) / 2);\n    if (nums[m] > nums[r]) l = m + 1;\n    else r = m;\n  }\n  return nums[l];\n}`,
      testCases: [
        { input: JSON.stringify({ nums: [3, 4, 5, 1, 2] }), expectedOutput: '1' },
        { input: JSON.stringify({ nums: [4, 5, 6, 7, 0, 1, 2] }), expectedOutput: '0' }
      ]
    },
    {
      title: `Container With Most Water in ${skill}`,
      statement: `Given an array height of length n, find two lines that together with the x-axis form a container, such that the container contains the most water in ${skill}.`,
      input: 'height: integer array',
      output: 'Integer maximum area',
      starter: `// Solution in ${skill}\nfunction maxArea(height) {\n  let l = 0, r = height.length - 1, maxA = 0;\n  while (l < r) {\n    const area = Math.min(height[l], height[r]) * (r - l);\n    maxA = Math.max(maxA, area);\n    if (height[l] < height[r]) l++;\n    else r--;\n  }\n  return maxA;\n}`,
      testCases: [
        { input: JSON.stringify({ height: [1, 8, 6, 2, 5, 4, 8, 3, 7] }), expectedOutput: '49' },
        { input: JSON.stringify({ height: [1, 1] }), expectedOutput: '1' }
      ]
    },
    {
      title: `Intersection of Two Arrays in ${skill}`,
      statement: `Given two integer arrays nums1 and nums2, return an array of their unique intersection in ${skill}.`,
      input: 'nums1: array of integers, nums2: array of integers',
      output: 'Array of unique intersecting integers',
      starter: `// Solution in ${skill}\nfunction intersection(nums1, nums2) {\n  const set1 = new Set(nums1);\n  const result = new Set();\n  for (const n of nums2) {\n    if (set1.has(n)) result.add(n);\n  }\n  return Array.from(result);\n}`,
      testCases: [
        { input: JSON.stringify({ nums1: [1, 2, 2, 1], nums2: [2, 2] }), expectedOutput: JSON.stringify([2]) },
        { input: JSON.stringify({ nums1: [4, 9, 5], nums2: [9, 4, 9, 8, 4] }), expectedOutput: JSON.stringify([9, 4]) }
      ]
    }
  ];

  const p = problems[(index - 1) % problems.length];
  return {
    type: 'code_writing',
    mode: 'coding_challenges',
    question: `${p.title} - Session Variant #${index}`,
    problemStatement: p.statement,
    inputDescription: p.input,
    outputDescription: p.output,
    examples: [{ input: 'Standard inputs', output: 'Expected result', explanation: `Algorithmic execution in ${skill}` }],
    constraints: ['Time Complexity: O(n) or O(log n)', 'Space Complexity: O(n) or O(1)'],
    starterCode: p.starter,
    testCases: p.testCases,
    difficulty,
    skill,
    explanation: `Optimal solution for ${p.title} utilizing core algorithmic paradigms in ${skill}.`
  };
}