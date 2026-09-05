import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import { notify } from '~/helpers/messages.js';

const OutputCard = ({ text }) => {
    const [isCopying, setIsCopying] = useState(false);

    const handleCopy = () => {
        if (text && !isCopying) {
            setIsCopying(true);
            navigator.clipboard.writeText(text).then(() => {
                notify(getText('text-sort/message/copied'), '', 'success');
                setTimeout(() => {
                    setIsCopying(false);
                }, 1000);
            });
        }
    };

    return html`
        <div class="card">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <span>${getText('text-sort/output/title')}</span>
                <button class="btn btn-sm btn-outline-primary" onClick=${handleCopy} disabled=${!text || isCopying}>
                    ${getText('text-sort/button/copy')}
                </button>
            </div>
            <div class="card-body p-0">
                <textarea
                    class="form-control border-0"
                    style="min-height: 200px; resize: vertical;"
                    value=${text}
                    readonly
                ></textarea>
            </div>
        </div>
    `;
};

export default OutputCard;
