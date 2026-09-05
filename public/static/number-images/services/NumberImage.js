// NumberImage class - for adding sequence numbers to images
class NumberImage {
    constructor(image, number, settings) {
        this.image = image;
        this.number = number;
        this.settings = settings;
        this.canvas = null;
        this.ctx = null;
    }

    // Process image and add sequence number
    async process() {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                try {
                    const processedImage = this._drawNumberOnImage(img);
                    resolve(processedImage);
                } catch (error) {
                    reject(error);
                }
            };
            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };
            img.src = this.image.url;
        });
    }

    // Draw sequence number on image
    async _drawNumberOnImage(img) {
        // 创建 canvas
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');

        // 设置 canvas 尺寸
        this.canvas.width = img.width;
        this.canvas.height = img.height;

        // 绘制原始图片
        this.ctx.drawImage(img, 0, 0);

        // Draw the sequence number
        this._drawNumber();

        // 返回处理后的图片对象
        const processedBlob = await this.getBlob();
        return {
            ...this.image,
            processedUrl: URL.createObjectURL(processedBlob),
            processedBlob,
        };
    }

    // 绘制序号
    _drawNumber() {
        const { position, borderColor, backgroundColor, fontColor, fontSize } = this.settings;
        
        // Get display text
        const text = this.number;
        
        // Set font
        const font = `bold ${fontSize}px Arial`;
        this.ctx.font = font;
        
        // Measure text dimensions
        const metrics = this.ctx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = fontSize;
        
        // Calculate circular container size (use larger size to ensure text fits)
        const padding = fontSize * 0.4;
        const diameter = Math.max(textWidth, textHeight) + padding * 2;
        const radius = diameter / 2;
        
        // Calculate position (center point)
        const { x, y } = this._calculatePosition(position, diameter, diameter);
        const centerX = x + radius;
        const centerY = y + radius;
        
        // Draw background circle
        this.ctx.fillStyle = backgroundColor;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Draw border
        if (borderColor && borderColor !== backgroundColor) {
            this.ctx.strokeStyle = borderColor;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            this.ctx.stroke();
        }
        
        // Draw text
        this.ctx.fillStyle = fontColor;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // For numbers and letters, add vertical offset for visual centering
        // Numbers appear visually higher, so adjust downward
        const visualCenterOffset = fontSize * 0.12;
        const textCenterY = centerY + visualCenterOffset;
        
        this.ctx.fillText(text, centerX, textCenterY);
    }

    // Calculate sequence number position (circular container)
    _calculatePosition(position, diameter, height) {
        const margin = 10; // Margin from edges
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        let x, y;
        
        switch (position) {
            case 'top-left':
                x = margin;
                y = margin;
                break;
            case 'top-center':
                x = (canvasWidth - diameter) / 2;
                y = margin;
                break;
            case 'top-right':
                x = canvasWidth - diameter - margin;
                y = margin;
                break;
            case 'middle-left':
                x = margin;
                y = (canvasHeight - height) / 2;
                break;
            case 'middle-center':
                x = (canvasWidth - diameter) / 2;
                y = (canvasHeight - height) / 2;
                break;
            case 'middle-right':
                x = canvasWidth - diameter - margin;
                y = (canvasHeight - height) / 2;
                break;
            case 'bottom-left':
                x = margin;
                y = canvasHeight - height - margin;
                break;
            case 'bottom-center':
                x = (canvasWidth - diameter) / 2;
                y = canvasHeight - height - margin;
                break;
            case 'bottom-right':
            default:
                x = canvasWidth - diameter - margin;
                y = canvasHeight - height - margin;
                break;
        }
        
        return { x, y };
    }

    // Get processed Blob object (for download)
    getBlob(quality = 0.9) {
        return new Promise((resolve) => {
            this.canvas.toBlob(resolve, 'image/png', quality);
        });
    }

    // Clean up resources
    destroy() {
        if (this.canvas) {
            this.canvas = null;
            this.ctx = null;
        }
    }
}

export default NumberImage;
