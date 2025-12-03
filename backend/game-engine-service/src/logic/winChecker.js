const { WIN_PATTERNS } = require("../../../shared-utils/constants");

class WinChecker {
  static checkWinner(board) {
    for (const pattern of WIN_PATTERNS) {
      const [a, b, c, d] = pattern;
      if (
        board[a] !== null &&
        board[a] === board[b] &&
        board[a] === board[c] &&
        board[a] === board[d]
      ) {
        return board[a];
      }
    }
    return null;
  }

  static wouldWin(board, position, color) {
    const testBoard = [...board];
    testBoard[position] = color;
    return this.checkWinner(testBoard) === color;
  }

  static getWinningPattern(board) {
    for (const pattern of WIN_PATTERNS) {
      const [a, b, c, d] = pattern;
      if (
        board[a] !== null &&
        board[a] === board[b] &&
        board[a] === board[c] &&
        board[a] === board[d]
      ) {
        return pattern;
      }
    }
    return null;
  }
}

module.exports = WinChecker;
