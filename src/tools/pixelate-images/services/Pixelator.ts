class Pixelator {
    /**
     * Applies a pixelation effect to a destination canvas context by reading from a source context.
     * @param {CanvasRenderingContext2D} destCtx - The 2D rendering context of the destination canvas.
     * @param {CanvasRenderingContext2D} sourceCtx - The 2D rendering context of the source canvas.
     * @param {number} blockSize - The size of the pixelation blocks.
     * @param {object} [area={}] - Optional: The area to pixelate {x, y, width, height}. If empty, pixelates the entire image.
     */
    static pixelate(destCtx, sourceCtx, blockSize, area: any = {}) {
        const sourceCanvas = sourceCtx.canvas;
        const imgWidth = sourceCanvas.width;
        const imgHeight = sourceCanvas.height;

        let pixelateX, pixelateY, pixelateWidth, pixelateHeight;
        
        if (area.radiusX && area.radiusY) {
            pixelateX = area.x - area.radiusX;
            pixelateY = area.y - area.radiusY;
            pixelateWidth = area.radiusX * 2;
            pixelateHeight = area.radiusY * 2;
        } else if (area.radius) {
            pixelateX = area.x - area.radius;
            pixelateY = area.y - area.radius;
            pixelateWidth = area.radius * 2;
            pixelateHeight = area.radius * 2;
        } else {
            pixelateX = area.x || 0;
            pixelateY = area.y || 0;
            pixelateWidth = area.width || imgWidth;
            pixelateHeight = area.height || imgHeight;
        }

        const startX = Math.max(0, Math.floor(pixelateX / blockSize) * blockSize);
        const startY = Math.max(0, Math.floor(pixelateY / blockSize) * blockSize);
        const endX = Math.min(imgWidth, Math.ceil((pixelateX + pixelateWidth) / blockSize) * blockSize);
        const endY = Math.min(imgHeight, Math.ceil((pixelateY + pixelateHeight) / blockSize) * blockSize);

        const dirtyWidth = endX - startX;
        const dirtyHeight = endY - startY;

        if (dirtyWidth <= 0 || dirtyHeight <= 0) return;

        const imageData = sourceCtx.getImageData(startX, startY, dirtyWidth, dirtyHeight);
        const data = imageData.data;

        destCtx.imageSmoothingEnabled = false;

        for (let y = 0; y < dirtyHeight; y += blockSize) {
            for (let x = 0; x < dirtyWidth; x += blockSize) {
                const i = (y * dirtyWidth + x) * 4;
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];

                destCtx.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
                destCtx.fillRect(startX + x, startY + y, blockSize, blockSize);
            }
        }
    }
}

export default Pixelator;
