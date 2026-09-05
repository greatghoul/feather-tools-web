import { html } from 'htm/preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import ColumnExtractorService from '@/services/ColumnExtractorService.js';

const DELIMITER_OPTIONS = [
    { value: ',', key: 'text-column-extractor/options/comma' },
    { value: '\t', key: 'text-column-extractor/options/tab' },
    { value: '|', key: 'text-column-extractor/options/pipe' },
    { value: ';', key: 'text-column-extractor/options/semicolon' },
    { value: 'custom', key: 'text-column-extractor/options/custom' },
];

const TagsInput = ({ selectedColumns, setSelectedColumns, totalColumns, previewHeaders }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [focusIndex, setFocusIndex] = useState(-1);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const availableOptions = [];
    for (let i = 1; i <= totalColumns; i++) {
        if (!selectedColumns.includes(i)) {
            const label = previewHeaders[i - 1]
                ? `Column ${i} (${previewHeaders[i - 1]})`
                : `Column ${i}`;
            availableOptions.push({ value: i, label });
        }
    }

    const handleAdd = (col) => {
        const next = [...selectedColumns, col];
        setSelectedColumns(next);
        setIsOpen(false);
        setFocusIndex(-1);
    };

    const handleRemove = (col) => {
        setSelectedColumns(selectedColumns.filter((c) => c !== col));
    };

    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                setIsOpen(true);
                e.preventDefault();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                setFocusIndex((prev) => Math.min(prev + 1, availableOptions.length - 1));
                e.preventDefault();
                break;
            case 'ArrowUp':
                setFocusIndex((prev) => Math.max(prev - 1, 0));
                e.preventDefault();
                break;
            case 'Enter':
                if (focusIndex >= 0 && focusIndex < availableOptions.length) {
                    handleAdd(availableOptions[focusIndex].value);
                }
                e.preventDefault();
                break;
            case 'Escape':
                setIsOpen(false);
                setFocusIndex(-1);
                e.preventDefault();
                break;
        }
    };

    const getTagLabel = (col) => {
        if (previewHeaders[col - 1]) {
            return `${col}: ${previewHeaders[col - 1]}`;
        }
        return `Column ${col}`;
    };

    return html`
        <div class="tags-input" ref=${dropdownRef} style="position: relative;">
            <div
                class="form-control form-control-sm d-flex flex-wrap gap-1 align-items-center"
                style="min-height: calc(1.5em + 0.5rem + 2px); cursor: text; padding: 0.2rem 0.4rem;"
                onClick=${() => setIsOpen(true)}
                onKeyDown=${handleKeyDown}
                tabIndex="0"
                role="combobox"
                aria-expanded=${isOpen}
            >
                ${selectedColumns.length === 0
                    ? html`<span class="text-muted small">${getText('text-column-extractor/options/columns_placeholder')}</span>`
                    : selectedColumns.map((col) => html`
                        <span class="badge bg-primary d-inline-flex align-items-center gap-1" style="font-size: 0.8rem;">
                            ${getTagLabel(col)}
                            <span
                                class="tag-remove"
                                onClick=${(e) => { e.stopPropagation(); handleRemove(col); }}
                                style="cursor: pointer; opacity: 0.7; line-height: 1;"
                            >\u00D7</span>
                        </span>
                    `)
                }
            </div>
            ${isOpen && availableOptions.length > 0 ? html`
                <div
                    class="list-group shadow-sm"
                    style="position: absolute; top: 100%; left: 0; right: 0; z-index: 100; max-height: 200px; overflow-y: auto;"
                >
                    ${availableOptions.map((opt, idx) => html`
                        <button
                            class="list-group-item list-group-item-action py-1 px-2 small ${idx === focusIndex ? 'active' : ''}"
                            onClick=${() => handleAdd(opt.value)}
                            onMouseEnter=${() => setFocusIndex(idx)}
                        >${opt.label}</button>
                    `)}
                </div>
            ` : null}
            ${isOpen && availableOptions.length === 0 ? html`
                <div
                    class="list-group shadow-sm"
                    style="position: absolute; top: 100%; left: 0; right: 0; z-index: 100;"
                >
                    <div class="list-group-item py-1 px-2 small text-muted">
                        ${getText('text-column-extractor/view/all_selected')}
                    </div>
                </div>
            ` : null}
        </div>
    `;
};

