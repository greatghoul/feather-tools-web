export class VideoSpeeder {
    constructor(video, { speed, preservePitch, onProgress, onComplete, onError }) {
        this._video = video;
        this._speed = speed;
        this._preservePitch = preservePitch;
        this._onProgress = onProgress;
        this._onComplete = onComplete;
        this._onError = onError;
        this._aborted = false;
        this._rafId = null;
        this._recorder = null;
        this._stream = null;
        this._lastProgress = -1;
        this._originalPlaybackRate = video.playbackRate;
        this._originalPreservesPitch = video.preservesPitch;
        this._originalMuted = video.muted;
    }

    start() {
        const video = this._video;

        video.pause();
        video.load();

        const onLoaded = () => {
            video.removeEventListener('loadedmetadata', onLoaded);
            video.currentTime = 0;
            this._seekAndRecord();
        };
        video.addEventListener('loadedmetadata', onLoaded, { once: true });
    }

    _seekAndRecord() {
        const waitForSeek = () => {
            if (this._video.seeking) {
                requestAnimationFrame(waitForSeek);
            } else {
                this._startRecord();
            }
        };
        requestAnimationFrame(waitForSeek);
    }

    abort() {
        this._aborted = true;
        this._cleanup();
    }

    _cleanup() {
        if (this._rafId) cancelAnimationFrame(this._rafId);
        this._rafId = null;
        if (this._recorder && this._recorder.state !== 'inactive') {
            this._recorder.stop();
        }
        this._recorder = null;
        if (this._stream) {
            this._stream.getTracks().forEach((t) => t.stop());
            this._stream = null;
        }
        this._video.playbackRate = this._originalPlaybackRate;
        this._video.preservesPitch = this._originalPreservesPitch;
        this._video.muted = this._originalMuted;
        this._video.pause();
    }

    _startRecord() {
        if (this._aborted) return;
        const video = this._video;
        const duration = video.duration;
        const speed = this._speed;
        const preservePitch = this._preservePitch;
        const onComplete = this._onComplete;
        const onError = this._onError;
        const onProgress = this._onProgress;

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(video, 0, 0);

        const canvasStream = canvas.captureStream(30);

        let combinedStream = canvasStream;
        try {
            const videoStream = video.captureStream();
            const audioTrack = videoStream.getAudioTracks()[0];
            videoStream.getVideoTracks().forEach((t) => t.stop());
            if (audioTrack) {
                combinedStream = new MediaStream([...canvasStream.getVideoTracks(), audioTrack]);
            }
        } catch (_) {
            // Audio capture not supported, video only
        }
        this._stream = combinedStream;

        const mimeTypes = [
            'video/mp4;codecs=h264',
            'video/mp4',
            'video/webm;codecs=vp9',
            'video/webm;codecs=vp8',
            'video/webm',
        ];
        const mimeType = mimeTypes.find((t) => MediaRecorder.isTypeSupported(t)) || '';
        const isMp4 = mimeType && mimeType.startsWith('video/mp4');

        const chunks = [];

        try {
            const recorder = new MediaRecorder(combinedStream, mimeType ? { mimeType } : {});
            this._recorder = recorder;

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = () => {
                this._cleanup();
                if (this._aborted) return;
                if (chunks.length === 0) {
                    onError();
                    return;
                }
                const blob = new Blob(chunks, { type: recorder.mimeType || 'video/webm' });
                onComplete(blob, isMp4);
            };

            recorder.onerror = () => {
                this._cleanup();
                if (!this._aborted) onError();
            };

            const render = () => {
                if (this._aborted) return;
                ctx.drawImage(video, 0, 0);
                const pct = duration > 0
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
            video.playbackRate = speed;
            video.preservesPitch = preservePitch;
            video.muted = true;
            video.play().then(() => {
                if (!this._aborted) {
                    this._rafId = requestAnimationFrame(render);
                }
            }).catch(() => {
                this._cleanup();
                if (!this._aborted) onError();
            });
        } catch (err) {
            this._cleanup();
            if (!this._aborted) onError();
        }
    }
}
