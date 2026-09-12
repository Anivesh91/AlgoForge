const { generateHarnessCode } = require('./harness.service');
const { executeInSandbox } = require('./docker.service');
const crypto = require('crypto');

/**
 * Parses individual test case JSON outputs printed by the C++ harness
 */
function parseCaseOutputs(stdout, tests, protocolToken) {
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

  const expectedIds = tests.map((test, index) => String(test.id || `case-${index + 1}`));
  const actualIds = parsedResults.map((result) => result.id);
  const validRecords = parsedResults.length === expectedIds.length
    && parsedResults.every((result) => result.protocol === protocolToken)
    && new Set(actualIds).size === actualIds.length
    && actualIds.every((id) => expectedIds.includes(id));
  if (!validRecords) {
    return { error: 'Invalid or incomplete test result protocol', results: [] };
  }

  // Merge with test definitions only after protocol validation succeeds.
  return { results: tests.map((test, index) => {
    const executed = parsedResults.find((r) => r.id === expectedIds[index]);
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
  }) };
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
      status: 'JUDGE_ERROR',
      passedTests: 0,
      totalTests: 0,
      runtimeMs: 0,
      testResults: [],
      compileOutput: '',
    };
  }

  // 1. Generate full C++ source with harness
  const protocolToken = crypto.randomBytes(24).toString('hex');
  const cppSource = generateHarnessCode(userCode, functionSpec, tests, supportCode, protocolToken);

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
  const parsedOutput = parseCaseOutputs(sandboxResult.stdout, tests, protocolToken);
  if (parsedOutput.error) {
    return {
      status: 'JUDGE_ERROR',
      passedTests: 0,
      totalTests: tests.length,
      runtimeMs: sandboxResult.runtimeMs,
      memoryKb: 0,
      compileOutput: '',
      testResults: [],
      stderr: parsedOutput.error,
    };
  }
  const testResults = parsedOutput.results;
  const passedCount = testResults.filter((r) => r.passed).length;
  const isAllPassed = passedCount === tests.length && tests.length > 0;

  return {
    status: isAllPassed ? 'ACCEPTED' : 'WRONG_ANSWER',
    passedTests: passedCount,
    totalTests: tests.length,
    runtimeMs: sandboxResult.runtimeMs,
    memoryKb: 0,
    compileOutput: '',
    testResults,
    stdout: sandboxResult.stdout,
    stderr: sandboxResult.stderr,
  };
}

module.exports = {
  judgeSolution,
};
