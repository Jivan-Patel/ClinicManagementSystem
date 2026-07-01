const { z } = require('zod');

const patientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.number().min(0, "Age cannot be negative"),
  gender: z.enum(['Male', 'Female', 'Other'], {
    errorMap: () => ({ message: "Gender must be Male, Female, or Other" })
  }),
  address: z.string().min(5, "Address must be at least 5 characters"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits")
});

const validatePatient = (req, res, next) => {
  try {
    patientSchema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: err.issues.map(e => ({ path: e.path.join('.'), message: e.message }))
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
  validatePatient
};
