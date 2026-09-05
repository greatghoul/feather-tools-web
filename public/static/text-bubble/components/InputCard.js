import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';

const InputCard = ({ text, onTextChange, onClear, onLoadExample }) => {
    return html`
        <div class="card">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <h5 class="mb-0">${getText('text-bubble/input/title')}</h5>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-info" onClick=${onLoadExample}>${getText('text-bubble/button/load_example')}</button>
                    <button class="btn btn-sm btn-outline-secondary" onClick=${onClear}>${getText('text-bubble/button/clear')}</button>
                </div>
            </div>
            <div class="card-body">
                <textarea
                    class="form-control"
                    rows="6"
                    placeholder=${getText('text-bubble/input/placeholder')}
                    value=${text}
                    onInput=${(e) => onTextChange(e.target.value)}
                ></textarea>
            </div>
        </div>
    `;
};

export default InputCard;
