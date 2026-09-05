import { useState, useRef, useEffect, useCallback } from 'react';
import { t } from '~/helpers/i18n';
import { notify } from '~/helpers/messages';
import VideoControls from '~/components/VideoControls';
import VideoUploadZone, { VIDEO_ACCEPT, isVideoSupported } from '~/components/VideoUploadZone';
import GifSettings from './components/GifSettings';
import GifPreview from './components/GifPreview';
import { generateGif } from './services/VideoGifService';

const App = () => {
    const [videoFile, setVideoFile] = useState<File | null>(null);
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

    const [result, setResult] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressLabel, setProgressLabel] = useState('');

    const [error, setError] = useState('');

    const videoRef = useRef<HTMLVideoElement>(null);
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
            setError(t('common/upload/unsupported_video'));
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
        const onError = () => setError(t('video-to-gif/message/error'));

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
        setProgressLabel(t('video-to-gif/message/extracting'));
        abortRef.current = false;

        try {
            const gifResult = await generateGif(
                videoUrl,
                videoDuration,
                { mode, fps, interval, count, width, quality },
                (pct) => {
                    setProgress(pct);
                    if (pct >= 50) {
                        setProgressLabel(t('video-to-gif/message/encoding'));
                    }
                },
                () => abortRef.current
            );

            if (abortRef.current || !gifResult) return;

            setResult(gifResult);
            notify(t('video-to-gif/message/generated'), '', 'success');
        } catch (e) {
            setError(t('video-to-gif/message/error'));
        } finally {
            setIsGenerating(false);
            setProgressLabel('');
        }
    }, [videoUrl, videoDuration, mode, fps, interval, count, width, quality, result]);

    const baseName = videoFile ? videoFile.name.replace(/\.[^.]+$/, '') : 'video';

    return (
<>

        <div className="video-to-gif-container">
            <div className="row g-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header bg-light d-flex justify-content-between align-items-center">
                            <span>{t('video-to-gif/preview/title')}</span>
                            {videoUrl ? (
<>

                                <button className="btn btn-sm btn-outline-danger" onClick={handleClear} disabled={isGenerating}>
                                    {t('video-to-gif/button/clear')}
                                </button>
                            
</>
) : null}
                        </div>
                        {!videoUrl ? (
<>

                            <div className="card-body">
                                <VideoUploadZone loadText={t('video-to-gif/button/load')} accept={VIDEO_ACCEPT} onFileLoad={handleFileLoad} />
                            </div>
                        
</>
) : (
<>

                            <div className="card-body p-0">
                                <div className="video-preview-wrapper">
                                    <video ref={videoRef} src={videoUrl} className="w-100 video-player" preload="auto"></video>
                                    <VideoControls videoRef={videoRef} currentTime={currentTime} duration={videoDuration} isPlaying={isPlaying} />
                                </div>
                            </div>
                        
</>
)}
                    </div>
                </div>

                {videoUrl && videoDuration > 0 ? (
<>

                    <div className="col-12">
                        <GifSettings mode={mode} fps={fps} interval={interval} count={count} width={width} quality={quality} duration={videoDuration} videoWidth={videoWidth} isGenerating={isGenerating} onModeChange={setMode} onFpsChange={setFps} onIntervalChange={setInterval} onCountChange={setCount} onWidthChange={setWidth} onQualityChange={setQuality} onGenerate={handleGenerate} />
                    </div>
                
</>
) : null}

                {isGenerating ? (
<>

                    <div className="col-12">
                        <div className="card border-primary">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="small text-muted">
                                        {progressLabel || t('video-to-gif/message/processing')}
                                    </span>
                                    <span className="small fw-bold">{progress}%</span>
                                </div>
                                <div className="progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                                    <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                
</>
) : null}

                {result ? (
<>

                    <div className="col-12">
                        <GifPreview result={result} baseName={baseName} onDownload={() => notify(t('video-to-gif/button/download'), '', 'success')} />
                    </div>
                
</>
) : null}

                {error ? (
<>

                    <div className="col-12">
                        <div className="alert alert-danger alert-dismissible fade show" role="alert">
                            {error}
                            <button type="button" className="btn-close" onClick={() => setError('')}></button>
                        </div>
                    </div>
                
</>
) : null}
            </div>
        </div>
    
</>
);
};

export default App;
