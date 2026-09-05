import { t } from '~/helpers/i18n';

class WatermarkService  {

    private canvas: any;
        private ctx: any;

    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    async applyWatermark(images, settings) {
        const results: any[] = [];
        
        for (const image of images) {
            try {
                const result = await this._applyWatermarkToImage(image, settings);
                results.push(result);
            } catch (error) {
                console.error(`Failed to apply watermark to ${image.name}:`, error);
                throw new Error(t('image-watermark/error/process_failed'));
            }
        }
        
        return results;
    }

    async _applyWatermarkToImage(image, settings) {
        return new Promise((resolve, reject) => {
            try {
                const img = new Image();
                
                img.onload = async () => {
                    try {
                        // Set canvas size to match image
                        this.canvas.width = img.width;
                        this.canvas.height = img.height;
                        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                        
                        // Draw original image
                        this.ctx.drawImage(img, 0, 0);
                        
                        // Apply watermark
                        if (settings.watermarkType === 'text') {
                            this._applyTextWatermark(settings);
                        } else if (settings.watermarkType === 'image' && settings.watermarkImage) {
                            await this._applyImageWatermark(settings);
                        }
                        
                        // Convert to data URL
                        const dataUrl = this.canvas.toDataURL('image/jpeg', 0.95);
                        
                        // Generate filename
                        const filename = this._generateFilename(image.name);
                        
                        resolve({
                            filename,
                            dataUrl,
                            originalName: image.name,
                            width: img.width,
                            height: img.height
                        });
                    } catch (error) {
                        reject(error);
                    }
                };
                
                img.onerror = () => {
                    reject(new Error(t('image-watermark/error/load_failed')));
                };
                
                img.src = image.url;
            } catch (error) {
                reject(error);
            }
        });
    }

