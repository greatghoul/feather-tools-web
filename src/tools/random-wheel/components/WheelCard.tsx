import { useCallback, useEffect, useRef, useState } from 'react';
import { t } from '~/helpers/i18n';
import styles from './WheelCard.module.css';

const FONT_STACK = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';
const PALETTE = [
    '#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d',
    '#43aa8b', '#4d908e', '#577590', '#277da1', '#9b5de5',
    '#f15bb5', '#00bbf9',
];
const TWO_PI = Math.PI * 2;
// Remove-winner animation: flash the drawn slice, then collapse it while the
// neighbors glide into their new spans (2s in total).
const REMOVAL_FLASH_MS = 700;
const REMOVAL_SHRINK_MS = 1300;

const mod2pi = (a: number) => ((a % TWO_PI) + TWO_PI) % TWO_PI;

const sliceColor = (i: number, n: number) => {
    // When the palette wraps around exactly on the last slice it would touch
    // the first slice with the same color, so swap in a clearly different one.
    if (i === n - 1 && n > 1 && i % PALETTE.length === 0) return PALETTE[4];
    return PALETTE[i % PALETTE.length];
};

const isLightColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.6;
};

const lerpColor = (a: string, b: string, t: number) => {
    const ca = [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)];
    const cb = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)];
    const mixed = ca.map((v, i) => Math.round(v + (cb[i] - v) * t));
    return `rgb(${mixed[0]}, ${mixed[1]}, ${mixed[2]})`;
};

interface PaintSlice {
    label: string;
    color: string;
    textColor: string;
    start: number;
    end: number;
    /** Gold overlay alpha — highlights and the removal flash. */
    overlay: number;
    /** Gold edge stroke for the landed-winner highlight. */
    stroke: boolean;
    labelAlpha: number;
}

function drawRadialLabel(
    ctx: CanvasRenderingContext2D,
    R: number,
    maxW: number,
    baseSize: number,
    mid: number,
    label: string,
    textColor: string,
    alpha: number,
) {
    if (alpha <= 0.02) return;
    let fontSize = baseSize;
    let text = label;
    ctx.font = `600 ${fontSize}px ${FONT_STACK}`;
    while (fontSize > 9 && ctx.measureText(text).width > maxW) {
        fontSize -= 1;
        ctx.font = `600 ${fontSize}px ${FONT_STACK}`;
    }
    if (ctx.measureText(text).width > maxW) {
        while (text.length > 1 && ctx.measureText(`${text}…`).width > maxW) {
            text = text.slice(0, -1);
        }
        text = `${text}…`;
    }
    // Slices on the left half get flipped so labels never read upside down.
    const flip = Math.cos(mid) < 0;
    ctx.save();
    ctx.rotate(mid + (flip ? Math.PI : 0));
    ctx.textAlign = flip ? 'left' : 'right';
    ctx.fillStyle = textColor;
    ctx.globalAlpha = alpha;
    ctx.fillText(text, flip ? -(R - 10) : R - 10, 0);
    ctx.restore();
}

// Paints the wheel in center-relative coordinates (the caller sets up the
// DPR scale and the center translation). Used both for the static offscreen
// render and for the per-frame removal transition.
function paintWheel(ctx: CanvasRenderingContext2D, size: number, slices: PaintSlice[]) {
    const R = size / 2 - 6;
    const n = slices.length;
    ctx.beginPath();
    ctx.arc(0, 0, R + 4, 0, TWO_PI);
    ctx.fillStyle = n > 0 ? '#495057' : '#e9ecef';
    ctx.fill();

    if (n > 0) {
        const baseSize = n <= 8 ? 16 : n <= 14 ? 14 : n <= 22 ? 12 : 10;
        // Radial room between the rim and the center hub button.
        const maxW = R - 10 - Math.max(size * 0.16, 52);
        ctx.textBaseline = 'middle';
        for (const s of slices) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, R, s.start, s.end);
            ctx.closePath();
            ctx.fillStyle = s.color;
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.stroke();
            if (s.overlay > 0) {
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, R, s.start, s.end);
                ctx.closePath();
                ctx.fillStyle = `rgba(255, 193, 7, ${s.overlay})`;
                ctx.fill();
            }
            if (s.stroke) {
                ctx.lineWidth = 3;
                ctx.strokeStyle = '#ffc107';
                ctx.stroke();
            }
            if (n <= 36) {
                drawRadialLabel(ctx, R, maxW, baseSize, (s.start + s.end) / 2, s.label, s.textColor, s.labelAlpha);
            }
        }
    }

    ctx.beginPath();
    ctx.arc(0, 0, R, 0, TWO_PI);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#495057';
    ctx.stroke();
}

