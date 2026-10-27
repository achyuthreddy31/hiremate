/**
 * Curated Practice Bank for HireMate Nexus
 * Contains categorized technical domains, skills, comprehensive question pools, and coding challenges.
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
  Beginner: 'easy',
  Intermediate: 'medium',
  Advanced: 'hard'
};

export const REVERSE_DIFFICULTY_MAP = {
  easy: 'Beginner',
  medium: 'Intermediate',
  hard: 'Advanced'
};

/**
 * Curated MCQ Bank across 26 technical skills (15 questions each = 390 canonical questions).
 */
export const CURATED_MCQ_BANK = {
  "Python": [
    {
      "type": "output_prediction",
      "difficulty": "easy",
      "question": "What is the output of the following Python slice operation on a list?",
      "codeSnippet": "nums = [10, 20, 30, 40, 50]\nprint(nums[1:4:2])",
      "options": [
        "[20, 40]",
        "[20, 30, 40]",
        "[10, 30]",
        "[20]"
      ],
      "correctAnswer": "[20, 40]",
      "explanation": "Slicing syntax is [start:stop:step]. Index 1 is 20, step 2 skips index 2 (30) and includes index 3 (40). Index 4 is exclusive."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What is the fundamental difference between a Python list and a tuple?",
      "options": [
        "Lists are mutable and defined with square brackets []; tuples are immutable and defined with parentheses ().",
        "Tuples can store only numbers, whereas lists can store any object type.",
        "Lists cannot be nested inside other lists.",
        "Tuples require an explicit compile step before execution."
      ],
      "correctAnswer": "Lists are mutable and defined with square brackets []; tuples are immutable and defined with parentheses ().",
      "explanation": "Tuples cannot be modified after creation (immutable), allowing them to be used as dictionary keys when hashable, whereas lists are mutable."
    },
    {
      "type": "output_prediction",
      "difficulty": "easy",
      "question": "What will be printed by the following code using a list comprehension with a condition?",
      "codeSnippet": "evens = [x * 2 for x in range(5) if x % 2 == 0]\nprint(evens)",
      "options": [
        "[0, 4, 8]",
        "[0, 2, 4]",
        "[4, 8]",
        "[0, 2, 4, 6, 8]"
      ],
      "correctAnswer": "[0, 4, 8]",
      "explanation": "range(5) produces 0, 1, 2, 3, 4. The condition x % 2 == 0 selects 0, 2, 4. Multiplying each by 2 yields [0, 4, 8]."
    },
    {
      "type": "code_reading",
      "difficulty": "easy",
      "question": "What does the dict.get(key, default) method do if key does not exist in the dictionary?",
      "options": [
        "Returns the default value provided without raising a KeyError.",
        "Raises a KeyError immediately.",
        "Adds the key to the dictionary with the default value.",
        "Returns None and deletes the dictionary."
      ],
      "correctAnswer": "Returns the default value provided without raising a KeyError.",
      "explanation": "dict.get(key, default) safely retrieves a key, returning the fallback default (or None) if absent, avoiding KeyError."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "In Python, what is the purpose of the `pass` statement?",
      "options": [
        "It serves as a syntactic null statement or placeholder where code is syntactically required but no action is taken.",
        "It terminates the current loop immediately like break.",
        "It skips the current iteration and advances to the next loop pass like continue.",
        "It passes an exception to the outer caller scope."
      ],
      "correctAnswer": "It serves as a syntactic null statement or placeholder where code is syntactically required but no action is taken.",
      "explanation": "pass is a no-op placeholder used in empty functions, classes, or conditional branches where Python syntax requires a block body."
    },
    {
      "type": "mcq",
      "difficulty": "medium",
      "question": "In Python CPython, what is the role and consequence of the Global Interpreter Lock (GIL)?",
      "options": [
        "A mutex that protects access to Python objects, preventing multiple native threads from executing Python bytecodes simultaneously in one process.",
        "A sandboxing mechanism preventing untrusted code from modifying disk files.",
        "A just-in-time compiler feature that compiles loops to machine code.",
        "A database lock used by SQLite when multi-threading queries."
      ],
      "correctAnswer": "A mutex that protects access to Python objects, preventing multiple native threads from executing Python bytecodes simultaneously in one process.",
      "explanation": "The GIL synchronizes memory management in CPython, restricting bytecode execution to one native thread per process at a time."
    },
    {
      "type": "debugging",
      "difficulty": "medium",
      "question": "Why does defining a default argument as a mutable list in a Python function create unexpected state persistence across calls?",
      "codeSnippet": "def add_item(item, basket=[]):\n    basket.append(item)\n    return basket",
      "options": [
        "Default argument expressions are evaluated once when the function definition is executed, binding the same list object to all subsequent calls.",
        "Python variables declared without self are allocated in global registers.",
        "Lists in Python cannot be passed into function signatures by reference.",
        "The function scope is recompiled on every invocation."
      ],
      "correctAnswer": "Default argument expressions are evaluated once when the function definition is executed, binding the same list object to all subsequent calls.",
      "explanation": "In Python, default arguments are evaluated only once at definition time. The list is mutated in-place across all invocations sharing the default."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "Why are generators preferred over lists when processing huge datasets that exceed available RAM in Python?",
      "options": [
        "Generators yield elements lazily one at a time on demand, maintaining O(1) memory consumption instead of allocating the full collection in memory.",
        "Generators run in C++ threads automatically.",
        "Generators compress data using gzip in memory.",
        "Generators bypass Python garbage collection entirely."
      ],
      "correctAnswer": "Generators yield elements lazily one at a time on demand, maintaining O(1) memory consumption instead of allocating the full collection in memory.",
      "explanation": "Generator functions use yield to produce values on-the-fly, retaining only current execution frame state rather than buffering all items in memory."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "In Python decorators, why is @functools.wraps(fn) routinely applied to the inner wrapper function?",
      "options": [
        "It preserves the original function metadata, such as __name__, __doc__, and module annotations.",
        "It converts synchronous functions into asynchronous coroutines.",
        "It encrypts the bytecode to prevent reverse-engineering.",
        "It caches function outputs like memoization."
      ],
      "correctAnswer": "It preserves the original function metadata, such as __name__, __doc__, and module annotations.",
      "explanation": "Without @functools.wraps, decorated functions take on the wrapper function name and docstring, confounding introspection and debugging tools."
    },
    {
      "type": "debugging",
      "difficulty": "medium",
      "question": "What is the distinction between `is` and `==` in Python?",
      "options": [
        "`is` checks identity (referencing the exact same object in memory, id(a) == id(b)), while `==` checks value equality.",
        "`==` checks memory addresses, whereas `is` compares type definitions.",
        "`is` is only valid for boolean expressions.",
        "There is no distinction; they are interchangeable aliases."
      ],
      "correctAnswer": "`is` checks identity (referencing the exact same object in memory, id(a) == id(b)), while `==` checks value equality.",
      "explanation": "`is` verifies that two identifiers point to the same memory address, whereas `==` invokes the __eq__ method to compare values."
    },
    {
      "type": "code_reading",
      "difficulty": "hard",
      "question": "What does the __enter__ and __exit__ protocol enable when creating custom Python classes?",
      "options": [
        "Context manager support, enabling resource allocation and deterministic cleanup using the \"with\" statement.",
        "Multi-threaded locking using the threading.Thread superclass.",
        "Custom serialization for the pickle module.",
        "Automatic operator overloading for logical conjunction."
      ],
      "correctAnswer": "Context manager support, enabling resource allocation and deterministic cleanup using the \"with\" statement.",
      "explanation": "The context management protocol (__enter__ and __exit__) guarantees that setup and teardown code run deterministically, even if exceptions are raised."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "How does Python determine method resolution in multiple inheritance hierarchies?",
      "options": [
        "Using the C3 Linearization algorithm (Method Resolution Order, MRO), accessible via Class.__mro__.",
        "Depth-first search traversing the leftmost branch until bottoming out.",
        "Random selection based on class hash keys.",
        "By order of alphabetical method names."
      ],
      "correctAnswer": "Using the C3 Linearization algorithm (Method Resolution Order, MRO), accessible via Class.__mro__.",
      "explanation": "Python uses C3 linearization to construct a consistent, monotonic MRO that preserves local precedence order and monotonic inheritance."
    },
    {
      "type": "debugging",
      "difficulty": "hard",
      "question": "What is the risk of using `copy.copy()` instead of `copy.deepcopy()` on nested data structures in Python?",
      "options": [
        "Shallow copy duplicates the outer container but copies references to nested objects, meaning mutations to inner objects affect both copies.",
        "Shallow copy destroys the original data structure.",
        "Shallow copy cannot copy dictionaries.",
        "Deep copy converts all numbers into strings."
      ],
      "correctAnswer": "Shallow copy duplicates the outer container but copies references to nested objects, meaning mutations to inner objects affect both copies.",
      "explanation": "A shallow copy constructs a new compound object and then inserts references into it to the objects found in the original, leaving nested structures shared."
    },
    {
      "type": "mcq",
      "difficulty": "hard",
      "question": "In Python, what is the primary role of a metaclass (inheriting from `type`)?",
      "options": [
        "A class of a class that defines how classes themselves are constructed, instantiated, and validated at class creation time.",
        "A class used exclusively for unit test mocking.",
        "A binary compilation tool for Cython extensions.",
        "A database ORM model mapping."
      ],
      "correctAnswer": "A class of a class that defines how classes themselves are constructed, instantiated, and validated at class creation time.",
      "explanation": "Metaclasses intercept class creation (__new__ and __init__ on type), allowing dynamic modification, registry, or validation of class definitions."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "How does asyncio achieve high-concurrency I/O in Python without multi-threading?",
      "options": [
        "A single-threaded cooperative event loop multiplexes OS-level non-blocking sockets using epoll/kqueue, switching coroutines at `await` yield points.",
        "It forks a separate OS process for every network request.",
        "It relies on CPU hardware hyperthreading registers directly.",
        "It disables the Global Interpreter Lock using bytecode modification."
      ],
      "correctAnswer": "A single-threaded cooperative event loop multiplexes OS-level non-blocking sockets using epoll/kqueue, switching coroutines at `await` yield points.",
      "explanation": "asyncio relies on cooperative multitasking: coroutines yield execution to the event loop at await statements while waiting for I/O readiness."
    }
  ],
  "Java": [
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "In Java, what is the key difference between String, StringBuilder, and StringBuffer?",
      "options": [
        "String is immutable; StringBuilder is mutable and not thread-safe; StringBuffer is mutable and thread-safe (synchronized).",
        "String and StringBuilder are identical, while StringBuffer is used only for file I/O.",
        "StringBuilder is immutable, while String is mutable.",
        "StringBuffer cannot be instantiated directly in Java 17+."
      ],
      "correctAnswer": "String is immutable; StringBuilder is mutable and not thread-safe; StringBuffer is mutable and thread-safe (synchronized).",
      "explanation": "String literals are immutable in the pool. StringBuilder provides faster un-synchronized character buffer mutations, whereas StringBuffer synchronizes method calls."
    },
    {
      "type": "output_prediction",
      "difficulty": "easy",
      "question": "What is the output of the following Java expression comparing primitive wrapper objects?",
      "codeSnippet": "Integer a = 100;\nInteger b = 100;\nSystem.out.println(a == b);",
      "options": [
        "true",
        "false",
        "Compilation Error",
        "NullPointerException"
      ],
      "correctAnswer": "true",
      "explanation": "Java caches Integer objects in the range -128 to 127. Values within this range share the same cached object reference in memory, making == true."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "In Java, which access modifier allows access within the same package and by subclasses in other packages?",
      "options": [
        "protected",
        "default (package-private)",
        "private",
        "public"
      ],
      "correctAnswer": "protected",
      "explanation": "The protected modifier allows member access to subclasses anywhere (even in different packages) as well as any class within the same package."
    },
    {
      "type": "code_reading",
      "difficulty": "easy",
      "question": "What is the purpose of the `final` keyword when applied to a class in Java?",
      "options": [
        "It prevents the class from being extended or subclassed.",
        "It prevents any instances of the class from being instantiated.",
        "It makes all fields in the class immutable automatically.",
        "It forces the JVM to execute the class methods synchronously."
      ],
      "correctAnswer": "It prevents the class from being extended or subclassed.",
      "explanation": "Marking a class final prevents inheritance (e.g., java.lang.String is final to preserve immutability and security guarantees)."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What is the root superclass of all classes in the Java programming language?",
      "options": [
        "java.lang.Object",
        "java.lang.Class",
        "java.lang.Root",
        "java.util.Collection"
      ],
      "correctAnswer": "java.lang.Object",
      "explanation": "Every class in Java implicitly or explicitly extends java.lang.Object, inheriting base methods like toString(), equals(), hashCode(), and getClass()."
    },
    {
      "type": "debugging",
      "difficulty": "medium",
      "question": "Why must hashCode() always be overridden whenever equals() is overridden in a Java class?",
      "options": [
        "To maintain the contract that equal objects according to equals() must return the same hashCode, ensuring correct behavior in hash-based collections like HashMap and HashSet.",
        "To allow the JVM to serialize the class into JSON.",
        "To prevent memory leaks in the Young Generation Garbage Collector.",
        "Java compiler refuses to compile classes if only equals() is implemented."
      ],
      "correctAnswer": "To maintain the contract that equal objects according to equals() must return the same hashCode, ensuring correct behavior in hash-based collections like HashMap and HashSet.",
      "explanation": "If two objects are equal by equals(), their hashCode values must match. Violating this causes HashMaps to store or fail to find elements in appropriate buckets."
    },
    {
      "type": "mcq",
      "difficulty": "medium",
      "question": "In Java exception handling, what is the difference between a checked exception and an unchecked exception?",
      "options": [
        "Checked exceptions (subclasses of Exception excluding RuntimeException) must be declared in throws or caught; unchecked exceptions (RuntimeException and Error) do not require explicit handling.",
        "Checked exceptions crash the JVM immediately; unchecked exceptions can always be recovered from.",
        "Unchecked exceptions are checked at compile-time by the Java compiler.",
        "Checked exceptions can only be thrown by native C code."
      ],
      "correctAnswer": "Checked exceptions (subclasses of Exception excluding RuntimeException) must be declared in throws or caught; unchecked exceptions (RuntimeException and Error) do not require explicit handling.",
      "explanation": "Checked exceptions enforce compile-time error recovery contracts. Unchecked exceptions denote programming flaws or unrecoverable conditions."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "In Java multithreading, what problem is solved by using `java.util.concurrent.ConcurrentHashMap` instead of `Collections.synchronizedMap()`?",
      "options": [
        "ConcurrentHashMap allows lock-free reads and segmented/bucket-level locking for writes, avoiding single global mutex bottlenecks under high concurrency.",
        "ConcurrentHashMap stores keys on disk to reduce JVM heap pressure.",
        "ConcurrentHashMap prevents null values from being passed to garbage collection.",
        "ConcurrentHashMap compiles queries into native machine code."
      ],
      "correctAnswer": "ConcurrentHashMap allows lock-free reads and segmented/bucket-level locking for writes, avoiding single global mutex bottlenecks under high concurrency.",
      "explanation": "synchronizedMap locks the entire map on every operation, creating severe contention, while ConcurrentHashMap uses CAS and bucket-level locks."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "In Java 8+ Streams, what is the distinction between an intermediate operation and a terminal operation?",
      "options": [
        "Intermediate operations (filter, map) are lazy and return a new Stream; terminal operations (collect, forEach, reduce) trigger the pipeline processing and produce a result.",
        "Intermediate operations execute immediately; terminal operations execute after a 10-second timer.",
        "Terminal operations can be chained together indefinitely.",
        "Intermediate operations can only process primitive integers."
      ],
      "correctAnswer": "Intermediate operations (filter, map) are lazy and return a new Stream; terminal operations (collect, forEach, reduce) trigger the pipeline processing and produce a result.",
      "explanation": "Stream pipelines are lazy: intermediate operations accumulate processing instructions and do not traverse elements until a terminal operation is invoked."
    },
    {
      "type": "debugging",
      "difficulty": "medium",
      "question": "What happens in Java if a thread encounters an unhandled exception inside a Runnable task submitted to an ExecutorService with `.submit()`?",
      "options": [
        "The exception is swallowed silently until caller invokes `.get()` on the returned Future, which unwraps it as an ExecutionException.",
        "The JVM process immediately terminates with code 1.",
        "The exception is printed to System.err automatically.",
        "The task is automatically retried 3 times."
      ],
      "correctAnswer": "The exception is swallowed silently until caller invokes `.get()` on the returned Future, which unwraps it as an ExecutionException.",
      "explanation": "ExecutorService.submit() encapsulates task exceptions inside the Future object. Calling future.get() throws ExecutionException wrapping the root cause."
    },
    {
      "type": "mcq",
      "difficulty": "hard",
      "question": "How does the Java Memory Model define the \"happens-before\" relationship with respect to volatile fields?",
      "options": [
        "A write to a volatile field happens-before every subsequent read of that same volatile field across threads, guaranteeing memory visibility.",
        "Volatile fields bypass memory entirely and operate inside CPU L1 cache.",
        "Volatile forces all objects in the heap to be marked immutable.",
        "A read of a volatile field automatically acquires a reentrant monitor lock."
      ],
      "correctAnswer": "A write to a volatile field happens-before every subsequent read of that same volatile field across threads, guaranteeing memory visibility.",
      "explanation": "Writing to volatile flushes changes to main memory and prevents instruction reordering around the write, guaranteeing that subsequent reads observe the latest value."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "How does Java Generics implement type safety without modifying the JVM bytecode instruction set?",
      "options": [
        "Type Erasure: the compiler validates types at compile-time and replaces generic type parameters with their raw bounds (e.g. Object), inserting synthetic casts.",
        "By generating duplicate class bytecode for every specialized type parameter like C++ templates.",
        "By running a secondary JVM verification thread during execution.",
        "By restricting generic collections to primitive types only."
      ],
      "correctAnswer": "Type Erasure: the compiler validates types at compile-time and replaces generic type parameters with their raw bounds (e.g. Object), inserting synthetic casts.",
      "explanation": "Java maintains backward compatibility with pre-generics bytecode via type erasure: generic arguments exist at compile-time and are erased to upper bounds in bytecode."
    },
    {
      "type": "debugging",
      "difficulty": "hard",
      "question": "What is the root cause of a java.lang.OutOfMemoryError: Metaspace in Java 8 and later?",
      "options": [
        "Continuous dynamic class loading without unloading (e.g., reflection proxies, bytecode enhancers, uncleaned classloader leaks) exceeding MaxMetaspaceSize.",
        "Allocating an integer array that exceeds available physical RAM.",
        "Exhausting thread stack memory due to infinite recursion.",
        "Having more than 10,000 active database connections."
      ],
      "correctAnswer": "Continuous dynamic class loading without unloading (e.g., reflection proxies, bytecode enhancers, uncleaned classloader leaks) exceeding MaxMetaspaceSize.",
      "explanation": "Metaspace stores class metadata in native off-heap memory. Leaking ClassLoader references prevents loaded classes from being garbage collected, exhausting Metaspace."
    },
    {
      "type": "code_reading",
      "difficulty": "hard",
      "question": "In Java concurrent programming, what is the distinction between ReentrantLock and the synchronized keyword?",
      "options": [
        "ReentrantLock provides advanced capabilities like timed lock acquisition (tryLock), interruptible lock waiting, and fair locking policies, whereas synchronized is an intrinsic block monitor.",
        "ReentrantLock cannot be used in multithreaded programs.",
        "synchronized is faster because it bypasses OS kernel locks entirely.",
        "ReentrantLock locks the entire JVM rather than a specific object."
      ],
      "correctAnswer": "ReentrantLock provides advanced capabilities like timed lock acquisition (tryLock), interruptible lock waiting, and fair locking policies, whereas synchronized is an intrinsic block monitor.",
      "explanation": "ReentrantLock offers flexible lock acquisition patterns (tryLock with timeout, lockInterruptibly, Condition variables) beyond the syntactic boundaries of synchronized blocks."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "How does the G1 (Garbage-First) Garbage Collector achieve predictable pause times in large Java heaps?",
      "options": [
        "It partitions the heap into equal-sized virtual regions and dynamically prioritizes collecting regions with the most reclaimable garbage first within a target pause time budget.",
        "It stops garbage collection completely when user traffic exceeds 1,000 requests/sec.",
        "It requires all Java objects to be strictly under 64 kilobytes.",
        "It runs only when the CPU is 100% idle."
      ],
      "correctAnswer": "It partitions the heap into equal-sized virtual regions and dynamically prioritizes collecting regions with the most reclaimable garbage first within a target pause time budget.",
      "explanation": "G1 divides the heap into regions and builds an incremental collection model, targeting regions with the highest garbage ratio to maximize throughput within the pause-time target."
    }
  ],
  "C": [
    {
      "type": "output_prediction",
      "difficulty": "easy",
      "question": "What is the output of the following C code regarding pointer dereferencing?",
      "codeSnippet": "int x = 10;\nint *ptr = &x;\n*ptr = 25;\nprintf(\"%d\", x);",
      "options": [
        "25",
        "10",
        "Memory Address of x",
        "Compilation Error"
      ],
      "correctAnswer": "25",
      "explanation": "*ptr dereferences the pointer to access and modify the value stored at memory address &x, directly changing x to 25."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "Which standard library header file in C is required to use dynamically allocated memory functions like malloc() and free()?",
      "options": [
        "<stdlib.h>",
        "<stdio.h>",
        "<string.h>",
        "<memory.h>"
      ],
      "correctAnswer": "<stdlib.h>",
      "explanation": "<stdlib.h> declares memory allocation functions including malloc, calloc, realloc, and free."
    },
    {
      "type": "output_prediction",
      "difficulty": "easy",
      "question": "What is the value of sizeof(char) guaranteed to be by the ANSI/ISO C standard?",
      "options": [
        "1",
        "2",
        "4",
        "Depends on architecture (32-bit vs 64-bit)"
      ],
      "correctAnswer": "1",
      "explanation": "In C, sizeof(char) is strictly defined by the standard to be 1 byte (which is CHAR_BIT bits, typically 8)."
    },
    {
      "type": "code_reading",
      "difficulty": "easy",
      "question": "In C, what is the null terminator character that marks the end of a valid string array?",
      "options": [
        "'\\0' (ASCII 0)",
        "'\\n' (ASCII 10)",
        "' ' (ASCII 32)",
        "'EOF' (-1)"
      ],
      "correctAnswer": "'\\0' (ASCII 0)",
      "explanation": "Strings in C are null-terminated character arrays ending with the byte value 0, written as '\\0'."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What is the return type of the malloc() function in C before assignment?",
      "options": [
        "void*",
        "char*",
        "int*",
        "size_t"
      ],
      "correctAnswer": "void*",
      "explanation": "malloc() returns a generic void pointer (void*) pointing to the allocated memory block, which can be implicitly converted to any pointer type."
    },
    {
      "type": "debugging",
      "difficulty": "medium",
      "question": "In C, what catastrophic bug occurs if free(ptr) is called on an allocated memory block, and ptr is subsequently dereferenced without re-allocation?",
      "options": [
        "Use-After-Free: accessing deallocated memory leads to undefined behavior, security vulnerabilities, or segmentation faults.",
        "Stack Overflow: the call stack is exhausted immediately.",
        "Compiler Syntax Error during linking.",
        "The operating system immediately reboots."
      ],
      "correctAnswer": "Use-After-Free: accessing deallocated memory leads to undefined behavior, security vulnerabilities, or segmentation faults.",
      "explanation": "Dereferencing a freed pointer is a Use-After-Free defect; the memory may have been reassigned by the allocator, causing memory corruption or crashes."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "What is the distinction between `const int *ptr` and `int * const ptr` in C?",
      "options": [
        "`const int *ptr` is a pointer to constant integer (the data cannot be changed through ptr); `int * const ptr` is a constant pointer (the pointer address cannot be changed).",
        "Both are completely identical declarations.",
        "`const int *ptr` can only point to global variables.",
        "`int * const ptr` allocates memory on the stack automatically."
      ],
      "correctAnswer": "`const int *ptr` is a pointer to constant integer (the data cannot be changed through ptr); `int * const ptr` is a constant pointer (the pointer address cannot be changed).",
      "explanation": "Read pointer declarations from right to left: `const int *p` means pointer to const int; `int * const p` means const pointer to int."
    },
    {
      "type": "debugging",
      "difficulty": "medium",
      "question": "Why is `gets()` completely removed from the C11 standard and strongly forbidden in modern C programming?",
      "options": [
        "It does not allow specifying a buffer size, causing inevitable buffer overflow vulnerabilities when input exceeds array bounds.",
        "It cannot read uppercase letters.",
        "It converts text into UTF-32.",
        "It requires root administrative privileges."
      ],
      "correctAnswer": "It does not allow specifying a buffer size, causing inevitable buffer overflow vulnerabilities when input exceeds array bounds.",
      "explanation": "gets() cannot check input length against target buffer capacity, making buffer overflow unavoidable. fgets() or getline() must be used instead."
    },
    {
      "type": "mcq",
      "difficulty": "medium",
      "question": "In C, what is the role of the `static` keyword when applied to a global variable or function in a source file (.c)?",
      "options": [
        "It restricts internal linkage, making the identifier invisible and inaccessible to other translation units during linking.",
        "It moves the variable into read-only flash memory.",
        "It prevents the function from ever being called more than once.",
        "It enables thread-safe execution across multi-core processors."
      ],
      "correctAnswer": "It restricts internal linkage, making the identifier invisible and inaccessible to other translation units during linking.",
      "explanation": "At file scope, `static` gives a variable or function internal linkage, preventing name collisions across different C files in the same binary."
    },
    {
      "type": "output_prediction",
      "difficulty": "medium",
      "question": "What is the result of pointer arithmetic in C: given `int *p = (int*)0x1000;`, what is `p + 2` on a system where `sizeof(int) == 4`?",
      "options": [
        "0x1008",
        "0x1002",
        "0x1004",
        "0x1010"
      ],
      "correctAnswer": "0x1008",
      "explanation": "In C pointer arithmetic, adding N to a pointer advances the address by N * sizeof(*p). Here: 0x1000 + (2 * 4) = 0x1008."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "What is undefined behavior in C when performing integer arithmetic on signed vs unsigned integers?",
      "options": [
        "Signed integer overflow is undefined behavior in C, whereas unsigned integer overflow is strictly defined to wrap modulo 2^N.",
        "Both signed and unsigned overflow trigger SIGFPE signals.",
        "Signed overflow wraps modulo 2^32, while unsigned overflow is undefined behavior.",
        "Neither is permitted to compile."
      ],
      "correctAnswer": "Signed integer overflow is undefined behavior in C, whereas unsigned integer overflow is strictly defined to wrap modulo 2^N.",
      "explanation": "ISO C explicitly specifies that unsigned integer operations never overflow (they wrap modulo 2^N), whereas signed integer overflow invokes undefined behavior."
    },
    {
      "type": "debugging",
      "difficulty": "hard",
      "question": "Why does compiler optimization sometimes break memory-mapped hardware polling loops in C unless the `volatile` qualifier is used?",
      "options": [
        "Without `volatile`, the compiler may optimize away repeated reads from a hardware register, caching the value in a CPU register because it sees no code writing to it in the loop body.",
        "Volatile encrypts hardware bus communication.",
        "Volatile forces the code to execute on the GPU.",
        "Without volatile, pointers are automatically converted to float."
      ],
      "correctAnswer": "Without `volatile`, the compiler may optimize away repeated reads from a hardware register, caching the value in a CPU register because it sees no code writing to it in the loop body.",
      "explanation": "`volatile` tells the optimizer that the variable value can change through mechanisms outside the compiler’s control (hardware, ISRs), requiring fresh memory reads on every access."
    },
    {
      "type": "code_reading",
      "difficulty": "hard",
      "question": "Why does struct padding occur in C, and why is `sizeof(struct { char a; int b; })` typically 8 bytes rather than 5 bytes on a 32/64-bit architecture?",
      "options": [
        "Hardware memory buses require natural alignment (e.g. 4-byte integers aligned at addresses divisible by 4); compilers insert padding bytes to ensure fast single-cycle memory reads.",
        "Compilers add 3 bytes for encryption checksums.",
        "char always occupies 4 bytes in structs.",
        "Structs in C are automatically converted into C++ classes."
      ],
      "correctAnswer": "Hardware memory buses require natural alignment (e.g. 4-byte integers aligned at addresses divisible by 4); compilers insert padding bytes to ensure fast single-cycle memory reads.",
      "explanation": "Unaligned memory access degrades memory bus performance or triggers hardware faults. Compilers insert padding so members sit on natural boundary multiples."
    },
    {
      "type": "mcq",
      "difficulty": "hard",
      "question": "In C, what is the exact syntax for declaring a function pointer named `operation` that takes two `int` parameters and returns an `int`?",
      "options": [
        "int (*operation)(int, int);",
        "int *operation(int, int);",
        "(*int) operation(int, int);",
        "function<int(int, int)> operation;"
      ],
      "correctAnswer": "int (*operation)(int, int);",
      "explanation": "Parentheses around (*operation) are mandatory; without them, `int *operation(int, int);` declares a function that returns an integer pointer."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "What is a memory leak in a long-running C daemon process, and how does it differ from a segmentation fault?",
      "options": [
        "A memory leak occurs when dynamically allocated memory via malloc() is never freed and its pointer is lost, gradually consuming RAM; a segfault is an immediate fatal crash from invalid memory access.",
        "A memory leak immediately terminates the application, while a segfault runs in the background.",
        "A memory leak is caused only by stack variables.",
        "A memory leak can be recovered by calling printf()."
      ],
      "correctAnswer": "A memory leak occurs when dynamically allocated memory via malloc() is never freed and its pointer is lost, gradually consuming RAM; a segfault is an immediate fatal crash from invalid memory access.",
      "explanation": "Memory leaks exhaust system memory over time without crashing immediately. A segmentation fault occurs when the CPU attempts an illegal memory access (e.g., NULL pointer dereference)."
    }
  ],
  "C++": [
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "In modern C++ (C++11 and later), which smart pointer expresses exclusive, non-copyable ownership of a dynamically allocated object?",
      "options": [
        "std::unique_ptr",
        "std::shared_ptr",
        "std::auto_ptr",
        "std::weak_ptr"
      ],
      "correctAnswer": "std::unique_ptr",
      "explanation": "std::unique_ptr enforces sole ownership: it cannot be copied (copy constructor deleted), only moved via std::move, and destroys the resource automatically when out of scope."
    },
    {
      "type": "output_prediction",
      "difficulty": "easy",
      "question": "What is the output of the following C++ code demonstrating reference passing?",
      "codeSnippet": "void increment(int &val) { val += 10; }\nint main() {\n  int x = 5;\n  increment(x);\n  std::cout << x;\n}",
      "options": [
        "15",
        "5",
        "10",
        "Compilation Error"
      ],
      "correctAnswer": "15",
      "explanation": "The parameter `int &val` is an lvalue reference, so modifications inside the function alter the actual argument `x` directly in memory."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What is the fundamental philosophy of RAII (Resource Acquisition Is Initialization) in C++?",
      "options": [
        "Resource lifetime is bound to object lifetime: resources are acquired in the constructor and released deterministically in the destructor.",
        "All resources must be initialized before the main() function starts.",
        "Memory allocation should only take place on the heap using raw malloc().",
        "Constructors must never throw exceptions."
      ],
      "correctAnswer": "Resource lifetime is bound to object lifetime: resources are acquired in the constructor and released deterministically in the destructor.",
      "explanation": "RAII guarantees that resources (memory, file handles, mutex locks) are released automatically upon scope exit, preventing leaks even when exceptions are thrown."
    },
    {
      "type": "code_reading",
      "difficulty": "easy",
      "question": "In C++, what does the `new` operator do that the C `malloc()` function does not?",
      "options": [
        "Allocates memory AND automatically calls the class constructor to initialize the object.",
        "Allocates memory in kernel space.",
        "Prevents objects from ever being deleted.",
        "Runs faster because it bypasses the OS virtual memory manager."
      ],
      "correctAnswer": "Allocates memory AND automatically calls the class constructor to initialize the object.",
      "explanation": "`new` is type-safe: it computes the necessary size, allocates heap memory, and invokes the type constructor. `delete` calls the destructor before freeing memory."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "Which C++ standard stream is used for standard console output?",
      "options": [
        "std::cout",
        "std::cin",
        "std::cerr",
        "std::clog"
      ],
      "correctAnswer": "std::cout",
      "explanation": "std::cout (character output) in the <iostream> header represents standard output stream, paired with the insertion operator (<<)."
    },
    {
      "type": "mcq",
      "difficulty": "medium",
      "question": "What is the purpose of std::move in modern C++?",
      "options": [
        "An unconditional cast that converts an lvalue into an rvalue reference (T&&), enabling move semantics instead of expensive deep copying.",
        "A thread migration function that moves threads across CPU cores.",
        "A function that deletes memory on the stack.",
        "A hardware memory copy instruction equivalent to memcpy."
      ],
      "correctAnswer": "An unconditional cast that converts an lvalue into an rvalue reference (T&&), enabling move semantics instead of expensive deep copying.",
      "explanation": "std::move does not move anything at runtime; it casts an expression to an rvalue, allowing move constructors and move assignment operators to pilfer resources."
    },
    {
      "type": "debugging",
      "difficulty": "medium",
      "question": "Why should base class destructors almost always be declared `virtual` in polymorphic C++ class hierarchies?",
      "options": [
        "To ensure that deleting a derived class object through a base class pointer invokes the derived class destructor first, preventing resource leaks.",
        "To prevent derived classes from having destructors.",
        "To force the class to be instantiated only on the stack.",
        "Virtual destructors make objects immutable."
      ],
      "correctAnswer": "To ensure that deleting a derived class object through a base class pointer invokes the derived class destructor first, preventing resource leaks.",
      "explanation": "Deleting a derived instance through a base pointer without a virtual destructor results in undefined behavior and skips the derived destructor."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "In C++ STL `std::vector`, what happens to existing iterators and references when a `push_back()` operation triggers a capacity reallocation?",
      "options": [
        "All existing iterators, pointers, and references into the vector are invalidated because elements are moved to a new memory block.",
        "Iterators automatically point to the new memory without change.",
        "The program triggers a compile-time static assertion.",
        "Only iterators pointing to the first element remain valid."
      ],
      "correctAnswer": "All existing iterators, pointers, and references into the vector are invalidated because elements are moved to a new memory block.",
      "explanation": "When vector size exceeds capacity, it allocates a larger contiguous block, moves elements, and frees old storage, invalidating all existing references and iterators."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "In C++, what does declaring a member function as `const` (e.g., `int getCount() const;`) guarantee?",
      "options": [
        "The member function promises not to modify any non-mutable member variables of the calling object.",
        "The function can only return a const integer.",
        "The function cannot be overridden in derived classes.",
        "The function is compiled into a static function."
      ],
      "correctAnswer": "The member function promises not to modify any non-mutable member variables of the calling object.",
      "explanation": "A const member function treats `this` as `const ClassName*`, preventing accidental mutation of member variables unless marked with the `mutable` specifier."
    },
    {
      "type": "debugging",
      "difficulty": "medium",
      "question": "What is the distinction between `std::shared_ptr` and `std::weak_ptr` in C++?",
      "options": [
        "std::weak_ptr holds a non-owning reference to an object managed by std::shared_ptr without incrementing its reference count, breaking circular reference cycles.",
        "std::shared_ptr is thread-unsafe, while std::weak_ptr is thread-safe.",
        "std::weak_ptr deletes the resource immediately when assigned.",
        "std::shared_ptr can only be used with primitive numbers."
      ],
      "correctAnswer": "std::weak_ptr holds a non-owning reference to an object managed by std::shared_ptr without incrementing its reference count, breaking circular reference cycles.",
      "explanation": "Cyclic dependencies between shared_ptrs prevent reference counts from ever dropping to zero (memory leak); weak_ptrs break the cycle by observing without owning."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "What is the C++ \"Rule of Five\", and when must a class implement it?",
      "options": [
        "If a class manages an explicit resource and defines a destructor, it should also define: copy constructor, copy assignment operator, move constructor, and move assignment operator.",
        "A class must not declare more than five private member variables.",
        "Every virtual hierarchy must have at most five levels of inheritance.",
        "A function must not accept more than five arguments."
      ],
      "correctAnswer": "If a class manages an explicit resource and defines a destructor, it should also define: copy constructor, copy assignment operator, move constructor, and move assignment operator.",
      "explanation": "Custom resource management requires explicit semantics for copying, moving, and releasing resources; defining one usually implies needing all five."
    },
    {
      "type": "code_reading",
      "difficulty": "hard",
      "question": "In C++, how does the `constexpr` specifier differ from `const`?",
      "options": [
        "`constexpr` guarantees that the value or function can be evaluated at compile time; `const` only guarantees that a variable is read-only after runtime initialization.",
        "`const` executes at compile-time, while `constexpr` executes only on the CPU.",
        "`constexpr` variables can be modified inside loops.",
        "`constexpr` is only allowed in template declarations."
      ],
      "correctAnswer": "`constexpr` guarantees that the value or function can be evaluated at compile time; `const` only guarantees that a variable is read-only after runtime initialization.",
      "explanation": "constexpr expressions are verified by the compiler to be computable during compilation, enabling their use in template arguments and static array bounds."
    },
    {
      "type": "debugging",
      "difficulty": "hard",
      "question": "In C++ cast operators, when should `dynamic_cast` be used instead of `static_cast`?",
      "options": [
        "When safely downcasting along a polymorphic inheritance hierarchy with runtime type checking (RTTI), returning nullptr for failed pointer casts.",
        "When converting an int to a float.",
        "When casting away constness.",
        "When casting between unrelated struct pointer types."
      ],
      "correctAnswer": "When safely downcasting along a polymorphic inheritance hierarchy with runtime type checking (RTTI), returning nullptr for failed pointer casts.",
      "explanation": "dynamic_cast uses RTTI to verify that the pointee object is actually an instance of the target derived class, returning nullptr on failure; static_cast does no runtime check."
    },
    {
      "type": "mcq",
      "difficulty": "hard",
      "question": "In C++ templates, what is SFINAE (\"Substitution Failure Is Not An Error\")?",
      "options": [
        "A rule where a failure to substitute template arguments during overload resolution simply discards the candidate rather than triggering a hard compilation failure.",
        "A compiler bug in GCC and Clang.",
        "A technique for catching exceptions at compile time.",
        "An optimization that disables virtual function tables."
      ],
      "correctAnswer": "A rule where a failure to substitute template arguments during overload resolution simply discards the candidate rather than triggering a hard compilation failure.",
      "explanation": "SFINAE allows compile-time introspection (e.g. std::enable_if) by removing non-matching template overloads from the overload candidate set gracefully."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "What is the \"Diamond Problem\" in multiple inheritance in C++, and how is it resolved?",
      "options": [
        "When a class inherits from two classes that both inherit from the same base class, creating duplicate base subobjects; resolved using `virtual` inheritance (`class B : virtual public A`).",
        "When five classes form a circular dependency loop; resolved using friend classes.",
        "When a template class cannot find its destructor; resolved using explicit template instantiation.",
        "A memory alignment bug resolved using `#pragma pack(8)`."
      ],
      "correctAnswer": "When a class inherits from two classes that both inherit from the same base class, creating duplicate base subobjects; resolved using `virtual` inheritance (`class B : virtual public A`).",
      "explanation": "Virtual inheritance ensures that only one shared instance of the common base class subobject exists in the most derived class instance, eliminating ambiguity."
    }
  ],
  "JavaScript": [
    {
      "type": "output_prediction",
      "difficulty": "easy",
      "question": "What is the console output of this JavaScript snippet demonstrating hoisting and scope?",
      "codeSnippet": "console.log(typeof a);\nconsole.log(typeof b);\nvar a = 10;\nlet b = 20;",
      "options": [
        "'undefined' then ReferenceError (temporal dead zone)",
        "'undefined' then 'undefined'",
        "'number' then 'number'",
        "ReferenceError then ReferenceError"
      ],
      "correctAnswer": "'undefined' then ReferenceError (temporal dead zone)",
      "explanation": "var a is hoisted and initialized to undefined. let b is hoisted into the Temporal Dead Zone (TDZ) and accessing it before declaration throws a ReferenceError."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What is the key difference between `==` and `===` in JavaScript?",
      "options": [
        "`==` performs implicit type coercion before comparing values; `===` performs strict comparison checking both value and type without coercion.",
        "`===` only works for numbers.",
        "`==` checks memory references, whereas `===` checks object properties.",
        "`===` is deprecated in modern ECMAScript."
      ],
      "correctAnswer": "`==` performs implicit type coercion before comparing values; `===` performs strict comparison checking both value and type without coercion.",
      "explanation": "Strict equality (===) requires operands to have the same type, preventing unexpected coercion quirks like `\"\" == 0` evaluating to true."
    },
    {
      "type": "output_prediction",
      "difficulty": "easy",
      "question": "What does `Array.prototype.map()` return in JavaScript?",
      "options": [
        "A new array containing the results of calling the provided function on every element in the calling array.",
        "A boolean indicating if all elements passed the condition.",
        "The original array mutated in place.",
        "A single accumulated value."
      ],
      "correctAnswer": "A new array containing the results of calling the provided function on every element in the calling array.",
      "explanation": "map() is a non-mutating higher-order function that transforms every element into a corresponding element of a newly returned array."
    },
    {
      "type": "code_reading",
      "difficulty": "easy",
      "question": "In modern JavaScript, what does the nullish coalescing operator (`??`) evaluate?",
      "options": [
        "Returns its right-hand side operand when its left-hand side operand is null or undefined (not for 0, false, or \"\").",
        "Returns true if both operands are null.",
        "Merges two objects into a single prototype chain.",
        "Coerces all falsy values to empty strings."
      ],
      "correctAnswer": "Returns its right-hand side operand when its left-hand side operand is null or undefined (not for 0, false, or \"\").",
      "explanation": "Unlike logical OR (||) which falls back on any falsy value (including 0 and \"\"), nullish coalescing (??) only falls back on null or undefined."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What is the output of `typeof null` in standard JavaScript?",
      "options": [
        "'object'",
        "'null'",
        "'undefined'",
        "'boolean'"
      ],
      "correctAnswer": "'object'",
      "explanation": "In the original JavaScript implementation, values were represented with type tags; null had a 000 type tag matching objects, a legacy behavior retained for web compatibility."
    },
    {
      "type": "mcq",
      "difficulty": "medium",
      "question": "Which statement accurately describes how closures work in JavaScript?",
      "options": [
        "A function retains lexical access to its enclosing scope variables even after the outer function has finished executing and returned.",
        "All variables inside functions are converted to global window properties.",
        "Closures freeze all local variable values at the moment the outer function is defined.",
        "Closures are created only when using the class keyword."
      ],
      "correctAnswer": "A function retains lexical access to its enclosing scope variables even after the outer function has finished executing and returned.",
      "explanation": "A closure is the combination of a function bundled together with references to its surrounding lexical environment."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "In the JavaScript event loop, what is the execution priority between microtasks (Promises, queueMicrotask) and macrotasks (setTimeout, setInterval)?",
      "options": [
        "All microtasks in the microtask queue are drained completely before the event loop picks the next macrotask from the task queue.",
        "Macrotasks always execute before microtasks.",
        "Microtasks and macrotasks execute concurrently on two separate CPU threads.",
        "setTimeout(..., 0) always executes before resolved Promises."
      ],
      "correctAnswer": "All microtasks in the microtask queue are drained completely before the event loop picks the next macrotask from the task queue.",
      "explanation": "At the end of each task and before yielding back to rendering or the next macrotask, the engine completely flushes the microtask queue."
    },
    {
      "type": "debugging",
      "difficulty": "medium",
      "question": "Why does an arrow function `() => {}` not have its own `this` context in JavaScript?",
      "options": [
        "Arrow functions inherit `this` lexically from the enclosing execution context in which they were defined.",
        "Arrow functions can only be called from inside objects.",
        "Arrow functions set `this` to null automatically.",
        "Arrow functions are strictly bound to the window/global object."
      ],
      "correctAnswer": "Arrow functions inherit `this` lexically from the enclosing execution context in which they were defined.",
      "explanation": "Arrow functions do not establish their own `this`, `arguments`, or `super` bindings; they resolve them lexically like any normal variable in scope."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "What is the distinction between `Promise.all()` and `Promise.allSettled()` in JavaScript?",
      "options": [
        "`Promise.all()` rejects immediately if any input promise rejects; `Promise.allSettled()` waits for all promises to either fulfill or reject and returns their statuses.",
        "`Promise.all()` runs promises sequentially, while `allSettled()` runs them in parallel.",
        "`Promise.allSettled()` cancels remaining network requests on failure.",
        "Both are identical in behavior."
      ],
      "correctAnswer": "`Promise.all()` rejects immediately if any input promise rejects; `Promise.allSettled()` waits for all promises to either fulfill or reject and returns their statuses.",
      "explanation": "Promise.all has fail-fast semantics; Promise.allSettled guarantees all promises complete, returning an array of {status, value/reason} descriptor objects."
    },
    {
      "type": "output_prediction",
      "difficulty": "medium",
      "question": "What does `[1, 2, 3] + [4, 5, 6]` evaluate to in JavaScript?",
      "options": [
        "'1,2,34,5,6'",
        "[1, 2, 3, 4, 5, 6]",
        "NaN",
        "TypeError"
      ],
      "correctAnswer": "'1,2,34,5,6'",
      "explanation": "The + operator coerces non-primitive operands to strings by calling their .toString() methods (\"1,2,3\" and \"4,5,6\") and concatenates them."
    },
    {
      "type": "debugging",
      "difficulty": "hard",
      "question": "In JavaScript, why does comparing two identical objects with `{ id: 1 } === { id: 1 }` return false?",
      "options": [
        "Objects are compared by reference identity (memory address), and two separate object literals allocate two distinct references in the heap.",
        "The JavaScript interpreter does not support object comparison.",
        "Strict equality cannot compare properties named id.",
        "Objects are converted into NaN during comparison."
      ],
      "correctAnswer": "Objects are compared by reference identity (memory address), and two separate object literals allocate two distinct references in the heap.",
      "explanation": "Object identity equality tests reference equality. Even with identical properties, two independent object literals occupy distinct memory addresses."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "How does JavaScript prototypal inheritance resolve a property lookup on an object instance `obj.property`?",
      "options": [
        "It checks the object’s own properties; if not found, it traverses up the `[[Prototype]]` chain (__proto__) until found or reaching null.",
        "It scans all objects globally in the application memory.",
        "It compiles a static hash map of all methods in the class hierarchy.",
        "It throws a PropertyNotFoundError if the property is not directly on the instance."
      ],
      "correctAnswer": "It checks the object’s own properties; if not found, it traverses up the `[[Prototype]]` chain (__proto__) until found or reaching null.",
      "explanation": "The prototype chain is traversed sequentially: own properties -> constructor prototype -> Object.prototype -> null. If unresolved, undefined is returned."
    },
    {
      "type": "code_reading",
      "difficulty": "hard",
      "question": "Why does a `WeakMap` in JavaScript not prevent its key objects from being garbage collected when no other references exist?",
      "options": [
        "WeakMap holds weak references to its keys, allowing the garbage collector to reclaim key objects and discard the entry automatically.",
        "WeakMap keys are written to localStorage.",
        "WeakMap runs on a background Web Worker.",
        "WeakMap requires keys to be primitive strings."
      ],
      "correctAnswer": "WeakMap holds weak references to its keys, allowing the garbage collector to reclaim key objects and discard the entry automatically.",
      "explanation": "WeakMap references to keys are weak and not counted as reachable roots by garbage collection, preventing memory leaks when associating metadata with objects."
    },
    {
      "type": "debugging",
      "difficulty": "hard",
      "question": "What is the effect of activating JavaScript strict mode (`\"use strict\";`) on accidental assignments to undeclared variables?",
      "options": [
        "It throws a ReferenceError instead of silently creating an implicit global variable on the window/global object.",
        "It automatically declares the variable as a let statement.",
        "It logs a warning to the console and continues execution.",
        "It converts the variable to a Symbol."
      ],
      "correctAnswer": "It throws a ReferenceError instead of silently creating an implicit global variable on the window/global object.",
      "explanation": "Strict mode catches silent errors: assigning to an undeclared identifier throws a ReferenceError rather than polluting the global namespace."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "When implementing deep object cloning in modern JavaScript (ES2022+), why is `structuredClone()` superior to `JSON.parse(JSON.stringify(obj))`?",
      "options": [
        "`structuredClone()` natively supports cyclic references, Dates, RegExp, Maps, Sets, and TypedArrays, whereas JSON serialization drops or corrupts them.",
        "`structuredClone()` runs in WebAssembly.",
        "`JSON.stringify()` cannot serialize numbers.",
        "`structuredClone()` mutates the original object in place."
      ],
      "correctAnswer": "`structuredClone()` natively supports cyclic references, Dates, RegExp, Maps, Sets, and TypedArrays, whereas JSON serialization drops or corrupts them.",
      "explanation": "The HTML structured clone algorithm copies cyclic references and non-JSON data types (Date objects, RegExp, Maps, Sets) that JSON serialization loses or converts to strings."
    }
  ],
  "TypeScript": [
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "Which TypeScript utility type constructs a type with all properties of Type set to optional?",
      "options": [
        "Partial<Type>",
        "Required<Type>",
        "Readonly<Type>",
        "Pick<Type>"
      ],
      "correctAnswer": "Partial<Type>",
      "explanation": "Partial<T> maps over every key in T and appends the optional modifier (?), allowing partial object initialization."
    },
    {
      "type": "code_reading",
      "difficulty": "easy",
      "question": "What does the TypeScript `unknown` type represent compared to `any`?",
      "options": [
        "A type-safe counterpart of any: any value can be assigned to unknown, but operations on unknown require explicit type checking or narrowing first.",
        "A type that can never hold any value (equivalent to never).",
        "An alias for undefined.",
        "A type used exclusively for asynchronous Promises."
      ],
      "correctAnswer": "A type-safe counterpart of any: any value can be assigned to unknown, but operations on unknown require explicit type checking or narrowing first.",
      "explanation": "unknown forces type safety: developers cannot invoke methods, properties, or pass unknown variables without first performing type narrowing (typeof, instanceof)."
    },
    {
      "type": "output_prediction",
      "difficulty": "easy",
      "question": "What is the inferred type of `const status = \"success\";` in TypeScript?",
      "options": [
        "\"success\" (literal type)",
        "string",
        "any",
        "unknown"
      ],
      "correctAnswer": "\"success\" (literal type)",
      "explanation": "Because the variable is declared with const and initialized with a string literal, TypeScript infers the exact literal type \"success\" rather than generic string."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "In TypeScript, what is the role of an interface?",
      "options": [
        "To define the shape and contract of an object, specifying property names and types that adhering objects must satisfy.",
        "To compile TypeScript code directly into C++ header files.",
        "To allocate memory buffers in the browser.",
        "To replace JavaScript class definitions at runtime."
      ],
      "correctAnswer": "To define the shape and contract of an object, specifying property names and types that adhering objects must satisfy.",
      "explanation": "Interfaces provide compile-time structural contracts for objects, supporting extension (extends) and declaration merging."
    },
    {
      "type": "code_reading",
      "difficulty": "easy",
      "question": "What does the non-null assertion operator (`!`) do in TypeScript (e.g., `element!.focus()`)?",
      "options": [
        "Tells the compiler to assert that the operand is neither null nor undefined, suppressing strictNullChecks errors.",
        "Negates the boolean value of the expression.",
        "Throws a runtime NullPointerException if the value is null.",
        "Converts null values into empty strings."
      ],
      "correctAnswer": "Tells the compiler to assert that the operand is neither null nor undefined, suppressing strictNullChecks errors.",
      "explanation": "The post-fix ! operator is a compile-time assertion that removes null and undefined from the type; it emits no runtime validation checks."
    },
    {
      "type": "mcq",
      "difficulty": "medium",
      "question": "In TypeScript, what is the key difference between an `interface` and a `type` alias?",
      "options": [
        "Interfaces can participate in declaration merging and define object contracts; type aliases can represent unions, primitives, tuples, and mapped types.",
        "Interfaces exist at JavaScript runtime, whereas types are erased.",
        "Type aliases cannot be exported from modules.",
        "Interfaces cannot be extended using extends."
      ],
      "correctAnswer": "Interfaces can participate in declaration merging and define object contracts; type aliases can represent unions, primitives, tuples, and mapped types.",
      "explanation": "Interfaces can be merged across multiple declarations with the same name. Type aliases cannot be merged, but can alias unions, intersections, and primitives directly."
    },
    {
      "type": "debugging",
      "difficulty": "medium",
      "question": "How do Discriminated Unions achieve robust type narrowing in TypeScript?",
      "options": [
        "By having a shared literal property (a discriminant tag) across union members, allowing switch statements or if-checks to narrow the type with certainty.",
        "By compiling runtime typeof checks automatically.",
        "By storing objects in separate JavaScript Maps.",
        "By converting all union members to any."
      ],
      "correctAnswer": "By having a shared literal property (a discriminant tag) across union members, allowing switch statements or if-checks to narrow the type with certainty.",
      "explanation": "Discriminated unions use a common literal property (e.g. `type: \"circle\" | \"square\"`) that the compiler uses to narrow down the union variant in conditional blocks."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "What is the utility type `Record<K, T>` used for in TypeScript?",
      "options": [
        "Constructs an object type whose property keys are of type K and whose property values are of type T.",
        "Records audio and media stream events.",
        "Creates an immutable database entity.",
        "Constructs an array of tuples of length K."
      ],
      "correctAnswer": "Constructs an object type whose property keys are of type K and whose property values are of type T.",
      "explanation": "Record<K, T> produces an object type mapping a set of properties of type K to values of type T (e.g., Record<string, number>)."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "What does the `keyof` operator produce when applied to a type `User`?",
      "options": [
        "A string or numeric literal union representing all public property names of the type User.",
        "An array containing runtime property values.",
        "A boolean checking if a key exists.",
        "The constructor function of User."
      ],
      "correctAnswer": "A string or numeric literal union representing all public property names of the type User.",
      "explanation": "keyof User takes an object type and produces the union of its keys (e.g. if User has { id: number; name: string }, keyof User is \"id\" | \"name\")."
    },
    {
      "type": "debugging",
      "difficulty": "medium",
      "question": "What is the purpose of the `readonly` modifier on array types (e.g., `readonly number[]` or `ReadonlyArray<number>`)?",
      "options": [
        "It prevents mutating methods like push(), pop(), and splice() from being called, treating the array as immutable.",
        "It encrypts array contents in memory.",
        "It restricts array length to 10 elements.",
        "It forces array elements to be converted to constants at runtime."
      ],
      "correctAnswer": "It prevents mutating methods like push(), pop(), and splice() from being called, treating the array as immutable.",
      "explanation": "ReadonlyArray<T> strips all mutating methods from the array interface at compile time, guaranteeing callers cannot modify elements."
    },
    {
      "type": "code_reading",
      "difficulty": "hard",
      "question": "What does the TypeScript \"infer\" keyword enable within conditional types?",
      "options": [
        "It introduces a new generic type variable to be deduced from another type within the \"extends\" clause (e.g., extracting Promise return types).",
        "It forces TypeScript to compile code without typechecking.",
        "It automatically casts invalid types to any.",
        "It imports external types from global declarations."
      ],
      "correctAnswer": "It introduces a new generic type variable to be deduced from another type within the \"extends\" clause (e.g., extracting Promise return types).",
      "explanation": "infer introduces an inferred type variable inside a conditional type clause, allowing pattern matching on inner types (e.g., `T extends Promise<infer U> ? U : T`)."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "What does the `never` type represent in the TypeScript type system, and when does it occur naturally?",
      "options": [
        "The bottom type representing values that never occur (e.g., functions that always throw or exhaustively checked switch statements).",
        "An alias for null or undefined.",
        "A type assigned to uninitialized variables.",
        "A type indicating network timeouts."
      ],
      "correctAnswer": "The bottom type representing values that never occur (e.g., functions that always throw or exhaustively checked switch statements).",
      "explanation": "never is the bottom type: no value can be assigned to never except never itself, making it invaluable for compile-time exhaustive check validation."
    },
    {
      "type": "debugging",
      "difficulty": "hard",
      "question": "Why does TypeScript perform \"Excess Property Checking\" on object literals, but not when assigning existing variable references to typed interfaces?",
      "options": [
        "Fresh object literals cannot have extraneous properties because they denote programmer error/typos; variable assignment uses standard structural subtyping.",
        "Excess property checking is a bug in the TypeScript compiler.",
        "Variable references are always treated as any.",
        "Object literals are compiled to JSON strings."
      ],
      "correctAnswer": "Fresh object literals cannot have extraneous properties because they denote programmer error/typos; variable assignment uses standard structural subtyping.",
      "explanation": "Fresh object literals undergo excess property checking to catch misspelled or irrelevant keys. Pre-existing variables adhere to standard structural subtyping."
    },
    {
      "type": "code_reading",
      "difficulty": "hard",
      "question": "What does `as const` (const assertion) do when applied to an array or object literal in TypeScript?",
      "options": [
        "Narrows all primitive properties to literal types, makes all properties readonly, and turns array literals into readonly tuples.",
        "Freezes the object at JavaScript runtime using Object.freeze().",
        "Compiles the object into a WebAssembly global.",
        "Prevents the variable from being exported."
      ],
      "correctAnswer": "Narrows all primitive properties to literal types, makes all properties readonly, and turns array literals into readonly tuples.",
      "explanation": "`as const` instructs the compiler to apply the most specific type possible: arrays become readonly tuples and strings become exact literal types."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "How do Mapped Types work in TypeScript (e.g., `[P in keyof T]?: T[P]`)?",
      "options": [
        "They iterate over a union of keys (usually via keyof) and produce a new type by transforming property modifiers and types for each key.",
        "They map over database rows asynchronously.",
        "They create runtime JavaScript Map instances.",
        "They translate TypeScript into WebAssembly."
      ],
      "correctAnswer": "They iterate over a union of keys (usually via keyof) and produce a new type by transforming property modifiers and types for each key.",
      "explanation": "Mapped types iterate over keys using the `in` operator, allowing systematic transformation (adding/removing readonly or optional modifiers, remapping values)."
    }
  ],
  "HTML": [
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What is the semantic purpose of the `<nav>` element in HTML5?",
      "options": [
        "To define a section that contains major navigation links for the document or site.",
        "To embed GPS and geolocation map navigation scripts.",
        "To style navigation bars with blue borders automatically.",
        "To control browser back and forward button routing."
      ],
      "correctAnswer": "To define a section that contains major navigation links for the document or site.",
      "explanation": "`<nav>` is a semantic container for major navigation links, aiding screen readers and search engines in identifying site navigation."
    },
    {
      "type": "code_reading",
      "difficulty": "easy",
      "question": "What is the purpose of the `alt` attribute on an `<img>` tag in HTML?",
      "options": [
        "Provides alternative text for screen readers and displays when the image fails to load.",
        "Defines the alternate URL of a backup image file.",
        "Rotates the image by 90 degrees.",
        "Sets the image tooltip on hover only."
      ],
      "correctAnswer": "Provides alternative text for screen readers and displays when the image fails to load.",
      "explanation": "The alt attribute provides accessible alternative text for visually impaired users using assistive technology and displays if image fetching fails."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What does the `<!DOCTYPE html>` declaration at the top of an HTML document do?",
      "options": [
        "Instructs the web browser to render the page in standard compliance mode (HTML5) rather than quirks mode.",
        "Loads the external HTML5 style sheets from W3C servers.",
        "Compiles JavaScript files before DOM parsing.",
        "Declares that the document is written in English."
      ],
      "correctAnswer": "Instructs the web browser to render the page in standard compliance mode (HTML5) rather than quirks mode.",
      "explanation": "The modern `<!DOCTYPE html>` doctype declaration ensures standard rendering mode, preventing legacy quirks mode styling anomalies."
    },
    {
      "type": "output_prediction",
      "difficulty": "easy",
      "question": "Which HTML input type renders a secure text field that masks typed characters with dots or asterisks?",
      "options": [
        "type=\"password\"",
        "type=\"hidden\"",
        "type=\"secure\"",
        "type=\"mask\""
      ],
      "correctAnswer": "type=\"password\"",
      "explanation": "`<input type=\"password\">` obfuscates entered text to protect sensitive credentials from shoulder surfing."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "Which HTML5 element represents self-contained content that could be independently distributable, such as a blog post or news item?",
      "options": [
        "<article>",
        "<section>",
        "<aside>",
        "<div>"
      ],
      "correctAnswer": "<article>",
      "explanation": "`<article>` represents an independent, self-contained composition (news article, blog post, forum comment) intended for standalone distribution."
    },
    {
      "type": "mcq",
      "difficulty": "medium",
      "question": "What is the purpose of ARIA (Accessible Rich Internet Applications) attributes in HTML?",
      "options": [
        "To define accessibility roles, states, and properties for assistive technologies when native HTML elements are insufficient.",
        "To speed up page loading performance on mobile devices.",
        "To compress HTML markup over HTTP connections.",
        "To style elements with high-contrast themes automatically."
      ],
      "correctAnswer": "To define accessibility roles, states, and properties for assistive technologies when native HTML elements are insufficient.",
      "explanation": "ARIA attributes bridge semantic gaps in complex custom UI widgets, communicating state (aria-expanded, aria-hidden, aria-live) to screen readers."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "In HTML forms, what is the distinction between sending data via `method=\"GET\"` versus `method=\"POST\"`?",
      "options": [
        "GET appends form data to the URL query string (visible in address bar/logs, subject to URL length limits); POST sends data in the HTTP request body.",
        "GET encrypts data, while POST sends raw plaintext.",
        "POST can only send numbers, while GET can send files.",
        "GET requires JavaScript to be enabled in the browser."
      ],
      "correctAnswer": "GET appends form data to the URL query string (visible in address bar/logs, subject to URL length limits); POST sends data in the HTTP request body.",
      "explanation": "GET is intended for safe, idempotent read requests with URL parameters. POST sends payloads inside the HTTP request body for state modifications."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "Why should the `<picture>` element be used instead of a standard `<img>` for responsive images across varying device displays?",
      "options": [
        "It allows providing multiple `<source>` elements with media queries and modern formats (AVIF/WebP), letting the browser download the optimal asset.",
        "It converts PNGs into vector SVGs in the browser.",
        "It disables right-click image downloading.",
        "It animates static photos automatically."
      ],
      "correctAnswer": "It allows providing multiple `<source>` elements with media queries and modern formats (AVIF/WebP), letting the browser download the optimal asset.",
      "explanation": "`<picture>` enables art direction and format fallback: browsers inspect media queries and MIME types to fetch only the matching, highly-compressed image."
    },
    {
      "type": "debugging",
      "difficulty": "medium",
      "question": "What is the security purpose of the `sandbox` attribute on an `<iframe>` element?",
      "options": [
        "It restricts the iframe content from executing scripts, submitting forms, accessing cookies, or navigating top-level windows unless explicitly allowed.",
        "It runs the iframe in a separate physical server container.",
        "It prevents the iframe from displaying text.",
        "It forces the iframe to load through a VPN."
      ],
      "correctAnswer": "It restricts the iframe content from executing scripts, submitting forms, accessing cookies, or navigating top-level windows unless explicitly allowed.",
      "explanation": "The `sandbox` attribute enforces strict origin and permission restrictions on embedded untrusted content, preventing malicious cross-frame attacks."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "What is the purpose of the `<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">` tag?",
      "options": [
        "It matches the virtual viewport width to the device screen width and establishes a 1:1 scale, preventing mobile browsers from zooming out to 980px desktop width.",
        "It sets the maximum screen brightness.",
        "It disables pinch-to-zoom on all websites.",
        "It enables 3D graphics rendering in CSS."
      ],
      "correctAnswer": "It matches the virtual viewport width to the device screen width and establishes a 1:1 scale, preventing mobile browsers from zooming out to 980px desktop width.",
      "explanation": "Mobile browsers default to a desktop virtual viewport (980px); the viewport meta tag configures the viewport to match physical device pixels at 100% scale."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "How does the browser parse HTML documents when encountering `<script>`, `<script async>`, and `<script defer>` tags in the `<head>`?",
      "options": [
        "Standard script pauses HTML parsing until downloaded and executed; async downloads in parallel and executes immediately upon download; defer downloads in parallel and executes in order after HTML parsing completes.",
        "async and defer are identical aliases.",
        "defer blocks HTML parsing, while async runs on a Web Worker.",
        "Standard script executes after the DOMContentLoaded event fires."
      ],
      "correctAnswer": "Standard script pauses HTML parsing until downloaded and executed; async downloads in parallel and executes immediately upon download; defer downloads in parallel and executes in order after HTML parsing completes.",
      "explanation": "defer preserves execution order and waits for DOM construction; async executes as soon as it arrives, potentially interrupting the HTML parser."
    },
    {
      "type": "security",
      "difficulty": "hard",
      "question": "Why is adding `rel=\"noopener noreferrer\"` essential when using `<a target=\"_blank\">` to open external links in HTML?",
      "options": [
        "It prevents the opened external page from accessing `window.opener` to redirect the parent page to a phishing URL (reverse tabnabbing).",
        "It disables SSL certificate validation for external links.",
        "It prevents the target page from opening in a new tab.",
        "It hides the user’s IP address from the external server."
      ],
      "correctAnswer": "It prevents the opened external page from accessing `window.opener` to redirect the parent page to a phishing URL (reverse tabnabbing).",
      "explanation": "Without noopener, the opened page has a reference to `window.opener` and can execute `window.opener.location = fakeUrl` to compromise the user."
    },
    {
      "type": "mcq",
      "difficulty": "hard",
      "question": "What is the Shadow DOM in the HTML Web Components specification?",
      "options": [
        "An encapsulated DOM tree attached to an element, isolating its internal DOM structure and CSS styles from the main document.",
        "A browser cache for previously rendered web pages.",
        "The dark-mode rendering engine of Chromium.",
        "An encrypted DOM layer used for financial transactions."
      ],
      "correctAnswer": "An encapsulated DOM tree attached to an element, isolating its internal DOM structure and CSS styles from the main document.",
      "explanation": "Shadow DOM provides true DOM and CSS scoping: styles defined inside a shadow root do not bleed out, and outer selectors cannot unintentionally alter inner elements."
    },
    {
      "type": "code_reading",
      "difficulty": "hard",
      "question": "What does the HTML `contenteditable=\"true\"` attribute enable, and what is its primary security consideration?",
      "options": [
        "Makes element text directly editable by the user; inputs must be strictly sanitized to prevent Stored Cross-Site Scripting (XSS) when persisted.",
        "Enables automated spell-checking only.",
        "Allows users to rewrite server database records directly.",
        "Converts the element into an image."
      ],
      "correctAnswer": "Makes element text directly editable by the user; inputs must be strictly sanitized to prevent Stored Cross-Site Scripting (XSS) when persisted.",
      "explanation": "contenteditable transforms any DOM element into a rich text editor. Storing innerHTML without context-aware sanitization leads directly to XSS vulnerabilities."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "What is the role of the `<template>` element in HTML5?",
      "options": [
        "A mechanism for holding client-side HTML markup that is not rendered on page load, but can be instantiated and cloned via JavaScript at runtime.",
        "A server-side templating engine built into the browser.",
        "A tag that downloads external HTML files via AJAX.",
        "A blueprint for creating CSS variables."
      ],
      "correctAnswer": "A mechanism for holding client-side HTML markup that is not rendered on page load, but can be instantiated and cloned via JavaScript at runtime.",
      "explanation": "The content of a `<template>` is parsed but inert (images don’t load, scripts don’t run) until JavaScript clones its `.content` document fragment."
    }
  ],
  "CSS": [
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What does `box-sizing: border-box;` do to the CSS box model calculation?",
      "options": [
        "Includes padding and border within the specified width and height, preventing the element from expanding beyond its defined dimensions.",
        "Adds padding and border to the outside of the width and height.",
        "Removes all borders from the element.",
        "Converts inline elements to block elements."
      ],
      "correctAnswer": "Includes padding and border within the specified width and height, preventing the element from expanding beyond its defined dimensions.",
      "explanation": "In the default content-box model, padding and borders add to width. border-box absorbs padding and border into the assigned width, simplifying layout calculations."
    },
    {
      "type": "output_prediction",
      "difficulty": "easy",
      "question": "Which CSS display property turns an element into a flexible container for aligning child items along a primary axis?",
      "options": [
        "display: flex;",
        "display: grid;",
        "display: inline-block;",
        "display: block;"
      ],
      "correctAnswer": "display: flex;",
      "explanation": "display: flex establishes a flex formatting context, enabling properties like justify-content, align-items, and flex-direction."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "In CSS specificity hierarchy, which selector type has the highest priority?",
      "options": [
        "ID selector (#header)",
        "Class selector (.menu)",
        "Element selector (div)",
        "Universal selector (*)"
      ],
      "correctAnswer": "ID selector (#header)",
      "explanation": "Specificity hierarchy order: Inline styles (1000) > IDs (0100) > Classes/attributes/pseudo-classes (0010) > Elements/pseudo-elements (0001)."
    },
    {
      "type": "code_reading",
      "difficulty": "easy",
      "question": "What is the difference between `display: none;` and `visibility: hidden;` in CSS?",
      "options": [
        "`display: none;` removes the element completely from document flow taking up 0 space; `visibility: hidden;` hides the element while preserving its layout space.",
        "Both remove the element completely from document flow.",
        "`visibility: hidden;` removes the element from the DOM entirely.",
        "`display: none;` only hides images."
      ],
      "correctAnswer": "`display: none;` removes the element completely from document flow taking up 0 space; `visibility: hidden;` hides the element while preserving its layout space.",
      "explanation": "display: none causes the browser to omit the element from the render tree. visibility: hidden renders an invisible box maintaining layout geometry."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "How do you declare and use a CSS Custom Property (CSS variable)?",
      "options": [
        "Declare with `--variable-name: value;` and access with `var(--variable-name);`.",
        "Declare with `$variable-name: value;` and access with `$$variable-name;`.",
        "Declare with `@variable = value;` and access with `val(variable);`.",
        "Declare with `set variable-name = value;`."
      ],
      "correctAnswer": "Declare with `--variable-name: value;` and access with `var(--variable-name);`.",
      "explanation": "Native CSS variables use double hyphens for declaration (--primary-color: #4f46e5) and the var() function for retrieval."
    },
    {
      "type": "mcq",
      "difficulty": "medium",
      "question": "In CSS Flexbox, what is the distinction between `justify-content` and `align-items`?",
      "options": [
        "`justify-content` aligns items along the main axis; `align-items` aligns items along the cross axis.",
        "`justify-content` aligns items vertically; `align-items` aligns items horizontally regardless of flex-direction.",
        "`justify-content` applies only to text; `align-items` applies to containers.",
        "Both align items along the cross axis."
      ],
      "correctAnswer": "`justify-content` aligns items along the main axis; `align-items` aligns items along the cross axis.",
      "explanation": "In flexbox, the main axis is determined by flex-direction (row by default). justify-content manages main-axis spacing; align-items manages cross-axis alignment."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "What does `position: absolute;` do to an element in CSS?",
      "options": [
        "Removes the element from normal document flow and positions it relative to its closest positioned ancestor (ancestor with position other than static).",
        "Positions the element relative to the browser window regardless of parent elements.",
        "Locks the element in place so it never scrolls.",
        "Centers the element horizontally on the page."
      ],
      "correctAnswer": "Removes the element from normal document flow and positions it relative to its closest positioned ancestor (ancestor with position other than static).",
      "explanation": "An absolute element is positioned relative to its nearest containing block (an ancestor with relative, absolute, or fixed positioning), or initial containing block."
    },
    {
      "type": "debugging",
      "difficulty": "medium",
      "question": "Why does adding `z-index: 9999;` to an element sometimes fail to bring it above another element on the page?",
      "options": [
        "The element is trapped inside a lower Stacking Context established by an ancestor (e.g., ancestor with opacity < 1, transform, or lower z-index).",
        "z-index values cannot exceed 1000 in CSS.",
        "z-index only applies to inline elements.",
        "The browser ignores z-index unless animations are running."
      ],
      "correctAnswer": "The element is trapped inside a lower Stacking Context established by an ancestor (e.g., ancestor with opacity < 1, transform, or lower z-index).",
      "explanation": "Stacking contexts are hierarchical: an element cannot escape the stacking level of its parent stacking context regardless of how high its local z-index is."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "When should CSS Grid be used instead of CSS Flexbox?",
      "options": [
        "When designing two-dimensional layouts managing both rows and columns simultaneously; Flexbox is intended for one-dimensional layouts (rows OR columns).",
        "Flexbox is deprecated in modern web development.",
        "Grid can only be used on mobile devices.",
        "Flexbox is strictly for text paragraphs."
      ],
      "correctAnswer": "When designing two-dimensional layouts managing both rows and columns simultaneously; Flexbox is intended for one-dimensional layouts (rows OR columns).",
      "explanation": "CSS Grid operates in 2D (rows and columns simultaneously), while Flexbox is content-out and primarily 1D (distributing space along a single axis)."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "What is the distinction between pseudo-classes (e.g., `:hover`) and pseudo-elements (e.g., `::after`) in CSS?",
      "options": [
        "Pseudo-classes target elements based on state or DOM position; pseudo-elements create or style abstract subparts of elements not present in HTML.",
        "Pseudo-classes use double colons (::), while pseudo-elements use single colons (:).",
        "Pseudo-elements cannot accept styling.",
        "Pseudo-classes only apply to links."
      ],
      "correctAnswer": "Pseudo-classes target elements based on state or DOM position; pseudo-elements create or style abstract subparts of elements not present in HTML.",
      "explanation": "Pseudo-classes (:focus, :nth-child) style existing elements in specific states. Pseudo-elements (::before, ::after, ::placeholder) inject virtual elements."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "How does the CSS `contain` property (e.g., `contain: content;` or `contain: strict;`) optimize browser rendering performance in complex web applications?",
      "options": [
        "It isolates a subtree from the rest of the document, allowing the browser to skip layout, paint, and style recalculations outside the container during DOM mutations.",
        "It compresses CSS stylesheet files into gzip on download.",
        "It disables CSS animations when scrolling.",
        "It prevents JavaScript from reading element attributes."
      ],
      "correctAnswer": "It isolates a subtree from the rest of the document, allowing the browser to skip layout, paint, and style recalculations outside the container during DOM mutations.",
      "explanation": "The contain property informs the browser that an element’s subtree is independent of the rest of the page, scoping reflow and repaint boundaries."
    },
    {
      "type": "debugging",
      "difficulty": "hard",
      "question": "Why does animating CSS `transform` and `opacity` perform smoothly at 60fps, whereas animating `width`, `height`, or `top` causes layout thrashing and stutter (jank)?",
      "options": [
        "`transform` and `opacity` are composite-only properties processed on the GPU without triggering CPU reflow (layout) or repaint stages.",
        "`width` and `height` are disabled in modern GPU drivers.",
        "CSS transforms bypass the browser window completely.",
        "`top` and `left` require synchronous network roundtrips."
      ],
      "correctAnswer": "`transform` and `opacity` are composite-only properties processed on the GPU without triggering CPU reflow (layout) or repaint stages.",
      "explanation": "Properties like width/top force the browser through the full pipeline: Layout -> Paint -> Composite. transform/opacity run entirely on the Compositor thread on GPU."
    },
    {
      "type": "code_reading",
      "difficulty": "hard",
      "question": "What does the CSS selector `:is(h1, h2, h3):has(+ p)` match?",
      "options": [
        "Any h1, h2, or h3 element that is immediately followed by a paragraph (<p>) element.",
        "Any paragraph followed by a heading.",
        "All headings and all paragraphs on the page.",
        "Headings containing a paragraph inside their tag."
      ],
      "correctAnswer": "Any h1, h2, or h3 element that is immediately followed by a paragraph (<p>) element.",
      "explanation": "`:has(+ p)` is a relational pseudo-class checking that the element has an immediate sibling matching `p`, scoped by `:is(h1, h2, h3)`."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "What is a Block Formatting Context (BFC) in CSS, and how can one be created to prevent margin collapse and contain floated children?",
      "options": [
        "An isolated visual CSS rendering region where margins do not collapse outside it; created using `display: flow-root;`, `overflow: hidden;`, or `display: flex;`.",
        "A JavaScript API for styling elements.",
        "A browser window container.",
        "A database caching layer for styles."
      ],
      "correctAnswer": "An isolated visual CSS rendering region where margins do not collapse outside it; created using `display: flow-root;`, `overflow: hidden;`, or `display: flex;`.",
      "explanation": "A BFC dictates how block boxes are laid out. Creating a BFC (e.g. via display: flow-root) clears internal floats and stops margin collapse across boundaries."
    },
    {
      "type": "mcq",
      "difficulty": "hard",
      "question": "In CSS Container Queries (`@container`), what is the key advancement over traditional Media Queries (`@media`)?",
      "options": [
        "Styles are evaluated based on the width/dimensions of the parent container element rather than the entire browser viewport.",
        "Container queries can only style images.",
        "Container queries run on the web server before delivery.",
        "They replace CSS Grid completely."
      ],
      "correctAnswer": "Styles are evaluated based on the width/dimensions of the parent container element rather than the entire browser viewport.",
      "explanation": "Container queries enable true component-driven responsive design: a card component adapts its internal layout based on its immediate container width."
    }
  ],
  "React": [
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What is the primary role of the `key` prop when rendering lists of elements in React?",
      "options": [
        "Provides a stable identity across renders, helping React’s Reconciliation algorithm determine which items have changed, been added, or removed.",
        "Serves as the unique CSS class name for the element.",
        "Encrypts list items in DOM memory.",
        "Sets the element tab index for accessibility."
      ],
      "correctAnswer": "Provides a stable identity across renders, helping React’s Reconciliation algorithm determine which items have changed, been added, or removed.",
      "explanation": "Keys allow React to differentiate list items during reconciliation. Without stable keys, React may re-render or confuse state across mutating lists."
    },
    {
      "type": "code_reading",
      "difficulty": "easy",
      "question": "What does the `useState` hook return in a React functional component?",
      "options": [
        "An array with exactly two elements: the current state value and a state updater function.",
        "A JavaScript Promise resolving to state.",
        "A mutable object containing state properties.",
        "A callback function only."
      ],
      "correctAnswer": "An array with exactly two elements: the current state value and a state updater function.",
      "explanation": "const [state, setState] = useState(initialValue) returns a two-element tuple destructured into current value and setter."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "Why must React state never be mutated directly (e.g. `state.count = 5`)?",
      "options": [
        "Direct mutations do not trigger a component re-render and corrupt React’s virtual DOM change detection.",
        "Direct mutations cause an immediate JavaScript syntax error.",
        "React converts all state properties into frozen Strings.",
        "Direct mutations bypass browser cookies."
      ],
      "correctAnswer": "Direct mutations do not trigger a component re-render and corrupt React’s virtual DOM change detection.",
      "explanation": "React relies on shallow reference inequality (Object.is) to detect changes. Mutating state in-place preserves old object references, skipping re-renders."
    },
    {
      "type": "output_prediction",
      "difficulty": "easy",
      "question": "When does the cleanup function returned by `useEffect` execute in a React component?",
      "options": [
        "Before the effect runs again on dependency changes, and when the component unmounts.",
        "Only when the browser window closes.",
        "Immediately before the component renders for the first time.",
        "Every time the user clicks on the page."
      ],
      "correctAnswer": "Before the effect runs again on dependency changes, and when the component unmounts.",
      "explanation": "Cleanup functions clean up subscriptions, timers, or event listeners from the previous render before re-running the effect, and upon unmount."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What is JSX in React?",
      "options": [
        "A syntax extension for JavaScript that looks like HTML, compiling into React.createElement() or jsx-runtime function calls.",
        "A separate programming language that replaces JavaScript.",
        "A database query language for MongoDB.",
        "A CSS preprocessor like Sass."
      ],
      "correctAnswer": "A syntax extension for JavaScript that looks like HTML, compiling into React.createElement() or jsx-runtime function calls.",
      "explanation": "JSX allows developers to write declarative HTML-like markup inside JavaScript files, which Babel/TypeScript compiles into standard JS element trees."
    },
    {
      "type": "mcq",
      "difficulty": "medium",
      "question": "What is the distinction between `useMemo` and `useCallback` in React?",
      "options": [
        "`useMemo` memoizes the calculated result of a function; `useCallback` memoizes the function definition itself across renders.",
        "`useMemo` is for asynchronous code, while `useCallback` is synchronous.",
        "`useCallback` triggers component re-renders automatically.",
        "Both are identical in functionality."
      ],
      "correctAnswer": "`useMemo` memoizes the calculated result of a function; `useCallback` memoizes the function definition itself across renders.",
      "explanation": "useMemo(() => computeValue(a), [a]) caches the return value; useCallback(fn, deps) is syntactic sugar for useMemo(() => fn, deps), caching function references."
    },
    {
      "type": "debugging",
      "difficulty": "medium",
      "question": "Why does passing an inline object literal or arrow function as a prop to a `React.memo` child component cause it to re-render every time the parent renders?",
      "options": [
        "A new object or function reference is allocated in memory on every parent render, failing shallow prop equality comparison in React.memo.",
        "React.memo is broken in React 18.",
        "Inline functions are converted to NaN.",
        "Child components cannot receive functions as props."
      ],
      "correctAnswer": "A new object or function reference is allocated in memory on every parent render, failing shallow prop equality comparison in React.memo.",
      "explanation": "React.memo performs shallow comparison (`prevProps[key] === nextProps[key]`). New object/function allocations create new memory addresses, triggering re-render."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "What is the role of `useRef` in React functional components?",
      "options": [
        "Creates a mutable reference object whose `.current` property persists across renders without triggering a re-render when modified.",
        "Creates a memoized callback function.",
        "Refreshes the component every second.",
        "Fetches data from an external REST API."
      ],
      "correctAnswer": "Creates a mutable reference object whose `.current` property persists across renders without triggering a re-render when modified.",
      "explanation": "useRef holds references to DOM nodes or mutable values that persist across renders without causing the component to re-render on mutation."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "When should the React Context API be used instead of prop drilling?",
      "options": [
        "When data (theme, authenticated user, localization) needs to be accessible by many components at different nesting levels throughout the tree.",
        "For high-frequency state updates changing multiple times per second (e.g., animations or mouse tracking).",
        "To replace database storage on the server.",
        "Context should never be used in React."
      ],
      "correctAnswer": "When data (theme, authenticated user, localization) needs to be accessible by many components at different nesting levels throughout the tree.",
      "explanation": "Context broadcasts global/ambient state across component subtrees without passing props manually down every intermediate level."
    },
    {
      "type": "debugging",
      "difficulty": "medium",
      "question": "Why does React 18 execute `useEffect` twice on initial mount in development mode when wrapped in `<React.StrictMode>`?",
      "options": [
        "To intentionally simulate an immediate remount, verifying that cleanup functions properly tear down side effects and prevent memory leaks.",
        "It is a bug in the React 18 development compiler.",
        "To test multi-threading in the browser.",
        "To double the execution speed of the effect."
      ],
      "correctAnswer": "To intentionally simulate an immediate remount, verifying that cleanup functions properly tear down side effects and prevent memory leaks.",
      "explanation": "Strict Mode mounts, unmounts, and remounts components in development to ensure effects are resilient to Fast Refresh and future concurrent features."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "How does React 18 Concurrent Rendering with `useTransition` and `useDeferredValue` prevent input lag during heavy component updates?",
      "options": [
        "It marks heavy state updates as non-urgent transitions that yield CPU control back to the browser to prioritize urgent user interactions (typing, clicking).",
        "It executes React components inside Web Workers on a separate thread.",
        "It compresses the virtual DOM into binary format.",
        "It pauses browser network traffic during rendering."
      ],
      "correctAnswer": "It marks heavy state updates as non-urgent transitions that yield CPU control back to the browser to prioritize urgent user interactions (typing, clicking).",
      "explanation": "Concurrent React can interrupt, pause, or discard non-urgent render calculations to keep the main thread responsive to urgent user events."
    },
    {
      "type": "code_reading",
      "difficulty": "hard",
      "question": "What is the purpose of React Error Boundaries, and why can they only be implemented using class components (or libraries wrapping them)?",
      "options": [
        "Error boundaries catch JavaScript errors in their child component tree via `componentDidCatch` or `getDerivedStateFromError`, preventing the entire app from crashing.",
        "Error boundaries catch asynchronous errors in Promise rejections.",
        "Error boundaries prevent HTTP 404 network errors.",
        "Error boundaries automatically rewrite broken JSX syntax."
      ],
      "correctAnswer": "Error boundaries catch JavaScript errors in their child component tree via `componentDidCatch` or `getDerivedStateFromError`, preventing the entire app from crashing.",
      "explanation": "Error boundaries provide fallback UI when unhandled rendering exceptions occur in descendants. React does not currently have a functional hook equivalent for componentDidCatch."
    },
    {
      "type": "debugging",
      "difficulty": "hard",
      "question": "What is a \"stale closure\" bug in React hooks, and how can it be avoided?",
      "options": [
        "When an effect or callback captures state or props from an earlier render because it was omitted from the dependency array; solved by providing accurate dependencies or functional state updates.",
        "When a component mounts after the page is closed.",
        "When cookies expire during component rendering.",
        "A bug caused by having more than 5 useState hooks in one file."
      ],
      "correctAnswer": "When an effect or callback captures state or props from an earlier render because it was omitted from the dependency array; solved by providing accurate dependencies or functional state updates.",
      "explanation": "Missing dependency array entries cause functions to reference old lexical closures holding outdated state values. Using updater functions (`setCount(c => c + 1)`) resolves it."
    },
    {
      "type": "mcq",
      "difficulty": "hard",
      "question": "What is the difference between React Server Components (RSC) and standard Client Components?",
      "options": [
        "Server Components execute exclusively on the server, have zero client bundle size impact, and directly access backend resources without sending code to the browser.",
        "Server Components cannot fetch data from databases.",
        "Server Components replace HTML files on disk.",
        "Client components cannot use useState or useEffect."
      ],
      "correctAnswer": "Server Components execute exclusively on the server, have zero client bundle size impact, and directly access backend resources without sending code to the browser.",
      "explanation": "RSCs render into a streaming JSON-like representation on the server, keeping heavy dependencies server-side and reducing JavaScript shipped to the client."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "How does React’s synthetic event system differ from native browser DOM events in React 17+?",
      "options": [
        "React attaches synthetic event listeners at the root DOM container (`#root`) rather than the document object, wrapping native events in a cross-browser abstraction.",
        "React intercepts OS mouse hardware interrupts directly.",
        "Synthetic events bypass event bubbling and capturing.",
        "Synthetic events are serialized into WebSocket frames."
      ],
      "correctAnswer": "React attaches synthetic event listeners at the root DOM container (`#root`) rather than the document object, wrapping native events in a cross-browser abstraction.",
      "explanation": "Since React 17, delegated event listeners attach to the root container where ReactDOM.createRoot is called, ensuring safe co-existence with non-React legacy islands."
    }
  ],
  "Node.js": [
    {
      "difficulty": "easy",
      "question": "What is the primary role of the Event Loop in Node.js?",
      "options": [
        "It coordinates non-blocking asynchronous I/O operations using a single execution thread by offloading operations to libuv.",
        "It compiles JavaScript into native C++ assembly code during runtime.",
        "It allocates separate physical CPU cores for every incoming HTTP request.",
        "It acts as an in-memory relational database cache."
      ],
      "correctAnswer": "It coordinates non-blocking asynchronous I/O operations using a single execution thread by offloading operations to libuv.",
      "explanation": "Node.js utilizes a single-threaded event loop powered by libuv to handle concurrent asynchronous I/O operations efficiently without multithreading overhead."
    },
    {
      "difficulty": "easy",
      "question": "Which core module in Node.js provides asynchronous file system access APIs?",
      "options": [
        "fs",
        "path",
        "http",
        "os"
      ],
      "correctAnswer": "fs",
      "explanation": "The core fs (File System) module exports both callback-based and Promise-based functions for file interactions."
    },
    {
      "difficulty": "easy",
      "question": "What does process.nextTick() do in the Node.js event loop?",
      "options": [
        "Schedules a callback to be invoked immediately after the current operation completes, before the event loop advances to any other phase.",
        "Waits for the next timer phase tick after 1000 milliseconds.",
        "Spawns a child worker process on another CPU core.",
        "Forces the garbage collector to immediately run."
      ],
      "correctAnswer": "Schedules a callback to be invoked immediately after the current operation completes, before the event loop advances to any other phase.",
      "explanation": "process.nextTick() queues callbacks in the microtask queue, which drains right after the current operation finishes and before entering the next phase of the event loop."
    },
    {
      "difficulty": "easy",
      "question": "What is the purpose of Buffer in Node.js?",
      "options": [
        "To handle and manipulate raw binary octet streams directly in memory.",
        "To encrypt passwords using bcrypt.",
        "To compile TypeScript files.",
        "To store global session variables in MongoDB."
      ],
      "correctAnswer": "To handle and manipulate raw binary octet streams directly in memory.",
      "explanation": "Buffers are allocated outside the V8 heap as raw memory chunks designed for handling binary data streams like files and network packets."
    },
    {
      "difficulty": "easy",
      "question": "In Node.js CommonJS module specification, how do you import another module?",
      "options": [
        "require()",
        "import() only",
        "include()",
        "using()"
      ],
      "correctAnswer": "require()",
      "explanation": "In CommonJS, require(\"module_name\") is the synchronous function used to load modules."
    },
    {
      "difficulty": "medium",
      "question": "How does Node.js handle CPU-intensive tasks without blocking the main event loop?",
      "options": [
        "By utilizing the worker_threads module to execute CPU-bound work on separate OS threads.",
        "By running multiple event loops inside the single main thread.",
        "By automatically pausing all incoming HTTP connections until computation completes.",
        "By converting synchronous loops into native SQL queries."
      ],
      "correctAnswer": "By utilizing the worker_threads module to execute CPU-bound work on separate OS threads.",
      "explanation": "The worker_threads module enables developers to run isolated JavaScript execution threads with shared memory (SharedArrayBuffer) for CPU-bound computations."
    },
    {
      "difficulty": "medium",
      "question": "What is the key difference between setImmediate() and setTimeout(fn, 0)?",
      "options": [
        "setImmediate runs in the check phase of the event loop; setTimeout(fn, 0) runs in the timers phase once the minimum delay threshold expires.",
        "setImmediate runs on a child thread; setTimeout runs on the parent thread.",
        "setImmediate runs before process.nextTick.",
        "setTimeout(fn, 0) guarantees zero-millisecond execution regardless of queue state."
      ],
      "correctAnswer": "setImmediate runs in the check phase of the event loop; setTimeout(fn, 0) runs in the timers phase once the minimum delay threshold expires.",
      "explanation": "setImmediate is designed to execute a script once the current poll phase completes (in the check phase), whereas setTimeout executes in the timers phase."
    },
    {
      "difficulty": "medium",
      "question": "Which stream mode in Node.js pulls data from the source only when stream.read() is explicitly called?",
      "options": [
        "Paused mode (non-flowing)",
        "Flowing mode",
        "Detached mode",
        "Batch mode"
      ],
      "correctAnswer": "Paused mode (non-flowing)",
      "explanation": "In paused mode, readable streams emit \"readable\" events and require stream.read() calls to pull chunks, giving fine-grained backpressure control."
    },
    {
      "difficulty": "medium",
      "question": "What is backpressure in Node.js streams and how does stream.pipe() address it?",
      "options": [
        "Backpressure happens when the reader cannot consume data as fast as the writer produces it; pipe() automatically pauses the readable stream until the writable drains.",
        "Backpressure is a network DNS resolution failure.",
        "Backpressure occurs when the database connection pool runs out of sockets.",
        "pipe() forces the reader to drop packets that arrive too quickly."
      ],
      "correctAnswer": "Backpressure happens when the reader cannot consume data as fast as the writer produces it; pipe() automatically pauses the readable stream until the writable drains.",
      "explanation": "stream.pipe() handles backpressure by listening for false return values on write() and pausing the source until the drain event is emitted."
    },
    {
      "difficulty": "medium",
      "question": "What does the EventEmitter.emit() method return in Node.js?",
      "options": [
        "true if the event had listeners, false otherwise.",
        "The return value of the last listener function called.",
        "A Promise resolving to void.",
        "An array of all listener return values."
      ],
      "correctAnswer": "true if the event had listeners, false otherwise.",
      "explanation": "EventEmitter.prototype.emit returns a boolean indicating whether any registered listeners were invoked for the emitted event."
    },
    {
      "difficulty": "hard",
      "question": "In libuv, what is the default size of the threadpool used for asynchronous file system and crypto operations, and how can it be adjusted?",
      "options": [
        "Default is 4 threads; it can be adjusted up to 1024 by setting the UV_THREADPOOL_SIZE environment variable before process startup.",
        "Default is 16 threads; adjusted via process.setThreadCount().",
        "Default is equal to the number of CPU cores; adjusted via cluster.threads.",
        "Default is 1 thread; cannot be changed."
      ],
      "correctAnswer": "Default is 4 threads; it can be adjusted up to 1024 by setting the UV_THREADPOOL_SIZE environment variable before process startup.",
      "explanation": "libuv allocates 4 background worker threads by default. Setting UV_THREADPOOL_SIZE before launching Node alters this threadpool size."
    },
    {
      "difficulty": "hard",
      "question": "What causes an unhandled promise rejection to terminate the Node.js process by default in modern Node versions (v15+)?",
      "options": [
        "--unhandled-rejections=throw is the default behavior to prevent silent failure and corrupted state.",
        "V8 garbage collector crashes when encountering unresolved promises.",
        "Operating system kill signals (SIGSEGV) are issued by the kernel.",
        "Memory overflows automatically terminate the process."
      ],
      "correctAnswer": "--unhandled-rejections=throw is the default behavior to prevent silent failure and corrupted state.",
      "explanation": "Since Node v15, unhandledRejections defaults to \"throw\", causing unhandled promise rejections to throw an uncaught exception and exit with status 1."
    },
    {
      "difficulty": "hard",
      "question": "What is the purpose of the cluster module in Node.js and how does it distribute incoming network connections across workers on POSIX systems?",
      "options": [
        "It forks child processes that share server ports, using a round-robin scheduling approach where the master accepts sockets and handshakes them to workers.",
        "It serializes memory across nodes using Redis Pub/Sub.",
        "It shares V8 heap memory pointers across independent OS processes.",
        "It compiles code into multiple WebAssembly threads."
      ],
      "correctAnswer": "It forks child processes that share server ports, using a round-robin scheduling approach where the master accepts sockets and handshakes them to workers.",
      "explanation": "The cluster module creates multiple worker processes sharing a port. On POSIX systems, the primary process uses round-robin load balancing to dispatch sockets."
    },
    {
      "difficulty": "hard",
      "question": "Why can holding references in closures inside long-lived event listeners cause memory leaks in Node.js?",
      "options": [
        "Because the closure retains lexical variables in memory as long as the listener is attached to the EventEmitter, preventing V8 garbage collection.",
        "Because EventEmitters automatically write closures to the filesystem swap space.",
        "Because V8 does not support garbage collection on closures.",
        "Because libuv deletes closure scopes after 30 seconds."
      ],
      "correctAnswer": "Because the closure retains lexical variables in memory as long as the listener is attached to the EventEmitter, preventing V8 garbage collection.",
      "explanation": "If an EventEmitter survives in memory and has a listener holding a closure, all referenced scope variables remain reachable from the GC root and cannot be collected."
    },
    {
      "difficulty": "hard",
      "question": "Which method should be used to securely compare two HMAC authorization tokens in Node.js to prevent timing attacks?",
      "options": [
        "crypto.timingSafeEqual(bufferA, bufferB)",
        "bufferA.equals(bufferB)",
        "bufferA.toString() === bufferB.toString()",
        "Object.is(bufferA, bufferB)"
      ],
      "correctAnswer": "crypto.timingSafeEqual(bufferA, bufferB)",
      "explanation": "crypto.timingSafeEqual runs in constant time regardless of where discrepancies occur, preventing side-channel timing attacks that exploit early exits in equality checks."
    }
  ],
  "Express.js": [
    {
      "difficulty": "easy",
      "question": "What is Express.js middleware?",
      "options": [
        "A function with access to the request object (req), response object (res), and the next middleware function (next) in the application cycle.",
        "A specialized database driver for PostgreSQL.",
        "A browser-side caching mechanism for React components.",
        "A hardware load balancer."
      ],
      "correctAnswer": "A function with access to the request object (req), response object (res), and the next middleware function (next) in the application cycle.",
      "explanation": "Middleware functions in Express execute during the request-response cycle and can run code, mutate req/res, end the cycle, or call next()."
    },
    {
      "difficulty": "easy",
      "question": "Which built-in middleware is used in Express (v4.16+) to parse incoming JSON request payloads?",
      "options": [
        "express.json()",
        "express.bodyParser()",
        "express.parseJson()",
        "express.urlencoded()"
      ],
      "correctAnswer": "express.json()",
      "explanation": "express.json() is built into Express to parse incoming requests with JSON payloads based on body-parser."
    },
    {
      "difficulty": "easy",
      "question": "How do you extract a URL path route parameter like \"/users/:id\" in an Express handler?",
      "options": [
        "req.params.id",
        "req.query.id",
        "req.body.id",
        "req.headers.id"
      ],
      "correctAnswer": "req.params.id",
      "explanation": "Route parameters specified with a colon prefix are populated in the req.params object."
    },
    {
      "difficulty": "easy",
      "question": "What happens if an Express middleware function does not call next() and does not send a response?",
      "options": [
        "The client request hangs indefinitely until a socket timeout occurs.",
        "Express automatically sends a 200 OK empty response.",
        "The request immediately throws a TypeError.",
        "The server process crashes."
      ],
      "correctAnswer": "The client request hangs indefinitely until a socket timeout occurs.",
      "explanation": "If next() is not called and a response is not finalized via res.send() / res.json(), execution stops and the request hangs."
    },
    {
      "difficulty": "easy",
      "question": "How do you define a route in Express that matches HTTP POST requests to \"/api/login\"?",
      "options": [
        "app.post(\"/api/login\", handler)",
        "app.get(\"/api/login\", handler)",
        "app.route(\"/api/login\").send(handler)",
        "app.create(\"/api/login\", handler)"
      ],
      "correctAnswer": "app.post(\"/api/login\", handler)",
      "explanation": "app.post() defines a route handler for incoming HTTP POST requests to the specified path."
    },
    {
      "difficulty": "medium",
      "question": "How does Express identify an error-handling middleware function compared to standard middleware?",
      "options": [
        "By declaring exactly four arguments: (err, req, res, next).",
        "By adding the decorator @ErrorHandler to the function.",
        "By returning an instance of Error from the function.",
        "By naming the function \"handleError\"."
      ],
      "correctAnswer": "By declaring exactly four arguments: (err, req, res, next).",
      "explanation": "Express inspects function.length (arity). When a middleware accepts exactly 4 arguments (err, req, res, next), Express registers it as an error handler."
    },
    {
      "difficulty": "medium",
      "question": "What is the purpose of express.Router()?",
      "options": [
        "To create modular, mountable route handlers and sub-routes in separate files.",
        "To configure DNS nameservers for network routing.",
        "To establish WebRTC peer-to-peer data channels.",
        "To proxy client requests to external CDN endpoints."
      ],
      "correctAnswer": "To create modular, mountable route handlers and sub-routes in separate files.",
      "explanation": "express.Router creates isolated router instances that can be exported and mounted onto parent app paths via app.use(\"/prefix\", router)."
    },
    {
      "difficulty": "medium",
      "question": "What does the cors package middleware do when mounted in an Express application?",
      "options": [
        "Sets appropriate Cross-Origin Resource Sharing HTTP headers (e.g., Access-Control-Allow-Origin) to allow cross-origin requests from web browsers.",
        "Encrypts all inbound request payloads using SSL certificates.",
        "Gzips HTTP response streams to minimize payload size.",
        "Prevents SQL injection vulnerabilities in database queries."
      ],
      "correctAnswer": "Sets appropriate Cross-Origin Resource Sharing HTTP headers (e.g., Access-Control-Allow-Origin) to allow cross-origin requests from web browsers.",
      "explanation": "CORS middleware sets headers like Access-Control-Allow-Origin and handles browser preflight OPTIONS requests."
    },
    {
      "difficulty": "medium",
      "question": "Which method should be used to serve static assets like images, CSS, and client-side JavaScript in Express?",
      "options": [
        "app.use(express.static(\"public\"))",
        "app.use(express.files(\"public\"))",
        "app.get(\"*\", express.serve)",
        "app.mount(\"public\")"
      ],
      "correctAnswer": "app.use(express.static(\"public\"))",
      "explanation": "express.static is the built-in middleware in Express based on serve-static for serving static directory assets."
    },
    {
      "difficulty": "medium",
      "question": "How do you handle unhandled asynchronous errors in route handlers in Express 4 without crashing the application?",
      "options": [
        "Wrap asynchronous logic in try/catch and pass the caught error to next(error).",
        "Return false from the route handler function.",
        "Throw the error directly; Express 4 catches all async rejections automatically.",
        "Use process.exit(0)."
      ],
      "correctAnswer": "Wrap asynchronous logic in try/catch and pass the caught error to next(error).",
      "explanation": "In Express 4, promise rejections inside async route handlers are not caught automatically; they must be caught and routed via next(err)."
    },
    {
      "difficulty": "hard",
      "question": "How does the helmet security middleware improve security in Express applications?",
      "options": [
        "By setting critical HTTP response security headers such as Content-Security-Policy, X-Frame-Options, and Strict-Transport-Security.",
        "By filtering malicious SQL tokens out of req.body.",
        "By automatically generating public/private RSA keypairs.",
        "By blocking all incoming TCP connections from foreign IP addresses."
      ],
      "correctAnswer": "By setting critical HTTP response security headers such as Content-Security-Policy, X-Frame-Options, and Strict-Transport-Security.",
      "explanation": "Helmet sets 15+ HTTP response headers to defend against clickjacking, MIME-type sniffing, cross-site scripting (XSS), and insecure protocols."
    },
    {
      "difficulty": "hard",
      "question": "What is the risk of using express.urlencoded({ extended: true }) without input sanitization or schema validation?",
      "options": [
        "The qs library allows deeply nested objects and prototype pollution vectors if unvalidated input is merged into application state.",
        "It disables HTTPS encryption on all incoming endpoints.",
        "It forces all incoming strings to convert into Buffer objects.",
        "It causes memory leaks by retaining every request body in global scope."
      ],
      "correctAnswer": "The qs library allows deeply nested objects and prototype pollution vectors if unvalidated input is merged into application state.",
      "explanation": "extended: true uses qs which parses rich nested objects. Merging untrusted parsed bodies can lead to prototype pollution or parameter injection vulnerabilities."
    },
    {
      "difficulty": "hard",
      "question": "When implementing rate limiting in an Express distributed environment across multiple server instances, why is in-memory rate limiting inadequate?",
      "options": [
        "Because requests routed by a load balancer hit different server instances, meaning each instance tracks only a subset of requests; a shared datastore like Redis is required.",
        "Because Node.js cannot store numbers in memory.",
        "Because in-memory storage blocks the event loop on every request.",
        "Because Express crashes when memory usage exceeds 100 MB."
      ],
      "correctAnswer": "Because requests routed by a load balancer hit different server instances, meaning each instance tracks only a subset of requests; a shared datastore like Redis is required.",
      "explanation": "In multi-instance deployments, each process has isolated RAM. A centralized fast key-value store (like Redis) ensures rate limits are globally enforced across all nodes."
    },
    {
      "difficulty": "hard",
      "question": "What does res.locals represent in Express and how is its lifecycle bounded?",
      "options": [
        "An object scoped strictly to the current request lifecycle, useful for passing request-specific data across middleware and rendering views.",
        "A persistent cross-session cookie cache stored in the browser.",
        "A permanent server-level configuration dictionary stored in database.",
        "A global variable shared across all concurrent requests."
      ],
      "correctAnswer": "An object scoped strictly to the current request lifecycle, useful for passing request-specific data across middleware and rendering views.",
      "explanation": "res.locals is an object scoped to the lifetime of the request. It is garbage-collected when the request-response cycle terminates."
    },
    {
      "difficulty": "hard",
      "question": "Why should the \"X-Powered-By\" header be removed in production Express applications (app.disable(\"x-powered-by\"))?",
      "options": [
        "It broadcasts that the server runs Express, helping attackers target specific framework version CVE vulnerabilities during reconnaissance.",
        "It breaks HTTP/2 protocol compression.",
        "It causes browser rendering bugs in Safari.",
        "It increases TLS handshake time by 50ms."
      ],
      "correctAnswer": "It broadcasts that the server runs Express, helping attackers target specific framework version CVE vulnerabilities during reconnaissance.",
      "explanation": "Disabling X-Powered-By obscures backend server technology (security through obscurity) to avoid automated fingerprinting."
    }
  ],
  "FastAPI": [
    {
      "difficulty": "easy",
      "question": "What two foundational Python libraries is FastAPI primarily built upon?",
      "options": [
        "Starlette for web routing/async performance and Pydantic for data validation/serialization.",
        "Django and Flask.",
        "Tornado and SQLAlchemy.",
        "Celery and BeautifulSoup."
      ],
      "correctAnswer": "Starlette for web routing/async performance and Pydantic for data validation/serialization.",
      "explanation": "FastAPI leverages Starlette for its high-performance async ASGI web core and Pydantic for data modeling and parsing."
    },
    {
      "difficulty": "easy",
      "question": "Which ASGI web server is standard and recommended for executing FastAPI applications in production?",
      "options": [
        "Uvicorn",
        "Apache HTTPD",
        "Gunicorn alone without worker",
        "mod_wsgi"
      ],
      "correctAnswer": "Uvicorn",
      "explanation": "Uvicorn is a lightning-fast ASGI server implementation powered by uvloop and httptools, ideal for FastAPI."
    },
    {
      "difficulty": "easy",
      "question": "How does FastAPI automatically generate interactive API documentation?",
      "options": [
        "It inspects Python type hints and Pydantic schemas to generate OpenAPI specifications rendered via Swagger UI (/docs) and ReDoc (/redoc).",
        "By scraping source code docstrings with Sphinx.",
        "By requiring developers to write a YAML schema manually before starting the app.",
        "By pinging an external documentation service in the cloud."
      ],
      "correctAnswer": "It inspects Python type hints and Pydantic schemas to generate OpenAPI specifications rendered via Swagger UI (/docs) and ReDoc (/redoc).",
      "explanation": "FastAPI natively parses Python type annotations to compile OpenAPI 3.0 schemas, offering automatic Swagger UI and ReDoc pages."
    },
    {
      "difficulty": "easy",
      "question": "In FastAPI, how do you define a request body schema for incoming JSON payloads?",
      "options": [
        "By creating a class that inherits from pydantic.BaseModel and declaring it as a parameter in the path operation function.",
        "By using the json.loads() module inside every route.",
        "By subclassing http.server.BaseHTTPRequestHandler.",
        "By defining a Python namedtuple."
      ],
      "correctAnswer": "By creating a class that inherits from pydantic.BaseModel and declaring it as a parameter in the path operation function.",
      "explanation": "Pydantic models subclassing BaseModel declare schema attributes and type constraints, which FastAPI parses and validates automatically."
    },
    {
      "difficulty": "easy",
      "question": "What Python keyword is used to declare asynchronous endpoint functions in FastAPI?",
      "options": [
        "async def",
        "def async",
        "thread def",
        "coroutine def"
      ],
      "correctAnswer": "async def",
      "explanation": "async def defines asynchronous coroutine functions in Python that can yield control via await."
    },
    {
      "difficulty": "medium",
      "question": "What is the purpose of the Depends() function in FastAPI?",
      "options": [
        "It implements Dependency Injection to declare reusable logic (e.g. database sessions, authentication, query parsing) injected into endpoints.",
        "It checks whether third-party pip packages are installed.",
        "It schedules delayed background cron jobs.",
        "It imports external JavaScript libraries into Swagger UI."
      ],
      "correctAnswer": "It implements Dependency Injection to declare reusable logic (e.g. database sessions, authentication, query parsing) injected into endpoints.",
      "explanation": "Depends() is FastAPI’s dependency injection system, enabling modular, reusable, testable components like auth, DB sessions, and security checks."
    },
    {
      "difficulty": "medium",
      "question": "How does FastAPI differentiate between path parameters, query parameters, and request body attributes in function signatures?",
      "options": [
        "Path parameters match variables in the route path; singular primitive types not in path become query params; Pydantic models become request body.",
        "All parameters are treated as query parameters unless decorated with @path.",
        "FastAPI inspects the variable names against a global dictionary.",
        "Only request body parameters are allowed in function signatures."
      ],
      "correctAnswer": "Path parameters match variables in the route path; singular primitive types not in path become query params; Pydantic models become request body.",
      "explanation": "FastAPI detects path params from the URL template, primitive type hints (int, str) as query params, and Pydantic models as the JSON body."
    },
    {
      "difficulty": "medium",
      "question": "What does FastAPI do when a request fails Pydantic data validation (e.g., passing a string for an integer field)?",
      "options": [
        "It immediately returns an HTTP 422 Unprocessable Entity status code with detailed JSON error diagnostics indicating the exact field and error.",
        "It returns an HTTP 500 Internal Server Error.",
        "It coerces the value to 0 and continues execution silently.",
        "It halts the server process."
      ],
      "correctAnswer": "It immediately returns an HTTP 422 Unprocessable Entity status code with detailed JSON error diagnostics indicating the exact field and error.",
      "explanation": "Validation failures generate an HTTP 422 Unprocessable Entity response containing structured details regarding the offending field and validation rule."
    },
    {
      "difficulty": "medium",
      "question": "How can background tasks be scheduled in FastAPI to execute after sending the HTTP response back to the client?",
      "options": [
        "By declaring a parameter of type fastapi.BackgroundTasks and calling tasks.add_task(task_func, *args).",
        "By spawning an OS subprocess with subprocess.Popen().",
        "By starting a new thread manually with threading.Thread().start().",
        "By using time.sleep() before the return statement."
      ],
      "correctAnswer": "By declaring a parameter of type fastapi.BackgroundTasks and calling tasks.add_task(task_func, *args).",
      "explanation": "FastAPI includes BackgroundTasks from Starlette, allowing post-response execution for lightweight background jobs like sending emails."
    },
    {
      "difficulty": "medium",
      "question": "What is the purpose of response_model in FastAPI route decorators (e.g., @app.get(\"/users\", response_model=UserOut))?",
      "options": [
        "It filters and serializes output data, ensuring sensitive fields (like password hashes) are excluded from the HTTP response.",
        "It specifies the SQL database schema table.",
        "It converts HTML templates into PDF documents.",
        "It enforces client-side cookies."
      ],
      "correctAnswer": "It filters and serializes output data, ensuring sensitive fields (like password hashes) are excluded from the HTTP response.",
      "explanation": "response_model validates, serializes, and filters the outgoing response data according to the schema, preventing data leakage."
    },
    {
      "difficulty": "hard",
      "question": "When defining a synchronous route with \"def\" instead of \"async def\" in FastAPI, how does FastAPI execute the function to avoid blocking the event loop?",
      "options": [
        "It automatically offloads the synchronous function to an external threadpool (anyio.to_thread) so the main event loop is never blocked.",
        "It converts the synchronous code to async coroutines via bytecode transformation.",
        "It blocks the entire web server until the function finishes execution.",
        "It raises a NotImplementedError at startup."
      ],
      "correctAnswer": "It automatically offloads the synchronous function to an external threadpool (anyio.to_thread) so the main event loop is never blocked.",
      "explanation": "FastAPI runs standard def functions in an external worker threadpool, preserving event loop responsiveness for I/O operations."
    },
    {
      "difficulty": "hard",
      "question": "How do yield dependencies work in FastAPI (e.g. for database session management)?",
      "options": [
        "Code before yield executes before the endpoint; the yielded value is injected into the route; code after yield runs after the response (cleanup/close).",
        "Yield dependencies stream responses chunk by chunk over HTTP/1.1.",
        "Yield dependencies restart the FastAPI process after each request.",
        "Yield dependencies are not supported in FastAPI."
      ],
      "correctAnswer": "Code before yield executes before the endpoint; the yielded value is injected into the route; code after yield runs after the response (cleanup/close).",
      "explanation": "Yield dependencies use Python context manager mechanics: setup code runs before, the value is yielded to the route, and teardown (e.g. db.close()) runs afterwards."
    },
    {
      "difficulty": "hard",
      "question": "What is the benefit of utilizing lifespan context managers over deprecated on_event(\"startup\") and on_event(\"shutdown\") in modern FastAPI?",
      "options": [
        "Lifespan context managers use async with lifespan(app) to handle setup and teardown cleanly with shared state and exception safety.",
        "Lifespan functions execute in parallel on separate worker processes.",
        "Lifespan managers automatically optimize database indexes.",
        "on_event is not deprecated."
      ],
      "correctAnswer": "Lifespan context managers use async with lifespan(app) to handle setup and teardown cleanly with shared state and exception safety.",
      "explanation": "Starlette/FastAPI lifespan managers use async context managers to manage startup/shutdown cleanly with yield, ensuring robust cleanup."
    },
    {
      "difficulty": "hard",
      "question": "How can you enforce OAuth2 Bearer token authentication with password flow in FastAPI?",
      "options": [
        "Using OAuth2PasswordBearer(tokenUrl=\"token\") as a dependency with Security() to extract and validate JWT tokens.",
        "By configuring basic auth in the web browser settings.",
        "By using the crypt module in standard library.",
        "By placing token strings in URL query parameters."
      ],
      "correctAnswer": "Using OAuth2PasswordBearer(tokenUrl=\"token\") as a dependency with Security() to extract and validate JWT tokens.",
      "explanation": "FastAPI provides OAuth2PasswordBearer which integrates with Swagger UI authorization modal and extracts Bearer headers."
    },
    {
      "difficulty": "hard",
      "question": "In high-concurrency production deployments of FastAPI with Uvicorn, how is CPU multiprocessing typically achieved?",
      "options": [
        "By running Gunicorn as a process manager with Uvicorn worker classes (gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app).",
        "By launching multiple instances of Python in separate terminal tabs.",
        "Uvicorn automatically spawns processes equal to CPU cores without any configuration.",
        "By enabling threading=True in FastAPI constructor."
      ],
      "correctAnswer": "By running Gunicorn as a process manager with Uvicorn worker classes (gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app).",
      "explanation": "Gunicorn acts as a battle-tested master process supervisor, managing multiple Uvicorn worker processes to maximize multi-core CPU utilization."
    }
  ],
  "SQL": [
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "In SQL, what is the key difference between `WHERE` and `HAVING` clauses?",
      "options": [
        "`WHERE` filters individual rows before aggregation; `HAVING` filters aggregated group rows after the `GROUP BY` clause.",
        "`WHERE` is for SELECT queries; `HAVING` is for UPDATE queries.",
        "`HAVING` filters rows before grouping; `WHERE` filters after.",
        "`HAVING` can only be used with primary key columns."
      ],
      "correctAnswer": "`WHERE` filters individual rows before aggregation; `HAVING` filters aggregated group rows after the `GROUP BY` clause.",
      "explanation": "WHERE filters base rows prior to grouping and aggregation. HAVING filters the result of aggregate functions (SUM, COUNT, AVG) after GROUP BY."
    },
    {
      "type": "code_reading",
      "difficulty": "easy",
      "question": "What does an `INNER JOIN` between Table A and Table B return?",
      "options": [
        "Only rows where there is a match in both Table A and Table B based on the join predicate.",
        "All rows from Table A regardless of whether they match Table B.",
        "All rows from Table B regardless of whether they match Table A.",
        "The Cartesian product of both tables."
      ],
      "correctAnswer": "Only rows where there is a match in both Table A and Table B based on the join predicate.",
      "explanation": "INNER JOIN combines records from two tables only when the join condition evaluates to true for a pair of rows."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What does the SQL command `TRUNCATE TABLE` do compared to `DELETE FROM table`?",
      "options": [
        "`TRUNCATE` quickly removes all rows by deallocating data pages (DDL, minimal logging, resets auto-increment); `DELETE` removes rows one-by-one logging each row deletion.",
        "`DELETE` deletes the table schema permanently.",
        "`TRUNCATE` can be filtered with a WHERE clause.",
        "`TRUNCATE` only removes duplicate rows."
      ],
      "correctAnswer": "`TRUNCATE` quickly removes all rows by deallocating data pages (DDL, minimal logging, resets auto-increment); `DELETE` removes rows one-by-one logging each row deletion.",
      "explanation": "TRUNCATE is a fast DDL command that resets the table high-water mark and identity columns, whereas DELETE is DML logging row-by-row changes."
    },
    {
      "type": "output_prediction",
      "difficulty": "easy",
      "question": "What is the result of evaluating `SELECT NULL = NULL;` in standard SQL?",
      "options": [
        "UNKNOWN (evaluates to NULL/false in conditionals)",
        "TRUE (1)",
        "FALSE (0)",
        "Syntax Error"
      ],
      "correctAnswer": "UNKNOWN (evaluates to NULL/false in conditionals)",
      "explanation": "In SQL three-valued logic, NULL represents an unknown value. Comparing NULL = NULL yields UNKNOWN. `IS NULL` must be used to test for nullness."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "Which constraint uniquely identifies each record in a database table and disallows NULL values?",
      "options": [
        "PRIMARY KEY",
        "UNIQUE",
        "FOREIGN KEY",
        "CHECK"
      ],
      "correctAnswer": "PRIMARY KEY",
      "explanation": "A PRIMARY KEY uniquely identifies each row in a table, enforcing both uniqueness and NOT NULL constraints simultaneously."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "In SQL transactions, what does the ACID acronym stand for?",
      "options": [
        "Atomicity, Consistency, Isolation, Durability.",
        "Access, Control, Integrity, Distribution.",
        "Authentication, Cipher, Indexing, Decryption.",
        "Allocation, Concurrency, Iteration, Deletion."
      ],
      "correctAnswer": "Atomicity, Consistency, Isolation, Durability.",
      "explanation": "ACID guarantees that database transactions are processed reliably: Atomicity (all or nothing), Consistency (valid state), Isolation (concurrent safety), Durability (persisted)."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "What is the distinction between `UNION` and `UNION ALL` in SQL queries?",
      "options": [
        "`UNION` removes duplicate rows by performing an implicit sort/deduplication; `UNION ALL` combines all rows including duplicates and is significantly faster.",
        "`UNION ALL` can only combine numerical columns.",
        "`UNION` combines columns horizontally like a JOIN.",
        "`UNION ALL` is not standard ANSI SQL."
      ],
      "correctAnswer": "`UNION` removes duplicate rows by performing an implicit sort/deduplication; `UNION ALL` combines all rows including duplicates and is significantly faster.",
      "explanation": "UNION performs expensive deduplication across combined result sets. UNION ALL skips deduplication, delivering higher performance when duplicates are acceptable or impossible."
    },
    {
      "type": "debugging",
      "difficulty": "medium",
      "question": "Why does executing a query with `WHERE column LIKE \"%value\"` prevent standard B-Tree index utilization in relational databases?",
      "options": [
        "A leading wildcard (`%`) prevents the B-Tree index from performing binary range searches, forcing a full table or index scan.",
        "LIKE operators are disabled when indexes exist.",
        "B-Trees only store numbers.",
        "Indexes are corrupted by percentage symbols."
      ],
      "correctAnswer": "A leading wildcard (`%`) prevents the B-Tree index from performing binary range searches, forcing a full table or index scan.",
      "explanation": "B-Tree indexes sort keys from left to right. A leading wildcard means the prefix is unknown, preventing the engine from navigating the tree branch to locate matches."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "What is a Foreign Key constraint and what is the purpose of `ON DELETE CASCADE`?",
      "options": [
        "Enforces referential integrity between child and parent tables; `ON DELETE CASCADE` automatically deletes dependent child rows when the referenced parent row is deleted.",
        "Prevents parents from having more than one child record.",
        "Copies the entire database onto another server.",
        "Encrypts foreign key columns."
      ],
      "correctAnswer": "Enforces referential integrity between child and parent tables; `ON DELETE CASCADE` automatically deletes dependent child rows when the referenced parent row is deleted.",
      "explanation": "Foreign keys link related tables; ON DELETE CASCADE maintains integrity by automatically cleaning up orphan child records when a parent entity is deleted."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "In SQL window functions, what does `ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC)` compute?",
      "options": [
        "Assigns a unique sequential integer (1, 2, 3...) to each row within each department partition, ranked by salary in descending order.",
        "Calculates the total salary of each department.",
        "Filters out employees with the lowest salary.",
        "Sorts the entire table globally without partitions."
      ],
      "correctAnswer": "Assigns a unique sequential integer (1, 2, 3...) to each row within each department partition, ranked by salary in descending order.",
      "explanation": "Window functions compute rankings across subsets (PARTITION BY) without collapsing rows into a single summary row like GROUP BY does."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "In relational database transaction isolation levels, what is a \"Phantom Read\", and which isolation level prevents it?",
      "options": [
        "A transaction re-reads a range of rows and discovers new rows inserted by another committed transaction; prevented by Serializable (or Repeatable Read with next-key locks in InnoDB).",
        "A transaction reads uncommitted changes (dirty read); prevented by Read Committed.",
        "A transaction reads old values from disk cache; prevented by Read Uncommitted.",
        "A transaction deletes its own logs."
      ],
      "correctAnswer": "A transaction re-reads a range of rows and discovers new rows inserted by another committed transaction; prevented by Serializable (or Repeatable Read with next-key locks in InnoDB).",
      "explanation": "Phantom reads occur when concurrent inserts add rows matching a range query. Serializable isolation uses range or predicate locks to prevent phantom inserts."
    },
    {
      "type": "debugging",
      "difficulty": "hard",
      "question": "How do database deadlocks occur between two concurrent SQL transactions, and how does the database engine resolve them?",
      "options": [
        "Each transaction holds a lock the other needs, forming a circular wait dependency; the database deadlock detector detects the cycle and aborts one transaction (the victim) with a rollback.",
        "Both transactions write to the same disk sector simultaneously; the engine restarts the server.",
        "The query execution timeout is exceeded; all connections are closed.",
        "Deadlocks are resolved by converting both queries to SELECT statements."
      ],
      "correctAnswer": "Each transaction holds a lock the other needs, forming a circular wait dependency; the database deadlock detector detects the cycle and aborts one transaction (the victim) with a rollback.",
      "explanation": "Deadlock detection tracks wait-for graphs; on identifying a cycle, the engine breaks it by rolling back the least costly transaction, allowing the other to proceed."
    },
    {
      "type": "code_reading",
      "difficulty": "hard",
      "question": "What is a Common Table Expression (CTE) with the `WITH RECURSIVE` syntax used for in SQL?",
      "options": [
        "Querying hierarchical, tree, or graph-structured data (e.g. organizational charts, bill-of-materials, parent-child categories) by recursively joining an anchor member with itself.",
        "Creating temporary stored procedures on disk.",
        "Running queries in an infinite while loop.",
        "Compressing table indexes."
      ],
      "correctAnswer": "Querying hierarchical, tree, or graph-structured data (e.g. organizational charts, bill-of-materials, parent-child categories) by recursively joining an anchor member with itself.",
      "explanation": "Recursive CTEs execute an anchor member query followed by repeated recursive joins against the working table until no new rows are produced."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "When analyzing slow SQL query performance using `EXPLAIN ANALYZE`, what does an Index Scan versus an Index Only Scan indicate?",
      "options": [
        "Index Scan reads the index to find matching row pointers, then visits the table heap for non-indexed columns; Index Only Scan satisfies the entire query from the index tree without table heap lookups.",
        "Index Scan is always faster than Index Only Scan.",
        "Index Only Scan deletes unused indexes.",
        "Index Scan reads every table row from disk."
      ],
      "correctAnswer": "Index Scan reads the index to find matching row pointers, then visits the table heap for non-indexed columns; Index Only Scan satisfies the entire query from the index tree without table heap lookups.",
      "explanation": "Covering indexes enable Index Only Scans, completely bypassing table heap access because all requested columns exist within the leaf nodes of the index."
    },
    {
      "type": "security",
      "difficulty": "hard",
      "question": "Why are Parameterized Queries (Prepared Statements) the definitive defense against SQL Injection attacks?",
      "options": [
        "The query structure is parsed and compiled first by the database engine; parameters are sent separately as raw data values that can never be executed as SQL commands.",
        "They encrypt the database tables with AES-256.",
        "They replace single quotes with spaces.",
        "They run only inside secure HTTPS certificates."
      ],
      "correctAnswer": "The query structure is parsed and compiled first by the database engine; parameters are sent separately as raw data values that can never be executed as SQL commands.",
      "explanation": "Separating query code from user data ensures that user input is treated strictly as literal data values, completely neutralizing injection payload syntax."
    }
  ],
  "MongoDB": [
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What is the primary document format utilized by MongoDB for storing data on disk and over the wire?",
      "options": [
        "BSON (Binary JSON)",
        "XML",
        "YAML",
        "Plain Text JSON"
      ],
      "correctAnswer": "BSON (Binary JSON)",
      "explanation": "MongoDB stores data in BSON, a binary-encoded serialization of JSON that supports additional data types (Date, ObjectId, Binary, Decimal128) and fast traversal."
    },
    {
      "type": "code_reading",
      "difficulty": "easy",
      "question": "In MongoDB, what does the default `_id` field contain when a document is inserted without one?",
      "options": [
        "A 12-byte BSON ObjectId containing a 4-byte timestamp, 5-byte random value, and 3-byte incrementing counter.",
        "An auto-incrementing integer (1, 2, 3...).",
        "A random 32-character MD5 hash.",
        "The server IP address."
      ],
      "correctAnswer": "A 12-byte BSON ObjectId containing a 4-byte timestamp, 5-byte random value, and 3-byte incrementing counter.",
      "explanation": "ObjectId is a globally unique 12-byte identifier generated client-side or server-side, incorporating timestamp and machine-unique entropy."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "Which MongoDB command updates matching documents or inserts a new document if no match is found?",
      "options": [
        "update with `upsert: true`",
        "insertOrUpdate()",
        "merge()",
        "put()"
      ],
      "correctAnswer": "update with `upsert: true`",
      "explanation": "The upsert option (update + insert) modifies the matched document if it exists, or creates a new document based on query filters and update operators."
    },
    {
      "type": "output_prediction",
      "difficulty": "easy",
      "question": "Which MongoDB query operator matches documents where a field value equals any of the specified values in an array?",
      "options": [
        "$in",
        "$all",
        "$eq",
        "$or"
      ],
      "correctAnswer": "$in",
      "explanation": "`{ field: { $in: [val1, val2] } }` matches any document where the field equals any member of the specified array."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What is the MongoDB equivalent of an RDBMS table?",
      "options": [
        "Collection",
        "Document",
        "Database",
        "Bucket"
      ],
      "correctAnswer": "Collection",
      "explanation": "A collection is a grouped set of MongoDB documents, analogous to a table in relational database systems."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "In the MongoDB Aggregation Pipeline, what does the `$lookup` stage perform?",
      "options": [
        "A left outer join to an unsharded collection in the same database to filter in documents from the \"joined\" collection.",
        "Searches text across Google.",
        "Replaces document IDs with UUIDs.",
        "Creates an index in memory."
      ],
      "correctAnswer": "A left outer join to an unsharded collection in the same database to filter in documents from the \"joined\" collection.",
      "explanation": "$lookup performs a left outer join between collections, reshaping matching target documents into an array field in the source document."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "When designing a MongoDB schema for an e-commerce platform, when should document embedding be favored over referencing (normalization)?",
      "options": [
        "When entities are accessed together frequently, have 1-to-few relationships, and bounded size (e.g., shipping addresses or line items in an order).",
        "When data exceeds 16MB per document.",
        "When data is updated independently by 10,000 users per second.",
        "Embedding is deprecated in MongoDB 5+."
      ],
      "correctAnswer": "When entities are accessed together frequently, have 1-to-few relationships, and bounded size (e.g., shipping addresses or line items in an order).",
      "explanation": "Embedding optimizes read performance through locality of reference: retrieving the entire order with line items requires a single disk seek."
    },
    {
      "type": "debugging",
      "difficulty": "medium",
      "question": "What is the maximum BSON document size limit enforced by MongoDB?",
      "options": [
        "16 Megabytes",
        "4 Gigabytes",
        "64 Kilobytes",
        "1 Megabyte"
      ],
      "correctAnswer": "16 Megabytes",
      "explanation": "MongoDB limits single BSON documents to 16MB to ensure memory usage predictability and prevent excessive RAM consumption during network transfer; GridFS is used for larger files."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "In MongoDB indexes, what is a TTL (Time-To-Live) index used for?",
      "options": [
        "Automatically deleting documents from a collection after a specified number of seconds or at a specific clock time.",
        "Measuring query latency in milliseconds.",
        "Encrypting documents over time.",
        "Backing up documents to Amazon S3."
      ],
      "correctAnswer": "Automatically deleting documents from a collection after a specified number of seconds or at a specific clock time.",
      "explanation": "TTL indexes monitor a Date field, triggering a background thread that automatically purges expired documents (ideal for user sessions, temporary logs, and OTPs)."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "What is the role of a Replica Set in MongoDB production deployments?",
      "options": [
        "A cluster of MongoDB nodes consisting of one Primary and multiple Secondaries providing automatic failover, high availability, and redundancy.",
        "Splitting data across multiple machines for horizontal sharding.",
        "Running map-reduce jobs on disk.",
        "Replicating data into MySQL tables."
      ],
      "correctAnswer": "A cluster of MongoDB nodes consisting of one Primary and multiple Secondaries providing automatic failover, high availability, and redundancy.",
      "explanation": "Replica Sets maintain identical data copies via the oplog. If the Primary node fails, Secondaries elect a new Primary automatically within seconds."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "In MongoDB Write Concerns, what does `{ w: \"majority\", j: true }` guarantee?",
      "options": [
        "The write has been acknowledged by a majority of replica set members AND committed to the on-disk journal, ensuring durability even across power failure.",
        "The write is kept in volatile RAM only.",
        "The write is replicated to all Secondaries across the world before returning.",
        "The write bypasses primary node validation."
      ],
      "correctAnswer": "The write has been acknowledged by a majority of replica set members AND committed to the on-disk journal, ensuring durability even across power failure.",
      "explanation": "w: majority prevents rollback on primary failover; j: true guarantees write durability to non-volatile disk journal before acknowledgment."
    },
    {
      "type": "code_reading",
      "difficulty": "hard",
      "question": "How does Sharding in MongoDB distribute large collections horizontally across multiple clusters?",
      "options": [
        "By partitioning collection data into chunks based on a Shard Key range or hash, distributed across shards by the balancer managed by mongos routers.",
        "By copying the entire database to every machine.",
        "By running map-reduce on a single master node.",
        "By storing all documents in Redis memory."
      ],
      "correctAnswer": "By partitioning collection data into chunks based on a Shard Key range or hash, distributed across shards by the balancer managed by mongos routers.",
      "explanation": "Sharding distributes data based on the Shard Key. mongos query routers direct client operations to the appropriate shard chunk according to config server metadata."
    },
    {
      "type": "debugging",
      "difficulty": "hard",
      "question": "Why can selecting a monotonically increasing field (like timestamp or auto-increment ID) as a ranged Shard Key cause performance hotspots?",
      "options": [
        "All incoming inserts route to the single shard hosting the highest chunk range (the max chunk), bottlenecking write throughput on a single server.",
        "MongoDB disallows timestamp fields as keys.",
        "Monotonic keys corrupt BSON documents.",
        "The balancer crashes when numbers increase."
      ],
      "correctAnswer": "All incoming inserts route to the single shard hosting the highest chunk range (the max chunk), bottlenecking write throughput on a single server.",
      "explanation": "Ranged monotonic shard keys direct all write traffic to the end chunk on one shard. Using Hashed Shard Keys distributes writes uniformly across all shards."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "How do Multi-Document ACID Transactions operate in MongoDB (v4.0+)?",
      "options": [
        "Using a session-based API (`session.startTransaction()`), providing snapshot isolation and all-or-nothing atomicity across multiple documents and collections within a replica set.",
        "Transactions only work on a single document.",
        "Transactions require locking the entire database cluster for writes.",
        "Transactions are converted to SQL syntax internally."
      ],
      "correctAnswer": "Using a session-based API (`session.startTransaction()`), providing snapshot isolation and all-or-nothing atomicity across multiple documents and collections within a replica set.",
      "explanation": "MongoDB supports distributed multi-document ACID transactions coordinated via sessions and WiredTiger timestamps, committing atomically across replica sets."
    },
    {
      "type": "mcq",
      "difficulty": "hard",
      "question": "What is the function of the WiredTiger storage engine cache in MongoDB?",
      "options": [
        "Holds uncompressed working sets in RAM, committing changes to disk checkpoints every 60 seconds (or 2GB of data) alongside journal writes.",
        "Stores HTML page templates.",
        "Manages client WebSocket connections.",
        "Converts BSON into XML format."
      ],
      "correctAnswer": "Holds uncompressed working sets in RAM, committing changes to disk checkpoints every 60 seconds (or 2GB of data) alongside journal writes.",
      "explanation": "WiredTiger manages in-memory data uncompressed for speed, utilizing snappy/zlib compression on disk. Periodic checkpoints create consistent point-in-time disk states."
    }
  ],
  "PostgreSQL": [
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What is the primary JSON data type recommended in modern PostgreSQL for fast querying and indexing?",
      "options": [
        "JSONB",
        "JSON",
        "TEXT",
        "VARCHAR"
      ],
      "correctAnswer": "JSONB",
      "explanation": "JSONB stores JSON in a decomposed binary format that supports indexing (GIN/GIST) and faster query execution, whereas JSON stores exact plaintext."
    },
    {
      "type": "code_reading",
      "difficulty": "easy",
      "question": "In PostgreSQL, what is the default port that the database server listens on?",
      "options": [
        "5432",
        "3306",
        "27017",
        "8080"
      ],
      "correctAnswer": "5432",
      "explanation": "Standard PostgreSQL server instances listen on TCP port 5432 by default."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "Which PostgreSQL command-line tool is standardly used for interactive database queries and administration?",
      "options": [
        "psql",
        "pgadmin",
        "postmaster",
        "postgres-cli"
      ],
      "correctAnswer": "psql",
      "explanation": "psql is the official terminal-based front-end for PostgreSQL, supporting meta-commands (\\d, \\c, \\l) and SQL execution."
    },
    {
      "type": "output_prediction",
      "difficulty": "easy",
      "question": "What does the `SERIAL` pseudo-type do in PostgreSQL table definitions?",
      "options": [
        "Creates an auto-incrementing integer backed by an underlying sequence object.",
        "Encrypts the column with serial cipher.",
        "Restricts column values to positive numbers.",
        "Generates a UUID automatically."
      ],
      "correctAnswer": "Creates an auto-incrementing integer backed by an underlying sequence object.",
      "explanation": "SERIAL creates a sequence and sets DEFAULT nextval('seq'), automatically incrementing values on insert."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What does the `RETURNING` clause do in PostgreSQL `INSERT`, `UPDATE`, or `DELETE` statements?",
      "options": [
        "Returns computed columns or inserted row values directly in the query result, eliminating a subsequent SELECT query.",
        "Reverts the transaction back to the beginning.",
        "Returns the query execution time.",
        "Redirects output to a text file on the server."
      ],
      "correctAnswer": "Returns computed columns or inserted row values directly in the query result, eliminating a subsequent SELECT query.",
      "explanation": "`INSERT ... RETURNING id, created_at` returns generated keys or updated data immediately in the command response."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "What is Multi-Version Concurrency Control (MVCC) in PostgreSQL, and how does it prevent read locks?",
      "options": [
        "Readers never block writers and writers never block readers: each transaction sees a consistent snapshot of data corresponding to its start time.",
        "All queries are executed sequentially on a single thread.",
        "Transactions lock the entire database table during reads.",
        "PostgreSQL creates a duplicate database on every query."
      ],
      "correctAnswer": "Readers never block writers and writers never block readers: each transaction sees a consistent snapshot of data corresponding to its start time.",
      "explanation": "MVCC maintains multiple row versions (identified by xmin and xmax transaction IDs). Reads navigate visible row versions without locking rows against writers."
    },
    {
      "type": "debugging",
      "difficulty": "medium",
      "question": "What is \"table bloat\" in PostgreSQL, and why is `VACUUM` required periodically?",
      "options": [
        "UPDATE and DELETE operations leave dead row tuples in table pages; VACUUM reclaims dead tuple space for future inserts to prevent runaway disk expansion.",
        "Table bloat occurs when too many foreign keys exist.",
        "VACUUM deletes all tables.",
        "Table bloat is caused by indexing string columns."
      ],
      "correctAnswer": "UPDATE and DELETE operations leave dead row tuples in table pages; VACUUM reclaims dead tuple space for future inserts to prevent runaway disk expansion.",
      "explanation": "Due to MVCC, updates append new tuples and mark old ones dead. Dead tuples consume space until autovacuum or manual VACUUM marks them as reusable."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "What is a Generalized Inverted Index (GIN) in PostgreSQL, and what data types benefit from it?",
      "options": [
        "An index designed for composite items with interior elements (JSONB, full-text search tsvector, and arrays), mapping elements to row pointers.",
        "A standard B-tree for primary keys.",
        "An index used exclusively for date ranges.",
        "A temporary index built in RAM."
      ],
      "correctAnswer": "An index designed for composite items with interior elements (JSONB, full-text search tsvector, and arrays), mapping elements to row pointers.",
      "explanation": "GIN indexes map each component item (e.g. JSON keys/values or array elements) to matching row IDs, enabling fast `@>` containment lookups."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "What is the purpose of PostgreSQL connection poolers like PgBouncer in high-concurrency microservice architectures?",
      "options": [
        "PostgreSQL uses a process-per-connection model with high memory overhead per client; PgBouncer pools lightweight client sockets into a small pool of persistent backend connections.",
        "PgBouncer encrypts database backups.",
        "PgBouncer replaces PostgreSQL query planners.",
        "PgBouncer converts SQL into MongoDB queries."
      ],
      "correctAnswer": "PostgreSQL uses a process-per-connection model with high memory overhead per client; PgBouncer pools lightweight client sockets into a small pool of persistent backend connections.",
      "explanation": "Because Postgres forks a new backend process (~5-10MB RAM) per connection, PgBouncer transaction pooling enables thousands of client requests with ~50 backend workers."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "What does the `ON CONFLICT (id) DO UPDATE SET ...` (UPSERT) clause do in PostgreSQL?",
      "options": [
        "Inserts a new row, but if a unique constraint or primary key violation on (id) occurs, it executes the specified UPDATE instead of raising an error.",
        "Deletes the conflicting row.",
        "Cancels the transaction.",
        "Replaces the database schema."
      ],
      "correctAnswer": "Inserts a new row, but if a unique constraint or primary key violation on (id) occurs, it executes the specified UPDATE instead of raising an error.",
      "explanation": "`ON CONFLICT ... DO UPDATE` provides atomic upsert capability, preventing race conditions when concurrently inserting or updating unique entities."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "What is Transaction ID (XID) Wraparound in PostgreSQL, and why is it a critical operational event?",
      "options": [
        "PostgreSQL uses a 32-bit transaction counter (modulo 4 billion); autovacuum must freeze old tuples before 2 billion transactions elapse to prevent past data from becoming invisible.",
        "Transactions crash after 100 queries.",
        "XID wraparound deletes database indexes.",
        "A hardware CPU overflow error."
      ],
      "correctAnswer": "PostgreSQL uses a 32-bit transaction counter (modulo 4 billion); autovacuum must freeze old tuples before 2 billion transactions elapse to prevent past data from becoming invisible.",
      "explanation": "Because XIDs are 32-bit, failure to freeze past row versions causes the database to enter emergency read-only mode to prevent catastrophic data invisibility."
    },
    {
      "type": "debugging",
      "difficulty": "hard",
      "question": "How does Write-Ahead Logging (WAL) ensure durability and crash recovery in PostgreSQL?",
      "options": [
        "All data changes are appended sequentially to the WAL journal on disk before table pages are written; on recovery, uncheckpointed WAL records are replayed.",
        "WAL stores database queries in Redis cache.",
        "WAL runs backups to tapes.",
        "WAL disables hard drive caching."
      ],
      "correctAnswer": "All data changes are appended sequentially to the WAL journal on disk before table pages are written; on recovery, uncheckpointed WAL records are replayed.",
      "explanation": "Writing WAL sequentially is fast. Even if the server loses power before modified shared buffers flush to table files, WAL replay reconstructs consistent state."
    },
    {
      "type": "code_reading",
      "difficulty": "hard",
      "question": "What is a BRIN (Block Range Index) in PostgreSQL, and when is it dramatically superior to a B-Tree index?",
      "options": [
        "Stores min/max values for physical page ranges; orders of magnitude smaller than B-Trees for massive append-only tables naturally sorted by physical order (e.g. timestamps).",
        "An index used only for UUID columns.",
        "A full-text search index.",
        "An index stored in the Linux kernel."
      ],
      "correctAnswer": "Stores min/max values for physical page ranges; orders of magnitude smaller than B-Trees for massive append-only tables naturally sorted by physical order (e.g. timestamps).",
      "explanation": "BRIN indexes occupy a fraction of a percent of table size by summarizing block ranges, perfect for huge time-series tables where physical order matches time."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "In PostgreSQL replication, what is the difference between Physical Streaming Replication and Logical Replication?",
      "options": [
        "Physical replication streams exact byte-level WAL blocks to read replicas (identical cluster state); Logical replication streams decoded row changes, enabling cross-version and selective table replication.",
        "Logical replication is only for backups.",
        "Physical replication requires MongoDB.",
        "Logical replication cannot replicate INSERT statements."
      ],
      "correctAnswer": "Physical replication streams exact byte-level WAL blocks to read replicas (identical cluster state); Logical replication streams decoded row changes, enabling cross-version and selective table replication.",
      "explanation": "Physical replication mirrors the whole cluster bit-for-bit. Logical replication publishes specific table changes via decode plugins, enabling cross-version migrations."
    },
    {
      "type": "mcq",
      "difficulty": "hard",
      "question": "What is the role of Foreign Data Wrappers (postgres_fdw) in PostgreSQL?",
      "options": [
        "An SQL/MED implementation allowing PostgreSQL to query, join, and update tables residing on external remote databases as if they were local tables.",
        "A wrapper for JavaScript functions in Node.js.",
        "An encryption layer for SSL sockets.",
        "A tool that converts Postgres to MySQL."
      ],
      "correctAnswer": "An SQL/MED implementation allowing PostgreSQL to query, join, and update tables residing on external remote databases as if they were local tables.",
      "explanation": "postgres_fdw implements the SQL/MED standard, enabling cross-database queries where remote foreign tables participate in local JOINs and transactions."
    }
  ],
  "MySQL": [
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What is the default and recommended transactional storage engine in modern MySQL (5.5+)?",
      "options": [
        "InnoDB",
        "MyISAM",
        "Memory",
        "CSV"
      ],
      "correctAnswer": "InnoDB",
      "explanation": "InnoDB provides full ACID compliance, row-level locking, foreign key constraints, and crash recovery, replacing legacy MyISAM."
    },
    {
      "type": "code_reading",
      "difficulty": "easy",
      "question": "What is the default TCP port that MySQL server listens on?",
      "options": [
        "3306",
        "5432",
        "1433",
        "1521"
      ],
      "correctAnswer": "3306",
      "explanation": "Standard MySQL server installations bind to TCP port 3306 by default."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "Which keyword in MySQL generates an automatically incrementing unique number for a primary key column?",
      "options": [
        "AUTO_INCREMENT",
        "SERIAL",
        "IDENTITY",
        "AUTO_KEY"
      ],
      "correctAnswer": "AUTO_INCREMENT",
      "explanation": "In MySQL, AUTO_INCREMENT is the table attribute used on integer primary keys to automatically generate sequential IDs."
    },
    {
      "type": "output_prediction",
      "difficulty": "easy",
      "question": "What is the purpose of the `LIMIT` clause in a MySQL SELECT statement?",
      "options": [
        "Constrains the maximum number of rows returned by the query, optionally with an OFFSET for pagination.",
        "Restricts query execution time in seconds.",
        "Limits the CPU percentage used by the query.",
        "Limits the number of database columns returned."
      ],
      "correctAnswer": "Constrains the maximum number of rows returned by the query, optionally with an OFFSET for pagination.",
      "explanation": "`LIMIT offset, count` restricts returned result sets, standard for implementing database pagination."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What character set is strongly recommended in modern MySQL to support full 4-byte UTF-8 Unicode characters (including emojis)?",
      "options": [
        "utf8mb4",
        "utf8",
        "latin1",
        "ascii"
      ],
      "correctAnswer": "utf8mb4",
      "explanation": "MySQL legacy `utf8` only stores up to 3 bytes per character, failing on emojis and supplementary characters; `utf8mb4` is full 4-byte UTF-8."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "What is the distinction between a Clustered Index and a Secondary Index in MySQL InnoDB?",
      "options": [
        "The clustered index physically stores the actual table row data in its B+Tree leaf nodes (ordered by primary key); secondary indexes store primary key values in their leaves.",
        "Clustered indexes are stored in RAM; secondary indexes on disk.",
        "Secondary indexes cannot be searched.",
        "Both store identical full row data in leaves."
      ],
      "correctAnswer": "The clustered index physically stores the actual table row data in its B+Tree leaf nodes (ordered by primary key); secondary indexes store primary key values in their leaves.",
      "explanation": "In InnoDB, table data is the clustered index. Looking up rows via a secondary index navigates the secondary B+Tree, extracts the primary key, and traverses the clustered index."
    },
    {
      "type": "debugging",
      "difficulty": "medium",
      "question": "In MySQL InnoDB, why does a secondary index lookup require a \"Double Lookup\" (Bookmark Lookup) unless the query is covered?",
      "options": [
        "The secondary index only contains the indexed columns and the primary key; retrieving unindexed columns requires a second traversal of the clustered index by primary key.",
        "InnoDB reads every page twice to verify checksums.",
        "A bug in MySQL 8.0 query optimizer.",
        "MySQL locks the table twice."
      ],
      "correctAnswer": "The secondary index only contains the indexed columns and the primary key; retrieving unindexed columns requires a second traversal of the clustered index by primary key.",
      "explanation": "Non-covering queries must read the primary key from the secondary index leaf and perform a second traversal in the clustered index to fetch remaining table columns."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "What is the purpose of the `innodb_buffer_pool_size` configuration variable in MySQL database tuning?",
      "options": [
        "The memory buffer where InnoDB caches table data and indexes; should typically be configured to 70-80% of available physical RAM on dedicated database servers.",
        "Sets the maximum size of uploaded image files.",
        "Controls the maximum number of concurrent client connections.",
        "Defines the query cache size for SELECT statements."
      ],
      "correctAnswer": "The memory buffer where InnoDB caches table data and indexes; should typically be configured to 70-80% of available physical RAM on dedicated database servers.",
      "explanation": "The buffer pool is the primary cache in InnoDB. Sizing it appropriately keeps working datasets in RAM, drastically reducing expensive disk I/O."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "What does the MySQL statement `INSERT INTO table (...) VALUES (...) ON DUPLICATE KEY UPDATE ...` do?",
      "options": [
        "Inserts the row, but if a primary key or unique index collision occurs, updates the existing row with the provided expressions instead.",
        "Deletes duplicate rows.",
        "Throws a duplicate key exception.",
        "Creates a duplicate table in the background."
      ],
      "correctAnswer": "Inserts the row, but if a primary key or unique index collision occurs, updates the existing row with the provided expressions instead.",
      "explanation": "ON DUPLICATE KEY UPDATE provides atomic upsert capability in MySQL without requiring separate transactions or lock statements."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "What is the role of the MySQL Binary Log (binlog) in production environments?",
      "options": [
        "Records all DDL and DML data modifications in binary format, used for replication to replica servers and point-in-time recovery.",
        "Logs error messages for server administrators.",
        "Stores binary image files.",
        "Logs passwords in plaintext."
      ],
      "correctAnswer": "Records all DDL and DML data modifications in binary format, used for replication to replica servers and point-in-time recovery.",
      "explanation": "The binlog captures committed database changes, which replicas read to mirror the master, and backup tools use to roll forward to exact points in time."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "In MySQL InnoDB Repeatable Read isolation, how does \"Next-Key Locking\" prevent Phantom Reads?",
      "options": [
        "It combines an index-record lock on the matching record with a gap lock on the gap preceding the record, preventing concurrent transactions from inserting into the gap.",
        "It locks all tables globally.",
        "It terminates concurrent transactions.",
        "It requires all queries to be SELECT statements."
      ],
      "correctAnswer": "It combines an index-record lock on the matching record with a gap lock on the gap preceding the record, preventing concurrent transactions from inserting into the gap.",
      "explanation": "Next-key locking locks both index records and the gaps between them, preventing concurrent transactions from inserting phantom rows that would match the range."
    },
    {
      "type": "debugging",
      "difficulty": "hard",
      "question": "What is the consequence of configuring `innodb_flush_log_at_trx_commit = 2` versus `1` in MySQL?",
      "options": [
        "Setting to 1 guarantees full ACID durability (flushes redo log to disk on every commit); setting to 2 flushes to OS cache only, risking up to 1 second of transactions if the OS crashes.",
        "Setting to 2 encrypts transactions.",
        "Setting to 1 disables the redo log completely.",
        "Setting to 2 improves data durability."
      ],
      "correctAnswer": "Setting to 1 guarantees full ACID durability (flushes redo log to disk on every commit); setting to 2 flushes to OS cache only, risking up to 1 second of transactions if the OS crashes.",
      "explanation": "Value 1 flushes the redo log to disk on each commit (strict ACID). Value 2 writes to the OS file buffer on commit and flushes once per second, trading durability for write performance."
    },
    {
      "type": "code_reading",
      "difficulty": "hard",
      "question": "What is the difference between Statement-Based Replication (SBR) and Row-Based Replication (RBR) in MySQL binlog formats?",
      "options": [
        "SBR logs the exact SQL text of queries (prone to non-deterministic divergence with NOW() or UUID()); RBR logs individual row before-and-after byte changes, guaranteeing consistency.",
        "RBR cannot replicate DELETE operations.",
        "SBR is faster on bulk updates.",
        "Both formats are completely identical in log size."
      ],
      "correctAnswer": "SBR logs the exact SQL text of queries (prone to non-deterministic divergence with NOW() or UUID()); RBR logs individual row before-and-after byte changes, guaranteeing consistency.",
      "explanation": "Row-Based Replication records actual row changes, eliminating non-deterministic bugs caused by functions like UUID(), RAND(), or LIMIT without ORDER BY."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "How does MySQL 8.0 Invisible Indexes feature assist in safe database index optimization?",
      "options": [
        "Allows marking an index as invisible to the query optimizer to test if query performance degrades before permanently dropping the index.",
        "Hides index names from hackers.",
        "Deletes index files while keeping the definition.",
        "Compresses indexes in memory."
      ],
      "correctAnswer": "Allows marking an index as invisible to the query optimizer to test if query performance degrades before permanently dropping the index.",
      "explanation": "Invisible indexes are maintained on write operations but ignored by the optimizer for SELECT queries, allowing safe validation of index necessity before drop."
    },
    {
      "type": "mcq",
      "difficulty": "hard",
      "question": "In MySQL Group Replication (MGR), what consensus algorithm coordinates atomic broadcast and distributed conflict detection across nodes?",
      "options": [
        "Paxos (specifically the Paxos implementation in the Coro/XCom group communication engine).",
        "Raft algorithm.",
        "Two-Phase Locking alone.",
        "Gossip protocol only."
      ],
      "correctAnswer": "Paxos (specifically the Paxos implementation in the Coro/XCom group communication engine).",
      "explanation": "MySQL Group Replication uses a Paxos-based group communication system (XCom) to achieve total order delivery and distributed multi-master conflict certification."
    }
  ],
  "Data Structures & Algorithms": [
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What is the average and worst-case time complexity of searching for an element in a Hash Table with well-distributed keys?",
      "options": [
        "Average O(1), Worst-case O(n)",
        "Average O(log n), Worst-case O(n)",
        "Average O(n), Worst-case O(n^2)",
        "Average O(1), Worst-case O(1)"
      ],
      "correctAnswer": "Average O(1), Worst-case O(n)",
      "explanation": "Hash tables achieve O(1) average lookup time via hashing. In the worst case where all keys hash to the same bucket (collision), lookup degrades to O(n)."
    },
    {
      "type": "output_prediction",
      "difficulty": "easy",
      "question": "Which sorting algorithm has a guaranteed worst-case time complexity of O(n log n) and is stable?",
      "options": [
        "Merge Sort",
        "Quick Sort",
        "Heap Sort",
        "Selection Sort"
      ],
      "correctAnswer": "Merge Sort",
      "explanation": "Merge Sort guarantees O(n log n) in best, average, and worst cases via divide-and-conquer and preserves the relative order of equal elements (stable)."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What data structure operates on a Last-In, First-Out (LIFO) principle?",
      "options": [
        "Stack",
        "Queue",
        "Linked List",
        "Priority Queue"
      ],
      "correctAnswer": "Stack",
      "explanation": "A Stack follows LIFO: the most recently pushed element is the first element popped from the top."
    },
    {
      "type": "code_reading",
      "difficulty": "easy",
      "question": "What is the time complexity of finding an element in a sorted array of size n using Binary Search?",
      "options": [
        "O(log n)",
        "O(1)",
        "O(n)",
        "O(n log n)"
      ],
      "correctAnswer": "O(log n)",
      "explanation": "Binary Search halves the search interval on each step, resulting in logarithmic O(log n) time complexity."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "In a singly linked list with n nodes, what is the time complexity of deleting the head node?",
      "options": [
        "O(1)",
        "O(n)",
        "O(log n)",
        "O(n^2)"
      ],
      "correctAnswer": "O(1)",
      "explanation": "Deleting the head node requires updating the head pointer to head.next, which is a constant time O(1) operation."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "When implementing Dijkstra’s shortest path algorithm on a graph with V vertices and E edges, what data structure yields the optimal O((V + E) log V) time complexity?",
      "options": [
        "Min-Heap (Priority Queue)",
        "FIFO Queue",
        "Stack",
        "Adjacency Matrix alone"
      ],
      "correctAnswer": "Min-Heap (Priority Queue)",
      "explanation": "Using a min-priority queue (binary min-heap) allows extracting the minimum-distance vertex in O(log V) time, resulting in O((V + E) log V)."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "How does Floyd’s Cycle-Finding Algorithm (Tortoise and Hare) detect cycles in a linked list in O(n) time and O(1) auxiliary space?",
      "options": [
        "By moving a slow pointer by 1 step and a fast pointer by 2 steps; if a cycle exists, the fast pointer will inevitably meet the slow pointer within the loop.",
        "By reversing the linked list twice.",
        "By storing visited node references in a hash set.",
        "By counting total nodes with recursion."
      ],
      "correctAnswer": "By moving a slow pointer by 1 step and a fast pointer by 2 steps; if a cycle exists, the fast pointer will inevitably meet the slow pointer within the loop.",
      "explanation": "Two pointers moving at different speeds inside a closed cycle must meet because the relative distance between them decreases by 1 on each step."
    },
    {
      "type": "debugging",
      "difficulty": "medium",
      "question": "Why does Quick Sort degrade to O(n^2) worst-case time complexity, and how can this be mitigated?",
      "options": [
        "When the pivot chosen is consistently the extreme (smallest or largest) element in sorted/reverse-sorted data; mitigated using Median-of-Three or randomized pivot selection.",
        "When array elements are negative numbers.",
        "When running on 64-bit processors.",
        "Quick Sort never degrades to O(n^2)."
      ],
      "correctAnswer": "When the pivot chosen is consistently the extreme (smallest or largest) element in sorted/reverse-sorted data; mitigated using Median-of-Three or randomized pivot selection.",
      "explanation": "Unbalanced partitions (1 element vs n-1 elements) lead to n recursion levels each doing O(n) work (O(n^2)). Randomized pivots prevent worst-case inputs."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "What is the difference between Breadth-First Search (BFS) and Depth-First Search (DFS) on an unweighted tree or graph?",
      "options": [
        "BFS explores level-by-level using a Queue (guaranteeing shortest path in unweighted graphs); DFS explores branch-by-branch deeply using a Stack or recursion.",
        "DFS finds shortest paths, while BFS does not.",
        "BFS uses recursion, while DFS uses queues.",
        "BFS requires O(1) memory, while DFS requires O(n^2)."
      ],
      "correctAnswer": "BFS explores level-by-level using a Queue (guaranteeing shortest path in unweighted graphs); DFS explores branch-by-branch deeply using a Stack or recursion.",
      "explanation": "BFS traverses nearest nodes first using a FIFO queue. DFS explores to maximum depth before backtracking using LIFO stack semantics."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "What algorithmic paradigm does the 0/1 Knapsack problem typically require to find the optimal value in O(n * W) time?",
      "options": [
        "Dynamic Programming",
        "Greedy Algorithm",
        "Binary Search alone",
        "Two-pointer technique"
      ],
      "correctAnswer": "Dynamic Programming",
      "explanation": "The 0/1 knapsack has overlapping subproblems and optimal substructure; greedy choices fail because items cannot be broken into fractions. DP solves it."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "What is the self-balancing mechanism in a Red-Black Tree, and what is its guaranteed maximum height for n nodes?",
      "options": [
        "Uses node color rules (root black, red nodes have black children, equal black-height) and tree rotations to guarantee maximum height <= 2 * log2(n + 1).",
        "Guarantees height is strictly equal to log2(n) at all times.",
        "Converts nodes into arrays when unbalanced.",
        "Replaces recursion with while loops."
      ],
      "correctAnswer": "Uses node color rules (root black, red nodes have black children, equal black-height) and tree rotations to guarantee maximum height <= 2 * log2(n + 1).",
      "explanation": "Red-Black tree properties ensure that the longest path from root to leaf is no more than twice the length of the shortest path, guaranteeing O(log n) operations."
    },
    {
      "type": "debugging",
      "difficulty": "hard",
      "question": "In Trie (Prefix Tree) data structures, what is the space complexity tradeoff, and how does a Radix Tree (Compressed Trie) optimize it?",
      "options": [
        "Standard Tries waste memory with many single-child pointer branches; Radix Trees compress chains of single-child nodes into single edges containing substrings.",
        "Radix trees store nodes on disk.",
        "Standard Tries cannot store strings longer than 10 characters.",
        "Radix trees eliminate the need for pointers."
      ],
      "correctAnswer": "Standard Tries waste memory with many single-child pointer branches; Radix Trees compress chains of single-child nodes into single edges containing substrings.",
      "explanation": "Radix trees compress non-branching paths into edge labels with multi-character strings, dramatically decreasing node allocation overhead."
    },
    {
      "type": "code_reading",
      "difficulty": "hard",
      "question": "What is the time complexity of building a Binary Heap from an unordered array of n elements using the bottom-up heapify algorithm (`build_heap`)?",
      "options": [
        "O(n)",
        "O(n log n)",
        "O(log n)",
        "O(n^2)"
      ],
      "correctAnswer": "O(n)",
      "explanation": "While inserting n elements one-by-one is O(n log n), bottom-up heapify sums node heights across levels: sum of h/2^h converges, yielding linear O(n) construction."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "In Disjoint Set Union (Union-Find), what time complexity per operation is achieved by combining \"Union by Rank\" with \"Path Compression\"?",
      "options": [
        "Amortized O(alpha(n)), where alpha is the Inverse Ackermann function (effectively constant time <= 4 for all practical values).",
        "Strictly O(1) worst-case.",
        "O(log n).",
        "O(n)."
      ],
      "correctAnswer": "Amortized O(alpha(n)), where alpha is the Inverse Ackermann function (effectively constant time <= 4 for all practical values).",
      "explanation": "Path compression flattens trees during find operations while union by rank keeps trees shallow, yielding virtually constant inverse Ackermann complexity."
    },
    {
      "type": "mcq",
      "difficulty": "hard",
      "question": "What is the distinction between NP-Complete and NP-Hard complexity classes?",
      "options": [
        "A problem is NP-Complete if it is both in NP (verifiable in polynomial time) AND NP-Hard; NP-Hard problems are at least as hard as any problem in NP but may not be in NP (e.g. Halting Problem).",
        "NP-Complete problems can be solved in O(n) time.",
        "NP-Hard problems are strictly easier than NP-Complete problems.",
        "All NP-Complete problems are solved by quantum computers."
      ],
      "correctAnswer": "A problem is NP-Complete if it is both in NP (verifiable in polynomial time) AND NP-Hard; NP-Hard problems are at least as hard as any problem in NP but may not be in NP (e.g. Halting Problem).",
      "explanation": "NP-Complete is the intersection of NP and NP-Hard: decision problems that are in NP and to which any problem in NP can be reduced in polynomial time."
    }
  ],
  "Object-Oriented Programming": [
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What are the four fundamental pillars of Object-Oriented Programming (OOP)?",
      "options": [
        "Encapsulation, Abstraction, Inheritance, and Polymorphism.",
        "Classes, Objects, Methods, and Variables.",
        "Iteration, Recursion, Compilation, and Execution.",
        "Modularity, Scalability, Concurrency, and Security."
      ],
      "correctAnswer": "Encapsulation, Abstraction, Inheritance, and Polymorphism.",
      "explanation": "The core OOP principles are Encapsulation (data hiding), Abstraction (simplifying interfaces), Inheritance (code reuse), and Polymorphism (many forms)."
    },
    {
      "type": "code_reading",
      "difficulty": "easy",
      "question": "What is Encapsulation in OOP?",
      "options": [
        "Bundling data (attributes) and methods that operate on that data into a single unit (class), while restricting direct access to internal state via access modifiers.",
        "Translating code into machine language.",
        "Inheriting fields from parent classes.",
        "Executing methods concurrently on threads."
      ],
      "correctAnswer": "Bundling data (attributes) and methods that operate on that data into a single unit (class), while restricting direct access to internal state via access modifiers.",
      "explanation": "Encapsulation shields an object's internal state from unauthorized external mutation, requiring interaction through public getter/setter methods."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What is the difference between a class and an object in OOP?",
      "options": [
        "A class is a blueprint or template defining properties and behaviors; an object is a concrete runtime instance of that class.",
        "An object is a blueprint; a class is a running program.",
        "A class cannot contain methods.",
        "Objects are stored in the code segment; classes are stored on the heap."
      ],
      "correctAnswer": "A class is a blueprint or template defining properties and behaviors; an object is a concrete runtime instance of that class.",
      "explanation": "A class defines the schema and methods. Instantiating a class allocates memory for an individual object instance with its own state."
    },
    {
      "type": "output_prediction",
      "difficulty": "easy",
      "question": "What is method overloading in OOP languages like Java or C++?",
      "options": [
        "Defining multiple methods in the same class with the same name but different parameter lists (types, number, or order).",
        "Redefining a base class method in a derived class.",
        "Calling a method more than 1,000 times in a loop.",
        "Overriding private methods."
      ],
      "correctAnswer": "Defining multiple methods in the same class with the same name but different parameter lists (types, number, or order).",
      "explanation": "Method overloading is compile-time (static) polymorphism: the compiler determines which method to invoke based on argument types and count."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What is method overriding in OOP?",
      "options": [
        "A subclass providing a specific implementation of a method that is already defined in its superclass.",
        "Deleting a method from a class.",
        "Declaring a method as static.",
        "Renaming a method at compile-time."
      ],
      "correctAnswer": "A subclass providing a specific implementation of a method that is already defined in its superclass.",
      "explanation": "Overriding enables runtime (dynamic) polymorphism: invoking a method on a base class reference triggers the overridden version in the actual derived instance."
    },
    {
      "type": "mcq",
      "difficulty": "medium",
      "question": "What does the Liskov Substitution Principle (LSP) in SOLID design dictate?",
      "options": [
        "Subtypes must be substitutable for their base types without altering the correctness or intended behavior of the program.",
        "Classes should have only one reason to change.",
        "High-level modules should not depend on low-level modules.",
        "Interfaces must not declare more than 5 methods."
      ],
      "correctAnswer": "Subtypes must be substitutable for their base types without altering the correctness or intended behavior of the program.",
      "explanation": "LSP ensures inheritance correctness: derived classes must honor the contracts of their base classes without weakening preconditions or strengthening postconditions."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "Why is Composition generally favored over Inheritance (\"Favor composition over inheritance\") in software engineering?",
      "options": [
        "Composition creates loose coupling by combining independent components at runtime, avoiding brittle deep inheritance hierarchies and parent class implementation exposure.",
        "Inheritance is not supported in modern programming languages.",
        "Composition executes faster on CPU caches.",
        "Inheritance allocates memory on disk."
      ],
      "correctAnswer": "Composition creates loose coupling by combining independent components at runtime, avoiding brittle deep inheritance hierarchies and parent class implementation exposure.",
      "explanation": "Inheritance exposes child classes to parent implementation changes (fragile base class problem); composition assembles behavior dynamically through interfaces."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "What is the Singleton design pattern, and what is its primary criticism in modern unit testing?",
      "options": [
        "Guarantees a class has only one instance and provides global access to it; criticized because it introduces hidden global state and makes unit test isolation and mocking difficult.",
        "A pattern that creates an array of objects.",
        "A pattern that runs on single-core CPUs only.",
        "A database connection query."
      ],
      "correctAnswer": "Guarantees a class has only one instance and provides global access to it; criticized because it introduces hidden global state and makes unit test isolation and mocking difficult.",
      "explanation": "Singletons maintain global shared state across tests, creating test coupling and preventing easy substitution of mock implementations."
    },
    {
      "type": "debugging",
      "difficulty": "medium",
      "question": "What problem does the Factory Method design pattern solve in OOP architecture?",
      "options": [
        "Decouples object creation from object usage, allowing subclasses or factories to determine which concrete class to instantiate without callers hardcoding concrete constructors.",
        "Compresses object definitions in memory.",
        "Prevents objects from having private fields.",
        "Automatically generates unit test cases."
      ],
      "correctAnswer": "Decouples object creation from object usage, allowing subclasses or factories to determine which concrete class to instantiate without callers hardcoding concrete constructors.",
      "explanation": "Factory patterns eliminate direct dependencies on concrete classes, adhering to the Open/Closed Principle by allowing new product types without altering caller code."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "What does the Dependency Inversion Principle (DIP) state in SOLID design?",
      "options": [
        "High-level modules should not depend on low-level modules; both should depend on abstractions (interfaces). Abstractions should not depend on details.",
        "Derived classes should reverse the order of method execution.",
        "Database tables must not have foreign keys.",
        "Functions should not accept parameters."
      ],
      "correctAnswer": "High-level modules should not depend on low-level modules; both should depend on abstractions (interfaces). Abstractions should not depend on details.",
      "explanation": "DIP decouples high-level business logic from low-level implementation details (databases, APIs) by introducing shared interfaces that low-level modules implement."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "How does the Observer design pattern implement decoupled event notifications across distributed or modular components?",
      "options": [
        "A Subject maintains a list of Observers and notifies them automatically of state changes by calling their update() method, without knowing their concrete classes.",
        "Observers poll the database every second.",
        "It requires all classes to inherit from Thread.",
        "It replaces HTTP networking with WebSockets."
      ],
      "correctAnswer": "A Subject maintains a list of Observers and notifies them automatically of state changes by calling their update() method, without knowing their concrete classes.",
      "explanation": "The Observer pattern establishes a one-to-many relationship where subjects publish events to subscribed observers, enabling loose coupling in event-driven systems."
    },
    {
      "type": "code_reading",
      "difficulty": "hard",
      "question": "What is the purpose of the Decorator design pattern in OOP?",
      "options": [
        "Attaches additional responsibilities and behavior to an object dynamically at runtime as an alternative to static subclassing.",
        "Applies CSS styles to terminal output.",
        "Generates automated documentation comments.",
        "Converts objects to JSON format."
      ],
      "correctAnswer": "Attaches additional responsibilities and behavior to an object dynamically at runtime as an alternative to static subclassing.",
      "explanation": "Decorators wrap the original component, matching its interface and delegating calls to it while adding pre- or post-processing behavior transparently."
    },
    {
      "type": "debugging",
      "difficulty": "hard",
      "question": "In object-oriented design, what is an \"Anemic Domain Model\", and why is it considered an architectural anti-pattern in Domain-Driven Design (DDD)?",
      "options": [
        "Domain objects that contain only data fields and getters/setters with zero business logic, while all business logic is pushed into procedural service classes.",
        "A domain model that has too many classes.",
        "A model that cannot connect to databases.",
        "A model written in functional programming languages."
      ],
      "correctAnswer": "Domain objects that contain only data fields and getters/setters with zero business logic, while all business logic is pushed into procedural service classes.",
      "explanation": "Anemic models violate core OOP principles by separating data from the operations on that data, reducing objects to bags of getters/setters and creating procedural code."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "What is the Strategy design pattern, and how does it eliminate sprawling conditional (`if-else` or `switch`) statements?",
      "options": [
        "Defines a family of interchangeable algorithms encapsulated inside separate strategy classes implementing a common interface, selected dynamically at runtime.",
        "A pattern that creates multiple threads for every if-statement.",
        "A pattern that converts code to state machines.",
        "A database migration strategy."
      ],
      "correctAnswer": "Defines a family of interchangeable algorithms encapsulated inside separate strategy classes implementing a common interface, selected dynamically at runtime.",
      "explanation": "Instead of branching across types in conditionals, Strategy delegates behavior to a polymorphic strategy object, adhering to the Open/Closed Principle."
    },
    {
      "type": "mcq",
      "difficulty": "hard",
      "question": "What is the difference between Cohesion and Coupling in software engineering architecture?",
      "options": [
        "Cohesion measures how closely related and focused the responsibilities within a single module are (high is desirable); Coupling measures inter-module dependencies (low is desirable).",
        "Cohesion measures network bandwidth; Coupling measures CPU cores.",
        "High coupling and low cohesion are the primary goals of clean architecture.",
        "Cohesion applies to databases; coupling applies to frontend."
      ],
      "correctAnswer": "Cohesion measures how closely related and focused the responsibilities within a single module are (high is desirable); Coupling measures inter-module dependencies (low is desirable).",
      "explanation": "High cohesion ensures a class does one cohesive thing well; loose coupling ensures classes interact through clean boundaries with minimal mutual dependencies."
    }
  ],
  "DBMS": [
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What is the primary role of a Database Management System (DBMS)?",
      "options": [
        "System software for creating, managing, querying, and administering structured data with concurrent access and reliability.",
        "An operating system that manages computer hardware.",
        "A web server for hosting HTML web pages.",
        "A compiler that translates SQL into Python."
      ],
      "correctAnswer": "System software for creating, managing, querying, and administering structured data with concurrent access and reliability.",
      "explanation": "A DBMS provides systematic data organization, query processing, transactions, security, concurrency control, and data recovery."
    },
    {
      "type": "code_reading",
      "difficulty": "easy",
      "question": "In the Relational Model, what is a \"tuple\"?",
      "options": [
        "A row or single record in a relational database table.",
        "A column header.",
        "The name of the database schema.",
        "An index tree pointer."
      ],
      "correctAnswer": "A row or single record in a relational database table.",
      "explanation": "In relational algebra and database theory, a tuple represents a single row (or record) in a relation (table)."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What is the primary purpose of Database Normalization?",
      "options": [
        "To reduce data redundancy and eliminate anomalies (insert, update, delete) by organizing tables and relationships systematically.",
        "To compress database files on the hard drive.",
        "To make SQL queries run without using RAM.",
        "To convert relational tables into JSON documents."
      ],
      "correctAnswer": "To reduce data redundancy and eliminate anomalies (insert, update, delete) by organizing tables and relationships systematically.",
      "explanation": "Normalization decomposes tables to ensure every non-key attribute depends strictly on the primary key, minimizing duplicate data and update anomalies."
    },
    {
      "type": "output_prediction",
      "difficulty": "easy",
      "question": "What condition satisfies the First Normal Form (1NF) in relational databases?",
      "options": [
        "Each column contains atomic (indivisible) values, and each record is unique with no repeating groups.",
        "All non-key columns depend on the entire primary key.",
        "There are no transitive dependencies.",
        "Tables must have at least 10 rows."
      ],
      "correctAnswer": "Each column contains atomic (indivisible) values, and each record is unique with no repeating groups.",
      "explanation": "1NF requires eliminating repeating groups and ensuring attributes hold only scalar atomic values with a defined primary key."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "Which constraint ensures that a value in a column matches a valid value in another table?",
      "options": [
        "Foreign Key constraint",
        "Check constraint",
        "Unique constraint",
        "Not Null constraint"
      ],
      "correctAnswer": "Foreign Key constraint",
      "explanation": "Referential integrity is enforced by Foreign Keys, ensuring references in child tables point to existing parent entity keys."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "What is the requirement for a database relation to be in Third Normal Form (3NF)?",
      "options": [
        "It is in 2NF, and no non-key attribute is transitively dependent on the primary key (no X -> Y where neither is a candidate key).",
        "It is in 1NF and contains no numbers.",
        "It has an index on every column.",
        "All columns are foreign keys."
      ],
      "correctAnswer": "It is in 2NF, and no non-key attribute is transitively dependent on the primary key (no X -> Y where neither is a candidate key).",
      "explanation": "3NF requires that all attributes depend directly on the primary key, the whole primary key, and nothing but the primary key (eliminating transitive dependencies)."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "What is the role of the Database Query Optimizer during SQL execution?",
      "options": [
        "Analyzes table statistics, available indexes, and query trees to generate the most efficient execution plan with lowest estimated cost.",
        "Formats SQL text with syntax coloring.",
        "Checks user passwords during login.",
        "Deletes slow queries automatically."
      ],
      "correctAnswer": "Analyzes table statistics, available indexes, and query trees to generate the most efficient execution plan with lowest estimated cost.",
      "explanation": "The optimizer evaluates alternative join orders, index choices, and access paths (nested loop vs hash join) to execute the query with minimal I/O and CPU cost."
    },
    {
      "type": "debugging",
      "difficulty": "medium",
      "question": "What is a \"Dirty Read\" in concurrent database transaction execution?",
      "options": [
        "A transaction reads uncommitted data written by another concurrent transaction that subsequently rolls back.",
        "A query that takes longer than 60 seconds.",
        "A read from a hard drive that contains bad sectors.",
        "A read performed by an unauthorized user."
      ],
      "correctAnswer": "A transaction reads uncommitted data written by another concurrent transaction that subsequently rolls back.",
      "explanation": "Dirty reads occur in Read Uncommitted isolation: transaction A modifies a row; transaction B reads it; transaction A aborts, leaving B with hallucinated data."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "Why are B+ Tree index structures ubiquitous in disk-based DBMS storage instead of standard Binary Search Trees?",
      "options": [
        "B+ Trees have high fan-out (storing hundreds of keys per node), keeping tree depth low (3-4 levels) to minimize expensive disk block reads, with linked leaves for fast range scans.",
        "Binary Search Trees cannot be stored on disk.",
        "B+ Trees store data in RAM only.",
        "B+ Trees eliminate the need for primary keys."
      ],
      "correctAnswer": "B+ Trees have high fan-out (storing hundreds of keys per node), keeping tree depth low (3-4 levels) to minimize expensive disk block reads, with linked leaves for fast range scans.",
      "explanation": "High fan-out matches disk page boundaries (4KB-16KB blocks), requiring very few disk I/Os to traverse millions of rows, with leaf chains enabling fast range iteration."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "What does the Two-Phase Locking (2PL) protocol guarantee in DBMS concurrency control?",
      "options": [
        "Conflict Serializability: transactions acquire locks during the growing phase and release locks during the shrinking phase without acquiring new locks once shrinking begins.",
        "Deadlock-free execution.",
        "Zero disk write latency.",
        "Immediate execution of all transactions."
      ],
      "correctAnswer": "Conflict Serializability: transactions acquire locks during the growing phase and release locks during the shrinking phase without acquiring new locks once shrinking begins.",
      "explanation": "2PL enforces a Growing Phase (locks acquired, none released) and a Shrinking Phase (locks released, none acquired), mathematically guaranteeing serializability."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "What is the difference between Strict 2PL and Rigorous 2PL in database transaction management?",
      "options": [
        "Strict 2PL holds exclusive (X) locks until transaction end; Rigorous 2PL holds BOTH exclusive and shared (S) locks until transaction end, preventing cascading aborts completely.",
        "Strict 2PL does not use locks.",
        "Rigorous 2PL allows dirty reads.",
        "Both are identical in lock holding duration."
      ],
      "correctAnswer": "Strict 2PL holds exclusive (X) locks until transaction end; Rigorous 2PL holds BOTH exclusive and shared (S) locks until transaction end, preventing cascading aborts completely.",
      "explanation": "Holding all locks until commit or abort (Rigorous 2PL) ensures that transactions can be serialized in the order in which they commit, avoiding cascading rollbacks."
    },
    {
      "type": "debugging",
      "difficulty": "hard",
      "question": "How does the ARIES recovery algorithm restore database consistency following an abrupt server crash?",
      "options": [
        "Executes three phases: Analysis (determines dirty pages and active transactions from checkpoint), Redo (replays history forward to reconstruct state), and Undo (rolls back active uncommitted transactions backward).",
        "Deletes the database files and restores the last full tape backup.",
        "Restarts the operating system in safe mode.",
        "Replaces all corrupted records with zeros."
      ],
      "correctAnswer": "Executes three phases: Analysis (determines dirty pages and active transactions from checkpoint), Redo (replays history forward to reconstruct state), and Undo (rolls back active uncommitted transactions backward).",
      "explanation": "ARIES utilizes Physiological logging with compensation log records (CLRs) across Analysis, Redo (repeating history), and Undo phases to guarantee atomicity and durability."
    },
    {
      "type": "code_reading",
      "difficulty": "hard",
      "question": "In query execution engines, what is the trade-off between a Hash Join and a Sort-Merge Join?",
      "options": [
        "Hash Join builds an in-memory hash table on the smaller relation (fast O(M+N) for equality joins with sufficient RAM); Sort-Merge Join requires sorted inputs but excels on huge datasets with range predicates or pre-sorted indexes.",
        "Hash Joins can only join tables with less than 10 rows.",
        "Sort-Merge Joins require no memory.",
        "Hash Join is always O(N^2)."
      ],
      "correctAnswer": "Hash Join builds an in-memory hash table on the smaller relation (fast O(M+N) for equality joins with sufficient RAM); Sort-Merge Join requires sorted inputs but excels on huge datasets with range predicates or pre-sorted indexes.",
      "explanation": "Hash joins are optimal for unsorted equi-joins when the build table fits in work memory. Sort-Merge join scales efficiently when relations are already indexed on the join key."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "What is Boyce-Codd Normal Form (BCNF), and how is it stricter than 3NF?",
      "options": [
        "For every non-trivial functional dependency X -> Y, X must be a superkey; 3NF allows Y to be part of a candidate key even if X is not a superkey.",
        "BCNF applies only to non-relational NoSQL databases.",
        "BCNF requires all foreign keys to be composite.",
        "BCNF allows multi-valued dependencies."
      ],
      "correctAnswer": "For every non-trivial functional dependency X -> Y, X must be a superkey; 3NF allows Y to be part of a candidate key even if X is not a superkey.",
      "explanation": "BCNF eliminates all redundancy from functional dependencies by ensuring that the left-hand side of every non-trivial FD is strictly a superkey."
    },
    {
      "type": "mcq",
      "difficulty": "hard",
      "question": "What is the role of Write-Ahead Logging (WAL) and the Steal/No-Force buffer management policy in modern DBMS engines?",
      "options": [
        "Steal allows uncommitted pages to be written to disk to free buffer RAM; No-Force allows commits without immediately writing dirty pages to disk, supported by WAL for crash recovery.",
        "Steal steals CPU cycles from the OS; No-Force disables encryption.",
        "Steal requires all transactions to abort on commit.",
        "No-Force forces immediate disk sync on every single SQL statement."
      ],
      "correctAnswer": "Steal allows uncommitted pages to be written to disk to free buffer RAM; No-Force allows commits without immediately writing dirty pages to disk, supported by WAL for crash recovery.",
      "explanation": "Steal/No-Force delivers maximum throughput by buffering disk writes, relying on the WAL log protocol to guarantee Atomicity (Undo uncommitted stolen pages) and Durability (Redo unforced committed pages)."
    }
  ],
  "Operating Systems": [
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What is the distinction between a Process and a Thread in operating systems?",
      "options": [
        "A process has its own isolated virtual address space and resources; threads exist within a process, sharing code, data, and heap while maintaining their own registers and stack.",
        "A thread has its own isolated memory space; processes share memory.",
        "Threads cannot execute code simultaneously on multi-core CPUs.",
        "Processes are managed by hardware; threads by web browsers."
      ],
      "correctAnswer": "A process has its own isolated virtual address space and resources; threads exist within a process, sharing code, data, and heap while maintaining their own registers and stack.",
      "explanation": "Processes provide strong memory isolation and protection boundaries. Threads are lightweight execution contexts inside a process that share memory."
    },
    {
      "type": "code_reading",
      "difficulty": "easy",
      "question": "What is a Context Switch in OS CPU scheduling?",
      "options": [
        "Saving the state (registers, program counter, stack pointer) of the currently running process/thread and loading the saved state of the next process to execute.",
        "Switching between dark mode and light mode.",
        "Changing the display resolution.",
        "Rebooting the operating system."
      ],
      "correctAnswer": "Saving the state (registers, program counter, stack pointer) of the currently running process/thread and loading the saved state of the next process to execute.",
      "explanation": "Context switching enables preemptive multitasking: the OS scheduler stores CPU register state so execution can resume later without data loss."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What are the four Coffman conditions required for a Deadlock to occur in an operating system?",
      "options": [
        "Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.",
        "Read, Write, Execute, and Delete.",
        "Process, Thread, Fiber, and Task.",
        "CPU, Memory, Disk, and Network."
      ],
      "correctAnswer": "Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.",
      "explanation": "All four Coffman conditions must hold simultaneously for a system deadlock to exist; breaking any one condition prevents deadlocks."
    },
    {
      "type": "output_prediction",
      "difficulty": "easy",
      "question": "What is Virtual Memory in modern computer operating systems?",
      "options": [
        "A memory management capability that provides an idealized, contiguous abstraction of address space to each process, mapped to physical RAM pages and disk swap space.",
        "RAM stored entirely on an external USB flash drive.",
        "Memory used exclusively by virtual reality headsets.",
        "A hardware cache inside the CPU."
      ],
      "correctAnswer": "A memory management capability that provides an idealized, contiguous abstraction of address space to each process, mapped to physical RAM pages and disk swap space.",
      "explanation": "Virtual memory isolates process address spaces via MMU page tables, enabling processes to address more memory than physical RAM through demand paging."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "Which CPU scheduling algorithm allocates fixed time slices (quanta) to processes in a circular queue?",
      "options": [
        "Round Robin (RR)",
        "First-Come, First-Served (FCFS)",
        "Shortest Job First (SJF)",
        "Priority Scheduling"
      ],
      "correctAnswer": "Round Robin (RR)",
      "explanation": "Round Robin assigns each process a fixed time slice; if incomplete when the quantum expires, the process is preempted and placed at the tail of the queue."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "What is a \"Page Fault\" in operating system memory management?",
      "options": [
        "A hardware interrupt triggered when an executing program accesses a virtual memory page that is currently not mapped into physical RAM.",
        "A physical hardware defect in a RAM memory stick.",
        "A crash caused by invalid HTML web pages.",
        "An error caused by accessing uninitialized variables."
      ],
      "correctAnswer": "A hardware interrupt triggered when an executing program accesses a virtual memory page that is currently not mapped into physical RAM.",
      "explanation": "When an unmapped page is accessed, the CPU raises a page fault interrupt; the OS handles it by reading the required page from disk swap into a free RAM frame."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "What is the role of the Translation Lookaside Buffer (TLB) in CPU memory architecture?",
      "options": [
        "A fast hardware cache of recent virtual-to-physical address translations, avoiding multi-level page table traversals in main memory.",
        "A buffer storing translated human languages.",
        "A queue for network packets.",
        "A disk cache for temporary files."
      ],
      "correctAnswer": "A fast hardware cache of recent virtual-to-physical address translations, avoiding multi-level page table traversals in main memory.",
      "explanation": "The TLB speeds up virtual memory translation: a TLB hit returns the physical frame number in 1 clock cycle, skipping multi-level page table walks."
    },
    {
      "type": "debugging",
      "difficulty": "medium",
      "question": "What causes \"Thrashing\" in an operating system, and how does it manifest in system performance?",
      "options": [
        "The OS spends virtually all CPU cycles swapping pages in and out between RAM and disk swap rather than executing user instructions, causing system throughput to collapse.",
        "CPU fan failure causing overheating.",
        "Hard drive disk sector corruption.",
        "Multiple threads accessing the same integer."
      ],
      "correctAnswer": "The OS spends virtually all CPU cycles swapping pages in and out between RAM and disk swap rather than executing user instructions, causing system throughput to collapse.",
      "explanation": "Thrashing occurs when active processes exceed available physical RAM (sum of working sets > RAM), causing continuous cascading page faults."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "What is the difference between a Mutex (Mutual Exclusion) and a Counting Semaphore?",
      "options": [
        "A Mutex is a locking mechanism with ownership (only the thread that locked it can unlock it, binary 0/1); a Semaphore is a signaling mechanism with an integer counter accessible by any thread.",
        "Semaphores only work on single-core CPUs.",
        "Mutexes can allow up to 10 threads simultaneously.",
        "Both are identical in synchronization semantics."
      ],
      "correctAnswer": "A Mutex is a locking mechanism with ownership (only the thread that locked it can unlock it, binary 0/1); a Semaphore is a signaling mechanism with an integer counter accessible by any thread.",
      "explanation": "Mutexes enforce exclusive ownership over a critical section. Counting semaphores track a finite count of available shared resources."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "In Unix-like operating systems, what does the `fork()` system call do?",
      "options": [
        "Creates an exact duplicate child process by duplicating the calling process address space (optimized via Copy-On-Write), returning 0 to the child and the child’s PID to the parent.",
        "Splits a thread into two fibers.",
        "Terminates the current process.",
        "Executes a new binary executable file."
      ],
      "correctAnswer": "Creates an exact duplicate child process by duplicating the calling process address space (optimized via Copy-On-Write), returning 0 to the child and the child’s PID to the parent.",
      "explanation": "fork() clones the calling process; the return value allows code to branch into parent and child execution paths before calling execve()."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "How does Copy-On-Write (COW) optimize process creation in modern virtual memory systems when `fork()` is invoked?",
      "options": [
        "Parent and child share the exact same physical memory pages marked read-only; physical pages are only duplicated when either process attempts to write to them.",
        "Memory pages are copied onto disk immediately.",
        "Child processes are denied write permissions permanently.",
        "COW is only supported on SSD drives."
      ],
      "correctAnswer": "Parent and child share the exact same physical memory pages marked read-only; physical pages are only duplicated when either process attempts to write to them.",
      "explanation": "COW avoids duplicating gigabytes of RAM during fork(); pages remain shared until an actual write occurs, making fork() nearly instantaneous."
    },
    {
      "type": "debugging",
      "difficulty": "hard",
      "question": "What is a \"Zombie Process\" in Unix/Linux operating systems, and how is it cleaned up?",
      "options": [
        "A terminated process whose exit status has not yet been read by its parent via `wait()` or `waitpid()`; cleaned up when the parent reaps it or when adopted by init/systemd (PID 1).",
        "A malicious virus process executing in background.",
        "A process using 100% CPU in an infinite loop.",
        "A thread stuck in a deadlock."
      ],
      "correctAnswer": "A terminated process whose exit status has not yet been read by its parent via `wait()` or `waitpid()`; cleaned up when the parent reaps it or when adopted by init/systemd (PID 1).",
      "explanation": "Zombies retain an entry in the OS process table with exit code. If the parent exits without reaping, init (PID 1) inherits and reaps the zombie."
    },
    {
      "type": "code_reading",
      "difficulty": "hard",
      "question": "What is the role of an I/O Completion Port (IOCP) or `epoll` in scalable OS network programming?",
      "options": [
        "Event-driven, edge-triggered I/O notification mechanisms that monitor thousands of file descriptors in O(1) time without O(n) polling overhead of select()/poll().",
        "Hardware network cards for fiber optics.",
        "A cryptographic cipher for network packets.",
        "A tool that converts TCP into UDP."
      ],
      "correctAnswer": "Event-driven, edge-triggered I/O notification mechanisms that monitor thousands of file descriptors in O(1) time without O(n) polling overhead of select()/poll().",
      "explanation": "epoll (Linux) and IOCP (Windows) solve the C10K problem: instead of scanning all descriptors on every cycle, the kernel notifies user-space only of active socket events."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "How does the Linux Completely Fair Scheduler (CFS) achieve deterministic CPU time distribution across active tasks?",
      "options": [
        "By tracking each task’s virtual runtime (vruntime) inside a time-ordered Red-Black Tree, always picking the task with the lowest vruntime to run next.",
        "By rolling a pseudo-random number generator for each task.",
        "By giving all tasks exactly 10 milliseconds in strict sequence.",
        "By prioritizing tasks with the shortest file names."
      ],
      "correctAnswer": "By tracking each task’s virtual runtime (vruntime) inside a time-ordered Red-Black Tree, always picking the task with the lowest vruntime to run next.",
      "explanation": "CFS models an ideal multi-tasking CPU on hardware: tasks that have spent less virtual CPU time (lowest vruntime at leftmost R-B tree node) execute next."
    },
    {
      "type": "mcq",
      "difficulty": "hard",
      "question": "What is the distinction between Kernel Space and User Space in CPU privilege rings (e.g. x86 Ring 0 vs Ring 3)?",
      "options": [
        "Ring 0 (Kernel Space) has unrestricted access to hardware instructions and physical memory; Ring 3 (User Space) runs in protected mode, interacting with hardware strictly via system calls.",
        "Ring 3 has higher privilege than Ring 0.",
        "Kernel Space is stored in ROM; User Space in RAM.",
        "User space programs can execute privileged hardware assembly instructions directly."
      ],
      "correctAnswer": "Ring 0 (Kernel Space) has unrestricted access to hardware instructions and physical memory; Ring 3 (User Space) runs in protected mode, interacting with hardware strictly via system calls.",
      "explanation": "Hardware privilege separation prevents user applications from corrupting kernel memory or seizing hardware control; transitions happen via hardware trap gates (syscalls)."
    }
  ],
  "Computer Networks": [
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What are the 7 layers of the OSI Reference Model from Layer 1 to Layer 7?",
      "options": [
        "Physical, Data Link, Network, Transport, Session, Presentation, Application.",
        "Hardware, IP, TCP, HTTP, Browser, Display, User.",
        "Ethernet, Wi-Fi, Internet, Socket, Process, API, Interface.",
        "Physical, Virtual, Cloud, Gateway, Server, Client, User."
      ],
      "correctAnswer": "Physical, Data Link, Network, Transport, Session, Presentation, Application.",
      "explanation": "The standard 7 OSI layers: Physical (bits), Data Link (frames), Network (packets), Transport (segments), Session, Presentation, Application."
    },
    {
      "type": "code_reading",
      "difficulty": "easy",
      "question": "What is the key distinction between TCP (Transmission Control Protocol) and UDP (User Datagram Protocol)?",
      "options": [
        "TCP is connection-oriented, reliable (guarantees packet delivery, ordering, and flow control); UDP is connectionless, lightweight, and does not guarantee delivery or ordering.",
        "UDP is encrypted, while TCP is plaintext.",
        "TCP only runs over optical fiber.",
        "UDP can only send text messages."
      ],
      "correctAnswer": "TCP is connection-oriented, reliable (guarantees packet delivery, ordering, and flow control); UDP is connectionless, lightweight, and does not guarantee delivery or ordering.",
      "explanation": "TCP guarantees reliable in-order byte stream delivery via acknowledgments, retransmissions, and flow control. UDP prioritizes low-latency datagram transmission (gaming, DNS, streaming)."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What is the sequence of packets exchanged during the TCP Three-Way Handshake to establish a connection?",
      "options": [
        "SYN -> SYN-ACK -> ACK",
        "ACK -> SYN -> FIN",
        "CONNECT -> ACCEPT -> READY",
        "HELLO -> HELLO-ACK -> START"
      ],
      "correctAnswer": "SYN -> SYN-ACK -> ACK",
      "explanation": "The client sends SYN (synchronize sequence number); the server replies with SYN-ACK; the client completes connection establishment with ACK."
    },
    {
      "type": "output_prediction",
      "difficulty": "easy",
      "question": "Which network protocol translates human-readable domain names (e.g., example.com) into IP addresses?",
      "options": [
        "DNS (Domain Name System)",
        "DHCP",
        "ARP",
        "SNMP"
      ],
      "correctAnswer": "DNS (Domain Name System)",
      "explanation": "DNS is the decentralized hierarchical naming system that resolves domain names to numerical IP addresses (A/AAAA records)."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What is the standard port number for secure HTTPS web traffic?",
      "options": [
        "443",
        "80",
        "22",
        "21"
      ],
      "correctAnswer": "443",
      "explanation": "Standard HTTP traffic uses port 80; TLS-encrypted HTTPS traffic uses TCP port 443."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "How does the TCP Congestion Control algorithm (Slow Start and Congestion Avoidance) adapt to network bandwidth capacity?",
      "options": [
        "Slow Start doubles the congestion window (CWND) exponentially each RTT until a threshold (ssthresh) is reached, then increases linearly (additive increase, multiplicative decrease).",
        "It sends all data in a single burst on connection opening.",
        "It asks internet service providers for bandwidth quotas.",
        "It pauses connection every 10 seconds."
      ],
      "correctAnswer": "Slow Start doubles the congestion window (CWND) exponentially each RTT until a threshold (ssthresh) is reached, then increases linearly (additive increase, multiplicative decrease).",
      "explanation": "AIMD (Additive Increase / Multiplicative Decrease) probes network capacity exponentially during Slow Start, transitioning to linear increases and halving window size on packet loss."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "What is the purpose of the Address Resolution Protocol (ARP)?",
      "options": [
        "Maps an IPv4 address to a physical hardware MAC address on a local area network (LAN) data link layer.",
        "Maps domain names to IP addresses.",
        "Assigns IP addresses dynamically to host computers.",
        "Encrypts Wi-Fi router passwords."
      ],
      "correctAnswer": "Maps an IPv4 address to a physical hardware MAC address on a local area network (LAN) data link layer.",
      "explanation": "Routers and switches use ARP broadcast requests to identify the Layer 2 Ethernet MAC address that corresponds to a target Layer 3 IP address."
    },
    {
      "type": "debugging",
      "difficulty": "medium",
      "question": "Why does a TCP connection enter the `TIME_WAIT` state for 2 * MSL (Maximum Segment Lifetime) after active close?",
      "options": [
        "To ensure the final ACK was received by the remote peer (retransmitting ACK if FIN is resent) and allow lingering delayed packets in the network to expire without corrupting future connections.",
        "Because the operating system takes 2 minutes to free memory.",
        "To prevent hacker penetration testing.",
        "It is a bug in BSD socket implementations."
      ],
      "correctAnswer": "To ensure the final ACK was received by the remote peer (retransmitting ACK if FIN is resent) and allow lingering delayed packets in the network to expire without corrupting future connections.",
      "explanation": "TIME_WAIT guarantees reliable connection termination and prevents delayed duplicate segments from a past incarnation from interfering with a newly opened socket on the same port."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "What is Network Address Translation (NAT) and why was it instrumental in extending the lifespan of IPv4?",
      "options": [
        "It modifies IP packet headers while in transit across a router, allowing hundreds of private devices on a local network to share a single public IPv4 address.",
        "It converts IPv4 packets into IPv6 packets.",
        "It encrypts internet traffic with VPN tunnels.",
        "It increases internet speed by 10x."
      ],
      "correctAnswer": "It modifies IP packet headers while in transit across a router, allowing hundreds of private devices on a local network to share a single public IPv4 address.",
      "explanation": "NAT maps private RFC 1918 addresses (192.168.x.x, 10.x.x.x) and unique port numbers to one public IP, mitigating IPv4 32-bit address exhaustion."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "What is the function of the Subnet Mask in IPv4 networking (e.g. 255.255.255.0 or /24)?",
      "options": [
        "Separates the 32-bit IP address into the Network portion (identifying the subnet) and the Host portion (identifying the specific device on that subnet).",
        "Encrypts the IP address.",
        "Defines the maximum bandwidth of the router.",
        "Sets the Wi-Fi password."
      ],
      "correctAnswer": "Separates the 32-bit IP address into the Network portion (identifying the subnet) and the Host portion (identifying the specific device on that subnet).",
      "explanation": "Bitwise ANDing an IP address with its subnet mask reveals the network address, enabling routers to determine if an IP is local or requires gateway forwarding."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "How does HTTP/2 multiplexing eliminate the \"Head-of-Line Blocking\" problem present at the application layer in HTTP/1.1?",
      "options": [
        "By breaking HTTP messages into independent binary frames and interleaving multiple bidirectional streams concurrently over a single shared TCP connection.",
        "By opening 50 TCP connections in parallel.",
        "By sending all web assets as base64 strings in the initial HTML file.",
        "By replacing TCP with UDP."
      ],
      "correctAnswer": "By breaking HTTP messages into independent binary frames and interleaving multiple bidirectional streams concurrently over a single shared TCP connection.",
      "explanation": "HTTP/1.1 pipelining suffered from application-level head-of-line blocking: requests had to be answered in order. HTTP/2 interleaves binary frames on independent streams."
    },
    {
      "type": "debugging",
      "difficulty": "hard",
      "question": "Why does HTTP/3 switch from TCP to QUIC (running over UDP) to address transport-layer Head-of-Line Blocking?",
      "options": [
        "In HTTP/2 over TCP, a single lost packet halts ALL multiplexed streams until retransmitted; QUIC manages independent stream recovery over UDP so lost packets stall only the affected stream.",
        "TCP was deprecated by the IETF.",
        "UDP provides higher encryption security than TLS.",
        "QUIC eliminates the need for IP routing."
      ],
      "correctAnswer": "In HTTP/2 over TCP, a single lost packet halts ALL multiplexed streams until retransmitted; QUIC manages independent stream recovery over UDP so lost packets stall only the affected stream.",
      "explanation": "Because TCP enforces strict byte-stream ordering at the OS transport layer, a packet drop blocks the entire TCP buffer. QUIC handles loss recovery per stream over UDP."
    },
    {
      "type": "code_reading",
      "difficulty": "hard",
      "question": "What occurs during the TLS 1.3 handshake to establish an encrypted session in a single round-trip (1-RTT)?",
      "options": [
        "Client sends ClientHello with supported ciphers AND its Diffie-Hellman key share guess; server responds with ServerHello, its key share, and encrypted certificate, deriving shared secret in 1-RTT.",
        "Client sends its private key to the server.",
        "The server authenticates via cleartext passwords.",
        "TLS 1.3 takes 4 round-trips to establish encryption."
      ],
      "correctAnswer": "Client sends ClientHello with supported ciphers AND its Diffie-Hellman key share guess; server responds with ServerHello, its key share, and encrypted certificate, deriving shared secret in 1-RTT.",
      "explanation": "TLS 1.3 eliminates obsolete key exchange mechanisms (RSA key transport), enabling speculative Diffie-Hellman parameter exchange in the initial ClientHello for 1-RTT setup."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "How does the Border Gateway Protocol (BGP) govern inter-domain routing across Autonomous Systems (AS) on the global internet backbone?",
      "options": [
        "Path-vector routing protocol where routers exchange reachable network prefix lists along with AS-Path attributes, applying routing policies to determine loop-free inter-AS paths.",
        "Floods all internet routers with link-state advertisements every 50ms.",
        "Assigns IP addresses using centralized master servers.",
        "Controls local Wi-Fi channel selection."
      ],
      "correctAnswer": "Path-vector routing protocol where routers exchange reachable network prefix lists along with AS-Path attributes, applying routing policies to determine loop-free inter-AS paths.",
      "explanation": "BGP is the routing protocol of the global internet: Autonomous Systems advertise network prefixes with AS-PATH vectors, preventing loops and enforcing peering business policies."
    },
    {
      "type": "mcq",
      "difficulty": "hard",
      "question": "What is Anycast routing, and how is it utilized in Content Delivery Networks (CDNs) and root DNS servers?",
      "options": [
        "Assigns the exact same IP address to multiple geographically distributed servers; BGP routes client traffic to the topologically closest server instance automatically.",
        "Broadcasts packets to every computer on the internet simultaneously.",
        "Sends packets through satellite links only.",
        "A peer-to-peer torrent protocol."
      ],
      "correctAnswer": "Assigns the exact same IP address to multiple geographically distributed servers; BGP routes client traffic to the topologically closest server instance automatically.",
      "explanation": "Anycast advertises a single IP from multiple points of presence. Internet routing tables naturally direct user requests to the nearest edge location for low latency and DDoS absorption."
    }
  ],
  "Artificial Intelligence": [
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What is the Turing Test designed to evaluate in Artificial Intelligence?",
      "options": [
        "Whether a machine exhibits human-indistinguishable intelligent conversational behavior when judged by an evaluator.",
        "The execution clock speed of a neural network.",
        "The accuracy of database search queries.",
        "The battery life of autonomous robots."
      ],
      "correctAnswer": "Whether a machine exhibits human-indistinguishable intelligent conversational behavior when judged by an evaluator.",
      "explanation": "Proposed by Alan Turing in 1950, the test measures if a human evaluator can reliably differentiate between natural language responses from a human and a computer."
    },
    {
      "type": "code_reading",
      "difficulty": "easy",
      "question": "In AI state-space search, what does the A* search algorithm use to guide exploration toward the goal node?",
      "options": [
        "f(n) = g(n) + h(n), combining actual path cost from start g(n) with an admissible heuristic estimate to the goal h(n).",
        "Random coin flips at each branch.",
        "Depth of the deepest leaf node.",
        "Alphabetical order of node names."
      ],
      "correctAnswer": "f(n) = g(n) + h(n), combining actual path cost from start g(n) with an admissible heuristic estimate to the goal h(n).",
      "explanation": "A* evaluates nodes using f(n) = g(n) + h(n). If the heuristic h(n) never overestimates the true cost (admissible), A* guarantees finding the optimal path."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What is an Expert System in classical symbolic AI?",
      "options": [
        "A computer system that emulates the decision-making ability of a human expert using an explicit Knowledge Base and an Inference Engine (if-then rules).",
        "A deep neural network with 100 layers.",
        "A supercomputer used for weather forecasting.",
        "A human software architect."
      ],
      "correctAnswer": "A computer system that emulates the decision-making ability of a human expert using an explicit Knowledge Base and an Inference Engine (if-then rules).",
      "explanation": "Classical rule-based expert systems (like MYCIN) use structured facts and deductive inference rules to simulate domain-expert diagnosis."
    },
    {
      "type": "output_prediction",
      "difficulty": "easy",
      "question": "In game-playing AI (e.g. Chess or Tic-Tac-Toe), what is the goal of the Minimax algorithm?",
      "options": [
        "Maximize the player’s score while assuming the opponent will play optimal moves to minimize that score.",
        "Minimize total game duration.",
        "Pick random moves to confuse the opponent.",
        "Maximize memory usage on the computer."
      ],
      "correctAnswer": "Maximize the player’s score while assuming the opponent will play optimal moves to minimize that score.",
      "explanation": "Minimax assumes zero-sum adversarial play: the maximizing player selects the branch that maximizes the evaluation, assuming the minimizing opponent does the reverse."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What optimization technique prunes irrelevant branches from a Minimax search tree without altering the final decision?",
      "options": [
        "Alpha-Beta Pruning",
        "Gradient Descent",
        "Backpropagation",
        "Beam Search alone"
      ],
      "correctAnswer": "Alpha-Beta Pruning",
      "explanation": "Alpha-Beta pruning tracks the best already explored options (alpha for max, beta for min), terminating search on branches proven to be worse than existing choices."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "What is a Markov Decision Process (MDP) in reinforcement learning, and what are its four formal components?",
      "options": [
        "A mathematical framework for modeling decision making: States (S), Actions (A), Transition Probabilities P(s'|s,a), and Reward function R(s,a).",
        "A natural language grammar model.",
        "A database normalization technique.",
        "A hardware memory controller."
      ],
      "correctAnswer": "A mathematical framework for modeling decision making: States (S), Actions (A), Transition Probabilities P(s'|s,a), and Reward function R(s,a).",
      "explanation": "MDPs formalize sequential decision-making under uncertainty, satisfying the Markov property: future states depend strictly on current state and action."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "What is the role of the Bellman Equation in dynamic programming and reinforcement learning?",
      "options": [
        "Decomposes the value of a state into the immediate expected reward plus the discounted value of successor states: V(s) = R(s) + gamma * sum(P * V(s')).",
        "Computes the learning rate of neural networks.",
        "Calculates vector dot products.",
        "Determines when to stop training a classifier."
      ],
      "correctAnswer": "Decomposes the value of a state into the immediate expected reward plus the discounted value of successor states: V(s) = R(s) + gamma * sum(P * V(s')).",
      "explanation": "The Bellman equation defines value recursively, enabling value iteration and Q-learning algorithms to converge on optimal policies."
    },
    {
      "type": "debugging",
      "difficulty": "medium",
      "question": "What is the Exploration vs. Exploitation dilemma in multi-armed bandit and reinforcement learning agents?",
      "options": [
        "Balancing between exploiting known high-reward actions versus exploring untried actions that might yield higher long-term rewards (e.g. via epsilon-greedy).",
        "Balancing CPU utilization against RAM consumption.",
        "Choosing between supervised and unsupervised learning.",
        "Balancing data collection against model deployment."
      ],
      "correctAnswer": "Balancing between exploiting known high-reward actions versus exploring untried actions that might yield higher long-term rewards (e.g. via epsilon-greedy).",
      "explanation": "Agents that only exploit get trapped in sub-optimal local policies; agents that only explore never harvest high rewards. Epsilon-greedy balances both."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "What is the purpose of Grounding in modern LLM (Large Language Model) agent architectures?",
      "options": [
        "Connecting model generation to verifiable external data sources (search APIs, enterprise databases) to eliminate hallucinations and cite factual evidence.",
        "Connecting the server to physical electrical ground.",
        "Running models on CPU instead of GPU.",
        "Converting text into binary code."
      ],
      "correctAnswer": "Connecting model generation to verifiable external data sources (search APIs, enterprise databases) to eliminate hallucinations and cite factual evidence.",
      "explanation": "Grounding anchors generative outputs in authoritative retrieved text (RAG), verifying assertions with source citations rather than relying on parametric memory alone."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "What is Temperature in Large Language Model text generation sampling?",
      "options": [
        "A hyperparameter that scales logits before softmax: lower values (< 0.3) produce deterministic, focused output; higher values (> 0.8) increase diversity and randomness.",
        "The physical temperature of the GPU hardware.",
        "The training duration in hours.",
        "The length of the context window."
      ],
      "correctAnswer": "A hyperparameter that scales logits before softmax: lower values (< 0.3) produce deterministic, focused output; higher values (> 0.8) increase diversity and randomness.",
      "explanation": "Dividing logits by temperature adjusts entropy: T -> 0 approaches argmax (greedy decoding); T > 1 flattens probability distribution, increasing novelty."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "How does Monte Carlo Tree Search (MCTS) enable game-playing agents like AlphaGo to evaluate vast game trees without full minimax expansion?",
      "options": [
        "Repeats four iterative steps: Selection (using UCT), Expansion, Simulation (random or policy rollout), and Backpropagation to estimate node win probabilities.",
        "By memorizing all possible chess moves in a database.",
        "By guessing random moves using genetic algorithms.",
        "By running linear regression on game boards."
      ],
      "correctAnswer": "Repeats four iterative steps: Selection (using UCT), Expansion, Simulation (random or policy rollout), and Backpropagation to estimate node win probabilities.",
      "explanation": "MCTS balances exploration and exploitation via Upper Confidence bounds for Trees (UCT), focusing evaluation on promising game trajectories."
    },
    {
      "type": "code_reading",
      "difficulty": "hard",
      "question": "What is the Self-Attention mechanism in the Transformer architecture mathematically defined as?",
      "options": [
        "Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V, computing pairwise attention weights between query and key tokens to aggregate value representations.",
        "Attention(Q, K, V) = Q + K + V.",
        "Attention(Q, K, V) = sigmoid(Q * K * V).",
        "A convolutional filter over token embeddings."
      ],
      "correctAnswer": "Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V, computing pairwise attention weights between query and key tokens to aggregate value representations.",
      "explanation": "Scaled dot-product attention computes compatibility between queries and keys, scaling by 1/sqrt(d_k) to prevent vanishing gradients in softmax, weighting values V."
    },
    {
      "type": "debugging",
      "difficulty": "hard",
      "question": "Why do pure autoregressive LLMs suffer from \"Catastrophic Hallucination\" on factual queries, and how does Retrieval-Augmented Generation (RAG) resolve this?",
      "options": [
        "LLMs are probabilistic next-token predictors without internal truth models; RAG retrieves relevant ground-truth context documents and passes them into the prompt window.",
        "LLMs suffer hardware bit flips.",
        "RAG retrains the model on every query.",
        "Hallucination is caused by low GPU memory."
      ],
      "correctAnswer": "LLMs are probabilistic next-token predictors without internal truth models; RAG retrieves relevant ground-truth context documents and passes them into the prompt window.",
      "explanation": "LLMs generate syntactically convincing but factually ungrounded text. RAG provides factual reference documents in the context window for bounded generation."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "In Reinforcement Learning from Human Feedback (RLHF), what role does the Reward Model (RM) perform?",
      "options": [
        "Trained on pairs of human-ranked model completions to output a scalar reward score, used by Proximal Policy Optimization (PPO) to align the base LLM with human preferences.",
        "Rewards human annotators with financial payments.",
        "Generates automated test cases.",
        "Penalizes long answers."
      ],
      "correctAnswer": "Trained on pairs of human-ranked model completions to output a scalar reward score, used by Proximal Policy Optimization (PPO) to align the base LLM with human preferences.",
      "explanation": "The reward model scores completions based on human preference data (helpfulness and harmlessness), acting as the objective function for RL fine-tuning."
    },
    {
      "type": "mcq",
      "difficulty": "hard",
      "question": "What is Vector Embeddings and Cosine Similarity in semantic search pipelines?",
      "options": [
        "Dense numerical vectors representing text meaning in high-dimensional space; cosine similarity measures the cosine of the angle between two vectors to determine semantic relatedness.",
        "A method for compressing text into zip files.",
        "An encryption cipher for vector graphics.",
        "A database clustering algorithm."
      ],
      "correctAnswer": "Dense numerical vectors representing text meaning in high-dimensional space; cosine similarity measures the cosine of the angle between two vectors to determine semantic relatedness.",
      "explanation": "Embedding models map concepts to dense vectors where semantically similar texts are close together; cosine similarity computes the normalized dot product as a distance metric."
    }
  ],
  "Machine Learning": [
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What is the difference between Supervised Learning and Unsupervised Learning?",
      "options": [
        "Supervised learning trains on labeled input-output pairs (targets known); Unsupervised learning discovers patterns and structure in unlabeled data without target outputs.",
        "Unsupervised learning requires humans to label all data.",
        "Supervised learning can only be applied to images.",
        "There is no distinction between them."
      ],
      "correctAnswer": "Supervised learning trains on labeled input-output pairs (targets known); Unsupervised learning discovers patterns and structure in unlabeled data without target outputs.",
      "explanation": "Supervised algorithms learn a mapping from features X to labels Y. Unsupervised algorithms (clustering, PCA) identify intrinsic data geometry without labels."
    },
    {
      "type": "code_reading",
      "difficulty": "easy",
      "question": "What does Overfitting indicate when evaluating a machine learning model?",
      "options": [
        "The model learns the training data and noise too well, achieving high training accuracy but failing to generalize to unseen test data.",
        "The model is too simple to learn the underlying pattern.",
        "The model runs too quickly.",
        "The dataset contains too few columns."
      ],
      "correctAnswer": "The model learns the training data and noise too well, achieving high training accuracy but failing to generalize to unseen test data.",
      "explanation": "Overfitting corresponds to high variance: memorizing training examples including random noise, resulting in poor out-of-sample generalization."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "Which metric measures the proportion of actual positive cases that were correctly identified by a classification model?",
      "options": [
        "Recall (Sensitivity)",
        "Precision",
        "Accuracy",
        "Specificity"
      ],
      "correctAnswer": "Recall (Sensitivity)",
      "explanation": "Recall is True Positives / (True Positives + False Negatives), measuring the model's ability to detect all positive instances."
    },
    {
      "type": "output_prediction",
      "difficulty": "easy",
      "question": "In binary classification, what is Precision?",
      "options": [
        "True Positives / (True Positives + False Positives)",
        "True Positives / (True Positives + False Negatives)",
        "(True Positives + True Negatives) / Total Samples",
        "False Positives / True Negatives"
      ],
      "correctAnswer": "True Positives / (True Positives + False Positives)",
      "explanation": "Precision answers: \"Of all items the model predicted as positive, how many were truly positive?\""
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What is the purpose of splitting data into Training, Validation, and Test sets?",
      "options": [
        "Training fits model parameters; Validation tunes hyperparameters and prevents overfitting; Test evaluates unbiased generalization performance.",
        "To reduce dataset size to speed up training.",
        "To ensure all models achieve 100% accuracy.",
        "To remove duplicate columns."
      ],
      "correctAnswer": "Training fits model parameters; Validation tunes hyperparameters and prevents overfitting; Test evaluates unbiased generalization performance.",
      "explanation": "Separating validation from testing ensures the final test set remains an untouched, unbiased measure of real-world generalization."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "What is the Bias-Variance Tradeoff in machine learning model optimization?",
      "options": [
        "High bias causes underfitting (oversimplifying assumptions); high variance causes overfitting (sensitivity to training noise); optimal models minimize the sum of bias, variance, and irreducible error.",
        "Bias measures training speed; variance measures prediction speed.",
        "Increasing model complexity always reduces both bias and variance.",
        "Bias applies only to neural networks."
      ],
      "correctAnswer": "High bias causes underfitting (oversimplifying assumptions); high variance causes overfitting (sensitivity to training noise); optimal models minimize the sum of bias, variance, and irreducible error.",
      "explanation": "Total error = Bias^2 + Variance + Irreducible Error. Simple models have high bias; complex models have high variance. Regularization balances the two."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "What is the distinction between L1 Regularization (Lasso) and L2 Regularization (Ridge)?",
      "options": [
        "L1 adds the absolute value of weights as a penalty (driving coefficients to exact zeros for feature selection); L2 adds squared weights (shrinking coefficients smoothly).",
        "L2 drives weights to exact zeros.",
        "L1 can only be used with decision trees.",
        "Both penalties are identical."
      ],
      "correctAnswer": "L1 adds the absolute value of weights as a penalty (driving coefficients to exact zeros for feature selection); L2 adds squared weights (shrinking coefficients smoothly).",
      "explanation": "L1 norm geometry has diamond corners that intersect coordinate axes, inducing sparsity (feature selection). L2 spherical contour shrinks weights without zeroing them."
    },
    {
      "type": "debugging",
      "difficulty": "medium",
      "question": "Why is Accuracy a misleading performance metric on severely imbalanced datasets (e.g. 99% negative, 1% positive fraud detection)?",
      "options": [
        "A naive classifier that always predicts \"negative\" achieves 99% accuracy while detecting zero fraud cases; F1-score or PR-AUC should be used instead.",
        "Accuracy is computationally expensive on large numbers.",
        "Imbalanced datasets crash the accuracy function.",
        "Accuracy only applies to multi-class classification."
      ],
      "correctAnswer": "A naive classifier that always predicts \"negative\" achieves 99% accuracy while detecting zero fraud cases; F1-score or PR-AUC should be used instead.",
      "explanation": "On imbalanced data, high accuracy reflects majority class prevalence rather than minority class detection capability. Precision, Recall, and PR-AUC are required."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "How do Ensemble Learning methods like Random Forest (Bagging) reduce model variance?",
      "options": [
        "By training multiple decision trees in parallel on bootstrap subsets of data with random feature subsets and averaging their predictions (voting).",
        "By training a single decision tree with infinite depth.",
        "By deleting features with low variance.",
        "By converting decision trees into linear regression."
      ],
      "correctAnswer": "By training multiple decision trees in parallel on bootstrap subsets of data with random feature subsets and averaging their predictions (voting).",
      "explanation": "Averaging predictions across decorrelated, high-variance trees cancels out individual errors, significantly reducing variance without increasing bias."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "What is the difference between Bagging and Boosting in ensemble learning algorithms?",
      "options": [
        "Bagging trains independent models in parallel to reduce variance (e.g. Random Forest); Boosting trains models sequentially, where each model corrects the errors of previous models to reduce bias (e.g. XGBoost).",
        "Boosting trains models in parallel; Bagging trains sequentially.",
        "Bagging is only for classification; Boosting is only for regression.",
        "Both methods use identical loss functions."
      ],
      "correctAnswer": "Bagging trains independent models in parallel to reduce variance (e.g. Random Forest); Boosting trains models sequentially, where each model corrects the errors of previous models to reduce bias (e.g. XGBoost).",
      "explanation": "Bagging aggregates parallel models (reducing variance). Boosting builds an additive model sequentially by fitting each new learner to the pseudo-residuals of predecessors."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "How does Gradient Boosting (e.g. XGBoost, LightGBM) minimize an arbitrary differentiable loss function?",
      "options": [
        "At each iteration, a new decision tree is fit to the negative gradients (pseudo-residuals) of the loss function with respect to current ensemble predictions.",
        "By randomly shuffling weights.",
        "By inverting the covariance matrix.",
        "By executing k-means clustering."
      ],
      "correctAnswer": "At each iteration, a new decision tree is fit to the negative gradients (pseudo-residuals) of the loss function with respect to current ensemble predictions.",
      "explanation": "Gradient boosting generalizes boosting to any differentiable loss function: each base learner approximates the negative gradient step in function space."
    },
    {
      "type": "debugging",
      "difficulty": "hard",
      "question": "What causes the Vanishing Gradient problem during backpropagation in deep neural networks with sigmoid/tanh activations?",
      "options": [
        "Derivatives of sigmoid/tanh saturate at 0 for large inputs; multiplying many small derivatives (< 0.25) across deep layers causes gradients to decay exponentially toward zero.",
        "Learning rate set too high.",
        "Too much training data.",
        "Using GPU acceleration."
      ],
      "correctAnswer": "Derivatives of sigmoid/tanh saturate at 0 for large inputs; multiplying many small derivatives (< 0.25) across deep layers causes gradients to decay exponentially toward zero.",
      "explanation": "By the chain rule, gradients are products of layer jacobians. If activation derivatives are small, early layer weights receive negligible updates. ReLU and skip connections solve this."
    },
    {
      "type": "code_reading",
      "difficulty": "hard",
      "question": "In unsupervised learning, what does Principal Component Analysis (PCA) achieve mathematically?",
      "options": [
        "Finds orthogonal axes of maximal variance by computing the eigenvectors of the data covariance matrix, projecting data into lower dimensions while minimizing reconstruction error.",
        "Assigns labels to data clusters.",
        "Scales features between 0 and 1.",
        "Eliminates outliers from data."
      ],
      "correctAnswer": "Finds orthogonal axes of maximal variance by computing the eigenvectors of the data covariance matrix, projecting data into lower dimensions while minimizing reconstruction error.",
      "explanation": "PCA performs eigendecomposition of the covariance matrix (or SVD of data matrix), rotating coordinates along principal directions of highest variance for dimensionality reduction."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "What is the role of Batch Normalization in training deep neural network architectures?",
      "options": [
        "Normalizes layer inputs across the mini-batch (zero mean, unit variance) and scales with learnable gamma/beta, smoothing the loss landscape and stabilizing internal covariate shift.",
        "Batches training data into zip files.",
        "Normalizes learning rate to 1.0.",
        "Reduces model parameter count."
      ],
      "correctAnswer": "Normalizes layer inputs across the mini-batch (zero mean, unit variance) and scales with learnable gamma/beta, smoothing the loss landscape and stabilizing internal covariate shift.",
      "explanation": "Batch Normalization enables faster training with higher learning rates and reduced sensitivity to initialization by preventing activations from exploding or vanishing."
    },
    {
      "type": "mcq",
      "difficulty": "hard",
      "question": "What is the mathematical formulation of the ROC-AUC score in binary classification?",
      "options": [
        "The Area Under the Receiver Operating Characteristic curve plotting True Positive Rate vs. False Positive Rate across all classification thresholds, equal to the probability of ranking a random positive above a random negative.",
        "The ratio of true positives to false positives.",
        "The slope of the decision boundary line.",
        "The percentage of correct predictions at threshold 0.5."
      ],
      "correctAnswer": "The Area Under the Receiver Operating Characteristic curve plotting True Positive Rate vs. False Positive Rate across all classification thresholds, equal to the probability of ranking a random positive above a random negative.",
      "explanation": "ROC-AUC integrates TPR vs FPR over all possible thresholds; it has the probabilistic interpretation of Wilcoxon-Mann-Whitney ranking concordance."
    }
  ],
  "Data Science": [
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "In exploratory data analysis (EDA), what is an Outlier in a dataset?",
      "options": [
        "A data point that differs significantly from other observations in the sample, potentially caused by variability or experimental error.",
        "A missing value denoted as NaN.",
        "A duplicate row in a database.",
        "The header row of a CSV file."
      ],
      "correctAnswer": "A data point that differs significantly from other observations in the sample, potentially caused by variability or experimental error.",
      "explanation": "Outliers are extreme observations that deviate markedly from overall data distribution, identified via boxplots (1.5 * IQR) or z-scores (> 3)."
    },
    {
      "type": "code_reading",
      "difficulty": "easy",
      "question": "What is the difference between Mean and Median as measures of central tendency?",
      "options": [
        "Mean is the arithmetic average (sensitive to extreme outliers); Median is the middle value in a sorted distribution (robust against outliers).",
        "Median is always larger than mean.",
        "Mean can only be calculated for integers.",
        "Both values are identical in skewed distributions."
      ],
      "correctAnswer": "Mean is the arithmetic average (sensitive to extreme outliers); Median is the middle value in a sorted distribution (robust against outliers).",
      "explanation": "In skewed distributions (e.g. household income), a few extreme values pull the mean heavily, whereas the median remains stable at the 50th percentile."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What is Standard Deviation a measure of in statistics?",
      "options": [
        "The amount of variation, dispersion, or spread of a set of values from their mean.",
        "The average value of the dataset.",
        "The difference between maximum and minimum values.",
        "The number of rows in the table."
      ],
      "correctAnswer": "The amount of variation, dispersion, or spread of a set of values from their mean.",
      "explanation": "Standard deviation (square root of variance) quantifies how tightly data clusters around the mean in the original measurement units."
    },
    {
      "type": "output_prediction",
      "difficulty": "easy",
      "question": "What does a Pearson correlation coefficient of -0.92 between variable X and variable Y indicate?",
      "options": [
        "A strong negative linear relationship: as X increases, Y decreases proportionally.",
        "No relationship between X and Y.",
        "A strong positive relationship.",
        "That X causes Y directly."
      ],
      "correctAnswer": "A strong negative linear relationship: as X increases, Y decreases proportionally.",
      "explanation": "Pearson r ranges from -1 to +1; a value of -0.92 indicates a strong inverse linear association between the two variables."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What does the phrase \"Correlation does not imply Causation\" mean in data science?",
      "options": [
        "A statistical association between two variables does not prove that one variable causes the change in the other (confounding variables may exist).",
        "Correlated data can never be used in models.",
        "Causation is impossible to measure.",
        "Correlation coefficients are always flawed."
      ],
      "correctAnswer": "A statistical association between two variables does not prove that one variable causes the change in the other (confounding variables may exist).",
      "explanation": "Two variables may correlate strongly due to coincidence, reverse causality, or a lurking third confounding factor (e.g., ice cream sales and drowning rates)."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "When imputing missing data in a numeric column with high skewness, why is median imputation preferred over mean imputation?",
      "options": [
        "The median is resistant to extreme skewness and outliers, preserving realistic typical values without distorting the central distribution.",
        "Mean imputation is illegal in data science.",
        "The median replaces missing values with zeros.",
        "Median imputation can only be done in SQL."
      ],
      "correctAnswer": "The median is resistant to extreme skewness and outliers, preserving realistic typical values without distorting the central distribution.",
      "explanation": "Because outliers pull the mean into the long tail, imputing with the mean introduces systematic bias into skewed features."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "What is the purpose of One-Hot Encoding when preprocessing categorical features for linear models or neural networks?",
      "options": [
        "Converts categorical variables into binary indicator columns (0s and 1s), preventing algorithms from assuming artificial ordinal relationships between categories.",
        "Encrypts category names for privacy.",
        "Combines all categories into a single text string.",
        "Deletes categorical columns."
      ],
      "correctAnswer": "Converts categorical variables into binary indicator columns (0s and 1s), preventing algorithms from assuming artificial ordinal relationships between categories.",
      "explanation": "Label encoding (e.g. Red=1, Green=2, Blue=3) implies false mathematical ordering (Blue > Red). One-hot encoding treats all categories symmetrically."
    },
    {
      "type": "debugging",
      "difficulty": "medium",
      "question": "What is \"Data Leakage\" during machine learning preprocessing, and how does it compromise model evaluation?",
      "options": [
        "Information from the test/validation set (e.g. global mean scaling, future timestamps) is inadvertently shared during training, causing overly optimistic validation scores that fail in production.",
        "Data being stolen by hackers.",
        "Hard drive data corruption.",
        "Printing data to console logs."
      ],
      "correctAnswer": "Information from the test/validation set (e.g. global mean scaling, future timestamps) is inadvertently shared during training, causing overly optimistic validation scores that fail in production.",
      "explanation": "Fitting scalers, imputers, or feature selectors on the entire dataset before splitting leaks test distribution information into the training phase."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "In statistical hypothesis testing, what is the meaning of a p-value less than alpha (e.g. p < 0.05)?",
      "options": [
        "Assuming the null hypothesis is true, the probability of observing an effect as extreme as the sample data is less than 5%; reject the null hypothesis in favor of statistical significance.",
        "The probability that the null hypothesis is true is 5%.",
        "The experimental hypothesis is 95% false.",
        "The model has 5% accuracy."
      ],
      "correctAnswer": "Assuming the null hypothesis is true, the probability of observing an effect as extreme as the sample data is less than 5%; reject the null hypothesis in favor of statistical significance.",
      "explanation": "The p-value is P(observed or more extreme data | H0 is true). If below threshold alpha, the observed difference is unlikely to be pure random chance."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "What does the Central Limit Theorem (CLT) state regarding the sampling distribution of the sample mean?",
      "options": [
        "Given a sufficiently large sample size (typically n >= 30), the sampling distribution of the mean approximates a normal distribution regardless of the underlying population shape.",
        "All datasets must follow a normal distribution.",
        "The mean is always equal to the median.",
        "Large samples always eliminate sampling bias."
      ],
      "correctAnswer": "Given a sufficiently large sample size (typically n >= 30), the sampling distribution of the mean approximates a normal distribution regardless of the underlying population shape.",
      "explanation": "CLT forms the foundation of parametric inference: sample means drawn from any finite-variance distribution are normally distributed as sample size grows."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "What is Simpson’s Paradox in statistical data analysis, and how can it lead to reversed conclusions?",
      "options": [
        "A trend or correlation observed in several individual groups disappears or reverses when the groups are aggregated together, caused by a confounding lurking variable.",
        "A model with high training accuracy that fails on test data.",
        "A paradox where mean and median are equal.",
        "A bug in statistical calculation packages."
      ],
      "correctAnswer": "A trend or correlation observed in several individual groups disappears or reverses when the groups are aggregated together, caused by a confounding lurking variable.",
      "explanation": "Confounding variables that influence group sizes can invert aggregate relationships (e.g. Berkeley admissions bias study), necessitating subgroup analysis."
    },
    {
      "type": "debugging",
      "difficulty": "hard",
      "question": "In regression modeling, what is Multicollinearity, and how does it distort ordinary least squares (OLS) coefficients?",
      "options": [
        "Two or more independent predictor variables are highly linearly correlated, inflating coefficient standard errors and making individual feature effects unstable and uninterpretable.",
        "The target variable is correlated with itself.",
        "The dataset contains more rows than columns.",
        "The model exhibits zero residual error."
      ],
      "correctAnswer": "Two or more independent predictor variables are highly linearly correlated, inflating coefficient standard errors and making individual feature effects unstable and uninterpretable.",
      "explanation": "Multicollinearity causes (X^T * X) matrix to become nearly singular (high condition number), resulting in wildly volatile coefficient estimates diagnosed via VIF."
    },
    {
      "type": "code_reading",
      "difficulty": "hard",
      "question": "What is the distinction between a Type I Error and a Type II Error in hypothesis testing?",
      "options": [
        "Type I Error is a False Positive (rejecting a true null hypothesis); Type II Error is a False Negative (failing to reject a false null hypothesis).",
        "Type I Error is a False Negative; Type II Error is a False Positive.",
        "Type I Error occurs in training; Type II Error occurs in production.",
        "Type I Error applies to numbers; Type II Error applies to strings."
      ],
      "correctAnswer": "Type I Error is a False Positive (rejecting a true null hypothesis); Type II Error is a False Negative (failing to reject a false null hypothesis).",
      "explanation": "Type I error alpha is false alarm (rejecting true null); Type II error beta is missed detection (accepting false null). Statistical power is 1 - beta."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "How does A/B testing with statistical power analysis determine the required sample size per variant before launching an experiment?",
      "options": [
        "Calculates sample size based on baseline conversion rate, Minimum Detectable Effect (MDE), significance level (alpha = 0.05), and statistical power (1 - beta = 0.80).",
        "Runs tests until the p-value dips below 0.05 (peeking).",
        "Assigns 100 users to each variant by default.",
        "Stops the test as soon as one variant leads."
      ],
      "correctAnswer": "Calculates sample size based on baseline conversion rate, Minimum Detectable Effect (MDE), significance level (alpha = 0.05), and statistical power (1 - beta = 0.80).",
      "explanation": "Power analysis guarantees the test has adequate sensitivity (80% power) to reliably detect a true business impact of size MDE while controlling false positives."
    },
    {
      "type": "mcq",
      "difficulty": "hard",
      "question": "What is the Curse of Dimensionality when training algorithms on high-dimensional feature spaces (e.g. 10,000 features)?",
      "options": [
        "As dimensions increase, data space volume expands exponentially, data points become extremely sparse, and distances between all points converge to equal values, degrading distance-based models.",
        "Datasets cannot fit in memory.",
        "The computer CPU overheats.",
        "Dimensionality cannot exceed 100 in math."
      ],
      "correctAnswer": "As dimensions increase, data space volume expands exponentially, data points become extremely sparse, and distances between all points converge to equal values, degrading distance-based models.",
      "explanation": "In high dimensions, Euclidean distance metrics lose discriminative power because all points become nearly equidistant, necessitating dimensionality reduction (PCA, t-SNE)."
    }
  ],
  "Pandas": [
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What are the two primary data structures provided by the Pandas library?",
      "options": [
        "Series (1-dimensional) and DataFrame (2-dimensional tabular)",
        "List and Dictionary",
        "Array and Matrix",
        "Table and View"
      ],
      "correctAnswer": "Series (1-dimensional) and DataFrame (2-dimensional tabular)",
      "explanation": "Pandas revolves around Series (labeled 1D homogeneous array) and DataFrame (labeled 2D tabular data structure with heterogeneous column types)."
    },
    {
      "type": "code_reading",
      "difficulty": "easy",
      "question": "In Pandas, what is the distinction between `.loc[]` and `.iloc[]` indexing?",
      "options": [
        "`.loc[]` selects data by label/index name; `.iloc[]` selects data by integer position (0-based index).",
        "`.loc[]` is for columns only; `.iloc[]` is for rows only.",
        "`.iloc[]` can only select single cells.",
        "Both are identical in behavior."
      ],
      "correctAnswer": "`.loc[]` selects data by label/index name; `.iloc[]` selects data by integer position (0-based index).",
      "explanation": "loc is label-based (endpoints inclusive); iloc is integer position-based (endpoints exclusive, following standard Python slicing conventions)."
    },
    {
      "type": "output_prediction",
      "difficulty": "easy",
      "question": "What method in Pandas displays a concise summary of a DataFrame including column data types and non-null counts?",
      "options": [
        "df.info()",
        "df.describe()",
        "df.head()",
        "df.summary()"
      ],
      "correctAnswer": "df.info()",
      "explanation": "df.info() prints index range, column names, non-null value counts, data types, and estimated memory usage."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "Which Pandas method drops rows containing missing (NaN) values?",
      "options": [
        "df.dropna()",
        "df.drop_null()",
        "df.remove_nan()",
        "df.clean()"
      ],
      "correctAnswer": "df.dropna()",
      "explanation": "dropna() removes rows (axis=0) or columns (axis=1) that contain null or NaN values."
    },
    {
      "type": "code_reading",
      "difficulty": "easy",
      "question": "How do you filter a DataFrame `df` to include only rows where column `age` is greater than 30 in Pandas?",
      "options": [
        "df[df[\"age\"] > 30]",
        "df.filter(\"age > 30\")",
        "df.where(age > 30)",
        "df.select(\"age > 30\")"
      ],
      "correctAnswer": "df[df[\"age\"] > 30]",
      "explanation": "Boolean indexing evaluates the condition `df[\"age\"] > 30` to produce a boolean Series used to filter DataFrame rows."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "What is the return type of applying an aggregation function to a single column after a `groupby` operation: `df.groupby(\"department\")[\"salary\"].mean()`?",
      "options": [
        "A Pandas Series indexed by unique department values with mean salary values.",
        "A Python dictionary.",
        "A 2D NumPy array.",
        "A single float representing total company average."
      ],
      "correctAnswer": "A Pandas Series indexed by unique department values with mean salary values.",
      "explanation": "Applying an aggregation to a single selected column after groupby returns a Series indexed by the grouped categorical keys."
    },
    {
      "type": "debugging",
      "difficulty": "medium",
      "question": "What causes the \"SettingWithCopyWarning\" in Pandas when modifying a DataFrame slice?",
      "options": [
        "Chained indexing (e.g. `df[df[\"col\"] > 0][\"target\"] = val`) makes it ambiguous whether the slice is a view or a copy of the original DataFrame; use `.loc[]` instead.",
        "Setting a string in an integer column.",
        "Copying a DataFrame to disk.",
        "Using df.copy() too many times."
      ],
      "correctAnswer": "Chained indexing (e.g. `df[df[\"col\"] > 0][\"target\"] = val`) makes it ambiguous whether the slice is a view or a copy of the original DataFrame; use `.loc[]` instead.",
      "explanation": "Chained indexing creates a temporary slice. Modifying it may alter a copy that is immediately discarded; `df.loc[mask, \"target\"] = val` assigns in place safely."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "In Pandas, what is the distinction between `pd.merge()` and `pd.concat()`?",
      "options": [
        "`pd.merge()` joins DataFrames based on common key columns (relational database joins); `pd.concat()` stacks DataFrames vertically along rows or horizontally along columns.",
        "`pd.concat()` can only merge two rows.",
        "`pd.merge()` requires all columns to be identical.",
        "Both methods perform SQL UNION."
      ],
      "correctAnswer": "`pd.merge()` joins DataFrames based on common key columns (relational database joins); `pd.concat()` stacks DataFrames vertically along rows or horizontally along columns.",
      "explanation": "merge performs relational database joins (inner, outer, left, right) on keys. concat concatenates Series or DataFrames along an axis (0=rows, 1=columns)."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "How does converting an `object` string column with few unique values into `category` dtype optimize memory usage in Pandas?",
      "options": [
        "It replaces repeated Python string object pointers with small integer categorical codes pointing to a single unique string lookup dictionary.",
        "It compresses strings using gzip.",
        "It moves strings to an SQLite database.",
        "It limits string length to 8 characters."
      ],
      "correctAnswer": "It replaces repeated Python string object pointers with small integer categorical codes pointing to a single unique string lookup dictionary.",
      "explanation": "Categorical types store integer category codes (e.g. int8) referencing a dictionary of unique categories, often reducing memory footprint by 80-90%."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "What does `df.pivot_table(values=\"sales\", index=\"region\", columns=\"quarter\", aggfunc=\"sum\")` construct in Pandas?",
      "options": [
        "A reshaped spreadsheet-style pivot table with regions as rows, quarters as columns, and the sum of sales as cell values.",
        "A single column of sales numbers.",
        "A 3D tensor.",
        "A graph visualization of sales."
      ],
      "correctAnswer": "A reshaped spreadsheet-style pivot table with regions as rows, quarters as columns, and the sum of sales as cell values.",
      "explanation": "pivot_table multidimensionally groups data, aggregating values into an intersecting grid of specified row and column index dimensions."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "Why does using `df.apply(axis=1)` on a large DataFrame with millions of rows cause poor performance, and how should it be optimized?",
      "options": [
        "`apply(axis=1)` iterates row-by-row in Python without C-level acceleration; it should be replaced with vectorized NumPy operations or Series expressions.",
        "apply(axis=1) converts all data into temporary CSV files on disk.",
        "apply(axis=1) triggers garbage collection on every cell.",
        "apply(axis=1) is deprecated in Pandas 2.0."
      ],
      "correctAnswer": "`apply(axis=1)` iterates row-by-row in Python without C-level acceleration; it should be replaced with vectorized NumPy operations or Series expressions.",
      "explanation": "Row-wise apply creates a Series object per row, incurring heavy Python interpreter overhead. Vectorized operations run in compiled C/Fortran."
    },
    {
      "type": "debugging",
      "difficulty": "hard",
      "question": "How do Arrow-backed data types in Pandas 2.0 (`dtype=\"string[pyarrow]\"` or PyArrow engine) revolutionize memory efficiency and performance?",
      "options": [
        "PyArrow provides contiguous, zero-copy columnar in-memory data representations with native missing value support (null bitmasks), eliminating Python GIL and object boxing overhead.",
        "Arrow encrypts DataFrames with military-grade encryption.",
        "Arrow compiles Python code to C++ at runtime.",
        "Arrow stores all data in GPU VRAM."
      ],
      "correctAnswer": "PyArrow provides contiguous, zero-copy columnar in-memory data representations with native missing value support (null bitmasks), eliminating Python GIL and object boxing overhead.",
      "explanation": "Apache Arrow integration provides standardized columnar memory layouts with true native nulls, enabling zero-copy sharing and multi-threaded SIMD execution."
    },
    {
      "type": "code_reading",
      "difficulty": "hard",
      "question": "What does `df.melt(id_vars=[\"date\"], value_vars=[\"metric_a\", \"metric_b\"], var_name=\"metric\", value_name=\"val\")` do in Pandas?",
      "options": [
        "Unpivots the DataFrame from wide format to long format, gathering metric_a and metric_b column names into a \"metric\" column and values into a \"val\" column.",
        "Deletes all rows where metric is null.",
        "Calculates the average of metric_a and metric_b.",
        "Converts the DataFrame into a JSON string."
      ],
      "correctAnswer": "Unpivots the DataFrame from wide format to long format, gathering metric_a and metric_b column names into a \"metric\" column and values into a \"val\" column.",
      "explanation": "melt() transforms wide data into tidy long-format data, ideal for visualization libraries (Seaborn, Plotly) that require one observation per row."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "When performing time-series analysis in Pandas, what does `df.resample(\"ME\").mean()` perform on a DatetimeIndex?",
      "options": [
        "Groups time-series data into monthly intervals (Month End frequency) and computes the mean of numeric columns for each month.",
        "Samples random rows from the DataFrame once a month.",
        "Removes all weekend rows.",
        "Interpolates missing dates using linear regression."
      ],
      "correctAnswer": "Groups time-series data into monthly intervals (Month End frequency) and computes the mean of numeric columns for each month.",
      "explanation": "resample is frequency-based groupby for time series, downsampling or upsampling temporal records to uniform intervals (hourly, daily, monthly)."
    },
    {
      "type": "mcq",
      "difficulty": "hard",
      "question": "What is the role of `pd.eval()` and `DataFrame.query()` in accelerating complex filtering on large Pandas DataFrames?",
      "options": [
        "Uses the NumExpr backend to evaluate expressions at C-speed without allocating intermediate temporary memory buffers in Python.",
        "Evaluates JavaScript code inside Python.",
        "Executes raw SQL on database servers.",
        "Encrypts filtering criteria."
      ],
      "correctAnswer": "Uses the NumExpr backend to evaluate expressions at C-speed without allocating intermediate temporary memory buffers in Python.",
      "explanation": "pd.eval parses string expressions using NumExpr, computing boolean masks in chunks on the CPU cache without allocating full temporary array copies."
    }
  ],
  "NumPy": [
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "Why are NumPy ndarrays dramatically faster than standard Python lists for numerical computations?",
      "options": [
        "NumPy arrays store elements contiguously in homogeneous C-type memory buffers, avoiding Python object pointer indirection and enabling SIMD vectorization.",
        "NumPy compiles Python code directly into assembly at import time.",
        "Standard Python lists are stored on disk instead of RAM.",
        "NumPy uses GPU processing by default for all array additions."
      ],
      "correctAnswer": "NumPy arrays store elements contiguously in homogeneous C-type memory buffers, avoiding Python object pointer indirection and enabling SIMD vectorization.",
      "explanation": "Contiguous memory layout allows CPU caches and SIMD vector registers to process numbers in parallel without pointer unpacking."
    },
    {
      "type": "code_reading",
      "difficulty": "easy",
      "question": "What is the output shape of `np.zeros((3, 4, 5))` in NumPy?",
      "options": [
        "(3, 4, 5)",
        "(60,)",
        "(3, 20)",
        "(12, 5)"
      ],
      "correctAnswer": "(3, 4, 5)",
      "explanation": "np.zeros((d0, d1, d2)) allocates a 3-dimensional array with dimensions 3 x 4 x 5 initialized with zeros."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "What does the `.ndim` attribute of a NumPy array represent?",
      "options": [
        "The number of array dimensions (axes).",
        "The total number of elements in the array.",
        "The size of each element in bytes.",
        "The memory address of the array."
      ],
      "correctAnswer": "The number of array dimensions (axes).",
      "explanation": "ndim returns the integer number of axes/dimensions (e.g. 1 for vectors, 2 for matrices)."
    },
    {
      "type": "output_prediction",
      "difficulty": "easy",
      "question": "What is the result of `np.array([1, 2, 3]) * 2` in NumPy?",
      "options": [
        "array([2, 4, 6])",
        "array([1, 2, 3, 1, 2, 3])",
        "6",
        "TypeError"
      ],
      "correctAnswer": "array([2, 4, 6])",
      "explanation": "NumPy performs element-wise operations by default; multiplying an array by a scalar multiplies each element by that scalar."
    },
    {
      "type": "mcq",
      "difficulty": "easy",
      "question": "Which NumPy function generates evenly spaced numbers over a specified interval (e.g. `np.linspace(0, 10, 5)`)?",
      "options": [
        "np.linspace()",
        "np.arange()",
        "np.interval()",
        "np.steps()"
      ],
      "correctAnswer": "np.linspace()",
      "explanation": "np.linspace(start, stop, num) returns num evenly spaced samples calculated over the closed interval [start, stop]."
    },
    {
      "type": "output_prediction",
      "difficulty": "medium",
      "question": "What is the resulting shape of broadcasting an array of shape (4, 1) with an array of shape (1, 5) in NumPy?",
      "options": [
        "(4, 5)",
        "(5, 4)",
        "(4, 1, 5)",
        "ValueError: shapes are incompatible"
      ],
      "correctAnswer": "(4, 5)",
      "explanation": "NumPy compares dimensions from right to left. Dimension 1 stretches to match the other: (4, 1) and (1, 5) broadcast to (4, 5)."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "In NumPy, what is the difference between matrix multiplication (`A @ B` or `np.dot(A, B)`) and element-wise multiplication (`A * B`)?",
      "options": [
        "`A @ B` computes the dot product of rows and columns (matrix multiplication); `A * B` multiplies corresponding elements at matching indices.",
        "`A * B` is only for 1D vectors.",
        "`A @ B` adds the matrices together.",
        "Both operators compute the identical mathematical result."
      ],
      "correctAnswer": "`A @ B` computes the dot product of rows and columns (matrix multiplication); `A * B` multiplies corresponding elements at matching indices.",
      "explanation": "The `@` operator (PEP 465) executes linear algebraic matrix multiplication; `*` evaluates Hadamard (element-wise) multiplication."
    },
    {
      "type": "scenario",
      "difficulty": "medium",
      "question": "What is the difference between a view and a copy of a NumPy array when taking a slice (e.g., `b = a[1:5]`)?",
      "options": [
        "Slicing returns a view sharing the original memory buffer (mutating b also mutates a); an explicit `.copy()` allocates new memory.",
        "Slicing always creates a full deep copy in RAM.",
        "Views cannot be modified.",
        "Copies can only be made from 1-dimensional arrays."
      ],
      "correctAnswer": "Slicing returns a view sharing the original memory buffer (mutating b also mutates a); an explicit `.copy()` allocates new memory.",
      "explanation": "NumPy slicing creates memory views without copying data for efficiency. Modifying the view mutates the underlying original array."
    },
    {
      "type": "debugging",
      "difficulty": "medium",
      "question": "What is the difference between `np.reshape()` and `np.resize()` in NumPy?",
      "options": [
        "`reshape()` changes dimensions without changing element count (returns view where possible); `resize()` changes the total size of the array, repeating or truncating elements.",
        "`reshape()` deletes negative numbers.",
        "`resize()` can only shrink arrays.",
        "Both functions behave identically."
      ],
      "correctAnswer": "`reshape()` changes dimensions without changing element count (returns view where possible); `resize()` changes the total size of the array, repeating or truncating elements.",
      "explanation": "reshape requires the total number of elements (prod of dimensions) to match; resize alters total length, repeating elements or zero-padding as needed."
    },
    {
      "type": "code_reading",
      "difficulty": "medium",
      "question": "What does `np.where(condition, x, y)` do in NumPy?",
      "options": [
        "Vectorized ternary operator: returns elements chosen from x or y depending on the boolean condition.",
        "Locates the index of the highest number.",
        "Deletes rows matching condition.",
        "Filters out NaN values."
      ],
      "correctAnswer": "Vectorized ternary operator: returns elements chosen from x or y depending on the boolean condition.",
      "explanation": "np.where(cond, x, y) yields an array where elements equal x[i] if cond[i] is true, and y[i] otherwise, computed at vectorized C speed."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "How do NumPy array strides (`arr.strides`) dictate memory traversal across multidimensional axes?",
      "options": [
        "A tuple of bytes to step in each dimension when traversing memory; allows operations like transpose, slicing, and broadcasting to execute as O(1) stride metadata adjustments without copying data.",
        "Strides measure CPU clock frequency.",
        "Strides compress negative numbers.",
        "Strides store array names in RAM."
      ],
      "correctAnswer": "A tuple of bytes to step in each dimension when traversing memory; allows operations like transpose, slicing, and broadcasting to execute as O(1) stride metadata adjustments without copying data.",
      "explanation": "Strides tell the pointer how many bytes to jump in flat memory to move to the next item along an axis. Transposing simply swaps stride values in O(1) time."
    },
    {
      "type": "debugging",
      "difficulty": "hard",
      "question": "What is the memory order distinction between C-contiguous (`order=\"C\"`) and Fortran-contiguous (`order=\"F\"`) arrays in NumPy?",
      "options": [
        "C-order is row-major (last index changes fastest, rows stored consecutively in RAM); Fortran-order is column-major (first index changes fastest, columns stored consecutively).",
        "C-order is only for integers; Fortran-order for floats.",
        "Fortran-order arrays cannot be sliced.",
        "C-order is compressed with gzip."
      ],
      "correctAnswer": "C-order is row-major (last index changes fastest, rows stored consecutively in RAM); Fortran-order is column-major (first index changes fastest, columns stored consecutively).",
      "explanation": "Iterating along memory in the direction of contiguity maximizes CPU cache hits; accessing Fortran arrays in row order or C arrays in column order causes cache misses."
    },
    {
      "type": "code_reading",
      "difficulty": "hard",
      "question": "In NumPy linear algebra, what does `np.linalg.svd(A)` compute?",
      "options": [
        "Singular Value Decomposition: factors matrix A into U * Sigma * V^T, where U and V are unitary matrices and Sigma contains singular values.",
        "Computes the inverse of matrix A.",
        "Solves linear equations using Gaussian elimination.",
        "Generates a random orthogonal matrix."
      ],
      "correctAnswer": "Singular Value Decomposition: factors matrix A into U * Sigma * V^T, where U and V are unitary matrices and Sigma contains singular values.",
      "explanation": "SVD factors any real m x n matrix into two rotation matrices (U, V^T) and a scaling diagonal matrix of singular values, foundational for PCA and pseudo-inverses."
    },
    {
      "type": "scenario",
      "difficulty": "hard",
      "question": "What does `np.einsum(\"ij,jk->ik\", A, B)` perform in NumPy?",
      "options": [
        "Einstein summation convention: computes matrix multiplication of 2D arrays A and B by summing over the shared index j.",
        "Computes the outer product.",
        "Computes the determinant of A.",
        "Calculates eigenvalues."
      ],
      "correctAnswer": "Einstein summation convention: computes matrix multiplication of 2D arrays A and B by summing over the shared index j.",
      "explanation": "np.einsum evaluates tensor operations using index notation, combining contraction, transposition, and dot products in compiled C loops without intermediate arrays."
    },
    {
      "type": "mcq",
      "difficulty": "hard",
      "question": "What does `np.memmap` enable when working with massive multi-terabyte arrays in NumPy?",
      "options": [
        "Memory-maps an on-disk binary file into virtual address space, reading and writing array slices on demand via OS demand paging without loading the entire array into RAM.",
        "Compresses arrays on the GPU.",
        "Encrypts arrays on disk.",
        "Translates NumPy code into C++."
      ],
      "correctAnswer": "Memory-maps an on-disk binary file into virtual address space, reading and writing array slices on demand via OS demand paging without loading the entire array into RAM.",
      "explanation": "np.memmap uses the OS mmap system call, allowing multi-gigabyte or terabyte array manipulation with small RAM footprints via OS virtual memory page caching."
    }
  ]
};

