const express = require('express');
const router = express.Router();
const userController = require('../Controllers/SignUpController');
const { isAuthenticated } = require('../Middlewares/authMiddleware'); 

// Signup Route
router.post('/signup', userController.signup);

// Login Route
router.post('/login', userController.login);

// Edit Profile Route
router.put('/profile/edit', isAuthenticated, userController.editProfile);

// Request Password Reset Route
router.post('/password/reset', userController.requestPasswordReset);

// Reset Password Route
router.post('/password/reset/:token', userController.resetPassword);

// Change Password Route
router.post('/password/change', isAuthenticated, userController.changePassword);

// Logout Route
router.post('/logout', isAuthenticated, userController.logout);

// Sign out from all devices Route
router.post('/logout/all', isAuthenticated, userController.signOutFromAllDevices);

module.exports = router;
