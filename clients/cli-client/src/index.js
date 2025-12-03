const chalk = require("chalk");
const readline = require("readline");
const WebSocket = require("ws");
require("dotenv").config();

const WEBSOCKET_URL = process.env.WEBSOCKET_URL || "ws://localhost:3000";

// Global state
let ws = null;
let userId = null;
let username = null;
let roomId = null;
let gameBoard = Array(16).fill(null);
let myColor = null;
let currentTurn = null;
let powerMoveUsed = false;

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Clear console
function clearScreen() {
  console.clear();
}

// Utility functions
const formatters = {
  title: () => {
    console.log(chalk.cyan.bold("\n╔════════════════════════════════╗"));
    console.log(chalk.cyan.bold("║      COLOR CLASH GAME          ║"));
    console.log(chalk.cyan.bold("╚════════════════════════════════╝\n"));
  },

  separator: () => {
    console.log(chalk.yellow("═══════════════════════════════"));
  },

  error: (msg) => console.log(chalk.red(`[ERROR] ${msg}`)),
  success: (msg) => console.log(chalk.green(`[SUCCESS] ${msg}`)),
  info: (msg) => console.log(chalk.yellow(`[INFO] ${msg}`)),

  colorText: (color) =>
    color === "red" ? chalk.red("RED") : chalk.blue("BLUE"),
};

// Print title
function printTitle() {
  formatters.title();
}

// Print board
function printBoard() {
  console.log(chalk.yellow("\n   4x4 Game Board:\n"));

  for (let row = 0; row < 4; row++) {
    let rowStr = "   ";
    for (let col = 0; col < 4; col++) {
      const pos = row * 4 + col;
      const cell = gameBoard[pos];

      if (cell === "red") {
        rowStr += chalk.red.bold("R") + "  ";
      } else if (cell === "blue") {
        rowStr += chalk.blue.bold("B") + "  ";
      } else {
        rowStr += chalk.gray(pos.toString().padStart(2)) + " ";
      }
    }
    console.log(rowStr);
  }
  console.log("");
}

// Display menu
function showMainMenu() {
  clearScreen();
  printTitle();

  if (username) {
    console.log(chalk.green(`[USER] Logged in as: ${username}\n`));
  }

  console.log(chalk.white("Main Menu:"));
  console.log(chalk.white("1. Register / Login"));
  console.log(chalk.white("2. Create Room"));
  console.log(chalk.white("3. Join Room"));
  console.log(chalk.white("4. Exit\n"));

  askQuestion("Choose an option (1-4): ", handleMainMenuChoice);
}

// Display game menu
function showGameMenu() {
  console.log(chalk.yellow("\n─────────────────────────────"));
  console.log(chalk.white("Game Options:"));
  console.log(chalk.white("• Type position number (0-15) to make a move"));
  console.log(
    chalk.white(
      '• Type "power <position>" for power move (flip opponent piece)'
    )
  );
  console.log(chalk.white('• Type "board" to see the board again'));
  console.log(chalk.white('• Type "leave" to leave the game'));
  console.log(chalk.yellow("─────────────────────────────\n"));
}

// Ask question
function askQuestion(question, callback) {
  rl.question(chalk.cyan(question), (answer) => {
    callback(answer.trim());
  });
}

// Handle main menu choice
function handleMainMenuChoice(choice) {
  switch (choice) {
    case "1":
      registerUser();
      break;
    case "2":
      if (!userId) {
        console.log(chalk.red("[ERROR] Please register first!"));
        setTimeout(showMainMenu, 2000);
      } else {
        createRoom();
      }
      break;
    case "3":
      if (!userId) {
        console.log(chalk.red("[ERROR] Please register first!"));
        setTimeout(showMainMenu, 2000);
      } else {
        joinRoom();
      }
      break;
    case "4":
      console.log(chalk.yellow("[EXIT] Goodbye!"));
      process.exit(0);
      break;
    default:
      console.log(chalk.red("[ERROR] Invalid option!"));
      setTimeout(showMainMenu, 1000);
  }
}

