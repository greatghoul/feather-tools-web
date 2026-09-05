import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';

const InputCard = ({ text, onTextChange, onClear, onLoadExample, onSort, sortBy, setSortBy, sortOrder, setSortOrder }) => {
    const handleSortByChange = (e) => {
        setSortBy(e.target.value);
        setSortOrder('ascending');
    };

    return html`
        <div class="card">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <span>${getText('text-sort/input/title')}</span>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-info" onClick=${onLoadExample}>
                        Example
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" onClick=${onClear}>
                        ${getText('text-sort/button/clear')}
                    </button>
                </div>
            </div>
            <div class="card-body p-0">
                <textarea
                    class="form-control border-0"
                    style="min-height: 200px; resize: vertical;"
                    placeholder=${getText('text-sort/input/placeholder')}
                    value=${text}
                    onInput=${(e) => onTextChange(e.target.value)}
                ></textarea>
            </div>
            <div class="card-footer bg-light">
                <div class="row g-3 align-items-end">
                    <div class="col-md-3">
                        <label class="form-label small mb-1">${getText('text-sort/options/sort_by')}</label>
                        <select class="form-select form-select-sm" value=${sortBy} onChange=${handleSortByChange}>
                            <option value="alphabetically">${getText('text-sort/options/alphabetically')}</option>
                            <option value="numerically">${getText('text-sort/options/numerically')}</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label small mb-1">${getText('text-sort/options/sort_order')}</label>
                        <select class="form-select form-select-sm" value=${sortOrder} onChange=${(e) => setSortOrder(e.target.value)}>
                            <option value="ascending">${getText('text-sort/options/ascending')}</option>
                            <option value="descending">${getText('text-sort/options/descending')}</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <button class="btn btn-primary w-100" onClick=${onSort}>
                            ${getText('text-sort/button/sort')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

export default InputCard;
