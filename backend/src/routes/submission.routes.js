const express = require('express');
const {
  getSubmissions,
  getSubmissionById,
  executeSubmission,
} = require('../controllers/submission.controller');
const { reviewSubmission } = require('../controllers/tutor.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', getSubmissions);
router.post('/execute/:problemId', executeSubmission);
router.get('/:id', getSubmissionById);

// Day 6: AI Code Review for completed submission
router.post('/:id/review', reviewSubmission);

module.exports = router;
