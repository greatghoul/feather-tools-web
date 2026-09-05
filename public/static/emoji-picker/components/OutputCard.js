import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import { notify } from '~/helpers/messages.js';

const OutputCard = ({ collected, onClear }) => {
    const [isCopying, setIsCopying] = useState(false);

    const handleCopyAll = () => {
        if (collected && !isCopying) {
            setIsCopying(true);
            navigator.clipboard.writeText(collected).then(() => {
                notify(getText('emoji-picker/message/copied_all'), '', 'success');
                setTimeout(() => setIsCopying(false), 1000);
            });
        }
    };

    return html`
        <div class="card">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <span>${getText('emoji-picker/output/title')}</span>
                <div class="d-flex gap-2">
                    <button
                        class="btn btn-sm btn-outline-primary"
                        onClick=${handleCopyAll}
                        disabled=${!collected || isCopying}
                    >${getText('emoji-picker/output/copy_all')}</button>
                    <button
                        class="btn btn-sm btn-outline-secondary"
                        onClick=${onClear}
                        disabled=${!collected}
                    >${getText('emoji-picker/output/clear')}</button>
                </div>
            </div>
            <div class="card-body p-0">
                <textarea
                    class="form-control border-0"
                    style="min-height: 120px; resize: vertical; font-size: 1.5rem;"
                    placeholder=${getText('emoji-picker/output/placeholder')}
                    value=${collected}
                    readonly
                ></textarea>
            </div>
        </div>
    `;
};

export default OutputCard;
