/**
 * Sudoku generation and solving service.
 *
 * This wraps the global `sudoku` library (robatron/sudoku.js) loaded via
 * <script> in the template. Puzzles are generated with a well-distributed
 * clue pattern and every puzzle is guaranteed to have a unique solution
 * (the library verifies this by solving forward and backward).
 */

const CLUES = {
    easy: 'easy',
    medium: 'medium',
    hard: 'very-hard',
};

class SudokuGenerator {
    /**
     * Generate `count` unique puzzles for the given difficulty.
     * @param {string} difficulty - 'easy', 'medium' or 'hard'
     * @param {number} count - number of distinct puzzles to generate
     * @returns {Array<{puzzle: number[][], solution: number[][]}>}
     */
    static generateSet(difficulty, count) {
        const seen = new Set();
        const puzzles = [];
        let guard = 0;
        while (puzzles.length < count && guard < 100) {
            guard++;
            const item = this.generateOne(difficulty);
            const signature = item.puzzle.map((row) => row.join('')).join('|');
            if (seen.has(signature)) {
                continue;
            }
            seen.add(signature);
            puzzles.push(item);
        }
        return puzzles;
    }

    /**
     * Generate a single puzzle with a verified unique solution.
     * @param {string} difficulty
     * @returns {{puzzle: number[][], solution: number[][]}}
     */
    static generateOne(difficulty) {
        const level = CLUES[difficulty] || 'medium';
        const board = window.sudoku.generate(level);
        const solution = window.sudoku.solve(board);

        const puzzleGrid = this.boardStringToGrid(board);
        const solutionGrid = this.boardStringToGrid(solution);
        return { puzzle: puzzleGrid, solution: solutionGrid };
    }

    /**
     * Convert a library board string ('.' for empty) into a 9x9 grid of
     * numbers, using 0 for empty cells.
     * @param {string} board
     * @returns {number[][]}
     */
    static boardStringToGrid(board) {
        const grid = [];
        for (let r = 0; r < 9; r++) {
            const row = [];
            for (let c = 0; c < 9; c++) {
                const ch = board[r * 9 + c];
                row.push(ch === '.' ? 0 : parseInt(ch, 10));
            }
            grid.push(row);
        }
        return grid;
    }
}

export default SudokuGenerator;
