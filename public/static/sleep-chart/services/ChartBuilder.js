export default class ChartBuilder {
    constructor(canvas, settings = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        if (!this.ctx) throw new Error('Could not get canvas context');

        this.settings = {
            a4Width: 842 * 2,
            a4Height: 595 * 2,
            margin: 45 * 2,
            titleFont: '28px Arial',
            axisFont: '16px sans-serif',
            axisLineWidth: 2,
            gridColor: '#ddd',
            majorGridColor: '#bbb',
            gridLineWidth: 1.5,
            tickLength: 8,
            tickLineWidth: 1.5,
            timeMin: 21,
            timeMax: 33,
            labels: {
                sleep: 'Sleep',
                wake: 'Wake',
                title: 'Sleep Chart'
            },
            dateType: 'weekly',
            weekStart: 'sunday',
            blankTitle: false,
            ...settings
        };

        this.calculateDimensions();

        const xAxisConfig = this.getXAxisConfig();
        this.settings.xLabels = xAxisConfig.labels;
        this.settings.xMax = xAxisConfig.xMax;
        this.settings.titleText = xAxisConfig.titleText;
        this.settings.xRange = this.settings.xMax - this.settings.xMin;
    }

    calculateDimensions() {
        const { a4Width, a4Height, margin } = this.settings;

        this.settings.adjustedWidth = a4Width;
        this.settings.adjustedHeight = a4Height;
        this.settings.chartWidth = a4Width - margin * 2;
        this.settings.chartHeight = a4Height - margin * 2;
    }

    getXAxisConfig() {
        const { dateType, weekStart } = this.settings;

        const getDayLabels = (weekStart, dayNames) => {
            const sundayFirst = [dayNames[0], dayNames[1], dayNames[2], dayNames[3], dayNames[4], dayNames[5], dayNames[6]];
            const mondayFirst = [dayNames[1], dayNames[2], dayNames[3], dayNames[4], dayNames[5], dayNames[6], dayNames[0]];
            return weekStart === 'monday' ? mondayFirst : sundayFirst;
        };

        const dayNames = this.settings.labels.days || ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        switch (dateType) {
            case 'weekly':
                return {
                    labels: getDayLabels(weekStart, dayNames),
                    xMax: 7,
                    titleText: 'Sleep Chart'
                };
            case 'bi-weekly':
                const dayLabels = getDayLabels(weekStart, dayNames);
                return {
                    labels: [...dayLabels, ...dayLabels],
                    xMax: 14,
                    titleText: 'Sleep Chart'
                };
            case 'monthly':
            default:
                return {
                    labels: Array.from({ length: 31 }, (_, i) => (i + 1).toString()),
                    xMax: 31,
                    titleText: 'Sleep Chart'
                };
        }
    }

    initializeCanvas() {
        const { adjustedWidth, adjustedHeight } = this.settings;
        this.canvas.width = adjustedWidth;
        this.canvas.height = adjustedHeight;
        this.canvas.style.width = '100%';
        this.canvas.style.height = 'auto';
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, adjustedWidth, adjustedHeight);
        this.ctx.fillStyle = '#000';
    }

    drawTitle() {
        const { adjustedWidth, margin, titleFont, titleText, blankTitle, labels } = this.settings;

        this.ctx.font = titleFont;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'bottom';
        const titleY = margin - 20;

        if (blankTitle) {
            const underlineWidth = 400;
            const underlineX = (adjustedWidth - underlineWidth) / 2;
            this.ctx.beginPath();
            this.ctx.moveTo(underlineX, titleY + 5);
            this.ctx.lineTo(underlineX + underlineWidth, titleY + 5);
            this.ctx.strokeStyle = '#999';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        } else {
            this.ctx.fillText(labels.title, adjustedWidth / 2, titleY);
        }
    }

    drawAxes() {
        const { margin, adjustedHeight, adjustedWidth } = this.settings;

        this.ctx.beginPath();
        this.ctx.moveTo(margin, margin);
        this.ctx.lineTo(margin, adjustedHeight - margin);
        this.ctx.lineTo(adjustedWidth - margin, adjustedHeight - margin);
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = this.settings.axisLineWidth;
        this.ctx.stroke();
    }

    drawTimeLabels() {
        const { margin, adjustedHeight, chartWidth, chartHeight, timeMin, timeMax, labels } = this.settings;

        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';

        const totalHours = timeMax - timeMin;
        const pixelsPerHour = chartHeight / totalHours;

        // Label vertical axis ends: bottom = sleep, top = wake
        this.ctx.font = this.settings.axisFont;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        const bottomY = adjustedHeight - margin + 30;
        const topY = margin - 30;
        this.ctx.fillText(labels.sleep, margin, bottomY);
        this.ctx.textBaseline = 'bottom';
        this.ctx.fillText(labels.wake, margin, topY);

        this.ctx.textAlign = 'right';
        for (let hour = timeMin; hour <= timeMax; hour++) {
            const displayHour = hour % 24;
            const label = `${String(displayHour).padStart(2, '0')}:00`;
            const y = adjustedHeight - margin - ((hour - timeMin) / totalHours) * chartHeight;

            this.ctx.beginPath();
            this.ctx.moveTo(margin - this.settings.tickLength, y);
            this.ctx.lineTo(margin, y);
            this.ctx.lineWidth = this.settings.tickLineWidth;
            this.ctx.strokeStyle = '#333';
            this.ctx.stroke();

            this.ctx.font = this.settings.axisFont;
            this.ctx.fillText(label, margin - 16, y);

            this.ctx.beginPath();
            this.ctx.moveTo(margin, y);
            this.ctx.lineTo(this.settings.adjustedWidth - margin, y);
            this.ctx.lineWidth = this.settings.gridLineWidth;
            this.ctx.strokeStyle = this.settings.majorGridColor;
            this.ctx.stroke();

            // 15-min and 30-min sub-ticks (skip for the last hour marker)
            if (hour < timeMax) {
                for (let m = 15; m < 60; m += 15) {
                const subY = y - pixelsPerHour * (m / 60);
                const isHalfHour = m === 30;

                this.ctx.beginPath();
                this.ctx.moveTo(margin - (isHalfHour ? this.settings.tickLength : this.settings.tickLength * 0.6), subY);
                this.ctx.lineTo(margin, subY);
                this.ctx.lineWidth = this.settings.tickLineWidth;
                this.ctx.strokeStyle = '#333';
                this.ctx.stroke();

                this.ctx.beginPath();
                this.ctx.moveTo(margin, subY);
                this.ctx.lineTo(this.settings.adjustedWidth - margin, subY);
                this.ctx.lineWidth = this.settings.gridLineWidth;
                this.ctx.strokeStyle = isHalfHour ? this.settings.gridColor : '#eee';
                this.ctx.stroke();
            }
            }
        }
    }

    drawDayLabels() {
        const { margin, adjustedHeight, chartWidth, xLabels, xMax, chartHeight } = this.settings;

        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';

        const dayWidth = chartWidth / xMax;
        const offsetX = margin + dayWidth;

        for (let i = 0; i < xMax; i++) {
            const x = offsetX + dayWidth * i;
            const label = xLabels[i];

            this.ctx.font = this.settings.axisFont;
            this.ctx.fillText(label, x, adjustedHeight - margin + 10);

            if (i > 0) {
                const xLine = margin + dayWidth * i;
                this.ctx.beginPath();
                this.ctx.moveTo(xLine, adjustedHeight - margin);
                this.ctx.lineTo(xLine, margin);
                this.ctx.lineWidth = this.settings.gridLineWidth;
                this.ctx.strokeStyle = this.settings.gridColor;
                this.ctx.stroke();
            }
        }

        const rightEdge = margin + chartWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(rightEdge, adjustedHeight - margin);
        this.ctx.lineTo(rightEdge, margin);
        this.ctx.lineWidth = this.settings.gridLineWidth;
        this.ctx.strokeStyle = this.settings.gridColor;
        this.ctx.stroke();
    }

    build() {
        this.initializeCanvas();
        this.drawTitle();
        this.drawAxes();
        this.drawTimeLabels();
        this.drawDayLabels();
    }
}
