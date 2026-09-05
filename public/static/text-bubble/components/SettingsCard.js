import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';

const ARROWS = [
    { value: 'up-left', icon: '\u21d6' },
    { value: 'up', icon: '\u2191' },
    { value: 'up-right', icon: '\u21d7' },
    { value: 'left', icon: '\u2190' },
    { value: 'none', icon: '\u25cb' },
    { value: 'right', icon: '\u2192' },
    { value: 'down-left', icon: '\u21d9' },
    { value: 'down', icon: '\u2193' },
    { value: 'down-right', icon: '\u21d8' },
];

const SettingsCard = ({ arrow, onArrowChange, onGenerate }) => {
    return html`
        <div class="card">
            <div class="card-header bg-light">
                <h5 class="mb-0">${getText('text-bubble/options/arrow')}</h5>
            </div>
            <div class="card-body">
                <div class="mb-3">
                    <div class="row g-1" style="max-width: 240px;">
                        ${ARROWS.map(a => html`
                            <div class="col-4 p-1">
                                <input
                                    class="btn-check"
                                    type="radio"
                                    name="arrowDirection"
                                    id="arrow-${a.value}"
                                    value=${a.value}
                                    checked=${arrow === a.value}
                                    onChange=${() => onArrowChange(a.value)}
                                />
                                <label
                                    class="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center"
                                    for="arrow-${a.value}"
                                    title=${a.value}
                                    style="height: 40px; font-size: 16px;"
                                >
                                    ${a.icon}
                                </label>
                            </div>
                        `)}
                    </div>
                </div>

                <button class="btn btn-primary" onClick=${onGenerate}>${getText('text-bubble/button/generate')}</button>
            </div>
        </div>
    `;
};

export default SettingsCard;
