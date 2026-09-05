import { useRef, useEffect, useState, useCallback } from 'react';
import { t } from '~/helpers/i18n';
import LinePaperRenderer from '../services/LinePaperRenderer';
import CanvasPrinter from '~/services/CanvasPrinter';
import styles from './PreviewPanel.module.css';

const PreviewPanel = ({ lineColor, lineHeight, paddingVertical, paddingHorizontal, orientation, onPrintReady }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [imgUrl, setImgUrl] = useState<any>(null);

    const updatePreview = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const renderer = new LinePaperRenderer(canvas, {
            lineColor,
            lineHeight,
            paddingVertical,
            paddingHorizontal,
            orientation,
        });
        renderer.render();

        canvas.toBlob((blob) => {
            if (blob) {
                setImgUrl((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return URL.createObjectURL(blob);
                });
            }
        }, 'image/jpeg', 0.92);
    }, [lineColor, lineHeight, paddingVertical, paddingHorizontal, orientation]);

    // Debounce updates so rapid slider changes don't re-render on every tick
    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(updatePreview, 80);
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [lineColor, lineHeight, paddingVertical, paddingHorizontal, orientation]);

    // Clean up blob URL only on unmount
    useEffect(() => {
        return () => {
            if (imgUrl) URL.revokeObjectURL(imgUrl);
        };
    }, []);

    const handlePrint = () => {
        if (!canvasRef.current) return;
        const printer = new CanvasPrinter(canvasRef.current, {
            pageOrientation: orientation,
            renderScale: 3,
            dpi: 72,
        });
        printer.print();
    };

    const handleDownload = () => {
        if (!canvasRef.current) return;
        const link = document.createElement('a');
        link.download = 'line-paper.png';
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
    };

    useEffect(() => {
        if (onPrintReady) {
            onPrintReady({ handlePrint, handleDownload });
        }
    }, [onPrintReady, lineColor, lineHeight, paddingVertical, paddingHorizontal, orientation]);

    return (
<>

        <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
                <ul className="nav nav-tabs card-header-tabs">
                    <li className="nav-item">
                        <a className="nav-link active" href="#">
                            <i className="bi bi-file-text me-1"></i>{t('line-paper/preview/title')}
                        </a>
                    </li>
                </ul>
                <div className="actions">
                    <button className="btn btn-outline-secondary btn-sm me-2" onClick={handleDownload}>
                        <i className="bi bi-download me-1"></i>{t('common/download')}
                    </button>
                    <button className="btn btn-outline-primary btn-sm" onClick={handlePrint}>
                        <i className="bi bi-printer me-1"></i>{t('common/print')}
                    </button>
                </div>
            </div>
            <div className="card-body">
                <div className={styles.previewStyle}>
                    <div className="preview-container">
                        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                        {imgUrl && (
<>

                            <img src={imgUrl} alt="Line paper preview" className="preview-image" style={{
                                    width: orientation === 'landscape' ? '842px' : '595px',
                                    maxWidth: '100%',
                                    height: 'auto',
                                    aspectRatio: orientation === 'landscape' ? '842 / 595' : '595 / 842',
                                }} />
                        
</>
)}
                    </div>
                </div>
            </div>
        </div>
    
</>
);
};

export default PreviewPanel;
