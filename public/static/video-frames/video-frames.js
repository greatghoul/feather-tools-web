import { render } from 'preact';
import { html } from 'htm/preact';
import { useState, useRef, useEffect, useCallback } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import { notify } from '~/helpers/messages.js';
import { downloadFile } from '~/helpers/files.js';
import JSZip from 'jszip';
import VideoControls from '~/components/VideoControls.js';
import VideoUploadZone from '~/components/VideoUploadZone.js';
import ExtractionSettings from '@/components/ExtractionSettings.js';
import FrameGrid from '@/components/FrameGrid.js';
import SlideshowPlayer from '@/components/SlideshowPlayer.js';
import { extractFrames, revokeFrames } from '@/services/VideoFramesService.js';

const App = () => {
    const [videoFile, setVideoFile] = useState(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [videoDuration, setVideoDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const [mode, setMode] = useState('fps');
    const [fps, setFps] = useState(2);
    const [interval, setInterval] = useState(1);
    const [count, setCount] = useState(20);
    const [format, setFormat] = useState('image/jpeg');
    const [quality, setQuality] = useState(0.8);

    const [frames, setFrames] = useState([]);
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractProgress, setExtractProgress] = useState(0);

    const [selectedIndices, setSelectedIndices] = useState(new Set());
    const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);
    const [slideshowFrames, setSlideshowFrames] = useState([]);

    const [error, setError] = useState('');

    const videoRef = useRef(null);
    const videoUrlRef = useRef('');
    const framesRef = useRef([]);
    const abortRef = useRef(false);

    useEffect(() => { videoUrlRef.current = videoUrl; }, [videoUrl]);
    useEffect(() => { framesRef.current = frames; }, [frames]);

    useEffect(() => {
        return () => {
            abortRef.current = true;
            if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
            revokeFrames(framesRef.current);
        };
    }, []);

    const handleFileLoad = useCallback((file) => {
        if (!file) return;
        if (!file.type.startsWith('video/')) {
            setError(getText('video-frames/message/error'));
            return;
        }

        abortRef.current = false;
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        revokeFrames(frames);

        const url = URL.createObjectURL(file);
        setVideoFile(file);
        setVideoUrl(url);
        setVideoDuration(0);
        setCurrentTime(0);
        setIsPlaying(false);
        setError('');
        setFrames([]);
        setSelectedIndices(new Set());
        setExtractProgress(0);
        setIsExtracting(false);
    }, [videoUrl, frames]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !videoUrl) return;

        const onLoaded = () => {
            setVideoDuration(video.duration || 0);
            video.currentTime = 0;
        };
        const onError = () => setError(getText('video-frames/message/error'));

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
        revokeFrames(frames);
        setVideoFile(null);
        setVideoUrl('');
        setVideoDuration(0);
        setCurrentTime(0);
        setIsPlaying(false);
        setFrames([]);
        setSelectedIndices(new Set());
        setIsExtracting(false);
        setExtractProgress(0);
        setError('');
        setIsSlideshowOpen(false);
        setSlideshowFrames([]);
    }, [videoUrl, frames]);

    const handleExtract = useCallback(async () => {
        if (!videoUrl || !videoDuration) return;

        revokeFrames(frames);
        setFrames([]);
        setSelectedIndices(new Set());
        setError('');
        setIsExtracting(true);
        setExtractProgress(0);
        abortRef.current = false;

        try {
            const result = await extractFrames(
                videoUrl,
                videoDuration,
                { mode, fps, interval, count, format, quality },
                (progress) => setExtractProgress(progress),
                () => abortRef.current
            );

            if (abortRef.current) return;

            setFrames(result);
            notify(getText('video-frames/message/extracted'), '', 'success');
        } catch (e) {
            setError(getText('video-frames/message/extract_error'));
        } finally {
            setIsExtracting(false);
        }
    }, [videoUrl, videoDuration, mode, fps, interval, count, format, quality, frames]);

    const handleToggleSelect = useCallback((index) => {
        setSelectedIndices((prev) => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    }, []);

    const handleSelectAll = useCallback(() => {
        setSelectedIndices(new Set(frames.map((f) => f.index)));
    }, [frames]);

    const handleDeselectAll = useCallback(() => {
        setSelectedIndices(new Set());
    }, []);

    const handleDownloadFrame = useCallback((index) => {
        const frame = frames.find((f) => f.index === index);
        if (!frame || !videoFile) return;
        const baseName = videoFile.name.replace(/\.[^.]+$/, '');
        downloadFile(frame.blob, `${baseName}-frame-${frame.index + 1}.${frame.ext}`);
    }, [frames, videoFile]);

    const handleDownloadSelected = useCallback(async () => {
        if (selectedIndices.size === 0 || !videoFile) {
            notify(getText('video-frames/message/no_selection'), '', 'warning');
            return;
        }

        const baseName = videoFile.name.replace(/\.[^.]+$/, '');
        const selected = frames.filter((f) => selectedIndices.has(f.index));
        const zip = new JSZip();

        for (const frame of selected) {
            zip.file(`${baseName}-frame-${frame.index + 1}.${frame.ext}`, frame.blob);
        }

        const content = await zip.generateAsync({ type: 'blob' });
        downloadFile(content, `${baseName}-frames.zip`);
        notify(getText('video-frames/message/downloaded'), '', 'success');
    }, [selectedIndices, frames, videoFile]);

    const handlePlaySelected = useCallback(() => {
        if (selectedIndices.size === 0) {
            notify(getText('video-frames/message/no_selection'), '', 'warning');
            return;
        }

        const selected = frames
            .filter((f) => selectedIndices.has(f.index))
            .sort((a, b) => a.index - b.index);

        setSlideshowFrames(selected);
        setIsSlideshowOpen(true);
    }, [selectedIndices, frames]);

    return html`
        <div class="video-frames-container">
            <div class="row g-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header bg-light d-flex justify-content-between align-items-center">
                            <span>${getText('video-frames/preview/title')}</span>
                            ${videoUrl ? html`
                                <button
                                    class="btn btn-sm btn-outline-danger"
                                    onClick=${handleClear}
                                    disabled=${isExtracting}
                                >
                                    ${getText('video-frames/button/clear')}
                                </button>
                            ` : null}
                        </div>
                        ${!videoUrl ? html`
                            <div class="card-body">
                                <${VideoUploadZone}
                                    loadText=${getText('video-frames/button/load')}
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
                        <${ExtractionSettings}
                            mode=${mode}
                            fps=${fps}
                            interval=${interval}
                            count=${count}
                            format=${format}
                            quality=${quality}
                            duration=${videoDuration}
                            isExtracting=${isExtracting}
                            onModeChange=${setMode}
                            onFpsChange=${setFps}
                            onIntervalChange=${setInterval}
                            onCountChange=${setCount}
                            onFormatChange=${setFormat}
                            onQualityChange=${setQuality}
                            onExtract=${handleExtract}
                        />
                    </div>
                ` : null}

                ${isExtracting ? html`
                    <div class="col-12">
                        <div class="card border-primary">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span class="small text-muted">${getText('video-frames/message/processing')}</span>
                                    <span class="small fw-bold">${extractProgress}%</span>
                                </div>
                                <div class="progress" role="progressbar" aria-valuenow=${extractProgress} aria-valuemin="0" aria-valuemax="100">
                                    <div class="progress-bar progress-bar-striped progress-bar-animated" style=${{ width: `${extractProgress}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ` : null}

                ${frames.length > 0 ? html`
                    <div class="col-12">
                        <${FrameGrid}
                            frames=${frames}
                            selectedIndices=${selectedIndices}
                            onToggleSelect=${handleToggleSelect}
                            onSelectAll=${handleSelectAll}
                            onDeselectAll=${handleDeselectAll}
                            onDownloadFrame=${handleDownloadFrame}
                            onDownloadSelected=${handleDownloadSelected}
                            onPlaySelected=${handlePlaySelected}
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

            <${SlideshowPlayer}
                frames=${slideshowFrames}
                isOpen=${isSlideshowOpen}
                onClose=${() => setIsSlideshowOpen(false)}
            />
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${App} />`, document.getElementById('app'));
});
