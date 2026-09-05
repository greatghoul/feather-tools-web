import { parseGIF, decompressFrames } from 'gifuct-js';

const renderFrameOnCtx = (frame, ctx) => {
    const canvas = document.createElement('canvas');
    canvas.width = frame.dims.width;
    canvas.height = frame.dims.height;
    const frameCtx = canvas.getContext('2d');
    const imageData = frameCtx.createImageData(frame.dims.width, frame.dims.height);
    imageData.data.set(frame.patch);
    frameCtx.putImageData(imageData, 0, 0);
    ctx.drawImage(canvas, frame.dims.left, frame.dims.top);
};

const compositeFrames = (frames, width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const composited = [];
    let prevState = null;

    for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];

        prevState = ctx.getImageData(0, 0, width, height);

        renderFrameOnCtx(frame, ctx);
        composited.push(ctx.getImageData(0, 0, width, height));

        if (frame.disposalType === 2) {
            ctx.clearRect(0, 0, width, height);
        } else if (frame.disposalType === 3) {
            ctx.putImageData(prevState, 0, 0);
        }
    }

    return composited;
};

export const parseGifFile = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const gif = parseGIF(arrayBuffer);
    const rawFrames = decompressFrames(gif, true);
    const { width, height } = gif.lsd;
    const compositedFrames = compositeFrames(rawFrames, width, height);

    return {
        width,
        height,
        frames: rawFrames.map((f, i) => ({
            imageData: compositedFrames[i],
            delay: f.delay,
        })),
        totalFrames: rawFrames.length,
    };
};

export const frameToDataUrl = (frame, width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(frame.imageData, 0, 0);
    return canvas.toDataURL('image/png');
};

export const frameToBlob = (frame, width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(frame.imageData, 0, 0);
    return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
};

export const downloadFrame = (frame, width, height, fileName) => {
    const dataUrl = frameToDataUrl(frame, width, height);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

export const copyFrameToClipboard = async (frame, width, height) => {
    const blob = await frameToBlob(frame, width, height);
    await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
    ]);
};