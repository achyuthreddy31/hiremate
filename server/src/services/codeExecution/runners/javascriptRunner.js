import { runInIsolatedProcess } from '../processSandbox.js';

/**
 * Builds the standalone JavaScript harness script.
 */
export function buildJavaScriptHarness(userCode, testCases) {
  const fnMatches = [...userCode.matchAll(/(?:function\s+([a-zA-Z0-9_$]+)|(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:function|\([^)]*\)\s*=>))/g)];
  const candidateNames = fnMatches.map(m => m[1] || m[2]).filter(Boolean);

  return `
// --- Candidate Solution ---
${userCode}

// --- Test Runner Driver ---
(function() {
  const testCases = ${JSON.stringify(testCases)};
  const candidateNames = ${JSON.stringify(candidateNames)};
  
  let targetFn = null;
  for (const name of candidateNames) {
    try {
      const candidate = eval(name);
      if (typeof candidate === 'function') {
        targetFn = candidate;
        break;
      }
    } catch (e) {}
  }

  // Fallback: search scope for any function if named resolution did not locate it
  if (!targetFn) {
    try {
      const allKeys = Object.getOwnPropertyNames(this);
      for (const k of allKeys) {
        if (typeof this[k] === 'function' && k !== 'eval' && k !== 'Function') {
          targetFn = this[k];
          break;
        }
      }
    } catch(e) {}
  }

  const results = [];
  let allPassed = true;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    let passed = false;
    let actualOutput = '';
    let errorMessage = null;

    try {
      let parsedInput;
      try {
        parsedInput = typeof tc.input === 'string' ? JSON.parse(tc.input) : tc.input;
      } catch (e) {
        parsedInput = tc.input;
      }

      let rawResult;
      if (typeof targetFn === 'function') {
        if (typeof parsedInput === 'object' && parsedInput !== null && !Array.isArray(parsedInput)) {
          rawResult = targetFn(...Object.values(parsedInput));
        } else {
          rawResult = targetFn(parsedInput);
        }
      } else {
        // Fallback for single expressions
        rawResult = eval(${JSON.stringify(userCode)});
      }

      actualOutput = JSON.stringify(rawResult);
      const expectedNormalized = String(tc.expectedOutput).trim();

      if (
        actualOutput === expectedNormalized ||
        String(rawResult).trim() === expectedNormalized ||
        (expectedNormalized === 'MATCH_QUERY' && /select\\s+/i.test(${JSON.stringify(userCode)}))
      ) {
        passed = true;
      } else {
        allPassed = false;
      }
    } catch (err) {
      allPassed = false;
      errorMessage = err.message;
      actualOutput = 'Error: ' + err.message;
    }

    results.push({
      testCaseIndex: i + 1,
      input: tc.input,
      expected: tc.expectedOutput,
      actual: actualOutput,
      passed,
      error: errorMessage
    });
  }

  const failedCase = results.find(r => !r.passed);
  const failureReason = failedCase
    ? \`Test Case \${failedCase.testCaseIndex} failed: Expected \${failedCase.expected}, but received \${failedCase.actual}\`
    : null;

  const payload = {
    allPassed,
    results,
    failureReason
  };

  console.log('__HIREMATE_EVAL_RESULT__' + JSON.stringify(payload));
})();
`;
}

/**
 * Asynchronously executes JavaScript candidate code in an isolated child process with resource restrictions.
 */
export async function runJavaScript(userCode, testCases, timeoutMs = 3000) {
  const scriptContent = buildJavaScriptHarness(userCode, testCases);
  return runInIsolatedProcess({
    command: process.execPath,
    args: ['--max-old-space-size=64'],
    scriptContent,
    fileExt: 'js',
    timeoutMs
  });
}
