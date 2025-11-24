const httpClient = require('../utils/httpClient');
const logger = require('../utils/logger');

class MessageHandler {
    static async handleMessage(ws, data, clients, wss) {
        const { type, payload } = data;
        const clientInfo = clients.get(ws);

        switch (type) {
            case 'REGISTER_USER':
                await this.handleRegisterUser(ws, payload, clientInfo);
                break;

            case 'CREATE_ROOM':
                await this.handleCreateRoom(ws, payload, clientInfo);
                break;

            case 'JOIN_ROOM':
                await this.handleJoinRoom(ws, payload, clientInfo);
                break;

            case 'START_GAME':
                await this.handleStartGame(ws, payload, clientInfo);
                break;

            case 'MAKE_MOVE':
                await this.handleMakeMove(ws, payload, clientInfo);
                break;

            case 'LEAVE_ROOM':
                await this.handleLeaveRoom(ws, payload, clientInfo);
                break;

            case 'GET_GAME_STATE':
                await this.handleGetGameState(ws, payload, clientInfo);
                break;

            case 'PING':
                this.handlePing(ws);
                break;

            default:
                logger.warn(`Unknown message type: ${type}`);
                ws.send(JSON.stringify({
                    type: 'ERROR',
                    payload: { error: `Unknown message type: ${type}` }
                }));
        }
    }

    // Register user
    static async handleRegisterUser(ws, payload, clientInfo) {
        try {
            const { username } = payload;
            
            const result = await httpClient.registerUser(username);
            
            if (result.success) {
                // Update client info
                clientInfo.userId = result.user.userId;
                clientInfo.username = result.user.username;
                
                logger.info(`User registered: ${username} (${result.user.userId})`);
                
                ws.send(JSON.stringify({
                    type: 'USER_REGISTERED',
                    payload: {
                        userId: result.user.userId,
                        username: result.user.username
                    }
                }));
            } else {
                ws.send(JSON.stringify({
                    type: 'ERROR',
                    payload: { error: result.error || 'Registration failed' }
                }));
            }
        } catch (error) {
            logger.error('Error in handleRegisterUser:', error);
            ws.send(JSON.stringify({
                type: 'ERROR',
                payload: { error: 'Failed to register user' }
            }));
        }
    }

    // Create room
    static async handleCreateRoom(ws, payload, clientInfo) {
        try {
            const { userId } = payload;
            
            const result = await httpClient.createRoom(userId);
            
            if (result.success) {
                // Update client info
                clientInfo.roomId = result.room.roomId;
                
                logger.info(`Room created: ${result.room.roomId} by ${clientInfo.username}`);
                
                ws.send(JSON.stringify({
                    type: 'ROOM_CREATED',
                    payload: {
                        roomId: result.room.roomId,
                        status: result.room.status
                    }
                }));
            } else {
                ws.send(JSON.stringify({
                    type: 'ERROR',
                    payload: { error: result.error || 'Failed to create room' }
                }));
            }
        } catch (error) {
            logger.error('Error in handleCreateRoom:', error);
            ws.send(JSON.stringify({
                type: 'ERROR',
                payload: { error: 'Failed to create room' }
            }));
        }
    }

    // Join room
    static async handleJoinRoom(ws, payload, clientInfo) {
        try {
            const { roomId, userId } = payload;
            
            const result = await httpClient.joinRoom(roomId, userId);
            
            if (result.success) {
                // Update client info
                clientInfo.roomId = roomId;
                
                logger.info(`User ${clientInfo.username} joined room ${roomId}`);
                
                // Send confirmation to joining player
                ws.send(JSON.stringify({
                    type: 'ROOM_JOINED',
                    payload: {
                        roomId: result.room.roomId,
                        status: result.room.status,
                        players: result.room.players,
                        readyToStart: result.room.readyToStart
                    }
                }));

                // Notify other player in room
                global.broadcastToRoom(roomId, {
                    type: 'OPPONENT_JOINED',
                    payload: {
                        username: clientInfo.username,
                        userId: clientInfo.userId
                    }
                }, ws);
            } else {
                ws.send(JSON.stringify({
                    type: 'ERROR',
                    payload: { error: result.error || 'Failed to join room' }
                }));
            }
        } catch (error) {
            logger.error('Error in handleJoinRoom:', error);
            ws.send(JSON.stringify({
                type: 'ERROR',
                payload: { error: 'Failed to join room' }
            }));
        }
    }

