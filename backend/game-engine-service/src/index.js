const express = require('express');
const cors = require('cors');
require('dotenv').config();

const gameRoutes = require('./routes/gameRoutes');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3003;

// middle wares
app.use(cors());
app.use(express.json());

// init routes
app.use('/game', gameRoutes);

// health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'game-engine-service',
        timestamp: new Date().toISOString()
    });
});

// starting the server
app.listen(PORT, () => {
    logger.info(`✅ Game Engine Service running on port ${PORT}`);
    logger.info(`📡 Health check: http://localhost:${PORT}/health`);
});