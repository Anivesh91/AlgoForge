const Conversation = require('../models/Conversation');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const { hintRequestSchema, chatRequestSchema, submissionReviewSchema } = require('../validators/tutor.schema');
const {
  generateProgressiveHint,
  generateContextualReply,
  generateSubmissionReview,
} = require('../services/ai/tutor.service');
const { successResponse, errorResponse } = require('../utils/response');

const appendMessages = async (filter, messages) => {
  try {
    return await Conversation.findOneAndUpdate(
      filter,
      { $push: { messages: { $each: messages } } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    if (error.code !== 11000) throw error;
    return Conversation.findOneAndUpdate(
      filter,
      { $push: { messages: { $each: messages } } },
      { new: true }
    );
  }
};

/**
 * Retrieves conversation history for the authenticated user and problem
 */
const getConversation = async (req, res, next) => {
  try {
    const { id: problemId } = req.params;

    const conversation = await Conversation.findOne({
      problemId,
      userId: req.user._id,
    });

    return successResponse(res, {
      messages: conversation ? conversation.messages : [],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generates and records a progressive hint
 */
const postHint = async (req, res, next) => {
  try {
    const { id: problemId } = req.params;
    const validated = hintRequestSchema.parse(req.body);

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return errorResponse(res, 'NOT_FOUND', 'Problem not found', 404);
    }

    const hint = await generateProgressiveHint({
      problem,
      userCode: validated.code,
      hintLevel: validated.hintLevel,
    });

    const conversation = await appendMessages({ problemId, userId: req.user._id }, [{
      role: 'user',
      type: 'hint',
      content: `Requesting Hint ${validated.hintLevel}`,
      createdAt: new Date(),
    }, {
      role: 'assistant',
      type: 'hint',
      content: hint,
      createdAt: new Date(),
    }]);

    return successResponse(res, {
      hint,
      hintLevel: validated.hintLevel,
      messages: conversation.messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles conversational queries to the AI tutor with code context
 */
const postChat = async (req, res, next) => {
  try {
    const { id: problemId } = req.params;
    const validated = chatRequestSchema.parse(req.body);

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return errorResponse(res, 'NOT_FOUND', 'Problem not found', 404);
    }

    const conversation = await Conversation.findOne({
      problemId,
      userId: req.user._id,
    });

    const conversationHistory = conversation ? conversation.messages : [];

    const reply = await generateContextualReply({
      problem,
      userCode: validated.code,
      userMessage: validated.message,
      conversationHistory,
    });

    const updatedConversation = await appendMessages({ problemId, userId: req.user._id }, [{
      role: 'user',
      type: validated.type,
      content: validated.message,
      createdAt: new Date(),
    }, {
      role: 'assistant',
      type: validated.type,
      content: reply,
      createdAt: new Date(),
    }]);

    return successResponse(res, {
      reply,
      messages: updatedConversation.messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resets/clears conversation history for the problem
 */
const clearConversation = async (req, res, next) => {
  try {
    const { id: problemId } = req.params;

    await Conversation.findOneAndUpdate(
      { problemId, userId: req.user._id },
      { $set: { messages: [] } },
      { new: true }
    );

    return successResponse(res, {
      messages: [],
      message: 'Conversation cleared successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generates an AI code review for a recorded submission
 */
const reviewSubmission = async (req, res, next) => {
  try {
    const { id: submissionId } = req.params;
    const validated = submissionReviewSchema.parse(req.body || {});

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return errorResponse(res, 'NOT_FOUND', 'Submission not found', 404);
    }

    // Ownership check
    if (submission.userId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'FORBIDDEN', 'Access denied to this submission', 403);
    }

    const problem = await Problem.findById(submission.problemId);
    if (!problem) {
      return errorResponse(res, 'NOT_FOUND', 'Associated problem not found', 404);
    }

    const review = await generateSubmissionReview({
      problem,
      submission,
      focus: validated.focus,
    });

    return successResponse(res, {
      submissionId,
      review,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversation,
  postHint,
  postChat,
  clearConversation,
  reviewSubmission,
};
