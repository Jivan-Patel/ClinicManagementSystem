const { z } = require('zod');

const signupSchema = z.object({
  doctorName: z.string().min(2, "Doctor name must be at least 2 characters"),
  clinicName: z.string().min(2, "Clinic name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required")
});

const updateProfileSchema = z.object({
  doctorName: z.string().min(2, "Doctor name must be at least 2 characters"),
  clinicName: z.string().min(2, "Clinic name must be at least 2 characters")
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters")
});

const validateSignup = (req, res, next) => {
  try {
    signupSchema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).json({ success: false, message: "Validation Error", errors: err.issues.map(e => ({ path: e.path.join('.'), message: e.message })) });
  }
};

const validateLogin = (req, res, next) => {
  try {
    loginSchema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).json({ success: false, message: "Validation Error", errors: err.issues.map(e => ({ path: e.path.join('.'), message: e.message })) });
  }
};

const validateUpdateProfile = (req, res, next) => {
  try {
    updateProfileSchema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).json({ success: false, message: "Validation Error", errors: err.issues.map(e => ({ path: e.path.join('.'), message: e.message })) });
  }
};

const validateChangePassword = (req, res, next) => {
  try {
    changePasswordSchema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).json({ success: false, message: "Validation Error", errors: err.issues.map(e => ({ path: e.path.join('.'), message: e.message })) });
  }
};

module.exports = {
  validateSignup,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword
};
