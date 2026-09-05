import { render } from 'preact';
import { html } from 'htm/preact';
import { useState, useRef, useEffect, useCallback, useMemo } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import { notify } from '~/helpers/messages.js';
import ProgressBar from '~/components/ProgressBar.js';
import SpeedControls from '@/components/SpeedControls.js';
import { VideoSpeeder } from '@/services/VideoSpeeder.js';
import VideoControls from '~/components/VideoControls.js';
import VideoResultCard from '~/components/VideoResultCard.js';
import VideoUploadZone from '~/components/VideoUploadZone.js';

const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
    const totalSec = Math.max(0, seconds);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = Math.floor(totalSec % 60);
    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
};

const App = () => {
    const [videoFile, setVideoFile] = useState(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [videoDuration, setVideoDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [preservePitch, setPreservePitch] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [resultUrl, setResultUrl] = useState('');
    const [resultName, setResultName] = useState('');

    const videoRef = useRef(null);
    const speederRef = useRef(null);
    const videoUrlRef = useRef('');
    const resultUrlRef = useRef('');

    const newDuration = useMemo(
        () => videoDuration > 0 && speed > 0 ? videoDuration / speed : 0,
        [videoDuration, speed]
    );

    useEffect(() => { videoUrlRef.current = videoUrl; }, [videoUrl]);
    useEffect(() => { resultUrlRef.current = resultUrl; }, [resultUrl]);

    useEffect(() => {
        return () => {
            if (speederRef.current) {
                speederRef.current.abort();
                speederRef.current = null;
            }
            if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
            if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
        };
    }, []);

    const handleFileLoad = useCallback((file) => {
        if (!file) return;
        if (!file.type.startsWith('video/')) {
            setError(getText('video-speed/message/error'));
            return;
        }
        if (speederRef.current) {
            speederRef.current.abort();
            speederRef.current = null;
        }
        if (videoUrl) URL.revokeObjectURL(videoUrl);
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
    }, [videoUrl]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !videoUrl) return;

        const onLoaded = () => {
            setVideoDuration(video.duration || 0);
            video.currentTime = 0;
        };

        const onError = () => {
            setError(getText('video-speed/message/error'));
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

        const onTimeUpdate = () => {
            setCurrentTime(video.currentTime);
        };
        const onPlay = () => setIsPlaying(true);
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
    }, [videoUrl]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !videoUrl) return;
        video.playbackRate = speed;
        video.preservesPitch = preservePitch;
    }, [videoUrl, speed, preservePitch]);

    const handleClear = useCallback(() => {
        if (speederRef.current) {
            speederRef.current.abort();
            speederRef.current = null;
        }
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        setVideoFile(null);
        setVideoUrl('');
        setVideoDuration(0);
        setCurrentTime(0);
        setIsPlaying(false);
        setSpeed(1);
        setPreservePitch(true);
        setProgress(0);
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
        setIsProcessing(true);
        setError('');

        if (speederRef.current) {
            speederRef.current.abort();
            speederRef.current = null;
        }

        const speeder = new VideoSpeeder(video, {
            speed,
            preservePitch,
            onProgress: (pct) => setProgress(pct),
            onComplete: (blob, isMp4) => {
                const url = URL.createObjectURL(blob);
                const baseName = videoFile.name.replace(/\.[^.]+$/, '');
                const speedLabel = speed < 1 ? `${speed}x` : `${speed}x`;
                setResultUrl(url);
                setResultName(`${baseName}-${speedLabel}.${isMp4 ? 'mp4' : 'webm'}`);
                setProgress(100);
                notify(getText('video-speed/message/complete'), '', 'success');
                setIsProcessing(false);
            },
            onError: () => {
                setError(getText('video-speed/message/error'));
                setIsProcessing(false);
            },
        });
        speederRef.current = speeder;
        speeder.start();
    }, [videoFile, videoDuration, speed, preservePitch, resultUrl]);

    const handleDownload = useCallback(() => {
        if (!resultUrl || !resultName) return;
        const a = document.createElement('a');
        a.href = resultUrl;
        a.download = resultName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }, [resultUrl, resultName]);

    return html`
        <div class="video-speed-container">
            <div class="row g-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header bg-light d-flex justify-content-between align-items-center">
                            <span>${getText('video-speed/preview/title')}</span>
                            ${videoUrl ? html`
                                <button class="btn btn-sm btn-outline-danger" onClick=${handleClear} disabled=${isProcessing}>
                                    ${getText('video-speed/button/clear')}
                                </button>
                            ` : null}
                        </div>
                        ${!videoUrl ? html`
                            <div class="card-body">
                                <${VideoUploadZone}
                                    loadText=${getText('video-speed/button/load')}
                                    onFileLoad=${handleFileLoad}
                                />
                            </div>
                        ` : html`
                            <div class="card-body p-0">
                                <div class="video-speed-preview-wrapper">
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
                                <span>${getText('video-speed/settings/title')}</span>
                            </div>
                            <div class="card-body">
                                <div class="row g-3">
                                    <div class="col-md-8">
                                        <${SpeedControls}
                                            speed=${speed}
                                            preservePitch=${preservePitch}
                                            onSpeedChange=${setSpeed}
                                            onPreservePitchChange=${setPreservePitch}
                                            disabled=${isProcessing}
                                        />
                                    </div>
                                    <div class="col-md-4">
                                        <div class="d-grid gap-2">
                                            <button
                                                class="btn btn-success"
                                                onClick=${handleApply}
                                                disabled=${isProcessing || speed === 1}
                                            >
                                                ${isProcessing ? html`
                                                    <span class="spinner-border spinner-border-sm me-1"></span>
                                                    ${getText('video-speed/message/processing')}
                                                ` : html`
                                                    <i class="bi bi-lightning-charge me-1"></i>
                                                    ${getText('video-speed/button/apply')}
                                                `}
                                            </button>
                                        </div>
                                        <div class="mt-3 small">
                                            <div class="d-flex justify-content-between mb-1">
                                                <span class="text-muted">${getText('video-speed/info/original_duration')}</span>
                                                <span class="fw-bold">${formatTime(videoDuration)}</span>
                                            </div>
                                            <div class="d-flex justify-content-between mb-1">
                                                <span class="text-muted">${getText('video-speed/info/speed_factor')}</span>
                                                <span class="fw-bold">${speed}x</span>
                                            </div>
                                            <div class="d-flex justify-content-between">
                                                <span class="text-muted">${getText('video-speed/info/new_duration')}</span>
                                                <span class="fw-bold text-primary">${formatTime(newDuration)}</span>
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
                                    <span class="small text-muted">${getText('video-speed/message/progress')}</span>
                                    <span class="small fw-bold">${progress}%</span>
                                </div>
                                <${ProgressBar} value=${progress} />
                            </div>
                        </div>
                    </div>
                ` : null}

                <${VideoResultCard}
                    src=${resultUrl}
                    completeText=${getText('video-speed/message/complete')}
                    downloadText=${getText('video-speed/button/download')}
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
