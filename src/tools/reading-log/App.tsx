import { useState, useEffect, useRef, useMemo } from 'react';
import { t } from '~/helpers/i18n';
import ChartBuilder from './services/ChartBuilder';
import SettingsCard from './components/SettingsCard';
import CanvasPrinter from '~/services/CanvasPrinter';
import CanvasPrintable from '~/components/CanvasPrintable';

const App = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [showTitle, setShowTitle] = useState(true);
    const [title, setTitle] = useState(t('reading-log/settings/default_title') || 'My Reading Log');
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
                titleLabel: t('reading-log/column/title'),
                authorLabel: t('reading-log/column/author'),
                dateLabel: t('reading-log/column/date'),
                pagesLabel: t('reading-log/column/pages')
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

    return (
<>

        <div className="row">
            <div className="col-lg-4 mb-4">
                <SettingsCard showTitle={showTitle} onShowTitleChange={setShowTitle} title={title} onTitleChange={setTitle} bookTitle={bookTitle} onBookTitleChange={setBookTitle} bookAuthor={bookAuthor} onBookAuthorChange={setBookAuthor} columns={columns} onColumnsChange={setColumns} cardRows={cardRows} onCardRowsChange={setCardRows} cardCount={cardCount} onPrint={handlePrint} onDownload={handleDownload} />
            </div>
            <div className="col-lg-8">
                <div className="card mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">{t('common/chart')}</h5>
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
                        <CanvasPrintable canvasRef={canvasRef} layout="portrait" />
                    </div>
                </div>
            </div>
        </div>
    
</>
);
};

export default App;
