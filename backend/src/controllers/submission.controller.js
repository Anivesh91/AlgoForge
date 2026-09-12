const Submission = require('../models/Submission');
const { successResponse, errorResponse } = require('../utils/response');

// GET /api/submissions
const getSubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ userId: req.user._id })
      .populate('problemId', 'title difficulty slug')
      .sort({ createdAt: -1 })
      .limit(50);

    return successResponse(res, submissions);
  } catch (error) {
    next(error);
  }
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
};
