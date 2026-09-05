import { html } from 'htm/preact';
import { useState, useRef, useEffect, useCallback } from 'preact/hooks';

const MIN_SIZE = 16;

const HANDLES = [
    { name: 'nw', x: 0, y: 0, cursor: 'nwse-resize' },
    { name: 'n', x: 50, y: 0, cursor: 'ns-resize' },
    { name: 'ne', x: 100, y: 0, cursor: 'nesw-resize' },
    { name: 'e', x: 100, y: 50, cursor: 'ew-resize' },
    { name: 'se', x: 100, y: 100, cursor: 'nwse-resize' },
    { name: 's', x: 50, y: 100, cursor: 'ns-resize' },
    { name: 'sw', x: 0, y: 100, cursor: 'nesw-resize' },
    { name: 'w', x: 0, y: 50, cursor: 'ew-resize' },
];

const EDGE_FLAGS = {
    nw: { left: true, top: true },
    n: { top: true },
    ne: { right: true, top: true },
    e: { right: true },
    se: { right: true, bottom: true },
    s: { bottom: true },
    sw: { left: true, bottom: true },
    w: { left: true },
};

const clampPos = (crop, vw, vh) => ({
    ...crop,
    x: Math.max(0, Math.min(crop.x, vw - crop.width)),
    y: Math.max(0, Math.min(crop.y, vh - crop.height)),
});

const createCrop = (start, current, ratio, vw, vh) => {
    const dirX = current.x >= start.x ? 1 : -1;
    const dirY = current.y >= start.y ? 1 : -1;
    const maxW = dirX >= 0 ? vw - start.x : start.x;
    const maxH = dirY >= 0 ? vh - start.y : start.y;
    let w = Math.abs(current.x - start.x);
    let h = Math.abs(current.y - start.y);
    if (ratio) {
        if (w / ratio >= h) { h = w / ratio; } else { w = h * ratio; }
        const allowedW = Math.min(maxW, maxH * ratio);
        w = Math.min(w, allowedW);
        h = w / ratio;
    } else {
        w = Math.min(w, maxW);
        h = Math.min(h, maxH);
    }
    w = Math.max(MIN_SIZE, w);
    h = Math.max(MIN_SIZE, ratio ? w / ratio : h);
    const x = dirX >= 0 ? start.x : start.x - w;
    const y = dirY >= 0 ? start.y : start.y - h;
    return { x, y, width: w, height: h };
};

const moveCrop = (startCrop, startPt, currentPt, vw, vh) => {
    const dx = currentPt.x - startPt.x;
    const dy = currentPt.y - startPt.y;
    return clampPos({
        x: startCrop.x + dx,
        y: startCrop.y + dy,
        width: startCrop.width,
        height: startCrop.height,
    }, vw, vh);
};

const resizeCrop = (startCrop, pt, handle, ratio, vw, vh) => {
    const { x, y, width, height } = startCrop;
    const right = x + width;
    const bottom = y + height;
    const flags = EDGE_FLAGS[handle];

    if (ratio) {
        const isHoriz = flags.left || flags.right;
        const isVert = flags.top || flags.bottom;
        const ax = flags.left ? right : x;
        const ay = flags.top ? bottom : y;
        const dx = Math.abs(pt.x - ax);
        const dy = Math.abs(pt.y - ay);
        let w, h;
        if (isHoriz && isVert) {
            if (dx / ratio >= dy) { w = dx; h = w / ratio; } else { h = dy; w = h * ratio; }
        } else if (isHoriz) {
            w = dx; h = w / ratio;
        } else {
            h = dy; w = h * ratio;
        }

        let maxW, maxH;
        if (isHoriz && isVert) {
            maxW = flags.left ? ax : vw - ax;
            maxH = flags.top ? ay : vh - ay;
        } else if (isHoriz) {
            maxW = flags.left ? ax : vw - ax;
            maxH = vh;
        } else {
            maxW = vw;
            maxH = flags.top ? ay : vh - ay;
        }
        const allowedW = Math.min(maxW, maxH * ratio);
        w = Math.max(MIN_SIZE, Math.min(w, allowedW));
        h = w / ratio;

        let nx, ny;
        if (isHoriz && isVert) {
            nx = flags.left ? ax - w : ax;
            ny = flags.top ? ay - h : ay;
        } else if (isHoriz) {
            nx = flags.left ? ax - w : ax;
            const cy = y + height / 2;
            ny = Math.max(0, Math.min(cy - h / 2, vh - h));
        } else {
            ny = flags.top ? ay - h : ay;
            const cx = x + width / 2;
            nx = Math.max(0, Math.min(cx - w / 2, vw - w));
        }
        return { x: nx, y: ny, width: w, height: h };
    }

    let newX = x, newY = y, newRight = right, newBottom = bottom;
    if (flags.left) newX = pt.x;
    if (flags.right) newRight = pt.x;
    if (flags.top) newY = pt.y;
    if (flags.bottom) newBottom = pt.y;

    let newW = newRight - newX;
    let newH = newBottom - newY;
    if (newW < 0) { newX = newRight; newW = -newW; }
    if (newH < 0) { newY = newBottom; newH = -newH; }
    newW = Math.max(MIN_SIZE, newW);
    newH = Math.max(MIN_SIZE, newH);
    return clampPos({ x: newX, y: newY, width: newW, height: newH }, vw, vh);
};

