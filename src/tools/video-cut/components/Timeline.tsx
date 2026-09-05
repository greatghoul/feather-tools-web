import { useRef, useState, useEffect, useCallback } from 'react';
import type { CSSProperties } from 'react';

const Timeline = ({ duration, startTime, endTime, onStartChange, onEndChange, thumbnails }) => {
    const barRef = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState<string | null>(null);
    const [hoverTime, setHoverTime] = useState<number | null>(null);
    const [hoverX, setHoverX] = useState(0);
    const draggingRef = useRef<string | null>(null);
    const startTimeRef = useRef(startTime);
    const endTimeRef = useRef(endTime);
    const blockDragRef = useRef({ initialStart: 0, initialEnd: 0, initialTime: 0 });
    const hoverThrottleRef = useRef(0);

    useEffect(() => {
        startTimeRef.current = startTime;
        endTimeRef.current = endTime;
    }, [startTime, endTime]);

    useEffect(() => {
        draggingRef.current = dragging;
    }, [dragging]);

    const getClientX = (e) => {
        return e.touches ? e.touches[0].clientX : e.clientX;
    };

    const getTimeFromPosition = useCallback((clientX) => {
        const bar = barRef.current;
        if (!bar || !duration) return 0;
        const rect = bar.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        return (x / rect.width) * duration;
    }, [duration]);

    useEffect(() => {
        const currentDragging = draggingRef.current;
        if (!currentDragging) return;

        const handleMove = (e) => {
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const time = getTimeFromPosition(clientX);
            const st = startTimeRef.current;
            const et = endTimeRef.current;

            if (currentDragging === 'start') {
                const clamped = Math.max(0, Math.min(time, et - 0.1));
                onStartChange(clamped);
            } else if (currentDragging === 'end') {
                const clamped = Math.min(duration, Math.max(time, st + 0.1));
                onEndChange(clamped);
            } else if (currentDragging === 'block') {
                const delta = time - blockDragRef.current.initialTime;
                const range = blockDragRef.current.initialEnd - blockDragRef.current.initialStart;
                let newStart = blockDragRef.current.initialStart + delta;
                let newEnd = blockDragRef.current.initialEnd + delta;
                if (newStart < 0) {
                    newStart = 0;
                    newEnd = range;
                } else if (newEnd > duration) {
                    newEnd = duration;
                    newStart = duration - range;
                }
                onStartChange(newStart);
                onEndChange(newEnd);
            }
        };

        const handleUp = () => {
            setDragging(null);
        };

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp);
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('touchend', handleUp);
        return () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleUp);
        };
    }, [dragging, getTimeFromPosition, duration, onStartChange, onEndChange]);

    const handleMouseDown = useCallback((e, handle) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(handle);
    }, []);

    const handleBlockMouseDown = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        blockDragRef.current = {
            initialStart: startTimeRef.current,
            initialEnd: endTimeRef.current,
            initialTime: getTimeFromPosition(getClientX(e)),
        };
        setDragging('block');
    }, [getTimeFromPosition]);

    const handleBarClick = useCallback((e) => {
        if (draggingRef.current) return;
        const time = getTimeFromPosition(getClientX(e));
        const st = startTimeRef.current;
        const et = endTimeRef.current;
        const distToStart = Math.abs(time - st);
        const distToEnd = Math.abs(time - et);
        if (distToStart < distToEnd && distToStart < 0.5) return;
        if (distToEnd < distToStart && distToEnd < 0.5) return;
        const mid = (st + et) / 2;
        if (time < mid) {
            onStartChange(Math.max(0, Math.min(time, et - 0.1)));
        } else {
            onEndChange(Math.min(duration, Math.max(time, st + 0.1)));
        }
    }, [getTimeFromPosition, duration, onStartChange, onEndChange]);

    const handleMouseMove = useCallback((e) => {
        if (draggingRef.current) return;
        const now = Date.now();
        if (now - hoverThrottleRef.current < 50) return;
        hoverThrottleRef.current = now;
        const bar = barRef.current;
        if (!bar) return;
        const rect = bar.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const time = (x / rect.width) * duration;
        setHoverTime(time);
        setHoverX(e.clientX - rect.left);
    }, [duration]);

    const handleMouseLeave = useCallback(() => {
        setHoverTime(null);
    }, []);

    const startPct = duration > 0 ? (startTime / duration) * 100 : 0;
    const endPct = duration > 0 ? (endTime / duration) * 100 : 100;
    const selectedPct = endPct - startPct;

    const formatTick = (t) => {
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const totalSec = Math.floor(duration);
    const tickInterval = totalSec <= 30 ? 5 : totalSec <= 120 ? 15 : totalSec <= 600 ? 30 : 60;
    const ticks: number[] = [];
    for (let t = 0; t <= totalSec; t += tickInterval) {
        ticks.push(t);
    }
    if (ticks[ticks.length - 1] !== totalSec) ticks.push(totalSec);

    const hoverThumbIdx = thumbnails && hoverTime != null
        ? Math.min(Math.floor((hoverTime / duration) * thumbnails.count), thumbnails.count - 1)
        : -1;
    const hoverThumbUrl = hoverThumbIdx >= 0 ? thumbnails.list[hoverThumbIdx] : null;

    const barStyle: CSSProperties = {
        height: '72px',
        borderRadius: '6px',
        cursor: dragging === 'block' ? 'grabbing' : dragging ? 'ew-resize' : 'pointer',
        userSelect: 'none',
        touchAction: 'none',
        position: 'relative',
        overflow: 'hidden',
    };

    return (
<>

        <div className="card">
            <div className="card-body">
                <div style={{ position: 'relative' }}>
                    <div className="timeline-bar" ref={barRef} style={barStyle} onClick={handleBarClick} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                        {thumbnails ? (
<>

                            <div className="position-absolute top-0 bottom-0 start-0 end-0" style={{
                                    zIndex: 0,
                                    display: 'flex',
                                    alignItems: 'stretch',
                                    overflow: 'hidden',
                                    borderRadius: '6px',
                                }}>
                                {thumbnails.list.map((url, i) => (
<>

                                    <div style={{
                                        flex: '1 0 0',
                                        minWidth: 0,
                                        background: '#111',
                                        borderRight: i < thumbnails.count - 1 ? '1px solid rgba(255,255,255,0.15)' : 'none',
                                        overflow: 'hidden',
                                    }}>
                                        <img src={url} style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                display: 'block',
                                            }} />
                                    </div>
                                
</>
))}
                            </div>
                        
</>
) : null}

                        <div className="position-absolute top-0 bottom-0" style={{
                                left: '0',
                                width: startPct + '%',
                                background: 'rgba(0,0,0,0.35)',
                                borderRadius: '6px 0 0 6px',
                                pointerEvents: 'none',
                                zIndex: 2,
                            }}></div>

                        <div className="position-absolute top-0 bottom-0" style={{
                                left: endPct + '%',
                                width: (100 - endPct) + '%',
                                background: 'rgba(0,0,0,0.35)',
                                borderRadius: '0 6px 6px 0',
                                pointerEvents: 'none',
                                zIndex: 2,
                            }}></div>

                        <div className="position-absolute top-0 bottom-0" style={{
                                left: startPct + '%',
                                width: selectedPct + '%',
                                background: 'rgba(13, 110, 253, 0.25)',
                                borderLeft: '2px solid #0d6efd',
                                borderRight: '2px solid #dc3545',
                                cursor: dragging === 'block' ? 'grabbing' : 'grab',
                                pointerEvents: 'auto',
                                zIndex: 3,
                            }} onMouseDown={handleBlockMouseDown} onTouchStart={handleBlockMouseDown}></div>

                        <div className="timeline-handle position-absolute top-0" style={{
                                left: startPct + '%',
                                width: '14px',
                                height: '100%',
                                transform: 'translateX(-50%)',
                                cursor: 'ew-resize',
                                zIndex: 10,
                            }} onMouseDown={(e) => handleMouseDown(e, 'start')} onTouchStart={(e) => handleMouseDown(e, 'start')}>
                            <div className="timeline-handle-inner bg-primary"></div>
                        </div>

                        <div className="timeline-handle position-absolute top-0" style={{
                                left: endPct + '%',
                                width: '14px',
                                height: '100%',
                                transform: 'translateX(-50%)',
                                cursor: 'ew-resize',
                                zIndex: 10,
                            }} onMouseDown={(e) => handleMouseDown(e, 'end')} onTouchStart={(e) => handleMouseDown(e, 'end')}>
                            <div className="timeline-handle-inner bg-danger"></div>
                        </div>

                        <div className="timeline-time-label position-absolute" style={{
                            left: startPct + '%',
                            bottom: '-20px',
                            transform: 'translateX(-50%)',
                            fontSize: '11px',
                            color: '#0d6efd',
                            whiteSpace: 'nowrap',
                            zIndex: 5,
                        }}>
                            {formatTime(startTime)}
                        </div>
                        <div className="timeline-time-label position-absolute" style={{
                            left: endPct + '%',
                            bottom: '-20px',
                            transform: 'translateX(-50%)',
                            fontSize: '11px',
                            color: '#dc3545',
                            whiteSpace: 'nowrap',
                            zIndex: 5,
                        }}>
                            {formatTime(endTime)}
                        </div>
                    </div>

                    {hoverThumbUrl ? (
<>

                        <div className="timeline-hover-preview" style={{
                                position: 'absolute',
                                left: hoverX + 'px',
                                bottom: '100%',
                                transform: 'translateX(-50%)',
                                marginBottom: '8px',
                                zIndex: 100,
                                pointerEvents: 'none',
                            }}>
                            <div style={{
                                background: '#fff',
                                borderRadius: '6px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                overflow: 'hidden',
                                padding: '2px',
                            }}>
                                <img src={hoverThumbUrl} style={{
                                        display: 'block',
                                        width: '160px',
                                        height: '90px',
                                        objectFit: 'cover',
                                        borderRadius: '4px',
                                    }} />
                                <div style={{
                                    textAlign: 'center',
                                    fontSize: '11px',
                                    color: '#333',
                                    padding: '2px 0',
                                }}>
                                    {formatTime(hoverTime)}
                                </div>
                            </div>
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '0',
                                height: '0',
                                borderLeft: '6px solid transparent',
                                borderRight: '6px solid transparent',
                                borderTop: '6px solid #fff',
                            }}></div>
                        </div>
                    
</>
) : null}
                </div>

                <div className="position-relative" style={{ height: '20px', marginTop: '22px' }}>
                    {ticks.map(t => {
                        const pct = (t / duration) * 100;
                        return (
<>

                            <div className="position-absolute" style={{
                                left: pct + '%',
                                transform: 'translateX(-50%)',
                                fontSize: '10px',
                                color: '#6c757d',
                                whiteSpace: 'nowrap',
                                top: '0',
                            }}>
                                {formatTick(t)}
                            </div>
                        
</>
);
                    })}
                </div>
            </div>
        </div>
    
</>
);
};

const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds < 0) return '0:00.00';
    const totalSec = Math.max(0, seconds);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toFixed(2).padStart(5, '0')}`;
};

export default Timeline;
