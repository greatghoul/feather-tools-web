import { useRef, useState, useEffect } from 'react';

const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
    const totalSec = Math.max(0, seconds);
    const m = Math.floor(totalSec / 60);
    const s = Math.floor(totalSec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

const VideoControls = ({ videoRef, currentTime, duration, isPlaying, startTime, endTime }: {
    videoRef: { current: HTMLVideoElement | null };
    currentTime: number;
    duration: number;
    isPlaying: boolean;
    startTime?: number | null;
    endTime?: number | null;
}) => {
    const [isMuted, setIsMuted] = useState(false);
    const barRef = useRef<HTMLDivElement>(null);
    const draggingRef = useRef(false);

    const video = videoRef.current;
    const hasSelection = startTime != null && endTime != null;

    const getTimeFromEvent = (e) => {
        const bar = barRef.current;
        if (!bar || !duration) return null;
        const rect = bar.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        return (x / rect.width) * duration;
    };

    const seekTo = (time) => {
        if (time === null || !video) return;
        video.currentTime = time;
    };

    const handleSeekStart = (e) => {
        e.preventDefault();
        const time = getTimeFromEvent(e);
        seekTo(time);
        draggingRef.current = true;

        const handleMove = (me) => {
            if (!draggingRef.current) return;
            seekTo(getTimeFromEvent(me));
        };
        const handleUp = () => {
            draggingRef.current = false;
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleUp);
        };

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp);
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('touchend', handleUp);
    };

    const handlePlayPause = () => {
        if (!video) return;
        if (video.paused) video.play();
        else video.pause();
    };

    const handleMuteToggle = () => {
        if (!video) return;
        video.muted = !video.muted;
        setIsMuted(video.muted);
    };

    useEffect(() => {
        if (!video) return;
        const onVolumeChange = () => setIsMuted(video.muted);
        video.addEventListener('volumechange', onVolumeChange);
        return () => video.removeEventListener('volumechange', onVolumeChange);
    }, [video]);

    useEffect(() => {
        if (!video) return;
        return () => {
            if (draggingRef.current) {
                draggingRef.current = false;
            }
        };
    }, [video]);

    const currentPct = duration > 0 ? (currentTime / duration) * 100 : 0;
    const startPct = duration > 0 && startTime != null ? (startTime / duration) * 100 : 0;
    const endPct = duration > 0 && endTime != null ? (endTime / duration) * 100 : 100;
    const playedPct = hasSelection ? Math.max(0, currentPct - startPct) : currentPct;

    return (
<>

        <div className="video-controls d-flex align-items-center gap-2 px-3 py-2">
            <button className="btn btn-link text-white p-0 border-0" onClick={handlePlayPause} style={{ fontSize: '1.3rem', lineHeight: 1 }}>
                <i className={`bi ${isPlaying ? 'bi-pause-fill' : 'bi-play-fill'}`}></i>
            </button>

            <div className="video-progress-bar position-relative flex-grow-1" ref={barRef} onMouseDown={handleSeekStart} onTouchStart={handleSeekStart} style={{
                    height: '24px',
                    padding: '10px 0',
                    cursor: 'pointer',
                    touchAction: 'none',
                    userSelect: 'none',
                }}>
                <div className="position-absolute" style={{
                        left: '0',
                        right: '0',
                        top: '10px',
                        height: '4px',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '2px',
                    }}></div>

                {hasSelection && endPct > startPct ? (
<>

                    <div className="position-absolute" style={{
                            left: startPct + '%',
                            top: '10px',
                            width: (endPct - startPct) + '%',
                            height: '4px',
                            background: 'rgba(255,255,255,0.35)',
                            borderRadius: '2px',
                        }}></div>
                
</>
) : null}

                {playedPct > 0 ? (
<>

                    <div className="position-absolute" style={{
                            left: (hasSelection ? startPct : 0) + '%',
                            top: '10px',
                            width: playedPct + '%',
                            height: '4px',
                            background: '#0d6efd',
                            borderRadius: hasSelection ? '2px 0 0 2px' : '2px',
                        }}></div>
                
</>
) : null}

                {hasSelection ? (
<>

                    <div className="position-absolute" style={{
                            left: startPct + '%',
                            top: '6px',
                            width: '3px',
                            height: '12px',
                            background: '#0d6efd',
                            borderRadius: '2px',
                            transform: 'translateX(-50%)',
                            pointerEvents: 'none',
                        }}></div>

                    <div className="position-absolute" style={{
                            left: endPct + '%',
                            top: '6px',
                            width: '3px',
                            height: '12px',
                            background: '#dc3545',
                            borderRadius: '2px',
                            transform: 'translateX(-50%)',
                            pointerEvents: 'none',
                        }}></div>
                
</>
) : null}

                <div className="position-absolute" style={{
                        left: currentPct + '%',
                        top: '7px',
                        width: '10px',
                        height: '10px',
                        background: '#fff',
                        borderRadius: '50%',
                        border: '2px solid #0d6efd',
                        transform: 'translateX(-50%)',
                        pointerEvents: 'none',
                    }}></div>
            </div>

            <span className="text-white small" style={{ minWidth: '90px', textAlign: 'right', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <button className="btn btn-link text-white p-0 border-0" onClick={handleMuteToggle} style={{ fontSize: '1.2rem', lineHeight: 1 }}>
                <i className={`bi ${isMuted ? 'bi-volume-mute-fill' : 'bi-volume-up-fill'}`}></i>
            </button>
        </div>
    
</>
);
};

export default VideoControls;
