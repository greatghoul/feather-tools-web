import type { SignRow } from './SheetService';

export type SignMode = 'signature' | 'check';

export interface RenderLabels {
    no: string;
    name: string;
    phone: string;
    email: string;
    sign: string;
    date: string;
    location: string;
    /** 'Page {current} of {total}' style template. */
    pageOf: string;
}

export interface RenderOptions {
    title: string;
    date: string;
    location: string;
    signMode: SignMode;
    rows: SignRow[];
    showPhone: boolean;
    showEmail: boolean;
    labels: RenderLabels;
}

export interface RenderResult {
    canvases: HTMLCanvasElement[];
    truncated: boolean;
}

interface Column {
    title: string;
    width: number;
    align: 'left' | 'center';
}

const BASE_W = 794;   // A4 portrait at 96dpi
const BASE_H = 1123;
const MARGIN = { top: 34, right: 40, bottom: 36, left: 40 };
const CONTENT_W = BASE_W - MARGIN.left - MARGIN.right;
const HEADER_ROW_H = 26;
const ROW_H: Record<SignMode, number> = { check: 30, signature: 44 };
const FOOTER_SPACE = 22;
const MAX_PAGES = 50;
const NO_W = 38;
const PHONE_W = 128;
const EMAIL_W = 176;
const SIGN_W: Record<SignMode, number> = { check: 76, signature: 120 };
const NAME_MIN_W = 84;
const EXTRA_MAX_W = 88;
const FONT_STACK = 'Arial, "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';

const truncate = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string => {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let s = text;
    while (s.length > 1 && ctx.measureText(s + '…').width > maxWidth) {
        s = s.slice(0, -1);
    }
    return s + '…';
};

