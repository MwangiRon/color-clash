const express = require('express');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'user-service',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    logger.info(`✅ User Service running on port ${PORT}`);
    logger.info(`📡 Health check: http://localhost:${PORT}/health`);
});
