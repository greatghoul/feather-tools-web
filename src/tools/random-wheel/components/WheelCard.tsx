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

// Renders the full wheel (slices + labels + highlight) into an offscreen
// canvas; the live canvas only rotates and blits it each animation frame.
function buildWheelCanvas(size: number, dpr: number, items: string[], highlight: number | null): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = Math.max(1, Math.round(size * dpr));
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    const c = size / 2;
    const R = size / 2 - 6;
    const n = items.length;
    const seg = TWO_PI / n;

    if (n === 0) {
        ctx.beginPath();
        ctx.arc(c, c, R + 4, 0, TWO_PI);
        ctx.fillStyle = '#e9ecef';
        ctx.fill();
    } else {
        ctx.beginPath();
        ctx.arc(c, c, R + 4, 0, TWO_PI);
        ctx.fillStyle = '#495057';
        ctx.fill();
    }

    for (let i = 0; i < n; i++) {
        const start = -Math.PI / 2 + i * seg;
        ctx.beginPath();
        ctx.moveTo(c, c);
        ctx.arc(c, c, R, start, start + seg);
        ctx.closePath();
        ctx.fillStyle = sliceColor(i, n);
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.stroke();
    }

    if (n <= 36) {
        const baseSize = n <= 8 ? 16 : n <= 14 ? 14 : n <= 22 ? 12 : 10;
        // Radial room between the rim and the center hub button.
        const maxW = R - 10 - Math.max(size * 0.16, 52);
        ctx.textBaseline = 'middle';
        for (let i = 0; i < n; i++) {
            const mid = -Math.PI / 2 + (i + 0.5) * seg;
            // Slices on the left half get flipped so labels never read upside down.
            const flip = Math.cos(mid) < 0;
            let fontSize = baseSize;
            let label = items[i];
            ctx.font = `600 ${fontSize}px ${FONT_STACK}`;
            while (fontSize > 9 && ctx.measureText(label).width > maxW) {
                fontSize -= 1;
                ctx.font = `600 ${fontSize}px ${FONT_STACK}`;
            }
            if (ctx.measureText(label).width > maxW) {
                while (label.length > 1 && ctx.measureText(`${label}…`).width > maxW) {
                    label = label.slice(0, -1);
                }
                label = `${label}…`;
            }
            ctx.save();
            ctx.translate(c, c);
            ctx.rotate(mid + (flip ? Math.PI : 0));
            ctx.textAlign = flip ? 'left' : 'right';
            ctx.fillStyle = isLightColor(sliceColor(i, n)) ? '#212529' : '#ffffff';
            ctx.fillText(label, flip ? -(R - 10) : R - 10, 0);
            ctx.restore();
        }
    }

    if (highlight !== null && highlight < n) {
        const start = -Math.PI / 2 + highlight * seg;
        ctx.beginPath();
        ctx.moveTo(c, c);
        ctx.arc(c, c, R, start, start + seg);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 193, 7, 0.45)';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ffc107';
        ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(c, c, R, 0, TWO_PI);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#495057';
    ctx.stroke();
    return canvas;
}

interface WheelCardProps {
    items: string[];
    spinning: boolean;
    onSpinChange: (spinning: boolean) => void;
    onResult: (item: string) => void;
}

const WheelCard = ({ items, spinning, onSpinChange, onResult }: WheelCardProps) => {
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const offRef = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef(0);
    const rotationRef = useRef(0);
    const sizeRef = useRef(0);
    const dprRef = useRef(1);
    const [size, setSize] = useState(0);
    const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
    const [result, setResult] = useState<string | null>(null);

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
        const canvas = canvasRef.current;
        if (!canvas || !size) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 3);
        dprRef.current = dpr;
        canvas.width = canvas.height = Math.round(size * dpr);
        offRef.current = buildWheelCanvas(size, dpr, items, highlight);
        render();
    }, [size, items, highlight, render]);

    const handleSpin = () => {
        if (spinning || items.length === 0) return;
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
        const easeOutQuart = (x: number) => 1 - Math.pow(1 - x, 4);

        const frame = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            rotationRef.current = startRot + delta * easeOutQuart(progress);
            render();
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(frame);
            } else {
                rotationRef.current = startRot + delta;
                render();
                setWinnerIndex(winner);
                setResult(items[winner]);
                onSpinChange(false);
                onResult(items[winner]);
            }
        };
        rafRef.current = requestAnimationFrame(frame);
    };

    return (
        <div className="card h-100">
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
                    {spinning ? (
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
