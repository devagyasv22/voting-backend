const express = require('express');
const router = express.Router();
const { jwtAuthMiddleware } = require('../jwt');
const userController = require('../controllers/userController');

// Route Definitions
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/profile', jwtAuthMiddleware, userController.getProfile);
router.put('/profile/password', jwtAuthMiddleware, userController.changePassword);
router.get('/', jwtAuthMiddleware, userController.getAllUsers);

module.exports = router;