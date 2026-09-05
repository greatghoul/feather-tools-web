import { html } from 'htm/preact';
import { render } from 'preact';
import { useState } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';

import SettingsCard from '@/components/SettingsCard.js';
import PreviewPanel from '@/components/PreviewPanel.js';

const MONTHS = Array.from({ length: 12 }, (_, i) => i);

const MonthlyPlanner = () => {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth());
    const [year, setYear] = useState(now.getFullYear());
    const [startOfWeek, setStartOfWeek] = useState('sunday');
    const [lineCount, setLineCount] = useState(3);
    const [title, setTitle] = useState(getText('monthly-planner/settings/planner_title') || 'Monthly Planner');

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        const el = document.getElementById('a4Page');
        if (!el) return;
        import('html2canvas').then(({ default: html2canvas }) => {
            html2canvas(el, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            }).then((canvas) => {
                const link = document.createElement('a');
                link.download = `monthly-planner-${year}-${String(month + 1).padStart(2, '0')}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        });
    };

    return html`
        <div class="row">
            <div class="col-lg-4 mb-4">
                <${SettingsCard}
                    month=${month}
                    onMonthChange=${setMonth}
                    year=${year}
                    onYearChange=${setYear}
                    startOfWeek=${startOfWeek}
                    onStartOfWeekChange=${setStartOfWeek}
                    lineCount=${lineCount}
                    onLineCountChange=${setLineCount}
                    title=${title}
                    onTitleChange=${setTitle}
                    onDownload=${handleDownload}
                    onPrint=${handlePrint}
                />
            </div>

            <div class="col-lg-8">
                <${PreviewPanel}
                    month=${month}
                    year=${year}
                    startOfWeek=${startOfWeek}
                    lineCount=${lineCount}
                    title=${title}
                />
            </div>
        </div>
    `;
};

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${MonthlyPlanner} />`, document.getElementById('app'));
});
