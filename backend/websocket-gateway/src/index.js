const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const messageHandler = require('./websocket/handlers');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'websocket-gateway',
        connections: wss.clients.size,
        timestamp: new Date().toISOString()
    });
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients with metadata
const clients = new Map();

// WebSocket connection handler
wss.on('connection', (ws, req) => {
    const clientId = generateClientId();
    
    // Store client
    clients.set(ws, {
        id: clientId,
        userId: null,
        roomId: null,
        username: null,
        connectedAt: new Date().toISOString()
    });

    logger.info(`✅ New client connected: ${clientId} (Total: ${wss.clients.size})`);

    // Send welcome message
    ws.send(JSON.stringify({
        type: 'CONNECTED',
        payload: {
            clientId,
            message: 'Connected to Color Clash WebSocket Gateway'
        }
    }));

    // Handle incoming messages
    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message.toString());
            logger.info(`📨 Received from ${clientId}:`, data.type);
            
            // Handle message with context
            await messageHandler.handleMessage(ws, data, clients, wss);
        } catch (error) {
            logger.error('Error handling message:', error);
            ws.send(JSON.stringify({
                type: 'ERROR',
                payload: {
                    error: 'Invalid message format or processing error',
                    message: error.message
                }
            }));
        }
    });

    // Handle client disconnect
    ws.on('close', () => {
        const clientInfo = clients.get(ws);
        logger.warn(`❌ Client disconnected: ${clientInfo.id}`);
        
        // Notify room if user was in a game
        if (clientInfo.roomId) {
            broadcastToRoom(clientInfo.roomId, {
                type: 'PLAYER_DISCONNECTED',
                payload: {
                    userId: clientInfo.userId,
                    username: clientInfo.username
                }
            }, ws);
        }
        
        clients.delete(ws);
    });

    // Handle errors
    ws.on('error', (error) => {
        logger.error(`WebSocket error for ${clientId}:`, error);
    });
});

// Broadcast to all clients in a room
function broadcastToRoom(roomId, message, excludeWs = null) {
    let count = 0;
    clients.forEach((clientInfo, clientWs) => {
        if (clientInfo.roomId === roomId && clientWs !== excludeWs) {
            if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify(message));
                count++;
            }
        }
    });
    logger.info(`📡 Broadcast to room ${roomId}: ${message.type} (${count} clients)`);
}

// Broadcast to all clients
function broadcastToAll(message, excludeWs = null) {
    wss.clients.forEach((client) => {
        if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

// Generate unique client ID
function generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Make broadcast functions available to handlers
global.broadcastToRoom = broadcastToRoom;
global.broadcastToAll = broadcastToAll;

// Start server
server.listen(PORT, () => {
    logger.info(`✅ WebSocket Gateway running on port ${PORT}`);
    logger.info(`🔌 WebSocket endpoint: ws://localhost:${PORT}`);
    logger.info(`📡 HTTP endpoint: http://localhost:${PORT}`);
});
