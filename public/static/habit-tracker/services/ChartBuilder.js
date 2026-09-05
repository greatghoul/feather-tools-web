class ChartBuilder {
    constructor(canvas, settings) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.settings = settings;
        
        // Set default print layout (1, 2, 3, or 4 charts per page)
        this.printLayout = settings.printLayout || 1;
        
        // Set canvas size for A4 (210mm x 297mm at 192 DPI - doubled resolution)
        const portraitWidth = 1588;  // 210mm * 192 DPI / 25.4
        const portraitHeight = 2246; // 297mm * 192 DPI / 25.4
        
        if (this.printLayout === 2 || this.printLayout === 3) {
            // Landscape mode
            this.canvas.width = portraitHeight;
            this.canvas.height = portraitWidth;
        } else {
            // Portrait mode
            this.canvas.width = portraitWidth;
            this.canvas.height = portraitHeight;
        }
        
        // Table configuration - Vertical: months, Horizontal: days
        this.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        this.days = Array.from({length: 31}, (_, i) => i + 1);
        
        // Initialize layout based on printLayout setting
        this._initializeLayout();
    }
    
    _initializeLayout() {
        // Set margins for printer compatibility
        let margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        };

        // Add space for title area above each chart
        const titleAreaHeight = 80; // Space for title and underline
        
        // Add spacing between charts for multi-chart layouts
        const chartSpacing = 40;
        
        let chartPositions = [{ x: 0, y: titleAreaHeight }];
        let chartWidth, chartHeight;
        
        if (this.printLayout === 1) {
            // Single chart - use full canvas with title area
            chartWidth = this.canvas.width;
            chartHeight = this.canvas.height - titleAreaHeight;
        } else if (this.printLayout === 2) {
            // Two charts (side by side) with spacing and margins
            margin = {
                top: 80,
                right: 80,
                bottom: 80,
                left: 80
            };
            const availableWidth = this.canvas.width - margin.left - margin.right - chartSpacing;
            const availableHeight = this.canvas.height - margin.top - margin.bottom;
            chartWidth = availableWidth / 2;
            chartHeight = availableHeight - titleAreaHeight;
            chartPositions = [
                { x: margin.left, y: margin.top + titleAreaHeight },
                { x: margin.left + chartWidth + chartSpacing, y: margin.top + titleAreaHeight }
            ];
        } else if (this.printLayout === 3) {
            // Three charts (side by side) with spacing and margins
            margin = {
                top: 80,
                right: 80,
                bottom: 80,
                left: 80
            };
            const availableWidth = this.canvas.width - margin.left - margin.right - chartSpacing * 2;
            const availableHeight = this.canvas.height - margin.top - margin.bottom;
            chartWidth = availableWidth / 3;
            chartHeight = availableHeight - titleAreaHeight;
            chartPositions = [
                { x: margin.left, y: margin.top + titleAreaHeight },
                { x: margin.left + chartWidth + chartSpacing, y: margin.top + titleAreaHeight },
                { x: margin.left + (chartWidth + chartSpacing) * 2, y: margin.top + titleAreaHeight }
            ];
        } else if (this.printLayout === 4) {
            // Four charts (2x2 grid) with spacing
            chartWidth = (this.canvas.width - chartSpacing) / 2;
            chartHeight = (this.canvas.height - chartSpacing - titleAreaHeight * 2) / 2;
            chartPositions = [
                { x: 0, y: titleAreaHeight },
                { x: chartWidth + chartSpacing, y: titleAreaHeight },
                { x: 0, y: chartHeight + chartSpacing + titleAreaHeight * 2 },
                { x: chartWidth + chartSpacing, y: chartHeight + chartSpacing + titleAreaHeight * 2 }
            ];
        }
        
        this.margin = margin;
        this.chartPositions = chartPositions;
        this.chartArea = {
            width: chartWidth,
            height: chartHeight
        };
    }

    _isWeekend(year, month, day) {
        const d = new Date(year, month, day);
        const dayOfWeek = d.getDay();
        return dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday
    }

    _getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }
    
    build() {
        this.clearCanvas();
        this.drawBackground();
        
        // Draw chart(s) without title
        // Always use chartPositions to ensure consistent margin application
        this.chartPositions.forEach((position, index) => {
            this.drawTable(position);
        });
    }
    
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawBackground() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawTitleArea(chartX, chartY) {
        // Title area is 80px high, draw underline at the bottom with spacing
        const titleAreaHeight = 80;
        const underlineWidth = this.chartArea.width / 2; // 1/2 of chart width
        const underlineX = chartX + (this.chartArea.width - underlineWidth) / 2;
        
        // Position underline 20px above the table (chartY is the top of the table)
        const underlineY = chartY - 20;

        if (this.settings.yearType === 'specific') {
            const year = this.settings.year;
            this.ctx.fillStyle = '#333333';
            this.ctx.font = 'bold 32px Arial, sans-serif';
            this.ctx.textAlign = 'left'; // Align to the left
            this.ctx.textBaseline = 'bottom'; // Align the bottom of the text with titleY
            const titleX = underlineX; // Align with the start of the underline
            const titleY = underlineY - 10; // 10px above the underline
            this.ctx.fillText(year, titleX, titleY);
        }
        
        // Draw underline
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(underlineX, underlineY);
        this.ctx.lineTo(underlineX + underlineWidth, underlineY);
        this.ctx.stroke();
    }
    
    drawTable(position = { x: 0, y: 0 }) {
        // Use full canvas space without margins
        const chartX = position.x;
        const chartY = position.y;
        
        // Draw title area and underline for all layouts
        this.drawTitleArea(chartX, chartY);
        
        // Vertical: days, Horizontal: months
        // Add a header row, so total rows are days.length + 1
        const cols = this.months.length;
        const cellWidth = this.chartArea.width / cols;
        const cellHeight = this.chartArea.height / (this.days.length + 1); // +1 for header row
        
        // Adjust font size based on layout
        let headerFontSize = 24;
        if (this.printLayout === 2) {
            headerFontSize = 18;
        } else if (this.printLayout === 3) {
            headerFontSize = 14;
        } else if (this.printLayout === 4) {
            headerFontSize = 12;
        }
        
        // Draw table border
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 1; // Consistent line width for all borders
        this.ctx.strokeRect(chartX, chartY, this.chartArea.width, this.chartArea.height);
        
        // Set text style
        this.ctx.fillStyle = '#333333';
        this.ctx.font = `bold ${headerFontSize}px Arial, sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Draw month headers (horizontal) in the header row
        this.months.forEach((month, colIndex) => {
            const x = chartX + colIndex * cellWidth;
            const y = chartY;
            
            // Set text style before drawing
            this.ctx.fillStyle = '#333333';
            this.ctx.font = `bold ${headerFontSize}px Arial, sans-serif`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Draw cell border
            this.ctx.strokeStyle = '#333333';
            this.ctx.lineWidth = 1; // Consistent line width for all borders
            // Add light background for month header cell
            this.ctx.fillStyle = '#f8f9fa';
            this.ctx.fillRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2);
            this.ctx.strokeRect(x, y, cellWidth, cellHeight);
            
            // Draw month text in uppercase (set fillStyle back to text color)
            this.ctx.fillStyle = '#333333';
            this.ctx.fillText(month.toUpperCase(), x + cellWidth / 2, y + cellHeight / 2);
        });
        
        // Draw grid lines for the table
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 1; // Consistent line width and color for all borders
        
        // Vertical lines (for months)
        for (let i = 1; i <= this.months.length; i++) {
            const x = chartX + i * cellWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(x, chartY);
            this.ctx.lineTo(x, chartY + this.chartArea.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines - include header row separator
        for (let i = 1; i <= this.days.length; i++) {
            const y = chartY + i * cellHeight;
            this.ctx.beginPath();
            this.ctx.moveTo(chartX, y);
            this.ctx.lineTo(chartX + this.chartArea.width, y);
            this.ctx.stroke();
        }
        
        // Draw data cells (empty cells for habit tracking) - shifted down by one row
        this.days.forEach((day, rowIndex) => {
            this.months.forEach((month, colIndex) => {
                const x = chartX + colIndex * cellWidth;
                const y = chartY + (rowIndex + 1) * cellHeight; // +1 to account for header row
                
                // Draw cell border
                this.ctx.strokeStyle = '#333333';
                this.ctx.lineWidth = 1; // Consistent line width for all borders
                this.ctx.strokeRect(x, y, cellWidth, cellHeight);

                if (this.settings.yearType === 'specific') {
                    const year = this.settings.year;
                    const daysInMonth = this._getDaysInMonth(year, colIndex);
                    if (day <= daysInMonth) {
                        if (this._isWeekend(year, colIndex, day)) {
                            this.ctx.fillStyle = '#e9ecef'; // Darker grey for weekends
                            this.ctx.fillRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2);
                        }
                        this.ctx.fillStyle = '#666666';
                        this.ctx.font = `${headerFontSize}px Arial, sans-serif`;
                        this.ctx.textAlign = 'center';
                        this.ctx.textBaseline = 'middle';
                        this.ctx.fillText(day.toString(), x + cellWidth / 2, y + cellHeight / 2);
                    }
                } else {
                    this.ctx.fillStyle = '#666666';
                    this.ctx.font = `${headerFontSize}px Arial, sans-serif`;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(day.toString(), x + cellWidth / 2, y + cellHeight / 2);
                }
            });
        });
    }
}

export default ChartBuilder;