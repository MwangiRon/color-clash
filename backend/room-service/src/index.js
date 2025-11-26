const express = require("express");
const cors = require("cors");
require("dotenv").config();

const roomRoutes = require("./routes/roomRoutes");
const logger = require("./utils/logger");

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/rooms", roomRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "room-service",
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Room Service running on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});
