import { spawnSync } from 'child_process';
import { runInIsolatedProcess } from '../processSandbox.js';
import { executeRemotely, isRemoteExecutionConfigured } from '../remoteRunner.js';

/**
 * Builds the standalone Python harness script.
 */
export function buildPythonHarness(userCode, testCases) {
  const fnMatches = [...userCode.matchAll(/def\s+([a-zA-Z0-9_]+)\s*\(/g)];
  const candidateNames = fnMatches.map(m => m[1]).filter(Boolean);

  return `
import json
import sys

# --- Candidate Python Solution ---
${userCode}

# --- Test Runner Driver ---
test_cases = ${JSON.stringify(testCases)}
candidate_names = ${JSON.stringify(candidateNames)}

target_fn = None
for name in candidate_names:
    if name in locals() and callable(locals()[name]):
        target_fn = locals()[name]
        break

if not target_fn:
    for k, v in list(locals().items()):
        if callable(v) and not k.startswith('_') and k != 'target_fn':
            target_fn = v
            break

results = []
all_passed = True

for idx, tc in enumerate(test_cases, 1):
    passed = False
    actual_output = ""
    error_msg = None
    try:
        try:
            parsed_input = json.loads(tc["input"])
        except Exception:
            parsed_input = tc["input"]
        
        if target_fn:
            if isinstance(parsed_input, dict):
                res = target_fn(**parsed_input)
            elif isinstance(parsed_input, list):
                res = target_fn(parsed_input)
            else:
                res = target_fn(parsed_input)
        else:
            raise Exception("No callable function found in submission")
        
        actual_output = json.dumps(res)
        expected_norm = str(tc["expectedOutput"]).strip()
        
        # Match normalized JSON or Python literal equivalents (e.g. True/true)
        if (
            actual_output == expected_norm or
            str(res).strip().lower() == expected_norm.lower() or
            str(res).strip() == expected_norm
        ):
            passed = True
        else:
            all_passed = False
    except Exception as e:
        all_passed = False
        error_msg = str(e)
        actual_output = f"Error: {e}"
    
    results.append({
        "testCaseIndex": idx,
        "input": tc["input"],
        "expected": tc["expectedOutput"],
        "actual": actual_output,
        "passed": passed,
        "error": error_msg
    })

failed_case = next((r for r in results if not r["passed"]), None)
failure_reason = (
    f"Test Case {failed_case['testCaseIndex']} failed: Expected {failed_case['expected']}, but received {failed_case['actual']}"
    if failed_case else None
)

payload = {
    "allPassed": all_passed,
    "results": results,
    "failureReason": failure_reason
}

print("__HIREMATE_EVAL_RESULT__" + json.dumps(payload))
`;
}

/**
 * Detects whether a working Python runtime is available locally.
 */
function getWorkingPythonCommand() {
  for (const cmd of ['python3', 'python']) {
    try {
      const res = spawnSync(cmd, ['--version'], { encoding: 'utf-8', timeout: 1000 });
      if (res.status === 0 && (res.stdout.toLowerCase().includes('python') || res.stderr.toLowerCase().includes('python'))) {
        return cmd;
      }
    } catch (e) {
      // Continue to next command
    }
  }
  return null;
}

/**
 * Asynchronously executes Python candidate code via container sandbox service or local isolated runner.
 */
export async function runPython(userCode, testCases, timeoutMs = 3000) {
  const scriptContent = buildPythonHarness(userCode, testCases);

  // 1. If remote container runner is configured, execute via sandbox service
  if (isRemoteExecutionConfigured()) {
    return executeRemotely({
      language: 'python',
      version: '3.10.0',
      fileName: 'solution.py',
      code: scriptContent,
      timeoutMs
    });
  }

  // 2. Do not silently fall back to host execution in production
  const allowHost = process.env.ALLOW_HOST_CODE_EXECUTION === 'true' || process.env.NODE_ENV === 'test';
  if (allowHost) {
    const pyCmd = getWorkingPythonCommand();
    if (pyCmd) {
      return runInIsolatedProcess({
        command: pyCmd,
        args: [],
        scriptContent,
        fileExt: 'py',
        timeoutMs
      });
    }
  }

  // 3. Transparently report requirement instead of simulating execution
  return {
    allPassed: false,
    results: [],
    failureReason: 'Execution environment unavailable: Secure container execution infrastructure (CODE_EXECUTION_URL) is not configured. Host execution of untrusted code is disabled for security isolation.',
    error: {
      code: 'EXECUTION_ENVIRONMENT_UNAVAILABLE',
      language: 'Python',
      requirement: 'Hardened container execution service (CODE_EXECUTION_URL) required'
    }
  };
}
