class ImageGrayscale  {
    private image: any;

    constructor(image) {
        this.image = image;
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
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
        }

        ctx.putImageData(imageData, 0, 0);

        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));

        canvas.width = 0;
        canvas.height = 0;

        return {
            image: this.image,
            width: img.naturalWidth,
            height: img.naturalHeight,
            name: this.getFilename(),
            format: 'png',
            mimeType: 'image/png',
            url: URL.createObjectURL(blob!),
        };
    }

    getFilename() {
        const baseName = this.image.name.split('.').slice(0, -1).join('.');
        return `${baseName}-grayscale.png`;
    }
}

export default ImageGrayscale;
