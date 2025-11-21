class WinChecker {
    // Check if there's a winner
    static checkWinner(board) {
        // Check all possible winning combinations
        const winPatterns = [
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
            [3, 6, 9, 12]
        ];

        for (const pattern of winPatterns) {
            const [a, b, c, d] = pattern;
            if (
                board[a] !== null &&
                board[a] === board[b] &&
                board[a] === board[c] &&
                board[a] === board[d]
            ) {
                return board[a]; // Return winning color ('red' or 'blue')
            }
        }

        return null; // No winner
    }

    // Check if move would create a win
    static wouldWin(board, position, color) {
        const testBoard = [...board];
        testBoard[position] = color;
        return this.checkWinner(testBoard) === color;
    }

    // Get winning pattern if exists
    static getWinningPattern(board) {
        const winPatterns = [
            [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15],
            [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15],
            [0, 5, 10, 15], [3, 6, 9, 12]
        ];

        for (const pattern of winPatterns) {
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
