const { z } = require('zod');

const generateProblemInputSchema = z.object({
  prompt: z
    .string({ required_error: 'Problem description or prompt is required' })
    .min(3, 'Prompt must be at least 3 characters')
    .max(2000, 'Prompt is too long'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional().default('Medium'),
  topic: z.string().max(100).optional().default('General DSA'),
});

const updateDraftSchema = z.object({
  code: z.string({ required_error: 'Code is required' }),
});

const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  code: z.string().optional(),
  type: z.enum(['chat', 'hint', 'debug', 'review']).optional().default('chat'),
});

const problemPackageSchema = z.object({
  title: z.string().min(1),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  topic: z.string().default('General DSA'),
  tags: z.array(z.string()).default([]),
  description: z.string().min(10),
  constraints: z.array(z.string()).default([]),
  examples: z.array(
    z.object({
      inputDisplay: z.string(),
      outputDisplay: z.string(),
      explanation: z.string().optional().default(''),
    })
  ),
  functionSpec: z.object({
    name: z.string().min(1),
    returnType: z.string().min(1),
    parameters: z.array(
      z.object({
        name: z.string().min(1),
        type: z.string().min(1),
      })
    ),
  }),
  starterCode: z.string().min(1),
  supportCode: z.string().optional().default(''),
  visibleTests: z.array(
    z.object({
      id: z.string(),
      input: z.any(),
      expectedOutput: z.any(),
    })
  ),
  hiddenTests: z.array(
    z.object({
      id: z.string(),
      input: z.any(),
      expectedOutput: z.any(),
    })
  ),
  referenceSolution: z.string().min(1),
});

module.exports = {
  generateProblemInputSchema,
  updateDraftSchema,
  chatMessageSchema,
  problemPackageSchema,
};
