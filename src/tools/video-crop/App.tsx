import { useState, useRef, useEffect, useCallback } from 'react';
import { t } from '~/helpers/i18n';
import { notify } from '~/helpers/messages';
import ProgressBar from '~/components/ProgressBar';
import VideoControls from '~/components/VideoControls';
import VideoResultCard from '~/components/VideoResultCard';
import VideoUploadZone, { VIDEO_ACCEPT, isVideoSupported } from '~/components/VideoUploadZone';
import CropOverlay from './components/CropOverlay';
import CropControls from './components/CropControls';
import { VideoCropper } from './services/VideoCropper';

const fullFrame = (w, h) => ({ x: 0, y: 0, width: w, height: h });

const fitAspect = (crop, vw, vh, ratio) => {
    if (!ratio) return { ...crop };
    const cx = crop.x + crop.width / 2;
    const cy = crop.y + crop.height / 2;
    let w = crop.width;
    let h = w / ratio;
    if (h > crop.height) { h = crop.height; w = h * ratio; }
    if (w > vw) { w = vw; h = w / ratio; }
    if (h > vh) { h = vh; w = h * ratio; }
    let x = cx - w / 2;
    let y = cy - h / 2;
    x = Math.max(0, Math.min(x, vw - w));
    y = Math.max(0, Math.min(y, vh - h));
    return { x, y, width: w, height: h };
};

const App = () => {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [videoDuration, setVideoDuration] = useState(0);
    const [videoWidth, setVideoWidth] = useState(0);
    const [videoHeight, setVideoHeight] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const [crop, setCrop] = useState<any>(null);
    const [aspect, setAspect] = useState(0);

    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [resultUrl, setResultUrl] = useState('');
    const [resultName, setResultName] = useState('');

    const videoRef = useRef<HTMLVideoElement>(null);
    const cropperRef = useRef<VideoCropper | null>(null);
    const videoUrlRef = useRef('');
    const resultUrlRef = useRef('');
    const cropInitRef = useRef(false);

    useEffect(() => { videoUrlRef.current = videoUrl; }, [videoUrl]);
    useEffect(() => { resultUrlRef.current = resultUrl; }, [resultUrl]);

    useEffect(() => {
        return () => {
            if (cropperRef.current) {
                cropperRef.current.abort();
                cropperRef.current = null;
            }
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
        if (cropperRef.current) {
            cropperRef.current.abort();
            cropperRef.current = null;
        }
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        const url = URL.createObjectURL(file);
        setVideoFile(file);
        setVideoUrl(url);
        setVideoDuration(0);
        setVideoWidth(0);
        setVideoHeight(0);
        setCurrentTime(0);
        setIsPlaying(false);
        setCrop(null);
        cropInitRef.current = false;
        setError('');
        setProgress(0);
        setResultUrl('');
        setResultName('');
        setIsProcessing(false);
    }, [videoUrl]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !videoUrl) return;

        const onLoaded = () => {
            const w = video.videoWidth || 0;
            const h = video.videoHeight || 0;
            setVideoDuration(video.duration || 0);
            setVideoWidth(w);
            setVideoHeight(h);
            if (!cropInitRef.current) {
                cropInitRef.current = true;
                setCrop(fullFrame(w, h));
            }
            video.currentTime = 0;
        };
        const onError = () => setError(t('video-crop/message/error'));

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
        if (cropperRef.current) {
            cropperRef.current.abort();
            cropperRef.current = null;
        }
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        setVideoFile(null);
        setVideoUrl('');
        setVideoDuration(0);
        setVideoWidth(0);
        setVideoHeight(0);
        setCurrentTime(0);
        setIsPlaying(false);
        setCrop(null);
        cropInitRef.current = false;
        setAspect(0);
        setProgress(0);
        setResultUrl('');
        setResultName('');
        setError('');
        setIsProcessing(false);
    }, [videoUrl, resultUrl]);

    const handleAspectChange = useCallback((value) => {
        setAspect(value);
        if (crop && videoWidth && videoHeight) {
            setCrop(fitAspect(crop, videoWidth, videoHeight, value));
        }
    }, [crop, videoWidth, videoHeight]);

    const handleReset = useCallback(() => {
        if (videoWidth && videoHeight) {
            setCrop(fullFrame(videoWidth, videoHeight));
        }
    }, [videoWidth, videoHeight]);

    const handleCrop = useCallback(() => {
        const video = videoRef.current;
        if (!video || !videoDuration || !videoFile || !crop) return;

        if (resultUrl) URL.revokeObjectURL(resultUrl);
        setResultUrl('');
        setResultName('');
        setProgress(0);
        setIsProcessing(true);
        setError('');

        if (cropperRef.current) {
            cropperRef.current.abort();
            cropperRef.current = null;
        }

        const cropper = new VideoCropper(video, {
            crop,
            onProgress: (pct) => setProgress(pct),
            onComplete: (blob, isMp4) => {
                const url = URL.createObjectURL(blob);
                const baseName = videoFile.name.replace(/\.[^.]+$/, '');
                setResultUrl(url);
                setResultName(`${baseName}-cropped.${isMp4 ? 'mp4' : 'webm'}`);
                setProgress(100);
                notify(t('video-crop/message/complete'), '', 'success');
                setIsProcessing(false);
            },
            onError: () => {
                setError(t('video-crop/message/error'));
                setIsProcessing(false);
            },
        });
        cropperRef.current = cropper;
        cropper.start();
    }, [videoFile, videoDuration, crop, resultUrl]);

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

        <div className="video-crop-container">
            <div className="row g-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header bg-light d-flex justify-content-between align-items-center">
                            <span>{t('video-crop/preview/title')}</span>
                            {videoUrl ? (
<>

                                <button className="btn btn-sm btn-outline-danger" onClick={handleClear} disabled={isProcessing}>
                                    {t('video-crop/button/clear')}
                                </button>
                            
</>
) : null}
                        </div>
                        {!videoUrl ? (
<>

                            <div className="card-body">
                                <VideoUploadZone loadText={t('video-crop/button/load')} accept={VIDEO_ACCEPT} onFileLoad={handleFileLoad} />
                            </div>
                        
</>
) : (
<>

                            <div className="card-body p-0">
                                <div className="video-crop-preview-wrapper position-relative">
                                    <video ref={videoRef} src={videoUrl} className="w-100 video-crop-player" preload="auto"></video>
                                    <CropOverlay videoRef={videoRef} videoWidth={videoWidth} videoHeight={videoHeight} crop={crop} aspect={aspect} onCropChange={setCrop} disabled={isProcessing} />
                                    <VideoControls videoRef={videoRef} currentTime={currentTime} duration={videoDuration} isPlaying={isPlaying} />
                                </div>
                            </div>
                        
</>
)}
                    </div>
                </div>

                {videoUrl && videoDuration > 0 && crop ? (
<>

                    <div className="col-12">
                        <CropControls aspect={aspect} crop={crop} videoWidth={videoWidth} videoHeight={videoHeight} isProcessing={isProcessing} onAspectChange={handleAspectChange} onReset={handleReset} onCrop={handleCrop} />
                    </div>
                
</>
) : null}

                {isProcessing ? (
<>

                    <div className="col-12">
                        <div className="card border-primary">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="small text-muted">{t('video-crop/message/progress')}</span>
                                    <span className="small fw-bold">{progress}%</span>
                                </div>
                                <ProgressBar value={progress} />
                            </div>
                        </div>
                    </div>
                
</>
) : null}

                <VideoResultCard src={resultUrl} completeText={t('video-crop/message/complete')} downloadText={t('video-crop/button/download')} onDownload={handleDownload} />

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
