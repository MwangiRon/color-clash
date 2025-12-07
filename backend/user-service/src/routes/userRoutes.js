const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Register new user
router.post('/register', userController.registerUser);

// Login user
router.post('/login', userController.loginUser);

// Get user by ID
router.get('/:userId', userController.getUserById);

// Validate user exists
router.get('/validate/:userId', userController.validateUser);

// Get all users (for debugging)
router.get('/', userController.getAllUsers);

module.exports = router;