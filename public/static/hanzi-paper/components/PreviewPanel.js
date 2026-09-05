import { html } from 'htm/preact';
import { css } from 'goober';
import { useRef, useEffect, useState, useCallback } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import HanziPaperRenderer from '@/services/HanziPaperRenderer.js';
import CanvasPrinter from '~/services/CanvasPrinter.js';

const previewStyle = css`
    .preview-container {
        text-align: center;
    }

    .preview-image {
        display: block;
        margin: 0 auto;
        border: 1px solid #dee2e6;
        background: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
`;

const PreviewPanel = ({ style, lineColor, cellSize, paddingVertical, paddingHorizontal, orientation, onPrintReady }) => {
    const canvasRef = useRef(null);
    const timerRef = useRef(null);
    const [imgUrl, setImgUrl] = useState(null);

    const updatePreview = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const renderer = new HanziPaperRenderer(canvas, {
            style,
            lineColor,
            cellSize,
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
    }, [style, lineColor, cellSize, paddingVertical, paddingHorizontal, orientation]);

    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(updatePreview, 80);
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [style, lineColor, cellSize, paddingVertical, paddingHorizontal, orientation]);

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
        link.download = 'hanzi-paper.png';
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
    };

    useEffect(() => {
        if (onPrintReady) {
            onPrintReady({ handlePrint, handleDownload });
        }
    }, [onPrintReady, style, lineColor, cellSize, paddingVertical, paddingHorizontal, orientation]);

    return html`
        <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
                <ul class="nav nav-tabs card-header-tabs">
                    <li class="nav-item">
                        <a class="nav-link active" href="#">
                            <i class="bi bi-file-text me-1"></i>${getText('hanzi-paper/preview/title')}
                        </a>
                    </li>
                </ul>
                <div class="actions">
                    <button class="btn btn-outline-secondary btn-sm me-2" onClick=${handleDownload}>
                        <i class="bi bi-download me-1"></i>${getText('common/download')}
                    </button>
                    <button class="btn btn-outline-primary btn-sm" onClick=${handlePrint}>
                        <i class="bi bi-printer me-1"></i>${getText('common/print')}
                    </button>
                </div>
            </div>
            <div class="card-body">
                <div class=${previewStyle}>
                    <div class="preview-container">
                        <canvas ref=${canvasRef} style="display:none"></canvas>
                        ${imgUrl && html`
                            <img
                                src=${imgUrl}
                                alt="Hanzi paper preview"
                                class="preview-image"
                                style=${{
                                    width: orientation === 'landscape' ? '842px' : '595px',
                                    maxWidth: '100%',
                                    height: 'auto',
                                    aspectRatio: orientation === 'landscape' ? '842 / 595' : '595 / 842',
                                }}
                            />
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;
};

export default PreviewPanel;
