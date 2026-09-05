const MIME_TYPES = [
    'video/mp4;codecs=h264',
    'video/mp4',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
];

export class VolumeEngine {
    constructor(video) {
        this._video = video;
        this._ctx = null;
        this._source = null;
        this._gain = null;
        this._dest = null;
        this._recorder = null;
        this._rafId = null;
        this._stream = null;
        this._aborted = false;
        this._lastProgress = -1;
        this._monitorConnected = false;
    }

    get ready() {
        return !!this._ctx;
    }

    init(volume = 1) {
        if (this._ctx) return true;

        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return false;

        try {
            this._ctx = new Ctx();
            this._source = this._ctx.createMediaElementSource(this._video);
            this._gain = this._ctx.createGain();
            this._gain.gain.value = volume;
            this._source.connect(this._gain);
            this._gain.connect(this._ctx.destination);
            this._monitorConnected = true;
            return true;
        } catch (_) {
            this._ctx = null;
            this._source = null;
            this._gain = null;
            return false;
        }
    }

    async resume() {
        if (this._ctx && this._ctx.state === 'suspended') {
            try {
                await this._ctx.resume();
            } catch (_) {}
        }
    }

    setVolume(v) {
        if (!this._gain || !this._ctx) return;
        const now = this._ctx.currentTime;
        this._gain.gain.cancelScheduledValues(now);
        this._gain.gain.setTargetAtTime(v, now, 0.01);
    }

    export({ volume, onProgress, onComplete, onError }) {
        if (!this._ctx || !this._gain) {
            onError();
            return;
        }

        this._aborted = false;

        const now = this._ctx.currentTime;
        this._gain.gain.cancelScheduledValues(now);
        this._gain.gain.setValueAtTime(volume, now);

        const video = this._video;
        const duration = video.duration;

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        const canvasStream = canvas.captureStream(30);

        const dest = this._ctx.createMediaStreamDestination();
        this._gain.connect(dest);
        this._dest = dest;

        if (this._monitorConnected) {
            try {
                this._gain.disconnect(this._ctx.destination);
            } catch (_) {}
            this._monitorConnected = false;
        }

        const audioTracks = dest.stream.getAudioTracks();
        const combined = new MediaStream([
            ...canvasStream.getVideoTracks(),
            ...audioTracks,
        ]);
        this._stream = combined;

        const mimeType = MIME_TYPES.find((t) => MediaRecorder.isTypeSupported(t)) || '';
        const isMp4 = mimeType.startsWith('video/mp4');
        const chunks = [];

        let recorder;
        try {
            recorder = new MediaRecorder(combined, mimeType ? { mimeType } : {});
        } catch (_) {
            this._afterExport();
            onError();
            return;
        }
        this._recorder = recorder;

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
            this._afterExport();
            if (this._aborted) return;
            if (chunks.length === 0) {
                onError();
                return;
            }
            const blob = new Blob(chunks, { type: recorder.mimeType || 'video/webm' });
            onComplete(blob, isMp4);
        };

        recorder.onerror = () => {
            this._afterExport();
            if (!this._aborted) onError();
        };

        const render = () => {
            if (this._aborted) return;
            ctx.drawImage(video, 0, 0);
            const pct = duration > 0 && isFinite(duration)
                ? Math.min(100, Math.floor((video.currentTime / duration) * 100))
                : 0;
            if (pct !== this._lastProgress) {
                this._lastProgress = pct;
                onProgress(pct);
            }
            if (video.ended) {
                if (recorder.state !== 'inactive') recorder.stop();
                return;
            }
            this._rafId = requestAnimationFrame(render);
        };

        recorder.start();
        video.currentTime = 0;
        video.play().then(() => {
            if (!this._aborted) {
                this._rafId = requestAnimationFrame(render);
            }
        }).catch(() => {
            this._afterExport();
            if (!this._aborted) onError();
        });
    }

    _afterExport() {
        if (this._rafId) cancelAnimationFrame(this._rafId);
        this._rafId = null;

        if (this._dest) {
            try { this._gain.disconnect(this._dest); } catch (_) {}
            this._dest = null;
        }

        if (!this._monitorConnected && this._gain && this._ctx) {
            try {
                this._gain.connect(this._ctx.destination);
                this._monitorConnected = true;
            } catch (_) {}
        }

        if (this._recorder && this._recorder.state !== 'inactive') {
            try { this._recorder.stop(); } catch (_) {}
        }
        this._recorder = null;

        if (this._stream) {
            this._stream.getTracks().forEach((t) => {
                try { t.stop(); } catch (_) {}
            });
            this._stream = null;
        }

        this._video.pause();
    }

    abort() {
        this._aborted = true;
        this._afterExport();
    }

    dispose() {
        this._aborted = true;
        this._afterExport();
        if (this._ctx) {
            try { this._ctx.close(); } catch (_) {}
            this._ctx = null;
        }
        this._source = null;
        this._gain = null;
    }
}
