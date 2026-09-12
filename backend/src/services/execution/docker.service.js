const fs = require('fs').promises;
const path = require('path');
const { exec, spawn } = require('child_process');

const DEFAULT_TIMEOUT_MS = parseInt(process.env.RUN_TIMEOUT_MS || '2000', 10);
const DEFAULT_MEMORY_MB = parseInt(process.env.RUN_MEMORY_MB || '256', 10);
const MAX_OUTPUT_KB = parseInt(process.env.MAX_OUTPUT_KB || '256', 10);
const RUNNER_IMAGE = process.env.RUNNER_IMAGE || 'algoforge-cpp-runner:latest';

/**
 * Execute command with promise
 */
function runCommand(cmd, options = {}) {
  return new Promise((resolve) => {
    exec(cmd, options, (error, stdout, stderr) => {
      resolve({
        error,
        stdout: stdout || '',
        stderr: stderr || '',
      });
    });
  });
}

/**
 * Truncates string to specified maximum KB
 */
function truncateOutput(str, maxKb = MAX_OUTPUT_KB) {
  const maxBytes = maxKb * 1024;
  if (Buffer.byteLength(str, 'utf8') <= maxBytes) {
    return str;
  }
  return Buffer.from(str, 'utf8').subarray(0, maxBytes).toString('utf8') + '\n... [Output Truncated: Exceeded limit]';
}

/**
 * Executes C++ code inside isolated Docker container with strict sandbox hardening
 */
async function executeInSandbox({
  cppSource,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  memoryMb = DEFAULT_MEMORY_MB,
  storageLimitMb = 64,
}) {
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const containerName = `algoforge_${jobId}`;
  const baseTempDir = path.join(process.cwd(), 'temp', 'jobs');
  const jobDir = path.join(baseTempDir, jobId);

  try {
    // 1. Prepare job directory and write C++ source
    await fs.mkdir(jobDir, { recursive: true });
    await fs.chmod(jobDir, 0o777);
    const sourceFilePath = path.join(jobDir, 'solution.cpp');
    await fs.writeFile(sourceFilePath, cppSource, 'utf8');

    // Convert Windows backslashes for Docker volume mount
    const dockerMountPath = jobDir.replace(/\\/g, '/');

    // 2. Compilation phase inside container
    // Compile with g++ -O2 -std=c++17
    const storageLimitMb = parseInt(process.env.RUN_STORAGE_MB || '64', 10);
    const compileCmd = `docker run --rm --name ${containerName}_cmp -v "${dockerMountPath}:/sandbox" --storage-opt size=${storageLimitMb}m --network none --memory 512m --cpus 1.5 ${RUNNER_IMAGE} sh -c "g++ -O2 -std=c++17 /sandbox/solution.cpp -o /sandbox/solution 2>&1"`;
    
    const compileStartTime = Date.now();
    const compileResult = await runCommand(compileCmd, { timeout: 15000 });
    if (compileResult.error?.killed || compileResult.error?.code === 'ETIMEDOUT') {
      await runCommand(`docker rm -f ${containerName}_cmp`);
    }
    
    if (compileResult.error || !compileResult.stdout.includes('')) {
      // Check if binary was produced
      try {
        await fs.access(path.join(jobDir, 'solution'));
      } catch (e) {
        // Compilation failed!
        return {
          status: 'COMPILATION_ERROR',
          compileOutput: truncateOutput(compileResult.stdout || compileResult.stderr || 'Compilation error'),
          runtimeMs: Date.now() - compileStartTime,
        };
      }
    }

    // 3. Execution phase inside hardened container
    // Constraints: --net=none, --memory, --cpus, --pids-limit, no-new-privileges
    const execCmd = `docker run --rm --name ${containerName} -v "${dockerMountPath}:/sandbox" --storage-opt size=${storageLimitMb}m --network none --memory ${memoryMb}m --memory-swap ${memoryMb}m --cpus 1.0 --pids-limit 64 --security-opt no-new-privileges ${RUNNER_IMAGE} sh -c "/sandbox/solution"`;

    const execStartTime = Date.now();
    let isTimeout = false;

    const execPromise = new Promise((resolve) => {
      const child = exec(execCmd, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
        const totalDuration = Date.now() - execStartTime;
        resolve({
          error,
          stdout: stdout || '',
          stderr: stderr || '',
          durationMs: totalDuration,
          isTimeout,
        });
      });

      // Wall-clock execution timeout kill
      const timer = setTimeout(async () => {
        isTimeout = true;
        // Kill docker container directly
        await runCommand(`docker kill ${containerName}`);
        try {
          child.kill('SIGKILL');
        } catch (e) {}
      }, timeoutMs);

      child.on('close', () => clearTimeout(timer));
    });

    const execResult = await execPromise;

    if (execResult.isTimeout) {
      return {
        status: 'TIME_LIMIT_EXCEEDED',
        runtimeMs: timeoutMs,
        stdout: '',
        stderr: 'Time Limit Exceeded: Process terminated by sandbox watch-dog',
      };
    }

    if (execResult.error) {
      // Check for OOM / Memory limit or segmentation fault
      const errStr = (execResult.stderr + execResult.stdout).toLowerCase();
      if (errStr.includes('out of memory') || execResult.error.code === 137) {
        return {
          status: 'MEMORY_LIMIT_EXCEEDED',
          runtimeMs: execResult.durationMs,
          stdout: truncateOutput(execResult.stdout),
          stderr: 'Memory Limit Exceeded (Allocated limit exceeded)',
        };
      }

      return {
        status: 'RUNTIME_ERROR',
        runtimeMs: execResult.durationMs,
        stdout: truncateOutput(execResult.stdout),
        stderr: truncateOutput(execResult.stderr || execResult.error.message),
      };
    }

    return {
      status: 'SUCCESS',
      runtimeMs: execResult.durationMs,
      stdout: truncateOutput(execResult.stdout),
      stderr: truncateOutput(execResult.stderr),
    };
  } finally {
    // 4. Guaranteed cleanup of temp files and orphan containers
    try {
      await fs.rm(jobDir, { recursive: true, force: true });
    } catch (e) {}
    // Ensure container cleanup
    runCommand(`docker rm -f ${containerName}`).catch(() => {});
    runCommand(`docker rm -f ${containerName}_cmp`).catch(() => {});
  }
}

module.exports = {
  executeInSandbox,
  truncateOutput,
};
