import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import { notify } from '~/helpers/messages.js';

const OutputCard = ({ result, onExportCSV }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!result || result.frequencies.length === 0) return;

        const text = result.frequencies
            .map(f => `${f.word}\t${f.count}\t${f.percentage}%`)
            .join('\n');

        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            notify(getText('text-frequency/message/copied'), '', 'success');
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const totalWords = result?.totalWords || 0;
    const uniqueWords = result?.uniqueWords || 0;
    const frequencies = result?.frequencies || [];

    return html`
        <div class="card">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <span>${getText('text-frequency/output/title')}</span>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-success"
                            onClick=${onExportCSV}
                            disabled=${frequencies.length === 0}>
                        <i class="bi bi-download"></i> ${getText('text-frequency/button/export_csv')}
                    </button>
                    <button class="btn btn-sm btn-outline-primary"
                            onClick=${handleCopy}
                            disabled=${frequencies.length === 0}>
                        <i class="bi bi-clipboard"></i> ${copied ? getText('text-frequency/message/copied') : getText('text-frequency/button/copy')}
                    </button>
                </div>
            </div>
            <div class="card-body p-0">
                ${frequencies.length > 0 ? html`
                    <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                        <table class="table table-striped table-hover mb-0">
                            <thead class="table-light sticky-top">
                                <tr>
                                    <th class="ps-3">#</th>
                                    <th>${getText('text-frequency/output/table/word')}</th>
                                    <th class="text-end">${getText('text-frequency/output/table/frequency')}</th>
                                    <th class="text-end pe-3">${getText('text-frequency/output/table/percentage')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${frequencies.map((f, i) => html`
                                    <tr>
                                        <td class="ps-3 text-muted">${i + 1}</td>
                                        <td><code>${f.word}</code></td>
                                        <td class="text-end">${f.count}</td>
                                        <td class="text-end pe-3">${f.percentage}%</td>
                                    </tr>
                                `)}
                            </tbody>
                        </table>
                    </div>
                ` : html`
                    <div class="text-center text-muted py-4">
                        <i class="bi bi-bar-chart-line" style="font-size: 2rem;"></i>
                        <p class="mt-2 mb-0">${getText('text-frequency/button/analyze')}</p>
                    </div>
                `}
            </div>
            ${totalWords > 0 ? html`
                <div class="card-footer bg-light">
                    <div class="d-flex gap-4 small">
                        <span><strong>${getText('text-frequency/output/stats/total_words')}:</strong> ${totalWords}</span>
                        <span><strong>${getText('text-frequency/output/stats/unique_words')}:</strong> ${uniqueWords}</span>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
};

export default OutputCard;
