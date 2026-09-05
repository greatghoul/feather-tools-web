const A4_WIDTH_PX = 595;
const A4_HEIGHT_PX = 842;
const DPI = 72;
const RENDER_SCALE = 3;

const PADDING_PRESETS = {
    narrow: 4,
    normal: 12,
    wide: 20,
};

const LINE_COLORS = {
    black: '#333333',
    blue: '#1e40af',
    gray: '#6b7280',
    red: '#b91c1c',
    green: '#047857',
};

class HanziPaperRenderer  {

    private canvas: any;
        private ctx: any;
        private orientation: any;
        private lineColor: any;
        private paddingVertical: any;
        private paddingHorizontal: any;
        private cellSize: any;
        private style: any;
        private baseWidth: any;
        private baseHeight: any;

    constructor(canvas, settings: any = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.orientation = settings.orientation || 'portrait';
        this.lineColor = settings.lineColor || 'black';
        this.paddingVertical = settings.paddingVertical || 'narrow';
        this.paddingHorizontal = settings.paddingHorizontal || 'normal';
        this.cellSize = settings.cellSize || 20;
        this.style = settings.style || 'tian-zi-ge';

        const baseW = this.orientation === 'landscape' ? A4_HEIGHT_PX : A4_WIDTH_PX;
        const baseH = this.orientation === 'landscape' ? A4_WIDTH_PX : A4_HEIGHT_PX;

        this.canvas.width = baseW * RENDER_SCALE;
        this.canvas.height = baseH * RENDER_SCALE;
        this.baseWidth = baseW;
        this.baseHeight = baseH;
    }

    mmToPx(mm) {
        return mm * DPI / 25.4 * RENDER_SCALE;
    }

    getColor() {
        return this.lineColor.startsWith('#') ? this.lineColor : (LINE_COLORS[this.lineColor] || LINE_COLORS.black);
    }

    render() {
        const ctx = this.ctx;
        const s = RENDER_SCALE;
        const color = this.getColor();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const paddingHMm = PADDING_PRESETS[this.paddingHorizontal] || PADDING_PRESETS.normal;
        const paddingVMm = PADDING_PRESETS[this.paddingVertical] || PADDING_PRESETS.narrow;
        const paddingHPx = Math.round(this.mmToPx(paddingHMm));
        const paddingVPx = Math.round(this.mmToPx(paddingVMm));
        const cellPx = Math.round(this.mmToPx(this.cellSize));

        const contentX = paddingHPx;
        const contentY = paddingVPx;
        const contentW = this.canvas.width - paddingHPx * 2;
        const contentH = this.canvas.height - paddingVPx * 2;

        let gridLeft, gridTop, gridRight, gridBottom, cols, rows;

        if (this.style === 'horizontal') {
            rows = Math.floor(contentH / cellPx) + 1;
            const totalH = (rows - 1) * cellPx;
            gridLeft = contentX;
            gridTop = contentY + Math.round((contentH - totalH) / 2);
            gridRight = contentX + contentW;
            gridBottom = gridTop + totalH;
            cols = 0;
        } else if (this.style === 'vertical') {
            cols = Math.floor(contentW / cellPx) + 1;
            const totalW = (cols - 1) * cellPx;
            gridLeft = contentX + Math.round((contentW - totalW) / 2);
            gridTop = contentY;
            gridRight = gridLeft + totalW;
            gridBottom = contentY + contentH;
            rows = 0;
        } else {
            cols = Math.floor(contentW / cellPx);
            rows = Math.floor(contentH / cellPx);
            const totalW = cols * cellPx;
            const totalH = rows * cellPx;
            gridLeft = contentX + Math.round((contentW - totalW) / 2);
            gridTop = contentY + Math.round((contentH - totalH) / 2);
            gridRight = gridLeft + totalW;
            gridBottom = gridTop + totalH;
        }

        const gridW = gridRight - gridLeft;
        const gridH = gridBottom - gridTop;

        this.drawDoubleBorder(gridLeft, gridTop, gridW, gridH, color, s);

        if (this.style === 'horizontal') {
            this.drawHorizontalLines(gridLeft, gridTop, gridW, cellPx, rows, color, s);
        } else if (this.style === 'vertical') {
            this.drawVerticalLines(gridLeft, gridTop, gridH, cellPx, cols, color, s);
        } else {
            this.drawGridLines(gridLeft, gridTop, gridW, gridH, cellPx, cols, rows, color, s);
        }
    }

