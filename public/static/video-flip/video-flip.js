import { render } from 'preact';
import { html } from 'htm/preact';
import { useState, useRef, useEffect, useCallback, useMemo } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import { notify } from '~/helpers/messages.js';
import ProgressBar from '~/components/ProgressBar.js';
import FlipControls from '@/components/FlipControls.js';
import { VideoFlipper } from '@/services/VideoFlipper.js';
import VideoControls from '~/components/VideoControls.js';
import VideoResultCard from '~/components/VideoResultCard.js';
import VideoUploadZone from '~/components/VideoUploadZone.js';

const FLIP_TRANSFORMS = {
    horizontal: 'scaleX(-1)',
    vertical: 'scaleY(-1)',
    both: 'scale(-1, -1)',
};

const App = () => {
    const [videoFile, setVideoFile] = useState(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [videoDuration, setVideoDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [flipMode, setFlipMode] = useState('horizontal');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [resultUrl, setResultUrl] = useState('');
    const [resultName, setResultName] = useState('');

    const videoRef = useRef(null);
    const flipperRef = useRef(null);
    const videoUrlRef = useRef('');
    const resultUrlRef = useRef('');

    const flipTransform = useMemo(() => FLIP_TRANSFORMS[flipMode] || 'none', [flipMode]);

    useEffect(() => { videoUrlRef.current = videoUrl; }, [videoUrl]);
    useEffect(() => { resultUrlRef.current = resultUrl; }, [resultUrl]);

    useEffect(() => {
        return () => {
            if (flipperRef.current) {
                flipperRef.current.abort();
                flipperRef.current = null;
            }
            if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
            if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
        };
    }, []);

    const handleFileLoad = useCallback((file) => {
        if (!file) return;
        if (!file.type.startsWith('video/')) {
            setError(getText('video-flip/message/error'));
            return;
        }
        if (flipperRef.current) {
            flipperRef.current.abort();
            flipperRef.current = null;
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
            setError(getText('video-flip/message/error'));
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
        if (!video || !videoUrl || !videoDuration) return;

        let cancelled = false;

        const generatePoster = () => {
            if (cancelled) return;
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            const ctx = canvas.getContext('2d');

            ctx.setTransform(1, 0, 0, 1, 0, 0);
            if (flipMode === 'horizontal' || flipMode === 'both') {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
            }
            if (flipMode === 'vertical' || flipMode === 'both') {
                ctx.translate(0, canvas.height);
                ctx.scale(1, -1);
            }
            ctx.drawImage(video, 0, 0);

            video.poster = canvas.toDataURL('image/jpeg', 0.8);
        };

        if (video.readyState >= 1) {
            generatePoster();
        } else {
            video.addEventListener('loadeddata', generatePoster, { once: true });
            return () => {
                cancelled = true;
                video.removeEventListener('loadeddata', generatePoster);
            };
        }

        return () => {
            cancelled = true;
        };
    }, [videoUrl, videoDuration, flipMode]);

    const handleClear = useCallback(() => {
        if (flipperRef.current) {
            flipperRef.current.abort();
            flipperRef.current = null;
        }
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        setVideoFile(null);
        setVideoUrl('');
        setVideoDuration(0);
        setCurrentTime(0);
        setIsPlaying(false);
        setProgress(0);
        setResultUrl('');
        setResultName('');
        setError('');
        setIsProcessing(false);
    }, [videoUrl, resultUrl]);

    const handleFlip = useCallback(() => {
        const video = videoRef.current;
        if (!video || !videoDuration || !videoFile) return;

        if (resultUrl) URL.revokeObjectURL(resultUrl);
        setResultUrl('');
        setResultName('');
        setProgress(0);
        setIsProcessing(true);
        setError('');

        if (flipperRef.current) {
            flipperRef.current.abort();
            flipperRef.current = null;
        }

        const flipper = new VideoFlipper(video, {
            flipMode,
            onProgress: (pct) => setProgress(pct),
            onComplete: (blob, isMp4) => {
                const url = URL.createObjectURL(blob);
                const baseName = videoFile.name.replace(/\.[^.]+$/, '');
                setResultUrl(url);
                setResultName(`${baseName}-flipped.${isMp4 ? 'mp4' : 'webm'}`);
                setProgress(100);
                notify(getText('video-flip/message/complete'), '', 'success');
                setIsProcessing(false);
            },
            onError: () => {
                setError(getText('video-flip/message/error'));
                setIsProcessing(false);
            },
        });
        flipperRef.current = flipper;
        flipper.start();
    }, [videoFile, videoDuration, flipMode, resultUrl]);

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
        <div class="video-flip-container">
            <div class="row g-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header bg-light d-flex justify-content-between align-items-center">
                            <span>${getText('video-flip/preview/title')}</span>
                            ${videoUrl ? html`
                                <button class="btn btn-sm btn-outline-danger" onClick=${handleClear} disabled=${isProcessing}>
                                    ${getText('video-flip/button/clear')}
                                </button>
                            ` : null}
                        </div>
                        ${!videoUrl ? html`
                            <div class="card-body">
                                <${VideoUploadZone}
                                    loadText=${getText('video-flip/button/load')}
                                    onFileLoad=${handleFileLoad}
                                />
                            </div>
                        ` : html`
                            <div class="card-body p-0">
                                <div class="video-flip-preview-wrapper">
                                    <video
                                        ref=${videoRef}
                                        src=${videoUrl}
                                        class="w-100 video-player"
                                        preload="auto"
                                        style=${{ transform: flipTransform }}
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
                                <span>${getText('video-flip/button/flip')}</span>
                            </div>
                            <div class="card-body">
                                <div class="row g-3 align-items-end">
                                    <div class="col-md-8">
                                        <${FlipControls}
                                            flipMode=${flipMode}
                                            onChange=${setFlipMode}
                                            disabled=${isProcessing}
                                        />
                                    </div>
                                    <div class="col-md-4">
                                        <div class="d-grid gap-2">
                                            <button
                                                class="btn btn-success"
                                                onClick=${handleFlip}
                                                disabled=${isProcessing}
                                            >
                                                ${isProcessing ? html`
                                                    <span class="spinner-border spinner-border-sm me-1"></span>
                                                    ${getText('video-flip/message/processing')}
                                                ` : html`
                                                    <i class="bi bi-arrow-left-right me-1"></i>
                                                    ${getText('video-flip/button/flip')}
                                                `}
                                            </button>
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
                                    <span class="small text-muted">${getText('video-flip/message/progress')}</span>
                                    <span class="small fw-bold">${progress}%</span>
                                </div>
                                <${ProgressBar} value=${progress} />
                            </div>
                        </div>
                    </div>
                ` : null}

                <${VideoResultCard}
                    src=${resultUrl}
                    completeText=${getText('video-flip/message/complete')}
                    downloadText=${getText('video-flip/button/download')}
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
