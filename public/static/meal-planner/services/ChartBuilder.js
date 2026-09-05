export default class ChartBuilder {
    constructor(canvas, settings) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.settings = settings;

        // A4 landscape: 297mm x 210mm at ~96 DPI
        this.canvas.width = 1123;
        this.canvas.height = 794;

        this.margin = {
            left: 50,
            right: 50,
            top: 48,
            bottom: 35
        };

        this.contentWidth = this.canvas.width - this.margin.left - this.margin.right;
        this.lineSpacing = 30;
    }

    build() {
        this.clearCanvas();
        this.drawBackground();
        this.drawHeader();
        this.drawMealGrid();
        this.drawBottomSections();
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBackground() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawHeader() {
        const { title } = this.settings;
        const cx = this.canvas.width / 2;

        this.ctx.fillStyle = '#222';
        this.ctx.font = 'bold 22px Arial, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(title, cx, this.margin.top + 6);
    }

    drawMealGrid() {
        const { meals, dayNames } = this.settings;
        const mealKeys = Object.keys(meals).filter(k => meals[k]);
        if (mealKeys.length === 0) return;

        const gridStartY = this.margin.top + 32;

        const labelWidth = 72;
        const dayColWidth = (this.contentWidth - labelWidth) / 7;

        const headerHeight = 24;
        const rowHeight = Math.min(58, Math.floor((this.canvas.height - this.margin.bottom - gridStartY - headerHeight - 120) / Math.max(mealKeys.length, 1)));

        this.ctx.strokeStyle = '#bbb';
        this.ctx.lineWidth = 1;

        // Draw header row
        const headerY = gridStartY;
        this.ctx.fillStyle = '#f5f5f5';
        this.ctx.fillRect(this.margin.left, headerY, this.contentWidth, headerHeight);
        this.ctx.strokeRect(this.margin.left, headerY, labelWidth, headerHeight);

        for (let col = 0; col < 7; col++) {
            const x = this.margin.left + labelWidth + col * dayColWidth;
            this.ctx.strokeRect(x, headerY, dayColWidth, headerHeight);

            this.ctx.fillStyle = '#555';
            this.ctx.font = 'bold 11px Arial, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(dayNames[col] || '', x + dayColWidth / 2, headerY + headerHeight / 2);
        }

        // Draw meal rows
        this.ctx.textBaseline = 'middle';
        for (let row = 0; row < mealKeys.length; row++) {
            const y = gridStartY + headerHeight + row * rowHeight;
            const mealKey = mealKeys[row];

            // Label cell
            this.ctx.fillStyle = '#fafafa';
            this.ctx.fillRect(this.margin.left, y, labelWidth, rowHeight);
            this.ctx.strokeStyle = '#bbb';
            this.ctx.strokeRect(this.margin.left, y, labelWidth, rowHeight);

            this.ctx.fillStyle = '#555';
            this.ctx.font = 'bold 11px Arial, sans-serif';
            this.ctx.textAlign = 'center';
            const label = (this.settings.mealLabels && this.settings.mealLabels[mealKey]) || mealKey;
            this.ctx.fillText(label, this.margin.left + labelWidth / 2, y + rowHeight / 2);

            // Day cells
            for (let col = 0; col < 7; col++) {
                const x = this.margin.left + labelWidth + col * dayColWidth;
                this.ctx.strokeStyle = '#bbb';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, y, dayColWidth, rowHeight);
            }
        }
    }

    drawBottomSections() {
        const { meals, showShoppingList, showNotes } = this.settings;
        const mealKeys = Object.keys(meals).filter(k => meals[k]);
        if (mealKeys.length === 0) return;

        const labelWidth = 72;
        const headerHeight = 24;
        const rowHeight = Math.min(58, Math.floor((this.canvas.height - this.margin.bottom - (this.margin.top + 32) - headerHeight - 120) / Math.max(mealKeys.length, 1)));
        const gridStartY = this.margin.top + 32;
        const gridEndY = gridStartY + headerHeight + mealKeys.length * rowHeight;

        const sectionY = gridEndY + 14;
        const bottomAvailable = this.canvas.height - this.margin.bottom - sectionY;

        const both = showShoppingList && showNotes;

        if (both) {
            const halfW = (this.contentWidth - 12) / 2;
            const slLabel = this.settings.shoppingListLabel || 'Shopping List';
            const nLabel = this.settings.notesLabel || 'Notes';
            if (showShoppingList) {
                this.drawSection(sectionY, bottomAvailable, slLabel, this.margin.left, halfW);
            }
            if (showNotes) {
                this.drawSection(sectionY, bottomAvailable, nLabel, this.margin.left + halfW + 12, halfW);
            }
        } else {
            const slLabel = this.settings.shoppingListLabel || 'Shopping List';
            const nLabel = this.settings.notesLabel || 'Notes';
            if (showShoppingList) {
                this.drawSection(sectionY, bottomAvailable, slLabel, this.margin.left, this.contentWidth);
            }
            if (showNotes) {
                this.drawSection(sectionY, bottomAvailable, nLabel, this.margin.left, this.contentWidth);
            }
        }
    }

    drawSection(y, height, title, x, w) {
        const titleHeight = 26;
        const contentStartY = y + titleHeight + 6;
        const contentHeight = height - titleHeight - 6;
        const lineCount = Math.max(1, Math.floor(contentHeight / this.lineSpacing));

        // Section border
        this.ctx.strokeStyle = '#bbb';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, w, height);

        // Section title
        this.ctx.fillStyle = '#f5f5f5';
        this.ctx.fillRect(x, y, w, titleHeight);
        this.ctx.strokeRect(x, y, w, titleHeight);

        this.ctx.fillStyle = '#555';
        this.ctx.font = 'bold 12px Arial, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(title, x + 8, y + titleHeight / 2);

        // Ruled lines at standard spacing
        this.ctx.strokeStyle = '#e8e8e8';
        this.ctx.lineWidth = 1;
        for (let li = 1; li <= lineCount; li++) {
            const lineY = contentStartY + li * this.lineSpacing;
            if (lineY >= y + height - 4) break;
            this.ctx.beginPath();
            this.ctx.moveTo(x + 6, lineY);
            this.ctx.lineTo(x + w - 6, lineY);
            this.ctx.stroke();
        }
    }
}
