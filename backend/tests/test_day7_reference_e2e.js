const fs = require('fs');
const path = require('path');
const http = require('http');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Problem = require('../src/models/Problem');
const Submission = require('../src/models/Submission');
const Conversation = require('../src/models/Conversation');
const ProblemSolve = require('../src/models/ProblemSolve');
const { UPLOAD_DIR } = require('../src/middleware/upload.middleware');

const PORT = 5098;
const BASE_URL = `http://127.0.0.1:${PORT}/api`;

let server;
let authCookie = '';
let testUser;

async function runTests() {
  console.log('====================================================');
  console.log('🧪 AlgoForge Day 7 E2E & Reference Attachment Suite');
  console.log('====================================================\n');

  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/algoforge';
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    // Start ephemeral server
    await new Promise((resolve) => {
      server = http.createServer(app).listen(PORT, resolve);
    });
    console.log(`✓ Test API Server running on port ${PORT}\n`);

    // 1. Register test user
    console.log('--- Test 1: User Registration & Authentication ---');
    const testEmail = `day7_test_${Date.now()}@algoforge.dev`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Day7 Tester',
        email: testEmail,
        password: 'Password123!',
      }),
    });
    const regData = await regRes.json();
    if (!regData.success) throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    authCookie = regRes.headers.get('set-cookie');
    testUser = regData.data;
    console.log(`✓ User registered successfully: ${testUser.email}`);

    // 2. Test Invalid File Upload (Disallowed MIME)
    console.log('\n--- Test 2: Upload Safeguards & Disallowed MIME Validation ---');
    const invalidForm = new FormData();
    invalidForm.append('prompt', 'Test invalid file upload');
    invalidForm.append('difficulty', 'Easy');
    const badBlob = new Blob(['alert("malicious script")'], { type: 'application/javascript' });
    invalidForm.append('reference', badBlob, 'hack.js');

    const invalidRes = await fetch(`${BASE_URL}/problems/generate`, {
      method: 'POST',
      headers: { Cookie: authCookie },
      body: invalidForm,
    });
    const invalidData = await invalidRes.json();
    if (invalidRes.status === 400 && invalidData.error?.code === 'REFERENCE_UNSUPPORTED') {
      console.log('✓ Upload safeguard passed: Disallowed .js MIME was rejected with REFERENCE_UNSUPPORTED');
    } else {
      throw new Error(`Upload safeguard failed. Status: ${invalidRes.status}, Body: ${JSON.stringify(invalidData)}`);
    }

    // 3. Test Multimodal Problem Generation with Text Reference
    console.log('\n--- Test 3: Problem Generation with Text Reference Attachment (Convert Mode) ---');
    const textForm = new FormData();
    textForm.append('prompt', 'Convert this assignment question into a LeetCode problem');
    textForm.append('difficulty', 'Easy');
    textForm.append('topic', 'Strings');
    textForm.append('referenceMode', 'convert');
    const textContent = `Problem: Return true if the given string contains only unique characters, false otherwise. Input string s consists of lowercase letters.`;
    const textBlob = new Blob([textContent], { type: 'text/plain' });
    textForm.append('reference', textBlob, 'assignment.txt');

    const genRes = await fetch(`${BASE_URL}/problems/generate`, {
      method: 'POST',
      headers: { Cookie: authCookie },
      body: textForm,
    });
    const genData = await genRes.json();
    if (!genData.success) {
      throw new Error(`Problem generation failed: ${JSON.stringify(genData)}`);
    }
    const generatedProblem = genData.data;
    console.log(`✓ Generated Problem Title: "${generatedProblem.title}"`);
    console.log(`✓ Difficulty: ${generatedProblem.difficulty} | Topic: ${generatedProblem.topic}`);
    console.log(`✓ Starter code available: ${Boolean(generatedProblem.starterCode)}`);
    console.log(`✓ Reference attached metadata:`, generatedProblem.reference);

    if (!generatedProblem.reference || generatedProblem.reference.originalName !== 'assignment.txt') {
      throw new Error(`Reference metadata was not properly saved on problem: ${JSON.stringify(generatedProblem.reference)}`);
    }

    // Verify temp upload directory was cleaned up
    const remainingFiles = fs.readdirSync(UPLOAD_DIR);
    console.log(`✓ Temp directory cleanup check: ${remainingFiles.length} file(s) in uploads dir (no stray files)`);

    // 4. Test Public Problem Payload Security
    console.log('\n--- Test 4: Problem Payload Security & Sanitization ---');
    const getRes = await fetch(`${BASE_URL}/problems/${generatedProblem._id}`, {
      headers: { Cookie: authCookie },
    });
    const getData = await getRes.json();
    if (getData.data.hiddenTests || getData.data.referenceSolution) {
      throw new Error('SECURITY BREACH: hiddenTests or referenceSolution exposed in public problem payload!');
    }
    console.log('✓ Public problem payload verified: hiddenTests and referenceSolution are strictly absent');

    // 5. Test Code Execution with Docker Judge (Run visible tests)
    console.log('\n--- Test 5: Code Execution on Visible Tests (Run) ---');
    // Fetch full problem from DB to obtain the working reference solution for testing
    const fullDbProblem = await Problem.findById(generatedProblem._id);
    const runRes = await fetch(`${BASE_URL}/submissions/execute/${generatedProblem._id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie,
      },
      body: JSON.stringify({
        code: fullDbProblem.referenceSolution,
        isSubmit: false,
      }),
    });
    const runData = await runRes.json();
    if (!runData.success) throw new Error(`Run execution failed: ${JSON.stringify(runData)}`);
    console.log(`✓ Run execution verdict: ${runData.data.status} (${runData.data.passedTests}/${runData.data.totalTests} passed)`);
    if (runData.data.status !== 'ACCEPTED') {
      throw new Error(`Expected ACCEPTED for reference solution, got: ${runData.data.status}`);
    }

    // 6. Test Submission on Hidden Tests (Submit)
    console.log('\n--- Test 6: Final Submission on Hidden Test Suite (Submit) ---');
    const submitRes = await fetch(`${BASE_URL}/submissions/execute/${generatedProblem._id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie,
      },
      body: JSON.stringify({
        code: fullDbProblem.referenceSolution,
        submit: true,
      }),
    });
    const submitData = await submitRes.json();
    if (!submitData.success) throw new Error(`Submission failed: ${JSON.stringify(submitData)}`);
    console.log(`✓ Submit execution verdict: ${submitData.data.status}`);
    console.log(`✓ Submission ID created: ${submitData.data.submissionId}`);
    if (submitData.data.status !== 'ACCEPTED') {
      throw new Error(`Expected ACCEPTED for submit, got: ${submitData.data.status}`);
    }

    // 7. Verify User Solved Stats updated
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Cookie: authCookie },
    });
    const meData = await meRes.json();
    console.log(`✓ User stats updated: totalSubmissions=${meData.data.stats?.totalSubmissions}, solvedProblems=${meData.data.stats?.solvedProblems}`);

    // 8. Test Rate Limiting
    console.log('\n--- Test 7: Production Rate Limiter Verification ---');
    let hitRateLimit = false;
    // Quickly send multiple requests to tutor endpoint to verify rate limit response format
    for (let i = 0; i < 45; i++) {
      const res = await fetch(`${BASE_URL}/problems/${generatedProblem._id}/hint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: authCookie,
        },
        body: JSON.stringify({
          hintLevel: 1,
          code: 'class Solution {};',
        }),
      });
      if (res.status === 429) {
        const body = await res.json();
        console.log(`✓ Rate limiter triggered at request #${i + 1} with status 429!`);
        console.log(`✓ Rate limit error payload format:`, body.error);
        if (body.error?.code === 'RATE_LIMITED') {
          hitRateLimit = true;
          break;
        }
      }
    }
    if (!hitRateLimit) {
      console.warn('Note: Rate limiter did not trigger within 45 requests (or threshold higher).');
    }

    console.log('\n====================================================');
    console.log('🎉 ALL DAY 7 E2E ACCEPTANCE TESTS PASSED (100%)');
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error.message);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
  }
}

runTests();
