export default class ChartBuilder  {
    private canvas: any;
        private ctx: any;
        private settings: any;
        private margin: any;
        private contentW: any;
        private contentH: any;
        private centerX: any;
        private gap: any;
        private colGap: any;

    constructor(canvas, settings) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.settings = settings;

        this.canvas.width = 794;
        this.canvas.height = 1123;

        this.margin = { top: 38, right: 38, bottom: 38, left: 38 };
        this.contentW = this.canvas.width - this.margin.left - this.margin.right;
        this.contentH = this.canvas.height - this.margin.top - this.margin.bottom;
        this.centerX = this.canvas.width / 2;
        this.gap = 14;
        this.colGap = 16;
    }

    build() {
        this.clearCanvas();
        this.drawBackground();

        const { showTitle, title, columns, cardCount, cardRows, t } = this.settings;

        let cardsStartY = this.margin.top;

        if (showTitle) {
            const titleY = this.margin.top + 24;
            this.ctx.fillStyle = '#222';
            this.ctx.font = 'bold 20px Arial, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'bottom';
            this.ctx.fillText(title || '', this.centerX, titleY);

            const lineY = titleY + 6;
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(this.margin.left, lineY);
            this.ctx.lineTo(this.margin.left + this.contentW, lineY);
            this.ctx.stroke();

            cardsStartY = lineY + 8;
        }

        const availableH = this.margin.top + this.contentH - cardsStartY - this.margin.bottom;

        if (columns === 2) {
            this.buildTwoColumns(cardsStartY, availableH, cardCount, cardRows, t);
        } else {
            this.buildOneColumn(cardsStartY, availableH, cardCount, cardRows, t);
        }
    }

    buildOneColumn(startY, availableH, cardCount, cardRows, t) {
        const cardH = Math.floor((availableH - (cardCount - 1) * this.gap) / cardCount);
        const headerH = 28;
        const bodyPad = 8;
        const border = 2;
        const bodyH = cardH - headerH - border;
        const lineSpace = Math.max(22, (bodyH - 2 - bodyPad) / cardRows);

        for (let i = 0; i < cardCount; i++) {
            const cy = startY + i * (cardH + this.gap);
            this.drawCard1col(cy, cardH, headerH, bodyPad, lineSpace, t);
        }

        this.drawCutLines1col(startY, cardH, cardCount);
    }

    buildTwoColumns(startY, availableH, cardCount, cardRows, t) {
        const pairs = Math.ceil(cardCount / 2);
        const cardW = (this.contentW - this.colGap) / 2;
        const headerH = 38;
        const bodyPad = 8;
        const border = 2;

        const pairH = Math.floor((availableH - (pairs - 1) * this.gap) / pairs);
        const bodyH = pairH - headerH - border;
        const lineSpace = Math.max(22, (bodyH - 2 - bodyPad) / cardRows);

        for (let p = 0; p < pairs; p++) {
            const py = startY + p * (pairH + this.gap);
            const lx = this.margin.left;
            const rx = lx + cardW + this.colGap;

            this.drawCard2col(lx, py, cardW, pairH, headerH, bodyPad, lineSpace, t);
            if (p * 2 + 1 < cardCount) {
                this.drawCard2col(rx, py, cardW, pairH, headerH, bodyPad, lineSpace, t);
            }
        }

        this.drawCutLines2col(startY, pairH, pairs, cardW);
    }

    drawCard1col(cy, cardH, headerH, bodyPad, lineSpace, t) {
        const ctx = this.ctx;
        const x = this.margin.left;
        const w = this.contentW;

        this.drawCardFrame(x, cy, w, cardH);

        const hx = x + 1.5;
        const hw = w - 3;
        const hy = cy + 1.5;
        const hh = headerH;

        this.drawHeaderBg(hx, hy, hw, hh);

        const { bookTitle, bookAuthor, bookDate, bookPages } = this.settings;
        ctx.textBaseline = 'middle';

        const leftX = hx + 10;
        ctx.font = 'bold 9px Arial, sans-serif';
        const titleLW = ctx.measureText(t.titleLabel).width;
        this.drawField(ctx, leftX, hy + hh / 2, t.titleLabel, bookTitle, 150, hw / 2 - 16);
        const authorX = leftX + titleLW + 4 + 150 + 24;
        this.drawField(ctx, authorX, hy + hh / 2, t.authorLabel, bookAuthor, 100, hw - authorX + hx - 10);

        ctx.font = 'bold 9px Arial, sans-serif';
        const dateLabelW = ctx.measureText(t.dateLabel).width;
        const pagesLabelW = ctx.measureText(t.pagesLabel).width;
        const rightEdge = hx + hw - 10;
        const dateFieldW = dateLabelW + 4 + 70;
        const pagesFieldW = pagesLabelW + 4 + 50;
        const dateX = rightEdge - pagesFieldW - 16 - dateFieldW;

        this.drawField(ctx, dateX, hy + hh / 2, t.dateLabel, bookDate, 70, dateFieldW);
        this.drawField(ctx, dateX + dateFieldW + 16, hy + hh / 2, t.pagesLabel, bookPages, 50, pagesFieldW);

        ctx.restore();
        this.drawNotesBody(x, cy, w, cardH, headerH, bodyPad, lineSpace);
    }

    drawCard2col(cx, cy, cw, ch, headerH, bodyPad, lineSpace, t) {
        const ctx = this.ctx;

        this.drawCardFrame(cx, cy, cw, ch);

        const hx = cx + 1.5;
        const hw = cw - 3;
        const hy = cy + 1.5;
        const hh = headerH;

        this.drawHeaderBg(hx, hy, hw, hh);

        const { bookTitle, bookAuthor, bookDate, bookPages } = this.settings;
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 9px Arial, sans-serif';
        const rowH = hh / 2;

        const titleLW = ctx.measureText(t.titleLabel).width;
        const authorLW = ctx.measureText(t.authorLabel).width;
        const dateLW = ctx.measureText(t.dateLabel).width;
        const pagesLW = ctx.measureText(t.pagesLabel).width;
        const maxLeftLW = Math.max(titleLW, authorLW);
        const maxRightLW = Math.max(dateLW, pagesLW);

        const ulW = 60;
        const pad = 4;
        const leftX = hx + 8;
        const leftUlStart = leftX + maxLeftLW + pad;

        const rightEdge = hx + hw - 8;
        const rightUlStart = rightEdge - ulW;

        const drawLeftField = (label, value, y, ulWOverride) => {
            const fieldUlW = ulWOverride || ulW;
            ctx.fillStyle = '#999';
            ctx.textAlign = 'left';
            ctx.fillText(label, leftX, y);

            const ulStart = leftX + maxLeftLW + pad;
            const v = (value || '').trim();
            if (v) {
                ctx.font = '11px Arial, sans-serif';
                ctx.fillStyle = '#222';
                const display = this.truncateText(ctx, v, Math.max(fieldUlW - 2, 10));
                ctx.fillText(display, ulStart, y - 1.5);
                ctx.font = 'bold 9px Arial, sans-serif';
            }
            ctx.strokeStyle = '#d5d5d5';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(ulStart, y + 4);
            ctx.lineTo(ulStart + fieldUlW, y + 4);
            ctx.stroke();
        };

        const drawRightField = (label, value, y) => {
            const labelStart = rightUlStart - maxRightLW - pad;
            ctx.fillStyle = '#999';
            ctx.textAlign = 'left';
            ctx.fillText(label, labelStart, y);

            const v = (value || '').trim();
            if (v) {
                ctx.font = '11px Arial, sans-serif';
                ctx.fillStyle = '#222';
                const display = this.truncateText(ctx, v, Math.max(ulW - 2, 10));
                ctx.fillText(display, rightUlStart, y - 1.5);
                ctx.font = 'bold 9px Arial, sans-serif';
            }
            ctx.strokeStyle = '#d5d5d5';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(rightUlStart, y + 4);
            ctx.lineTo(rightEdge, y + 4);
            ctx.stroke();
        };

        ctx.font = 'bold 9px Arial, sans-serif';
        drawLeftField(t.titleLabel, bookTitle, hy + rowH / 2, 140);
        drawLeftField(t.authorLabel, bookAuthor, hy + rowH + rowH / 2, 140);
        drawRightField(t.dateLabel, bookDate, hy + rowH / 2);
        drawRightField(t.pagesLabel, bookPages, hy + rowH + rowH / 2);

        ctx.restore();
        this.drawNotesBody(cx, cy, cw, ch, headerH, bodyPad, lineSpace);
    }

    drawField(ctx, x, y, label, value, underlineW, maxSpace) {
        const val = (value || '').trim();

        ctx.font = 'bold 9px Arial, sans-serif';
        ctx.fillStyle = '#999';
        ctx.textAlign = 'left';
        ctx.fillText(label, x, y);

        const labelW = ctx.measureText(label).width;
        const ulStart = x + labelW + 4;
        const drawUlW = Math.min(underlineW, maxSpace - labelW - 4);

        if (val) {
            ctx.font = '11px Arial, sans-serif';
            ctx.fillStyle = '#222';
            const display = this.truncateText(ctx, val, Math.max(drawUlW - 2, 10));
            ctx.fillText(display, ulStart, y - 1.5);
        }

        if (drawUlW > 4) {
            ctx.strokeStyle = '#d5d5d5';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(ulStart, y + 4);
            ctx.lineTo(ulStart + drawUlW, y + 4);
            ctx.stroke();
        }
    }

    truncateText(ctx, text, maxWidth) {
        if (ctx.measureText(text).width <= maxWidth) return text;
        let t = text;
        while (ctx.measureText(t + '…').width > maxWidth && t.length > 0) {
            t = t.slice(0, -1);
        }
        return t + '…';
    }

    drawCardFrame(x, y, w, h) {
        const ctx = this.ctx;
        this.roundRect(x, y, w, h, 4);
        ctx.strokeStyle = '#bbb';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.save();
        ctx.beginPath();
        ctx.rect(x + 1.5, y + 1.5, w - 3, h - 3);
        ctx.clip();
    }

    drawHeaderBg(hx, hy, hw, hh) {
        const ctx = this.ctx;
        ctx.fillStyle = '#f7f7f7';
        ctx.fillRect(hx, hy, hw, hh);

        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(hx, hy + hh);
        ctx.lineTo(hx + hw, hy + hh);
        ctx.stroke();
    }

    drawNotesBody(cx, cy, cw, ch, headerH, bodyPad, lineSpace) {
        const ctx = this.ctx;
        const bodyY = cy + 1.5 + headerH + 1;
        const bodyH = ch - headerH - 2;

        ctx.save();
        ctx.beginPath();
        ctx.rect(cx + 1.5, bodyY, cw - 3, bodyH);
        ctx.clip();

        const { cardRows } = this.settings;
        const topPad = 2;

        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        for (let r = 0; r < cardRows; r++) {
            const ly = bodyY + topPad + (r + 1) * lineSpace;
            ctx.beginPath();
            ctx.moveTo(cx + 6, ly);
            ctx.lineTo(cx + cw - 6, ly);
            ctx.stroke();
        }

        ctx.restore();
    }

    drawCutLines1col(startY, cardH, cardCount) {
        const ctx = this.ctx;
        ctx.save();
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;

        for (let i = 0; i < cardCount - 1; i++) {
            const y = startY + (i + 1) * (cardH + this.gap) - this.gap / 2;
            ctx.beginPath();
            ctx.moveTo(this.margin.left, y);
            ctx.lineTo(this.margin.left + this.contentW, y);
            ctx.stroke();
        }

        ctx.restore();
    }

    drawCutLines2col(startY, pairH, pairs, cardW) {
        const ctx = this.ctx;
        ctx.save();
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;

        const vx = this.margin.left + cardW + this.colGap / 2;
        for (let p = 0; p < pairs; p++) {
            const py = startY + p * (pairH + this.gap);
            const vy = py + pairH + this.gap / 2;

            ctx.beginPath();
            ctx.moveTo(vx, py + 4);
            ctx.lineTo(vx, py + pairH - 4);
            ctx.stroke();

            if (p < pairs - 1) {
                ctx.beginPath();
                ctx.moveTo(this.margin.left, vy);
                ctx.lineTo(this.margin.left + this.contentW, vy);
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    roundRect(x, y, w, h, r) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBackground() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
