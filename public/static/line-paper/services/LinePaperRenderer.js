/**
 * Line Paper Renderer
 * Renders printable lined paper on a Canvas element.
 *
 * A4 at 200 DPI: 1654px x 2339px
 * Line spacing: fixed at 9mm
 */

// Base A4 dimensions at 72 DPI
const A4_WIDTH_PX = 595;
const A4_HEIGHT_PX = 842;
const DPI = 72;

// Render at 3x internal resolution, display at 1x CSS size.
// The browser downscales the 3x canvas smoothly, giving crisp anti-aliased lines.
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

class LinePaperRenderer {
    constructor(canvas, settings = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.orientation = settings.orientation || 'portrait';
        this.lineColor = settings.lineColor || 'black';
        this.paddingVertical = settings.paddingVertical || 'narrow';
        this.paddingHorizontal = settings.paddingHorizontal || 'normal';
        this.lineHeight = settings.lineHeight || 9;

        // Calculate base (1x) dimensions
        const baseW = this.orientation === 'landscape' ? A4_HEIGHT_PX : A4_WIDTH_PX;
        const baseH = this.orientation === 'landscape' ? A4_WIDTH_PX : A4_HEIGHT_PX;

        // Set canvas internal resolution to 3x for supersampling
        this.canvas.width = baseW * RENDER_SCALE;
        this.canvas.height = baseH * RENDER_SCALE;

        // Store base (1x) CSS display dimensions
        this.baseWidth = baseW;
        this.baseHeight = baseH;
    }

    render() {
        const ctx = this.ctx;
        const s = RENDER_SCALE;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Support both preset names and custom hex colors
        const color = this.lineColor.startsWith('#') ? this.lineColor : (LINE_COLORS[this.lineColor] || LINE_COLORS.blue);
        const spacingPx = this.lineHeight * DPI / 25.4 * s;
        const paddingHMm = PADDING_PRESETS[this.paddingHorizontal] || PADDING_PRESETS.normal;
        const paddingVMm = PADDING_PRESETS[this.paddingVertical] || PADDING_PRESETS.narrow;
        const paddingHPx = Math.round(paddingHMm * DPI / 25.4 * s);
        const paddingVPx = Math.round(paddingVMm * DPI / 25.4 * s);

        const lineStartX = paddingHPx;
        const lineEndX = this.canvas.width - paddingHPx;
        let yPos = paddingVPx + spacingPx;

        ctx.strokeStyle = color;
        ctx.lineWidth = 1 * s;
        ctx.globalAlpha = 0.7;

        while (yPos < this.canvas.height - paddingVPx) {
            ctx.beginPath();
            ctx.moveTo(lineStartX, yPos);
            ctx.lineTo(lineEndX, yPos);
            ctx.stroke();
            yPos += spacingPx;
        }

        ctx.globalAlpha = 1.0;
    }
}

export default LinePaperRenderer;
