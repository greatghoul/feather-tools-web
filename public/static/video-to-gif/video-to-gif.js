import { render } from 'preact';
import { html } from 'htm/preact';
import { useState, useRef, useEffect, useCallback } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import { notify } from '~/helpers/messages.js';
import VideoControls from '~/components/VideoControls.js';
import VideoUploadZone, { VIDEO_ACCEPT, isVideoSupported } from '~/components/VideoUploadZone.js';
import GifSettings from '@/components/GifSettings.js';
import GifPreview from '@/components/GifPreview.js';
import { generateGif } from '@/services/VideoGifService.js';

const App = () => {
    const [videoFile, setVideoFile] = useState(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [videoDuration, setVideoDuration] = useState(0);
    const [videoWidth, setVideoWidth] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const [mode, setMode] = useState('fps');
    const [fps, setFps] = useState(10);
    const [interval, setInterval] = useState(0.5);
    const [count, setCount] = useState(20);
    const [width, setWidth] = useState(480);
    const [quality, setQuality] = useState(10);

    const [result, setResult] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressLabel, setProgressLabel] = useState('');

    const [error, setError] = useState('');

    const videoRef = useRef(null);
    const videoUrlRef = useRef('');
    const resultUrlRef = useRef('');
    const abortRef = useRef(false);

    useEffect(() => { videoUrlRef.current = videoUrl; }, [videoUrl]);
    useEffect(() => { resultUrlRef.current = result ? result.url : ''; }, [result]);

    useEffect(() => {
        return () => {
            abortRef.current = true;
            if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
            if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
        };
    }, []);

    const handleFileLoad = useCallback((file) => {
        if (!file) return;
        if (!isVideoSupported(file)) {
            setError(getText('common/upload/unsupported_video'));
            return;
        }

        abortRef.current = false;
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        if (result) URL.revokeObjectURL(result.url);

        const url = URL.createObjectURL(file);
        setVideoFile(file);
        setVideoUrl(url);
        setVideoDuration(0);
        setVideoWidth(0);
        setCurrentTime(0);
        setIsPlaying(false);
        setError('');
        setResult(null);
        setProgress(0);
        setProgressLabel('');
        setIsGenerating(false);
    }, [videoUrl, result]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !videoUrl) return;

        const onLoaded = () => {
            setVideoDuration(video.duration || 0);
            setVideoWidth(video.videoWidth || 0);
            if (video.videoWidth && width > 0 && width >= video.videoWidth) {
                setWidth(0);
            }
            video.currentTime = 0;
        };
        const onError = () => setError(getText('video-to-gif/message/error'));

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

    const handleClear = useCallback(() => {
        abortRef.current = true;
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        if (result) URL.revokeObjectURL(result.url);
        setVideoFile(null);
        setVideoUrl('');
        setVideoDuration(0);
        setVideoWidth(0);
        setCurrentTime(0);
        setIsPlaying(false);
        setResult(null);
        setIsGenerating(false);
        setProgress(0);
        setProgressLabel('');
        setError('');
    }, [videoUrl, result]);

    const handleGenerate = useCallback(async () => {
        if (!videoUrl || !videoDuration) return;

        if (result) URL.revokeObjectURL(result.url);
        setResult(null);
        setError('');
        setIsGenerating(true);
        setProgress(0);
        setProgressLabel(getText('video-to-gif/message/extracting'));
        abortRef.current = false;

        try {
            const gifResult = await generateGif(
                videoUrl,
                videoDuration,
                { mode, fps, interval, count, width, quality },
                (pct) => {
                    setProgress(pct);
                    if (pct >= 50) {
                        setProgressLabel(getText('video-to-gif/message/encoding'));
                    }
                },
                () => abortRef.current
            );

            if (abortRef.current || !gifResult) return;

            setResult(gifResult);
            notify(getText('video-to-gif/message/generated'), '', 'success');
        } catch (e) {
            setError(getText('video-to-gif/message/error'));
        } finally {
            setIsGenerating(false);
            setProgressLabel('');
        }
    }, [videoUrl, videoDuration, mode, fps, interval, count, width, quality, result]);

    const baseName = videoFile ? videoFile.name.replace(/\.[^.]+$/, '') : 'video';

    return html`
        <div class="video-to-gif-container">
            <div class="row g-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header bg-light d-flex justify-content-between align-items-center">
                            <span>${getText('video-to-gif/preview/title')}</span>
                            ${videoUrl ? html`
                                <button
                                    class="btn btn-sm btn-outline-danger"
                                    onClick=${handleClear}
                                    disabled=${isGenerating}
                                >
                                    ${getText('video-to-gif/button/clear')}
                                </button>
                            ` : null}
                        </div>
                        ${!videoUrl ? html`
                            <div class="card-body">
                                <${VideoUploadZone}
                                    loadText=${getText('video-to-gif/button/load')}
                                    accept=${VIDEO_ACCEPT}
                                    onFileLoad=${handleFileLoad}
                                />
                            </div>
                        ` : html`
                            <div class="card-body p-0">
                                <div class="video-preview-wrapper">
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
                        <${GifSettings}
                            mode=${mode}
                            fps=${fps}
                            interval=${interval}
                            count=${count}
                            width=${width}
                            quality=${quality}
                            duration=${videoDuration}
                            videoWidth=${videoWidth}
                            isGenerating=${isGenerating}
                            onModeChange=${setMode}
                            onFpsChange=${setFps}
                            onIntervalChange=${setInterval}
                            onCountChange=${setCount}
                            onWidthChange=${setWidth}
                            onQualityChange=${setQuality}
                            onGenerate=${handleGenerate}
                        />
                    </div>
                ` : null}

                ${isGenerating ? html`
                    <div class="col-12">
                        <div class="card border-primary">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span class="small text-muted">
                                        ${progressLabel || getText('video-to-gif/message/processing')}
                                    </span>
                                    <span class="small fw-bold">${progress}%</span>
                                </div>
                                <div class="progress" role="progressbar" aria-valuenow=${progress} aria-valuemin="0" aria-valuemax="100">
                                    <div class="progress-bar progress-bar-striped progress-bar-animated" style=${{ width: `${progress}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ` : null}

                ${result ? html`
                    <div class="col-12">
                        <${GifPreview}
                            result=${result}
                            baseName=${baseName}
                            onDownload=${() => notify(getText('video-to-gif/button/download'), '', 'success')}
                        />
                    </div>
                ` : null}

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
