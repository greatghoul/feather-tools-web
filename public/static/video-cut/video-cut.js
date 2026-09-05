import { render } from 'preact';
import { html } from 'htm/preact';
import { useState, useRef, useEffect, useCallback } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import { notify } from '~/helpers/messages.js';
import Timeline from '@/components/Timeline.js';
import VideoControls from '~/components/VideoControls.js';
import VideoResultCard from '~/components/VideoResultCard.js';
import VideoUploadZone from '~/components/VideoUploadZone.js';
import { generateThumbnails } from '@/services/thumbnail-generator.js';

const parseTime = (str) => {
    if (!str || str.trim() === '') return 0;
    const s = str.trim();
    const parts = s.split(':');
    if (parts.length === 1) {
        const v = parseFloat(parts[0]);
        return isNaN(v) ? 0 : Math.max(0, v);
    }
    if (parts.length === 2) {
        const m = parseInt(parts[0], 10);
        const sec = parseFloat(parts[1]);
        if (isNaN(m) || isNaN(sec)) return 0;
        return Math.max(0, m * 60 + sec);
    }
    if (parts.length === 3) {
        const h = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const sec = parseFloat(parts[2]);
        if (isNaN(h) || isNaN(m) || isNaN(sec)) return 0;
        return Math.max(0, h * 3600 + m * 60 + sec);
    }
    return 0;
};

