import { useState, useEffect, useRef } from 'react';
import { t } from '~/helpers/i18n';
import ChartBuilder from './services/ChartBuilder';
import SettingCard, { defaultSettings } from './components/SettingCard';
import CanvasPrinter from '~/services/CanvasPrinter';
import CanvasPrintable from '~/components/CanvasPrintable';

const App = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [currentSettings, setCurrentSettings] = useState(defaultSettings);

    const handleGenerate = (settings) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        setCurrentSettings(settings);
        new ChartBuilder(canvas, settings).build();

        const convasCard = canvas.parentElement!.parentElement!;
        convasCard.scrollIntoView({ behavior: 'smooth' });
    };

    const handlePrint = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const printer = new CanvasPrinter(canvas, {
            pageOrientation: 'landscape',
            pageSize: 'A4'
        });
        printer.print();
    };

    useEffect(() => handleGenerate(defaultSettings), [canvasRef]);

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `weight-tracking-chart.jpg`;
        link.href = canvas.toDataURL('image/jpeg');
        link.click();
    };

    return (
<>

        <div>
            <SettingCard onGenerate={handleGenerate} />
            <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{t('common/chart')}</h5>
                    <div className="actions">
                        <button className="btn btn-outline-secondary me-2" onClick={handleDownload}>
                            <i className="bi bi-download me-1"></i>{t('common/download')}
                        </button>
                        <button className="btn btn-outline-primary" onClick={handlePrint}>
                            <i className="bi bi-printer me-1"></i>{t('common/print')}
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    <CanvasPrintable canvasRef={canvasRef} layout="landscape" />
                </div>
            </div>
        </div>
    
</>
);
};

export default App;
