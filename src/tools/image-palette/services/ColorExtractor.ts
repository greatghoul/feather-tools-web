/**
 * Color extraction engine using Median Cut quantization.
 * Extracts dominant color palettes from images entirely in the browser.
 */

/**
 * Convert RGB to hex color string
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} Hex color string like "#ff0000"
 */
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

/**
 * Convert RGB to HSL
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {{h: number, s: number, l: number}}
 */
function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

/**
 * Calculate perceived brightness of a color (for sorting)
 * @param {{r: number, g: number, b: number}} color
 * @returns {number}
 */
function perceivedBrightness(color) {
    return 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
}

/**
 * Sort colors by perceived brightness (dark to light)
 */
function sortByBrightness(colors) {
    return [...colors].sort((a, b) => {
        const ba = perceivedBrightness(a);
        const bb = perceivedBrightness(b);
        return ba - bb;
    });
}

/**
 * Sort colors by hue
 */
function sortByHue(colors) {
    return [...colors].sort((a, b) => {
        const ha = rgbToHsl(a.r, a.g, a.b).h;
        const hb = rgbToHsl(b.r, b.g, b.b).h;
        return ha - hb;
    });
}

/**
 * Median Cut color quantization
 * @param {Uint8ClampedArray} pixels - Raw pixel data
 * @param {number} colorCount - Number of colors to extract
 * @returns {Array<{r: number, g: number, b: number, count: number}>}
 */
function medianCut(pixels, colorCount) {
    // Build initial bucket: array of {r, g, b} for every pixel
    const pixelData: any[] = [];
    const pixelCount = pixels.length / 4;

    // Sample pixels for performance (every nth pixel)
    const sampleRate = Math.max(1, Math.floor(pixelCount / 50000));
    for (let i = 0; i < pixels.length; i += 4 * sampleRate) {
        pixelData.push({
            r: pixels[i],
            g: pixels[i + 1],
            b: pixels[i + 2]
        });
    }

    if (pixelData.length === 0) {
        return [];
    }

    // Initial bucket
    let buckets = [{ pixels: pixelData, range: getColorRange(pixelData) }];

    // Split buckets until we have desired color count
    while (buckets.length < colorCount) {
        // Find the bucket with the widest color range
        let maxRange = -1;
        let bucketToSplit = -1;
        let channelToSplit = 'r';

        for (let i = 0; i < buckets.length; i++) {
            const range = buckets[i].range;
            if (range.r > maxRange) {
                maxRange = range.r;
                bucketToSplit = i;
                channelToSplit = 'r';
            }
            if (range.g > maxRange) {
                maxRange = range.g;
                bucketToSplit = i;
                channelToSplit = 'g';
            }
            if (range.b > maxRange) {
                maxRange = range.b;
                bucketToSplit = i;
                channelToSplit = 'b';
            }
        }

        if (bucketToSplit === -1 || maxRange === 0) break;

        // Split the bucket
        const bucket = buckets[bucketToSplit];
        bucket.pixels.sort((a, b) => a[channelToSplit] - b[channelToSplit]);

        const mid = Math.floor(bucket.pixels.length / 2);
        const left = bucket.pixels.slice(0, mid);
        const right = bucket.pixels.slice(mid);

        if (left.length === 0 || right.length === 0) break;

        buckets.splice(bucketToSplit, 1,
            { pixels: left, range: getColorRange(left) },
            { pixels: right, range: getColorRange(right) }
        );
    }

    // Average each bucket to get final color
    return buckets.map(bucket => {
        const count = bucket.pixels.length;
        const sum = bucket.pixels.reduce((acc, p) => {
            acc.r += p.r; acc.g += p.g; acc.b += p.b;
            return acc;
        }, { r: 0, g: 0, b: 0 });

        return {
            r: Math.round(sum.r / count),
            g: Math.round(sum.g / count),
            b: Math.round(sum.b / count),
            count
        };
    });
}

/**
 * Get the range of each color channel in a set of pixels
 */