// Register user
function registerUser() {
  clearScreen();
  printTitle();

  askQuestion("Enter your username: ", (name) => {
    if (!name || name.length < 3) {
      console.log(chalk.red("[ERROR] Username must be at least 3 characters!"));
      setTimeout(showMainMenu, 2000);
      return;
    }

    username = name;
    console.log(chalk.yellow("[INFO] Registering..."));

    sendMessage({
      type: "REGISTER_USER",
      payload: { username: name },
    });
  });
}

// Create room
function createRoom() {
  console.log(chalk.yellow("[INFO] Creating room..."));

  sendMessage({
    type: "CREATE_ROOM",
    payload: { userId },
  });
}

// Join room
function joinRoom() {
  askQuestion("Enter room ID: ", (id) => {
    if (!id) {
      console.log(chalk.red("[ERROR] Room ID required!"));
      setTimeout(showMainMenu, 2000);
      return;
    }

    roomId = id;
    console.log(chalk.yellow("[INFO] Joining room..."));

    sendMessage({
      type: "JOIN_ROOM",
      payload: { roomId: id, userId },
    });
  });
}

// Start game
function startGame() {
  console.log(chalk.yellow("[INFO] Starting game..."));

  sendMessage({
    type: "START_GAME",
    payload: { roomId },
  });
}

// Handle game input
function handleGameInput(input) {
  const lowerInput = input.toLowerCase();

  if (lowerInput === "board") {
    printBoard();
    showGameMenu();
    askForMove();
    return;
  }

  if (lowerInput === "leave") {
    sendMessage({
      type: "LEAVE_ROOM",
      payload: { roomId, userId },
    });
    roomId = null;
    gameBoard = Array(16).fill(null);
    showMainMenu();
    return;
  }

  // Check for power move: "power 5"
  if (lowerInput.startsWith("power ")) {
    const position = parseInt(lowerInput.split(" ")[1]);
    makeMove(position, true);
    return;
  }

  // Regular move: just a number
  const position = parseInt(input);
  if (isNaN(position) || position < 0 || position > 15) {
    console.log(chalk.red("[ERROR] Invalid position! Use 0-15"));
    askForMove();
    return;
  }

  makeMove(position, false);
}

// Make move
function makeMove(position, isPowerMove) {
  if (currentTurn !== userId) {
    console.log(chalk.red("[ERROR] Not your turn!"));
    askForMove();
    return;
  }

  if (isPowerMove && powerMoveUsed) {
    console.log(chalk.red("[ERROR] Power move already used!"));
    askForMove();
    return;
  }

  sendMessage({
    type: "MAKE_MOVE",
    payload: {
      roomId,
      userId,
      position,
      isPowerMove,
    },
  });
}

// Ask for move
function askForMove() {
  if (currentTurn === userId) {
    const colorStr =
      myColor === "red" ? chalk.red("[YOUR TURN]") : chalk.blue("[YOUR TURN]");
    askQuestion(`${colorStr} Enter move: `, handleGameInput);
  } else {
    console.log(chalk.gray("[WAIT] Waiting for opponent..."));
  }
}

// Send WebSocket message
function sendMessage(message) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  } else {
    console.log(chalk.red("[ERROR] Not connected to server!"));
  }
}

