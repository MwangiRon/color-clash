const { v4: uuidv4 } = require('uuid');

// In-memory storage (no database needed)
const users = new Map();

class UserModel {
    // Create a new user
    static createUser(username) {
        const userId = uuidv4();
        const user = {
            userId,
            username: username.trim(),
            createdAt: new Date().toISOString(),
            isOnline: false
        };
        
        users.set(userId, user);
        return user;
    }

    // Find user by ID
    static findById(userId) {
        return users.get(userId);
    }

    // Find user by username
    static findByUsername(username) {
        const normalizedUsername = username.trim().toLowerCase();
        for (const user of users.values()) {
            if (user.username.toLowerCase() === normalizedUsername) {
                return user;
            }
        }
        return null;
    }

    // Get all users
    static getAllUsers() {
        return Array.from(users.values());
    }

    // Update user online status
    static setOnlineStatus(userId, isOnline) {
        const user = users.get(userId);
        if (user) {
            user.isOnline = isOnline;
            return true;
        }
        return false;
    }

    // Delete user (optional, for cleanup)
    static deleteUser(userId) {
        return users.delete(userId);
    }

    // Clear all users (for testing)
    static clearAll() {
        users.clear();
    }
}

module.exports = UserModel;