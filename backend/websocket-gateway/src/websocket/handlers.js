const httpClient = require("../utils/httpClient");
const logger = require("../utils/logger");

class MessageHandler {
  static sendError(ws, error) {
    ws.send(
      JSON.stringify({
        type: "ERROR",
        payload: { error },
      })
    );
  }

  static sendSuccess(ws, type, payload) {
    ws.send(JSON.stringify({ type, payload }));
  }

  static async handleMessage(ws, data, clients, wss) {
    const { type, payload } = data;
    const clientInfo = clients.get(ws);

    switch (type) {
      case "REGISTER_USER":
        await this.handleRegisterUser(ws, payload, clientInfo);
        break;

      case "CREATE_ROOM":
        await this.handleCreateRoom(ws, payload, clientInfo);
        break;

      case "JOIN_ROOM":
        await this.handleJoinRoom(ws, payload, clientInfo);
        break;

      case "START_GAME":
        await this.handleStartGame(ws, payload, clientInfo);
        break;

      case "MAKE_MOVE":
        await this.handleMakeMove(ws, payload, clientInfo);
        break;

      case "LEAVE_ROOM":
        await this.handleLeaveRoom(ws, payload, clientInfo);
        break;

      case "GET_GAME_STATE":
        await this.handleGetGameState(ws, payload, clientInfo);
        break;

      case "PING":
        this.handlePing(ws);
        break;

      default:
        logger.warn(`Unknown message type: ${type}`);
        ws.send(
          JSON.stringify({
            type: "ERROR",
            payload: { error: `Unknown message type: ${type}` },
          })
        );
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

        ws.send(
          JSON.stringify({
            type: "USER_REGISTERED",
            payload: {
              userId: result.user.userId,
              username: result.user.username,
            },
          })
        );
      } else {
        ws.send(
          JSON.stringify({
            type: "ERROR",
            payload: { error: result.error || "Registration failed" },
          })
        );
      }
    } catch (error) {
      logger.error("Error in handleRegisterUser:", error);
      ws.send(
        JSON.stringify({
          type: "ERROR",
          payload: { error: "Failed to register user" },
        })
      );
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

        logger.info(
          `Room created: ${result.room.roomId} by ${clientInfo.username}`
        );

        ws.send(
          JSON.stringify({
            type: "ROOM_CREATED",
            payload: {
              roomId: result.room.roomId,
              status: result.room.status,
            },
          })
        );
      } else {
        ws.send(
          JSON.stringify({
            type: "ERROR",
            payload: { error: result.error || "Failed to create room" },
          })
        );
      }
    } catch (error) {
      logger.error("Error in handleCreateRoom:", error);
      ws.send(
        JSON.stringify({
          type: "ERROR",
          payload: { error: "Failed to create room" },
        })
      );
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
        ws.send(
          JSON.stringify({
            type: "ROOM_JOINED",
            payload: {
              roomId: result.room.roomId,
              status: result.room.status,
              players: result.room.players,
              readyToStart: result.room.readyToStart,
            },
          })
        );

        // Notify other player in room
        global.broadcastToRoom(
          roomId,
          {
            type: "OPPONENT_JOINED",
            payload: {
              username: clientInfo.username,
              userId: clientInfo.userId,
            },
          },
          ws
        );
      } else {
        ws.send(
          JSON.stringify({
            type: "ERROR",
            payload: { error: result.error || "Failed to join room" },
          })
        );
      }
    } catch (error) {
      logger.error("Error in handleJoinRoom:", error);
      ws.send(
        JSON.stringify({
          type: "ERROR",
          payload: { error: "Failed to join room" },
        })
      );
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
          type: "GAME_STARTED",
          payload: {
            gameId: result.game.gameId,
            board: result.game.board,
            currentTurn: result.game.currentTurn,
            players: result.game.players,
          },
        });
      } else {
        ws.send(
          JSON.stringify({
            type: "ERROR",
            payload: { error: result.error || "Failed to start game" },
          })
        );
      }
    } catch (error) {
      logger.error("Error in handleStartGame:", error);
      ws.send(
        JSON.stringify({
          type: "ERROR",
          payload: { error: "Failed to start game" },
        })
      );
    }
  }

  // Make move
  static async handleMakeMove(ws, payload, clientInfo) {
    try {
      const { roomId, userId, position, isPowerMove } = payload;

      const result = await httpClient.makeMove(
        roomId,
        userId,
        position,
        isPowerMove
      );

      if (result.success) {
        logger.info(
          `Move made: ${userId} at position ${position}${
            isPowerMove ? " (power)" : ""
          }`
        );

        const movePayload = {
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
          draw: result.draw,
        };

        global.broadcastToRoom(roomId, {
          type: "MOVE_MADE",
          payload: movePayload,
        });

        if (result.gameOver) {
          global.broadcastToRoom(roomId, {
            type: "GAME_OVER",
            payload: {
              winner: result.winner,
              winnerColor: result.winnerColor,
              draw: result.draw,
              board: result.board,
            },
          });
        }
      } else {
        this.sendError(ws, result.error || "Invalid move");
      }
    } catch (error) {
      logger.error("Error in handleMakeMove:", error);
      this.sendError(ws, "Failed to make move");
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
        global.broadcastToRoom(
          roomId,
          {
            type: "PLAYER_LEFT",
            payload: {
              userId,
              username: clientInfo.username,
            },
          },
          ws
        );

        // Clear client room info
        clientInfo.roomId = null;

        ws.send(
          JSON.stringify({
            type: "LEFT_ROOM",
            payload: { success: true },
          })
        );
      } else {
        ws.send(
          JSON.stringify({
            type: "ERROR",
            payload: { error: result.error || "Failed to leave room" },
          })
        );
      }
    } catch (error) {
      logger.error("Error in handleLeaveRoom:", error);
      ws.send(
        JSON.stringify({
          type: "ERROR",
          payload: { error: "Failed to leave room" },
        })
      );
    }
  }

  // Get game state
  static async handleGetGameState(ws, payload, clientInfo) {
    try {
      const { roomId } = payload;

      const result = await httpClient.getGameState(roomId);

      if (result.success) {
        ws.send(
          JSON.stringify({
            type: "GAME_STATE",
            payload: result.game,
          })
        );
      } else {
        ws.send(
          JSON.stringify({
            type: "ERROR",
            payload: { error: result.error || "Failed to get game state" },
          })
        );
      }
    } catch (error) {
      logger.error("Error in handleGetGameState:", error);
      ws.send(
        JSON.stringify({
          type: "ERROR",
          payload: { error: "Failed to get game state" },
        })
      );
    }
  }

  // Handle ping (keep-alive)
  static handlePing(ws) {
    ws.send(
      JSON.stringify({
        type: "PONG",
        payload: { timestamp: new Date().toISOString() },
      })
    );
  }
}

module.exports = MessageHandler;
