import { getText } from '~/helpers/utils.js';

class ImageSplitter {
    constructor(image, settings) {
        this.image = image;
        this.settings = settings;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.splitParts = [];
    }

    async split() {
        return new Promise((resolve, reject) => {
            try {
                const img = new Image();
                img.onload = () => {
                    try {
                        this.splitParts = this._splitImage(img);
                        resolve(this.splitParts);
                    } catch (error) {
                        reject(new Error(getText('image-split/error/split_failed')));
                    }
                };
                img.onerror = () => {
                    reject(new Error(getText('image-split/error/load_failed')));
                };
                img.src = this.image.url;
            } catch (error) {
                reject(error);
            }
        });
    }

    _splitImage(img) {
        const { splitMode, rows, columns } = this.settings;
        const parts = [];

        if (splitMode === 'grid') {
            // 网格分割：行 × 列
            const partWidth = Math.floor(img.width / columns);
            const partHeight = Math.floor(img.height / rows);

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < columns; col++) {
                    const x = col * partWidth;
                    const y = row * partHeight;
                    const part = this._cropImagePart(img, x, y, partWidth, partHeight);
                    parts.push({
                        image: part,
                        index: row * columns + col,
                        position: { row: row + 1, col: col + 1 }
                    });
                }
            }
        } else if (splitMode === 'vertical') {
            // 垂直分割：列
            const partWidth = Math.floor(img.width / columns);
            
            for (let col = 0; col < columns; col++) {
                const x = col * partWidth;
                const part = this._cropImagePart(img, x, 0, partWidth, img.height);
                parts.push({
                    image: part,
                    index: col,
                    position: { col: col + 1 }
                });
            }
        } else if (splitMode === 'horizontal') {
            // 水平分割：行
            const partHeight = Math.floor(img.height / rows);
            
            for (let row = 0; row < rows; row++) {
                const y = row * partHeight;
                const part = this._cropImagePart(img, 0, y, img.width, partHeight);
                parts.push({
                    image: part,
                    index: row,
                    position: { row: row + 1 }
                });
            }
        }

        return parts;
    }

    _cropImagePart(img, x, y, width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx.clearRect(0, 0, width, height);
        this.ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
        
        return this.canvas.toDataURL('image/png');
    }

    destroy() {
        this.canvas.width = 0;
        this.canvas.height = 0;
        this.splitParts = [];
    }
}

export default ImageSplitter;