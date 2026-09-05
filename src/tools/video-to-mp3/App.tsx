import { useState, useRef, useEffect, useCallback } from 'react';
import { t } from '~/helpers/i18n';
import { notify } from '~/helpers/messages';
import VideoUploadZone from '~/components/VideoUploadZone';
import { FFmpeg } from '@ffmpeg/ffmpeg';

const MP3_BITRATE = 128;
const LIGHTWEIGHT_MAX_BYTES = 20 * 1024 * 1024;

const CORE_BASE = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm';

const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

const formatSize = (bytes) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
};

const getSafeInputName = (fileName) => {
    const extensionMatch = fileName.match(/\.[^.]+$/);
    const extension = extensionMatch ? extensionMatch[0].toLowerCase() : '.bin';
    return `input${extension}`;
};

const getFfmpegErrorMessage = (logLines) => {
    for (let i = logLines.length - 1; i >= 0; i -= 1) {
        const line = logLines[i];
        if (!line || line.startsWith('[fferr] [info]') || line.startsWith('[ffout] [info]')) {
            continue;
        }

        const message = line.replace(/^\[[^\]]+\]\s*/, '').trim();
        if (message) {
            return message;
        }
    }

    return '';
};

const hasNoAudioStream = (logLines) => logLines.some((line) => (
    line.includes('Output file #0 does not contain any stream')
    || line.includes('Stream map')
    || line.includes('contains no audio')
));

const encodePcmToMp3 = (channelData, channels, sampleRate, onProgress: ((ratio: number) => void) | null = null) => {
    const encoder = new (window as any).lamejs.Mp3Encoder(channels, sampleRate, MP3_BITRATE);
    const blockSize = 1152;
    const chunks: Uint8Array[] = [];
    const length = channelData[0].length;
    const totalBlocks = Math.max(1, Math.ceil(length / blockSize));

    for (let i = 0, block = 0; i < length; i += blockSize, block += 1) {
        const left = channelData[0].subarray(i, Math.min(i + blockSize, length));
        const left16 = new Int16Array(left.length);
        for (let j = 0; j < left.length; j++) {
            const sample = Math.max(-1, Math.min(1, left[j]));
            left16[j] = sample < 0 ? sample * 32768 : sample * 32767;
        }

        let mp3buf;
        if (channels === 2) {
            const right = channelData[1].subarray(i, Math.min(i + blockSize, length));
            const right16 = new Int16Array(right.length);
            for (let j = 0; j < right.length; j++) {
                const sample = Math.max(-1, Math.min(1, right[j]));
                right16[j] = sample < 0 ? sample * 32768 : sample * 32767;
            }
            mp3buf = encoder.encodeBuffer(left16, right16);
        } else {
            mp3buf = encoder.encodeBuffer(left16);
        }

        if (mp3buf.length > 0) {
            chunks.push(new Uint8Array(mp3buf));
        }

        if (onProgress) {
            onProgress((block + 1) / totalBlocks);
        }
    }

    const finalBuf = encoder.flush();
    if (finalBuf.length > 0) {
        chunks.push(new Uint8Array(finalBuf));
    }

    return new Blob(chunks, { type: 'audio/mp3' });
};

