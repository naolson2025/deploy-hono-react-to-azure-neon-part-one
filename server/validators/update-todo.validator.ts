import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

export const updateTodoSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    completed: z.boolean().optional(),
  })
  .strict();

export const updateTodoValidator = zValidator(
  'json',
  updateTodoSchema,
  (result, c) => {
    if (!result.success) {
      return c.json(
        {
          errors: result.error.issues.map((issue) => issue.message),
        },
        400
      );
    }
  }
);
