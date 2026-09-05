import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import { notify } from '~/helpers/messages.js';

const OutputCard = ({ text, stats }) => {
    const [isCopying, setIsCopying] = useState(false);

    const handleCopy = () => {
        if (!text || isCopying) return;

        setIsCopying(true);
        navigator.clipboard.writeText(text).then(() => {
            notify(getText('text-redact/message/copied'), '', 'success');
            setTimeout(() => setIsCopying(false), 1000);
        });
    };

    const hasContent = text && text.length > 0;

    return html`
        <div class="card">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <span>${getText('text-redact/output/title')}</span>
                <button
                    class="btn btn-sm btn-outline-primary"
                    onClick=${handleCopy}
                    disabled=${!hasContent || isCopying}
                >
                    ${getText('text-redact/button/copy')}
                </button>
            </div>
            <div class="card-body p-0">
                ${hasContent ? html`
                    <textarea
                        class="form-control border-0 font-monospace"
                        style="min-height: 200px; resize: vertical;"
                        readonly
                        value=${text}
                    ></textarea>
                ` : html`
                    <div class="p-3 text-muted text-center" style="min-height: 100px; display: flex; align-items: center; justify-content: center;">
                        ${getText('text-redact/output/title')}
                    </div>
                `}
            </div>
            ${hasContent && stats ? html`
                <div class="card-footer bg-light small text-muted">
                    ${getText('text-redact/stats/title')}: ${stats.total} ${getText('text-redact/stats/redacted_count')}
                    ${stats.details && stats.details.length > 0 ? html`
                        (${stats.details.map((d) => html`
                            <span class="badge bg-secondary me-1">${getText(d.label)}: ${d.count}</span>
                        `)})
                    ` : ''}
                </div>
            ` : ''}
        </div>
    `;
};

export default OutputCard;
