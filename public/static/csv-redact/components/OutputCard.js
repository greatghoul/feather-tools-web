import { html } from 'htm/preact';
import { useState, useMemo } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import { notify } from '~/helpers/messages.js';
import { downloadFile } from '~/helpers/files.js';
import MaskService from '@/services/MaskService.js';

const OutputCard = ({ headers, rows, outputViewMode, setOutputViewMode, delimiter, ruleCount, isLarge }) => {
    const [isCopying, setIsCopying] = useState(false);

    const textOutput = useMemo(() => MaskService.toCsv(headers, rows, delimiter), [headers, rows, delimiter]);

    const hasContent = rows.length > 0 || headers.length > 0;

    const handleCopy = () => {
        if (!hasContent || isCopying) return;
        setIsCopying(true);
        navigator.clipboard.writeText(textOutput).then(() => {
            notify(getText('csv-redact/message/copied'), '', 'success');
            setTimeout(() => setIsCopying(false), 1000);
        });
    };

    const handleDownload = () => {
        if (!hasContent) return;
        const blob = new Blob([textOutput], { type: 'text/csv;charset=utf-8' });
        downloadFile(blob, 'masked.csv');
        notify(getText('csv-redact/message/downloaded'), '', 'success');
    };

    const displayHeaders = headers.length > 0
        ? headers
        : (rows.length > 0 ? Array.from({ length: rows[0].length }, (_, i) => `${i + 1}`) : []);

    return html`
        <div class="card">
            <div class="card-header bg-light d-flex justify-content-between align-items-center flex-wrap gap-2">
                <span>${getText('csv-redact/output/title')}</span>
                <div class="d-flex gap-2 flex-wrap justify-content-end">
                    <div class="btn-group btn-group-sm">
                        <button
                            class="btn btn-sm ${outputViewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}"
                            onClick=${() => setOutputViewMode('table')}
                            disabled=${!hasContent}
                        >${getText('csv-redact/view/table')}</button>
                        <button
                            class="btn btn-sm ${outputViewMode === 'text' ? 'btn-primary' : 'btn-outline-primary'}"
                            onClick=${() => setOutputViewMode('text')}
                            disabled=${!hasContent}
                        >${getText('csv-redact/view/text')}</button>
                    </div>
                    <button
                        class="btn btn-sm btn-outline-primary"
                        onClick=${handleCopy}
                        disabled=${!hasContent || isCopying}
                    >${getText('csv-redact/button/copy')}</button>
                    <button
                        class="btn btn-sm btn-outline-primary"
                        onClick=${handleDownload}
                        disabled=${!hasContent}
                    >${getText('csv-redact/button/download')}</button>
                </div>
            </div>
            <div class="card-body p-0">
                ${!hasContent
                    ? html`
                        <div class="p-3 text-muted text-center" style="min-height: 100px; display: flex; align-items: center; justify-content: center;">
                            ${isLarge ? getText('csv-redact/output/click_to_redact') : getText('csv-redact/output/no_data')}
                        </div>
                    `
                    : outputViewMode === 'table'
                        ? html`
                            <div class="table-responsive" style="max-height: 500px; overflow-y: auto;">
                                <table class="table table-bordered table-striped table-sm mb-0">
                                    ${displayHeaders.length > 0 ? html`
                                        <thead class="table-light">
                                            <tr>
                                                ${displayHeaders.map((h) => html`
                                                    <th class="text-nowrap">${h}</th>
                                                `)}
                                            </tr>
                                        </thead>
                                    ` : null}
                                    <tbody>
                                        ${rows.map((row) => html`
                                            <tr>
                                                ${row.map((cell) => html`
                                                    <td class="font-monospace small" style="white-space: pre-wrap;">${cell !== '' ? cell : html`<span class="text-muted fst-italic">${getText('csv-redact/view/empty')}</span>`}</td>
                                                `)}
                                            </tr>
                                        `)}
                                    </tbody>
                                </table>
                            </div>
                        `
                        : html`
                            <textarea
                                class="form-control border-0 font-monospace"
                                style="min-height: 200px; resize: vertical;"
                                value=${textOutput}
                                readonly
                            ></textarea>
                        `
                }
            </div>
            ${hasContent && ruleCount > 0 ? html`
                <div class="card-footer bg-light small text-muted">
                    ${getText('csv-redact/stats/title')}: ${ruleCount} ${getText('csv-redact/stats/rules_count')}, ${rows.length} ${getText('csv-redact/stats/rows_count')}
                </div>
            ` : ''}
        </div>
    `;
};

export default OutputCard;
