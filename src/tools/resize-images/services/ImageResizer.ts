class ImageResizer  {
    private imgElement: any;
        private image: any;
        private setting: any;

    constructor(imgElement, image, setting) {
        this.imgElement = imgElement;
        this.image = image;
        this.setting = setting;
    }

    getImageFormat() {
        if (this.setting.format === 'original') {
            return this.image.format;
        }
        return this.setting.format || this.image.format;
    }

    async process() {
        const { width, height } = this.calculateDimensions();
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(this.imgElement, 0, 0, width, height);
        
        const format = this.getImageFormat();
        const mimeType = this.getMimeType(format);
        const blob = await new Promise<Blob | null>(resolve => {
            canvas.toBlob(resolve, mimeType);
        });
        
        // Clear canvas after use
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = 0;
        canvas.height = 0;
        
        return {
            image: this.image,
            setting: this.setting,
            width,
            height,
            name: this.getFilename(format, width, height),
            format,
            mimeType,
            url: URL.createObjectURL(blob!)
        };
    }

    calculateDimensions() {
        const { width: origWidth, height: origHeight } = this.image;
        const { width: targetWidth, height: targetHeight, resizeBy = 'pixel' } = this.setting;
        // Determine aspect ratio preservation based on width/height values
        const keepAspectRatio = !(targetWidth && targetHeight);
        
        // Handle empty string or null as auto values
        const effectiveWidth = (targetWidth === '' || targetWidth === null) ? undefined : targetWidth;
        const effectiveHeight = (targetHeight === '' || targetHeight === null) ? undefined : targetHeight;
        
        if (!effectiveWidth && !effectiveHeight) {
            return { width: origWidth, height: origHeight };
        }
        
        // Convert percentage values to pixels if needed
        const getPixelValue = (value, original) => {
            if (resizeBy === '%') {
                const percent = parseFloat(value) / 100;
                return Math.round(original * percent);
            }
            return value;
        };
        
        if (keepAspectRatio) {
            const aspectRatio = origWidth / origHeight;
            const width = getPixelValue(targetWidth, origWidth);
            const height = getPixelValue(targetHeight, origHeight);
            
            if (width && !height) {
                return { width, height: Math.round(width / aspectRatio) };
            } else if (!width && height) {
                return { width: Math.round(height * aspectRatio), height };
            } else {
                // Both width and height specified - choose the one that maintains aspect ratio
                const widthBasedHeight = Math.round(width / aspectRatio);
                const heightBasedWidth = Math.round(height * aspectRatio);
                
                if (Math.abs(widthBasedHeight - targetHeight) < Math.abs(heightBasedWidth - targetWidth)) {
                    return { width: targetWidth, height: widthBasedHeight };
                } else {
                    return { width: heightBasedWidth, height: targetHeight };
                }
            }
        } else {
            // Don't maintain aspect ratio - use exact specified dimensions
            return {
                width: getPixelValue(targetWidth, origWidth) || origWidth,
                height: getPixelValue(targetHeight, origHeight) || origHeight
            };
        }
    }

    getFilename(format, width, height) {
        const baseName = this.image.name.split('.').slice(0, -1).join('.');
        return `${baseName}-${width}x${height}.${format}`;
    }

    getMimeType(format) {
        const types = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            webp: 'image/webp'
        };
        const formatStr = format ? format.toString().toLowerCase() : 'jpeg';
        return types[formatStr] || 'image/jpeg';
    }
}

export default ImageResizer;
