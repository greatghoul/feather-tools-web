import { html } from 'htm/preact';
import { useState, useEffect, useCallback } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import { formatTimestamp } from '@/services/VideoFramesService.js';

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

    return html`
        <div class="slideshow-overlay" onClick=${onClose}>
            <div class="slideshow-content" onClick=${(e) => e.stopPropagation()}>
                <div class="slideshow-header">
                    <span class="slideshow-title">
                        ${getText('video-frames/slideshow/title')}
                    </span>
                    <button
                        class="btn btn-sm btn-close btn-close-white"
                        onClick=${onClose}
                        aria-label=${getText('video-frames/button/close')}
                    ></button>
                </div>

                <div class="slideshow-stage">
                    <img
                        class="slideshow-image"
                        src=${frame.url}
                        alt="Frame ${frame.index + 1}"
                    />
                </div>

                <div class="slideshow-info">
                    <span>
                        ${getText('video-frames/slideshow/frame')}
                        ${safeIndex + 1} / ${frames.length}
                    </span>
                    <span class="text-muted">
                        ${formatTimestamp(frame.timestamp)}
                    </span>
                </div>

                <div class="slideshow-controls">
                    <button
                        class="btn btn-light slideshow-nav-btn"
                        onClick=${handlePrev}
                        title=${getText('video-frames/slideshow/prev')}
                    >
                        <i class="bi bi-chevron-left"></i>
                    </button>
                    <button
                        class="btn btn-light slideshow-play-btn"
                        onClick=${togglePlay}
                    >
                        <i class="bi ${isPlaying ? 'bi-pause-fill' : 'bi-play-fill'}"></i>
                        <span class="ms-1">
                            ${isPlaying
                                ? getText('video-frames/slideshow/pause')
                                : getText('video-frames/slideshow/play')}
                        </span>
                    </button>
                    <button
                        class="btn btn-light slideshow-nav-btn"
                        onClick=${handleNext}
                        title=${getText('video-frames/slideshow/next')}
                    >
                        <i class="bi bi-chevron-right"></i>
                    </button>
                </div>

                <div class="slideshow-settings">
                    <div class="d-flex align-items-center gap-2">
                        <div class="form-check form-switch m-0">
                            <input
                                class="form-check-input"
                                type="checkbox"
                                id="slideshow-loop"
                                checked=${loop}
                                onChange=${(e) => setLoop(e.target.checked)}
                            />
                            <label class="form-check-label text-white small" for="slideshow-loop">
                                ${getText('video-frames/slideshow/loop')}
                            </label>
                        </div>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <label class="text-white small mb-0">
                            ${getText('video-frames/slideshow/duration')}
                        </label>
                        <input
                            type="range"
                            class="form-range slideshow-duration-slider"
                            value=${duration}
                            min="50"
                            max="3000"
                            step="50"
                            onInput=${(e) => setDuration(parseInt(e.target.value, 10))}
                        />
                        <span class="text-white small" style=${{ minWidth: '60px' }}>
                            ${duration}ms
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;
};

export default SlideshowPlayer;
