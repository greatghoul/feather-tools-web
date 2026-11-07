import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

// pdfjs-dist touches browser globals while loading, so it is imported lazily
// (the tool page is server-rendered first). The worker URL is a plain asset
// import and is therefore safe at module level.
let pdfjsPromise: Promise<typeof import('pdfjs-dist')> | null = null;

function loadPdfjs() {
    if (!pdfjsPromise) {
        pdfjsPromise = import('pdfjs-dist').then((pdfjs) => {
            pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
            return pdfjs;
        });
    }
    return pdfjsPromise;
}

export async function openPdf(bytes: Uint8Array): Promise<PDFDocumentProxy> {
    const pdfjs = await loadPdfjs();
    // pdf.js may transfer the buffer to its worker, so hand it a copy.
    const task = pdfjs.getDocument({
        data: bytes.slice(0),
        isEvalSupported: false,
    });
    return task.promise;
}

/** Absolute rotation (page's own rotation + user rotation). */
export function totalRotation(page: PDFPageProxy, extraRotation: number): number {
    return (((page.rotate + extraRotation) % 360) + 360) % 360;
}

export interface RenderTarget {
    width: number;
    height: number;
}

export interface RenderHandle {
    promise: Promise<RenderTarget>;
    cancel: () => void;
}

/**
 * Starts rendering a page into a canvas, fitting it inside maxWidth × maxHeight
 * CSS pixels and scaling for the device pixel ratio so the result stays sharp.
 */
export function renderPage(
    page: PDFPageProxy,
    canvas: HTMLCanvasElement,
    options: {
        rotation: number;
        maxWidth: number;
        maxHeight: number;
        maxScale?: number;
    }
): RenderHandle {
    const { rotation, maxWidth, maxHeight, maxScale = 4 } = options;
    const base = page.getViewport({ scale: 1, rotation });
    const scale = Math.min(maxWidth / base.width, maxHeight / base.height, maxScale);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const viewport = page.getViewport({ scale: scale * dpr, rotation });

    canvas.width = Math.max(1, Math.ceil(viewport.width));
    canvas.height = Math.max(1, Math.ceil(viewport.height));
    canvas.style.width = `${viewport.width / dpr}px`;
    canvas.style.height = `${viewport.height / dpr}px`;
    canvas.style.maxWidth = '100%';
    canvas.style.height = 'auto';

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is not supported in this browser');

    // PDF pages are transparent by default; fill white so the preview and
    // JPEG/PNG thumbnails look like paper.
    context.save();
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();

    const task = page.render({ canvasContext: context, viewport });
    return {
        promise: task.promise.then(() => ({
            width: viewport.width / dpr,
            height: viewport.height / dpr,
        })),
        cancel: () => task.cancel(),
    };
}
