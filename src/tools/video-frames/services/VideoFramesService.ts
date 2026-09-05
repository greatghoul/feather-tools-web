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

const formatToExt = (format) => (format === 'image/png' ? 'png' : 'jpg');

export const estimateFrameCount = (duration, mode, fps, interval, count) => {
    if (!duration || duration <= 0) return 0;
    if (mode === 'fps') return Math.max(1, Math.floor(duration * fps));
    if (mode === 'interval') return Math.max(1, Math.floor(duration / interval) + 1);
    return Math.max(1, count);
};

export const extractFrames = async (videoUrl, duration, options, onProgress, shouldAbort) => {
    const { mode, fps, interval, count, format, quality } = options;
    const timestamps = computeTimestamps(duration, mode, fps, interval, count);

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

        const w = video.videoWidth || 640;
        const h = video.videoHeight || 480;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;

        const frames: any[] = [];

        for (let i = 0; i < timestamps.length; i++) {
            if (shouldAbort && shouldAbort()) break;

            await seekTo(video, timestamps[i]);

            if (shouldAbort && shouldAbort()) break;

            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(video, 0, 0, w, h);

            const blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((b) => resolve(b!), format, quality);
            });

            const url = URL.createObjectURL(blob);

            frames.push({
                index: i,
                timestamp: timestamps[i],
                blob,
                url,
                ext: formatToExt(format),
            });

            if (onProgress) {
                onProgress(Math.round(((i + 1) / timestamps.length) * 100));
            }

            if (i % 5 === 4) await yieldToMain();
        }

        return frames;
    } finally {
        video.removeAttribute('src');
        video.load();
    }
};

export const revokeFrames = (frames) => {
    frames.forEach((f) => {
        if (f.url) URL.revokeObjectURL(f.url);
    });
};

export const formatTimestamp = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.round((seconds % 1) * 100);
    return `${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};
