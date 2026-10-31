import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Terminates the child process and any sub-processes it may have spawned.
 * Uses taskkill /T /F on Windows and process group/child SIGKILL on Unix.
 */
function terminateProcessTree(child) {
  if (!child || !child.pid) return;

  try {
    if (process.platform === 'win32') {
      // /T = terminate child tree, /F = forceful
      const killer = spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
        windowsHide: true,
        stdio: 'ignore'
      });
      killer.on('error', () => {
        try { child.kill('SIGKILL'); } catch (e) {}
      });
    } else {
      try {
        process.kill(-child.pid, 'SIGKILL');
      } catch (e) {
        child.kill('SIGKILL');
      }
    }
  } catch (err) {
    try {
      child.kill('SIGKILL');
    } catch (e) {}
  }
}

/**
 * Asynchronously executes a script in an isolated child process outside the main Express process.
 * Replaces synchronous spawnSync to guarantee the Express event loop is never blocked.
 * Enforces execution timeouts, process-tree termination, memory limits, and output buffer caps.
 *
 * @param {object} params
 * @param {string} params.command - Executable path (e.g. process.execPath).
 * @param {Array<string>} params.args - Command line flags/arguments.
 * @param {string} params.scriptContent - The script source code to execute.
 * @param {string} [params.fileExt='js'] - File extension.
 * @param {number} [params.timeoutMs=3000] - Hard execution timeout in milliseconds.
 * @param {number} [params.maxOutputBytes=524288] - Maximum captured output bytes (512 KB default).
 * @returns {Promise<object>} Evaluation result payload.
 */
export function runInIsolatedProcess({
  command,
  args = [],
  scriptContent,
  fileExt = 'js',
  timeoutMs = 3000,
  maxOutputBytes = 512 * 1024
}) {
  return new Promise((resolve) => {
    let settled = false;
    const tempDir = os.tmpdir();
    const uniqueId = `hiremate_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const tempFilePath = path.join(tempDir, `${uniqueId}.${fileExt}`);

    function safeCleanup() {
      try {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      } catch (e) {
        // Ignore cleanup deletion errors
      }
    }

    function settle(result) {
      if (settled) return;
      settled = true;
      if (timeoutTimer) clearTimeout(timeoutTimer);
      safeCleanup();
      resolve(result);
    }

    try {
      fs.writeFileSync(tempFilePath, scriptContent, 'utf-8');
    } catch (writeErr) {
      return settle({
        allPassed: false,
        results: [],
        failureReason: `Sandbox script creation failed: ${writeErr.message}`
      });
    }

    // Sanitize environment: strip all server secrets and database credentials
    const safeEnv = {
      PATH: process.env.PATH || '',
      SystemRoot: process.env.SystemRoot || '',
      TEMP: tempDir,
      TMP: tempDir,
      NODE_ENV: 'sandbox'
    };

    const finalArgs = [...args, tempFilePath];
    let child;

    try {
      child = spawn(command, finalArgs, {
        env: safeEnv,
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });
    } catch (spawnErr) {
      return settle({
        allPassed: false,
        results: [],
        failureReason: `Failed to spawn sandbox child process: ${spawnErr.message}`
      });
    }

    let stdout = '';
    let stderr = '';
    let outputLimitExceeded = false;

    // Buffer stdout with hard ceiling to prevent memory exhaustion / log bombing
    child.stdout.on('data', (chunk) => {
      if (stdout.length < maxOutputBytes) {
        stdout += chunk.toString('utf-8');
      } else if (!outputLimitExceeded) {
        outputLimitExceeded = true;
        terminateProcessTree(child);
      }
    });

    // Buffer stderr with hard ceiling
    child.stderr.on('data', (chunk) => {
      if (stderr.length < maxOutputBytes) {
        stderr += chunk.toString('utf-8');
      }
    });

    child.on('error', (err) => {
      settle({
        allPassed: false,
        results: [],
        failureReason: `Sandbox process error: ${err.message}`
      });
    });

    // Hard timeout timer: terminates the process tree if runtime threshold is exceeded
    const timeoutTimer = setTimeout(() => {
      terminateProcessTree(child);
      settle({
        timedOut: true,
        allPassed: false,
        results: [],
        failureReason: `Execution timed out: Your solution exceeded the maximum allowed runtime limit (${timeoutMs}ms).`
      });
    }, timeoutMs);

    child.on('close', (code, signal) => {
      if (outputLimitExceeded) {
        return settle({
          allPassed: false,
          results: [],
          failureReason: `Execution terminated: Process output exceeded allowed limit (${Math.round(maxOutputBytes / 1024)} KB).`
        });
      }

      const marker = '__HIREMATE_EVAL_RESULT__';
      const markerIdx = stdout.indexOf(marker);

      if (markerIdx !== -1) {
        try {
          const jsonStr = stdout.substring(markerIdx + marker.length).trim();
          const parsed = JSON.parse(jsonStr);
          return settle(parsed);
        } catch (parseErr) {
          return settle({
            allPassed: false,
            results: [],
            failureReason: `Execution result parsing failed: ${parseErr.message}`
          });
        }
      }

      // Check for non-zero exit code or stderr messages
      if (code !== 0 || stderr) {
        const cleanedError = (stderr || stdout || `Process exited with code ${code}`).trim();
        return settle({
          allPassed: false,
          results: [],
          failureReason: `Runtime/Compilation Error: ${cleanedError}`
        });
      }

      return settle({
        allPassed: false,
        results: [],
        failureReason: 'No output was generated by the test runner.'
      });
    });
  });
}
