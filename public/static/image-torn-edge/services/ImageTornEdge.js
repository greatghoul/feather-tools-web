class ImageTornEdge {
    constructor(image, setting) {
        this.image = image;
        this.setting = setting;
    }

    async process() {
        const img = await this.loadImage();
        const { intensity, roughness, edges, shadowEnabled, shadowOffsetX, shadowOffsetY, shadowTransparency, shadowBlur } = this.setting;

        const maxDisp = 2 + intensity * 3;
        const shadowPad = shadowEnabled ? Math.max(shadowBlur + Math.abs(shadowOffsetX), shadowBlur + Math.abs(shadowOffsetY)) : 0;
        const padding = maxDisp + 15 + shadowPad;
        const w = img.width + padding * 2;
        const h = img.height + padding * 2;

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, w, h);

        if (shadowEnabled) {
            ctx.save();
            ctx.shadowColor = `rgba(0, 0, 0, ${shadowTransparency})`;
            ctx.shadowBlur = shadowBlur;
            ctx.shadowOffsetX = shadowOffsetX;
            ctx.shadowOffsetY = shadowOffsetY;
            ctx.fillStyle = '#000';
            ctx.beginPath();
            this.buildTornPath(ctx, img.width, img.height, padding);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            ctx.save();
            ctx.beginPath();
            this.buildTornPath(ctx, img.width, img.height, padding);
            ctx.closePath();
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = '#000';
            ctx.fill();
            ctx.restore();
        }

        ctx.save();
        ctx.beginPath();
        this.buildTornPath(ctx, img.width, img.height, padding);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, padding, padding);
        ctx.restore();

        const dataUrl = canvas.toDataURL('image/png');

        return {
            image: this.image,
            setting: this.setting,
            width: w,
            height: h,
            name: this.getFilename(),
            format: 'png',
            mimeType: 'image/png',
            url: dataUrl,
        };
    }

    loadImage() {
        const img = new Image();
        return new Promise((resolve, reject) => {
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = this.image.url;
        });
    }

    seededRand(seed) {
        let s = seed;
        return function () {
            s = (s * 1103515245 + 12345) & 0x7fffffff;
            return s / 0x7fffffff;
        };
    }

    interpolatedNoise(pos, randFunc) {
        const i = Math.floor(pos);
        const f = pos - i;
        const v1 = randFunc(i);
        const v2 = randFunc(i + 1);
        const t = f * f * (3 - 2 * f);
        return v1 + (v2 - v1) * t;
    }

    buildTornPath(ctx, imgWidth, imgHeight, padding) {
        const { edges } = this.setting;
        const direction = 'inward';
        const maxDisp = 2 + this.setting.intensity * 3;
        const segCount = Math.max(4, 3 + this.setting.roughness * 2);

        const isEdgeActive = (edge) => {
            if (edges === 'all') return true;
            return edges === edge;
        };

        const smoothFactor = (t, edgeLen) => {
            const cornerSmooth = Math.min(t, edgeLen - t) / (edgeLen * 0.15);
            return Math.min(1, Math.max(0, cornerSmooth));
        };

        const resolveSign = (baseDisp) => {
            if (direction === 'outward') return Math.abs(baseDisp);
            if (direction === 'inward') return -Math.abs(baseDisp);
            return baseDisp;
        };

        const generatePoints = (edgeLen, seed) => {
            const lowRand = this.seededRand(seed);
            const midRand = this.seededRand(seed + 1000);
            const highRand = this.seededRand(seed + 2000);
            const numPoints = segCount * 5;
            const points = [];
            for (let i = 0; i <= numPoints; i++) {
                const t = (i / numPoints) * edgeLen;
                const sf = smoothFactor(t, edgeLen);
                const noisePos = (i / numPoints) * segCount;
                const lowFreq = this.interpolatedNoise(noisePos, lowRand);
                const midFreq = this.interpolatedNoise(noisePos * 3, midRand);
                const highFreq = this.interpolatedNoise(noisePos * 8, highRand);
                const rawDisp = (lowFreq * 0.5 + midFreq * 0.3 + highFreq * 0.2 - 0.5) * 2 * maxDisp;
                const disp = rawDisp * sf;
                points.push({ t, disp });
            }
            return points;
        };

        ctx.moveTo(padding, padding);

        if (isEdgeActive('top') || edges === 'all') {
            const points = generatePoints(imgWidth, 1);
            for (const pt of points) {
                const disp = resolveSign(pt.disp);
                ctx.lineTo(padding + pt.t, padding - disp);
            }
        } else {
            ctx.lineTo(padding + imgWidth, padding);
        }

        if (isEdgeActive('right') || edges === 'all') {
            const points = generatePoints(imgHeight, 2);
            for (const pt of points) {
                const disp = resolveSign(pt.disp);
                ctx.lineTo(padding + imgWidth + disp, padding + pt.t);
            }
        } else {
            ctx.lineTo(padding + imgWidth, padding + imgHeight);
        }

        if (isEdgeActive('bottom') || edges === 'all') {
            const points = generatePoints(imgWidth, 3);
            for (const pt of points) {
                const disp = resolveSign(pt.disp);
                ctx.lineTo(padding + (imgWidth - pt.t), padding + imgHeight + disp);
            }
        } else {
            ctx.lineTo(padding, padding + imgHeight);
        }

        if (isEdgeActive('left') || edges === 'all') {
            const points = generatePoints(imgHeight, 4);
            for (const pt of points) {
                const disp = resolveSign(pt.disp);
                ctx.lineTo(padding - disp, padding + (imgHeight - pt.t));
            }
        } else {
            ctx.lineTo(padding, padding);
        }

        ctx.closePath();
    }

    getFilename() {
        const baseName = this.image.name.split('.').slice(0, -1).join('.');
        return `${baseName}-torn-edge.png`;
    }
}

export default ImageTornEdge;