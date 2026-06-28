const authService = require('../services/authService');

const signup = async (req, res, next) => {
  try {
    const data = await authService.signup(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    if (error.message === 'Doctor with this email already exists') {
      return res.status(409).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    res.status(200).json({ success: true, data });
  } catch (error) {
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const doctor = await authService.updateProfile(req.doctor.id, req.body);
    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    if (error.message === 'Doctor not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.doctor.id, currentPassword, newPassword);
    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    if (error.message === 'Incorrect current password') {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const doctor = await authService.getProfile(req.doctor.id);
    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    if (error.message === 'Doctor not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

module.exports = {
  signup,
  login,
  getProfile,
  updateProfile,
  changePassword
};
