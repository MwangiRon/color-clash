const axios = require('axios');
const logger = require('./logger');

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const ROOM_SERVICE_URL = process.env.ROOM_SERVICE_URL || 'http://localhost:3002';
const GAME_ENGINE_URL = process.env.GAME_ENGINE_URL || 'http://localhost:3003';

class HttpClient {
    // User Service calls
    static async registerUser(username) {
        try {
            const response = await axios.post(`${USER_SERVICE_URL}/users/register`, { username });
            return response.data;
        } catch (error) {
            logger.error('Error registering user:', error.response?.data || error.message);
            return { success: false, error: error.response?.data?.error || 'Registration failed' };
        }
    }

    static async loginUser(username) {
        try {
            const response = await axios.post(`${USER_SERVICE_URL}/users/login`, { username });
            return response.data;
        } catch (error) {
            logger.error('Error logging in user:', error.response?.data || error.message);
            return { success: false, error: error.response?.data?.error || 'Login failed' };
        }
    }

    static async getUser(userId) {
        try {
            const response = await axios.get(`${USER_SERVICE_URL}/users/${userId}`);
            return response.data;
        } catch (error) {
            logger.error('Error getting user:', error.message);
            return null;
        }
    }

    // Room Service calls
    static async createRoom(userId) {
        try {
            const response = await axios.post(`${ROOM_SERVICE_URL}/rooms`, { userId });
            return response.data;
        } catch (error) {
            logger.error('Error creating room:', error.response?.data || error.message);
            return { success: false, error: error.response?.data?.error || 'Failed to create room' };
        }
    }

    static async joinRoom(roomId, userId) {
        try {
            const response = await axios.post(`${ROOM_SERVICE_URL}/rooms/${roomId}/join`, { userId });
            return response.data;
        } catch (error) {
            logger.error('Error joining room:', error.response?.data || error.message);
            return { success: false, error: error.response?.data?.error || 'Failed to join room' };
        }
    }

    static async leaveRoom(roomId, userId) {
        try {
            const response = await axios.post(`${ROOM_SERVICE_URL}/rooms/${roomId}/leave`, { userId });
            return response.data;
        } catch (error) {
            logger.error('Error leaving room:', error.message);
            return { success: false, error: 'Failed to leave room' };
        }
    }

    static async getRoom(roomId) {
        try {
            const response = await axios.get(`${ROOM_SERVICE_URL}/rooms/${roomId}`);
            return response.data;
        } catch (error) {
            logger.error('Error getting room:', error.message);
            return null;
        }
    }

    // Game Engine calls
    static async startGame(roomId) {
        try {
            const response = await axios.post(`${GAME_ENGINE_URL}/game/start`, { roomId });
            return response.data;
        } catch (error) {
            logger.error('Error starting game:', error.response?.data || error.message);
            return { success: false, error: error.response?.data?.error || 'Failed to start game' };
        }
    }

    static async makeMove(roomId, userId, position, isPowerMove) {
        try {
            const response = await axios.post(`${GAME_ENGINE_URL}/game/move`, {
                roomId,
                userId,
                position,
                isPowerMove: isPowerMove || false
            });
            return response.data;
        } catch (error) {
            logger.error('Error making move:', error.response?.data || error.message);
            return { success: false, error: error.response?.data?.error || 'Invalid move' };
        }
    }

    static async getGameState(roomId) {
        try {
            const response = await axios.get(`${GAME_ENGINE_URL}/game/${roomId}/state`);
            return response.data;
        } catch (error) {
            logger.error('Error getting game state:', error.message);
            return { success: false, error: 'Failed to get game state' };
        }
    }
}

module.exports = HttpClient;