const yieldToMain = () => {
    return new Promise<void>((resolve) => {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => resolve());
        } else {
            setTimeout(resolve, 0);
        }
    });
};

const seekTo = (video, time) => {
    return new Promise<void>((resolve) => {
        if (Math.abs(video.currentTime - time) < 0.01) {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
            return;
        }

        let resolved = false;
        const onSeeked = () => {
            if (resolved) return;
            resolved = true;
            video.removeEventListener('seeked', onSeeked);
            clearTimeout(fallback);
            resolve();
        };
        const fallback = setTimeout(() => {
            if (resolved) return;
            resolved = true;
            video.removeEventListener('seeked', onSeeked);
            resolve();
        }, 3000);
        video.addEventListener('seeked', onSeeked);
        video.currentTime = time;
    });
};

const computeTimestamps = (duration, mode, fps, interval, count) => {
    const timestamps: number[] = [];

    if (mode === 'fps') {
        const step = 1 / fps;
        for (let t = 0; t < duration; t += step) {
            timestamps.push(Math.min(t, duration));
        }
    } else if (mode === 'interval') {
        for (let t = 0; t < duration; t += interval) {
            timestamps.push(Math.min(t, duration));
        }
    } else {
        const step = count > 1 ? duration / count : 0;
        for (let i = 0; i < count; i++) {
            timestamps.push(Math.min(i * step, duration));
        }
    }

    if (timestamps.length === 0) {
        timestamps.push(0);
    }

    return timestamps;
};

const computeFrameDelay = (duration, mode, fps, interval, count) => {
    let delay;
    if (mode === 'fps') {
        delay = 1000 / fps;
    } else if (mode === 'interval') {
        delay = interval * 1000;
    } else {
        delay = count > 0 ? (duration / count) * 1000 : 500;
    }
    return Math.max(20, Math.round(delay));
};

export const estimateFrameCount = (duration, mode, fps, interval, count) => {
    if (!duration || duration <= 0) return 0;
    if (mode === 'fps') return Math.max(1, Math.floor(duration * fps));
    if (mode === 'interval') return Math.max(1, Math.floor(duration / interval) + 1);
    return Math.max(1, count);
};

export const estimateDimensions = (videoWidth, videoHeight, targetWidth) => {
    if (!videoWidth || !videoHeight) return { width: 0, height: 0 };
    if (!targetWidth || targetWidth <= 0 || targetWidth >= videoWidth) {
        return { width: videoWidth, height: videoHeight };
    }
    const scale = targetWidth / videoWidth;
    return { width: Math.round(targetWidth), height: Math.round(videoHeight * scale) };
};

export const generateGif = async (videoUrl, duration, options, onProgress, shouldAbort) => {
    const { mode, fps, interval, count, width, quality } = options;
    const timestamps = computeTimestamps(duration, mode, fps, interval, count);
    const delay = computeFrameDelay(duration, mode, fps, interval, count);

    const GIF = (window as any).GIF;
    if (!GIF) {
        throw new Error('GIF.js not loaded');
    }

    const video = document.createElement('video');
    video.src = videoUrl;
    video.muted = true;
    video.preload = 'auto';

    try {
        await new Promise<void>((resolve, reject) => {
            const onLoaded = () => {
                video.removeEventListener('loadeddata', onLoaded);
                video.removeEventListener('error', onError);
                resolve();
            };
            const onError = () => {
                video.removeEventListener('loadeddata', onLoaded);
                video.removeEventListener('error', onError);
                reject(new Error('Failed to load video'));
            };
            if (video.readyState >= 2) {
                resolve();
            } else {
                video.addEventListener('loadeddata', onLoaded);
                video.addEventListener('error', onError);
            }
        });

        const { width: gifWidth, height: gifHeight } = estimateDimensions(
            video.videoWidth, video.videoHeight, width
        );

        if (!gifWidth || !gifHeight) {
            throw new Error('Invalid video dimensions');
        }

        const canvas = document.createElement('canvas');
        canvas.width = gifWidth;
        canvas.height = gifHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

        const gif = new GIF({
            width: gifWidth,
            height: gifHeight,
            quality,
            repeat: 0,
            workers: 2,
            workerScript: '/static/libs/gif.worker.js',
        });

        const EXTRACT_PHASE = 0.5;
        const total = timestamps.length;

        for (let i = 0; i < total; i++) {
            if (shouldAbort && shouldAbort()) break;

            await seekTo(video, timestamps[i]);

            if (shouldAbort && shouldAbort()) break;

            ctx.clearRect(0, 0, gifWidth, gifHeight);
            ctx.drawImage(video, 0, 0, gifWidth, gifHeight);
            gif.addFrame(ctx, { delay, copy: true });

            if (onProgress) {
                const pct = Math.round(((i + 1) / total) * EXTRACT_PHASE * 100);
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
                    const pct = Math.round((EXTRACT_PHASE + p * (1 - EXTRACT_PHASE)) * 100);
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
                    size: blob.size,
                });
            });
            gif.on('error', (err) => reject(err));
            gif.render();
        });
    } finally {
        video.removeAttribute('src');
        video.load();
    }
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
