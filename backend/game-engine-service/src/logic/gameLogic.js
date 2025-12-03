const { GAME_CONSTANTS } = require("../../../shared-utils/constants");

class GameLogic {
  static getRowCol(position) {
    return {
      row: Math.floor(position / GAME_CONSTANTS.GRID_DIMENSION),
      col: position % GAME_CONSTANTS.GRID_DIMENSION,
    };
  }

  static getPosition(row, col) {
    return row * GAME_CONSTANTS.GRID_DIMENSION + col;
  }

  static isValidPosition(position) {
    return position >= 0 && position < GAME_CONSTANTS.BOARD_SIZE;
  }

  static getAdjacentPositions(position) {
    const { row, col } = this.getRowCol(position);
    const adjacent = [];
    const maxIndex = GAME_CONSTANTS.GRID_DIMENSION - 1;

    const directions = [
      { row: -1, col: 0 }, // Top
      { row: 1, col: 0 }, // Bottom
      { row: 0, col: -1 }, // Left
      { row: 0, col: 1 }, // Right
    ];

    for (const dir of directions) {
      const newRow = row + dir.row;
      const newCol = col + dir.col;
      if (
        newRow >= 0 &&
        newRow <= maxIndex &&
        newCol >= 0 &&
        newCol <= maxIndex
      ) {
        adjacent.push(this.getPosition(newRow, newCol));
      }
    }

    return adjacent;
  }

  static displayBoard(board) {
    const grid = [];
    for (let i = 0; i < GAME_CONSTANTS.GRID_DIMENSION; i++) {
      const row = board.slice(
        i * GAME_CONSTANTS.GRID_DIMENSION,
        (i + 1) * GAME_CONSTANTS.GRID_DIMENSION
      );
      grid.push(row.map((cell) => cell || "-").join(" "));
    }
    return grid.join("\n");
  }
}

module.exports = GameLogic;
