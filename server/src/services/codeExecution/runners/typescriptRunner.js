import { runInIsolatedProcess } from '../processSandbox.js';

/**
 * Builds the standalone TypeScript harness script.
 */
export function buildTypeScriptHarness(userCode, testCases) {
  const fnMatches = [...userCode.matchAll(/(?:function\s+([a-zA-Z0-9_$]+)|(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:function|\([^)]*\)\s*=>))/g)];
  const candidateNames = fnMatches.map(m => m[1] || m[2]).filter(Boolean);

  return `
// --- Candidate TypeScript Solution ---
${userCode}

// --- Test Runner Driver ---
(function() {
  const testCases: any[] = ${JSON.stringify(testCases)};
  const candidateNames: string[] = ${JSON.stringify(candidateNames)};
  
  let targetFn: any = null;
  for (const name of candidateNames) {
    try {
      const candidate = (eval as any)(name);
      if (typeof candidate === 'function') {
        targetFn = candidate;
        break;
      }
    } catch (e) {}
  }

  const results: any[] = [];
  let allPassed: boolean = true;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    let passed: boolean = false;
    let actualOutput: string = '';
    let errorMessage: string | null = null;

    try {
      let parsedInput: any;
      try {
        parsedInput = typeof tc.input === 'string' ? JSON.parse(tc.input) : tc.input;
      } catch (e) {
        parsedInput = tc.input;
      }

      let rawResult: any;
      if (typeof targetFn === 'function') {
        if (typeof parsedInput === 'object' && parsedInput !== null && !Array.isArray(parsedInput)) {
          rawResult = targetFn(...Object.values(parsedInput));
        } else {
          rawResult = targetFn(parsedInput);
        }
      } else {
        rawResult = (eval as any)(${JSON.stringify(userCode)});
      }

      actualOutput = JSON.stringify(rawResult);
      const expectedNormalized: string = String(tc.expectedOutput).trim();

      if (
        actualOutput === expectedNormalized ||
        String(rawResult).trim() === expectedNormalized
      ) {
        passed = true;
      } else {
        allPassed = false;
      }
    } catch (err: any) {
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
 * Asynchronously transpiles and executes TypeScript candidate code in an isolated child process.
 */
export async function runTypeScript(userCode, testCases, timeoutMs = 3000) {
  const scriptContent = buildTypeScriptHarness(userCode, testCases);
  return runInIsolatedProcess({
    command: process.execPath,
    args: ['--experimental-strip-types', '--max-old-space-size=64'],
    scriptContent,
    fileExt: 'ts',
    timeoutMs
  });
}
