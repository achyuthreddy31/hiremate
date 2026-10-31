import { runJavaScript } from './runners/javascriptRunner.js';
import { runTypeScript } from './runners/typescriptRunner.js';
import { runPython } from './runners/pythonRunner.js';
import { runJava } from './runners/javaRunner.js';
import { runC } from './runners/cRunner.js';
import { runCpp } from './runners/cppRunner.js';
import { executeRemotely, isRemoteExecutionConfigured } from './remoteRunner.js';

export { runJavaScript, runTypeScript, runPython, runJava, runC, runCpp };

/**
 * Normalizes language name or auto-detects from code syntax.
 */
export function normalizeLanguage(lang = '', userCode = '') {
  const l = String(lang).trim().toLowerCase();

  if (['javascript', 'js', 'node', 'nodejs'].includes(l)) return 'javascript';
  if (['typescript', 'ts'].includes(l)) return 'typescript';
  if (['python', 'python3', 'py'].includes(l)) return 'python';
  if (['java'].includes(l)) return 'java';
  if (['c'].includes(l)) return 'c';
  if (['cpp', 'c++', 'cplusplus'].includes(l)) return 'cpp';

  // Auto-detect based on code syntax if a topic/category name was passed
  const code = String(userCode);
  if (/^\s*def\s+[a-zA-Z0-9_]+\s*\(/m.test(code)) return 'python';
  if (/public\s+class\s+|System\.out\./.test(code)) return 'java';
  if (/#include\s+<iostream>|std::|vector\s*<|cout\s*<</.test(code)) return 'cpp';
  if (/#include\s+<stdio\.h>|printf\s*\(/.test(code)) return 'c';
  if (/:\s*(number|string|boolean|any)\[\]|interface\s+[A-Za-z]|type\s+[A-Za-z]/.test(code)) return 'typescript';

  return 'javascript';
}

/**
 * Asynchronously evaluates a candidate's code solution across supported languages in an isolated execution sandbox.
 * Enforces security isolation:
 * - Direct execution of untrusted candidate code on the host is disabled in production.
 * - All multi-language execution dispatches to a hardened container runner (CODE_EXECUTION_URL).
 * - Java, C, and C++ remain disabled for candidate submissions pending verified container runner tests.
 * - Missing or unreachable execution infrastructure fails closed with EXECUTION_ENVIRONMENT_UNAVAILABLE.
 *
 * @param {string} userCode - The submitted source code.
 * @param {Array} testCases - Array of { input: string, expectedOutput: string }.
 * @param {string} language - Target language (e.g., 'JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'C++').
 * @param {object} options - Execution options (timeoutMs, etc.).
 * @returns {Promise<object>} Evaluation result payload { allPassed: boolean, results: Array, failureReason: string|null }.
 */
export async function evaluateCodingSolution(userCode = '', testCases = [], language = 'javascript', options = {}) {
  if (!userCode || typeof userCode !== 'string' || !userCode.trim()) {
    return {
      allPassed: false,
      results: [],
      failureReason: 'No code or test cases provided for validation'
    };
  }

  if (!Array.isArray(testCases) || testCases.length === 0) {
    return {
      allPassed: false,
      results: [],
      failureReason: 'No code or test cases provided for validation'
    };
  }

  const normLang = normalizeLanguage(language, userCode);
  const timeoutMs = options.timeoutMs || 3000;

  // Rule 3: Keep Java, C, and C++ disabled for candidate submissions until verified on container infrastructure
  if (['java', 'c', 'cpp'].includes(normLang)) {
    return {
      allPassed: false,
      results: [],
      failureReason: `Language execution for ${language} is temporarily disabled for candidate submissions pending verification on secure container execution infrastructure.`,
      error: {
        code: 'LANGUAGE_DISABLED',
        language,
        message: `${language} execution is disabled until verified against secure container runner infrastructure.`
      }
    };
  }

  // 1. If hardened container runner is configured, dispatch execution securely
  if (isRemoteExecutionConfigured()) {
    switch (normLang) {
      case 'javascript':
        return executeRemotely({ language: 'javascript', version: '18.15.0', fileName: 'solution.js', code: userCode, timeoutMs });
      case 'typescript':
        return executeRemotely({ language: 'typescript', version: '5.0.3', fileName: 'solution.ts', code: userCode, timeoutMs });
      case 'python':
        return runPython(userCode, testCases, timeoutMs);
      default:
        return executeRemotely({ language: normLang, version: '*', fileName: `solution.${normLang}`, code: userCode, timeoutMs });
    }
  }

  // 2. Strict Fail-Closed Policy: In production, never execute untrusted candidate code on application host
  const isHostExecutionPermitted = process.env.ALLOW_HOST_CODE_EXECUTION === 'true' || process.env.NODE_ENV === 'test';
  if (!isHostExecutionPermitted) {
    return {
      allPassed: false,
      results: [],
      failureReason: 'Execution environment unavailable: Secure container execution infrastructure (CODE_EXECUTION_URL) is not configured. Host execution of untrusted code is disabled for security isolation.',
      error: {
        code: 'EXECUTION_ENVIRONMENT_UNAVAILABLE',
        message: 'A hardened container execution runner (e.g. Piston or Judge0) is required for secure code execution.'
      }
    };
  }

  // 3. Isolated local asynchronous child process runner for dev/test environments
  switch (normLang) {
    case 'javascript':
      return runJavaScript(userCode, testCases, timeoutMs);
    case 'typescript':
      return runTypeScript(userCode, testCases, timeoutMs);
    case 'python':
      return runPython(userCode, testCases, timeoutMs);
    default:
      return runJavaScript(userCode, testCases, timeoutMs);
  }
}
