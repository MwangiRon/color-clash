// Global State
let isLoggedIn = false;
let currentUser = null;
let currentUserId = null;
let currentPage = "home";
let darkMode = localStorage.getItem("darkMode") === "true";

// Practice Mode State
let practiceBoard = null;
let currentPlayer = 'red';
let gameOver = false;
let gameMode = null;

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  // Apply saved dark mode preference
  if (darkMode) {
    document.documentElement.classList.add("dark");
    updateThemeIcons();
  }

  // Check if user was logged in
  const savedUser = localStorage.getItem("username");
  const savedUserId = localStorage.getItem("userId");

  if (savedUser && savedUserId) {
    currentUser = savedUser;
    currentUserId = savedUserId;
    isLoggedIn = true;
  }

  updateAuthUI();
  showPage("landing");
});

// Page Navigation
function showPage(pageName) {
  // Hide all pages
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.add("hidden");
  });

  // Show selected page
  const page = document.getElementById(`${pageName}-page`);
  if (page) {
    page.classList.remove("hidden");
    currentPage = pageName;
  }

  // Close mobile menu
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileMenu) {
    mobileMenu.classList.add("hidden");
  }
}

// Dark Mode Toggle
function toggleDarkMode() {
  darkMode = !darkMode;
  if (darkMode) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  localStorage.setItem("darkMode", darkMode);
  updateThemeIcons();
}

function updateThemeIcons() {
  const icon = darkMode ? "☀️" : "🌙";
  const themeIcon = document.getElementById("theme-icon");
  const themeIconMobile = document.getElementById("theme-icon-mobile");
  
  if (themeIcon) themeIcon.textContent = icon;
  if (themeIconMobile) themeIconMobile.textContent = icon;
}

// Mobile Menu Toggle
function toggleMobileMenu() {
  const menu = document.getElementById("mobile-menu");
  if (menu) {
    menu.classList.toggle("hidden");
  }
}

// Authentication
function handleAuth(event) {
  event.preventDefault();
  const usernameInput = document.getElementById("username-input");
  const username = usernameInput ? usernameInput.value : "";

  if (!username || username.length < 3) {
    showToast("Username must be at least 3 characters", "error");
    return;
  }

  // Connect to WebSocket and register
  connectWebSocket(() => {
    sendWebSocketMessage({
      type: "REGISTER_USER",
      payload: { username },
    });
  });
}

// Callback for successful user registration
function onUserRegistered(data) {
  const { userId, username } = data;

  // Update global state
  currentUser = username;
  currentUserId = userId;
  isLoggedIn = true;

  // Save to localStorage
  localStorage.setItem("username", username);
  localStorage.setItem("userId", userId);

  // Update UI
  updateAuthUI();

  // Navigate to play page
  showPage("play");

  // Show success message
  showToast(`Welcome, ${username}!`, "success");
}

function logout() {
  isLoggedIn = false;
  currentUser = null;
  currentUserId = null;
  localStorage.removeItem("username");
  localStorage.removeItem("userId");

  updateAuthUI();
  disconnectWebSocket();
  showToast("Logged out successfully", "success");
  showPage("landing");
}

function updateAuthUI() {
  const currentUser = localStorage.getItem("username");
  const authSection = document.getElementById("auth-section-nav");
  const loggedInSection = document.getElementById("logged-in-section");
  const mobileAuthSection = document.getElementById("mobile-auth-section");
  const mobileLoggedIn = document.getElementById("mobile-logged-in");
  const navUsername = document.getElementById("nav-username");
  const userDisplay = document.getElementById("user-display");

  if (currentUser) {
    // Show logged in state
    if (authSection) authSection.classList.add("hidden");
    if (loggedInSection) {
      loggedInSection.classList.remove("hidden");
      loggedInSection.classList.add("flex");
    }
    if (mobileAuthSection) mobileAuthSection.classList.add("hidden");
    if (mobileLoggedIn) mobileLoggedIn.classList.remove("hidden");

    if (navUsername) navUsername.textContent = currentUser;
    if (userDisplay) {
      const span = userDisplay.querySelector("span:last-child");
      if (span) span.textContent = currentUser;
    }
  } else {
    // Show guest state
    if (authSection) authSection.classList.remove("hidden");
    if (loggedInSection) {
      loggedInSection.classList.add("hidden");
      loggedInSection.classList.remove("flex");
    }
    if (mobileAuthSection) mobileAuthSection.classList.remove("hidden");
    if (mobileLoggedIn) mobileLoggedIn.classList.add("hidden");
  }
}