const App = () => {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [videoDuration, setVideoDuration] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressLabel, setProgressLabel] = useState('');
    const [error, setError] = useState('');
    const [previewError, setPreviewError] = useState(false);
    const [resultUrl, setResultUrl] = useState('');
    const [resultName, setResultName] = useState('');
    const [resultSize, setResultSize] = useState(0);

    const videoRef = useRef<HTMLVideoElement>(null);
    const videoUrlRef = useRef('');
    const resultUrlRef = useRef('');
    const ffmpegRef = useRef<FFmpeg | null>(null);
    const loadingRef = useRef<Promise<FFmpeg> | null>(null);
    const progressRef = useRef<((ratio: number) => void) | null>(null);

    useEffect(() => { videoUrlRef.current = videoUrl; }, [videoUrl]);
    useEffect(() => { resultUrlRef.current = resultUrl; }, [resultUrl]);

    useEffect(() => {
        return () => {
            if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
            if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
        };
    }, []);

    const handleFileLoad = useCallback((file) => {
        if (!file) return;
        const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|avi|mov|mkv|flv|wmv|m4v|3gp)$/i.test(file.name);
        if (!isVideo) {
            setError(t('video-to-mp3/message/error'));
            return;
        }
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        const url = URL.createObjectURL(file);
        setVideoFile(file);
        setVideoUrl(url);
        setVideoDuration(0);
        setError('');
        setPreviewError(false);
        setProgress(0);
        setProgressLabel('');
        setResultUrl('');
        setResultName('');
        setResultSize(0);
    }, [videoUrl, resultUrl]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !videoUrl) return;

        const onLoaded = () => {
            setVideoDuration(video.duration || 0);
            video.currentTime = 0;
        };

        const onError = () => {
            setPreviewError(true);
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

    const handleClear = useCallback(() => {
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        setVideoFile(null);
        setVideoUrl('');
        setVideoDuration(0);
        setProgress(0);
        setProgressLabel('');
        setResultUrl('');
        setResultName('');
        setResultSize(0);
        setError('');
        setPreviewError(false);
        setIsProcessing(false);
    }, [videoUrl, resultUrl]);

    const getFFmpeg = useCallback(async () => {
        if (ffmpegRef.current && ffmpegRef.current.loaded) return ffmpegRef.current;
        if (loadingRef.current) return loadingRef.current;

        setProgressLabel(t('video-to-mp3/message/loading_engine'));
        setProgress(0);

        const loadPromise = (async () => {
            const ffmpeg = new FFmpeg();

            ffmpeg.on('progress', ({ progress: ratio }) => {
                if (progressRef.current) {
                    progressRef.current(ratio);
                }
            });

            await ffmpeg.load({
                coreURL: `${CORE_BASE}/ffmpeg-core.js`,
                wasmURL: `${CORE_BASE}/ffmpeg-core.wasm`,
            });

            ffmpegRef.current = ffmpeg;
            return ffmpeg;
        })();

        loadPromise.catch((err) => {
            if (ffmpegRef.current) ffmpegRef.current.terminate();
            ffmpegRef.current = null;
            loadingRef.current = null;
            throw err;
        });

        loadingRef.current = loadPromise;
        return loadPromise;
    }, []);

    const convertSmallFile = useCallback(async () => {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
            throw new Error('AudioContext unsupported');
        }

        setProgressLabel(t('video-to-mp3/message/progress'));
        setProgress(10);

        const response = await fetch(videoUrl);
        if (!response.ok) {
            throw new Error('fetch failed');
        }

        const buffer = await response.arrayBuffer();
        setProgress(35);

        const audioContext = new AudioContextClass();
        const decoded = await audioContext.decodeAudioData(buffer.slice(0));
        const channels = Math.min(2, decoded.numberOfChannels);
        const channelData: Float32Array[] = [];
        for (let i = 0; i < channels; i++) {
            channelData.push(decoded.getChannelData(i));
        }

        setProgress(55);
        const blob = encodePcmToMp3(channelData, channels, decoded.sampleRate, (ratio) => {
            setProgress(55 + Math.round(ratio * 35));
        });
        await audioContext.close();
        return blob;
    }, [videoUrl]);

    const handleConvert = useCallback(async () => {
        if (!videoFile || !videoUrl) return;
        setIsProcessing(true);
        setProgress(0);
        setError('');

        const inputName = getSafeInputName(videoFile.name);
        const outputName = 'output.mp3';

        try {
            progressRef.current = (ratio) => {
                setProgress(Math.min(95, Math.round(ratio * 95)));
            };

            setProgressLabel(t('video-to-mp3/message/progress'));
            setProgress(0);

            let blob;
            if (videoFile.size <= LIGHTWEIGHT_MAX_BYTES) {
                try {
                    blob = await convertSmallFile();
                } catch {
                    blob = null;
                }
            }

            if (!blob) {
                const ffmpeg = await getFFmpeg();

                setProgressLabel(t('video-to-mp3/message/progress'));

                const logLines: string[] = [];
                const handleLog = ({ type, message }) => {
                    logLines.push(`[${type}] ${message}`);
                    console.log('ffmpeg:', type, message);
                };
                ffmpeg.on('log', handleLog);

                setProgress(5);

                const response = await fetch(videoUrl);
                const buffer = await response.arrayBuffer();
                const inputData = new Uint8Array(buffer);

                setProgress(15);

                try {
                    await ffmpeg.deleteFile(inputName);
                } catch {
                }
                await ffmpeg.writeFile(inputName, inputData);

                setProgress(20);

                try {
                    const exitCode = await ffmpeg.exec([
                        '-i', inputName,
                        '-vn',
                        '-c:a', 'libmp3lame',
                        '-b:a', `${MP3_BITRATE}k`,
                        outputName,
                    ]);

                    if (exitCode !== 0) {
                        if (hasNoAudioStream(logLines)) {
                            throw new Error('NO_AUDIO_STREAM');
                        }

                        const message = getFfmpegErrorMessage(logLines);
                        throw new Error(message || `ffmpeg exited with code ${exitCode}`);
                    }
                } catch (execErr) {
                    console.error('ffmpeg exec error:', execErr);
                    console.error('ffmpeg log:', logLines.join('\n'));
                    throw execErr;
                } finally {
                    ffmpeg.off('log', handleLog);
                }

                setProgress(85);

                const data = await ffmpeg.readFile(outputName);
                const result = new Uint8Array(data as Uint8Array);

                await ffmpeg.deleteFile(outputName);
                await ffmpeg.deleteFile(inputName);
                blob = new Blob([result], { type: 'audio/mp3' });
            }

            setProgress(96);
            await new Promise((r) => setTimeout(r, 50));

            if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
            const url = URL.createObjectURL(blob);
            const baseName = videoFile.name.replace(/\.[^.]+$/, '');
            setResultUrl(url);
            setResultName(`${baseName}.mp3`);
            setResultSize(blob.size);
            setProgress(100);
            notify(t('video-to-mp3/message/complete'), '', 'success');
        } catch (err: any) {
            console.error('convert error:', err?.name, err?.message, err);
            if (err?.message === 'NO_AUDIO_STREAM') {
                setError(t('video-to-mp3/message/no_audio'));
            } else {
                setError(t('video-to-mp3/message/error'));
            }
            try {
                const ffmpeg = ffmpegRef.current;
                if (ffmpeg) {
                    await ffmpeg.deleteFile(outputName);
                    await ffmpeg.deleteFile(inputName);
                }
            } catch {
            }
        }

        setIsProcessing(false);
        setProgressLabel('');
    }, [videoFile, videoUrl, getFFmpeg, convertSmallFile]);

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

        <div className="video-to-mp3-container">
            <div className="row g-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header bg-light d-flex justify-content-between align-items-center">
                            <span className="text-truncate">{videoFile ? videoFile.name : t('video-to-mp3/button/load')}</span>
                            {videoUrl ? (
<>

                                <button className="btn btn-sm btn-outline-danger" onClick={handleClear} disabled={isProcessing}>
                                    {t('video-to-mp3/button/clear')}
                                </button>
                            
</>
) : null}
                        </div>
                        {!videoUrl ? (
<>

                            <div className="card-body">
                                <VideoUploadZone loadText={t('video-to-mp3/button/load')} onFileLoad={handleFileLoad} />
                            </div>
                        
</>
) : (
<>

                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-12">
                                        {previewError ? (
<>

                                            <div className="alert alert-warning mb-0 py-2 small">
                                                <i className="bi bi-exclamation-triangle me-1"></i>
                                                {t('video-to-mp3/message/preview_error')}
                                            </div>
                                        
</>
) : (
<>

                                            <div className="video-preview-wrapper">
                                                <video ref={videoRef} src={videoUrl} className="w-100 video-player" preload="auto" controls></video>
                                            </div>
                                        
</>
)}
                                    </div>
                                    <div className="col-12">
                                        <div className="row g-2">
                                            <div className="col-6">
                                                <div className="file-info-item">
                                                    <span className="label">{t('video-to-mp3/file_info/duration')}</span>
                                                    <span className="value">{formatDuration(videoDuration)}</span>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="file-info-item">
                                                    <span className="label">{t('video-to-mp3/options/quality')}</span>
                                                    <span className="value">{MP3_BITRATE} kbps</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="d-grid">
                                            <button className="btn btn-success btn-lg" onClick={handleConvert} disabled={isProcessing}>
                                                {isProcessing ? (
<>

                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    {t('video-to-mp3/message/processing')}
                                                
</>
) : (
<>

                                                    <i className="bi bi-music-note me-2"></i>
                                                    {t('video-to-mp3/button/convert')}
                                                
</>
)}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        
</>
)}
                    </div>
                </div>

                {isProcessing ? (
<>

                    <div className="col-12">
                        <div className="card border-primary">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="small text-muted">{progressLabel || t('video-to-mp3/message/progress')}</span>
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

                {resultUrl ? (
<>

                    <div className="col-12">
                        <div className="card border-success">
                            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                                <span><i className="bi bi-check-circle me-1"></i>{t('video-to-mp3/result/title')}</span>
                                <button className="btn btn-sm btn-light" onClick={handleDownload}>
                                    <i className="bi bi-download me-1"></i>
                                    {t('video-to-mp3/button/download')}
                                </button>
                            </div>
                            <div className="card-body">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <div>
                                        <strong>{resultName}</strong>
                                        <span className="text-muted ms-2">({formatSize(resultSize)})</span>
                                    </div>
                                </div>
                                <audio src={resultUrl} controls className="w-100"></audio>
                            </div>
                        </div>
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
