/**
 * Global Canvas Printer Service
 * Provides functionality to print any canvas element with customizable settings
 */
class CanvasPrinter  {
    private canvas: any;
    private canvases: any[];
        private settings: any;
        private format: any;
        private quality: any;
        private pageSize: any;
        private pageOrientation: any;
        private renderScale: any;
        private dpi: any;

    constructor(canvas, settings: any = {}) {
        this.canvases = Array.isArray(canvas) ? canvas : [canvas];
        this.canvas = this.canvases[0];
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

        if (this.canvases.length > 1) {
            return this._printMultiple();
        }

        return new Promise<void>((resolve) => {
            this.canvas.toBlob((blob) => {
                if (!blob) {
                    console.error('Failed to create blob from canvas');
                    return;
                }

                const url = URL.createObjectURL(blob);
                const printWindow = window.open(url, '_blank');

                printWindow!.onload = () => {
                    this._setupPrintStyles(printWindow);
                    this._executePrint(printWindow, url);
                    resolve();
                };
            }, `image/${this.format}`, this.quality);
        });
    }



    /**
     * Print multiple canvases, one page per canvas
     */
    _printMultiple() {
        return new Promise<void>((resolve) => {
            const images = this.canvases
                .filter((c) => !!c)
                .map((c) => c.toDataURL(`image/${this.format}`, this.quality));

            const printWindow = window.open('', '_blank');
            printWindow!.document.open();
            printWindow!.document.write(
                `<!DOCTYPE html><html><head><style>${this._getMultiPageStyle()}</style></head><body>` +
                images.map((src) => `<div class="page"><img src="${src}"></div>`).join('') +
                '</body></html>'
            );
            printWindow!.document.close();

            const imgs = Array.from(printWindow!.document.querySelectorAll('img'));
            Promise.all(imgs.map((img) => img.complete
                ? Promise.resolve()
                : new Promise((done) => { img.onload = done; img.onerror = done; })
            )).then(() => {
                printWindow!.focus();
                // Register before print(): afterprint fires while the blocking
                // print() call is still on the stack, so a late assignment
                // would miss it and leave the about:blank tab behind.
                printWindow!.onafterprint = () => printWindow!.close();
                printWindow!.print();
                resolve();
            });
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
     * Get print CSS styles for multiple pages, one fixed-size sheet per canvas.
     * The wrapper carries the exact page dimensions (height: 100% on img would
     * resolve to auto against an auto-height body and overflow each page),
     * and the height is shaved by a hair so sub-pixel rounding can never spill
     * a blank page.
     */
    _getMultiPageStyle() {
        const { widthMm, heightMm } = this._getPageDimensions();
        return `
            @page {
                size: ${widthMm}mm ${heightMm}mm;
                margin: 0;
            }
            html, body {
                margin: 0;
                padding: 0;
                background-color: white !important;
            }
            .page {
                width: ${widthMm}mm;
                height: calc(${heightMm}mm - 0.2mm);
                overflow: hidden;
                page-break-after: always;
                break-after: page;
            }
            .page:last-child {
                page-break-after: auto;
                break-after: auto;
            }
            .page img {
                display: block;
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
        // Register before print(): afterprint fires while the blocking
        // print() call is still on the stack, so a late assignment would
        // miss it and leave the tab behind.
        printWindow.onafterprint = () => {
            this._cleanupResources(url, printWindow);
        };
        printWindow.print();
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
