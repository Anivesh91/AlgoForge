const Problem = require('../models/Problem');
const Conversation = require('../models/Conversation');
const Submission = require('../models/Submission');
const mongoose = require('mongoose');
const { updateDraftSchema, generateProblemInputSchema } = require('../validators/problem.schema');
const { generateAndValidateProblem } = require('../services/ai/problemGenerator.service');
const { successResponse, errorResponse } = require('../utils/response');

// GET /api/problems
const getProblems = async (req, res, next) => {
  try {
    const filter = { ownerId: req.user._id };
    if (req.query.saved === 'true') {
      filter.isSaved = true;
    }

    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    if (req.query.cursor) {
      const decoded = JSON.parse(Buffer.from(req.query.cursor, 'base64url').toString('utf8'));
      const cursorDate = new Date(decoded.updatedAt);
      filter.$or = [
        { updatedAt: { $lt: cursorDate } },
        { updatedAt: cursorDate, _id: { $lt: decoded.id } },
      ];
    }
    const problems = await Problem.find(filter)
      .sort({ updatedAt: -1, _id: -1 })
      .select('title slug difficulty topic tags isSaved createdAt updatedAt')
      .limit(limit + 1);
    const hasMore = problems.length > limit;
    const page = problems.slice(0, limit);
    const last = page[page.length - 1];
    const nextCursor = hasMore && last
      ? Buffer.from(JSON.stringify({ updatedAt: last.updatedAt, id: last._id })).toString('base64url')
      : null;

    return successResponse(res, { items: page, nextCursor, hasMore });
  } catch (error) {
    next(error);
  }
};

// GET /api/problems/:id
const getProblemById = async (req, res, next) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return errorResponse(res, 'NOT_FOUND', 'Problem not found', 404);
    }

    // Verify ownership
    if (problem.ownerId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'FORBIDDEN', 'You do not have access to this problem', 403);
    }

    // Return sanitized public payload (strips hiddenTests & referenceSolution)
    return successResponse(res, problem.toPublicJSON());
  } catch (error) {
    next(error);
  }
};

// PATCH /api/problems/:id/draft
const updateDraft = async (req, res, next) => {
  try {
    const validatedData = updateDraftSchema.parse(req.body);

    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return errorResponse(res, 'NOT_FOUND', 'Problem not found', 404);
    }

    if (problem.ownerId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'FORBIDDEN', 'You do not have permission to modify this problem', 403);
    }

    const revision = validatedData.revision ?? problem.draftRevision + 1;
    const updatedProblem = await Problem.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user._id, draftRevision: { $lt: revision } },
      { $set: { latestDraftCode: validatedData.code, draftRevision: revision } },
      { new: true }
    );

    return successResponse(res, {
      message: 'Draft saved successfully',
      updatedAt: updatedProblem?.updatedAt || problem.updatedAt,
      revision: updatedProblem?.draftRevision || problem.draftRevision,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/problems/:id/save
const toggleSave = async (req, res, next) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return errorResponse(res, 'NOT_FOUND', 'Problem not found', 404);
    }

    if (problem.ownerId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'FORBIDDEN', 'You do not have permission to modify this problem', 403);
    }

    const requestedIsSaved = req.body?.isSaved;
    if (typeof requestedIsSaved !== 'boolean') {
      return errorResponse(res, 'VALIDATION_ERROR', 'isSaved must be a boolean', 400);
    }
    const updatedProblem = await Problem.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user._id },
      { $set: { isSaved: requestedIsSaved } },
      { new: true }
    );

    return successResponse(res, {
      isSaved: updatedProblem.isSaved,
      message: updatedProblem.isSaved ? 'Problem saved' : 'Problem unsaved',
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/problems/:id
const deleteProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return errorResponse(res, 'NOT_FOUND', 'Problem not found', 404);
    }

    if (problem.ownerId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'FORBIDDEN', 'You do not have permission to delete this problem', 403);
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await Conversation.deleteMany({ problemId: problem._id }, { session });
        await Submission.deleteMany({ problemId: problem._id }, { session });
        await Problem.deleteOne({ _id: problem._id, ownerId: req.user._id }, { session });
      });
    } finally {
      await session.endSession();
    }

    return successResponse(res, { message: 'Problem deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// POST /api/problems/generate
const generateProblem = async (req, res, next) => {
  try {
    const validatedData = generateProblemInputSchema.parse(req.body);

    const problem = await generateAndValidateProblem({
      userId: req.user._id,
      prompt: validatedData.prompt,
      difficulty: validatedData.difficulty,
      topic: validatedData.topic,
    });

    return successResponse(res, problem.toPublicJSON(), 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProblems,
  getProblemById,
  updateDraft,
  toggleSave,
  deleteProblem,
  generateProblem,
};
