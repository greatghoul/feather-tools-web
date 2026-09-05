/**
 * Global Canvas Printer Service
 * Provides functionality to print any canvas element with customizable settings
 */
class CanvasPrinter {
    constructor(canvas, settings = {}) {
        this.canvas = canvas;
        this.settings = settings;
        this.format = settings.format || 'jpeg'; // Default format
        this.quality = settings.quality || 0.9;  // Default quality
        this.pageSize = settings.pageSize || 'A4';
        this.pageOrientation = settings.pageOrientation || 'portrait';
        this.renderScale = settings.renderScale || 1;
        this.dpi = settings.dpi || 96;
    }

    /**
     * Print the canvas content
     * @returns {Promise} Promise that resolves when printing is initiated
     */
    print() {
        if (!this.canvas) {
            console.error('Canvas element is required for printing');
            return Promise.reject(new Error('Canvas element is required'));
        }
        
        return new Promise((resolve) => {
            this.canvas.toBlob((blob) => {
                if (!blob) {
                    console.error('Failed to create blob from canvas');
                    return;
                }
                
                const url = URL.createObjectURL(blob);
                const printWindow = window.open(url, '_blank');
                
                printWindow.onload = () => {
                    this._setupPrintStyles(printWindow);
                    this._executePrint(printWindow, url);
                    resolve();
                };
            }, `image/${this.format}`, this.quality);
        });
    }



    /**
     * Set up print styles
     */
    _setupPrintStyles(printWindow) {
        const style = printWindow.document.createElement('style');
        
        style.textContent = this._getPrintStyle();
        printWindow.document.head.appendChild(style);
    }

    /**
     * Calculate page dimensions from canvas pixel size using CSS 96dpi conversion.
     * @returns {{ widthMm: number, heightMm: number }}
     */
    _getPageDimensions() {
        if (!this.canvas) {
            return { widthMm: 210, heightMm: 297 };
        }
        // Divide by renderScale and convert using the canvas DPI
        const baseW = this.canvas.width / this.renderScale;
        const baseH = this.canvas.height / this.renderScale;
        const wMm = baseW / this.dpi * 25.4;
        const hMm = baseH / this.dpi * 25.4;
        return { widthMm: Math.round(wMm * 10) / 10, heightMm: Math.round(hMm * 10) / 10 };
    }

    /**
     * Get print CSS styles
     */
    _getPrintStyle() {
        const { widthMm, heightMm } = this._getPageDimensions();
        return `
            @page {
                size: ${widthMm}mm ${heightMm}mm;
                margin: 0;
            }
            body {
                margin: 0;
                padding: 0;
                background-color: white !important;
                font-family: Arial, sans-serif;
            }
            img {
                display: block;
                margin: 0 auto;
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
        `;
    }

    /**
     * Execute print and cleanup resources
     */
    _executePrint(printWindow, url) {
        printWindow.print();
        printWindow.onafterprint = () => {
            this._cleanupResources(url, printWindow);
        };
    }

    /**
     * Clean up resources after printing
     */
    _cleanupResources(url, printWindow) {
        URL.revokeObjectURL(url);
        printWindow.close();
    }
}

export default CanvasPrinter;
