const GameModel = require('../models/gameModel');
const gameLogic = require('../logic/gameLogic');
const winChecker = require('../logic/winChecker');
const httpClient = require('../utils/httpClient');
const logger = require('../utils/logger');

// Start a new game
exports.startGame = async (req, res) => {
    try {
        const { roomId } = req.body;

        // Validation
        if (!roomId) {
            return res.status(400).json({ 
                error: 'roomId is required' 
            });
        }

        // Validate room exists and is ready
        const room = await httpClient.getRoom(roomId);
        if (!room) {
            return res.status(404).json({ 
                error: 'Room not found' 
            });
        }

        if (room.players.length < 2) {
            return res.status(400).json({ 
                error: 'Room needs 2 players to start' 
            });
        }

        // Check if game already exists for this room
        if (GameModel.findByRoomId(roomId)) {
            return res.status(400).json({ 
                error: 'Game already started for this room' 
            });
        }

        // Create game
        const game = GameModel.createGame(roomId, room.players);
        
        logger.info(`Game started for room ${roomId}`);
        
        res.status(201).json({
            success: true,
            game: {
                gameId: game.gameId,
                roomId: game.roomId,
                board: game.board,
                currentTurn: game.currentTurn,
                players: game.players,
                status: game.status
            }
        });
    } catch (error) {
        logger.error('Error starting game:', error);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
};

// Make a move
exports.makeMove = (req, res) => {
    try {
        const { roomId, userId, position, isPowerMove } = req.body;

        // Validation
        if (!roomId || !userId || position === undefined) {
            return res.status(400).json({ 
                error: 'roomId, userId, and position are required' 
            });
        }

        if (position < 0 || position > 15) {
            return res.status(400).json({ 
                error: 'Position must be between 0 and 15' 
            });
        }

        // Get game
        const game = GameModel.findByRoomId(roomId);
        if (!game) {
            return res.status(404).json({ 
                error: 'Game not found' 
            });
        }

        // Check if game is finished
        if (game.status === 'finished') {
            return res.status(400).json({ 
                error: 'Game is already finished' 
            });
        }

        // Validate it's the player's turn
        if (game.currentTurn !== userId) {
            return res.status(400).json({ 
                error: 'Not your turn' 
            });
        }

        // Get player
        const player = game.players.find(p => p.userId === userId);
        if (!player) {
            return res.status(404).json({ 
                error: 'Player not found in game' 
            });
        }

        // Handle power move
        if (isPowerMove) {
            if (player.powerMoveUsed) {
                return res.status(400).json({ 
                    error: 'Power move already used' 
                });
            }
            
            // Power move: flip opponent's piece
            if (game.board[position] === null || game.board[position] === player.color) {
                return res.status(400).json({ 
                    error: 'Power move must flip an opponent piece' 
                });
            }

            game.board[position] = player.color;
            player.powerMoveUsed = true;
            game.moves.push({
                userId,
                position,
                color: player.color,
                isPowerMove: true,
                timestamp: new Date().toISOString()
            });

            logger.info(`Player ${userId} used power move at position ${position}`);
        } else {
            // Regular move: place piece on empty cell
            if (game.board[position] !== null) {
                return res.status(400).json({ 
                    error: 'Position already occupied' 
                });
            }

            game.board[position] = player.color;
            game.moves.push({
                userId,
                position,
                color: player.color,
                isPowerMove: false,
                timestamp: new Date().toISOString()
            });

            logger.info(`Player ${userId} placed piece at position ${position}`);
        }

        // Check for winner
        const winner = winChecker.checkWinner(game.board);
        if (winner) {
            game.status = 'finished';
            game.winner = game.players.find(p => p.color === winner).userId;
            game.finishedAt = new Date().toISOString();
            
            logger.info(`Game finished! Winner: ${game.winner}`);
            
            return res.json({
                success: true,
                gameOver: true,
                winner: game.winner,
                winnerColor: winner,
                board: game.board,
                game: {
                    gameId: game.gameId,
                    status: game.status,
                    winner: game.winner
                }
            });
        }

        // Check for draw (all cells filled)
        if (game.board.every(cell => cell !== null)) {
            game.status = 'finished';
            game.finishedAt = new Date().toISOString();
            
            logger.info('Game finished in a draw');
            
            return res.json({
                success: true,
                gameOver: true,
                draw: true,
                board: game.board,
                game: {
                    gameId: game.gameId,
                    status: game.status
                }
            });
        }

        // Switch turn
        const nextPlayer = game.players.find(p => p.userId !== userId);
        game.currentTurn = nextPlayer.userId;

        res.json({
            success: true,
            gameOver: false,
            board: game.board,
            currentTurn: game.currentTurn,
            nextPlayer: nextPlayer.username,
            powerMoveUsed: player.powerMoveUsed
        });
    } catch (error) {
        logger.error('Error making move:', error);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
};

// Get game state
exports.getGameState = (req, res) => {
    try {
        const { roomId } = req.params;
        const game = GameModel.findByRoomId(roomId);

        if (!game) {
            return res.status(404).json({ 
                error: 'Game not found' 
            });
        }

        res.json({
            success: true,
            game: {
                gameId: game.gameId,
                roomId: game.roomId,
                board: game.board,
                currentTurn: game.currentTurn,
                status: game.status,
                players: game.players.map(p => ({
                    userId: p.userId,
                    username: p.username,
                    color: p.color,
                    powerMoveUsed: p.powerMoveUsed
                })),
                moveCount: game.moves.length,
                winner: game.winner,
                createdAt: game.createdAt,
                finishedAt: game.finishedAt
            }
        });
    } catch (error) {
        logger.error('Error getting game state:', error);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
};

// Validate move without executing
exports.validateMove = (req, res) => {
    try {
        const { roomId, userId, position, isPowerMove } = req.body;

        const game = GameModel.findByRoomId(roomId);
        if (!game) {
            return res.status(404).json({ 
                valid: false, 
                error: 'Game not found' 
            });
        }

        if (game.currentTurn !== userId) {
            return res.json({ 
                valid: false, 
                reason: 'Not your turn' 
            });
        }

        const player = game.players.find(p => p.userId === userId);
        
        if (isPowerMove) {
            if (player.powerMoveUsed) {
                return res.json({ 
                    valid: false, 
                    reason: 'Power move already used' 
                });
            }
            if (game.board[position] === null || game.board[position] === player.color) {
                return res.json({ 
                    valid: false, 
                    reason: 'Power move must flip opponent piece' 
                });
            }
        } else {
            if (game.board[position] !== null) {
                return res.json({ 
                    valid: false, 
                    reason: 'Position occupied' 
                });
            }
        }

        res.json({ 
            valid: true 
        });
    } catch (error) {
        logger.error('Error validating move:', error);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
};

// Get all games (for debugging)
exports.getAllGames = (req, res) => {
    try {
        const games = GameModel.getAllGames();
        res.json({
            success: true,
            count: games.length,
            games: games.map(g => ({
                gameId: g.gameId,
                roomId: g.roomId,
                status: g.status,
                moveCount: g.moves.length,
                currentTurn: g.currentTurn,
                winner: g.winner
            }))
        });
    } catch (error) {
        logger.error('Error getting all games:', error);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
};