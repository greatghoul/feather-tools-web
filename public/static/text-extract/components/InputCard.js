import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';

const InputCard = ({ text, onTextChange, onClear, onLoadExample, onExtract, options, onOptionChange }) => {
    const handleCheckboxChange = (key) => (e) => {
        onOptionChange(key, e.target.checked);
    };

    const handleCustomCheckbox = (e) => {
        onOptionChange('enableCustom', e.target.checked);
        if (!e.target.checked) {
            onOptionChange('customPattern', '');
        }
    };

    return html`
        <div class="card">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <span>${getText('text-extract/input/title')}</span>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-info" onClick=${onLoadExample}>
                        ${getText('text-extract/button/load_example')}
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" onClick=${onClear}>
                        ${getText('text-extract/button/clear')}
                    </button>
                </div>
            </div>
            <div class="card-body p-0">
                <textarea
                    class="form-control border-0"
                    style="min-height: 200px; resize: vertical;"
                    placeholder=${getText('text-extract/input/placeholder')}
                    value=${text}
                    onInput=${(e) => onTextChange(e.target.value)}
                ></textarea>
            </div>
            <div class="card-footer bg-light">
                <div class="row g-3">
                    <div class="col-12">
                        <label class="form-label small mb-2 fw-bold">${getText('text-extract/options/types')}</label>
                        <div class="row g-2">
                            <div class="col-6 col-md-4 col-lg-3">
                                <div class="form-check">
                                    <input
                                        class="form-check-input"
                                        type="checkbox"
                                        id="opt-email"
                                        checked=${options.email}
                                        onChange=${handleCheckboxChange('email')}
                                    />
                                    <label class="form-check-label" for="opt-email">
                                        ${getText('text-extract/options/email')}
                                    </label>
                                </div>
                            </div>
                            <div class="col-6 col-md-4 col-lg-3">
                                <div class="form-check">
                                    <input
                                        class="form-check-input"
                                        type="checkbox"
                                        id="opt-phone"
                                        checked=${options.phone}
                                        onChange=${handleCheckboxChange('phone')}
                                    />
                                    <label class="form-check-label" for="opt-phone">
                                        ${getText('text-extract/options/phone')}
                                    </label>
                                </div>
                            </div>
                            <div class="col-6 col-md-4 col-lg-3">
                                <div class="form-check">
                                    <input
                                        class="form-check-input"
                                        type="checkbox"
                                        id="opt-idcard"
                                        checked=${options.idCard}
                                        onChange=${handleCheckboxChange('idCard')}
                                    />
                                    <label class="form-check-label" for="opt-idcard">
                                        ${getText('text-extract/options/id_card')}
                                    </label>
                                </div>
                            </div>
                            <div class="col-6 col-md-4 col-lg-3">
                                <div class="form-check">
                                    <input
                                        class="form-check-input"
                                        type="checkbox"
                                        id="opt-url"
                                        checked=${options.url}
                                        onChange=${handleCheckboxChange('url')}
                                    />
                                    <label class="form-check-label" for="opt-url">
                                        ${getText('text-extract/options/url')}
                                    </label>
                                </div>
                            </div>
                            <div class="col-6 col-md-4 col-lg-3">
                                <div class="form-check">
                                    <input
                                        class="form-check-input"
                                        type="checkbox"
                                        id="opt-ip"
                                        checked=${options.ip}
                                        onChange=${handleCheckboxChange('ip')}
                                    />
                                    <label class="form-check-label" for="opt-ip">
                                        ${getText('text-extract/options/ip')}
                                    </label>
                                </div>
                            </div>
                            <div class="col-6 col-md-4 col-lg-3">
                                <div class="form-check">
                                    <input
                                        class="form-check-input"
                                        type="checkbox"
                                        id="opt-custom"
                                        checked=${options.enableCustom}
                                        onChange=${handleCustomCheckbox}
                                    />
                                    <label class="form-check-label" for="opt-custom">
                                        ${getText('text-extract/options/custom')}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    ${options.enableCustom ? html`
                        <div class="col-12">
                            <input
                                type="text"
                                class="form-control form-control-sm"
                                placeholder=${getText('text-extract/options/custom_placeholder')}
                                value=${options.customPattern}
                                onInput=${(e) => onOptionChange('customPattern', e.target.value)}
                            />
                        </div>
                    ` : ''}
                    <div class="col-12">
                        <button class="btn btn-primary w-100" onClick=${onExtract}>
                            ${getText('text-extract/button/extract')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

export default InputCard;
