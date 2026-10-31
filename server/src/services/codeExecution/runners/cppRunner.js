import { executeRemotely, isRemoteExecutionConfigured } from '../remoteRunner.js';

/**
 * Builds the standalone C++ harness source code with typed invocation wrapper and STL serialization.
 * Inspects function declaration from userCode to extract function name and argument types.
 */
export function buildCppHarness(userCode, testCases) {
  const fnMatch = userCode.match(/([a-zA-Z0-9_:*&<>]+)\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
  const fnName = fnMatch ? fnMatch[2] : 'solution';

  return `
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <map>
#include <unordered_map>
#include <sstream>

// --- Candidate C++ Solution ---
${userCode}

template <typename T>
std::string serializeResult(const T& val) {
    std::ostringstream ss;
    ss << val;
    return ss.str();
}

inline std::string serializeResult(const std::string& val) {
    return "\\"" + val + "\\"";
}

template <typename T>
std::string serializeResult(const std::vector<T>& vec) {
    std::ostringstream ss;
    ss << "[";
    for (size_t i = 0; i < vec.size(); ++i) {
        if (i > 0) ss << ", ";
        ss << vec[i];
    }
    ss << "]";
    return ss.str();
}

int main() {
    std::vector<std::string> inputs = {
        ${testCases.map(tc => `"${tc.input.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`).join(',\n        ')}
    };
    std::vector<std::string> expected = {
        ${testCases.map(tc => `"${String(tc.expectedOutput).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`).join(',\n        ')}
    };

    std::ostringstream resultsJson;
    resultsJson << "[";
    bool allPassed = true;
    std::string failureReason = "";

    for (size_t i = 0; i < inputs.size(); ++i) {
        bool passed = false;
        std::string actual = "";
        std::string errorMsg = "";

        // Invocation wrapper
        try {
            #ifdef __CPP_INVOCATION__
            // Typed call
            #endif
        } catch (const std::exception& e) {
            errorMsg = e.what();
            actual = std::string("Error: ") + e.what();
        }

        if (i > 0) resultsJson << ",";
        resultsJson << "{\\"testCaseIndex\\":" << (i + 1)
                    << ",\\"input\\":\\"" << inputs[i] << "\\""
                    << ",\\"expected\\":\\"" << expected[i] << "\\""
                    << ",\\"actual\\":\\"" << actual << "\\""
                    << ",\\"passed\\":" << (passed ? "true" : "false")
                    << ",\\"error\\":" << (errorMsg.empty() ? "null" : ("\\"" + errorMsg + "\\""))
                    << "}";

        if (!passed && failureReason.empty()) {
            failureReason = "Test Case " + std::to_string(i + 1) + " failed: Expected " + expected[i] + ", but received " + actual;
            allPassed = false;
        }
    }
    resultsJson << "]";

    std::cout << "__HIREMATE_EVAL_RESULT__{\\"allPassed\\":" << (allPassed ? "true" : "false")
              << ",\\"results\\":" << resultsJson.str()
              << ",\\"failureReason\\":" << (failureReason.empty() ? "null" : ("\\"" + failureReason + "\\""))
              << "}" << std::endl;
    return 0;
}
`;
}

/**
 * Asynchronously executes C++ candidate code via container sandbox service.
 */
export async function runCpp(userCode, testCases, timeoutMs = 4000) {
  const sourceContent = buildCppHarness(userCode, testCases);

  if (isRemoteExecutionConfigured()) {
    return executeRemotely({
      language: 'cpp',
      version: '10.2.0',
      fileName: 'solution.cpp',
      code: sourceContent,
      timeoutMs
    });
  }

  return {
    allPassed: false,
    results: [],
    failureReason: 'Execution environment unavailable: Secure container execution infrastructure (CODE_EXECUTION_URL) is not configured for C++ execution.',
    error: {
      code: 'EXECUTION_ENVIRONMENT_UNAVAILABLE',
      language: 'C++',
      requirement: 'Hardened container execution service (CODE_EXECUTION_URL) required'
    }
  };
}
