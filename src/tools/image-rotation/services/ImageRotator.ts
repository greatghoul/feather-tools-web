class ImageRotator  {
    private imgElement: any;
        private image: any;
        private rotation: any;

    constructor(imgElement, image, rotation) {
        this.imgElement = imgElement;
        this.image = image;
        this.rotation = rotation;
    }

    async process() {
        const { angle } = this.rotation;
        const { flipH, flipV } = this.rotation;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        const isRotated90 = angle === 90 || angle === 270;
        const originalWidth = this.imgElement.width;
        const originalHeight = this.imgElement.height;

        canvas.width = isRotated90 ? originalHeight : originalWidth;
        canvas.height = isRotated90 ? originalWidth : originalHeight;

        ctx.save();
        
        ctx.translate(canvas.width / 2, canvas.height / 2);
        
        // Flipping should be applied before rotation, or adjust axes after rotation
        // For 90/270 degree rotation, horizontal/vertical flip needs to be swapped
        const effectiveFlipH = isRotated90 ? flipV : flipH;
        const effectiveFlipV = isRotated90 ? flipH : flipV;
        
        ctx.scale(effectiveFlipH ? -1 : 1, effectiveFlipV ? -1 : 1);
        
        ctx.rotate(angle * Math.PI / 180);

        ctx.drawImage(
            this.imgElement,
            -originalWidth / 2,
            -originalHeight / 2,
            originalWidth,
            originalHeight
        );
        
        ctx.restore();

        const format = this.image.format || 'png';
        const mimeType = this.getMimeType(format);
        const blob = await new Promise<Blob | null>(resolve => {
            canvas.toBlob(resolve, mimeType);
        });

        const resultWidth = canvas.width;
        const resultHeight = canvas.height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = 0;
        canvas.height = 0;

        return {
            image: this.image,
            name: this.image.name,
            downloadName: this.image.downloadName,
            rotation: this.rotation,
            width: resultWidth,
            height: resultHeight,
            format,
            mimeType,
            blob,
            url: URL.createObjectURL(blob!)
        };
    }


    getMimeType(format) {
        const types = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            webp: 'image/webp',
            gif: 'image/gif',
            bmp: 'image/bmp'
        };
        return types[format.toLowerCase()] || 'image/png';
    }
}

export default ImageRotator;
