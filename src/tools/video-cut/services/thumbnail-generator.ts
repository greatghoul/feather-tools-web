const waitForSeek = (video) => {
    return new Promise<void>((resolve) => {
        if (!video.seeking) {
            resolve();
            return;
        }
        const check = () => {
            if (video.seeking) {
                requestAnimationFrame(check);
            } else {
                resolve();
            }
        };
        requestAnimationFrame(check);
    });
};

const yieldToMain = () => {
    return new Promise<void>((resolve) => {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => resolve());
        } else {
            setTimeout(resolve, 0);
        }
    });
};

export const generateThumbnails = async (video, duration, count = 20) => {
    if (!video || !duration || duration <= 0) return null;

    const list: string[] = [];
    const thumbW = 320;
    const thumbH = 180;

    const canvas = document.createElement('canvas');
    canvas.width = thumbW;
    canvas.height = thumbH;
    const ctx = canvas.getContext('2d')!;

    const interval = duration / count;

    video.pause();

    for (let i = 0; i < count; i++) {
        const seekTime = i * interval;
        if (video.currentTime !== seekTime) {
            video.currentTime = seekTime;
            await waitForSeek(video);
        }

        ctx.clearRect(0, 0, thumbW, thumbH);
        ctx.drawImage(video, 0, 0, thumbW, thumbH);
        list.push(canvas.toDataURL('image/jpeg', 0.7));

        if (i % 5 === 4) {
            await yieldToMain();
        }
    }

    return { list, count, interval };
};
