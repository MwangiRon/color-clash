const { v4: uuidv4 } = require("uuid");
const { GAME_CONSTANTS } = require("../../../shared-utils/constants");

// In-memory storage
const rooms = new Map();

class RoomModel {
  // Create a new room
  static createRoom(creatorUserId, creatorUsername) {
    const roomId = uuidv4();
    const room = {
      roomId,
      status: GAME_CONSTANTS.ROOM_STATUS.WAITING,
      players: [
        {
          userId: creatorUserId,
          username: creatorUsername,
          color: GAME_CONSTANTS.COLORS.RED,
          joinedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      startedAt: null,
      finishedAt: null,
    };

    rooms.set(roomId, room);
    return room;
  }

  // Find room by ID
  static findById(roomId) {
    return rooms.get(roomId);
  }

  // Add player to room
  static addPlayer(roomId, userId, username) {
    const room = rooms.get(roomId);
    if (!room) return null;

    if (room.players.length >= GAME_CONSTANTS.MAX_PLAYERS) {
      throw new Error("Room is full");
    }

    room.players.push({
      userId,
      username,
      color: GAME_CONSTANTS.COLORS.BLUE,
      joinedAt: new Date().toISOString(),
    });

    if (room.players.length === GAME_CONSTANTS.MAX_PLAYERS) {
      room.status = GAME_CONSTANTS.ROOM_STATUS.PLAYING;
      room.startedAt = new Date().toISOString();
    }

    return room;
  }

  // Remove player from room
  static removePlayer(roomId, userId) {
    const room = rooms.get(roomId);
    if (!room) return false;

    const initialLength = room.players.length;
    room.players = room.players.filter((p) => p.userId !== userId);

    if (room.players.length === 0) {
      rooms.delete(roomId);
      return true;
    }

    if (room.status === GAME_CONSTANTS.ROOM_STATUS.PLAYING) {
      room.status = GAME_CONSTANTS.ROOM_STATUS.FINISHED;
      room.finishedAt = new Date().toISOString();
    }

    return room.players.length < initialLength;
  }

  // Update room status
  static updateStatus(roomId, status) {
    const room = rooms.get(roomId);
    if (!room) return false;

    room.status = status;

    if (status === GAME_CONSTANTS.ROOM_STATUS.FINISHED) {
      room.finishedAt = new Date().toISOString();
    }

    return true;
  }

  // Get all rooms
  static getAllRooms() {
    return Array.from(rooms.values());
  }

  // Get available rooms (waiting for players)
  static getAvailableRooms() {
    return Array.from(rooms.values()).filter(
      (r) => r.status === GAME_CONSTANTS.ROOM_STATUS.WAITING
    );
  }

  // Clear all rooms (for testing)
  static clearAll() {
    rooms.clear();
  }
}

module.exports = RoomModel;
