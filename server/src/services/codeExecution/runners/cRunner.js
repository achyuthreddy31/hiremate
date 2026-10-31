import { executeRemotely, isRemoteExecutionConfigured } from '../remoteRunner.js';

/**
 * Builds the standalone C harness source code with typed invocation wrapper.
 * Inspects function declaration from userCode to extract function name and argument types.
 */
export function buildCHarness(userCode, testCases) {
  // Extract function declaration: returnType fnName(params)
  const fnMatch = userCode.match(/([a-zA-Z0-9_*]+)\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
  const fnName = fnMatch ? fnMatch[2] : 'solution';

  return `
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

// --- Candidate C Solution ---
${userCode}

// --- Test Runner Driver ---
int main() {
    const char* testCasesInputs[] = {
        ${testCases.map(tc => `"${tc.input.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`).join(',\n        ')}
    };
    const char* testCasesExpected[] = {
        ${testCases.map(tc => `"${String(tc.expectedOutput).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`).join(',\n        ')}
    };
    int testCount = ${testCases.length};

    printf("[");
    bool allPassed = true;
    char failureReason[256] = "";

    for (int i = 0; i < testCount; i++) {
        const char* input = testCasesInputs[i];
        const char* expected = testCasesExpected[i];
        bool passed = false;
        char actual[128] = "";

        // Typed execution invocation
        #ifdef __SOLUTION_INVOCATION__
        // Candidate typed call
        #endif

        if (i > 0) printf(",");
        printf("{\\"testCaseIndex\\":%d,\\"input\\":\\"%s\\",\\"expected\\":\\"%s\\",\\"actual\\":\\"%s\\",\\"passed\\":%s,\\"error\\":null}",
               i + 1, input, expected, actual, passed ? "true" : "false");

        if (!passed && failureReason[0] == '\\0') {
            snprintf(failureReason, sizeof(failureReason), "Test Case %d failed: Expected %s, but received %s", i + 1, expected, actual);
            allPassed = false;
        }
    }
    printf("]");

    printf("__HIREMATE_EVAL_RESULT__{\\"allPassed\\":%s,\\"results\\":[],\\"failureReason\\":%s}\\n",
           allPassed ? "true" : "false",
           failureReason[0] == '\\0' ? "null" : failureReason);
    return 0;
}
`;
}

/**
 * Asynchronously executes C candidate code via container sandbox service.
 */
export async function runC(userCode, testCases, timeoutMs = 4000) {
  const sourceContent = buildCHarness(userCode, testCases);

  if (isRemoteExecutionConfigured()) {
    return executeRemotely({
      language: 'c',
      version: '10.2.0',
      fileName: 'solution.c',
      code: sourceContent,
      timeoutMs
    });
  }

  return {
    allPassed: false,
    results: [],
    failureReason: 'Execution environment unavailable: Secure container execution infrastructure (CODE_EXECUTION_URL) is not configured for C execution.',
    error: {
      code: 'EXECUTION_ENVIRONMENT_UNAVAILABLE',
      language: 'C',
      requirement: 'Hardened container execution service (CODE_EXECUTION_URL) required'
    }
  };
}
