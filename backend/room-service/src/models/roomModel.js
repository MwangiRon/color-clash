const { v4: uuidv4 } = require('uuid');

// In-memory storage
const rooms = new Map();

class RoomModel {
    // Create a new room
    static createRoom(creatorUserId, creatorUsername) {
        const roomId = uuidv4();
        const room = {
            roomId,
            status: 'waiting', // waiting, playing, finished
            players: [
                {
                    userId: creatorUserId,
                    username: creatorUsername,
                    color: 'red', // First player is red
                    joinedAt: new Date().toISOString()
                }
            ],
            createdAt: new Date().toISOString(),
            startedAt: null,
            finishedAt: null
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

        if (room.players.length >= 2) {
            throw new Error('Room is full');
        }

        room.players.push({
            userId,
            username,
            color: 'blue', // Second player is blue
            joinedAt: new Date().toISOString()
        });

        // Update status to playing when 2 players join
        if (room.players.length === 2) {
            room.status = 'playing';
            room.startedAt = new Date().toISOString();
        }

        return room;
    }

    // Remove player from room
    static removePlayer(roomId, userId) {
        const room = rooms.get(roomId);
        if (!room) return false;

        const initialLength = room.players.length;
        room.players = room.players.filter(p => p.userId !== userId);

        // If room becomes empty, delete it
        if (room.players.length === 0) {
            rooms.delete(roomId);
            return true;
        }

        // If a player left during game, mark as finished
        if (room.status === 'playing') {
            room.status = 'finished';
            room.finishedAt = new Date().toISOString();
        }

        return room.players.length < initialLength;
    }

    // Update room status
    static updateStatus(roomId, status) {
        const room = rooms.get(roomId);
        if (!room) return false;

        room.status = status;
        
        if (status === 'finished') {
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
        return Array.from(rooms.values()).filter(r => r.status === 'waiting');
    }

    // Clear all rooms (for testing)
    static clearAll() {
        rooms.clear();
    }
}

module.exports = RoomModel;


