import { html } from 'htm/preact';
import { useState, useRef } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import MaskService from '@/services/MaskService.js';

const DELIMITER_OPTIONS = [
    { value: ',', key: 'csv-redact/options/comma' },
    { value: '\t', key: 'csv-redact/options/tab' },
    { value: '|', key: 'csv-redact/options/pipe' },
    { value: ';', key: 'csv-redact/options/semicolon' },
    { value: 'custom', key: 'csv-redact/options/custom' },
];

const InputCard = ({
    text, onTextChange, onClear, onLoadExample,
    delimiter, setDelimiter, customDelimiter, setCustomDelimiter,
    includeHeader, setIncludeHeader,
    inputViewMode, setInputViewMode,
    parsedData, maskedColumnIndices,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const loadingRef = useRef(false);

    const handleOpenFileClick = () => {
        if (loadingRef.current) return;
        document.getElementById('csv-redact-file-upload').click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        loadingRef.current = true;
        setIsLoading(true);

        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = ev.target.result;
            onTextChange(content);
            const detected = MaskService.detectDelimiter(content);
            setDelimiter(detected);
            loadingRef.current = false;
            setIsLoading(false);
        };
        reader.onerror = () => {
            loadingRef.current = false;
            setIsLoading(false);
        };
        reader.readAsText(file);

        e.target.value = '';
    };

    const displayHeaders = parsedData.columns > 0
        ? (parsedData.headers.length > 0
            ? parsedData.headers
            : Array.from({ length: parsedData.columns }, (_, i) => `${i + 1}`))
        : [];

    const isMaskedCol = (idx) => maskedColumnIndices.includes(idx);

    const hasData = parsedData.rows.length > 0 || parsedData.headers.length > 0;

    return html`
        <div class="d-flex gap-2 mb-2 flex-wrap">
            <button class="btn btn-sm btn-outline-info" onClick=${handleOpenFileClick} disabled=${isLoading}>
                ${isLoading ? html`<span class="spinner-border spinner-border-sm me-1"></span>` : null}
                ${getText('csv-redact/button/upload')}
            </button>
            <input type="file" id="csv-redact-file-upload" class="d-none"
                   accept=".csv,.tsv,.txt,text/plain"
                   onChange=${handleFileChange} />
            <button class="btn btn-sm btn-outline-info" onClick=${onLoadExample}>
                ${getText('csv-redact/button/load_example')}
            </button>
        </div>
        <div class="card">
            <div class="card-header bg-light d-flex justify-content-between align-items-center flex-wrap gap-2">
                <span>${getText('csv-redact/input/title')}</span>
                <div class="d-flex gap-2 flex-wrap justify-content-end">
                    <div class="btn-group btn-group-sm">
                        <button
                            class="btn btn-sm ${inputViewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}"
                            onClick=${() => setInputViewMode('table')}
                            disabled=${!text.trim()}
                        >${getText('csv-redact/view/table')}</button>
                        <button
                            class="btn btn-sm ${inputViewMode === 'text' ? 'btn-primary' : 'btn-outline-primary'}"
                            onClick=${() => setInputViewMode('text')}
                        >${getText('csv-redact/view/text')}</button>
                    </div>
                    <button class="btn btn-sm btn-outline-secondary" onClick=${onClear}>
                        ${getText('csv-redact/button/clear')}
                    </button>
                </div>
            </div>
            <div class="card-body p-0">
                ${inputViewMode === 'text'
                    ? html`
                        <textarea
                            class="form-control border-0"
                            style="min-height: 200px; resize: vertical; font-family: monospace;"
                            placeholder=${getText('csv-redact/input/placeholder')}
                            value=${text}
                            onInput=${(e) => onTextChange(e.target.value)}
                        ></textarea>
                    `
                    : html`
                        <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                            <table class="table table-bordered table-striped table-sm mb-0">
                                ${hasData ? html`
                                    <thead class="table-light">
                                        <tr>
                                            ${displayHeaders.map((h, i) => html`
                                                <th class="text-nowrap ${isMaskedCol(i) ? 'csv-redact-masked-col' : ''}">${h}</th>
                                            `)}
                                        </tr>
                                    </thead>
                                ` : null}
                                <tbody>
                                    ${parsedData.rows.length > 0
                                        ? parsedData.rows.map((row) => html`
                                            <tr>
                                                ${row.map((cell, ci) => html`
                                                    <td class="font-monospace small ${isMaskedCol(ci) ? 'csv-redact-masked-col' : ''}"
                                                        style="white-space: pre-wrap; max-width: 240px; overflow-x: auto;">
                                                        ${cell !== '' ? cell : html`<span class="text-muted fst-italic">${getText('csv-redact/view/empty')}</span>`}
                                                    </td>
                                                `)}
                                            </tr>
                                        `)
                                        : html`
                                            <tr>
                                                <td class="text-muted text-center p-3">${getText('csv-redact/output/no_data')}</td>
                                            </tr>
                                        `
                                    }
                                </tbody>
                            </table>
                        </div>
                    `
                }
            </div>
            <div class="card-footer bg-light">
                <div class="row g-3 align-items-end">
                    <div class="col-md-4">
                        <label class="form-label small mb-1">${getText('csv-redact/options/delimiter')}</label>
                        <select class="form-select form-select-sm" value=${delimiter} onChange=${(e) => setDelimiter(e.target.value)}>
                            ${DELIMITER_OPTIONS.map((opt) => html`
                                <option value=${opt.value}>${getText(opt.key)}</option>
                            `)}
                        </select>
                        ${delimiter === 'custom' ? html`
                            <input
                                type="text"
                                class="form-control form-control-sm mt-1"
                                value=${customDelimiter}
                                onInput=${(e) => setCustomDelimiter(e.target.value)}
                                maxLength="5"
                                placeholder="..."
                            />
                        ` : null}
                    </div>
                    <div class="col-md-4 d-flex align-items-center">
                        <div class="form-check">
                            <input
                                class="form-check-input"
                                type="checkbox"
                                id="csv-include-header"
                                checked=${includeHeader}
                                onChange=${(e) => setIncludeHeader(e.target.checked)}
                            />
                            <label class="form-check-label small" for="csv-include-header">
                                ${getText('csv-redact/options/include_header')}
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

export default InputCard;
