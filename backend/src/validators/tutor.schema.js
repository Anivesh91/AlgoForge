const { z } = require('zod');

const hintRequestSchema = z.object({
  code: z.string().max(50000, 'Code exceeds maximum size of 50KB').optional().default(''),
  hintLevel: z.number().int().min(1).max(3, 'Hint level must be 1, 2, or 3'),
});

const chatRequestSchema = z.object({
  message: z.string().trim().min(1, 'Message cannot be empty').max(2000, 'Message cannot exceed 2000 characters'),
  code: z.string().max(50000, 'Code exceeds maximum size of 50KB').optional().default(''),
  type: z.enum(['chat', 'hint', 'debug', 'review']).optional().default('chat'),
});

const submissionReviewSchema = z.object({
  focus: z.enum(['complexity', 'clean_code', 'comprehensive']).optional().default('comprehensive'),
});

module.exports = {
  hintRequestSchema,
  chatRequestSchema,
  submissionReviewSchema,
};
