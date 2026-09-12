const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const { judgeSolution } = require('../services/execution/judge.service');
const { successResponse, errorResponse } = require('../utils/response');

// GET /api/submissions
const getSubmissions = async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const filter = { userId: req.user._id };
    if (req.query.cursor) {
      const decoded = JSON.parse(Buffer.from(req.query.cursor, 'base64url').toString('utf8'));
      filter.$or = [
        { createdAt: { $lt: new Date(decoded.createdAt) } },
        { createdAt: new Date(decoded.createdAt), _id: { $lt: decoded.id } },
      ];
    }
    const submissions = await Submission.find(filter)
      .populate('problemId', 'title difficulty slug')
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1);
    const hasMore = submissions.length > limit;
    const page = submissions.slice(0, limit);
    const last = page[page.length - 1];
    const nextCursor = hasMore && last
      ? Buffer.from(JSON.stringify({ createdAt: last.createdAt, id: last._id })).toString('base64url')
      : null;

    return successResponse(res, { items: page, nextCursor, hasMore });
  } catch (error) {
    next(error);
  }
};

const executeSubmission = async (req, res, next) => {
  try {
    const problem = await Problem.findOne({ _id: req.params.problemId, ownerId: req.user._id });
    if (!problem) return errorResponse(res, 'NOT_FOUND', 'Problem not found', 404);
    const { code, customTests = [], submit = false } = req.body || {};
    const tests = submit
      ? [...problem.visibleTests, ...problem.hiddenTests]
      : customTests.length
      ? customTests
      : problem.visibleTests;

    const result = await judgeSolution({
      userCode: code,
      functionSpec: problem.functionSpec,
      tests,
      supportCode: problem.supportCode,
    });

    if (submit) {
      await Submission.create({
        userId: req.user._id,
        problemId: problem._id,
        code,
        status: result.status,
        passedTests: result.passedTests,
        totalTests: result.totalTests,
        runtimeMs: result.runtimeMs,
        memoryKb: result.memoryKb,
        compileOutput: result.compileOutput,
      });

      // Sanitize hidden tests so inputs and expected outputs are never leaked
      const sanitizedTestResults = (result.testResults || []).map((t) => {
        const isVisible = problem.visibleTests.some((v) => String(v.id) === String(t.id));
        return {
          id: t.id,
          passed: t.passed,
          runtimeMs: t.runtimeMs,
          ...(isVisible
            ? { input: t.input, expectedOutput: t.expectedOutput, actualOutput: t.actualOutput }
            : { isHidden: true }),
        };
      });

      return successResponse(res, {
        ...result,
        testResults: sanitizedTestResults,
      });
    }

    return successResponse(res, result);
  } catch (error) { next(error); }
};

// GET /api/submissions/:id
const getSubmissionById = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id).populate(
      'problemId',
      'title difficulty slug'
    );

    if (!submission) {
      return errorResponse(res, 'NOT_FOUND', 'Submission not found', 404);
    }

    if (submission.userId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'FORBIDDEN', 'Access denied to this submission', 403);
    }

    return successResponse(res, submission);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubmissions,
  getSubmissionById,
  executeSubmission,
};
