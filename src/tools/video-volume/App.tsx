import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { t } from '~/helpers/i18n';
import { notify } from '~/helpers/messages';
import ProgressBar from '~/components/ProgressBar';
import VolumeControls from './components/VolumeControls';
import { VolumeEngine } from './services/VolumeEngine';
import { VolumeFFmpeg } from './services/VolumeFFmpeg';
import VideoControls from '~/components/VideoControls';
import VideoResultCard from '~/components/VideoResultCard';
import VideoUploadZone from '~/components/VideoUploadZone';

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
    const [videoFile, setVideoFile] = useState<File | null>(null);
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

    const videoRef = useRef<HTMLVideoElement>(null);
    const engineRef = useRef<VolumeEngine | null>(null);
    const ffmpegRef = useRef<VolumeFFmpeg | null>(null);
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
            setError(t('video-volume/message/error'));
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
            setError(t('video-volume/message/error'));
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
            notify(t('video-volume/message/complete'), '', 'success');
            setIsProcessing(false);
        };
        const onError = () => {
            setError(t('video-volume/message/error'));
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
            setProgressLabel(t('video-volume/message/progress'));
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
                            ? t('video-volume/message/loading_engine')
                            : t('video-volume/message/progress')
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

    return (
<>

        <div className="video-volume-container">
            <div className="row g-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header bg-light d-flex justify-content-between align-items-center">
                            <span>{t('video-volume/preview/title')}</span>
                            {videoUrl ? (
<>

                                <button className="btn btn-sm btn-outline-danger" onClick={handleClear} disabled={isProcessing}>
                                    {t('video-volume/button/clear')}
                                </button>
                            
</>
) : null}
                        </div>
                        {!videoUrl ? (
<>

                            <div className="card-body">
                                <VideoUploadZone loadText={t('video-volume/button/load')} onFileLoad={handleFileLoad} />
                            </div>
                        
</>
) : (
<>

                            <div className="card-body p-0">
                                <div className="video-volume-preview-wrapper" style={isProcessing ? { pointerEvents: 'none' } : {}}>
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
                                <span>{t('video-volume/settings/title')}</span>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-8">
                                        <VolumeControls volume={volume} onVolumeChange={handleVolumeChange} disabled={isProcessing} />
                                    </div>
                                    <div className="col-md-4">
                                        <div className="d-grid gap-2">
                                            <button className="btn btn-success" onClick={handleApply} disabled={isProcessing || volume === 100}>
                                                {isProcessing ? (
<>

                                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                                    {t('video-volume/message/processing')}
                                                
</>
) : (
<>

                                                    <i className="bi bi-lightning-charge me-1"></i>
                                                    {t('video-volume/button/apply')}
                                                
</>
)}
                                            </button>
                                        </div>
                                        <div className="mt-3 small">
                                            <div className="d-flex justify-content-between mb-1">
                                                <span className="text-muted">{t('video-volume/info/current_volume')}</span>
                                                <span className="fw-bold">{volume === 0 ? t('video-volume/preset/mute') : `${volume}%`}</span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span className="text-muted">{t('video-volume/info/change')}</span>
                                                <span className={`fw-bold ${volume > 100 ? 'text-danger' : volume < 100 ? 'text-success' : ''}`}>{changeLabel}</span>
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
                                    <span className="small text-muted">{progressLabel || t('video-volume/message/progress')}</span>
                                    <span className="small fw-bold">{progress}%</span>
                                </div>
                                <ProgressBar value={progress} />
                            </div>
                        </div>
                    </div>
                
</>
) : null}

                <VideoResultCard src={resultUrl} completeText={t('video-volume/message/complete')} downloadText={t('video-volume/button/download')} onDownload={handleDownload} />

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
