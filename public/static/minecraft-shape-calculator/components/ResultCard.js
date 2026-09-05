import { html } from 'htm/preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';

// In Minecraft one group (stack) holds 64 blocks.
const BLOCKS_PER_GROUP = 64;

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 8;
const ZOOM_STEP = 1.25;

const ERROR_KEYS = {
    too_small: 'minecraft-shape-calculator/message/too_small',
    radius_too_large: 'minecraft-shape-calculator/message/radius_too_large',
    thickness_invalid: 'minecraft-shape-calculator/message/thickness_invalid'
};

const clamp = (value, limit) => Math.min(Math.max(value, -limit), limit);

const plainHeader = html`
    <div class="card-header bg-light">
        <ul class="nav nav-tabs card-header-tabs">
            <li class="nav-item">
                <a class="nav-link active" href="#">
                    <i class="bi bi-clipboard-data me-1"></i>${getText('minecraft-shape-calculator/result/title')}
                </a>
            </li>
        </ul>
    </div>
`;

const ResultCard = ({ result }) => {
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [hover, setHover] = useState(null);
    const containerRef = useRef(null);
    const dragRef = useRef(null);

    useEffect(() => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setHover(null);
    }, [result]);

    // Maximum pan offset (pixels) that keeps the scaled preview covering the
    // square container. Panning is only possible when zoomed in beyond 100%.
    const getPanLimit = (z) => {
        const size = containerRef.current ? containerRef.current.clientWidth : 0;
        return Math.max(0, ((z - 1) * size) / 2);
    };

    const handleZoomIn = () => {
        const next = Math.min(MAX_ZOOM, zoom * ZOOM_STEP);
        const limit = getPanLimit(next);
        setZoom(next);
        setPan((current) => ({
            x: clamp(current.x, limit),
            y: clamp(current.y, limit)
        }));
    };

    const handleZoomOut = () => {
        const next = Math.max(MIN_ZOOM, zoom / ZOOM_STEP);
        const limit = getPanLimit(next);
        setZoom(next);
        setPan((current) => ({
            x: clamp(current.x, limit),
            y: clamp(current.y, limit)
        }));
    };

    const handlePointerDown = (event) => {
        if (zoom <= 1) {
            return;
        }
        dragRef.current = {
            startX: event.clientX,
            startY: event.clientY,
            panX: pan.x,
            panY: pan.y
        };
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event) => {
        const drag = dragRef.current;
        if (drag && zoom > 1) {
            const limit = getPanLimit(zoom);
            setPan({
                x: clamp(drag.panX + event.clientX - drag.startX, limit),
                y: clamp(drag.panY + event.clientY - drag.startY, limit)
            });
            return;
        }
        const cell = getCellAt(event.clientX, event.clientY);
        if (cell) {
            setHover({ ...cell, clientX: event.clientX, clientY: event.clientY });
        } else {
            setHover(null);
        }
    };

    const handlePointerLeave = () => {
        setHover(null);
    };

    const handlePointerUp = () => {
        dragRef.current = null;
    };

    if (!result) {
        return html`
            <div class="card">
                ${plainHeader}
                <div class="card-body text-muted">
                    ${getText('minecraft-shape-calculator/result/empty')}
                </div>
            </div>
        `;
    }

    if (result.error) {
        return html`
            <div class="card">
                ${plainHeader}
                <div class="card-body">
                    <div class="alert alert-warning mb-0" role="alert">
                        <i class="bi bi-exclamation-triangle"></i>
                        ${getText(ERROR_KEYS[result.error] || 'minecraft-shape-calculator/message/too_small')}
                    </div>
                </div>
            </div>
        `;
    }

    const { grid, totalBlocks } = result;
    const groupCount = Math.ceil(totalBlocks / BLOCKS_PER_GROUP);
    const height = grid.length;
    const width = grid[0].length;

    // Maps a viewport point to the grid cell under the pointer, accounting for
    // the pan/zoom transform and the preserveAspectRatio letterboxing.
    const getCellAt = (clientX, clientY) => {
        const container = containerRef.current;
        if (!container) {
            return null;
        }
        const rect = container.getBoundingClientRect();
        if (rect.width === 0) {
            return null;
        }
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const px = rect.width / 2 + (clientX - centerX - pan.x) / zoom;
        const py = rect.height / 2 + (clientY - centerY - pan.y) / zoom;
        if (px < 0 || px > rect.width || py < 0 || py > rect.height) {
            return null;
        }
        const scale = Math.min(rect.width / width, rect.height / height);
        const offsetX = (rect.width - width * scale) / 2;
        const offsetY = (rect.height - height * scale) / 2;
        const col = Math.floor((px - offsetX) / scale);
        const row = Math.floor((py - offsetY) / scale);
        if (col < 0 || col >= width || row < 0 || row >= height) {
            return null;
        }
        return { col, row };
    };

    const cells = [];
    const markers = [];
    const centerRows = [Math.floor((height - 1) / 2), Math.ceil((height - 1) / 2)];
    const centerCols = [Math.floor((width - 1) / 2), Math.ceil((width - 1) / 2)];
    const markerSize = 0.5;
    const markerOffset = (1 - markerSize) / 2;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (grid[y][x]) {
                cells.push(html`<rect x=${x} y=${y} width="1" height="1"></rect>`);
            }
            if (centerRows.includes(y) || centerCols.includes(x)) {
                markers.push(html`<rect x=${x + markerOffset} y=${y + markerOffset} width=${markerSize} height=${markerSize}></rect>`);
            }
        }
    }

    return html`
        <div class="card">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <ul class="nav nav-tabs card-header-tabs">
                    <li class="nav-item">
                        <a class="nav-link active" href="#">
                            <i class="bi bi-clipboard-data me-1"></i>${getText('minecraft-shape-calculator/result/title')}
                        </a>
                    </li>
                </ul>
                <div class="d-flex align-items-center gap-1">
                    <button
                        type="button"
                        class="btn btn-sm btn-outline-secondary"
                        onClick=${handleZoomOut}
                        title=${getText('minecraft-shape-calculator/result/zoom_out')}
                        aria-label=${getText('minecraft-shape-calculator/result/zoom_out')}
                    >
                        <i class="bi bi-dash-lg"></i>
                    </button>
                    <span class="zoom-value small text-muted">${Math.round(zoom * 100)}%</span>
                    <button
                        type="button"
                        class="btn btn-sm btn-outline-secondary"
                        onClick=${handleZoomIn}
                        title=${getText('minecraft-shape-calculator/result/zoom_in')}
                        aria-label=${getText('minecraft-shape-calculator/result/zoom_in')}
                    >
                        <i class="bi bi-plus-lg"></i>
                    </button>
                </div>
            </div>
            <div class="card-body preview-body">
                <div
                    ref=${containerRef}
                    class="preview-svg-container${zoom > 1 ? ' is-zoomed' : ''}"
                    onPointerDown=${handlePointerDown}
                    onPointerMove=${handlePointerMove}
                    onPointerUp=${handlePointerUp}
                    onPointerCancel=${handlePointerUp}
                    onPointerLeave=${handlePointerLeave}
                >
                    <svg
                        class="shape-preview"
                        viewBox="0 0 ${width} ${height}"
                        preserveAspectRatio="xMidYMid meet"
                        xmlns="http://www.w3.org/2000/svg"
                        style="transform: translate(${pan.x}px, ${pan.y}px) scale(${zoom})"
                    >
                        <rect width=${width} height=${height} fill="#f8f9fa"></rect>
                        <g fill="#9ec5fe" shape-rendering="crispEdges">${cells}</g>
                        <path
                            d=${buildGridLinePath(width, height)}
                            fill="none"
                            stroke="#6c757d"
                            stroke-width="1"
                            vector-effect="non-scaling-stroke"
                            shape-rendering="crispEdges"
                        ></path>
                        <g fill="#adb5bd">${markers}</g>
                        ${hover ? html`<rect x=${hover.col} y=${hover.row} width="1" height="1" fill="rgba(255, 200, 0, 0.55)"></rect>` : html``}
                    </svg>
                </div>
                ${hover ? html`
                    <div class="cell-tooltip" style="left: ${hover.clientX + 14}px; top: ${hover.clientY + 14}px;">
                        (${hover.col + 1}, ${hover.row + 1})
                    </div>
                ` : html``}
            </div>
            <div class="card-footer bg-light d-flex justify-content-center gap-5 py-3">
                <div class="result-stat">
                    <span class="result-stat-label">${getText('minecraft-shape-calculator/result/total_blocks')}</span>
                    <span class="result-stat-value">${totalBlocks}</span>
                </div>
                <div class="result-stat">
                    <span class="result-stat-label">${getText('minecraft-shape-calculator/result/groups')}</span>
                    <span class="result-stat-value">${groupCount}</span>
                </div>
            </div>
        </div>
    `;
};

/**
 * Builds the path data for the grid lines of a width x height grid.
 *
 * @param {number} width
 * @param {number} height
 * @returns {string}
 */
function buildGridLinePath(width, height) {
    let d = '';
    for (let x = 0; x <= width; x++) {
        d += `M${x} 0V${height}`;
    }
    for (let y = 0; y <= height; y++) {
        d += `M0 ${y}H${width}`;
    }
    return d;
}

export default ResultCard;
