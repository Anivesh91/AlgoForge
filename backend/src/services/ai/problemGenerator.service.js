const Problem = require('../../models/Problem');
const { problemPackageSchema } = require('../../validators/problem.schema');
const { generateRawProblem } = require('./ai.provider');
const { judgeSolution } = require('../execution/judge.service');

const fs = require('fs');

/**
 * Generates a DSA problem package using AI and executes the Phase 4 self-validation
 * loop against the Docker sandbox runner before saving to database.
 */
async function generateAndValidateProblem({
  userId,
  prompt,
  difficulty = 'Medium',
  topic = 'General DSA',
  attachment = null,
  referenceMode = 'convert',
}) {
  const MAX_RETRIES = 3;
  let attempt = 0;
  let lastFeedback = '';
  let lastError = null;

  try {
    while (attempt < MAX_RETRIES) {
      attempt++;
      console.log(`[ProblemGenerator] Generation attempt ${attempt}/${MAX_RETRIES} for prompt: "${prompt}" (Mode: ${referenceMode})`);

      try {
        // 1. Generate candidate problem package
        const rawPackage = await generateRawProblem({
          prompt,
          difficulty,
          topic,
          feedback: lastFeedback,
          attachment,
          referenceMode,
        });

        // 2. Validate format strictly with Zod
        const validatedPackage = problemPackageSchema.parse(rawPackage);

        // 3. Phase 4 Self-Validation Loop:
        // Execute the generated reference solution against all visible and hidden test cases in the Docker sandbox
        const allTests = [
          ...validatedPackage.visibleTests,
          ...validatedPackage.hiddenTests,
        ];

        console.log(`[ProblemGenerator] Running Docker sandbox validation on reference solution (${allTests.length} tests)...`);
        const judgeResult = await judgeSolution({
          userCode: validatedPackage.referenceSolution,
          functionSpec: validatedPackage.functionSpec,
          tests: allTests,
          supportCode: validatedPackage.supportCode || '',
        });

        console.log(`[ProblemGenerator] Sandbox validation result: status=${judgeResult.status}, passed=${judgeResult.passedTests}/${judgeResult.totalTests}`);

        if (judgeResult.status === 'ACCEPTED') {
          // Solution passed 100% of test cases!
          const slug =
            validatedPackage.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '') +
            '-' +
            Date.now().toString(36);

          let referenceData = null;
          if (attachment) {
            let refType = 'text';
            if (attachment.mimeType?.startsWith('image/')) refType = 'image';
            else if (attachment.mimeType === 'application/pdf') refType = 'pdf';

            referenceData = {
              type: refType,
              originalName: attachment.originalName || 'attachment',
              mimeType: attachment.mimeType,
            };
          }

          const problem = await Problem.create({
            ownerId: userId,
            title: validatedPackage.title,
            slug,
            description: validatedPackage.description,
            difficulty: validatedPackage.difficulty,
            topic: validatedPackage.topic,
            tags: validatedPackage.tags,
            userPrompt: prompt,
            reference: referenceData,
            functionSpec: validatedPackage.functionSpec,
            starterCode: validatedPackage.starterCode,
            supportCode: validatedPackage.supportCode || '',
            constraints: validatedPackage.constraints,
            examples: validatedPackage.examples,
            visibleTests: validatedPackage.visibleTests,
            hiddenTests: validatedPackage.hiddenTests,
            referenceSolution: validatedPackage.referenceSolution,
            validation: {
              status: 'VALID',
              issues: [],
              checkedAt: new Date(),
            },
            status: 'READY',
            latestDraftCode: validatedPackage.starterCode,
          });

          console.log(`[ProblemGenerator] Successfully validated and saved problem "${problem.title}" (ID: ${problem._id})`);
          return problem;
        }

        // If reference solution failed in the sandbox, accumulate feedback for re-prompt
        lastFeedback = `Sandbox Execution Verdict: ${judgeResult.status}.
Passed: ${judgeResult.passedTests}/${judgeResult.totalTests}.
Compiler / Runtime Output: ${judgeResult.compileOutput || judgeResult.stderr || 'Wrong answer on evaluation test cases.'}`;
        
      } catch (err) {
        console.warn(`[ProblemGenerator] Attempt ${attempt} failed:`, err.message);
        lastFeedback = `Validation error: ${err.message}`;
        lastError = err;
      }
    }

    throw new Error(
      `Failed to generate a valid, runnable DSA problem after ${MAX_RETRIES} attempts. Details: ${lastFeedback || (lastError && lastError.message)}`
    );
  } finally {
    // Blueprint Section 13.4: Delete temporary local uploads after processing
    if (attachment && attachment.path) {
      try {
        if (fs.existsSync(attachment.path)) {
          fs.unlinkSync(attachment.path);
          console.log(`[ProblemGenerator] Cleaned up temporary upload: ${attachment.path}`);
        }
      } catch (cleanupErr) {
        console.warn(`[ProblemGenerator] Failed to clean up temp upload: ${cleanupErr.message}`);
      }
    }
  }
}

module.exports = {
  generateAndValidateProblem,
};
