class ImageConvert {
    constructor(image, setting) {
        this.image = image;
        this.setting = setting;
    }

    async process() {
        const { outputFormat, quality, backgroundColor } = this.setting;
        const mimeType = `image/${outputFormat === 'jpeg' ? 'jpeg' : outputFormat}`;

        const originalSize = this.image.file ? this.image.file.size : 0;
        const img = new Image();

        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = this.image.url;
        });

        const width = img.naturalWidth;
        const height = img.naturalHeight;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        const supportsAlpha = outputFormat === 'png' || outputFormat === 'webp' || outputFormat === 'gif';
        if (!supportsAlpha && backgroundColor) {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0);

        let blob;
        if (outputFormat === 'png' || outputFormat === 'gif' || outputFormat === 'bmp') {
            blob = await new Promise(resolve => {
                canvas.toBlob(resolve, mimeType);
            });
        } else {
            blob = await new Promise(resolve => {
                canvas.toBlob(resolve, mimeType, quality / 100);
            });
        }

        canvas.width = 0;
        canvas.height = 0;

        const baseName = this.image.name.replace(/\.[^/.]+$/, '');
        const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
        const resultUrl = URL.createObjectURL(blob);

        return {
            image: this.image,
            setting: this.setting,
            width,
            height,
            name: `${baseName}.${ext}`,
            format: outputFormat,
            mimeType,
            originalSize,
            convertedSize: blob.size,
            sizeChange: originalSize > 0
                ? Math.round((1 - blob.size / originalSize) * 100)
                : 0,
            url: resultUrl,
        };
    }
}

export default ImageConvert;