const SheetRenderer = {
    MAX_PAGES,

    render(options: RenderOptions): RenderResult {
        const scale = 2;
        const rowH = ROW_H[options.signMode];
        const columns = this.buildColumns(options);
        const tableTop = {
            first: this.headerHeight(options, true) + 10,
            rest: this.headerHeight(options, false) + 10,
        };
        const tableBottom = BASE_H - MARGIN.bottom - FOOTER_SPACE;

        const capFirst = Math.max(1, Math.floor(
            (tableBottom - tableTop.first - HEADER_ROW_H) / rowH
        ));
        const capRest = Math.max(1, Math.floor(
            (tableBottom - tableTop.rest - HEADER_ROW_H) / rowH
        ));

        const chunks: SignRow[][] = [];
        const chunkOffsets: number[] = [];
        let offset = 0;
        let first = true;
        while (offset < options.rows.length && chunks.length < MAX_PAGES) {
            const cap = first ? capFirst : capRest;
            chunkOffsets.push(offset);
            chunks.push(options.rows.slice(offset, offset + cap));
            offset += cap;
            first = false;
        }
        const truncated = offset < options.rows.length;
        const pageCount = Math.max(1, chunks.length);

        const canvases: HTMLCanvasElement[] = [];
        for (let p = 0; p < pageCount; p++) {
            const canvas = document.createElement('canvas');
            canvas.width = BASE_W * scale;
            canvas.height = BASE_H * scale;
            const ctx = canvas.getContext('2d')!;
            ctx.scale(scale, scale);
            this.drawPage(ctx, options, columns, chunks[p] || [], p, chunkOffsets[p] || 0, pageCount, tableTop);
            canvases.push(canvas);
        }

        return { canvases, truncated };
    },

    headerHeight(options: RenderOptions, first: boolean): number {
        if (first) {
            const hasInfo = !!(options.date || options.location);
            return MARGIN.top + 20 + 8 + (hasInfo ? 18 : 0) + 8;
        }
        return MARGIN.top + 14 + 8;
    },

    buildColumns(options: RenderOptions): Column[] {
        const { labels } = options;
        const extraTitles = options.rows.length > 0
            ? options.rows[0].extra.map((cell) => cell.title)
            : [];

        let extrasW = Math.min(extraTitles.length * EXTRA_MAX_W, CONTENT_W * 0.4);
        let nameW = CONTENT_W - NO_W - SIGN_W[options.signMode]
            - (options.showPhone ? PHONE_W : 0)
            - (options.showEmail ? EMAIL_W : 0)
            - extrasW;
        if (nameW < NAME_MIN_W) {
            extrasW = Math.max(0, extrasW - (NAME_MIN_W - nameW));
            nameW = NAME_MIN_W;
        }

        const columns: Column[] = [
            { title: labels.no, width: NO_W, align: 'center' },
            { title: labels.name, width: nameW, align: 'left' },
        ];
        if (options.showPhone) {
            columns.push({ title: labels.phone, width: PHONE_W, align: 'left' });
        }
        if (options.showEmail) {
            columns.push({ title: labels.email, width: EMAIL_W, align: 'left' });
        }
        for (const title of extraTitles) {
            columns.push({ title, width: extrasW / extraTitles.length, align: 'left' });
        }
        columns.push({ title: labels.sign, width: SIGN_W[options.signMode], align: 'center' });
        return columns;
    },

    drawPage(
        ctx: CanvasRenderingContext2D,
        options: RenderOptions,
        columns: Column[],
        chunk: SignRow[],
        pageIndex: number,
        rowOffset: number,
        pageCount: number,
        tableTop: { first: number; rest: number }
    ) {
        const first = pageIndex === 0;
        const rowH = ROW_H[options.signMode];

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, BASE_W, BASE_H);
        ctx.textBaseline = 'alphabetic';

        // Header: full title block on page 1, compact repeat on later pages.
        if (first) {
            ctx.fillStyle = '#222222';
            ctx.font = `bold 20px ${FONT_STACK}`;
            ctx.textAlign = 'center';
            ctx.fillText(options.title, BASE_W / 2, MARGIN.top + 20);

            let dividerY = MARGIN.top + 34;
            if (options.date || options.location) {
                ctx.font = `12px ${FONT_STACK}`;
                ctx.fillStyle = '#444444';
                ctx.textAlign = 'left';
                if (options.date) {
                    ctx.fillText(
                        truncate(ctx, `${options.labels.date}${options.date}`, CONTENT_W / 2),
                        MARGIN.left, MARGIN.top + 44
                    );
                }
                if (options.location) {
                    ctx.textAlign = 'right';
                    ctx.fillText(
                        truncate(ctx, `${options.labels.location}${options.location}`, CONTENT_W / 2),
                        MARGIN.left + CONTENT_W, MARGIN.top + 44
                    );
                }
                dividerY = MARGIN.top + 52;
            }
            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(MARGIN.left, dividerY);
            ctx.lineTo(MARGIN.left + CONTENT_W, dividerY);
            ctx.stroke();
        } else {
            ctx.fillStyle = '#222222';
            ctx.font = `bold 13px ${FONT_STACK}`;
            ctx.textAlign = 'left';
            ctx.fillText(truncate(ctx, options.title, CONTENT_W), MARGIN.left, MARGIN.top + 14);
            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(MARGIN.left, MARGIN.top + 20);
            ctx.lineTo(MARGIN.left + CONTENT_W, MARGIN.top + 20);
            ctx.stroke();
        }

        // Table
        const top = first ? tableTop.first : tableTop.rest;
        const tableH = HEADER_ROW_H + chunk.length * rowH;
        const bottom = top + tableH;

        ctx.font = `bold 12px ${FONT_STACK}`;
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(MARGIN.left, top, CONTENT_W, HEADER_ROW_H);

        let x = MARGIN.left;
        const xs: number[] = [x];
        for (const col of columns) {
            x += col.width;
            xs.push(x);
        }

        // Grid lines
        ctx.strokeStyle = '#444444';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (const vx of xs) {
            ctx.moveTo(vx, top);
            ctx.lineTo(vx, bottom);
        }
        for (let r = 0; r <= chunk.length; r++) {
            const hy = top + HEADER_ROW_H + r * rowH;
            ctx.moveTo(MARGIN.left, hy);
            ctx.lineTo(MARGIN.left + CONTENT_W, hy);
        }
        ctx.stroke();
        ctx.strokeRect(MARGIN.left, top, CONTENT_W, tableH);

        // Header texts
        ctx.fillStyle = '#222222';
        ctx.textBaseline = 'middle';
        columns.forEach((col, i) => {
            ctx.textAlign = 'center';
            const label = truncate(ctx, col.title, col.width - 8);
            ctx.fillText(label, (xs[i] + xs[i + 1]) / 2, top + HEADER_ROW_H / 2 + 1);
        });

        // Row contents
        ctx.font = `12px ${FONT_STACK}`;
        chunk.forEach((row, r) => {
            const rowTop = top + HEADER_ROW_H + r * rowH;
            const rowMid = rowTop + rowH / 2 + 1;
            ctx.fillStyle = '#222222';

            ctx.textAlign = 'center';
            ctx.fillText(String(rowOffset + r + 1), (xs[0] + xs[1]) / 2, rowMid);

            let colIdx = 1;
            const drawLeft = (text: string) => {
                ctx.textAlign = 'left';
                const w = columns[colIdx].width - 12;
                ctx.fillText(truncate(ctx, text, w), xs[colIdx] + 6, rowMid);
                colIdx++;
            };

            drawLeft(row.name);
            if (options.showPhone) drawLeft(row.phone);
            if (options.showEmail) drawLeft(row.email);
            for (const cell of row.extra) drawLeft(cell.value);

            if (options.signMode === 'check') {
                const cx = (xs[xs.length - 2] + xs[xs.length - 1]) / 2;
                ctx.strokeStyle = '#333333';
                ctx.lineWidth = 1;
                ctx.strokeRect(cx - 5.5, rowMid - 5.5, 11, 11);
            }
        });

        // Footer
        ctx.fillStyle = '#999999';
        ctx.font = `10px ${FONT_STACK}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(
            options.labels.pageOf
                .replace('{current}', String(pageIndex + 1))
                .replace('{total}', String(pageCount)),
            BASE_W / 2, BASE_H - MARGIN.bottom + 8
        );
    },
};

export default SheetRenderer;
