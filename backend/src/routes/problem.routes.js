const express = require('express');
const {
  getProblems,
  getProblemById,
  updateDraft,
  toggleSave,
  deleteProblem,
  generateProblem,
} = require('../controllers/problem.controller');
const {
  getConversation,
  postHint,
  postChat,
  clearConversation,
} = require('../controllers/tutor.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// All problem routes require authentication
router.use(authenticate);

// Problem generation and CRUD
router.post('/generate', generateProblem);
router.get('/', getProblems);
router.get('/:id', getProblemById);
router.patch('/:id/draft', updateDraft);
router.post('/:id/save', toggleSave);
router.delete('/:id', deleteProblem);

// AI Tutor & Conversation endpoints (Day 6)
router.get('/:id/conversation', getConversation);
router.post('/:id/hint', postHint);
router.post('/:id/chat', postChat);
router.delete('/:id/conversation', clearConversation);

module.exports = router;
