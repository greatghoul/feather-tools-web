import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { t } from '~/helpers/i18n';
import styles from './ObjectCounter.module.css';

interface Mark {
    /** Horizontal position relative to the image (0..1), so marks survive zooming. */
    x: number;
    /** Vertical position relative to the image (0..1). */
    y: number;
}

interface View {
    zoom: number;
    pan: { x: number; y: number };
}

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 8;
const ZOOM_STEP = 1.25;
/** How far the pointer may move before a press counts as panning instead of a click. */
const DRAG_THRESHOLD = 4;
/** Marker diameter in screen pixels; kept constant by dividing by the zoom level. */
const DOT_SIZE = 14;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const DEFAULT_VIEW: View = { zoom: 1, pan: { x: 0, y: 0 } };

const ObjectCounter = ({ image }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const stageRef = useRef<HTMLDivElement | null>(null);
    const dragRef = useRef<{
        startX: number;
        startY: number;
        panX: number;
        panY: number;
        moved: boolean;
    } | null>(null);

    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [marks, setMarks] = useState<Mark[]>([]);
    const [view, setView] = useState<View>(DEFAULT_VIEW);
    const [isPanning, setIsPanning] = useState(false);

    // Fit the whole image inside the viewport (never enlarge beyond 1:1 initially).
    const baseSize = useMemo(() => {
        if (!image || !containerSize.width || !containerSize.height) {
            return { width: 0, height: 0 };
        }
        const fit = Math.min(
            containerSize.width / image.width,
            containerSize.height / image.height,
            1
        );
        return { width: image.width * fit, height: image.height * fit };
    }, [image, containerSize]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const update = () =>
            setContainerSize({ width: container.clientWidth, height: container.clientHeight });
        update();

        const observer = new ResizeObserver(update);
        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    // A new image starts with a clean sheet and a fitted view.
    useEffect(() => {
        setMarks([]);
        setView(DEFAULT_VIEW);
    }, [image?.id]);

    /** Zooms by `factor` while keeping the point (qx, qy), relative to the viewport centre, in place. */
    const zoomAt = useCallback((factor: number, qx = 0, qy = 0) => {
        setView((current) => {
            const zoom = clamp(current.zoom * factor, MIN_ZOOM, MAX_ZOOM);
            const ratio = zoom / current.zoom;
            if (ratio === 1) return current;
            return {
                zoom,
                pan: {
                    x: qx * (1 - ratio) + current.pan.x * ratio,
                    y: qy * (1 - ratio) + current.pan.y * ratio,
                },
            };
        });
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (event: WheelEvent) => {
            if (!stageRef.current) return;
            event.preventDefault();
            const rect = container.getBoundingClientRect();
            const qx = event.clientX - rect.left - rect.width / 2;
            const qy = event.clientY - rect.top - rect.height / 2;
            zoomAt(event.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP, qx, qy);
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, [zoomAt]);

    const undo = useCallback(() => {
        setMarks((current) => current.slice(0, -1));
    }, []);

    const clearAll = useCallback(() => {
        setMarks([]);
    }, []);

    const resetView = useCallback(() => {
        setView(DEFAULT_VIEW);
    }, []);

    useEffect(() => {
        if (!image) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            if (
                target &&
                (target.tagName === 'INPUT' ||
                    target.tagName === 'TEXTAREA' ||
                    target.isContentEditable)
            ) {
                return;
            }
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
                event.preventDefault();
                undo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [image, undo]);

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        if (event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        dragRef.current = {
            startX: event.clientX,
            startY: event.clientY,
            panX: view.pan.x,
            panY: view.pan.y,
            moved: false,
        };
        setIsPanning(true);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;
        if (!drag) return;

        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;
        if (!drag.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
            drag.moved = true;
        }
        if (!drag.moved) return;

        setView((current) => ({ ...current, pan: { x: drag.panX + dx, y: drag.panY + dy } }));
    };

    const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;
        dragRef.current = null;
        setIsPanning(false);
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
        if (!drag || drag.moved) return;

        const stage = stageRef.current;
        if (!stage) return;

        // The stage may be scaled/panned, but its rect still maps 1:1 onto the image.
        const rect = stage.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        if (x < 0 || x > 1 || y < 0 || y > 1) return;

        setMarks((current) => [...current, { x, y }]);
    };

    const handlePointerCancel = () => {
        dragRef.current = null;
        setIsPanning(false);
    };

    return (
        <div className="card h-100">
            <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
                <h5 className="mb-0">{t('image-object-counter/counter/title')}</h5>
                <div className="d-flex align-items-center gap-2">
                    <span className="text-muted small">
                        {t('image-object-counter/counter/label')}
                    </span>
                    <span className={`badge text-bg-danger ${styles.count}`}>{marks.length}</span>
                </div>
            </div>
            <div className="card-body pb-2">
                <div
                    ref={containerRef}
                    className={`${styles.viewport} ${isPanning ? styles.panning : ''}`}
                >
                    {image ? (
                        <div
                            ref={stageRef}
                            className={styles.stage}
                            style={{
                                width: baseSize.width,
                                height: baseSize.height,
                                transform: `translate(${view.pan.x}px, ${view.pan.y}px) scale(${view.zoom})`,
                            }}
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerCancel={handlePointerCancel}
                        >
                            <img
                                className={styles.image}
                                src={image.url}
                                alt={image.name}
                                draggable={false}
                            />
                            {marks.map((mark, index) => (
                                <span
                                    key={index}
                                    className={styles.mark}
                                    style={{
                                        left: `${mark.x * 100}%`,
                                        top: `${mark.y * 100}%`,
                                        width: DOT_SIZE / view.zoom,
                                        height: DOT_SIZE / view.zoom,
                                        borderWidth: 2 / view.zoom,
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.placeholder}>
                            {t('image-object-counter/counter/empty')}
                        </div>
                    )}
                    {image && marks.length === 0 && (
                        <div className={styles.hint}>{t('image-object-counter/counter/hint')}</div>
                    )}
                </div>
                <small className="text-muted d-block mt-2">
                    {t('image-object-counter/counter/view_hint')}
                </small>
            </div>
            <div className="card-footer bg-transparent d-flex flex-wrap align-items-center gap-2">
                <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={undo}
                    disabled={marks.length === 0}
                >
                    <i className="bi bi-arrow-counterclockwise me-1" />
                    {t('image-object-counter/toolbar/undo')}
                </button>
                <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={clearAll}
                    disabled={marks.length === 0}
                >
                    <i className="bi bi-trash me-1" />
                    {t('image-object-counter/toolbar/clear')}
                </button>
                <div className="ms-auto d-flex align-items-center gap-1">
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => zoomAt(1 / ZOOM_STEP)}
                        disabled={!image || view.zoom <= MIN_ZOOM}
                        aria-label={t('image-object-counter/toolbar/zoom_out')}
                        title={t('image-object-counter/toolbar/zoom_out')}
                    >
                        <i className="bi bi-dash-lg" />
                    </button>
                    <span className={styles.zoomValue}>{Math.round(view.zoom * 100)}%</span>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => zoomAt(ZOOM_STEP)}
                        disabled={!image || view.zoom >= MAX_ZOOM}
                        aria-label={t('image-object-counter/toolbar/zoom_in')}
                        title={t('image-object-counter/toolbar/zoom_in')}
                    >
                        <i className="bi bi-plus-lg" />
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={resetView}
                        disabled={!image}
                        aria-label={t('image-object-counter/toolbar/reset_view')}
                        title={t('image-object-counter/toolbar/reset_view')}
                    >
                        <i className="bi bi-arrows-fullscreen" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ObjectCounter;