function getColorRange(pixels) {
    let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;

    for (const p of pixels) {
        if (p.r < minR) minR = p.r;
        if (p.r > maxR) maxR = p.r;
        if (p.g < minG) minG = p.g;
        if (p.g > maxG) maxG = p.g;
        if (p.b < minB) minB = p.b;
        if (p.b > maxB) maxB = p.b;
    }

    return {
        r: maxR - minR,
        g: maxG - minG,
        b: maxB - minB
    };
}

/**
 * Extract color palette from an image
 */
class ColorExtractor  {
    private image: any;
        private setting: any;

    /**
     * @param {Object} image - Image object with url and name
     * @param {Object} setting - Extraction settings
     * @param {number} setting.colorCount - Number of colors to extract
     * @param {string} setting.sortBy - Sort order: 'brightness' or 'hue'
     */
    constructor(image, setting) {
        this.image = image;
        this.setting = setting;
    }

    /**
     * Process the image and extract the color palette
     * @returns {Promise<Object>} Palette result
     */
    async process() {
        const { colorCount, sortBy } = this.setting;

        // Load image
        const img = new Image();
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = this.image.url;
        });

        const width = img.naturalWidth;
        const height = img.naturalHeight;

        // Draw to canvas to get pixel data
        const canvas = document.createElement('canvas');
        const maxDimension = 500;
        let scale = 1;
        if (Math.max(width, height) > maxDimension) {
            scale = maxDimension / Math.max(width, height);
        }
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        // Extract colors using median cut
        const rawColors = medianCut(pixels, colorCount);

        // Convert to final format
        let colors = rawColors.map(c => ({
            r: c.r,
            g: c.g,
            b: c.b,
            hex: rgbToHex(c.r, c.g, c.b),
            hsl: rgbToHsl(c.r, c.g, c.b),
            count: c.count
        }));

        // Sort colors
        if (sortBy === 'hue') {
            colors = sortByHue(colors);
        } else {
            colors = sortByBrightness(colors);
        }

        // Cleanup
        canvas.width = 0;
        canvas.height = 0;

        // Generate palette preview image
        const previewBlob = await this.generatePalettePreview(colors, colorCount);
        const previewUrl = URL.createObjectURL(previewBlob!);

        return {
            image: this.image,
            width,
            height,
            colors,
            colorCount: colors.length,
            palettePreviewUrl: previewUrl,
            palettePreviewBlob: previewBlob
        };
    }

    /**
     * Generate a preview image of the color palette
     * @param {Array} colors - Extracted colors
     * @param {number} colorCount - Number of colors
     * @returns {Promise<Blob>}
     */
    async generatePalettePreview(colors, colorCount) {
        // Increase resolution with 2x scaling for sharper output
        const scale = 2;
        const swatchWidth = 60 * scale;
        const swatchHeight = 80 * scale;
        const gap = 2 * scale;

        // Use grid layout when 8 or more colors: 4 columns per row
        const useGrid = colorCount >= 8;
        const cols = useGrid ? 4 : colors.length;
        const rows = useGrid ? Math.ceil(colors.length / cols) : 1;

        const totalWidth = cols * swatchWidth + (cols - 1) * gap;
        const totalHeight = rows * swatchHeight + (rows - 1) * gap;

        const canvas = document.createElement('canvas');
        canvas.width = totalWidth;
        canvas.height = totalHeight;
        const ctx = canvas.getContext('2d')!;

        colors.forEach((color, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = col * (swatchWidth + gap);
            const y = row * (swatchHeight + gap);

            // Draw swatch
            ctx.fillStyle = color.hex;
            ctx.fillRect(x, y, swatchWidth, swatchHeight);

            // Draw hex label
            ctx.fillStyle = color.hsl.l > 50 ? '#000000' : '#ffffff';
            ctx.font = `${Math.round(10 * scale)}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(color.hex, x + swatchWidth / 2, y + swatchHeight - 4 * scale);
        });

        return new Promise<Blob | null>(resolve => {
            canvas.toBlob(resolve, 'image/png');
        });
    }
}

export { rgbToHex, rgbToHsl, perceivedBrightness, sortByBrightness, sortByHue };
export default ColorExtractor;
