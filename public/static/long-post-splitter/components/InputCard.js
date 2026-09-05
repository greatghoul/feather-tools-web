import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';

const InputCard = ({ text, onTextChange, onClear, onLoadExample }) => {
    return html`
        <div class="card">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <span>${getText('long-post-splitter/input/title')}</span>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-info" onClick=${onLoadExample}>
                        ${getText('long-post-splitter/button/example')}
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" onClick=${onClear}>
                        ${getText('long-post-splitter/button/clear')}
                    </button>
                </div>
            </div>
            <div class="card-body p-0">
                <textarea
                    class="form-control border-0"
                    style="min-height: 220px; resize: vertical;"
                    placeholder=${getText('long-post-splitter/input/placeholder')}
                    value=${text}
                    onInput=${(e) => onTextChange(e.target.value)}
                ></textarea>
            </div>
        </div>
    `;
};

export default InputCard;
