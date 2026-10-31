/**
 * Checks whether an external container-based execution service (e.g. Piston or Judge0) is configured.
 */
export function isRemoteExecutionConfigured() {
  const url = process.env.CODE_EXECUTION_URL || process.env.PISTON_URL;
  return Boolean(url && url.trim().length > 0);
}

/**
 * Executes code via an external hardened container runner (such as EngineerMan Piston or Judge0).
 * Runs completely asynchronously using native fetch and AbortController without blocking Express.
 *
 * Enforces container isolation:
 * - Read-only root filesystem
 * - Memory limit (128 MB default)
 * - CPU runtime timeout (run_timeout)
 * - Compilation timeout (compile_timeout)
 * - Process count restrictions
 *
 * @param {object} params
 * @param {string} params.language - Language name (e.g. 'javascript', 'python', 'java').
 * @param {string} [params.version='*'] - Language version.
 * @param {string} params.fileName - Main source filename.
 * @param {string} params.code - Standalone test harness source code.
 * @param {number} [params.timeoutMs=4000] - Hard execution timeout.
 * @returns {Promise<object>} Evaluation result payload.
 */
export async function executeRemotely({
  language,
  version = '*',
  fileName,
  code,
  timeoutMs = 4000
}) {
  const baseUrl = (process.env.CODE_EXECUTION_URL || process.env.PISTON_URL || '').trim();
  if (!baseUrl) {
    return {
      allPassed: false,
      results: [],
      failureReason: 'Execution environment unavailable: CODE_EXECUTION_URL is not configured.',
      error: {
        code: 'EXECUTION_ENVIRONMENT_UNAVAILABLE',
        requirement: 'Hardened container execution service (CODE_EXECUTION_URL) required'
      }
    };
  }

  const endpoint = baseUrl.endsWith('/execute')
    ? baseUrl
    : `${baseUrl.replace(/\/+$/, '')}/api/v2/execute`;

  const payload = {
    language,
    version,
    files: [
      {
        name: fileName,
        content: code
      }
    ],
    run_timeout: timeoutMs,
    compile_timeout: 5000,
    run_memory_limit: 128 * 1024 * 1024 // 128 MB container memory limit
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs + 3000);

  const headers = { 'Content-Type': 'application/json' };
  if (process.env.CODE_EXECUTION_API_KEY) {
    headers['Authorization'] = `Bearer ${process.env.CODE_EXECUTION_API_KEY.trim()}`;
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    if (!res.ok) {
      return {
        allPassed: false,
        results: [],
        failureReason: `Execution service error: HTTP ${res.status} ${res.statusText}`
      };
    }

    const pistonRes = await res.json();

    // Check compilation failure
    if (pistonRes.compile && pistonRes.compile.code !== 0) {
      return {
        allPassed: false,
        results: [],
        failureReason: `Compilation Error: ${(pistonRes.compile.stderr || pistonRes.compile.stdout || 'Compilation failed').trim()}`
      };
    }

    // Check execution timeout / signal
    if (pistonRes.run && (pistonRes.run.signal === 'SIGKILL' || pistonRes.run.signal === 'SIGXCPU')) {
      return {
        timedOut: true,
        allPassed: false,
        results: [],
        failureReason: `Execution timed out: Your solution exceeded the maximum allowed runtime limit (${timeoutMs}ms).`
      };
    }

    const runOutput = pistonRes.run?.stdout || '';
    const marker = '__HIREMATE_EVAL_RESULT__';
    const markerIdx = runOutput.indexOf(marker);

    if (markerIdx !== -1) {
      try {
        const jsonStr = runOutput.substring(markerIdx + marker.length).trim();
        return JSON.parse(jsonStr);
      } catch (parseErr) {
        return {
          allPassed: false,
          results: [],
          failureReason: `Failed to parse container runner result: ${parseErr.message}`
        };
      }
    }

    const runErr = (pistonRes.run?.stderr || runOutput).trim();
    return {
      allPassed: false,
      results: [],
      failureReason: `Runtime Error: ${runErr || 'No output produced by container runner'}`
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      return {
        timedOut: true,
        allPassed: false,
        results: [],
        failureReason: `Execution timed out: Container runner request exceeded ${timeoutMs}ms limit.`
      };
    }
    return {
      allPassed: false,
      results: [],
      failureReason: `Failed to communicate with container execution runner: ${err.message}`
    };
  } finally {
    clearTimeout(timer);
  }
}
