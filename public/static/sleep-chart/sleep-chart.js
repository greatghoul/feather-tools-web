import { html } from 'htm/preact';
import { render, h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { setup } from 'goober';
import { getText } from '~/helpers/utils.js';
import ChartBuilder from '@/services/ChartBuilder.js';
import SettingCard, { defaultSettings } from '@/components/SettingCard.js';
import CanvasPrinter from '~/services/CanvasPrinter.js';
import CanvasPrintable from '~/components/CanvasPrintable.js';

setup(h);

const App = () => {
    const canvasRef = useRef(null);
    const [currentSettings, setCurrentSettings] = useState(defaultSettings);

    const handleGenerate = (settings) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        setCurrentSettings(settings);
        new ChartBuilder(canvas, {
            ...settings,
            labels: {
                sleep: getText('sleep-chart/label/sleep'),
                wake: getText('sleep-chart/label/wake'),
                title: getText('sleep-chart/chart/title'),
                days: [
                    getText('common/week/sun'),
                    getText('common/week/mon'),
                    getText('common/week/tue'),
                    getText('common/week/wed'),
                    getText('common/week/thu'),
                    getText('common/week/fri'),
                    getText('common/week/sat')
                ]
            }
        }).build();

        const convasCard = canvas.parentElement.parentElement;
        convasCard.scrollIntoView({ behavior: 'smooth' });
    };

    const handlePrint = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const printer = new CanvasPrinter(canvas, {
            pageOrientation: 'landscape',
            pageSize: 'A4',
            dpi: 144,
        });
        printer.print();
    };

    useEffect(() => handleGenerate(defaultSettings), [canvasRef]);

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = 'sleep-chart.jpg';
        link.href = canvas.toDataURL('image/jpeg');
        link.click();
    };

    return html`
        <div>
            <${SettingCard} onGenerate=${handleGenerate} />
            <div class="card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">${getText('sleep-chart/chart/chart')}</h5>
                    <div class="actions">
                        <button class="btn btn-outline-secondary me-2" onClick=${handleDownload}>
                            <i class="bi bi-download me-1"></i>${getText('sleep-chart/button/download')}
                        </button>
                        <button class="btn btn-outline-primary" onClick=${handlePrint}>
                            <i class="bi bi-printer me-1"></i>${getText('common/print')}
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <${CanvasPrintable} canvasRef=${canvasRef} layout="landscape" />
                </div>
            </div>
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${App} />`, document.getElementById('app'));
});
