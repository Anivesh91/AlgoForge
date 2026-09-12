const express = require('express');
const {
  getSubmissions,
  getSubmissionById,
} = require('../controllers/submission.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', getSubmissions);
router.get('/:id', getSubmissionById);

module.exports = router;
