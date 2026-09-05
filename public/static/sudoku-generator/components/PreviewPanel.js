import { html } from 'htm/preact';
import { useRef, useEffect, useState } from 'preact/hooks';
import SudokuRenderer from '@/services/SudokuRenderer.js';
import CanvasPrinter from '~/services/CanvasPrinter.js';
import CanvasPrintable from '~/components/CanvasPrintable.js';
import { getText } from '~/helpers/utils.js';

const PreviewPanel = ({ puzzles, perRow }) => {
    const canvasRef = useRef(null);
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

    return html`
        <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
                <ul class="nav nav-tabs card-header-tabs">
                    <li class="nav-item">
                        <a class="nav-link active" href="#"><i class="bi bi-grid me-1"></i>${getText('sudoku-generator/preview/title')}</a>
                    </li>
                </ul>
                <div class="d-flex align-items-center gap-1">
                    <button class="btn btn-outline-secondary btn-sm" onClick=${handleToggleSolution}>
                        ${showSolution
                            ? html`<i class="bi bi-eye-slash me-1"></i>${getText('sudoku-generator/preview/hide_solution')}`
                            : html`<i class="bi bi-eye me-1"></i>${getText('sudoku-generator/preview/show_solution')}`}
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" onClick=${handleDownload}>
                        <i class="bi bi-download me-1"></i>${getText('sudoku-generator/button/download')}
                    </button>
                    <button class="btn btn-outline-primary btn-sm" onClick=${handlePrint}>
                        <i class="bi bi-printer me-1"></i>${getText('sudoku-generator/button/print')}
                    </button>
                </div>
            </div>
            <div class="card-body">
                <${CanvasPrintable} canvasRef=${canvasRef} layout="portrait" />
            </div>
        </div>
    `;
};

export default PreviewPanel;
