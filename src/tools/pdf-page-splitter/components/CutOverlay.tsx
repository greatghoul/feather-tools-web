import { useState } from 'react';
import { t } from '~/helpers/i18n';
import type { SplitMode } from '../services/types';
import styles from './CutOverlay.module.css';

interface Props {
    mode: Exclude<SplitMode, 'none'>;
    position: number;
    onChange: (position: number) => void;
}

const clamp = (value: number) => Math.min(0.95, Math.max(0.05, value));

/**
 * Draggable cut line drawn on top of the page preview. Positions are fractions
 * of the displayed page, so they stay correct after rotating the page.
 */
const CutOverlay = ({ mode, position, onChange }: Props) => {
    const [dragging, setDragging] = useState(false);

    const updateFromPointer = (event: React.PointerEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const fraction =
            mode === 'horizontal'
                ? (event.clientY - rect.top) / rect.height
                : (event.clientX - rect.left) / rect.width;
        onChange(clamp(fraction));
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
        updateFromPointer(event);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (dragging) updateFromPointer(event);
    };

    const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
        setDragging(false);
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    };

    const percent = `${position * 100}%`;

    return (
        <div
            className={`${styles.overlay} ${dragging ? styles.dragging : ''}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            data-mode={mode}
        >
            {mode === 'horizontal' ? (
                <>
                    <div className={`${styles.half} ${styles.alignCenter}`} style={{ top: 0, height: percent }}>
                        <span className={styles.label}>{t('pdf-page-splitter/editor/top')}</span>
                    </div>
                    <div className={`${styles.half} ${styles.alignCenter}`} style={{ top: percent, bottom: 0 }}>
                        <span className={styles.label}>{t('pdf-page-splitter/editor/bottom')}</span>
                    </div>
                    <div className={styles.lineHorizontal} style={{ top: percent }}>
                        <span className={styles.handle}>
                            <i className="bi bi-arrows-expand-vertical" aria-hidden="true" />
                        </span>
                    </div>
                </>
            ) : (
                <>
                    <div className={`${styles.half} ${styles.alignMiddle}`} style={{ left: 0, width: percent }}>
                        <span className={styles.label}>{t('pdf-page-splitter/editor/left')}</span>
                    </div>
                    <div className={`${styles.half} ${styles.alignMiddle}`} style={{ left: percent, right: 0 }}>
                        <span className={styles.label}>{t('pdf-page-splitter/editor/right')}</span>
                    </div>
                    <div className={styles.lineVertical} style={{ left: percent }}>
                        <span className={styles.handle}>
                            <i className="bi bi-arrows-expand" aria-hidden="true" />
                        </span>
                    </div>
                </>
            )}
        </div>
    );
};

export default CutOverlay;
