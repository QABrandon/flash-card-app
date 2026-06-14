/**
 * Express middleware factory that validates req.body against a Zod schema.
 *
 * On success it replaces req.body with the parsed (and coerced) value so
 * downstream handlers can trust the shape without extra checks.
 *
 * On failure it short-circuits with a 400 and the standard error envelope.
 *
 * @param {import('zod').ZodTypeAny} schema
 */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          // Collect all field messages into a single readable string
          message: result.error.issues.map((i) => i.message).join('; '),
        },
      });
    }
    req.body = result.data;
    next();
  };
}
