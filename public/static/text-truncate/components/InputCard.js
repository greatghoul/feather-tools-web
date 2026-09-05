import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';

const InputCard = ({ text, onTextChange, onClear, onLoadExample, onTruncate, maxLength, setMaxLength, ellipsis, setEllipsis }) => {
    return html`
        <div class="card">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <span>${getText('text-truncate/input/title')}</span>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-info" onClick=${onLoadExample}>
                        ${getText('text-truncate/button/load_example')}
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" onClick=${onClear}>
                        ${getText('text-truncate/button/clear')}
                    </button>
                </div>
            </div>
            <div class="card-body p-0">
                <textarea
                    class="form-control border-0"
                    style="min-height: 200px; resize: vertical;"
                    placeholder=${getText('text-truncate/input/placeholder')}
                    value=${text}
                    onInput=${(e) => onTextChange(e.target.value)}
                ></textarea>
            </div>
            <div class="card-footer bg-light">
                <div class="row g-3 align-items-end">
                    <div class="col-md-4">
                        <label class="form-label small mb-1">${getText('text-truncate/options/max_length')}</label>
                        <input
                            type="number"
                            class="form-control form-control-sm"
                            value=${maxLength}
                            min="1"
                            max="9999"
                            onInput=${(e) => setMaxLength(parseInt(e.target.value) || 1)}
                        />
                    </div>
                    <div class="col-md-4">
                        <label class="form-label small mb-1">${getText('text-truncate/options/ellipsis')}</label>
                        <input
                            type="text"
                            class="form-control form-control-sm"
                            value=${ellipsis}
                            maxLength="10"
                            onInput=${(e) => setEllipsis(e.target.value)}
                        />
                    </div>
                    <div class="col-md-4">
                        <button class="btn btn-primary w-100" onClick=${onTruncate}>
                            ${getText('text-truncate/button/truncate')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

export default InputCard;
