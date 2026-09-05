class ImageAdjust {
    constructor(image, setting) {
        this.image = image;
        this.setting = setting;
    }

    async process() {
        const img = new Image();
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = this.image.url;
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        this.applyAdjustments(data);

        ctx.putImageData(imageData, 0, 0);

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

        canvas.width = 0;
        canvas.height = 0;

        return {
            image: this.image,
            setting: this.setting,
            width: img.naturalWidth,
            height: img.naturalHeight,
            name: this.getFilename(),
            format: 'png',
            mimeType: 'image/png',
            url: URL.createObjectURL(blob),
        };
    }

    applyAdjustments(data) {
        const { grayscale, brightness, contrast, saturation, red, green, blue } = this.setting;

        const brightnessOffset = brightness / 100 * 255;
        const contrastFactor = 1 + contrast / 100;
        const saturationFactor = 1 + saturation / 100;
        const redFactor = 1 + red / 100;
        const greenFactor = 1 + green / 100;
        const blueFactor = 1 + blue / 100;

        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            if (grayscale) {
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                r = g = b = gray;
            }

            if (contrast !== 0) {
                r = (r - 128) * contrastFactor + 128;
                g = (g - 128) * contrastFactor + 128;
                b = (b - 128) * contrastFactor + 128;
            }

            if (brightness !== 0) {
                r += brightnessOffset;
                g += brightnessOffset;
                b += brightnessOffset;
            }

            if (saturation !== 0) {
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                r = gray + (r - gray) * saturationFactor;
                g = gray + (g - gray) * saturationFactor;
                b = gray + (b - gray) * saturationFactor;
            }

            if (red !== 0) r *= redFactor;
            if (green !== 0) g *= greenFactor;
            if (blue !== 0) b *= blueFactor;

            data[i] = Math.max(0, Math.min(255, Math.round(r)));
            data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
            data[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
        }
    }

    getFilename() {
        const baseName = this.image.name.split('.').slice(0, -1).join('.');
        return `${baseName}-adjusted.png`;
    }
}

export default ImageAdjust;
