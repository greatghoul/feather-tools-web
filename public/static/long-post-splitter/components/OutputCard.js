import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import { notify } from '~/helpers/messages.js';
import SegmentCard from '@/components/SegmentCard.js';

const OutputCard = ({ segments, limit }) => {
    const [isCopyingAll, setIsCopyingAll] = useState(false);

    const handleCopyAll = () => {
        if (segments.length === 0 || !isCopyingAll) {
            setIsCopyingAll(true);
            const allText = segments
                .map((s) => s.fullText)
                .join('\n\n---\n\n');
            navigator.clipboard.writeText(allText).then(() => {
                notify(getText('long-post-splitter/message/copied_all'), '', 'success');
                setTimeout(() => setIsCopyingAll(false), 1000);
            });
        }
    };

    if (segments.length === 0) return null;

    return html`
        <div class="card">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <span>
                    ${getText('long-post-splitter/output/title')}
                    <span class="badge bg-secondary ms-2">${segments.length}</span>
                </span>
                <button
                    class="btn btn-sm btn-outline-primary"
                    onClick=${handleCopyAll}
                    disabled=${isCopyingAll}
                >
                    <i class="bi bi-clipboard-plus me-1"></i>
                    ${getText('long-post-splitter/button/copy_all')}
                </button>
            </div>
            <div class="card-body">
                <div class="d-flex flex-column gap-3">
                    ${segments.map((seg) => html`
                        <${SegmentCard} key=${seg.index} segment=${seg} limit=${limit} />
                    `)}
                </div>
            </div>
        </div>
    `;
};

export default OutputCard;
