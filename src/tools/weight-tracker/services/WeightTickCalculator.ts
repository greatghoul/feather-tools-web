class WeightTickCalculator  {
    private chartHeight: any;
        private weightRange: any;
        private range: any;
        private yMajorStep: any;
        private yStep: any;
        private majorTickLength: any;
        private minorTickLength: any;
        private mediumTickLength: any;

    constructor(chartHeight, weightRange) {
        this.chartHeight = chartHeight;
        this.weightRange = weightRange;
        
        // Calculate range
        this.range = weightRange.max - weightRange.min;
        
        // Define tick settings based on range
        if (this.range <= 10) {
            this.yMajorStep = 1;
            this.yStep = 0.1;
            this.majorTickLength = 10;
            this.minorTickLength = 4;
            this.mediumTickLength = 7; // For 0.5 intervals
        } else if (this.range <= 30) {
            this.yMajorStep = 1;
            this.yStep = 0.5;
            this.majorTickLength = 10;
            this.minorTickLength = 4;
            // No medium ticks for this range, only major and minor
        } else {
            this.yStep = 1;
            this.yMajorStep = 5;
            this.majorTickLength = 10;
            this.minorTickLength = 6;
        }
    }

    perform() {
        const ticks: any[] = [];

        // Draw all major ticks and labels
        for (let value = this.weightRange.min; value <= this.weightRange.max; value += this.yMajorStep) {
            const y = this.calculateYPosition(value);
            
            ticks.push({
                label: value.toFixed(0),
                position: y,
                level: 'major',
                tickLength: this.majorTickLength
            });
        }

        // Draw sub-ticks between major ticks
        if (this.range <= 10) {
            // For small ranges, use 0.1 step with medium ticks at 0.5
            for (let value = this.weightRange.min; value <= this.weightRange.max; value += this.yStep) {
                // Skip values that are already major ticks
                if (value % this.yMajorStep === 0) continue;
                
                const y = this.calculateYPosition(value);
                
                // Check if this is a 0.5 interval
                const roundedValueTimes10 = Math.round(value * 10); // Convert to integer by multiplying by 10
                const isMediumTick = (roundedValueTimes10 % 10) === 5; // Check if last digit is 5
                
                ticks.push({
                    label: null,
                    position: y,
                    level: isMediumTick ? 'medium' : 'minor',
                    tickLength: isMediumTick ? this.mediumTickLength : this.minorTickLength
                });
            }
        } else if (this.range <= 30) {
            // For medium ranges, use 0.5 step with only minor ticks (no medium ticks)
            for (let value = this.weightRange.min; value <= this.weightRange.max; value += this.yStep) {
                // Skip values that are already major ticks
                if (value % this.yMajorStep === 0) continue;
                
                const y = this.calculateYPosition(value);
                
                ticks.push({
                    label: null,
                    position: y,
                    level: 'minor',
                    tickLength: this.minorTickLength
                });
            }
        } else {
            // For larger ranges, use 1 step with only minor ticks
            for (let value = this.weightRange.min; value <= this.weightRange.max; value += this.yStep) {
                // Skip values that are already major ticks
                if (value % this.yMajorStep === 0) continue;
                
                const y = this.calculateYPosition(value);
                
                ticks.push({
                    label: null,
                    position: y,
                    level: 'minor',
                    tickLength: this.minorTickLength
                });
            }
        }

        return ticks;
    }

    calculateYPosition(value) {
        return ((this.weightRange.max - value) / this.range) * this.chartHeight;
    }
}

export default WeightTickCalculator;
