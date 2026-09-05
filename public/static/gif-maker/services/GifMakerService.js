const yieldToMain = () => {
    return new Promise((resolve) => {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => resolve());
        } else {
            setTimeout(resolve, 0);
        }
    });
};

const loadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = src;
    });
};

export const computeFrameSizes = (images, targetWidth) => {
    if (images.length === 0) return { sizes: [], width: 0, height: 0 };

    const sizes = images.map((img) => {
        if (!targetWidth || targetWidth <= 0 || targetWidth >= img.width) {
            return { width: img.width, height: img.height };
        }
        const scale = targetWidth / img.width;
        return {
            width: Math.round(targetWidth),
            height: Math.round(img.height * scale),
        };
    });

    return {
        sizes,
        width: Math.max(...sizes.map((s) => s.width)),
        height: Math.max(...sizes.map((s) => s.height)),
    };
};

export const generateGif = async (images, settings, onProgress, shouldAbort) => {
    const { delay, width, quality, loop, background, dither } = settings;

    const GIF = window.GIF;
    if (!GIF) {
        throw new Error('GIF.js not loaded');
    }

    const { sizes, width: gifWidth, height: gifHeight } = computeFrameSizes(images, width);

    if (!gifWidth || !gifHeight) {
        throw new Error('Invalid image dimensions');
    }

    const canvas = document.createElement('canvas');
    canvas.width = gifWidth;
    canvas.height = gifHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const repeat = loop > 0 ? loop - 1 : 0;
    const gif = new GIF({
        width: gifWidth,
        height: gifHeight,
        quality,
        repeat,
        background,
        dither,
        workers: 2,
        workerScript: '/static/libs/gif.worker.js',
    });

    const CAPTURE_PHASE = 0.5;
    const total = images.length;

    for (let i = 0; i < total; i++) {
        if (shouldAbort && shouldAbort()) break;

        const img = await loadImage(images[i].url);

        if (shouldAbort && shouldAbort()) break;

        ctx.clearRect(0, 0, gifWidth, gifHeight);
        ctx.fillStyle = background || '#ffffff';
        ctx.fillRect(0, 0, gifWidth, gifHeight);

        const frameWidth = sizes[i].width;
        const frameHeight = sizes[i].height;
        const x = Math.round((gifWidth - frameWidth) / 2);
        const y = Math.round((gifHeight - frameHeight) / 2);
        ctx.drawImage(img, x, y, frameWidth, frameHeight);
        gif.addFrame(ctx, { delay, copy: true });

        if (onProgress) {
            const pct = Math.round(((i + 1) / total) * CAPTURE_PHASE * 100);
            onProgress(pct);
        }

        if (i % 3 === 2) await yieldToMain();
    }

    if (shouldAbort && shouldAbort()) {
        gif.abort();
        return null;
    }

    return await new Promise((resolve, reject) => {
        gif.on('progress', (p) => {
            if (onProgress) {
                const pct = Math.round((CAPTURE_PHASE + p * (1 - CAPTURE_PHASE)) * 100);
                onProgress(pct);
            }
        });
        gif.on('finished', (blob) => {
            resolve({
                blob,
                url: URL.createObjectURL(blob),
                width: gifWidth,
                height: gifHeight,
                frames: total,
                duration: total * delay,
                size: blob.size,
            });
        });
        gif.on('error', (err) => reject(err));
        gif.render();
    });
};

export const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB'];
    let value = bytes;
    let unit = 0;
    while (value >= 1024 && unit < units.length - 1) {
        value /= 1024;
        unit++;
    }
    return `${value.toFixed(value < 10 && unit > 0 ? 1 : 0)} ${units[unit]}`;
};