/**
 * Curated Coding Challenges for each Category & Skill.
 * starterCode contains ONLY the starter stub/skeleton.
 * referenceSolution contains the working reference solution.
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
      referenceSolution: 'def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []',
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
      referenceSolution: 'def is_valid_parentheses(s):\n    stack = []\n    mapping = {")": "(", "}": "{", "]": "["}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else "#"\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack',
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
      problemStatement: 'Write a function `reverseString(str)` that reverses a string and returns the reversed string.',
      inputDescription: 'str: string to reverse',
      outputDescription: 'String reversed',
      examples: [
        { input: 'str = "hello"', output: '"olleh"', explanation: 'Reversed characters' }
      ],
      constraints: ['0 <= str.length <= 10^4'],
      starterCode: 'function reverseString(str) {\n  // Write your solution here\n  \n}',
      referenceSolution: 'function reverseString(str) {\n  return str.split("").reverse().join("");\n}',
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
      starterCode: 'function groupAnagrams(strs) {\n  // Write your solution here\n  \n}',
      referenceSolution: 'function groupAnagrams(strs) {\n  const map = {};\n  for (const s of strs) {\n    const key = s.split("").sort().join("");\n    if (!map[key]) map[key] = [];\n    map[key].push(s);\n  }\n  return Object.values(map);\n}',
      testCases: [
        { input: JSON.stringify({ strs: ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'] }), expectedOutput: '[["eat","tea","ate"],["tan","nat"],["bat"]]' },
        { input: JSON.stringify({ strs: [''] }), expectedOutput: '[[""]]' },
        { input: JSON.stringify({ strs: ['a'] }), expectedOutput: '[["a"]]' }
      ]
    }
  ],

  Java: [
    {
      difficulty: 'easy',
      problemStatement: 'Implement a method `reverseString(str)` that returns the reversed string in Java.',
      inputDescription: 'str: string to reverse',
      outputDescription: 'String reversed',
      examples: [
        { input: 'str = "hello"', output: '"olleh"', explanation: 'Reversed string in Java' }
      ],
      constraints: ['0 <= str.length <= 10^4'],
      starterCode: 'function reverseString(str) {\n  // Write your solution here\n  \n}',
      referenceSolution: 'function reverseString(str) {\n  return str.split("").reverse().join("");\n}',
      testCases: [
        { input: JSON.stringify({ str: 'hello' }), expectedOutput: '"olleh"' },
        { input: JSON.stringify({ str: 'world' }), expectedOutput: '"dlrow"' }
      ]
    },
    {
      difficulty: 'medium',
      problemStatement: 'Implement a method `maxSubArray(nums)` that finds the contiguous subarray with the largest sum and returns its sum in Java.',
      inputDescription: 'nums: array of integers',
      outputDescription: 'Integer maximum sum',
      examples: [
        { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'Subarray [4,-1,2,1] has the largest sum 6' }
      ],
      constraints: ['1 <= nums.length <= 10^5'],
      starterCode: 'function maxSubArray(nums) {\n  // Write your solution here\n  \n}',
      referenceSolution: 'function maxSubArray(nums) {\n  let maxS = nums[0], curr = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    curr = Math.max(nums[i], curr + nums[i]);\n    maxS = Math.max(maxS, curr);\n  }\n  return maxS;\n}',
      testCases: [
        { input: JSON.stringify({ nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] }), expectedOutput: '6' },
        { input: JSON.stringify({ nums: [1] }), expectedOutput: '1' }
      ]
    }
  ],

  C: [
    {
      difficulty: 'easy',
      problemStatement: 'Write a function `reverseString(str)` that reverses a string and returns the reversed string in C.',
      inputDescription: 'str: string to reverse',
      outputDescription: 'String reversed',
      examples: [
        { input: 'str = "hello"', output: '"olleh"', explanation: 'Reversed character sequence' }
      ],
      constraints: ['0 <= length <= 10^4'],
      starterCode: 'function reverseString(str) {\n  // Write your solution here\n  \n}',
      referenceSolution: 'function reverseString(str) {\n  return str.split("").reverse().join("");\n}',
      testCases: [
        { input: JSON.stringify({ str: 'hello' }), expectedOutput: '"olleh"' },
        { input: JSON.stringify({ str: 'Nexus' }), expectedOutput: '"suxeN"' }
      ]
    },
    {
      difficulty: 'medium',
      problemStatement: 'Write a function `twoSum(nums, target)` that returns the indices of the two numbers in `nums` that add up to `target` in C.',
      inputDescription: 'nums: integer array, target: integer',
      outputDescription: 'Array of two indices [i, j]',
      examples: [
        { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]', explanation: '2 + 7 = 9' }
      ],
      constraints: ['2 <= nums.length <= 10^4'],
      starterCode: 'function twoSum(nums, target) {\n  // Write your solution here\n  \n}',
      referenceSolution: 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}',
      testCases: [
        { input: JSON.stringify({ nums: [2, 7, 11, 15], target: 9 }), expectedOutput: JSON.stringify([0, 1]) },
        { input: JSON.stringify({ nums: [3, 2, 4], target: 6 }), expectedOutput: JSON.stringify([1, 2]) }
      ]
    }
  ],

  'C++': [
    {
      difficulty: 'easy',
      problemStatement: 'Write a function `reverseString(str)` that reverses a string in C++.',
      inputDescription: 'str: string to reverse',
      outputDescription: 'String reversed',
      examples: [
        { input: 'str = "hello"', output: '"olleh"', explanation: 'Reversed std::string' }
      ],
      constraints: ['0 <= str.length() <= 10^4'],
      starterCode: 'function reverseString(str) {\n  // Write your solution here\n  \n}',
      referenceSolution: 'function reverseString(str) {\n  return str.split("").reverse().join("");\n}',
      testCases: [
        { input: JSON.stringify({ str: 'hello' }), expectedOutput: '"olleh"' },
        { input: JSON.stringify({ str: 'algorithm' }), expectedOutput: '"mhtirogla"' }
      ]
    },
    {
      difficulty: 'medium',
      problemStatement: 'Write a function `maxSubArray(nums)` that returns the maximum subarray sum in C++.',
      inputDescription: 'nums: vector of integers',
      outputDescription: 'Integer maximum subarray sum',
      examples: [
        { input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]', output: '6', explanation: 'Kadane algorithm maximum subarray sum' }
      ],
      constraints: ['1 <= nums.size() <= 10^5'],
      starterCode: 'function maxSubArray(nums) {\n  // Write your solution here\n  \n}',
      referenceSolution: 'function maxSubArray(nums) {\n  let maxS = nums[0], curr = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    curr = Math.max(nums[i], curr + nums[i]);\n    maxS = Math.max(maxS, curr);\n  }\n  return maxS;\n}',
      testCases: [
        { input: JSON.stringify({ nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] }), expectedOutput: '6' },
        { input: JSON.stringify({ nums: [1] }), expectedOutput: '1' }
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
      starterCode: 'function filterEvenNumbers(nums: number[]): number[] {\n  // Write your solution here\n  \n}',
      referenceSolution: 'function filterEvenNumbers(nums: number[]): number[] {\n  return nums.filter(n => n % 2 === 0);\n}',
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
      starterCode: 'function maxSubArray(nums) {\n  // Write your solution here\n  \n}',
      referenceSolution: 'function maxSubArray(nums) {\n  let maxSum = nums[0];\n  let currentSum = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    currentSum = Math.max(nums[i], currentSum + nums[i]);\n    maxSum = Math.max(maxSum, currentSum);\n  }\n  return maxSum;\n}',
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
      starterCode: 'function lengthOfLongestSubstring(s) {\n  // Write your solution here\n  \n}',
      referenceSolution: 'function lengthOfLongestSubstring(s) {\n  let maxLen = 0;\n  let start = 0;\n  const seen = new Map();\n  for (let end = 0; end < s.length; end++) {\n    const char = s[end];\n    if (seen.has(char) && seen.get(char) >= start) {\n      start = seen.get(char) + 1;\n    }\n    seen.set(char, end);\n    maxLen = Math.max(maxLen, end - start + 1);\n  }\n  return maxLen;\n}',
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
      starterCode: '-- Write your SQL query here\nSELECT ',
      referenceSolution: 'SELECT MAX(salary) AS SecondHighestSalary\nFROM Employee\nWHERE salary < (SELECT MAX(salary) FROM Employee);',
      testCases: [
        { input: 'SELECT SecondHighestSalary', expectedOutput: 'MATCH_QUERY' }
      ]
    }
  ]
};

/**
 * Procedural generator for coding challenges when bank items are exhausted.
 * Contains 25 distinct algorithmic templates to support multiple consecutive sessions.
 * Guarantees that starterCode contains ONLY the starter stub/skeleton,
 * and referenceSolution contains the working implementation.
 */
