const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// start  new game
router.post('/start', gameController.startGame);

// player makes a move
router.post('/move', gameController.makeMove);

// get game state
router.get('/:roomId/state', gameController.getGameState);

// validate move without making it
router.post('/validate-move', gameController.validateMove);

// get all active games (for admin/debugging)
router.get('/', gameController.getAllGames);

module.exports = router;