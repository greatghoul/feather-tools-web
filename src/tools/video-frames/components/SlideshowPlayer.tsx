import { useState, useEffect, useCallback } from 'react';
import { t } from '~/helpers/i18n';
import { formatTimestamp } from '../services/VideoFramesService';

const SlideshowPlayer = ({ frames, isOpen, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [loop, setLoop] = useState(true);
    const [duration, setDuration] = useState(500);

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(0);
            setIsPlaying(true);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, frames]);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => {
            const next = prev - 1;
            if (next < 0) return loop ? frames.length - 1 : 0;
            return next;
        });
    }, [loop, frames.length]);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => {
            const next = prev + 1;
            if (next >= frames.length) {
                if (loop) return 0;
                return prev;
            }
            return next;
        });
    }, [loop, frames.length]);

    const togglePlay = useCallback(() => {
        setIsPlaying((prev) => !prev);
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const onKeyDown = (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                handlePrev();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                handleNext();
            } else if (e.key === ' ') {
                e.preventDefault();
                togglePlay();
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen, handlePrev, handleNext, togglePlay, onClose]);

    useEffect(() => {
        if (!isPlaying || frames.length === 0) return;

        const timer = setTimeout(() => {
            setCurrentIndex((prev) => {
                const next = prev + 1;
                if (next >= frames.length) {
                    if (loop) return 0;
                    setIsPlaying(false);
                    return prev;
                }
                return next;
            });
        }, duration);

        return () => clearTimeout(timer);
    }, [isPlaying, currentIndex, duration, loop, frames.length]);

    if (!isOpen || frames.length === 0) return null;

    const safeIndex = Math.min(currentIndex, frames.length - 1);
    const frame = frames[safeIndex];

    return (
<>

        <div className="slideshow-overlay" onClick={onClose}>
            <div className="slideshow-content" onClick={(e) => e.stopPropagation()}>
                <div className="slideshow-header">
                    <span className="slideshow-title">
                        {t('video-frames/slideshow/title')}
                    </span>
                    <button className="btn btn-sm btn-close btn-close-white" onClick={onClose} aria-label={t('video-frames/button/close')}></button>
                </div>

                <div className="slideshow-stage">
                    <img className="slideshow-image" src={frame.url} alt={`Frame ${frame.index + 1}`} />
                </div>

                <div className="slideshow-info">
                    <span>
                        {t('video-frames/slideshow/frame')}
                        {safeIndex + 1} / {frames.length}
                    </span>
                    <span className="text-muted">
                        {formatTimestamp(frame.timestamp)}
                    </span>
                </div>

                <div className="slideshow-controls">
                    <button className="btn btn-light slideshow-nav-btn" onClick={handlePrev} title={t('video-frames/slideshow/prev')}>
                        <i className="bi bi-chevron-left"></i>
                    </button>
                    <button className="btn btn-light slideshow-play-btn" onClick={togglePlay}>
                        <i className={`bi ${isPlaying ? 'bi-pause-fill' : 'bi-play-fill'}`}></i>
                        <span className="ms-1">
                            {isPlaying
                                ? t('video-frames/slideshow/pause')
                                : t('video-frames/slideshow/play')}
                        </span>
                    </button>
                    <button className="btn btn-light slideshow-nav-btn" onClick={handleNext} title={t('video-frames/slideshow/next')}>
                        <i className="bi bi-chevron-right"></i>
                    </button>
                </div>

                <div className="slideshow-settings">
                    <div className="d-flex align-items-center gap-2">
                        <div className="form-check form-switch m-0">
                            <input className="form-check-input" type="checkbox" id="slideshow-loop" checked={loop} onChange={(e) => setLoop(e.target.checked)} />
                            <label className="form-check-label text-white small" htmlFor="slideshow-loop">
                                {t('video-frames/slideshow/loop')}
                            </label>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <label className="text-white small mb-0">
                            {t('video-frames/slideshow/duration')}
                        </label>
                        <input type="range" className="form-range slideshow-duration-slider" value={duration} min="50" max="3000" step="50" onInput={(e) => setDuration(parseInt((e.target as HTMLInputElement).value, 10))} />
                        <span className="text-white small" style={{ minWidth: '60px' }}>
                            {duration}ms
                        </span>
                    </div>
                </div>
            </div>
        </div>
    
</>
);
};

export default SlideshowPlayer;
