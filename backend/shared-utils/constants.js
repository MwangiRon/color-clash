const GAME_CONSTANTS = {
  BOARD_SIZE: 16,
  GRID_DIMENSION: 4,
  COLORS: {
    RED: "red",
    BLUE: "blue",
  },
  ROOM_STATUS: {
    WAITING: "waiting",
    PLAYING: "playing",
    FINISHED: "finished",
  },
  MAX_PLAYERS: 2,
};

const WIN_PATTERNS = [
  // Horizontal rows
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [8, 9, 10, 11],
  [12, 13, 14, 15],
  // Vertical columns
  [0, 4, 8, 12],
  [1, 5, 9, 13],
  [2, 6, 10, 14],
  [3, 7, 11, 15],
  // Diagonals
  [0, 5, 10, 15],
  [3, 6, 9, 12],
];

module.exports = {
  GAME_CONSTANTS,
  WIN_PATTERNS,
};
