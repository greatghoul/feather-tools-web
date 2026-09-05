import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';

const InputCard = ({ text, onTextChange, onClear, onLoadExample }) => {
    return html`
        <div class="card">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <span>${getText('text-to-speech/input/title')}</span>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-info" onClick=${onLoadExample}>
${getText('text-to-speech/button/example')}
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" onClick=${onClear}>
                        ${getText('text-to-speech/button/clear')}
                    </button>
                </div>
            </div>
            <div class="card-body p-0">
                <textarea
                    class="form-control border-0"
                    style="min-height: 180px; resize: vertical;"
                    placeholder=${getText('text-to-speech/input/placeholder')}
                    value=${text}
                    onInput=${(e) => onTextChange(e.target.value)}
                ></textarea>
            </div>
        </div>
    `;
};

export default InputCard;