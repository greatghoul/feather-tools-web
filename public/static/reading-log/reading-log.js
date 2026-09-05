import { html } from 'htm/preact';
import { render } from 'preact';
import { useState, useEffect, useRef, useMemo } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import ChartBuilder from '@/services/ChartBuilder.js';
import SettingsCard from '@/components/SettingsCard.js';
import CanvasPrinter from '~/services/CanvasPrinter.js';
import CanvasPrintable from '~/components/CanvasPrintable.js';

const App = () => {
    const canvasRef = useRef(null);
    const [showTitle, setShowTitle] = useState(true);
    const [title, setTitle] = useState(getText('reading-log/settings/default_title') || 'My Reading Log');
    const [bookTitle, setBookTitle] = useState('');
    const [bookAuthor, setBookAuthor] = useState('');
    const [columns, setColumns] = useState(1);
    const [cardRows, setCardRows] = useState(3);

    const cardCount = useMemo(() => {
        const base = Math.max(3, Math.round(32 / (cardRows + 1)));
        return columns === 2 ? base * 2 : base;
    }, [cardRows, columns]);

    const buildChart = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        new ChartBuilder(canvas, {
            showTitle,
            title,
            bookTitle,
            bookAuthor,
            columns,
            cardCount,
            cardRows,
            t: {
                titleLabel: getText('reading-log/column/title'),
                authorLabel: getText('reading-log/column/author'),
                dateLabel: getText('reading-log/column/date'),
                pagesLabel: getText('reading-log/column/pages')
            }
        }).build();
    };

    useEffect(() => buildChart(), [canvasRef]);

    useEffect(() => {
        buildChart();
    }, [showTitle, title, bookTitle, bookAuthor, columns, cardCount, cardRows]);

    const handlePrint = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const printer = new CanvasPrinter(canvas, {
            pageOrientation: 'portrait',
            pageSize: 'A4'
        });
        printer.print();
    };

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = 'reading-log.jpg';
        link.href = canvas.toDataURL('image/jpeg');
        link.click();
    };

    return html`
        <div class="row">
            <div class="col-lg-4 mb-4">
                <${SettingsCard}
                    showTitle=${showTitle}
                    onShowTitleChange=${setShowTitle}
                    title=${title}
                    onTitleChange=${setTitle}
                    bookTitle=${bookTitle}
                    onBookTitleChange=${setBookTitle}
                    bookAuthor=${bookAuthor}
                    onBookAuthorChange=${setBookAuthor}
                    columns=${columns}
                    onColumnsChange=${setColumns}
                    cardRows=${cardRows}
                    onCardRowsChange=${setCardRows}
                    cardCount=${cardCount}
                    onPrint=${handlePrint}
                    onDownload=${handleDownload}
                />
            </div>
            <div class="col-lg-8">
                <div class="card mb-4">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">${getText('common/chart')}</h5>
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
                        <${CanvasPrintable} canvasRef=${canvasRef} layout="portrait" />
                    </div>
                </div>
            </div>
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${App} />`, document.getElementById('app'));
});