export function generateProceduralCodingChallenge(skill, difficulty = 'medium', index = 1) {
  const problems = [
    {
      title: `Array Element Frequency Counter in ${skill}`,
      statement: `Implement an algorithmic solution in ${skill} that takes an array of values and returns an object or map recording the frequency count of each unique element.`,
      input: 'items: array of numbers or strings',
      output: 'Record/Map of element frequencies',
      starter: `// Starter skeleton in ${skill}\nfunction countFrequencies(items) {\n  // Write your solution here\n  \n}`,
      referenceSolution: `function countFrequencies(items) {\n  const freq = {};\n  for (const item of items) {\n    freq[item] = (freq[item] || 0) + 1;\n  }\n  return freq;\n}`,
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
      starter: `// Starter skeleton in ${skill}\nfunction maxSubarraySumK(nums, k) {\n  // Write your solution here\n  \n}`,
      referenceSolution: `function maxSubarraySumK(nums, k) {\n  if (nums.length < k) return 0;\n  let windowSum = 0;\n  for (let i = 0; i < k; i++) windowSum += nums[i];\n  let maxSum = windowSum;\n  for (let i = k; i < nums.length; i++) {\n    windowSum += nums[i] - nums[i - k];\n    maxSum = Math.max(maxSum, windowSum);\n  }\n  return maxSum;\n}`,
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
      starter: `// Starter skeleton in ${skill}\nfunction binarySearch(nums, target) {\n  // Write your solution here\n  \n}`,
      referenceSolution: `function binarySearch(nums, target) {\n  let left = 0, right = nums.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}`,
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
      starter: `// Starter skeleton in ${skill}\nfunction twoSum(nums, target) {\n  // Write your solution here\n  \n}`,
      referenceSolution: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
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
      starter: `// Starter skeleton in ${skill}\nfunction isPalindrome(s) {\n  // Write your solution here\n  \n}`,
      referenceSolution: `function isPalindrome(s) {\n  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n  return clean === clean.split('').reverse().join('');\n}`,
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
      starter: `// Starter skeleton in ${skill}\nfunction removeDuplicates(nums) {\n  // Write your solution here\n  \n}`,
      referenceSolution: `function removeDuplicates(nums) {\n  if (nums.length === 0) return 0;\n  let i = 0;\n  for (let j = 1; j < nums.length; j++) {\n    if (nums[j] !== nums[i]) {\n      i++;\n      nums[i] = nums[j];\n    }\n  }\n  return i + 1;\n}`,
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
      starter: `// Starter skeleton in ${skill}\nfunction rangeSum(nums, left, right) {\n  // Write your solution here\n  \n}`,
      referenceSolution: `function rangeSum(nums, left, right) {\n  const prefix = [0];\n  for (let i = 0; i < nums.length; i++) prefix.push(prefix[i] + nums[i]);\n  return prefix[right + 1] - prefix[left];\n}`,
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
      starter: `// Starter skeleton in ${skill}\nfunction moveZeroes(nums) {\n  // Write your solution here\n  \n}`,
      referenceSolution: `function moveZeroes(nums) {\n  let nonZero = 0;\n  for (let i = 0; i < nums.length; i++) {\n    if (nums[i] !== 0) {\n      const temp = nums[nonZero];\n      nums[nonZero] = nums[i];\n      nums[i] = temp;\n      nonZero++;\n    }\n  }\n  return nums;\n}`,
      testCases: [
        { input: JSON.stringify({ nums: [0, 1, 0, 3, 12] }), expectedOutput: JSON.stringify([1, 3, 12, 0, 0]) },
        { input: JSON.stringify({ nums: [0] }), expectedOutput: JSON.stringify([0]) }
      ]
    },
    {
      title: `First Unique Character Finder in ${skill}`,
      statement: `Find the first non-repeating character in a string and return its index. If it does not exist, return -1 in ${skill}.`,
      input: 's: string',
      output: 'Integer 0-based index or -1',
      starter: `// Starter skeleton in ${skill}\nfunction firstUniqChar(s) {\n  // Write your solution here\n  \n}`,
      referenceSolution: `function firstUniqChar(s) {\n  const count = {};\n  for (const c of s) count[c] = (count[c] || 0) + 1;\n  for (let i = 0; i < s.length; i++) {\n    if (count[s[i]] === 1) return i;\n  }\n  return -1;\n}`,
      testCases: [
        { input: JSON.stringify({ s: 'leetcode' }), expectedOutput: '0' },
        { input: JSON.stringify({ s: 'loveleetcode' }), expectedOutput: '2' },
        { input: JSON.stringify({ s: 'aabb' }), expectedOutput: '-1' }
      ]
    },
    {
      title: `Product of Array Except Self in ${skill}`,
      statement: `Return an array answer such that answer[i] is equal to the product of all elements of nums except nums[i] in O(n) without using division in ${skill}.`,
      input: 'nums: array of integers',
      output: 'Array of integer products',
      starter: `// Starter skeleton in ${skill}\nfunction productExceptSelf(nums) {\n  // Write your solution here\n  \n}`,
      referenceSolution: `function productExceptSelf(nums) {\n  const res = new Array(nums.length).fill(1);\n  let left = 1;\n  for (let i = 0; i < nums.length; i++) {\n    res[i] = left;\n    left *= nums[i];\n  }\n  let right = 1;\n  for (let i = nums.length - 1; i >= 0; i--) {\n    res[i] *= right;\n    right *= nums[i];\n  }\n  return res;\n}`,
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
      starter: `// Starter skeleton in ${skill}\nfunction maxSubArray(nums) {\n  // Write your solution here\n  \n}`,
      referenceSolution: `function maxSubArray(nums) {\n  let maxS = nums[0], curr = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    curr = Math.max(nums[i], curr + nums[i]);\n    maxS = Math.max(maxS, curr);\n  }\n  return maxS;\n}`,
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
      starter: `// Starter skeleton in ${skill}\nfunction climbStairs(n) {\n  // Write your solution here\n  \n}`,
      referenceSolution: `function climbStairs(n) {\n  if (n <= 2) return n;\n  let a = 1, b = 2;\n  for (let i = 3; i <= n; i++) {\n    const c = a + b;\n    a = b;\n    b = c;\n  }\n  return b;\n}`,
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
      starter: `// Starter skeleton in ${skill}\nfunction findMin(nums) {\n  // Write your solution here\n  \n}`,
      referenceSolution: `function findMin(nums) {\n  let l = 0, r = nums.length - 1;\n  while (l < r) {\n    const m = Math.floor((l + r) / 2);\n    if (nums[m] > nums[r]) l = m + 1;\n    else r = m;\n  }\n  return nums[l];\n}`,
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
      starter: `// Starter skeleton in ${skill}\nfunction maxArea(height) {\n  // Write your solution here\n  \n}`,
      referenceSolution: `function maxArea(height) {\n  let l = 0, r = height.length - 1, maxA = 0;\n  while (l < r) {\n    const area = Math.min(height[l], height[r]) * (r - l);\n    maxA = Math.max(maxA, area);\n    if (height[l] < height[r]) l++;\n    else r--;\n  }\n  return maxA;\n}`,
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
      starter: `// Starter skeleton in ${skill}\nfunction intersection(nums1, nums2) {\n  // Write your solution here\n  \n}`,
      referenceSolution: `function intersection(nums1, nums2) {\n  const set1 = new Set(nums1);\n  const result = new Set();\n  for (const n of nums2) {\n    if (set1.has(n)) result.add(n);\n  }\n  return Array.from(result);\n}`,
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
    referenceSolution: p.referenceSolution,
    testCases: p.testCases,
    difficulty,
    skill,
    explanation: `Optimal solution for ${p.title} utilizing core algorithmic paradigms in ${skill}.`
  };
}