    drawDoubleBorder(x, y, w, h, color, s) {
        const ctx = this.ctx;
        const gap = Math.round(5 * s);

        ctx.strokeStyle = color;

        ctx.lineWidth = Math.round(2.5 * s);
        ctx.strokeRect(x - gap, y - gap, w + gap * 2, h + gap * 2);

        ctx.lineWidth = Math.round(1 * s);
        ctx.strokeRect(x, y, w, h);
    }

    drawHorizontalLines(x, y, w, cellPx, rows, color, s) {
        const ctx = this.ctx;
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.round(1 * s);
        ctx.globalAlpha = 0.7;

        for (let i = 0; i < rows; i++) {
            const yPos = y + i * cellPx;
            ctx.beginPath();
            ctx.moveTo(x, yPos);
            ctx.lineTo(x + w, yPos);
            ctx.stroke();
        }

        ctx.globalAlpha = 1.0;
    }

    drawVerticalLines(x, y, h, cellPx, cols, color, s) {
        const ctx = this.ctx;
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.round(1 * s);
        ctx.globalAlpha = 0.7;

        for (let i = 0; i < cols; i++) {
            const xPos = x + i * cellPx;
            ctx.beginPath();
            ctx.moveTo(xPos, y);
            ctx.lineTo(xPos, y + h);
            ctx.stroke();
        }

        ctx.globalAlpha = 1.0;
    }

    drawGridLines(x, y, w, h, cellPx, cols, rows, color, s) {
        const ctx = this.ctx;
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.round(1 * s);
        ctx.globalAlpha = 0.7;

        for (let row = 0; row <= rows; row++) {
            const yPos = y + row * cellPx;
            ctx.beginPath();
            ctx.moveTo(x, yPos);
            ctx.lineTo(x + w, yPos);
            ctx.stroke();
        }

        for (let col = 0; col <= cols; col++) {
            const xPos = x + col * cellPx;
            ctx.beginPath();
            ctx.moveTo(xPos, y);
            ctx.lineTo(xPos, y + h);
            ctx.stroke();
        }

        ctx.globalAlpha = 1.0;

        if (this.style === 'tian-zi-ge') {
            this.drawTianZiGe(x, y, cols, rows, cellPx, color, s);
        } else if (this.style === 'mi-zi-ge') {
            this.drawMiZiGe(x, y, cols, rows, cellPx, color, s);
        }
    }

    drawTianZiGe(x, y, cols, rows, cellPx, color, s) {
        const ctx = this.ctx;
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.round(0.8 * s);
        ctx.globalAlpha = 0.35;

        const half = cellPx / 2;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cx = x + col * cellPx;
                const cy = y + row * cellPx;

                ctx.beginPath();
                ctx.moveTo(cx + half, cy);
                ctx.lineTo(cx + half, cy + cellPx);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(cx, cy + half);
                ctx.lineTo(cx + cellPx, cy + half);
                ctx.stroke();
            }
        }

        ctx.globalAlpha = 1.0;
    }

    drawMiZiGe(x, y, cols, rows, cellPx, color, s) {
        const ctx = this.ctx;
        const half = cellPx / 2;

        ctx.strokeStyle = color;
        ctx.lineWidth = Math.round(0.8 * s);
        ctx.globalAlpha = 0.35;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cx = x + col * cellPx;
                const cy = y + row * cellPx;

                ctx.beginPath();
                ctx.moveTo(cx + half, cy);
                ctx.lineTo(cx + half, cy + cellPx);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(cx, cy + half);
                ctx.lineTo(cx + cellPx, cy + half);
                ctx.stroke();
            }
        }

        const dashLen = Math.round(3 * s);
        ctx.setLineDash([dashLen, dashLen]);

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cx = x + col * cellPx;
                const cy = y + row * cellPx;

                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx + cellPx, cy + cellPx);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(cx + cellPx, cy);
                ctx.lineTo(cx, cy + cellPx);
                ctx.stroke();
            }
        }

        ctx.setLineDash([]);
        ctx.globalAlpha = 1.0;
    }
}

export default HanziPaperRenderer;
