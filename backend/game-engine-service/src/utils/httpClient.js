const axios = require('axios');
const logger = require('./logger');

const ROOM_SERVICE_URL = process.env.ROOM_SERVICE_URL || 'http://localhost:3002';

class HttpClient {
    // Get room details
    static async getRoom(roomId) {
        try {
            const response = await axios.get(`${ROOM_SERVICE_URL}/rooms/${roomId}`);
            return response.data.room;
        } catch (error) {
            logger.error(`Error getting room ${roomId}:`, error.message);
            return null;
        }
    }

    // Get room status
    static async getRoomStatus(roomId) {
        try {
            const response = await axios.get(`${ROOM_SERVICE_URL}/rooms/${roomId}/status`);
            return response.data;
        } catch (error) {
            logger.error(`Error getting room status ${roomId}:`, error.message);
            return null;
        }
    }
}

module.exports = HttpClient;