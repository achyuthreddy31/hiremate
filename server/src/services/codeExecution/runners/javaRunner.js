import { executeRemotely, isRemoteExecutionConfigured } from '../remoteRunner.js';

/**
 * Builds the standalone Java harness source code using dynamic reflection and typed argument mapping.
 * Inspects declared methods in Solution, invokes the target method, and serializes return values.
 */
export function buildJavaHarness(userCode, testCases) {
  const hasClass = /class\s+([A-Za-z0-9_]+)/.test(userCode);
  const solutionBlock = hasClass ? userCode : `class Solution {\n${userCode}\n}`;

  return `
import java.lang.reflect.*;
import java.util.*;

${solutionBlock}

public class Main {
    public static void main(String[] args) {
        String[] testCasesInputs = new String[] {
            ${testCases.map(tc => `"${tc.input.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`).join(',\n            ')}
        };
        String[] testCasesExpected = new String[] {
            ${testCases.map(tc => `"${String(tc.expectedOutput).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`).join(',\n            ')}
        };

        StringBuilder resultsJson = new StringBuilder("[");
        boolean allPassed = true;
        String failureReason = null;

        Method targetMethod = null;
        Object solutionInstance = null;

        try {
            Class<?> solClass = Solution.class;
            Method[] methods = solClass.getDeclaredMethods();
            for (Method m : methods) {
                if (Modifier.isPublic(m.getModifiers()) || methods.length == 1) {
                    targetMethod = m;
                    targetMethod.setAccessible(true);
                    break;
                }
            }

            if (targetMethod == null) {
                throw new NoSuchMethodException("No accessible solution method found in class Solution");
            }

            if (!Modifier.isStatic(targetMethod.getModifiers())) {
                Constructor<?> ctor = solClass.getDeclaredConstructor();
                ctor.setAccessible(true);
                solutionInstance = ctor.newInstance();
            }
        } catch (Exception initErr) {
            System.out.println("__HIREMATE_EVAL_RESULT__{\\"allPassed\\":false,\\"results\\":[],\\"failureReason\\":\\"Initialization Error: " + initErr.getMessage() + "\\"}");
            return;
        }

        for (int i = 0; i < testCasesInputs.length; i++) {
            String input = testCasesInputs[i];
            String expected = testCasesExpected[i];
            boolean passed = false;
            String actual = "";
            String errorMsg = null;

            try {
                Object[] convertedArgs = parseArguments(input, targetMethod.getParameterTypes());
                Object rawResult = targetMethod.invoke(solutionInstance, convertedArgs);
                actual = serializeResult(rawResult);

                if (actual != null && (actual.trim().equals(expected.trim()) || actual.trim().equalsIgnoreCase(expected.trim()))) {
                    passed = true;
                } else {
                    allPassed = false;
                }
            } catch (InvocationTargetException ite) {
                allPassed = false;
                Throwable target = ite.getTargetException();
                errorMsg = target.getMessage() != null ? target.getMessage() : target.toString();
                actual = "Error: " + errorMsg;
            } catch (Exception e) {
                allPassed = false;
                errorMsg = e.getMessage() != null ? e.getMessage() : e.toString();
                actual = "Error: " + errorMsg;
            }

            if (i > 0) resultsJson.append(",");
            resultsJson.append("{\\"testCaseIndex\\":").append(i + 1)
                       .append(",\\"input\\":\\"").append(input.replace("\"", "\\\\\"")).append("\\"")
                       .append(",\\"expected\\":\\"").append(expected.replace("\"", "\\\\\"")).append("\\"")
                       .append(",\\"actual\\":\\"").append((actual != null ? actual : "").replace("\"", "\\\\\"")).append("\\"")
                       .append(",\\"passed\\":").append(passed)
                       .append(",\\"error\\":").append(errorMsg == null ? "null" : ("\\"" + errorMsg.replace("\"", "\\\\\"") + "\\""))
                       .append("}");

            if (!passed && failureReason == null) {
                failureReason = "Test Case " + (i + 1) + " failed: Expected " + expected + ", but received " + actual;
            }
        }
        resultsJson.append("]");

        StringBuilder payload = new StringBuilder();
        payload.append("{\\"allPassed\\":").append(allPassed)
               .append(",\\"results\\":").append(resultsJson)
               .append(",\\"failureReason\\":").append(failureReason == null ? "null" : ("\\"" + failureReason.replace("\"", "\\\\\"") + "\\""))
               .append("}");

        System.out.println("__HIREMATE_EVAL_RESULT__" + payload.toString());
    }

    private static Object[] parseArguments(String input, Class<?>[] paramTypes) {
        Object[] args = new Object[paramTypes.length];
        for (int i = 0; i < paramTypes.length; i++) {
            Class<?> p = paramTypes[i];
            if (p == String.class) {
                args[i] = input.replaceAll("^\\\"|\\\"$", "");
            } else if (p == int.class || p == Integer.class) {
                args[i] = Integer.parseInt(input.replaceAll("[^0-9-]", ""));
            } else if (p == boolean.class || p == Boolean.class) {
                args[i] = Boolean.parseBoolean(input.trim());
            } else {
                args[i] = input;
            }
        }
        return args;
    }

    private static String serializeResult(Object res) {
        if (res == null) return "null";
        if (res instanceof int[]) return Arrays.toString((int[]) res);
        if (res instanceof String[]) return Arrays.toString((String[]) res);
        if (res instanceof Object[]) return Arrays.deepToString((Object[]) res);
        if (res instanceof String) return "\\"" + res + "\\"";
        return String.valueOf(res);
    }
}
`;
}

/**
 * Asynchronously executes Java candidate code via container sandbox service.
 */
export async function runJava(userCode, testCases, timeoutMs = 4000) {
  const sourceContent = buildJavaHarness(userCode, testCases);

  if (isRemoteExecutionConfigured()) {
    return executeRemotely({
      language: 'java',
      version: '15.0.2',
      fileName: 'Main.java',
      code: sourceContent,
      timeoutMs
    });
  }

  return {
    allPassed: false,
    results: [],
    failureReason: 'Execution environment unavailable: Secure container execution infrastructure (CODE_EXECUTION_URL) is not configured for Java execution.',
    error: {
      code: 'EXECUTION_ENVIRONMENT_UNAVAILABLE',
      language: 'Java',
      requirement: 'Hardened container execution service (CODE_EXECUTION_URL) required'
    }
  };
}
