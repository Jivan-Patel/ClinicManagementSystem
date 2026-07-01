const { z } = require('zod');

const visitSchema = z.object({
  patientId: z.string().nonempty("Patient ID is required"),
  diagnosis: z.string().min(2, "Diagnosis must be at least 2 characters"),
  treatment: z.string().min(2, "Treatment must be at least 2 characters")
});

const validateVisit = (req, res, next) => {
  try {
    visitSchema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: err.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
    });
  }
};

module.exports = {
  validateVisit
};
