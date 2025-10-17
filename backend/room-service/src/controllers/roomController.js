const RoomModel = require("../models/roomModel");
const httpClient = require("../utils/httpClient");
const logger = require("../utils/logger");

// Create a new room
exports.createRoom = async (req, res) => {
  try {
    const { userId } = req.body;

    // Validation
    if (!userId) {
      return res.status(400).json({
        error: "userId is required",
      });
    }

    // Validate user exists by calling User Service
    const userValid = await httpClient.validateUser(userId);
    if (!userValid) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Get user details
    const user = await httpClient.getUser(userId);
    if (!user) {
      return res.status(404).json({
        error: "Could not fetch user details",
      });
    }

    // Create room
    const room = RoomModel.createRoom(userId, user.username);

    logger.info(`Room created: ${room.roomId} by ${user.username}`);

    res.status(201).json({
      success: true,
      room: {
        roomId: room.roomId,
        status: room.status,
        createdBy: user.username,
        createdAt: room.createdAt,
      },
    });
  } catch (error) {
    logger.error("Error creating room:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// Get room by ID
exports.getRoomById = (req, res) => {
  try {
    const { roomId } = req.params;
    const room = RoomModel.findById(roomId);

    if (!room) {
      return res.status(404).json({
        error: "Room not found",
      });
    }

    res.json({
      success: true,
      room: {
        roomId: room.roomId,
        status: room.status,
        players: room.players,
        createdAt: room.createdAt,
        startedAt: room.startedAt,
      },
    });
  } catch (error) {
    logger.error("Error getting room:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// Join a room
exports.joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;

    // Validation
    if (!userId) {
      return res.status(400).json({
        error: "userId is required",
      });
    }

    // Validate user exists
    const userValid = await httpClient.validateUser(userId);
    if (!userValid) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Get user details
    const user = await httpClient.getUser(userId);
    if (!user) {
      return res.status(404).json({
        error: "Could not fetch user details",
      });
    }

    // Check if room exists
    const room = RoomModel.findById(roomId);
    if (!room) {
      return res.status(404).json({
        error: "Room not found",
      });
    }

    // Check if room is full
    if (room.players.length >= 2) {
      return res.status(400).json({
        error: "Room is full",
      });
    }

    // Check if user already in room
    if (room.players.some((p) => p.userId === userId)) {
      return res.status(400).json({
        error: "User already in room",
      });
    }

    // Join room
    const updatedRoom = RoomModel.addPlayer(roomId, userId, user.username);

    logger.info(`User ${user.username} joined room ${roomId}`);

    res.json({
      success: true,
      room: {
        roomId: updatedRoom.roomId,
        status: updatedRoom.status,
        players: updatedRoom.players,
        readyToStart: updatedRoom.players.length === 2,
      },
    });
  } catch (error) {
    logger.error("Error joining room:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// Get room status
exports.getRoomStatus = (req, res) => {
  try {
    const { roomId } = req.params;
    const room = RoomModel.findById(roomId);

    if (!room) {
      return res.status(404).json({
        error: "Room not found",
      });
    }

    res.json({
      success: true,
      roomId: room.roomId,
      status: room.status,
      playerCount: room.players.length,
      isFull: room.players.length === 2,
    });
  } catch (error) {
    logger.error("Error getting room status:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// Leave a room
exports.leaveRoom = (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: "userId is required",
      });
    }

    const room = RoomModel.findById(roomId);
    if (!room) {
      return res.status(404).json({
        error: "Room not found",
      });
    }

    const success = RoomModel.removePlayer(roomId, userId);

    if (success) {
      logger.info(`User ${userId} left room ${roomId}`);
      res.json({
        success: true,
        message: "Left room successfully",
      });
    } else {
      res.status(400).json({
        error: "User not in room",
      });
    }
  } catch (error) {
    logger.error("Error leaving room:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// Get all rooms (for debugging)
exports.getAllRooms = (req, res) => {
  try {
    const rooms = RoomModel.getAllRooms();
    res.json({
      success: true,
      count: rooms.length,
      rooms: rooms.map((r) => ({
        roomId: r.roomId,
        status: r.status,
        playerCount: r.players.length,
        players: r.players.map((p) => p.username),
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    logger.error("Error getting all rooms:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};
