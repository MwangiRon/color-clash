// Global State
let isLoggedIn = false;
let currentUser = null;
let currentUserId = null;
let currentPage = "home";
let darkMode = localStorage.getItem("darkMode") === "true";

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
    updateAuthUI();
  }

  showPage("home");
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
  document.getElementById("mobile-menu").classList.add("hidden");
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
  const icon = darkMode ? "light_mode" : "dark_mode";
  document.getElementById("theme-icon").textContent = icon;
  document.getElementById("theme-icon-mobile").textContent = icon;
}

// Mobile Menu Toggle
function toggleMobileMenu() {
  const menu = document.getElementById("mobile-menu");
  menu.classList.toggle("hidden");
}

// Authentication
function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById("login-username").value;

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

function handleRegister(event) {
  event.preventDefault();
  const username = document.getElementById("register-username").value;

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
  showPage("home");
}

function updateAuthUI() {
  if (isLoggedIn) {
    document.getElementById("auth-section-nav").classList.add("hidden");
    document.getElementById("logged-in-section").classList.remove("hidden");
    document.getElementById("nav-username").textContent = currentUser;
    document.getElementById("guest-mode-banner").classList.add("hidden");
  } else {
    document.getElementById("auth-section-nav").classList.remove("hidden");
    document.getElementById("logged-in-section").classList.add("hidden");
    document.getElementById("guest-mode-banner").classList.remove("hidden");
  }
}

// Practice Mode
function startPracticeMode() {
  showToast("Practice mode coming soon! Play multiplayer for now.", "info");
}

// Multiplayer
function checkAuthForMultiplayer() {
  if (!isLoggedIn) {
    showToast("Please login to play multiplayer", "warning");
    showPage("login");
    return;
  }

  document.getElementById("mode-selection").classList.add("hidden");
  document.getElementById("multiplayer-options").classList.remove("hidden");
}

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
  const roomId = prompt("Enter Room ID:");
  if (roomId) {
    joinRoom(roomId);
  }
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
  const roomId = document.getElementById("room-id-display").textContent;
  navigator.clipboard.writeText(roomId);
  showToast("Room ID copied to clipboard!", "success");
}

function leaveGame() {
  if (currentRoomId) {
    sendWebSocketMessage({
      type: "LEAVE_ROOM",
      payload: { roomId: currentRoomId, userId: currentUserId },
    });
  }
  resetGame();
  document.getElementById("mode-selection").classList.remove("hidden");
  document.getElementById("multiplayer-options").classList.add("hidden");
  document.getElementById("game-container").classList.add("hidden");
}

// Toast Notifications
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  };

  toast.className = `${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 opacity-0`;
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
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
