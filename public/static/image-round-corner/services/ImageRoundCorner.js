class ImageRoundCorner {
    constructor(imgElement, image, setting) {
        this.imgElement = imgElement;
        this.image = image;
        this.setting = setting;
    }

    async process() {
        const width = this.imgElement.width;
        const height = this.imgElement.height;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);

        if (this.setting.mode === 'separate') {
            const { topLeft, topRight, bottomRight, bottomLeft } = this.setting;
            const clamped = (val) => Math.min(Math.max(val, 0), Math.min(width, height) / 2);
            
            const tl = clamped(topLeft);
            const tr = clamped(topRight);
            const br = clamped(bottomRight);
            const bl = clamped(bottomLeft);

            if (tl > 0 || tr > 0 || br > 0 || bl > 0) {
                ctx.beginPath();
                ctx.moveTo(tl, 0);
                ctx.lineTo(width - tr, 0);
                if (tr > 0) {
                    ctx.quadraticCurveTo(width, 0, width, tr);
                }
                ctx.lineTo(width, height - br);
                if (br > 0) {
                    ctx.quadraticCurveTo(width, height, width - br, height);
                }
                ctx.lineTo(bl, height);
                if (bl > 0) {
                    ctx.quadraticCurveTo(0, height, 0, height - bl);
                }
                ctx.lineTo(0, tl);
                if (tl > 0) {
                    ctx.quadraticCurveTo(0, 0, tl, 0);
                }
                ctx.closePath();
                ctx.clip();
            }

            return {
                image: this.image,
                setting: this.setting,
                width,
                height,
                corners: { topLeft: tl, topRight: tr, bottomRight: br, bottomLeft: bl },
                name: this.getFilename(tl, tr, br, bl),
                format: 'png',
                mimeType: 'image/png',
                url: await this.generateBlob(canvas, ctx, width, height)
            };
        } else {
            const radius = Math.min(this.setting.allRadius, Math.min(width, height) / 2);

            if (radius > 0) {
                ctx.beginPath();
                ctx.moveTo(radius, 0);
                ctx.lineTo(width - radius, 0);
                ctx.quadraticCurveTo(width, 0, width, radius);
                ctx.lineTo(width, height - radius);
                ctx.quadraticCurveTo(width, height, width - radius, height);
                ctx.lineTo(radius, height);
                ctx.quadraticCurveTo(0, height, 0, height - radius);
                ctx.lineTo(0, radius);
                ctx.quadraticCurveTo(0, 0, radius, 0);
                ctx.closePath();
                ctx.clip();
            }

            return {
                image: this.image,
                setting: this.setting,
                width,
                height,
                radius,
                name: this.getFilename(radius),
                format: 'png',
                mimeType: 'image/png',
                url: await this.generateBlob(canvas, ctx, width, height)
            };
        }
    }

    async generateBlob(canvas, ctx, width, height) {
        ctx.drawImage(this.imgElement, 0, 0, width, height);
        
        const blob = await new Promise(resolve => {
            canvas.toBlob(resolve, 'image/png');
        });

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = 0;
        canvas.height = 0;

        return URL.createObjectURL(blob);
    }

    getFilename(...radii) {
        const baseName = this.image.name.split('.').slice(0, -1).join('.');
        
        if (radii.length === 1) {
            if (radii[0] === 0) return `${baseName}.png`;
            return `${baseName}-corner${radii[0]}.png`;
        }
        
        const [tl, tr, br, bl] = radii;
        if (tl === tr && tr === br && br === bl) {
            return this.getFilename(tl);
        }
        
        return `${baseName}-corners${tl}-${tr}-${br}-${bl}.png`;
    }
}

export default ImageRoundCorner;
