class GameLogic {
    // Convert position (0-15) to row and column
    static getRowCol(position) {
        return {
            row: Math.floor(position / 4),
            col: position % 4
        };
    }

    // Convert row and column to position
    static getPosition(row, col) {
        return row * 4 + col;
    }

    // Check if position is valid
    static isValidPosition(position) {
        return position >= 0 && position <= 15;
    }

    // Get adjacent positions
    static getAdjacentPositions(position) {
        const { row, col } = this.getRowCol(position);
        const adjacent = [];

        // Top
        if (row > 0) adjacent.push(this.getPosition(row - 1, col));
        // Bottom
        if (row < 3) adjacent.push(this.getPosition(row + 1, col));
        // Left
        if (col > 0) adjacent.push(this.getPosition(row, col - 1));
        // Right
        if (col < 3) adjacent.push(this.getPosition(row, col + 1));

        return adjacent;
    }

    // Display board as 4x4 grid (for debugging)
    static displayBoard(board) {
        const grid = [];
        for (let i = 0; i < 4; i++) {
            const row = board.slice(i * 4, i * 4 + 4);
            grid.push(row.map(cell => cell || '-').join(' '));
        }
        return grid.join('\n');
    }
}

module.exports = GameLogic;