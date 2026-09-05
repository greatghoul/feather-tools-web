import { html } from 'htm/preact';
import { getText } from '~/helpers/utils.js';

const ResultCard = ({ result }) => {
    if (!result) {
        return html`<div></div>`;
    }

    if (result.type === 'validation') {
        return html`
            <div class="alert alert-warning" role="alert">
                <i class="bi bi-exclamation-triangle"></i> ${result.message}
            </div>
        `;
    }

    if (result.type === 'error') {
        return html`
            <div class="alert alert-danger" role="alert">
                <i class="bi bi-x-circle"></i> ${result.message}
            </div>
        `;
    }

    return html`<div></div>`;
};

export default ResultCard;
