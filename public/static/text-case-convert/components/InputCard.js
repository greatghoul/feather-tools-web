import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';

const CASE_OPTIONS = [
    { value: 'uppercase', label: getText('text-case-convert/options/uppercase') },
    { value: 'lowercase', label: getText('text-case-convert/options/lowercase') },
    { value: 'title_case', label: getText('text-case-convert/options/title_case') },
    { value: 'capitalize', label: getText('text-case-convert/options/capitalize') },
    { value: 'sentence_case', label: getText('text-case-convert/options/sentence_case') },
    { value: 'camel_case', label: getText('text-case-convert/options/camel_case') },
    { value: 'pascal_case', label: getText('text-case-convert/options/pascal_case') },
    { value: 'kebab_case', label: getText('text-case-convert/options/kebab_case') },
    { value: 'snake_case', label: getText('text-case-convert/options/snake_case') },
    { value: 'invert_case', label: getText('text-case-convert/options/invert_case') },
    { value: 'alternating_case', label: getText('text-case-convert/options/alternating_case') },
];

const InputCard = ({ text, onTextChange, onClear, onLoadExample, onConvert, caseType, setCaseType }) => {
    return html`
        <div class="card">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <span>${getText('text-case-convert/input/title')}</span>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-info" onClick=${onLoadExample}>
                        Example
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" onClick=${onClear}>
                        ${getText('text-case-convert/button/clear')}
                    </button>
                </div>
            </div>
            <div class="card-body p-0">
                <textarea
                    class="form-control border-0"
                    style="min-height: 200px; resize: vertical;"
                    placeholder=${getText('text-case-convert/input/placeholder')}
                    value=${text}
                    onInput=${(e) => onTextChange(e.target.value)}
                ></textarea>
            </div>
            <div class="card-footer bg-light">
                <div class="row g-3 align-items-end">
                    <div class="col-md-6">
                        <label class="form-label small mb-1">${getText('text-case-convert/options/convert_to')}</label>
                        <select class="form-select form-select-sm" value=${caseType} onChange=${(e) => setCaseType(e.target.value)}>
                            ${CASE_OPTIONS.map(opt => html`
                                <option value=${opt.value}>${opt.label}</option>
                            `)}
                        </select>
                    </div>
                    <div class="col-md-6">
                        <button class="btn btn-primary w-100" onClick=${onConvert}>
                            ${getText('text-case-convert/button/convert')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

export default InputCard;