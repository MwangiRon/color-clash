const UserModel = require('../models/userModel');
const logger = require('../utils/logger');

// Register a new user
exports.registerUser = (req, res) => {
    try {
        const { username } = req.body;

        // Validation
        if (!username || username.trim().length === 0) {
            return res.status(400).json({ 
                error: 'Username is required' 
            });
        }

        if (username.length < 3 || username.length > 20) {
            return res.status(400).json({ 
                error: 'Username must be between 3 and 20 characters' 
            });
        }

        // Check if username already exists
        if (UserModel.findByUsername(username)) {
            return res.status(409).json({ 
                error: 'Username already taken' 
            });
        }

        // Create user
        const user = UserModel.createUser(username);
        
        logger.info(`User registered: ${username} (${user.userId})`);
        
        res.status(201).json({
            success: true,
            user: {
                userId: user.userId,
                username: user.username,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        logger.error('Error registering user:', error);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
};

// Login user
exports.loginUser = (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ 
                error: 'Username is required' 
            });
        }

        const user = UserModel.findByUsername(username);

        if (!user) {
            return res.status(404).json({ 
                error: 'User not found' 
            });
        }

        logger.info(`User logged in: ${username} (${user.userId})`);

        res.json({
            success: true,
            user: {
                userId: user.userId,
                username: user.username,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        logger.error('Error logging in user:', error);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
};

// Get user by ID
exports.getUserById = (req, res) => {
    try {
        const { userId } = req.params;
        const user = UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ 
                error: 'User not found' 
            });
        }

        res.json({
            success: true,
            user: {
                userId: user.userId,
                username: user.username,
                createdAt: user.createdAt,
                isOnline: user.isOnline
            }
        });
    } catch (error) {
        logger.error('Error getting user:', error);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
};

// Validate user exists
exports.validateUser = (req, res) => {
    try {
        const { userId } = req.params;
        const user = UserModel.findById(userId);

        res.json({
            valid: !!user,
            exists: !!user
        });
    } catch (error) {
        logger.error('Error validating user:', error);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
};

// Get all users (for debugging)
exports.getAllUsers = (req, res) => {
    try {
        const users = UserModel.getAllUsers();
        res.json({
            success: true,
            count: users.length,
            users: users.map(u => ({
                userId: u.userId,
                username: u.username,
                isOnline: u.isOnline,
                createdAt: u.createdAt
            }))
        });
    } catch (error) {
        logger.error('Error getting all users:', error);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
};