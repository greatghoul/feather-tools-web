import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { t } from '~/helpers/i18n';
import { notify } from '~/helpers/messages';
import ProgressBar from '~/components/ProgressBar';
import SpeedControls from './components/SpeedControls';
import { VideoSpeeder } from './services/VideoSpeeder';
import VideoControls from '~/components/VideoControls';
import VideoResultCard from '~/components/VideoResultCard';
import VideoUploadZone from '~/components/VideoUploadZone';

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
    const [videoFile, setVideoFile] = useState<File | null>(null);
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

    const videoRef = useRef<HTMLVideoElement>(null);
    const speederRef = useRef<VideoSpeeder | null>(null);
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
            setError(t('video-speed/message/error'));
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
            setError(t('video-speed/message/error'));
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
                notify(t('video-speed/message/complete'), '', 'success');
                setIsProcessing(false);
            },
            onError: () => {
                setError(t('video-speed/message/error'));
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

    return (
<>

        <div className="video-speed-container">
            <div className="row g-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header bg-light d-flex justify-content-between align-items-center">
                            <span>{t('video-speed/preview/title')}</span>
                            {videoUrl ? (
<>

                                <button className="btn btn-sm btn-outline-danger" onClick={handleClear} disabled={isProcessing}>
                                    {t('video-speed/button/clear')}
                                </button>
                            
</>
) : null}
                        </div>
                        {!videoUrl ? (
<>

                            <div className="card-body">
                                <VideoUploadZone loadText={t('video-speed/button/load')} onFileLoad={handleFileLoad} />
                            </div>
                        
</>
) : (
<>

                            <div className="card-body p-0">
                                <div className="video-speed-preview-wrapper">
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
                        <div className="card">
                            <div className="card-header bg-light">
                                <span>{t('video-speed/settings/title')}</span>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-8">
                                        <SpeedControls speed={speed} preservePitch={preservePitch} onSpeedChange={setSpeed} onPreservePitchChange={setPreservePitch} disabled={isProcessing} />
                                    </div>
                                    <div className="col-md-4">
                                        <div className="d-grid gap-2">
                                            <button className="btn btn-success" onClick={handleApply} disabled={isProcessing || speed === 1}>
                                                {isProcessing ? (
<>

                                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                                    {t('video-speed/message/processing')}
                                                
</>
) : (
<>

                                                    <i className="bi bi-lightning-charge me-1"></i>
                                                    {t('video-speed/button/apply')}
                                                
</>
)}
                                            </button>
                                        </div>
                                        <div className="mt-3 small">
                                            <div className="d-flex justify-content-between mb-1">
                                                <span className="text-muted">{t('video-speed/info/original_duration')}</span>
                                                <span className="fw-bold">{formatTime(videoDuration)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between mb-1">
                                                <span className="text-muted">{t('video-speed/info/speed_factor')}</span>
                                                <span className="fw-bold">{speed}x</span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span className="text-muted">{t('video-speed/info/new_duration')}</span>
                                                <span className="fw-bold text-primary">{formatTime(newDuration)}</span>
                                            </div>
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
                                    <span className="small text-muted">{t('video-speed/message/progress')}</span>
                                    <span className="small fw-bold">{progress}%</span>
                                </div>
                                <ProgressBar value={progress} />
                            </div>
                        </div>
                    </div>
                
</>
) : null}

                <VideoResultCard src={resultUrl} completeText={t('video-speed/message/complete')} downloadText={t('video-speed/button/download')} onDownload={handleDownload} />

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
