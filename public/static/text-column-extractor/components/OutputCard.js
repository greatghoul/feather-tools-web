import { html } from 'htm/preact';
import { useState, useMemo } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import { notify } from '~/helpers/messages.js';

const OutputCard = ({ headers, rows, outputViewMode, setOutputViewMode, delimiter }) => {
    const [isCopying, setIsCopying] = useState(false);

    const textOutput = useMemo(() => {
        const textLines = [];
        if (headers.length > 0) {
            textLines.push(headers.join(delimiter));
        }
        rows.forEach((row) => {
            textLines.push(row.join(delimiter));
        });
        return textLines.join('\n');
    }, [headers, rows, delimiter]);

    const handleCopy = () => {
        if (rows.length === 0 || isCopying) return;

        setIsCopying(true);
        navigator.clipboard.writeText(textOutput).then(() => {
            notify(getText('text-column-extractor/message/copied'), '', 'success');
            setTimeout(() => setIsCopying(false), 1000);
        });
    };

    const hasContent = rows.length > 0;

    return html`
        <div class="card">
            <div class="card-header bg-light d-flex justify-content-between align-items-center flex-wrap gap-2">
                <span>${getText('text-column-extractor/output/title')}</span>
                <div class="d-flex gap-2 flex-wrap justify-content-end">
                    <div class="btn-group btn-group-sm">
                        <button
                            class="btn btn-sm ${outputViewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}"
                            onClick=${() => setOutputViewMode('table')}
                            disabled=${!hasContent}
                        >${getText('text-column-extractor/view/table')}</button>
                        <button
                            class="btn btn-sm ${outputViewMode === 'text' ? 'btn-primary' : 'btn-outline-primary'}"
                            onClick=${() => setOutputViewMode('text')}
                            disabled=${!hasContent}
                        >${getText('text-column-extractor/view/text')}</button>
                    </div>
                    <button
                        class="btn btn-sm btn-outline-primary"
                        onClick=${handleCopy}
                        disabled=${!hasContent || isCopying}
                    >
                        ${getText('text-column-extractor/button/copy')}
                    </button>
                </div>
            </div>
            <div class="card-body p-0">
                ${!hasContent
                    ? html`
                        <div class="p-3 text-muted text-center" style="min-height: 100px; display: flex; align-items: center; justify-content: center;">
                            ${getText('text-column-extractor/output/no_data')}
                        </div>
                    `
                    : outputViewMode === 'table'
                        ? html`
                            <div class="table-responsive">
                                <table class="table table-bordered table-striped table-sm mb-0">
                                    ${headers.length > 0 ? html`
                                        <thead class="table-light">
                                            <tr>
                                                ${headers.map((h) => html`
                                                    <th class="text-nowrap">${h}</th>
                                                `)}
                                            </tr>
                                        </thead>
                                    ` : null}
                                    <tbody>
                                        ${rows.map((row) => html`
                                            <tr>
                                                ${row.map((cell) => html`
                                                    <td class="font-monospace" style="white-space: pre-wrap;">${cell}</td>
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
        </div>
    `;
};

export default OutputCard;
