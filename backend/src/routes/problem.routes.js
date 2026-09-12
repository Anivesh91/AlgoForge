const express = require('express');
const {
  getProblems,
  getProblemById,
  updateDraft,
  toggleSave,
  deleteProblem,
} = require('../controllers/problem.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// All problem routes require authentication
router.use(authenticate);

router.get('/', getProblems);
router.get('/:id', getProblemById);
router.patch('/:id/draft', updateDraft);
router.post('/:id/save', toggleSave);
router.delete('/:id', deleteProblem);

module.exports = router;