    // Start game
    static async handleStartGame(ws, payload, clientInfo) {
        try {
            const { roomId } = payload;
            
            const result = await httpClient.startGame(roomId);
            
            if (result.success) {
                logger.info(`Game started for room ${roomId}`);
                
                // Notify all players in room
                global.broadcastToRoom(roomId, {
                    type: 'GAME_STARTED',
                    payload: {
                        gameId: result.game.gameId,
                        board: result.game.board,
                        currentTurn: result.game.currentTurn,
                        players: result.game.players
                    }
                });
            } else {
                ws.send(JSON.stringify({
                    type: 'ERROR',
                    payload: { error: result.error || 'Failed to start game' }
                }));
            }
        } catch (error) {
            logger.error('Error in handleStartGame:', error);
            ws.send(JSON.stringify({
                type: 'ERROR',
                payload: { error: 'Failed to start game' }
            }));
        }
    }

    // Make move
    static async handleMakeMove(ws, payload, clientInfo) {
        try {
            const { roomId, userId, position, isPowerMove } = payload;
            
            const result = await httpClient.makeMove(roomId, userId, position, isPowerMove);
            
            if (result.success) {
                logger.info(`Move made: ${userId} at position ${position}`);
                
                // Broadcast move to all players in room
                global.broadcastToRoom(roomId, {
                    type: 'MOVE_MADE',
                    payload: {
                        userId,
                        username: clientInfo.username,
                        position,
                        isPowerMove,
                        board: result.board,
                        currentTurn: result.currentTurn,
                        nextPlayer: result.nextPlayer,
                        gameOver: result.gameOver,
                        winner: result.winner,
                        winnerColor: result.winnerColor,
                        draw: result.draw
                    }
                });

                // If game is over, notify about game end
                if (result.gameOver) {
                    global.broadcastToRoom(roomId, {
                        type: 'GAME_OVER',
                        payload: {
                            winner: result.winner,
                            winnerColor: result.winnerColor,
                            draw: result.draw,
                            board: result.board
                        }
                    });
                }
            } else {
                ws.send(JSON.stringify({
                    type: 'ERROR',
                    payload: { error: result.error || 'Invalid move' }
                }));
            }
        } catch (error) {
            logger.error('Error in handleMakeMove:', error);
            ws.send(JSON.stringify({
                type: 'ERROR',
                payload: { error: 'Failed to make move' }
            }));
        }
    }

    // Leave room
    static async handleLeaveRoom(ws, payload, clientInfo) {
        try {
            const { roomId, userId } = payload;
            
            const result = await httpClient.leaveRoom(roomId, userId);
            
            if (result.success) {
                logger.info(`User ${userId} left room ${roomId}`);
                
                // Notify other players
                global.broadcastToRoom(roomId, {
                    type: 'PLAYER_LEFT',
                    payload: {
                        userId,
                        username: clientInfo.username
                    }
                }, ws);

                // Clear client room info
                clientInfo.roomId = null;
                
                ws.send(JSON.stringify({
                    type: 'LEFT_ROOM',
                    payload: { success: true }
                }));
            } else {
                ws.send(JSON.stringify({
                    type: 'ERROR',
                    payload: { error: result.error || 'Failed to leave room' }
                }));
            }
        } catch (error) {
            logger.error('Error in handleLeaveRoom:', error);
            ws.send(JSON.stringify({
                type: 'ERROR',
                payload: { error: 'Failed to leave room' }
            }));
        }
    }

    // Get game state
    static async handleGetGameState(ws, payload, clientInfo) {
        try {
            const { roomId } = payload;
            
            const result = await httpClient.getGameState(roomId);
            
            if (result.success) {
                ws.send(JSON.stringify({
                    type: 'GAME_STATE',
                    payload: result.game
                }));
            } else {
                ws.send(JSON.stringify({
                    type: 'ERROR',
                    payload: { error: result.error || 'Failed to get game state' }
                }));
            }
        } catch (error) {
            logger.error('Error in handleGetGameState:', error);
            ws.send(JSON.stringify({
                type: 'ERROR',
                payload: { error: 'Failed to get game state' }
            }));
        }
    }

    // Handle ping (keep-alive)
    static handlePing(ws) {
        ws.send(JSON.stringify({
            type: 'PONG',
            payload: { timestamp: new Date().toISOString() }
        }));
    }
}

module.exports = MessageHandler;


// ============================================
// FILE: backend/websocket-gateway/src/utils/httpClient.js
// ============================================

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