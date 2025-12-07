let gameBoard = Array(16).fill(null);
// currentRoomId is defined in app.js
let myColor = null;
let currentTurn = null;
let powerMoveUsed = false;

function startGameUI(gameData) {
  gameBoard = gameData.board;
  currentTurn = gameData.currentTurn;

  // Find my color
  const myPlayer = gameData.players.find((p) => p.userId === currentUserId);
  myColor = myPlayer.color;
  powerMoveUsed = myPlayer.powerMoveUsed;

  // Show game container
  showPage("game");

  // Set up board
  createGameBoard();
  updateTurnIndicator();
  updatePlayerColorDisplay();
  updatePowerMoveStatus();

  showToast("Game started!", "success");
}

function createGameBoard() {
  const boardContainer = document.getElementById("game-board");
  boardContainer.innerHTML = "";

  for (let i = 0; i < 16; i++) {
    const cell = document.createElement("div");
    cell.className =
      "game-cell bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer flex items-center justify-center text-2xl font-bold transition-all";
    cell.dataset.position = i;
    cell.onclick = () => handleCellClick(i);

    boardContainer.appendChild(cell);
  }

  renderBoard();
}

function renderBoard() {
  const cells = document.querySelectorAll(".game-cell");

  cells.forEach((cell, index) => {
    const value = gameBoard[index];
    GameRenderer.renderCell(cell, index, value, true);
  });
}

function handleCellClick(position) {
  if (currentTurn !== currentUserId) {
    showToast("Not your turn!", "warning");
    return;
  }

  const btn = document.getElementById("power-move-btn");
  const isPowerMove = btn && btn.dataset.active === "true";

  // Validate move
  if (isPowerMove) {
    if (powerMoveUsed) {
      showToast("Power move already used!", "error");
      return;
    }
    if (gameBoard[position] === null || gameBoard[position] === myColor) {
      showToast("Power move must flip an opponent piece!", "error");
      return;
    }
  } else {
    if (gameBoard[position] !== null) {
      showToast("Cell already occupied!", "error");
      return;
    }
  }

  // Send move
  sendWebSocketMessage({
    type: "MAKE_MOVE",
    payload: {
      roomId: currentRoomId,
      userId: currentUserId,
      position,
      isPowerMove,
    },
  });
}

function updateGameBoard(moveData) {
  gameBoard = moveData.board;
  currentTurn = moveData.currentTurn;

  if (moveData.userId === currentUserId) {
    powerMoveUsed = moveData.powerMoveUsed || powerMoveUsed;
  }
  
  console.log("Updating board:", moveData.board);
  renderBoard();
  updateTurnIndicator();
  updatePowerMoveStatus();

  // Uncheck power move toggle
  // Reset power move toggle visual state
  const btn = document.getElementById("power-move-btn");
  if (btn) {
    btn.classList.remove("ring-4", "ring-white");
    btn.dataset.active = "false";
  }

  const mover = moveData.userId === currentUserId ? "You" : moveData.username;
  const action = moveData.isPowerMove ? "used power move" : "moved";
  showToast(`${mover} ${action} at position ${moveData.position}`, "info");
}

function updateTurnIndicator() {
  const statusText = document.getElementById("game-status-text");
  const banner = document.getElementById("game-status-banner");
  
  if (currentTurn === currentUserId) {
    statusText.textContent = "🎮 Your Turn!";
    banner.className = "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-2xl p-4 mb-6 flex items-center justify-center shadow-lg transition-colors";
  } else {
    statusText.textContent = "⏳ Opponent's Turn";
    banner.className = "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-2xl p-4 mb-6 flex items-center justify-center shadow-lg transition-colors";
  }
}

function updatePlayerColorDisplay() {
  const redCard = document.getElementById("player-red-card");
  const blueCard = document.getElementById("player-blue-card");
  
  // Reset opacity
  if (redCard) redCard.style.opacity = "0.5";
  if (blueCard) blueCard.style.opacity = "0.5";

  // Highlight my card
  if (myColor === "red" && redCard) {
    redCard.style.opacity = "1";
    redCard.classList.add("ring-2", "ring-white");
  } else if (myColor === "blue" && blueCard) {
    blueCard.style.opacity = "1";
    blueCard.classList.add("ring-2", "ring-white");
  }
}

function updatePowerMoveStatus() {
  const btn = document.getElementById("power-move-btn");
  if (!btn) return;

  btn.classList.remove("hidden");

  if (powerMoveUsed) {
    btn.disabled = true;
    btn.classList.add("opacity-50", "cursor-not-allowed", "grayscale");
    btn.innerHTML = '<span class="material-icons mr-3 text-2xl">flash_off</span><span>Power Move Used</span>';
  } else {
    btn.disabled = false;
    btn.classList.remove("opacity-50", "cursor-not-allowed", "grayscale");
    btn.innerHTML = '<span class="material-icons mr-3 text-2xl">flash_on</span><span>Use Power Move</span>';
    
    // Add click handler if not already present (simplified here)
    btn.onclick = togglePowerMove;
  }
}

function togglePowerMove() {
  const btn = document.getElementById("power-move-btn");
  const isActive = btn.classList.contains("ring-4");
  
  if (isActive) {
    btn.classList.remove("ring-4", "ring-white");
    btn.dataset.active = "false";
  } else {
    btn.classList.add("ring-4", "ring-white");
    btn.dataset.active = "true";
  }
}

function handleGameOver(gameOverData) {
  const winner = gameOverData.winner;
  const isDraw = gameOverData.draw;
  
  const dialog = document.getElementById("game-over-dialog");
  const title = document.getElementById("game-over-title");
  const messageEl = document.getElementById("game-over-message");
  const icon = document.getElementById("game-over-icon");

  if (isDraw) {
    title.textContent = "It's a Draw!";
    messageEl.textContent = "Well played both!";
    icon.textContent = "handshake";
    icon.className = "material-icons text-6xl text-gray-500 mb-4 animate-bounce";
  } else if (winner === currentUserId) {
    title.textContent = "You Win!";
    messageEl.textContent = "Congratulations! You dominated the board.";
    icon.textContent = "emoji_events";
    icon.className = "material-icons text-6xl text-yellow-500 mb-4 animate-bounce";
    showToast("You Win!", "success");
  } else {
    title.textContent = "Game Over";
    messageEl.textContent = "Better luck next time!";
    icon.textContent = "sentiment_very_dissatisfied";
    icon.className = "material-icons text-6xl text-blue-500 mb-4 animate-bounce";
    showToast("You Lost!", "info");
  }

  setTimeout(() => {
     dialog.classList.remove("hidden");
  }, 1000);
}

// Game Control
function startGame() {
  if (!currentRoomId) return;
  
  // Disable button to prevent double-clicks
  const btn = document.querySelector("#start-game-section button");
  if (btn) btn.disabled = true;

  sendWebSocketMessage({
    type: "START_GAME",
    payload: { roomId: currentRoomId },
  });
}

// Reset Game State
function resetGame() {
  gameBoard = Array(16).fill(null);
  currentRoomId = null;
  myColor = null;
  currentTurn = null;
  powerMoveUsed = false;

  document.getElementById("room-info").classList.add("hidden");
  document.getElementById("waiting-opponent").classList.add("hidden");
}

// Navigation Handlers

// Navigation Handlers
window.onPlayAgain = function() {
  document.getElementById("game-over-dialog").classList.add("hidden");
  leaveGame();
  showPage("play");
}

window.onGoHome = function() {
  document.getElementById("game-over-dialog").classList.add("hidden");
  leaveGame();
  showPage("landing");
}

