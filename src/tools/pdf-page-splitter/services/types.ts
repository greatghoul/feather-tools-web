import type { PDFDocumentProxy } from 'pdfjs-dist';

/** How a page is cut. A cut always produces two new pages. */
export type SplitMode = 'none' | 'horizontal' | 'vertical';

export type Rotation = 0 | 90 | 180 | 270;

export interface PageSetting {
    /** Zero-based source page index. */
    index: number;
    /** Split direction, relative to the rotated (displayed) page. */
    mode: SplitMode;
    /** Cut line position as a 0-1 fraction of the displayed page. */
    position: number;
    /** Extra clockwise rotation applied on top of the page's own rotation. */
    rotation: Rotation;
}

export interface LoadedPdf {
    name: string;
    size: number;
    /** Original bytes, kept for the pdf-lib export step. */
    bytes: Uint8Array;
    doc: PDFDocumentProxy;
    pageCount: number;
}

export interface CropRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

/** One resulting page after cutting/rotating. */
export interface Segment {
    sourcePageIndex: number;
    crop: CropRect;
    /** Absolute page rotation for the output page (intrinsic + user). */
    rotation: number;
    label: 'whole' | 'top' | 'bottom' | 'left' | 'right';
}

export interface ExportProgress {
    current: number;
    total: number;
}