// Navigate to multiplayer - check auth first
function goToMultiplayer() {
  const currentUser = localStorage.getItem("username");

  if (currentUser) {
    // User is already authenticated, go to play lobby
    showPage("play");
    // Update user display
    const userDisplaySpan = document.querySelector(
      "#user-display span:last-child"
    );
    if (userDisplaySpan) {
      userDisplaySpan.textContent = currentUser;
    }
  } else {
    // User needs to login first
    showPage("auth");
    showToast("Please login to play online", "info");
  }
}

// Practice Mode
function startPracticeMode() {
  console.log("Starting practice mode...");
  
  // Set up practice game state
  gameMode = 'practice';
  isLoggedIn = false;
  currentUser = 'Practice Player';
  currentUserId = 'practice_' + Date.now();
  
  // Show game page
  showPage("game");
  
  // Initialize practice game
  initializePracticeGame();
  
  // Update UI for practice mode
  const gameRoomId = document.getElementById('game-room-id');
  const redPlayerName = document.getElementById('red-player-name');
  const bluePlayerName = document.getElementById('blue-player-name');
  const gameStatusText = document.getElementById('game-status-text');
  
  if (gameRoomId) gameRoomId.textContent = 'PRACTICE MODE';
  if (redPlayerName) redPlayerName.textContent = 'You (Red)';
  if (bluePlayerName) bluePlayerName.textContent = 'AI (Blue)';
  if (gameStatusText) gameStatusText.textContent = 'Your turn! Place a red piece.';
  
  // Hide power move button for practice
  const powerMoveBtn = document.getElementById('power-move-btn');
  if (powerMoveBtn) powerMoveBtn.classList.add('hidden');
  
  showToast('Practice mode started! Play against AI.', 'success');
}

function initializePracticeGame() {
  // Clear any existing board
  const board = document.getElementById('game-board');
  if (!board) return;
  
  board.innerHTML = '';
  
  // Create 4x4 game board
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const cell = document.createElement('div');
      cell.className = 'game-cell bg-gray-200 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition';
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.dataset.position = `${row},${col}`;
      
      cell.addEventListener('click', function() {
        if (gameMode === 'practice' && !gameOver) {
          handlePracticeMove(parseInt(this.dataset.row), parseInt(this.dataset.col));
        }
      });
      
      board.appendChild(cell);
    }
  }
  
  // Initialize practice game state
  practiceBoard = Array(4).fill().map(() => Array(4).fill(null));
  currentPlayer = 'red';
  gameOver = false;
  
  // Update power move indicators
  const redPowerIndicator = document.getElementById('red-power-indicator');
  const bluePowerIndicator = document.getElementById('blue-power-indicator');
  
  if (redPowerIndicator) redPowerIndicator.style.opacity = '1';
  if (bluePowerIndicator) bluePowerIndicator.style.opacity = '0.3';
}

function handlePracticeMove(row, col) {
  if (gameOver || practiceBoard[row][col] !== null) return;
  
  const cell = document.querySelector(`.game-cell[data-row="${row}"][data-col="${col}"]`);
  if (!cell) return;
  
  // Place piece
  if (currentPlayer === 'red') {
    cell.classList.add('red-piece', 'occupied');
    practiceBoard[row][col] = 'red';
    
    // Check for win
    if (checkPracticeWin('red')) {
      const gameStatusText = document.getElementById('game-status-text');
      if (gameStatusText) gameStatusText.textContent = 'You win!';
      gameOver = true;
      showToast('Congratulations! You won!', 'success');
      return;
    }
    
    // Check for draw
    if (isPracticeBoardFull()) {
      const gameStatusText = document.getElementById('game-status-text');
      if (gameStatusText) gameStatusText.textContent = "It's a draw!";
      gameOver = true;
      showToast("Game ended in a draw!", 'info');
      return;
    }
    
    // Switch to AI
    currentPlayer = 'blue';
    const gameStatusText = document.getElementById('game-status-text');
    if (gameStatusText) gameStatusText.textContent = "AI's turn...";
    
    const redPowerIndicator = document.getElementById('red-power-indicator');
    const bluePowerIndicator = document.getElementById('blue-power-indicator');
    if (redPowerIndicator) redPowerIndicator.style.opacity = '0.3';
    if (bluePowerIndicator) bluePowerIndicator.style.opacity = '1';
    
    // AI move after delay
    setTimeout(makeAIMove, 1000);
  }
}

