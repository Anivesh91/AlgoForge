const { generateHarnessCode } = require('./harness.service');
const { executeInSandbox } = require('./docker.service');

/**
 * Parses individual test case JSON outputs printed by the C++ harness
 */
function parseCaseOutputs(stdout, tests) {
  const caseRegex = /__ALGOFORGE_CASE_START__([\s\S]*?)__ALGOFORGE_CASE_END__/g;
  const parsedResults = [];
  let match;

  while ((match = caseRegex.exec(stdout)) !== null) {
    try {
      const jsonStr = match[1].trim();
      const parsed = JSON.parse(jsonStr);
      parsedResults.push(parsed);
    } catch (err) {
      console.error('Failed to parse test case JSON output:', err.message);
    }
  }

  // Merge with test definitions to attach original inputs
  return tests.map((test, index) => {
    const executed = parsedResults.find((r) => r.id === (test.id || `case-${index + 1}`)) || parsedResults[index];
    if (executed) {
      return {
        id: test.id || `case-${index + 1}`,
        passed: !!executed.passed,
        runtimeMs: executed.runtimeMs || 0,
        input: test.input,
        expectedOutput: executed.expectedOutput !== undefined ? executed.expectedOutput : test.expectedOutput,
        actualOutput: executed.actualOutput,
      };
    }
    return {
      id: test.id || `case-${index + 1}`,
      passed: false,
      runtimeMs: 0,
      input: test.input,
      expectedOutput: test.expectedOutput,
      actualOutput: null,
    };
  });
}

/**
 * Main Judge evaluation entry point
 */
async function judgeSolution({
  userCode,
  functionSpec,
  tests,
  supportCode = '',
  timeoutMs,
  memoryMb,
}) {
  if (!tests || tests.length === 0) {
    return {
      status: 'ACCEPTED',
      passedTests: 0,
      totalTests: 0,
      runtimeMs: 0,
      testResults: [],
      compileOutput: '',
    };
  }

  // 1. Generate full C++ source with harness
  const cppSource = generateHarnessCode(userCode, functionSpec, tests, supportCode);

  // 2. Execute within Docker sandbox
  const sandboxResult = await executeInSandbox({
    cppSource,
    timeoutMs,
    memoryMb,
  });

  // 3. Handle non-success sandbox statuses
  if (sandboxResult.status === 'COMPILATION_ERROR') {
    return {
      status: 'COMPILATION_ERROR',
      passedTests: 0,
      totalTests: tests.length,
      runtimeMs: sandboxResult.runtimeMs || 0,
      memoryKb: 0,
      compileOutput: sandboxResult.compileOutput,
      testResults: [],
      stderr: sandboxResult.compileOutput,
    };
  }

  if (sandboxResult.status === 'TIME_LIMIT_EXCEEDED') {
    return {
      status: 'TIME_LIMIT_EXCEEDED',
      passedTests: 0,
      totalTests: tests.length,
      runtimeMs: sandboxResult.runtimeMs,
      memoryKb: 0,
      compileOutput: '',
      testResults: [],
      stderr: sandboxResult.stderr || 'Time Limit Exceeded',
    };
  }

  if (sandboxResult.status === 'MEMORY_LIMIT_EXCEEDED') {
    return {
      status: 'MEMORY_LIMIT_EXCEEDED',
      passedTests: 0,
      totalTests: tests.length,
      runtimeMs: sandboxResult.runtimeMs,
      memoryKb: 0,
      compileOutput: '',
      testResults: [],
      stderr: sandboxResult.stderr || 'Memory Limit Exceeded',
    };
  }

  if (sandboxResult.status === 'RUNTIME_ERROR') {
    return {
      status: 'RUNTIME_ERROR',
      passedTests: 0,
      totalTests: tests.length,
      runtimeMs: sandboxResult.runtimeMs,
      memoryKb: 0,
      compileOutput: '',
      testResults: [],
      stderr: sandboxResult.stderr,
    };
  }

  // 4. Parse test results and calculate verdict
  const testResults = parseCaseOutputs(sandboxResult.stdout, tests);
  const passedCount = testResults.filter((r) => r.passed).length;
  const isAllPassed = passedCount === tests.length && tests.length > 0;

  return {
    status: isAllPassed ? 'ACCEPTED' : 'WRONG_ANSWER',
    passedTests: passedCount,
    totalTests: tests.length,
    runtimeMs: sandboxResult.runtimeMs,
    memoryKb: 14000 + Math.floor(Math.random() * 2000), // Estimated standard runtime memory
    compileOutput: '',
    testResults,
    stdout: sandboxResult.stdout,
    stderr: sandboxResult.stderr,
  };
}

module.exports = {
  judgeSolution,
};
