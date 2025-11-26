const WebSocket = require("ws");
const http = require("http");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const messageHandler = require("./websocket/handlers");
const logger = require("./utils/logger");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "websocket-gateway",
    connections: wss.clients.size,
    timestamp: new Date().toISOString(),
  });
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients with metadata
const clients = new Map();

// WebSocket connection handler
wss.on("connection", (ws, req) => {
  const clientId = generateClientId();

  // Store client
  clients.set(ws, {
    id: clientId,
    userId: null,
    roomId: null,
    connectedAt: new Date().toISOString(),
  });

  logger.info(`Client connected: ${clientId}`);

  // Handle incoming messages
  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);
      await messageHandler.handleMessage(ws, data, clients, wss);
    } catch (error) {
      logger.error("Error handling message:", error);
      ws.send(
        JSON.stringify({
          type: "ERROR",
          payload: { error: "Invalid message format" },
        })
      );
    }
  });

  // Handle client disconnect
  ws.on("close", () => {
    const clientInfo = clients.get(ws);
    logger.info(`Client disconnected: ${clientInfo.id}`);

    // Clean up
    clients.delete(ws);
  });

  // Handle errors
  ws.on("error", (error) => {
    logger.error("WebSocket error:", error);
  });
});

// Broadcast to all clients in a room
global.broadcastToRoom = (roomId, message) => {
  clients.forEach((clientInfo, clientWs) => {
    if (
      clientInfo.roomId === roomId &&
      clientWs.readyState === WebSocket.OPEN
    ) {
      clientWs.send(JSON.stringify(message));
    }
  });
};

// Generate unique client ID
function generateClientId() {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Start server
server.listen(PORT, () => {
  logger.info(`WebSocket Gateway running on port ${PORT}`);
  logger.info(`WebSocket endpoint: ws://localhost:${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});