const CropOverlay = ({ videoRef, videoWidth, videoHeight, crop, aspect, onCropChange, disabled }) => {
    const dragRef = useRef(null);
    const [content, setContent] = useState(null);

    const measure = useCallback(() => {
        const video = videoRef.current;
        if (!video || !videoWidth || !videoHeight) return;
        const parent = video.parentElement;
        if (!parent) return;
        const vRect = video.getBoundingClientRect();
        const pRect = parent.getBoundingClientRect();
        const scale = Math.min(vRect.width / videoWidth, vRect.height / videoHeight);
        const cw = videoWidth * scale;
        const ch = videoHeight * scale;
        const offsetLeft = (vRect.width - cw) / 2;
        const offsetTop = (vRect.height - ch) / 2;
        setContent({
            left: vRect.left - pRect.left + offsetLeft,
            top: vRect.top - pRect.top + offsetTop,
            width: cw,
            height: ch,
            scale,
            offsetLeft,
            offsetTop,
        });
    }, [videoRef, videoWidth, videoHeight]);

    useEffect(() => {
        measure();
    }, [measure]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        const ro = new ResizeObserver(() => measure());
        ro.observe(video);
        window.addEventListener('resize', measure);
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [videoRef, measure]);

    const toVideoCoords = (clientX, clientY) => {
        if (!content) return null;
        const video = videoRef.current;
        if (!video) return null;
        const vRect = video.getBoundingClientRect();
        const screenLeft = vRect.left + content.offsetLeft;
        const screenTop = vRect.top + content.offsetTop;
        const x = (clientX - screenLeft) / content.scale;
        const y = (clientY - screenTop) / content.scale;
        return {
            x: Math.max(0, Math.min(videoWidth, x)),
            y: Math.max(0, Math.min(videoHeight, y)),
        };
    };

    useEffect(() => {
        const onMove = (e) => {
            const drag = dragRef.current;
            if (!drag) return;
            e.preventDefault();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const pt = toVideoCoords(clientX, clientY);
            if (!pt) return;

            let next;
            if (drag.mode === 'create') {
                next = createCrop(drag.startPt, pt, aspect, videoWidth, videoHeight);
            } else if (drag.mode === 'move') {
                next = moveCrop(drag.startCrop, drag.startPt, pt, videoWidth, videoHeight);
            } else {
                next = resizeCrop(drag.startCrop, pt, drag.handle, aspect, videoWidth, videoHeight);
            }
            onCropChange(next);
        };

        const onUp = () => {
            dragRef.current = null;
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('touchmove', onMove);
            window.removeEventListener('touchend', onUp);
        };
    }, [content, aspect, videoWidth, videoHeight, onCropChange]);

    const startDrag = (e, mode, handle) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const pt = toVideoCoords(clientX, clientY);
        if (!pt) return;
        dragRef.current = {
            mode,
            handle,
            startPt: pt,
            startCrop: { ...crop },
        };
    };

    if (!content || !crop) return null;

    const selLeft = (crop.x / videoWidth) * content.width;
    const selTop = (crop.y / videoHeight) * content.height;
    const selWidth = (crop.width / videoWidth) * content.width;
    const selHeight = (crop.height / videoHeight) * content.height;
    const selRight = selLeft + selWidth;
    const selBottom = selTop + selHeight;

    const dimStyle = {
        position: 'absolute',
        background: 'rgba(0, 0, 0, 0.55)',
        pointerEvents: 'none',
    };

    return html`
        <div
            class="crop-overlay"
            style=${{
                position: 'absolute',
                left: `${content.left}px`,
                top: `${content.top}px`,
                width: `${content.width}px`,
                height: `${content.height}px`,
                cursor: disabled ? 'default' : 'crosshair',
                touchAction: 'none',
            }}
            onMouseDown=${(e) => startDrag(e, 'create')}
            onTouchStart=${(e) => startDrag(e, 'create')}
        >
            <div style=${{ ...dimStyle, left: 0, top: 0, width: '100%', height: `${selTop}px` }}></div>
            <div style=${{ ...dimStyle, left: 0, top: `${selBottom}px`, width: '100%', height: `${content.height - selBottom}px` }}></div>
            <div style=${{ ...dimStyle, left: 0, top: `${selTop}px`, width: `${selLeft}px`, height: `${selHeight}px` }}></div>
            <div style=${{ ...dimStyle, left: `${selRight}px`, top: `${selTop}px`, width: `${content.width - selRight}px`, height: `${selHeight}px` }}></div>
            <div
                class="crop-selection"
                style=${{
                    position: 'absolute',
                    left: `${selLeft}px`,
                    top: `${selTop}px`,
                    width: `${selWidth}px`,
                    height: `${selHeight}px`,
                    cursor: disabled ? 'default' : 'move',
                }}
                onMouseDown=${(e) => startDrag(e, 'move')}
                onTouchStart=${(e) => startDrag(e, 'move')}
            >
                <div class="crop-rule-thirds"></div>
                ${HANDLES.map((h) => html`
                    <div
                        key=${h.name}
                        class="crop-handle"
                        style=${{
                            position: 'absolute',
                            left: `calc(${h.x}% - 6px)`,
                            top: `calc(${h.y}% - 6px)`,
                            width: '12px',
                            height: '12px',
                            cursor: disabled ? 'default' : h.cursor,
                        }}
                        onMouseDown=${(e) => startDrag(e, 'resize', h.name)}
                        onTouchStart=${(e) => startDrag(e, 'resize', h.name)}
                    ></div>
                `)}
            </div>
        </div>
    `;
};

export default CropOverlay;
