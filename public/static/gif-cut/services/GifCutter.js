import { parseGIF, decompressFrames } from '@/services/gif-parser.js';

const renderFrameToCanvas = (frame, ctx) => {
    if (!frame.patch) return;
    const imageData = ctx.createImageData(frame.dims.width, frame.dims.height);
    imageData.data.set(frame.patch);
    ctx.putImageData(imageData, frame.dims.left, frame.dims.top);
};

const renderFullCanvas = (frames, globalWidth, globalHeight) => {
    const composited = [];
    const currentCanvas = document.createElement('canvas');
    currentCanvas.width = globalWidth;
    currentCanvas.height = globalHeight;
    const currentCtx = currentCanvas.getContext('2d', { willReadFrequently: true });

    for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        if (frame.disposalType === 2) {
            currentCtx.clearRect(0, 0, globalWidth, globalHeight);
        }
        renderFrameToCanvas(frame, currentCtx);
        if (frame.disposalType === 3) {
            currentCtx.clearRect(frame.dims.left, frame.dims.top, frame.dims.width, frame.dims.height);
        }
        composited.push(currentCtx.getImageData(0, 0, globalWidth, globalHeight));
    }
    return composited;
};

export const parseGifFile = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const parsedGif = parseGIF(arrayBuffer);
    const frames = decompressFrames(parsedGif, true);
    const width = parsedGif.lsd.width;
    const height = parsedGif.lsd.height;
    const compositedFrames = renderFullCanvas(frames, width, height);

    const cumulativeTimes = [];
    let acc = 0;
    for (let i = 0; i < frames.length; i++) {
        cumulativeTimes.push(acc);
        acc += frames[i].delay;
    }
    const totalDuration = acc;

    return {
        width,
        height,
        frames: frames.map((f, i) => ({
            delay: f.delay,
            width: f.dims.width,
            height: f.dims.height,
            imageData: compositedFrames[i],
        })),
        cumulativeTimes,
        totalDuration,
        totalFrames: frames.length,
    };
};

const encodeFrames = (parsedData, selectedFrames, fileName) => {
    return new Promise((resolve, reject) => {
        const { width, height } = parsedData;
        const GIF = self.GIF;
        if (!GIF) {
            reject(new Error('GIF.js not loaded'));
            return;
        }

        const gif = new GIF({
            width,
            height,
            quality: 10,
            repeat: 0,
            background: null,
            transparent: null,
            workers: 2,
            workerScript: '/static/libs/gif.worker.js',
        });

        selectedFrames.forEach((frame) => {
            const cvs = document.createElement('canvas');
            cvs.width = width;
            cvs.height = height;
            const ctx = cvs.getContext('2d', { willReadFrequently: true });
            ctx.putImageData(frame.imageData, 0, 0);
            gif.addFrame(ctx, { delay: frame.delay, copy: true });
        });

        gif.on('finished', (blob) => {
            const url = URL.createObjectURL(blob);
            const baseName = fileName.replace(/\.[^.]+$/, '');
            resolve({
                url,
                blob,
                name: `${baseName}-cut.gif`,
                size: blob.size,
            });
        });

        gif.on('error', (err) => reject(err));
        gif.render();
    });
};

export const cutGifByFrame = (parsedData, startFrame, endFrame, fileName) => {
    const { frames } = parsedData;
    const selectedFrames = frames.slice(startFrame, endFrame + 1);
    if (selectedFrames.length === 0) {
        return Promise.reject(new Error('No frames selected'));
    }
    return encodeFrames(parsedData, selectedFrames, fileName);
};

export const cutGifByTime = (parsedData, startTime, endTime, fileName) => {
    const { frames, cumulativeTimes, totalDuration } = parsedData;
    const startMs = startTime * 1000;
    const endMs = endTime * 1000;

    const selectedFrames = [];
    for (let i = 0; i < frames.length; i++) {
        const frameStart = cumulativeTimes[i];
        const frameEnd = frameStart + frames[i].delay;
        if (frameStart < endMs && frameEnd > startMs) {
            selectedFrames.push(frames[i]);
        }
    }

    if (selectedFrames.length === 0) {
        return Promise.reject(new Error('No frames in selected time range'));
    }
    return encodeFrames(parsedData, selectedFrames, fileName);
};
