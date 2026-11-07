import JSZip from 'jszip';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { PDFPage } from 'pdf-lib';
import type { CropRect, ExportProgress, PageSetting, Segment } from './types';
import { totalRotation } from './pdfjs';

interface Transform {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
}

function invertTransform([a, b, c, d, e, f]: number[]): Transform {
    const det = a * d - b * c;
    if (!det) return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
    return {
        a: d / det,
        b: -b / det,
        c: -c / det,
        d: a / det,
        e: (c * f - d * e) / det,
        f: (b * e - a * f) / det,
    };
}

/** Maps a rectangle in display (CSS pixel, y-down) space back to PDF user space. */
function displayRectToSource(
    rect: { x: number; y: number; width: number; height: number },
    inverse: Transform,
    viewBox: number[]
): CropRect {
    const corners = [
        { x: rect.x, y: rect.y },
        { x: rect.x + rect.width, y: rect.y },
        { x: rect.x, y: rect.y + rect.height },
        { x: rect.x + rect.width, y: rect.y + rect.height },
    ].map(({ x, y }) => ({
        x: inverse.a * x + inverse.c * y + inverse.e,
        y: inverse.b * x + inverse.d * y + inverse.f,
    }));

    const minX = Math.min(...corners.map((p) => p.x));
    const maxX = Math.max(...corners.map((p) => p.x));
    const minY = Math.min(...corners.map((p) => p.y));
    const maxY = Math.max(...corners.map((p) => p.y));

    // Guard against floating point drift at the page edges.
    const x0 = Math.max(viewBox[0], minX);
    const y0 = Math.max(viewBox[1], minY);
    const x1 = Math.min(viewBox[2], maxX);
    const y1 = Math.min(viewBox[3], maxY);

    return {
        x: x0,
        y: y0,
        width: Math.max(0.01, x1 - x0),
        height: Math.max(0.01, y1 - y0),
    };
}

/**
 * Turns the per-page settings into the list of pages that will be written.
 * Cut positions are interpreted in the page's displayed (rotated) orientation,
 * then mapped back to the original PDF coordinate system.
 */
export async function buildSegments(
    doc: PDFDocumentProxy,
    pages: PageSetting[]
): Promise<Segment[]> {
    const segments: Segment[] = [];

    for (const setting of pages) {
        const page = await doc.getPage(setting.index + 1);
        const rotation = totalRotation(page, setting.rotation);
        const viewport = page.getViewport({ scale: 1, rotation });
        const displayWidth = viewport.width;
        const displayHeight = viewport.height;
        const viewBox = page.view;

        if (setting.mode === 'none') {
            segments.push({
                sourcePageIndex: setting.index,
                crop: {
                    x: viewBox[0],
                    y: viewBox[1],
                    width: viewBox[2] - viewBox[0],
                    height: viewBox[3] - viewBox[1],
                },
                rotation,
                label: 'whole',
            });
            continue;
        }

        const inverse = invertTransform(viewport.transform);
        const position = Math.min(0.95, Math.max(0.05, setting.position));
        const rects =
            setting.mode === 'horizontal'
                ? [
                      { x: 0, y: 0, width: displayWidth, height: displayHeight * position, label: 'top' as const },
                      {
                          x: 0,
                          y: displayHeight * position,
                          width: displayWidth,
                          height: displayHeight * (1 - position),
                          label: 'bottom' as const,
                      },
                  ]
                : [
                      { x: 0, y: 0, width: displayWidth * position, height: displayHeight, label: 'left' as const },
                      {
                          x: displayWidth * position,
                          y: 0,
                          width: displayWidth * (1 - position),
                          height: displayHeight,
                          label: 'right' as const,
                      },
                  ];

        for (const rect of rects) {
            segments.push({
                sourcePageIndex: setting.index,
                crop: displayRectToSource(rect, inverse, viewBox),
                rotation,
                label: rect.label,
            });
        }
    }

    return segments;
}

function applySegment(page: PDFPage, segment: Segment, degrees: (angle: number) => any, PDFName: any) {
    // Normalize the crop to the page origin so the output page has a clean
    // [0, 0, width, height] box instead of an offset MediaBox.
    page.translateContent(-segment.crop.x, -segment.crop.y);
    page.setMediaBox(0, 0, segment.crop.width, segment.crop.height);
    page.setCropBox(0, 0, segment.crop.width, segment.crop.height);
    page.setBleedBox(0, 0, segment.crop.width, segment.crop.height);
    page.setTrimBox(0, 0, segment.crop.width, segment.crop.height);
    page.setArtBox(0, 0, segment.crop.width, segment.crop.height);
    page.setRotation(degrees(segment.rotation));
    // Interactive annotations would point at the old coordinates; drop them.
    page.node.delete(PDFName.of('Annots'));
}

function yieldToUi(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 0));
}

export function baseFileName(fileName: string): string {
    return (fileName.replace(/\.pdf$/i, '').replace(/[\\/:*?"<>|]+/g, '-').trim() || 'document');
}

export function segmentFileName(fileName: string, segment: Segment): string {
    const stem = baseFileName(fileName);
    const page = String(segment.sourcePageIndex + 1).padStart(3, '0');
    const suffix = segment.label === 'whole' ? '' : `-${segment.label}`;
    return `${stem}-page-${page}${suffix}.pdf`;
}

export interface ExportResult {
    blob: Blob;
    fileName: string;
    pageCount: number;
}

/** Builds one PDF containing every resulting page. */
export async function exportSinglePdf(
    bytes: Uint8Array,
    doc: PDFDocumentProxy,
    pages: PageSetting[],
    fileName: string,
    onProgress?: (progress: ExportProgress) => void
): Promise<ExportResult> {
    const { PDFDocument, degrees, PDFName } = await import('pdf-lib');
    const segments = await buildSegments(doc, pages);
    const source = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
    const output = await PDFDocument.create();

    for (let i = 0; i < segments.length; i++) {
        const [page] = await output.copyPages(source, [segments[i].sourcePageIndex]);
        applySegment(page, segments[i], degrees, PDFName);
        output.addPage(page);
        onProgress?.({ current: i + 1, total: segments.length });
        await yieldToUi();
    }

    const saved = await output.save();
    return {
        blob: new Blob([saved], { type: 'application/pdf' }),
        fileName: `${baseFileName(fileName)}-split.pdf`,
        pageCount: segments.length,
    };
}

/** Builds a ZIP archive with one PDF per resulting page. */
export async function exportZip(
    bytes: Uint8Array,
    doc: PDFDocumentProxy,
    pages: PageSetting[],
    fileName: string,
    onProgress?: (progress: ExportProgress) => void
): Promise<ExportResult> {
    const { PDFDocument, degrees, PDFName } = await import('pdf-lib');
    const segments = await buildSegments(doc, pages);
    const source = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
    const zip = new JSZip();

    for (let i = 0; i < segments.length; i++) {
        const output = await PDFDocument.create();
        const [page] = await output.copyPages(source, [segments[i].sourcePageIndex]);
        applySegment(page, segments[i], degrees, PDFName);
        output.addPage(page);
        const saved = await output.save();
        zip.file(segmentFileName(fileName, segments[i]), saved);
        onProgress?.({ current: i + 1, total: segments.length });
        await yieldToUi();
    }

    const blob = await zip.generateAsync({
        type: 'blob',
        // PDFs are already compressed; storing them keeps the ZIP fast.
        compression: 'STORE',
    });

    return {
        blob,
        fileName: `${baseFileName(fileName)}-pages.zip`,
        pageCount: segments.length,
    };
}