const InputCard = ({ text, onTextChange, onClear, onLoadExample, onExtract, delimiter, setDelimiter, customDelimiter, setCustomDelimiter, selectedColumns, setSelectedColumns, includeHeader, setIncludeHeader, inputViewMode, setInputViewMode, previewData, previewHeaders }) => {
    const handleOpenFileClick = () => {
        document.getElementById('column-extractor-file-upload').click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = ev.target.result;
            onTextChange(content);
            const detected = ColumnExtractorService.detectDelimiter(content);
            setDelimiter(detected);
        };
        reader.readAsText(file);

        e.target.value = '';
    };

    return html`
        <div class="d-flex gap-2 mb-2 flex-wrap">
            <button class="btn btn-sm btn-outline-info" onClick=${handleOpenFileClick}>
                ${getText('text-column-extractor/button/upload')}
            </button>
            <input type="file" id="column-extractor-file-upload" class="d-none"
                   accept=".csv,.tsv,.txt,text/plain"
                   onChange=${handleFileChange} />
            <button class="btn btn-sm btn-outline-info" onClick=${onLoadExample}>
                ${getText('text-column-extractor/button/load_example')}
            </button>
        </div>
        <div class="card">
            <div class="card-header bg-light d-flex justify-content-between align-items-center flex-wrap gap-2">
                <span>${getText('text-column-extractor/input/title')}</span>
                <div class="d-flex gap-2 flex-wrap justify-content-end">
                    <div class="btn-group btn-group-sm">
                        <button
                            class="btn btn-sm ${inputViewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}"
                            onClick=${() => setInputViewMode('table')}
                            disabled=${!text.trim()}
                        >${getText('text-column-extractor/view/table')}</button>
                        <button
                            class="btn btn-sm ${inputViewMode === 'text' ? 'btn-primary' : 'btn-outline-primary'}"
                            onClick=${() => setInputViewMode('text')}
                        >${getText('text-column-extractor/view/text')}</button>
                    </div>
                    <button class="btn btn-sm btn-outline-secondary" onClick=${onClear}>
                        ${getText('text-column-extractor/button/clear')}
                    </button>
                </div>
            </div>
            <div class="card-body p-0">
                ${inputViewMode === 'text'
                    ? html`
                        <textarea
                            class="form-control border-0"
                            style="min-height: 200px; resize: vertical; font-family: monospace;"
                            placeholder=${getText('text-column-extractor/input/placeholder')}
                            value=${text}
                            onInput=${(e) => onTextChange(e.target.value)}
                        ></textarea>
                    `
                    : html`
                        <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                            <table class="table table-bordered table-striped table-sm mb-0">
                                <tbody>
                                    ${previewData.rows.length > 0
                                        ? previewData.rows.map((row) => html`
                                            <tr>
                                                ${row.map((cell, ci) => html`
                                                    <td class="font-monospace small ${ci < previewData.columns ? '' : 'text-muted'}"
                                                        style="white-space: pre-wrap; max-width: 200px; overflow-x: auto;">
                                                        ${cell || html`<span class="text-muted fst-italic">${getText('text-column-extractor/view/empty')}</span>`}
                                                    </td>
                                                `)}
                                            </tr>
                                        `)
                                        : html`
                                            <tr>
                                                <td class="text-muted text-center p-3">${getText('text-column-extractor/output/no_data')}</td>
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
                <div class="row g-3">
                    <div class="col-12">
                        <label class="form-label small mb-1">${getText('text-column-extractor/options/columns')}</label>
                        <${TagsInput}
                            selectedColumns=${selectedColumns}
                            setSelectedColumns=${setSelectedColumns}
                            totalColumns=${previewData.columns}
                            previewHeaders=${previewHeaders}
                        />
                    </div>
                </div>
                <div class="row g-3 mt-1">
                    <div class="col-md-4">
                        <label class="form-label small mb-1">${getText('text-column-extractor/options/delimiter')}</label>
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
                        <div class="form-check mt-2">
                            <input
                                class="form-check-input"
                                type="checkbox"
                                id="includeHeader"
                                checked=${includeHeader}
                                onChange=${(e) => setIncludeHeader(e.target.checked)}
                            />
                            <label class="form-check-label small" for="includeHeader">
                                ${getText('text-column-extractor/options/include_header')}
                            </label>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <button class="btn btn-primary w-100" onClick=${onExtract} disabled=${!text.trim()}>
                            ${getText('text-column-extractor/button/extract')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

export default InputCard;
