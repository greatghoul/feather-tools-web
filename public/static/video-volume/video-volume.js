import { render } from 'preact';
import { html } from 'htm/preact';
import { useState, useRef, useEffect, useCallback, useMemo } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import { notify } from '~/helpers/messages.js';
import ProgressBar from '~/components/ProgressBar.js';
import VolumeControls from '@/components/VolumeControls.js';
import { VolumeEngine } from '@/services/VolumeEngine.js';
import { VolumeFFmpeg } from '@/services/VolumeFFmpeg.js';
import VideoControls from '~/components/VideoControls.js';
import VideoResultCard from '~/components/VideoResultCard.js';
import VideoUploadZone from '~/components/VideoUploadZone.js';

const LIGHTWEIGHT_MAX_BYTES = 20 * 1024 * 1024;

const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
    const totalSec = Math.max(0, seconds);
    const m = Math.floor(totalSec / 60);
    const s = Math.floor(totalSec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

const formatChange = (volume) => {
    if (volume === 100) return '0%';
    const diff = volume - 100;
    return `${diff > 0 ? '+' : ''}${diff}%`;
};

const App = () => {
    const [videoFile, setVideoFile] = useState(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [videoDuration, setVideoDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(100);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressLabel, setProgressLabel] = useState('');
    const [error, setError] = useState('');
    const [resultUrl, setResultUrl] = useState('');
    const [resultName, setResultName] = useState('');

    const videoRef = useRef(null);
    const engineRef = useRef(null);
    const ffmpegRef = useRef(null);
    const volumeRef = useRef(100);
    const videoUrlRef = useRef('');
    const resultUrlRef = useRef('');

    useEffect(() => { volumeRef.current = volume; }, [volume]);
    useEffect(() => { videoUrlRef.current = videoUrl; }, [videoUrl]);
    useEffect(() => { resultUrlRef.current = resultUrl; }, [resultUrl]);

    const ensureEngine = useCallback(() => {
        if (!engineRef.current && videoRef.current) {
            engineRef.current = new VolumeEngine(videoRef.current);
        }
        return engineRef.current;
    }, []);

    const ensureFFmpeg = useCallback(() => {
        if (!ffmpegRef.current) {
            ffmpegRef.current = new VolumeFFmpeg();
        }
        return ffmpegRef.current;
    }, []);

    useEffect(() => {
        return () => {
            if (engineRef.current) {
                engineRef.current.dispose();
                engineRef.current = null;
            }
            if (ffmpegRef.current) {
                ffmpegRef.current.dispose();
                ffmpegRef.current = null;
            }
            if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
            if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
        };
    }, []);

    const handleFileLoad = useCallback((file) => {
        if (!file) return;
        if (!file.type.startsWith('video/')) {
            setError(getText('video-volume/message/error'));
            return;
        }
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        const url = URL.createObjectURL(file);
        setVideoFile(file);
        setVideoUrl(url);
        setVideoDuration(0);
        setCurrentTime(0);
        setIsPlaying(false);
        setError('');
        setProgress(0);
        setResultUrl('');
        setResultName('');
    }, [videoUrl, resultUrl]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !videoUrl) return;

        const onLoaded = () => {
            setVideoDuration(video.duration || 0);
            video.currentTime = 0;
        };

        const onError = () => {
            setError(getText('video-volume/message/error'));
        };

        if (video.readyState >= 1) {
            onLoaded();
        } else {
            video.addEventListener('loadedmetadata', onLoaded);
        }
        video.addEventListener('error', onError);

        return () => {
            video.removeEventListener('loadedmetadata', onLoaded);
            video.removeEventListener('error', onError);
        };
    }, [videoUrl]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !videoUrl) return;

        const onTimeUpdate = () => setCurrentTime(video.currentTime);
        const onPlay = () => {
            setIsPlaying(true);
            const engine = ensureEngine();
            if (engine) {
                engine.init(volumeRef.current / 100);
                engine.resume();
            }
        };
        const onPause = () => setIsPlaying(false);
        const onEnded = () => setIsPlaying(false);

        video.addEventListener('timeupdate', onTimeUpdate);
        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('ended', onEnded);

        return () => {
            video.removeEventListener('timeupdate', onTimeUpdate);
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
            video.removeEventListener('ended', onEnded);
        };
    }, [videoUrl, ensureEngine]);

    const handleVolumeChange = useCallback((value) => {
        setVolume(value);
        const engine = ensureEngine();
        if (engine) {
            engine.init(value / 100);
            engine.resume();
            engine.setVolume(value / 100);
        }
    }, [ensureEngine]);

    const handleClear = useCallback(() => {
        if (engineRef.current) {
            engineRef.current.dispose();
            engineRef.current = null;
        }
        if (ffmpegRef.current) {
            ffmpegRef.current.abort();
        }
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        setVideoFile(null);
        setVideoUrl('');
        setVideoDuration(0);
        setCurrentTime(0);
        setIsPlaying(false);
        setVolume(100);
        setProgress(0);
        setProgressLabel('');
        setResultUrl('');
        setResultName('');
        setError('');
        setIsProcessing(false);
    }, [videoUrl, resultUrl]);

    const handleApply = useCallback(() => {
        const video = videoRef.current;
        if (!video || !videoDuration || !videoFile) return;

        if (resultUrl) URL.revokeObjectURL(resultUrl);
        setResultUrl('');
        setResultName('');
        setProgress(0);
        setProgressLabel('');
        setIsProcessing(true);
        setError('');

        const baseName = videoFile.name.replace(/\.[^.]+$/, '');
        const onComplete = (blob, isMp4) => {
            const url = URL.createObjectURL(blob);
            setResultUrl(url);
            setResultName(`${baseName}-${volume}pct.${isMp4 ? 'mp4' : 'webm'}`);
            setProgress(100);
            setProgressLabel('');
            notify(getText('video-volume/message/complete'), '', 'success');
            setIsProcessing(false);
        };
        const onError = () => {
            setError(getText('video-volume/message/error'));
            setProgressLabel('');
            setIsProcessing(false);
        };

        if (videoFile.size <= LIGHTWEIGHT_MAX_BYTES) {
            const engine = ensureEngine();
            if (!engine || !engine.init(volume / 100)) {
                onError();
                return;
            }
            engine.resume();
            setProgressLabel(getText('video-volume/message/progress'));
            engine.export({
                volume: volume / 100,
                onProgress: (pct) => setProgress(pct),
                onComplete,
                onError,
            });
        } else {
            const ffmpeg = ensureFFmpeg();
            ffmpeg.export({
                file: videoFile,
                volume,
                onProgress: (pct) => setProgress(pct),
                onStatus: (status) => {
                    setProgressLabel(
                        status === 'loading'
                            ? getText('video-volume/message/loading_engine')
                            : getText('video-volume/message/progress')
                    );
                },
                onComplete,
                onError,
            });
        }
    }, [videoFile, videoDuration, volume, resultUrl, ensureEngine, ensureFFmpeg]);

    const handleDownload = useCallback(() => {
        if (!resultUrl || !resultName) return;
        const a = document.createElement('a');
        a.href = resultUrl;
        a.download = resultName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }, [resultUrl, resultName]);

    const changeLabel = useMemo(() => formatChange(volume), [volume]);

    return html`
        <div class="video-volume-container">
            <div class="row g-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header bg-light d-flex justify-content-between align-items-center">
                            <span>${getText('video-volume/preview/title')}</span>
                            ${videoUrl ? html`
                                <button class="btn btn-sm btn-outline-danger" onClick=${handleClear} disabled=${isProcessing}>
                                    ${getText('video-volume/button/clear')}
                                </button>
                            ` : null}
                        </div>
                        ${!videoUrl ? html`
                            <div class="card-body">
                                <${VideoUploadZone}
                                    loadText=${getText('video-volume/button/load')}
                                    onFileLoad=${handleFileLoad}
                                />
                            </div>
                        ` : html`
                            <div class="card-body p-0">
                                <div class="video-volume-preview-wrapper" style=${isProcessing ? { pointerEvents: 'none' } : {}}>
                                    <video
                                        ref=${videoRef}
                                        src=${videoUrl}
                                        class="w-100 video-player"
                                        preload="auto"
                                    ></video>
                                    <${VideoControls}
                                        videoRef=${videoRef}
                                        currentTime=${currentTime}
                                        duration=${videoDuration}
                                        isPlaying=${isPlaying}
                                    />
                                </div>
                            </div>
                        `}
                    </div>
                </div>

                ${videoUrl && videoDuration > 0 ? html`
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header bg-light">
                                <span>${getText('video-volume/settings/title')}</span>
                            </div>
                            <div class="card-body">
                                <div class="row g-3">
                                    <div class="col-md-8">
                                        <${VolumeControls}
                                            volume=${volume}
                                            onVolumeChange=${handleVolumeChange}
                                            disabled=${isProcessing}
                                        />
                                    </div>
                                    <div class="col-md-4">
                                        <div class="d-grid gap-2">
                                            <button
                                                class="btn btn-success"
                                                onClick=${handleApply}
                                                disabled=${isProcessing || volume === 100}
                                            >
                                                ${isProcessing ? html`
                                                    <span class="spinner-border spinner-border-sm me-1"></span>
                                                    ${getText('video-volume/message/processing')}
                                                ` : html`
                                                    <i class="bi bi-lightning-charge me-1"></i>
                                                    ${getText('video-volume/button/apply')}
                                                `}
                                            </button>
                                        </div>
                                        <div class="mt-3 small">
                                            <div class="d-flex justify-content-between mb-1">
                                                <span class="text-muted">${getText('video-volume/info/current_volume')}</span>
                                                <span class="fw-bold">${volume === 0 ? getText('video-volume/preset/mute') : `${volume}%`}</span>
                                            </div>
                                            <div class="d-flex justify-content-between">
                                                <span class="text-muted">${getText('video-volume/info/change')}</span>
                                                <span class="fw-bold ${volume > 100 ? 'text-danger' : volume < 100 ? 'text-success' : ''}">${changeLabel}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ` : null}

                ${isProcessing ? html`
                    <div class="col-12">
                        <div class="card border-primary">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span class="small text-muted">${progressLabel || getText('video-volume/message/progress')}</span>
                                    <span class="small fw-bold">${progress}%</span>
                                </div>
                                <${ProgressBar} value=${progress} />
                            </div>
                        </div>
                    </div>
                ` : null}

                <${VideoResultCard}
                    src=${resultUrl}
                    completeText=${getText('video-volume/message/complete')}
                    downloadText=${getText('video-volume/button/download')}
                    onDownload=${handleDownload}
                />

                ${error ? html`
                    <div class="col-12">
                        <div class="alert alert-danger alert-dismissible fade show" role="alert">
                            ${error}
                            <button type="button" class="btn-close" onClick=${() => setError('')}></button>
                        </div>
                    </div>
                ` : null}
            </div>
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${App} />`, document.getElementById('app'));
});
