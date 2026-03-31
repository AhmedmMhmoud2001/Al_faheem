export function validateBody(schema) {
  return (req, res, next) => {
    const r = schema.safeParse(req.body);
    if (!r.success) {
      return res.status(400).json({
        message: 'Validation failed',
        details: r.error.flatten(),
      });
    }
    req.validated = req.validated || {};
    req.validated.body = r.data;
    next();
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const r = schema.safeParse(req.query);
    if (!r.success) {
      return res.status(400).json({
        message: 'Invalid query',
        details: r.error.flatten(),
      });
    }
    req.validated = req.validated || {};
    req.validated.query = r.data;
    next();
  };
}
