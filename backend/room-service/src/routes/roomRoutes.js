const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// Create new room
router.post('/', roomController.createRoom);

// Get room by ID
router.get('/:roomId', roomController.getRoomById);

// Join a room
router.post('/:roomId/join', roomController.joinRoom);

// Get room status
router.get('/:roomId/status', roomController.getRoomStatus);

// Leave a room
router.post('/:roomId/leave', roomController.leaveRoom);

// Get all rooms (for debugging)
router.get('/', roomController.getAllRooms);

module.exports = router;