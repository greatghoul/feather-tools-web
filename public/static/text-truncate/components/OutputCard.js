import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import { notify } from '~/helpers/messages.js';

const OutputCard = ({ lines }) => {
    const [isCopyingAll, setIsCopyingAll] = useState(false);
    const [copyingLineIndex, setCopyingLineIndex] = useState(null);

    const handleCopyAll = () => {
        if (lines.length === 0 || isCopyingAll) return;

        setIsCopyingAll(true);
        const text = lines.map((line) => line.text).join('\n');
        navigator.clipboard.writeText(text).then(() => {
            notify(getText('text-truncate/message/copied'), '', 'success');
            setTimeout(() => setIsCopyingAll(false), 1000);
        });
    };

    const handleCopyLine = (index, lineText) => {
        if (copyingLineIndex !== null) return;

        setCopyingLineIndex(index);
        navigator.clipboard.writeText(lineText).then(() => {
            notify(getText('text-truncate/message/copied_line'), '', 'success');
            setTimeout(() => setCopyingLineIndex(null), 1000);
        });
    };

    const hasContent = lines.length > 0;

    return html`
        <div class="card">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <span>${getText('text-truncate/output/title')}</span>
                <button
                    class="btn btn-sm btn-outline-primary"
                    onClick=${handleCopyAll}
                    disabled=${!hasContent || isCopyingAll}
                >
                    ${getText('text-truncate/button/copy_all')}
                </button>
            </div>
            <div class="card-body p-0">
                ${hasContent
                    ? html`
                        <div class="list-group list-group-flush" style="max-height: 400px; overflow-y: auto;">
                            ${lines.map((line, index) => html`
                                <div class="list-group-item list-group-item-action text-truncate-output-line d-flex align-items-center gap-2 py-2 px-3">
                                    <span class="text-muted small text-end" style="min-width: 2rem; user-select: none;">${index + 1}</span>
                                    <span class="flex-grow-1 font-monospace" style="white-space: pre-wrap; word-break: break-all;">${line.text}</span>
                                    <button
                                        class="btn btn-sm btn-outline-secondary flex-shrink-0"
                                        onClick=${() => handleCopyLine(index, line.text)}
                                        disabled=${copyingLineIndex === index}
                                        title=${getText('text-truncate/button/copy_line')}
                                    >
                                        ${getText('text-truncate/button/copy_line')}
                                    </button>
                                </div>
                            `)}
                        </div>
                    `
                    : html`
                        <div class="p-3 text-muted text-center" style="min-height: 100px; display: flex; align-items: center; justify-content: center;">
                            ${getText('text-truncate/output/title')}
                        </div>
                    `
                }
            </div>
        </div>
    `;
};

export default OutputCard;