function makeAIMove() {
  if (gameOver) return;
  
  // Simple AI: find first empty cell
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (practiceBoard[row][col] === null) {
        const cell = document.querySelector(`.game-cell[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
          cell.classList.add('blue-piece', 'occupied');
          practiceBoard[row][col] = 'blue';
          
          // Check for win
          if (checkPracticeWin('blue')) {
            const gameStatusText = document.getElementById('game-status-text');
            if (gameStatusText) gameStatusText.textContent = 'AI wins!';
            gameOver = true;
            showToast('AI won! Try again.', 'info');
            return;
          }
          
          // Check for draw
          if (isPracticeBoardFull()) {
            const gameStatusText = document.getElementById('game-status-text');
            if (gameStatusText) gameStatusText.textContent = "It's a draw!";
            gameOver = true;
            showToast("Game ended in a draw!", 'info');
            return;
          }
          
          // Switch back to player
          currentPlayer = 'red';
          const gameStatusText = document.getElementById('game-status-text');
          if (gameStatusText) gameStatusText.textContent = 'Your turn! Place a red piece.';
          
          const redPowerIndicator = document.getElementById('red-power-indicator');
          const bluePowerIndicator = document.getElementById('blue-power-indicator');
          if (redPowerIndicator) redPowerIndicator.style.opacity = '1';
          if (bluePowerIndicator) bluePowerIndicator.style.opacity = '0.3';
          return;
        }
      }
    }
  }
}

function checkPracticeWin(player) {
  // Check rows
  for (let row = 0; row < 4; row++) {
    if (practiceBoard[row].every(cell => cell === player)) return true;
  }
  
  // Check columns
  for (let col = 0; col < 4; col++) {
    if ([0,1,2,3].every(row => practiceBoard[row][col] === player)) return true;
  }
  
  // Check diagonals
  if ([0,1,2,3].every(i => practiceBoard[i][i] === player)) return true;
  if ([0,1,2,3].every(i => practiceBoard[i][3-i] === player)) return true;
  
  return false;
}

function isPracticeBoardFull() {
  return practiceBoard.every(row => row.every(cell => cell !== null));
}

// Multiplayer Functions
function createRoom() {
  if (!isLoggedIn) {
    showToast("Please login first", "error");
    return;
  }

  sendWebSocketMessage({
    type: "CREATE_ROOM",
    payload: { userId: currentUserId },
  });
}

function showJoinRoomDialog() {
  const dialog = document.getElementById('join-room-dialog');
  if (dialog) {
    dialog.classList.remove('hidden');
  }
}

function joinRoomFromDialog() {
  const roomIdInput = document.getElementById('join-room-id-input');
  const roomId = roomIdInput ? roomIdInput.value : '';
  
  if (!roomId) {
    showToast("Please enter a room ID", "error");
    return;
  }
  
  joinRoom(roomId);
  const dialog = document.getElementById('join-room-dialog');
  if (dialog) {
    dialog.classList.add('hidden');
  }
  if (roomIdInput) roomIdInput.value = '';
}

function joinRoom(roomId) {
  if (!isLoggedIn) {
    showToast("Please login first", "error");
    return;
  }

  sendWebSocketMessage({
    type: "JOIN_ROOM",
    payload: { roomId, userId: currentUserId },
  });
}

function copyRoomId() {
  const roomIdElement = document.getElementById("current-room-id");
  const roomId = roomIdElement ? roomIdElement.textContent : "";
  
  if (roomId) {
    navigator.clipboard.writeText(roomId);
    showToast("Room ID copied to clipboard!", "success");
  }
}

function leaveGame() {
  // If in practice mode, just go back to home
  if (gameMode === 'practice') {
    showPage('landing');
    gameMode = null;
    return;
  }
  
  // If in multiplayer mode
  if (currentRoomId) {
    sendWebSocketMessage({
      type: "LEAVE_ROOM",
      payload: { roomId: currentRoomId, userId: currentUserId },
    });
  }
  resetGame();
}

function resetGame() {
  // Reset multiplayer game state
  // This function should be defined in your game.js file
  if (typeof window.resetGameState === 'function') {
    window.resetGameState();
  }
}

// Toast Notifications
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  };

  toast.className = `${colors[type] || colors.info} text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 opacity-0`;
  toast.textContent = message;

  container.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.remove("opacity-0");
    toast.classList.add("opacity-100");
  }, 10);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove("opacity-100");
    toast.classList.add("opacity-0");
    setTimeout(() => {
      if (toast.parentNode === container) {
        container.removeChild(toast);
      }
    }, 300);
  }, 3000);
}