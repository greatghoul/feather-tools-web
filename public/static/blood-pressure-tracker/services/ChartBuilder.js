export default class ChartBuilder {
  constructor(canvas, settings = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) throw new Error('Could not get canvas context');

    // Initialize all styling settings in the constructor
    this.settings = {
      // Canvas dimensions
      a4Width: 595 * 2, // 210mm * 2.83465 * 2
      a4Height: 842 * 2, // 297mm * 2.83465 * 2
      margin: 50 * 2,

      // Title settings
      titleFont: '28px Arial', // 14px * 2
      titleText: 'Monthly Blood Pressure Chart',

      // Axis settings
      axisFont: '16px sans-serif', // 8px * 2
      axisLineWidth: 2, // 1 * 2

      // Grid line settings
      majorGridColor: '#999',
      minorGridColor: '#ccc',
      gridLineWidth: 2, // 1 * 2

      // Tick settings
      majorTickLength: 10, // 5 * 2
      minorTickLength: 6, // 3 * 2
      tickLineColor: '#333',
      tickLineWidth: 2, // 1 * 2

      // Axis range settings
      yMin: 60,
      yMax: 180,
      yStep: 0.5, // Minor tick interval (1 / 2)
      yMajorStep: 5, // Major tick interval (unchanged)
      xMin: 1,
      xMax: 32,
      xStep: 1,
      subDivisions: 3,
      
      // Date type settings
      dateType: 'monthly', // 'monthly', 'weekly', 'bi-weekly'
      weekStart: 'sunday', // 'sunday', 'monday' - only relevant for week/bi-weekly
      blankTitle: false, // whether to show blank title with underline

      ...settings,
    };

    // Calculate derived dimensions
    this.calculateDimensions();
    
    // Apply x-axis configuration based on date type
    const xAxisConfig = this.getXAxisConfig();
    this.settings.xMax = xAxisConfig.xMax;
    this.settings.subDivisions = xAxisConfig.subDivisions;
    this.settings.titleText = xAxisConfig.titleText;
    this.settings.xLabels = xAxisConfig.labels;
    this.settings.xRange = this.settings.xMax - this.settings.xMin;
  }

  // Calculate chart dimensions based on settings
  calculateDimensions() {
    let { a4Width, a4Height, margin } = this.settings;
    
    // Swap width and height for landscape orientation
    const temp = a4Width;
    a4Width = a4Height;
    a4Height = temp;
    
    // Store adjusted dimensions for use in other methods
    this.settings.adjustedWidth = a4Width;
    this.settings.adjustedHeight = a4Height;
    
    this.settings.chartWidth = a4Width - margin * 2;
    this.settings.chartHeight = a4Height - margin * 2;
    this.settings.yRange = this.settings.yMax - this.settings.yMin;
    this.settings.xRange = this.settings.xMax - this.settings.xMin;
  }

  // Get x-axis configuration based on date type
  getXAxisConfig() {
    const { dateType, weekStart } = this.settings;
    
    // Generate day labels based on week start preference
    const getDayLabels = (weekStart) => {
      const sundayFirst = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const mondayFirst = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return weekStart === 'monday' ? mondayFirst : sundayFirst;
    };
    
    switch (dateType) {
      case 'weekly':
        return {
          labels: getDayLabels(weekStart),
          xMax: 8, // 7 days + 1 for grid structure
          subDivisions: 3,
          titleText: 'Weekly Blood Pressure Chart'
        };
      case 'bi-weekly':
        const dayLabels = getDayLabels(weekStart);
        return {
          labels: [...dayLabels, ...dayLabels], // Repeat for two weeks
          xMax: 15, // 14 days + 1 for grid structure
          subDivisions: 3,
          titleText: 'Bi-weekly Blood Pressure Chart'
        };
      case 'monthly':
      default:
        return {
          labels: Array.from({ length: 31 }, (_, i) => (i + 1).toString()),
          xMax: 32,
          subDivisions: 3,
          titleText: 'Monthly Blood Pressure Chart'
        };
    }
  }

  // Initialize canvas dimensions and styles
  initializeCanvas() {
    const { adjustedWidth, adjustedHeight } = this.settings;
    this.canvas.width = adjustedWidth;
    this.canvas.height = adjustedHeight;
    this.canvas.style.width = '100%';
    this.canvas.style.height = 'auto';
    // Set canvas background to white
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(0, 0, adjustedWidth, adjustedHeight);
    this.ctx.fillStyle = '#000';
  }

  // Draw chart title
  drawTitle() {
    const { adjustedWidth, margin, titleFont, titleText, blankTitle } = this.settings;

    this.ctx.font = titleFont;
    this.ctx.textAlign = 'center';
    const titleY = margin - 30;
    
    if (blankTitle) {
      // Draw an underlined blank space for users to fill in
      const underlineWidth = 400; // Width of the underline
      const underlineX = (adjustedWidth - underlineWidth) / 2;
      
      // Draw the underline
      this.ctx.beginPath();
      this.ctx.moveTo(underlineX, titleY + 5);
      this.ctx.lineTo(underlineX + underlineWidth, titleY + 5);
      this.ctx.strokeStyle = '#999';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    } else {
      // Draw the regular title text
      this.ctx.fillText(titleText, adjustedWidth / 2, titleY);
    }
  }

  // Draw main axes
  drawAxes() {
    const { margin, adjustedHeight, adjustedWidth, axisColor, axisLineWidth } = this.settings;

    this.ctx.beginPath();
    this.ctx.moveTo(margin, margin);
    this.ctx.lineTo(margin, adjustedHeight - margin);
    this.ctx.lineTo(adjustedWidth - margin, adjustedHeight - margin);
    this.ctx.strokeStyle = axisColor;
    this.ctx.lineWidth = axisLineWidth;
    this.ctx.stroke();
  }

  // Draw Y-axis ticks and grid lines
  drawYAxis() {
    const { margin, adjustedHeight, adjustedWidth, chartHeight, yMin, yMax, yMajorStep } = this.settings;
    const { majorTickLength, minorTickLength, tickLineWidth, majorGridColor, minorGridColor, gridLineWidth } = this.settings;

    this.ctx.textAlign = 'right';

    for (let value = yMin; value <= yMax; value++) {
      const y = adjustedHeight - margin - ((value - yMin) / (yMax - yMin)) * chartHeight;

      // Draw tick
      this.ctx.beginPath();
      this.ctx.moveTo(margin - (value % yMajorStep === 0 ? majorTickLength : minorTickLength), y);
      this.ctx.lineTo(margin, y);
      this.ctx.lineWidth = tickLineWidth;
      this.ctx.strokeStyle = this.settings.tickLineColor;
      this.ctx.stroke();

      // Draw grid line
      this.ctx.beginPath();
      this.ctx.moveTo(margin, y);
      this.ctx.lineTo(adjustedWidth - margin, y);
      this.ctx.lineWidth = gridLineWidth;
      this.ctx.strokeStyle = value % yMajorStep === 0 ? majorGridColor : minorGridColor;
      this.ctx.stroke();
      this.ctx.setLineDash([]);

      // Draw text for major steps
      if (value % yMajorStep === 0) {
        this.ctx.font = this.settings.axisFont;
        this.ctx.fillText(value.toString(), margin - 20, y + 6);
      }

      this.ctx.strokeStyle = this.settings.axisColor;
    }
  }

  // Draw X-axis ticks and grid lines
  drawXAxis() {
    const { margin, adjustedHeight, chartWidth, xMin, xMax, subDivisions, xLabels } = this.settings;
    const { majorTickLength, minorTickLength, tickLineWidth, majorGridColor, minorGridColor, gridLineWidth } = this.settings;

    this.ctx.textAlign = 'center';

    for (let day = xMin; day <= xMax; day++) {
      const isLastDay = day === xMax;
      const x = margin + ((day - xMin) / (xMax - xMin)) * chartWidth;

      if (!isLastDay) {
        // Draw main tick
        this.ctx.beginPath();
        this.ctx.moveTo(x, adjustedHeight - margin);
        this.ctx.lineTo(x, adjustedHeight - margin + majorTickLength);
        this.ctx.strokeStyle = this.settings.tickLineColor;
        this.ctx.lineWidth = tickLineWidth;
        this.ctx.stroke();

        // Draw sub-ticks
        const interval = (chartWidth / (xMax - xMin)) / (subDivisions + 1);
        for (let i = 1; i <= subDivisions; i++) {
          const subX = x + interval * i;

          // Sub-tick line
          this.ctx.beginPath();
          this.ctx.moveTo(subX, adjustedHeight - margin);
          this.ctx.lineTo(subX, adjustedHeight - margin + minorTickLength);
          this.ctx.lineWidth = tickLineWidth;
          this.ctx.strokeStyle = this.settings.tickLineColor;
          this.ctx.stroke();

          // Sub-tick grid line
          this.ctx.beginPath();
          this.ctx.setLineDash([]);
          this.ctx.moveTo(subX, adjustedHeight - margin);
          this.ctx.lineTo(subX, margin);
          this.ctx.lineWidth = gridLineWidth;
          this.ctx.strokeStyle = minorGridColor;
          this.ctx.stroke();
          this.ctx.setLineDash([]);
        }
      }

      // Draw grid line
      this.ctx.beginPath();
      this.ctx.moveTo(x, adjustedHeight - margin);
      this.ctx.lineTo(x, margin);
      this.ctx.lineWidth = gridLineWidth;
      this.ctx.strokeStyle = majorGridColor;
      this.ctx.stroke();
      this.ctx.setLineDash([]);

      // Draw day text using labels from configuration
      if (!isLastDay) {
        const textX = x + (chartWidth / (xMax - xMin)) / 2;
        this.ctx.font = this.settings.axisFont;
        const labelIndex = day - xMin;
        const label = xLabels && xLabels[labelIndex] ? xLabels[labelIndex] : day.toString();
        this.ctx.fillText(label, textX, adjustedHeight - margin + 30);
      }

      this.ctx.strokeStyle = this.settings.axisColor;
    }
  }

  // Main build method to orchestrate the chart drawing
  build() {
    this.initializeCanvas();
    this.drawTitle();
    this.drawAxes();
    this.drawYAxis();
    this.drawXAxis();
    this.drawSafeLines();
  }

  drawSafeLines() {
    const { margin, adjustedHeight, adjustedWidth, chartHeight, yMin, yMax, diastolicSafe, systolicSafe } = this.settings;
    if (diastolicSafe && systolicSafe) {
      [diastolicSafe, systolicSafe].forEach(safeValue => {
        const y = adjustedHeight - margin - ((safeValue - yMin) / (yMax - yMin)) * chartHeight;
        this.ctx.beginPath();
        this.ctx.moveTo(margin - 10, y);
        this.ctx.lineTo(adjustedWidth - margin + 10, y);
        this.ctx.lineWidth = 1.5;
        this.ctx.strokeStyle = 'green';
        this.ctx.stroke();
      });
    }
  }
}