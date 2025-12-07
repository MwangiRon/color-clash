const express = require("express");
const cors = require("cors");
require("dotenv").config();

const gameRoutes = require("./routes/gameRoutes");
const logger = require("./utils/logger");

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/game", gameRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "game-engine-service",
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Game Engine Service running on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});
