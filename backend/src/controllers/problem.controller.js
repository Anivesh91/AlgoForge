const Problem = require('../models/Problem');
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

    const problems = await Problem.find(filter)
      .sort({ updatedAt: -1 })
      .select('-hiddenTests -referenceSolution -validation');

    return successResponse(res, problems);
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

    problem.latestDraftCode = validatedData.code;
    await problem.save();

    return successResponse(res, {
      message: 'Draft saved successfully',
      updatedAt: problem.updatedAt,
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

    problem.isSaved = !problem.isSaved;
    await problem.save();

    return successResponse(res, {
      isSaved: problem.isSaved,
      message: problem.isSaved ? 'Problem saved' : 'Problem unsaved',
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

    await Problem.findByIdAndDelete(req.params.id);

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
