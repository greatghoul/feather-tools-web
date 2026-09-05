import { useRef, useEffect, useState } from 'react';
import SudokuRenderer from '../services/SudokuRenderer';
import CanvasPrinter from '~/services/CanvasPrinter';
import CanvasPrintable from '~/components/CanvasPrintable';
import { t } from '~/helpers/i18n';

const PreviewPanel = ({ puzzles, perRow }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [showSolution, setShowSolution] = useState(false);

    useEffect(() => {
        if (!canvasRef.current) return;
        const renderer = new SudokuRenderer(canvasRef.current);
        renderer.render({
            puzzles,
            perRow,
            showSolution,
        });
    }, [puzzles, perRow, showSolution]);

    const handleToggleSolution = () => {
        setShowSolution(!showSolution);
    };

    const handlePrint = () => {
        if (!canvasRef.current) return;
        const printer = new CanvasPrinter(canvasRef.current, {
            pageOrientation: 'portrait',
            dpi: 192,
        });
        printer.print();
    };

    const handleDownload = () => {
        if (!canvasRef.current) return;
        const link = document.createElement('a');
        link.download = 'sudoku-generator.jpg';
        link.href = canvasRef.current.toDataURL('image/jpeg', 0.95);
        link.click();
    };

    return (
<>

        <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
                <ul className="nav nav-tabs card-header-tabs">
                    <li className="nav-item">
                        <a className="nav-link active" href="#"><i className="bi bi-grid me-1"></i>{t('sudoku-generator/preview/title')}</a>
                    </li>
                </ul>
                <div className="d-flex align-items-center gap-1">
                    <button className="btn btn-outline-secondary btn-sm" onClick={handleToggleSolution}>
                        {showSolution
                            ? (
<>
<i className="bi bi-eye-slash me-1"></i>{t('sudoku-generator/preview/hide_solution')}
</>
)
                            : (
<>
<i className="bi bi-eye me-1"></i>{t('sudoku-generator/preview/show_solution')}
</>
)}
                    </button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={handleDownload}>
                        <i className="bi bi-download me-1"></i>{t('sudoku-generator/button/download')}
                    </button>
                    <button className="btn btn-outline-primary btn-sm" onClick={handlePrint}>
                        <i className="bi bi-printer me-1"></i>{t('sudoku-generator/button/print')}
                    </button>
                </div>
            </div>
            <div className="card-body">
                <CanvasPrintable canvasRef={canvasRef} layout="portrait" />
            </div>
        </div>
    
</>
);
};

export default PreviewPanel;