const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds < 0) return '0:00.00';
    const totalSec = Math.max(0, seconds);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toFixed(2).padStart(5, '0')}`;
};

const App = () => {
    const [videoFile, setVideoFile] = useState(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [videoDuration, setVideoDuration] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [editingField, setEditingField] = useState(null);
    const [editText, setEditText] = useState('');
    const [error, setError] = useState('');
    const [cutResultUrl, setCutResultUrl] = useState('');
    const [cutResultName, setCutResultName] = useState('');
    const [thumbnails, setThumbnails] = useState(null);
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const rafRef = useRef(null);
    const loopDebounceRef = useRef(null);
    const loopStartRef = useRef(0);
    const loopEndRef = useRef(0);
    const cuttingRef = useRef(false);
    const generatingRef = useRef(false);

    useEffect(() => {
        return () => {
            if (videoUrl) URL.revokeObjectURL(videoUrl);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            if (loopDebounceRef.current) clearTimeout(loopDebounceRef.current);
        };
    }, [videoUrl]);

    useEffect(() => {
        loopStartRef.current = startTime;
        loopEndRef.current = endTime;
    }, [startTime, endTime]);

    useEffect(() => {
        return () => {
            if (cutResultUrl) URL.revokeObjectURL(cutResultUrl);
        };
    }, [cutResultUrl]);

    const handleFileLoad = useCallback((file) => {
        if (!file) return;
        if (!file.type.startsWith('video/')) {
            setError(getText('video-cut/message/error'));
            return;
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current = null;
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (loopDebounceRef.current) clearTimeout(loopDebounceRef.current);
        const url = URL.createObjectURL(file);
        setVideoFile(file);
        setVideoUrl(url);
        setStartTime(0);
        setEndTime(0);
        setVideoDuration(0);
        setError('');
        setThumbnails(null);
    }, [videoUrl]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !videoUrl) return;

        const onLoaded = () => {
            const dur = video.duration;
            loopStartRef.current = 0;
            loopEndRef.current = dur;
            setVideoDuration(dur);
            setEndTime(dur);
            setStartTime(0);

            video.currentTime = 0;
            setIsPlaying(false);
        };

        const onError = () => {
            setError(getText('video-cut/message/error'));
        };

        const onTimeUpdate = () => {
            if (!generatingRef.current) {
                setCurrentTime(video.currentTime);
            }
            if (!cuttingRef.current && !video.paused && (video.currentTime >= loopEndRef.current || video.ended)) {
                video.currentTime = loopStartRef.current;
                setCurrentTime(loopStartRef.current);
            }
        };

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onEnded = () => setIsPlaying(false);

        video.addEventListener('timeupdate', onTimeUpdate);
        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('ended', onEnded);

        if (video.readyState >= 1) {
            onLoaded();
        } else {
            video.addEventListener('loadedmetadata', onLoaded);
        }
        video.addEventListener('error', onError);
        return () => {
            video.removeEventListener('timeupdate', onTimeUpdate);
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
            video.removeEventListener('ended', onEnded);
            video.removeEventListener('loadedmetadata', onLoaded);
            video.removeEventListener('error', onError);
        };
    }, [videoUrl]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !videoUrl || !videoDuration) return;

        let cancelled = false;
        generatingRef.current = true;
        generateThumbnails(video, videoDuration).then((result) => {
            if (!cancelled) {
                generatingRef.current = false;
                setThumbnails(result);
            }
        });
        return () => {
            cancelled = true;
            generatingRef.current = false;
        };
    }, [videoUrl, videoDuration]);

    const handleVideoClick = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) video.play();
        else video.pause();
    }, []);

    useEffect(() => {
        if (loopDebounceRef.current) clearTimeout(loopDebounceRef.current);
        loopDebounceRef.current = setTimeout(() => {
            const video = videoRef.current;
            if (!video || startTime >= endTime) return;
            video.currentTime = startTime;
        }, 300);
        return () => {
            if (loopDebounceRef.current) clearTimeout(loopDebounceRef.current);
        };
    }, [startTime, endTime]);

    const handleCut = useCallback(() => {
        const video = videoRef.current;
        if (!video || !videoDuration || !videoFile) return;
        if (startTime >= endTime) {
            setError('Invalid time range');
            return;
        }

        if (cutResultUrl) URL.revokeObjectURL(cutResultUrl);
        setCutResultUrl('');

        setIsProcessing(true);
        setError('');
        cuttingRef.current = true;
        chunksRef.current = [];

        video.currentTime = startTime;

        const startCut = () => {
            video.play().then(() => {
                // Use canvas to capture video frames reliably
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth || 640;
                canvas.height = video.videoHeight || 480;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0);

                // Get canvas stream for video track (30fps)
                const canvasStream = canvas.captureStream(30);

                // Try to get audio from video's captureStream
                let combinedStream = canvasStream;
                try {
                    const videoStream = video.captureStream();
                    const audioTrack = videoStream.getAudioTracks()[0];
                    videoStream.getVideoTracks().forEach(t => t.stop());
                    if (audioTrack) {
                        const tracks = [...canvasStream.getVideoTracks(), audioTrack];
                        combinedStream = new MediaStream(tracks);
                    }
                } catch (_) {
                    // Audio capture not supported, video only
                }

                // Prefer MP4 if supported (Safari), fall back to WebM
                const mimeTypes = [
                    'video/mp4;codecs=h264',
                    'video/mp4',
                    'video/webm;codecs=vp9',
                    'video/webm;codecs=vp8',
                    'video/webm',
                ];
                const mimeType = mimeTypes.find(t => MediaRecorder.isTypeSupported(t)) || '';
                const isMp4 = mimeType && mimeType.startsWith('video/mp4');

                try {
                    const recorder = new MediaRecorder(combinedStream, mimeType ? { mimeType } : {});
                    mediaRecorderRef.current = recorder;

                    recorder.ondataavailable = (e) => {
                        if (e.data.size > 0) chunksRef.current.push(e.data);
                    };

                    recorder.onstop = () => {
                        cuttingRef.current = false;
                        if (rafRef.current) cancelAnimationFrame(rafRef.current);
                        video.pause();
                        combinedStream.getTracks().forEach(t => t.stop());

                        if (chunksRef.current.length === 0) {
                            setError(getText('video-cut/message/error'));
                            setIsProcessing(false);
                            return;
                        }

                        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'video/webm' });
                        const resultUrl = URL.createObjectURL(blob);
                        const baseName = videoFile.name.replace(/\.[^.]+$/, '');
                        setCutResultUrl(resultUrl);
                        setCutResultName(`${baseName}-cut.${isMp4 ? 'mp4' : 'webm'}`);
                        chunksRef.current = [];
                        notify(getText('video-cut/message/complete'), '', 'success');
                        setIsProcessing(false);
                    };

                    recorder.onerror = () => {
                        cuttingRef.current = false;
                        if (rafRef.current) cancelAnimationFrame(rafRef.current);
                        video.pause();
                        combinedStream.getTracks().forEach(t => t.stop());
                        setError(getText('video-cut/message/error'));
                        setIsProcessing(false);
                    };

                    // Render loop: draw video frames to canvas at 60fps
                    const renderFrame = () => {
                        ctx.drawImage(video, 0, 0);
                        if (video.currentTime >= endTime || video.ended) {
                            if (recorder.state !== 'inactive') recorder.stop();
                            return;
                        }
                        rafRef.current = requestAnimationFrame(renderFrame);
                    };

                    recorder.start();
                    rafRef.current = requestAnimationFrame(renderFrame);
                } catch (err) {
                    cuttingRef.current = false;
                    setError(getText('video-cut/message/error'));
                    setIsProcessing(false);
                }
            }).catch(() => {
                cuttingRef.current = false;
                setError(getText('video-cut/message/error'));
                setIsProcessing(false);
            });
        };

        // Wait for seek to complete before starting cut
        const waitForSeek = () => {
            if (video.seeking) {
                requestAnimationFrame(waitForSeek);
            } else {
                startCut();
            }
        };
        requestAnimationFrame(waitForSeek);
    }, [videoFile, videoDuration, startTime, endTime, cutResultUrl]);

    const handleClear = useCallback(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (loopDebounceRef.current) clearTimeout(loopDebounceRef.current);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current = null;
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        if (cutResultUrl) URL.revokeObjectURL(cutResultUrl);
        setVideoFile(null);
        setVideoUrl('');
        setVideoDuration(0);
        setStartTime(0);
        setEndTime(0);
        setCutResultUrl('');
        setCutResultName('');
        setError('');
        setEditingField(null);
        setIsProcessing(false);
        setThumbnails(null);
    }, [videoUrl, cutResultUrl]);

    const handleFieldFocus = useCallback((field) => {
        setEditingField(field);
        let currentText = '';
        if (field === 'start') currentText = formatTime(startTime);
        else if (field === 'end') currentText = formatTime(endTime);
        else if (field === 'duration') currentText = formatTime(endTime - startTime);
        setEditText(currentText);
    }, [startTime, endTime]);

    const handleFieldInput = useCallback((e) => {
        setEditText(e.target.value);
    }, []);

    const commitField = useCallback(() => {
        if (!editingField) return;
        const val = parseTime(editText);
        setEditingField(null);
        if (isNaN(val)) return;
        if (editingField === 'start') {
            setStartTime(Math.max(0, Math.min(val, endTime)));
        } else if (editingField === 'end') {
            setEndTime(Math.max(startTime, Math.min(val, videoDuration)));
        } else if (editingField === 'duration') {
            const newEnd = startTime + val;
            setEndTime(Math.max(startTime, Math.min(newEnd, videoDuration)));
        }
    }, [editingField, editText, startTime, endTime, videoDuration]);

    const handleFieldBlur = useCallback(() => {
        commitField();
    }, [commitField]);

    const handleFieldKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            e.target.blur();
        }
    }, []);

    const handleDownload = useCallback(() => {
        if (!cutResultUrl || !cutResultName) return;
        const a = document.createElement('a');
        a.href = cutResultUrl;
        a.download = cutResultName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }, [cutResultUrl, cutResultName]);

    const currentDuration = endTime - startTime;

    return html`
        <div class="video-cut-container">
            <div class="row g-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header bg-light d-flex justify-content-between align-items-center">
                            <span>${getText('video-cut/preview/title')}</span>
                            ${videoUrl ? html`
                                <button class="btn btn-sm btn-outline-danger" onClick=${handleClear} disabled=${isProcessing}>
                                    ${getText('video-cut/button/clear')}
                                </button>
                            ` : null}
                        </div>
                        ${!videoUrl ? html`
                            <div class="card-body">
                                <${VideoUploadZone}
                                    loadText=${getText('video-cut/button/load')}
                                    onFileLoad=${handleFileLoad}
                                />
                            </div>
                        ` : html`
                            <div class="card-body p-0">
                                <div class="video-preview-wrapper position-relative">
                                    <video
                                        ref=${videoRef}
                                        src=${videoUrl}
                                        class="w-100 video-player"
                                        preload="auto"
                                        onClick=${handleVideoClick}
                                    ></video>
                                    <${VideoControls}
                                        videoRef=${videoRef}
                                        currentTime=${currentTime}
                                        duration=${videoDuration}
                                        isPlaying=${isPlaying}
                                        startTime=${startTime}
                                        endTime=${endTime}
                                    />
                                </div>
                            </div>
                        `}
                    </div>
                </div>

                ${videoUrl && videoDuration > 0 ? html`
                    <div class="col-12">
                        <${Timeline}
                            duration=${videoDuration}
                            startTime=${startTime}
                            endTime=${endTime}
                            onStartChange=${setStartTime}
                            onEndChange=${setEndTime}
                            thumbnails=${thumbnails}
                        />
                    </div>

                    <div class="col-12">
                        <div class="card">
                            <div class="card-body">
                                <div class="row g-3 align-items-end">
                                    <div class="col-md-3">
                                        <label class="form-label small mb-1">${getText('video-cut/controls/start_time')}</label>
                                        <div class="input-group input-group-sm">
                                            <input
                                                type="text"
                                                class="form-control"
                                                value=${editingField === 'start' ? editText : formatTime(startTime)}
                                                onFocus=${() => handleFieldFocus('start')}
                                                onInput=${handleFieldInput}
                                                onBlur=${handleFieldBlur}
                                                onKeyDown=${handleFieldKeyDown}
                                                disabled=${isProcessing}
                                            />
                                            <span class="input-group-text"><i class="bi bi-play-fill"></i></span>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label small mb-1">${getText('video-cut/controls/end_time')}</label>
                                        <div class="input-group input-group-sm">
                                            <input
                                                type="text"
                                                class="form-control"
                                                value=${editingField === 'end' ? editText : formatTime(endTime)}
                                                onFocus=${() => handleFieldFocus('end')}
                                                onInput=${handleFieldInput}
                                                onBlur=${handleFieldBlur}
                                                onKeyDown=${handleFieldKeyDown}
                                                disabled=${isProcessing}
                                            />
                                            <span class="input-group-text"><i class="bi bi-stop-fill"></i></span>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label small mb-1">${getText('video-cut/controls/duration')}</label>
                                        <div class="input-group input-group-sm">
                                            <input
                                                type="text"
                                                class="form-control"
                                                value=${editingField === 'duration' ? editText : formatTime(currentDuration)}
                                                onFocus=${() => handleFieldFocus('duration')}
                                                onInput=${handleFieldInput}
                                                onBlur=${handleFieldBlur}
                                                onKeyDown=${handleFieldKeyDown}
                                                disabled=${isProcessing}
                                            />
                                            <span class="input-group-text"><i class="bi bi-clock"></i></span>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="d-grid gap-2">
                                            <button
                                                class="btn btn-success"
                                                onClick=${handleCut}
                                                disabled=${isProcessing || startTime >= endTime}
                                            >
                                                ${isProcessing ? html`
                                                    <span class="spinner-border spinner-border-sm me-1"></span>
                                                    ${getText('video-cut/message/processing')}
                                                ` : getText('video-cut/button/cut')}
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                ` : null}

                <${VideoResultCard}
                    src=${cutResultUrl}
                    completeText=${getText('video-cut/message/complete')}
                    downloadText=${getText('video-cut/button/download')}
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
