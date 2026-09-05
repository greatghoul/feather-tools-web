import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';
import InputNumber from '~/components/InputNumber.js';
import ColumnEditor from '@/components/ColumnEditor.js';
import TemplateManager from '@/components/TemplateManager.js';
import CsvSampleService from '@/services/CsvSampleService.js';

const ConfigCard = ({
    rowCount,
    setRowCount,
    delimiter,
    setDelimiter,
    customDelimiter,
    setCustomDelimiter,
    locale,
    setLocale,
    includeHeader,
    setIncludeHeader,
    columns,
    setColumns,
    onGenerate,
    onClear,
    isGenerating,
    onActiveTemplateChange,
}) => {
    const currentConfig = {
        rowCount,
        delimiter,
        customDelimiter,
        locale,
        includeHeader,
        columns,
    };

    const handleApplyTemplate = (cfg) => {
        setRowCount(cfg.rowCount ?? 10);
        setDelimiter(cfg.delimiter ?? ',');
        setCustomDelimiter(cfg.customDelimiter ?? '');
        setLocale(cfg.locale ?? 'auto');
        setIncludeHeader(cfg.includeHeader ?? true);
        setColumns(cfg.columns ?? CsvSampleService.createDefaultColumns());
    };

    return html`
        <div class="card">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <span>${getText('csv-sample/settings/title')}</span>
            </div>
            <div class="card-body p-0">
                <div class="row g-0">
                    <div class="col-lg-4">
                        <div class="card h-100 border-0">
                            <div class="card-header py-2 bg-transparent">
                                <span>${getText('csv-sample/settings/rows')}</span>
                            </div>
                            <div class="card-body">
                                <div class="mb-3">
                                    <label class="form-label fw-bold">${getText('csv-sample/options/rows')}</label>
                                    <${InputNumber}
                                        value=${rowCount}
                                        min=${1}
                                        max=${10000}
                                        step=${1}
                                        onChange=${setRowCount}
                                    />
                                </div>
                                <div class="mb-3">
                                    <label class="form-label fw-bold">${getText('csv-sample/options/delimiter')}</label>
                                    <select
                                        class="form-select form-select-sm"
                                        value=${delimiter}
                                        onChange=${(e) => setDelimiter(e.target.value)}
                                    >
                                        ${CsvSampleService.DELIMITERS.map((d) => html`
                                            <option value=${d.value}>${getText(d.key)}</option>
                                        `)}
                                    </select>
                                    ${delimiter === 'custom' ? html`
                                        <input
                                            type="text"
                                            class="form-control form-control-sm mt-2"
                                            placeholder=","
                                            value=${customDelimiter}
                                            onInput=${(e) => setCustomDelimiter(e.target.value)}
                                        />
                                    ` : null}
                                </div>
                                <div class="mb-3">
                                    <label class="form-label fw-bold">${getText('csv-sample/options/locale')}</label>
                                    <select
                                        class="form-select form-select-sm"
                                        value=${locale}
                                        onChange=${(e) => setLocale(e.target.value)}
                                    >
                                        ${CsvSampleService.LOCALES.map((l) => html`
                                            <option value=${l.value}>${getText(l.key)}</option>
                                        `)}
                                    </select>
                                </div>
                                <div class="form-check form-switch">
                                    <input
                                        class="form-check-input"
                                        type="checkbox"
                                        id="csv-sample-include-header"
                                        checked=${includeHeader}
                                        onChange=${(e) => setIncludeHeader(e.target.checked)}
                                    />
                                    <label class="form-check-label" for="csv-sample-include-header">
                                        ${getText('csv-sample/options/include_header')}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-8 border-lg-start">
                        <div class="card h-100 border-0">
                            <div class="card-header py-2 bg-transparent d-flex justify-content-between align-items-center">
                                <span>${getText('csv-sample/settings/columns')}</span>
                                <button
                                    class="btn btn-link btn-sm p-0 text-decoration-none"
                                    onClick=${onClear}
                                >
                                    ${getText('csv-sample/button/clear')}
                                </button>
                            </div>
                            <div class="card-body">
                                <${ColumnEditor} columns=${columns} setColumns=${setColumns} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card-footer bg-light">
                <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <${TemplateManager}
                        config=${currentConfig}
                        onApplyTemplate=${handleApplyTemplate}
                        onActiveTemplateChange=${onActiveTemplateChange}
                    />
                    <div class="d-flex gap-2">
                        <button
                            class="btn btn-primary"
                            onClick=${onGenerate}
                            disabled=${isGenerating || columns.length === 0}
                        >
                            ${isGenerating ? html`<span class="spinner-border spinner-border-sm me-2"></span>` : null}
                            ${getText('csv-sample/button/generate')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

export default ConfigCard;
