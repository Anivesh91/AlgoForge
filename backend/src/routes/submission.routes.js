const express = require('express');
const {
  getSubmissions,
  getSubmissionById,
  executeSubmission,
} = require('../controllers/submission.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', getSubmissions);
router.post('/execute/:problemId', executeSubmission);
router.get('/:id', getSubmissionById);

module.exports = router;
