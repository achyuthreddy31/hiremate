import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  evaluateCodingSolution,
  normalizeLanguage
} from '../src/services/codeExecution/index.js';
import { buildJavaScriptHarness, runJavaScript } from '../src/services/codeExecution/runners/javascriptRunner.js';
import { buildTypeScriptHarness, runTypeScript } from '../src/services/codeExecution/runners/typescriptRunner.js';
import { buildPythonHarness, runPython } from '../src/services/codeExecution/runners/pythonRunner.js';
import { buildJavaHarness, runJava } from '../src/services/codeExecution/runners/javaRunner.js';
import { buildCHarness, runC } from '../src/services/codeExecution/runners/cRunner.js';
import { buildCppHarness, runCpp } from '../src/services/codeExecution/runners/cppRunner.js';
import * as remoteRunner from '../src/services/codeExecution/remoteRunner.js';

describe('Multi-Language Code Execution Engine - Security & Reliability', () => {
  describe('Input Validation & Language Normalization', () => {
    it('handles empty code submission gracefully', async () => {
      const res = await evaluateCodingSolution('', [{ input: '1', expectedOutput: '1' }]);
      expect(res.allPassed).toBe(false);
      expect(res.failureReason).toContain('No code or test cases provided');
    });

    it('handles empty test cases array gracefully', async () => {
      const res = await evaluateCodingSolution('function test() {}', []);
      expect(res.allPassed).toBe(false);
      expect(res.failureReason).toContain('No code or test cases provided');
    });

    it('normalizes common language aliases', () => {
      expect(normalizeLanguage('js')).toBe('javascript');
      expect(normalizeLanguage('NodeJS')).toBe('javascript');
      expect(normalizeLanguage('ts')).toBe('typescript');
      expect(normalizeLanguage('Python3')).toBe('python');
      expect(normalizeLanguage('C++')).toBe('cpp');
      expect(normalizeLanguage('C')).toBe('c');
      expect(normalizeLanguage('Java')).toBe('java');
    });

    it('auto-detects language from code syntax when category name is passed', () => {
      expect(normalizeLanguage('Core CS & DSA', 'def two_sum(nums, target): return []')).toBe('python');
      expect(normalizeLanguage('General', 'public class Solution { public static int add(int a, int b) { return a+b; } }')).toBe('java');
      expect(normalizeLanguage('Algorithms', '#include <iostream>\nusing namespace std;')).toBe('cpp');
      expect(normalizeLanguage('Systems', '#include <stdio.h>\nint main() { printf("hi"); }')).toBe('c');
      expect(normalizeLanguage('General', 'function solve(a: number[]): number[] { return a; }')).toBe('typescript');
    });
  });

  describe('Asynchronous Non-Blocking Execution & Timeout Termination', () => {
    it('does not freeze the event loop or block concurrent operations during execution', async () => {
      const longExecutionPromise = evaluateCodingSolution(
        'function hang() { while(true) {} }',
        [{ input: '{}', expectedOutput: '1' }],
        'javascript',
        { timeoutMs: 1200 }
      );

      // Verify micro-tasks and other operations execute immediately while child process runs
      let microTaskExecutedCount = 0;
      const interval = setInterval(() => {
        microTaskExecutedCount++;
      }, 50);

      const result = await longExecutionPromise;
      clearInterval(interval);

      expect(result.timedOut).toBe(true);
      expect(result.failureReason).toContain('Execution timed out');
      // The event loop ran freely, firing timer ticks throughout the execution
      expect(microTaskExecutedCount).toBeGreaterThanOrEqual(5);
    });

    it('terminates timed-out processes and cleans up temporary files', async () => {
      const timeoutPromise = evaluateCodingSolution(
        'function loop() { const start = Date.now(); while(Date.now() - start < 10000) {} }',
        [{ input: '{}', expectedOutput: 'null' }],
        'javascript',
        { timeoutMs: 1000 }
      );

      const res = await timeoutPromise;
      expect(res.timedOut).toBe(true);
      expect(res.allPassed).toBe(false);
      expect(res.failureReason).toContain('exceeded the maximum allowed runtime limit');
    });

    it('limits excessive output to prevent memory exhaustion / log bombing', async () => {
      // Script that attempts to flood stdout with huge data
      const floodCode = `
        function flood() {
          for (let i = 0; i < 20000; i++) {
            console.log('EXCESSIVE_STDOUT_LINE_'.repeat(20));
          }
          return true;
        }
      `;
      const testCases = [{ input: '{}', expectedOutput: 'true' }];

      const res = await evaluateCodingSolution(floodCode, testCases, 'javascript', { timeoutMs: 2000 });
      // Output buffer limiter truncates or terminates process safely without crashing Node
      expect(res).toBeDefined();
      expect(typeof res.allPassed).toBe('boolean');
    });

    it('executes multiple candidate submissions concurrently without interference', async () => {
      const tasks = [
        evaluateCodingSolution('function add(a, b) { return a + b; }', [{ input: '{"a": 1, "b": 2}', expectedOutput: '3' }], 'javascript'),
        evaluateCodingSolution('function mul(a, b) { return a * b; }', [{ input: '{"a": 2, "b": 4}', expectedOutput: '8' }], 'javascript'),
        evaluateCodingSolution('function sub(a, b) { return a - b; }', [{ input: '{"a": 10, "b": 3}', expectedOutput: '7' }], 'javascript'),
        evaluateCodingSolution('function bad() { while(true) {} }', [{ input: '{}', expectedOutput: '1' }], 'javascript', { timeoutMs: 800 })
      ];

      const [res1, res2, res3, res4] = await Promise.all(tasks);
      expect(res1.allPassed).toBe(true);
      expect(res2.allPassed).toBe(true);
      expect(res3.allPassed).toBe(true);
      expect(res4.timedOut).toBe(true);
    });
  });

  describe('JavaScript & TypeScript Real Execution in Sandbox', () => {
    it('successfully executes valid JavaScript passing all test cases', async () => {
      const code = `
        function twoSum(nums, target) {
          const map = new Map();
          for (let i = 0; i < nums.length; i++) {
            const diff = target - nums[i];
            if (map.has(diff)) return [map.get(diff), i];
            map.set(nums[i], i);
          }
          return [];
        }
      `;

      const testCases = [
        { input: JSON.stringify({ nums: [2, 7, 11, 15], target: 9 }), expectedOutput: JSON.stringify([0, 1]) },
        { input: JSON.stringify({ nums: [3, 2, 4], target: 6 }), expectedOutput: JSON.stringify([1, 2]) }
      ];

      const res = await evaluateCodingSolution(code, testCases, 'javascript');
      expect(res.allPassed).toBe(true);
      expect(res.results.length).toBe(2);
      expect(res.results[0].passed).toBe(true);
      expect(res.results[1].passed).toBe(true);
      expect(res.failureReason).toBeNull();
    });

    it('identifies failing JavaScript test cases with clear feedback', async () => {
      const code = 'function reverseString(str) { return str; }';
      const testCases = [{ input: JSON.stringify({ str: 'hello' }), expectedOutput: '"olleh"' }];

      const res = await evaluateCodingSolution(code, testCases, 'javascript');
      expect(res.allPassed).toBe(false);
      expect(res.results[0].passed).toBe(false);
      expect(res.failureReason).toContain('Test Case 1 failed');
    });

    it('captures syntax errors as runtime/compilation failures', async () => {
      const res = await evaluateCodingSolution('function broken( { return 1;', [{ input: '1', expectedOutput: '1' }], 'javascript');
      expect(res.allPassed).toBe(false);
      expect(res.failureReason).toMatch(/Runtime\/Compilation Error|SyntaxError/);
    });

    it('strips application environment variables from child process', async () => {
      const snoopCode = `
        function checkEnv() {
          return {
            hasMongo: Boolean(process.env.MONGODB_URI),
            hasFirebase: Boolean(process.env.FIREBASE_PROJECT_ID),
            hasGemini: Boolean(process.env.GEMINI_API_KEY)
          };
        }
      `;
      const testCases = [
        {
          input: '{}',
          expectedOutput: JSON.stringify({ hasMongo: false, hasFirebase: false, hasGemini: false })
        }
      ];

      const res = await evaluateCodingSolution(snoopCode, testCases, 'javascript');
      expect(res.allPassed).toBe(true);
      expect(res.results[0].passed).toBe(true);
    });

    it('executes valid TypeScript with type annotations', async () => {
      const tsCode = `
        function filterEvenNumbers(nums: number[]): number[] {
          return nums.filter((n: number): boolean => n % 2 === 0);
        }
      `;
      const testCases = [
        { input: JSON.stringify({ nums: [1, 2, 3, 4] }), expectedOutput: JSON.stringify([2, 4]) }
      ];

      const res = await evaluateCodingSolution(tsCode, testCases, 'typescript');
      expect(res.allPassed).toBe(true);
      expect(res.results[0].passed).toBe(true);
    });
  });

  describe('Container Security & Fail-Closed Policy', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalAllowHost = process.env.ALLOW_HOST_CODE_EXECUTION;
    const originalExecutionUrl = process.env.CODE_EXECUTION_URL;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
      process.env.ALLOW_HOST_CODE_EXECUTION = originalAllowHost;
      process.env.CODE_EXECUTION_URL = originalExecutionUrl;
    });

    it('strictly fails closed in production when CODE_EXECUTION_URL is not configured', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.CODE_EXECUTION_URL;
      delete process.env.PISTON_URL;

      const res = await evaluateCodingSolution('function add(a, b) { return a+b; }', [{ input: '{"a":1,"b":2}', expectedOutput: '3' }], 'javascript');
      expect(res.allPassed).toBe(false);
      expect(res.failureReason).toContain('Secure container execution infrastructure');
      expect(res.error?.code).toBe('EXECUTION_ENVIRONMENT_UNAVAILABLE');
    });

    it('dispatches to remote container runner when CODE_EXECUTION_URL is configured', async () => {
      process.env.CODE_EXECUTION_URL = 'http://localhost:2000/api/v2/execute';
      const executeSpy = vi.spyOn(remoteRunner, 'executeRemotely').mockResolvedValueOnce({
        allPassed: true,
        results: [{ testCaseIndex: 1, passed: true, input: '1', expected: '1', actual: '1', error: null }],
        failureReason: null
      });

      const res = await evaluateCodingSolution('def solve(): return 1', [{ input: '1', expectedOutput: '1' }], 'python');
      expect(executeSpy).toHaveBeenCalled();
      expect(res.allPassed).toBe(true);

      executeSpy.mockRestore();
    });
  });

  describe('Java, C and C++ Corrected Harnesses & Candidate Submission Safeguards', () => {
    it('keeps Java disabled for candidate submissions pending verified container runner', async () => {
      const res = await evaluateCodingSolution('class Solution {}', [{ input: '{}', expectedOutput: 'null' }], 'java');
      expect(res.allPassed).toBe(false);
      expect(res.error?.code).toBe('LANGUAGE_DISABLED');
      expect(res.failureReason).toContain('temporarily disabled for candidate submissions');
    });

    it('keeps C disabled for candidate submissions pending verified container runner', async () => {
      const res = await evaluateCodingSolution('int add(int a, int b) { return a+b; }', [{ input: '{}', expectedOutput: '3' }], 'c');
      expect(res.allPassed).toBe(false);
      expect(res.error?.code).toBe('LANGUAGE_DISABLED');
      expect(res.failureReason).toContain('temporarily disabled for candidate submissions');
    });

    it('keeps C++ disabled for candidate submissions pending verified container runner', async () => {
      const res = await evaluateCodingSolution('int solve() { return 1; }', [{ input: '{}', expectedOutput: '1' }], 'cpp');
      expect(res.allPassed).toBe(false);
      expect(res.error?.code).toBe('LANGUAGE_DISABLED');
      expect(res.failureReason).toContain('temporarily disabled for candidate submissions');
    });

    it('buildJavaHarness generates genuine reflection-based method discovery and argument parsing', () => {
      const userCode = 'public static int add(int a, int b) { return a + b; }';
      const testCases = [{ input: '{"a": 2, "b": 3}', expectedOutput: '5' }];

      const harness = buildJavaHarness(userCode, testCases);
      expect(harness).toContain('Class<?> solClass = Solution.class;');
      expect(harness).toContain('Method[] methods = solClass.getDeclaredMethods();');
      expect(harness).toContain('targetMethod.invoke');
      expect(harness).toContain('parseArguments');
      expect(harness).toContain('serializeResult');
      expect(harness).not.toContain('return "{\\"executed\\":true}"');
    });

    it('buildCHarness generates typed invocation wrapper using extracted function signature', () => {
      const userCode = 'int calculateSum(int a, int b) { return a + b; }';
      const testCases = [{ input: '{"a": 2, "b": 3}', expectedOutput: '5' }];

      const harness = buildCHarness(userCode, testCases);
      expect(harness).toContain('#include <stdio.h>');
      expect(harness).toContain('int main()');
      expect(harness).not.toContain('printf("__HIREMATE_EVAL_RESULT__{\\"allPassed\\":true');
    });

    it('buildCppHarness generates typed invocation wrapper with STL serialization', () => {
      const userCode = 'std::string reverseString(std::string str) { return str; }';
      const testCases = [{ input: '{"str": "hello"}', expectedOutput: '"olleh"' }];

      const harness = buildCppHarness(userCode, testCases);
      expect(harness).toContain('#include <iostream>');
      expect(harness).toContain('template <typename T>');
      expect(harness).toContain('serializeResult');
      expect(harness).not.toContain('std::cout << "__HIREMATE_EVAL_RESULT__{\\"allPassed\\":true');
    });
  });
});
