import WeightTickCalculator from '../services/WeightTickCalculator';

class ChartBuilder  {

    private canvas: any;
        private ctx: any;
        private settings: any;
        private margin: any;
        private chartArea: any;

    constructor(canvas, settings) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Initialize settings with sub-scale configuration
        this.settings = {
            // Sub-scale configuration (similar to blood pressure chart)
            yStep: 1, // Minor tick interval (sub-divisions)
            yMajorStep: 5, // Major tick interval
            
            // Grid line settings
            majorGridColor: '#999',
            mediumGridColor: '#bbb',
            minorGridColor: '#ccc',
            gridLineWidth: 0.5,
            
            // Tick settings
            majorTickLength: 10,
            minorTickLength: 6,
            tickLineColor: '#333',
            tickLineWidth: 2,
            
            ...settings
        };
        
        // Set canvas size for A4 landscape (297mm x 210mm at 96 DPI)
        this.canvas.width = 1123; // 297mm * 96 DPI / 25.4
        this.canvas.height = 794;  // 210mm * 96 DPI / 25.4
        
        this.margin = {
            top: 80,
            right: 80,
            bottom: 80,
            left: 80
        };
        
        this.chartArea = {
            x: this.margin.left,
            y: this.margin.top + 40, // Move chart area down by 40 pixels
            width: this.canvas.width - this.margin.left - this.margin.right,
            height: this.canvas.height - this.margin.top - this.margin.bottom - 40 // Reduce height to maintain bottom margin
        };
    }
    
    build() {
        this.clearCanvas();
        this.drawBackground();
        this.drawTitle();
        this.drawChartArea();
        this.drawGrid();
        this.drawAxes();
        this.drawTargetLine();
        this.drawDataPoints();
        this.drawLegend();
    }
    
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawBackground() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawTitle() {
        this.ctx.fillStyle = '#333333';
        this.ctx.font = 'bold 24px Arial, sans-serif';
        this.ctx.textAlign = 'center';
        
        // Use custom title if enabled, otherwise use default title based on date range
        const titleText = this.settings.customTitle && this.settings.chartTitle 
            ? this.settings.chartTitle 
            : this.getDateRangeText();
        
        this.ctx.fillText(
            titleText,
            this.canvas.width / 2,
            this.margin.top / 2 + 40 // Move title down by 40 pixels
        );
    }
    
    getDateRangeText() {
        const { dateRange } = this.settings;
        
        switch (dateRange) {
            case 'weekly':
                return 'Weekly Weight Tracking';
            case 'biweekly':
                return 'Bi-weekly Weight Tracking';
            default:
                return 'Monthly Weight Tracking';
        }
    }
    
    drawChartArea() {
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(
            this.chartArea.x,
            this.chartArea.y,
            this.chartArea.width,
            this.chartArea.height
        );
    }
    
    drawGrid() {
        const weightRange = this.getWeightRange();
        const { majorGridColor, mediumGridColor, minorGridColor, gridLineWidth } = this.settings;
        
        this.ctx.lineWidth = gridLineWidth;
        
        // Calculate weight ticks using WeightTickCalculator
        const tickCalculator = new WeightTickCalculator(
            this.chartArea.height,
            weightRange
        );
        const weightTicks = tickCalculator.perform();
        
        // Draw horizontal grid lines for all ticks
        weightTicks.forEach(tick => {
            const y = this.chartArea.y + tick.position;
            
            // Use different colors for major, medium, and minor grid lines
            if (tick.level === 'major') {
                this.ctx.strokeStyle = majorGridColor;
            } else if (tick.level === 'medium') {
                this.ctx.strokeStyle = mediumGridColor;
            } else {
                this.ctx.strokeStyle = minorGridColor;
            }
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.chartArea.x, y);
            this.ctx.lineTo(this.chartArea.x + this.chartArea.width, y);
            this.ctx.stroke();
        });
        
        // Vertical grid lines - align with all ticks (main ticks and sub-ticks)
        const days = this.getDaysCount();
        
        // Draw grid lines for all main ticks and sub-ticks
        for (let i = 0; i <= days; i++) {
            // Main tick positions (including 0 position)
            const mainTickX = this.chartArea.x + (i / days) * this.chartArea.width;
            this.ctx.strokeStyle = majorGridColor;
            this.ctx.beginPath();
            this.ctx.moveTo(mainTickX, this.chartArea.y);
            this.ctx.lineTo(mainTickX, this.chartArea.y + this.chartArea.height);
            this.ctx.stroke();
            
            // Draw grid lines for sub-ticks (except for the last interval)
            if (i < days) {
                for (let j = 1; j <= 3; j++) {
                    const subTickX = this.chartArea.x + ((i + j/4) / days) * this.chartArea.width;
                    this.ctx.strokeStyle = minorGridColor;
                    this.ctx.beginPath();
                    this.ctx.moveTo(subTickX, this.chartArea.y);
                    this.ctx.lineTo(subTickX, this.chartArea.y + this.chartArea.height);
                    this.ctx.stroke();
                }
            }
        }
    }
    
    drawAxes() {
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 2;
        
        // X-axis
        this.ctx.beginPath();
        this.ctx.moveTo(this.chartArea.x, this.chartArea.y + this.chartArea.height);
        this.ctx.lineTo(this.chartArea.x + this.chartArea.width, this.chartArea.y + this.chartArea.height);
        this.ctx.stroke();
        
        // Y-axis
        this.ctx.beginPath();
        this.ctx.moveTo(this.chartArea.x, this.chartArea.y);
        this.ctx.lineTo(this.chartArea.x, this.chartArea.y + this.chartArea.height);
        this.ctx.stroke();
        
        this.drawAxisLabels();
    }
    
    drawAxisLabels() {
        this.ctx.fillStyle = '#333333';
        this.ctx.font = '12px Arial, sans-serif';
        
        // Get tick settings for both X and Y axes
        const { majorTickLength, minorTickLength, tickLineColor, tickLineWidth } = this.settings;
        
        // X-axis labels (dates)
        const days = this.getDaysCount();
        const dateLabels = this.generateDateLabels(days);
        
        // Calculate the width of each day interval
        const dayIntervalWidth = this.chartArea.width / days;
        
        // Draw main tick at position 0 (without label)
        const zeroTickX = this.chartArea.x;
        this.ctx.beginPath();
        this.ctx.moveTo(zeroTickX, this.chartArea.y + this.chartArea.height);
        this.ctx.lineTo(zeroTickX, this.chartArea.y + this.chartArea.height + majorTickLength);
        this.ctx.strokeStyle = tickLineColor;
        this.ctx.lineWidth = tickLineWidth;
        this.ctx.stroke();
        
        // Draw X-axis ticks and labels
        dateLabels.forEach((label, i) => {
            // Main tick position (at the end of each day interval)
            const mainTickX = this.chartArea.x + ((i + 1) / dateLabels.length) * this.chartArea.width;
            
            // Draw main tick
            this.ctx.beginPath();
            this.ctx.moveTo(mainTickX, this.chartArea.y + this.chartArea.height);
            this.ctx.lineTo(mainTickX, this.chartArea.y + this.chartArea.height + majorTickLength);
            this.ctx.strokeStyle = tickLineColor;
            this.ctx.lineWidth = tickLineWidth;
            this.ctx.stroke();
            
            // Draw three sub-ticks for each day interval (dividing into 4 equal parts)
            for (let j = 1; j <= 3; j++) {
                const subTickX = this.chartArea.x + ((i + j/4) / dateLabels.length) * this.chartArea.width;
                
                this.ctx.beginPath();
                this.ctx.moveTo(subTickX, this.chartArea.y + this.chartArea.height);
                this.ctx.lineTo(subTickX, this.chartArea.y + this.chartArea.height + minorTickLength);
                this.ctx.strokeStyle = tickLineColor;
                this.ctx.lineWidth = tickLineWidth;
                this.ctx.stroke();
            }
            
            // Position label in the middle of the left area of the main tick
            // The left area is from the previous main tick to the current main tick
            const previousMainTickX = i === 0 ? this.chartArea.x : 
                this.chartArea.x + (i / dateLabels.length) * this.chartArea.width;
            const labelX = previousMainTickX + (mainTickX - previousMainTickX) / 2;
            const labelY = this.chartArea.y + this.chartArea.height + 20;
            
            this.ctx.textAlign = 'center';
            this.ctx.fillText(label, labelX, labelY);
        });
        
        // Y-axis labels and ticks (weight)
        this.ctx.textAlign = 'right';
        const weightRange = this.getWeightRange();
        
        // Calculate weight ticks using WeightTickCalculator
        const tickCalculator = new WeightTickCalculator(
            this.chartArea.height,
            weightRange
        );
        const weightTicks = tickCalculator.perform();
        
        // Draw Y-axis ticks and labels based on calculated ticks
        weightTicks.forEach(tick => {
            const y = this.chartArea.y + tick.position;
            
            // Draw tick
            this.ctx.beginPath();
            this.ctx.moveTo(this.chartArea.x - tick.tickLength, y);
            this.ctx.lineTo(this.chartArea.x, y);
            this.ctx.strokeStyle = tickLineColor;
            this.ctx.lineWidth = tickLineWidth;
            this.ctx.stroke();
            
            // Draw label for major ticks
            if (tick.label) {
                this.ctx.fillText(tick.label, this.chartArea.x - 15, y + 4);
            }
        });
        
        // Axis titles removed as requested
    }
    
    drawTargetLine() {
        
        const weightRange = this.getWeightRange();
        const targetY = this.chartArea.y + 
            ((weightRange.max - this.settings.targetWeight) / (weightRange.max - weightRange.min)) * this.chartArea.height;
        
        this.ctx.strokeStyle = '#ff6b6b';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.chartArea.x, targetY);
        this.ctx.lineTo(this.chartArea.x + this.chartArea.width, targetY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Target weight label removed as requested
    }
    
    drawDataPoints() {
        // No sample data points to draw - chart will be blank for user to fill in
    }
    
    drawLegend() {
        // Only show legend if target weight is set
        if (this.settings.targetWeight === null) {
            return;
        }
        
        const legendX = this.chartArea.x + this.chartArea.width - 150;
        
        // Calculate the exact center line of the title
        // Title is drawn with 24px font at baseline y = this.margin.top / 2 + 40
        // For most fonts, the center line is approximately half the font size below the baseline
        const titleBaselineY = this.margin.top / 2 + 40;
        const titleCenterY = titleBaselineY - 12; // Center line is 12px above baseline for 24px font
        
        // Add a downward offset to move the legend slightly lower
        const downwardOffset = 4;
        
        // Set legend line with downward offset
        const legendLineY = titleCenterY + downwardOffset;
        
        // Set legend text baseline with downward offset
        const legendTextY = titleCenterY + 6 + downwardOffset;
        
        this.ctx.fillStyle = '#333333';
        this.ctx.font = '12px Arial, sans-serif';
        this.ctx.textAlign = 'left';
        
        // Draw target weight line at title center line height with offset
        this.ctx.strokeStyle = '#ff6b6b';
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(legendX, legendLineY);
        this.ctx.lineTo(legendX + 20, legendLineY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw text with baseline positioned to align center with title
        this.ctx.fillText('Target Weight', legendX + 25, legendTextY);
    }
    
    getDaysCount() {
        switch (this.settings.dateRange) {
            case 'weekly':
                return 7;
            case 'biweekly':
                return 14;
            default:
                return 31; // Monthly
        }
    }
    
    getWeightRange() {
        const min = typeof this.settings.weightRangeMin === 'undefined' ? 60 : this.settings.weightRangeMin;
        const max = typeof this.settings.weightRangeMax === 'undefined' ? 80 : this.settings.weightRangeMax;
        
        return { min, max };
    }
    
    generateDateLabels(days) {
        const labels: string[] = [];
        
        if (this.settings.dateRange === 'monthly') {
            // Monthly: fixed labels from 1 to 31
            for (let i = 1; i <= days; i += 1) {
                labels.push(i.toString());
            }
        } else {
            // Weekly and Bi-weekly: day of week labels based on Start of the Week
            const weekDays = this.settings.weekStart === 'monday' 
                ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            
            for (let i = 0; i < days; i += 1) {
                const dayIndex = i % 7;
                labels.push(weekDays[dayIndex]);
            }
        }
        
        return labels;
    }
    

}

export default ChartBuilder;
