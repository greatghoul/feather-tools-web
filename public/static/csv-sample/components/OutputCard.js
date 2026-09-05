import { html } from 'htm/preact';
import { useState, useMemo } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import { notify } from '~/helpers/messages.js';
import { downloadFile } from '~/helpers/files.js';
import CsvSampleService from '@/services/CsvSampleService.js';

const PREVIEW_LIMIT = 100;

const OutputCard = ({ headers, rows, delimiter, viewMode, setViewMode, filenamePrefix }) => {
    const [isCopying, setIsCopying] = useState(false);

    const downloadFilename = filenamePrefix
        ? `${filenamePrefix}-sample.csv`
        : 'sample.csv';

    const textOutput = useMemo(
        () => CsvSampleService.toCsv(headers, rows, delimiter),
        [headers, rows, delimiter]
    );

    const hasContent = rows.length > 0 || headers.length > 0;
    const isLimited = rows.length > PREVIEW_LIMIT;
    const previewRows = isLimited ? rows.slice(0, PREVIEW_LIMIT) : rows;
    const displayHeaders = headers.length > 0
        ? headers
        : (rows.length > 0 ? Array.from({ length: rows[0].length }, (_, i) => `${i + 1}`) : []);

    const handleCopy = () => {
        if (!hasContent || isCopying) return;
        setIsCopying(true);
        navigator.clipboard.writeText(textOutput).then(() => {
            notify(getText('csv-sample/message/copied'), '', 'success');
            setTimeout(() => setIsCopying(false), 1000);
        });
    };

    const handleDownload = () => {
        if (!hasContent) return;
        const blob = new Blob(['\uFEFF' + textOutput], { type: 'text/csv;charset=utf-8' });
        downloadFile(blob, downloadFilename);
        notify(getText('csv-sample/message/downloaded'), '', 'success');
    };

    return html`
        <div class="card">
            <div class="card-header bg-light d-flex justify-content-between align-items-center flex-wrap gap-2">
                <span>${getText('csv-sample/output/title')}</span>
                <div class="d-flex gap-2 flex-wrap justify-content-end">
                    <div class="btn-group btn-group-sm">
                        <button
                            class="btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}"
                            onClick=${() => setViewMode('table')}
                            disabled=${!hasContent}
                        >${getText('csv-sample/view/table')}</button>
                        <button
                            class="btn btn-sm ${viewMode === 'text' ? 'btn-primary' : 'btn-outline-primary'}"
                            onClick=${() => setViewMode('text')}
                            disabled=${!hasContent}
                        >${getText('csv-sample/view/text')}</button>
                    </div>
                    <button
                        class="btn btn-sm btn-outline-primary"
                        onClick=${handleCopy}
                        disabled=${!hasContent || isCopying}
                    >${getText('csv-sample/button/copy')}</button>
                    <button
                        class="btn btn-sm btn-outline-primary"
                        onClick=${handleDownload}
                        disabled=${!hasContent}
                    >${getText('csv-sample/button/download')}</button>
                </div>
            </div>
            <div class="card-body p-0">
                ${!hasContent
                    ? html`
                        <div class="p-3 text-muted text-center" style="min-height: 100px; display: flex; align-items: center; justify-content: center;">
                            ${getText('csv-sample/output/no_data')}
                        </div>
                    `
                    : viewMode === 'table'
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
                                        ${previewRows.map((row) => html`
                                            <tr>
                                                ${row.map((cell) => html`
                                                    <td class="font-monospace small" style="white-space: pre-wrap;">${cell}</td>
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
            ${hasContent && (isLimited || rows.length > 0) ? html`
                <div class="card-footer bg-light small text-muted d-flex justify-content-between flex-wrap gap-1">
                    <span>${rows.length} rows${headers.length > 0 ? ` / ${headers.length} columns` : ''}</span>
                    ${isLimited ? html`<span>${getText('csv-sample/output/preview_limit')}</span>` : null}
                </div>
            ` : ''}
        </div>
    `;
};

export default OutputCard;
