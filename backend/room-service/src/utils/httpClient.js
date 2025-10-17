const axios = require("axios");
const logger = require("./logger");

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || "http://localhost:3001";

class HttpClient {
  // Validate user exists
  static async validateUser(userId) {
    try {
      const response = await axios.get(
        `${USER_SERVICE_URL}/users/validate/${userId}`
      );
      return response.data.valid;
    } catch (error) {
      logger.error(`Error validating user ${userId}:`, error.message);
      return false;
    }
  }

  // Get user details
  static async getUser(userId) {
    try {
      const response = await axios.get(`${USER_SERVICE_URL}/users/${userId}`);
      return response.data.user;
    } catch (error) {
      logger.error(`Error getting user ${userId}:`, error.message);
      return null;
    }
  }
}

module.exports = HttpClient;
