import { useEffect, useRef } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { renderPage, totalRotation } from '../services/pdfjs';

interface Props {
    doc: PDFDocumentProxy;
    /** Zero-based page index. */
    pageIndex: number;
    /** Extra clockwise rotation on top of the page's own rotation. */
    rotation: number;
    maxWidth: number;
    maxHeight: number;
    className?: string;
}

/**
 * Renders one PDF page into a canvas. Re-renders when the page or rotation
 * changes, and cancels the previous render task to avoid flicker/races.
 */
const PdfCanvas = ({ doc, pageIndex, rotation, maxWidth, maxHeight, className }: Props) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        let cancelled = false;
        let cancelRender: (() => void) | null = null;
        const canvas = canvasRef.current;
        if (!canvas) return;

        (async () => {
            try {
                const page = await doc.getPage(pageIndex + 1);
                if (cancelled) return;
                const handle = renderPage(page, canvas, {
                    rotation: totalRotation(page, rotation),
                    maxWidth,
                    maxHeight,
                });
                cancelRender = handle.cancel;
                await handle.promise;
            } catch (error: any) {
                // Rendering is cancelled on re-render/unmount; that is expected.
                if (!cancelled && error?.name !== 'RenderingCancelledException') {
                    console.error('[pdf-page-splitter] render failed', error);
                }
            }
        })();

        return () => {
            cancelled = true;
            try {
                cancelRender?.();
            } catch {
                // ignore
            }
        };
    }, [doc, pageIndex, rotation, maxWidth, maxHeight]);

    return <canvas ref={canvasRef} className={className} role="img" />;
};

export default PdfCanvas;
