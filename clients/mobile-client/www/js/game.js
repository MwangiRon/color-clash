let gameBoard = Array(16).fill(null);
let currentRoomId = null;
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
  document.getElementById("multiplayer-options").classList.add("hidden");
  document.getElementById("game-container").classList.remove("hidden");

  // Set up board
  createGameBoard();
  updateTurnIndicator();
  updatePlayerColorDisplay();
  updatePowerMoveStatus();

  showToast("Game started!", "success");
}

function createGameBoard() {
  const boardContainer = document.querySelector("#game-container .grid");
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
    GameRenderer.renderCell(cell, index, value, false);
  });
}

function handleCellClick(position) {
  if (currentTurn !== currentUserId) {
    showToast("Not your turn!", "warning");
    return;
  }

  const isPowerMove = document.getElementById("power-move-toggle").checked;

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

  renderBoard();
  updateTurnIndicator();
  updatePowerMoveStatus();

  // Uncheck power move toggle
  document.getElementById("power-move-toggle").checked = false;

  const mover = moveData.userId === currentUserId ? "You" : moveData.username;
  const action = moveData.isPowerMove ? "used power move" : "moved";
  showToast(`${mover} ${action} at position ${moveData.position}`, "info");
}

function updateTurnIndicator() {
  const indicator = document.getElementById("turn-indicator");
  if (currentTurn === currentUserId) {
    indicator.innerHTML =
      '<span class="material-icons text-sm mr-1">sports_esports</span> Your Turn!';
    indicator.className =
      "text-green-600 dark:text-green-400 mt-1 font-semibold flex items-center";
  } else {
    indicator.innerHTML =
      '<span class="material-icons text-sm mr-1">hourglass_empty</span> Opponent\'s Turn';
    indicator.className =
      "text-gray-600 dark:text-gray-400 mt-1 flex items-center";
  }
}

function updatePlayerColorDisplay() {
  const display = document.getElementById("player-color-display");
  if (myColor === "red") {
    display.innerHTML =
      '<span class="text-red-500 flex items-center"><span class="material-icons mr-1">circle</span> Red</span>';
  } else {
    display.innerHTML =
      '<span class="text-blue-500 flex items-center"><span class="material-icons mr-1">circle</span> Blue</span>';
  }
}

function updatePowerMoveStatus() {
  const status = document.getElementById("power-move-status");
  const toggle = document.getElementById("power-move-toggle");

  if (powerMoveUsed) {
    status.className = "mb-4 p-3 bg-gray-200 dark:bg-gray-700 rounded-lg";
    status.innerHTML =
      '<span class="text-gray-600 dark:text-gray-400 flex items-center"><span class="material-icons mr-2">flash_off</span> Power Move Used</span>';
    toggle.disabled = true;
    toggle.checked = false;
  } else {
    status.className = "mb-4 p-3 bg-purple-100 dark:bg-purple-900 rounded-lg";
    toggle.disabled = false;
  }
}

function handleGameOver(gameOverData) {
  const winner = gameOverData.winner;
  const isDraw = gameOverData.draw;

  let message = "";
  let type = "info";

  if (isDraw) {
    message = "🤝 Game ended in a draw!";
    type = "info";
  } else if (winner === currentUserId) {
    message = "🎉 You Win!";
    type = "success";
  } else {
    message = "😢 You Lose!";
    type = "error";
  }

  showToast(message, type);

  setTimeout(() => {
    if (confirm("Game Over! Play again?")) {
      leaveGame();
    }
  }, 2000);
}

function resetGame() {
  gameBoard = Array(16).fill(null);
  currentRoomId = null;
  myColor = null;
  currentTurn = null;
  powerMoveUsed = false;

  document.getElementById("room-info").classList.add("hidden");
  document.getElementById("waiting-opponent").classList.add("hidden");
}