// Renders the full wheel (slices + labels + highlight) into an offscreen
// canvas; the live canvas only rotates and blits it each animation frame.
function buildWheelCanvas(size: number, dpr: number, items: string[], highlight: number | null): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = Math.max(1, Math.round(size * dpr));
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    ctx.translate(size / 2, size / 2);
    const n = items.length;
    const seg = TWO_PI / Math.max(n, 1);
    const slices: PaintSlice[] = items.map((label, i) => {
        const color = sliceColor(i, n);
        return {
            label,
            color,
            textColor: isLightColor(color) ? '#212529' : '#ffffff',
            start: -Math.PI / 2 + i * seg,
            end: -Math.PI / 2 + (i + 1) * seg,
            overlay: highlight === i ? 0.45 : 0,
            stroke: highlight === i,
            labelAlpha: 1,
        };
    });
    paintWheel(ctx, size, slices);
    return canvas;
}

interface WheelCardProps {
    items: string[];
    spinning: boolean;
    removeWinner: boolean;
    onSpinChange: (spinning: boolean) => void;
    onResult: (item: string) => void;
    onRemoveItem: (item: string) => void;
}

const WheelCard = ({ items, spinning, removeWinner, onSpinChange, onResult, onRemoveItem }: WheelCardProps) => {
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const offRef = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef(0);
    const rotationRef = useRef(0);
    const spinningRef = useRef(false);
    const removingRef = useRef(false);
    const sizeRef = useRef(0);
    const dprRef = useRef(1);
    const [size, setSize] = useState(0);
    const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
    const [result, setResult] = useState<string | null>(null);
    const [removing, setRemoving] = useState(false);

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        const off = offRef.current;
        const size = sizeRef.current;
        if (!canvas || !off || !size) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        // drawImage works in device pixels here, so fold the DPR scale and the
        // center translation into one transform before rotating.
        const dpr = dprRef.current;
        ctx.setTransform(dpr, 0, 0, dpr, (size / 2) * dpr, (size / 2) * dpr);
        ctx.rotate(rotationRef.current);
        ctx.drawImage(off, -size / 2, -size / 2, size, size);
    }, []);

    // One frame of the remove-winner transition, painted in screen coordinates
    // so the pointer (at -π/2) never moves and the wheel face stays put. The
    // drawn slice flashes in place (k=0), then both its edges converge onto
    // the pointer line while every survivor grows from seg to its new width,
    // ending in exactly the layout the rebuilt (n-1)-slice wheel will render —
    // the handoff to the offscreen is invisible.
    const drawRemovalFrame = useCallback((w: number, f: number, k: number, flashT: number) => {
        const canvas = canvasRef.current;
        const size = sizeRef.current;
        if (!canvas || !size) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const dpr = dprRef.current;
        const n = items.length;
        const seg = TWO_PI / n;
        const seg2 = TWO_PI / (n - 1);
        const P = -Math.PI / 2;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(dpr, 0, 0, dpr, (size / 2) * dpr, (size / 2) * dpr);
        const width = seg + (seg2 - seg) * k;
        // Winner edges collapse onto the pointer line; f is how far the
        // winner's start edge sits behind the pointer (jitter from the spin).
        const startW = P - f * (1 - k);
        const endW = P + (seg - f) * (1 - k);
        const seam = startW - w * width;
        const flash = k === 0 ? (Math.floor(flashT * 4) % 2 === 0 ? 0.55 : 0.1) : 0;
        const winnerColor = sliceColor(w, n);
        const slices: PaintSlice[] = [];
        for (let i = 0; i < n; i++) {
            if (i === w) {
                if (k < 1) {
                    slices.push({
                        label: items[i],
                        color: winnerColor,
                        textColor: isLightColor(winnerColor) ? '#212529' : '#ffffff',
                        start: startW,
                        end: endW,
                        overlay: flash,
                        stroke: false,
                        labelAlpha: 1 - k,
                    });
                }
                continue;
            }
            const newIdx = i < w ? i : i - 1;
            let start: number;
            if (i < w) {
                start = seam + i * width;
            } else {
                start = endW + (i - w - 1) * width;
            }
            const from = sliceColor(i, n);
            const to = sliceColor(newIdx, n - 1);
            slices.push({
                label: items[i],
                color: lerpColor(from, to, k),
                textColor: isLightColor(from) ? '#212529' : '#ffffff',
                start,
                end: start + width,
                overlay: 0,
                stroke: false,
                labelAlpha: 1,
            });
        }
        paintWheel(ctx, size, slices);
    }, [items]);

    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const update = () => {
            const w = Math.min(Math.floor(el.clientWidth), 420);
            if (w > 0 && w !== sizeRef.current) {
                sizeRef.current = w;
                setSize(w);
            }
        };
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

    // Keep a stale winner highlight from flashing onto a different slice when
    // the option list changes (e.g. "remove the winner" shrinks the list).
    const highlight = winnerIndex !== null && items[winnerIndex] === result ? winnerIndex : null;

    useEffect(() => {
        setWinnerIndex(null);
    }, [items]);

    useEffect(() => {
        // The removal animation paints the live canvas itself; rebuilding the
        // offscreen here (triggered by the highlight state change right at
        // spin end) would cost a frame exactly where the wheel comes to rest.
        if (removingRef.current) return;
        const canvas = canvasRef.current;
        if (!canvas || !size) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 3);
        dprRef.current = dpr;
        canvas.width = canvas.height = Math.round(size * dpr);
        offRef.current = buildWheelCanvas(size, dpr, items, highlight);
        render();
    }, [size, items, highlight, render]);

    const handleSpin = () => {
        if (spinningRef.current || items.length === 0) return;
        // The prop-based lock only updates after a re-render, and a stale
        // animation loop (e.g. resumed after the tab was frozen) could keep
        // driving the wheel underneath a new spin — cancel any leftover frame
        // and guard with a synchronous ref so two loops can never interleave.
        cancelAnimationFrame(rafRef.current);
        spinningRef.current = true;
        setResult(null);
        onSpinChange(true);
        const seg = TWO_PI / items.length;
        const winner = Math.floor(Math.random() * items.length);
        // Land inside the winning slice with a random offset so repeated draws
        // do not always stop dead center.
        const desired = mod2pi(-(winner * seg + seg / 2) + (Math.random() - 0.5) * seg * 0.8);
        const current = mod2pi(rotationRef.current);
        const startRot = rotationRef.current;
        const delta = desired - current + TWO_PI * (5 + Math.random() * 3);
        const duration = 4200 + Math.random() * 1000;
        const startTime = performance.now();
        // easeOutCubic keeps the final half second at a visible crawl — a
        // quartic tail drops below a pixel per frame and reads as stutter
        // right before the stop.
        const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

        const startRemoval = (w: number) => {
            const seg = TWO_PI / items.length;
            // Offset of the winner's start edge behind the pointer at spin end.
            const f = mod2pi(-rotationRef.current) - w * seg;
            const removalStart = performance.now();
            const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
            const frame = (now: number) => {
                const elapsed = now - removalStart;
                if (elapsed < REMOVAL_FLASH_MS) {
                    drawRemovalFrame(w, f, 0, elapsed / REMOVAL_FLASH_MS);
                    rafRef.current = requestAnimationFrame(frame);
                } else if (elapsed < REMOVAL_FLASH_MS + REMOVAL_SHRINK_MS) {
                    drawRemovalFrame(w, f, easeOutCubic((elapsed - REMOVAL_FLASH_MS) / REMOVAL_SHRINK_MS), 1);
                    rafRef.current = requestAnimationFrame(frame);
                } else {
                    // Paint the exact final layout (low-framerate steps can
                    // skip past k=1), then rotate to where the rebuilt
                    // (n-1)-slice wheel places the seam — identical frames,
                    // so the handoff to the offscreen is invisible.
                    drawRemovalFrame(w, f, 1, 1);
                    rotationRef.current = mod2pi(-w * (TWO_PI / (items.length - 1)));
                    spinningRef.current = false;
                    removingRef.current = false;
                    setRemoving(false);
                    onSpinChange(false);
                    onRemoveItem(items[w]);
                }
            };
            rafRef.current = requestAnimationFrame(frame);
        };

        const frame = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            rotationRef.current = startRot + delta * easeOutCubic(progress);
            render();
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(frame);
            } else {
                rotationRef.current = startRot + delta;
                render();
                // Announce the slice actually under the pointer instead of the
                // pre-picked one, so the result can never disagree with the
                // picture even if an old animation frame slipped in.
                const landed = Math.floor(mod2pi(-rotationRef.current) / seg) % items.length;
                setWinnerIndex(landed);
                setResult(items[landed]);
                onResult(items[landed]);
                if (removeWinner && items.length > 1) {
                    removingRef.current = true;
                    setRemoving(true);
                    startRemoval(landed);
                } else {
                    if (removeWinner) onRemoveItem(items[landed]);
                    spinningRef.current = false;
                    onSpinChange(false);
                }
            }
        };
        rafRef.current = requestAnimationFrame(frame);
    };

    return (
        <div className="card">
            <div className="card-header bg-light">{t('random-wheel/wheel/title')}</div>
            <div className="card-body d-flex flex-column align-items-center">
                <div className={styles.wheelWrap} ref={wrapRef}>
                    <canvas ref={canvasRef} />
                    <span className={styles.pointer} />
                    <button
                        className={styles.spinBtn}
                        onClick={handleSpin}
                        disabled={spinning || items.length === 0}
                    >
                        {t('random-wheel/button/spin')}
                    </button>
                </div>
                <div className="mt-3 text-center" aria-live="polite">
                    {spinning && !removing ? (
                        <span className="text-muted">{t('random-wheel/result/spinning')}</span>
                    ) : result ? (
                        <div className="fs-5 fw-bold text-success">
                            🎉 {t('random-wheel/result/winner')}: {result}
                        </div>
                    ) : items.length === 0 ? (
                        <span className="text-danger small">{t('random-wheel/result/empty')}</span>
                    ) : (
                        <span className="text-muted small">{t('random-wheel/result/idle')}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WheelCard;
