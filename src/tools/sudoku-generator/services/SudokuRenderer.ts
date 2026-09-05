/**
 * Canvas renderer for printable Sudoku puzzle pages.
 *
 * Draws 9x9 Sudoku grids onto an A4 (portrait) canvas. The number of columns
 * comes from the user's "per row" setting (1-3). The number of rows is
 * computed so the square cards fill the page as much as possible, and the
 * puzzle count is derived from that layout (cols * rows).
 */
class SudokuRenderer  {
    private canvas: any;
        private ctx: any;

    /**
     * A4 portrait canvas size at 192 DPI (doubled resolution).
     */
    static CANVAS_WIDTH = 1588;
    static CANVAS_HEIGHT = 2246;

    static MARGIN = 60;
    static GAP = 40;

    /**
     * Compute the layout (columns, rows, count) for a given "per row" setting.
     * Cards are square and as large as possible while filling the page.
     * @param {number} perRow - number of puzzles per row (1-3)
     * @returns {{cols: number, rows: number, count: number, cardSize: number}}
     */
    static computeLayout(perRow) {
        const cols = Math.min(perRow, 3);
        const { MARGIN, GAP } = SudokuRenderer;
        const availableW = SudokuRenderer.CANVAS_WIDTH - MARGIN * 2;
        const availableH = SudokuRenderer.CANVAS_HEIGHT - MARGIN * 2;

        // Width-limited square card size.
        const cardW = (availableW - (cols - 1) * GAP) / cols;
        // How many rows fit vertically.
        let rows = Math.max(1, Math.floor((availableH + GAP) / (cardW + GAP)));
        // For two per row, shrink the cards slightly so three rows fit.
        if (cols === 2) {
            rows = 3;
        }
        const cardSize = Math.min(cardW, (availableH - (rows - 1) * GAP) / rows);

        return { cols, rows, count: cols * rows, cardSize };
    }

    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = SudokuRenderer.CANVAS_WIDTH;
        this.canvas.height = SudokuRenderer.CANVAS_HEIGHT;
    }

    /**
     * Render the page.
     * @param {Object} options
     * @param {Array<{puzzle: number[][], solution: number[][]}>} options.puzzles
     * @param {number} options.perRow - number of puzzles per row (1-3)
     * @param {boolean} options.showSolution - draw the solved grid
     */
    render({ puzzles, perRow, showSolution }) {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const { MARGIN, GAP } = SudokuRenderer;
        const layout = SudokuRenderer.computeLayout(perRow);
        const { cols, rows, cardSize } = layout;

        const totalW = cols * cardSize + (cols - 1) * GAP;
        const totalH = rows * cardSize + (rows - 1) * GAP;
        const startX = (this.canvas.width - totalW) / 2;
        const startY = (this.canvas.height - totalH) / 2;

        puzzles.slice(0, layout.count).forEach((item, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);

            const x = startX + col * (cardSize + GAP);
            const y = startY + row * (cardSize + GAP);

            const grid = showSolution ? item.solution : item.puzzle;
            this.drawSudokuGrid(item.puzzle, grid, x, y, cardSize, showSolution);
        });
    }

    /**
     * Draw a single 9x9 Sudoku grid.
     * @param {number[][]} puzzle - the puzzle grid (0 for empty cells)
     * @param {number[][]} grid - the grid to render (puzzle or solution)
     * @param {number} x - top-left x
     * @param {number} y - top-left y
     * @param {number} size - side length in pixels
     * @param {boolean} showSolution - highlight only the solved (originally empty) cells
     */
    drawSudokuGrid(puzzle, grid, x, y, size, showSolution) {
        const ctx = this.ctx;
        const cell = size / 9;

        // Given-cell background (values already filled in the puzzle).
        ctx.fillStyle = '#f0f0f0';
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (puzzle[r][c] !== 0) {
                    ctx.fillRect(x + c * cell, y + r * cell, cell, cell);
                }
            }
        }

        // Draw digits. In solution mode, only the originally empty cells get
        // the lighter color; the given cells keep the dark style.
        ctx.font = `bold ${Math.round(cell * 0.62)}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const value = grid[r][c];
                if (value !== 0) {
                    const isGiven = puzzle[r][c] !== 0;
                    ctx.fillStyle = showSolution && !isGiven ? '#888888' : '#222222';
                    const cx = x + c * cell + cell / 2;
                    const cy = y + r * cell + cell / 2;
                    ctx.fillText(String(value), cx, cy);
                }
            }
        }

        // Thin grid lines.
        ctx.strokeStyle = '#b0b0b0';
        ctx.lineWidth = 2;
        for (let i = 0; i <= 9; i++) {
            ctx.beginPath();
            ctx.moveTo(x + i * cell, y);
            ctx.lineTo(x + i * cell, y + size);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y + i * cell);
            ctx.lineTo(x + size, y + i * cell);
            ctx.stroke();
        }

        // Thick lines for 3x3 boxes and outer border.
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 6;
        for (let i = 0; i <= 3; i++) {
            const offset = i * 3 * cell;
            ctx.beginPath();
            ctx.moveTo(x + offset, y);
            ctx.lineTo(x + offset, y + size);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y + offset);
            ctx.lineTo(x + size, y + offset);
            ctx.stroke();
        }
    }
}

export default SudokuRenderer;
