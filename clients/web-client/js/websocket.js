let ws = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
let connectionReadyCallback = null;

function connectWebSocket(onReadyCallback) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    if (onReadyCallback) onReadyCallback();
    return;
  }

  connectionReadyCallback = onReadyCallback;

  const wsUrl = "ws://localhost:3000";
  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log("WebSocket connected");
    reconnectAttempts = 0;

    // Call the ready callback if provided
    if (connectionReadyCallback) {
      connectionReadyCallback();
      connectionReadyCallback = null;
    }
  };

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    handleWebSocketMessage(message);
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
    showToast("Connection error", "error");
  };

  ws.onclose = () => {
    console.log("WebSocket disconnected");
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      setTimeout(() => connectWebSocket(), 2000 * reconnectAttempts);
    }
  };
}

function handleWebSocketMessage(message) {
  console.log("Received:", message.type, message.payload);

  switch (message.type) {
    case "CONNECTED":
      console.log("Server acknowledged connection");
      break;

    case "USER_REGISTERED":
      if (typeof onUserRegistered === 'function') {
        onUserRegistered(message.payload);
      } else {
        console.error("onUserRegistered function not found");
        // Fallback if app.js not loaded properly
        currentUser = message.payload.username;
        currentUserId = message.payload.userId;
        isLoggedIn = true;
        localStorage.setItem("username", currentUser);
        localStorage.setItem("userId", currentUserId);
        showToast(`Welcome, ${currentUser}!`, "success");
        showPage("play");
      }
      break;

    case "ROOM_CREATED":
      currentRoomId = message.payload.roomId;
      document.getElementById("room-info").classList.remove("hidden");
      document.getElementById("current-room-id").textContent = message.payload.roomId;
      document.getElementById("waiting-opponent").classList.remove("hidden");
      showToast("Room created! Share the ID with your friend.", "success");
      break;

    case "ROOM_JOINED":
      currentRoomId = message.payload.roomId;
      myColor = message.payload.players.find(
        (p) => p.userId === currentUserId
      ).color;
      
      // Update UI
      document.getElementById("room-info").classList.remove("hidden");
      document.getElementById("current-room-id").textContent = currentRoomId;
      showToast("Joined room successfully!", "success");

      if (message.payload.readyToStart) {
        // Show start game button
        document.getElementById("start-game-section").classList.remove("hidden");
        document.getElementById("waiting-opponent").classList.add("hidden");
        showToast("Room is ready! Click Start Game to begin.", "success");
      }
      break;

    case "OPPONENT_JOINED":
      showToast(`${message.payload.username} joined!`, "success");
      document.getElementById("waiting-opponent").classList.add("hidden");
      
      // Show start game button
      document.getElementById("start-game-section").classList.remove("hidden");
      showToast("Opponent joined! Click Start Game to begin.", "success");
      break;

    case "GAME_STARTED":
      startGameUI(message.payload);
      break;

    case "MOVE_MADE":
      updateGameBoard(message.payload);
      break;

    case "GAME_OVER":
      handleGameOver(message.payload);
      break;

    case "PLAYER_LEFT":
    case "PLAYER_DISCONNECTED":
      showToast(`${message.payload.username} left the game`, "warning");
      setTimeout(() => {
        leaveGame();
      }, 2000);
      break;

    case "ERROR":
      showToast(message.payload.error, "error");
      break;
  }
}

function sendWebSocketMessage(message) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  } else {
    showToast("Not connected to server", "error");
  }
}

function disconnectWebSocket() {
  if (ws) {
    ws.close();
    ws = null;
  }
}
