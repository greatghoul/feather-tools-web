import { useRef, useEffect } from 'react';
import ChartBuilder from '../services/ChartBuilder';
import CanvasPrinter from '~/services/CanvasPrinter';
import CanvasPrintable from '~/components/CanvasPrintable';
import { t } from '~/helpers/i18n';

const OutputCard = ({ printLayout, showDayInCell, yearType, selectedYear }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    return (
<>

        <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
                <ul className="nav nav-tabs card-header-tabs">
                    <li className="nav-item">
                        <a className="nav-link active" href="#"><i className="bi bi-grid me-1"></i>{t('habit-tracker/tracker/title')}</a>
                    </li>
                </ul>
                <div className="actions">
                    <button className="btn btn-outline-secondary btn-sm me-2" onClick={handleDownload}>
                        <i className="bi bi-download me-1"></i>{t('habit-tracker/button/download')}
                    </button>
                    <button className="btn btn-outline-primary btn-sm" onClick={handlePrint}>
                        <i className="bi bi-printer me-1"></i>{t('habit-tracker/button/print')}
                    </button>
                </div>
            </div>
            <div className="card-body">
                <CanvasPrintable canvasRef={canvasRef} layout={(printLayout === 2 || printLayout === 3) ? 'landscape' : 'portrait'} />
            </div>
        </div>
    
</>
);
};

export default OutputCard;
