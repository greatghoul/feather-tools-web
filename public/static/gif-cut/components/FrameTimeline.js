import { html } from 'htm/preact';
import { useRef, useState, useEffect, useCallback } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';

const FrameTimeline = ({ totalFrames, startFrame, endFrame, onStartChange, onEndChange, frames }) => {
    const timelineRef = useRef(null);
    const [hoverFrame, setHoverFrame] = useState(null);
    const draggingRef = useRef(null);
    const startRef = useRef(startFrame);
    const endRef = useRef(endFrame);

    useEffect(() => {
        startRef.current = startFrame;
    }, [startFrame]);

    useEffect(() => {
        endRef.current = endFrame;
    }, [endFrame]);

    const getFrameFromPos = useCallback((clientX) => {
        const rect = timelineRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const ratio = x / rect.width;
        return Math.max(0, Math.min(totalFrames - 1, Math.round(ratio * (totalFrames - 1))));
    }, [totalFrames]);

    const handleMouseDown = (type) => (e) => {
        e.preventDefault();
        draggingRef.current = type;
    };

    useEffect(() => {
        const onMove = (e) => {
            if (!draggingRef.current || !timelineRef.current) return;
            const frame = getFrameFromPos(e.clientX);
            setHoverFrame(frame);
            if (draggingRef.current === 'start') {
                onStartChange(Math.min(frame, endRef.current));
            } else {
                onEndChange(Math.max(frame, startRef.current));
            }
        };

        const onUp = () => {
            draggingRef.current = null;
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [getFrameFromPos, onStartChange, onEndChange]);

    const startPercent = (startFrame / totalFrames) * 100;
    const endPercent = ((endFrame + 1) / totalFrames) * 100;

    return html`
        <div class="card">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="small text-muted">
                        ${getText('gif-cut/timeline/frame_count').replace('{count}', totalFrames)}
                    </span>
                    <span class="small text-muted">
                        ${getText('gif-cut/timeline/frame')} ${startFrame + 1} - ${endFrame + 1}
                        (${endFrame - startFrame + 1})
                    </span>
                </div>
                <div
                    ref=${timelineRef}
                    class="timeline-bar position-relative"
                    style="height: 60px; background: #f0f0f0; border-radius: 6px; overflow: hidden; cursor: pointer;"
                >
                    <div class="d-flex h-100" style="gap: 1px;">
                        ${frames.slice(0, Math.min(frames.length, totalFrames)).map((frame, i) => {
                            const isSelected = i >= startFrame && i <= endFrame;
                            const isHover = i === hoverFrame;
                            return html`
                                <div
                                    class="flex-grow-1 position-relative"
                                    style=${{
                                        background: isSelected ? '#0d6efd33' : 'transparent',
                                        borderLeft: isHover ? '2px solid rgba(0,0,0,0.2)' : 'none',
                                    }}
                                >
                                    ${frame.thumbnail ? html`
                                        <img
                                            src=${frame.thumbnail}
                                            alt="frame ${i + 1}"
                                            style="width: 100%; height: 100%; object-fit: cover;"
                                        />
                                    ` : null}
                                </div>
                            `;
                        })}
                    </div>
                    <div
                        class="position-absolute top-0 h-100"
                        style=${{
                            left: startPercent + '%',
                            width: (endPercent - startPercent) + '%',
                            background: 'rgba(13, 110, 253, 0.25)',
                            borderLeft: '2px solid #0d6efd',
                            borderRight: '2px solid #0d6efd',
                            pointerEvents: 'none',
                        }}
                    ></div>
                    <div
                        class="timeline-handle position-absolute top-0 start-0 h-100 d-flex align-items-center"
                        style=${{
                            left: startPercent + '%',
                            transform: 'translateX(-50%)',
                            cursor: 'ew-resize',
                            zIndex: 10,
                            width: '12px',
                        }}
                        onMouseDown=${handleMouseDown('start')}
                    >
                        <div class="timeline-handle-inner bg-primary"></div>
                    </div>
                    <div
                        class="timeline-handle position-absolute top-0 h-100 d-flex align-items-center"
                        style=${{
                            left: endPercent + '%',
                            transform: 'translateX(-50%)',
                            cursor: 'ew-resize',
                            zIndex: 10,
                            width: '12px',
                        }}
                        onMouseDown=${handleMouseDown('end')}
                    >
                        <div class="timeline-handle-inner bg-danger"></div>
                    </div>
                </div>
                ${hoverFrame !== null ? html`
                    <div class="text-center mt-1">
                        <small class="text-muted">
                            ${getText('gif-cut/timeline/frame')} ${hoverFrame + 1}
                        </small>
                    </div>
                ` : null}
            </div>
        </div>
    `;
};

export default FrameTimeline;
