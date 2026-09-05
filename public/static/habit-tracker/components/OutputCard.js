import { html } from 'htm/preact';
import { useRef, useEffect } from 'preact/hooks';
import ChartBuilder from '@/services/ChartBuilder.js';
import CanvasPrinter from '~/services/CanvasPrinter.js';
import CanvasPrintable from '~/components/CanvasPrintable.js';
import { getText } from '~/helpers/utils.js';

const OutputCard = ({ printLayout, showDayInCell, yearType, selectedYear }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (canvasRef.current) {
            // Use current year as default, no habit name, and include print layout setting
            const builder = new ChartBuilder(canvasRef.current, {
                year: selectedYear,
                yearType: yearType,
                habit: '',
                printLayout: printLayout,
                showDayInCell: showDayInCell
            });
            // Auto-generate chart on component mount or when layout changes
            builder.build();
        }
    }, [printLayout, showDayInCell, yearType, selectedYear]); // Re-run when printLayout or showDayInCell changes
    
    const handlePrint = () => {
        if (!canvasRef.current) return;
        
        const orientation = (printLayout === 2 || printLayout === 3) ? 'landscape' : 'portrait';
        const printer = new CanvasPrinter(canvasRef.current, { 
            printLayout,
            pageOrientation: orientation,
            dpi: 192,
        });
        printer.print();
    };
    
    const handleDownload = () => {
        if (!canvasRef.current) return;
        const link = document.createElement('a');
        link.download = 'habit-tracker.jpg';
        link.href = canvasRef.current.toDataURL('image/jpeg');
        link.click();
    };

    return html`
        <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
                <ul class="nav nav-tabs card-header-tabs">
                    <li class="nav-item">
                        <a class="nav-link active" href="#"><i class="bi bi-grid me-1"></i>${getText('habit-tracker/tracker/title')}</a>
                    </li>
                </ul>
                <div class="actions">
                    <button class="btn btn-outline-secondary btn-sm me-2" onClick=${handleDownload}>
                        <i class="bi bi-download me-1"></i>${getText('habit-tracker/button/download')}
                    </button>
                    <button class="btn btn-outline-primary btn-sm" onClick=${handlePrint}>
                        <i class="bi bi-printer me-1"></i>${getText('habit-tracker/button/print')}
                    </button>
                </div>
            </div>
            <div class="card-body">
                <${CanvasPrintable} 
                    canvasRef=${canvasRef} 
                    layout=${(printLayout === 2 || printLayout === 3) ? 'landscape' : 'portrait'} 
                />
            </div>
        </div>
    `;
};

export default OutputCard;