// Handle WebSocket messages
function handleMessage(data) {
  const message = JSON.parse(data);

  switch (message.type) {
    case "CONNECTED":
      console.log(chalk.green("[SUCCESS] Connected to server!"));
      setTimeout(showMainMenu, 1000);
      break;

    case "USER_REGISTERED":
      userId = message.payload.userId;
      username = message.payload.username;
      console.log(chalk.green(`[SUCCESS] Registered as ${username}!`));
      setTimeout(showMainMenu, 1500);
      break;

    case "ROOM_CREATED":
      roomId = message.payload.roomId;
      console.log(chalk.green(`[SUCCESS] Room created: ${roomId}`));
      console.log(chalk.yellow("[WAIT] Waiting for opponent to join..."));
      break;

    case "ROOM_JOINED":
      console.log(chalk.green("[SUCCESS] Joined room!"));
      // Determine player color
      const players = message.payload.players;
      const myPlayer = players.find((p) => p.userId === userId);
      myColor = myPlayer.color;

      if (message.payload.readyToStart) {
        console.log(chalk.green("[SUCCESS] Both players ready!"));
        setTimeout(() => startGame(), 1000);
      }
      break;

    case "OPPONENT_JOINED":
      console.log(chalk.green(`[JOIN] ${message.payload.username} joined!`));
      console.log(chalk.yellow("[INFO] Starting game..."));
      setTimeout(() => startGame(), 1000);
      break;

    case "GAME_STARTED":
      clearScreen();
      printTitle();
      gameBoard = message.payload.board;
      currentTurn = message.payload.currentTurn;

      const colorText =
        myColor === "red" ? chalk.red("RED") : chalk.blue("BLUE");
      console.log(chalk.green("[GAME] STARTED!"));
      console.log(chalk.white(`You are: ${colorText}`));

      printBoard();
      showGameMenu();
      askForMove();
      break;

    case "MOVE_MADE":
      gameBoard = message.payload.board;
      currentTurn = message.payload.currentTurn;

      const mover = message.payload.username;
      const pos = message.payload.position;
      const wasPower = message.payload.isPowerMove;

      if (message.payload.userId === userId) {
        powerMoveUsed = message.payload.powerMoveUsed || powerMoveUsed;
      }

      const moveType = wasPower
        ? chalk.yellow("[POWER MOVE]")
        : chalk.cyan("[MOVE]");
      console.log(
        chalk.white(`\n${moveType} ${mover} played at position ${pos}`)
      );
      printBoard();

      if (!message.payload.gameOver) {
        askForMove();
      }
      break;

    case "GAME_OVER":
      const winner = message.payload.winner;
      const isDraw = message.payload.draw;

      console.log(chalk.yellow("\n═══════════════════════════════"));
      if (isDraw) {
        console.log(chalk.yellow("     GAME ENDED IN A DRAW!"));
      } else if (winner === userId) {
        console.log(chalk.green.bold("         YOU WIN!"));
      } else {
        console.log(chalk.red.bold("         YOU LOSE!"));
      }
      console.log(chalk.yellow("═══════════════════════════════\n"));

      setTimeout(() => {
        roomId = null;
        gameBoard = Array(16).fill(null);
        powerMoveUsed = false;
        showMainMenu();
      }, 3000);
      break;

    case "PLAYER_LEFT":
    case "PLAYER_DISCONNECTED":
      console.log(
        chalk.red(`\n[DISCONNECT] ${message.payload.username} left the game!`)
      );
      setTimeout(() => {
        roomId = null;
        gameBoard = Array(16).fill(null);
        showMainMenu();
      }, 2000);
      break;

    case "ERROR":
      console.log(chalk.red(`[ERROR] ${message.payload.error}`));
      if (roomId) {
        askForMove();
      } else {
        setTimeout(showMainMenu, 2000);
      }
      break;

    default:
      console.log(chalk.gray(`[INFO] Received: ${message.type}`));
  }
}

// Connect to WebSocket
function connect() {
  console.log(chalk.yellow("[INFO] Connecting to server..."));

  ws = new WebSocket(WEBSOCKET_URL);

  ws.on("open", () => {
    console.log(chalk.green("[SUCCESS] Connection established!"));
  });

  ws.on("message", (data) => {
    handleMessage(data);
  });

  ws.on("close", () => {
    console.log(chalk.red("[DISCONNECT] Disconnected from server!"));
    process.exit(1);
  });

  ws.on("error", (error) => {
    console.log(chalk.red("[ERROR] Connection error:", error.message));
    process.exit(1);
  });
}

// Start application
function start() {
  clearScreen();
  printTitle();
  connect();
}

// Run
start();
