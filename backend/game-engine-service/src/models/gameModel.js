const { v4: uuidv4 } = require('uuid');

// In-memory storage
const games = new Map();

class GameModel {
    // Create a new game
    static createGame(roomId, players) {
        const gameId = uuidv4();
        
        const game = {
            gameId,
            roomId,
            board: Array(16).fill(null), // 4x4 grid (0-15)
            players: players.map(p => ({
                userId: p.userId,
                username: p.username,
                color: p.color,
                powerMoveUsed: false
            })),
            currentTurn: players[0].userId, // Red player starts
            moves: [],
            status: 'active', // active, finished
            winner: null,
            createdAt: new Date().toISOString(),
            finishedAt: null
        };
        
        games.set(roomId, game);
        return game;
    }

    // Find game by room ID
    static findByRoomId(roomId) {
        return games.get(roomId);
    }

    // Find game by game ID
    static findByGameId(gameId) {
        for (const game of games.values()) {
            if (game.gameId === gameId) {
                return game;
            }
        }
        return null;
    }

    // Get all games
    static getAllGames() {
        return Array.from(games.values());
    }

    // Delete game
    static deleteGame(roomId) {
        return games.delete(roomId);
    }

    // Clear all games (for testing)
    static clearAll() {
        games.clear();
    }
}

module.exports = GameModel;