    _applyTextWatermark(settings) {
        const { text, fontSize, fontColor, opacity, position } = settings;
        
        // Set font
        this.ctx.font = `${fontSize}px Arial, sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Calculate text metrics
        const metrics = this.ctx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = fontSize; // Approximate height
        
        // Calculate position
        const margin = 20;
        let x, y;
        
        switch (position) {
            case 'top_left':
                x = margin + textWidth / 2;
                y = margin + textHeight / 2;
                break;
            case 'top_center':
                x = this.canvas.width / 2;
                y = margin + textHeight / 2;
                break;
            case 'top_right':
                x = this.canvas.width - margin - textWidth / 2;
                y = margin + textHeight / 2;
                break;
            case 'middle_left':
                x = margin + textWidth / 2;
                y = this.canvas.height / 2;
                break;
            case 'middle_center':
                x = this.canvas.width / 2;
                y = this.canvas.height / 2;
                break;
            case 'middle_right':
                x = this.canvas.width - margin - textWidth / 2;
                y = this.canvas.height / 2;
                break;
            case 'bottom_left':
                x = margin + textWidth / 2;
                y = this.canvas.height - margin - textHeight / 2;
                break;
            case 'bottom_center':
                x = this.canvas.width / 2;
                y = this.canvas.height - margin - textHeight / 2;
                break;
            case 'bottom_right':
                x = this.canvas.width - margin - textWidth / 2;
                y = this.canvas.height - margin - textHeight / 2;
                break;
            default:
                x = this.canvas.width - margin - textWidth / 2;
                y = this.canvas.height - margin - textHeight / 2;
        }
        
        // Convert hex color to RGB
        let color = fontColor;
        if (color.startsWith('#')) {
            color = color.slice(1);
            if (color.length === 3) {
                color = color.split('').map(c => c + c).join('');
            }
            const r = parseInt(color.slice(0, 2), 16);
            const g = parseInt(color.slice(2, 4), 16);
            const b = parseInt(color.slice(4, 6), 16);
            color = `rgb(${r}, ${g}, ${b})`;
        }
        
        // Set opacity
        this.ctx.globalAlpha = opacity;
        
        // Draw text
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, x, y);
        
        // Reset global alpha
        this.ctx.globalAlpha = 1.0;
    }

    _applyImageWatermark(settings) {
        const { watermarkImage, watermarkScale, watermarkRotation, opacity, position } = settings;
        
        return new Promise<void>((resolve, reject) => {
            const watermarkImg = new Image();
            
            watermarkImg.onload = () => {
                try {
                    // Calculate scaled dimensions
                    const scale = watermarkScale;
                    let wmWidth = watermarkImg.width * scale;
                    let wmHeight = watermarkImg.height * scale;
                    
                    // Create a temporary canvas for transformations
                    const tempCanvas = document.createElement('canvas');
                    const tempCtx = tempCanvas.getContext('2d')!;
                    
                    // Apply rotation if needed
                    if (watermarkRotation !== 0) {
                        // Calculate rotated dimensions
                        const rad = watermarkRotation * Math.PI / 180;
                        const cos = Math.abs(Math.cos(rad));
                        const sin = Math.abs(Math.sin(rad));
                        
                        const rotatedWidth = wmWidth * cos + wmHeight * sin;
                        const rotatedHeight = wmWidth * sin + wmHeight * cos;
                        
                        tempCanvas.width = rotatedWidth;
                        tempCanvas.height = rotatedHeight;
                        
                        // Rotate and draw watermark onto temp canvas
                        tempCtx.translate(rotatedWidth / 2, rotatedHeight / 2);
                        tempCtx.rotate(rad);
                        tempCtx.drawImage(watermarkImg, -wmWidth / 2, -wmHeight / 2, wmWidth, wmHeight);
                        
                        // Update dimensions for positioning
                        wmWidth = rotatedWidth;
                        wmHeight = rotatedHeight;
                        
                        // Draw from temp canvas to main canvas
                        this._drawTransformedWatermark(tempCanvas, wmWidth, wmHeight, opacity, position);
                    } else {
                        // No rotation, draw directly
                        this._drawImageWatermark(watermarkImg, wmWidth, wmHeight, opacity, position);
                    }
                    
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            
            watermarkImg.onerror = () => {
                reject(new Error('Failed to load watermark image'));
            };
            
            watermarkImg.src = watermarkImage;
        });
    }

    _drawImageWatermark(watermarkImg, width, height, opacity, position) {
        // Calculate position
        const margin = 20;
        let x, y;
        
        switch (position) {
            case 'top_left':
                x = margin;
                y = margin;
                break;
            case 'top_center':
                x = (this.canvas.width - width) / 2;
                y = margin;
                break;
            case 'top_right':
                x = this.canvas.width - width - margin;
                y = margin;
                break;
            case 'middle_left':
                x = margin;
                y = (this.canvas.height - height) / 2;
                break;
            case 'middle_center':
                x = (this.canvas.width - width) / 2;
                y = (this.canvas.height - height) / 2;
                break;
            case 'middle_right':
                x = this.canvas.width - width - margin;
                y = (this.canvas.height - height) / 2;
                break;
            case 'bottom_left':
                x = margin;
                y = this.canvas.height - height - margin;
                break;
            case 'bottom_center':
                x = (this.canvas.width - width) / 2;
                y = this.canvas.height - height - margin;
                break;
            case 'bottom_right':
                x = this.canvas.width - width - margin;
                y = this.canvas.height - height - margin;
                break;
            default:
                x = this.canvas.width - width - margin;
                y = this.canvas.height - height - margin;
        }
        
        // Set opacity
        this.ctx.globalAlpha = opacity;
        
        // Draw watermark
        this.ctx.drawImage(watermarkImg, x, y, width, height);
        
        // Reset global alpha
        this.ctx.globalAlpha = 1.0;
    }

    _drawTransformedWatermark(watermarkCanvas, width, height, opacity, position) {
        // Calculate position
        const margin = 20;
        let x, y;
        
        switch (position) {
            case 'top_left':
                x = margin;
                y = margin;
                break;
            case 'top_center':
                x = (this.canvas.width - width) / 2;
                y = margin;
                break;
            case 'top_right':
                x = this.canvas.width - width - margin;
                y = margin;
                break;
            case 'middle_left':
                x = margin;
                y = (this.canvas.height - height) / 2;
                break;
            case 'middle_center':
                x = (this.canvas.width - width) / 2;
                y = (this.canvas.height - height) / 2;
                break;
            case 'middle_right':
                x = this.canvas.width - width - margin;
                y = (this.canvas.height - height) / 2;
                break;
            case 'bottom_left':
                x = margin;
                y = this.canvas.height - height - margin;
                break;
            case 'bottom_center':
                x = (this.canvas.width - width) / 2;
                y = this.canvas.height - height - margin;
                break;
            case 'bottom_right':
                x = this.canvas.width - width - margin;
                y = this.canvas.height - height - margin;
                break;
            default:
                x = this.canvas.width - width - margin;
                y = this.canvas.height - height - margin;
        }
        
        // Set opacity
        this.ctx.globalAlpha = opacity;
        
        // Draw watermark canvas
        this.ctx.drawImage(watermarkCanvas, x, y, width, height);
        
        // Reset global alpha
        this.ctx.globalAlpha = 1.0;
    }

    _generateFilename(originalName) {
        const timestamp = new Date().getTime();
        const random = Math.random().toString(36).substring(2, 8);
        const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
        return `${nameWithoutExt}_watermarked_${timestamp}_${random}.jpg`;
    }

    destroy() {
        this.canvas.width = 0;
        this.canvas.height = 0;
    }
}

export default WatermarkService;
