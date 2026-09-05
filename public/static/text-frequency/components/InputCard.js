import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';

const InputCard = ({ text, onTextChange, onClear, onLoadExample, onAnalyze, options, updateOption }) => {
    return html`
        <div class="card">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <span>${getText('text-frequency/input/title')}</span>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-info" onClick=${onLoadExample}>
                        <i class="bi bi-file-earmark-text"></i> ${getText('text-frequency/button/load_example')}
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" onClick=${onClear}>
                        ${getText('text-frequency/button/clear')}
                    </button>
                </div>
            </div>
            <div class="card-body p-0">
                <textarea
                    class="form-control border-0"
                    style="min-height: 200px; resize: vertical;"
                    placeholder=${getText('text-frequency/input/placeholder')}
                    value=${text}
                    onInput=${(e) => onTextChange(e.target.value)}
                ></textarea>
            </div>
            <div class="card-footer bg-light">
                <div class="row g-3 align-items-end">
                    <div class="col-md-2">
                        <label class="form-label small mb-1">${getText('text-frequency/options/min_length')}</label>
                        <input type="number" class="form-control form-control-sm"
                               value=${options.minLength}
                               onInput=${(e) => updateOption('minLength', parseInt(e.target.value) || 1)}
                               min="1" />
                    </div>
                    <div class="col-md-2">
                        <label class="form-label small mb-1">${getText('text-frequency/options/sort_by')}</label>
                        <select class="form-select form-select-sm"
                                value=${options.sortBy}
                                onChange=${(e) => updateOption('sortBy', e.target.value)}>
                            <option value="frequency">${getText('text-frequency/options/sort_by_frequency')}</option>
                            <option value="alphabetical">${getText('text-frequency/options/sort_by_alphabetical')}</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label small mb-1">${getText('text-frequency/options/sort_order')}</label>
                        <select class="form-select form-select-sm"
                                value=${options.sortOrder}
                                onChange=${(e) => updateOption('sortOrder', e.target.value)}>
                            <option value="descending">${getText('text-frequency/options/descending')}</option>
                            <option value="ascending">${getText('text-frequency/options/ascending')}</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label small mb-1">${getText('text-frequency/options/limit')}</label>
                        <select class="form-select form-select-sm"
                                value=${options.limit}
                                onChange=${(e) => updateOption('limit', parseInt(e.target.value))}>
                            <option value="0">${getText('text-frequency/options/all_words')}</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <button class="btn btn-primary w-100" onClick=${onAnalyze}>
                            <i class="bi bi-graph-up"></i> ${getText('text-frequency/button/analyze')}
                        </button>
                    </div>
                </div>
                <div class="row g-3 mt-2">
                    <div class="col-auto">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" role="switch"
                                   id="case-sensitive-switch"
                                   checked=${options.caseSensitive}
                                   onChange=${(e) => updateOption('caseSensitive', e.target.checked)} />
                            <label class="form-check-label small" for="case-sensitive-switch">
                                ${getText('text-frequency/options/case_sensitive')}
                            </label>
                        </div>
                    </div>
                    <div class="col-auto">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" role="switch"
                                   id="ignore-numbers-switch"
                                   checked=${options.ignoreNumbers}
                                   onChange=${(e) => updateOption('ignoreNumbers', e.target.checked)} />
                            <label class="form-check-label small" for="ignore-numbers-switch">
                                ${getText('text-frequency/options/ignore_numbers')}
                            </label>
                        </div>
                    </div>
                    <div class="col-auto">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" role="switch"
                                   id="ignore-stopwords-switch"
                                   checked=${options.ignoreStopwords}
                                   onChange=${(e) => updateOption('ignoreStopwords', e.target.checked)} />
                            <label class="form-check-label small" for="ignore-stopwords-switch">
                                ${getText('text-frequency/options/ignore_stopwords')}
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

export default InputCard;
