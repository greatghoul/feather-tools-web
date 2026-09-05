import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { t } from '~/helpers/i18n';
import { notify } from '~/helpers/messages';
import ProgressBar from '~/components/ProgressBar';
import FlipControls from './components/FlipControls';
import { VideoFlipper } from './services/VideoFlipper';
import VideoControls from '~/components/VideoControls';
import VideoResultCard from '~/components/VideoResultCard';
import VideoUploadZone from '~/components/VideoUploadZone';

const FLIP_TRANSFORMS = {
    horizontal: 'scaleX(-1)',
    vertical: 'scaleY(-1)',
    both: 'scale(-1, -1)',
};

const App = () => {
    const [videoFile, setVideoFile] = useState<File | null>(null);
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

    const videoRef = useRef<HTMLVideoElement>(null);
    const flipperRef = useRef<VideoFlipper | null>(null);
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
            setError(t('video-flip/message/error'));
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
            setError(t('video-flip/message/error'));
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
            const ctx = canvas.getContext('2d')!;

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
                notify(t('video-flip/message/complete'), '', 'success');
                setIsProcessing(false);
            },
            onError: () => {
                setError(t('video-flip/message/error'));
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

    return (
<>

        <div className="video-flip-container">
            <div className="row g-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header bg-light d-flex justify-content-between align-items-center">
                            <span>{t('video-flip/preview/title')}</span>
                            {videoUrl ? (
<>

                                <button className="btn btn-sm btn-outline-danger" onClick={handleClear} disabled={isProcessing}>
                                    {t('video-flip/button/clear')}
                                </button>
                            
</>
) : null}
                        </div>
                        {!videoUrl ? (
<>

                            <div className="card-body">
                                <VideoUploadZone loadText={t('video-flip/button/load')} onFileLoad={handleFileLoad} />
                            </div>
                        
</>
) : (
<>

                            <div className="card-body p-0">
                                <div className="video-flip-preview-wrapper">
                                    <video ref={videoRef} src={videoUrl} className="w-100 video-player" preload="auto" style={{ transform: flipTransform }}></video>
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
                        <div className="card">
                            <div className="card-header bg-light">
                                <span>{t('video-flip/button/flip')}</span>
                            </div>
                            <div className="card-body">
                                <div className="row g-3 align-items-end">
                                    <div className="col-md-8">
                                        <FlipControls flipMode={flipMode} onChange={setFlipMode} disabled={isProcessing} />
                                    </div>
                                    <div className="col-md-4">
                                        <div className="d-grid gap-2">
                                            <button className="btn btn-success" onClick={handleFlip} disabled={isProcessing}>
                                                {isProcessing ? (
<>

                                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                                    {t('video-flip/message/processing')}
                                                
</>
) : (
<>

                                                    <i className="bi bi-arrow-left-right me-1"></i>
                                                    {t('video-flip/button/flip')}
                                                
</>
)}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                
</>
) : null}

                {isProcessing ? (
<>

                    <div className="col-12">
                        <div className="card border-primary">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="small text-muted">{t('video-flip/message/progress')}</span>
                                    <span className="small fw-bold">{progress}%</span>
                                </div>
                                <ProgressBar value={progress} />
                            </div>
                        </div>
                    </div>
                
</>
) : null}

                <VideoResultCard src={resultUrl} completeText={t('video-flip/message/complete')} downloadText={t('video-flip/button/download')} onDownload={handleDownload} />

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
