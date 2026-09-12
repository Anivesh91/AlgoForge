const { z } = require('zod');

const executeSubmissionSchema = z.object({
  code: z
    .string({ required_error: 'Code is required' })
    .min(1, 'Code cannot be empty'),
  submit: z.boolean().optional().default(false),
  customTests: z
    .array(
      z.object({
        id: z.string().optional(),
        input: z.any(),
        expectedOutput: z.any().optional(),
      })
    )
    .optional()
    .default([]),
});

module.exports = {
  executeSubmissionSchema,
};
