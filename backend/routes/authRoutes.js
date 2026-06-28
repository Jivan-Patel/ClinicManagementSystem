const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateSignup, validateLogin, validateUpdateProfile, validateChangePassword } = require('../validators/authValidator');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', validateSignup, authController.signup);
router.post('/login', validateLogin, authController.login);

router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, validateUpdateProfile, authController.updateProfile);
router.put('/password', protect, validateChangePassword, authController.changePassword);

module.exports = router;
