import { FFmpeg } from '@ffmpeg/ffmpeg';

const CORE_BASE = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm';
const WEBM_EXTS = ['.webm', '.ogg', '.ogv'];

const getSafeInputName = (fileName) => {
    const match = fileName.match(/\.[^.]+$/);
    return `input${match ? match[0].toLowerCase() : '.bin'}`;
};

const getOutputConfig = (fileName) => {
    const name = fileName.toLowerCase();
    if (WEBM_EXTS.some((ext) => name.endsWith(ext))) {
        return { name: 'output.webm', ext: 'webm', mimeType: 'video/webm', audioCodec: 'libopus' };
    }
    return { name: 'output.mp4', ext: 'mp4', mimeType: 'video/mp4', audioCodec: 'aac' };
};

const hasNoAudioStream = (logLines) => logLines.some((line) => (
    line.includes('Output file #0 does not contain any stream')
    || line.includes('Stream map')
    || line.includes('contains no audio')
));

export class VolumeFFmpeg {
    constructor() {
        this._ffmpeg = null;
        this._loading = null;
        this._aborted = false;
    }

    async _getFFmpeg() {
        if (this._ffmpeg && this._ffmpeg.loaded) return this._ffmpeg;
        if (this._loading) return this._loading;

        this._loading = (async () => {
            const ffmpeg = new FFmpeg();
            await ffmpeg.load({
                coreURL: `${CORE_BASE}/ffmpeg-core.js`,
                wasmURL: `${CORE_BASE}/ffmpeg-core.wasm`,
            });
            this._ffmpeg = ffmpeg;
            return ffmpeg;
        })();

        this._loading.catch(() => {
            this._ffmpeg = null;
            this._loading = null;
        });

        return this._loading;
    }

    async export({ file, volume, onProgress, onStatus, onComplete, onError }) {
        this._aborted = false;
        const gain = volume / 100;
        const inputName = getSafeInputName(file.name);
        const output = getOutputConfig(file.name);

        try {
            onStatus?.('loading');
            const ffmpeg = await this._getFFmpeg();

            if (this._aborted) return;

            onStatus?.('processing');
            onProgress?.(0);

            const progressHandler = ({ progress: ratio }) => {
                if (this._aborted) return;
                const pct = Math.max(0, Math.min(95, Math.round(ratio * 95)));
                onProgress?.(pct);
            };
            ffmpeg.on('progress', progressHandler);

            const logLines = [];
            const logHandler = ({ message }) => {
                logLines.push(message);
            };
            ffmpeg.on('log', logHandler);

            try {
                try { await ffmpeg.deleteFile(inputName); } catch (_) {}
                try { await ffmpeg.deleteFile(output.name); } catch (_) {}

                const buffer = await file.arrayBuffer();
                await ffmpeg.writeFile(inputName, new Uint8Array(buffer));

                let exitCode;
                try {
                    exitCode = await ffmpeg.exec([
                        '-i', inputName,
                        '-af', `volume=${gain}`,
                        '-c:v', 'copy',
                        '-c:a', output.audioCodec,
                        output.name,
                    ]);
                } catch (_) {
                    exitCode = -1;
                }

                if (exitCode !== 0 && hasNoAudioStream(logLines)) {
                    try { await ffmpeg.deleteFile(output.name); } catch (_) {}
                    logLines.length = 0;
                    exitCode = await ffmpeg.exec([
                        '-i', inputName,
                        '-c:v', 'copy',
                        output.name,
                    ]);
                }

                if (exitCode !== 0) {
                    throw new Error(`ffmpeg exited with code ${exitCode}`);
                }

                if (this._aborted) return;

                const data = await ffmpeg.readFile(output.name);
                const blob = new Blob([new Uint8Array(data)], { type: output.mimeType });

                try { await ffmpeg.deleteFile(inputName); } catch (_) {}
                try { await ffmpeg.deleteFile(output.name); } catch (_) {}

                if (this._aborted) return;

                onProgress?.(100);
                onComplete?.(blob, output.ext === 'mp4');
            } finally {
                ffmpeg.off('progress', progressHandler);
                ffmpeg.off('log', logHandler);
            }
        } catch (err) {
            if (!this._aborted) onError?.(err);
        }
    }

    abort() {
        this._aborted = true;
        if (this._ffmpeg) {
            this._ffmpeg.terminate();
            this._ffmpeg = null;
            this._loading = null;
        }
    }

    dispose() {
        this.abort();
    }
}
